/**
 * 阶段6 双向协同 · 阅读上下文附加条（conversation.input.dock，会话级 list 槽）。
 * 面板打开文章时（bus.setAttached）自动在输入框上方显示「📄《标题》· 来源 ×」条，
 * 并按 autoAttach 设置在输入草稿注入标记行 `〔cau:article:<id>〕《标题》`，
 * 用户正常提问发送即可让 AI 经 mcp__cau__get_article 读全文作答；× 移除标记。
 */
import { Component, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getAttached, removeAttached, clearAttached, subscribeAttached } from './bus'

const MARKER_RE = /〔cau:article:[^〕]*〕[^\n]*\n?/g

function markerOf(a: { id: string; title: string }): string {
  return `〔cau:article:${a.id}〕《${a.title}》\n`
}
/** 保底：上下文条渲染出错只显示提示，绝不拖垮整个应用 */
class CtxBarBoundary extends Component<any, { err: any }> {
  state = { err: null }
  static getDerivedStateFromError(err: any) {
    return { err }
  }
  componentDidCatch(err: any) {
    console.error('[cau-portal ctxbar]', err)
  }
  render() {
    if (this.state.err) {
      return <div style={{ padding: '6px 12px', fontSize: 12, color: '#e5484d' }}>上下文条出错：{String(this.state.err?.message || this.state.err)}</div>
    }
    return this.props.children
  }
}

export const CTXBAR_CSS = `
.dsh-cau_ctxbarList{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance,16px) - var(--dsh-composer-side-clearance,16px));max-width:calc(var(--dsh-composer-card-max-width,780px) - var(--dsh-composer-dock-inset,8px) - var(--dsh-composer-dock-inset,8px));padding:0 var(--dsh-composer-dock-inset,8px);margin:0 auto 4px;min-width:0;display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px}
.dsh-cau_ctxbarStatus{flex:none;font-size:10px;color:var(--cau-ink3);opacity:.85;margin-right:2px}
.dsh-cau_ctxbar{display:flex;align-items:center;gap:6px;box-sizing:border-box;flex:0 1 auto;min-width:0;max-width:300px;padding:5px 8px 5px 7px;border:1px solid var(--cau-line);border-radius:999px;background:var(--dsw-specific-tip,rgba(255,255,255,.05));color:var(--cau-ink2)}
.dsh-cau_ctxbarEmblem{flex:none;display:flex;align-items:center;color:var(--cau-brand)}
.dsh-cau_ctxbarEmblem svg{display:block;height:16px;width:auto}
.dsh-cau_ctxbarTitle{flex:0 1 auto;min-width:0;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--cau-ink)}
.dsh-cau_ctxbarX{flex:none;display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:50%;background:transparent;color:var(--cau-ink3);cursor:pointer;font-size:12px;line-height:1}
.dsh-cau_ctxbarX:hover{background:var(--cau-hover);color:var(--cau-ink)}
`

export function CtxBar(props: any) {
  const inputActions = props?.inputActions
  const attached = useSyncExternalStore(subscribeAttached, getAttached) as any[]
  const [injected, setInjected] = useState(false)
  const [tip, setTip] = useState('')
  const emblem = (window as any).__CAU_EMBLEM__ || ''
  const draftRef = useRef<string>((props?.input?.draft as string) || '')
  useEffect(() => {
    draftRef.current = (props?.input?.draft as string) || ''
  })

  // 无引用时清空状态
  useEffect(() => {
    if ((attached || []).length === 0) {
      setInjected(false)
      setTip('')
    }
  }, [attached])

  // 发送时自动附带引用标记（输入框平时干净；消息带上引用、AI 自动读取）
  useEffect(() => {
    if (!inputActions || typeof inputActions.submit !== 'function') return
    const orig = inputActions.submit
    inputActions.submit = () => {
      try {
        const items = getAttached() || []
        if (items.length) {
          const draft = draftRef.current || ''
          const cleaned = draft.replace(MARKER_RE, '')
          const markers = items.map((a) => markerOf(a)).join('')
          inputActions.setDraft(markers + cleaned)
        }
      } catch (e) {
        console.error('[cau-portal ctxbar] submit inject', e)
      }
      return orig()
    }
    return () => {
      inputActions.submit = orig
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputActions])

  // 发问后自动解除：仅当草稿【从非空变为空】（消息已发出）才清掉全部引用
  const prevDraftRef = useRef<string>((props?.input?.draft as string) || '')
  useEffect(() => {
    const draft = (props?.input?.draft as string) || ''
    const prev = prevDraftRef.current
    prevDraftRef.current = draft
    if ((attached || []).length === 0) return
    if (prev !== '' && draft === '') {
      try {
        if (inputActions) inputActions.setDraft('')
      } catch (e) {
        console.error('[cau-portal ctxbar] post-send clear', e)
      }
      clearAttached()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.input?.draft, attached, inputActions])

  if (!attached || attached.length === 0) return null

  const removeOne = (id: string) => {
    try {
      if (inputActions) {
        const draft = draftRef.current || ''
        inputActions.setDraft(draft.replace(new RegExp(`〔cau:article:${id}〕[^\\n]*\\n?`, 'g'), ''))
      }
    } catch (e) {
      console.error('[cau-portal ctxbar] remove', e)
    }
    removeAttached(id)
  }

  return (
    <CtxBarBoundary>
      <div className="dsh-cau_ctxbarList">
        <span className="dsh-cau_ctxbarStatus">{(attached || []).length} 篇引用 · 发送时附带</span>
        {(attached || []).map((it: any) => (
          <div className="dsh-cau_ctxbar" key={it.id}>
            <span className="dsh-cau_ctxbarEmblem" dangerouslySetInnerHTML={{ __html: emblem }} />
            <span className="dsh-cau_ctxbarTitle" title={it.title}>
              {it.title}
            </span>
            <button type="button" className="dsh-cau_ctxbarX" aria-label="移除引用" onClick={() => removeOne(it.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </CtxBarBoundary>
  )
}
