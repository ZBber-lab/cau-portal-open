/**
 * 跨组件树共享状态（迁入官方右侧栏后）。
 *
 * 面板正文与入口按钮**分处两棵组件树**（按钮在 root 作用域的 sidebar.footer.action，
 * 正文在 session 作用域的 sidebar.right.pane.tab），原来靠 props 传递的东西必须共享：
 *   - tabOpen：右侧栏里是否真的存在我们的 tab（入口按钮的选中态）
 *   - unread ：未读计数（入口按钮显示，面板打开时回写）
 *   - 面板视图状态：**按 tab 分桶**（一个会话至多一个农大门户 tab，所以等价于「按会话记」），
 *     切走再切回来还停在你上次看的那一页
 *     （2026-09-20 用户定：**不做跨会话跟随** —— 面板属于各自的对话）
 *
 * 注意：build.mjs 的内联器**不做模块去重**（同一模块被两处 require 会内联成两份独立
 * IIFE），所以状态必须挂 window 才能跨副本共享 —— 与 bus.ts / ctx.ts 同一条教训。
 */

export type PanelState = { stack: any[]; settings: boolean }

type CauState = { tabOpen: boolean; unread: number; panels: Record<string, PanelState>; subs: Set<() => void> }

function ref(): CauState {
  let r = (window as any).__CAU_STATE__ as CauState | undefined
  if (!r || typeof r.tabOpen !== 'boolean' || !(r.subs instanceof Set)) {
    r = { tabOpen: false, unread: 0, panels: {}, subs: new Set() }
    ;(window as any).__CAU_STATE__ = r
  }
  if (!r.panels || typeof r.panels !== 'object') r.panels = {}
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

/** 订阅 tabOpen / unread 的变化（配合 useSyncExternalStore；getSnapshot 返回原始值，稳定可比） */
export function subscribeState(fn: () => void): () => void {
  ref().subs.add(fn)
  return () => ref().subs.delete(fn)
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

/** 读某个 tab（≈某个会话）上次的视图状态；没有则返回 null（面板回到首页） */
export function getPanelState(key: string): PanelState | null {
  if (!key) return null
  const v = ref().panels[key]
  return v && Array.isArray(v.stack) ? v : null
}

/** 记忆某个 tab 的视图状态。**不发通知**：它只影响面板自身，不该让入口按钮跟着重渲染 */
export function setPanelState(key: string, value: PanelState) {
  if (!key) return
  try {
    ref().panels[key] = { stack: value.stack, settings: !!value.settings }
  } catch {
    /* noop */
  }
}

/** 忘掉某个 tab 的视图状态（tab 被关掉时调用，避免状态无限堆积） */
export function dropPanelState(key: string) {
  if (!key) return
  try {
    delete ref().panels[key]
  } catch {
    /* noop */
  }
}
