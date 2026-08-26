// 博达 CMS 列表解析：静态首页（参数 + 条目 + 内嵌 datastore）与 dataproxy.jsp XML 分页
// 条目统一按「任意含 /art/ 链接的 <a>」解析，兼容已见三种格式：
//  A（土地学院·通知公告）：<a href title>…<div class="bt_date">YYYY-MM-DD</div></a>
//  B（本科生院）：<a href>标题</a><span>YYYY-MM-DD</span>
//  C（土地学院·学术报告）：<a title href><span class="notop">16</span><span class="nobtm">07月</span>…</a>
export function parseItemsFromHtml(html) {
  const seen = new Set();
  const items = [];
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1];
    const href = (attrs.match(/href="([^"]+)"/) || [])[1];
    if (!href || !href.includes('/art/')) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    const titleAttr = (attrs.match(/title="([^"]*)"/) || [])[1]?.trim();
    const innerText = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const title = titleAttr || innerText.slice(0, 120) || null;
    // 日期：块内 YYYY-MM-DD → URL 路径 /art/YYYY/M/D/ → 无
    let date = (m[0].match(/\d{4}-\d{2}-\d{2}/) || [])[0] || null;
    if (!date) {
      const ud = href.match(/\/art\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
      if (ud) date = `${ud[1]}-${ud[2].padStart(2, '0')}-${ud[3].padStart(2, '0')}`;
    }
    items.push({ url: href, title, date });
  }
  return items;
}

/** 栏目首页：提取 dataproxy 分页参数 + 首页条目 + 内嵌 datastore（如有） */
export function parseListPage(html) {
  // [?&] 边界：避免误匹配 modalunitid=xxx 之类的兄弟参数
  const unitid = (html.match(/[?&]unitid=(\d+)/) || [])[1] || null;
  const webid = (html.match(/[?&]webid=(\d+)/) || [])[1] || null;
  const inline = html.match(/<datastore>([\s\S]*?)<\/datastore>/)?.[1] || null;
  return {
    unitid,
    webid,
    items: parseItemsFromHtml(html),
    inlineXml: inline ? `<datastore>${inline}</datastore>` : null,
  };
}

/** dataproxy.jsp XML：totalrecord/totalpage + 记录集（record 内是 CDATA 包裹的 <li>） */
export function parseDataproxy(xml) {
  const totalRecord = +(xml.match(/<totalrecord>(\d+)<\/totalrecord>/) || [])[1] || 0;
  const totalPage = +(xml.match(/<totalpage>(\d+)<\/totalpage>/) || [])[1] || 0;
  const items = [];
  for (const m of xml.matchAll(/<record><!\[CDATA\[([\s\S]*?)\]\]><\/record>/g)) {
    items.push(...parseItemsFromHtml(m[1]));
  }
  return { totalRecord, totalPage, items };
}
