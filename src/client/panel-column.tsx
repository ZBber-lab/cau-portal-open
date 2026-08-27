/**
 * cau-portal L1：栏目页（阶段4 第4步 批②/③）。
 * site 视图=该学院全部栏目合并；column 视图=单栏。行=标题+AI 摘要+重要度徽章+未读点+栏目，
 * 顶部主题标签（讲座/竞赛/评奖/选课/学术等，来自 ai.category）跨站聚合筛选；点行进 L2。
 * 数据：index.json（站点/栏目目录）+ summary.json（ai_map 徽章与筛选）+ feed/<site>__<col>.json。
 */
import { useEffect, useMemo, useState } from 'react'
import { readCloudJson, loadReadSet, readFeed } from './data'

type Row = {
  id: string
  url: string
  title: string
  date?: string | null
  site_name?: string
  column_name?: string
  ai?: { summary?: string; category?: string; importance?: string; deadline?: { date?: string } | null } | null
}

const articleId = (item: any): string =>
  (typeof item.article === 'string' ? item.article.replace(/\.json$/, '') : '') || item.url || ''

function ImpBadge({ level }: { level?: string }) {
  const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow'
  return <span className={`dsh-cau_badge ${cls}`}>{level || '低'}</span>
}

export function ColumnView(props: {
  site: string
  column?: string
  siteName?: string
  columnName?: string
  onBack: () => void
  onOpenArticle: (id: string, siblings: { id: string; title: string }[], index: number) => void
  onOpenColumn: (site: string, column: string | null) => void
}) {
  const { site, column, siteName, columnName, onBack, onOpenArticle, onOpenColumn } = props
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [summary, setSummary] = useState<any>(null)
  const [indexJson, setIndexJson] = useState<any>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [tag, setTag] = useState('全部')
  const [readSet, setReadSet] = useState<string[]>(() => loadReadSet())
  const [siteLabel, setSiteLabel] = useState(siteName || site)
  const [colLabel, setColLabel] = useState(columnName || '')

  const load = async () => {
    setPhase('loading')
    const [idx, sum] = await Promise.all([readCloudJson('data/index.json'), readCloudJson('data/summary.json')])
    setIndexJson(idx)
    setSummary(sum)
    // 从 index 推导站点/栏目中文名（shell 不传原名时用）
    if (idx) {
      const siteDir = (idx.sites || []).find((s: any) => s.id === site)
      const sn = siteDir?.name || siteName || site
      setSiteLabel(sn)
      const cn = column ? siteDir?.columns?.find((c: any) => c.key === column)?.name || columnName || '' : ''
      setColLabel(cn)
    }
    // 加载 feed
    let feeds: any[] = []
    if (!column && idx) {
      const siteDir = (idx.sites || []).find((s: any) => s.id === site)
      if (siteDir) {
        for (const c of siteDir.columns || []) {
          const f = await readFeed(site, c.key)
          if (f && Array.isArray(f.items)) feeds.push(f)
        }
      }
    } else {
      const f = await readFeed(site, column as string)
      if (f && Array.isArray(f.items)) feeds.push(f)
    }
    const aiMap = sum?.ai_map || {}
    const out: Row[] = []
    for (const f of feeds) {
      for (const it of f.items || []) {
        const id = articleId(it)
        out.push({
          id,
          url: it.url || '',
          title: it.title || '',
          date: it.date || null,
          site_name: f.site_name || f.site || site,
          column_name: f.column_name || '',
          ai: aiMap[id.replace(/\.json$/, '')] || null,
        })
      }
    }
    out.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    setRows(out)
    setTag('全部')
    setPhase('ready')
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, column])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) if (r.ai?.category && r.ai.category !== '其他') set.add(r.ai.category)
    return ['全部', ...set]
  }, [rows])

  const visible = useMemo(
    () => (tag === '全部' ? rows : rows.filter((r) => r.ai?.category === tag)),
    [rows, tag],
  )

  const openRow = (r: Row, index: number) => {
    const sibs = visible.map((x) => ({ id: x.id, title: x.title }))
    if (r.id && /^[0-9a-f]{40}$/.test(r.id.replace(/\.json$/, ''))) {
      onOpenArticle(r.id, sibs, index)
    } else {
      // 无已存正文：新标签开原文
      if (r.url) window.open(resolveUrl(r.url, site), '_blank', 'noopener')
    }
  }

  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={onBack}>
          ‹ 返回
        </button>
        <span className="dsh-cau_breadPath">{column ? [siteLabel, colLabel].filter(Boolean).join(' / ') : siteLabel || site}</span>
      </div>

      {phase === 'loading' && (
        <div className="dsh-cau_loading">
          <span className="dsh-cau_spinner" />
          <span>加载中…</span>
        </div>
      )}
      {phase === 'error' && (
        <div className="dsh-cau_msg">
          <div className="dsh-cau_msgText">栏目加载失败。</div>
          <button type="button" className="dsh-cau_msgBtn" onClick={() => void load()}>
            重试
          </button>
        </div>
      )}

      {phase === 'ready' && (
        <>
          {categories.length > 1 && (
            <div className="dsh-cau_tags">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={'dsh-cau_tag' + (tag === c ? ' dsh-cau_tagOn' : '')}
                  onClick={() => setTag(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="dsh-cau_list">
            {visible.length === 0 && <div className="dsh-cau_empty">暂无内容</div>}
            {visible.map((r, i) => {
              const read = r.id && readSet.includes(r.id)
              return (
                <button type="button" className="dsh-cau_row" key={r.id + r.url} onClick={() => openRow(r, i)}>
                  <span className="dsh-cau_rowDot" data-read={read ? '1' : '0'} />
                  <span className="dsh-cau_rowMain">
                    <span className="dsh-cau_rowTop">
                      <span className="dsh-cau_rowTitle">{r.title}</span>
                      {r.ai?.importance && <ImpBadge level={r.ai.importance} />}
                    </span>
                    {r.ai?.summary && <span className="dsh-cau_rowSummary">{r.ai.summary}</span>}
                    <span className="dsh-cau_rowMeta">
                      {[r.column_name, r.date].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function resolveUrl(url: string, siteId: string): string {
  if (/^https?:\/\//i.test(url)) return url
  const host: Record<string, string> = { clst: 'https://clst.cau.edu.cn', jwc: 'https://jwc.cau.edu.cn', news: 'https://news.cau.edu.cn' }
  const root = host[siteId]
  return root ? root + (url.startsWith('/') ? url : '/' + url) : url
}
