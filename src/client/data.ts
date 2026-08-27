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
  const t = token || loadSettings().githubToken
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

/** 读取单篇文章（data/articles/<id>.json）；失败返回 null */
export function readArticle(id: string, token?: string): Promise<any | null> {
  if (!id) return Promise.resolve(null)
  return readCloudJson(`data/articles/${id}.json`, token)
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
