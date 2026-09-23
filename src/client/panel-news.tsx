/**
 * cau-portal L1：要闻（2026-09-14 用户拍板从首页移到这里）。
 *
 * 为什么移出来：浙大/北大这类外校来源是为保研关注的，条目一多会把农大自己的通知挤掉；
 * 首页只留一行「要闻」入口（带本校/校外条数），点进来才展开列表。
 *
 * 分三栏（`sites.json` 的 `group` 字段驱动，缺省 = 校内其他）：
 *   校内平台（统一门户）/ 校内其他（农大各站）/ 校外来源（外校，接入时显式标 external）
 * **上方三栏点哪个显示哪个**（2026-09-14 用户改定：不要胶囊、不要 emoji、不要装饰，简约为主）。
 * 口径与首页一致：被「栏目频道管理」关掉的来源不进这里；归档/已清理的条目也不进。
 * 「今日要览」与未读计数**照旧包含**校外来源（用户定：保研信息不能漏）。
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
  loadChannels,
  siteShown,
  siteOfItem,
  groupOfItem,
  siteColorOf,
  loadSiteDirectory,
  loadRules,
  matchRules,
  matchQuery,
  GROUP_ORDER,
  GROUP_LABEL,
  type DirSite,
  type SiteGroup,
} from './data'
import { Empty } from './empty'
import { Ic } from './icons'
import { NewsRow } from './news-row'

/** 当前分栏（记住上次选择——进文章再返回不会跳回第一栏） */
const TAB_KEY = 'dsh.cau-portal.newstab.v1'
const isGroup = (v: unknown): v is SiteGroup => v === 'portal' || v === 'campus' || v === 'external'
const loadTab = (): SiteGroup => {
  try {
    const v = localStorage.getItem(TAB_KEY)
    return isGroup(v) ? v : 'portal'
  } catch {
    return 'portal'
  }
}

/** 每栏一句话范围说明（就是「这栏装的是什么」，不放图标、不放装饰） */
const GROUP_NOTE: Record<SiteGroup, string> = {
  portal: '统一门户（one.cau.edu.cn）的通知与公告',
  campus: '农大各站点：土地学院 · 教务处 · 校新闻网 · 校团委',
  external: '外校来源（浙大等），保研等长期关注用',
}

export function NewsView(props: { onBack: () => void; onOpenArticle: (id: string) => void; onReadChange?: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading')
  const [dir, setDir] = useState<DirSite[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [readSet, setReadSet] = useState<string[]>(() => loadReadSet())
  const [follow, setFollow] = useState<any[]>(() => loadFollow())
  const [ops, setOps] = useState<Record<string, any>>(() => loadDeadlineOps())
  const [tab, setTab] = useState<SiteGroup>(() => loadTab())
  /** 关键词搜索（2026-09-22 用户要加）：标题 / 来源 / 栏目 / AI 摘要，三组一起过滤；不影响未读计数 */
  const [q, setQ] = useState('')
  const mods = useMemo(() => loadModules(), [])
  const channels = useMemo(() => loadChannels(), [])
  const watchRules = useMemo(() => loadRules().filter((r: any) => r.enabled), [])

  const pick = (g: SiteGroup) => {
    setTab(g)
    try {
      localStorage.setItem(TAB_KEY, g)
    } catch {
      /* 静默 */
    }
  }

  useEffect(() => {
    void (async () => {
      const [sum, directory] = await Promise.all([readCloudJson('data/summary.json'), loadSiteDirectory()])
      setDir(Array.isArray(directory) ? directory : [])
      setSummary(sum)
      setPhase('ready')
    })()
  }, [])

  /** 与首页同一口径：排除已清理/已归档 → 排除被关掉的来源 → 门户模块开关 */
  const important = useMemo(
    () =>
      (summary?.important || [])
        .filter((it: any) => !isPruned(it.article_id || it.url) && ops[it.article_id || it.url] !== 'archive')
        .filter((it: any) => siteShown(channels, siteOfItem(it)))
        .filter((it: any) => mods.portal || groupOfItem(it) !== 'portal'),
    [summary, ops, channels, dir, mods.portal],
  )

  /** 关键词过滤（标题 / 来源 / 栏目 / AI 摘要；空格分隔多词全部命中） */
  const searched = useMemo(
    () =>
      q.trim()
        ? important.filter((it: any) => matchQuery([it.title, it.source, it.column, it.summary].filter(Boolean).join(' '), q))
        : important,
    [important, q],
  )

  const groups = useMemo(() => {
    const out: Record<SiteGroup, any[]> = { portal: [], campus: [], external: [] }
    for (const it of searched) out[groupOfItem(it)].push(it)
    // 临期条目置顶（2026-09-22）：这类条目是靠「未过期截止」豁免留在要闻的（发布可能已超 7 天），
    // 若仍按发布时间排序会沉到列表底部 —— 那就等于没修。
    const rank = (x: any) => (x.due_soon ? 0 : 1)
    for (const g of Object.keys(out) as SiteGroup[]) {
      out[g].sort((a, b) => rank(a) - rank(b) || String(b.time ?? '').localeCompare(String(a.time ?? '')))
    }
    return out
  }, [searched, dir])

  const allIds = useMemo(() => important.map((it: any) => it.article_id || it.url), [important])
  const hiddenSiteCount = useMemo(() => {
    const ids = dir.map((s) => s.id).filter((id) => id !== 'portal')
    return ids.filter((id) => !siteShown(channels, id)).length
  }, [dir, channels])

  const openArt = (it: any) => {
    const id = it.article_id || it.url
    if (id && /^[0-9a-f]{40}$/.test(String(id).replace(/\.json$/, ''))) props.onOpenArticle(id)
    else if (it.url) window.open(it.url, '_blank', 'noopener')
  }

  const toggleFollow = (it: any) => {
    const id = it.article_id || it.url
    const cur = loadFollow()
    const idx = cur.findIndex((x: any) => x.id === id)
    const next =
      idx >= 0
        ? cur.filter((x: any) => x.id !== id)
        : [{ id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary }, ...cur]
    saveFollow(next as any)
    setFollow(next as any)
  }

  const archive = (id: string) => {
    setDeadlineOp(id, 'archive')
    setOps((prev) => ({ ...(prev || {}), [id]: 'archive' }))
  }

  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={props.onBack}>
          <Ic n="chevLeft" />返回
        </button>
        <span className="dsh-cau_breadPath">要闻（{searched.length}{q.trim() ? ` / ${important.length}` : ''}）</span>
        {important.length > 0 && (
          <button
            type="button"
            className="dsh-cau_textBtn"
            onClick={() => {
              setReadSet(markAllRead(allIds))
              props.onReadChange?.()
            }}
          >
            <Ic n="check" />
            全部已读
          </button>
        )}
      </div>

      {phase === 'loading' && (
        <div className="dsh-cau_loading">
          <span className="dsh-cau_spinner" />
          <span>加载中…</span>
        </div>
      )}

      {phase === 'ready' && (
        <>
          <input
            className="dsh-cau_mgSearch dsh-cau_dlSearch"
            type="search"
            placeholder="搜索要闻：标题 / 来源 / 栏目 / AI 摘要（三组一起搜）…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            spellCheck={false}
          />
          {q.trim() && (
            <div className="dsh-cau_dlHit">
              搜索「{q.trim()}」命中 <b>{searched.length}</b> 条（共 {important.length} 条要闻）
            </div>
          )}
          {/* 三栏切换（点哪个显示哪个）：只用下划线 + 字重/深浅表示选中，不做胶囊、不加图标 */}
          <div className="dsh-cau_tabs" role="tablist" aria-label="要闻来源分组">
            {GROUP_ORDER.map((g: SiteGroup) => {
              const on = g === tab
              return (
                <button
                  key={g}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="dsh-cau-news-panel"
                  className={'dsh-cau_tab' + (on ? ' dsh-cau_tabOn' : '')}
                  onClick={() => pick(g)}
                >
                  <span className="dsh-cau_tabLabel">{GROUP_LABEL[g]}</span>
                  <span className="dsh-cau_tabCount">{groups[g].length} 条</span>
                </button>
              )
            })}
          </div>
          <div className="dsh-cau_tabNote">{GROUP_NOTE[tab]}</div>

          <div className="dsh-cau_card" id="dsh-cau-news-panel" role="tabpanel">
            {!summary && <div className="dsh-cau_empty">聚合数据暂不可用</div>}
            {summary && groups[tab].length === 0 && (
              <div className="dsh-cau_empty">{q.trim() ? `「${q.trim()}」在${GROUP_LABEL[tab]}里没有命中（可切到别的分组看看）` : `暂无${GROUP_LABEL[tab]}重要通知`}</div>
            )}
            {summary &&
              groups[tab].map((it: any) => {
                const id = it.article_id || it.url
                return (
                  <NewsRow
                    key={id}
                    it={it}
                    read={readSet.includes(id)}
                    followed={follow.some((x: any) => x.id === id)}
                    hit={matchRules(watchRules, it).length > 0}
                    color={siteColorOf(siteOfItem(it)) || undefined}
                    onOpen={() => openArt(it)}
                    onToggleFollow={() => toggleFollow(it)}
                    onArchive={() => archive(id)}
                  />
                )
              })}
          </div>

          <div className="dsh-cau_newsMuted">
            条目按 AI 判定的重要度（高/中）+ 近 7 天自动汇集；<Ic n="hourglass" /> 标记的是「发布已超 7 天但截止日期还没到」的临期通知（不因变旧而消失）
            {hiddenSiteCount > 0 ? ` · 已关闭 ${hiddenSiteCount} 个来源（设置 → 栏目频道管理）` : ''}
          </div>

          {summary && important.length === 0 && (
            <Empty icon={<Ic n="flame" />} main="暂无要闻" sub="近 7 天没有 AI 判定为「高/中」重要度的条目；稍后自动更新" />
          )}
        </>
      )}
    </div>
  )
}
