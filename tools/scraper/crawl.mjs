#!/usr/bin/env node
// 农大门户 爬虫编排器（阶段0 原型）
// 用法：
//   node tools/scraper/crawl.mjs --site clst --column 31131 --pages 2 --articles 5
//   node tools/scraper/crawl.mjs --site clst                # 全部栏目
// 参数：--site <id> --column <id> --pages <n> --articles <n> --delay <ms> --data-dir <path>
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fetchText, sleep } from './fetch.mjs';
import { parseListPage, parseDataproxy } from './parse-list.mjs';
import { parseArticle } from './parse-article.mjs';
import { parseNewsListPage, parseNewsArticle } from './parse-news.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
};
const sha1 = (s) => createHash('sha1').update(s).digest('hex');
const now = () => new Date().toISOString();

const dataproxyUrl = (base, page, colId, unitid, webid, webname) =>
  `${base}/module/web/jpage/dataproxy.jsp?page=${page}&appid=1&webid=${webid}&path=/&columnid=${colId}&unitid=${unitid}&webname=${encodeURIComponent(webname)}&permissiontype=0`;

/** 读已有 feed 条目（不存在则空） */
const loadPrevItems = (feedPath) => {
  try {
    if (existsSync(feedPath)) return JSON.parse(readFileSync(feedPath, 'utf8')).items || [];
  } catch {}
  return [];
};

/**
 * 增量合并：本次爬到的条目覆盖历史同 URL 条目；爬取窗口之外的历史条目保留（不丢数据）；
 * first_seen 只在条目首次出现时写入，后续运行不再洗掉。
 */
function mergeFeedItems(crawled, prev, runTs) {
  const prevByUrl = new Map(prev.map((x) => [x.url, x]));
  const crawledSet = new Set(crawled.map((x) => x.url));
  const merged = [];
  let newCount = 0;
  for (const it of crawled) {
    const p = prevByUrl.get(it.url);
    if (!p) newCount++;
    merged.push({
      url: it.url,
      title: it.title ?? p?.title ?? null,
      date: it.date ?? p?.date ?? null,
      first_seen: p?.first_seen ?? runTs,
      article: it.article ?? p?.article ?? null,
    });
  }
  for (const p of prev) if (!crawledSet.has(p.url)) merged.push(p);
  merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return { items: merged, newCount };
}

/** 全库聚合索引 data/index.json（面板/MCP 的入口） */
export function writeIndex(dataDir) {
  const feedsDir = `${dataDir}/feed`;
  const sites = new Map();
  let totalItems = 0;
  if (existsSync(feedsDir)) {
    for (const f of readdirSync(feedsDir)) {
      if (!f.endsWith('.json')) continue;
      let j;
      try { j = JSON.parse(readFileSync(`${feedsDir}/${f}`, 'utf8')); } catch { continue; }
      const n = (j.items || []).length;
      totalItems += n;
      const s = sites.get(j.site) ?? { id: j.site, name: j.site_name ?? j.site, columns: [] };
      s.columns.push({
        key: j.column_key,
        name: j.column_name,
        items: n,
        latest_date: (j.items || [])[0]?.date ?? null,
        fetched_at: j.fetched_at ?? null,
      });
      sites.set(j.site, s);
    }
  }
  const artsDir = `${dataDir}/articles`;
  let stored = 0;
  let withAi = 0;
  let imageOnly = 0;
  let upcoming = 0;
  const today = Date.now();
  if (existsSync(artsDir)) {
    for (const f of readdirSync(artsDir)) {
      if (!f.endsWith('.json')) continue;
      let a;
      try { a = JSON.parse(readFileSync(`${artsDir}/${f}`, 'utf8')); } catch { continue; }
      stored++;
      if (a.is_image_only) imageOnly++;
      if (a.ai) {
        withAi++;
        const d = a.ai.deadline?.date;
        if (d && Date.parse(d) >= today) upcoming++;
      }
    }
  }
  const index = {
    version: 1,
    last_updated: new Date().toISOString(),
    stats: {
      total_items: totalItems,
      articles_stored: stored,
      articles_with_ai: withAi,
      upcoming_deadlines: upcoming,
      image_only_articles: imageOnly,
    },
    sites: [...sites.values()].map((s) => ({ ...s, columns: s.columns.sort((a, b) => a.name.localeCompare(b.name)) })),
  };
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(`${dataDir}/index.json`, JSON.stringify(index, null, 2));
}

/** 校新闻网栏目爬取（自研 CMS：index.htm/indexN.htm 翻页 + hash 链接文章） */
async function crawlNewsColumn(site, column, opts) {
  const base = site.baseUrl.replace(/\/+$/, '');
  const out = { site: site.id, column: column.key, items: 0, articles: 0, errors: [], warns: [] };

  // 1) 列表页翻页：index.htm, index1.htm ... index(N-1).htm
  const all = new Map();
  const pages = Math.max(1, Number(opts.pages));
  for (let p = 0; p < pages; p++) {
    const pageUrl = `${base}/${column.path}/${p === 0 ? 'index.htm' : `index${p}.htm`}`;
    if (p > 0) await sleep(opts.delay);
    const r = await fetchText(pageUrl, { referer: `${base}/${column.path}/index.htm` });
    if (!r.ok) {
      if (p === 0) { out.errors.push(`列表页失败: ${r.status ?? r.error}`); return out; }
      out.errors.push(`翻页 ${p} 失败: ${r.status ?? r.error}`);
      break;
    }
    const its = parseNewsListPage(r.text);
    if (its.length === 0 && p > 0) break; // 到末页
    for (const it of its) if (it.url) all.set(it.url, it);
  }
  out.items = all.size;

  // 2) 详情抓取（最新前 N 条，已缓存跳过）
  const items = [...all.values()];
  const articlesDir = `${opts.dataDir}/articles`;
  const feedPath = `${opts.dataDir}/feed/${site.id}__${column.key}.json`;
  mkdirSync(`${opts.dataDir}/feed`, { recursive: true });
  mkdirSync(articlesDir, { recursive: true });
  const prevItems = loadPrevItems(feedPath);
  const prevByUrl = new Map(prevItems.map((x) => [x.url, x]));
  const runTs = now();
  for (const it of items) {
    const hash = sha1(`news:${column.path}:${it.url}`);
    const artFile = `${hash}.json`;
    const artPath = `${articlesDir}/${artFile}`;
    let hasArticle = existsSync(artPath);
    if (!hasArticle && Number(opts.articles) > 0 && out.articles < Number(opts.articles)) {
      await sleep(opts.delay);
      const abs = `${base}/${column.path}/${it.url}`;
      const r = await fetchText(abs, { referer: `${base}/${column.path}/index.htm` });
      if (r.ok) {
        const a = parseNewsArticle(r.text, abs);
        if (!a.title) out.errors.push(`无标题: ${it.url}`);
        else if (!a.body) out.warns.push(`正文为空(站点空文): ${it.url}`);
        writeFileSync(artPath, JSON.stringify({ ...a, fetched_at: now(), ai: null }, null, 2));
        hasArticle = true;
        out.articles++;
      } else {
        out.errors.push(`详情失败: ${it.url} (${r.status ?? r.error})`);
      }
    }
    it.article = hasArticle ? artFile : prevByUrl.get(it.url)?.article ?? null;
  }
  const merged = mergeFeedItems(items, prevItems, runTs);
  out.new_items = merged.newCount;
  const feed = {
    site: site.id,
    site_name: site.name,
    column_key: column.key,
    column_name: column.name,
    column_path: column.path,
    fetched_at: runTs,
    items: merged.items,
  };
  writeFileSync(feedPath, JSON.stringify(feed, null, 2));
  return out;
}

async function crawlColumn(site, column, opts) {
  if (site.cms === 'news-custom') return crawlNewsColumn(site, column, opts);
  const base = site.baseUrl.replace(/\/+$/, '');
  const colUrl = `${base}/col/col${column.id}/index.html`;
  const out = { site: site.id, column: column.key, items: 0, articles: 0, errors: [], warns: [] };

  // 1) 静态首页 → 分页参数
  const first = await fetchText(colUrl, { referer: `${base}/` });
  if (!first.ok) {
    out.errors.push(`列表页失败: ${first.status ?? first.error}`);
    return out;
  }
  const params = parseListPage(first.text);
  if (!params.unitid || !params.webid) {
    out.errors.push('参数提取失败（unitid/webid）');
    return out;
  }

  // 2) 列表汇总：优先页面内嵌 datastore（本科生院式），否则静态条目；再经 dataproxy 翻页
  const all = new Map();
  const add = (its) => { for (const it of its) if (it.url) all.set(it.url, it); };
  let totalRecord = 0;
  let totalPage = 0;
  if (params.inlineXml) {
    const d = parseDataproxy(params.inlineXml);
    totalRecord = d.totalRecord;
    totalPage = d.totalPage;
    add(d.items);
  } else {
    add(params.items);
  }
  if (Number(opts.pages) > 1) {
    const p1 = await fetchText(dataproxyUrl(base, 1, column.id, params.unitid, params.webid, site.name), { referer: colUrl });
    if (p1.ok) {
      const d1 = parseDataproxy(p1.text);
      totalRecord = d1.totalRecord || totalRecord;
      totalPage = d1.totalPage || totalPage;
      add(d1.items);
      const maxPage = Math.min(totalPage || Number(opts.pages), Number(opts.pages));
      for (let p = 2; p <= maxPage; p++) {
        await sleep(opts.delay);
        const r = await fetchText(dataproxyUrl(base, p, column.id, params.unitid, params.webid, site.name), { referer: colUrl });
        if (r.ok) add(parseDataproxy(r.text).items);
        else out.errors.push(`分页 ${p}/${maxPage} 失败: ${r.status ?? r.error}`);
      }
    } else if (!params.inlineXml) {
      out.errors.push(`dataproxy 首页失败(${p1.status ?? p1.error})，退回静态首页 ${params.items.length} 条`);
    }
  }
  out.items = all.size;

  // 3) 详情抓取（最新前 N 条，已缓存跳过）+ 增量合并
  const items = [...all.values()];
  const articlesDir = `${opts.dataDir}/articles`;
  const feedPath = `${opts.dataDir}/feed/${site.id}__${column.key}.json`;
  mkdirSync(`${opts.dataDir}/feed`, { recursive: true });
  mkdirSync(articlesDir, { recursive: true });
  const prevItems = loadPrevItems(feedPath);
  const prevByUrl = new Map(prevItems.map((x) => [x.url, x]));
  const runTs = now();
  for (const it of items) {
    const hash = sha1(it.url);
    const artFile = `${hash}.json`;
    const artPath = `${articlesDir}/${artFile}`;
    let hasArticle = existsSync(artPath);
    if (!hasArticle && Number(opts.articles) > 0 && out.articles < Number(opts.articles)) {
      await sleep(opts.delay);
      const abs = it.url.startsWith('http') ? it.url : `${base}${it.url}`;
      const r = await fetchText(abs, { referer: colUrl });
      if (r.ok) {
        const a = parseArticle(r.text, abs);
        if (!a.title) out.errors.push(`无标题: ${it.url}`);
        else if (!a.body) out.warns.push(`正文为空${a.is_image_only ? '(图片海报)' : '(站点空文)'}: ${it.url}`);
        writeFileSync(artPath, JSON.stringify({ ...a, fetched_at: now(), ai: null }, null, 2));
        hasArticle = true;
        out.articles++;
      } else {
        out.errors.push(`详情失败: ${it.url} (${r.status ?? r.error})`);
      }
    }
    it.article = hasArticle ? artFile : prevByUrl.get(it.url)?.article ?? null;
  }
  const merged = mergeFeedItems(items, prevItems, runTs);
  out.new_items = merged.newCount;
  const feed = {
    site: site.id,
    site_name: site.name,
    column_id: column.id,
    column_key: column.key,
    column_name: column.name,
    fetched_at: runTs,
    total_record: totalRecord,
    total_page: totalPage,
    items: merged.items,
  };
  writeFileSync(feedPath, JSON.stringify(feed, null, 2));
  return out;
}

async function main() {
  const cfg = JSON.parse(readFileSync(`${ROOT}/sites.json`, 'utf-8'));
  const opts = {
    pages: Number(arg('pages', 1)),
    articles: Number(arg('articles', 0)),
    delay: Number(arg('delay', 600)),
    dataDir: arg('data-dir', `${ROOT}/data`),
  };
  const siteArg = arg('site', null);
  const colArg = arg('column', null);
  const sites = cfg.sites.filter((s) => !siteArg || s.id === siteArg);
  for (const site of sites) {
    if (!site.columns.length) {
      console.log(`[skip ] ${site.id} ${site.name}：未配置栏目${site.note ? `（${site.note}）` : ''}`);
      continue;
    }
    const cols = colArg
      ? site.columns.filter((c) => String(c.id) === String(colArg) || String(c.key) === String(colArg))
      : site.columns;
    for (const col of cols) {
      console.log(`[crawl] ${site.id} → ${col.name}(${col.id ?? col.key})`);
      const r = await crawlColumn(site, col, opts);
      console.log(`[done ] 条目 ${r.items}（新 ${r.new_items ?? r.items}）| 详情 ${r.articles} | 错误 ${r.errors.length} | 警告 ${r.warns.length}`);
      for (const e of r.errors.slice(0, 5)) console.log(`        ! ${e}`);
      for (const w of r.warns.slice(0, 3)) console.log(`        ~ ${w}`);
    }
  }
  writeIndex(opts.dataDir);
  console.log(`[out  ] ${opts.dataDir}（index.json 已刷新）`);
}

// 直接运行时才执行 main（被 enrich.mjs 等导入时不执行）
if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main();
