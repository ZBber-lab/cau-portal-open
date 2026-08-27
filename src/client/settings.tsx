/**
 * cau-portal 设置页（阶段4 第5步）：注册到 settings.section。
 * 六项：① GitHub 只读令牌 ② AI 加工/监控模型选择器（复用 DSH 模型目录，
 * 独立配置槽、与主对话模型解耦）③ 面板偏好 ④ 用量视图（近 30 天 token 分账：
 * enrich=云端 usage.jsonl / on-demand=本机日志）⑤ 按需加工说明（服务端路由）
 * ⑥ 门户密码（阶段5 占位）。
 * 模型目录按「当前会话」惰性解析（ctx.sessions.list.current）；无会话时给出提示。
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  loadSettings,
  saveSettings,
  readCloudText,
  loadUsageLog,
  summarizeUsage,
} from './data'
import { getCtx } from './ctx'

const noop = () => {}

export const SETTINGS_CSS = `
.dsh-cau_set{display:flex;flex-direction:column;gap:18px;padding:16px 0 24px;max-width:640px}
.dsh-cau_setBlock{display:flex;flex-direction:column;gap:8px}
.dsh-cau_setTitle{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_setTitle::before{content:"";flex:none;width:3px;height:12px;border-radius:2px;background:var(--cau-brand,#008038)}
.dsh-cau_setDesc{font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_setRow{display:flex;align-items:center;gap:10px}
.dsh-cau_setLabel{flex:1;min-width:0;font-size:13px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_setInput{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;outline:none}
.dsh-cau_setInput:focus{border-color:var(--cau-brand,#008038)}
.dsh-cau_setSelect{box-sizing:border-box;min-width:0;flex:1;height:32px;padding:0 8px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:var(--dsw-specific-menu,#1b1e24);color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;outline:none;cursor:pointer}
.dsh-cau_setBtn{flex:none;height:32px;padding:0 14px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;cursor:pointer}
.dsh-cau_setBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
.dsh-cau_setBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_setHint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_setOk{font-size:12px;color:var(--dsw-alias-state-success,#34c77b)}
.dsh-cau_setErr{font-size:12px;color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_usageTable{width:100%;border-collapse:collapse;font-size:12px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_usageTable th,.dsh-cau_usageTable td{padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.08));text-align:right;white-space:nowrap}
.dsh-cau_usageTable th:first-child,.dsh-cau_usageTable td:first-child{text-align:left}
.dsh-cau_usageTable th{color:var(--dsw-alias-label-tertiary,#8b95a5);font-weight:500}
.dsh-cau_setCheck{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#9aa4b2);cursor:pointer}
.dsh-cau_setCheck input{accent-color:var(--cau-brand,#008038)}
.dsh-cau_infoCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.03))}
.dsh-cau_setBanner{display:flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid var(--dsw-alias-state-warn,rgba(255,180,0,.5));border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 10%,transparent);font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_setBannerDot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-warn,#ffb400)}
.dsh-cau_setWarn{font-size:12px;line-height:17px;color:var(--dsw-alias-state-warn,#ffb400)}
`

const ROLE_LABEL: Record<string, string> = {
  enrich: '爬虫管道加工',
  'on-demand': '面板按需加工',
  monitor: '监控',
  other: '其他',
}

function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + 'w'
  return String(n)
}

export function CauSettings(props: any) {
  // 服务经共享 ctx 取（面板树内渲染时也拿得到）；关掉 props 传递，统一 getCtx()
  const _ctx = getCtx() || {}
  const sessions = props.sessions ?? _ctx.sessions
  const modelDirectories = props.modelDirectories ?? _ctx.modelDirectories
  const [settings, setSettings] = useState(() => loadSettings())
  const [savedFlash, setSavedFlash] = useState(false)

  // ---- ① 令牌 ----
  const [token, setToken] = useState(() => settings.githubToken || '')

  // ---- ② 模型选择器：当前会话 → 目录 ----
  const subList = (cb: () => void) => {
    try {
      return sessions?.list ? sessions.list.subscribe(cb) : noop
    } catch {
      return noop
    }
  }
  const snapList = () => {
    try {
      return sessions?.list?.getSnapshot()
    } catch {
      return undefined
    }
  }
  const listSnap = useSyncExternalStore(subList, snapList)
  const sessionId: string | undefined = listSnap?.current
  // 模型目录：默认不自动加载（本环境 RPC 可能慢/不返回），改为按钮触发 + 超时回落
  const [groups, setGroups] = useState<any[]>([])
  const [modelState, setModelState] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle')
  const [modelNote, setModelNote] = useState('')

  const loadModelDir = async () => {
    setModelState('loading')
    setModelNote('')
    if (!sessionId || !modelDirectories) {
      setModelState('fail')
      setModelNote('当前没有打开的会话，或模型目录服务不可用')
      return
    }
    let d: any = null
    try {
      d = modelDirectories.directoryFor(sessionId)
    } catch {
      setModelState('fail')
      setModelNote('当前会话无法解析模型目录')
      return
    }
    let settled = false
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      setModelState('fail')
      setModelNote('模型目录未响应（将使用服务端默认模型）')
    }, 6000)
    try {
      await d.load()
      settled = true
      window.clearTimeout(timer)
      setGroups(d.store?.getSnapshot()?.groups || [])
      setModelState('ok')
    } catch {
      settled = true
      window.clearTimeout(timer)
      setModelState('fail')
      setModelNote('模型目录加载失败（将使用服务端默认模型）')
    }
  }

  const monitor = settings.monitorModel || null
  const selGroup = groups.find((g) => g.id === monitor?.provider) || groups[0] || null
  const selModel = selGroup?.models?.find((m: any) => m.id === monitor?.model) || null

  const pickModel = (provider: string, model: string) => {
    const next = { ...settings, monitorModel: { provider, model } }
    setSettings(next)
    saveSettings(next)
  }

  // ---- ④ 用量 ----
  const [usage, setUsage] = useState<Record<string, { calls: number; prompt: number; completion: number; cached: number; cost: number }> | null>(null)
  const [usageErr, setUsageErr] = useState('')

  const loadUsage = async () => {
    setUsageErr('')
    const rows: any[] = []
    try {
      const text = await readCloudText('data/usage.jsonl')
      for (const line of String(text).split('\n')) {
        if (!line.trim()) continue
        try {
          const o = JSON.parse(line)
          rows.push({ ...o, role: 'enrich' })
        } catch {
          /* 跳过坏行 */
        }
      }
    } catch {
      /* 云端 usage.jsonl 可能暂不存在 */
    }
    for (const r of loadUsageLog()) rows.push(r)
    setUsage(summarizeUsage(rows, 30))
  }
  useEffect(() => {
    void loadUsage()
  }, [])

  const totalCost = useMemo(() => {
    let c = 0
    for (const v of Object.values(usage || {})) c += v.cost
    return c
  }, [usage])

  const missing: string[] = []
  if (!settings.githubToken) missing.push('GitHub 只读令牌')
  if (!settings.monitorModel) missing.push('AI 加工/监控模型（可选，缺省用服务端默认）')

  return (
    <div className="dsh-cau_set">
      {missing.length > 0 && (
        <div className="dsh-cau_setBanner">
          <span className="dsh-cau_setBannerDot" />
          <span>有 {missing.length} 项未配置：{missing.join('、')}</span>
        </div>
      )}

      {/* ① 令牌 */}
      <div className="dsh-cau_setBlock">
        <div className="dsh-cau_setTitle">GitHub 只读令牌</div>
        <div className="dsh-cau_setDesc">
          用于读取私有仓库 `zhouxuanting52-lab/cau-portal` 的云端数据（面板与 MCP 共用数据源）。建议细粒度 PAT：仅限该仓库、Contents: Read、90 天。仅存本机浏览器，不上传。
        </div>
        <div className="dsh-cau_setRow">
          <input
            className="dsh-cau_setInput"
            type="password"
            placeholder="github_pat_…"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            spellCheck={false}
          />
          <button
            type="button"
            className="dsh-cau_setBtn"
            disabled={!token || token === settings.githubToken}
            onClick={() => {
              const next = { ...settings, githubToken: token }
              setSettings(next)
              saveSettings(next)
              setSavedFlash(true)
              window.setTimeout(() => setSavedFlash(false), 2000)
            }}
          >
            保存
          </button>
        </div>
        {savedFlash && <span className="dsh-cau_setOk">已保存 ✓</span>}
        {!settings.githubToken && (
          <span className="dsh-cau_setWarn">
            ⚠ 尚未配置令牌：面板将无法读取云端数据（点击上方可直接进入配置）。
          </span>
        )}
      </div>

      {/* ② 模型 */}
      <div className="dsh-cau_setBlock">
        <div className="dsh-cau_setTitle">AI 加工 / 监控模型</div>
        <div className="dsh-cau_setDesc">
          独立配置槽：用于面板按需加工（AI 摘要/分类/重要度/deadline）与后续监控，与主对话模型互不影响。换模型只影响之后的加工，数据无需重爬。
        </div>
        {!sessionId || !modelDirectories ? (
          <div className="dsh-cau_setHint">
            {!modelDirectories ? '模型目录服务不可用（按需加工将使用服务端默认模型）。' : '当前没有打开的会话——打开一个会话后即可从 DSH 模型目录中选择。'}
          </div>
        ) : modelState === 'loading' ? (
          <div className="dsh-cau_setRow">
            <span className="dsh-cau_setHint">模型目录加载中…</span>
            <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>
              刷新
            </button>
          </div>
        ) : modelState === 'fail' ? (
          <div className="dsh-cau_setRow">
            <span className="dsh-cau_setErr">{modelNote}</span>
            <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>
              重试
            </button>
          </div>
        ) : modelState === 'ok' && groups.length === 0 ? (
          <div className="dsh-cau_setRow">
            <span className="dsh-cau_setHint">模型目录为空（检查 provider 配置后重试）。</span>
            <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>
              刷新
            </button>
          </div>
        ) : modelState === 'ok' ? (
          <>
            <div className="dsh-cau_setRow">
              <select
                className="dsh-cau_setSelect"
                value={selGroup?.id || ''}
                onChange={(e) => {
                  const g = groups.find((x) => x.id === e.target.value)
                  if (g?.models?.length) pickModel(g.id, g.models[0].id)
                }}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {selGroup?.models?.length ? (
                <select
                  className="dsh-cau_setSelect"
                  value={selModel?.id || selGroup.models[0].id}
                  onChange={(e) => pickModel(selGroup.id, e.target.value)}
                >
                  {selGroup.models.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <div className="dsh-cau_setHint">
              当前：{monitor ? `${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'}
            </div>
          </>
        ) : (
          <div className="dsh-cau_setRow">
            <span className="dsh-cau_setHint">
              {monitor ? `当前：${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'}
            </span>
            <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>
              加载模型目录
            </button>
          </div>
        )}
      </div>

      {/* ③ 面板偏好 */}
      <div className="dsh-cau_setBlock">
        <div className="dsh-cau_setTitle">阅读上下文引用</div>
        <div className="dsh-cau_infoCard">
          <span className="dsh-cau_setDesc">
            在文章阅读页点「<b>引用到对话</b>」，会把该文章作为上下文引用到聊天输入框上方（直观 chip），并在提问草稿里注入标记行；发送后引用自动解除，不影响下一次提问。点击引用条的 × 可随时手动移除。
          </span>
        </div>
      </div>

      {/* ④ 用量 */}
      <div className="dsh-cau_setBlock">
        <div className="dsh-cau_setTitle">用量（近 30 天 · token 为主）</div>
        <div className="dsh-cau_setDesc">按角色分账：爬虫管道加工（云端 usage.jsonl）、面板按需加工（本机日志）。金额仅对 DeepSeek 附带显示。</div>
        {usageErr ? (
          <div className="dsh-cau_setErr">{usageErr}</div>
        ) : !usage ? (
          <div className="dsh-cau_setHint">加载中…</div>
        ) : Object.keys(usage).length === 0 ? (
          <div className="dsh-cau_setHint">暂无用量记录。</div>
        ) : (
          <>
            <table className="dsh-cau_usageTable">
              <thead>
                <tr>
                  <th>角色</th>
                  <th>次数</th>
                  <th>输入</th>
                  <th>输出</th>
                  <th>缓存读</th>
                  <th>金额(元)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(usage).map(([role, v]) => (
                  <tr key={role}>
                    <td>{ROLE_LABEL[role] || role}</td>
                    <td>{v.calls}</td>
                    <td>{fmtNum(v.prompt)}</td>
                    <td>{fmtNum(v.completion)}</td>
                    <td>{fmtNum(v.cached)}</td>
                    <td>{v.cost ? v.cost.toFixed(4) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalCost > 0 && <div className="dsh-cau_setHint">合计金额：¥{totalCost.toFixed(4)}（仅统计有计价的调用）</div>}
            <div className="dsh-cau_setRow">
              <button type="button" className="dsh-cau_setBtn" onClick={() => void loadUsage()}>
                刷新
              </button>
            </div>
          </>
        )}
      </div>

      {/* ⑤ 按需加工 */}
      <div className="dsh-cau_setBlock">
        <div className="dsh-cau_setTitle">按需补摘要</div>
        <div className="dsh-cau_infoCard">
          <span className="dsh-cau_setDesc">
            文章页对未加工的文章提供「AI 补摘要」：调用插件服务端路由（DSH 已配置的模型），浏览器不存任何 API key、无 CORS 问题；结果仅本次会话内显示，不回写云端。
          </span>
          <span className="dsh-cau_setHint">触发位置：文章阅读页摘要区（无 AI 摘要时出现按钮）。</span>
        </div>
      </div>

      {/* ⑥ 门户密码 */}
      <div className="dsh-cau_setBlock">
        <div className="dsh-cau_setTitle">统一门户密码（阶段5）</div>
        <div className="dsh-cau_setDesc">
          实验功能（代登录统一门户），阶段5 才开放；若开放也仅存本机、不进仓库、不进 AI 对话。
        </div>
        <input className="dsh-cau_setInput" type="password" placeholder="暂未开放" disabled />
      </div>
    </div>
  )
}
