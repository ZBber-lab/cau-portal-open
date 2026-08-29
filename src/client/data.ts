/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */

export type SettingsV1 = {
  /** 只读细粒度 PAT（Contents: Read，仅本机 localStorage） */
  githubToken?: string
  /** AI 加工/监控模型（独立配置槽，与主对话模型解耦；null=用服务端默认） */
  monitorModel?: { provider: string; model: string } | null
  /** 打开文章自动附加阅读上下文（阶段6 消费，默认开） */
  autoAttach?: boolean
  /** 各 key/令牌的过期日（YYYY-MM-DD），用于时限提醒；键约定如 github/bridge/push */
  keyExpiries?: Record<string, string>
  /** 面板「固定」开关（固定后点外部/Esc 不关闭，仅 ✕ 关） */
  panelPinned?: boolean
}

const SETTINGS_KEY = 'dsh.cau-portal.settings.v1'
const GH_REPO = 'zhouxuanting52-lab/cau-portal'
const GH_BRANCH = 'main'

export function loadSettings(): SettingsV1 {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveSettings(s: SettingsV1) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* 隐私模式等写入失败时静默 */
  }
}

async function ghFetchText(rel: string, token: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'cau-portal-panel',
    },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  return res.text()
}

async function serverProxyText(rel: string, token: string): Promise<string> {
  const res = await fetch('/api/cau/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: rel, token }),
  })
  let data: any = null
  try {
    data = await res.json()
  } catch {
    /* fallthrough */
  }
  if (!res.ok || !data?.ok) throw new Error(data?.error || `proxy ${res.status}`)
  return data.text
}

/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
export async function readCloudText(rel: string, token?: string): Promise<string> {
  if (!loadModules().cloud) throw new Error('数据源已在设置中禁用')
  const t = token || activeTokenValues()[0] || loadSettings().githubToken
  if (!t) throw new Error('未配置 GitHub 只读令牌')
  try {
    return await ghFetchText(rel, t)
  } catch {
    return serverProxyText(rel, t)
  }
}

export async function readCloudJson<T = any>(rel: string, token?: string): Promise<T | null> {
  try {
    return JSON.parse(await readCloudText(rel, token))
  } catch {
    return null
  }
}

// ---- 数据管理：删除请求队列（面板勾选 → 云端 data/prune-request.json，下轮抓取执行）----
// 客户端只读令牌本身含 Contents 读写，写清单文件与读同权限边界；删除动作由 Actions 在下轮
// crawl 中执行（router 逻辑见 tools/scraper/prune.mjs），无并发冲突。

export type PruneRequest = { version: number; requested_at: string | null; ids: string[] }

const PRUNE_REQUEST_REL = 'data/prune-request.json'
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1'

/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel: string, token: string): Promise<{ sha: string; text: string }> {
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
  })
  if (res.status === 404) return { sha: '', text: '' }
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  const j = await res.json()
  let text = ''
  try {
    text = decodeURIComponent(escape(atob(String(j.content || ''))))
  } catch { /* base64 解码失败：忽略 */ }
  return { sha: String(j.sha || ''), text }
}

/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel: string, token: string, content: string, sha: string): Promise<void> {
  const body: any = {
    message: 'data: prune request (panel)',
    content: btoa(unescape(encodeURIComponent(content))),
    branch: GH_BRANCH,
  }
  if (sha) body.sha = sha
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'cau-portal-panel',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub write ${res.status}`)
}

/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
export function loadPrunedSet(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function savePrunedSet(ids: string[]) {
  try {
    localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)))
  } catch {
    /* 静默 */
  }
}

/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
export function isPruned(id: string): boolean {
  return loadPrunedSet().includes(id)
}

/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
export async function queuePruneRequest(newIds: string[], token?: string): Promise<{ ok: boolean; total: number; error?: string }> {
  const t = token || activeTokenValues()[0] || loadSettings().githubToken
  if (!t) return { ok: false, total: 0, error: '未配置 GitHub 令牌' }
  const clean = (newIds || []).filter((x) => typeof x === 'string' && x)
  if (!clean.length) return { ok: false, total: 0, error: '未选择要删除的数据' }
  try {
    const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t)
    let prev: string[] = []
    try {
      const p = JSON.parse(meta.text)
      if (Array.isArray(p?.ids)) prev = p.ids.filter((x: any) => typeof x === 'string')
    } catch { /* 旧/坏清单按空处理 */ }
    const merged = [...new Set([...prev, ...clean])]
    await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha)
    savePrunedSet([...new Set([...loadPrunedSet(), ...clean])])
    return { ok: true, total: merged.length }
  } catch (e: any) {
    return { ok: false, total: 0, error: String(e?.message || e) }
  }
}

// ---- 功能模块开关（设置页分组卡片右上角；键 dsh.cau-portal.modules.v1）----

export type ModuleKey = 'ai' | 'context' | 'deadline' | 'cloud' | 'portal'

const MODULES_KEY = 'dsh.cau-portal.modules.v1'

export const DEFAULT_MODULES: Record<ModuleKey, boolean> = {
  ai: true,
  context: true,
  deadline: true,
  cloud: true,
  portal: true,
}

export function loadModules(): Record<ModuleKey, boolean> {
  try {
    const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}')
    return { ...DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) }
  } catch {
    return { ...DEFAULT_MODULES }
  }
}

export function saveModules(m: Record<ModuleKey, boolean>) {
  try {
    localStorage.setItem(MODULES_KEY, JSON.stringify(m))
  } catch {
    /* 静默 */
  }
}

// ---- 令牌登记（设置页令牌管理；键 dsh.cau-portal.tokens.v1，兼容旧 githubToken/keyExpiries）----

export type TokenRecord = {
  id: string
  name: string
  usage: string
  value: string
  expires: string
  adminUrl: string
  enabled: boolean
}

const TOKENS_KEY = 'dsh.cau-portal.tokens.v1'

export function loadTokens(): TokenRecord[] {
  try {
    const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null')
    if (Array.isArray(v)) return v.filter((x) => x && typeof x.id === 'string')
  } catch {
    /* fallthrough */
  }
  // 旧版迁移（展示层读取，不主动重写存储）
  const s = loadSettings()
  const legacy: TokenRecord[] = []
  if (s.githubToken)
    legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true })
  if (s.keyExpiries?.bridge)
    legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true })
  if (s.keyExpiries?.push)
    legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true })
  return legacy
}

export function saveTokens(list: TokenRecord[]) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(list))
  } catch {
    /* 静默 */
  }
}

/** 启用的、有值的令牌值集合 */
export function activeTokenValues(): string[] {
  return loadTokens()
    .filter((t) => t.enabled && t.value)
    .map((t) => t.value)
}

// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----

const READ_KEY = 'dsh.cau-portal.read.v1'

export function loadReadSet(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function saveReadSet(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids))
  } catch {
    /* 隐私模式等写入失败时静默 */
  }
}

/** 标记单条已读；返回最新已读集合 */
export function markRead(id: string): string[] {
  const cur = loadReadSet()
  if (!id || cur.includes(id)) return cur
  const next = [...cur, id]
  saveReadSet(next)
  return next
}

/** 批量标记已读；返回最新已读集合 */
export function markAllRead(ids: string[]): string[] {
  const cur = loadReadSet()
  const next = [...cur]
  for (const id of ids) if (id && !next.includes(id)) next.push(id)
  saveReadSet(next)
  return next
}

// ---- 关注列表（localStorage；键 dsh.cau-portal.follow.v1，无上限）----
// 存文章元数据快照，关注视图零请求即可渲染；点击可进原文（article_id 落在已存正文则读，否则开原文链接）

export type FollowItem = {
  id: string
  title: string
  url: string
  time?: string | null
  source?: string
  column?: string
  importance?: string
  summary?: string
}

const FOLLOW_KEY = 'dsh.cau-portal.follow.v1'

export function loadFollow(): FollowItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]')
    return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : []
  } catch {
    return []
  }
}

export function saveFollow(list: FollowItem[]) {
  try {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(list))
  } catch {
    /* 静默 */
  }
}

/** 加入/取消关注；返回最新关注列表 */
export function toggleFollow(item: FollowItem): FollowItem[] {
  const cur = loadFollow()
  const idx = cur.findIndex((x) => x.id === item.id)
  let next: FollowItem[]
  if (idx >= 0) next = [...cur.slice(0, idx), ...cur.slice(idx + 1)]
  else next = [item, ...cur]
  saveFollow(next)
  return next
}

export function isFollowed(id: string): boolean {
  return loadFollow().some((x) => x.id === id)
}

// ---- 关注文章本地缓存（键 dsh.cau-portal.followcache.v1）----
// 云端数据只保留近 N 天（tools/scraper/prune.mjs 裁剪）；关注时把整篇快照存本机，
// 云端裁剪后关注文章仍可完整阅读（文章页显示「本地缓存」徽标），无需云同步。

export type FollowCacheEntry = { cached_at: number; article: any }

const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1'

export function loadFollowCacheAll(): Record<string, FollowCacheEntry> {
  try {
    const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

function saveFollowCacheAll(m: Record<string, FollowCacheEntry>) {
  try {
    localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m))
  } catch {
    /* 静默（配额不足时丢弃缓存，不影响主体功能） */
  }
}

/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
export function cacheFollowArticle(id: string, article: any | null) {
  const m = loadFollowCacheAll()
  if (article) m[id] = { cached_at: Date.now(), article }
  else delete m[id]
  saveFollowCacheAll(m)
}

/** 读单篇关注缓存（无则 null） */
export function readFollowCache(id: string): any | null {
  return loadFollowCacheAll()[id]?.article ?? null
}

/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
export async function backfillFollowCaches(token?: string): Promise<number> {
  const follow = loadFollow()
  const cache = loadFollowCacheAll()
  let got = 0
  for (const f of follow) {
    if (!f?.id || (cache[f.id] && cache[f.id].article)) continue
    const art = await readCloudJson(`data/articles/${f.id}.json`, token)
    if (art) {
      cache[f.id] = { cached_at: Date.now(), article: art }
      got++
    }
    // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
  }
  if (got) saveFollowCacheAll(cache)
  return got
}

// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同

export type DeadlineOp = 'pin' | 'archive' | null

const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1'

export function loadDeadlineOps(): Record<string, DeadlineOp> {
  try {
    const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

function saveDeadlineOps(m: Record<string, DeadlineOp>) {
  try {
    localStorage.setItem(DEADLINE_KEY, JSON.stringify(m))
  } catch {
    /* 静默 */
  }
}

/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
export function setDeadlineOp(id: string, op: DeadlineOp): Record<string, DeadlineOp> {
  const m = loadDeadlineOps()
  if (op == null) delete m[id]
  else m[id] = op
  saveDeadlineOps(m)
  return m
}

// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----

/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
export function readArticle(id: string, token?: string): Promise<any | null> {
  if (!id) return Promise.resolve(null)
  return readArticleMeta(id, token).then((r) => r?.article ?? null)
}

/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
export async function readArticleMeta(id: string, token?: string): Promise<{ article: any; cached: boolean } | null> {
  if (!id) return null
  try {
    const art = await readCloudJson(`data/articles/${id}.json`, token)
    if (art) return { article: art, cached: false }
  } catch {
    /* 网络/解析异常 → 走本地缓存兜底 */
  }
  const cached = readFollowCache(id)
  if (cached) return { article: cached, cached: true }
  return null
}

/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
export function readFeed(site: string, column: string, token?: string): Promise<any | null> {
  if (!site || !column) return Promise.resolve(null)
  return readCloudJson(`data/feed/${site}__${column}.json`, token)
}

// ---- 按需加工 + 本机用量日志（localStorage；键 dsh.cau-portal.usage.v1）----
// 云端 usage.jsonl 记 enrich 管道用量（角色 enrich，读取见 settings.tsx）；
// 本机日志记面板按需加工（角色 on-demand），仅存本机、只留最近 500 条。

export type UsageRecord = {
  ts: string
  role: 'on-demand'
  provider: string
  model: string
  article: string
  prompt_tokens: number
  completion_tokens: number
  cached_tokens: number
}

const USAGE_KEY = 'dsh.cau-portal.usage.v1'

export function loadUsageLog(): UsageRecord[] {
  try {
    const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]')
    return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : []
  } catch {
    return []
  }
}

function saveUsageLog(list: UsageRecord[]) {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)))
  } catch {
    /* 静默 */
  }
}

export function appendUsageLog(rec: UsageRecord) {
  saveUsageLog([...loadUsageLog(), rec])
}

/** 近 N 天用量按角色聚合（兼容两种字段名） */
export function summarizeUsage(rows: { ts: string; role: string; prompt_tokens?: number; completion_tokens?: number; cached_tokens?: number; cost_yuan?: number; inputTokens?: number; outputTokens?: number; cacheReadTokens?: number }[], days = 30) {
  const cutoff = Date.now() - days * 86400e3
  const agg: Record<string, { calls: number; prompt: number; completion: number; cached: number; cost: number }> = {}
  for (const r of rows) {
    const ts = Date.parse(String(r.ts || ''))
    if (!Number.isNaN(ts) && ts < cutoff) continue
    const role = String(r.role || 'other')
    const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 })
    a.calls += 1
    a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0
    a.completion += r.completion_tokens ?? r.outputTokens ?? 0
    a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0
    a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0
  }
  return agg
}

// ---- 设置页：用量按日聚合 + 全局提醒 ----

export type UsageRow = {
  ts: string
  role: string
  prompt?: number
  completion?: number
  cached?: number
  cost?: number
  inputTokens?: number
  outputTokens?: number
  cacheReadTokens?: number
}

/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
export async function loadUsageRows(): Promise<UsageRow[]> {
  const rows: UsageRow[] = []
  try {
    const text = await readCloudText('data/usage.jsonl')
    for (const line of String(text).split('\n')) {
      if (!line.trim()) continue
      try {
        const o = JSON.parse(line)
        rows.push({ ...o, role: o.role || 'enrich' })
      } catch {
        /* 跳过坏行 */
      }
    }
  } catch {
    /* 云端可能不存在 */
  }
  for (const r of loadUsageLog()) rows.push(r)
  return rows
}

const localDay = (v: string | number | Date) => new Date(v).toLocaleDateString('en-CA')

/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
export function buildDailyUsage(rows: UsageRow[], days: number, metric: 'calls' | 'prompt' | 'completion' | 'cost'): { label: string; value: number }[] {
  const map: Record<string, { label: string; calls: number; prompt: number; completion: number; cost: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400e3)
    map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 }
  }
  for (const r of rows) {
    const k = r.ts ? localDay(r.ts) : ''
    const slot = map[k]
    if (!slot) continue
    slot.calls += 1
    slot.prompt += r.prompt ?? r.inputTokens ?? 0
    slot.completion += r.completion ?? r.outputTokens ?? 0
    slot.cost += Number(r.cost ?? r.cost_yuan ?? 0)
  }
  return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }))
}

/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
export function computeAlerts(): { level: 'error' | 'warn'; text: string }[] {
  const out: { level: 'error' | 'warn'; text: string }[] = []
  const mods = loadModules()
  const tokens = loadTokens()
  const hasActiveValue = tokens.some((t) => t.enabled && t.value)
  if (!hasActiveValue) out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' })
  if (!mods.cloud) out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (const t of tokens) {
    if (!t.expires) continue
    const d = Date.parse(t.expires)
    if (!Number.isFinite(d)) continue
    const left = Math.floor((d - Date.now()) / 86400e3)
    if (left < 0) out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` })
    else if (left <= 30) out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` })
  }
  if (!mods.ai) out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' })
  if (!mods.context) out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' })
  if (!mods.deadline) out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' })
  return out
}

/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
export async function enrichArticle(id: string, opts?: { provider?: string; model?: string }): Promise<any> {
  const art = await readArticle(id)
  if (!art) return { ok: false, error: '文章读取失败（正文未入库）' }
  const body = typeof art.body === 'string' ? art.body : ''
  if (!body) return { ok: false, error: '文章正文为空，无法加工' }
  let data: any = null
  try {
    const res = await fetch('/api/cau/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: art.title,
        content: body.slice(0, 6000),
        time: art.time || art.published || '',
        source: art.source || art.site_name || '',
        provider: opts?.provider,
        model: opts?.model,
      }),
    })
    data = await res.json()
  } catch (error: any) {
    return { ok: false, error: String(error?.message || error) }
  }
  if (data?.ok && data.tokens) {
    appendUsageLog({
      ts: new Date().toISOString(),
      role: 'on-demand',
      provider: data.provider || opts?.provider || '',
      model: data.model || opts?.model || '',
      article: id,
      prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
      completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
      cached_tokens: data.tokens.cacheReadTokens ?? 0,
    })
  }
  return data
}
