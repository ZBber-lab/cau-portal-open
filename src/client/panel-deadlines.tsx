/**
 * cau-portal 待办中心（下半部分「全部待办」点进来的视图）：
 * 展示全部未过期截止事项（summary.deadlines 全量，不再限 7 天）；
 * 顶部时间跨度筛选（剩余天数 7/30/90/全部）；每条可点进文章、可加/移「⭐ 我的事项」。
 */
import { useEffect, useMemo, useState } from 'react'
import { readCloudJson, loadMine, addMine, removeMine, isMine, mineDeadlineOf } from './data'

function daysLeft(date: string): number {
  return Math.ceil((Date.parse(date) - Date.now()) / 86400e3)
}

export function DeadlinesView(props: { onBack: () => void; onOpenArticle: (id: string) => void }) {
  const { onBack, onOpenArticle } = props
  const [summary, setSummary] = useState<any>(null)
  const [range, setRange] = useState<number | 'all'>(30)
  const [mine, setMine] = useState<Record<string, any>>(() => loadMine())
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
    const list = all.map((d) => ({ d, n: daysLeft(d.date) }))
    if (range !== 'all') return list.filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n <= range)
    return list
  }, [summary, range])

  const toggleMine = async (d: any) => {
    const id = d.article_id || d.url
    if (busy) return
    setBusy(id)
    if (isMine(id)) {
      removeMine(id)
      setMine(loadMine())
    } else {
      await addMine(id, { title: d.title || '', url: d.url || '', deadline: d.date, source: d.source, column: d.column })
      setMine(loadMine())
    }
    setBusy('')
  }

  const sorted = [...rows].sort((a, b) => String(a.d.date).localeCompare(String(b.d.date)))

  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={onBack}>
          ‹ 返回
        </button>
        <span className="dsh-cau_breadPath">全部待办</span>
      </div>
      <div className="dsh-cau_dlHint">所有含截止日期的事项（未过期，按截止日升序）。「⭐ 我的事项」可精选到首页大卡面板。</div>
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
        <div className="dsh-cau_empty">当前筛选下暂无截止事项（全部未过期截止共 {(summary?.deadlines || []).length} 条）</div>
      ) : (
        <div className="dsh-cau_dlList">
          {sorted.map(({ d, n }: any) => {
            const id = d.article_id || d.url
            const mined = !!mine[id]
            return (
              <div className="dsh-cau_dlRow" key={id}>
                <div className="dsh-cau_dlTop">
                  <span className="dsh-cau_dlItem">{d.item || '截止事项'}</span>
                  <span className="dsh-cau_dlDate">
                    {d.date} · {n === 0 ? '今天' : `剩 ${n} 天`}
                  </span>
                  {d.column && <span className="dsh-cau_dlCol">{d.column}</span>}
                </div>
                <div className="dsh-cau_dlTitleWrap">
                  <span className="dsh-cau_dlTitle" title={d.title} onClick={() => onOpenArticle(id)}>
                    {d.title}
                  </span>
                  <span className="dsh-cau_dlAct">
                    <button type="button" className={'dsh-cau_textBtn' + (mined ? ' dsh-cau_on' : '')} disabled={busy === id} onClick={() => void toggleMine(d)}>
                      {mined ? '⭐ 已在我的事项' : '☆ 我的事项'}
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

/** 供首页复用：行是否已在「我的事项」 */
export function mineIdOf(d: any): string {
  return d?.article_id || d?.url || ''
}
