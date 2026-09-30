/**
 * 客户端行为夹具（**永久文件**：公开仓 CI 会跑；本地 `node tools/client-fixtures.cjs` 同样能跑，不需要管道/spawn）。
 *
 * 做法：读构建产物 `lib/client.js`，把每个内联模块 IIFE 收尾前的 `module.exports` 捕获出来，
 * 再配一套**最小 React 运行时**（useState/useEffect/useRef/useMemo/useSyncExternalStore + jsx/jsxs/Component）
 * **真的渲染**设置页与面板组件树、驱动 onChange/防抖定时器/延迟 promise。
 * 因此测的是**构建产物里真实的组件代码**，不是重写一份业务逻辑来测。
 *
 * 覆盖（key 用于变异测试定位）：
 *   A  仓库名归一化（`dataRepo()`）
 *   B1 面板同步失败必须显示（400/500/404 三态）   B2 成功要显示"已同步"   B3 回读不覆盖用户输入（含正向对照）
 *   B4 首屏门：本机配置在途时只显示占位、不放子视图发请求
 *   C1 【交错】配置已读完但**云端请求一直 pending** → 首页必须已放行（Codex 2026-09-30 复审 #3a）
 *   C2 【交错】父组件 `adoptServerDataRepo()` 在途时用户输入仓名 → 不得被旧快照覆盖（复审 #3b）
 *   C3 【交错】两次 PUT 响应乱序（新的先回、旧的后回）→ 只认最新代次（复审 #3c）
 *   M1/M2/M3 **反向验证（变异测试）**：把上面三处修复改回旧写法，对应 C 断言必须变红 —— 证明它们不是"假绿"。
 *
 * 退出码：0＝全绿且变异测试全部按预期变红；非 0＝有失败。
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const BUNDLE = path.join(ROOT, 'lib', 'client.js')
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1'
const END = 'return module.exports; })();'

// ---------------------------------------------------------------- 浏览器环境桩
const store = new Map()
const timers = new Map()
let timerSeq = 0
let fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }), text: async () => '' })
const fetchCalls = []

function setFetch(fn) {
  fetchImpl = fn
  fetchCalls.length = 0
}
/** 每个场景开局都清干净：localStorage、未执行的定时器、fetch 记录（否则上个场景的防抖定时器会漏进来） */
function resetEnv() {
  store.clear()
  timers.clear()
  fetchCalls.length = 0
}
function flushTimers() {
  for (const [id, fn] of [...timers]) {
    timers.delete(id)
    try {
      fn()
    } catch (e) {
      results.push({ key: 'timer', pass: false, msg: `定时器回调抛错：${e && e.message}` })
    }
  }
}
const settle = async (rounds = 15) => {
  for (let i = 0; i < rounds; i++) await new Promise((r) => setImmediate(r))
}
/** 一个永不 settle 的 promise（模拟"请求一直 pending"） */
const forever = () => new Promise(() => {})

const localStorageStub = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  key: (i) => [...store.keys()][i] || null,
  get length() {
    return store.size
  },
}
const styleStub = { setAttribute() {}, remove() {}, appendChild() {}, style: {} }
const documentStub = {
  createElement: () => styleStub,
  head: { appendChild() {} },
  body: { classList: { toggle() {}, remove() {}, add() {} }, appendChild() {} },
  addEventListener() {},
  removeEventListener() {},
}
const windowStub = {
  document: documentStub,
  localStorage: localStorageStub,
  addEventListener() {},
  removeEventListener() {},
  setInterval: () => 0,
  clearInterval() {},
}
globalThis.window = windowStub
globalThis.document = documentStub
globalThis.localStorage = localStorageStub
globalThis.fetch = (url, opts) => {
  fetchCalls.push({ url, opts })
  return fetchImpl(url, opts)
}
globalThis.setTimeout = (fn) => {
  const id = ++timerSeq
  timers.set(id, fn)
  return id
}
globalThis.clearTimeout = (id) => {
  timers.delete(id)
}
globalThis.setInterval = () => 0
globalThis.clearInterval = () => {}

// ---------------------------------------------------------------- 最小 React 运行时
// 每个场景一份独立 hook 存储：上一个场景挂起的 promise 续体会调用它自己的 setter，
// 共用一份 state 会把后面的渲染搞乱（实测过：hook 槽被写到 26、组件读到错的 state）。
let rt = { hook: 0, state: [], refs: [], effects: [] }
const newRuntime = () => {
  rt = { hook: 0, state: [], refs: [], effects: [] }
  return rt
}
const reactStub = {
  Fragment: { $$fragment: true },
  Component: class Component {
    constructor(p) {
      this.props = p || {}
      this.state = {}
    }
    setState() {}
    render() {
      return null
    }
  },
  PureComponent: class PureComponent {
    constructor(p) {
      this.props = p || {}
      this.state = {}
    }
    setState() {}
    render() {
      return null
    }
  },
  createElement: (t, p, ...c) => ({ type: t, props: { ...(p || {}), ...(c.length ? { children: c.length === 1 ? c[0] : c } : {}) } }),
  useState(init) {
    const i = rt.hook++
    if (!(i in rt.state)) rt.state[i] = typeof init === 'function' ? init() : init
    return [
      rt.state[i],
      (v) => {
        rt.state[i] = typeof v === 'function' ? v(rt.state[i]) : v
      },
    ]
  },
  useRef(init) {
    const i = rt.hook++
    if (!(i in rt.refs)) rt.refs[i] = { current: init }
    return rt.refs[i]
  },
  useMemo(fn) {
    rt.hook++
    return fn()
  },
  useEffect(fn) {
    rt.effects.push(fn)
  },
  useSyncExternalStore(_sub, snap) {
    rt.hook++
    return typeof snap === 'function' ? snap() : undefined
  },
}
const jsx = (t, p) => ({ type: t, props: p || {} })
const requireStub = (id) => {
  if (id === 'react') return reactStub
  if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: reactStub.Fragment }
  throw new Error('unexpected external require: ' + id)
}

// ---------------------------------------------------------------- 加载 bundle / 变异体
function loadPlugin(srcText) {
  const patched = srcText.split(END).join('globalThis.__CAU_CAPTURE__.push(module.exports); ' + END)
  globalThis.__CAU_CAPTURE__ = []
  let captured = null
  windowStub.__ModuleLoader__ = { load: (o) => { captured = o } }
  eval(patched) // eslint-disable-line no-eval
  const mod = captured.factory(requireStub)
  return { mod, modules: globalThis.__CAU_CAPTURE__ }
}
function parts(plugin) {
  return {
    settings: plugin.modules.find((m) => m && typeof m.CauSettings === 'function'),
    data: plugin.modules.find((m) => m && typeof m.dataRepo === 'function' && typeof m.loadSettings === 'function'),
    panel: plugin.modules.find((m) => m && typeof m.CauPanel === 'function'),
  }
}

// ---------------------------------------------------------------- 元素树工具
function find(node, pred, out = []) {
  if (node == null) return out
  if (Array.isArray(node)) {
    for (const x of node) find(x, pred, out)
    return out
  }
  if (typeof node !== 'object') return out
  if (pred(node)) out.push(node)
  find(node.props && node.props.children, pred, out)
  return out
}
function allText(node, out = []) {
  if (node == null) return out
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    for (const x of node) allText(x, out)
    return out
  }
  if (typeof node === 'object') allText(node.props && node.props.children, out)
  return out
}
const repoInput = (tree) => find(tree, (el) => el.props && el.props.id === 'cauDataRepo')[0]
const treeText = (tree) => allText(tree).join(' | ')
const hasType = (tree, name) => find(tree, (el) => typeof el.type === 'function' && el.type.name === name).length > 0

// ---------------------------------------------------------------- 断言收集
const results = []
const ok = (key, cond, msg) => {
  results.push({ key, pass: !!cond, msg })
  return !!cond
}

// ---------------------------------------------------------------- 场景
function scenarioA(p) {
  const forms = [
    ['https://github.com/ZBber-lab/cau-portal.git/', 'ZBber-lab/cau-portal'],
    ['https://github.com/ZBber-lab/cau-portal/', 'ZBber-lab/cau-portal'],
    ['github.com/ZBber-lab/cau-portal.git', 'ZBber-lab/cau-portal'],
    ['  ZBber-lab/cau-portal  ', 'ZBber-lab/cau-portal'],
    ['not a repo', ''],
    ['', ''],
  ]
  for (const [input, want] of forms) {
    store.clear()
    localStorageStub.setItem(SETTINGS_KEY, JSON.stringify({ dataRepo: input }))
    const got = p.data.dataRepo()
    ok('A', got === want, `dataRepo(${JSON.stringify(input)}) → ${JSON.stringify(got)}（期望 ${JSON.stringify(want)}）`)
  }
}

/** B1/B2：PUT 的 400/500/404/200 四态，面板必须分别显示 */
async function scenarioBPut(plugin) {
  const { settings } = parts(plugin)
  const cases = [
    [400, { ok: false, error: '数据仓库格式不认识（应为 owner/repo，可粘贴完整 GitHub 链接）' }, /格式不认识/, 'B1'],
    [500, { ok: false, error: 'EACCES: permission denied' }, /EACCES/, 'B1'],
    [404, {}, /本机配置路由不可用/, 'B1'],
    [200, { ok: true, configured: true, dataRepo: 'owner/typed-repo' }, /已同步到本机共享存储（owner\/typed-repo）/, 'B2'],
  ]
  for (const [status, body, want, key] of cases) {
    resetEnv()
    localStorageStub.setItem(SETTINGS_KEY, JSON.stringify({ dataRepo: 'seed/repo' }))
    setFetch(async (url, opts) => {
      if (String(url).includes('/api/cau/config') && opts && opts.method === 'PUT') {
        return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) }
      }
      return { ok: true, status: 200, json: async () => ({ ok: true, sites: [] }), text: async () => '' }
    })
    newRuntime()
    let tree = openCloudPage(settings)
    const input = repoInput(tree)
    if (!input) {
      ok(key, false, '设置页里没有数据仓输入框（id=cauDataRepo）')
      continue
    }
    input.props.onChange({ target: { value: 'owner/typed-repo' } })
    flushTimers()
    await settle()
    tree = renderSettings(settings)
    const text = treeText(tree)
    const puts = fetchCalls.filter((c) => c.opts && c.opts.method === 'PUT').length
    ok(key, puts === 1, `PUT ${status}：应发出 1 次 PUT（实际 ${puts}）`)
    ok(key, want.test(text), `PUT ${status}：面板显示（实际文本片段：${text.slice(-200)}）`)
    if (key === 'B1') ok(key, !/已同步到本机共享存储/.test(text), `PUT ${status}：失败后不得仍宣称"已同步"`)
  }
}

/** B3：设置页回读在途时用户输入 → 不得被覆盖；本地为空时又要能回填 */
async function scenarioBBackfill(plugin) {
  const { settings } = parts(plugin)
  // 负例：在途时用户输入
resetEnv()
  let resolveGet = null
  const gate = new Promise((r) => {
    resolveGet = r
  })
  setFetch(async (url, opts) => {
    if (String(url).includes('/api/cau/config') && (!opts || !opts.method)) {
      await gate
      return { ok: true, status: 200, json: async () => ({ ok: true, configured: true, dataRepo: 'server/other-repo', branch: 'main' }), text: async () => '{}' }
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, sites: [] }), text: async () => '' }
  })
  newRuntime()
  let tree = openCloudPage(settings)
  ok('B3', String(repoInput(tree).props.value || '') === '', `打开时本地为空（实际 ${JSON.stringify(repoInput(tree).props.value)}）`)
  repoInput(tree).props.onChange({ target: { value: 'user/typed-repo' } })
  resolveGet()
  await settle()
  tree = renderSettings(settings)
  const after = repoInput(tree).props.value
  const local = JSON.parse(localStorageStub.getItem(SETTINGS_KEY) || '{}').dataRepo
  ok('B3', after === 'user/typed-repo', `在途 GET 返回后输入框仍是用户输入（实际 ${JSON.stringify(after)}）`)
  ok('B3', local === 'user/typed-repo', `localStorage 不得被服务端值覆盖（实际 ${JSON.stringify(local)}）`)

  // 正例：本地为空时应当回填（别把功能修没）
resetEnv()
  setFetch(async (url, opts) => {
    if (String(url).includes('/api/cau/config') && (!opts || !opts.method)) {
      return { ok: true, status: 200, json: async () => ({ ok: true, configured: true, dataRepo: 'server/other-repo', branch: 'main' }), text: async () => '{}' }
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, sites: [] }), text: async () => '' }
  })
  newRuntime()
  tree = openCloudPage(settings)
  await settle()
  tree = renderSettings(settings)
  const filled = repoInput(tree).props.value
  ok('B3', filled === 'server/other-repo', `本地为空时应回填（实际 ${JSON.stringify(filled)}）`)
}

/** B4：首屏门 —— 本机配置在途时只显示占位、不放子视图发请求 */
async function scenarioBGate(plugin) {
  const { panel } = parts(plugin)
resetEnv()
  let resolveCfg = null
  const gate = new Promise((r) => {
    resolveCfg = r
  })
  setFetch(async (url) => {
    const u = String(url)
    if (u.includes('/api/cau/config')) {
      await gate
      return { ok: true, status: 200, json: async () => ({ ok: true, configured: true, dataRepo: 'server/other-repo', branch: 'main' }), text: async () => '{}' }
    }
    if (u.includes('/api/cau/token')) return { ok: true, status: 200, json: async () => ({ ok: false, configured: false }), text: async () => '{}' }
    if (u.includes('/api/cau/state')) return { ok: true, status: 200, json: async () => ({ ok: false }), text: async () => '{}' }
    return { ok: true, status: 200, json: async () => ({ ok: true }), text: async () => '' }
  })
  newRuntime()
  let tree = renderPanel(panel)
  runEffects() // 必须真的跑 mount effect，否则 adopted 永远不会被置位（会把"没跑"误判成"卡住"）
  ok('B4', /正在读取本机配置/.test(treeText(tree)), `配置在途时应显示占位（实际 ${treeText(tree).slice(0, 100) || '(空)'}）`)
  ok('B4', !hasType(tree, 'HomeView'), '配置在途时不得挂载会发请求的子视图（HomeView）')
  resolveCfg()
  await settle()
  tree = renderPanel(panel)
  ok('B4', hasType(tree, 'HomeView'), `配置读完后必须挂载 HomeView（实际 ${treeText(tree).slice(0, 100) || '(空)'}）`)
  ok('B4', !/正在读取本机配置/.test(treeText(tree)), '配置读完后占位应消失')
}

/** C1【交错】配置已读完，但云端请求一直 pending → 首页必须已放行（复审 #3a） */
async function scenarioC1(plugin) {
  const { panel } = parts(plugin)
  resetEnv()
  // 塞一枚（假的）令牌：让 loadHead 一定走到真正的云端读取并卡在那里，
  // 而不是因为"没令牌"提前 return（那会让本场景因为错的原因变绿）
  localStorageStub.setItem(
    'dsh.cau-portal.tokens.v1',
    JSON.stringify([{ id: 'fx', name: 'fx', usage: '', value: 'github_pat_fixture', expires: '', adminUrl: '', enabled: true }]),
  )
  setFetch(async (url) => {
    const u = String(url)
    if (u.includes('/api/cau/config')) {
      return { ok: true, status: 200, json: async () => ({ ok: true, configured: true, dataRepo: 'server/other-repo', branch: 'main' }), text: async () => '{}' }
    }
    // 其它一切（令牌 / 云端 bundle / 面板状态）永远 pending：模拟"云端很慢或一直不返回"
    return forever()
  })
  newRuntime()
  let tree = renderPanel(panel)
  runEffects()
  await settle(30) // 足够让 config 的 promise 落地、setAdopted(true) 执行
  tree = renderPanel(panel)
  if (process.env.CAU_FX_DEBUG) {
    console.log(`    [debug C1] fetch：${fetchCalls.map((c) => String(c.url)).join(' | ')}`)
    console.log(`    [debug C1] 树文本：${treeText(tree).slice(0, 140)}`)
  }
  ok('C1', !/正在读取本机配置/.test(treeText(tree)), `本机配置已读完、云端 pending 时不得停在占位上（实际 ${treeText(tree).slice(0, 120) || '(空)'}）`)
  ok('C1', hasType(tree, 'HomeView'), '本机配置已读完、云端 pending 时首页必须已挂载')
}

/** C2【交错】父组件回读在途时用户输入 → 不得被旧快照覆盖（复审 #3b） */
async function scenarioC2(plugin) {
  const { data } = parts(plugin)
resetEnv()
  let resolveGet = null
  const gate = new Promise((r) => {
    resolveGet = r
  })
  setFetch(async (url, opts) => {
    if (String(url).includes('/api/cau/config') && (!opts || !opts.method)) {
      await gate
      return { ok: true, status: 200, json: async () => ({ ok: true, configured: true, dataRepo: 'server/other-repo', branch: 'main' }), text: async () => '{}' }
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, sites: [] }), text: async () => '' }
  })
  // 父组件路径：面板挂载时调用的就是这个函数；这里直接驱动它
  const pending = data.adoptServerDataRepo()
  await settle(3)
  // 请求在途时，用户进设置页输入了仓名（＝设置页的 saveSettings）
  localStorageStub.setItem(SETTINGS_KEY, JSON.stringify({ dataRepo: 'user/typed-repo', panelPinned: true }))
  resolveGet()
  const changed = await pending
  const saved = JSON.parse(localStorageStub.getItem(SETTINGS_KEY) || '{}')
  ok('C2', saved.dataRepo === 'user/typed-repo', `父组件 GET 返回后不得覆盖用户输入（实际 ${JSON.stringify(saved.dataRepo)}）`)
  ok('C2', saved.panelPinned === true, `同一窗口内改的其它设置也不得丢（实际 panelPinned=${JSON.stringify(saved.panelPinned)}）`)
  ok('C2', changed === false, `既然用户已填，回填应返回 false（实际 ${JSON.stringify(changed)}）`)
  // 正向对照：本地为空时它仍应回填
resetEnv()
  resolveGet = null
  const gate2 = new Promise((r) => {
    resolveGet = r
  })
  setFetch(async (url, opts) => {
    if (String(url).includes('/api/cau/config') && (!opts || !opts.method)) {
      await gate2
      return { ok: true, status: 200, json: async () => ({ ok: true, configured: true, dataRepo: 'server/other-repo', branch: 'main' }), text: async () => '{}' }
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, sites: [] }), text: async () => '' }
  })
  const p2 = data.adoptServerDataRepo()
  resolveGet()
  const changed2 = await p2
  const saved2 = JSON.parse(localStorageStub.getItem(SETTINGS_KEY) || '{}')
  ok('C2', changed2 === true && saved2.dataRepo === 'server/other-repo', `本地为空时仍应回填（changed=${changed2} dataRepo=${JSON.stringify(saved2.dataRepo)}）`)
}

/** C3【交错】两次 PUT 响应乱序：新的先回、旧的后回 → 只认最新代次（复审 #3c） */
async function scenarioC3(plugin) {
  const { settings } = parts(plugin)
resetEnv()
  localStorageStub.setItem(SETTINGS_KEY, JSON.stringify({ dataRepo: 'seed/repo' }))
  const gates = []
  setFetch(async (url, opts) => {
    if (String(url).includes('/api/cau/config') && opts && opts.method === 'PUT') {
      const i = gates.length
      const p = new Promise((r) => {
        gates[i] = r
      })
      await p
      // 第 1 次（旧）成功；第 2 次（新）失败
      return i === 0
        ? { ok: true, status: 200, json: async () => ({ ok: true, configured: true, dataRepo: 'first/repo' }), text: async () => '{}' }
        : { ok: false, status: 400, json: async () => ({ ok: false, error: '数据仓库格式不认识' }), text: async () => '{}' }
    }
    return { ok: true, status: 200, json: async () => ({ ok: true, sites: [] }), text: async () => '' }
  })
  newRuntime()
  let tree = openCloudPage(settings)
  const input = repoInput(tree)
  if (!input) {
    ok('C3', false, '设置页里没有数据仓输入框（id=cauDataRepo）')
    return
  }
  input.props.onChange({ target: { value: 'first/repo' } })
  flushTimers()
  await settle(3)
  tree = renderSettings(settings)
  repoInput(tree).props.onChange({ target: { value: 'second/repo' } })
  flushTimers()
  await settle(3)
  ok('C3', gates.length === 2, `应发出 2 次 PUT 且都在途（实际 ${gates.length}）`)
  gates[1]() // 新的（第 2 次）先返回：失败
  await settle()
  tree = renderSettings(settings)
  ok('C3', /同步失败/.test(treeText(tree)), `新请求的失败要显示（实际 ${treeText(tree).slice(-160)}）`)
  gates[0]() // 旧的（第 1 次）后返回：成功 —— 不得覆盖
  await settle()
  tree = renderSettings(settings)
  const text = treeText(tree)
  ok('C3', /同步失败/.test(text), `旧响应晚到不得覆盖新状态（实际 ${text.slice(-160)}）`)
  ok('C3', !/已同步到本机共享存储（first\/repo）/.test(text), `旧响应里的仓名不得出现（实际 ${text.slice(-160)}）`)
}

// ---------------------------------------------------------------- 渲染辅助
function renderSettings(settings) {
  rt.hook = 0
  rt.effects = []
  return settings.CauSettings({ initialPage: 'cloud' })
}
function renderPanel(panel) {
  rt.hook = 0
  rt.effects = []
  return panel.CauPanel({ storeKey: 'fx', active: true, openReq: null })
}
function runEffects() {
  for (const fn of rt.effects) {
    try {
      fn()
    } catch (e) {
      results.push({ key: 'effect', pass: false, msg: `effect 抛错：${e && e.message}` })
    }
  }
}
/** 打开「数据源」子页：私有树支持 props.initialPage='cloud'；公开树没有该 prop，需要点首页卡片切过去 */
function openCloudPage(settings) {
  let tree = renderSettings(settings)
  runEffects()
  if (repoInput(tree)) return tree
  for (const el of find(tree, (e) => e.props && typeof e.props.onClick === 'function')) {
    try {
      el.props.onClick({ preventDefault() {}, stopPropagation() {} })
    } catch {
      /* 卡片点击的副作用忽略 */
    }
    tree = renderSettings(settings)
    if (repoInput(tree)) return tree
  }
  return tree
}

// ---------------------------------------------------------------- 变异体（反向验证）
const MUTANTS = [
  {
    id: 'M1',
    key: 'C1',
    desc: '占位门改回旧写法：setAdopted(true) 排在 loadHead() 之后（＝云端 pending 时首页卡住）',
    apply: (src) => {
      let out = src.replace(/finally \{[\s\S]{0,400}?setAdopted\(true\);\s*\}/, 'finally {}')
      const step1 = out !== src
      const src2 = out
      out = out.replace(/(try \{\s*await loadHead\(\);[\s\S]{0,240}?\}\s*catch \{[\s\S]{0,240}?\})/, '$1\n            setAdopted(true);')
      return { src: out, changed: step1 && out !== src2 }
    },
  },
  {
    id: 'M2',
    key: 'C2',
    desc: '回填改回旧写法：用 GET 前的旧快照覆盖（无 now 重读）',
    apply: (src) => {
      const re = /const now = loadSettings\(\);\s*if \(String\(now\.dataRepo \|\| ''\)\.trim\(\)\)\s*return false;\s*saveSettings\(\{ \.\.\.now,/g
      const out = src.replace(re, 'saveSettings({ ...cur,')
      return { src: out, changed: out !== src }
    },
  },
  {
    id: 'M3',
    key: 'C3',
    desc: '同步状态改回旧写法：没有请求代次检查',
    apply: (src) => {
      const re = /if \(seq === dataRepoSyncSeq\.current\)\s*setDataRepoSync\(s\);/
      const out = src.replace(re, 'setDataRepoSync(s);')
      return { src: out, changed: out !== src }
    },
  },
]

// ---------------------------------------------------------------- 主流程
async function runAll(plugin) {
  scenarioA(parts(plugin))
  // C1 放最前面：只有此刻 bundle/token 缓存还是冷的，"云端请求一直 pending"才真的会发生
  // （否则 loadHead 可能因为缓存的"无令牌/已有 bundle"直接返回，断言就会因为错的原因变绿）
  await scenarioC1(plugin)
  await scenarioBPut(plugin)
  await scenarioBBackfill(plugin)
  await scenarioBGate(plugin)
  await scenarioC2(plugin)
  await scenarioC3(plugin)
}

const main = async () => {
  const src = fs.readFileSync(BUNDLE, 'utf8')
  console.log(`客户端行为夹具：${BUNDLE}（${src.length} B）\n`)

  const plugin = loadPlugin(src)
  const p = parts(plugin)
  ok('A', !!p.data && typeof p.data.dataRepo === 'function', '找到内联的 data 模块（dataRepo）')
  ok('B1', !!p.settings && typeof p.settings.CauSettings === 'function', '找到内联的 settings 模块（CauSettings）')
  ok('B4', !!p.panel && typeof p.panel.CauPanel === 'function', '找到内联的 panel 模块（CauPanel）')
  await runAll(plugin)

  console.log('--- 断言明细 ---')
  for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  [${r.key}] ${r.msg}`)

  const groups = [...new Set(results.map((r) => r.key))]
  console.log('\n--- 分组 ---')
  for (const g of groups) {
    const list = results.filter((r) => r.key === g)
    const bad = list.filter((r) => !r.pass).length
    console.log(`  ${g.padEnd(4)} ${list.length - bad}/${list.length}`)
  }

  // 反向验证：每个变异体只应让它的目标 key 变红（其余 key 允许因连带影响变红，但目标必须红）
  console.log('\n--- 反向验证（变异测试）---')
  let mutOk = true
  for (const m of MUTANTS) {
    const applied = m.apply(src)
    if (!applied.changed) {
      mutOk = false
      console.log(`  FAIL  ${m.id} 变异没有生效（正则没匹配上，夹具需要跟着代码更新）：${m.desc}`)
      continue
    }
    const saved = results.length
    const mutant = loadPlugin(applied.src)
    await runAll(mutant)
    const fresh = results.splice(saved)
    const target = fresh.filter((r) => r.key === m.key)
    const red = target.filter((r) => !r.pass)
    const green = target.filter((r) => r.pass)
    if (red.length) {
      console.log(`  PASS  ${m.id}（目标 ${m.key}）→ 变红 ${red.length}/${target.length}，例：${red[0].msg.slice(0, 90)}`)
    } else {
      mutOk = false
      console.log(`  FAIL  ${m.id}（目标 ${m.key}）→ 突变后仍然全绿，说明这些断言抓不住该错误：${m.desc}`)
      for (const r of target) console.log(`         · ${r.pass ? 'PASS' : 'FAIL'} ${r.msg.slice(0, 150)}`)
    }
    if (green.length) console.log(`        （同一 key 下仍有 ${green.length} 条断言为绿，属正常：变异只影响其中一部分）`)
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n客户端夹具：${results.length - failed.length}/${results.length} 通过；变异测试 ${mutOk ? '全部按预期变红' : '有未按预期变红的项'}`)
  if (failed.length || !mutOk) process.exitCode = 1
}

main().catch((e) => {
  console.error('夹具自身出错：', e)
  process.exitCode = 3
})
