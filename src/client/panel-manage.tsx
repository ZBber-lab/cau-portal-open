/**
 * cau-portal 数据管理视图（管理模式）：
 * 浏览全部数据（按站点/栏目分组）、一键「选择全部旧数据」（>2 个月）、手动勾选、
 * 删除所选（二次确认；关注中条目附警示）→ 提交云端删除清单（下轮抓取 ≤2h 执行），
 * 本地立即隐藏；可随时退出管理模式。
 */
import { useEffect, useMemo, useState } from 'react'
import { readCloudJson, readFeed, loadFollow, isPruned, queuePruneRequest } from './data'

const OLD_DAYS = 60

type MgRow = {
  id: string // 文章 base 或 URL（用于本地过滤/显示）
  submit: string // 提交给 prune 清单的键：文章文件名（xxxx.json）或 URL
  url: string
  title: string
  date: string | null
  siteKey: string
  siteName: string
  colName: string
  isOld: boolean
  followed: boolean
}

const idKey = (it: any): string =>
  (typeof it.article === 'string' ? it.article.replace(/\.json$/, '') : '') || it.url || ''
const submitKey = (it: any): string => (typeof it.article === 'string' ? it.article : it.url || '')

function daysAgo(s: string | null | undefined): number | null {
  const t = Date.parse(String(s ?? ''))
  if (!Number.isFinite(t)) return null
  return Math.max(0, Math.floor((Date.now() - t) / 86400000))
}

/** 关键词高亮：命中片段包 <mark>；q 空时原样返回 */
function highlight(text: string, q: string): React.ReactNode {
  const t = String(text ?? '')
  const ql = q.trim().toLowerCase()
  if (!ql) return t
  const lower = t.toLowerCase()
  const parts: React.ReactNode[] = []
  let i = 0
  let idx = lower.indexOf(ql, i)
  let k = 0
  while (idx >= 0 && k < 30) {
    if (idx > i) parts.push(t.slice(i, idx))
    parts.push(
      <span key={k} className="dsh-cau_mgHl">
        {t.slice(idx, idx + ql.length)}
      </span>,
    )
    k++
    i = idx + ql.length
    idx = lower.indexOf(ql, i)
  }
  if (i < t.length) parts.push(t.slice(i))
  return parts.length ? parts : t
}

export function ManageView(props: { onBack: () => void }) {
  const { onBack } = props
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [rows, setRows] = useState<MgRow[]>([])
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'old' | 'new'>('all')
  const [siteFilter, setSiteFilter] = useState('')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setPhase('loading')
    const idx = await readCloudJson('data/index.json')
    if (!idx?.sites) {
      setError('无法读取云端目录（index.json）')
      setPhase('error')
      return
    }
    const followSet = new Set(loadFollow().map((f: any) => f.id))
    const out: MgRow[] = []
    for (const site of idx.sites as any[]) {
      for (const col of site.columns || []) {
        const f = await readFeed(site.id, col.key)
        if (!f || !Array.isArray(f.items)) continue
        for (const it of f.items || []) {
          if (!it?.url) continue
          const id = idKey(it)
          if (isPruned(id)) continue
          const t = daysAgo(it.date ?? it.first_seen)
          out.push({
            id,
            submit: submitKey(it),
            url: it.url,
            title: it.title || '(无标题)',
            date: it.date || null,
            siteKey: site.id,
            siteName: f.site_name || site.name || site.id,
            colName: f.column_name || col.name || '',
            isOld: t !== null ? t > OLD_DAYS : false,
            followed: followSet.has(id),
          })
        }
      }
    }
    setRows(out)
    setPhase('ready')
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shown = useMemo(() => {
    let list = rows
    if (filter === 'old') list = list.filter((r) => r.isOld)
    if (filter === 'new') list = list.filter((r) => !r.isOld)
    if (siteFilter) list = list.filter((r) => r.siteKey === siteFilter)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((r) => (r.title || '').toLowerCase().includes(q) || (r.url || '').toLowerCase().includes(q))
    return list
  }, [rows, filter, siteFilter, query])

  const oldCount = useMemo(() => rows.filter((r) => r.isOld).length, [rows])
  const sites = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of rows) if (!m.has(r.siteKey)) m.set(r.siteKey, r.siteName)
    return [...m.entries()]
  }, [rows])

  const selOld = useMemo(() => rows.filter((r) => r.isOld && sel.has(r.id)).length, [rows, sel])
  const selFollow = useMemo(() => rows.filter((r) => r.followed && sel.has(r.id)).length, [rows, sel])

  const toggle = (id: string) => {
    setSel((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const selectAllOld = () => setSel(new Set(rows.filter((r) => r.isOld).map((r) => r.id)))
  const clearSel = () => setSel(new Set())

  const doDelete = async () => {
    setBusy(true)
    setError('')
    const chosen = rows.filter((r) => sel.has(r.id))
    const res = await queuePruneRequest(chosen.map((r) => r.submit))
    setBusy(false)
    if (res.ok) {
      setDone(`已提交删除 ${chosen.length} 条（云端队列共 ${res.total} 条）。本地已隐藏，云端将在下一轮抓取（≤2 小时）后真正删除。`)
      setRows((prev) => prev.filter((r) => !sel.has(r.id)))
      setSel(new Set())
      setConfirm(false)
      setFilter('all')
      setSiteFilter('')
    } else {
      setError(`提交失败：${res.error || '未知错误'}（可稍后重试）`)
    }
  }

  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={onBack}>
          ‹ 退出管理
        </button>
        <span className="dsh-cau_breadPath">数据管理</span>
      </div>

      <div className="dsh-cau_mgIntro">
        选择要删除的数据（旧数据 = 超过 2 个月）。删除不可恢复：本地立即隐藏，云端将于下一轮抓取（≤2 小时）后真正删除；关注中的文章将保留本地缓存可读。
      </div>

      {phase === 'loading' && (
        <div className="dsh-cau_loading">
          <span className="dsh-cau_spinner" />
          <span>加载数据目录…</span>
        </div>
      )}
      {phase === 'error' && <div className="dsh-cau_mgMsg error">{error}</div>}

      {phase === 'ready' && (
        <>
          <div className="dsh-cau_mgToolbar">
            <input
              className="dsh-cau_mgSearch"
              type="search"
              placeholder="搜索标题或链接…（与筛选叠加）"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="dsh-cau_mgFilters">
              {(['all', 'old', 'new'] as const).map((k) => (
                <button key={k} type="button" className={'dsh-cau_mgChip' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>
                  {k === 'all' ? `全部 ${rows.length}` : k === 'old' ? `旧数据 ${oldCount}` : '近 2 个月'}
                </button>
              ))}
              <select className="dsh-cau_mgSel" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} title="按站点筛选">
                <option value="">全部站点</option>
                {sites.map(([k, n]) => (
                  <option key={k} value={k}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="dsh-cau_mgActs">
              <button type="button" className="dsh-cau_mgBtn" onClick={selectAllOld} title="勾选全部超过 2 个月的数据">
                选择全部旧数据
              </button>
              <button type="button" className="dsh-cau_mgBtn" onClick={clearSel} disabled={!sel.size}>
                清空选择
              </button>
            </div>
          </div>

          <div className="dsh-cau_mgBar">
            已选 <b>{sel.size}</b> 条（旧 {selOld} · 关注中 {selFollow}）
            <button type="button" className="dsh-cau_mgDel" disabled={!sel.size || busy} onClick={() => setConfirm(true)}>
              删除所选（{sel.size}）
            </button>
          </div>

          {confirm && (
            <div className="dsh-cau_mgConfirm">
              <div className="dsh-cau_mgConfirmText">
                确定删除所选 <b>{sel.size}</b> 条数据？{' '}
                {selFollow > 0 && (
                  <>
                    <b style={{ color: 'var(--dsw-alias-state-warn,#b8860b)' }}>{selFollow} 条关注中</b>（本地缓存仍可读，但云端将删除）
                  </>
                )}{' '}
                删除不可恢复。
              </div>
              <div className="dsh-cau_mgConfirmActs">
                <button type="button" className="dsh-cau_mgBtn warn" disabled={busy} onClick={() => void doDelete()}>
                  {busy ? '提交中…' : '确认删除'}
                </button>
                <button type="button" className="dsh-cau_mgBtn" disabled={busy} onClick={() => setConfirm(false)}>
                  取消
                </button>
              </div>
            </div>
          )}
          {done && <div className="dsh-cau_mgMsg ok">{done}</div>}
          {error && <div className="dsh-cau_mgMsg error">{error}</div>}

          <div className="dsh-cau_mgList">
            {shown.length === 0 && <div className="dsh-cau_empty">没有符合条件的数据</div>}
            {sites
              .map(([k, n]) => ({ k, n, items: shown.filter((r) => r.siteKey === k) }))
              .filter((g) => g.items.length)
              .map((g) => (
                <div key={g.k} className="dsh-cau_mgGroup">
                  <div className="dsh-cau_mgGroupName">{g.n}</div>
                  {g.items.map((r) => (
                    <label key={r.id} className="dsh-cau_mgRow">
                      <input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} />
                      <span className="dsh-cau_mgRowMain">
                        <span className="dsh-cau_mgRowTitle">
                          {highlight(r.title, query)}
                          {r.followed && <span className="dsh-cau_mgStar" title="关注中">★</span>}
                        </span>
                        <span className="dsh-cau_mgRowSub">
                          {r.colName}
                          {r.date ? ` · ${r.date}` : ''}
                          {r.isOld && <span className="dsh-cau_mgOld">超过 2 个月</span>}
                          {r.url && <span className="dsh-cau_mgRowUrl">{highlight(r.url, query)}</span>}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
