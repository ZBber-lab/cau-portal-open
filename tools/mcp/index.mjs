/**
 * 农大门户 MCP 服务器（cau-portal）
 * - stdio 传输；零外部依赖（仅 @modelcontextprotocol/sdk）
 * - 数据源：本地 data/（爬虫管道产出：index.json / feed/*.json / articles/<sha1>.json / usage.jsonl）
 * - 数据目录可用环境变量 CAU_DATA_DIR 覆盖，默认 <repo>/data
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { readFile, readdir, appendFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.CAU_DATA_DIR || path.resolve(HERE, '..', '..', 'data')
const FEED_DIR = path.join(DATA_DIR, 'feed')
const ART_DIR = path.join(DATA_DIR, 'articles')

// ---- GitHub 云端数据源（阶段4 第3步）：CAU_GITHUB_TOKEN 存在即切换 ----
const GH_TOKEN = process.env.CAU_GITHUB_TOKEN || ''
const GH_REPO = process.env.CAU_GITHUB_REPO || 'zhouxuanting52-lab/cau-portal'
const GH_BRANCH = process.env.CAU_GITHUB_BRANCH || 'main'
const GH_MODE = !!GH_TOKEN
const ghCache = new Map() // rel -> { t, text }
const ghListCache = new Map() // rel -> { t, list }
const CACHE_TTL_MS = 30_000
const CACHE_TTL_LIST_MS = 30_000
const CACHE_TTL_ARTICLE_MS = 300_000

async function ghFetch(rel) {
  const url = `https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'cau-portal-mcp',
    },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${rel}`)
  return res.text()
}

async function ghList(rel) {
  const url = `https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, 'User-Agent': 'cau-portal-mcp' },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status} listing ${rel}`)
  const list = await res.json()
  return Array.isArray(list) ? list.map((e) => e.name) : []
}

const SITE_HOST = {
  clst: 'https://clst.cau.edu.cn',
  jwc: 'https://jwc.cau.edu.cn',
  news: 'https://news.cau.edu.cn',
}
const CATEGORIES = ['通知', '新闻', '讲座', '竞赛', '评奖', '选课', '学术', '其他']

const server = new McpServer({ name: 'cau-portal', version: '0.1.0' })

// ---------- 数据读取（统一源：GH 模式读 GitHub，否则本地 data/） ----------
/** 读取 data/ 下的相对子路径文本；GH 模式带进程内缓存 */
async function readSource(rel) {
  if (GH_MODE) {
    const hit = ghCache.get(rel)
    if (hit && Date.now() - hit.t < (rel.startsWith('articles/') ? CACHE_TTL_ARTICLE_MS : CACHE_TTL_MS)) return hit.text
    const text = await ghFetch(`data/${rel}`)
    ghCache.set(rel, { t: Date.now(), text })
    return text
  }
  try {
    return await readFile(path.join(DATA_DIR, rel), 'utf8')
  } catch {
    return null
  }
}

async function readJson(rel) {
  const text = await readSource(rel)
  if (text == null) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function listDir(rel) {
  if (GH_MODE) {
    const hit = ghListCache.get(rel)
    if (hit && Date.now() - hit.t < CACHE_TTL_LIST_MS) return hit.list
    const list = await ghList(`data/${rel}`)
    ghListCache.set(rel, { t: Date.now(), list })
    return list
  }
  try {
    return (await readdir(path.join(DATA_DIR, rel))).filter((f) => f.endsWith('.json'))
  } catch {
    return []
  }
}

async function loadIndex() {
  return readJson('index.json')
}

async function loadFeeds() {
  const names = await listDir('feed')
  const feeds = []
  for (const name of names) {
    const feed = await readJson(`feed/${name}`)
    if (feed && Array.isArray(feed.items)) feeds.push(feed)
  }
  return feeds
}

/** 相对路径 → 绝对 URL */
function absUrl(site, url) {
  const u = String(url ?? '')
  if (/^https?:\/\//i.test(u)) return u
  const host = SITE_HOST[site] ?? ''
  return host + (u.startsWith('/') ? u : '/' + u)
}

/** URL 归一化：去协议/主机，统一以 / 开头（用于相对与绝对 URL 互查） */
function pathForm(url) {
  let u = String(url ?? '').trim()
  if (!u) return ''
  try {
    if (/^https?:\/\//i.test(u)) u = new URL(u).pathname
  } catch { /* 保持原样 */ }
  if (!u.startsWith('/')) u = '/' + u
  return u
}

/** 展开所有 feed 条目，附加站点/栏目上下文与绝对 URL */
async function flattenFeeds() {
  const feeds = await loadFeeds()
  const out = []
  for (const feed of feeds) {
    for (const it of feed.items ?? []) {
      out.push({
        url: absUrl(feed.site, it.url),
        path: pathForm(it.url),
        title: it.title ?? '',
        date: it.date ?? '',
        first_seen: it.first_seen ?? null,
        article: typeof it.article === 'string' ? it.article : null,
        site: feed.site,
        site_name: feed.site_name ?? feed.site,
        column: feed.column_key ?? '',
        column_name: feed.column_name ?? feed.column_key ?? '',
      })
    }
  }
  return out
}

/** 日期字符串（YYYY-MM-DD）→ 本地 0 点时间戳；非法返回 NaN */
function parseDay(s) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s ?? ''))
  if (!m) return NaN
  return new Date(+m[1], +m[2] - 1, +m[3]).getTime()
}

function localDay(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 附带 AI 元数据（若该条目已有正文） */
async function withAi(item) {
  if (!item.article) return { ...item }
  const art = await readJson('articles/' + item.article)
  if (!art) return { ...item }
  const { title, time, source, url, body, is_image_only, ai, ai_model } = art
  return {
    ...item,
    article_id: String(item.article).replace(/\.json$/, ''),
    article_time: time ?? null,
    source_name: source ?? item.site_name,
    article_url: url ?? item.url,
    is_image_only: !!is_image_only,
    body: typeof body === 'string' ? body.slice(0, 600) : '',
    ai: ai ?? null,
    ai_model: ai_model ?? null,
  }
}

function okJson(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] }
}

function failJson(err) {
  return { content: [{ type: 'text', text: `cau-portal MCP 错误：${String(err?.message ?? err)}` }], isError: true }
}

// ---------- 工具 1：list_sites ----------
server.registerTool('list_sites', {
  title: '列出农大门户收录的站点与栏目',
  description:
    '列出农大门户插件收录的全部站点（土地科学与技术学院/教务处/校新闻网等）与栏目目录，含条目数、最新日期、数据更新时间等统计。' +
    '当用户问"有哪些来源/栏目"时先调用本工具；source 参数取值用站点 id（clst/jwc/news），column 参数取值用栏目 key。',
  inputSchema: {},
}, async () => {
  try {
    const index = await loadIndex()
    if (!index) return okJson({ error: 'index.json 不存在（尚未运行爬虫）', sites: [] })
    return okJson(index)
  } catch (e) { return failJson(e) }
})

// ---------- 工具 2：list_latest ----------
server.registerTool('list_latest', {
  title: '获取农大最新新闻/通知列表',
  description:
    '返回农大门户数据中最新的一批新闻/通知条目（按发布日期倒序）。可选按站点（source=clst/jwc/news 或站点中文名）、栏目（column=栏目 key 或名称）、主题分类（category=通知/新闻/讲座/竞赛/评奖/选课/学术/其他，取自 AI 加工结果）筛选。' +
    'limit 默认 20（最大 50）。条目若已有 AI 加工会附带一句话摘要与重要度。',
  inputSchema: {
    source: z.string().optional(),
    column: z.string().optional(),
    category: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  },
}, async (args) => {
  try {
    const { source, column, category, limit } = args ?? {}
    let items = await flattenFeeds()
    if (source) {
      const s = String(source)
      items = items.filter((it) => it.site === s || it.site_name === s || it.site_name?.includes(s))
    }
    if (column) {
      const c = String(column)
      items = items.filter((it) => it.column === c || it.column_name === c)
    }
    items.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.first_seen || '').localeCompare(a.first_seen || ''))
    const n = Math.min(50, Math.max(1, Number(limit) || 20))
    const picked = items.slice(0, category ? 400 : n)
    const enriched = await Promise.all(picked.map(withAi))
    let out = category ? enriched.filter((it) => it.ai?.category === String(category)) : enriched
    if (category) out = out.slice(0, n)
    return okJson({ count: out.length, items: out })
  } catch (e) { return failJson(e) }
})

// ---------- 工具 3：search_news ----------
server.registerTool('search_news', {
  title: '关键词检索农大新闻/通知',
  description:
    '在农大门户数据中按关键词检索新闻/通知。匹配范围：标题、AI 摘要（秒回）；命中不足时按需读取候选正文（最多 40 篇，限并发）。' +
    'query 支持空格分隔的多关键词（须全部命中）。可选 days 限定最近 N 天、source 限定站点。返回按日期倒序的前 30 条（含标题/日期/来源/链接/AI 摘要）。',
  inputSchema: {
    query: z.string().min(1),
    days: z.number().int().min(1).max(3650).optional(),
    source: z.string().optional(),
  },
}, async (args) => {
  try {
    const query = String(args?.query ?? '').trim()
    if (!query) return failJson(new Error('query 不能为空'))
    const tokens = query.split(/\s+/).filter(Boolean).map((t) => t.toLowerCase())
    let items = await flattenFeeds()
    if (args?.source) {
      const s = String(args.source)
      items = items.filter((it) => it.site === s || it.site_name === s || it.site_name?.includes(s))
    }
    const days = Number(args?.days) || 0
    if (days > 0) {
      const floor = Date.now() - days * 86400000
      items = items.filter((it) => { const t = parseDay(it.date); return Number.isFinite(t) && t >= floor })
    }
    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    // 一次读取 summary 的 ai_map（含全部已加工条目的摘要），避免逐篇请求
    const summary = (await readJson('summary.json')) || {}
    const aiMap = summary.ai_map || {}
    const articleKey = (it) => (it.article ? String(it.article).replace(/\.json$/, '') : null)
    const mkHit = (it, ai) => ({
      title: it.title,
      date: it.date,
      source: it.site_name,
      column: it.column_name,
      url: it.url,
      article_id: articleKey(it),
      ai_summary: ai?.summary ?? null,
      importance: ai?.importance ?? null,
    })

    const hits = []
    const candidates = []
    // 阶段1：标题 + AI 摘要粗筛（零额外请求，保证秒回）
    for (const it of items) {
      const ai = articleKey(it) ? (aiMap[articleKey(it)] || null) : null
      const hay = String(it.title ?? '').toLowerCase() + ' ' + String(ai?.summary ?? '').toLowerCase()
      const partial = tokens.some((t) => hay.includes(t))
      if (tokens.every((t) => hay.includes(t))) {
        hits.push(mkHit(it, ai))
        if (hits.length >= 30) break
      } else if (partial && it.article) {
        candidates.push(it) // 标题/摘要命中部分关键词 → 正文回退候选
      }
    }
    // 阶段2：正文回退（最多 40 篇、并发 6，防超时）
    if (hits.length < 30 && candidates.length > 0) {
      const pool = candidates.slice(0, 40)
      const CONC = 6
      for (let i = 0; i < pool.length && hits.length < 30; i += CONC) {
        const arts = await Promise.all(
          pool.slice(i, i + CONC).map(async (it) => {
            const art = await readJson('articles/' + it.article)
            return { it, body: art?.body ? String(art.body).slice(0, 4000).toLowerCase() : '', ai: art?.ai ?? null }
          }),
        )
        for (const { it, body, ai } of arts) {
          if (hits.length >= 30) break
          const hay = String(it.title ?? '').toLowerCase() + ' ' + body + ' ' + String(ai?.summary ?? '').toLowerCase()
          if (tokens.every((t) => hay.includes(t))) hits.push(mkHit(it, ai))
        }
      }
    }
    return okJson({ query, count: hits.length, items: hits })
  } catch (e) { return failJson(e) }
})

// ---------- 工具 4：get_article ----------
server.registerTool('get_article', {
  title: '获取单篇新闻/通知全文',
  description:
    '按文章 id（64 位 hex，来自列表/检索结果的 article_id）或原文 URL（相对路径 /art/... 或完整链接均可）读取单篇全文，含正文、发布时间、来源、AI 摘要/分类/重要度/deadline。' +
    '若该条只有列表信息、正文尚未抓取入库，会返回可用的元信息与提示。',
  inputSchema: {
    id_or_url: z.string().min(1),
  },
}, async (args) => {
  try {
    const key = String(args?.id_or_url ?? '').trim()
    if (!key) return failJson(new Error('id_or_url 不能为空'))
    // 1) 直接按文件名
    const idOnly = key.replace(/\.json$/, '').split(/[\\/]/).pop()
    if (/^[0-9a-f]{40}$/.test(idOnly)) {
      const art = await readJson('articles/' + idOnly + '.json')
      if (art) return okJson({ found: true, stored: true, ...art, article_id: idOnly })
    }
    // 2) 按 URL 反查 feed
    const target = pathForm(key)
    const items = await flattenFeeds()
    const hit = items.find((it) => it.path === target)
    if (!hit) return okJson({ found: false, stored: false, id_or_url: key, note: '未找到该文章：id 或 URL 不在农大门户数据中' })
    if (hit.article) {
      const art = await readJson('articles/' + hit.article)
      if (art) return okJson({ found: true, stored: true, ...art, article_id: String(hit.article).replace(/\.json$/, '') })
    }
    return okJson({
      found: true,
      stored: false,
      title: hit.title,
      date: hit.date,
      source: hit.site_name,
      column: hit.column_name,
      url: hit.url,
      note: '正文尚未抓取入库，仅有列表信息；可直接打开 url 查看原文。',
    })
  } catch (e) { return failJson(e) }
})

// ---------- 工具 5：list_deadlines ----------
server.registerTool('list_deadlines', {
  title: '列出近期截止事项',
  description:
    '列出未来 N 天内（含今天）有截止日期的通知事项（报名/提交/申报等 deadline，由 AI 从正文提取并经本地校验）。' +
    'days 默认 7、最大 90。返回按截止日期升序的事项列表，含事项名、截止日期、来源与证据原文。',
  inputSchema: {
    days: z.number().int().min(1).max(90).optional(),
  },
}, async (args) => {
  try {
    const days = Math.min(90, Math.max(1, Number(args?.days) || 7))
    // 直接读 summary.json 的 deadlines（爬虫已算好并校验），避免逐篇扫描上千个文章文件
    const summary = (await readJson('summary.json')) || {}
    const dl = Array.isArray(summary.deadlines) ? summary.deadlines : []
    const aiMap = summary.ai_map || {}
    const now = Date.now()
    const floor = new Date(); floor.setHours(0, 0, 0, 0)
    const ceil = floor.getTime() + days * 86400000
    const out = []
    for (const d of dl) {
      const t = parseDay(d.date)
      if (!Number.isFinite(t) || t < floor.getTime() || t >= ceil) continue
      out.push({
        title: d.title,
        source: d.source,
        url: d.url,
        publish_time: d.time ?? null,
        summary: (aiMap[d.article_id] && aiMap[d.article_id].summary) || null,
        deadline: { item: d.item ?? '', date: d.date, evidence: d.evidence ?? '' },
      })
    }
    out.sort((a, b) => String(a.deadline.date).localeCompare(String(b.deadline.date)))
    return okJson({ days, count: out.length, generated_at: new Date(now).toISOString(), items: out })
  } catch (e) { return failJson(e) }
})

// ---------- 工具 6：get_usage ----------
server.registerTool('get_usage', {
  title: '查询农大门户数据管道的 API 用量与花费',
  description:
    '返回农大门户爬虫/AI 加工管道近 N 天的 DeepSeek API 用量统计（本项目管道花费，非账户余额）：调用次数、总花费（元）、输入/输出 token、按日明细。' +
    'days 默认 30。若换用本地模型或未记账则返回零值。',
  inputSchema: {
    days: z.number().int().min(1).max(365).optional(),
  },
}, async (args) => {
  try {
    const days = Math.min(365, Math.max(1, Number(args?.days) || 30))
    const floor = Date.now() - days * 86400000
    const raw = (await readSource('usage.jsonl')) ?? ''
    const byDay = {}
    let calls = 0, cost = 0, promptTokens = 0, completionTokens = 0, cachedTokens = 0
    for (const line of raw.split('\n')) {
      const l = line.trim()
      if (!l) continue
      let row
      try { row = JSON.parse(l) } catch { continue }
      const ts = Date.parse(row.ts)
      if (!Number.isFinite(ts) || ts < floor) continue
      calls += 1
      cost += Number(row.cost_yuan) || 0
      promptTokens += Number(row.prompt_tokens) || 0
      completionTokens += Number(row.completion_tokens) || 0
      cachedTokens += Number(row.cached_tokens) || 0
      const d = localDay(ts)
      byDay[d] = byDay[d] || { calls: 0, cost_yuan: 0 }
      byDay[d].calls += 1
      byDay[d].cost_yuan += Number(row.cost_yuan) || 0
    }
    return okJson({
      days,
      calls,
      total_cost_yuan: Math.round(cost * 10000) / 10000,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cached_tokens: cachedTokens,
      by_day: byDay,
    })
  } catch (e) { return failJson(e) }
})

// ---------- 启动 ----------
const transport = new StdioServerTransport()
await server.connect(transport)
// stdio 打开即保持进程存活；日志一律走 stderr，避免污染协议流
console.error(`[cau-portal-mcp] ready, data dir: ${DATA_DIR}${GH_MODE ? ` (github: ${GH_REPO}@${GH_BRANCH})` : ' (local)'}`)
// 协议审计（本地日志，验证 DSH 客户端握手与工具调用用）
const auditLog = (line) => appendFile(path.join(DATA_DIR, 'mcp-audit.log'), `${new Date().toISOString()} ${line}\n`, 'utf8').catch(() => {})
{
  const origOnMessage = transport.onmessage
  transport.onmessage = (msg) => {
    auditLog(`recv ${msg?.method ?? ('id=' + msg?.id)}`)
    return origOnMessage?.(msg)
  }
  const origSend = transport.send.bind(transport)
  transport.send = (msg) => {
    auditLog(`send ${msg?.result ? 'result' : (msg?.method ?? ('id=' + msg?.id))}`)
    return origSend(msg)
  }
}
// 启动心跳文件（供外部检测 DSH 是否已 spawn 本服务器）
try {
  await appendFile(path.join(DATA_DIR, 'mcp-start.log'), `${new Date().toISOString()} started pid=${process.pid} argv=${process.argv.slice(1).join(' ')}\n`, 'utf8')
} catch { /* 检测辅助，失败不影响服务 */ }
