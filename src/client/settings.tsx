/**
 * cau-portal 设置页（2026-08-29 重构：分组卡片「一筐一筐」管理）：
 * 首页 = 分组卡片墙（每卡右上角启用/禁用开关 + 状态徽章）＋ 顶部提醒条（红=基本需求不满足 / 黄=注意）。
 * 子页：① AI 加工·模型配置（模型选择 + 用量柱状图 7/30/90 天 + 指标切换 + 分账表）
 *      ② 令牌管理（多令牌登记：值/过期日/剩余天数/快捷跳转 GitHub 管理页/逐枚开关）
 *      ③ 面板偏好（自动附加 + 引用协同开关） ④ 待办提醒与关注 ⑤ 数据源（连通检查） ⑥ 安全·门户与链接。
 * 全部纯客户端（localStorage），浏览器刷新生效。
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  loadSettings,
  saveSettings,
  readCloudText,
  loadModules,
  saveModules,
  loadTokens,
  saveTokens,
  loadUsageRows,
  buildDailyUsage,
  summarizeUsage,
  computeAlerts,
  type TokenRecord,
  type ModuleKey,
} from './data'
import { getCtx } from './ctx'

const noop = () => {}

export const SETTINGS_CSS = `
.dsh-cau_set{display:flex;flex-direction:column;gap:14px;padding:16px 0 24px;max-width:640px}
/* ---- 提醒条 ---- */
.dsh-cau_alert{display:flex;align-items:flex-start;gap:8px;padding:9px 12px;border-radius:8px;font-size:12px;line-height:17px}
.dsh-cau_alert.error{border:1px solid var(--dsw-alias-state-error-primary,rgba(229,72,77,.5));background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_alert.warn{border:1px solid var(--dsw-alias-state-warn,rgba(255,180,0,.5));background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 10%,transparent);color:var(--dsw-alias-state-warn,#d99c00)}
.dsh-cau_alertDot{flex:none;width:8px;height:8px;margin-top:4px;border-radius:50%;background:currentColor}
/* ---- 分组卡片 ---- */
.dsh-cau_cards{display:flex;flex-direction:column;gap:10px}
.dsh-cau_setCard{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));border-radius:12px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.03));cursor:pointer;transition:border-color .12s ease}
.dsh-cau_setCard:hover{border-color:color-mix(in srgb,var(--cau-brand,#008038) 55%,transparent)}
.dsh-cau_cardMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.dsh-cau_cardName{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_cardIcon{flex:none;font-size:15px;line-height:1}
.dsh-cau_cardDesc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cardBadge{flex:none;font-size:11px;padding:2px 7px;border-radius:999px;white-space:nowrap}
.dsh-cau_cardBadge.ok{background:color-mix(in srgb,var(--dsw-alias-state-success,#2f9e44) 14%,transparent);color:var(--dsw-alias-state-success,#2f9e44)}
.dsh-cau_cardBadge.warn{background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 14%,transparent);color:var(--dsw-alias-state-warn,#d99c00)}
.dsh-cau_cardBadge.off{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.07));color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cardBadge.err{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 14%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
/* ---- 开关 ---- */
.dsh-cau_switch{flex:none;position:relative;width:34px;height:20px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.2));border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));cursor:pointer;transition:background .15s ease,border-color .15s ease}
.dsh-cau_switch span{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#8b95a5);transition:transform .15s ease,background .15s ease}
.dsh-cau_switch.on{border-color:color-mix(in srgb,var(--cau-brand,#008038) 60%,transparent);background:color-mix(in srgb,var(--cau-brand,#008038) 22%,transparent)}
.dsh-cau_switch.on span{transform:translateX(14px);background:var(--cau-brand,#008038)}
/* ---- 子页 ---- */
.dsh-cau_setPageHead{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dsh-cau_setSubBack{flex:none;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;cursor:pointer}
.dsh-cau_setSubBack:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
.dsh-cau_setBlocks{display:flex;flex-direction:column;gap:14px}
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
.dsh-cau_setBtn.danger{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 45%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_setHint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_setOk{font-size:12px;color:var(--dsw-alias-state-success,#34c77b)}
.dsh-cau_setErr{font-size:12px;color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_setWarn{font-size:12px;line-height:17px;color:var(--dsw-alias-state-warn,#ffb400)}
.dsh-cau_setCheck{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#9aa4b2);cursor:pointer}
.dsh-cau_setCheck input{accent-color:var(--cau-brand,#008038)}
.dsh-cau_infoCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.03))}
/* ---- 用量图 ---- */
.dsh-cau_chart{display:block;width:100%;height:150px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
.dsh-cau_setChip{height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);font-size:11px;cursor:pointer}
.dsh-cau_setChip.on{background:color-mix(in srgb,var(--cau-brand,#008038) 14%,transparent);border-color:var(--cau-brand,#008038);color:var(--cau-brand,#00b856)}
.dsh-cau_usageTable{width:100%;border-collapse:collapse;font-size:12px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_usageTable th,.dsh-cau_usageTable td{padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.08));text-align:right;white-space:nowrap}
.dsh-cau_usageTable th:first-child,.dsh-cau_usageTable td:first-child{text-align:left}
.dsh-cau_usageTable th{color:var(--dsw-alias-label-tertiary,#8b95a5);font-weight:500}
/* ---- 令牌 ---- */
.dsh-cau_tokList{display:flex;flex-direction:column;gap:8px}
.dsh-cau_tok{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));border-radius:10px}
.dsh-cau_tokMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.dsh-cau_tokName{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_tokMeta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_tokActs{display:flex;gap:6px;flex:none}
.dsh-cau_tokBtn{flex:none;height:26px;padding:0 9px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);font-size:11px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.dsh-cau_tokBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_links{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.dsh-cau_link{display:inline-flex;align-items:center;padding:5px 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.16));border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:11px;text-decoration:none;cursor:pointer}
.dsh-cau_link:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
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

function daysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return Math.ceil((d.getTime() - Date.now()) / 86400e3)
}

function expiryBadge(expires: string): { cls: string; text: string } {
  const n = daysUntil(expires)
  if (n == null) return { cls: 'dsh-cau_setHint', text: '未设过期日' }
  if (n < 0) return { cls: 'dsh-cau_setErr', text: `已过期 ${-n} 天` }
  if (n <= 30) return { cls: 'dsh-cau_setWarn', text: `${n} 天后过期` }
  return { cls: 'dsh-cau_setOk', text: `${n} 天后过期` }
}

const KEY_LINKS: { key: string; label: string; url: string }[] = [
  { key: 'github-read', label: 'GitHub 令牌管理', url: 'https://github.com/settings/personal-access-tokens' },
  { key: 'repo', label: '数据仓库', url: 'https://github.com/zhouxuanting52-lab/cau-portal' },
  { key: 'actions', label: '定时抓取 Actions', url: 'https://github.com/zhouxuanting52-lab/cau-portal/actions' },
  { key: 'cron', label: 'cron-job.org', url: 'https://console.cron-job.org/jobs' },
  { key: 'ds', label: 'DeepSeek 平台', url: 'https://platform.deepseek.com' },
  { key: 'portal', label: '统一门户', url: 'https://one.cau.edu.cn' },
]

/** 自绘 SVG 柱状图（无图表库依赖） */
function BarChart({ items, unit }: { items: { label: string; value: number }[]; unit: string }) {
  const W = 460
  const H = 150
  const PAD = 8
  const BASE = 24
  const TOP = 24
  const max = Math.max(1, ...items.map((i) => i.value))
  const n = items.length
  const step = Math.max(1, Math.ceil(n / 10))
  const slot = (W - PAD * 2) / n
  const bw = Math.max(2, slot - 3)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dsh-cau_chart" role="img" aria-label="用量柱状图">
      <line x1={PAD} y1={H - BASE} x2={W - PAD} y2={H - BASE} stroke="currentColor" opacity=".25" />
      <text x={PAD} y={14} fontSize="10" fill="currentColor" opacity=".6">
        max {fmtNum(max)} {unit}
      </text>
      {items.map((it, i) => {
        const h = Math.max(1.5, (it.value / max) * (H - BASE - TOP - 10))
        const x = PAD + i * slot + (slot - bw) / 2
        const on = it.value > 0
        return (
          <g key={i}>
            <rect x={x} y={H - BASE - h} width={bw} height={h} rx={2} fill={on ? 'var(--cau-brand)' : 'currentColor'} opacity={on ? 1 : 0.12}>
              <title>{`${it.label}：${fmtNum(it.value)} ${unit}`}</title>
            </rect>
            {i % step === 0 && (
              <text x={x + bw / 2} y={H - 8} fontSize="9" fill="currentColor" opacity=".55" textAnchor="middle">
                {it.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" className={'dsh-cau_switch' + (on ? ' on' : '')} aria-pressed={on} aria-label={label} title={on ? '点击禁用' : '点击启用'} onClick={(e) => { e.stopPropagation(); onToggle() }}>
      <span />
    </button>
  )
}

export function CauSettings(props: any) {
  const _ctx = getCtx() || {}
  const sessions = props.sessions ?? _ctx.sessions
  const modelDirectories = props.modelDirectories ?? _ctx.modelDirectories

  const [page, setPage] = useState<'home' | 'ai' | 'tokens' | 'prefs' | 'cloud' | 'security'>('home')
  const [settings, setSettings] = useState(() => loadSettings())
  const [mods, setMods] = useState(() => loadModules())
  const [tokens, setTokens] = useState<TokenRecord[]>(() => loadTokens())
  const [savedFlash, setSavedFlash] = useState(false)

  const upd = (next: any) => {
    setSettings(next)
    saveSettings(next)
  }
  const toggleMod = (k: ModuleKey) => {
    const next = { ...mods, [k]: !mods[k] }
    setMods(next)
    saveModules(next)
  }
  const persistTokens = (next: TokenRecord[]) => {
    setTokens(next)
    saveTokens(next)
  }

  const alerts = useMemo(() => computeAlerts(), [mods, tokens, settings])

  const flash = () => {
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  // ---------- 子页：AI 加工 · 模型配置 ----------
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
    upd({ ...settings, monitorModel: { provider, model } })
    flash()
  }

  // 用量
  const [rows, setRows] = useState<any[] | null>(null)
  const [metric, setMetric] = useState<'calls' | 'prompt' | 'completion' | 'cost'>('calls')
  const [days, setDays] = useState(30)
  useEffect(() => {
    let alive = true
    void loadUsageRows().then((r) => {
      if (alive) setRows(r)
    })
    return () => {
      alive = false
    }
  }, [])
  const daily = useMemo(() => (rows ? buildDailyUsage(rows, days, metric) : []), [rows, days, metric])
  const byRole = useMemo(() => (rows ? summarizeUsage(rows, days) : null), [rows, days])
  const METRIC_UNIT: Record<string, string> = { calls: '次', prompt: '输入tok', completion: '输出tok', cost: '元' }

  // ---------- 子页：令牌管理 ----------
  const [tokEditing, setTokEditing] = useState<string | null>(null)
  const [tokDraft, setTokDraft] = useState({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true })
  const startEdit = (t?: TokenRecord) => {
    if (t) {
      setTokEditing(t.id)
      setTokDraft({ ...t })
    } else {
      setTokEditing(null)
      setTokDraft({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true })
    }
  }
  const saveTokDraft = () => {
    const d = tokDraft
    if (!d.name.trim()) return
    const rec: TokenRecord = { ...d, id: d.id || `tok-${Date.now().toString(36)}`, value: d.value || '' }
    const next = tokEditing ? tokens.map((t) => (t.id === tokEditing ? rec : t)) : [...tokens, rec]
    persistTokens(next)
    setTokEditing(null)
    flash()
  }
  const removeTok = (id: string) => {
    if (!window.confirm('删除该令牌登记？（令牌值仅本机，删除后不可恢复）')) return
    persistTokens(tokens.filter((t) => t.id !== id))
  }
  const toggleTok = (id: string) => persistTokens(tokens.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)))

  // ---------- 子页：数据源连通检查 ----------
  const [cloudState, setCloudState] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle')
  const [cloudMsg, setCloudMsg] = useState('')
  const checkCloud = async () => {
    setCloudState('loading')
    setCloudMsg('')
    try {
      const text = await readCloudText('data/index.json')
      const j = JSON.parse(text)
      setCloudState('ok')
      setCloudMsg(`已连通 ✓ 数据更新至 ${j.last_updated || '未知'}，条目 ${j.stats?.total_items ?? '?'} 条 / 正文 ${j.stats?.articles_stored ?? '?'} 篇`)
    } catch (e: any) {
      setCloudState('fail')
      setCloudMsg(String(e?.message || e))
    }
  }

  // ---------- 首页卡片 ----------
  const tokBadge = (() => {
    const err = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) != null && daysUntil(t.expires)! < 0)
    const warn = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires)! <= 30 && daysUntil(t.expires)! >= 0)
    const active = tokens.filter((t) => t.enabled && t.value).length
    return err ? { cls: 'err', text: `${active} 枚在用 · ⚠ 已过期` } : warn ? { cls: 'warn', text: `${active} 枚在用 · ⚠ 临期` } : { cls: 'ok', text: `${active} 枚在用` }
  })()

  const cards: { key: ModuleKey | null; icon: string; name: string; desc: string; badge: { cls: string; text: string }; need: boolean; page: 'ai' | 'tokens' | 'prefs' | 'cloud' | 'security' }[] = [
    {
      key: 'ai',
      icon: '🤖',
      name: 'AI 加工 · 模型配置',
      desc: '模型选择 + 用量柱状图（7/30/90 天，次数/token/费用切换）',
      badge: monitor ? { cls: 'ok', text: monitor.model } : { cls: 'warn', text: '未指定模型' },
      need: mods.ai,
      page: 'ai',
    },
    {
      key: null,
      icon: '🔑',
      name: '令牌管理',
      desc: 'GitHub / 调度桥等令牌：过期日期、剩余天数、一键跳转 GitHub 管理页',
      badge: tokBadge,
      need: true,
      page: 'tokens',
    },
    {
      key: 'context',
      icon: '💬',
      name: '面板偏好 · 引用协同',
      desc: '自动附加阅读上下文、引用到对话（上下文条/工具卡片）',
      badge: mods.context ? { cls: 'ok', text: '引用协同开' } : { cls: 'off', text: '已禁用' },
      need: mods.context,
      page: 'prefs',
    },
    {
      key: 'deadline',
      icon: '⏰',
      name: '待办提醒 · 关注',
      desc: '首页待办卡（截止提醒）与关注功能',
      badge: mods.deadline ? { cls: 'ok', text: '已启用' } : { cls: 'off', text: '已禁用' },
      need: mods.deadline,
      page: 'prefs',
    },
    {
      key: 'cloud',
      icon: '☁️',
      name: '数据源',
      desc: 'GitHub 云端数据（每 2 小时自动更新）+ 连通性检查',
      badge: mods.cloud ? { cls: 'ok', text: '已连接云端' } : { cls: 'err', text: '已禁用! 插件无数据' },
      need: mods.cloud,
      page: 'cloud',
    },
    {
      key: 'portal',
      icon: '🔐',
      name: '安全 · 门户',
      desc: '统一门户密码（阶段 5）、密钥与重要链接',
      badge: { cls: 'ok', text: '阶段5 预留' },
      need: true,
      page: 'security',
    },
  ]

  // ---------- 渲染 ----------
  const errCount = useMemo(() => alerts.filter((a) => a.level === 'error').length, [alerts])

  if (page === 'home') {
    return (
      <div className="dsh-cau_set">
        {alerts.map((a, i) => (
          <div key={i} className={`dsh-cau_alert ${a.level}`}>
            <span className="dsh-cau_alertDot" />
            <span>{a.text}</span>
          </div>
        ))}
        <div className="dsh-cau_setDesc">分项管理各功能与凭据；每项可独立启用/禁用，关键项缺失会在此提醒。</div>
        <div className="dsh-cau_cards">
          {cards.map((c) => (
            <div key={c.name} className="dsh-cau_setCard" role="button" tabIndex={0} onClick={() => setPage(c.page)} onKeyDown={(e) => e.key === 'Enter' && setPage(c.page)}>
              <div className="dsh-cau_cardMain">
                <span className="dsh-cau_cardName">
                  <span className="dsh-cau_cardIcon">{c.icon}</span>
                  {c.name}
                  <span className={`dsh-cau_cardBadge ${c.badge.cls}`}>{c.badge.text}</span>
                </span>
                <span className="dsh-cau_cardDesc">{c.desc}</span>
              </div>
              {c.key && <Toggle on={mods[c.key]} onToggle={() => toggleMod(c.key)} label={`切换 ${c.name}`} />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="dsh-cau_set">
      <div className="dsh-cau_setPageHead">
        <button type="button" className="dsh-cau_setSubBack" onClick={() => setPage('home')}>
          ‹ 返回
        </button>
        <div className="dsh-cau_setTitle" style={{ margin: 0 }}>
          {page === 'ai' ? 'AI 加工 · 模型配置' : page === 'tokens' ? '令牌管理' : page === 'prefs' ? '面板偏好 · 引用协同' : page === 'cloud' ? '数据源' : '安全 · 门户'}
        </div>
        {errCount > 0 && <span className="dsh-cau_setWarn">⚠ 有 {errCount} 项配置问题</span>}
      </div>

      {page === 'ai' && (
        <div className="dsh-cau_setBlocks">
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">模型选择</div>
            <div className="dsh-cau_setDesc">独立配置槽：用于面板按需加工（AI 摘要/分类/重要度/deadline）与后续监控，与主对话模型互不影响。换模型只影响之后的加工，数据无需重爬。</div>
            {!sessionId || !modelDirectories ? (
              <div className="dsh-cau_setHint">{!modelDirectories ? '模型目录服务不可用（按需加工将使用服务端默认模型）。' : '当前没有打开的会话——打开一个会话后即可从 DSH 模型目录中选择。'}</div>
            ) : modelState === 'loading' ? (
              <div className="dsh-cau_setRow">
                <span className="dsh-cau_setHint">模型目录加载中…</span>
                <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>刷新</button>
              </div>
            ) : modelState === 'fail' ? (
              <div className="dsh-cau_setRow">
                <span className="dsh-cau_setErr">{modelNote}</span>
                <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>重试</button>
              </div>
            ) : modelState === 'ok' && groups.length === 0 ? (
              <div className="dsh-cau_setRow">
                <span className="dsh-cau_setHint">模型目录为空（检查 provider 配置后重试）。</span>
                <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>刷新</button>
              </div>
            ) : modelState === 'ok' ? (
              <>
                <div className="dsh-cau_setRow">
                  <select className="dsh-cau_setSelect" value={selGroup?.id || ''} onChange={(e) => { const g = groups.find((x) => x.id === e.target.value); if (g?.models?.length) pickModel(g.id, g.models[0].id) }}>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {selGroup?.models?.length ? (
                    <select className="dsh-cau_setSelect" value={selModel?.id || selGroup.models[0].id} onChange={(e) => pickModel(selGroup.id, e.target.value)}>
                      {selGroup.models.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name || m.id}</option>
                      ))}
                    </select>
                  ) : null}
                </div>
                <div className="dsh-cau_setHint">当前：{monitor ? `${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'}</div>
              </>
            ) : (
              <div className="dsh-cau_setRow">
                <span className="dsh-cau_setHint">{monitor ? `当前：${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'}</span>
                <button type="button" className="dsh-cau_setBtn" onClick={() => void loadModelDir()}>加载模型目录</button>
              </div>
            )}
            {savedFlash && <span className="dsh-cau_setOk">已保存 ✓</span>}
          </div>

          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">模型用量 · 柱状图</div>
            <div className="dsh-cau_setDesc">默认近 30 天；时间跨度与指标可切换（云端管道 + 本机按需合计）。</div>
            <div className="dsh-cau_chips">
              {[7, 30, 90].map((d) => (
                <button key={d} type="button" className={'dsh-cau_setChip' + (days === d ? ' on' : '')} onClick={() => setDays(d)}>
                  {d} 天
                </button>
              ))}
            </div>
            <div className="dsh-cau_chips">
              {(['calls', 'prompt', 'completion', 'cost'] as const).map((m) => (
                <button key={m} type="button" className={'dsh-cau_setChip' + (metric === m ? ' on' : '')} onClick={() => setMetric(m)}>
                  {METRIC_UNIT[m]}
                </button>
              ))}
            </div>
            {rows === null ? (
              <div className="dsh-cau_setHint">加载用量中…</div>
            ) : daily.length === 0 || !daily.some((d) => d.value > 0) ? (
              <div className="dsh-cau_setHint">近 {days} 天暂无用量记录（AI 加工尚未触发或用时不足）。</div>
            ) : (
              <BarChart items={daily} unit={METRIC_UNIT[metric]} />
            )}
            {byRole && Object.keys(byRole).length > 0 && (
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
                    {Object.entries(byRole).map(([role, v]) => (
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
                <div className="dsh-cau_setHint">金额仅对 DeepSeek 附带的计价调用显示；「刷新」后更新。</div>
              </>
            )}
          </div>

          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">按需补摘要</div>
            <div className="dsh-cau_infoCard">
              <span className="dsh-cau_setDesc">文章页对未加工的文章提供「AI 补摘要」：调用插件服务端路由（DSH 已配置的模型），浏览器不存任何 API key；结果仅本次会话内显示，不回写云端。</span>
              <span className="dsh-cau_setHint">触发位置：文章阅读页摘要区（无 AI 摘要时出现按钮）。禁用本模块后按钮隐藏。</span>
            </div>
          </div>
        </div>
      )}

      {page === 'tokens' && (
        <div className="dsh-cau_setBlocks">
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">令牌登记</div>
            <div className="dsh-cau_setDesc">每枚令牌可选启用/禁用；「值」仅存本机浏览器；过期日期用于到期提醒；「管理 ↗」跳转 GitHub 令牌管理页。停用全部令牌 = 面板无数据（顶部红条提醒）。</div>
            <div className="dsh-cau_tokList">
              {tokens.length === 0 && <div className="dsh-cau_setHint">暂未登记令牌。请添加 GitHub 数据令牌（细粒度 PAT，Contents: Read，私有数据仓）。</div>}
              {tokens.map((t) => {
                const eb = expiryBadge(t.expires)
                return (
                  <div key={t.id} className="dsh-cau_tok">
                    <Toggle on={t.enabled} onToggle={() => toggleTok(t.id)} label={`${t.name} 启用`} />
                    <div className="dsh-cau_tokMain">
                      <span className="dsh-cau_tokName">
                        {t.name}
                        {!t.enabled && <span className="dsh-cau_cardBadge off">已停用</span>}
                        {!t.value && t.expires && <span className="dsh-cau_cardBadge warn">仅登记过期日</span>}
                      </span>
                      <span className="dsh-cau_tokMeta">
                        {t.usage && <span>{t.usage}</span>}
                        {t.expires && (
                          <span className={eb.cls}>
                            过期 {t.expires} · {eb.text}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="dsh-cau_tokActs">
                      {t.adminUrl && (
                        <a className="dsh-cau_tokBtn" href={t.adminUrl} target="_blank" rel="noreferrer">
                          管理 ↗
                        </a>
                      )}
                      <button type="button" className="dsh-cau_tokBtn" onClick={() => startEdit(t)}>
                        编辑
                      </button>
                      <button type="button" className="dsh-cau_tokBtn danger" onClick={() => removeTok(t.id)}>
                        删除
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {!tokEditing ? (
              <div className="dsh-cau_setRow">
                <button type="button" className="dsh-cau_setBtn" onClick={() => startEdit()}>
                  + 添加令牌
                </button>
              </div>
            ) : (
              <div className="dsh-cau_infoCard">
                <div className="dsh-cau_setTitle" style={{ fontSize: 12 }}>{tokEditing ? '编辑令牌' : '添加令牌'}</div>
                <div className="dsh-cau_setRow">
                  <input className="dsh-cau_setInput" placeholder="名称（如 GitHub 数据令牌）" value={tokDraft.name} onChange={(e) => setTokDraft({ ...tokDraft, name: e.target.value })} />
                </div>
                <div className="dsh-cau_setRow">
                  <input className="dsh-cau_setInput" placeholder="用途说明（如 读取云端数据）" value={tokDraft.usage} onChange={(e) => setTokDraft({ ...tokDraft, usage: e.target.value })} />
                </div>
                <div className="dsh-cau_setRow">
                  <input className="dsh-cau_setInput" type="password" placeholder="令牌值（仅本机；仅登记过期日的可留空）" value={tokDraft.value} onChange={(e) => setTokDraft({ ...tokDraft, value: e.target.value })} spellCheck={false} />
                </div>
                <div className="dsh-cau_setRow">
                  <input className="dsh-cau_setInput" style={{ maxWidth: 170 }} type="date" value={tokDraft.expires} onChange={(e) => setTokDraft({ ...tokDraft, expires: e.target.value })} />
                  <input className="dsh-cau_setInput" placeholder="管理页 URL（默认 GitHub 令牌页）" value={tokDraft.adminUrl} onChange={(e) => setTokDraft({ ...tokDraft, adminUrl: e.target.value })} />
                </div>
                <div className="dsh-cau_setRow">
                  <button type="button" className="dsh-cau_setBtn" disabled={!tokDraft.name.trim()} onClick={saveTokDraft}>
                    保存
                  </button>
                  <button type="button" className="dsh-cau_setBtn" onClick={() => setTokEditing(null)}>
                    取消
                  </button>
                </div>
              </div>
            )}
            {savedFlash && <span className="dsh-cau_setOk">已保存 ✓</span>}
          </div>
        </div>
      )}

      {page === 'prefs' && (
        <div className="dsh-cau_setBlocks">
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">阅读上下文引用</div>
            <label className="dsh-cau_setCheck">
              <input type="checkbox" checked={!!settings.autoAttach} onChange={(e) => upd({ ...settings, autoAttach: e.target.checked })} />
              打开文章时自动附加阅读上下文（发送提问时作为引用材料）
            </label>
            <div className="dsh-cau_infoCard">
              <span className="dsh-cau_setDesc">文章阅读页点「<b>引用到对话</b>」→ 文章作为上下文引用到聊天输入框上方（chip），草稿注入标记行；发送后自动解除。关闭本模块（卡片开关）后引用按钮与上下文条隐藏。</span>
            </div>
          </div>
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">待办提醒 · 关注</div>
            <div className="dsh-cau_setDesc">首页「待办卡」展示未过期截止事项（≤7 天），支持留存/归档；关注无上限，文章页 ★ 加入。关闭本模块后待办卡与关注入口隐藏。</div>
          </div>
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">面板固定</div>
            <div className="dsh-cau_setDesc">面板头部 📌 固定后，点击外部/Esc 不关闭，仅 ✕ 关闭（状态持久化）。</div>
          </div>
        </div>
      )}

      {page === 'cloud' && (
        <div className="dsh-cau_setBlocks">
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">数据源</div>
            <div className="dsh-cau_setDesc">
              数据存于 GitHub 私有仓库（`zhouxuanting52-lab/cau-portal` 的 data/），由 Actions 每 2 小时抓取+AI 加工并提交；面板与 MCP 直接读云端。关闭本模块将完全停止数据读取（顶部红条提醒）。
            </div>
            <div className="dsh-cau_setRow">
              <button type="button" className="dsh-cau_setBtn" disabled={cloudState === 'loading'} onClick={() => void checkCloud()}>
                {cloudState === 'loading' ? '检查中…' : '连通性检查'}
              </button>
              {cloudState === 'ok' && <span className="dsh-cau_setOk">{cloudMsg}</span>}
              {cloudState === 'fail' && <span className="dsh-cau_setErr">{cloudMsg}</span>}
            </div>
            <div className="dsh-cau_links">
              {KEY_LINKS.slice(0, 3).map((l) => (
                <a className="dsh-cau_link" key={l.key} href={l.url} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {page === 'security' && (
        <div className="dsh-cau_setBlocks">
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">统一门户密码（阶段 5）</div>
            <div className="dsh-cau_setDesc">实验功能（代登录统一门户），阶段 5 才开放；若开放也仅存本机、不进仓库、不进 AI 对话。</div>
            <input className="dsh-cau_setInput" type="password" placeholder="暂未开放" disabled />
          </div>
          <div className="dsh-cau_setBlock">
            <div className="dsh-cau_setTitle">密钥与重要链接</div>
            <div className="dsh-cau_setDesc">常用页面一键直达；令牌详情与过期日在「令牌管理」页维护。</div>
            <div className="dsh-cau_links">
              {KEY_LINKS.map((l) => (
                <a className="dsh-cau_link" key={l.key} href={l.url} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
