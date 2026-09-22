// 苏迪 CMS（南京苏迪 / wp_ 前缀）列表与详情解析
//
// URL 形态（以浙大地球科学学院 http://gs.zju.edu.cn 实测为准）：
//   列表页：/<栏目号>/list.htm（可能 301 到 list.psp）；翻页 /<栏目号>/list2.htm、list3.htm …
//   详情页：/<年>/<月日>/c<栏目号>a<文章号>/page.htm（如 /2026/0316/c34768a3140787/page.htm）
// 页面结构：
//   列表条目：<a href="/2026/0316/c.../page.htm" target=... class="item" data-time="2026-03-16">
//   详情标题：<div class="content_title"><h2>标题</h2>
//              <div class="cont_tit">编辑 ：<span>王聪聪</span>时间 ：<span>2026-03-18</span>访问次数 ：…</div></div>
//   详情正文：<div class="content_main"><div class='wp_articlecontent'><p>…</p>…</div>…</div>
// 注意：本站按「栏目 + 文章」分别设权限（部分栏目/文章对校外 IP 返回拦截页），
//       所以列表与详情都可能拿不到内容 —— 调用方必须对单条失败容错，不要因为一篇失败丢掉整栏。
import { stripTags } from './text.mjs'
import { absUrl } from './fetch.mjs'

/** 苏迪文章链接（新模板 /c<栏目>a<文章>/page.htm；老模板 /YYYY/MMDD/NNNN.htm 兜底） */
const ART_RE = /\/(?:20\d{2}\/\d{3,4}\/c\d+a\d+\/page|20\d{2}\/\d{4}\/\d+)\.(?:htm|psp|html)$/i

/**
 * 列表容器：条目统一放在 `<div id="wp_news_w6">` / `<ul class="news_list …">` 里。
 * 必须限定容器 —— 页面顶部导航菜单也会有指向文章页的链接（实测浙大环资，菜单里的
 * 「师资队伍」= /2026/0130/c39434a3132102/page.htm），不限定就会**混进每一个栏目**
 * 变成一条日期靠前的假条目（污染列表与要闻）。找不到容器时退回全页扫描（老模板兜底）。
 */
const LIST_CONTAINER = /(?:id=["']wp_news_w\d+["']|class=["'][^"']*\bnews_list\b[^"']*["'])/i

const ymd = (s) => {
  const m = String(s || '').match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/)
  return m ? `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}` : null
}

/** 从 URL 里取日期：/2026/0316/ → 2026-03-16 */
const dateFromUrl = (u) => {
  const m = String(u || '').match(/\/(20\d{2})\/(\d{2})(\d{2})\//)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null
}

/**
 * 列表页 → { items: [{url,title,date}], maxPage }
 * @param {string} html 列表页 HTML
 * @param {string} pageUrl 该列表页的**最终** URL（相对链接按它解析）
 */
export function parseSudyList(html, pageUrl) {
  // 只在列表容器内找条目（见 LIST_CONTAINER 注释：避开导航菜单里的文章链接）
  const cm = LIST_CONTAINER.exec(html)
  const seg = cm ? html.slice(cm.index) : html
  const items = []
  const seen = new Set()
  for (const m of seg.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1]
    const href = (attrs.match(/href=["']([^"']+)["']/i) || [])[1]
    if (!href) continue
    const abs = absUrl(pageUrl, href)
    const path = abs.split('?')[0]
    if (!ART_RE.test(path)) continue
    if (seen.has(abs)) continue
    seen.add(abs)
    const attrTitle = (attrs.match(/title=["']([^"']*)["']/i) || [])[1]
    const title = stripTags(attrTitle || m[2]).replace(/\s+/g, ' ').trim()
    if (!title || title.length < 4) continue
    const dt = (attrs.match(/data-time=["']([^"']+)["']/i) || [])[1]
    // 条目自带的日期（<span class="news_meta">2026-09-11</span>，紧跟锚点）比从 URL 推断更权威
    const tail = seg.slice(m.index + m[0].length, m.index + m[0].length + 300)
    const meta = (tail.match(/news_meta["'][^>]*>\s*(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})/) || [])[1]
    items.push({ url: abs, title: title.slice(0, 200), date: ymd(dt) || ymd(meta) || dateFromUrl(abs) })
  }
  // 翻页：找 list2.htm / list3.htm … 取最大页码（找不到就只有一页）。
  // 只认「与本列表页同栏目」的翻页链接，避免同页出现的其它栏目分页把页数撑大。
  const colKey = (String(pageUrl).match(/\/([A-Za-z0-9_]+)\/list(?:\d+)?\.(?:htm|psp|html)/i) || [])[1]
  let maxPage = 1
  let fallback = 1
  for (const m of html.matchAll(/href=["']([^"']*?list(\d+)\.(?:htm|psp|html))["']/gi)) {
    const n = Number(m[2])
    if (!Number.isFinite(n) || n <= fallback) continue
    fallback = n
    if (!colKey || m[1].includes(`/${colKey}/`)) maxPage = Math.max(maxPage, n)
  }
  if (maxPage === 1) maxPage = fallback;
  return { items, maxPage }
}

/** 正文块结束标记（正文之后就是页脚/分享/上下篇） */
const BODY_END = [/<div[^>]*class=["'][^"']*(?:footer|copyright|share|article-foot)/i, /<!--\s*分享/i, /class=["']wp_footer/i, /id=["']wp_footer/i]

/**
 * 苏迪「正文即附件」播放器（2026-09-21 实测浙大环资推免名单）：
 *   <div pdfsrc="/_upload/article/files/…/x.pdf" swsrc="…x.swf" class="wp_pdf_player"
 *        sudyfile-attr="{'title':'环境与资源学院关于公布…名单的通知.pdf'}" sudyplayer="wp_pdf_player"></div>
 * 这种页面**正文位置没有任何 HTML 文字**，浏览器用 pdf.js 把附件渲染在页内 —— 解析器只能拿到空正文。
 * 我们**不抽附件内的文字**（只修「正文未抓取」这句误报），只记录附件名/地址，
 * 让面板如实说明「正文是 PDF 附件」，而不是谎报抓取失败。
 */
const PLAYER_RE = /<div\b[^>]*\bclass=["'][^"']*\bwp_([a-z]+)_player\b[^"']*["'][^>]*>/i
const PLAYER_SRC_ATTRS = ['pdfsrc', 'docsrc', 'filesrc', 'mediasrc', 'src']

/** 从正文片段里找附件播放器 → { kind, name, url }（找不到返回 null） */
function findPlayerAttachment(seg) {
  const m = PLAYER_RE.exec(seg || '')
  if (!m) return null
  const attrs = m[0]
  let src = null
  for (const a of PLAYER_SRC_ATTRS) {
    const v = (attrs.match(new RegExp(`\\b${a}=["']([^"']+)["']`, 'i')) || [])[1]
    if (v) { src = v; break }
  }
  const name = (attrs.match(/sudyfile-attr=["']\{[^"']*?'title'\s*:\s*'([^']*)'/i) || [])[1] || null
  const raw = (m[1] || 'file').toLowerCase()
  return { kind: ['pdf', 'doc', 'video'].includes(raw) ? raw : 'file', name: name || null, url: src || null }
}

/**
 * 详情页 → { title, time, source, body, is_image_only, is_attachment_only, attachment, url }
 * is_attachment_only：正文位置只有附件播放器（当前只见苏迪 wp_pdf_player）、没有一个字
 * @param {string} html 详情页 HTML
 * @param {string} pageUrl 详情页 URL
 */
export function parseSudyArticle(html, pageUrl) {
  // 标题：content_title 里的 h2 最干净（<title> 常带站名/栏目名）
  const h2 = (html.match(/<div[^>]*class=["'][^"']*content_title[^"']*["'][^>]*>[\s\S]{0,400}?<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]
  const rawTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''
  const title = (stripTags(h2 || rawTitle).replace(/\s+/g, ' ').trim() || '').split(/\s+/).pop() || null

  // 时间/编辑：cont_tit 里「时间 ：<span>2026-03-18</span>」
  const time = ymd((html.match(/时间\s*[：:][\s\S]{0,60}?(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})/) || [])[1]) || dateFromUrl(pageUrl)
  // 编辑/来源：`[^<&]` 到实体或标签为止（不然会把 &nbsp; 截成 "&nb" 这种残渣带进来）
  const source = ((html.match(/编辑\s*[：:]\s*(?:<[^>]+>)*\s*([^<&\s][^<&]{0,15})/) || [])[1] || '').trim() || null

  // 正文：wp_articlecontent（老模板退回 content_main / id=content）
  let start = -1
  let open = ''
  for (const re of [/<div[^>]*class=["']wp_articlecontent["'][^>]*>/i, /<div[^>]*class=["'][^"']*content_main[^"']*["'][^>]*>/i, /<div[^>]*id=["']content["'][^>]*>/i]) {
    const m = re.exec(html)
    if (m) {
      start = m.index + m[0].length
      open = m[0]
      break
    }
  }
  let body = ''
  let isImageOnly = false
  let attachment = null
  if (start >= 0) {
    let seg = html.slice(start)
    let end = seg.length
    for (const re of BODY_END) {
      const m = re.exec(seg)
      if (m && m.index > 100) end = Math.min(end, m.index)
    }
    seg = seg.slice(0, end).replace(/<!--[\s\S]*?-->/g, '')
    const hasImg = /<img\b/i.test(seg)
    body = seg
      .split(/<p\b[^>]*>/i) // 必须吃掉整个开标签，否则每段都会残留 class="…"> 文本
      .map((x) => stripTags(x).replace(/[ \t\u00a0]+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n')
      .trim()
    if (!body) {
      // 正文一个字都没有时，看是不是「正文即附件」的播放器页（见 PLAYER_RE 注释）。
      // 附件优先于「纯图」判定：正文区常混着一个 1×1 的埋点 <img src="/_visitcount…">，
      // 老逻辑会把它当成图片海报 —— 实测浙大环资推免名单页正是这种情况。
      const att = findPlayerAttachment(seg)
      if (att) attachment = { ...att, url: att.url ? absUrl(pageUrl, att.url) : null }
      else if (hasImg) isImageOnly = true
    }
  }
  return {
    title,
    time,
    source,
    body,
    is_image_only: isImageOnly,
    is_attachment_only: !!attachment,
    attachment: attachment || null,
    url: pageUrl,
    _open: open ? open.slice(0, 60) : null,
  }
}
