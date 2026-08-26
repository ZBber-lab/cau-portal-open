// 博达 CMS 详情页解析 → 干净正文（title/maketime/信息来源/ZJEG_RSS 固定锚点）
import { stripTags } from './text.mjs';

export function parseArticle(html, pageUrl) {
  // 标题：<title> 三段式「站名 栏目名 标题」取末段
  const rawTitle = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const title = rawTitle.replace(/\s+/g, ' ').trim().split(/\s+/).pop() || null;
  // 时间：Maketime meta
  const time = (html.match(/name=['"]Maketime['"]\s+content=['"]([^'"]+)/i) || [])[1] || null;
  // 来源：信息来源标记
  const source =
    (html.match(/信息来源[：:]\s*<!--\s*<\$\[信息来源\]>begin-->\s*([^<]*?)\s*<!--\s*<\$\[信息来源\]>end-->/i) || [])[1]?.trim() || null;
  // 正文：ZJEG_RSS.content 包裹，按 <p> 切分剥标签（含头尾残留清理）
  const BEGIN = '<!--ZJEG_RSS.content.begin-->';
  const END = 'ZJEG_RSS.content.end';
  const bi = html.indexOf(BEGIN);
  const ei = html.indexOf(END);
  let body = '';
  let isImageOnly = false;
  if (bi >= 0 && ei > bi) {
    const raw = html.slice(bi + BEGIN.length, ei).replace(/<!--[\s\S]*?-->/g, '');
    const hasImg = /<img\b/i.test(raw);
    body = raw
      .split(/<p[^>]*>/i)
      .map((seg) => stripTags(seg).replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n')
      .replace(/<!--\s*$/g, '')
      .trim();
    if (!body && hasImg) isImageOnly = true;
  }
  return { title, time, source, body, is_image_only: isImageOnly, url: pageUrl };
}
