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

// 校徽 SVG（currentColor 版）由 build.mjs 以文本内联（占位符替换）
const emblemSvg = '__CAU_EMBLEM_SVG__'

const CSS = `
.dsh-cau_btnRow{display:flex;align-items:center;justify-content:center;box-sizing:border-box;height:42px;padding:0 8px;min-width:0}
.dsh-cau_btn{position:relative;flex:none;display:flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);cursor:pointer}
.dsh-cau_btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_btn svg{display:block;width:auto;height:22px}
.dsh-cau_label{flex:1;min-width:0;margin-left:9px;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#e6e8eb);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left}
.dsh-cau_count{flex:none;margin-left:6px;padding:0 6px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
${PANEL_CSS}
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

  // 抽屉开合 → body 类（驱动聊天栏让位重构）
  useEffect(() => {
    document.body.classList.toggle('dsh-cau-drawer-open', open)
    return () => {
      document.body.classList.remove('dsh-cau-drawer-open')
    }
  }, [open])

  return (
    <>
      <div
        className="dsh-cau_btnRow"
        ref={rowRef}
        title={wide ? undefined : count > 0 ? `农大门户 · ${count} 条未读` : '农大门户'}
      >
        <button
          type="button"
          className="dsh-cau_btn"
          aria-label="农大门户"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span dangerouslySetInnerHTML={{ __html: emblemSvg }} />
        </button>
        {wide && <span className="dsh-cau_label">农大门户</span>}
        {wide && count > 0 && <span className="dsh-cau_count">{count}</span>}
      </div>
      {open && (
        <CauPanel
          outsideIgnore={rowRef.current}
          emblem={emblemSvg}
          onClose={() => setOpen(false)}
          onUnreadChange={setCount}
        />
      )}
    </>
  )
}

export const inject = ['slots']

export function apply(ctx: any) {
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
}
