// 阶段4 第4步：客户端 bundle 加载模拟（验证 __ModuleLoader__ 握手 + 导出形状）
const fs = require('fs')
let captured = null
const reactStub = {
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: () => ({ current: null }),
  useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
  createElement: () => null,
  Fragment: {},
}
const requireStub = (id) => {
  if (id === 'react' || id === 'react/jsx-runtime') return reactStub
  throw new Error('unexpected external require: ' + id)
}
global.window = {
  __ModuleLoader__: { load: (o) => { captured = o } },
  document: { createElement: () => ({ setAttribute() {}, appendChild() {} }), head: { appendChild() {} } },
  localStorage: { getItem: () => null, setItem: () => {} },
  fetch: async () => { throw new Error('no network in sim') },
  prompt: () => null,
  alert: () => {},
}
global.localStorage = global.window.localStorage
const src = fs.readFileSync(require('path').join(__dirname, '..', 'lib', 'client.js'), 'utf8')
eval(src)
if (!captured) throw new Error('__ModuleLoader__.load 未被调用')
if (captured.id !== 'cau-portal') throw new Error('id 错误: ' + captured.id)
const mod = captured.factory(requireStub)
const ok = (cond, msg) => { if (!cond) throw new Error(msg) }
ok(Array.isArray(mod.inject) && mod.inject.includes('slots'), 'inject 缺失')
ok(typeof mod.apply === 'function', 'apply 缺失')
// apply(ctx) 应该能跑通（effect + slots.inject 注册）
let effectCalls = 0
let slotRegistered = null
const ctx = {
  effect: (fn) => { effectCalls++; return () => {} },
  slots: { inject: (name, cb) => { slotRegistered = cb() }, register: (meta, comp) => ({ meta, comp }) },
}
mod.apply(ctx)
ok(effectCalls === 1, 'ctx.effect 未注入样式')
ok(slotRegistered && slotRegistered.meta.id === 'cau-portal', 'slot 注册失败')
console.log('[sim ok] id=cau-portal inject=[' + mod.inject.join(',') + '] apply→effect×' + effectCalls + ' slot=' + slotRegistered.meta.name)
console.log('[sim ok] bundle 大小 ' + (src.length / 1024).toFixed(1) + ' KB')
