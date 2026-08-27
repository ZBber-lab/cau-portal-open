/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */

export type AttachedItem = { id: string; title: string; source?: string }
export type AttachedContext = AttachedItem[]
export type OpenRequest = { seq: number; id: string } | null

type Ref = { attached: AttachedItem[]; open: OpenRequest; subs: Set<() => void> }

function ref(): Ref {
  let r = (window as any).__CAU_CTXBAR__ as Ref | undefined
  // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
  if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
    r = { attached: [] as AttachedItem[], open: null as OpenRequest, subs: new Set() }
    ;(window as any).__CAU_CTXBAR__ = r
  }
  return r
}

function emit() {
  for (const fn of [...ref().subs]) {
    try {
      fn()
    } catch (e) {
      console.error('[cau-portal bus]', e)
    }
  }
}

export function getAttached(): AttachedContext {
  return ref().attached
}

/** 追加一篇引用；若已存在则返回 false */
export function addAttached(item: AttachedItem): boolean {
  const r = ref()
  if (r.attached.some((a) => a.id === item.id)) return false
  r.attached = [...r.attached, item]
  emit()
  return true
}

/** 移除一篇引用；返回是否移除 */
export function removeAttached(id: string): boolean {
  const r = ref()
  const before = r.attached.length
  r.attached = r.attached.filter((a) => a.id !== id)
  const removed = r.attached.length !== before
  if (removed) emit()
  return removed
}

export function hasAttached(id: string): boolean {
  return ref().attached.some((a) => a.id === id)
}

/** 清空全部引用 */
export function clearAttached() {
  const r = ref()
  if (r.attached.length) {
    r.attached = []
    emit()
  }
}

export function subscribeAttached(fn: () => void): () => void {
  ref().subs.add(fn)
  return () => ref().subs.delete(fn)
}

export function getOpenRequest(): OpenRequest {
  return ref().open
}
export function requestOpenArticle(id: string) {
  const r = ref()
  r.open = { seq: (r.open?.seq ?? 0) + 1, id }
  emit()
}
export function clearOpenRequest() {
  ref().open = null
  emit()
}
export function subscribeBus(fn: () => void): () => void {
  ref().subs.add(fn)
  return () => ref().subs.delete(fn)
}
