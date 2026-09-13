#!/usr/bin/env node
// 「添加栏目」第一步 · 站点探测（**只读**：只发 GET，不写任何文件、不动 sites.json）
//
// 用法：
//   node tools/scraper/probe.mjs <网址> [--cols 10] [--article] [--json]
// 例：
//   node tools/scraper/probe.mjs grs.cau.edu.cn
//   node tools/scraper/probe.mjs https://grs.cau.edu.cn --json
//
// 输出：站点标题 / CMS 判定 / 可用栏目（名称 + 栏目 id + 条目量 + 样例）/ 正文解析自检 /
//       结论（能直接接 · 需写解析器 · 接不了）+ 可直接粘进 sites.json 的片段。
//
// 判定口径与 crawl.mjs 完全一致（复用同一批解析器）：
//   博达 boda —— 列表页 = <base>/col/col<栏目id>/index.html，页内含 unitid/webid，
//                翻页走 <base>/module/web/jpage/dataproxy.jsp；条目 = 含 /art/ 的 <a>。
//   其他 —— 未识别出博达栏目结构时，列出「像列表页」的链接供人工判断（自研 CMS 需另写解析器；
//           要登录才能看列表的（如统一门户、部分综合通知）接不了，不走这里）。
import { fetchText, absUrl } from './fetch.mjs'
import { parseListPage, parseDataproxy } from './parse-list.mjs'
import { parseArticle } from './parse-article.mjs'
import { dataproxyUrl } from './crawl.mjs'

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] !== undefined && !String(process.argv[i + 1]).startsWith('--') ? process.argv[i + 1] : def
}
const flag = (name) => process.argv.includes(`--${name}`)
const target = process.argv.slice(2).find((a) => !a.startsWith('--') && !/^\d+$/.test(a))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function normUrl(u) {
  let s = String(u || '').trim()
  if (!s) return null
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`
  return s.replace(/\/+$/, '')
}

const titleOf = (html) => ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim() || null
const textOf = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()

/**
 * 栏目名以「列表页 <title>」为准（博达列表页标题 = 「站名 栏目名」），导航里那些写了「更多」的链接不可信。
 * 站点标题前缀剥掉；剥不掉就取空格分段里的最后一段。
 */
function nameFromTitle(pageTitle, siteTitle, fallback) {
  const pt = textOf(pageTitle)
  if (!pt) return fallback
  const st = textOf(siteTitle)
  if (st && pt.startsWith(st)) {
    const rest = pt.slice(st.length).replace(/^[\s\-—|·:：]+/, '').trim()
    if (rest) return rest
  }
  const segs = pt.split(/\s+/).filter(Boolean)
  if (segs.length >= 2) return segs[segs.length - 1]
  return pt === st ? fallback : pt
}

/** 从页面里抽「栏目链接」：博达 /col/col<id>/index.html（去重、保序） */
function extractColumns(html) {
  const out = new Map()
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (m[1].match(/href=["']([^"']+)["']/i) || [])[1]
    if (!href) continue
    const mm = href.match(/\/col\/col(\d+)\/index\.html/i)
    if (!mm) continue
    const id = mm[1]
    if (out.has(id)) continue
    const name = textOf((m[1].match(/title=["']([^"']*)["']/i) || [])[1]) || textOf(m[2])
    out.set(id, { id, name: (name || `栏目${id}`).slice(0, 40) })
  }
  return [...out.values()]
}

/** 未识别博达时，捞出可能是列表页的链接（自研 CMS 线索） */
function extractOtherLinks(html, base) {
  const out = new Map()
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (m[1].match(/href=["']([^"']+)["']/i) || [])[1]
    if (!href || /^(javascript:|#|mailto:)/i.test(href)) continue
    if (!/(index\.(htm|html)|list|news|notice|tzgg)/i.test(href)) continue
    const abs = href.startsWith('http') ? href : `${base}/${href.replace(/^\.?\//, '')}`
    if (out.has(abs)) continue
    const name = textOf((m[1].match(/title=["']([^"']*)["']/i) || [])[1]) || textOf(m[2])
    out.set(abs, { url: abs, name: (name || '').slice(0, 30) })
    if (out.size >= 40) break
  }
  return [...out.values()]
}

async function loadHome(base) {
  let r = await fetchText(`${base}/`)
  let used = base
  if (!r.ok && /^https:/i.test(base)) {
    const alt = base.replace(/^https:/i, 'http:')
    const r2 = await fetchText(`${alt}/`)
    if (r2.ok) {
      r = r2
      used = alt
    }
  }
  return { ...r, base: used }
}

async function probeColumn(base, col, siteName, siteTitle, { articleCheck }) {
  const url = `${base}/col/col${col.id}/index.html`
  const r = await fetchText(url, { referer: `${base}/` })
  if (!r.ok) return { ...col, url, listOk: false, error: `列表页失败 ${r.status ?? r.error}` }
  const p = parseListPage(r.text)
  const res = {
    ...col,
    nav_name: col.name,
    name: nameFromTitle(titleOf(r.text), siteTitle, col.name),
    url,
    listOk: true,
    unitid: p.unitid,
    webid: p.webid,
    static_items: p.items.length,
    total_record: null,
    total_page: null,
    samples: [],
    article: null,
  }
  if (p.unitid && p.webid) {
    const dp = await fetchText(dataproxyUrl(base, 1, col.id, p.unitid, p.webid, siteName || 'CAU'), { referer: url })
    if (dp.ok) {
      const d = parseDataproxy(dp.text)
      res.total_record = d.totalRecord
      res.total_page = d.totalPage
      if (d.items.length) res.samples = d.items.slice(0, 3).map((i) => ({ date: i.date, title: i.title, url: i.url }))
    } else {
      res.error = `dataproxy 失败 ${dp.status ?? dp.error}`
    }
  }
  if (!res.samples.length) res.samples = p.items.slice(0, 3).map((i) => ({ date: i.date, title: i.title, url: i.url }))
  res.count = res.total_record ?? res.static_items

  if (articleCheck && res.samples.length) {
    await sleep(300)
    const it = res.samples[0]
    const abs = absUrl(base, it.url)
    const ar = await fetchText(abs, { referer: url })
    if (ar.ok) {
      const a = parseArticle(ar.text, abs)
      res.article = { url: abs, title: a.title, time: a.time, body_chars: (a.body || '').length, is_image_only: a.is_image_only }
    } else {
      res.article = { url: abs, error: `详情页失败 ${ar.status ?? ar.error}` }
    }
  }
  return res
}

/** 栏目 id → 建议的 key（稳定、无歧义；展示名一律用中文 name） */
const keyOf = (id) => `c${id}`

async function main() {
  const base = normUrl(target)
  if (!base) {
    console.error('用法：node tools/scraper/probe.mjs <网址> [--cols 10] [--article] [--json]')
    process.exit(2)
  }
  const maxCols = Number(arg('cols', 10))
  const out = { input: target, base, title: null, cms: null, reachable: false, columns: [], others: [], verdict: null, snippet: null, notes: [] }

  const home = await loadHome(base)
  if (!home.ok) {
    out.verdict = `接不了：站点打不开（${home.status ?? home.error}）`
    report(out)
    return
  }
  out.reachable = true
  out.base = home.base
  out.title = titleOf(home.text)
  const homeText = home.text

  const cols = extractColumns(homeText)
  const isBoda = cols.length > 0 || /dataproxy\.jsp/i.test(homeText) || /[?&]unitid=\d+/.test(homeText)
  // 登录/门户类：首页就是登录页，或跳到了 SSO
  const ssoish = /(统一身份认证|cas\.cau|authserver|sso|请登录|用户登录)/i.test(homeText) && cols.length === 0

  if (ssoish) {
    out.cms = '需登录'
    out.verdict = '接不了：需要登录（本爬虫只抓公开页面；要登录的走「统一门户」那条线）'
    report(out)
    return
  }
  if (!isBoda) {
    out.cms = '未识别（可能自研 CMS）'
    out.others = extractOtherLinks(homeText, out.base)
    out.verdict = '需写解析器：未发现博达栏目结构 —— 若是校新闻网那种自研 CMS，可照 tools/scraper/parse-news.mjs 另写一个解析器'
    report(out)
    return
  }

  out.cms = 'boda（博达 CMS）'
  const siteName = (out.title || '').replace(/[-—|·].*$/, '').trim() || 'CAU'
  const picked = cols.slice(0, Math.max(1, maxCols))
  out.notes.push(cols.length > picked.length ? `首页只列出 ${cols.length} 个栏目，本次只探测前 ${picked.length} 个（--cols 可调）` : '')
  for (const col of picked) {
    if (out.columns.length) await sleep(400)
    out.columns.push(await probeColumn(out.base, col, siteName, out.title, { articleCheck: flag('article') }))
  }

  const usable = out.columns.filter((c) => c.listOk && c.count > 0)
  const noPaging = usable.filter((c) => !c.unitid || !c.webid)
  const empty = out.columns.filter((c) => c.listOk && !c.count)
  if (usable.length) {
    const artBad = out.columns.find((c) => c.article && !c.article.error && !c.article.body_chars)
    out.verdict =
      `能直接接：识别为博达 CMS，${usable.length} 个栏目可用` +
      (noPaging.length ? `（其中 ${noPaging.length} 个缺分页参数，只能抓列表页首屏）` : '') +
      (empty.length ? `；另有 ${empty.length} 个栏目暂无条目（可能需登录，已排除）` : '') +
      (flag('article') ? (artBad ? '；注意有栏目正文解析为空（可能是图片海报）' : '；正文解析自检通过') : '')
    const id = (() => {
      try {
        return new URL(out.base).hostname.split('.')[0]
      } catch {
        return 'site'
      }
    })()
    // 展示名沿用既有条目风格：剥掉「中国农业大学」前缀（面板里一排站点名太长）
    const niceName = (out.title || id)
      .replace(/^中国农业大学\s*/, '')
      .split(/[-—|·]/)[0]
      .trim()
    out.snippet = {
      id,
      name: niceName || id,
      baseUrl: out.base,
      cms: 'boda',
      columns: usable.map((c) => ({ id: Number(c.id), key: keyOf(c.id), name: c.name })),
    }
  } else {
    out.verdict = '接不了：是博达站点，但探测到的栏目都没有可抓条目（可能整站需登录或列表非公开）'
  }
  report(out)
}

function report(out) {
  if (flag('json')) {
    console.log(JSON.stringify(out, null, 2))
    return
  }
  const L = []
  L.push(`=== 站点探测：${out.base} ===`)
  L.push(`标题：${out.title || '—'}`)
  L.push(`CMS：${out.cms || '—'}`)
  if (out.columns.length) {
    L.push(`栏目（探测 ${out.columns.length} 个）：`)
    for (const c of out.columns) {
      const n = c.listOk ? `${c.count ?? '?'} 条（列表页 ${c.static_items}）` : '—'
      L.push(`  · ${c.name}  id=${c.id}  ${n}`)
      if (c.samples?.length) L.push(`      样例：${c.samples[0].date || '无日期'} ${String(c.samples[0].title || '').slice(0, 40)}`)
      if (c.article) L.push(`      正文：${c.article.error ? c.article.error : `${c.article.body_chars} 字${c.article.is_image_only ? '（图片海报）' : ''}`}`)
      if (!c.listOk) L.push(`      ! ${c.error}`)
      else if (!c.count) L.push(`      ! 列表无条目（可能需登录或栏目为空）`)
      else if (!c.unitid || !c.webid) L.push(`      ! 缺 unitid/webid：只能抓列表页首屏，翻页不可用`)
    }
  }
  if (out.others.length) {
    L.push(`疑似列表页（未识别为博达，供人工判断，前 ${Math.min(out.others.length, 12)} 条）：`)
    for (const o of out.others.slice(0, 12)) L.push(`  · ${o.name || '—'}  ${o.url}`)
  }
  for (const n of out.notes || []) if (n) L.push(`注：${n}`)
  L.push(`结论：${out.verdict}`)
  if (out.snippet) {
    L.push('')
    L.push('可直接粘进 sites.json 的 sites 数组（栏目请按需增删）：')
    L.push(JSON.stringify(out.snippet, null, 2))
  }
  console.log(L.join('\n'))
}

main().catch((e) => {
  console.error('探测失败：' + (e?.stack || e))
  process.exit(1)
})
