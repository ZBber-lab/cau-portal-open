/**
 * 跨组件树共享插件 ctx（面板树 ↔ 设置页 都要用会话服务与模型目录）。
 *
 * 注意：build.mjs 的内联器**不做模块去重**——同一个模块被两处 require 会内联成
 * 两份独立 IIFE，各自持有自己的模块级状态。因此这里不能用模块级变量存单例，
 * 必须挂到 window 上（全局、跨所有内联副本共享），否则 bindCtx/getCtx 会读错对象。
 */
export function bindCtx(c: any) {
  ;(window as any).__CAU_CTX__ = c
}

export function getCtx() {
  return (window as any).__CAU_CTX__
}
