// 客户端 bundle 加载模拟：验证 __ModuleLoader__ 握手、导出形状、官方右侧栏接线与缺席降级
const fs = require('fs')
const path = require('path')

let captured = null
const reactStub = {
  Component: class Component { constructor(p) { this.props = p; this.state = {} } },
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: () => ({ current: null }),
  useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
  useSyncExternalStore: (sub, snap) => (typeof snap === 'function' ? snap() : undefined),
  createElement: () => null,
  Fragment: {},
}
const requireStub = (id) => {
  if (id === 'react' || id === 'react/jsx-runtime') return reactStub
  throw new Error('unexpected external require: ' + id)
}

const noop = () => {}
global.window = {
  __ModuleLoader__: { load: (o) => { captured = o } },
  document: {
    createElement: () => ({ setAttribute() {}, remove() {}, appendChild() {}, style: {} }),
    head: { appendChild() {} },
    body: { classList: { toggle: noop, remove: noop, add: noop }, appendChild() {} },
    addEventListener: noop,
    removeEventListener: noop,
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  fetch: async () => { throw new Error('no network in sim') },
  prompt: () => null,
  alert: () => {},
  addEventListener: noop,
  removeEventListener: noop,
  setInterval: () => 0,
  clearInterval: noop,
  setTimeout: (fn) => { try { fn() } catch { /* noop */ } return 0 },
}
global.localStorage = global.window.localStorage
global.document = global.window.document
global.setInterval = global.window.setInterval
global.clearInterval = global.window.clearInterval
global.Notification = undefined

const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'client.js'), 'utf8')
eval(src)
if (!captured) throw new Error('__ModuleLoader__.load 未被调用')
if (captured.id !== 'cau-portal') throw new Error('id 错误: ' + captured.id)
const mod = captured.factory(requireStub)

const ok = (cond, msg) => { if (!cond) throw new Error(msg) }
ok(Array.isArray(mod.inject) && mod.inject.includes('slots'), 'inject 缺失')
ok(typeof mod.apply === 'function', 'apply 缺失')
ok(!mod.inject.includes('sidebarRightTabs'), 'inject 不该硬声明 sidebarRightTabs（服务缺席会让插件永久 pending）')

/** 造一个 ctx；withSidebar=false 时模拟「本机没有官方右侧栏」 */
function makeCtx(withSidebar) {
  const registered = []
  const tabTypes = []
  const effects = []
  const effectErrors = []
  const ctx = {
    effect: (fn, label) => {
      effects.push(label)
      try {
        return (typeof fn === 'function' ? fn() : undefined) || (() => {})
      } catch (e) {
        effectErrors.push(String((e && e.message) || e))
        return () => {}
      }
    },
    get: (name) => {
      if (!withSidebar) return undefined
      if (name === 'sidebarRightTabs') return { register: (def) => { tabTypes.push(def); return () => {} } }
      if (name === 'sidebarRight') return { openTab: noop, isExpanded: () => false, toggleExpanded: noop, active: () => undefined }
      return undefined
    },
    slots: {
      inject: (name, cb) => { registered.push(cb()) },
      register: (meta, comp) => ({ meta, comp }),
    },
    sessions: { list: { subscribe: () => () => {}, getSnapshot: () => ({ current: 'sim-session' }) } },
  }
  if (withSidebar) ctx.sidebarRightTabs = ctx.get('sidebarRightTabs')
  return { ctx, registered, tabTypes, effects, effectErrors }
}

// ---- 场景1：官方右侧栏在场 ----
const a = makeCtx(true)
mod.apply(a.ctx)
ok(a.effectErrors.length === 0, 'apply 抛错(有右侧栏): ' + a.effectErrors.join(' | '))
const sidebarRow = a.registered.find((r) => r && r.meta && r.meta.name === 'sidebar.footer.action' && r.meta.id === 'cau-portal')
ok(!!sidebarRow, 'sidebar.footer.action 槽未注册')
const tabBody = a.registered.find((r) => r && r.meta && r.meta.name === 'sidebar.right.pane.tab' && r.meta.key === 'cau-portal')
ok(!!tabBody, 'sidebar.right.pane.tab 正文槽未注册')
ok(typeof tabBody.comp === 'function', 'tab 正文不是组件')
ok(a.tabTypes.length === 1, 'tab 类型未注册（期望 1 个，实际 ' + a.tabTypes.length + '）')
ok(a.tabTypes[0].id === 'cau-portal' && a.tabTypes[0].kind === 'cau-portal', 'tab 类型 id/kind 错误')
ok(a.tabTypes[0].title() === '农大门户', 'tab 标题错误: ' + a.tabTypes[0].title())
ok(Array.isArray(a.tabTypes[0].guide) && a.tabTypes[0].guide.length === 1, 'guide 入口缺失')
ok(!a.effects.some((l) => /follow sessions/.test(String(l))), '跟随会话应已移除（2026-09-20 收尾）')

// ---- 场景2：官方右侧栏缺席（服务没有 / 槽位不存在）→ 不能抛错，其余功能照常 ----
const b = makeCtx(false)
mod.apply(b.ctx)
ok(b.effectErrors.length === 0, 'apply 抛错(无右侧栏): ' + b.effectErrors.join(' | '))
ok(b.tabTypes.length === 0, '无官方右侧栏时不该注册 tab 类型')
const row2 = b.registered.find((r) => r && r.meta && r.meta.name === 'sidebar.footer.action')
ok(!!row2, '无官方右侧栏时 sidebar.footer.action 槽仍应注册')

console.log('[sim ok] id=cau-portal inject=[' + mod.inject.join(',') + ']')
console.log('[sim ok] 有右侧栏: effects×' + a.effects.length + ' slots=' + a.registered.map((r) => r && r.meta.name + (r.meta.id ? ':' + r.meta.id : '') + (r.meta.key ? ':' + r.meta.key : '')).join(',') + ' tabTypes=' + a.tabTypes.map((t) => t.id).join(','))
console.log('[sim ok] 无右侧栏: effects×' + b.effects.length + ' slots=' + b.registered.map((r) => r && r.meta.name + (r.meta.id ? ':' + r.meta.id : '') + (r.meta.key ? ':' + r.meta.key : '')).join(',') + '（降级不崩）')
console.log('[sim ok] bundle 大小 ' + (src.length / 1024).toFixed(1) + ' KB')
