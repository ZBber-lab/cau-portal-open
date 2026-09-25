/**
 * 本机令牌共享存储（**单一事实源**）。
 *
 * 背景（2026-09-20 用户指出）：令牌原来有两份独立副本 —— 面板设置存浏览器 localStorage，
 * MCP / 工具脚本读 profile 的 `cordis.patch.yml`。在设置里改一处，另一处不会变，
 * 「设置」就名不副实。现在统一为：
 *
 *   面板设置页（唯一入口） --PUT /api/cau/token-->  <profile>\cau-portal-store\token.json
 *                                                        ↑ 现读（每次调用）
 *   MCP 服务器 / portal sync / email report  ────────────┘
 *
 * 读取优先级：环境变量 `CAU_GITHUB_TOKEN`（可选覆盖，便于 CI/临时切换）
 *          → 共享存储 `token.json`
 *          → 旧的 profile `cordis.patch.yml`（一次性兼容，兼容期后删）
 *
 * 文件格式：{ "version": 1, "githubToken": "github_pat_…", "updatedAt": "ISO" }
 * ⚠️ 插件服务端 `src/index.ts` 的 `/api/cau/token` 路由里有一份等价的写入实现
 *    （服务端是单文件 TS 转译产物，不 import 本模块），**改格式时两边一起改**。
 */
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * profile 优先级：desktop 优先、web 次之（桌面版与 CLI 各自独占一个 profile，凭据在谁那儿就用谁；
 * 只装了其中一个时行为不变）。
 */
const PROFILE_ORDER = ['desktop', 'web']

function home() {
  return process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\1'
}

/**
 * DSH 主目录：**优先 `DSH_HOME`**（数据目录可以整体搬到别的盘；不认它的话，搬完之后
 * 令牌与门户会话会静默"失踪"），未设置时回落 `~/.dsh`。
 */
export function dshHome() {
  const h = String(process.env.DSH_HOME || '').trim()
  return h || join(home(), '.dsh')
}

/** 所有 profile 的根目录 */
export function profilesRoot() {
  return join(dshHome(), 'profiles')
}

/** 首选 profile 名（desktop 优先，其次 web） */
export function preferredProfile() {
  const root = profilesRoot()
  for (const name of PROFILE_ORDER) {
    if (existsSync(join(root, name))) return name
  }
  return PROFILE_ORDER[0]
}

/** 候选的存储目录（环境变量优先，其次按 profile 优先级找 cau-portal-store） */
export function storeDirs() {
  const out = []
  if (process.env.CAU_PORTAL_STORE) out.push(process.env.CAU_PORTAL_STORE)
  const root = profilesRoot()
  for (const hint of PROFILE_ORDER) {
    const dir = join(root, hint, 'cau-portal-store')
    if (existsSync(dir)) out.push(dir)
  }
  try {
    for (const name of readdirSync(root)) {
      if (name === 'node_modules') continue
      const dir = join(root, name, 'cau-portal-store')
      if (!out.includes(dir) && existsSync(dir)) out.push(dir)
    }
  } catch {
    /* 没装 DSH 就走不到这里 */
  }
  return out
}

/** 首选写入目录：已存在的存储目录，否则在 profile 下新建 */
export function primaryStoreDir() {
  const dirs = storeDirs()
  if (dirs.length) return dirs[0]
  const dir = join(profilesRoot(), preferredProfile(), 'cau-portal-store')
  try {
    mkdirSync(dir, { recursive: true })
  } catch {
    /* 只读环境：调用方会拿到 null */
  }
  return dir
}

/** 从共享存储读令牌（没有则 null） */
export function readStoreToken() {
  for (const dir of storeDirs()) {
    try {
      const raw = readFileSync(join(dir, 'token.json'), 'utf8')
      const j = JSON.parse(raw)
      const t = String(j?.githubToken || '').trim()
      if (t) return t
    } catch {
      /* 换下一个候选 */
    }
  }
  return null
}

/** 旧位置：profile 补丁层里的 CAU_GITHUB_TOKEN（兼容期用，之后删除本函数） */
export function readLegacyYmlToken() {
  const root = profilesRoot()
  const candidates = [join(root, preferredProfile(), 'cordis.patch.yml')]
  try {
    for (const name of readdirSync(root)) {
      const p = join(root, name, 'cordis.patch.yml')
      if (!candidates.includes(p)) candidates.push(p)
    }
  } catch {
    /* noop */
  }
  for (const p of candidates) {
    try {
      const m = readFileSync(p, 'utf8').match(/CAU_GITHUB_TOKEN:\s*(\S+)/)
      if (m && m[1] && /^github_pat_|^ghp_/.test(m[1])) return m[1]
    } catch {
      /* 继续 */
    }
  }
  return null
}

/**
 * 解析出实际要用的 GitHub 令牌。
 * @returns {string|null} 令牌，或 null（未配置）
 */
export function resolveGithubToken() {
  const env = String(process.env.CAU_GITHUB_TOKEN || '').trim()
  if (env) return env
  return readStoreToken() || readLegacyYmlToken()
}

/** 令牌是否已配置（不返回明文） */
export function hasGithubToken() {
  return !!resolveGithubToken()
}

/** 掩码显示，用于日志/状态（绝不打印完整值） */
export function maskToken(t) {
  const s = String(t || '')
  if (!s) return '(未配置)'
  return s.slice(0, 18) + '…' + s.slice(-4) + ` (长度 ${s.length})`
}

/** 写入共享存储（脚本侧一般不用；面板走 /api/cau/token 路由）。返回写入路径 */
export function writeStoreToken(token) {
  const dir = primaryStoreDir()
  if (!dir) throw new Error('找不到可写的存储目录')
  const p = join(dir, 'token.json')
  writeFileSync(p, JSON.stringify({ version: 1, githubToken: String(token || ''), updatedAt: new Date().toISOString() }, null, 2) + '\n', 'utf8')
  return p
}
