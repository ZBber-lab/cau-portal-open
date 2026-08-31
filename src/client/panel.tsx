/**
 * cau-portal 面板（阶段4 第4步 批②/③：全套浏览）。
 * 圆角毛玻璃卡片浮层（右缘留边距、垂直居中 540px/74vh）+ 导航栈：
 * L0 首页（panel-home）→ L1 栏目页（panel-column，站点/栏目）→ L2 文章阅读（panel-article）+ 归档/关注 视图。
 * 头部有「固定」开关（固定后点外部/Esc 不关闭，仅 ✕ 关）。
 * 未读口径：AI 重要（高/中）+近 7 天；打开即读（计数即时减一）；tertiary 计数无红点。
 */
import { Component, useEffect, useRef, useState } from 'react'
import { Ic } from './icons'
import { HomeView } from './panel-home'
import { ColumnView } from './panel-column'
import { ArticleView } from './panel-article'
import { ManageView } from './panel-manage'
import { DeadlinesView } from './panel-deadlines'
import { CauSettings } from './settings'
import { Empty } from './empty'
import {
  loadSettings,
  saveSettings,
  readCloudText,
  loadReadSet,
  markRead,
  loadFollow,
  loadDeadlineOps,
  setDeadlineOp,
  activeTokenValues,
  loadModules,
} from './data'
import { getOpenRequest, clearOpenRequest, subscribeBus } from './bus'

/** 设置页错误边界：出错了显示错误文字（便于定位），不再静默白屏 */
class CauSettingsBoundary extends Component<any, { err: any }> {
  state = { err: null }
  static getDerivedStateFromError(err: any) {
    return { err }
  }
  componentDidCatch(err: any) {
    console.error('[cau-portal settings]', err)
  }
  render() {
    if (this.state.err) {
      return <div className="dsh-cau_setErr">设置页加载出错：{String(this.state.err?.message || this.state.err)}</div>
    }
    return this.props.children
  }
}

type View =
  | { name: 'home' }
  | { name: 'site'; site: string }
  | { name: 'column'; site: string; column: string }
  | { name: 'article'; id: string; back: View; siteName?: string; columnName?: string; siblings?: { id: string; title: string }[]; index?: number }
  | { name: 'archive' }
  | { name: 'follow' }

// ---- 数据装载（内存缓存 60s，避免反复请求）----
type Loaded = { ts: number; index: any; summary: any }
let bundleCache: Loaded | null = null
const CACHE_MS = 60000

async function tryJson(rel: string, token: string) {
  try {
    return { ok: true as const, data: JSON.parse(await readCloudText(rel, token)) }
  } catch (e: any) {
    const msg = String(e?.message ?? e)
    return { ok: false as const, reason: (/404/.test(msg) ? 'missing' : 'error') as 'missing' | 'error', message: msg }
  }
}

async function loadBundle(token: string): Promise<Loaded> {
  if (bundleCache && Date.now() - bundleCache.ts < CACHE_MS) return bundleCache
  const [idx, sum] = await Promise.all([tryJson('data/index.json', token), tryJson('data/summary.json', token)])
  const bundle: Loaded = { ts: Date.now(), index: idx.ok ? idx.data : null, summary: sum.ok ? sum.data : null }
  bundleCache = bundle
  return bundle
}

/** 未读候选：summary.important 中（门户模块开关关闭时排除门户条目；已归档的不计未读） */
function unreadCandidates(summary: any): any[] {
  const list = (summary?.important || []) as any[]
  const ops = loadDeadlineOps()
  const active = list.filter((it: any) => ops[it.article_id || it.url] !== 'archive')
  if (loadModules().portal) return active
  return active.filter((it: any) => !/tp_up/.test(String(it.url || '')))
}

/** 页面加载时初始化按钮未读计数（不弹窗；无令牌/无 summary 时返回 0） */
export async function fetchUnreadCount(): Promise<number> {
  const token = activeTokenValues()[0]
  if (!token) return 0
  const b = await loadBundle(token)
  if (!b.summary) return 0
  const readSet = loadReadSet()
  return unreadCandidates(b.summary).filter((it: any) => !readSet.includes(it.article_id || it.url)).length
}

function shortTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/**
 * 测量「上方栏」（会话头部：标题行 + 对话/轨迹标签）高度，让面板从它下方开始。
 * 优先实测会话头部组件（.wSkVaW_header，DSH 随版本可能换 hash，故保留结构兜底）；
 * 失败退回 56px（会话头部常见高度）+ 默认 12px。
 */
function measureTopInset(): number {
  try {
    const header = document.querySelector('.wSkVaW_header') as HTMLElement | null
    if (header) {
      const r = header.getBoundingClientRect()
      if (r.height > 0 && r.height < 400) return Math.ceil(r.top + r.height) + 8
    }
    const frame = document.querySelector('.pI_x6G_frame') as HTMLElement | null
    if (frame) {
      const r = frame.getBoundingClientRect()
      if (r.top > 0) return Math.ceil(r.top) + 8
    }
    const col = document.querySelector('.pI_x6G_centerCol') as HTMLElement | null
    if (col) {
      const first = col.firstElementChild as HTMLElement | null
      if (first) {
        const fr = first.getBoundingClientRect()
        const colH = col.getBoundingClientRect().height || window.innerHeight
        if (fr.height > 0 && fr.height < colH * 0.5) return Math.ceil(fr.height) + 8
      }
    }
  } catch {
    /* noop */
  }
  return 56
}

/** 头部 28px 幽灵图标钮（UI 批②：替代原文字小页签与 ✕） */
function IconBtn(props: { n: string; label: string; title?: string; on?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="dsh-cau_iconBtn"
      data-on={props.on ? 'true' : undefined}
      aria-label={props.label}
      aria-pressed={typeof props.on === 'boolean' ? props.on : undefined}
      title={props.title || props.label}
      onClick={props.onClick}
    >
      <Ic n={props.n} />
    </button>
  )
}

// ---- 归档视图（已归档待办）----
function ArchiveView(props: { onBack: () => void; onOpenArticle: (id: string) => void }) {
  const [rows, setRows] = useState<any[]>([])
  const refresh = () => {
    void (async () => {
      const token = activeTokenValues()[0]
      if (!token) return
      const b = await loadBundle(token)
      const ops = loadDeadlineOps()
      const list = (b.summary?.deadlines || []).filter((d: any) => ops[d.article_id || d.url] === 'archive')
      setRows(list)
    })()
  }
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={props.onBack}><Ic n="chevLeft" />返回</button>
        <span className="dsh-cau_breadPath">已归档待办</span>
      </div>
      <div className="dsh-cau_dlHint">归档的截止事项保留在这里；点「取消归档」可回到「全部待办」。</div>
      <div className="dsh-cau_card">
        {rows.length === 0 && <Empty icon={<Ic n="inbox" />} main="暂无归档待办" sub="在待办或文章页点「归档」的事项会保留在这里" />}
        {rows.map((d) => {
          const id = d.article_id || d.url
          return (
            <div className="dsh-cau_dlRow" key={id}>
              <span className="dsh-cau_dlTitleWrap" onClick={() => props.onOpenArticle(id)}>
                <span className="dsh-cau_dlItem">{d.item}</span>
                <span className="dsh-cau_dlTitle">{d.title}</span>
              </span>
              <span className="dsh-cau_dlCol">{d.date}</span>
              <button
                type="button"
                className="dsh-cau_textBtn"
                onClick={() => {
                  setDeadlineOp(id, null)
                  refresh()
                }}
              >
                <Ic n="undo" />取消归档
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- 关注视图（无上限）----
function FollowView(props: { onBack: () => void; onOpenArticle: (id: string) => void }) {
  const list = loadFollow()
  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={props.onBack}><Ic n="chevLeft" />返回</button>
        <span className="dsh-cau_breadPath">关注（{list.length}）</span>
      </div>
      <div className="dsh-cau_card">
        {list.length === 0 && <Empty icon={<Ic n="bookmark" />} main="还没有关注内容" sub="在文章页点「加入关注」即可收藏" />}
        {list.map((it: any) => (
          <div className="dsh-cau_row" key={it.id}>
            <span className="dsh-cau_rowMain" onClick={() => props.onOpenArticle(it.id)}>
              <span className="dsh-cau_rowTitle">{it.title}</span>
              <span className="dsh-cau_rowMeta">{[it.column, it.source].filter(Boolean).join(' · ')}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CauPanel(props: {
  outsideIgnore?: HTMLElement | null
  onClose: () => void
  onUnreadChange?: (n: number) => void
}) {
  const { outsideIgnore, onClose, onUnreadChange } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const [stack, setStack] = useState<View[]>([{ name: 'home' }])
  const [metaTime, setMetaTime] = useState('')
  const [unread, setUnread] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [pinned, setPinned] = useState(() => !!loadSettings().panelPinned)
  const [topInset, setTopInset] = useState(() => measureTopInset())
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const view = stack[stack.length - 1]

  const togglePinned = () =>
    setPinned((p) => {
      const next = !p
      saveSettings({ ...loadSettings(), panelPinned: next })
      return next
    })

  // 底部状态栏数据：云端更新时间 + 未读数（挂载时与手动刷新都会走这里）
  const loadHead = async () => {
    const token = activeTokenValues()[0]
    if (!token) {
      setMetaTime('')
      setUnread(0)
      return
    }
    const b = await loadBundle(token)
    setMetaTime(b.summary?.last_updated || b.index?.last_updated ? shortTime(b.summary?.last_updated || b.index?.last_updated) : '')
    const readSet = loadReadSet()
    setUnread(unreadCandidates(b.summary).filter((it: any) => !readSet.includes(it.article_id || it.url)).length)
  }
  useEffect(() => {
    void loadHead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** ⟳ 强制刷新：清 60s 缓存 → 重拉状态栏 → 重挂载当前视图（各视图自行重取数据） */
  const refresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    bundleCache = null
    try {
      await loadHead()
    } catch {
      /* 静默：状态栏保持旧值 */
    }
    setRefreshKey((k) => k + 1)
    setRefreshing(false)
  }

  useEffect(() => {
    onUnreadChange?.(unread)
  }, [unread, onUnreadChange])

  // 阶段6：聊天区 toolview 卡片「在面板中打开」→ 跳转到文章
  useEffect(() => {
    return subscribeBus(() => {
      try {
        const req = getOpenRequest()
        if (req && req.id) {
          if (!(view?.name === 'article' && view.id === req.id)) openArticle(req.id)
          clearOpenRequest()
        }
      } catch (e) {
        console.error('[cau-portal] open', e)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.name, view?.id])

  // 阶段6：面板挂载时，若有尚未消费的「在面板中打开」请求，先跳到对应文章
  //（面板关闭时点击卡片 → 展开抽屉发生在发信号之后，订阅回调收不到已过信号，故此处补一次）
  useEffect(() => {
    try {
      const req = getOpenRequest()
      if (req && req.id) {
        openArticle(req.id)
        clearOpenRequest()
      }
    } catch (e) {
      console.error('[cau-portal] open-on-mount', e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 点击外部（面板与按钮之外）/ Esc 关闭
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (pinned) return
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (outsideIgnore?.contains(t)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (pinned) return
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [outsideIgnore, onClose, pinned])

  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  /** 打开即已读：按已加载的 summary 重算未读数（SPEC 口径：打开即读、计数即时减一） */
  const recountUnread = () => {
    const b = bundleCache
    if (!b?.summary) return
    const readSet = loadReadSet()
    const n = unreadCandidates(b.summary).filter((it: any) => !readSet.includes(it.article_id || it.url)).length
    setUnread(n)
  }
  const openArticle = (id: string, siteName?: string, columnName?: string, siblings?: { id: string; title: string }[], index?: number) => {
    markRead(id)
    recountUnread()
    setStack((s) => [...s, { name: 'article', id, back: s[s.length - 1], siteName, columnName, siblings, index }])
  }
  const replaceArticle = (id: string, siblings?: { id: string; title: string }[], index?: number) => {
    markRead(id)
    recountUnread()
    setStack((s) => {
      const top = s[s.length - 1]
      if (top.name === 'article') return [...s.slice(0, -1), { ...top, id, siblings, index }]
      return [...s, { name: 'article', id, back: top, siblings, index }]
    })
  }

  const openColumn = (site: string, column: string | null) =>
    setStack((s) => [...s, column ? { name: 'column', site, column } : { name: 'site', site }])

  return (
    <div ref={rootRef} className="dsh-cau_panel" role="dialog" aria-label="农大门户" style={{ ['--cau-panel-top' as any]: `${topInset}px` }}>
      <div className="dsh-cau_panelHead">
        <span className="dsh-cau_panelEmblem dsh-cau_cauLogo">CAU</span>
        <span className="dsh-cau_panelName">
          <span className="dsh-cau_panelNameImg dsh-cau_songtiName">中国农业大学</span>
          {showSettings && <span className="dsh-cau_panelTitle">设置</span>}
        </span>
        <IconBtn n="pinFill" label={pinned ? '取消固定面板' : '固定面板'} title={pinned ? '取消固定（点击外部/Esc 会关闭）' : '固定面板（点击外部/Esc 不关闭）'} on={pinned} onClick={togglePinned} />
        <IconBtn n="sliders" label="数据管理" title="数据管理（清理旧数据）" onClick={() => setStack((s) => [...s, { name: 'manage' } as any])} />
        <IconBtn n="gear" label="设置" title={showSettings ? '返回首页' : '设置'} on={showSettings} onClick={() => setShowSettings((v) => !v)} />
        <IconBtn n="close" label="关闭" onClick={onClose} />
      </div>
      <div className="dsh-cau_panelBody">
        {showSettings ? (
          <CauSettingsBoundary>
            <CauSettings />
          </CauSettingsBoundary>
        ) : (
          <div style={{ display: 'contents' }} key={refreshKey}>
            {view.name === 'home' && (
              <HomeView
                onOpenColumn={openColumn}
                onOpenArticle={(id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx)}
                onViewArchive={() => setStack((s) => [...s, { name: 'archive' }])}
                onViewFollow={() => setStack((s) => [...s, { name: 'follow' }])}
                onViewDeadlines={() => setStack((s) => [...s, { name: 'deadlines' }])}
                onReadChange={recountUnread}
              />
            )}
            {view.name === 'site' && (
              <ColumnView site={view.site} onBack={back} onOpenArticle={(id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx)} onOpenColumn={openColumn} />
            )}
            {view.name === 'column' && (
              <ColumnView site={view.site} column={view.column} onBack={back} onOpenArticle={(id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx)} onOpenColumn={openColumn} />
            )}
            {view.name === 'article' && (
              <ArticleView articleId={view.id} siteName={view.siteName} columnName={view.columnName} onBack={back} onOpenArticle={replaceArticle} siblings={view.siblings} index={view.index} />
            )}
            {view.name === 'archive' && <ArchiveView onBack={back} onOpenArticle={(id) => openArticle(id)} />}
            {view.name === 'follow' && <FollowView onBack={back} onOpenArticle={(id) => openArticle(id)} />}
            {view.name === 'manage' && <ManageView onBack={back} />}
            {view.name === 'deadlines' && <DeadlinesView onBack={back} onOpenArticle={(id) => openArticle(id)} />}
          </div>
        )}
      </div>
      <div className="dsh-cau_panelFoot">
        <span className="dsh-cau_footDot" data-on={metaTime ? '1' : '0'} />
        <span className="dsh-cau_footText">云端更新于 {metaTime || '—'} · 未读 {unread}</span>
        <button
          type="button"
          className={'dsh-cau_footBtn' + (refreshing ? ' spin' : '')}
          title="强制刷新（重新拉取云端数据）"
          aria-label="刷新"
          onClick={() => void refresh()}
        >
          <Ic n="refresh" />
        </button>
      </div>
    </div>
  )
}

export const PANEL_CSS = `
.dsh-cau_panel{position:fixed;top:var(--cau-panel-top,12px);right:12px;bottom:12px;z-index:30;display:flex;flex-direction:column;width:var(--cau-panel-w,540px);max-width:calc(100vw - 48px);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 86%,transparent);backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2);border:1px solid var(--cau-line);border-radius:var(--cau-r-l);box-shadow:var(--dsw-shadow-lv3,0 16px 40px rgba(8,12,18,.16)),inset 0 1px 0 rgba(255,255,255,.06);overflow:hidden;animation:dsh-cau-rise .18s ease-out}
body[data-ds-dark-theme] .dsh-cau_panel{background:color-mix(in srgb,var(--dsw-specific-menu,#14161a) 93%,transparent)}
body[data-ds-dark-theme] .dsh-cau_ov{background:var(--cau-brand-a9)}
body.dsh-cau-drawer-open{--cau-panel-w:max(0px,min(540px,calc(100vw - 640px)))}
body.dsh-cau-drawer-open [data-conversation-scroll]{margin-right:calc(var(--cau-panel-w) + 24px);transition:margin-right var(--ds-transition-duration-slow,.2s) var(--ds-ease-in-out,ease-out)}
@keyframes dsh-cau-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes dsh-cau-viewin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes dsh-cau-spin{to{transform:rotate(360deg)}}
.dsh-cau_panelHead{flex:none;display:flex;align-items:center;height:48px;padding:0 8px 0 14px;gap:3px;border-bottom:1px solid var(--cau-line-soft)}
.dsh-cau_panelEmblem{flex:none;display:flex;color:var(--cau-brand);margin-right:3px}
.dsh-cau_panelEmblem svg{display:block;height:18px;width:auto}
.dsh-cau_panelName{flex:1;min-width:0;display:flex;align-items:center;gap:8px;overflow:hidden}
.dsh-cau_panelNameImg{flex:none;display:flex;align-items:center;color:var(--cau-brand)}
.dsh-cau_panelNameImg svg{display:block;width:auto;height:20px}
.dsh-cau_panelHead .dsh-cau_cauLogo{font-size:18px}
.dsh-cau_panelHead .dsh-cau_songtiName{font-size:19px;color:var(--cau-brand);white-space:nowrap}
.dsh-cau_panelTitle{flex:none;font-size:12px;font-weight:600;letter-spacing:.05em;color:var(--cau-ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_iconBtn{flex:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink3);cursor:pointer}
.dsh-cau_iconBtn:hover{background:var(--cau-hover);color:var(--cau-ink)}
.dsh-cau_iconBtn[data-on='true']{color:var(--cau-brand);background:var(--cau-brand-a9)}
.dsh-cau_iconBtn svg{display:block;width:16px;height:16px}
.dsh-cau_panelBody{flex:1;min-height:0;overflow-y:auto;padding:6px 14px 14px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2)) transparent}
.dsh-cau_panelBody::-webkit-scrollbar{width:8px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2));border-radius:4px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,rgba(0,0,0,.3))}
.dsh-cau_panelFoot{flex:none;display:flex;align-items:center;gap:7px;height:34px;padding:0 8px 0 14px;border-top:1px solid var(--cau-line-soft);font-size:11px;color:var(--cau-ink3)}
.dsh-cau_footDot{flex:none;width:5px;height:5px;border-radius:50%;background:var(--cau-ink3)}
.dsh-cau_footDot[data-on='1']{background:var(--cau-ok)}
.dsh-cau_footText{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_footBtn{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--cau-ink3);cursor:pointer}
.dsh-cau_footBtn:hover{background:var(--cau-hover);color:var(--cau-ink)}
.dsh-cau_footBtn svg{display:block;width:13px;height:13px}
.dsh-cau_footBtn.spin svg{animation:dsh-cau-spin .8s linear infinite}
.dsh-cau_view{display:block}
.dsh-cau_view>*{animation:dsh-cau-viewin .18s ease-out both}
.dsh-cau_view>*:nth-child(2){animation-delay:.04s}
.dsh-cau_view>*:nth-child(3){animation-delay:.07s}
.dsh-cau_view>*:nth-child(4){animation-delay:.1s}
.dsh-cau_view>*:nth-child(n+5){animation-delay:.13s}
.dsh-cau_loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:28px 0;font-size:12px;color:var(--cau-ink3)}
.dsh-cau_spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--cau-brand-a16);border-top-color:var(--cau-brand);animation:dsh-cau-spin .8s linear infinite}
.dsh-cau_msg{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin:14px 0 4px;padding:12px;border:1px solid var(--cau-line);border-radius:var(--cau-r-m)}
.dsh-cau_msgText{font-size:12px;line-height:18px;color:var(--cau-ink2)}
.dsh-cau_msgBtn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border:1px solid var(--cau-line);border-radius:10px;background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_msgBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_msgBtnPrimary{background:var(--cau-brand);border-color:transparent;color:#fff;border-radius:999px}
.dsh-cau_msgBtnPrimary:hover{background:var(--cau-brand);color:#fff;opacity:.9}
.dsh-cau_hint{margin-top:8px;padding:8px 10px;border-radius:var(--cau-r-s);background:var(--cau-fill);font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_hintErr{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_sec{margin-top:18px}
.dsh-cau_sec:first-child{margin-top:6px}
.dsh-cau_secHead{display:flex;align-items:center;height:22px;margin-bottom:8px;gap:8px}
.dsh-cau_secMark{flex:none;width:2px;height:11px;border-radius:2px;background:var(--cau-brand);opacity:.85}
.dsh-cau_secTitle{flex:none;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;color:var(--cau-ink2)}
.dsh-cau_secTitle svg{display:block;width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_secLine{flex:1;min-width:12px;height:1px;background:var(--cau-line-soft)}
.dsh-cau_secActs{flex:none;display:flex;align-items:center;gap:2px}
.dsh-cau_card{border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);padding:4px;overflow:hidden;background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 28%,transparent);box-shadow:0 1px 2px rgba(10,15,22,.03)}
.dsh-cau_empty{display:flex;flex-direction:column;align-items:center;gap:5px;padding:20px 12px;text-align:center;font-size:12px;color:var(--cau-ink3)}
.dsh-cau_emptyIcon{display:flex;color:var(--cau-ink3);opacity:.75}
.dsh-cau_emptyIcon svg{width:22px;height:22px}
.dsh-cau_emptyMain{font-size:12px;line-height:18px;color:var(--cau-ink2)}
.dsh-cau_emptySub{font-size:11px;line-height:16px;color:var(--cau-ink3);max-width:330px}
.dsh-cau_textBtn{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border:none;border-radius:6px;background:transparent;color:var(--cau-brand);font-size:11px;cursor:pointer}
.dsh-cau_textBtn:hover{background:var(--cau-brand-a9)}
.dsh-cau_textBtn.dsh-cau_on{font-weight:600}
.dsh-cau_textBtn:disabled{opacity:.5;cursor:default}
.dsh-cau_textBtn svg{width:11px;height:11px}
.dsh-cau_bread{display:flex;align-items:center;gap:8px;padding:2px 0 10px}
.dsh-cau_backBtn{flex:none;display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border:none;border-radius:999px;background:transparent;color:var(--cau-brand);font-size:12px;cursor:pointer}
.dsh-cau_backBtn:hover{background:var(--cau-brand-a9)}
.dsh-cau_backBtn svg{width:12px;height:12px}
.dsh-cau_breadPath{flex:1;min-width:0;font-size:11px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_dlRow{padding:7px 8px;border-radius:var(--cau-r-s)}
.dsh-cau_dlRow:hover{background:var(--cau-hover)}
.dsh-cau_dlRow.soon{background:color-mix(in srgb,var(--cau-warn) 8%,transparent)}
.dsh-cau_dlRow.due{background:color-mix(in srgb,var(--cau-err) 9%,transparent)}
.dsh-cau_dlRow.soon .dsh-cau_dlDate{color:var(--cau-warn)}
.dsh-cau_dlRow.due .dsh-cau_dlDate{color:var(--cau-err)}
.dsh-cau_dlRow.archived{opacity:.6}
.dsh-cau_dlArch{flex:none;font-size:10px;padding:1px 7px;border-radius:999px;background:var(--cau-fill);color:var(--cau-ink3)}
.dsh-cau_mgArch{flex:none;display:flex;color:var(--cau-warn)}
.dsh-cau_mgArch svg{width:12px;height:12px}
/* ---- 我的事项大卡 + 全部待办入口 ---- */
.dsh-cau_mineGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:10px;margin-bottom:10px}
.dsh-cau_mineCard{position:relative;display:flex;flex-direction:column;gap:4px;padding:12px 13px 12px 16px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 30%,transparent);box-shadow:0 1px 2px rgba(10,15,22,.03);cursor:pointer;overflow:hidden}
.dsh-cau_mineCard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--cau-brand),var(--cau-brand-a35))}
.dsh-cau_mineCard:hover{border-color:var(--cau-brand-a35)}
.dsh-cau_mineCard.expired{opacity:.75}
.dsh-cau_mineCard.expired::before{background:var(--cau-ink3);opacity:.45}
.dsh-cau_mineCard.soon::before{background:linear-gradient(180deg,var(--cau-warn),color-mix(in srgb,var(--cau-warn) 35%,transparent))}
.dsh-cau_mineCard.due::before{background:linear-gradient(180deg,var(--cau-err),color-mix(in srgb,var(--cau-err) 35%,transparent))}
.dsh-cau_mineCard.soon .dsh-cau_mineDay{color:var(--cau-warn)}
.dsh-cau_mineCard.due .dsh-cau_mineDay{color:var(--cau-err)}
/* 今日要览（主动察觉层 Hero：对角极浅品牌渐变，首页唯一一处「浓」品牌色） */
.dsh-cau_ov{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:11px 13px;border:1px solid var(--cau-brand-a22);border-radius:14px;background:linear-gradient(135deg,var(--cau-brand-a12),var(--cau-brand-a6) 60%,transparent)}
.dsh-cau_ovTitle{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_ovTitle svg{width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_ovChip{display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:2px 9px;border-radius:999px;background:var(--cau-fill);color:var(--cau-ink2)}
.dsh-cau_ovChip svg{width:11px;height:11px}
.dsh-cau_ovChip.hl{background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_ovChip.due{background:color-mix(in srgb,var(--cau-warn) 12%,transparent);color:var(--cau-warn)}
.dsh-cau_ovChip.hit{background:var(--cau-brand-a12);color:var(--cau-brand)}
.dsh-cau_ovList{display:flex;flex-direction:column;gap:2px;width:100%;margin-top:3px}
.dsh-cau_ovRow{display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:11px;line-height:15px;color:var(--cau-ink2);cursor:pointer;border-radius:6px}
.dsh-cau_ovRow:hover{background:var(--cau-brand-a6)}
.dsh-cau_ovRow em{flex:none;display:inline-flex;align-items:center;font-style:normal;font-size:10px;padding:1px 6px;border-radius:999px;background:var(--cau-brand-a16);color:var(--cau-brand)}
.dsh-cau_ovRow em svg{width:10px;height:10px}
.dsh-cau_ovRow .dsh-cau_ovTitleTxt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--cau-ink)}
.dsh-cau_ovRow i{flex:none;font-style:normal;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--cau-ink3)}
.dsh-cau_impHit{flex:none;display:flex;color:var(--cau-brand)}
.dsh-cau_impHit svg{width:12px;height:12px}
.dsh-cau_mineDate{display:flex;align-items:baseline;gap:6px}
.dsh-cau_mineDay{font-size:30px;font-weight:700;line-height:1;color:var(--cau-brand)}
.dsh-cau_mineCard.expired .dsh-cau_mineDay{color:var(--cau-ink3)}
.dsh-cau_mineYM{font-size:13px;font-weight:500;color:var(--cau-ink2)}
.dsh-cau_mineCount{flex:none;margin-left:auto;font-size:11px;font-weight:600;color:var(--cau-brand)}
.dsh-cau_mineCard.expired .dsh-cau_mineCount{color:var(--cau-err)}
.dsh-cau_mineTitle{font-size:13px;line-height:19px;color:var(--cau-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:38px}
.dsh-cau_mineFoot{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-cau_mineCol{flex:1;min-width:0;font-size:11px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mineActs{flex:none;display:flex;align-items:center;gap:2px}
.dsh-cau_mineEditRow{display:flex;gap:6px;align-items:flex-end;margin-top:2px}
.dsh-cau_deadlineEntry{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 13px;border:1px dashed var(--cau-line);border-radius:var(--cau-r-m)}
.dsh-cau_deadlineEntry:hover{border-color:var(--cau-brand-a35);background:var(--cau-brand-a6)}
.dsh-cau_deadlineEntryMain{flex:1;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--cau-ink2);cursor:pointer}
.dsh-cau_deadlineEntryMain svg{width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_deadlineEntryMain:hover{color:var(--cau-brand)}
.dsh-cau_deadlineEntryArrow{margin-left:auto;color:var(--cau-ink3)}
/* ---- 待办中心（全部待办视图） ---- */
.dsh-cau_dlHint{font-size:12px;line-height:17px;color:var(--cau-ink3);margin:4px 0 8px}
.dsh-cau_dlChip{height:24px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_dlChip:hover{background:var(--cau-hover)}
.dsh-cau_dlChip.on{background:var(--cau-brand-a12);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_dlList{display:flex;flex-direction:column;gap:2px}
.dsh-cau_dlTop{display:flex;align-items:baseline;gap:6px;min-width:0}
.dsh-cau_dlItem{flex:none;font-size:12px;font-weight:500;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.dsh-cau_dlDate{flex:none;font-size:11px;font-weight:500;color:var(--cau-warn)}
.dsh-cau_dlCol{flex:none;font-size:10px;color:var(--cau-ink3)}
.dsh-cau_dlTitleWrap{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px}
.dsh-cau_dlTitle{flex:1;min-width:0;font-size:11px;line-height:16px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.dsh-cau_dlTitle:hover{color:var(--cau-ink)}
.dsh-cau_dlAct{flex:none;display:flex;align-items:center;gap:4px}
.dsh-cau_impRow{display:flex;gap:7px;width:100%;padding:8px;border-radius:var(--cau-r-s)}
.dsh-cau_impRow:hover{background:var(--cau-hover)}
.dsh-cau_impDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--cau-brand);margin-top:6px}
.dsh-cau_impDot[data-read='1']{opacity:0}
.dsh-cau_impMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_impTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_impTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_impSummary{font-size:12px;line-height:17px;color:var(--cau-ink2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_impMeta{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_followBtn,.dsh-cau_impArch{flex:none;align-self:flex-start;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--cau-ink3);cursor:pointer}
.dsh-cau_followBtn{margin-right:10px}
.dsh-cau_followBtn:hover,.dsh-cau_impArch:hover{background:var(--cau-hover);color:var(--cau-ink)}
.dsh-cau_followBtn.dsh-cau_on{color:var(--cau-brand)}
.dsh-cau_followBtn svg,.dsh-cau_impArch svg{width:14px;height:14px}
.dsh-cau_impActs{flex:none;display:flex;align-items:flex-start;gap:2px;margin-right:10px;align-self:flex-start}
.dsh-cau_impRow .dsh-cau_followBtn{margin-right:0}
.dsh-cau_newsSubHead{display:flex;align-items:center;gap:6px;padding:8px 8px 4px;font-size:11px;font-weight:600;letter-spacing:.05em;color:var(--cau-ink2);margin-top:6px;border-top:1px solid var(--cau-line-soft)}
.dsh-cau_newsSubHead:first-child{border-top:none;margin-top:0;padding-top:2px}
.dsh-cau_newsSubHead svg{width:12px;height:12px;color:var(--cau-brand)}
.dsh-cau_newsSubHead>span{display:inline-flex;align-items:center;gap:4px}
.dsh-cau_newsSubHead em{font-style:normal;font-size:10px;font-weight:500;color:var(--cau-ink3)}
.dsh-cau_secCount{flex:none;font-size:10px;color:var(--cau-ink3);padding:1px 7px;border-radius:999px;background:var(--cau-fill)}
.dsh-cau_portalTag{flex:none;font-size:10px;line-height:16px;padding:0 6px;border-radius:999px;font-weight:500;color:var(--cau-brand);background:var(--cau-brand-a12)}
.dsh-cau_portalCard{display:flex;flex-direction:column;gap:9px;padding:12px;border:1px dashed var(--cau-brand-a35);border-radius:var(--cau-r-m);background:linear-gradient(135deg,var(--cau-brand-a9),transparent 70%)}
.dsh-cau_portalCardTitle{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--cau-brand)}
.dsh-cau_portalCardTitle svg{width:14px;height:14px}
.dsh-cau_portalCardDesc{font-size:12px;line-height:18px;color:var(--cau-ink2)}
.dsh-cau_badge{flex:none;font-size:10px;line-height:16px;padding:0 7px;border-radius:999px;font-weight:500}
.dsh-cau_badgeHigh{color:var(--cau-err);background:color-mix(in srgb,var(--cau-err) 12%,transparent)}
.dsh-cau_badgeMid{color:var(--cau-warn);background:color-mix(in srgb,var(--cau-warn) 16%,transparent)}
.dsh-cau_badgeLow{color:var(--cau-ink3);background:var(--cau-fill)}
.dsh-cau_colGroup{margin-bottom:10px}
.dsh-cau_colGroup:last-child{margin-bottom:0}
.dsh-cau_colSiteBtn{display:block;width:100%;padding:5px 8px;border:none;border-radius:var(--cau-r-s);background:transparent;text-align:left;font-size:13px;font-weight:500;color:var(--cau-ink);cursor:pointer}
.dsh-cau_colSiteBtn:hover{background:var(--cau-hover)}
.dsh-cau_colSiteBtn.dsh-cau_dis{color:var(--cau-ink3);cursor:default}
.dsh-cau_colSiteBtn.dsh-cau_dis:hover{background:transparent}
.dsh-cau_disTag{display:inline-flex;align-items:center;margin-left:6px;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--cau-warn) 16%,transparent);color:var(--cau-warn);font-size:11px;font-weight:500}
.dsh-cau_colChips{display:flex;flex-wrap:wrap;gap:6px;padding-left:8px}
.dsh-cau_chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--cau-line-soft);border-radius:999px;font-size:12px;color:var(--cau-ink2);cursor:default;background:transparent}
.dsh-cau_chipBtn{cursor:pointer}
.dsh-cau_chipBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_chipCount{font-style:normal;font-size:10px;color:var(--cau-ink3)}
.dsh-cau_quick{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.dsh-cau_quickLink{display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border:1px solid var(--cau-line-soft);border-radius:10px;font-size:12px;color:var(--cau-ink2);text-decoration:none;background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 26%,transparent)}
.dsh-cau_quickLink:hover{color:var(--cau-brand);border-color:var(--cau-brand-a35);background:var(--cau-brand-a6)}
.dsh-cau_quickLink svg{width:11px;height:11px;opacity:.75}
.dsh-cau_tags{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
.dsh-cau_tag{padding:3px 9px;border:none;border-radius:999px;background:var(--cau-fill);color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_tagOn{background:var(--cau-brand-a16);color:var(--cau-brand)}
.dsh-cau_list{display:flex;flex-direction:column}
.dsh-cau_row{display:flex;gap:7px;width:100%;padding:8px;border:none;border-radius:var(--cau-r-s);background:transparent;text-align:left;cursor:pointer;font:inherit;color:inherit}
.dsh-cau_row:hover{background:var(--cau-hover)}
.dsh-cau_rowDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--cau-brand);margin-top:6px}
.dsh-cau_rowDot[data-read='1']{opacity:0}
.dsh-cau_rowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_rowTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_rowTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_rowSummary{font-size:12px;line-height:17px;color:var(--cau-ink2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_rowMeta{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_atitle{font-size:17px;font-weight:600;line-height:25px;color:var(--cau-ink);margin:2px 0 6px}
.dsh-cau_ameta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--cau-ink3);margin-bottom:10px}
.dsh-cau_aimgTag{padding:0 5px;border-radius:6px;background:var(--cau-fill);color:var(--cau-ink3)}
.dsh-cau_asummary{padding:10px 12px;border:1px solid var(--cau-brand-a16);border-radius:10px;background:var(--cau-brand-a6);margin-bottom:10px}
.dsh-cau_asumHead{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--cau-brand);margin-bottom:4px}
.dsh-cau_asumText{font-size:13px;line-height:20px;color:var(--cau-ink)}
.dsh-cau_adeadline{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;padding:9px 12px;border-radius:10px;background:color-mix(in srgb,var(--cau-warn) 12%,transparent);margin-bottom:10px}
.dsh-cau_adeadlineIcon{display:flex;color:var(--cau-warn)}
.dsh-cau_adeadlineIcon svg{width:13px;height:13px}
.dsh-cau_adeadlineItem{font-size:13px;font-weight:600;color:var(--cau-warn)}
.dsh-cau_adeadlineDate{font-size:12px;font-weight:600;color:var(--cau-warn)}
.dsh-cau_adeadlineEv{font-size:11px;color:var(--cau-ink2)}
.dsh-cau_abody{font-size:14px;line-height:26px;color:var(--cau-ink);white-space:pre-wrap;word-break:break-word}
.dsh-cau_aactions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid var(--cau-line-soft)}
.dsh-cau_aBtn{display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border:1px solid var(--cau-line);border-radius:10px;background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_aBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_aBtn svg{width:12px;height:12px}
.dsh-cau_aBtnOn{border-color:var(--cau-brand-a55);color:var(--cau-brand);background:var(--cau-brand-a9)}
.dsh-cau_aBtnPrimary{background:var(--cau-brand);border-color:transparent;color:#fff}
.dsh-cau_aBtnPrimary:hover{background:var(--cau-brand);color:#fff;opacity:.9}
.dsh-cau_anav{display:flex;justify-content:space-between;margin-top:12px}
.dsh-cau_anavBtn{flex:none;display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border:none;border-radius:999px;background:transparent;color:var(--cau-brand);font-size:12px;cursor:pointer}
.dsh-cau_anavBtn:hover{background:var(--cau-brand-a9)}
.dsh-cau_anavBtn svg{width:12px;height:12px}
.dsh-cau_acacheTag{padding:0 5px;border-radius:6px;background:var(--cau-brand-a9);color:var(--cau-brand)}
.dsh-cau_mgIntro{font-size:12px;line-height:18px;color:var(--cau-ink2);margin:4px 0 10px}
.dsh-cau_mgToolbar{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
.dsh-cau_mgSearch{width:100%;box-sizing:border-box;height:28px;padding:0 10px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink);font-size:12px;outline:none}
.dsh-cau_mgSearch:focus{border-color:var(--cau-brand-a55)}
.dsh-cau_mgFilters{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dsh-cau_mgChip{height:24px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_mgChip:hover{background:var(--cau-hover)}
.dsh-cau_mgChip.on{background:var(--cau-brand-a12);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_mgSel{height:24px;padding:0 6px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px}
.dsh-cau_mgLabel{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_mgDate{height:24px;box-sizing:border-box;padding:0 6px;border:1px solid var(--cau-line);border-radius:6px;background:transparent;color:var(--cau-ink);font-size:11px}
.dsh-cau_mgCheck{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-s);color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_mgCheck input{accent-color:var(--cau-brand)}
.dsh-cau_mgChipBtn{height:24px;padding:0 10px;border:1px dashed var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_mgActs{display:flex;gap:6px;flex-wrap:wrap}
.dsh-cau_mgBtn{height:26px;padding:0 12px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer}
.dsh-cau_mgBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_mgBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_mgBtn.warn{background:color-mix(in srgb,var(--cau-err) 12%,transparent);border-color:color-mix(in srgb,var(--cau-err) 45%,transparent);color:var(--cau-err)}
.dsh-cau_mgBar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:var(--cau-r-s);background:var(--cau-fill);font-size:12px;color:var(--cau-ink2);margin-bottom:8px}
.dsh-cau_mgDel{flex:none;height:28px;padding:0 14px;border:none;border-radius:var(--cau-r-s);background:var(--cau-err);color:#fff;font-size:12px;cursor:pointer}
.dsh-cau_mgDel:hover{opacity:.9}
.dsh-cau_mgDel:disabled{opacity:.45;cursor:default}
.dsh-cau_mgConfirm{margin-bottom:8px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--cau-err) 35%,transparent);border-radius:var(--cau-r-s);background:color-mix(in srgb,var(--cau-err) 6%,transparent)}
.dsh-cau_mgConfirmText{font-size:12px;line-height:18px;color:var(--cau-ink);margin-bottom:8px}
.dsh-cau_mgConfirmActs{display:flex;gap:6px}
.dsh-cau_mgMsg{margin:6px 0;padding:8px 10px;border-radius:var(--cau-r-s);font-size:12px;line-height:18px}
.dsh-cau_mgMsg.ok{background:color-mix(in srgb,var(--cau-ok) 10%,transparent);color:var(--cau-ok)}
.dsh-cau_mgMsg.error{background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_mgList{display:flex;flex-direction:column;gap:10px}
.dsh-cau_mgGroup{border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);overflow:hidden}
.dsh-cau_mgGroupName{padding:6px 10px;font-size:12px;font-weight:500;color:var(--cau-ink2);background:var(--cau-fill)}
.dsh-cau_mgRow{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-top:1px solid var(--cau-line-soft);cursor:pointer}
.dsh-cau_mgRow input{margin-top:3px}
.dsh-cau_mgRow.pro{border-left:3px solid var(--cau-warn);background:color-mix(in srgb,var(--cau-warn) 7%,transparent)}
.dsh-cau_mgMine{display:flex;color:var(--cau-warn)}
.dsh-cau_mgMine svg{width:12px;height:12px}
.dsh-cau_mineArt{flex:none;display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 10px;border:1px solid var(--cau-brand-a35);border-radius:999px;background:var(--cau-brand-a9);color:var(--cau-brand);font-size:11px;cursor:pointer}
.dsh-cau_mineArt:hover{background:var(--cau-brand-a16)}
.dsh-cau_mineArt svg{width:10px;height:10px}
.dsh-cau_mineEdit{display:flex;flex-direction:column;gap:6px;margin-top:2px;padding-top:8px;border-top:1px dashed var(--cau-line)}
.dsh-cau_mineEditNew{padding:10px 12px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s)}
.dsh-cau_mineLabel{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;font-size:11px;color:var(--cau-ink3)}
.dsh-cau_mineLabel span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mineSrc{font-size:11px;line-height:16px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.dsh-cau_mgRowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dsh-cau_mgRowTitle{font-size:13px;line-height:18px;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mgStar{display:inline-flex;color:var(--cau-warn);margin-left:4px}
.dsh-cau_mgStar svg{width:11px;height:11px}
.dsh-cau_mgRowSub{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11px;color:var(--cau-ink3)}
.dsh-cau_mgOld{padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--cau-warn) 14%,transparent);color:var(--cau-warn)}
.dsh-cau_mgHl{color:var(--cau-brand);font-weight:600;background:var(--cau-brand-a12);border-radius:3px;padding:0 1px}
.dsh-cau_mgRowUrl{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`
