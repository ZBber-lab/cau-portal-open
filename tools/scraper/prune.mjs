#!/usr/bin/env node
// 数据裁剪/删除（双模式，不再自动按时间窗删除——保留期由用户在面板「数据管理」中决定）：
//
// 模式 A（默认，request 模式）：读取 data/prune-request.json 中用户勾选的删除清单，
//   按条目删除 article 文件 + feed 条目（无条件，用户命令优先）；执行后清空清单。
//   清单条目可以是 article 文件名（xxxx.json）或条目 URL（相对路径/绝对 URL）。
//
// 模式 B（window 模式，仅手动/将来用）：--older-than <days> 按时间窗删除，
//   豁免：近 N 天内容 + 未过期 deadline 的文章及其条目；未知日期保守保留。
//   （已不再被 crawl.mjs 自动调用；保留实现用于未来可选策略。）
//
// 用法：
//   node tools/scraper/prune.mjs --data-dir data            # 模式 A（执行请求清单）
//   node tools/scraper/prune.mjs --data-dir data --older-than 60 --dry-run   # 模式 B 预览
import { readdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
};

/** URL 归一化为 /path 形式（与 crawl.mjs 同规则） */
const pathForm = (u) => {
  let s = String(u ?? '');
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) {
    try { s = new URL(s).pathname; } catch { /* 保持原样 */ }
  }
  if (!s.startsWith('/')) s = '/' + s;
  return s;
};

const parseTs = (v) => {
  const t = Date.parse(String(v ?? ''));
  return Number.isFinite(t) ? t : null;
};

const normId = (x) => String(x ?? '').trim();

/**
 * pruneData 主入口。
 * @param {string} dataDir
 * @param {object} opts
 *   - `mode`: 'request'（默认，执行 prune-request.json 清单）| 'window'（时间窗）| 'ids'
 *   - `ids`: mode='ids' 时的字符串数组（article 文件名或 URL）
 *   - `olderThan`: mode='window' 时的天数
 *   - `dryRun`: 只统计不写盘
 * @returns {object} 统计
 */
export function pruneData(dataDir, { mode = 'request', ids = [], olderThan = 60, dryRun = false } = {}) {
  const feedsDir = `${dataDir}/feed`;
  const artsDir = `${dataDir}/articles`;
  const requestPath = `${dataDir}/prune-request.json`;

  // ---- 决定删除集合 ----
  const artIds = new Set(); // article 文件名（含 .json）
  const urls = new Set(); // 归一化 URL（相对路径）
  let fromRequest = 0;

  if (mode === 'request') {
    let req = null;
    try {
      const raw = readFileSync(requestPath, 'utf8');
      req = JSON.parse(raw);
    } catch { /* 无清单 → 删除集为空 */ }
    for (const x of req?.ids ?? []) {
      const v = normId(x);
      if (!v) continue;
      fromRequest++;
      if (/\.json$/i.test(v) && !v.includes('/')) artIds.add(v);
      else urls.add(pathForm(v));
    }
  } else if (mode === 'ids') {
    for (const x of ids) {
      const v = normId(x);
      if (!v) continue;
      if (/\.json$/i.test(v) && !v.includes('/')) artIds.add(v);
      else urls.add(pathForm(v));
    }
  } else {
    // mode === 'window'：按时间窗 + deadline 豁免
    const now = Date.now();
    const cutoffMs = now - olderThan * 86400000;
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayMs = dayStart.getTime();

    // feed url → {date, first_seen, article} 索引
    const feedFiles = existsSync(feedsDir) ? readdirSync(feedsDir).filter((f) => f.endsWith('.json')) : [];
    const byUrl = new Map();
    for (const f of feedFiles) {
      let j;
      try { j = JSON.parse(readFileSync(`${feedsDir}/${f}`, 'utf8')); } catch { continue; }
      for (const it of j.items ?? []) if (it?.url) byUrl.set(pathForm(it.url), it);
    }
    if (existsSync(artsDir)) {
      for (const f of readdirSync(artsDir)) {
        if (!f.endsWith('.json')) continue;
        let a;
        try { a = JSON.parse(readFileSync(`${artsDir}/${f}`, 'utf8')); } catch { artIds.add(f); continue; }
        const dl = a?.ai?.deadline?.date;
        if (dl && parseTs(dl) !== null && parseTs(dl) >= todayMs) continue; // deadline 豁免
        let ts = parseTs(a?.time);
        const it = byUrl.get(pathForm(a?.url));
        if (ts === null && it?.date) ts = parseTs(it.date);
        if (ts === null && it?.first_seen) ts = parseTs(it.first_seen);
        if (ts === null || ts >= cutoffMs) continue; // 未知日期保守保留 / 窗口内保留
        artIds.add(f);
      }
    }
    // feed 条目：文章待删 → 删条目；否则按条目日期/first_seen 判定
    for (const f of feedFiles) {
      let j;
      try { j = JSON.parse(readFileSync(`${feedsDir}/${f}`, 'utf8')); } catch { continue; }
      for (const it of j.items ?? []) {
        if (!it?.url) continue;
        if (it.article && artIds.has(it.article)) { urls.add(pathForm(it.url)); continue; }
        let ts = parseTs(it?.date);
        if (ts === null) ts = parseTs(it?.first_seen);
        if (ts !== null && ts < cutoffMs) urls.add(pathForm(it.url));
      }
    }
  }

  // ---- 执行删除 ----
  let articlesRemoved = 0;
  let itemsRemoved = 0;
  if (!dryRun) {
    if (artsDir && existsSync(artsDir) && artIds.size) {
      for (const f of artIds) {
        try { rmSync(`${artsDir}/${f}`); articlesRemoved++; } catch { /* 忽略 */ }
      }
    }
  } else if (artsDir && existsSync(artsDir)) {
    for (const f of artIds) if (existsSync(`${artsDir}/${f}`)) articlesRemoved++;
  }

  if (existsSync(feedsDir)) {
    for (const f of readdirSync(feedsDir)) {
      if (!f.endsWith('.json')) continue;
      let j;
      try { j = JSON.parse(readFileSync(`${feedsDir}/${f}`, 'utf8')); } catch { continue; }
      const before = (j.items ?? []).length;
      j.items = (j.items ?? []).filter((it) => {
        const p = pathForm(it?.url);
        if (!p) return true;
        if (urls.has(p)) { itemsRemoved++; return false; }
        if (it?.article && artIds.has(it.article)) { itemsRemoved++; return false; }
        return true;
      });
      if (!dryRun && j.items.length !== before) writeFileSync(`${feedsDir}/${f}`, JSON.stringify(j, null, 2));
    }
  }

  // 执行后清空请求清单（仅模式 A 非 dry-run）
  if (!dryRun && mode === 'request' && existsSync(requestPath)) {
    writeFileSync(requestPath, JSON.stringify({ version: 1, requested_at: null, ids: [] }, null, 2));
  }

  return {
    mode,
    from_request: fromRequest,
    articles_removed: articlesRemoved,
    items_removed: itemsRemoved,
    dry_run: dryRun,
  };
}

// 直接运行时执行（被 crawl.mjs 导入时不执行）
if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const dataDir = arg('data-dir', `${ROOT}/data`);
  const olderThan = Number(arg('older-than', 0));
  const dryRun = process.argv.includes('--dry-run');
  const mode = olderThan > 0 ? 'window' : 'request';
  const stats = pruneData(dataDir, { mode, olderThan, dryRun });
  console.log(`[prune] ${JSON.stringify(stats)}`);
  if (dryRun) console.log('[prune] dry-run：只统计，未实际删除/写盘');
}
