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
import { resolveGithubToken, readStoreConfig, maskToken } from '../shared/token-store.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.CAU_DATA_DIR || path.resolve(HERE, '..', '..', 'data')
const FEED_DIR = path.join(DATA_DIR, 'feed')
const ART_DIR = path.join(DATA_DIR, 'articles')

// ---- GitHub 云端数据源（阶段4 第3步）：令牌存在即切换 ----
// 令牌来源：环境变量 → 本机共享存储（<profile>\cau-portal-store\token.json，面板设置页写的）
// **每次调用现读（5 秒缓存）**：这样在面板里换令牌立刻生效，不需要重启 dsh web。
let _tokCache = { at: 0, val: '' }
function ghToken() {
  const now = Date.now()
  if (now - _tokCache.at < 5000) return _tokCache.val
  _tokCache = { at: now, val: resolveGithubToken() || '' }
  return _tokCache.val
}
const ghMode = () => !!ghToken()

/**
 * 数据仓库名与分支（2026-09-30 #1）：**面板「设置 → 数据源」填一次即可**。
 * 解析顺序：环境变量 `CAU_GITHUB_REPO` / `CAU_GITHUB_BRANCH`（可选覆盖）
 *          → 本机共享存储 `<profile>\cau-portal-store\config.json`（面板经 `PUT /api/cau/config` 写的）
 *          → **空**（**没有内置默认仓** —— 旧默认值 `ZBber-lab/cau-portal` 把"未配置"静默变成"读作者的仓"）。
 * **每次现读（5 秒缓存，与令牌同策略）**：面板里改完数据源，MCP 不必重启 DSH 就能跟上。
 */
let _repoCache = { at: 0, repo: '', branch: 'main' }
function resolveRepoConfig() {
  const now = Date.now()
  if (now - _repoCache.at < 5000) return _repoCache
  const cfg = readStoreConfig() || {}
  const envRepo = String(process.env.CAU_GITHUB_REPO || '').trim()
  const envBranch = String(process.env.CAU_GITHUB_BRANCH || '').trim()
  const repo = normalizeRepo(envRepo) || normalizeRepo(cfg.dataRepo)
  const branch = envBranch || String(cfg.branch || '').trim() || 'main'
  _repoCache = { at: now, repo, branch }
  return _repoCache
}
const resolveRepo = () => resolveRepoConfig().repo
const resolveBranch = () => resolveRepoConfig().branch

/** 归一化 owner/repo（允许完整 GitHub 链接与 `.git` 后缀、末尾斜杠）；非法返回 '' */
function normalizeRepo(input) {
  const s = String(input ?? '')
    .trim()
    .replace(/^https?:\/\/(?:www\.)?github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '')
    .trim()
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(s) ? s : ''
}

/** 未配置数据仓时的**可操作**错误（绝不 404、绝不静默去读别人的仓） */
function repoMissingError() {
  return new Error(
    '请先配置数据仓库：在面板「设置 → 数据源」填写你的数据仓库（owner/repo，填一次即可，MCP 会自动跟上），' +
      '或设置环境变量 CAU_GITHUB_REPO。',
  )
}

/** 本机什么都没配时的提示（数据仓缺失 / 令牌缺失）——给 list_sites 这类"第一站"工具用 */
function configHint() {
  const repo = resolveRepo()
  if (repo) return ghMode() ? '' : '本机没有令牌：在面板「设置 → 令牌管理」登记（或设 CAU_GITHUB_TOKEN），否则只能读本地 data/'
  return '请先配置数据仓库：在面板「设置 → 数据源」填写 owner/repo，「设置 → 令牌管理」登记令牌；若只用本地管道数据，请先运行 tools/scraper/crawl.mjs'
}

// 缓存键都带 `repo@branch|` 前缀：数据仓可动态切换（#1），**不能沿用旧仓的缓存**
// （否则切换瞬间会出现"data_source 已显示新仓、而 index.json/feed/文章仍是旧仓"的 30–300 秒错配）
const ghCache = new Map() // "repo@branch|rel" -> { t, text }
const ghListCache = new Map() // "repo@branch|rel" -> { t, list }
const CACHE_TTL_MS = 30_000
const CACHE_TTL_LIST_MS = 30_000
const CACHE_TTL_ARTICLE_MS = 300_000

/** 缓存键：`<repo>@<branch>|<rel>`（仓/分支来自 resolveRepoConfig()，5 秒缓存） */
const cacheKey = (rel) => `${resolveRepo()}@${resolveBranch()}|${rel}`

/**
 * GitHub 侧错误的「人话化」。**404 在数据仓这一层几乎总是"仓库没配对"，而不是文件真的不存在**：
 * 2026-09-30 #1 起数据仓由**面板设置**决定（本机共享存储 `config.json`），不再是硬编码默认值。
 */
function ghError(kind, rel, res) {
  const repo = resolveRepo()
  const branch = resolveBranch()
  let hint = ''
  if (res.status === 404) {
    hint =
      `。当前用的是 ${repo}@${branch} —— 若不是你的数据仓：在面板「设置 → 数据源」改正（填一次即可，` +
      `MCP 5 秒内跟上）；也可用环境变量 CAU_GITHUB_REPO 覆盖。`
  } else if (res.status === 401 || res.status === 403) {
    hint = `。令牌无效或权限不足：确认它被授权访问 ${repo}（Contents: Read），且没有写错仓。`
  }
  return new Error(`GitHub ${res.status} ${kind} ${rel}（仓库 ${repo}@${branch}）${hint}`)
}

async function ghFetch(rel) {
  const repo = resolveRepo()
  const branch = resolveBranch()
  if (!repo) throw repoMissingError()
  const url = `https://api.github.com/repos/${repo}/contents/${rel}?ref=${branch}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ghToken()}`,
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'cau-portal-mcp',
    },
  })
  if (!res.ok) throw ghError('读取', rel, res)
  return res.text()
}

async function ghList(rel) {
  const repo = resolveRepo()
  const branch = resolveBranch()
  if (!repo) throw repoMissingError()
  const url = `https://api.github.com/repos/${repo}/contents/${rel}?ref=${branch}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${ghToken()}`, 'User-Agent': 'cau-portal-mcp' },
  })
  if (!res.ok) throw ghError('列目录', rel, res)
  const list = await res.json()
  return Array.isArray(list) ? list.map((e) => e.name) : []
}

/**
 * 站点 id → baseUrl：**数据驱动、四层**（优先级由低到高）
 *   内置表（兜底） ← 数据仓的 sites.json（云端；README 第 5 步让用户放数据仓根）
 *   ← 工具仓自己的 sites.json ← `CAU_SITES_FILE` 覆盖
 *
 * 为什么不写死一张表：用户用「添加栏目」自己接的来源**永远不会出现在内置表里**，而失败是**静默的**
 * —— 2026-09-13 接入的校团委就这么漏了一个多月（MCP 一直在给相对路径，没人报错）。
 * 所以解析不出时**不输出相对路径**：置 `url: null` 并附 `url_relative`，让调用方看得见"这条要自己拼主机"。
 */
const SITE_HOST_BUILTIN = {
  clst: 'https://clst.cau.edu.cn',
  jwc: 'https://jwc.cau.edu.cn',
  news: 'https://news.cau.edu.cn',
  youth: 'https://youth.cau.edu.cn',
  zju_gs: 'http://gs.zju.edu.cn',
  zju_cers: 'http://www.cers.zju.edu.cn/cercn',
}
const SITES_TTL_MS = 60_000
let _repoSitesCache = { at: 0, map: {} } // 工具仓自己的 sites.json
let _overrideSitesCache = { key: '', at: 0, map: {} } // CAU_SITES_FILE（按路径隔离）
let _cloudSitesCache = { key: '', at: 0, map: {} } // 数据仓 sites.json（按 repo@branch 隔离）
let _cloudSitesLoading = null // 同一进程内并发去重

/** sites.json 文本 → { siteId: baseUrl }（坏文件当空，绝不抛） */
function hostsFromSitesJson(text) {
  const out = {}
  try {
    const j = JSON.parse(text)
    for (const s of Array.isArray(j?.sites) ? j.sites : []) {
      const id = String(s?.id ?? '').trim()
      const base = String(s?.baseUrl ?? '').trim().replace(/\/+$/, '')
      if (id && /^https?:\/\//i.test(base)) out[id] = base
    }
  } catch {
    /* 坏文件当没有 */
  }
  return out
}

async function readSitesFile(p) {
  try {
    return hostsFromSitesJson(await readFile(p, 'utf8'))
  } catch {
    return {}
  }
}

/** 本地层之一：工具仓自己的 sites.json（无网络开销）；60 秒缓存 */
async function repoSiteHosts() {
  if (_repoSitesCache.at && Date.now() - _repoSitesCache.at < SITES_TTL_MS) return _repoSitesCache.map
  const map = await readSitesFile(path.join(path.resolve(HERE, '..', '..'), 'sites.json'))
  _repoSitesCache = { at: Date.now(), map }
  return map
}

/** 本地层之二：`CAU_SITES_FILE` 覆盖（优先级最高）；按路径隔离缓存 */
async function overrideSiteHosts() {
  const key = String(process.env.CAU_SITES_FILE || '').trim()
  if (!key) return {}
  const abs = path.resolve(key)
  if (_overrideSitesCache.key === abs && Date.now() - _overrideSitesCache.at < SITES_TTL_MS) return _overrideSitesCache.map
  const map = await readSitesFile(abs)
  _overrideSitesCache = { key: abs, at: Date.now(), map }
  return map
}

/**
 * 云端层：数据仓的 sites.json（仓根优先，兼容被复制进 data/ 的写法）。
 * 缓存按 `repo@branch` 隔离（#1 让数据仓可动态切换后，不能沿用旧仓的映射）；并发首次请求用 in-flight Promise 去重。
 */
async function cloudSiteHosts() {
  if (!ghMode()) return {}
  if (!resolveRepo()) return {}
  const key = `${resolveRepo()}@${resolveBranch()}`
  if (_cloudSitesCache.key === key && Date.now() - _cloudSitesCache.at < SITES_TTL_MS) return _cloudSitesCache.map
  if (_cloudSitesLoading && _cloudSitesLoading.key === key) return _cloudSitesLoading.promise
  const promise = (async () => {
    let map = {}
    for (const rel of ['sites.json', 'data/sites.json']) {
      try {
        map = hostsFromSitesJson(await ghFetch(rel))
        if (Object.keys(map).length) break
      } catch {
        /* 没有就试下一个（404 是常态，不刷错误） */
      }
    }
    _cloudSitesCache = { key, at: Date.now(), map }
    return map
  })()
  _cloudSitesLoading = { key, promise }
  try {
    return await promise
  } finally {
    if (_cloudSitesLoading?.key === key) _cloudSitesLoading = null
  }
}

/**
 * 站点 id → baseUrl。**逐层查找，严格按优先级**：
 *   `CAU_SITES_FILE` → 工具仓 sites.json → 数据仓 sites.json（云端）→ 内置表（**仅兜底**）
 *
 * ⚠️ 必须一层层查，**不能先把内置表合并进 map 再查** —— 那样内置表会挡住数据仓对**同名站点**的覆盖
 * （用户想改 `youth`/`zju_gs` 这类已在内置表里的 id 时会静默失效）。2026-09-29 Codex 审查指出。
 */
async function resolveSiteHost(site) {
  if (!site) return ''
  const override = await overrideSiteHosts()
  if (override[site]) return override[site]
  const repo = await repoSiteHosts()
  if (repo[site]) return repo[site]
  const cloud = await cloudSiteHosts()
  if (cloud[site]) return cloud[site]
  return SITE_HOST_BUILTIN[site] || ''
}
const CATEGORIES = ['通知', '新闻', '讲座', '竞赛', '评奖', '选课', '学术', '其他']

const server = new McpServer({ name: 'cau-portal', version: '0.5.4' })

// ---------- 数据读取（统一源：GH 模式读 GitHub，否则本地 data/） ----------
/** 读取 data/ 下的相对子路径文本；GH 模式带进程内缓存 */
async function readSource(rel) {
  if (ghMode()) {
    const key = cacheKey(rel)
    const hit = ghCache.get(key)
    if (hit && Date.now() - hit.t < (rel.startsWith('articles/') ? CACHE_TTL_ARTICLE_MS : CACHE_TTL_MS)) return hit.text
    const text = await ghFetch(`data/${rel}`)
    ghCache.set(key, { t: Date.now(), text })
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
  if (ghMode()) {
    const key = cacheKey(rel)
    const hit = ghListCache.get(key)
    if (hit && Date.now() - hit.t < CACHE_TTL_LIST_MS) return hit.list
    const list = await ghList(`data/${rel}`)
    ghListCache.set(key, { t: Date.now(), list })
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

/**
 * 相对路径 → 绝对 URL。已经是绝对地址的原样返回；
 * **站点解析不出来时返回 ''**（调用方必须改成 url:null + url_relative，不许再静默给相对路径）。
 */
async function absUrl(site, url) {
  const u = String(url ?? '')
  if (/^https?:\/\//i.test(u)) return u
  const host = await resolveSiteHost(site)
  if (!host) return ''
  return host + (u.startsWith('/') ? u : '/' + u)
}

/**
 * **所有对外输出链接的工具都必须过这一层**（统一约定，2026-09-29 Codex 审查要求）：
 *   绝对 URL        → `{ url }`
 *   可解析的相对 URL → `{ url: 绝对地址 }`
 *   解析不出的相对   → `{ url: null, url_relative: 原始相对路径 }`
 *
 * 文章 JSON 与 `summary.json` 里**都没有 site 字段**（实测键：title/time/source/url/…），
 * 所以站点未知时退回"按 path 反查 feed"来拿主机；仍拿不到就按解析不出处理 —— **绝不静默给相对路径**。
 */
async function normLink(url, site) {
  const raw = String(url ?? '').trim()
  if (!raw) return {}
  if (/^https?:\/\//i.test(raw)) return { url: raw }
  if (site) {
    const abs = await absUrl(site, raw)
    if (abs) return { url: abs }
  }
  try {
    const hit = (await flattenFeeds()).find((it) => it.path === pathForm(raw))
    if (hit?.url) return { url: hit.url }
  } catch {
    /* 反查失败 → 按解析不出处理 */
  }
  return { url: null, url_relative: raw }
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

/** 展开所有 feed 条目，附加站点/栏目上下文与绝对 URL（站点解析不出时给 url:null + url_relative，不静默给相对路径） */
async function flattenFeeds() {
  const feeds = await loadFeeds()
  const out = []
  for (const feed of feeds) {
    for (const it of feed.items ?? []) {
      const abs = await absUrl(feed.site, it.url)
      out.push({
        ...(abs ? { url: abs } : { url: null, url_relative: String(it.url ?? '') }),
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
  const { title, time, source, url, body, is_image_only, is_attachment_only, attachment, ai, ai_model } = art
  return {
    ...item,
    article_id: String(item.article).replace(/\.json$/, ''),
    article_time: time ?? null,
    source_name: source ?? item.site_name,
    article_url: url ?? item.url,
    is_image_only: !!is_image_only,
    // 正文即附件（苏迪 wp_pdf_player 等）：body 为空是**正常**的，不是抓取失败
    is_attachment_only: !!is_attachment_only,
    attachment: attachment ?? null,
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
    if (!index) {
      const hint = configHint()
      return okJson({ error: 'index.json 不存在（尚未运行爬虫）', ...(hint ? { hint } : {}), sites: [] })
    }
    return okJson({ ...index, data_source: ghMode() ? `github:${resolveRepo()}@${resolveBranch()}` : `local:${DATA_DIR}` })
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
      // 条目已由 flattenFeeds() 过了一遍链接规整：这里**原样带上** url / url_relative，别再只取 url
      url: it.url ?? null,
      ...(it.url_relative ? { url_relative: it.url_relative } : {}),
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
      if (art) return okJson({ found: true, stored: true, ...art, ...(await normLink(art.url, art.site)), article_id: idOnly })
    }
    // 2) 按 URL 反查 feed
    const target = pathForm(key)
    const items = await flattenFeeds()
    const hit = items.find((it) => it.path === target)
    if (!hit) return okJson({ found: false, stored: false, id_or_url: key, note: '未找到该文章：id 或 URL 不在农大门户数据中' })
    if (hit.article) {
      const art = await readJson('articles/' + hit.article)
      if (art) return okJson({ found: true, stored: true, ...art, ...(await normLink(art.url, art.site)), article_id: String(hit.article).replace(/\.json$/, '') })
    }
    return okJson({
      found: true,
      stored: false,
      title: hit.title,
      date: hit.date,
      source: hit.site_name,
      column: hit.column_name,
      ...(await normLink(hit.url, hit.site)),
      note: '正文尚未抓取入库，仅有列表信息；可直接打开 url 查看原文（若只给了 url_relative，说明该站点不在 sites.json 里，需要自己拼主机）。',
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
        ...(await normLink(d.url, d.site)),
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
console.error(`[cau-portal-mcp] ready, data dir: ${DATA_DIR}${ghMode() ? ` (github: ${resolveRepo() || '(未配置数据仓库)'}@${resolveBranch()}, token ${maskToken(ghToken())})` : ' (local)'}`)
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
  const src = ghMode() ? `github:${resolveRepo() || '(未配置数据仓库)'}@${resolveBranch()}` : 'local'
  const warn = !ghMode()
    ? '  <<< 未进入云端模式：令牌没解析到，读的是本地 data/（可能过期）'
    : resolveRepo() ? '' : '  <<< 令牌有、但数据仓库没配置：请到面板「设置 → 数据源」填写'
  await appendFile(path.join(DATA_DIR, 'mcp-start.log'), `${new Date().toISOString()} started pid=${process.pid} mode=${src}${warn} argv=${process.argv.slice(1).join(' ')}\n`, 'utf8')
} catch { /* 检测辅助，失败不影响服务 */ }
