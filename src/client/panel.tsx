/**
 * cau-portal 面板（阶段4 第4步 批②/③：全套浏览）。
 * 圆角毛玻璃卡片浮层（右缘留边距、垂直居中 540px/74vh）+ 导航栈：
 * L0 首页（panel-home）→ L1 栏目页（panel-column，站点/栏目）→ L2 文章阅读（panel-article）+ 归档/关注 视图。
 * 头部有「固定」开关（固定后点外部/Esc 不关闭，仅 ✕ 关）。
 * 未读口径：AI 重要（高/中）+近 7 天；打开即读（计数即时减一）；tertiary 计数无红点。
 */
import { Component, useEffect, useRef, useState } from 'react'
import { HomeView } from './panel-home'
import { ColumnView } from './panel-column'
import { ArticleView } from './panel-article'
import { ManageView } from './panel-manage'
import { DeadlinesView } from './panel-deadlines'
import { CauSettings } from './settings'
import {
  loadSettings,
  saveSettings,
  readCloudText,
  loadReadSet,
  loadFollow,
  loadDeadlineOps,
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

/** 页面加载时初始化按钮未读计数（不弹窗；无令牌/无 summary 时返回 0） */
export async function fetchUnreadCount(): Promise<number> {
  const token = loadSettings().githubToken
  if (!token) return 0
  const b = await loadBundle(token)
  if (!b.summary) return 0
  const readSet = loadReadSet()
  return (b.summary.important ?? []).filter((it: any) => !readSet.includes(it.article_id || it.url)).length
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

// ---- 归档视图（已归档待办）----
function ArchiveView(props: { onBack: () => void; onOpenArticle: (id: string) => void }) {
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => {
    void (async () => {
      const token = loadSettings().githubToken
      if (!token) return
      const b = await loadBundle(token)
      const ops = loadDeadlineOps()
      const list = (b.summary?.deadlines || []).filter((d: any) => ops[d.article_id || d.url] === 'archive')
      setRows(list)
    })()
  }, [])
  return (
    <div className="dsh-cau_view">
      <div className="dsh-cau_bread">
        <button type="button" className="dsh-cau_backBtn" onClick={props.onBack}>‹ 返回</button>
        <span className="dsh-cau_breadPath">已归档待办</span>
      </div>
      <div className="dsh-cau_card">
        {rows.length === 0 && <div className="dsh-cau_empty">暂无归档待办</div>}
        {rows.map((d) => (
          <div className="dsh-cau_dlRow" key={d.article_id || d.url}>
            <span className="dsh-cau_dlTitleWrap" onClick={() => props.onOpenArticle(d.article_id || d.url)}>
              <span className="dsh-cau_dlItem">{d.item}</span>
              <span className="dsh-cau_dlTitle">{d.title}</span>
            </span>
            <span className="dsh-cau_dlCol">{d.date}</span>
          </div>
        ))}
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
        <button type="button" className="dsh-cau_backBtn" onClick={props.onBack}>‹ 返回</button>
        <span className="dsh-cau_breadPath">关注（{list.length}）</span>
      </div>
      <div className="dsh-cau_card">
        {list.length === 0 && <div className="dsh-cau_empty">还没有关注内容</div>}
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
  emblem: string
  nameSvg: string
  onClose: () => void
  onUnreadChange?: (n: number) => void
}) {
  const { outsideIgnore, emblem, nameSvg, onClose, onUnreadChange } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const [stack, setStack] = useState<View[]>([{ name: 'home' }])
  const [metaTime, setMetaTime] = useState('')
  const [unread, setUnread] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [pinned, setPinned] = useState(() => !!loadSettings().panelPinned)
  const [topInset, setTopInset] = useState(() => measureTopInset())
  const view = stack[stack.length - 1]

  const togglePinned = () =>
    setPinned((p) => {
      const next = !p
      saveSettings({ ...loadSettings(), panelPinned: next })
      return next
    })

  // 头部更新时间 + 初始未读
  useEffect(() => {
    void (async () => {
      const token = loadSettings().githubToken
      if (!token) return
      const b = await loadBundle(token)
      if (b.summary?.last_updated || b.index?.last_updated) setMetaTime(shortTime(b.summary?.last_updated || b.index?.last_updated))
      const readSet = loadReadSet()
      const n = (b.summary?.important || []).filter((it: any) => !readSet.includes(it.article_id || it.url)).length
      setUnread(n)
    })()
  }, [])

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
  const openArticle = (id: string, siteName?: string, columnName?: string, siblings?: { id: string; title: string }[], index?: number) =>
    setStack((s) => [...s, { name: 'article', id, back: s[s.length - 1], siteName, columnName, siblings, index }])
  const replaceArticle = (id: string, siblings?: { id: string; title: string }[], index?: number) =>
    setStack((s) => {
      const top = s[s.length - 1]
      if (top.name === 'article') return [...s.slice(0, -1), { ...top, id, siblings, index }]
      return [...s, { name: 'article', id, back: top, siblings, index }]
    })

  const openColumn = (site: string, column: string | null) =>
    setStack((s) => [...s, column ? { name: 'column', site, column } : { name: 'site', site }])

  return (
    <div ref={rootRef} className="dsh-cau_panel" role="dialog" aria-label="农大门户" style={{ ['--cau-panel-top' as any]: `${topInset}px` }}>
      <div className="dsh-cau_panelHead">
        <span className="dsh-cau_panelEmblem" dangerouslySetInnerHTML={{ __html: emblem }} />
        <span className="dsh-cau_panelName">
          <span className="dsh-cau_panelNameImg" dangerouslySetInnerHTML={{ __html: nameSvg }} />
          {showSettings && <span className="dsh-cau_panelTitle">设置</span>}
        </span>
        {!showSettings && metaTime && <span className="dsh-cau_panelMeta">更新 {metaTime}</span>}
        <button
          type="button"
          className="dsh-cau_panelPin"
          data-pinned={pinned}
          aria-pressed={pinned}
          aria-label={pinned ? '取消固定面板' : '固定面板'}
          title={pinned ? '取消固定（点击外部/Esc 会关闭）' : '固定面板（点击外部/Esc 不关闭）'}
          onClick={togglePinned}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/></svg>
        </button>
        <button
          type="button"
          className="dsh-cau_panelTab"
          aria-pressed={false}
          onClick={() => setStack((s) => [...s, { name: 'manage' }])}
        >
          管理
        </button>
        <button
          type="button"
          className="dsh-cau_panelTab"
          aria-pressed={showSettings}
          onClick={() => setShowSettings((v) => !v)}
        >
          {showSettings ? '返回首页' : '设置'}
        </button>
        <button type="button" className="dsh-cau_panelClose" aria-label="关闭" onClick={onClose}>✕</button>
      </div>
      <div className="dsh-cau_panelBody">
        {showSettings ? (
          <CauSettingsBoundary>
            <CauSettings />
          </CauSettingsBoundary>
        ) : (
          <>
            {view.name === 'home' && (
              <HomeView
                onOpenColumn={openColumn}
                onOpenArticle={(id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx)}
                onViewArchive={() => setStack((s) => [...s, { name: 'archive' }])}
                onViewFollow={() => setStack((s) => [...s, { name: 'follow' }])}
                onViewDeadlines={() => setStack((s) => [...s, { name: 'deadlines' }])}
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
          </>
        )}
      </div>
      <div className="dsh-cau_panelFoot">数据来自 GitHub 云端 · 每 2 小时自动更新 · 关注无上限 · 待办可留存/归档</div>
    </div>
  )
}

export const PANEL_CSS = `
.dsh-cau_panel{position:fixed;top:var(--cau-panel-top,12px);right:12px;bottom:12px;z-index:30;display:flex;flex-direction:column;width:var(--cau-panel-w,540px);max-width:calc(100vw - 48px);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 90%,transparent);backdrop-filter:blur(18px) saturate(1.15);-webkit-backdrop-filter:blur(18px) saturate(1.15);border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.1));border-radius:16px;box-shadow:var(--dsw-shadow-lv3,0 8px 28px rgba(0,0,0,.18));overflow:hidden;animation:dsh-cau-fadein .16s ease-out;--cau-brand:#008038}
body[data-ds-dark-theme] .dsh-cau_panel{--cau-brand:#00b856}
body.dsh-cau-drawer-open{--cau-panel-w:max(0px,min(540px,calc(100vw - 640px)))}
body.dsh-cau-drawer-open [data-conversation-scroll]{margin-right:calc(var(--cau-panel-w) + 24px);transition:margin-right var(--ds-transition-duration-slow,.2s) var(--ds-ease-in-out,ease-out)}
@keyframes dsh-cau-fadein{from{opacity:0}to{opacity:1}}
@keyframes dsh-cau-spin{to{transform:rotate(360deg)}}
.dsh-cau_panelHead{flex:none;display:flex;align-items:center;height:44px;padding:0 12px;gap:8px;border-bottom:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06))}
.dsh-cau_panelEmblem{flex:none;display:flex;color:var(--cau-brand)}
.dsh-cau_panelEmblem svg{display:block;height:18px;width:auto}
.dsh-cau_panelName{flex:1;min-width:0;display:flex;align-items:center;gap:6px;overflow:hidden}
.dsh-cau_panelNameImg{flex:none;display:flex;align-items:center}
.dsh-cau_panelNameImg svg{display:block;width:auto;height:22px}
.dsh-cau_panelTitle{flex:none;font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary,#555);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_panelMeta{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_panelClose{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);cursor:pointer;font-size:13px;line-height:1}
.dsh-cau_panelClose:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_panelPin{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary,#888);cursor:pointer}
.dsh-cau_panelPin:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_panelPin svg{display:block;height:15px;width:auto}
.dsh-cau_panelPin[data-pinned='true']{color:var(--cau-brand)}
.dsh-cau_panelTab{flex:none;height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:11px;cursor:pointer;white-space:nowrap}
.dsh-cau_panelTab:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_panelTab[aria-pressed="true"]{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-primary,#111);border-color:var(--cau-brand,#008038)}
.dsh-cau_panelBody{flex:1;min-height:0;overflow-y:auto;padding:4px 12px 12px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2)) transparent}
.dsh-cau_panelBody::-webkit-scrollbar{width:8px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2));border-radius:4px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,rgba(0,0,0,.3))}
.dsh-cau_panelFoot{flex:none;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06));font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_view{display:block}
.dsh-cau_loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:28px 0;font-size:12px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.1));border-top-color:var(--dsw-alias-label-tertiary,#888);animation:dsh-cau-spin .8s linear infinite}
.dsh-cau_msg{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin:14px 0 4px;padding:12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:8px}
.dsh-cau_msgText{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_msgBtn{display:inline-flex;align-items:center;padding:5px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_msgBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_msgBtnPrimary{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:transparent;color:#fff}
.dsh-cau_hint{margin-top:8px;padding:8px 10px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04));font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_hintErr{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_sec{margin-top:14px}
.dsh-cau_sec:first-child{margin-top:6px}
.dsh-cau_secHead{display:flex;align-items:center;height:20px;margin-bottom:6px;gap:6px}
.dsh-cau_secMark{flex:none;width:3px;height:12px;border-radius:2px;background:var(--cau-brand)}
.dsh-cau_secTitle{flex:1;min-width:0;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_card{border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.08));border-radius:8px;padding:4px;overflow:hidden}
.dsh-cau_empty{padding:10px 8px;font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_textBtn{padding:0 4px;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-state-business-primary,#4176e6);font-size:11px;cursor:pointer}
.dsh-cau_textBtn:hover{text-decoration:underline}
.dsh-cau_textBtn.dsh-cau_on{color:var(--cau-brand);font-weight:600}
.dsh-cau_bread{display:flex;align-items:center;gap:8px;padding:2px 0 8px}
.dsh-cau_backBtn{flex:none;padding:3px 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-state-business-primary,#4176e6);font-size:12px;cursor:pointer}
.dsh-cau_backBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_breadPath{flex:1;min-width:0;font-size:11px;color:var(--dsw-alias-label-tertiary,#999);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_dlRow{padding:6px 8px;border-radius:6px}
.dsh-cau_dlRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
/* ---- 我的事项大卡 + 全部待办入口 ---- */
.dsh-cau_mineGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-bottom:10px}
.dsh-cau_mineCard{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border:1px solid color-mix(in srgb,var(--cau-brand,#008038) 30%,transparent);border-radius:12px;background:color-mix(in srgb,var(--cau-brand,#008038) 6%,transparent);cursor:pointer;transition:border-color .12s ease,background .12s ease}
.dsh-cau_mineCard:hover{border-color:color-mix(in srgb,var(--cau-brand,#008038) 60%,transparent);background:color-mix(in srgb,var(--cau-brand,#008038) 9%,transparent)}
.dsh-cau_mineCard.expired{border-color:var(--dsw-alias-border-inverted,rgba(15,17,21,.12));background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.03))}
.dsh-cau_mineDate{display:flex;align-items:baseline;gap:6px}
.dsh-cau_mineDay{font-size:30px;font-weight:700;line-height:1;color:var(--cau-brand,#008038)}
.dsh-cau_mineCard.expired .dsh-cau_mineDay{color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_mineYM{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_mineCount{flex:none;margin-left:auto;font-size:11px;font-weight:600;color:var(--cau-brand,#008038)}
.dsh-cau_mineCard.expired .dsh-cau_mineCount{color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_mineTitle{font-size:13px;line-height:19px;color:var(--dsw-alias-label-primary,#111);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:38px}
.dsh-cau_mineFoot{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-cau_mineCol{flex:1;min-width:0;font-size:11px;color:var(--dsw-alias-label-tertiary,#999);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mineActs{flex:none;display:flex;gap:4px}
.dsh-cau_mineEditRow{display:flex;gap:6px;align-items:flex-end;margin-top:2px}
.dsh-cau_deadlineEntry{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border:1px dashed var(--dsw-alias-border-inverted,rgba(15,17,21,.18));border-radius:8px}
.dsh-cau_deadlineEntryMain{flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:var(--dsw-alias-label-secondary,#555);cursor:pointer}
.dsh-cau_deadlineEntryArrow{color:var(--dsw-alias-label-tertiary,#999)}
/* ---- 待办中心（全部待办视图） ---- */
.dsh-cau_dlHint{font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary,#999);margin:4px 0 8px}
.dsh-cau_dlChip{height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:11px;cursor:pointer}
.dsh-cau_dlChip:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_dlChip.on{background:color-mix(in srgb,var(--cau-brand,#008038) 12%,transparent);border-color:var(--cau-brand,#008038);color:var(--cau-brand,#008038)}
.dsh-cau_dlList{display:flex;flex-direction:column;gap:2px}
.dsh-cau_dlTop{display:flex;align-items:baseline;gap:6px;min-width:0}
.dsh-cau_dlItem{flex:none;font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.dsh-cau_dlDate{flex:none;font-size:11px;font-weight:500;color:var(--dsw-alias-state-warn,#f59e0b)}
.dsh-cau_dlCol{flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_dlTitleWrap{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px}
.dsh-cau_dlTitle{flex:1;min-width:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.dsh-cau_dlTitle:hover{color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_dlAct{flex:none;display:flex;gap:6px}
.dsh-cau_impRow{display:flex;gap:7px;width:100%;padding:7px 8px;border-radius:6px}
.dsh-cau_impRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.dsh-cau_impDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#999);margin-top:5px}
.dsh-cau_impDot[data-read='1']{opacity:0}
.dsh-cau_impMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_impTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_impTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_impSummary{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#555);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_impMeta{font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_followBtn{flex:none;align-self:flex-start;height:24px;min-width:24px;margin-right:10px;padding:0 4px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary,#999);font-size:15px;line-height:24px;cursor:pointer}
.dsh-cau_followBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_followBtn.dsh-cau_on{color:var(--cau-brand)}
.dsh-cau_badge{flex:none;font-size:10px;line-height:16px;padding:0 5px;border-radius:4px;font-weight:500}
.dsh-cau_badgeHigh{color:var(--dsw-alias-state-error-primary,#ec1313);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#ec1313) 12%,transparent)}
.dsh-cau_badgeMid{color:var(--dsw-alias-state-warn,#c77d00);background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 16%,transparent)}
.dsh-cau_badgeLow{color:var(--dsw-alias-label-tertiary,#888);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}
.dsh-cau_colGroup{margin-bottom:10px}
.dsh-cau_colGroup:last-child{margin-bottom:0}
.dsh-cau_colSiteBtn{display:block;width:100%;padding:5px 8px;border:none;border-radius:6px;background:transparent;text-align:left;font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary,#111);cursor:pointer}
.dsh-cau_colSiteBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_colChips{display:flex;flex-wrap:wrap;gap:6px;padding-left:8px}
.dsh-cau_chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:999px;font-size:12px;color:var(--dsw-alias-label-secondary,#555);cursor:default;background:transparent}
.dsh-cau_chipBtn{cursor:pointer}
.dsh-cau_chipBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_chipCount{font-style:normal;font-size:10px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_quick{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.dsh-cau_quickLink{display:flex;align-items:center;justify-content:center;padding:7px 8px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#555);text-decoration:none}
.dsh-cau_quickLink:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_tags{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px}
.dsh-cau_tag{padding:3px 9px;border:none;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-secondary,#555);font-size:11px;cursor:pointer}
.dsh-cau_tagOn{background:color-mix(in srgb,var(--cau-brand) 18%,transparent);color:var(--cau-brand)}
.dsh-cau_list{display:flex;flex-direction:column}
.dsh-cau_row{display:flex;gap:7px;width:100%;padding:7px 8px;border:none;border-radius:6px;background:transparent;text-align:left;cursor:pointer;font:inherit;color:inherit}
.dsh-cau_row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.dsh-cau_rowDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#999);margin-top:5px}
.dsh-cau_rowDot[data-read='1']{opacity:0}
.dsh-cau_rowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_rowTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_rowTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_rowSummary{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#555);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_rowMeta{font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_atitle{font-size:16px;font-weight:600;line-height:24px;color:var(--dsw-alias-label-primary,#111);margin:2px 0 6px}
.dsh-cau_ameta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#999);margin-bottom:10px}
.dsh-cau_aimgTag{padding:0 5px;border-radius:4px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_asummary{padding:10px 12px;border-radius:8px;background:color-mix(in srgb,var(--cau-brand) 7%,transparent);margin-bottom:10px}
.dsh-cau_asumHead{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--cau-brand);margin-bottom:4px}
.dsh-cau_asumText{font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_adeadline{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;padding:9px 12px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 12%,transparent);margin-bottom:10px}
.dsh-cau_adeadlineIcon{font-size:13px}
.dsh-cau_adeadlineItem{font-size:13px;font-weight:600;color:var(--dsw-alias-state-warn,#c77d00)}
.dsh-cau_adeadlineDate{font-size:12px;font-weight:600;color:var(--dsw-alias-state-warn,#c77d00)}
.dsh-cau_adeadlineEv{font-size:11px;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_abody{font-size:14px;line-height:26px;color:var(--dsw-alias-label-primary,#111);white-space:pre-wrap;word-break:break-word}
.dsh-cau_aactions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06))}
.dsh-cau_aBtn{display:inline-flex;align-items:center;padding:5px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_aBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_aBtnOn{border-color:color-mix(in srgb,var(--cau-brand) 45%,transparent);color:var(--cau-brand)}
.dsh-cau_aBtnPrimary{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:transparent;color:#fff}
.dsh-cau_aBtnPrimary:hover{background:var(--dsw-alias-state-business-primary,#4176e6);opacity:.92}
.dsh-cau_anav{display:flex;justify-content:space-between;margin-top:12px}
.dsh-cau_anavBtn{flex:none;padding:5px 10px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-state-business-primary,#4176e6);font-size:12px;cursor:pointer}
.dsh-cau_anavBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_acacheTag{padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--cau-brand) 10%,transparent);color:var(--cau-brand)}
.dsh-cau_mgIntro{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#555);margin:4px 0 10px}
.dsh-cau_mgToolbar{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
.dsh-cau_mgSearch{width:100%;box-sizing:border-box;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;outline:none}
.dsh-cau_mgSearch:focus{border-color:color-mix(in srgb,var(--cau-brand) 55%,transparent)}
.dsh-cau_mgFilters{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dsh-cau_mgChip{height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:11px;cursor:pointer}
.dsh-cau_mgChip:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_mgChip.on{background:color-mix(in srgb,var(--cau-brand) 12%,transparent);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_mgSel{height:24px;padding:0 6px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:11px}
.dsh-cau_mgActs{display:flex;gap:6px;flex-wrap:wrap}
.dsh-cau_mgBtn{height:26px;padding:0 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;cursor:pointer}
.dsh-cau_mgBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_mgBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_mgBtn.warn{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 45%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_mgBar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.045));font-size:12px;color:var(--dsw-alias-label-secondary,#555);margin-bottom:8px}
.dsh-cau_mgDel{flex:none;height:28px;padding:0 14px;border:none;border-radius:6px;background:var(--dsw-alias-state-error-primary,#e5484d);color:#fff;font-size:12px;cursor:pointer}
.dsh-cau_mgDel:hover{opacity:.9}
.dsh-cau_mgDel:disabled{opacity:.45;cursor:default}
.dsh-cau_mgConfirm{margin-bottom:8px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 35%,transparent);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 6%,transparent)}
.dsh-cau_mgConfirmText{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary,#111);margin-bottom:8px}
.dsh-cau_mgConfirmActs{display:flex;gap:6px}
.dsh-cau_mgMsg{margin:6px 0;padding:8px 10px;border-radius:8px;font-size:12px;line-height:18px}
.dsh-cau_mgMsg.ok{background:color-mix(in srgb,var(--dsw-alias-state-success,#2f9e44) 10%,transparent);color:var(--dsw-alias-state-success,#2f9e44)}
.dsh-cau_mgMsg.error{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_mgList{display:flex;flex-direction:column;gap:10px}
.dsh-cau_mgGroup{border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.08));border-radius:10px;overflow:hidden}
.dsh-cau_mgGroupName{padding:6px 10px;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#555);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.03))}
.dsh-cau_mgRow{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.05));cursor:pointer}
.dsh-cau_mgRow input{margin-top:3px}
.dsh-cau_mgRow.pro{border-left:3px solid var(--dsw-alias-state-warn,#d99c00);background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 7%,transparent)}
.dsh-cau_mgMine{color:var(--dsw-alias-state-warn,#c77d00);border-radius:3px}
.dsh-cau_mineArt{flex:none;height:24px;padding:0 9px;border:1px solid color-mix(in srgb,var(--cau-brand,#008038) 45%,transparent);border-radius:6px;background:color-mix(in srgb,var(--cau-brand,#008038) 10%,transparent);color:var(--cau-brand,#008038);font-size:11px;cursor:pointer}
.dsh-cau_mineArt:hover{background:color-mix(in srgb,var(--cau-brand,#008038) 16%,transparent)}
.dsh-cau_mineEdit{display:flex;flex-direction:column;gap:6px;margin-top:2px;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-inverted,rgba(15,17,21,.15))}
.dsh-cau_mineEditNew{padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.15));border-radius:8px}
.dsh-cau_mineLabel{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_mineLabel span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mineSrc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#999);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.dsh-cau_secActs{display:flex;gap:6px;margin-left:auto}
.dsh-cau_mgRowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dsh-cau_mgRowTitle{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mgStar{color:var(--dsw-alias-state-warn,#c77d00);margin-left:4px}
.dsh-cau_mgRowSub{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_mgOld{padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 14%,transparent);color:var(--dsw-alias-state-warn,#c77d00)}
.dsh-cau_mgHl{color:var(--cau-brand);font-weight:600;background:color-mix(in srgb,var(--cau-brand) 12%,transparent);border-radius:3px;padding:0 1px}
.dsh-cau_mgRowUrl{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`
