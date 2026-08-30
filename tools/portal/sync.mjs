// tools/portal/sync.mjs — 门户同步编排（服务端调用）：抓取 → git 提交 portal 数据文件 → 推送 GitHub
// 原则：只提交 portal 专属文件（feed/portal__notices.json + 新增 portal 文章文件），
//       绝不触碰 Actions 管理的 index.json/summary.json/其他站点文件（冲突面极小）；
//       推送冲突 → pull --rebase → 重试（最多 3 次）。令牌从环境变量或 profile yml 运行时读取，不落盘不打印。
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runPortalCrawl } from './crawl-portal.mjs';

const _dir = dirname(fileURLToPath(import.meta.url));
const REPO = 'https://github.com/zhouxuanting52-lab/cau-portal.git';
const REPO_BRANCH = 'main';

function tokenFromEnvOrYml() {
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

/** 同步工作目录（浅克隆仓库；默认 profile 下，可 CAU_PORTAL_SYNC_DIR 覆盖） */
export function syncDir() {
  return process.env.CAU_PORTAL_SYNC_DIR || join(process.env.USERPROFILE || 'C:\\Users\\1', '.dsh', 'profiles', 'web', 'cau-portal-sync');
}

function git(args, { cwd = null, timeoutMs = 180000 } = {}) {
  const env = { ...process.env };
  const tok = tokenFromEnvOrYml();
  if (tok) {
    env.GIT_CONFIG_COUNT = '1';
    env.GIT_CONFIG_KEY_0 = `url.https://x-access-token:${tok}@github.com/.insteadOf`;
    env.GIT_CONFIG_VALUE_0 = 'https://github.com/';
  }
  try {
    return execFileSync('git', args, { encoding: 'utf8', env, cwd: cwd || undefined, timeout: timeoutMs, windowsHide: true });
  } catch (e) {
    throw new Error(`git ${(args || []).join(' ').slice(0, 60)} 失败: ${String(e?.stderr || e?.message || e).replace(/\s+/g, ' ').slice(0, 300)}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let syncing = false;
export function isSyncing() { return syncing; }

function resSummary(res) {
  return { new_items: res?.new ?? 0, new_articles: res?.new_articles ?? 0, feed_items: res?.feed_items ?? 0, total: res?.total ?? 0 };
}

/** 一次完整同步：抓取 + 提交 portal 专属文件 + 推送（重试 3 次） */
export async function syncPortal() {
  if (syncing) return { ok: false, error: '已有同步在进行中' };
  syncing = true;
  try {
    const dir = syncDir();
    mkdirSync(dir, { recursive: true });
    if (!existsSync(join(dir, '.git'))) {
      git(['clone', '--depth', '1', REPO, dir], { timeoutMs: 300000 });
    } else {
      // 先拉远端（拿 Actions 最新产物；失败不阻塞抓取，push 时再处理）
      try { git(['pull', '--rebase', 'origin', REPO_BRANCH], { cwd: dir }); } catch { /* 留到 push 阶段 */ }
    }

    const res = await runPortalCrawl({ dataDir: join(dir, 'data') });
    if (!res.ok) return { ok: false, error: res.error };

    const feedRel = 'data/feed/portal__notices.json';
    const targets = [feedRel, ...(res.new_article_files || [])];
    git(['add', ...targets], { cwd: dir });
    const st = git(['status', '--short'], { cwd: dir });
    if (!st.trim()) return { ok: false, error: '无变更', ...resSummary(res) };

    const commitMsg = `data: portal sync ${new Date().toISOString().slice(0, 10)} (items ${res.new}, articles ${res.new_articles})`;
    git(['commit', '-m', commitMsg], { cwd: dir });

    // push（冲突 → pull --rebase → 重试）
    let lastErr = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        git(['push', 'origin', `HEAD:${REPO_BRANCH}`], { cwd: dir, timeoutMs: 300000 });
        return { ok: true, pushed: true, ...resSummary(res), last_updated: new Date().toISOString() };
      } catch (e) {
        lastErr = String(e?.message || e);
        try { git(['pull', '--rebase', 'origin', REPO_BRANCH], { cwd: dir, timeoutMs: 300000 }); } catch { /* 下次重试 */ }
        await sleep(1500 * (attempt + 1));
      }
    }
    return { ok: false, error: '推送失败：' + lastErr, ...resSummary(res) };
  } finally {
    syncing = false;
  }
}

/* ---------------- 定时调度（服务端 apply 时启动；6h 一次 + 启动补抓） ---------------- */
const STATE_FILE = join(_dir, 'sync-state.json');
const INTERVAL_MS = 6 * 3600 * 1000;
let timer = null;

function readState() {
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch { return null; }
}
function writeState(s) {
  try { writeFileSync(STATE_FILE, JSON.stringify({ ...s, at: new Date().toISOString() }, null, 2)); } catch { /* 忽略 */ }
}

export async function startPortalScheduler({ onResult = null } = {}) {
  if (timer) return;
  const run = async (why) => {
    try {
      const r = await syncPortal();
      writeState({ ok: r.ok, why });
      if (onResult) try { onResult({ ok: r.ok, why, new_items: r.new_items ?? 0, error: r.error ?? null }); } catch { /* 忽略 */ }
    } catch (e) {
      writeState({ ok: false, why, error: String(e?.message || e) });
    }
  };
  // 启动补抓：距上次成功同步 >6h 才跑（关机期间漏掉的恢复）
  const st = readState();
  if (!st || !st.ok || !st.at || Date.now() - Date.parse(st.at) > INTERVAL_MS) {
    setTimeout(() => void run('startup-catchup'), 30_000); // 启动后 30s 跑，避开服务启动高峰期
  }
  timer = setInterval(() => void run('interval'), INTERVAL_MS);
  if (timer && timer.unref) timer.unref();
}

export function stopPortalScheduler() {
  if (timer) { clearInterval(timer); timer = null; }
}
