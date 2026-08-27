/**
 * cau-portal L2：文章原文阅读（阶段4 第4步 批②/③）。
 * 面包屑（来源 → 栏目 → 标题）+ 标题/来源/时间 + AI 摘要框 + deadline 高亮 +
 * 正文全文（pre-wrap）+ 查看原文（新标签）+ 上一篇/下一篇 +
 * 加入/取消关注（无上限）+ 待办类文章的 留存/归档。
 * 数据：data/articles/<id>.json（经数据层读取；ai 已内联在文章文件）。
 */
import { useEffect, useState } from 'react'
import {
  readArticle,
  loadFollow,
  saveFollow,
  loadDeadlineOps,
  setDeadlineOp,
  isFollowed,
  enrichArticle,
  loadSettings,
} from './data'

const idOf = (it: { article_id?: string; url?: string }) => it.article_id || it.url || ''

function fmt(iso: string | null | undefined): string {
  if (!iso) return ''
  return String(iso)
}

export function ArticleView(props: {
  articleId: string
  siteName?: string
  columnName?: string
  onBack: () => void
  onOpenArticle: (id: string, siblings?: { id: string; title: string }[], index?: number) => void
  siblings?: { id: string; title: string }[]
  index?: number
}) {
  const { articleId, siteName, columnName, onBack, onOpenArticle, siblings, index } = props
  const [art, setArt] = useState<any | null>(null)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [followed, setFollowed] = useState(false)
  const [deadlineOp, setDeadlineOpState] = useState<string | null>(null)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiOut, setAiOut] = useState<any | null>(null)
  const [aiErr, setAiErr] = useState('')

  const reload = async () => {
    setPhase('loading')
    setAiOut(null)
    setAiErr('')
    const a = await readArticle(articleId)
    if (!a) {
      setPhase('error')
      return
    }
    setArt(a)
    setPhase('ready')
    setFollowed(isFollowed(articleId))
    setDeadlineOpState(loadDeadlineOps()[articleId] || null)
  }

  useEffect(() => {
    void reload()
  }, [articleId])

  const runEnrich = async () => {
    setAiBusy(true)
    setAiErr('')
    const s = loadSettings()
    const out = await enrichArticle(articleId, {
      provider: s.monitorModel?.provider,
      model: s.monitorModel?.model,
    })
    setAiBusy(false)
    if (out?.ok) setAiOut(out.result)
    else setAiErr(String(out?.error || '加工失败'))
  }

  const toggleFollowNow = () => {
    const cur = loadFollow()
    const idx = cur.findIndex((x) => x.id === articleId)
    let next: typeof cur
    if (idx >= 0) next = cur.filter((x) => x.id !== articleId)
    else
      next = [
        { id: articleId, title: art?.title || '', url: art?.url || '', time: art?.time || null, source: art?.source || '', column: columnName || '', importance: art?.ai?.importance, summary: art?.ai?.summary },
        ...cur,
      ]
    saveFollow(next)
    setFollowed(idx < 0)
  }

  const hasDeadline = !!(art?.ai?.deadline && art?.ai?.deadline.date)
  const op = deadlineOp || ''

  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={onBack}>
          ‹ 返回
        </button>
        <span className="dsh-cau_breadPath">
          {[siteName || art?.source, columnName].filter(Boolean).join(' · ')}
        </span>
      </div>

      {phase === 'loading' && (
        <div className="dsh-cau_loading">
          <span className="dsh-cau_spinner" />
          <span>加载中…</span>
        </div>
      )}
      {phase === 'error' && (
        <div className="dsh-cau_msg">
          <div className="dsh-cau_msgText">文章读取失败（正文可能尚未抓取入库，可点下方「查看原文」）。</div>
          {art && art.url ? (
            <a className="dsh-cau_msgBtn" href={art.url} target="_blank" rel="noreferrer">
              查看原文
            </a>
          ) : null}
          <button type="button" className="dsh-cau_msgBtn" onClick={() => void reload()}>
            重试
          </button>
        </div>
      )}

      {phase === 'ready' && art && (
        <>
          <h1 className="dsh-cau_atitle">{art.title || '(无标题)'}</h1>
          <div className="dsh-cau_ameta">
            {art.source && <span>{art.source}</span>}
            {art.time && <span>{fmt(art.time)}</span>}
            {art.is_image_only && <span className="dsh-cau_aimgTag">纯图公告</span>}
          </div>

          {art.ai?.summary && (
            <div className="dsh-cau_asummary">
              <div className="dsh-cau_asumHead">
                <span className="dsh-cau_secMark" />
                <span>AI 摘要</span>
              </div>
              <div className="dsh-cau_asumText">{art.ai.summary}</div>
            </div>
          )}

          {!art.ai?.summary && !aiOut && (
            <div className="dsh-cau_asummary">
              <div className="dsh-cau_asumHead">
                <span className="dsh-cau_secMark" />
                <span>AI 摘要</span>
              </div>
              <div className="dsh-cau_asumText dsh-cau_empty">本文暂无 AI 加工（摘要/分类/重要度/deadline）。</div>
              <div className="dsh-cau_aactions">
                <button type="button" className="dsh-cau_aBtn" disabled={aiBusy} onClick={() => void runEnrich()}>
                  {aiBusy ? '加工中…' : '✨ AI 补摘要'}
                </button>
              </div>
              {aiErr && <div className="dsh-cau_setErr">{aiErr}</div>}
            </div>
          )}

          {aiOut && (
            <div className="dsh-cau_asummary">
              <div className="dsh-cau_asumHead">
                <span className="dsh-cau_secMark" />
                <span>AI 摘要（本次会话内生成）</span>
              </div>
              {aiOut.summary && <div className="dsh-cau_asumText">{aiOut.summary}</div>}
              <div className="dsh-cau_ameta">
                {aiOut.category && <span>分类：{aiOut.category}</span>}
                {aiOut.importance && <span>重要度：{aiOut.importance}</span>}
                {aiOut.deadline_note && <span className="dsh-cau_setErr">{aiOut.deadline_note}</span>}
              </div>
            </div>
          )}

          {hasDeadline && (
            <div className="dsh-cau_adeadline">
              <span className="dsh-cau_adeadlineIcon">⏰</span>
              <span className="dsh-cau_adeadlineItem">{art.ai.deadline.item}</span>
              <span className="dsh-cau_adeadlineDate">{art.ai.deadline.date}</span>
              {art.ai.deadline.evidence && <span className="dsh-cau_adeadlineEv">「{art.ai.deadline.evidence}」</span>}
            </div>
          )}

          <div className="dsh-cau_abody">{art.body || <span className="dsh-cau_empty">正文未抓取。请点「查看原文」。</span>}</div>

          <div className="dsh-cau_aactions">
            {art.url && (
              <a className="dsh-cau_aBtn" href={art.url} target="_blank" rel="noreferrer">
                查看原文 ↗
              </a>
            )}
            <button
              type="button"
              className={'dsh-cau_aBtn' + (followed ? ' dsh-cau_aBtnOn' : '')}
              onClick={toggleFollowNow}
            >
              {followed ? '已关注 ⭐' : '加入关注'}
            </button>
            {hasDeadline && (
              <>
                <button
                  type="button"
                  className={'dsh-cau_aBtn' + (op === 'pin' ? ' dsh-cau_aBtnOn' : '')}
                  onClick={() => setDeadlineOpState(setDeadlineOp(articleId, op === 'pin' ? null : 'pin')[articleId] || null)}
                >
                  留存待办
                </button>
                <button
                  type="button"
                  className={'dsh-cau_aBtn' + (op === 'archive' ? ' dsh-cau_aBtnOn' : '')}
                  onClick={() => setDeadlineOpState(setDeadlineOp(articleId, op === 'archive' ? null : 'archive')[articleId] || null)}
                >
                  归档
                </button>
              </>
            )}
          </div>

          {(siblings && siblings.length > 1) && (
            <div className="dsh-cau_anav">
              {index != null && index > 0 ? (
                <button
                  type="button"
                  className="dsh-cau_anavBtn"
                  onClick={() => onOpenArticle(siblings[index - 1].id, siblings, index - 1)}
                >
                  ‹ 上一篇
                </button>
              ) : (
                <span />
              )}
              {index != null && index < siblings.length - 1 ? (
                <button
                  type="button"
                  className="dsh-cau_anavBtn"
                  onClick={() => onOpenArticle(siblings[index + 1].id, siblings, index + 1)}
                >
                  下一篇 ›
                </button>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
