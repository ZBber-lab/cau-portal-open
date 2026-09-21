/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板正文 ↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「填入主聊天输入框」：设置页（面板内）发起 → dock 的 CtxBar 调 inputActions.setDraft
 *     （只填不发送；dock 槽位在无会话时不渲染，此时请求挂起，等有会话挂载后自动填入）。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 *
 * 2026-09-20：原「在面板中打开」的 bus 通道已删除 —— 迁入官方右侧栏后，工具卡片改走
 * 官方导航参数（`official.openArticleInPortal` → `openTab(kind, { params })`），不再需要总线转发。
 */

export type AttachedItem = { id: string; title: string; source?: string }
export type AttachedContext = AttachedItem[]
/** 「填入主聊天输入框」请求（只填不发送）：设置页在面板里，拿不到 dock 的 inputActions，故经总线桥到 CtxBar */
export type DraftRequest = { seq: number; text: string } | null

type Ref = { attached: AttachedItem[]; draft: DraftRequest; draftAck: number; subs: Set<() => void> }

function ref(): Ref {
  let r = (window as any).__CAU_CTXBAR__ as Ref | undefined
  // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
  if (!r || !Array.isArray(r.attached) || !(r.subs instanceof Set)) {
    r = { attached: [] as AttachedItem[], draft: null, draftAck: 0, subs: new Set() }
    ;(window as any).__CAU_CTXBAR__ = r
  }
  // 旧形状补字段（就地补，不重置，避免热更新时把用户已引用的文章清掉）
  if (typeof r.draft !== 'object') r.draft = null
  if (typeof r.draftAck !== 'number') r.draftAck = 0
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

export function subscribeBus(fn: () => void): () => void {
  ref().subs.add(fn)
  return () => ref().subs.delete(fn)
}

/** 请求把一段文字填进主聊天输入框（由 dock 的 CtxBar 消费）；返回本次请求序号 */
export function requestDraft(text: string): number {
  const r = ref()
  const seq = (r.draft?.seq ?? 0) + 1
  r.draft = { seq, text }
  emit()
  return seq
}

export function getDraftRequest(): DraftRequest {
  return ref().draft
}

/** CtxBar 消费后清掉，避免切会话重新挂载时把旧请求重复填一遍 */
export function clearDraftRequest() {
  const r = ref()
  if (r.draft) {
    r.draft = null
    emit()
  }
}

/** CtxBar 回执：已把序号 ≤ seq 的请求填进输入框（设置页据此显示「已填入 / 等待会话」） */
export function ackDraftRequest(seq: number) {
  const r = ref()
  r.draftAck = Math.max(r.draftAck || 0, seq)
  emit()
}

export function getDraftAck(): number {
  return ref().draftAck || 0
}
