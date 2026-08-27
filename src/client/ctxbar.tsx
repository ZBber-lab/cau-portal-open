/**
 * 阶段6 双向协同 · 阅读上下文附加条（conversation.input.dock，会话级 list 槽）。
 * 面板打开文章时（bus.setAttached）自动在输入框上方显示「📄《标题》· 来源 ×」条，
 * 并按 autoAttach 设置在输入草稿注入标记行 `〔cau:article:<id>〕《标题》`，
 * 用户正常提问发送即可让 AI 经 mcp__cau__get_article 读全文作答；× 移除标记。
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getAttached, setAttached, subscribeAttached } from './bus'
import { loadSettings } from './data'

const MARKER_RE = /〔cau:article:[^〕]*〕[^\n]*\n?/g

function markerOf(a: { id: string; title: string }): string {
  return `〔cau:article:${a.id}〕《${a.title}》\n`
}

export const CTXBAR_CSS = `
.dsh-cau_ctxbar{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;padding:6px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));border-radius:10px 10px 0 0;background:var(--dsw-specific-tip,rgba(255,255,255,.04));font-size:12px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_ctxbarIcon{flex:none}
.dsh-cau_ctxbarTitle{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_ctxbarSrc{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_ctxbarX{flex:none;display:flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary,#8b95a5);cursor:pointer;font-size:13px;line-height:1}
.dsh-cau_ctxbarX:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
`

export function CtxBar(props: any) {
  const inputActions = props?.inputActions
  const attached = useSyncExternalStore(subscribeAttached, getAttached)
  const draftRef = useRef<string>((props?.input?.draft as string) || '')
  useEffect(() => {
    draftRef.current = (props?.input?.draft as string) || ''
  })

  // 附加变化 → 注入标记到草稿（仅 autoAttach 开启时；单条替换式）
  useEffect(() => {
    if (!attached || !inputActions) return
    const s = loadSettings()
    if (s.autoAttach === false) return
    const draft = draftRef.current || ''
    const cleaned = draft.replace(MARKER_RE, '')
    inputActions.setDraft(cleaned ? markerOf(attached) + cleaned : markerOf(attached))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attached, inputActions])

  if (!attached) return null

  const detach = () => {
    if (inputActions) {
      const draft = draftRef.current || ''
      inputActions.setDraft(draft.replace(MARKER_RE, ''))
    }
    setAttached(null)
  }

  return (
    <div className="dsh-cau_ctxbar">
      <span className="dsh-cau_ctxbarIcon">📄</span>
      <span className="dsh-cau_ctxbarTitle">《{attached.title}》</span>
      {attached.source && <span className="dsh-cau_ctxbarSrc">{attached.source}</span>}
      <button type="button" className="dsh-cau_ctxbarX" aria-label="移除上下文" onClick={detach}>
        ×
      </button>
    </div>
  )
}
