/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */

export type SettingsV1 = {
  /** 只读细粒度 PAT（Contents: Read，仅本机 localStorage） */
  githubToken?: string
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
