// 校新闻网（自研 CMS）解析：列表（hash 链接 + day/month/title/summary 结构）与文章（id=articleDiv 容器）
import { stripTags } from './text.mjs';

/** 列表页：/index.htm 与 /indexN.htm 通用 */
export function parseNewsListPage(html) {
  const items = [];
  for (const m of html.matchAll(/<a[^>]+href="([0-9a-f]{20,}\.htm)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const block = m[2];
    const day = (block.match(/class="day[^"]*">\s*([^<]+)/i) || [])[1]?.trim();
    const month = (block.match(/class="month[^"]*">\s*([^<]+)/i) || [])[1]?.trim();
    const title =
      (block.match(/class="title[^"]*">([\s\S]*?)<\/div>/i) || [])[1]
        ?.replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim() || null;
    // "2026.08" + "05" → "2026-08-05"
    const date = month && day ? `${month.replace(/\./g, '-')}-${String(day).padStart(2, '0')}` : null;
    items.push({ url: m[1], title, date });
  }
  return items;
}

/** 按 div 深度平衡截取（正文容器内含嵌套 div 时仍正确） */
function sliceDiv(html, start) {
  const startContent = html.indexOf('>', start) + 1;
  let depth = 0;
  let i = start;
  let endContent = -1;
  while (i < html.length) {
    const open = html.indexOf('<div', i);
    const close = html.indexOf('</div>', i);
    if (open !== -1 && (close === -1 || open < close)) {
      depth++;
      i = open + 4;
    } else if (close !== -1) {
      depth--;
      if (depth === 0) {
        endContent = close;
        break;
      }
      i = close + 6;
    } else break;
  }
  return endContent === -1 ? html.slice(startContent) : html.slice(startContent, endContent);
}

/** 文章页：<title> + 发布时间 meta/年月日 + id=articleDiv 正文 */
export function parseNewsArticle(html, pageUrl) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s+/g, ' ').trim() || null;
  const time =
    (html.match(/name=["'](?:PubDate|pubdate|publishdate|publish_time)["']\s+content=["']([^"']+)/i) || [])[1] ||
    (html.match(/(\d{4}年\d{1,2}月\d{1,2}日)/) || [])[1] ||
    null;
  const ai = html.indexOf('id="articleDiv"');
  let body = '';
  if (ai >= 0) {
    body = sliceDiv(html, ai)
      .split(/<p[^>]*>/i)
      .map((seg) => stripTags(seg).replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n')
      .trim();
  }
  return { title, time, source: '校新闻网', body, url: pageUrl };
}
