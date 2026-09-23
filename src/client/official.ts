/**
 * 官方右侧栏适配层。
 *
 * 我们是一个 **page 类型 tab**：不带地址 glob，按 kind 打开（`openTab('cau-portal')`）。
 * 接线走官方公开的两段式注册（与随包的 ui-sidebar-files / -documentpreview 同一条路）：
 *   ① `ctx.sidebarRightTabs.register({ id, kind, priority, title, guide })`
 *   ② `ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name, key: id }, Body))`
 * 正文那边由框架**以 prop 注入** `useTabInfo()`，所以运行时不 import 那个包。
 *
 * 两条刻意为之的约定：
 *   - **不把 `sidebarRightTabs` 写进客户端 `inject`**：插件声明注入而服务缺席会让插件永久
 *     pending（`'skills'` 那次事故），这里一律用 `ctx.get()` 读 + 缺席降级。
 *   - **面板只存在于官方右侧栏**（2026-09-20 收尾）：自绘抽屉与 `USE_OFFICIAL_SIDEBAR`
 *     回退开关已删除，不再保留双形态代码；官方右侧栏要求 DSH ≥ 0.1.5-rc.2。
 */
import * as React from 'react'
import { getCtx } from './ctx'
import { setTabOpen } from './state'

export const CAU_TAB_KIND = 'cau-portal'
export const CAU_TAB_ID = 'cau-portal'

/**
 * 官方右侧栏「引导胶囊」前面的 **CAU 字标**（2026-09-23 用户要求）。
 *
 * 为什么之前是个方盒子：tab 类型注册里的 `guide[].icon` 是可选的，**不传时框架会画它自带的
 * 立方体占位**（`dsh-client-ui-sidebar-right` 的 `CubeGlyph`）。这里补上本仓同款的中性 CAU 徽标
 * ——粗体无衬线「CAU」+ `currentColor`（与 `.dsh-cau_cauLogo` 的 font-family/weight 一致），
 * 颜色跟随胶囊容器自带的 `--dsw-alias-label-secondary`。
 *
 * 两个刻意为之的写法：
 *   - **用 `<text>` 而不是手绘路径**：它是**字标**而不是线性图标，C/A/U 三个字母在 26px 里手描必然走形；
 *   - **用 `React.createElement` 而不是 JSX、也不放进 `icons.tsx`**：本文件是 `.ts`（无 JSX），
 *     而 build.mjs 的内联器**不做模块去重** —— 一旦为了三个字母 import `icons.tsx`，
 *     那 8KB 图标集会被多内联一份（实测 bundle 1.30MB → 1.36MB）。react 本身是宿主提供的外部模块，
 *     走 createElement 零成本。
 */
export function CauWordmarkGlyph(props: { size?: number; className?: string }) {
  const s = props.size || 26
  return React.createElement(
    'svg',
    { className: props.className, width: s, height: s, viewBox: '0 0 24 24', 'aria-hidden': 'true' },
    React.createElement(
      'text',
      {
        x: 12,
        y: 12,
        textAnchor: 'middle',
        dominantBaseline: 'central',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontWeight: '800',
        fontSize: '9.5',
        letterSpacing: '0.2',
        fill: 'currentColor',
      },
      'CAU',
    ),
  )
}

/**
 * 右侧栏导航控制器（没有官方右侧栏时为 undefined）。
 *
 * ⚠️ 必须走 `ctx.get()` 读：`ctx.sidebarRight` 这种直读在**没有声明 inject** 时会抛
 * 「without inject」错误（与 `skills` 同一个坑，2026-09-20 在真机上踩到 ——
 * 表现为「引导页里的入口能打开，左下角按钮点了没反应」）。`ctx.get` 是无需 inject 的读法。
 */
export function sidebarRight(): any {
  let c: any
  try {
    c = getCtx()
  } catch {
    return undefined
  }
  if (!c) return undefined
  try {
    const viaGet = c.get?.('sidebarRight')
    if (viaGet) return viaGet
  } catch {
    /* 继续尝试直读 */
  }
  try {
    return c.sidebarRight || undefined
  } catch {
    return undefined
  }
}

/** tab 类型注册表（没有官方右侧栏时为 undefined）；读法与 sidebarRight 相同 */
export function sidebarRightTabs(ctx?: any): any {
  let c: any = ctx
  if (!c) {
    try {
      c = getCtx()
    } catch {
      return undefined
    }
  }
  if (!c) return undefined
  try {
    const viaGet = c.get?.('sidebarRightTabs')
    if (viaGet) return viaGet
  } catch {
    /* 继续尝试直读 */
  }
  try {
    return c.sidebarRightTabs || undefined
  } catch {
    return undefined
  }
}

/** 我们的 tab 当前是否正在显示（栏展开 + 活跃 tab 是我们） */
export function cauTabShowing(): boolean {
  try {
    const right = sidebarRight()
    const active = right?.active?.()
    return !!active && active.kind === CAU_TAB_KIND && !!right?.isExpanded?.()
  } catch {
    return false
  }
}

/**
 * 打开（或聚焦）农大门户 tab。
 *
 * 没有挂载的 seat（无会话 / 非会话界面）时控制器会「响亮失败」——这里吞掉并下一帧重试一次。
 * 返回是否调用成功，便于调用方决定是否提示。
 */
export function openCauTab(params?: Record<string, any>, retry = 1): boolean {
  const right = sidebarRight()
  if (!right || typeof right.openTab !== 'function') return false
  try {
    right.openTab(CAU_TAB_KIND, params ? { params } : undefined)
    return true
  } catch {
    if (retry > 0) {
      try {
        window.setTimeout(() => openCauTab(params, retry - 1), 80)
      } catch {
        /* noop */
      }
    }
    return false
  }
}

let warnedMissing = false

/**
 * 入口按钮语义：官方栏里没开 → 打开/聚焦；开着 → 折叠栏（保持「开关」手感）。
 * 官方右侧栏不可用时只提醒一次（面板没有别的出口了，用户需要知道为什么点不动）。
 */
export function toggleCau(): void {
  const right = sidebarRight()
  if (!right) {
    if (!warnedMissing) {
      warnedMissing = true
      console.warn('[cau-portal] 没有可用的官方右侧栏（需要 DSH ≥ 0.1.5-rc.2）')
    }
    return
  }
  if (cauTabShowing()) {
    try {
      right.toggleExpanded()
    } catch {
      /* noop */
    }
    return
  }
  openCauTab()
}

/** 工具卡片「在面板中打开」：走官方导航参数（tab 已开着则聚焦并重新导航） */
export function openArticleInPortal(id: string): boolean {
  return openCauTab({ articleId: id })
}

/** 把 tab 类型与正文注册进官方右侧栏（官方右侧栏缺席时静默跳过） */
export function registerCauTab(ctx: any, Body: any): void {
  const tabs = sidebarRightTabs(ctx)
  if (tabs && typeof tabs.register === 'function') {
    ctx.effect(
      () =>
        tabs.register({
          id: CAU_TAB_ID,
          kind: CAU_TAB_KIND,
          priority: 'extension',
          title: () => '农大门户',
          guide: [
            {
              order: 40,
              title: () => '农大门户',
              description: () => '校内通知公告聚合与 AI 摘要',
              // 引导胶囊前面的图标：不给的话框架画它自带的立方体占位（用户 2026-09-23 要求换成 CAU 字标）
              icon: CauWordmarkGlyph,
            },
          ],
        }),
      'cau-portal: sidebar tab type',
    )
  }

  ctx.slots.inject(
    'sidebar.right.pane.tab',
    () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: CAU_TAB_ID }, Body),
    'cau-portal: sidebar tab body',
  )
}

/** 正文挂载/卸载时同步 tabOpen（入口按钮的选中态） */
export function markTabMounted(): () => void {
  setTabOpen(true)
  return () => setTabOpen(false)
}
