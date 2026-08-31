// tools/email/report.mjs — 每日报告内容生成（读云端 summary/index + 本机关注规则）
// 数据源：GitHub 私有仓库 data/（同面板/MCP），无需本地爬取；报告纯文本。
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const OWNER = 'zhouxuanting52-lab';
const REPO = 'cau-portal';

export function tokenFromEnvOrYml() {
  if (process.env.CAU_GITHUB_TOKEN) return process.env.CAU_GITHUB_TOKEN;
  const home = process.env.USERPROFILE || 'C:\\Users\\1';
  const candidates = [
    join(home, '.dsh', 'profiles', 'web', 'cordis.patch.yml'),
    'C:\\Users\\1\\.dsh\\profiles\\web\\cordis.patch.yml',
  ];
  for (const p of candidates) {
    try {
      const m = readFileSync(p, 'utf8').match(/CAU_GITHUB_TOKEN:\s*(\S+)/);
      if (m && m[1]) return m[1];
    } catch { /* 继续 */ }
  }
  return null;
}

async function fetchJson(path) {
  const tok = tokenFromEnvOrYml();
  const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=main`, {
    headers: {
      Authorization: `Bearer ${tok}`,
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'cau-portal-email',
    },
  });
  if (!r.ok) throw new Error(`读取云端数据失败 (${path}): HTTP ${r.status}`);
  const text = await r.text();
  try { return JSON.parse(text); } catch { throw new Error(`云端 JSON 解析失败 (${path})`); }
}

/** 转北京日期 YYYY-MM-DD（兼容时间戳/ISO/本地时间字符串） */
export function bjDate(v) {
  if (v == null || v === '') return null;
  let d;
  if (typeof v === 'number') d = new Date(v);
  else d = new Date(String(v).replace(/\.[0-9]+Z$/, 'Z'));
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + 8 * 3600e3).toISOString().slice(0, 10);
}

const sha1 = (u) => createHash('sha1').update(String(u || '')).digest('hex');

const todayStr = () => bjDate(Date.now());
const addDays = (s, n) => {
  const d = new Date(s + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const IMP_RANK = { 高: 3, 中: 2, 低: 1, undefined: 0 };

/** 规则命中：与客户端 matchRules 同语义（标题/来源/栏目含关键词；来源含限制；重要度下限） */
function matchRule(item, rule) {
  const kw = String(rule?.keyword || '').trim();
  if (!kw) return false;
  const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || item.site || ''} ${item.column_name || item.column || ''}`;
  if (!hay.includes(kw)) return false;
  const src = String(rule?.source || '').trim();
  if (src && !`${item.source || ''} ${item.site_name || item.site || ''} ${item.column_name || item.column || ''}`.includes(src)) return false;
  const min = rule?.minImportance;
  if (min && (IMP_RANK[item._importance] || 0) < IMP_RANK[min]) return false;
  return true;
}

/**
 * 生成日报文本。
 * @param {object} opts {rules?: array} 关注规则快照（可空）
 * @returns {Promise<{ok:boolean, subject:string, text:string, stats?:object, error?:string}>}
 */
export async function buildDailyReport({ rules = [] } = {}) {
  try {
    const [summary, index] = await Promise.all([
      fetchJson('data/summary.json'),
      fetchJson('data/index.json'),
    ]);
    const today = todayStr();
    const yesterday = addDays(today, -1);
    const weekAgo = addDays(today, -7);
    const in3 = addDays(today, 3);

    const important = Array.isArray(summary.important) ? summary.important : [];
    const deadlines = Array.isArray(summary.deadlines) ? summary.deadlines : [];
    const aiMap = summary.ai_map || {};

    // index.json 是瘦文件（条目在 feed/ 下）：按 sites 枚举全部 feed 聚合
    const sitesArr = Array.isArray(index.sites) ? index.sites : Object.entries(index.sites || {}).map(([id, s]) => ({ id, ...s }));
    const siteName = new Map();
    const colName = new Map();
    const feedPaths = [];
    for (const s of sitesArr) {
      const sid = String(s.id || '');
      if (!sid) continue;
      siteName.set(sid, s.name || sid);
      for (const c of s.columns || []) {
        colName.set(`${sid}__${c.key}`, c.name || c.key);
        feedPaths.push(`data/feed/${sid}__${c.key}.json`);
      }
    }
    const feedRes = await Promise.allSettled(feedPaths.map((p) => fetchJson(p)));
    const items = [];
    const seenUrl = new Set();
    feedRes.forEach((r, i) => {
      if (r.status !== 'fulfilled') return;
      const m = feedPaths[i].match(/feed\/([^_]+)__([^/]+)\.json$/);
      if (!m) return;
      const [, sid, cid] = m;
      const arr = Array.isArray(r.value) ? r.value : (r.value.items || r.value.list || []);
      for (const it of arr) {
        if (!it || !it.url || seenUrl.has(it.url)) continue;
        seenUrl.add(it.url);
        items.push({
          ...it,
          site: sid,
          column: cid,
          site_name: siteName.get(sid) || sid,
          column_name: colName.get(`${sid}__${cid}`) || cid,
        });
      }
    });

    // 注意：important/deadlines 条目带 article_id 与摘要内嵌
    const todayImp = important.filter((x) => bjDate(x.time) === today).sort((a, b) => b._impRank != null || true);
    const yestImp = important.filter((x) => bjDate(x.time) === yesterday);
    // 排个序：高 → 中 → 低（原数组可能已排序，兜底）
    const byRank = (arr) => [...arr].sort((a, b) => (IMP_RANK[b.importance] || 0) - (IMP_RANK[a.importance] || 0));
    // 时间字段兼容：重要条目 time 可能是 ISO 或 'YYYY-MM-DD HH:mm:ss'
    const fmtT = (t) => {
      const d = bjDate(t);
      return d ? d.slice(5).replace('-', '/') : '';
    };

    // ---- ■ 今日高重要 ----
    const secToday = [];
    for (const x of byRank(todayImp).slice(0, 12)) {
      secToday.push(`  ${x.importance === '高' ? '🔴' : '🟠'} ${x.title}${x.summary ? `\n      ${x.summary}` : ''}${x.source ? `（${x.source} · ${fmtT(x.time)}）` : ''}`);
    }

    // ---- ■ 3 天内截止 ----
    const dl = deadlines
      .filter((x) => bjDate(x.date) && bjDate(x.date) >= today && bjDate(x.date) <= in3)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const secDl = dl.map((x) => `  ⏰ ${x.item || x.title}：${x.date}（${x.source || x.column || '校内'}）`);

    // ---- ■ 🎯 命中关注规则（近 7 天条目） ----
    const activeRules = (rules || []).filter((r) => r && r.enabled !== false && r.keyword);
    const secRules = [];
    if (activeRules.length) {
      const recent = items.filter((x) => {
        const d = bjDate(x.date || x.time);
        return d && d >= weekAgo && d <= today;
      });
      const seen = new Set();
      for (const it of recent) {
        const refKey = it.article ? String(it.article).replace(/\.json$/, '') : sha1(it.url);
        const imp = aiMap[refKey] || {};
        const item = { ...it, _importance: imp.importance || null };
        const hit = activeRules.find((r) => matchRule(item, r));
        if (hit) {
          const key = it.url || it.title;
          if (seen.has(key)) continue;
          seen.add(key);
          secRules.push(`  🎯 「${hit.keyword}」 ${item.title}${item.source ? `（${item.source} · ${fmtT(item.date || item.time)}）` : ''}`);
          if (secRules.length >= 10) break;
        }
      }
    }

    // ---- ■ 昨日回顾 ----
    const secYest = byRank(yestImp).slice(0, 5).map((x) => `  📌 ${x.title}${x.summary ? ` — ${x.summary}` : ''}`);

    const lines = [];
    lines.push(`农大门户日报 · ${today}`);
    lines.push('');
    lines.push('■ 今日高重要通知（今日发布，重要度=高/中）');
    if (!secToday.length) lines.push('  今日暂无高重要通知 🎉');
    lines.push(...secToday);
    lines.push('');
    lines.push('■ ⏰ 3 天内截止');
    if (!secDl.length) lines.push('  近 3 天无截止事项');
    lines.push(...secDl);
    lines.push('');
    lines.push('■ 🎯 命中你的关注规则（近 7 天）');
    if (!activeRules.length) lines.push('  （未配置关注规则——可在插件设置页添加关键词，如：推免、选课、奖学金）');
    else if (!secRules.length) lines.push('  近 7 天无规则命中');
    lines.push(...secRules);
    lines.push('');
    lines.push('■ 📌 昨日重要回顾');
    if (!secYest.length) lines.push('  （昨日无重要通知）');
    lines.push(...secYest);
    lines.push('');
    lines.push('──────────');
    lines.push(`数据来自农大门户云端（每 2 小时自动抓取+AI 加工，数据私有）；门户校内通知需登录校园网/SSO 查看原文。`);
    lines.push('在插件「设置 → 每日邮件报告」可关闭、改时间或测试。');

    const text = lines.join('\n');
    const subject = `农大门户日报 · ${today}`;
    return {
      ok: true,
      subject,
      text,
      stats: { today: todayImp.length, dl: dl.length, rules: secRules.length, yest: yestImp.length, total_items: index.stats?.total_items ?? items.length },
    };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

// CLI 调试：node tools/email/report.mjs
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = await buildDailyReport({ rules: JSON.parse(process.env.REPORT_RULES || '[]') });
  console.log(JSON.stringify(out, null, 2).slice(0, 4000));
}
