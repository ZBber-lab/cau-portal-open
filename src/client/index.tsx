/**
 * cau-portal 客户端（阶段4第1步 hello-world）：
 * 侧边栏底部「农大门户」按钮，点击弹出连通性确认。
 * 按钮规格（定稿）：42px 行高 / 36px 圆钮，宽栏显示名称，收起态悬停 Tooltip；
 * 配色全用 DSH --dsw-* 语义 token（带回退值），校徽 currentColor 跟随主题。
 * 后续步骤在本文件上扩展：弹层面板（第4步）、未读计数（第4步）、上下文附加条（第6步）。
 */
// 校徽 SVG（currentColor 版）由 build.mjs 以文本内联（占位符替换）
const emblemSvg = '__CAU_EMBLEM_SVG__'

const CSS = `
.dsh-cau_btnRow{display:flex;align-items:center;justify-content:center;box-sizing:border-box;height:42px;padding:0 8px;min-width:0}
.dsh-cau_btn{position:relative;flex:none;display:flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);cursor:pointer}
.dsh-cau_btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_btn svg{display:block;width:auto;height:22px}
.dsh-cau_label{flex:1;min-width:0;margin-left:9px;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#e6e8eb);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left}
`

function CauButton(props: any) {
  const wide = !!props?.wide
  return (
    <div className="dsh-cau_btnRow" title={wide ? undefined : '农大门户'}>
      <button
        type="button"
        className="dsh-cau_btn"
        aria-label="农大门户"
        onClick={() => {
          window.alert('农大门户 · 插件已连通 ✓\n（阶段4 第1步 hello-world）')
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: emblemSvg }} />
      </button>
      {wide && <span className="dsh-cau_label">农大门户</span>}
    </div>
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
