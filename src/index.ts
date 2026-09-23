/**
 * cau-portal 服务端 cordis 插件（阶段4 第2步：服务端半区）。
 * - GET  /api/cau/health   健康检查（验证插件加载与 webServer 注入）
 * - POST /api/cau/enrich   按需 AI 加工：DSH ctx.llm 流式调用（无浏览器密钥、无 CORS），
 *   默认 provider=deepseek-official / model=deepseek-v4-flash / reasoningEffort=off
 *   （请求体可覆盖 provider/model），返回摘要/分类/重要度/deadline + 用量。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, unlinkSync } from 'node:fs'

// 本项目没有装 @types/node（构建走 tsc JS API 转译、不做类型检查），
// 这里给用到的 Node 全局一个最小声明，避免 tsc --noEmit 基线被 "Cannot find name 'process'" 污染。
declare const process: { env: Record<string, string | undefined> }

/** 拼路径。不 import node:path —— 那会多一条 TS2307（缺 @types/node），污染 tsc 基线 */
function joinPath(...parts: string[]): string {
  let out = ''
  for (const part of parts) {
    if (!part) continue
    if (!out) {
      out = part
      continue
    }
    out = out.replace(/[\\/]+$/, '') + '\\' + part.replace(/^[\\/]+/, '')
  }
  return out
}

export const name = 'cau-portal'
export const inject = ['webServer', 'llm']

const VERSION = '0.4.4'

const SYSTEM_PROMPT = `你是中国农业大学新闻处理助手。阅读给定文章，输出一个 JSON 对象（只输出 JSON，不要输出任何其他文字）。

JSON 格式示例：
{"summary":"一句话摘要，不超过60个汉字","category":"通知","importance":"中","deadline":{"item":"报名","date":"2026-09-01","evidence":"8月27日前提交"}或null}

规则：
1. summary：用中文概括文章核心事项，不超过60字；
2. category：从["通知","新闻","讲座","竞赛","评奖","选课","学术","其他"]中选择最贴切的一个；
3. importance：与学业、评奖评优、考试、报名、缴费、学位授予、选课等切身利益相关的为"高"；一般事务性通知为"中"；常规新闻动态、宣传报道为"低"；
4. deadline：若文中存在明确的截止时间（如"X月X日前""截止至X月X日""于X月X日之前"），给出事项名 item、绝对日期 date（YYYY-MM-DD）和原文表述 evidence（从正文原样摘录包含该时间的那句话片段，20字以内）。item 写法：主体+动作+类型，必须能看出"是谁在办什么事"（如「土地学院2027推免生报名」「研究生奖学金申请」「新生选课确认」，禁止只写「报名」「通知」这类无主体字样），控制在20字内。相对表述（如"下周五""两周内"）需按文章发布时间换算成绝对日期；若年份未写明，使用文章发布时间所在年份；多个截止时间只取最早的一个。若无任何明确截止时间，deadline 输出 null。`

const CATEGORIES = ['通知', '新闻', '讲座', '竞赛', '评奖', '选课', '学术', '其他']
const IMPORTANCE = ['高', '中', '低']

function json(res: any, status: number, obj: unknown) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(obj))
}

async function readBody(req: any): Promise<string> {
  const chunks: any[] = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}


// ---- 本机令牌共享存储（单一事实源；2026-09-20 改定）----
// 面板设置页是唯一入口：它把令牌写到 <profile>\cau-portal-store\token.json，
// MCP 服务器与 tools/ 下的脚本每次都现读这个文件（所以改完设置无需重启 dsh web）。
// ⚠️ tools/shared/token-store.mjs 里有一份等价的读取实现，**改格式时两边一起改**。
const STORE_FILE = 'token.json'

function storeDirs(): string[] {
  const home = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\1'
  const root = joinPath(home, '.dsh', 'profiles')
  const out: string[] = []
  const hinted = joinPath(root, 'web', 'cau-portal-store')
  if (existsSync(hinted)) out.push(hinted)
  try {
    for (const name of readdirSync(root)) {
      if (name === 'node_modules') continue
      const dir = joinPath(root, name, 'cau-portal-store')
      if (!out.includes(dir) && existsSync(dir)) out.push(dir)
    }
  } catch {
    /* 没装 DSH 就走不到这里 */
  }
  return out
}

function primaryStoreDir(): string {
  const dirs = storeDirs()
  if (dirs.length) return dirs[0]
  const dir = joinPath(process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\1', '.dsh', 'profiles', 'web', 'cau-portal-store')
  try {
    mkdirSync(dir, { recursive: true })
  } catch {
    /* 只读环境 */
  }
  return dir
}

function readStoredToken(): { token: string; updatedAt: string; dir: string } | null {
  for (const dir of storeDirs()) {
    try {
      const j = JSON.parse(readFileSync(joinPath(dir, STORE_FILE), 'utf8'))
      const token = String(j?.githubToken || '').trim()
      if (token) return { token, updatedAt: String(j?.updatedAt || ''), dir }
    } catch {
      /* 换下一个候选 */
    }
  }
  return null
}

/** 掩码：给面板回状态用，任何时候都不回传明文 */
function mask(token: string): string {
  const s = String(token || '')
  if (!s) return ''
  return s.slice(0, 18) + '…' + s.slice(-4)
}

// ---- 「添加栏目」skill：运行时注册 ----
// 插件包里的 skills/ 目录**不在** DSH 的技能发现范围内（filesystem provider 只扫
// <project>/.dsh/skills、<project>/.agents/skills、~/.dsh/skills、~/.agents/skills 与 bundled 目录），
// 所以必须在 apply() 里用 ctx.skills.register 注册，skill 才能"随插件自动带着走"（2026-09-14 定案）。
// 元数据（name/description/whenToUse）直接取自 md 的 frontmatter —— 单一事实源，不在代码里重复维护。
const SKILL_PATH = '../skills/cau-portal-add-column.md'

function loadSkill(): { name: string; description: string; whenToUse?: string; content: string } | null {
  try {
    const raw = readFileSync(new URL(SKILL_PATH, import.meta.url), 'utf8')
    const fm = (raw.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || ''
    const field = (k: string) => ((fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1] || '').trim()
    const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim()
    const name = field('name')
    const description = field('description')
    if (!name || !description || !body) return null
    return { name, description, ...(field('whenToUse') ? { whenToUse: field('whenToUse') } : {}), content: body }
  } catch {
    return null
  }
}

/**
 * 取 skills 服务。**不要写进 `inject`**：cordis 里插件若声明了注入而该服务始终没提供，
 * 插件会一直 pending、`apply()` 根本不执行 —— 面板与路由会一起消失（灾难性）。
 * 不注入时 `ctx.skills` 仍会沿 fiber store 链解析（cordis `ReflectService.handler.get`
 * 先查 store、再报 `without inject`），且 `ctx.get(name)` 是"无需 inject"的读法。
 * 两种都试、都失败就只告警，不影响面板与抓取（2026-09-14 查 cordis 源码后定）。
 */
function resolveSkills(ctx: any): any {
  try {
    const viaGet = typeof ctx?.get === 'function' ? ctx.get('skills') : null
    if (viaGet) return viaGet
  } catch {
    /* 落到 ctx.skills */
  }
  try {
    return ctx?.skills ?? null
  } catch {
    return null
  }
}

function registerSkill(ctx: any) {
  try {
    const skills = resolveSkills(ctx)
    if (!skills || typeof skills.register !== 'function') {
      ctx?.logger?.warn('[cau-portal] 取不到 skills 服务，跳过 skill 注册（不影响面板与抓取）')
      return
    }
    const s = loadSkill()
    if (!s) {
      ctx?.logger?.warn(`[cau-portal] 读不到或解析不了 ${SKILL_PATH}，跳过 skill 注册`)
      return
    }
    skills.register({ ...s, source: 'runtime' })
    ctx?.logger?.info(`[cau-portal] skill registered: ${s.name}（${s.content.length} 字）`)
  } catch (error: any) {
    ctx?.logger?.warn(`[cau-portal] skill 注册失败：${String(error?.message ?? error)}`)
  }
}

function parseJson(content: string) {
  const s = String(content)
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

/** deadline 本地校验（坏 deadline 比没有更害人；与 tools/scraper/ai.mjs 同规则） */
function validateAiResult(raw: any, article: { title: string; time: string; body: string }) {
  const out: any = { summary: '', category: '其他', importance: '低', deadline: null }
  if (typeof raw?.summary === 'string') out.summary = raw.summary.replace(/\s+/g, ' ').trim().slice(0, 60)
  if (CATEGORIES.includes(raw?.category)) out.category = raw.category
  if (IMPORTANCE.includes(raw?.importance)) out.importance = raw.importance
  const d = raw?.deadline
  if (d && typeof d === 'object' && typeof d.date === 'string') {
    const date = d.date.trim()
    const okFormat = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date))
    const pub = article.time ? Date.parse(String(article.time).slice(0, 10)) : 0
    const notPast = !pub || Date.parse(date) >= pub - 24 * 3600e3
    const evidence = typeof d.evidence === 'string' ? d.evidence.replace(/\s+/g, '') : ''
    const normBody = (article.body || '').replace(/\s+/g, '')
    const evidenceOk = evidence.length >= 3 ? normBody.includes(evidence) : true
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const md = m ? `${+m[2]}月${+m[3]}日` : ''
    const dateInBody = normBody.includes(date) || (md ? normBody.includes(md) : false)
    if (okFormat && notPast && (evidenceOk || dateInBody)) {
      out.deadline = { item: typeof d.item === 'string' ? d.item.trim().slice(0, 40) : '', date }
    } else {
      out.deadline_note = 'deadline 未通过校验（格式/时间/证据不符），已忽略'
    }
  }
  return out
}

async function runEnrich(llm: any, input: any) {
  const title = String(input.title ?? '').slice(0, 200)
  // 长正文取「头 2000 + 尾 1500」：截止日期几乎都写在通知末尾（见 tools/scraper/ai.mjs 的 clipBody 说明）
  const rawBody = String(input.content ?? '').replace(/\s+/g, ' ')
  const body = rawBody.length <= 3600 ? rawBody : rawBody.slice(0, 2000) + '\n…（中间省略）…\n' + rawBody.slice(-1500)
  const source = String(input.source ?? '')
  const time = String(input.time ?? '')
  const provider = String(input.provider || 'deepseek-official')
  const model = String(input.model || 'deepseek-v4-flash')

  const user = `标题：${title}\n发布时间：${time}\n来源：${source}\n正文：\n${body}`
  const options = {
    provider,
    model,
    reasoningEffort: 'off', // 请求级关闭思考模式（deepseek 适配器 effort=off → thinking disabled）
    maxTokens: 1200,
    messages: [
      { role: 'system', content: [{ type: 'text', text: SYSTEM_PROMPT }] },
      { role: 'user', content: [{ type: 'text', text: user }] },
    ],
  }

  let text = ''
  let usage: any = null
  let finish: any = null
  try {
    for await (const chunk of llm.stream(options)) {
      if (chunk?.type === 'text-delta') text += chunk.text
      else if (chunk?.type === 'usage') usage = chunk.usage
      else if (chunk?.type === 'finish') finish = chunk.reason
    }
  } catch (error: any) {
    return { ok: false, error: String(error?.message ?? error) }
  }
  if (finish?.kind === 'error') {
    return { ok: false, error: String(finish?.failure?.message ?? finish?.failure?.code ?? 'llm error') }
  }
  if (finish?.kind === 'aborted') return { ok: false, error: 'aborted' }
  const parsed = text ? parseJson(text) : null
  if (!parsed) return { ok: false, error: '模型未返回有效 JSON', raw: text.slice(0, 400) }
  const result = validateAiResult(parsed, { title, time, body })
  return { ok: true, provider, model, result, tokens: usage }
}

export function apply(ctx: any) {
  registerSkill(ctx)

  const webServer = ctx?.webServer
  const llm = ctx?.llm
  if (!webServer) {
    ctx?.logger?.warn('[cau-portal] ctx.webServer 不可用，跳过服务端路由')
    return
  }

  webServer.register({
    kind: 'exact',
    path: '/api/cau/health',
    handler: (_req: any, res: any) => {
      json(res, 200, { plugin: 'cau-portal', version: VERSION, ok: true, llm: !!llm })
    },
  })

  // 本机令牌的唯一写入端：面板设置页调用它，MCP 与 tools/ 脚本现读同一个文件
  webServer.register({
    kind: 'exact',
    path: '/api/cau/token',
    handler: async (req: any, res: any) => {
      const method = String(req.method || 'GET').toUpperCase()
      if (method === 'GET') {
        const cur = readStoredToken()
        json(res, 200, { ok: true, configured: !!cur, masked: cur ? mask(cur.token) : '', updatedAt: cur?.updatedAt || '', dir: cur?.dir || '' })
        return
      }
      if (method === 'PUT' || method === 'POST') {
        let input: any = null
        try {
          const raw = await readBody(req)
          input = raw ? JSON.parse(raw) : {}
        } catch {
          json(res, 400, { ok: false, error: 'invalid JSON body' })
          return
        }
        const token = String(input?.token ?? '').trim()
        if (!/^(github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,})$/.test(token)) {
          json(res, 400, { ok: false, error: '令牌格式不认识（应为 github_pat_… 或 ghp_…）' })
          return
        }
        try {
          const dir = primaryStoreDir()
          writeFileSync(joinPath(dir, STORE_FILE), JSON.stringify({ version: 1, githubToken: token, updatedAt: new Date().toISOString() }, null, 2) + '\n', 'utf8')
          json(res, 200, { ok: true, configured: true, masked: mask(token), dir })
        } catch (error: any) {
          json(res, 500, { ok: false, error: String(error?.message ?? error) })
        }
        return
      }
      if (method === 'DELETE') {
        const cur = readStoredToken()
        try {
          if (cur) unlinkSync(joinPath(cur.dir, STORE_FILE))
          json(res, 200, { ok: true, configured: false })
        } catch (error: any) {
          json(res, 500, { ok: false, error: String(error?.message ?? error) })
        }
        return
      }
      json(res, 405, { ok: false, error: 'GET / PUT / DELETE only' })
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/api/cau/enrich',
    handler: async (req: any, res: any) => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'POST only' })
        return
      }
      let input: any = null
      try {
        const raw = await readBody(req)
        input = raw ? JSON.parse(raw) : {}
      } catch {
        json(res, 400, { ok: false, error: 'invalid JSON body' })
        return
      }
      if (!input?.title && !input?.content) {
        json(res, 400, { ok: false, error: 'title/content required' })
        return
      }
      if (!llm) {
        json(res, 503, { ok: false, error: 'ctx.llm unavailable' })
        return
      }
      try {
        const out = await runEnrich(llm, input)
        json(res, out.ok ? 200 : 502, out)
      } catch (error: any) {
        json(res, 500, { ok: false, error: String(error?.message ?? error) })
      }
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/api/cau/data',
    handler: async (req: any, res: any) => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'POST only' })
        return
      }
      let input: any = null
      try {
        const raw = await readBody(req)
        input = raw ? JSON.parse(raw) : {}
      } catch {
        json(res, 400, { ok: false, error: 'invalid JSON body' })
        return
      }
      const rel = String(input?.path ?? '')
      const token = String(input?.token ?? '')
      const repo = String(input?.repo ?? 'ZBber-lab/cau-portal').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')
      if (!rel || !token) {
        json(res, 400, { ok: false, error: 'path/token required' })
        return
      }
      // 仓库名白名单格式（owner/repo，仅字母数字 _ - . 与单斜杠，防 SSRF/注入）
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
        json(res, 403, { ok: false, error: 'repo not allowed' })
        return
      }
      // 路径白名单：仅允许读取 data/ 下文件与 sites.json（禁止 .. 逃逸）
      if (rel.includes('..') || !/^(data\/[A-Za-z0-9_\-./]+|sites\.json)$/.test(rel)) {
        json(res, 403, { ok: false, error: 'path not allowed' })
        return
      }
      try {
        const gh = await fetch(
          `https://api.github.com/repos/${repo}/contents/${rel}?ref=main`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.raw',
              'User-Agent': 'cau-portal-server',
            },
          },
        )
        if (!gh.ok) {
          json(res, 502, { ok: false, error: `GitHub ${gh.status}` })
          return
        }
        json(res, 200, { ok: true, text: await gh.text() })
      } catch (error: any) {
        json(res, 502, { ok: false, error: String(error?.message ?? error) })
      }
    },
  })

  // ---------- 阶段6：每日邮件报告（本机 SMTP 发送；授权码仅存本机 cau-email/config.json） ----------
  const emailSvc = () => import(new URL('../tools/email/service.mjs', import.meta.url).href as string)

  webServer.register({
    kind: 'exact',
    path: '/api/cau/email/status',
    handler: async (_req: any, res: any) => {
      try {
        const m: any = await emailSvc()
        json(res, 200, m.statusInfo())
      } catch (error: any) {
        json(res, 500, { ok: false, error: String(error?.message ?? error) })
      }
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/api/cau/email/config',
    handler: async (req: any, res: any) => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'POST only' })
        return
      }
      let input: any = null
      try {
        const raw = await readBody(req)
        input = raw ? JSON.parse(raw) : {}
      } catch {
        json(res, 400, { ok: false, error: 'invalid JSON body' })
        return
      }
      try {
        const m: any = await emailSvc()
        const out = m.updateConfig(input)
        json(res, out.ok ? 200 : 400, out)
      } catch (error: any) {
        json(res, 500, { ok: false, error: String(error?.message ?? error) })
      }
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/api/cau/email/rules',
    handler: async (req: any, res: any) => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'POST only' })
        return
      }
      let input: any = null
      try {
        const raw = await readBody(req)
        input = raw ? JSON.parse(raw) : {}
      } catch {
        json(res, 400, { ok: false, error: 'invalid JSON body' })
        return
      }
      try {
        const m: any = await emailSvc()
        const c = m.loadConfig()
        c.rules = Array.isArray(input?.rules) ? input.rules.slice(0, 60) : c.rules
        m.saveConfig(c)
        json(res, 200, { ok: true, rulesCount: c.rules.length })
      } catch (error: any) {
        json(res, 500, { ok: false, error: String(error?.message ?? error) })
      }
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/api/cau/email/test',
    handler: async (req: any, res: any) => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'POST only' })
        return
      }
      try {
        const m: any = await emailSvc()
        if (m.isSending()) {
          json(res, 200, { ok: false, error: '已有发送任务进行中，请稍候' })
          return
        }
        const out = await m.sendReport({ mode: 'test' })
        json(res, out.ok ? 200 : 200, out)
      } catch (error: any) {
        json(res, 500, { ok: false, error: String(error?.message ?? error) })
      }
    },
  })

  // 每日调度：启动（幂等）；日志只记状态，绝不落授权码
  emailSvc()
    .then((m: any) =>
      m.startEmailScheduler({
        onResult: (r: any) => {
          const note = r.ok ? `每日邮件报告已发送（${r.why}）` : `每日邮件报告发送失败：${r.error ?? ''}`
          ctx?.logger?.info(`[cau-portal] ${note}`)
        },
      }),
    )
    .catch((e: any) => ctx?.logger?.warn(`[cau-portal] 邮件调度启动失败：${String(e?.message ?? e)}`))

  ctx?.logger?.info('[cau-portal] server routes registered: /api/cau/health, /api/cau/enrich, /api/cau/data, /api/cau/email/{status,config,rules,test}')
}
