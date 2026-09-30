/**
 * Portable MCP smoke test. Temporary fixtures only; no DSH profile, no network, no real credentials.
 *
 * 覆盖两类东西：
 *   ① 协议与主链路：initialize / 恰好六个工具 / 本地夹具数据下六条调用都成功
 *   ② **边界契约（v0.5.5 起）**：本地模式要带 mode+hint；"配了数据仓却没令牌"必须**报错**而不是
 *      静默读本机 `data/`；仓库名归一化三种写法（完整链接 / 末尾斜杠 / 无协议 + `.git`）都要落到
 *      同一个 `owner/repo`；`branch≠main` 要按 `main` 处理并 warn。
 *      ②里的归一化与分支判定**只读启动日志**（`mcp-start.log`）判断，所以不需要网络、不需要真令牌。
 */
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { StringDecoder } from 'node:string_decoder'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const entry = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'tools/mcp/index.mjs')
const fixture = await mkdtemp(path.join(tmpdir(), 'cau-mcp-ci-'))
const id = 'a'.repeat(40)
const today = new Date().toISOString().slice(0, 10)
const originalUrl = 'https://clst.cau.edu.cn/ci/article.html'
const siteName = 'CI site'
/** 目标数据仓与一枚**明显的假令牌**（不能长得像真凭据：公开仓 CI 会扫 `github_pat_` + 40 位以上） */
const TARGET_REPO = 'smoke-owner/smoke-data'
const FAKE_TOKEN = 'github_pat_smoke_fixture_only'

/** 只有场景之间的差异会传进来；其余环境一律用白名单，避免继承来的凭据/配置影响结论 */
function baseEnv() {
  const env = {}
  for (const key of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'COMSPEC', 'TEMP', 'TMP']) {
    if (process.env[key]) env[key] = process.env[key]
  }
  return env
}

/** 起一个 MCP 子进程 + 一套隔离的 data/store 目录 */
async function startMcp({ name, store = null, token = '', seed = true }) {
  const dir = path.join(fixture, name)
  const dataDir = path.join(dir, 'data')
  const storeDir = path.join(dir, 'store')
  await mkdir(dataDir, { recursive: true })
  await mkdir(storeDir, { recursive: true })
  if (store) {
    await writeFile(path.join(storeDir, 'config.json'), JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), ...store }, null, 2) + '\n')
  }
  if (seed) {
    await writeJson(dataDir, 'index.json', { version: 1, sites: [{ id: 'clst', name: siteName, columns: [] }] })
    await writeJson(dataDir, 'feed/ci.json', {
      site: 'clst', site_name: siteName, column_key: 'notice', column_name: 'CI notices',
      items: [{ url: originalUrl, title: 'CI notice', date: today, article: `${id}.json` }],
    })
    await writeJson(dataDir, `articles/${id}.json`, { title: 'CI notice', url: originalUrl, body: 'Fixture body', source: siteName })
    await writeJson(dataDir, 'summary.json', {
      deadlines: [{ title: 'CI notice', source: siteName, url: originalUrl, item: 'CI task', date: today, article_id: id }],
      ai_map: {},
    })
    await writeFile(path.join(dataDir, 'usage.jsonl'), JSON.stringify({ ts: new Date().toISOString(), cost_yuan: 0, prompt_tokens: 1, completion_tokens: 1 }) + '\n')
  }

  const env = baseEnv()
  Object.assign(env, {
    CAU_DATA_DIR: dataDir, DSH_HOME: path.join(dir, 'dsh'), CAU_PORTAL_STORE: storeDir, HOME: dir, USERPROFILE: dir,
  })
  if (token) env.CAU_GITHUB_TOKEN = token

  const child = spawn(process.execPath, [entry], { cwd: path.dirname(entry), env, stdio: ['pipe', 'pipe', 'pipe'] })
  const session = {
    child, dir, dataDir, storeDir, stderr: '', buffer: '', pending: new Map(), nextId: 0,
    exited: once(child, 'close').catch(() => []),
  }
  const decoder = new StringDecoder('utf8')
  child.stdout.on('data', (chunk) => {
    session.buffer += decoder.write(chunk)
    let end
    while ((end = session.buffer.indexOf('\n')) >= 0) {
      const line = session.buffer.slice(0, end).trim()
      session.buffer = session.buffer.slice(end + 1)
      if (!line) continue
      let msg
      try {
        msg = JSON.parse(line)
      } catch {
        failPending(session, new Error('Non-JSON stdout violates the MCP stdio protocol'))
        continue
      }
      const waiter = session.pending.get(msg.id)
      if (!waiter) continue
      clearTimeout(waiter.timer)
      session.pending.delete(msg.id)
      if (msg.error) waiter.reject(new Error(`JSON-RPC error for request ${msg.id}`))
      else waiter.resolve(msg.result)
    }
  })
  // Drain stderr but never echo it: a regression could print credentials we must not surface.
  child.stderr.on('data', (chunk) => { session.stderr = (session.stderr + chunk.toString('utf8')).slice(-8192) })
  child.stdin.on('error', (error) => failPending(session, error))
  child.on('error', (error) => failPending(session, error))
  child.on('close', () => failPending(session, new Error('MCP closed before replying')))
  return session
}

async function writeJson(dir, rel, value) {
  const file = path.join(dir, rel)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(value) + '\n')
}

function failPending(session, error) {
  for (const waiter of session.pending.values()) {
    clearTimeout(waiter.timer)
    waiter.reject(error)
  }
  session.pending.clear()
}

function request(session, method, params) {
  const id = ++session.nextId
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      session.pending.delete(id)
      reject(new Error(`Timed out: ${method}`))
    }, 15_000)
    session.pending.set(id, { resolve, reject, timer })
    session.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
  })
}

async function initialize(session) {
  const init = await request(session, 'initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'ci-smoke', version: '1' } })
  assert.equal(init.serverInfo.name, 'cau-portal')
  assert.ok(init.serverInfo.version)
  session.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')
  return init
}

/** 调工具并返回原始结果（**不断言成功**，边界场景要断言失败） */
async function rawCall(session, name, args) {
  const result = await request(session, 'tools/call', { name, arguments: args })
  const text = result.content.find((part) => part.type === 'text')?.text
  assert.equal(typeof text, 'string', `${name} has no text result`)
  return { isError: !!result.isError, text }
}

/** 调工具并断言成功、返回解析后的数据 */
async function call(session, name, args) {
  const { isError, text } = await rawCall(session, name, args)
  assert.ok(!isError, `${name} returned a tool error`)
  const data = JSON.parse(text)
  assert.ok(!data.error, `${name} returned an application error`)
  return data
}

async function stop(session) {
  failPending(session, new Error('Smoke test finished'))
  try {
    session.child.stdin.destroy()
  } catch {
    /* 已经关了 */
  }
  if (session.child.exitCode === null && session.child.signalCode === null) session.child.kill()
  await session.exited
}

/** 等启动日志出现（进程启动时写；不依赖网络与工具调用） */
async function readStartLog(session, timeoutMs = 10_000) {
  const file = path.join(session.dataDir, 'mcp-start.log')
  const deadline = Date.now() + timeoutMs
  for (;;) {
    try {
      const text = await readFile(file, 'utf8')
      if (text.trim()) return text
    } catch {
      /* 还没写 */
    }
    if (Date.now() > deadline) throw new Error(`mcp-start.log 未在 ${timeoutMs}ms 内出现`)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

const sessions = []
try {
  // ---------- ① 协议 + 本地夹具主链路 ----------
  const local = await startMcp({ name: 'local' })
  sessions.push(local)
  const init = await initialize(local)
  const tools = await request(local, 'tools/list', {})
  const names = ['list_sites', 'list_latest', 'search_news', 'get_article', 'list_deadlines', 'get_usage']
  assert.deepEqual(tools.tools.map((tool) => tool.name).sort(), [...names].sort())

  const sites = await call(local, 'list_sites', {})
  assert.ok(sites.data_source.startsWith('local:'), 'Fixture must use explicit local mode')
  assert.equal(sites.mode, 'local', '本地模式必须显式标出 mode=local')
  assert.match(String(sites.hint || ''), /本机离线模式/, '本地模式必须带显眼 hint（说明读的是本机目录、可能是旧的）')
  assert.equal(sites.sites[0].id, 'clst')
  const latest = await call(local, 'list_latest', { limit: 5 })
  assert.equal(latest.count, 1)
  assert.equal(latest.items[0].url, originalUrl)
  const search = await call(local, 'search_news', { query: 'CI notice' })
  assert.equal(search.count, 1)
  assert.equal(search.items[0].title, 'CI notice')
  const article = await call(local, 'get_article', { id_or_url: id })
  assert.equal(article.found, true)
  assert.equal(article.stored, true)
  assert.equal(article.body, 'Fixture body')
  const deadlines = await call(local, 'list_deadlines', { days: 30 })
  assert.equal(deadlines.count, 1)
  assert.equal(deadlines.items[0].deadline.item, 'CI task')
  const usage = await call(local, 'get_usage', { days: 30 })
  assert.equal(usage.calls, 1)
  assert.equal(usage.prompt_tokens, 1)
  await stop(local)
  sessions.pop()

  // ---------- ② 配了数据仓却没令牌 → 必须报错，绝不静默读本机 data/ ----------
  const noToken = await startMcp({ name: 'configured-no-token', store: { dataRepo: TARGET_REPO, branch: 'main' } })
  sessions.push(noToken)
  await initialize(noToken)
  for (const tool of ['list_sites', 'list_latest']) {
    const { isError, text } = await rawCall(noToken, tool, {})
    assert.ok(isError, `${tool}: 配了数据仓却没令牌时必须报错`)
    assert.match(text, /已配置数据仓库 smoke-owner\/smoke-data/, `${tool}: 报错要写清配的是哪个仓`)
    assert.match(text, /令牌/, `${tool}: 报错要给出"登记令牌"这条出路`)
  }
  const blocked = await rawCall(noToken, 'list_sites', {})
  assert.ok(!blocked.text.includes(siteName), '配了数据仓却没令牌时**不得**返回本机 data/ 的内容')
  await stop(noToken)
  sessions.pop()

  // ---------- ③ 仓库名归一化：三种写法都要落到同一个 owner/repo（只读启动日志，不需要网络） ----------
  const forms = ['https://github.com/smoke-owner/smoke-data.git/', 'https://github.com/smoke-owner/smoke-data/', 'github.com/smoke-owner/smoke-data.git']
  for (const [index, form] of forms.entries()) {
    const probe = await startMcp({ name: `normalize-${index}`, store: { dataRepo: form, branch: 'main' }, token: FAKE_TOKEN, seed: false })
    sessions.push(probe)
    const log = await readStartLog(probe)
    assert.match(log, new RegExp(`mode=github:${TARGET_REPO.replace('/', '\\/')}@main`), `归一化 ${form} 应落到 ${TARGET_REPO}@main（日志：${log.trim()}）`)
    assert.ok(!log.includes('.git'), `归一化 ${form} 不得残留 .git`)
    await stop(probe)
    sessions.pop()
  }

  // ---------- ④ branch≠main → 按 main 处理并 warn ----------
  const branchProbe = await startMcp({ name: 'branch-dev', store: { dataRepo: TARGET_REPO, branch: 'dev' }, token: FAKE_TOKEN, seed: false })
  sessions.push(branchProbe)
  const branchLog = await readStartLog(branchProbe)
  assert.match(branchLog, /@main/, 'branch=dev 时 MCP 必须按 main 处理')
  assert.ok(!/@dev/.test(branchLog), 'branch=dev 不得出现在生效口径里')
  assert.match(branchProbe.stderr, /忽略 config\.json 里的 branch=dev/, '忽略非 main 分支时要打 warn')
  await stop(branchProbe)
  sessions.pop()

  console.log(
    `MCP smoke passed: initialize + exactly six tools + local fixture results + boundary rules ` +
      `(mode/hint, configured-without-token error, repo normalization ×3, branch≠main) (${init.serverInfo.version})`,
  )
} finally {
  for (const session of sessions) await stop(session)
  await rm(fixture, { recursive: true, force: true })
}
