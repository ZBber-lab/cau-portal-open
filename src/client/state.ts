/**
 * 面板级共享状态（迁入官方右侧栏 · 阶段A）。
 *
 * 面板正文搬进右侧栏后，入口按钮与面板正文**分处两棵组件树**（按钮在 root 作用域的
 * sidebar.footer.action，正文在 session 作用域的 sidebar.right.pane.tab），原来靠
 * props 传递的「未读计数 / 开合状态」必须跨树共享，于是集中到这里：
 *   - wantOpen：用户是否希望面板开着（跟随会话切换的依据；tab 真被关掉时置 false）
 *   - tabOpen ：右侧栏里是否真的存在我们的 tab（入口按钮的选中态）
 *   - unread  ：未读计数（入口按钮显示，面板打开时回写）
 *
 * 注意：build.mjs 的内联器**不做模块去重**（同一模块被两处 require 会内联成两份
 * 独立 IIFE），所以状态必须挂 window 才能跨副本共享 —— 与 bus.ts / ctx.ts 同一条教训。
 */

type CauState = { wantOpen: boolean; tabOpen: boolean; unread: number; subs: Set<() => void> }

function ref(): CauState {
  let r = (window as any).__CAU_STATE__ as CauState | undefined
  if (!r || typeof r.wantOpen !== 'boolean' || !(r.subs instanceof Set)) {
    r = { wantOpen: false, tabOpen: false, unread: 0, subs: new Set() }
    ;(window as any).__CAU_STATE__ = r
  }
  return r
}

function emit() {
  for (const fn of [...ref().subs]) {
    try {
      fn()
    } catch (e) {
      console.error('[cau-portal state]', e)
    }
  }
}

/** 订阅任意一项变化（配合 useSyncExternalStore 用；getSnapshot 返回原始值，稳定可比） */
export function subscribeState(fn: () => void): () => void {
  ref().subs.add(fn)
  return () => ref().subs.delete(fn)
}

export function getWantOpen(): boolean {
  return ref().wantOpen
}

export function setWantOpen(v: boolean) {
  const r = ref()
  const next = !!v
  if (r.wantOpen === next) return
  r.wantOpen = next
  emit()
}

export function getTabOpen(): boolean {
  return ref().tabOpen
}

export function setTabOpen(v: boolean) {
  const r = ref()
  const next = !!v
  if (r.tabOpen === next) return
  r.tabOpen = next
  emit()
}

export function getUnread(): number {
  return ref().unread
}

export function setUnread(n: number) {
  const r = ref()
  const next = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  if (r.unread === next) return
  r.unread = next
  emit()
}
