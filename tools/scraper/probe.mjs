#!/usr/bin/env node
// 「添加栏目」第一步 · 站点探测（**只读**：只发 GET，不写任何文件、不动 sites.json）
//
// 用法：
//   node tools/scraper/probe.mjs <网址> [--cols 10] [--article] [--json]
// 例：
//   node tools/scraper/probe.mjs grs.cau.edu.cn
//   node tools/scraper/probe.mjs http://gs.zju.edu.cn --cols 6
//
// 输出：站点标题 / CMS 判定 / 可用栏目（名称 + 栏目 id + 条目量 + 样例）/ 正文解析自检 /
//       结论（能直接接 · 需写解析器 · 接不了）+ 可直接粘进 sites.json 的片段。
//
// 判定口径与 crawl.mjs 完全一致（复用同一批解析器）：
//   博达 boda —— 列表页 = <base>/col/col<栏目id>/index.html，页内含 unitid/webid，
//                翻页走 <base>/module/web/jpage/dataproxy.jsp；条目 = 含 /art/ 的 <a>。
//   其他    —— 首页抽「疑似栏目列表页」（/col/colN/index.html、/<数字>/list.htm、/<字母>/list.htm、
//                /<字母>/index.htm）逐个试抓，能认出条目就给「需写解析器」，抓不到就照实说。
//   访问受限 —— 显式识别「仅允许校内 IP」「请先登录/无权限」这类拦截页（**不要把首页里的登录链接误判成需登录**）。
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

// ---------- 访问限制识别（关键：不要用"页面里出现过 sso/登录"当判据） ----------
const RESTRICT_PATTERNS = [
  [/仅允许校内|校内地址访问|非校内|仅限校内|只允许校内|校内网络|校内\s*IP|校内用户/i, '仅限校内 IP 访问'],
  [/您没有权限|无权访问|访问被拒绝|请先登录|请登录后|登录后(才)?(可)?(以)?查看|Access Denied|Forbidden/i, '需要登录 / 无权限'],
]
/** 返回 {why, evidence} 或 null（evidence = 命中处前后文，给用户看原始证据） */
function restrictionOf(html) {
  // 关键：先去掉所有空白再匹配 —— 拦截语常被 <b>/<span>/<br> 切断，
  // 而 textOf 会把标签换成空格，「仅允许校内」就变成「仅允许 校内」匹配不上了（实测踩过）。
  const text = textOf(html).replace(/\s+/g, '')
  if (text.length > 200000) return null // 超大页面多为门户首页/JS 应用，不做关键词判定，避免误报
  for (const [re, why] of RESTRICT_PATTERNS) {
    const m = re.exec(text)
    if (m) return { why, evidence: text.slice(Math.max(0, m.index - 14), m.index + 50).trim() }
  }
  return null
}
/** 首页本身就是登录页（要有硬证据：密码输入框，或标题就是登录页），避免把首页的"登录"链接误判 */
function looksLikeLoginPage(html, title) {
  if (/<input[^>]+type=["']?password/i.test(html)) return true
  return !!(title && /^(登录|用户登录|统一身份认证|统一身份认证登录|Sign in|Log ?in)\b/i.test(title.trim()))
}

// ---------- 博达：栏目链接 ----------
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

/** 非博达：从首页抽「疑似栏目列表页」 */
function extractListCandidates(html, base) {
  const out = new Map()
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (m[1].match(/href=["']([^"']+)["']/i) || [])[1]
    if (!href || /^(javascript:|#|mailto:|tel:)/i.test(href)) continue
    const path = href.split('?')[0]
    let kind = null
    if (/\/col\/col\d+\/index\.html$/i.test(path)) kind = '博达型'
    else if (/\/\d{3,6}\/list\.htm$/i.test(path)) kind = '数字栏目型'
    else if (/\/[a-z][a-z0-9_]{1,11}\/list\.htm$/i.test(path)) kind = '字母栏目型'
    else if (/\/[a-z][a-z0-9_]{1,11}\/index\.htm$/i.test(path)) kind = 'index.htm 型'
    if (!kind) continue
    const abs = absUrl(base, href)
    if (out.has(abs)) continue
    const name = textOf((m[1].match(/title=["']([^"']*)["']/i) || [])[1]) || textOf(m[2])
    out.set(abs, { url: abs, name: (name || '（无标题）').slice(0, 40), kind })
  }
  // 优先试抓「像内容栏目」的入口（通知/新闻/讲座…），否则一页门户导航会淹没在"学院概况"里
  const KEYWORD_RE = /(通知|公告|公示|新闻|动态|要闻|讲座|报告|学术|科研|党建|招生|就业|本科|研究生|教学|活动|会议|政策|规章|文件|信息)/
  return [...out.values()].sort((a, b) => (KEYWORD_RE.test(b.name) ? 1 : 0) - (KEYWORD_RE.test(a.name) ? 1 : 0))
}

/** 非博达：通用条目抽取（列表页里指向文章页的 <a> + 就近日期） */
function genericItems(html, base) {
  const out = []
  const seen = new Set()
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (m[1].match(/href=["']([^"']+)["']/i) || [])[1]
    if (!href || /^(javascript:|#|mailto:|tel:)/i.test(href)) continue
    const path = href.split('?')[0]
    if (!/\.(htm|html)$/i.test(path) || /(list|index|default)\.(htm|html)$/i.test(path)) continue
    const title = textOf((m[1].match(/title=["']([^"']*)["']/i) || [])[1]) || textOf(m[2])
    if (!title || title.length < 6) continue
    const abs = absUrl(base, href)
    if (seen.has(abs)) continue
    seen.add(abs)
    const seg = html.slice(Math.max(0, m.index - 80), m.index + m[0].length + 140)
    const d = seg.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/)
    out.push({ url: abs, title: title.slice(0, 60), date: d ? `${d[1]}-${String(d[2]).padStart(2, '0')}-${String(d[3]).padStart(2, '0')}` : null })
    if (out.length >= 40) break
  }
  return out
}

// ---------- 通用：文章页自检 ----------
const BODY_CONTAINERS = [
  'wp_articlecontent',
  'vsb_content',
  'id="content"',
  'class="content"',
  'id="zoom"',
  'class="article"',
  'id="articleContent"',
  'class="v_news_content"',
  'id="main"',
]
async function probeArticle(url, referer) {
  const r = await fetchText(url, { referer })
  if (!r.ok) return { ok: false, url, error: `详情页失败 ${r.status ?? r.error}` }
  const rest = restrictionOf(r.text)
  const text = textOf(r.text)
  return {
    ok: true,
    url,
    restricted: rest ? rest.why : null,
    containers: BODY_CONTAINERS.filter((k) => r.text.includes(k)),
    text_len: text.length,
    title: titleOf(r.text),
    date: (text.match(/20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}/) || [])[0] || null,
  }
}

/**
 * 首页内嵌条目 —— **列表页被 IP/登录拦掉时的退路**。
 * 实测（浙大地球科学学院，苏迪 CMS）：栏目列表页对校外 IP 返回拦截页，但首页本身公开、
 * 内嵌了 85 条条目（`/<年>/<月日>/c<栏目号>a<文章号>/page.htm`，带 data-time），文章页也公开。
 * 这类站点「能接但受限」：只能拿到每个栏目最新若干条，不能翻页取历史。
 */
function homeInlineItems(html, base) {
  const out = []
  const seen = new Set()
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (m[1].match(/href=["']([^"']+)["']/i) || [])[1]
    if (!href || /^(javascript:|#|mailto:|tel:)/i.test(href)) continue
    const path = href.split('?')[0]
    if (!/\.(htm|html)$/i.test(path) || /(list|index|default)\.(htm|html)$/i.test(path)) continue
    const abs = absUrl(base, href)
    if (seen.has(abs)) continue
    seen.add(abs)
    const title = textOf((m[1].match(/title=["']([^"']*)["']/i) || [])[1]) || textOf(m[2])
    if (!title || title.length < 4) continue
    const dt = (m[1].match(/data-time=["']([^"']+)["']/i) || [])[1] || null
    const um = abs.match(/\/(20\d{2})\/(\d{2})(\d{2})\//)
    const col = (abs.match(/c(\d+)a\d+/i) || [])[1] || null
    out.push({ url: abs, title: title.slice(0, 60), date: dt || (um ? `${um[1]}-${um[2]}-${um[3]}` : null), col })
    if (out.length >= 300) break
  }
  return out
}

/** 从首页导航里取「/<栏目号>/list.htm」的锚文本 → 栏目号到中文名的映射（给首页内嵌条目配名字） */
function columnNamesFromNav(html) {
  const m = new Map()
  for (const a of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (a[1].match(/href=["']([^"']+)["']/i) || [])[1]
    const id = href && (href.match(/\/(\d{3,6})\/list\.(?:htm|psp|html)/i) || [])[1]
    if (!id || m.has(id)) continue
    const name = textOf((a[1].match(/title=["']([^"']*)["']/i) || [])[1]) || textOf(a[2])
    if (name) m.set(id, name.slice(0, 24))
  }
  return m
}

/** 通用 CMS 指纹（认得出来就报厂商，省得用户自己猜） */
function cmsFingerprint(html) {
  if (/dataproxy\.jsp|\/col\/col\d+\/index\.html/i.test(html)) return 'boda（西安博达）'
  if (/sudy|wp_articlecontent|_portletPlugs|\.psp\b/i.test(html)) return 'sudy（南京苏迪，列表 /<栏目号>/list.htm、文章 /<年>/<月日>/c<栏目>a<文章>/page.htm、正文容器 wp_articlecontent）'
  if (/vsb_content|_upload\/tpl/i.test(html)) return '未识别（有 vsb_content/_upload/tpl 特征，常见于维程/清元一类站群）'
  return null
}

/** 站内「列表页里认出来的条目」——给通用栏目探测用（苏迪等：/<年>/<月日>/c<栏目>a<文章>/page.htm） */
const JUNK_LINK = /返回.*首页|回到顶部|返回顶部|打印|关闭此页|English|ENGLISH|^更多$/i
const ARTICLE_SHAPE = /(c\d+a\d+|\/art\/|\/20\d{2}\/\d{3,4}\/|\/\d{4}\/\d{1,2}\/)/i
function listItems(html, base) {
  const out = []
  const seen = new Set()
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (m[1].match(/href=["']([^"']+)["']/i) || [])[1]
    if (!href || /^(javascript:|#|mailto:|tel:)/i.test(href)) continue
    const path = href.split('?')[0]
    if (!/\.(htm|html)$/i.test(path) || /(list|index|default)\.(htm|html)$/i.test(path)) continue
    const title = textOf((m[1].match(/title=["']([^"']*)["']/i) || [])[1]) || textOf(m[2])
    if (!title || title.length < 4 || JUNK_LINK.test(title)) continue
    const abs = absUrl(base, href)
    if (seen.has(abs)) continue
    seen.add(abs)
    const dt = (m[1].match(/data-time=["']([^"']+)["']/i) || [])[1] || null
    const um = abs.match(/\/(20\d{2})\/(\d{2})(\d{2})\//)
    out.push({ url: abs, title: title.slice(0, 60), date: dt || (um ? `${um[1]}-${um[2]}-${um[3]}` : null), shape: ARTICLE_SHAPE.test(abs) })
    if (out.length >= 60) break
  }
  // 「文章样」的链接优先（列表页里常混着导航/面包屑链接，否则样例会抽到"返回首页"这种）
  return out.sort((a, b) => (b.shape ? 1 : 0) - (a.shape ? 1 : 0))
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

/** 博达栏目探测 */
async function probeColumn(base, col, siteName, siteTitle, { articleCheck }) {
  const url = `${base}/col/col${col.id}/index.html`
  const r = await fetchText(url, { referer: `${base}/` })
  if (!r.ok) return { ...col, url, listOk: false, error: `列表页失败 ${r.status ?? r.error}` }
  const p = parseListPage(r.text)
  const rest = restrictionOf(r.text)
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
  if (rest) {
    res.restricted = rest.why
    res.restrictEvidence = rest.evidence
    res.count = p.items.length
    res.samples = p.items.slice(0, 3).map((i) => ({ date: i.date, title: i.title, url: i.url }))
    return res
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

/** 非博达栏目探测（通用） */
async function probeGenericColumn(cand, base) {
  const r = await fetchText(cand.url, { referer: `${base}/` })
  if (!r.ok) return { ...cand, listOk: false, error: `列表页失败 ${r.status ?? r.error}` }
  const rest = restrictionOf(r.text)
  const nm = nameFromTitle(titleOf(r.text), null, cand.name)
  const id = (cand.url.match(/\/(\d{3,6})\/list\./i) || [])[1] || null
  if (rest) {
    return { ...cand, id, name: nm, listOk: true, restricted: rest.why, restrictEvidence: rest.evidence, count: 0, samples: [] }
  }
  const items = listItems(r.text, cand.url)
  const pager = new Set([...r.text.matchAll(/href=["']([^"']*?list\d+\.(?:htm|psp|html))["']/gi)].map((m) => m[1]))
  return { ...cand, id, name: nm, listOk: true, count: items.length, samples: items.slice(0, 3), pages: pager.size + 1 }
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
  const out = { input: target, base, title: null, cms: null, reachable: false, columns: [], candidates: [], verdict: null, evidence: null, snippet: null, notes: [] }

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

  // ① 首页本身就是拦截页/登录页
  const homeRest = restrictionOf(homeText)
  if (homeRest) {
    out.cms = homeRest.why
    out.evidence = homeRest.evidence
    out.verdict = `接不了：${homeRest.why}（首页即返回拦截页）`
    report(out)
    return
  }
  if (looksLikeLoginPage(homeText, out.title)) {
    out.cms = '需登录'
    out.verdict = '接不了：首页是登录页（本爬虫只抓公开页面；要登录的走「统一门户」那条线）'
    report(out)
    return
  }

  const cols = extractColumns(homeText)
  const isBoda = cols.length > 0 || /dataproxy\.jsp/i.test(homeText) || /[?&]unitid=\d+/.test(homeText)

  // ② 非博达：走通用兜底探测（不再直接下"需写解析器/接不了"的结论）
  if (!isBoda) {
    const cands = extractListCandidates(homeText, out.base)
    // 关键补充：光看首页导航会漏掉真正的通知栏目（导航前几条往往是"学院概况"这类）。
    // 首页内嵌条目里带着栏目号（如 /2026/0622/c34769a3181031/page.htm 的 34769），
    // 据此把「/<栏目号>/list.htm」也加进候选，并按「有内嵌条目的栏目」优先。
    const inlineAll = homeInlineItems(homeText, out.base)
    const inlineCount = new Map()
    for (const it of inlineAll) if (it.col) inlineCount.set(it.col, (inlineCount.get(it.col) || 0) + 1)
    const nav = columnNamesFromNav(homeText)
    const GENERIC = /^(查看更多|更多|more|详细|列表|全部|>>?)$/i
    const byUrl = new Map()
    for (const c of cands) {
      const m = c.url.match(/\/(\d{3,6})\/list\./i)
      const id = m ? m[1] : null
      const n = inlineCount.get(id) || 0
      if (n && GENERIC.test(c.name)) continue // 「查看更多」这种名字让位给下面的内嵌条目候选
      byUrl.set(c.url, { ...c, home_items: n, from: 'nav' })
    }
    for (const [id, n] of inlineCount) {
      const url = `${out.base}/${id}/list.htm`
      if (byUrl.has(url)) continue
      const nm = nav.get(id)
      if (nm && !GENERIC.test(nm)) continue // 导航里已有这个栏目（名字更好），别重复
      byUrl.set(url, { url, name: nm && !GENERIC.test(nm) ? nm : `栏目${id}`, kind: '首页条目带出', home_items: n, from: 'inline' })
    }
    const all = [...byUrl.values()].sort((a, b) => (b.home_items || 0) - (a.home_items || 0))
    out.candidates = all.map((c) => ({ url: c.url, name: c.name, kind: c.kind, home_items: c.home_items || 0 }))
    const picked = all.slice(0, Math.max(1, maxCols))
    out.notes.push(all.length > picked.length ? `首页共找到 ${all.length} 个疑似栏目入口，本次只试抓前 ${picked.length} 个（--cols 可调）` : '')
    for (const c of picked) {
      if (out.columns.length) await sleep(400)
      out.columns.push(await probeGenericColumn(c, out.base))
    }
    // 再对「列表页可抓」的栏目各抽查一篇文章页（有些站是"整栏可抓、个别文章被拦"）
    const usable0 = out.columns.filter((c) => c.listOk && !c.restricted && c.count > 0)
    for (const c of usable0.slice(0, 3)) {
      if (!c.samples?.length) continue
      await sleep(300)
      c.article = await probeArticle(c.samples[0].url, c.url)
    }
    const usable = out.columns.filter((c) => c.listOk && !c.restricted && c.count > 0)
    const restricted = out.columns.filter((c) => c.restricted)

    // 列表页都不可用时别急着说「接不了」：先试「首页内嵌条目 + 文章页」这条退路
    let inlineUsable = false
    if (!usable.length) {
      const inline = inlineAll
      if (inline.length) {
        const colsCovered = [...new Set(inline.map((i) => i.col).filter(Boolean))]
        const article = await probeArticle(inline[0].url, `${out.base}/`)
        out.home_items = { count: inline.length, columns: colsCovered.length, samples: inline.slice(0, 3), article }
        inlineUsable = !!(article.ok && !article.restricted && (article.containers.length || article.text_len > 800))
        if (inlineUsable) {
          const byCol = new Map()
          for (const it of inline) {
            if (!it.col) continue
            const cur = byCol.get(it.col) || { id: it.col, name: nav.get(it.col) || `栏目${it.col}`, n: 0 }
            cur.n++
            byCol.set(it.col, cur)
          }
          const colList = [...byCol.values()].sort((a, b) => b.n - a.n)
          out.cms = `未识别（列表页受限，但首页条目 + 文章页可取${article.containers.length ? '；正文容器 ' + article.containers[0] : ''}）`
          out.verdict =
            `能接（受限）：栏目列表页返回拦截页${restricted.length ? `（${restricted[0].restricted}）` : ''}，**不能翻页取历史**；` +
            `但首页公开、内嵌了 ${inline.length} 条条目（覆盖 ${colsCovered.length} 个栏目），文章页也能抓（可见文本 ${article.text_len} 字）` +
            `→ 按「首页条目 + 文章页」接入即可，代价是每个栏目只有最新若干条`
          out.evidence = restricted[0]?.restrictEvidence ?? null
          out.snippet = {
            提示: '列表页受限型站点：抓取入口是首页内嵌条目，不是 /<栏目号>/list.xxx；sites.json 需新增 cms 类型并另写解析器',
            baseUrl: out.base,
            columns: colList.slice(0, 10).map((c) => ({ id: Number(c.id), key: `c${c.id}`, name: c.name, home_items: c.n })),
            sample_item: inline[0].url,
          }
        }
      }
    }

    if (usable.length) {
      const fp = cmsFingerprint(homeText)
      const isSudy = !!(fp && /sudy/.test(fp))
      const artBad = usable.filter((c) => c.article && (c.article.restricted || !c.article.ok))
      const total = usable.reduce((n, c) => n + c.count, 0)
      out.cms = `非博达 —— ${fp || '未识别 CMS'}`
      out.verdict =
        (isSudy
          ? '能接：识别为苏迪 CMS，**本爬虫已内置 sudy 解析器**，把下面的片段加进 sites.json 即可（无需改代码）；'
          : '能接：需要为这个 CMS 写一个解析器（现有爬虫已内置「博达 boda」「苏迪 sudy」「校新闻网 news-custom」三种）；') +
        `列表页公开可抓，已认出 ${usable.length} 个栏目 / 合计 ${total} 条（${usable.filter((c) => c.article?.containers?.length).length} 个栏目抽查到正文容器）` +
        (restricted.length ? `；${restricted.length} 个栏目受访问限制（已排除）` : '') +
        (artBad.length ? `；注意 ${artBad.length} 个栏目抽查到「文章页被拦/失败」——该站按栏目+按文章分别设权限，解析器会对单篇失败容错（只留标题）` : '')
      out.snippet = {
        提示: isSudy ? '苏迪 CMS：cms 填 "sudy"；列表 /<栏目号>/list.htm（可能 301 到 list.psp）、详情 /<年>/<月日>/c<栏目>a<文章>/page.htm、正文容器 wp_articlecontent' : 'CMS 类型待定：照列表页结构写解析器，再在 sites.json 里加对应 cms 类型',
        baseUrl: out.base,
        cms: isSudy ? 'sudy' : '（待定）',
        columns: usable.map((c) => ({ id: Number((c.url.match(/\/(\d{3,6})\/list\./) || [])[1]) || c.name, key: `c${(c.url.match(/\/(\d{3,6})\/list\./) || [])[1]}`, name: c.name, items: c.count })),
      }
    } else if (!inlineUsable && restricted.length) {
      out.cms = `访问受限（${restricted[0].restricted}）`
      out.evidence = restricted[0].restrictEvidence
      out.verdict = `接不了：${restricted[0].restricted}（栏目列表页返回拦截页，且首页也没有可抓的内嵌条目 —— 校外拿不到内容）`
    } else if (!inlineUsable && out.columns.length) {
      out.verdict = '接不了：列表页能打开，但认不出条目结构（可能是 JS 动态渲染，或内容确实为空）'
    } else if (!inlineUsable) {
      out.verdict = '接不了：首页里没找到任何疑似栏目列表入口，也没有可抓的内嵌条目（可能是纯 JS 渲染）'
    }
    report(out)
    return
  }

  // ③ 博达
  out.cms = 'boda（博达 CMS）'
  const siteName = (out.title || '').replace(/[-—|·].*$/, '').trim() || 'CAU'
  const picked = cols.slice(0, Math.max(1, maxCols))
  out.notes.push(cols.length > picked.length ? `首页只列出 ${cols.length} 个栏目，本次只探测前 ${picked.length} 个（--cols 可调）` : '')
  for (const col of picked) {
    if (out.columns.length) await sleep(400)
    out.columns.push(await probeColumn(out.base, col, siteName, out.title, { articleCheck: flag('article') }))
  }

  const usable = out.columns.filter((c) => c.listOk && !c.restricted && c.count > 0)
  const noPaging = usable.filter((c) => !c.unitid || !c.webid)
  const restricted = out.columns.filter((c) => c.restricted)
  const empty = out.columns.filter((c) => c.listOk && !c.restricted && !c.count)
  if (usable.length) {
    const artBad = out.columns.find((c) => c.article && !c.article.error && !c.article.body_chars)
    out.verdict =
      `能直接接：识别为博达 CMS，${usable.length} 个栏目可用` +
      (noPaging.length ? `（其中 ${noPaging.length} 个缺分页参数，只能抓列表页首屏）` : '') +
      (restricted.length ? `；另有 ${restricted.length} 个栏目受访问限制` : '') +
      (empty.length ? `；另有 ${empty.length} 个栏目暂无条目` : '') +
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
  } else if (restricted.length) {
    out.cms = `访问受限（${restricted[0].restricted}）`
    out.evidence = restricted[0].restrictEvidence
    out.verdict = `接不了：是博达站点，但栏目列表页返回拦截页 —— ${restricted[0].restricted}（校外拿不到内容）`
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
    L.push(`栏目（试抓 ${out.columns.length} 个）：`)
    for (const c of out.columns) {
      const n = c.listOk ? `${c.count ?? '?'} 条${typeof c.static_items === 'number' ? `（列表页 ${c.static_items}）` : ''}${c.pages ? `，约 ${c.pages} 页` : ''}` : '—'
      L.push(`  · ${c.name}${c.id ? `  id=${c.id}` : ''}${c.kind ? `  [${c.kind}]` : ''}${c.home_items ? `  首页条目 ${c.home_items}` : ''}  ${n}`)
      if (c.samples?.length) L.push(`      样例：${c.samples[0].date || '无日期'} ${String(c.samples[0].title || '').slice(0, 44)}`)
      if (c.article && c.article.body_chars !== undefined) L.push(`      正文：${c.article.error ? c.article.error : `${c.article.body_chars} 字${c.article.is_image_only ? '（图片海报）' : ''}`}`)
      if (c.restricted) L.push(`      ! 受访问限制：${c.restricted}${c.restrictEvidence ? ` —— 「${c.restrictEvidence}」` : ''}`)
      else if (!c.listOk) L.push(`      ! ${c.error}`)
      else if (!c.count) L.push(`      ! 列表无条目（可能需登录或栏目为空）`)
      else if (c.kind === '博达型' && (!c.unitid || !c.webid)) L.push(`      ! 缺 unitid/webid：只能抓列表页首屏，翻页不可用`)
      if (c.article) {
        L.push(
          `      文章页：${c.article.ok ? (c.article.restricted ? '被拦：' + c.article.restricted : `${c.article.text_len} 字${c.article.containers.length ? '，容器 ' + c.article.containers.slice(0, 2).join('/') : ''}`) : c.article.error}`,
        )
      }
    }
  }
  for (const n of out.notes || []) if (n) L.push(`注：${n}`)
  if (out.home_items) {
    const h = out.home_items
    L.push(`首页内嵌条目（列表页不可用时的退路）：${h.count} 条，覆盖 ${h.columns} 个栏目`)
    for (const s of h.samples) L.push(`  · ${s.date || '无日期'}  ${String(s.title || '').slice(0, 44)}${s.col ? `  [c${s.col}]` : ''}`)
    if (h.article) {
      L.push(
        `  文章页自检：${h.article.ok ? (h.article.restricted ? '被拦：' + h.article.restricted : `可抓，可见文本 ${h.article.text_len} 字${h.article.containers.length ? '，正文容器 ' + h.article.containers.join('/') : ''}`) : h.article.error}`,
      )
    }
  }
  if (out.evidence) L.push(`原始证据：「${out.evidence}」`)
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
