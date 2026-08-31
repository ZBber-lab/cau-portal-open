/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */

const ICONS: Record<string, () => any> = {
  // ---- 导航 / 头部 ----
  close: () => (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  chevLeft: () => <path d="M14.5 5.5L8 12l6.5 6.5" />,
  chevRight: () => <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  gear: () => (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
    </>
  ),
  sliders: () => (
    <>
      <path d="M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" />
      <circle cx="15" cy="6.5" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
    </>
  ),
  refresh: () => (
    <>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </>
  ),
  undo: () => (
    <>
      <path d="M8.5 5.5L4 10l4.5 4.5" />
      <path d="M4 10h10.5a5.5 5.5 0 0 1 0 11H11" />
    </>
  ),

  // ---- 分区 / 功能 ----
  sparkle: () => <path d="M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" />,
  flame: () => (
    <path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" />
  ),
  star: () => <path d="M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" />,
  starFill: () => <path fill="currentColor" stroke="none" d="M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" />,
  bookmark: () => <path d="M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" />,
  books: () => (
    <>
      <path d="M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" />
      <path d="M8.5 4h4v16h-4z" />
      <path d="M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" />
    </>
  ),
  link: () => (
    <>
      <path d="M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" />
      <path d="M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" />
    </>
  ),
  news: () => (
    <>
      <rect x="4" y="4.5" width="16" height="15" rx="1.8" />
      <path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" />
    </>
  ),
  bank: () => (
    <>
      <path d="M3.2 9L12 3.8 20.8 9" />
      <path d="M4.5 9.2h15" />
      <path d="M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" />
      <path d="M4.5 16.7h15M3.5 20.2h17" />
    </>
  ),

  // ---- 对象 / 动作 ----
  calendar: () => (
    <>
      <rect x="3.5" y="4.8" width="17" height="15.7" rx="2" />
      <path d="M3.5 9.8h17M8 3v3.6M16 3v3.6" />
    </>
  ),
  clipboard: () => (
    <>
      <rect x="5" y="4.5" width="14" height="16" rx="1.8" />
      <rect x="8.5" y="2.8" width="7" height="3.2" rx="1" />
      <path d="M8.8 11h6.4M8.8 15h4.4" />
    </>
  ),
  clock: () => (
    <>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M12 7.2V12l3.3 2" />
    </>
  ),
  target: () => (
    <>
      <circle cx="12" cy="12" r="8.3" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  archive: () => (
    <>
      <rect x="3.5" y="4" width="17" height="4.5" rx="1" />
      <path d="M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" />
      <path d="M10 12.5h4" />
    </>
  ),
  inbox: () => (
    <>
      <path d="M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M4 13h5l1.6 2.5h2.8L15 13h5" />
    </>
  ),
  doc: () => (
    <>
      <path d="M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" />
      <path d="M13 3.5V9h5.5" />
      <path d="M8.5 13h7M8.5 16.2h4.5" />
    </>
  ),
  note: () => (
    <>
      <path d="M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" />
      <path d="M8 8.5h8M8 12.5h8M8 16.5h5" />
    </>
  ),
  bell: () => (
    <>
      <path d="M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" />
      <path d="M10.2 20a2 2 0 0 0 3.6 0" />
    </>
  ),
  edit: () => (
    <>
      <path d="M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" />
      <path d="M12.6 7l4.4 4.4" />
    </>
  ),
  ext: () => (
    <>
      <path d="M13.5 4.5H19.5V10.5" />
      <path d="M19.5 4.5L11 13" />
      <path d="M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" />
    </>
  ),
  search: () => (
    <>
      <circle cx="11" cy="11" r="6.3" />
      <path d="M20.2 20.2L15.6 15.6" />
    </>
  ),
  plus: () => <path d="M12 5v14M5 12h14" />,
  check: () => <path d="M4.5 12.5l5 5L19.5 7" />,
  key: () => (
    <>
      <circle cx="7.8" cy="15.8" r="4.3" />
      <path d="M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" />
    </>
  ),
  mail: () => (
    <>
      <rect x="3.2" y="5" width="17.6" height="14" rx="1.8" />
      <path d="M4 7.2l8 5.8 8-5.8" />
    </>
  ),
  shield: () => <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" />,
  lock: () => (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.8" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  database: () => (
    <>
      <ellipse cx="12" cy="5.6" rx="7.3" ry="2.7" />
      <path d="M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" />
      <path d="M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" />
    </>
  ),
  chart: () => <path d="M18 20V9.5M12 20V4M6 20v-5.5" />,
  robot: () => (
    <>
      <rect x="5" y="8" width="14" height="10.5" rx="2" />
      <path d="M12 8V4.6" />
      <circle cx="12" cy="3.7" r="1" />
      <circle cx="9.3" cy="12.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="12.5" r=".9" fill="currentColor" stroke="none" />
      <path d="M9.5 15.8h5M3.5 11v4M20.5 11v4" />
    </>
  ),
  chat: () => <path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" />,
  idCard: () => (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" />
    </>
  ),
  bookOpen: () => (
    <>
      <path d="M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" />
      <path d="M12 6.5v13" />
    </>
  ),
  pinFill: () => (
    <path
      fill="currentColor"
      stroke="none"
      d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"
    />
  ),
}

export type IconName = keyof typeof ICONS

export function Ic(props: { n: string; size?: number; className?: string }) {
  const s = props.size || 16
  const g = ICONS[props.n]
  return (
    <svg
      className={props.className}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {g ? g() : null}
    </svg>
  )
}
