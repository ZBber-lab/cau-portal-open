/**
 * cau-portal 弹层面板（阶段4 第4步 批次①：弹层外壳 + L0 首页 + 未读计数）。
 * 规格：SPEC §7.2/7.3 —— 锚定侧边栏按钮；宽 480px / 最大高 70vh；
 * --dsw-specific-menu 表面 + border-inverted 边框 + shadow-lv3 + 12px 圆角 + z-30；
 * 点击外部 / × / Esc 关闭；150ms 淡入。配色全走 --dsw-* token，品牌绿仅
 * --cau-brand 出现在品牌图形位与节标（§7.7）；重要度徽章用 DSH 状态色（非绿）。
 * 未读口径（用户定案）：AI 标记重要（高/中）且近 7 天的新条目；点开即已读（计数即时减一），
 * 「全部已读」批量清零；按钮仅显示 tertiary 计数，无红点。
 * 后续批次在本文件扩展：L1 栏目（批②）、L2 阅读 + 搜索（批③）。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  loadSettings,
  saveSettings,
  readCloudText,
  loadReadSet,
  markRead,
  markAllRead,
} from './data'

export type DeadlineItem = {
  item: string
  date: string
  evidence?: string
  title: string
  article_id?: string
  url?: string
  time?: string | null
  source?: string
  column?: string
}

export type ImportantItem = {
  title: string
  article_id?: string
  url?: string
  time?: string | null
  source?: string
  column?: string
  summary?: string
  category?: string
  importance?: string
  deadline?: { item?: string; date?: string } | null
}

export type SummaryV1 = {
  version?: number
  last_updated?: string
  deadlines?: DeadlineItem[]
  important?: ImportantItem[]
  ai_map?: Record<string, unknown>
}

export type IndexV1 = {
  last_updated?: string
  stats?: Record<string, number>
  sites?: { id: string; name: string; columns?: { key: string; name: string; items?: number; latest_date?: string | null }[] }[]
}

const idOf = (it: { article_id?: string; url?: string }) => it.article_id || it.url || ''

function fmtDay(iso: string | null | undefined): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(iso)
  if (!m) return ''
  return `${+m[2]}月${+m[3]}日`
}

function shortTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function daysLeft(date: string): number {
  const d = Date.parse(date)
  if (!Number.isFinite(d)) return Number.NaN
  const day0 = new Date()
  day0.setHours(0, 0, 0, 0)
  return Math.round((d - day0.getTime()) / 86400000)
}

// ---- 数据装载（内存缓存 60s，避免开合面板反复请求）----

type Loaded = {
  ts: number
  index: IndexV1 | null
  indexReason: 'missing' | 'error' | null
  indexError: string | null
  summary: SummaryV1 | null
  summaryReason: 'missing' | 'error' | null
  summaryError: string | null
}

let bundleCache: Loaded | null = null
const CACHE_MS = 60000

async function tryJson(rel: string, token: string) {
  try {
    const text = await readCloudText(rel, token)
    return { ok: true as const, data: JSON.parse(text) }
  } catch (e: any) {
    const msg = String(e?.message ?? e)
    return { ok: false as const, reason: (/404/.test(msg) ? 'missing' : 'error') as 'missing' | 'error', message: msg }
  }
}

async function loadBundle(token: string): Promise<Loaded> {
  if (bundleCache && Date.now() - bundleCache.ts < CACHE_MS) return bundleCache
  const [idx, sum] = await Promise.all([tryJson('data/index.json', token), tryJson('data/summary.json', token)])
  const bundle: Loaded = {
    ts: Date.now(),
    index: idx.ok ? (idx.data as IndexV1) : null,
    indexReason: idx.ok ? null : idx.reason,
    indexError: idx.ok ? null : idx.message,
    summary: sum.ok ? (sum.data as SummaryV1) : null,
    summaryReason: sum.ok ? null : sum.reason,
    summaryError: sum.ok ? null : sum.message,
  }
  bundleCache = bundle
  return bundle
}

/** 页面加载时初始化按钮未读计数（不弹窗；无令牌/无 summary 时返回 0） */
export async function fetchUnreadCount(): Promise<number> {
  const token = loadSettings().githubToken
  if (!token) return 0
  const b = await loadBundle(token)
  if (!b.summary) return 0
  const readSet = loadReadSet()
  return (b.summary.important ?? []).filter((it) => !readSet.includes(idOf(it))).length
}

function ensureToken(): string | null {
  const s = loadSettings()
  if (s.githubToken) return s.githubToken
  const input = window.prompt(
    '农大门户需要 GitHub 只读令牌才能读取云端数据。\n请粘贴 cau-portal-read 令牌（github_pat_ 开头）：',
  )
  if (!input) return null
  const t = input.trim()
  if (!t.startsWith('github_pat_')) {
    window.alert('令牌格式不对（应以 github_pat_ 开头），未保存。')
    return null
  }
  saveSettings({ ...s, githubToken: t })
  return t
}

// ---- 小组件 ----

function ImpBadge({ level }: { level?: string }) {
  const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow'
  return <span className={`dsh-cau_badge ${cls}`}>{level || '低'}</span>
}

function SectionHead({ title, extra }: { title: string; extra?: React.ReactNode }) {
  return (
    <div className="dsh-cau_secHead">
      <span className="dsh-cau_secMark" />
      <span className="dsh-cau_secTitle">{title}</span>
      {extra != null && <span className="dsh-cau_secExtra">{extra}</span>}
    </div>
  )
}

// ---- 面板主体 ----

type Phase = 'loading' | 'need-token' | 'error' | 'ready'

export function CauPanel(props: {
  anchor: HTMLElement | null
  emblem: string
  onClose: () => void
  onUnreadChange?: (n: number) => void
}) {
  const { anchor, emblem, onClose, onUnreadChange } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [bundle, setBundle] = useState<Loaded | null>(null)
  const [readSet, setReadSet] = useState<string[]>(() => loadReadSet())
  const [pos, setPos] = useState<{ left: number; bottom: number; maxHeight: number } | null>(null)

  const load = async () => {
    setPhase('loading')
    const token = ensureToken()
    if (!token) {
      setPhase('need-token')
      return
    }
    const b = await loadBundle(token)
    setBundle(b)
    if (!b.index && !b.summary) {
      setErrorMsg(b.indexError || b.summaryError || '云端读取失败')
      setPhase('error')
      return
    }
    setPhase('ready')
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 锚定定位 + 窗口尺寸变化重算
  useEffect(() => {
    if (!anchor) return
    const compute = () => {
      const r = anchor.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const width = Math.min(480, vw - 16)
      let left = Math.min(r.right + 8, vw - width - 8)
      left = Math.max(8, left)
      const availAbove = r.top - 16
      let bottom = Math.max(8, vh - r.bottom)
      let maxHeight = Math.floor(vh * 0.7)
      if (availAbove >= 200) {
        maxHeight = Math.min(maxHeight, availAbove)
      } else {
        bottom = 8
      }
      maxHeight = Math.min(maxHeight, vh - bottom - 8)
      setPos({ left, bottom, maxHeight })
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [anchor])

  // 点击外部 / Esc 关闭
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (anchor?.contains(t)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [anchor, onClose])

  const summary = bundle?.summary ?? null
  const index = bundle?.index ?? null
  const important = summary?.important ?? []
  const unreadCount = useMemo(
    () => important.filter((it) => !readSet.includes(idOf(it))).length,
    [important, readSet],
  )
  useEffect(() => {
    onUnreadChange?.(unreadCount)
  }, [unreadCount, onUnreadChange])

  const handleRead = (it: ImportantItem) => {
    setReadSet(markRead(idOf(it)))
  }
  const handleAllRead = () => {
    setReadSet(markAllRead(important.map(idOf)))
  }

  if (!pos) return null

  const deadlines7 = (summary?.deadlines ?? [])
    .map((d) => ({ d, n: daysLeft(d.date) }))
    .filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n <= 7)
    .slice(0, 8)

  const metaTime = shortTime(summary?.last_updated || index?.last_updated)

  return (
    <div
      ref={rootRef}
      className="dsh-cau_panel"
      role="dialog"
      aria-label="农大门户"
      style={{ left: pos.left, bottom: pos.bottom, maxHeight: pos.maxHeight }}
    >
      <div className="dsh-cau_panelHead">
        <span className="dsh-cau_panelEmblem" dangerouslySetInnerHTML={{ __html: emblem }} />
        <span className="dsh-cau_panelTitle">农大门户</span>
        {metaTime && <span className="dsh-cau_panelMeta">更新 {metaTime}</span>}
        <button type="button" className="dsh-cau_panelClose" aria-label="关闭" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="dsh-cau_panelBody">
        {phase === 'loading' && (
          <div className="dsh-cau_loading">
            <span className="dsh-cau_spinner" />
            <span>加载中…</span>
          </div>
        )}
        {phase === 'need-token' && (
          <div className="dsh-cau_msg">
            <div className="dsh-cau_msgText">需要 GitHub 只读令牌才能读取云端数据（仅存本机 localStorage，不上传）。</div>
            <button type="button" className="dsh-cau_msgBtn dsh-cau_msgBtnPrimary" onClick={() => void load()}>
              配置令牌
            </button>
          </div>
        )}
        {phase === 'error' && (
          <div className="dsh-cau_msg">
            <div className="dsh-cau_msgText">云端读取失败：{errorMsg}</div>
            <button type="button" className="dsh-cau_msgBtn" onClick={() => void load()}>
              重试
            </button>
          </div>
        )}
        {phase === 'ready' && !index && (
          <div className="dsh-cau_msg">
            <div className="dsh-cau_msgText">
              云端暂无数据目录（index.json {bundle?.indexReason === 'missing' ? '尚未生成，爬虫可能还未运行' : `读取失败：${bundle?.indexError || ''}`}）。
            </div>
            <button type="button" className="dsh-cau_msgBtn" onClick={() => void load()}>
              重试
            </button>
          </div>
        )}
        {phase === 'ready' && index && (
          <>
            {bundle?.summaryReason === 'missing' && (
              <div className="dsh-cau_hint">
                ⏰ 待办与要闻聚合（summary.json）云端尚未生成——爬虫下次运行（≤30 分钟）后自动出现。栏目与快捷入口仍可用。
              </div>
            )}
            {bundle?.summaryReason === 'error' && (
              <div className="dsh-cau_hint">
                ⏰ 聚合数据读取失败（{bundle?.summaryError || '网络问题'}），待办与要闻暂不可用；其余功能正常。
              </div>
            )}

            <div className="dsh-cau_sec">
              <SectionHead title="⏰ 待办截止" extra={deadlines7.length > 0 ? `${deadlines7.length} 项` : undefined} />
              <div className="dsh-cau_card">
                {!summary && <div className="dsh-cau_empty">聚合数据暂不可用</div>}
                {summary && deadlines7.length === 0 && <div className="dsh-cau_empty">未来 7 天暂无截止事项</div>}
                {deadlines7.map(({ d, n }) => (
                  <div className="dsh-cau_dlRow" key={idOf(d) + d.date}>
                    <div className="dsh-cau_dlTop">
                      <span className="dsh-cau_dlItem">{d.item || '截止事项'}</span>
                      <span className="dsh-cau_dlDate">
                        {fmtDay(d.date)} · {n === 0 ? '今天' : `剩 ${n} 天`}
                      </span>
                      {d.column && <span className="dsh-cau_dlCol">{d.column}</span>}
                    </div>
                    <div className="dsh-cau_dlTitle" title={d.title}>
                      {d.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dsh-cau_sec">
              <SectionHead
                title="✦ 未读要闻"
                extra={
                  unreadCount > 0 ? (
                    <button type="button" className="dsh-cau_textBtn" onClick={handleAllRead}>
                      全部已读
                    </button>
                  ) : (
                    '已读清空'
                  )
                }
              />
              <div className="dsh-cau_card">
                {!summary && <div className="dsh-cau_empty">聚合数据暂不可用</div>}
                {summary && important.length === 0 && <div className="dsh-cau_empty">暂无重要新通知</div>}
                {important.map((it) => {
                  const read = readSet.includes(idOf(it))
                  return (
                    <button
                      type="button"
                      className="dsh-cau_impRow"
                      key={idOf(it)}
                      onClick={() => handleRead(it)}
                      title="点击标记已读（批次③ 将打开全文）"
                    >
                      <span className="dsh-cau_impDot" data-read={read ? '1' : '0'} />
                      <span className="dsh-cau_impMain">
                        <span className="dsh-cau_impTop">
                          <span className="dsh-cau_impTitle">{it.title}</span>
                          <ImpBadge level={it.importance} />
                        </span>
                        {it.summary && <span className="dsh-cau_impSummary">{it.summary}</span>}
                        <span className="dsh-cau_impMeta">
                          {[it.column, it.source && it.source !== it.column ? it.source : '', fmtDay(it.time)]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="dsh-cau_sec">
              <SectionHead title="栏目频道" extra="浏览入口批次②开放" />
              {index.sites?.map((site) => (
                <div className="dsh-cau_colGroup" key={site.id}>
                  <div className="dsh-cau_colSite">{site.name}</div>
                  <div className="dsh-cau_colChips">
                    {(site.columns ?? []).map((c) => (
                      <span className="dsh-cau_chip" key={c.key}>
                        {c.name}
                        {typeof c.items === 'number' && <em className="dsh-cau_chipCount">{c.items}</em>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="dsh-cau_sec">
              <SectionHead title="快捷入口" />
              <div className="dsh-cau_quick">
                <a className="dsh-cau_quickLink" href="https://one.cau.edu.cn" target="_blank" rel="noreferrer">
                  统一门户 ↗
                </a>
                <a className="dsh-cau_quickLink" href="https://clst.cau.edu.cn" target="_blank" rel="noreferrer">
                  学院官网 ↗
                </a>
                <a className="dsh-cau_quickLink" href="https://jwc.cau.edu.cn" target="_blank" rel="noreferrer">
                  教务处 ↗
                </a>
                <a className="dsh-cau_quickLink" href="https://news.cau.edu.cn" target="_blank" rel="noreferrer">
                  校新闻网 ↗
                </a>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="dsh-cau_panelFoot">数据来自 GitHub 云端 · 每 30 分钟自动更新 · 阅读上下文（批次⑥）</div>
    </div>
  )
}

export const PANEL_CSS = `
.dsh-cau_panel{position:fixed;z-index:30;display:flex;flex-direction:column;width:480px;max-width:calc(100vw - 16px);background:var(--dsw-specific-menu,#fff);border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.08));border-radius:12px;box-shadow:var(--dsw-shadow-lv3,0 8px 28px rgba(0,0,0,.16));overflow:hidden;animation:dsh-cau-fade .15s ease-out;--cau-brand:#008038}
body[data-ds-dark-theme] .dsh-cau_panel{--cau-brand:#00b856}
@keyframes dsh-cau-fade{from{opacity:0}to{opacity:1}}
@keyframes dsh-cau-spin{to{transform:rotate(360deg)}}
.dsh-cau_panelHead{flex:none;display:flex;align-items:center;height:44px;padding:0 12px;gap:8px;border-bottom:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06))}
.dsh-cau_panelEmblem{flex:none;display:flex;color:var(--cau-brand)}
.dsh-cau_panelEmblem svg{display:block;height:18px;width:auto}
.dsh-cau_panelTitle{flex:1;min-width:0;font-size:14px;font-weight:500;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_panelMeta{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_panelClose{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);cursor:pointer;font-size:13px;line-height:1}
.dsh-cau_panelClose:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_panelBody{flex:1;min-height:0;overflow-y:auto;padding:4px 12px 12px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2)) transparent}
.dsh-cau_panelBody::-webkit-scrollbar{width:8px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2));border-radius:4px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,rgba(0,0,0,.3))}
.dsh-cau_panelFoot{flex:none;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06));font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_sec{margin-top:14px}
.dsh-cau_sec:first-child{margin-top:6px}
.dsh-cau_secHead{display:flex;align-items:center;height:20px;margin-bottom:6px;gap:6px}
.dsh-cau_secMark{flex:none;width:3px;height:12px;border-radius:2px;background:var(--cau-brand)}
.dsh-cau_secTitle{flex:1;min-width:0;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_secExtra{flex:none;display:flex;align-items:center;font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_card{border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.08));border-radius:8px;padding:4px;overflow:hidden}
.dsh-cau_empty{padding:10px 8px;font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_hint{margin-top:8px;padding:8px 10px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04));font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:28px 0;font-size:12px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.1));border-top-color:var(--dsw-alias-label-tertiary,#888);animation:dsh-cau-spin .8s linear infinite}
.dsh-cau_msg{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin:14px 0 4px;padding:12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:8px}
.dsh-cau_msgText{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_msgBtn{display:inline-flex;align-items:center;padding:5px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;cursor:pointer}
.dsh-cau_msgBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_msgBtnPrimary{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:transparent;color:#fff}
.dsh-cau_msgBtnPrimary:hover{background:var(--dsw-alias-state-business-primary,#4176e6);filter:brightness(1.08)}
.dsh-cau_textBtn{padding:0 4px;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-state-business-primary,#4176e6);font-size:11px;cursor:pointer}
.dsh-cau_textBtn:hover{text-decoration:underline}
.dsh-cau_dlRow{padding:6px 8px;border-radius:6px}
.dsh-cau_dlRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.dsh-cau_dlTop{display:flex;align-items:baseline;gap:6px;min-width:0}
.dsh-cau_dlItem{flex:none;font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.dsh-cau_dlDate{flex:none;font-size:11px;font-weight:500;color:var(--dsw-alias-state-warn,#f59e0b)}
.dsh-cau_dlCol{flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_dlTitle{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_impRow{display:flex;gap:7px;width:100%;padding:7px 8px;border:none;border-radius:6px;background:transparent;text-align:left;cursor:pointer;font:inherit;color:inherit}
.dsh-cau_impRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.dsh-cau_impDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#999);margin-top:5px}
.dsh-cau_impDot[data-read='1']{opacity:0}
.dsh-cau_impMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.dsh-cau_impTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_impTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_impSummary{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#555);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_impMeta{font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_badge{flex:none;font-size:10px;line-height:16px;padding:0 5px;border-radius:4px;font-weight:500}
.dsh-cau_badgeHigh{color:var(--dsw-alias-state-error-primary,#ec1313);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#ec1313) 12%,transparent)}
.dsh-cau_badgeMid{color:var(--dsw-alias-state-warn,#c77d00);background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 16%,transparent)}
.dsh-cau_badgeLow{color:var(--dsw-alias-label-tertiary,#888);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}
.dsh-cau_colGroup{margin-bottom:10px}
.dsh-cau_colGroup:last-child{margin-bottom:0}
.dsh-cau_colSite{font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary,#111);margin-bottom:6px}
.dsh-cau_colChips{display:flex;flex-wrap:wrap;gap:6px}
.dsh-cau_chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:999px;font-size:12px;color:var(--dsw-alias-label-secondary,#555);cursor:default}
.dsh-cau_chipCount{font-style:normal;font-size:10px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_quick{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.dsh-cau_quickLink{display:flex;align-items:center;justify-content:center;padding:7px 8px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#555);text-decoration:none}
.dsh-cau_quickLink:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
`
