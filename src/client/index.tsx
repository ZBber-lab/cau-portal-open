/**
 * cau-portal 客户端（阶段4 第3步：数据层接入）。
 * 侧边栏底部「农大门户」按钮；点击做云端连通检查：
 * 读 GitHub 云端 data/index.json，未配置令牌则弹窗补种（阶段5 设置页接管）。
 * 按钮规格（定稿）：42px 行高 / 36px 圆钮，宽栏显示名称，收起态悬停 Tooltip；
 * 配色全用 DSH --dsw-* 语义 token（带回退值），校徽 currentColor 跟随主题。
 * 后续步骤在本文件上扩展：弹层面板（第4步）、未读计数（第4步）、上下文附加条（第6步）。
 */
import { loadSettings, saveSettings, readCloudJson } from './data'

// 校徽 SVG（currentColor 版）由 build.mjs 以文本内联（占位符替换）
const emblemSvg = '__CAU_EMBLEM_SVG__'

const CSS = `
.dsh-cau_btnRow{display:flex;align-items:center;justify-content:center;box-sizing:border-box;height:42px;padding:0 8px;min-width:0}
.dsh-cau_btn{position:relative;flex:none;display:flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);cursor:pointer}
.dsh-cau_btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_btn svg{display:block;width:auto;height:22px}
.dsh-cau_label{flex:1;min-width:0;margin-left:9px;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#e6e8eb);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left}
`

async function checkCloud() {
  const settings = loadSettings()
  if (!settings.githubToken) {
    const input = window.prompt(
      '农大门户需要 GitHub 只读令牌才能读取云端数据。\n请粘贴 cau-portal-read 令牌（github_pat_ 开头）：',
    )
    if (!input) return
    const token = input.trim()
    if (!token.startsWith('github_pat_')) {
      window.alert('令牌格式不对（应以 github_pat_ 开头），未保存。')
      return
    }
    saveSettings({ githubToken: token })
    settings.githubToken = token
  }
  try {
    const index = await readCloudJson('data/index.json')
    if (!index) {
      window.alert('云端读取失败：index.json 无法解析。')
      return
    }
    const st = index.stats ?? {}
    window.alert(
      `农大门户 · 云端已连通 ✓\n` +
        `数据更新：${index.last_updated ?? '未知'}\n` +
        `条目总数：${st.total_items ?? '?'} · 已存正文：${st.articles_stored ?? '?'}\n` +
        `AI 摘要：${st.articles_with_ai ?? '?'} 篇 · 待办截止：${st.upcoming_deadlines ?? '?'} 项`,
    )
  } catch (error: any) {
    window.alert(`云端读取失败：${String(error?.message ?? error)}\n（令牌存于本机 localStorage，可稍后重试）`)
  }
}

function CauButton(props: any) {
  const wide = !!props?.wide
  return (
    <div className="dsh-cau_btnRow" title={wide ? undefined : '农大门户'}>
      <button type="button" className="dsh-cau_btn" aria-label="农大门户" onClick={() => void checkCloud()}>
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
