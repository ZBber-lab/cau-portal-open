/**
 * 官方右侧栏里的「农大门户」tab 正文（阶段A）。
 *
 * 框架以 prop 注入 `useTabInfo()`（返回 `{ sidebar:{expanded,fullscreen}, panel:{id},
 * tab:{ visible, navigation, signal, actions } }`），所以本文件不 import 官方右侧栏包。
 * 职责只有四件：
 *   1. 出现在栏里 ⇒ 记「用户希望它开着」（跟随会话切换的依据）
 *   2. `tab.signal` 中止 ⇒ 用户真的把 tab 关掉了 ⇒ 停止跟随
 *   3. 导航参数（工具卡片「在面板中打开」）⇒ 交给面板跳转，`revision` 变化即重新跳
 *   4. Esc ⇒ 关闭本 tab（与迁入前「Esc 关面板」一致）
 * 面板本体仍是 panel.tsx 的 CauPanel，内容一行不改，只把外壳切成 pane 模式。
 */
import { useEffect, useState } from 'react'
import { setUnread, setWantOpen } from './state'
import { markTabMounted } from './official'

/**
 * 面板本体由 index.tsx 注入（**不要在这里 import panel.tsx**）：
 * build.mjs 的内联器不做模块去重，多一处 import 就会把整棵面板子树
 * （panel-home / panel-column / settings / data 等）再复制一份，bundle 直接翻倍
 * （实测 1.26MB → 1.98MB）。
 */
export type CauTabDeps = { Panel: any }

/** 生成 tab 正文组件（面板组件由 index.tsx 注入，组件定义只做一次，保持身份稳定） */
export function createCauTabBody(deps: CauTabDeps) {
  return function CauTabBody(props: any) {
    const useTabInfo = props?.useTabInfo || props?.hooks?.tabInfo
    const info = typeof useTabInfo === 'function' ? useTabInfo() : null
    const tab = info?.tab
    const actions = tab?.actions
    const nav = tab?.navigation
    const signal: AbortSignal | undefined = tab?.signal
    const visible: boolean = tab?.visible !== false

    const [openReq, setOpenReq] = useState<{ seq: number; id: string } | null>(null)
    const articleId = nav?.params?.articleId ? String(nav.params.articleId) : ''
    const revision = Number(nav?.revision || 0)

    // 1. 挂载即「用户希望它开着」（含跟随会话切过来的情形）
    useEffect(() => markTabMounted(), [])
    useEffect(() => {
      setWantOpen(true)
    }, [])

    // 2. tab 记录被删除（或插件卸载）时 signal 中止 —— 这才是「用户关掉了面板」
    useEffect(() => {
      if (!signal) return
      const onAbort = () => setWantOpen(false)
      if (signal.aborted) onAbort()
      signal.addEventListener('abort', onAbort)
      return () => signal.removeEventListener('abort', onAbort)
    }, [signal])

    // 3. 导航参数：工具卡片「在面板中打开」→ 面板跳到该文章（revision 变化 = 又导航了一次）
    useEffect(() => {
      if (!articleId) return
      setOpenReq({ seq: revision, id: articleId })
    }, [articleId, revision])

    // 4. Esc 关闭本 tab
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return
        try {
          actions?.close?.()
        } catch {
          /* noop */
        }
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }, [actions])

    const close = () => {
      try {
        actions?.close?.()
      } catch {
        /* noop */
      }
    }

    // 正文在非活跃 tab / 栏收起时也会被渲染（visible=false）：此时不抢焦点、不播动画
    const Panel = deps.Panel
    return <Panel mode="pane" active={visible} onClose={close} onUnreadChange={setUnread} openReq={openReq} />
  }
}
