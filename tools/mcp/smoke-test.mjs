/** Portable MCP smoke test. Temporary fixtures only; no DSH profile or network required. */
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
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
const pending = new Map()
const decoder = new StringDecoder('utf8')
let child
let exited
let buffer = ''
let nextId = 0

async function json(rel, value) {
  const file = path.join(fixture, rel)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(value) + '\n')
}
function failPending(error) {
  for (const waiter of pending.values()) { clearTimeout(waiter.timer); waiter.reject(error) }
  pending.clear()
}
function receive(chunk) {
  buffer += decoder.write(chunk)
  let end
  while ((end = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, end).trim(); buffer = buffer.slice(end + 1)
    if (!line) continue
    let msg
    try { msg = JSON.parse(line) } catch {
      failPending(new Error('Non-JSON stdout violates the MCP stdio protocol')); return
    }
    const waiter = pending.get(msg.id)
    if (!waiter) continue
    clearTimeout(waiter.timer); pending.delete(msg.id)
    if (msg.error) waiter.reject(new Error(`JSON-RPC error for request ${msg.id}`))
    else waiter.resolve(msg.result)
  }
}
function request(method, params) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id); reject(new Error(`Timed out: ${method}`))
    }, 15_000)
    pending.set(id, { resolve, reject, timer })
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
  })
}
async function call(name, args) {
  const result = await request('tools/call', { name, arguments: args })
  assert.ok(!result.isError, `${name} returned a tool error`)
  const text = result.content.find((part) => part.type === 'text')?.text
  assert.equal(typeof text, 'string', `${name} has no text result`)
  const data = JSON.parse(text)
  assert.ok(!data.error, `${name} returned an application error`)
  return data
}
try {
  await json('index.json', { version: 1, sites: [{ id: 'clst', name: 'CI site', columns: [] }] })
  await json('feed/ci.json', {
    site: 'clst', site_name: 'CI site', column_key: 'notice', column_name: 'CI notices',
    items: [{ url: originalUrl, title: 'CI notice', date: today, article: `${id}.json` }],
  })
  await json(`articles/${id}.json`, { title: 'CI notice', url: originalUrl, body: 'Fixture body', source: 'CI site' })
  await json('summary.json', {
    deadlines: [{ title: 'CI notice', source: 'CI site', url: originalUrl, item: 'CI task', date: today, article_id: id }],
    ai_map: {},
  })
  await writeFile(path.join(fixture, 'usage.jsonl'), JSON.stringify({ ts: new Date().toISOString(), cost_yuan: 0, prompt_tokens: 1, completion_tokens: 1 }) + '\n')

  // An allowlist prevents inherited credentials, overrides, or legacy profiles affecting this test.
  const env = {}
  for (const key of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'COMSPEC', 'TEMP', 'TMP']) {
    if (process.env[key]) env[key] = process.env[key]
  }
  Object.assign(env, { CAU_DATA_DIR: fixture, DSH_HOME: path.join(fixture, 'dsh'),
    CAU_PORTAL_STORE: path.join(fixture, 'store'), HOME: fixture, USERPROFILE: fixture })
  child = spawn(process.execPath, [entry], { cwd: path.dirname(entry), env, stdio: ['pipe', 'pipe', 'pipe'] })
  exited = once(child, 'close').catch(() => [])
  child.stdout.on('data', receive)
  // Drain stderr but do not echo logs that might contain credentials from a regression.
  child.stderr.resume()
  child.stdin.on('error', failPending)
  child.on('error', failPending)
  child.on('close', () => failPending(new Error('MCP closed before replying')))

  const init = await request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'ci-smoke', version: '1' } })
  assert.equal(init.serverInfo.name, 'cau-portal')
  assert.ok(init.serverInfo.version)
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')
  const tools = await request('tools/list', {})
  const names = ['list_sites', 'list_latest', 'search_news', 'get_article', 'list_deadlines', 'get_usage']
  assert.deepEqual(tools.tools.map((tool) => tool.name).sort(), [...names].sort())
  const sites = await call('list_sites', {})
  assert.ok(sites.data_source.startsWith('local:'), 'Fixture must use explicit local mode')
  assert.equal(sites.sites[0].id, 'clst')
  const latest = await call('list_latest', { limit: 5 })
  assert.equal(latest.count, 1); assert.equal(latest.items[0].url, originalUrl)
  const search = await call('search_news', { query: 'CI notice' })
  assert.equal(search.count, 1); assert.equal(search.items[0].title, 'CI notice')
  const article = await call('get_article', { id_or_url: id })
  assert.equal(article.found, true); assert.equal(article.stored, true); assert.equal(article.body, 'Fixture body')
  const deadlines = await call('list_deadlines', { days: 30 })
  assert.equal(deadlines.count, 1); assert.equal(deadlines.items[0].deadline.item, 'CI task')
  const usage = await call('get_usage', { days: 30 })
  assert.equal(usage.calls, 1); assert.equal(usage.prompt_tokens, 1)
  console.log(`MCP smoke passed: initialize + exactly six tools + successful fixture results (${init.serverInfo.version})`)
} finally {
  failPending(new Error('Smoke test finished'))
  if (child) {
    child.stdin.destroy()
    if (child.exitCode === null && child.signalCode === null) child.kill()
    await exited
  }
  await rm(fixture, { recursive: true, force: true })
}
