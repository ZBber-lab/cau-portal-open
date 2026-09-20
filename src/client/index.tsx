/**
 * cau-portal 客户端入口。
 * 侧边栏底部「农大门户」按钮：**2026-09-20 起点击打开 DSH 官方右侧栏里的
 * 「农大门户」tab**（`official.ts` 接线、`tab.tsx` 正文；无会话时置灰提示）；
 * 旧的弹层抽屉代码保留在 `official.USE_OFFICIAL_SIDEBAR = false` 的回退路径上。
 * 按钮规格（定稿）：42px 行高 / 36px 圆钮，宽栏显示名称，收起态悬停 Tooltip；
 * 未读计数：宽栏行尾 tertiary 计数（无红点），收起态并入 Tooltip；
 * 配色全用 DSH --dsw-* 语义 token（带回退值）。
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { CauPanel, PANEL_CSS, fetchUnreadCount } from './panel'
import { SETTINGS_CSS } from './settings'
import { bindCtx, getCtx } from './ctx'
import { CtxBar, CTXBAR_CSS } from './ctxbar'
import { registerToolViews, TOOLVIEW_CSS } from './toolview'
import { subscribeBus, getOpenRequest } from './bus'
import { getTabOpen, getUnread, setUnread, subscribeState } from './state'
import { USE_OFFICIAL_SIDEBAR, followSessions, registerCauTab, toggleCau } from './official'
import { createCauTabBody } from './tab'
import {
  loadSettings,
  loadRules,
  loadNotifySeen,
  saveNotifySeen,
  computeNewAlerts,
  readCloudJson,
} from './data'

// 开源版中性化：不再内联学校校徽/校名题字 SVG（build.mjs 不再注入），改用中性「CAU」徽标 + 宋体题字，配色由 currentColor 跟随所在容器。

const CSS = `
/* ---- UI 批②：设计 token 层（挂 body：DSH 的 --dsw-* token 定义在 body/[data-ds-dark-theme] 上，
     挂 :root 会在求值时找不到它们、全部烤成兜底值（暗色下标题变黑的教训 2026-08-31） ---- */
body{
  --cau-brand:#008038;
  --cau-brand-a6:color-mix(in srgb,var(--cau-brand) 6%,transparent);
  --cau-brand-a9:color-mix(in srgb,var(--cau-brand) 9%,transparent);
  --cau-brand-a12:color-mix(in srgb,var(--cau-brand) 12%,transparent);
  --cau-brand-a16:color-mix(in srgb,var(--cau-brand) 16%,transparent);
  --cau-brand-a22:color-mix(in srgb,var(--cau-brand) 22%,transparent);
  --cau-brand-a35:color-mix(in srgb,var(--cau-brand) 35%,transparent);
  --cau-brand-a55:color-mix(in srgb,var(--cau-brand) 55%,transparent);
  --cau-ink:var(--dsw-alias-label-primary,#16181d);
  --cau-ink2:var(--dsw-alias-label-secondary,#5a6372);
  --cau-ink3:var(--dsw-alias-label-tertiary,#8b95a5);
  --cau-line:var(--dsw-alias-border-inverted,rgba(15,17,21,.1));
  --cau-line-soft:color-mix(in srgb,var(--dsw-alias-border-inverted,rgba(15,17,21,.1)) 55%,transparent);
  --cau-hover:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.045));
  --cau-fill:color-mix(in srgb,var(--dsw-alias-label-primary,#16181d) 4%,transparent);
  --cau-warn:var(--dsw-alias-state-warn,#c77d00);
  --cau-err:var(--dsw-alias-state-error-primary,#e5484d);
  --cau-ok:var(--dsw-alias-state-success,#2f9e44);
  --cau-r-s:8px;--cau-r-m:12px;--cau-r-l:16px;
}
body[data-ds-dark-theme]{--cau-brand:#00b856}
/* ---- 来源主题色（每个来源可选一处；未设置时完全保持原来的品牌绿观感，零变化）----
   做法：把「品牌绿」在**该来源的子树里整体换掉** —— CSS 变量在声明处替换，所以六个淡色底/描边
   也要在这里按来源色重算，这样凡是原来用品牌绿的地方（AI 摘要条、小标签、按钮、未读点、分组头…）
   全部跟着变，而白/灰等中性色一律不动。（2026-09-14 用户纠正：要变的是绿的那部分，不是中性的那部分） */
.dsh-cau_siteAccent{
  --cau-site:var(--cau-site-base);
  --cau-brand:var(--cau-site);
  --cau-brand-a6:color-mix(in srgb,var(--cau-site) 6%,transparent);
  --cau-brand-a9:color-mix(in srgb,var(--cau-site) 9%,transparent);
  --cau-brand-a12:color-mix(in srgb,var(--cau-site) 12%,transparent);
  --cau-brand-a16:color-mix(in srgb,var(--cau-site) 16%,transparent);
  --cau-brand-a22:color-mix(in srgb,var(--cau-site) 22%,transparent);
  --cau-brand-a35:color-mix(in srgb,var(--cau-site) 35%,transparent);
  --cau-brand-a55:color-mix(in srgb,var(--cau-site) 55%,transparent);
}
body[data-ds-dark-theme] .dsh-cau_siteAccent{--cau-site:color-mix(in srgb,var(--cau-site-base) 74%,#fff)}
.dsh-cau_pillRow{display:flex;align-items:center;box-sizing:border-box;height:42px;padding:0 6px;min-width:0}
.dsh-cau_pill{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.09));border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.045));color:var(--dsw-alias-label-primary,#e6e8eb);cursor:pointer;transition:background .15s ease,border-color .15s ease;text-align:left}
.dsh-cau_pill:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.09));border-color:var(--dsw-alias-border-l3,rgba(255,255,255,.18));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pill[aria-expanded='true']{color:var(--cau-brand);border-color:var(--cau-brand-a55);background:var(--cau-brand-a12)}
.dsh-cau_pill[aria-expanded='true']:hover{color:var(--cau-brand);border-color:color-mix(in srgb,var(--cau-brand) 75%,transparent)}
.dsh-cau_pill svg{display:block;width:auto;height:18px;flex:none}
.dsh-cau_pillName{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pillName svg{display:block;width:auto;height:16px}
.dsh-cau_pillCount{flex:none;padding:0 7px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cauLogo{flex:none;display:flex;align-items:center;font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:.02em;color:currentColor}
.dsh-cau_songtiName{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden;font-family:SimSun,'Songti SC','STSong',serif;font-weight:600;letter-spacing:.02em;color:inherit}
.dsh-cau_pill .dsh-cau_cauLogo{font-size:15px}
.dsh-cau_pill .dsh-cau_songtiName{font-size:13px;white-space:nowrap}
.dsh-cau_tags{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
/* 键盘焦点环 + 交互过渡（对所有 dsh-cau_* 元素生效；输入框已有 focus 边框不再加轮廓） */
[class*='dsh-cau_']:not(input):not(select):not(textarea):focus-visible{outline:2px solid var(--cau-brand-a55);outline-offset:1px}
[class*='dsh-cau_']{transition:background-color .12s ease,border-color .12s ease,color .12s ease,opacity .12s ease,box-shadow .12s ease}
${PANEL_CSS}
${SETTINGS_CSS}
${CTXBAR_CSS}
${TOOLVIEW_CSS}
`

/** 当前会话 id 的订阅（getCtx 惰性读取；官方右侧栏只在会话界面存在 → 用它给入口置灰） */
const subSessions = (cb: () => void) => {
  try {
    const list = getCtx()?.sessions?.list
    return list?.subscribe ? list.subscribe(cb) : () => {}
  } catch {
    return () => {}
  }
}
const snapCurrentSession = (): string | null => {
  try {
    return getCtx()?.sessions?.list?.getSnapshot()?.current ?? null
  } catch {
    return null
  }
}

/** 官方右侧栏里的「农大门户」tab 正文（面板本体在此注入；组件定义只做一次） */
const CauTabBody = createCauTabBody({ Panel: CauPanel })

function CauButton(props: any) {
  const wide = !!props?.wide
  const rowRef = useRef<HTMLDivElement>(null)
  // 官方右侧栏模式：开合 / 未读来自共享 store（面板正文在另一棵组件树里，props 传不过去）
  const tabOpen = useSyncExternalStore(subscribeState, getTabOpen)
  const count = useSyncExternalStore(subscribeState, getUnread)
  // 官方右侧栏**只在会话界面存在** → 没有会话时入口置灰并说明
  const sessionId = useSyncExternalStore(subSessions, snapCurrentSession)
  const sessionsReady = !!getCtx()?.sessions?.list?.getSnapshot
  const noSession = USE_OFFICIAL_SIDEBAR && sessionsReady && !sessionId
  const [open, setOpen] = useState(false) // 仅浮层（回退）模式使用

  // 页面加载即取未读计数（令牌缺失/云端无 summary 时静默为 0）
  useEffect(() => {
    let alive = true
    fetchUnreadCount()
      .then((n) => {
        if (alive) setUnread(n)
      })
      .catch(() => {
        /* 静默 */
      })
    return () => {
      alive = false
    }
  }, [])

  // 浮层兜底：官方右侧栏不可用（或整包缺席）时，抽屉仍然能开 —— 按钮不该是死的
  useEffect(() => {
    document.body.classList.toggle('dsh-cau-drawer-open', open)
    return () => {
      document.body.classList.remove('dsh-cau-drawer-open')
    }
  }, [open])

  // 浮层模式：toolview 卡片「在面板中打开」→ 展开抽屉（面板挂载后自行跳文章）
  useEffect(() => {
    if (USE_OFFICIAL_SIDEBAR) return
    return subscribeBus(() => {
      if (getOpenRequest()) setOpen(true)
    })
  }, [])

  /**
   * 入口语义：官方栏里没开 → 打开/聚焦；开着 → 折叠栏（保持迁入前的「开关」手感）；
   * 官方栏读不到 → 回退成老的抽屉开关。
   */
  const onClick = () => {
    if (USE_OFFICIAL_SIDEBAR && toggleCau()) return
    setOpen((o) => !o)
  }

  const expanded = USE_OFFICIAL_SIDEBAR ? tabOpen || open : open
  const title = noSession
    ? '先进入一个会话'
    : wide
      ? undefined
      : count > 0
        ? `农大门户 · ${count} 条未读`
        : '农大门户'

  return (
    <>
      <div className="dsh-cau_pillRow" ref={rowRef}>
        <button
          type="button"
          className="dsh-cau_pill"
          aria-label="农大门户"
          aria-expanded={expanded}
          aria-disabled={noSession || undefined}
          disabled={noSession}
          onClick={onClick}
          title={title}
        >
          <span className="dsh-cau_cauLogo">CAU</span>
          {wide && <span className="dsh-cau_pillName dsh-cau_songtiName">中国农业大学</span>}
          {wide && count > 0 && <span className="dsh-cau_pillCount">{count}</span>}
        </button>
      </div>
      {open && (
        <CauPanel
          outsideIgnore={rowRef.current}
          onClose={() => setOpen(false)}
          onUnreadChange={setUnread}
        />
      )}
    </>
  )
}

export const inject = ['slots', 'sessions', 'modelDirectories']

export function apply(ctx: any) {
  // 全局错误浮层：插件/面板出错时在屏幕左下角显示红字（原生 DOM，React 崩了也留着）
  ctx.effect(() => {
    const onErr = (e: any) => {
      const m = String(e?.message || e?.error?.message || e?.reason?.message || e?.reason || e || '')
      if (!m) return
      let el = document.getElementById('dsh-cau-errbar')
      if (!el) {
        el = document.createElement('div')
        el.id = 'dsh-cau-errbar'
        el.setAttribute(
          'style',
          'position:fixed;left:8px;bottom:40px;z-index:99999;max-width:72vw;padding:8px 12px;border-radius:8px;background:rgba(160,30,30,.94);color:#fff;font:11px/16px sans-serif;white-space:pre-wrap;box-shadow:0 2px 10px rgba(0,0,0,.3)',
        )
        document.body.appendChild(el)
      }
      el.textContent = 'cau-portal 错误: ' + m
    }
    window.addEventListener('error', onErr)
    window.addEventListener('unhandledrejection', onErr)
    return () => {
      window.removeEventListener('error', onErr)
      window.removeEventListener('unhandledrejection', onErr)
    }
  }, 'cau-portal: error overlay')

  ctx.effect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-dsh-plugin', 'cau-portal')
    style.textContent = CSS
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, 'cau-portal: styles')

  ctx.slots.inject(
    'sidebar.footer.action',
    () =>
      ctx.slots.register(
        {
          name: 'sidebar.footer.action',
          id: 'cau-portal',
          order: 100,
        },
        CauButton,
      ),
    'cau-portal: sidebar button',
  )

  // 官方右侧栏（2026-09-20 迁入）：注册 tab 类型 + 正文；官方右侧栏缺席时静默跳过
  registerCauTab(ctx, CauTabBody)

  // 跟随会话：面板开着时切会话，在新会话里再开一次（官方 tab 是会话作用域的，不跟随就会「消失」）
  ctx.effect(() => followSessions(ctx), 'cau-portal: follow sessions')

  // 设置页做成面板内的「设置」页签（用户定案：不进全局 Settings）。
  // 这里只绑定 ctx 供面板树/设置页使用；设置页签名见 panel.tsx（settings 视图）。
  bindCtx(ctx)

  // 阶段6：阅读上下文附加条（conversation.input.dock，会话级）
  ctx.slots.inject(
    'conversation.input.dock',
    () => ctx.slots.register({ name: 'conversation.input.dock', id: 'cau-context', order: 50 }, CtxBar),
    'cau-portal: context bar',
  )

  // 阶段6：工具结果新闻卡片（tool.call.toolview，按 mcp__cau__* 键控）
  registerToolViews(ctx)

  // 阶段5.5：系统通知轮询（高重要/命中关注规则 → 浏览器通知；面板开不开都生效，需页面开着 + 用户授权）
  ctx.effect(() => {
    if (typeof Notification === 'undefined') return
    const runNotify = async () => {
      try {
        const s = loadSettings()
        if (!s.notifyOn || Notification.permission !== 'granted') return
        const summary = await readCloudJson('data/summary.json').catch(() => null)
        if (!summary?.important) return
        const rules = loadRules()
        const seen = loadNotifySeen()
        const alerts = computeNewAlerts(summary, rules, seen)
        if (!alerts.length) return
        for (const a of alerts) {
          seen.add(a.id)
          try {
            new Notification(`农大门户 · ${a.rule_hit ? '关注命中' : '高重要'}：${String(a.title || '').slice(0, 42)}`, {
              body: [a.column, a.source, a.time ? String(a.time).slice(0, 10) : '', a.summary ? String(a.summary).slice(0, 90) : '']
                .filter(Boolean)
                .join(' · '),
              tag: 'cau-portal-' + a.id,
            })
          } catch { /* 单个通知失败忽略 */ }
        }
        saveNotifySeen(seen)
      } catch { /* 静默（无令牌/网络波动时跳过本轮） */ }
    }
    void runNotify()
    const t = window.setInterval(() => void runNotify(), 10 * 60 * 1000)
    return () => window.clearInterval(t)
  }, 'cau-portal: notify watcher')
}
