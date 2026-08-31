/**
 * cau-portal L0：首页聚合（阶段4 第4步 批②/③）。
 * 待办截止卡（能手动 留存/归档；点击→原文；「归档 n」入口回溯）+ 要闻（AI 重要，上限10、可加入关注）+
 * 关注栏（无上限）+ 栏目频道（可点进学院/栏目专栏，列出全部推文）+ 快捷入口。
 * 数据：index.json + summary.json（缓存由调用方/本组件直接读云端，量小）。
 */
import { useEffect, useMemo, useState } from 'react'
import {
  readCloudJson,
  loadReadSet,
  markAllRead,
  loadFollow,
  saveFollow,
  loadDeadlineOps,
  setDeadlineOp,
  isPruned,
  loadModules,
  loadMine,
  removeMine,
  updateMine,
  addCustomMine,
  mineDeadlineOf,
  migrateMineFromPin,
  loadRules,
  matchRules,
} from './data'

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
  onViewDeadlines: () => void
  onReadChange?: () => void
}) {
  const { onOpenColumn, onOpenArticle, onViewArchive, onViewFollow, onViewDeadlines, onReadChange } = props
  const [phase, setPhase] = useState<'loading' | 'maybe-token' | 'error' | 'ready'>('loading')
  const [indexJson, setIndexJson] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [readSet, setReadSet] = useState<string[]>(() => loadReadSet())
  const [follow, setFollow] = useState<any[]>(() => loadFollow())
  const [ops, setOps] = useState<Record<string, any>>(() => loadDeadlineOps())
  const [mine, setMine] = useState<Record<string, any>>(() => loadMine())
  const [mineEdit, setMineEdit] = useState<{ id: string | null; name: string; date: string; url: string } | null>(null)

  const startMineEdit = (id?: string) => {
    setMineEdit(getMineEditDraft(id))
  }
  const getMineEditDraft = (id?: string) => {
    if (id) {
      const m = loadMine()[id]
      const shown = mineRows.find((r: any) => r.id === id)
      return { id, name: shown?.title || m?.title || '', date: mineDeadlineOf(m) || '', url: m?.article_url || '' }
    }
    return { id: null, name: '', date: '', url: '' }
  }
  const [needToken, setNeedToken] = useState(false)
  const mods = useMemo(() => loadModules(), [])

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
    migrateMineFromPin()
    setMine(loadMine())
    setPhase('ready')
  }

  useEffect(() => {
    void load()
  }, [])

  const important = useMemo(
    () =>
      (summary?.important || []).filter(
        (it: any) => !isPruned(it.article_id || it.url) && ops[it.article_id || it.url] !== 'archive',
      ),
    [summary, ops],
  )

  /** 要闻分块：校内平台（统一门户）/ 其他；各限 8 条，归档一条自动补一条 */
  const isPortalIt = (it: any) => /tp_up/.test(String(it.url || ''))
  const portalNews = useMemo(() => (mods.portal ? important.filter(isPortalIt).slice(0, 8) : []), [important, mods.portal])
  const otherNews = useMemo(() => important.filter((it: any) => !isPortalIt(it)).slice(0, 8), [important])

  const archiveFromNews = (id: string) => {
    setDeadlineOp(id, 'archive')
    setOps((prev: any) => ({ ...(prev || {}), [id]: 'archive' }))
  }

  /** 我的事项：精选大卡（标题/日期快照 + 云端 deadline 富集；含已过期） */
  const mineRows = useMemo(() => {
    const dlById = new Map((summary?.deadlines || []).map((d: any) => [d.article_id || d.url, d]))
    return Object.entries(mine)
      .map(([id, m]: any) => {
        const d = dlById.get(id)
        const date = mineDeadlineOf(m) || d?.date || null
        // 事项名语义：m.task=true 用 m.title（用户给定）；旧记录优先 AI 提取的事项名 d.item
        const title = m.task ? m.title || d?.item : d?.item || m.title || d?.title || '(事项)'
        return { id, title, date, column: m.column || d?.column || '', artUrl: m.article_url || d?.url || '', artTitle: d?.title || '' }
      })
      .sort((a: any, b: any) => String(b.date || '9999-12-31').localeCompare(String(a.date || '9999-12-31')))
  }, [mine, summary])

  /** 全部未过期截止数（未归档） */
  const allDeadlines = useMemo(
    () => (summary?.deadlines || []).filter((d: DeadlineItem) => ops[d.article_id || d.url] !== 'archive').length,
    [summary, ops],
  )

  // ---------- 今日要览（主动察觉层：高重要新进 · 3天内截止 · 关注规则命中） ----------
  const watchRules = useMemo(() => loadRules().filter((r) => r.enabled), [])
  const overview = useMemo(() => {
    const imp = (summary?.important || []).filter((it: any) => !isPruned(it.article_id || it.url) && (mods.portal || !isPortalIt(it)))
    const cut = Date.now() - 3 * 86400000
    const recentOk = (t: any) => {
      const x = Date.parse(String(t || ''))
      return !Number.isFinite(x) || x >= cut
    }
    const high = imp.filter((it: any) => it.importance === '高' && recentOk(it.time))
    const hits = imp.filter((it: any) => matchRules(watchRules, it).length > 0 && recentOk(it.time))
    const dueSoon = (summary?.deadlines || []).filter((d: any) => ops[d.article_id || d.url] !== 'archive').filter((d: any) => {
      const n = daysLeft(d.date)
      return Number.isFinite(n) && n >= 0 && n <= 3
    })
    const top = [...high.map((it: any) => ({ ...it, tag: 'high' })), ...hits.map((it: any) => ({ ...it, tag: 'hit' }))]
      .filter((v: any, i: number, arr: any[]) => arr.findIndex((x) => (x.article_id || x.url) === (v.article_id || v.url)) === i)
      .slice(0, 3)
    return { high: high.length, due: dueSoon.length, hits: hits.length, top }
  }, [summary, watchRules, ops, mods.portal])

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

  /** 要闻行（两块共用）：点标题进步详情 / ☆ 关注 / 📥 归档自动补位 */
  const newsRow = (it: any, i: number, sibs: { id: string; title: string }[]) => {
    const id = it.article_id || it.url
    const read = readSet.includes(id)
    return (
      <div className="dsh-cau_impRow" key={id}>
        <span className="dsh-cau_impDot" data-read={read ? '1' : '0'} />
        <span className="dsh-cau_impMain" onClick={() => openArt(id, it.title, sibs, i)}>
          <span className="dsh-cau_impTop">
            <span className="dsh-cau_impTitle">{it.title}</span>
            <ImpBadge level={it.importance} />
            {matchRules(watchRules, it).length > 0 && <span className="dsh-cau_impHit" title="命中关注规则">🎯</span>}
          </span>
          {it.summary && <span className="dsh-cau_impSummary">{it.summary}</span>}
          <span className="dsh-cau_impMeta">{[it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ')}</span>
        </span>
        <span className="dsh-cau_impActs">
          <button
            type="button"
            className={'dsh-cau_followBtn' + (follow.some((x) => x.id === id) ? ' dsh-cau_on' : '')}
            title={follow.some((x) => x.id === id) ? '取消关注' : '加入关注'}
            onClick={() => toggleFollow({ id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary })}
          >
            {follow.some((x) => x.id === id) ? '⭐' : '☆'}
          </button>
          <button type="button" className="dsh-cau_impArch" title="归档（从此处移除，可在「归档」视图中找回）" onClick={() => archiveFromNews(id)}>
            📥
          </button>
        </span>
      </div>
    )
  }

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

          {/* 📌 今日要览：打开面板第一眼（高重要新进 · 即将截止 · 关注规则命中） */}
          {(overview.high > 0 || overview.due > 0 || overview.hits > 0) && (
            <div className="dsh-cau_ov">
              <span className="dsh-cau_ovTitle">📌 今日要览</span>
              {overview.high > 0 && <span className="dsh-cau_ovChip hl">高重要新进 {overview.high}</span>}
              {overview.due > 0 && <span className="dsh-cau_ovChip due">⏰ 3 天内截止 {overview.due}</span>}
              {overview.hits > 0 && <span className="dsh-cau_ovChip hit">🎯 命中关注 {overview.hits}</span>}
              {overview.top.length > 0 && (
                <div className="dsh-cau_ovList">
                  {overview.top.map((it: any) => (
                    <span key={String(it.article_id || it.url)} className="dsh-cau_ovRow" onClick={() => openArt(it.article_id || it.url, it.title, [], 0)}>
                      <em>{it.tag === 'high' ? '高' : '🎯'}</em>
                      <span className="dsh-cau_ovTitleTxt">{it.title}</span>
                      <i>{[it.column, it.source].filter(Boolean).join(' · ')}</i>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 我的事项（人工精选大卡） + 全部待办入口 */}
          {mods.deadline && (
            <div className="dsh-cau_sec">
              <div className="dsh-cau_secHead">
                <span className="dsh-cau_secMark" />
                <span className="dsh-cau_secTitle">⭐ 我的事项</span>
                <span className="dsh-cau_secActs">
                  <button type="button" className="dsh-cau_textBtn" onClick={() => startMineEdit()}>
                    + 自定义事项
                  </button>
                  {allDeadlines > 0 && (
                    <button type="button" className="dsh-cau_textBtn" onClick={onViewDeadlines}>
                      全部待办 {allDeadlines} ›
                    </button>
                  )}
                </span>
              </div>
              {mineRows.length === 0 ? (
                <div className="dsh-cau_empty">点「+ 自定义事项」直接记录要办的事；或在「全部待办」/文章页点「⭐ 我的事项」精选（附原文链接，自动出现在关注区）。</div>
              ) : (
                <div className="dsh-cau_mineGrid">
                  {mineRows.map(({ id, title, date, column, artUrl, artTitle }: any) => {
                    const mm = /^\d{4}-(\d{1,2})-(\d{1,2})/.exec(String(date || ''))
                    const n = date ? daysLeft(String(date)) : Number.NaN
                    const expired = Number.isFinite(n) && n < 0
                    const urgent = Number.isFinite(n) && n >= 0 && n <= 3
                    const canArticle = !String(id).startsWith('custom-')
                    return (
                      <div key={id} className={'dsh-cau_mineCard' + (expired ? ' expired' : urgent ? (n <= 1 ? ' due' : ' soon') : '')}>
                        <div className="dsh-cau_mineDate">
                          {mm ? (
                            <>
                              <span className="dsh-cau_mineDay">{+mm[2]}</span>
                              <span className="dsh-cau_mineYM">{+mm[1]}月</span>
                            </>
                          ) : (
                            <span className="dsh-cau_mineYM">未设日期</span>
                          )}
                          <span className="dsh-cau_mineCount">{!Number.isFinite(n) ? '—' : expired ? '已过期' : n === 0 ? '今天' : `剩 ${n} 天`}</span>
                        </div>
                        <div className="dsh-cau_mineTitle" title={title}>
                          {title}
                        </div>
                        {artTitle && artTitle !== title && (
                          <div className="dsh-cau_mineSrc" title={artTitle}>
                            {artTitle}
                          </div>
                        )}
                        <div className="dsh-cau_mineFoot">
                          {column && <span className="dsh-cau_mineCol">{column}</span>}
                          {!column && <span />}
                          <span className="dsh-cau_mineActs">
                            {artUrl && canArticle && (
                              <button
                                type="button"
                                className="dsh-cau_mineArt"
                                title="打开对应文章"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (id) openArt(id, title, [], 0)
                                }}
                              >
                                原文 ↗
                              </button>
                            )}
                            <button
                              type="button"
                              className="dsh-cau_textBtn"
                              onClick={(e) => {
                                e.stopPropagation()
                                startMineEdit(id)
                              }}
                            >
                              ✎ 编辑
                            </button>
                            <button
                              type="button"
                              className="dsh-cau_textBtn"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeMine(id)
                                setMine(loadMine())
                              }}
                            >
                              ☆ 移出
                            </button>
                          </span>
                        </div>
                        {mineEdit && (mineEdit.id || '') === id && (
                          <div className="dsh-cau_mineEdit" onClick={(e) => e.stopPropagation()}>
                            <label className="dsh-cau_mineLabel">
                              <span>事项名（点此修改，如「土地学院2027推免生报名」）</span>
                              <input className="dsh-cau_setInput" value={mineEdit.name} onChange={(e) => setMineEdit({ ...mineEdit, name: e.target.value })} />
                            </label>
                            <div className="dsh-cau_mineEditRow">
                              <label className="dsh-cau_mineLabel">
                                <span>截止日期</span>
                                <input className="dsh-cau_setInput" type="date" value={mineEdit.date} onChange={(e) => setMineEdit({ ...mineEdit, date: e.target.value })} />
                              </label>
                              <label className="dsh-cau_mineLabel">
                                <span>原文链接（可空）</span>
                                <input className="dsh-cau_setInput" value={mineEdit.url} onChange={(e) => setMineEdit({ ...mineEdit, url: e.target.value })} />
                              </label>
                            </div>
                            <div className="dsh-cau_mineEditRow">
                              <button
                                type="button"
                                className="dsh-cau_textBtn dsh-cau_on"
                                onClick={() => {
                                  if (mineEdit.id) updateMine(mineEdit.id, { title: mineEdit.name, url: mineEdit.url, deadline: mineEdit.date })
                                  else if (mineEdit.name.trim()) addCustomMine({ title: mineEdit.name.trim(), deadline: mineEdit.date, url: mineEdit.url })
                                  setMine(loadMine())
                                  setMineEdit(null)
                                }}
                              >
                                保存
                              </button>
                              <button type="button" className="dsh-cau_textBtn" onClick={() => setMineEdit(null)}>
                                取消
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              {mineEdit && !mineEdit.id && (
                <div className="dsh-cau_mineEdit dsh-cau_mineEditNew">
                  <label className="dsh-cau_mineLabel">
                    <span>事项名（要做什么，如「土地学院2027推免生报名」）</span>
                    <input className="dsh-cau_setInput" value={mineEdit.name} onChange={(e) => setMineEdit({ ...mineEdit, name: e.target.value })} />
                  </label>
                  <div className="dsh-cau_mineEditRow">
                    <label className="dsh-cau_mineLabel">
                      <span>截止日期（可空）</span>
                      <input className="dsh-cau_setInput" type="date" value={mineEdit.date} onChange={(e) => setMineEdit({ ...mineEdit, date: e.target.value })} />
                    </label>
                    <label className="dsh-cau_mineLabel">
                      <span>原文链接（可空）</span>
                      <input className="dsh-cau_setInput" value={mineEdit.url} onChange={(e) => setMineEdit({ ...mineEdit, url: e.target.value })} />
                    </label>
                  </div>
                  <div className="dsh-cau_mineEditRow">
                    <button
                      type="button"
                      className="dsh-cau_textBtn dsh-cau_on"
                      onClick={() => {
                        if (mineEdit.name.trim()) {
                          addCustomMine({ title: mineEdit.name.trim(), deadline: mineEdit.date, url: mineEdit.url })
                          setMine(loadMine())
                          setMineEdit(null)
                        }
                      }}
                    >
                      保存
                    </button>
                    <button type="button" className="dsh-cau_textBtn" onClick={() => setMineEdit(null)}>
                      取消
                    </button>
                  </div>
                </div>
              )}
              <div className="dsh-cau_deadlineEntry">
                <span className="dsh-cau_deadlineEntryMain" role="button" onClick={onViewDeadlines}>
                  📋 全部待办（含所有截止事项）
                  <span className="dsh-cau_deadlineEntryArrow">筛选与查看 ›</span>
                </span>
                {archiveCount > 0 && (
                  <button type="button" className="dsh-cau_textBtn" onClick={onViewArchive}>
                    归档 {archiveCount}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 要闻（一个大框，内分两支：校内平台 / 其他来源；各 ≤8 条，归档自动补位） */}
          <div className="dsh-cau_sec">
            <div className="dsh-cau_secHead">
              <span className="dsh-cau_secMark" />
              <span className="dsh-cau_secTitle">📌 要闻</span>
              {important.length > 0 && (
                <button
                  type="button"
                  className="dsh-cau_textBtn"
                  onClick={() => {
                    setReadSet(markAllRead(allImportantIds))
                    onReadChange?.()
                  }}
                >
                  全部已读
                </button>
              )}
            </div>
            <div className="dsh-cau_card">
              {!summary && <div className="dsh-cau_empty">聚合数据暂不可用</div>}
              {mods.portal && (
                <div className="dsh-cau_newsSubHead">
                  <span>🏛 校内平台</span>
                  <em>{portalNews.length} 条</em>
                </div>
              )}
              {mods.portal && summary && portalNews.length === 0 && <div className="dsh-cau_empty">暂无校内平台重要通知</div>}
              {mods.portal && portalNews.map((it: any, i: number) => newsRow(it, i, portalNews.map((x: any) => ({ id: x.article_id || x.url, title: x.title }))))}
              <div className="dsh-cau_newsSubHead">
                <span>✦ 其他来源</span>
                <em>{otherNews.length} 条</em>
              </div>
              {summary && otherNews.length === 0 && <div className="dsh-cau_empty">暂无其他来源重要通知</div>}
              {otherNews.map((it: any, i: number) => newsRow(it, i, otherNews.map((x: any) => ({ id: x.article_id || x.url, title: x.title }))))}
            </div>
          </div>

          {/* 关注栏 */}
          {mods.deadline && (
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
          )}

          {/* 栏目频道 */}
          <div className="dsh-cau_sec">
            <div className="dsh-cau_secHead">
              <span className="dsh-cau_secMark" />
              <span className="dsh-cau_secTitle">📚 栏目频道</span>
            </div>
            {(indexJson?.sites || []).filter((site: any) => mods.portal || site.id !== 'portal').map((site: any) => (
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
