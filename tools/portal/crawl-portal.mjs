// tools/portal/crawl-portal.mjs — 统一门户「全部通知」爬虫（本机专用，需登录态）
// 用法：
//   node tools/portal/crawl-portal.mjs                    增量默认：最近 30 页 ×100，遇旧条目即停
//   node tools/portal/crawl-portal.mjs --days 365         回填最近一年
//   node tools/portal/crawl-portal.mjs --max-pages 5      只抓前 5 页（快速冒烟）
//   node tools/portal/crawl-portal.mjs --data-dir <path>  指定输出目录（默认工作区 data/）
//
// 护栏（SPEC §8）：只落库列表元数据（title/time/source/url）；接口返回的 PIM_CONTENT 全文一律丢弃。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { ensureSession, sessionFetch } from './engine.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
};
const sha1 = (s) => createHash('sha1').update(s).digest('hex');

/** 列表接口：精确 application/json（无 charset）——金智 filter 只认这个 */
const LIST_URL = '/tp_up/up/pim/allpim/getAllPimList';
const TYPE_URL = '/tp_up/up/pim/allpim/getSelectPimType';
const JSON_H = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://one.cau.edu.cn/tp_up/view?m=up',
};

const decode = (s) =>
  String(s ?? '')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&ldquo;|&ldquo;/g, '「')
    .replace(/&rdquo;/g, '」').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function postJson(path, body) {
  const r = await sessionFetch(path, { method: 'POST', body: JSON.stringify(body), headers: JSON_H });
  if (!r.ok) throw new Error(`HTTP ${r.status} @ ${path}`);
  const t = await r.text();
  try { return JSON.parse(t); } catch { throw new Error(`非 JSON 响应 @ ${path}: ${t.slice(0, 120)}`); }
}

/** 类型字典 CONTENT_TYPE_ID → 名称（可失败，失败则类型显示 ID） */
async function loadTypeMap() {
  try {
    const data = await postJson(TYPE_URL, { two: 'yes' });
    const m = new Map();
    (Array.isArray(data) ? data : data?.list ?? []).forEach((x) => {
      if (x && (x.CODEVALUE || x.code)) m.set(String(x.CODEVALUE || x.code), x.CODENAME || x.name || x.text || '');
    });
    return m;
  } catch { return new Map(); }
}

const detailUrl = (rid) => `https://one.cau.edu.cn/tp_up/view?m=up#act=up/pim/showpim&id=${rid}`;

/** 单次抓取：返回 {items:[{url,title,date,source,type,rid,created_ms}], total, pages} */
export async function fetchAllPim({ pageSize = 100, maxPages = Infinity, sinceMs = 0, overlapRids = new Set(), onPage = null } = {}) {
  const typeMap = await loadTypeMap();
  const out = [];
  let total = 0;
  for (let p = 1; p <= maxPages; p++) {
    const data = await postJson(LIST_URL, { two: 'yes', pageNum: p, pageSize });
    const list = Array.isArray(data?.list) ? data.list : [];
    total = Number(data?.total ?? total);
    if (!list.length) break;
    let overlap = false;
    for (const it of list) {
      const rid = String(it.RESOURCE_ID ?? '');
      if (!rid) continue;
      if (overlapRids.has(rid)) { overlap = true; continue; }
      const ms = Number(it.CREATE_TIME || 0);
      if (sinceMs && ms && ms < sinceMs) { overlap = true; break; }
      out.push({
        url: detailUrl(rid),
        title: decode(it.PIM_TITLE) || '(无标题)',
        date: ms ? new Date(ms).toISOString().slice(0, 10) : '',
        time: ms ? new Date(ms).toISOString() : '',
        source: decode(it.CREATE_USER_UNIT_NAME) || decode(it.BELONG_UNIT_ID) || '',
        type: decode(it.TYPE_NAME) || typeMap.get(String(it.CONTENT_TYPE_ID ?? '')) || '',
        rid,
      });
    }
    if (onPage) onPage(p, list.length, total);
    if (overlap) break; // 已到历史窗口（或遇已入库条目）→ 停止
  }
  return { items: out, total, pages: Math.ceil(total / pageSize) };
}

/** 主入口：抓取 → 合并 feed → 写文章文件（仅元数据） */
export async function runPortalCrawl({ dataDir = null, days = null, maxPages = null } = {}) {
  const dataRoot = dataDir || join(ROOT, 'data');
  const feedPath = join(dataRoot, 'feed', 'portal__notices.json');
  mkdirSync(join(dataRoot, 'feed'), { recursive: true });
  mkdirSync(join(dataRoot, 'articles'), { recursive: true });

  // 会话（过期自动重登）
  const ens = await ensureSession();
  if (!ens.ok) return { ok: false, error: ens.message };

  // 历史条目（用于重叠停抓 + 合并）
  let prev = [];
  try {
    if (existsSync(feedPath)) prev = JSON.parse(readFileSync(feedPath, 'utf8')).items || [];
  } catch { prev = []; }
  const prevRids = new Set(prev.map((x) => (x.url.match(/id=(\d+)/) || [])[1] ?? ''));
  const theDays = days != null ? Number(days) : 60;
  const sinceMs = theDays > 0 ? Date.now() - theDays * 86400000 : 0;
  const mp = maxPages != null ? Number(maxPages) : 80;

  const { items, total } = await fetchAllPim({ pageSize: 100, maxPages: mp, sinceMs, overlapRids: prevRids });

  const runTs = new Date().toISOString();

  // 无新增：仍执行 article 引用修复（历史 feed 可能缺 article 字段 → enrich/summary 关联不上）
  if (!items.length) {
    let changed = false;
    const fixed = prev.map((p) => {
      const artFile = `${sha1(p.url)}.json`;
      const target = existsSync(join(dataRoot, 'articles', artFile)) ? artFile : (p.article ?? null);
      if ((target || null) !== (p.article || null)) changed = true;
      return { ...p, article: target };
    });
    if (changed) {
      writeFileSync(feedPath, JSON.stringify({
        site: 'portal', site_name: '统一门户', column_key: 'notices', column_name: '校内通知',
        fetched_at: runTs, total_record: total, items: fixed,
      }, null, 2));
      return { ok: true, total, new: 0, new_articles: 0, feed_items: fixed.length, repaired_article_refs: true };
    }
    return { ok: true, total, new: 0, error: null, note: '无新增条目（可能全部已在库）' };
  }

  // ① 先写文章文件（仅元数据：PIM_CONTENT 一律不落，标题级 AI 由云端 enrich 处理）
  let artNew = 0;
  const newArticleFiles = [];
  for (const it of items) {
    const artFile = `${sha1(it.url)}.json`;
    const artPath = join(dataRoot, 'articles', artFile);
    if (existsSync(artPath)) continue;
    writeFileSync(artPath, JSON.stringify({
      title: it.title,
      time: it.time,
      url: it.url,
      source: it.source || '统一门户',
      column: '校内通知',
      body: '', // 护栏：不抓正文
      fetched_at: runTs,
      ai: null,
    }, null, 2));
    artNew++;
    newArticleFiles.push(`data/articles/${artFile}`);
  }

  // ② 合并（按 url；保留历史条目）；article 字段回填：正文文件存在即指向（供 enrich/summary 关联）
  const byUrl = new Map(prev.map((x) => [x.url, x]));
  let newCount = 0;
  for (const it of items) {
    const p = byUrl.get(it.url);
    if (!p) newCount++;
    const artFile = `${sha1(it.url)}.json`;
    byUrl.set(it.url, {
      url: it.url,
      title: p?.title ?? it.title,
      date: p?.date ?? it.date,
      first_seen: p?.first_seen ?? runTs,
      source: p?.source ?? it.source,
      type: p?.type ?? it.type,
      article: existsSync(join(dataRoot, 'articles', artFile)) ? artFile : (p?.article ?? null),
    });
  }
  const merged = [...byUrl.values()].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const feed = {
    site: 'portal',
    site_name: '统一门户',
    column_key: 'notices',
    column_name: '校内通知',
    fetched_at: runTs,
    total_record: total,
    items: merged,
  };
  writeFileSync(feedPath, JSON.stringify(feed, null, 2));

  return { ok: true, total, pages_fetched: 0, new: newCount, new_articles: artNew, feed_items: merged.length, new_article_files: newArticleFiles, first: items[0], last: items[items.length - 1] };
}

// CLI
if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const days = arg('days', null);
  const maxPages = arg('max-pages', null);
  const dataDir = arg('data-dir', null) || null;
  console.log('[portal-crawl] 开始（' + (days ? `回填 ${days} 天` : '增量') + (maxPages ? `，上限 ${maxPages} 页` : '') + '）…');
  const out = await runPortalCrawl({ dataDir, days: days === '0' ? 0 : days, maxPages });
  console.log('[portal-crawl] 结果:', JSON.stringify(out, null, 2).slice(0, 800));
  process.exit(out.ok ? 0 : 1);
}
