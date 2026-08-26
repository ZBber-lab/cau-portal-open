/**
 * cau-portal 服务端 cordis 插件（阶段4 第2步：服务端半区）。
 * - GET  /api/cau/health   健康检查（验证插件加载与 webServer 注入）
 * - POST /api/cau/enrich   按需 AI 加工：DSH ctx.llm 流式调用（无浏览器密钥、无 CORS），
 *   默认 provider=deepseek-official / model=deepseek-v4-flash / reasoningEffort=off
 *   （请求体可覆盖 provider/model），返回摘要/分类/重要度/deadline + 用量。
 */
export const name = 'cau-portal'
export const inject = ['webServer', 'llm']

const VERSION = '0.1.0'

const SYSTEM_PROMPT = `你是中国农业大学新闻处理助手。阅读给定文章，输出一个 JSON 对象（只输出 JSON，不要输出任何其他文字）。

JSON 格式示例：
{"summary":"一句话摘要，不超过60个汉字","category":"通知","importance":"中","deadline":{"item":"报名","date":"2026-09-01","evidence":"8月27日前提交"}或null}

规则：
1. summary：用中文概括文章核心事项，不超过60字；
2. category：从["通知","新闻","讲座","竞赛","评奖","选课","学术","其他"]中选择最贴切的一个；
3. importance：与学业、评奖评优、考试、报名、缴费、学位授予、选课等切身利益相关的为"高"；一般事务性通知为"中"；常规新闻动态、宣传报道为"低"；
4. deadline：若文中存在明确的截止时间（如"X月X日前""截止至X月X日""于X月X日之前"），给出事项名 item、绝对日期 date（YYYY-MM-DD）和原文表述 evidence（从正文原样摘录包含该时间的那句话片段，20字以内）。相对表述（如"下周五""两周内"）需按文章发布时间换算成绝对日期；若年份未写明，使用文章发布时间所在年份；多个截止时间只取最早的一个。若无任何明确截止时间，deadline 输出 null。`

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
  const body = String(input.content ?? '').replace(/\s+/g, ' ').slice(0, 3000)
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

  ctx?.logger?.info('[cau-portal] server routes registered: /api/cau/health, /api/cau/enrich')
}
