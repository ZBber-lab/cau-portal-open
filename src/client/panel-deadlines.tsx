/**
 * cau-portal 待办中心（下半部分「全部待办」点进来的视图）：
 * 展示全部未过期截止事项（summary.deadlines 全量，不再限 7 天）；
 * 顶部时间跨度筛选（剩余天数 7/30/90/全部）；每条可点进文章、可加/移「⭐ 我的事项」。
 */
import { useEffect, useMemo, useState } from 'react'
import { readCloudJson, loadMine, addMine, removeMine, isMine, mineDeadlineOf, loadDeadlineOps, setDeadlineOp, daysLeft } from './data'
import { Empty } from './empty'
import { Ic } from './icons'

export function DeadlinesView(props: { onBack: () => void; onOpenArticle: (id: string) => void }) {
  const { onBack, onOpenArticle } = props
  const [summary, setSummary] = useState<any>(null)
  const [range, setRange] = useState<number | 'all'>(30)
  const [mine, setMine] = useState<Record<string, any>>(() => loadMine())
  const [ops, setOps] = useState<Record<string, any>>(() => loadDeadlineOps())
  const [busy, setBusy] = useState('')

  useEffect(() => {
    let alive = true
    void readCloudJson('data/summary.json').then((s) => {
      if (alive) setSummary(s)
    })
    return () => {
      alive = false
    }
  }, [])

  const rows = useMemo(() => {
    const all = (summary?.deadlines || []) as any[]
    // 归档 = 从当前待办列表移除（找回/取消归档走首页「归档」入口）
    const active = all.filter((d) => ops[d.article_id || d.url] !== 'archive')
    const list = active.map((d) => ({ d, n: daysLeft(d.date) }))
    if (range !== 'all') return list.filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n <= range)
    return list
  }, [summary, range, ops])

  const archivedCount = useMemo(
    () => (summary?.deadlines || []).filter((d: any) => ops[d.article_id || d.url] === 'archive').length,
    [summary, ops],
  )

  const toggleMine = async (d: any) => {
    const id = d.article_id || d.url
    if (busy) return
    setBusy(id)
    if (isMine(id)) {
      removeMine(id)
      setMine(loadMine())
    } else {
      await addMine(id, { title: d.item || d.title || '(事项)', url: d.url || '', deadline: d.date, source: d.source, column: d.column })
      setMine(loadMine())
    }
    setBusy('')
  }

  const sorted = [...rows].sort((a, b) => String(a.d.date).localeCompare(String(b.d.date)))

  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={onBack}>
          <Ic n="chevLeft" />
          返回
        </button>
        <span className="dsh-cau_breadPath">全部待办</span>
      </div>
      <div className="dsh-cau_dlHint">
        所有含截止日期的事项（未过期，按截止日升序）。「我的事项」可精选到首页大卡面板；「归档」后从本列表消失，可在首页「归档」入口找回或取消归档。
        {archivedCount > 0 && <span className="dsh-cau_dlArch">已归档 {archivedCount} 条</span>}
      </div>
      <div className="dsh-cau_chips" style={{ marginBottom: 8 }}>
        {([7, 30, 90, 'all'] as const).map((k) => (
          <button key={k} type="button" className={'dsh-cau_dlChip' + (range === k ? ' on' : '')} onClick={() => setRange(k)}>
            {k === 'all' ? '全部' : `剩余 ${k} 天内`}
          </button>
        ))}
      </div>

      {!summary ? (
        <div className="dsh-cau_loading">
          <span className="dsh-cau_spinner" />
          <span>加载中…</span>
        </div>
      ) : sorted.length === 0 ? (
        <Empty icon={<Ic n="clipboard" />} main="当前筛选下暂无截止事项" sub={`全部未过期截止共 ${(summary?.deadlines || []).length} 条`} />
      ) : (
        <div className="dsh-cau_dlList">
          {sorted.map(({ d, n }: any) => {
            const id = d.article_id || d.url
            const mined = !!mine[id]
            const archived = ops[id] === 'archive'
            return (
              <div className={'dsh-cau_dlRow' + (n <= 1 ? ' due' : n <= 3 ? ' soon' : '')} key={id}>
                <div className="dsh-cau_dlTop">
                  <span className="dsh-cau_dlItem">{d.item || '截止事项'}</span>
                  <span className="dsh-cau_dlDate">
                    {d.date} · {n < 0 ? '已过期' : n === 0 ? '今天' : `剩 ${n} 天`}
                  </span>
                  {d.column && <span className="dsh-cau_dlCol">{d.column}</span>}
                </div>
                <div className="dsh-cau_dlTitleWrap">
                  <span className="dsh-cau_dlTitle" title={d.title} onClick={() => onOpenArticle(id)}>
                    {d.title}
                  </span>
                  <span className="dsh-cau_dlAct">
                    <button type="button" className={'dsh-cau_textBtn' + (mined ? ' dsh-cau_on' : '')} disabled={busy === id} onClick={() => void toggleMine(d)}>
                      <Ic n={mined ? 'starFill' : 'star'} />
                      {mined ? '已在我的事项' : '我的事项'}
                    </button>
                    <button
                      type="button"
                      className="dsh-cau_textBtn"
                      disabled={busy === id}
                      onClick={() => {
                        const next = { ...ops, [id]: 'archive' }
                        setOps(next)
                        setDeadlineOp(id, 'archive')
                      }}
                    >
                      <Ic n="archive" />
                      归档
                    </button>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
