/**
 * cau-portal L0：首页聚合（阶段4 第4步 批②/③）。
 * 待办截止卡（能手动 留存/归档；点击→原文；「归档 n」入口回溯）+ 要闻（AI 重要，上限10、可加入关注）+
 * 关注栏（无上限）+ 栏目频道（可点进学院/栏目专栏，列出全部推文）+ 快捷入口。
 * 数据：index.json + summary.json（缓存由调用方/本组件直接读云端，量小）。
 */
import { useEffect, useMemo, useState } from 'react'
import { readCloudJson, loadReadSet, markAllRead, loadFollow, saveFollow, loadDeadlineOps, setDeadlineOp, isPruned } from './data'

type DeadlineItem = { item: string; date: string; title: string; article_id?: string; url?: string; column?: string; source?: string; time?: string | null }

function fmtCn(iso: string | null | undefined): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(iso)
  return m ? `${+m[2]}月${+m[3]}日` : ''
}
function daysLeft(date: string): number {
  const d = Date.parse(date)
  if (!Number.isFinite(d)) return Number.NaN
  const day0 = new Date(); day0.setHours(0, 0, 0, 0)
  return Math.round((d - day0.getTime()) / 86400000)
}

function ImpBadge({ level }: { level?: string }) {
  const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow'
  return <span className={`dsh-cau_badge ${cls}`}>{level || '低'}</span>
}

export function HomeView(props: {
  onOpenColumn: (site: string, column: string | null) => void
  onOpenArticle: (id: string, siblings: { id: string; title: string }[], index: number) => void
  onViewArchive: () => void
  onViewFollow: () => void
}) {
  const { onOpenColumn, onOpenArticle, onViewArchive, onViewFollow } = props
  const [phase, setPhase] = useState<'loading' | 'maybe-token' | 'error' | 'ready'>('loading')
  const [indexJson, setIndexJson] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [readSet, setReadSet] = useState<string[]>(() => loadReadSet())
  const [follow, setFollow] = useState<any[]>(() => loadFollow())
  const [ops, setOps] = useState<Record<string, any>>(() => loadDeadlineOps())
  const [needToken, setNeedToken] = useState(false)

  const load = async () => {
    setPhase('loading')
    const [idx, sum] = await Promise.all([readCloudJson('data/index.json'), readCloudJson('data/summary.json')])
    if (!idx && !sum) {
      setNeedToken(true)
      setPhase('maybe-token')
      return
    }
    setIndexJson(idx)
    setSummary(sum)
    setPhase('ready')
  }

  useEffect(() => {
    void load()
  }, [])

  const important = useMemo(
    () => (summary?.important || []).filter((it: any) => !isPruned(it.article_id || it.url)).slice(0, 10),
    [summary],
  )

  const deadlines = useMemo(() => {
    const all = (summary?.deadlines || [])
      .map((d: DeadlineItem) => ({ d, n: daysLeft(d.date) }))
      .filter((x: any) => Number.isFinite(x.n) && x.n >= 0 && x.n <= 7)
    const notArchived = all.filter((x: any) => !isPruned(x.d.article_id || x.d.url) && ops[x.d.article_id || x.d.url] !== 'archive')
    const pinned = notArchived.filter((x: any) => ops[x.d.article_id || x.d.url] === 'pin')
    const rest = notArchived.filter((x: any) => ops[x.d.article_id || x.d.url] !== 'pin')
    return [...pinned, ...rest].slice(0, 8)
  }, [summary, ops])

  const archiveCount = useMemo(
    () => (summary?.deadlines || []).filter((d: DeadlineItem) => ops[d.article_id || d.url] === 'archive').length,
    [summary, ops],
  )

  const openArt = (id: string, title: string, sibs: { id: string; title: string }[], index: number) => {
    if (id && /^[0-9a-f]{40}$/.test(id.replace(/\.json$/, ''))) onOpenArticle(id, sibs, index)
  }

  const toggleFollow = (it: any) => {
    const cur = loadFollow()
    const idx = cur.findIndex((x) => x.id === it.id)
    let next: any[]
    if (idx >= 0) next = cur.filter((x) => x.id !== it.id)
    else next = [{ id: it.id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary }, ...cur]
    saveFollow(next)
    setFollow(next)
  }

  const allImportantIds = useMemo(() => important.map((it: any) => it.article_id || it.url), [important])

  return (
    <div className="dsh-cau_view">
      {phase === 'loading' && (
        <div className="dsh-cau_loading">
          <span className="dsh-cau_spinner" />
          <span>加载中…</span>
        </div>
      )}
      {phase === 'maybe-token' && (
        <div className="dsh-cau_msg">
          <div className="dsh-cau_msgText">需要 GitHub 只读令牌才能读取云端数据。</div>
          <button type="button" className="dsh-cau_msgBtn dsh-cau_msgBtnPrimary" onClick={() => void load()}>
            去配置
          </button>
        </div>
      )}
      {phase === 'error' && (
        <div className="dsh-cau_msg">
          <div className="dsh-cau_msgText">云端读取失败。</div>
          <button type="button" className="dsh-cau_msgBtn" onClick={() => void load()}>
            重试
          </button>
        </div>
      )}
      {phase === 'ready' && (
        <>
          {!summary && <div className="dsh-cau_hint">聚合数据生成中…栏目与快捷入口仍可用。</div>}
          {(summary?.summaryReason === 'missing' || summary?.summaryReason === 'error') && (
            <div className="dsh-cau_hint">⭐ 待办与要闻聚合暂不可用（云端 summary.json 未就绪），其余功能正常。</div>
          )}

          {/* 待办截止 */}
          <div className="dsh-cau_sec">
            <div className="dsh-cau_secHead">
              <span className="dsh-cau_secMark" />
              <span className="dsh-cau_secTitle">⏰ 待办截止</span>
              {archiveCount > 0 && (
                <button type="button" className="dsh-cau_textBtn" onClick={onViewArchive}>
                  归档 {archiveCount}
                </button>
              )}
            </div>
            <div className="dsh-cau_card">
              {!summary && <div className="dsh-cau_empty">聚合数据暂不可用</div>}
              {summary && deadlines.length === 0 && <div className="dsh-cau_empty">未来 7 天暂无截止事项</div>}
              {deadlines.map(({ d, n }: any) => (
                <div className="dsh-cau_dlRow" key={d.article_id || d.url}>
                  <div className="dsh-cau_dlTop">
                    <span className="dsh-cau_dlItem">{d.item || '截止事项'}</span>
                    <span className="dsh-cau_dlDate">{fmtCn(d.date)} · {n === 0 ? '今天' : `剩 ${n} 天`}</span>
                    {d.column && <span className="dsh-cau_dlCol">{d.column}</span>}
                  </div>
                  <div className="dsh-cau_dlTitleWrap">
                    <span className="dsh-cau_dlTitle" title={d.title} onClick={() => openArt(d.article_id || d.url, d.title, [], 0)}>
                      {d.title}
                    </span>
                    <span className="dsh-cau_dlAct">
                      <button type="button" className={'dsh-cau_textBtn' + (ops[d.article_id || d.url] === 'pin' ? ' dsh-cau_on' : '')} onClick={() => setOps(setDeadlineOp(d.article_id || d.url, ops[d.article_id || d.url] === 'pin' ? null : 'pin'))}>
                        留存
                      </button>
                      <button type="button" className={'dsh-cau_textBtn' + (ops[d.article_id || d.url] === 'archive' ? ' dsh-cau_on' : '')} onClick={() => setOps(setDeadlineOp(d.article_id || d.url, ops[d.article_id || d.url] === 'archive' ? null : 'archive'))}>
                        归档
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 要闻 */}
          <div className="dsh-cau_sec">
            <div className="dsh-cau_secHead">
              <span className="dsh-cau_secMark" />
              <span className="dsh-cau_secTitle">✦ 要闻</span>
              {important.length > 0 && (
                <button type="button" className="dsh-cau_textBtn" onClick={() => setReadSet(markAllRead(allImportantIds))}>
                  全部已读
                </button>
              )}
            </div>
            <div className="dsh-cau_card">
              {!summary && <div className="dsh-cau_empty">聚合数据暂不可用</div>}
              {summary && important.length === 0 && <div className="dsh-cau_empty">暂无重要通知</div>}
              {important.map((it: any, i: number) => {
                const id = it.article_id || it.url
                const read = readSet.includes(id)
                const sibs = important.map((x: any) => ({ id: x.article_id || x.url, title: x.title }))
                return (
                  <div className="dsh-cau_impRow" key={id}>
                    <span className="dsh-cau_impDot" data-read={read ? '1' : '0'} />
                    <span className="dsh-cau_impMain" onClick={() => openArt(id, it.title, sibs, i)}>
                      <span className="dsh-cau_impTop">
                        <span className="dsh-cau_impTitle">{it.title}</span>
                        <ImpBadge level={it.importance} />
                      </span>
                      {it.summary && <span className="dsh-cau_impSummary">{it.summary}</span>}
                      <span className="dsh-cau_impMeta">{[it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ')}</span>
                    </span>
                    <button
                      type="button"
                      className={'dsh-cau_followBtn' + (follow.some((x) => x.id === id) ? ' dsh-cau_on' : '')}
                      title={follow.some((x) => x.id === id) ? '取消关注' : '加入关注'}
                      onClick={() => toggleFollow({ id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary })}
                    >
                      {follow.some((x) => x.id === id) ? '⭐' : '☆'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 关注栏 */}
          <div className="dsh-cau_sec">
            <div className="dsh-cau_secHead">
              <span className="dsh-cau_secMark" />
              <span className="dsh-cau_secTitle">⭐ 关注</span>
              {follow.length > 0 && (
                <button type="button" className="dsh-cau_textBtn" onClick={onViewFollow}>
                  查看全部 {follow.length}
                </button>
              )}
            </div>
            <div className="dsh-cau_card">
              {follow.length === 0 && <div className="dsh-cau_empty">在文章里点「加入关注」，重要内容集中在这，不设上限</div>}
              {follow.slice(0, 5).map((it) => (
                <div className="dsh-cau_row" key={it.id}>
                  <span className="dsh-cau_rowDot" data-read="0" />
                  <span className="dsh-cau_rowMain" onClick={() => onOpenArticle(it.id, follow.map((x) => ({ id: x.id, title: x.title })), 0)}>
                    <span className="dsh-cau_rowTitle">{it.title}</span>
                    <span className="dsh-cau_rowMeta">{[it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ')}</span>
                  </span>
                  <button type="button" className="dsh-cau_followBtn dsh-cau_on" title="取消关注" onClick={() => toggleFollow(it)}>
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 栏目频道 */}
          <div className="dsh-cau_sec">
            <div className="dsh-cau_secHead">
              <span className="dsh-cau_secMark" />
              <span className="dsh-cau_secTitle">📚 栏目频道</span>
            </div>
            {(indexJson?.sites || []).map((site: any) => (
              <div className="dsh-cau_colGroup" key={site.id}>
                <button type="button" className="dsh-cau_colSiteBtn" onClick={() => onOpenColumn(site.id, null)}>
                  {site.name} ›
                </button>
                <div className="dsh-cau_colChips">
                  {(site.columns || []).map((c: any) => (
                    <button key={c.key} type="button" className="dsh-cau_chip dsh-cau_chipBtn" onClick={() => onOpenColumn(site.id, c.key)}>
                      {c.name}
                      {typeof c.items === 'number' && <em className="dsh-cau_chipCount">{c.items}</em>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 快捷入口 */}
          <div className="dsh-cau_sec">
            <div className="dsh-cau_secHead">
              <span className="dsh-cau_secMark" />
              <span className="dsh-cau_secTitle">🔗 快捷入口</span>
            </div>
            <div className="dsh-cau_quick">
              <a className="dsh-cau_quickLink" href="https://one.cau.edu.cn" target="_blank" rel="noreferrer">统一门户 ↗</a>
              <a className="dsh-cau_quickLink" href="https://clst.cau.edu.cn" target="_blank" rel="noreferrer">学院官网 ↗</a>
              <a className="dsh-cau_quickLink" href="https://jwc.cau.edu.cn" target="_blank" rel="noreferrer">教务处 ↗</a>
              <a className="dsh-cau_quickLink" href="https://news.cau.edu.cn" target="_blank" rel="noreferrer">校新闻网 ↗</a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
