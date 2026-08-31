/**
 * cau-portal 客户端（阶段4 第4步：弹层面板）。
 * 侧边栏底部「农大门户」按钮：点击开关弹层面板（panel.tsx）；
 * 按钮规格（定稿）：42px 行高 / 36px 圆钮，宽栏显示名称，收起态悬停 Tooltip；
 * 未读计数：宽栏行尾 tertiary 计数（无红点），收起态并入 Tooltip；
 * 配色全用 DSH --dsw-* 语义 token（带回退值），校徽 currentColor 跟随主题。
 * 后续步骤在本文件扩展：上下文附加条（第6步）。
 */
import { useEffect, useRef, useState } from 'react'
import { CauPanel, PANEL_CSS, fetchUnreadCount } from './panel'
import { SETTINGS_CSS } from './settings'
import { bindCtx } from './ctx'
import { CtxBar, CTXBAR_CSS } from './ctxbar'
import { registerToolViews, TOOLVIEW_CSS } from './toolview'
import { subscribeBus, getOpenRequest } from './bus'
import {
  loadSettings,
  loadRules,
  loadNotifySeen,
  saveNotifySeen,
  computeNewAlerts,
  readCloudJson,
} from './data'

// 校徽 SVG（currentColor 版）、校名题字 SVG（官方绿版）与题字 currentColor 版由 build.mjs 以文本内联（占位符替换）
const emblemSvg = '__CAU_EMBLEM_SVG__'
const nameSvg = '__CAU_NAME_SVG__'
const nameSvgCurrent = '__CAU_NAME_CURRENT_SVG__'

const CSS = `
.dsh-cau_pillRow{display:flex;align-items:center;box-sizing:border-box;height:42px;padding:0 6px;min-width:0}
.dsh-cau_pill{--cau-brand:#008038;flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.09));border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.045));color:var(--dsw-alias-label-primary,#e6e8eb);cursor:pointer;transition:background .15s ease,border-color .15s ease;text-align:left}
body[data-ds-dark-theme] .dsh-cau_pill{--cau-brand:#00b856}
.dsh-cau_pill:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.09));border-color:var(--dsw-alias-border-l3,rgba(255,255,255,.18));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pill[aria-expanded='true']{color:var(--cau-brand);border-color:color-mix(in srgb,var(--cau-brand) 55%,transparent);background:color-mix(in srgb,var(--cau-brand) 12%,transparent)}
.dsh-cau_pill[aria-expanded='true']:hover{color:var(--cau-brand);border-color:color-mix(in srgb,var(--cau-brand) 75%,transparent)}
.dsh-cau_pill svg{display:block;width:auto;height:18px;flex:none}
.dsh-cau_pillName{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pillName svg{display:block;width:auto;height:16px}
.dsh-cau_pillCount{flex:none;padding:0 7px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_tags{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
/* UI 批①：键盘焦点框 + 交互过渡（对所有 dsh-cau_* 元素生效；输入框已有 focus 边框不再加轮廓） */
[class*='dsh-cau_']:not(input):not(select):not(textarea):focus-visible{outline:2px solid color-mix(in srgb,var(--cau-brand,#008038) 60%,transparent);outline-offset:1px}
[class*='dsh-cau_']{transition:background-color .12s ease,border-color .12s ease,color .12s ease,opacity .12s ease}
${PANEL_CSS}
${SETTINGS_CSS}
${CTXBAR_CSS}
${TOOLVIEW_CSS}
`

function CauButton(props: any) {
  const wide = !!props?.wide
  const rowRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)

  // 页面加载即取未读计数（令牌缺失/云端无 summary 时静默为 0）
  useEffect(() => {
    let alive = true
    fetchUnreadCount()
      .then((n) => {
        if (alive) setCount(n)
      })
      .catch(() => {
        /* 静默 */
      })
    return () => {
      alive = false
    }
  }, [])

  // 面板开合 → body 类（驱动聊天区让位收缩，页面充实饱满、不盖对话）
  useEffect(() => {
    document.body.classList.toggle('dsh-cau-drawer-open', open)
    return () => {
      document.body.classList.remove('dsh-cau-drawer-open')
    }
  }, [open])

  // 阶段6：聊天区 toolview 卡片「在面板中打开」→ 展开抽屉（面板挂载后自行跳文章）
  useEffect(() => {
    return subscribeBus(() => {
      if (getOpenRequest()) setOpen(true)
    })
  }, [])

  return (
    <>
      <div className="dsh-cau_pillRow" ref={rowRef}>
        <button
          type="button"
          className="dsh-cau_pill"
          aria-label="农大门户"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          title={wide ? undefined : count > 0 ? `农大门户 · ${count} 条未读` : '农大门户'}
        >
          <span dangerouslySetInnerHTML={{ __html: emblemSvg }} />
          {wide && <span className="dsh-cau_pillName" dangerouslySetInnerHTML={{ __html: nameSvgCurrent }} />}
          {wide && count > 0 && <span className="dsh-cau_pillCount">{count}</span>}
        </button>
      </div>
      {open && (
        <CauPanel
          outsideIgnore={rowRef.current}
          emblem={emblemSvg}
          nameSvg={nameSvg}
          onClose={() => setOpen(false)}
          onUnreadChange={setCount}
        />
      )}
    </>
  )
}

export const inject = ['slots', 'sessions', 'modelDirectories']

export function apply(ctx: any) {
  // 共享校徽（供上下文条/引用 chip 复用；build 的 emblem token 只在此文件替换）
  ;(window as any).__CAU_EMBLEM__ = emblemSvg

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
            new Notification(`农大门户 · ${a.rule_hit ? '🎯 关注命中' : '高重要'}：${String(a.title || '').slice(0, 42)}`, {
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
