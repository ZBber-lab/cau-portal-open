/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间
 * 需要共享两件事：
 *  1) 阅读上下文附加条：面板打开文章 → 记录当前附加的文章；dock 组件据此刻到草稿。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 模块级单例挂在 window 上（build.mjs 内联器不做模块去重，见 ctx.ts 说明）。
 */

export type AttachedContext = { id: string; title: string; source?: string } | null

export type OpenRequest = { seq: number; id: string } | null

const LS = { attached: null as AttachedContext, open: null as OpenRequest }
const subs = new Set<() => void>()

function emit() {
  for (const fn of subs) fn()
}

export function getAttached(): AttachedContext {
  const a = (window as any).__CAU_CTXBAR__
  return a ? a.attached : null
}
export function setAttached(a: AttachedContext) {
  const cur = (window as any).__CAU_CTXBAR__ || { attached: null as AttachedContext, open: null as OpenRequest }
  cur.attached = a
  ;(window as any).__CAU_CTXBAR__ = cur
  emit()
}
export function subscribeAttached(fn: () => void): () => void {
  subs.add(fn)
  return () => subs.delete(fn)
}

export function getOpenRequest(): OpenRequest {
  const a = (window as any).__CAU_CTXBAR__
  return a ? a.open : null
}
export function requestOpenArticle(id: string) {
  const cur = (window as any).__CAU_CTXBAR__ || { attached: null as AttachedContext, open: null as OpenRequest }
  cur.open = { seq: (cur.open?.seq ?? 0) + 1, id }
  ;(window as any).__CAU_CTXBAR__ = cur
  emit()
}
export function clearOpenRequest() {
  const cur = (window as any).__CAU_CTXBAR__
  if (cur) cur.open = null
  emit()
}
export function subscribeBus(fn: () => void): () => void {
  subs.add(fn)
  return () => subs.delete(fn)
}
