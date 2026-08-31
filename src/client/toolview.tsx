/**
 * 阶段6 双向协同 · 工具结果新闻卡片（tool.call.toolview，键控槽，key=mcp__cau__*）。
 * AI 调用 mcp__cau__* 工具后，结果渲染为新闻卡片（标题/摘要/重要度），
 * 内置「在面板中打开」（bus.requestOpenArticle）+「查看原文」（新标签）按钮，而非裸 JSON。
 * 未注册的 key 回落通用行；我们只接管自己的工具名。
 */
import { useMemo } from 'react'
import { requestOpenArticle } from './bus'
import { Ic } from './icons'

export const TOOLVIEW_CSS = `
.dsh-cau_tvWrap{display:flex;flex-direction:column;gap:8px;width:100%}
.dsh-cau_tvCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--cau-line-soft);border-radius:12px;background:var(--dsw-specific-tip,rgba(255,255,255,.03))}
.dsh-cau_tvTitle{font-size:13px;line-height:18px;font-weight:500;color:var(--cau-ink);cursor:pointer;word-break:break-word}
.dsh-cau_tvTitle:hover{color:var(--cau-brand)}
.dsh-cau_tvMeta{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_tvSum{font-size:12px;line-height:17px;color:var(--cau-ink2);word-break:break-word}
.dsh-cau_tvActions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsh-cau_tvBtn{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border:1px solid var(--cau-line);border-radius:8px;background:transparent;color:var(--cau-ink);font-size:11px;cursor:pointer;text-decoration:none}
.dsh-cau_tvBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_tvBtn svg{width:11px;height:11px}
.dsh-cau_tvBtnPrimary{background:var(--cau-brand);border-color:transparent;color:#fff}
.dsh-cau_tvBtnPrimary:hover{background:var(--cau-brand);color:#fff;opacity:.9}
.dsh-cau_tvImp{display:inline-flex;align-items:center;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:500}
.dsh-cau_tvImp-high{background:color-mix(in srgb,var(--cau-err) 15%,transparent);color:var(--cau-err)}
.dsh-cau_tvImp-mid{background:color-mix(in srgb,var(--cau-warn) 15%,transparent);color:var(--cau-warn)}
.dsh-cau_tvImp-low{background:var(--cau-fill);color:var(--cau-ink3)}
`

function tryJson(t: string): any | null {
  const s = String(t).trim()
  if (!s) return null
  // 尝试剥掉可能的 ```json 围栏
  const clean = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return null
  }
}

function parseBlock(block: any): any | null {
  if (!block) return null
  const res = block?.result ?? block
  if (res && typeof res === 'object') {
    const content = res.content
    if (Array.isArray(content)) {
      const text = content.filter((c: any) => c?.type === 'text').map((c: any) => c.text).join('')
      const j = text ? tryJson(text) : null
      if (j) return j
      return { __raw: text }
    }
    if (typeof res.text === 'string') {
      const j = tryJson(res.text)
      if (j) return j
    }
    return res
  }
  if (typeof res === 'string') {
    const j = tryJson(res)
    if (j) return j
    return { __raw: res }
  }
  return null
}

function cardItems(parsed: any): any[] {
  if (Array.isArray(parsed?.items) && parsed.items.length) return parsed.items
  if (Array.isArray(parsed)) return parsed
  if (parsed && parsed.title) return [parsed]
  return []
}

function itemId(it: any): string {
  return it.article_id || it.id || it.article_url || it.url || ''
}
function itemUrl(it: any): string {
  return it.article_url || it.url || ''
}
function impClass(v: string | undefined): string {
  if (v === '高') return 'dsh-cau_tvImp-high'
  if (v === '中') return 'dsh-cau_tvImp-mid'
  return 'dsh-cau_tvImp-low'
}

function Card({ it }: { it: any }) {
  const id = itemId(it)
  const title = it.title || it.name || it.item || '(无标题)'
  const meta = [it.date || it.time || '', it.source_name || it.site_name || it.column_name || it.source || ''].filter(Boolean).join(' · ')
  const sum = it.ai?.summary || it.summary || ''
  const imp = it.ai?.importance || it.importance || ''
  return (
    <div className="dsh-cau_tvCard">
      <div className="dsh-cau_tvTitle" onClick={() => id && requestOpenArticle(id)}>
        {title}
      </div>
      <div className="dsh-cau_tvMeta">
        {meta}
        {imp ? <span className={'dsh-cau_tvImp ' + impClass(imp)} style={{ marginLeft: 6 }}>{imp}</span> : null}
      </div>
      {sum ? <div className="dsh-cau_tvSum">{sum}</div> : null}
      <div className="dsh-cau_tvActions">
        {id ? (
          <button type="button" className="dsh-cau_tvBtn dsh-cau_tvBtnPrimary" onClick={() => requestOpenArticle(id)}>
            在面板中打开
          </button>
        ) : null}
        {itemUrl(it) ? (
          <a className="dsh-cau_tvBtn" href={itemUrl(it)} target="_blank" rel="noreferrer">
            查看原文
            <Ic n="ext" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

export function ToolCard(props: any) {
  const { toolName, block } = props
  const parsed = useMemo(() => parseBlock(block), [block])
  if (!parsed) {
    return <div className="dsh-cau_tvWrap">（工具结果未解析）</div>
  }
  const items = cardItems(parsed)
  if (items.length === 0) {
    return <div className="dsh-cau_tvWrap">{parsed.__raw ? <pre className="dsh-cau_tvSum">{parsed.__raw}</pre> : <pre className="dsh-cau_tvSum">{JSON.stringify(parsed, null, 2)}</pre>}</div>
  }
  return (
    <div className="dsh-cau_tvWrap">
      {items.slice(0, 5).map((it: any, i: number) => (
        <Card key={itemId(it) || i} it={it} />
      ))}
      {items.length > 5 ? <div className="dsh-cau_tvMeta">…共 {items.length} 条，其余在面板中浏览</div> : null}
    </div>
  )
}

/** 只接管「新闻条目形」结果（标题/摘要/重要度）的工具；用量、站点目录等非新闻形结果交还 DSH 默认渲染 */
const TOOL_KEYS = [
  'mcp__cau__get_article',
  'mcp__cau__search_news',
  'mcp__cau__list_latest',
  'mcp__cau__list_deadlines',
]

export function registerToolViews(ctx: any) {
  for (const k of TOOL_KEYS) {
    ctx.slots.inject(
      'tool.call.toolview',
      () => ctx.slots.register({ name: 'tool.call.toolview', key: k }, ToolCard),
      'cau-portal: toolview ' + k,
    )
  }
}
