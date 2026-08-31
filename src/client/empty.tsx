/**
 * UI 批①：统一空态（图标 + 主文案 + 可选引导行）。零逻辑纯展示组件。
 * UI 批②：icon 改为任意节点（线性 SVG 图标，<Ic n="…"/>），不再传 emoji 字符串。
 * 列表级「暂无内容」类提示统一走这里；卡片内嵌的短提示仍用 .dsh-cau_empty 文本。
 */
export function Empty(props: { icon?: any; main: string; sub?: string }) {
  const { icon, main, sub } = props
  return (
    <div className="dsh-cau_empty">
      {icon ? <span className="dsh-cau_emptyIcon">{icon}</span> : null}
      <span className="dsh-cau_emptyMain">{main}</span>
      {sub ? <span className="dsh-cau_emptySub">{sub}</span> : null}
    </div>
  )
}
