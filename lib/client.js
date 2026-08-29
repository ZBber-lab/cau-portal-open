window.__ModuleLoader__.load({ id: 'cau-portal', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
exports.apply = apply;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 客户端（阶段4 第4步：弹层面板）。
 * 侧边栏底部「农大门户」按钮：点击开关弹层面板（panel.tsx）；
 * 按钮规格（定稿）：42px 行高 / 36px 圆钮，宽栏显示名称，收起态悬停 Tooltip；
 * 未读计数：宽栏行尾 tertiary 计数（无红点），收起态并入 Tooltip；
 * 配色全用 DSH --dsw-* 语义 token（带回退值），校徽 currentColor 跟随主题。
 * 后续步骤在本文件扩展：上下文附加条（第6步）。
 */
const react_1 = require("react");
var panel_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PANEL_CSS = void 0;
exports.fetchUnreadCount = fetchUnreadCount;
exports.CauPanel = CauPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 面板（阶段4 第4步 批②/③：全套浏览）。
 * 圆角毛玻璃卡片浮层（右缘留边距、垂直居中 540px/74vh）+ 导航栈：
 * L0 首页（panel-home）→ L1 栏目页（panel-column，站点/栏目）→ L2 文章阅读（panel-article）+ 归档/关注 视图。
 * 头部有「固定」开关（固定后点外部/Esc 不关闭，仅 ✕ 关）。
 * 未读口径：AI 重要（高/中）+近 7 天；打开即读（计数即时减一）；tertiary 计数无红点。
 */
const react_1 = require("react");
var panel_home_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeView = HomeView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal L0：首页聚合（阶段4 第4步 批②/③）。
 * 待办截止卡（能手动 留存/归档；点击→原文；「归档 n」入口回溯）+ 要闻（AI 重要，上限10、可加入关注）+
 * 关注栏（无上限）+ 栏目频道（可点进学院/栏目专栏，列出全部推文）+ 快捷入口。
 * 数据：index.json + summary.json（缓存由调用方/本组件直接读云端，量小）。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.backfillFollowCaches = backfillFollowCaches;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const GH_REPO = 'zhouxuanting52-lab/cau-portal';
const GH_BRANCH = 'main';
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        throw new Error('未配置 GitHub 只读令牌');
    try {
        return await ghFetchText(rel, t);
    }
    catch {
        return serverProxyText(rel, t);
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
async function backfillFollowCaches(token) {
    const follow = loadFollow();
    const cache = loadFollowCacheAll();
    let got = 0;
    for (const f of follow) {
        if (!f?.id || (cache[f.id] && cache[f.id].article))
            continue;
        const art = await readCloudJson(`data/articles/${f.id}.json`, token);
        if (art) {
            cache[f.id] = { cached_at: Date.now(), article: art };
            got++;
        }
        // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
    }
    if (got)
        saveFollowCacheAll(cache);
    return got;
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' });
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}

return module.exports; })();
function fmtCn(iso) {
    if (!iso)
        return '';
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(iso);
    return m ? `${+m[2]}月${+m[3]}日` : '';
}
function daysLeft(date) {
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
function ImpBadge({ level }) {
    const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow';
    return (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_badge ${cls}`, children: level || '低' });
}
function HomeView(props) {
    const { onOpenColumn, onOpenArticle, onViewArchive, onViewFollow } = props;
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [indexJson, setIndexJson] = (0, react_1.useState)(null);
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [readSet, setReadSet] = (0, react_1.useState)(() => (0, data_1.loadReadSet)());
    const [follow, setFollow] = (0, react_1.useState)(() => (0, data_1.loadFollow)());
    const [ops, setOps] = (0, react_1.useState)(() => (0, data_1.loadDeadlineOps)());
    const [needToken, setNeedToken] = (0, react_1.useState)(false);
    const mods = (0, react_1.useMemo)(() => (0, data_1.loadModules)(), []);
    const errAlerts = (0, react_1.useMemo)(() => (0, data_1.computeAlerts)().filter((a) => a.level === 'error'), [mods]);
    const load = async () => {
        setPhase('loading');
        const [idx, sum] = await Promise.all([(0, data_1.readCloudJson)('data/index.json'), (0, data_1.readCloudJson)('data/summary.json')]);
        if (!idx && !sum) {
            setNeedToken(true);
            setPhase('maybe-token');
            return;
        }
        setIndexJson(idx);
        setSummary(sum);
        setPhase('ready');
    };
    (0, react_1.useEffect)(() => {
        void load();
    }, []);
    const important = (0, react_1.useMemo)(() => (summary?.important || []).filter((it) => !(0, data_1.isPruned)(it.article_id || it.url)).slice(0, 10), [summary]);
    const deadlines = (0, react_1.useMemo)(() => {
        const all = (summary?.deadlines || [])
            .map((d) => ({ d, n: daysLeft(d.date) }))
            .filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n <= 7);
        const notArchived = all.filter((x) => !(0, data_1.isPruned)(x.d.article_id || x.d.url) && ops[x.d.article_id || x.d.url] !== 'archive');
        const pinned = notArchived.filter((x) => ops[x.d.article_id || x.d.url] === 'pin');
        const rest = notArchived.filter((x) => ops[x.d.article_id || x.d.url] !== 'pin');
        return [...pinned, ...rest].slice(0, 8);
    }, [summary, ops]);
    const archiveCount = (0, react_1.useMemo)(() => (summary?.deadlines || []).filter((d) => ops[d.article_id || d.url] === 'archive').length, [summary, ops]);
    const openArt = (id, title, sibs, index) => {
        if (id && /^[0-9a-f]{40}$/.test(id.replace(/\.json$/, '')))
            onOpenArticle(id, sibs, index);
    };
    const toggleFollow = (it) => {
        const cur = (0, data_1.loadFollow)();
        const idx = cur.findIndex((x) => x.id === it.id);
        let next;
        if (idx >= 0)
            next = cur.filter((x) => x.id !== it.id);
        else
            next = [{ id: it.id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary }, ...cur];
        (0, data_1.saveFollow)(next);
        setFollow(next);
    };
    const allImportantIds = (0, react_1.useMemo)(() => important.map((it) => it.article_id || it.url), [important]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u4E2D\u2026" })] })), phase === 'maybe-token' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: "\u9700\u8981 GitHub \u53EA\u8BFB\u4EE4\u724C\u624D\u80FD\u8BFB\u53D6\u4E91\u7AEF\u6570\u636E\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn dsh-cau_msgBtnPrimary", onClick: () => void load(), children: "\u53BB\u914D\u7F6E" })] })), phase === 'error' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: "\u4E91\u7AEF\u8BFB\u53D6\u5931\u8D25\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn", onClick: () => void load(), children: "\u91CD\u8BD5" })] })), phase === 'ready' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!summary && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_hint", children: "\u805A\u5408\u6570\u636E\u751F\u6210\u4E2D\u2026\u680F\u76EE\u4E0E\u5FEB\u6377\u5165\u53E3\u4ECD\u53EF\u7528\u3002" }), (summary?.summaryReason === 'missing' || summary?.summaryReason === 'error') && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_hint", children: "\u2B50 \u5F85\u529E\u4E0E\u8981\u95FB\u805A\u5408\u6682\u4E0D\u53EF\u7528\uFF08\u4E91\u7AEF summary.json \u672A\u5C31\u7EEA\uFF09\uFF0C\u5176\u4F59\u529F\u80FD\u6B63\u5E38\u3002" })), errAlerts.map((a, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_hint dsh-cau_hintErr", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_alertDot" }), a.text] }, i))), mods.deadline && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secTitle", children: "\u23F0 \u5F85\u529E\u622A\u6B62" }), archiveCount > 0 && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: onViewArchive, children: ["\u5F52\u6863 ", archiveCount] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [!summary && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u805A\u5408\u6570\u636E\u6682\u4E0D\u53EF\u7528" }), summary && deadlines.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u672A\u6765 7 \u5929\u6682\u65E0\u622A\u6B62\u4E8B\u9879" }), deadlines.map(({ d, n }) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlRow", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlTop", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlItem", children: d.item || '截止事项' }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_dlDate", children: [fmtCn(d.date), " \u00B7 ", n === 0 ? '今天' : `剩 ${n} 天`] }), d.column && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlCol", children: d.column })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlTitleWrap", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlTitle", title: d.title, onClick: () => openArt(d.article_id || d.url, d.title, [], 0), children: d.title }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_dlAct", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_textBtn' + (ops[d.article_id || d.url] === 'pin' ? ' dsh-cau_on' : ''), onClick: () => setOps((0, data_1.setDeadlineOp)(d.article_id || d.url, ops[d.article_id || d.url] === 'pin' ? null : 'pin')), children: "\u7559\u5B58" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_textBtn' + (ops[d.article_id || d.url] === 'archive' ? ' dsh-cau_on' : ''), onClick: () => setOps((0, data_1.setDeadlineOp)(d.article_id || d.url, ops[d.article_id || d.url] === 'archive' ? null : 'archive')), children: "\u5F52\u6863" })] })] })] }, d.article_id || d.url)))] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secTitle", children: "\u2726 \u8981\u95FB" }), important.length > 0 && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_textBtn", onClick: () => setReadSet((0, data_1.markAllRead)(allImportantIds)), children: "\u5168\u90E8\u5DF2\u8BFB" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [!summary && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u805A\u5408\u6570\u636E\u6682\u4E0D\u53EF\u7528" }), summary && important.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u6682\u65E0\u91CD\u8981\u901A\u77E5" }), important.map((it, i) => {
                                        const id = it.article_id || it.url;
                                        const read = readSet.includes(id);
                                        const sibs = important.map((x) => ({ id: x.article_id || x.url, title: x.title }));
                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_impRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impDot", "data-read": read ? '1' : '0' }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_impMain", onClick: () => openArt(id, it.title, sibs, i), children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_impTop", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impTitle", children: it.title }), (0, jsx_runtime_1.jsx)(ImpBadge, { level: it.importance })] }), it.summary && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impSummary", children: it.summary }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impMeta", children: [it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ') })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_followBtn' + (follow.some((x) => x.id === id) ? ' dsh-cau_on' : ''), title: follow.some((x) => x.id === id) ? '取消关注' : '加入关注', onClick: () => toggleFollow({ id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary }), children: follow.some((x) => x.id === id) ? '⭐' : '☆' })] }, id));
                                    })] })] }), mods.deadline && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secTitle", children: "\u2B50 \u5173\u6CE8" }), follow.length > 0 && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: onViewFollow, children: ["\u67E5\u770B\u5168\u90E8 ", follow.length] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [follow.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u5728\u6587\u7AE0\u91CC\u70B9\u300C\u52A0\u5165\u5173\u6CE8\u300D\uFF0C\u91CD\u8981\u5185\u5BB9\u96C6\u4E2D\u5728\u8FD9\uFF0C\u4E0D\u8BBE\u4E0A\u9650" }), follow.slice(0, 5).map((it) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_row", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowDot", "data-read": "0" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowMain", onClick: () => onOpenArticle(it.id, follow.map((x) => ({ id: x.id, title: x.title })), 0), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowTitle", children: it.title }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowMeta", children: [it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ') })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_followBtn dsh-cau_on", title: "\u53D6\u6D88\u5173\u6CE8", onClick: () => toggleFollow(it), children: "\u2B50" })] }, it.id)))] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secTitle", children: "\uD83D\uDCDA \u680F\u76EE\u9891\u9053" })] }), (indexJson?.sites || []).map((site) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_colGroup", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_colSiteBtn", onClick: () => onOpenColumn(site.id, null), children: [site.name, " \u203A"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_colChips", children: (site.columns || []).map((c) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_chip dsh-cau_chipBtn", onClick: () => onOpenColumn(site.id, c.key), children: [c.name, typeof c.items === 'number' && (0, jsx_runtime_1.jsx)("em", { className: "dsh-cau_chipCount", children: c.items })] }, c.key))) })] }, site.id)))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secTitle", children: "\uD83D\uDD17 \u5FEB\u6377\u5165\u53E3" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_quick", children: [(0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_quickLink", href: "https://one.cau.edu.cn", target: "_blank", rel: "noreferrer", children: "\u7EDF\u4E00\u95E8\u6237 \u2197" }), (0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_quickLink", href: "https://clst.cau.edu.cn", target: "_blank", rel: "noreferrer", children: "\u5B66\u9662\u5B98\u7F51 \u2197" }), (0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_quickLink", href: "https://jwc.cau.edu.cn", target: "_blank", rel: "noreferrer", children: "\u6559\u52A1\u5904 \u2197" }), (0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_quickLink", href: "https://news.cau.edu.cn", target: "_blank", rel: "noreferrer", children: "\u6821\u65B0\u95FB\u7F51 \u2197" })] })] })] }))] }));
}

return module.exports; })();
var panel_column_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnView = ColumnView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal L1：栏目页（阶段4 第4步 批②/③）。
 * site 视图=该学院全部栏目合并；column 视图=单栏。行=标题+AI 摘要+重要度徽章+未读点+栏目，
 * 顶部主题标签（讲座/竞赛/评奖/选课/学术等，来自 ai.category）跨站聚合筛选；点行进 L2。
 * 数据：index.json（站点/栏目目录）+ summary.json（ai_map 徽章与筛选）+ feed/<site>__<col>.json。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.backfillFollowCaches = backfillFollowCaches;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const GH_REPO = 'zhouxuanting52-lab/cau-portal';
const GH_BRANCH = 'main';
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        throw new Error('未配置 GitHub 只读令牌');
    try {
        return await ghFetchText(rel, t);
    }
    catch {
        return serverProxyText(rel, t);
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
async function backfillFollowCaches(token) {
    const follow = loadFollow();
    const cache = loadFollowCacheAll();
    let got = 0;
    for (const f of follow) {
        if (!f?.id || (cache[f.id] && cache[f.id].article))
            continue;
        const art = await readCloudJson(`data/articles/${f.id}.json`, token);
        if (art) {
            cache[f.id] = { cached_at: Date.now(), article: art };
            got++;
        }
        // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
    }
    if (got)
        saveFollowCacheAll(cache);
    return got;
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' });
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}

return module.exports; })();
const articleId = (item) => (typeof item.article === 'string' ? item.article.replace(/\.json$/, '') : '') || item.url || '';
function ImpBadge({ level }) {
    const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow';
    return (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_badge ${cls}`, children: level || '低' });
}
function ColumnView(props) {
    const { site, column, siteName, columnName, onBack, onOpenArticle, onOpenColumn } = props;
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [indexJson, setIndexJson] = (0, react_1.useState)(null);
    const [rows, setRows] = (0, react_1.useState)([]);
    const [tag, setTag] = (0, react_1.useState)('全部');
    const [readSet, setReadSet] = (0, react_1.useState)(() => (0, data_1.loadReadSet)());
    const [siteLabel, setSiteLabel] = (0, react_1.useState)(siteName || site);
    const [colLabel, setColLabel] = (0, react_1.useState)(columnName || '');
    const load = async () => {
        setPhase('loading');
        const [idx, sum] = await Promise.all([(0, data_1.readCloudJson)('data/index.json'), (0, data_1.readCloudJson)('data/summary.json')]);
        setIndexJson(idx);
        setSummary(sum);
        // 从 index 推导站点/栏目中文名（shell 不传原名时用）
        if (idx) {
            const siteDir = (idx.sites || []).find((s) => s.id === site);
            const sn = siteDir?.name || siteName || site;
            setSiteLabel(sn);
            const cn = column ? siteDir?.columns?.find((c) => c.key === column)?.name || columnName || '' : '';
            setColLabel(cn);
        }
        // 加载 feed
        let feeds = [];
        if (!column && idx) {
            const siteDir = (idx.sites || []).find((s) => s.id === site);
            if (siteDir) {
                for (const c of siteDir.columns || []) {
                    const f = await (0, data_1.readFeed)(site, c.key);
                    if (f && Array.isArray(f.items))
                        feeds.push(f);
                }
            }
        }
        else {
            const f = await (0, data_1.readFeed)(site, column);
            if (f && Array.isArray(f.items))
                feeds.push(f);
        }
        const aiMap = sum?.ai_map || {};
        const out = [];
        for (const f of feeds) {
            for (const it of f.items || []) {
                const id = articleId(it);
                if ((0, data_1.isPruned)(id))
                    continue; // 已被用户删除（管理模式）→ 隐藏
                out.push({
                    id,
                    url: it.url || '',
                    title: it.title || '',
                    date: it.date || null,
                    site_name: f.site_name || f.site || site,
                    column_name: f.column_name || '',
                    ai: aiMap[id.replace(/\.json$/, '')] || null,
                });
            }
        }
        out.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        setRows(out);
        setTag('全部');
        setPhase('ready');
    };
    (0, react_1.useEffect)(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [site, column]);
    const categories = (0, react_1.useMemo)(() => {
        const set = new Set();
        for (const r of rows)
            if (r.ai?.category && r.ai.category !== '其他')
                set.add(r.ai.category);
        return ['全部', ...set];
    }, [rows]);
    const visible = (0, react_1.useMemo)(() => (tag === '全部' ? rows : rows.filter((r) => r.ai?.category === tag)), [rows, tag]);
    const openRow = (r, index) => {
        const sibs = visible.map((x) => ({ id: x.id, title: x.title }));
        if (r.id && /^[0-9a-f]{40}$/.test(r.id.replace(/\.json$/, ''))) {
            onOpenArticle(r.id, sibs, index);
        }
        else {
            // 无已存正文：新标签开原文
            if (r.url)
                window.open(resolveUrl(r.url, site), '_blank', 'noopener');
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_backBtn", onClick: onBack, children: "\u2039 \u8FD4\u56DE" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: column ? [siteLabel, colLabel].filter(Boolean).join(' / ') : siteLabel || site })] }), phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u4E2D\u2026" })] })), phase === 'error' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: "\u680F\u76EE\u52A0\u8F7D\u5931\u8D25\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn", onClick: () => void load(), children: "\u91CD\u8BD5" })] })), phase === 'ready' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [categories.length > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tags", children: categories.map((c) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_tag' + (tag === c ? ' dsh-cau_tagOn' : ''), onClick: () => setTag(c), children: c }, c))) })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_list", children: [visible.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u6682\u65E0\u5185\u5BB9" }), visible.map((r, i) => {
                                const read = r.id && readSet.includes(r.id);
                                return ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_row", onClick: () => openRow(r, i), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowDot", "data-read": read ? '1' : '0' }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowTop", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowTitle", children: r.title }), r.ai?.importance && (0, jsx_runtime_1.jsx)(ImpBadge, { level: r.ai.importance })] }), r.ai?.summary && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowSummary", children: r.ai.summary }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowMeta", children: [r.column_name, r.date].filter(Boolean).join(' · ') })] })] }, r.id + r.url));
                            })] })] }))] }));
}
function resolveUrl(url, siteId) {
    if (/^https?:\/\//i.test(url))
        return url;
    const host = { clst: 'https://clst.cau.edu.cn', jwc: 'https://jwc.cau.edu.cn', news: 'https://news.cau.edu.cn' };
    const root = host[siteId];
    return root ? root + (url.startsWith('/') ? url : '/' + url) : url;
}

return module.exports; })();
var panel_article_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleView = ArticleView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal L2：文章原文阅读（阶段4 第4步 批②/③）。
 * 面包屑（来源 → 栏目 → 标题）+ 标题/来源/时间 + AI 摘要框 + deadline 高亮 +
 * 正文全文（pre-wrap）+ 查看原文（新标签）+ 上一篇/下一篇 +
 * 加入/取消关注（无上限）+ 待办类文章的 留存/归档。
 * 数据：data/articles/<id>.json（经数据层读取；ai 已内联在文章文件）。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.backfillFollowCaches = backfillFollowCaches;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const GH_REPO = 'zhouxuanting52-lab/cau-portal';
const GH_BRANCH = 'main';
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        throw new Error('未配置 GitHub 只读令牌');
    try {
        return await ghFetchText(rel, t);
    }
    catch {
        return serverProxyText(rel, t);
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
async function backfillFollowCaches(token) {
    const follow = loadFollow();
    const cache = loadFollowCacheAll();
    let got = 0;
    for (const f of follow) {
        if (!f?.id || (cache[f.id] && cache[f.id].article))
            continue;
        const art = await readCloudJson(`data/articles/${f.id}.json`, token);
        if (art) {
            cache[f.id] = { cached_at: Date.now(), article: art };
            got++;
        }
        // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
    }
    if (got)
        saveFollowCacheAll(cache);
    return got;
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' });
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}

return module.exports; })();
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
const idOf = (it) => it.article_id || it.url || '';
function fmt(iso) {
    if (!iso)
        return '';
    return String(iso);
}
function ArticleView(props) {
    const { articleId, siteName, columnName, onBack, onOpenArticle, siblings, index, onTitle } = props;
    const mods = (0, react_1.useMemo)(() => (0, data_1.loadModules)(), []);
    const [art, setArt] = (0, react_1.useState)(null);
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [followed, setFollowed] = (0, react_1.useState)(false);
    const [deadlineOp, setDeadlineOpState] = (0, react_1.useState)(null);
    const [aiBusy, setAiBusy] = (0, react_1.useState)(false);
    const [aiOut, setAiOut] = (0, react_1.useState)(null);
    const [aiErr, setAiErr] = (0, react_1.useState)('');
    const [fromCache, setFromCache] = (0, react_1.useState)(false);
    const reload = async () => {
        setPhase('loading');
        setAiOut(null);
        setAiErr('');
        const r = await (0, data_1.readArticleMeta)(articleId);
        if (!r) {
            setPhase('error');
            return;
        }
        setArt(r.article);
        setFromCache(r.cached);
        setPhase('ready');
        setFollowed((0, data_1.isFollowed)(articleId));
        setDeadlineOpState((0, data_1.loadDeadlineOps)()[articleId] || null);
        setQuoted((0, bus_1.hasAttached)(articleId));
        if (r.article.title)
            onTitle?.(r.article.title);
    };
    (0, react_1.useEffect)(() => {
        void reload();
    }, [articleId]);
    const runEnrich = async () => {
        setAiBusy(true);
        setAiErr('');
        const s = (0, data_1.loadSettings)();
        const out = await (0, data_1.enrichArticle)(articleId, {
            provider: s.monitorModel?.provider,
            model: s.monitorModel?.model,
        });
        setAiBusy(false);
        if (out?.ok)
            setAiOut(out.result);
        else
            setAiErr(String(out?.error || '加工失败'));
    };
    // 引用到对话：追加这篇（可多篇）；点击切换引用/取消
    const [quoted, setQuoted] = (0, react_1.useState)(false);
    const attachToChat = () => {
        if (!art?.title)
            return;
        if ((0, bus_1.hasAttached)(articleId)) {
            (0, bus_1.removeAttached)(articleId);
            setQuoted(false);
        }
        else {
            (0, bus_1.addAttached)({ id: articleId, title: art.title, source: art.source || siteName || '' });
            setQuoted(true);
        }
    };
    const toggleFollowNow = () => {
        const cur = (0, data_1.loadFollow)();
        const idx = cur.findIndex((x) => x.id === articleId);
        let next;
        if (idx >= 0)
            next = cur.filter((x) => x.id !== articleId);
        else
            next = [
                { id: articleId, title: art?.title || '', url: art?.url || '', time: art?.time || null, source: art?.source || '', column: columnName || '', importance: art?.ai?.importance, summary: art?.ai?.summary },
                ...cur,
            ];
        (0, data_1.saveFollow)(next);
        setFollowed(idx < 0);
        // 关注 → 存整篇本地快照（云端保留期外仍可读）；取消 → 清除快照
        (0, data_1.cacheFollowArticle)(articleId, idx < 0 ? art : null);
    };
    const hasDeadline = !!(art?.ai?.deadline && art?.ai?.deadline.date);
    const op = deadlineOp || '';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_backBtn", onClick: onBack, children: "\u2039 \u8FD4\u56DE" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: [siteName || art?.source, columnName].filter(Boolean).join(' · ') })] }), phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u4E2D\u2026" })] })), phase === 'error' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: (0, data_1.isPruned)(articleId)
                            ? '该数据已被删除（数据管理模式）。'
                            : '文章读取失败（正文可能尚未抓取入库，或已被删除）。' }), art && art.url ? ((0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_msgBtn", href: art.url, target: "_blank", rel: "noreferrer", children: "\u67E5\u770B\u539F\u6587" })) : null, (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn", onClick: () => void reload(), children: "\u91CD\u8BD5" })] })), phase === 'ready' && art && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h1", { className: "dsh-cau_atitle", children: art.title || '(无标题)' }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ameta", children: [art.source && (0, jsx_runtime_1.jsx)("span", { children: art.source }), art.time && (0, jsx_runtime_1.jsx)("span", { children: fmt(art.time) }), art.is_image_only && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_aimgTag", children: "\u7EAF\u56FE\u516C\u544A" }), fromCache && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_acacheTag", children: "\u672C\u5730\u7F13\u5B58" })] }), mods.ai && art.ai?.summary && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asummary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asumHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { children: "AI \u6458\u8981" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_asumText", children: art.ai.summary })] })), mods.ai && !art.ai?.summary && !aiOut && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asummary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asumHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { children: "AI \u6458\u8981" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_asumText dsh-cau_empty", children: "\u672C\u6587\u6682\u65E0 AI \u52A0\u5DE5\uFF08\u6458\u8981/\u5206\u7C7B/\u91CD\u8981\u5EA6/deadline\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_aactions", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_aBtn", disabled: aiBusy, onClick: () => void runEnrich(), children: aiBusy ? '加工中…' : '✨ AI 补摘要' }) }), aiErr && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setErr", children: aiErr })] })), mods.ai && aiOut && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asummary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asumHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { children: "AI \u6458\u8981\uFF08\u672C\u6B21\u4F1A\u8BDD\u5185\u751F\u6210\uFF09" })] }), aiOut.summary && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_asumText", children: aiOut.summary }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ameta", children: [aiOut.category && (0, jsx_runtime_1.jsxs)("span", { children: ["\u5206\u7C7B\uFF1A", aiOut.category] }), aiOut.importance && (0, jsx_runtime_1.jsxs)("span", { children: ["\u91CD\u8981\u5EA6\uFF1A", aiOut.importance] }), aiOut.deadline_note && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: aiOut.deadline_note })] })] })), hasDeadline && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_adeadline", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_adeadlineIcon", children: "\u23F0" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_adeadlineItem", children: art.ai.deadline.item }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_adeadlineDate", children: art.ai.deadline.date }), art.ai.deadline.evidence && (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_adeadlineEv", children: ["\u300C", art.ai.deadline.evidence, "\u300D"] })] })), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_abody", children: art.body || (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_empty", children: "\u6B63\u6587\u672A\u6293\u53D6\u3002\u8BF7\u70B9\u300C\u67E5\u770B\u539F\u6587\u300D\u3002" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_aactions", children: [art.url && ((0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_aBtn", href: art.url, target: "_blank", rel: "noreferrer", children: "\u67E5\u770B\u539F\u6587 \u2197" })), mods.context && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_aBtn' + (quoted ? ' dsh-cau_aBtnOn' : ' dsh-cau_aBtnPrimary'), onClick: attachToChat, children: quoted ? '已引用 ✓（点此取消）' : '引用到对话' })), mods.deadline && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_aBtn' + (followed ? ' dsh-cau_aBtnOn' : ''), onClick: toggleFollowNow, children: followed ? '已关注 ⭐' : '加入关注' })), hasDeadline && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_aBtn' + (op === 'pin' ? ' dsh-cau_aBtnOn' : ''), onClick: () => setDeadlineOpState((0, data_1.setDeadlineOp)(articleId, op === 'pin' ? null : 'pin')[articleId] || null), children: "\u7559\u5B58\u5F85\u529E" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_aBtn' + (op === 'archive' ? ' dsh-cau_aBtnOn' : ''), onClick: () => setDeadlineOpState((0, data_1.setDeadlineOp)(articleId, op === 'archive' ? null : 'archive')[articleId] || null), children: "\u5F52\u6863" })] }))] }), (siblings && siblings.length > 1) && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_anav", children: [index != null && index > 0 ? ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_anavBtn", onClick: () => onOpenArticle(siblings[index - 1].id, siblings, index - 1), children: "\u2039 \u4E0A\u4E00\u7BC7" })) : ((0, jsx_runtime_1.jsx)("span", {})), index != null && index < siblings.length - 1 ? ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_anavBtn", onClick: () => onOpenArticle(siblings[index + 1].id, siblings, index + 1), children: "\u4E0B\u4E00\u7BC7 \u203A" })) : ((0, jsx_runtime_1.jsx)("span", {}))] }))] }))] }));
}

return module.exports; })();
var panel_manage_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageView = ManageView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 数据管理视图（管理模式）：
 * 浏览全部数据（按站点/栏目分组）、一键「选择全部旧数据」（>2 个月）、手动勾选、
 * 删除所选（二次确认；关注中条目附警示）→ 提交云端删除清单（下轮抓取 ≤2h 执行），
 * 本地立即隐藏；可随时退出管理模式。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.backfillFollowCaches = backfillFollowCaches;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const GH_REPO = 'zhouxuanting52-lab/cau-portal';
const GH_BRANCH = 'main';
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        throw new Error('未配置 GitHub 只读令牌');
    try {
        return await ghFetchText(rel, t);
    }
    catch {
        return serverProxyText(rel, t);
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
async function backfillFollowCaches(token) {
    const follow = loadFollow();
    const cache = loadFollowCacheAll();
    let got = 0;
    for (const f of follow) {
        if (!f?.id || (cache[f.id] && cache[f.id].article))
            continue;
        const art = await readCloudJson(`data/articles/${f.id}.json`, token);
        if (art) {
            cache[f.id] = { cached_at: Date.now(), article: art };
            got++;
        }
        // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
    }
    if (got)
        saveFollowCacheAll(cache);
    return got;
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' });
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}

return module.exports; })();
const OLD_DAYS = 60;
const idKey = (it) => (typeof it.article === 'string' ? it.article.replace(/\.json$/, '') : '') || it.url || '';
const submitKey = (it) => (typeof it.article === 'string' ? it.article : it.url || '');
function daysAgo(s) {
    const t = Date.parse(String(s ?? ''));
    if (!Number.isFinite(t))
        return null;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}
/** 关键词高亮：命中片段包 <mark>；q 空时原样返回 */
function highlight(text, q) {
    const t = String(text ?? '');
    const ql = q.trim().toLowerCase();
    if (!ql)
        return t;
    const lower = t.toLowerCase();
    const parts = [];
    let i = 0;
    let idx = lower.indexOf(ql, i);
    let k = 0;
    while (idx >= 0 && k < 30) {
        if (idx > i)
            parts.push(t.slice(i, idx));
        parts.push((0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgHl", children: t.slice(idx, idx + ql.length) }, k));
        k++;
        i = idx + ql.length;
        idx = lower.indexOf(ql, i);
    }
    if (i < t.length)
        parts.push(t.slice(i));
    return parts.length ? parts : t;
}
function ManageView(props) {
    const { onBack } = props;
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [rows, setRows] = (0, react_1.useState)([]);
    const [sel, setSel] = (0, react_1.useState)(new Set());
    const [filter, setFilter] = (0, react_1.useState)('all');
    const [siteFilter, setSiteFilter] = (0, react_1.useState)('');
    const [query, setQuery] = (0, react_1.useState)('');
    const [busy, setBusy] = (0, react_1.useState)(false);
    const [confirm, setConfirm] = (0, react_1.useState)(false);
    const [done, setDone] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const load = async () => {
        setPhase('loading');
        const idx = await (0, data_1.readCloudJson)('data/index.json');
        if (!idx?.sites) {
            setError('无法读取云端目录（index.json）');
            setPhase('error');
            return;
        }
        const followSet = new Set((0, data_1.loadFollow)().map((f) => f.id));
        const out = [];
        for (const site of idx.sites) {
            for (const col of site.columns || []) {
                const f = await (0, data_1.readFeed)(site.id, col.key);
                if (!f || !Array.isArray(f.items))
                    continue;
                for (const it of f.items || []) {
                    if (!it?.url)
                        continue;
                    const id = idKey(it);
                    if ((0, data_1.isPruned)(id))
                        continue;
                    const t = daysAgo(it.date ?? it.first_seen);
                    out.push({
                        id,
                        submit: submitKey(it),
                        url: it.url,
                        title: it.title || '(无标题)',
                        date: it.date || null,
                        siteKey: site.id,
                        siteName: f.site_name || site.name || site.id,
                        colName: f.column_name || col.name || '',
                        isOld: t !== null ? t > OLD_DAYS : false,
                        followed: followSet.has(id),
                    });
                }
            }
        }
        setRows(out);
        setPhase('ready');
    };
    (0, react_1.useEffect)(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const shown = (0, react_1.useMemo)(() => {
        let list = rows;
        if (filter === 'old')
            list = list.filter((r) => r.isOld);
        if (filter === 'new')
            list = list.filter((r) => !r.isOld);
        if (siteFilter)
            list = list.filter((r) => r.siteKey === siteFilter);
        const q = query.trim().toLowerCase();
        if (q)
            list = list.filter((r) => (r.title || '').toLowerCase().includes(q) || (r.url || '').toLowerCase().includes(q));
        return list;
    }, [rows, filter, siteFilter, query]);
    const oldCount = (0, react_1.useMemo)(() => rows.filter((r) => r.isOld).length, [rows]);
    const sites = (0, react_1.useMemo)(() => {
        const m = new Map();
        for (const r of rows)
            if (!m.has(r.siteKey))
                m.set(r.siteKey, r.siteName);
        return [...m.entries()];
    }, [rows]);
    const selOld = (0, react_1.useMemo)(() => rows.filter((r) => r.isOld && sel.has(r.id)).length, [rows, sel]);
    const selFollow = (0, react_1.useMemo)(() => rows.filter((r) => r.followed && sel.has(r.id)).length, [rows, sel]);
    const toggle = (id) => {
        setSel((s) => {
            const n = new Set(s);
            if (n.has(id))
                n.delete(id);
            else
                n.add(id);
            return n;
        });
    };
    const selectAllOld = () => setSel(new Set(rows.filter((r) => r.isOld).map((r) => r.id)));
    const clearSel = () => setSel(new Set());
    const doDelete = async () => {
        setBusy(true);
        setError('');
        const chosen = rows.filter((r) => sel.has(r.id));
        const res = await (0, data_1.queuePruneRequest)(chosen.map((r) => r.submit));
        setBusy(false);
        if (res.ok) {
            setDone(`已提交删除 ${chosen.length} 条（云端队列共 ${res.total} 条）。本地已隐藏，云端将在下一轮抓取（≤2 小时）后真正删除。`);
            setRows((prev) => prev.filter((r) => !sel.has(r.id)));
            setSel(new Set());
            setConfirm(false);
            setFilter('all');
            setSiteFilter('');
        }
        else {
            setError(`提交失败：${res.error || '未知错误'}（可稍后重试）`);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_backBtn", onClick: onBack, children: "\u2039 \u9000\u51FA\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: "\u6570\u636E\u7BA1\u7406" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgIntro", children: "\u9009\u62E9\u8981\u5220\u9664\u7684\u6570\u636E\uFF08\u65E7\u6570\u636E = \u8D85\u8FC7 2 \u4E2A\u6708\uFF09\u3002\u5220\u9664\u4E0D\u53EF\u6062\u590D\uFF1A\u672C\u5730\u7ACB\u5373\u9690\u85CF\uFF0C\u4E91\u7AEF\u5C06\u4E8E\u4E0B\u4E00\u8F6E\u6293\u53D6\uFF08\u22642 \u5C0F\u65F6\uFF09\u540E\u771F\u6B63\u5220\u9664\uFF1B\u5173\u6CE8\u4E2D\u7684\u6587\u7AE0\u5C06\u4FDD\u7559\u672C\u5730\u7F13\u5B58\u53EF\u8BFB\u3002" }), phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u6570\u636E\u76EE\u5F55\u2026" })] })), phase === 'error' && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgMsg error", children: error }), phase === 'ready' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgToolbar", children: [(0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_mgSearch", type: "search", placeholder: "\u641C\u7D22\u6807\u9898\u6216\u94FE\u63A5\u2026\uFF08\u4E0E\u7B5B\u9009\u53E0\u52A0\uFF09", value: query, onChange: (e) => setQuery(e.target.value) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgFilters", children: [['all', 'old', 'new'].map((k) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_mgChip' + (filter === k ? ' on' : ''), onClick: () => setFilter(k), children: k === 'all' ? `全部 ${rows.length}` : k === 'old' ? `旧数据 ${oldCount}` : '近 2 个月' }, k))), (0, jsx_runtime_1.jsxs)("select", { className: "dsh-cau_mgSel", value: siteFilter, onChange: (e) => setSiteFilter(e.target.value), title: "\u6309\u7AD9\u70B9\u7B5B\u9009", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "\u5168\u90E8\u7AD9\u70B9" }), sites.map(([k, n]) => ((0, jsx_runtime_1.jsx)("option", { value: k, children: n }, k)))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgActs", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgBtn", onClick: selectAllOld, title: "\u52FE\u9009\u5168\u90E8\u8D85\u8FC7 2 \u4E2A\u6708\u7684\u6570\u636E", children: "\u9009\u62E9\u5168\u90E8\u65E7\u6570\u636E" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgBtn", onClick: clearSel, disabled: !sel.size, children: "\u6E05\u7A7A\u9009\u62E9" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgBar", children: ["\u5DF2\u9009 ", (0, jsx_runtime_1.jsx)("b", { children: sel.size }), " \u6761\uFF08\u65E7 ", selOld, " \u00B7 \u5173\u6CE8\u4E2D ", selFollow, "\uFF09", (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_mgDel", disabled: !sel.size || busy, onClick: () => setConfirm(true), children: ["\u5220\u9664\u6240\u9009\uFF08", sel.size, "\uFF09"] })] }), confirm && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgConfirm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgConfirmText", children: ["\u786E\u5B9A\u5220\u9664\u6240\u9009 ", (0, jsx_runtime_1.jsx)("b", { children: sel.size }), " \u6761\u6570\u636E\uFF1F", ' ', selFollow > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("b", { style: { color: 'var(--dsw-alias-state-warn,#b8860b)' }, children: [selFollow, " \u6761\u5173\u6CE8\u4E2D"] }), "\uFF08\u672C\u5730\u7F13\u5B58\u4ECD\u53EF\u8BFB\uFF0C\u4F46\u4E91\u7AEF\u5C06\u5220\u9664\uFF09"] })), ' ', "\u5220\u9664\u4E0D\u53EF\u6062\u590D\u3002"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgConfirmActs", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgBtn warn", disabled: busy, onClick: () => void doDelete(), children: busy ? '提交中…' : '确认删除' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgBtn", disabled: busy, onClick: () => setConfirm(false), children: "\u53D6\u6D88" })] })] })), done && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgMsg ok", children: done }), error && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgMsg error", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgList", children: [shown.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u6570\u636E" }), sites
                                .map(([k, n]) => ({ k, n, items: shown.filter((r) => r.siteKey === k) }))
                                .filter((g) => g.items.length)
                                .map((g) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgGroup", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgGroupName", children: g.n }), g.items.map((r) => ((0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mgRow", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: sel.has(r.id), onChange: () => toggle(r.id) }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mgRowMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mgRowTitle", children: [highlight(r.title, query), r.followed && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgStar", title: "\u5173\u6CE8\u4E2D", children: "\u2605" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mgRowSub", children: [r.colName, r.date ? ` · ${r.date}` : '', r.isOld && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgOld", children: "\u8D85\u8FC7 2 \u4E2A\u6708" }), r.url && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgRowUrl", children: highlight(r.url, query) })] })] })] }, r.id)))] }, g.k)))] })] }))] }));
}

return module.exports; })();
var settings_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_CSS = void 0;
exports.CauSettings = CauSettings;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 设置页（2026-08-29 重构：分组卡片「一筐一筐」管理）：
 * 首页 = 分组卡片墙（每卡右上角启用/禁用开关 + 状态徽章）＋ 顶部提醒条（红=基本需求不满足 / 黄=注意）。
 * 子页：① AI 加工·模型配置（模型选择 + 用量柱状图 7/30/90 天 + 指标切换 + 分账表）
 *      ② 令牌管理（多令牌登记：值/过期日/剩余天数/快捷跳转 GitHub 管理页/逐枚开关）
 *      ③ 面板偏好（自动附加 + 引用协同开关） ④ 待办提醒与关注 ⑤ 数据源（连通检查） ⑥ 安全·门户与链接。
 * 全部纯客户端（localStorage），浏览器刷新生效。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.backfillFollowCaches = backfillFollowCaches;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const GH_REPO = 'zhouxuanting52-lab/cau-portal';
const GH_BRANCH = 'main';
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        throw new Error('未配置 GitHub 只读令牌');
    try {
        return await ghFetchText(rel, t);
    }
    catch {
        return serverProxyText(rel, t);
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
async function backfillFollowCaches(token) {
    const follow = loadFollow();
    const cache = loadFollowCacheAll();
    let got = 0;
    for (const f of follow) {
        if (!f?.id || (cache[f.id] && cache[f.id].article))
            continue;
        const art = await readCloudJson(`data/articles/${f.id}.json`, token);
        if (art) {
            cache[f.id] = { cached_at: Date.now(), article: art };
            got++;
        }
        // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
    }
    if (got)
        saveFollowCacheAll(cache);
    return got;
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' });
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}

return module.exports; })();
var ctx_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCtx = bindCtx;
exports.getCtx = getCtx;
/**
 * 跨组件树共享插件 ctx（面板树 ↔ 设置页 都要用会话服务与模型目录）。
 *
 * 注意：build.mjs 的内联器**不做模块去重**——同一个模块被两处 require 会内联成
 * 两份独立 IIFE，各自持有自己的模块级状态。因此这里不能用模块级变量存单例，
 * 必须挂到 window 上（全局、跨所有内联副本共享），否则 bindCtx/getCtx 会读错对象。
 */
function bindCtx(c) {
    ;
    window.__CAU_CTX__ = c;
}
function getCtx() {
    return window.__CAU_CTX__;
}

return module.exports; })();
const noop = () => { };
exports.SETTINGS_CSS = `
.dsh-cau_set{display:flex;flex-direction:column;gap:14px;padding:16px 0 24px;max-width:640px}
/* ---- 提醒条 ---- */
.dsh-cau_alert{display:flex;align-items:flex-start;gap:8px;padding:9px 12px;border-radius:8px;font-size:12px;line-height:17px}
.dsh-cau_alert.error{border:1px solid var(--dsw-alias-state-error-primary,rgba(229,72,77,.5));background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_alert.warn{border:1px solid var(--dsw-alias-state-warn,rgba(255,180,0,.5));background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 10%,transparent);color:var(--dsw-alias-state-warn,#d99c00)}
.dsh-cau_alertDot{flex:none;width:8px;height:8px;margin-top:4px;border-radius:50%;background:currentColor}
/* ---- 分组卡片 ---- */
.dsh-cau_cards{display:flex;flex-direction:column;gap:10px}
.dsh-cau_card{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));border-radius:12px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.03));cursor:pointer;transition:border-color .12s ease}
.dsh-cau_card:hover{border-color:color-mix(in srgb,var(--cau-brand,#008038) 55%,transparent)}
.dsh-cau_cardMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.dsh-cau_cardName{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_cardIcon{flex:none;font-size:15px;line-height:1}
.dsh-cau_cardDesc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cardBadge{flex:none;font-size:11px;padding:2px 7px;border-radius:999px;white-space:nowrap}
.dsh-cau_cardBadge.ok{background:color-mix(in srgb,var(--dsw-alias-state-success,#2f9e44) 14%,transparent);color:var(--dsw-alias-state-success,#2f9e44)}
.dsh-cau_cardBadge.warn{background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 14%,transparent);color:var(--dsw-alias-state-warn,#d99c00)}
.dsh-cau_cardBadge.off{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.07));color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cardBadge.err{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 14%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
/* ---- 开关 ---- */
.dsh-cau_switch{flex:none;position:relative;width:34px;height:20px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.2));border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));cursor:pointer;transition:background .15s ease,border-color .15s ease}
.dsh-cau_switch span{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#8b95a5);transition:transform .15s ease,background .15s ease}
.dsh-cau_switch.on{border-color:color-mix(in srgb,var(--cau-brand,#008038) 60%,transparent);background:color-mix(in srgb,var(--cau-brand,#008038) 22%,transparent)}
.dsh-cau_switch.on span{transform:translateX(14px);background:var(--cau-brand,#008038)}
/* ---- 子页 ---- */
.dsh-cau_setPageHead{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dsh-cau_setSubBack{flex:none;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;cursor:pointer}
.dsh-cau_setSubBack:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
.dsh-cau_setBlocks{display:flex;flex-direction:column;gap:14px}
.dsh-cau_setBlock{display:flex;flex-direction:column;gap:8px}
.dsh-cau_setTitle{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_setTitle::before{content:"";flex:none;width:3px;height:12px;border-radius:2px;background:var(--cau-brand,#008038)}
.dsh-cau_setDesc{font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_setRow{display:flex;align-items:center;gap:10px}
.dsh-cau_setLabel{flex:1;min-width:0;font-size:13px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_setInput{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;outline:none}
.dsh-cau_setInput:focus{border-color:var(--cau-brand,#008038)}
.dsh-cau_setSelect{box-sizing:border-box;min-width:0;flex:1;height:32px;padding:0 8px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:var(--dsw-specific-menu,#1b1e24);color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;outline:none;cursor:pointer}
.dsh-cau_setBtn{flex:none;height:32px;padding:0 14px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;cursor:pointer}
.dsh-cau_setBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
.dsh-cau_setBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_setBtn.danger{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 45%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_setHint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_setOk{font-size:12px;color:var(--dsw-alias-state-success,#34c77b)}
.dsh-cau_setErr{font-size:12px;color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_setWarn{font-size:12px;line-height:17px;color:var(--dsw-alias-state-warn,#ffb400)}
.dsh-cau_setCheck{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#9aa4b2);cursor:pointer}
.dsh-cau_setCheck input{accent-color:var(--cau-brand,#008038)}
.dsh-cau_infoCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.03))}
/* ---- 用量图 ---- */
.dsh-cau_chart{display:block;width:100%;height:150px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
.dsh-cau_chip{height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);font-size:11px;cursor:pointer}
.dsh-cau_chip.on{background:color-mix(in srgb,var(--cau-brand,#008038) 14%,transparent);border-color:var(--cau-brand,#008038);color:var(--cau-brand,#00b856)}
.dsh-cau_usageTable{width:100%;border-collapse:collapse;font-size:12px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_usageTable th,.dsh-cau_usageTable td{padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.08));text-align:right;white-space:nowrap}
.dsh-cau_usageTable th:first-child,.dsh-cau_usageTable td:first-child{text-align:left}
.dsh-cau_usageTable th{color:var(--dsw-alias-label-tertiary,#8b95a5);font-weight:500}
/* ---- 令牌 ---- */
.dsh-cau_tokList{display:flex;flex-direction:column;gap:8px}
.dsh-cau_tok{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));border-radius:10px}
.dsh-cau_tokMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.dsh-cau_tokName{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_tokMeta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_tokActs{display:flex;gap:6px;flex:none}
.dsh-cau_tokBtn{flex:none;height:26px;padding:0 9px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);font-size:11px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.dsh-cau_tokBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_links{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.dsh-cau_link{display:inline-flex;align-items:center;padding:5px 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.16));border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:11px;text-decoration:none;cursor:pointer}
.dsh-cau_link:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
`;
const ROLE_LABEL = {
    enrich: '爬虫管道加工',
    'on-demand': '面板按需加工',
    monitor: '监控',
    other: '其他',
};
function fmtNum(n) {
    if (n >= 1e6)
        return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4)
        return (n / 1e4).toFixed(1) + 'w';
    return String(n);
}
function daysUntil(dateStr) {
    if (!dateStr)
        return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime()))
        return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400e3);
}
function expiryBadge(expires) {
    const n = daysUntil(expires);
    if (n == null)
        return { cls: 'dsh-cau_setHint', text: '未设过期日' };
    if (n < 0)
        return { cls: 'dsh-cau_setErr', text: `已过期 ${-n} 天` };
    if (n <= 30)
        return { cls: 'dsh-cau_setWarn', text: `${n} 天后过期` };
    return { cls: 'dsh-cau_setOk', text: `${n} 天后过期` };
}
const KEY_LINKS = [
    { key: 'github-read', label: 'GitHub 令牌管理', url: 'https://github.com/settings/personal-access-tokens' },
    { key: 'repo', label: '数据仓库', url: 'https://github.com/zhouxuanting52-lab/cau-portal' },
    { key: 'actions', label: '定时抓取 Actions', url: 'https://github.com/zhouxuanting52-lab/cau-portal/actions' },
    { key: 'cron', label: 'cron-job.org', url: 'https://console.cron-job.org/jobs' },
    { key: 'ds', label: 'DeepSeek 平台', url: 'https://platform.deepseek.com' },
    { key: 'portal', label: '统一门户', url: 'https://one.cau.edu.cn' },
];
/** 自绘 SVG 柱状图（无图表库依赖） */
function BarChart({ items, unit }) {
    const W = 460;
    const H = 150;
    const PAD = 8;
    const BASE = 24;
    const TOP = 24;
    const max = Math.max(1, ...items.map((i) => i.value));
    const n = items.length;
    const step = Math.max(1, Math.ceil(n / 10));
    const slot = (W - PAD * 2) / n;
    const bw = Math.max(2, slot - 3);
    return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: `0 0 ${W} ${H}`, className: "dsh-cau_chart", role: "img", "aria-label": "\u7528\u91CF\u67F1\u72B6\u56FE", children: [(0, jsx_runtime_1.jsx)("line", { x1: PAD, y1: H - BASE, x2: W - PAD, y2: H - BASE, stroke: "currentColor", opacity: ".25" }), (0, jsx_runtime_1.jsxs)("text", { x: PAD, y: 14, fontSize: "10", fill: "currentColor", opacity: ".6", children: ["max ", fmtNum(max), " ", unit] }), items.map((it, i) => {
                const h = Math.max(1.5, (it.value / max) * (H - BASE - TOP - 10));
                const x = PAD + i * slot + (slot - bw) / 2;
                const on = it.value > 0;
                return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("rect", { x: x, y: H - BASE - h, width: bw, height: h, rx: 2, fill: on ? 'var(--cau-brand)' : 'currentColor', opacity: on ? 1 : 0.12, children: (0, jsx_runtime_1.jsx)("title", { children: `${it.label}：${fmtNum(it.value)} ${unit}` }) }), i % step === 0 && ((0, jsx_runtime_1.jsx)("text", { x: x + bw / 2, y: H - 8, fontSize: "9", fill: "currentColor", opacity: ".55", textAnchor: "middle", children: it.label }))] }, i));
            })] }));
}
function Toggle({ on, onToggle, label }) {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_switch' + (on ? ' on' : ''), "aria-pressed": on, "aria-label": label, title: on ? '点击禁用' : '点击启用', onClick: (e) => { e.stopPropagation(); onToggle(); }, children: (0, jsx_runtime_1.jsx)("span", {}) }));
}
function CauSettings(props) {
    const _ctx = (0, ctx_1.getCtx)() || {};
    const sessions = props.sessions ?? _ctx.sessions;
    const modelDirectories = props.modelDirectories ?? _ctx.modelDirectories;
    const [page, setPage] = (0, react_1.useState)('home');
    const [settings, setSettings] = (0, react_1.useState)(() => (0, data_1.loadSettings)());
    const [mods, setMods] = (0, react_1.useState)(() => (0, data_1.loadModules)());
    const [tokens, setTokens] = (0, react_1.useState)(() => (0, data_1.loadTokens)());
    const [savedFlash, setSavedFlash] = (0, react_1.useState)(false);
    const upd = (next) => {
        setSettings(next);
        (0, data_1.saveSettings)(next);
    };
    const toggleMod = (k) => {
        const next = { ...mods, [k]: !mods[k] };
        setMods(next);
        (0, data_1.saveModules)(next);
    };
    const persistTokens = (next) => {
        setTokens(next);
        (0, data_1.saveTokens)(next);
    };
    const alerts = (0, react_1.useMemo)(() => (0, data_1.computeAlerts)(), [mods, tokens, settings]);
    const flash = () => {
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 2000);
    };
    // ---------- 子页：AI 加工 · 模型配置 ----------
    const subList = (cb) => {
        try {
            return sessions?.list ? sessions.list.subscribe(cb) : noop;
        }
        catch {
            return noop;
        }
    };
    const snapList = () => {
        try {
            return sessions?.list?.getSnapshot();
        }
        catch {
            return undefined;
        }
    };
    const listSnap = (0, react_1.useSyncExternalStore)(subList, snapList);
    const sessionId = listSnap?.current;
    const [groups, setGroups] = (0, react_1.useState)([]);
    const [modelState, setModelState] = (0, react_1.useState)('idle');
    const [modelNote, setModelNote] = (0, react_1.useState)('');
    const loadModelDir = async () => {
        setModelState('loading');
        setModelNote('');
        if (!sessionId || !modelDirectories) {
            setModelState('fail');
            setModelNote('当前没有打开的会话，或模型目录服务不可用');
            return;
        }
        let d = null;
        try {
            d = modelDirectories.directoryFor(sessionId);
        }
        catch {
            setModelState('fail');
            setModelNote('当前会话无法解析模型目录');
            return;
        }
        let settled = false;
        const timer = window.setTimeout(() => {
            if (settled)
                return;
            settled = true;
            setModelState('fail');
            setModelNote('模型目录未响应（将使用服务端默认模型）');
        }, 6000);
        try {
            await d.load();
            settled = true;
            window.clearTimeout(timer);
            setGroups(d.store?.getSnapshot()?.groups || []);
            setModelState('ok');
        }
        catch {
            settled = true;
            window.clearTimeout(timer);
            setModelState('fail');
            setModelNote('模型目录加载失败（将使用服务端默认模型）');
        }
    };
    const monitor = settings.monitorModel || null;
    const selGroup = groups.find((g) => g.id === monitor?.provider) || groups[0] || null;
    const selModel = selGroup?.models?.find((m) => m.id === monitor?.model) || null;
    const pickModel = (provider, model) => upd({ ...settings, monitorModel: { provider, model } });
    // 用量
    const [rows, setRows] = (0, react_1.useState)(null);
    const [metric, setMetric] = (0, react_1.useState)('calls');
    const [days, setDays] = (0, react_1.useState)(30);
    (0, react_1.useEffect)(() => {
        let alive = true;
        void (0, data_1.loadUsageRows)().then((r) => {
            if (alive)
                setRows(r);
        });
        return () => {
            alive = false;
        };
    }, []);
    const daily = (0, react_1.useMemo)(() => (rows ? (0, data_1.buildDailyUsage)(rows, days, metric) : []), [rows, days, metric]);
    const byRole = (0, react_1.useMemo)(() => (rows ? (0, data_1.summarizeUsage)(rows, days) : null), [rows, days]);
    const METRIC_UNIT = { calls: '次', prompt: '输入tok', completion: '输出tok', cost: '元' };
    // ---------- 子页：令牌管理 ----------
    const [tokEditing, setTokEditing] = (0, react_1.useState)(null);
    const [tokDraft, setTokDraft] = (0, react_1.useState)({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    const startEdit = (t) => {
        if (t) {
            setTokEditing(t.id);
            setTokDraft({ ...t });
        }
        else {
            setTokEditing(null);
            setTokDraft({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
        }
    };
    const saveTokDraft = () => {
        const d = tokDraft;
        if (!d.name.trim())
            return;
        const rec = { ...d, id: d.id || `tok-${Date.now().toString(36)}`, value: d.value || '' };
        const next = tokEditing ? tokens.map((t) => (t.id === tokEditing ? rec : t)) : [...tokens, rec];
        persistTokens(next);
        setTokEditing(null);
        flash();
    };
    const removeTok = (id) => {
        if (!window.confirm('删除该令牌登记？（令牌值仅本机，删除后不可恢复）'))
            return;
        persistTokens(tokens.filter((t) => t.id !== id));
    };
    const toggleTok = (id) => persistTokens(tokens.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
    // ---------- 子页：数据源连通检查 ----------
    const [cloudState, setCloudState] = (0, react_1.useState)('idle');
    const [cloudMsg, setCloudMsg] = (0, react_1.useState)('');
    const checkCloud = async () => {
        setCloudState('loading');
        setCloudMsg('');
        try {
            const text = await (0, data_1.readCloudText)('data/index.json');
            const j = JSON.parse(text);
            setCloudState('ok');
            setCloudMsg(`已连通 ✓ 数据更新至 ${j.last_updated || '未知'}，条目 ${j.stats?.total_items ?? '?'} 条 / 正文 ${j.stats?.articles_stored ?? '?'} 篇`);
        }
        catch (e) {
            setCloudState('fail');
            setCloudMsg(String(e?.message || e));
        }
    };
    // ---------- 首页卡片 ----------
    const tokBadge = (() => {
        const err = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) != null && daysUntil(t.expires) < 0);
        const warn = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) <= 30 && daysUntil(t.expires) >= 0);
        const active = tokens.filter((t) => t.enabled && t.value).length;
        return err ? { cls: 'err', text: `${active} 枚在用 · ⚠ 已过期` } : warn ? { cls: 'warn', text: `${active} 枚在用 · ⚠ 临期` } : { cls: 'ok', text: `${active} 枚在用` };
    })();
    const cards = [
        {
            key: 'ai',
            icon: '🤖',
            name: 'AI 加工 · 模型配置',
            desc: '模型选择 + 用量柱状图（7/30/90 天，次数/token/费用切换）',
            badge: monitor ? { cls: 'ok', text: monitor.model } : { cls: 'warn', text: '未指定模型' },
            need: mods.ai,
            page: 'ai',
        },
        {
            key: null,
            icon: '🔑',
            name: '令牌管理',
            desc: 'GitHub / 调度桥等令牌：过期日期、剩余天数、一键跳转 GitHub 管理页',
            badge: tokBadge,
            need: true,
            page: 'tokens',
        },
        {
            key: 'context',
            icon: '💬',
            name: '面板偏好 · 引用协同',
            desc: '自动附加阅读上下文、引用到对话（上下文条/工具卡片）',
            badge: mods.context ? { cls: 'ok', text: '引用协同开' } : { cls: 'off', text: '已禁用' },
            need: mods.context,
            page: 'prefs',
        },
        {
            key: 'deadline',
            icon: '⏰',
            name: '待办提醒 · 关注',
            desc: '首页待办卡（截止提醒）与关注功能',
            badge: mods.deadline ? { cls: 'ok', text: '已启用' } : { cls: 'off', text: '已禁用' },
            need: mods.deadline,
            page: 'prefs',
        },
        {
            key: 'cloud',
            icon: '☁️',
            name: '数据源',
            desc: 'GitHub 云端数据（每 2 小时自动更新）+ 连通性检查',
            badge: mods.cloud ? { cls: 'ok', text: '已连接云端' } : { cls: 'err', text: '已禁用! 插件无数据' },
            need: mods.cloud,
            page: 'cloud',
        },
        {
            key: 'portal',
            icon: '🔐',
            name: '安全 · 门户',
            desc: '统一门户密码（阶段 5）、密钥与重要链接',
            badge: { cls: 'ok', text: '阶段5 预留' },
            need: true,
            page: 'security',
        },
    ];
    // ---------- 渲染 ----------
    const errCount = (0, react_1.useMemo)(() => alerts.filter((a) => a.level === 'error').length, [alerts]);
    if (page === 'home') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [alerts.map((a, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `dsh-cau_alert ${a.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_alertDot" }), (0, jsx_runtime_1.jsx)("span", { children: a.text })] }, i))), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5206\u9879\u7BA1\u7406\u5404\u529F\u80FD\u4E0E\u51ED\u636E\uFF1B\u6BCF\u9879\u53EF\u72EC\u7ACB\u542F\u7528/\u7981\u7528\uFF0C\u5173\u952E\u9879\u7F3A\u5931\u4F1A\u5728\u6B64\u63D0\u9192\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_cards", children: cards.map((c) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", role: "button", tabIndex: 0, onClick: () => setPage(c.page), onKeyDown: (e) => e.key === 'Enter' && setPage(c.page), children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_cardMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_cardName", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardIcon", children: c.icon }), c.name, (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_cardBadge ${c.badge.cls}`, children: c.badge.text })] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardDesc", children: c.desc })] }), c.key && (0, jsx_runtime_1.jsx)(Toggle, { on: mods[c.key], onToggle: () => toggleMod(c.key), label: `切换 ${c.name}` })] }, c.name))) })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setPageHead", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setSubBack", onClick: () => setPage('home'), children: "\u2039 \u8FD4\u56DE" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: page === 'ai' ? 'AI 加工 · 模型配置' : page === 'tokens' ? '令牌管理' : page === 'prefs' ? '面板偏好 · 引用协同' : page === 'cloud' ? '数据源' : '安全 · 门户' }), errCount > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setWarn", children: ["\u26A0 \u6709 ", errCount, " \u9879\u914D\u7F6E\u95EE\u9898"] })] }), page === 'ai' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u9009\u62E9" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u72EC\u7ACB\u914D\u7F6E\u69FD\uFF1A\u7528\u4E8E\u9762\u677F\u6309\u9700\u52A0\u5DE5\uFF08AI \u6458\u8981/\u5206\u7C7B/\u91CD\u8981\u5EA6/deadline\uFF09\u4E0E\u540E\u7EED\u76D1\u63A7\uFF0C\u4E0E\u4E3B\u5BF9\u8BDD\u6A21\u578B\u4E92\u4E0D\u5F71\u54CD\u3002\u6362\u6A21\u578B\u53EA\u5F71\u54CD\u4E4B\u540E\u7684\u52A0\u5DE5\uFF0C\u6570\u636E\u65E0\u9700\u91CD\u722C\u3002" }), !sessionId || !modelDirectories ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: !modelDirectories ? '模型目录服务不可用（按需加工将使用服务端默认模型）。' : '当前没有打开的会话——打开一个会话后即可从 DSH 模型目录中选择。' })) : modelState === 'loading' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u52A0\u8F7D\u4E2D\u2026" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'fail' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: modelNote }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u91CD\u8BD5" })] })) : modelState === 'ok' && groups.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u4E3A\u7A7A\uFF08\u68C0\u67E5 provider \u914D\u7F6E\u540E\u91CD\u8BD5\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'ok' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selGroup?.id || '', onChange: (e) => { const g = groups.find((x) => x.id === e.target.value); if (g?.models?.length)
                                                    pickModel(g.id, g.models[0].id); }, children: groups.map((g) => ((0, jsx_runtime_1.jsx)("option", { value: g.id, children: g.name }, g.id))) }), selGroup?.models?.length ? ((0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selModel?.id || selGroup.models[0].id, onChange: (e) => pickModel(selGroup.id, e.target.value), children: selGroup.models.map((m) => ((0, jsx_runtime_1.jsx)("option", { value: m.id, children: m.name || m.id }, m.id))) })) : null] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u5F53\u524D\uFF1A", monitor ? `${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: monitor ? `当前：${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u52A0\u8F7D\u6A21\u578B\u76EE\u5F55" })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u7528\u91CF \u00B7 \u67F1\u72B6\u56FE" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9ED8\u8BA4\u8FD1 30 \u5929\uFF1B\u65F6\u95F4\u8DE8\u5EA6\u4E0E\u6307\u6807\u53EF\u5207\u6362\uFF08\u4E91\u7AEF\u7BA1\u9053 + \u672C\u673A\u6309\u9700\u5408\u8BA1\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: [7, 30, 90].map((d) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_chip' + (days === d ? ' on' : ''), onClick: () => setDays(d), children: [d, " \u5929"] }, d))) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: ['calls', 'prompt', 'completion', 'cost'].map((m) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_chip' + (metric === m ? ' on' : ''), onClick: () => setMetric(m), children: METRIC_UNIT[m] }, m))) }), rows === null ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u52A0\u8F7D\u7528\u91CF\u4E2D\u2026" })) : daily.length === 0 || !daily.some((d) => d.value > 0) ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u8FD1 ", days, " \u5929\u6682\u65E0\u7528\u91CF\u8BB0\u5F55\uFF08AI \u52A0\u5DE5\u5C1A\u672A\u89E6\u53D1\u6216\u7528\u65F6\u4E0D\u8DB3\uFF09\u3002"] })) : ((0, jsx_runtime_1.jsx)(BarChart, { items: daily, unit: METRIC_UNIT[metric] })), byRole && Object.keys(byRole).length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("table", { className: "dsh-cau_usageTable", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "\u89D2\u8272" }), (0, jsx_runtime_1.jsx)("th", { children: "\u6B21\u6570" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u5165" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u51FA" }), (0, jsx_runtime_1.jsx)("th", { children: "\u7F13\u5B58\u8BFB" }), (0, jsx_runtime_1.jsx)("th", { children: "\u91D1\u989D(\u5143)" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: Object.entries(byRole).map(([role, v]) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: ROLE_LABEL[role] || role }), (0, jsx_runtime_1.jsx)("td", { children: v.calls }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.prompt) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.completion) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.cached) }), (0, jsx_runtime_1.jsx)("td", { children: v.cost ? v.cost.toFixed(4) : '—' })] }, role))) })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u91D1\u989D\u4EC5\u5BF9 DeepSeek \u9644\u5E26\u7684\u8BA1\u4EF7\u8C03\u7528\u663E\u793A\uFF1B\u300C\u5237\u65B0\u300D\u540E\u66F4\u65B0\u3002" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6309\u9700\u8865\u6458\u8981" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setDesc", children: "\u6587\u7AE0\u9875\u5BF9\u672A\u52A0\u5DE5\u7684\u6587\u7AE0\u63D0\u4F9B\u300CAI \u8865\u6458\u8981\u300D\uFF1A\u8C03\u7528\u63D2\u4EF6\u670D\u52A1\u7AEF\u8DEF\u7531\uFF08DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\uFF09\uFF0C\u6D4F\u89C8\u5668\u4E0D\u5B58\u4EFB\u4F55 API key\uFF1B\u7ED3\u679C\u4EC5\u672C\u6B21\u4F1A\u8BDD\u5185\u663E\u793A\uFF0C\u4E0D\u56DE\u5199\u4E91\u7AEF\u3002" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u89E6\u53D1\u4F4D\u7F6E\uFF1A\u6587\u7AE0\u9605\u8BFB\u9875\u6458\u8981\u533A\uFF08\u65E0 AI \u6458\u8981\u65F6\u51FA\u73B0\u6309\u94AE\uFF09\u3002\u7981\u7528\u672C\u6A21\u5757\u540E\u6309\u94AE\u9690\u85CF\u3002" })] })] })] })), page === 'tokens' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u4EE4\u724C\u767B\u8BB0" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6BCF\u679A\u4EE4\u724C\u53EF\u9009\u542F\u7528/\u7981\u7528\uFF1B\u300C\u503C\u300D\u4EC5\u5B58\u672C\u673A\u6D4F\u89C8\u5668\uFF1B\u8FC7\u671F\u65E5\u671F\u7528\u4E8E\u5230\u671F\u63D0\u9192\uFF1B\u300C\u7BA1\u7406 \u2197\u300D\u8DF3\u8F6C GitHub \u4EE4\u724C\u7BA1\u7406\u9875\u3002\u505C\u7528\u5168\u90E8\u4EE4\u724C = \u9762\u677F\u65E0\u6570\u636E\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokList", children: [tokens.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6682\u672A\u767B\u8BB0\u4EE4\u724C\u3002\u8BF7\u6DFB\u52A0 GitHub \u6570\u636E\u4EE4\u724C\uFF08\u7EC6\u7C92\u5EA6 PAT\uFF0CContents: Read\uFF0C\u79C1\u6709\u6570\u636E\u4ED3\uFF09\u3002" }), tokens.map((t) => {
                                    const eb = expiryBadge(t.expires);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tok", children: [(0, jsx_runtime_1.jsx)(Toggle, { on: t.enabled, onToggle: () => toggleTok(t.id), label: `${t.name} 启用` }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokName", children: [t.name, !t.enabled && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge off", children: "\u5DF2\u505C\u7528" }), !t.value && t.expires && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge warn", children: "\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokMeta", children: [t.usage && (0, jsx_runtime_1.jsx)("span", { children: t.usage }), t.expires && ((0, jsx_runtime_1.jsxs)("span", { className: eb.cls, children: ["\u8FC7\u671F ", t.expires, " \u00B7 ", eb.text] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokActs", children: [t.adminUrl && ((0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_tokBtn", href: t.adminUrl, target: "_blank", rel: "noreferrer", children: "\u7BA1\u7406 \u2197" })), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn", onClick: () => startEdit(t), children: "\u7F16\u8F91" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn danger", onClick: () => removeTok(t.id), children: "\u5220\u9664" })] })] }, t.id));
                                })] }), !tokEditing ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => startEdit(), children: "+ \u6DFB\u52A0\u4EE4\u724C" }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { fontSize: 12 }, children: tokEditing ? '编辑令牌' : '添加令牌' }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u540D\u79F0\uFF08\u5982 GitHub \u6570\u636E\u4EE4\u724C\uFF09", value: tokDraft.name, onChange: (e) => setTokDraft({ ...tokDraft, name: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7528\u9014\u8BF4\u660E\uFF08\u5982 \u8BFB\u53D6\u4E91\u7AEF\u6570\u636E\uFF09", value: tokDraft.usage, onChange: (e) => setTokDraft({ ...tokDraft, usage: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "password", placeholder: "\u4EE4\u724C\u503C\uFF08\u4EC5\u672C\u673A\uFF1B\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5\u7684\u53EF\u7559\u7A7A\uFF09", value: tokDraft.value, onChange: (e) => setTokDraft({ ...tokDraft, value: e.target.value }), spellCheck: false }) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", style: { maxWidth: 170 }, type: "date", value: tokDraft.expires, onChange: (e) => setTokDraft({ ...tokDraft, expires: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7BA1\u7406\u9875 URL\uFF08\u9ED8\u8BA4 GitHub \u4EE4\u724C\u9875\uFF09", value: tokDraft.adminUrl, onChange: (e) => setTokDraft({ ...tokDraft, adminUrl: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: !tokDraft.name.trim(), onClick: saveTokDraft, children: "\u4FDD\u5B58" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => setTokEditing(null), children: "\u53D6\u6D88" })] })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }) })), page === 'prefs' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9605\u8BFB\u4E0A\u4E0B\u6587\u5F15\u7528" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.autoAttach, onChange: (e) => upd({ ...settings, autoAttach: e.target.checked }) }), "\u6253\u5F00\u6587\u7AE0\u65F6\u81EA\u52A8\u9644\u52A0\u9605\u8BFB\u4E0A\u4E0B\u6587\uFF08\u53D1\u9001\u63D0\u95EE\u65F6\u4F5C\u4E3A\u5F15\u7528\u6750\u6599\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u6587\u7AE0\u9605\u8BFB\u9875\u70B9\u300C", (0, jsx_runtime_1.jsx)("b", { children: "\u5F15\u7528\u5230\u5BF9\u8BDD" }), "\u300D\u2192 \u6587\u7AE0\u4F5C\u4E3A\u4E0A\u4E0B\u6587\u5F15\u7528\u5230\u804A\u5929\u8F93\u5165\u6846\u4E0A\u65B9\uFF08chip\uFF09\uFF0C\u8349\u7A3F\u6CE8\u5165\u6807\u8BB0\u884C\uFF1B\u53D1\u9001\u540E\u81EA\u52A8\u89E3\u9664\u3002\u5173\u95ED\u672C\u6A21\u5757\uFF08\u5361\u7247\u5F00\u5173\uFF09\u540E\u5F15\u7528\u6309\u94AE\u4E0E\u4E0A\u4E0B\u6587\u6761\u9690\u85CF\u3002"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u5F85\u529E\u63D0\u9192 \u00B7 \u5173\u6CE8" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9996\u9875\u300C\u5F85\u529E\u5361\u300D\u5C55\u793A\u672A\u8FC7\u671F\u622A\u6B62\u4E8B\u9879\uFF08\u22647 \u5929\uFF09\uFF0C\u652F\u6301\u7559\u5B58/\u5F52\u6863\uFF1B\u5173\u6CE8\u65E0\u4E0A\u9650\uFF0C\u6587\u7AE0\u9875 \u2605 \u52A0\u5165\u3002\u5173\u95ED\u672C\u6A21\u5757\u540E\u5F85\u529E\u5361\u4E0E\u5173\u6CE8\u5165\u53E3\u9690\u85CF\u3002" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9762\u677F\u56FA\u5B9A" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9762\u677F\u5934\u90E8 \uD83D\uDCCC \u56FA\u5B9A\u540E\uFF0C\u70B9\u51FB\u5916\u90E8/Esc \u4E0D\u5173\u95ED\uFF0C\u4EC5 \u2715 \u5173\u95ED\uFF08\u72B6\u6001\u6301\u4E45\u5316\uFF09\u3002" })] })] })), page === 'cloud' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6570\u636E\u6E90" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6570\u636E\u5B58\u4E8E GitHub \u79C1\u6709\u4ED3\u5E93\uFF08`zhouxuanting52-lab/cau-portal` \u7684 data/\uFF09\uFF0C\u7531 Actions \u6BCF 2 \u5C0F\u65F6\u6293\u53D6+AI \u52A0\u5DE5\u5E76\u63D0\u4EA4\uFF1B\u9762\u677F\u4E0E MCP \u76F4\u63A5\u8BFB\u4E91\u7AEF\u3002\u5173\u95ED\u672C\u6A21\u5757\u5C06\u5B8C\u5168\u505C\u6B62\u6570\u636E\u8BFB\u53D6\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: cloudState === 'loading', onClick: () => void checkCloud(), children: cloudState === 'loading' ? '检查中…' : '连通性检查' }), cloudState === 'ok' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: cloudMsg }), cloudState === 'fail' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: cloudMsg })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.slice(0, 3).map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, " \u2197"] }, l.key))) })] }) })), page === 'security' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u7EDF\u4E00\u95E8\u6237\u5BC6\u7801\uFF08\u9636\u6BB5 5\uFF09" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5B9E\u9A8C\u529F\u80FD\uFF08\u4EE3\u767B\u5F55\u7EDF\u4E00\u95E8\u6237\uFF09\uFF0C\u9636\u6BB5 5 \u624D\u5F00\u653E\uFF1B\u82E5\u5F00\u653E\u4E5F\u4EC5\u5B58\u672C\u673A\u3001\u4E0D\u8FDB\u4ED3\u5E93\u3001\u4E0D\u8FDB AI \u5BF9\u8BDD\u3002" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "password", placeholder: "\u6682\u672A\u5F00\u653E", disabled: true })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u5BC6\u94A5\u4E0E\u91CD\u8981\u94FE\u63A5" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5E38\u7528\u9875\u9762\u4E00\u952E\u76F4\u8FBE\uFF1B\u4EE4\u724C\u8BE6\u60C5\u4E0E\u8FC7\u671F\u65E5\u5728\u300C\u4EE4\u724C\u7BA1\u7406\u300D\u9875\u7EF4\u62A4\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, " \u2197"] }, l.key))) })] })] }))] }));
}

return module.exports; })();
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.backfillFollowCaches = backfillFollowCaches;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const GH_REPO = 'zhouxuanting52-lab/cau-portal';
const GH_BRANCH = 'main';
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        throw new Error('未配置 GitHub 只读令牌');
    try {
        return await ghFetchText(rel, t);
    }
    catch {
        return serverProxyText(rel, t);
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
async function backfillFollowCaches(token) {
    const follow = loadFollow();
    const cache = loadFollowCacheAll();
    let got = 0;
    for (const f of follow) {
        if (!f?.id || (cache[f.id] && cache[f.id].article))
            continue;
        const art = await readCloudJson(`data/articles/${f.id}.json`, token);
        if (art) {
            cache[f.id] = { cached_at: Date.now(), article: art };
            got++;
        }
        // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
    }
    if (got)
        saveFollowCacheAll(cache);
    return got;
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' });
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}

return module.exports; })();
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
/** 设置页错误边界：出错了显示错误文字（便于定位），不再静默白屏 */
class CauSettingsBoundary extends react_1.Component {
    state = { err: null };
    static getDerivedStateFromError(err) {
        return { err };
    }
    componentDidCatch(err) {
        console.error('[cau-portal settings]', err);
    }
    render() {
        if (this.state.err) {
            return (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setErr", children: ["\u8BBE\u7F6E\u9875\u52A0\u8F7D\u51FA\u9519\uFF1A", String(this.state.err?.message || this.state.err)] });
        }
        return this.props.children;
    }
}
let bundleCache = null;
const CACHE_MS = 60000;
async function tryJson(rel, token) {
    try {
        return { ok: true, data: JSON.parse(await (0, data_1.readCloudText)(rel, token)) };
    }
    catch (e) {
        const msg = String(e?.message ?? e);
        return { ok: false, reason: (/404/.test(msg) ? 'missing' : 'error'), message: msg };
    }
}
async function loadBundle(token) {
    if (bundleCache && Date.now() - bundleCache.ts < CACHE_MS)
        return bundleCache;
    const [idx, sum] = await Promise.all([tryJson('data/index.json', token), tryJson('data/summary.json', token)]);
    const bundle = { ts: Date.now(), index: idx.ok ? idx.data : null, summary: sum.ok ? sum.data : null };
    bundleCache = bundle;
    return bundle;
}
/** 页面加载时初始化按钮未读计数（不弹窗；无令牌/无 summary 时返回 0） */
async function fetchUnreadCount() {
    const token = (0, data_1.loadSettings)().githubToken;
    if (!token)
        return 0;
    const b = await loadBundle(token);
    if (!b.summary)
        return 0;
    const readSet = (0, data_1.loadReadSet)();
    return (b.summary.important ?? []).filter((it) => !readSet.includes(it.article_id || it.url)).length;
}
function ensureToken() {
    const s = (0, data_1.loadSettings)();
    if (s.githubToken)
        return s.githubToken;
    const input = window.prompt('农大门户需要 GitHub 只读令牌才能读取云端数据。\n请粘贴 cau-portal-read 令牌（github_pat_ 开头）：');
    if (!input)
        return null;
    const t = input.trim();
    if (!t.startsWith('github_pat_')) {
        window.alert('令牌格式不对（应以 github_pat_ 开头），未保存。');
        return null;
    }
    (0, data_1.saveSettings)({ ...s, githubToken: t });
    return t;
}
function shortTime(iso) {
    if (!iso)
        return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
/**
 * 测量「上方栏」（会话头部：标题行 + 对话/轨迹标签）高度，让面板从它下方开始。
 * 优先实测会话头部组件（.wSkVaW_header，DSH 随版本可能换 hash，故保留结构兜底）；
 * 失败退回 56px（会话头部常见高度）+ 默认 12px。
 */
function measureTopInset() {
    try {
        const header = document.querySelector('.wSkVaW_header');
        if (header) {
            const r = header.getBoundingClientRect();
            if (r.height > 0 && r.height < 400)
                return Math.ceil(r.top + r.height) + 8;
        }
        const frame = document.querySelector('.pI_x6G_frame');
        if (frame) {
            const r = frame.getBoundingClientRect();
            if (r.top > 0)
                return Math.ceil(r.top) + 8;
        }
        const col = document.querySelector('.pI_x6G_centerCol');
        if (col) {
            const first = col.firstElementChild;
            if (first) {
                const fr = first.getBoundingClientRect();
                const colH = col.getBoundingClientRect().height || window.innerHeight;
                if (fr.height > 0 && fr.height < colH * 0.5)
                    return Math.ceil(fr.height) + 8;
            }
        }
    }
    catch {
        /* noop */
    }
    return 56;
}
// ---- 归档视图（已归档待办）----
function ArchiveView(props) {
    const [rows, setRows] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        void (async () => {
            const token = (0, data_1.loadSettings)().githubToken;
            if (!token)
                return;
            const b = await loadBundle(token);
            const ops = (0, data_1.loadDeadlineOps)();
            const list = (b.summary?.deadlines || []).filter((d) => ops[d.article_id || d.url] === 'archive');
            setRows(list);
        })();
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_backBtn", onClick: props.onBack, children: "\u2039 \u8FD4\u56DE" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: "\u5DF2\u5F52\u6863\u5F85\u529E" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [rows.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u6682\u65E0\u5F52\u6863\u5F85\u529E" }), rows.map((d) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlRow", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_dlTitleWrap", onClick: () => props.onOpenArticle(d.article_id || d.url), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlItem", children: d.item }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlTitle", children: d.title })] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlCol", children: d.date })] }, d.article_id || d.url)))] })] }));
}
// ---- 关注视图（无上限）----
function FollowView(props) {
    const list = (0, data_1.loadFollow)();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_backBtn", onClick: props.onBack, children: "\u2039 \u8FD4\u56DE" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_breadPath", children: ["\u5173\u6CE8\uFF08", list.length, "\uFF09"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [list.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u8FD8\u6CA1\u6709\u5173\u6CE8\u5185\u5BB9" }), list.map((it) => ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_row", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowMain", onClick: () => props.onOpenArticle(it.id), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowTitle", children: it.title }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowMeta", children: [it.column, it.source].filter(Boolean).join(' · ') })] }) }, it.id)))] })] }));
}
function CauPanel(props) {
    const { outsideIgnore, emblem, nameSvg, onClose, onUnreadChange } = props;
    const rootRef = (0, react_1.useRef)(null);
    const [stack, setStack] = (0, react_1.useState)([{ name: 'home' }]);
    const [metaTime, setMetaTime] = (0, react_1.useState)('');
    const [unread, setUnread] = (0, react_1.useState)(0);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [pinned, setPinned] = (0, react_1.useState)(() => !!(0, data_1.loadSettings)().panelPinned);
    const [topInset, setTopInset] = (0, react_1.useState)(() => measureTopInset());
    const view = stack[stack.length - 1];
    const togglePinned = () => setPinned((p) => {
        const next = !p;
        (0, data_1.saveSettings)({ ...(0, data_1.loadSettings)(), panelPinned: next });
        return next;
    });
    // 头部更新时间 + 初始未读
    (0, react_1.useEffect)(() => {
        void (async () => {
            const token = (0, data_1.loadSettings)().githubToken;
            if (!token)
                return;
            const b = await loadBundle(token);
            if (b.summary?.last_updated || b.index?.last_updated)
                setMetaTime(shortTime(b.summary?.last_updated || b.index?.last_updated));
            const readSet = (0, data_1.loadReadSet)();
            const n = (b.summary?.important || []).filter((it) => !readSet.includes(it.article_id || it.url)).length;
            setUnread(n);
        })();
    }, []);
    (0, react_1.useEffect)(() => {
        onUnreadChange?.(unread);
    }, [unread, onUnreadChange]);
    // 阶段6：聊天区 toolview 卡片「在面板中打开」→ 跳转到文章
    (0, react_1.useEffect)(() => {
        return (0, bus_1.subscribeBus)(() => {
            try {
                const req = (0, bus_1.getOpenRequest)();
                if (req && req.id) {
                    if (!(view?.name === 'article' && view.id === req.id))
                        openArticle(req.id);
                    (0, bus_1.clearOpenRequest)();
                }
            }
            catch (e) {
                console.error('[cau-portal] open', e);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view?.name, view?.id]);
    // 阶段6：面板挂载时，若有尚未消费的「在面板中打开」请求，先跳到对应文章
    //（面板关闭时点击卡片 → 展开抽屉发生在发信号之后，订阅回调收不到已过信号，故此处补一次）
    (0, react_1.useEffect)(() => {
        try {
            const req = (0, bus_1.getOpenRequest)();
            if (req && req.id) {
                openArticle(req.id);
                (0, bus_1.clearOpenRequest)();
            }
        }
        catch (e) {
            console.error('[cau-portal] open-on-mount', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // 点击外部（面板与按钮之外）/ Esc 关闭
    (0, react_1.useEffect)(() => {
        const onDoc = (e) => {
            if (pinned)
                return;
            const t = e.target;
            if (rootRef.current?.contains(t))
                return;
            if (outsideIgnore?.contains(t))
                return;
            onClose();
        };
        const onKey = (e) => {
            if (pinned)
                return;
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, [outsideIgnore, onClose, pinned]);
    const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    const openArticle = (id, siteName, columnName, siblings, index) => setStack((s) => [...s, { name: 'article', id, back: s[s.length - 1], siteName, columnName, siblings, index }]);
    const replaceArticle = (id, siblings, index) => setStack((s) => {
        const top = s[s.length - 1];
        if (top.name === 'article')
            return [...s.slice(0, -1), { ...top, id, siblings, index }];
        return [...s, { name: 'article', id, back: top, siblings, index }];
    });
    const openColumn = (site, column) => setStack((s) => [...s, column ? { name: 'column', site, column } : { name: 'site', site }]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: rootRef, className: "dsh-cau_panel", role: "dialog", "aria-label": "\u519C\u5927\u95E8\u6237", style: { ['--cau-panel-top']: `${topInset}px` }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_panelHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_panelEmblem", dangerouslySetInnerHTML: { __html: emblem } }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_panelName", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_panelNameImg", dangerouslySetInnerHTML: { __html: nameSvg } }), showSettings && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_panelTitle", children: "\u8BBE\u7F6E" })] }), !showSettings && metaTime && (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_panelMeta", children: ["\u66F4\u65B0 ", metaTime] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_panelPin", "data-pinned": pinned, "aria-pressed": pinned, "aria-label": pinned ? '取消固定面板' : '固定面板', title: pinned ? '取消固定（点击外部/Esc 会关闭）' : '固定面板（点击外部/Esc 不关闭）', onClick: togglePinned, children: (0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" }) }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_panelTab", "aria-pressed": false, onClick: () => setStack((s) => [...s, { name: 'manage' }]), children: "\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_panelTab", "aria-pressed": showSettings, onClick: () => setShowSettings((v) => !v), children: showSettings ? '返回首页' : '设置' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_panelClose", "aria-label": "\u5173\u95ED", onClick: onClose, children: "\u2715" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_panelBody", children: showSettings ? ((0, jsx_runtime_1.jsx)(CauSettingsBoundary, { children: (0, jsx_runtime_1.jsx)(settings_1.CauSettings, {}) })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [view.name === 'home' && ((0, jsx_runtime_1.jsx)(panel_home_1.HomeView, { onOpenColumn: openColumn, onOpenArticle: (id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx), onViewArchive: () => setStack((s) => [...s, { name: 'archive' }]), onViewFollow: () => setStack((s) => [...s, { name: 'follow' }]) })), view.name === 'site' && ((0, jsx_runtime_1.jsx)(panel_column_1.ColumnView, { site: view.site, onBack: back, onOpenArticle: (id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx), onOpenColumn: openColumn })), view.name === 'column' && ((0, jsx_runtime_1.jsx)(panel_column_1.ColumnView, { site: view.site, column: view.column, onBack: back, onOpenArticle: (id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx), onOpenColumn: openColumn })), view.name === 'article' && ((0, jsx_runtime_1.jsx)(panel_article_1.ArticleView, { articleId: view.id, siteName: view.siteName, columnName: view.columnName, onBack: back, onOpenArticle: replaceArticle, siblings: view.siblings, index: view.index })), view.name === 'archive' && (0, jsx_runtime_1.jsx)(ArchiveView, { onBack: back, onOpenArticle: (id) => openArticle(id) }), view.name === 'follow' && (0, jsx_runtime_1.jsx)(FollowView, { onBack: back, onOpenArticle: (id) => openArticle(id) }), view.name === 'manage' && (0, jsx_runtime_1.jsx)(panel_manage_1.ManageView, { onBack: back })] })) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_panelFoot", children: "\u6570\u636E\u6765\u81EA GitHub \u4E91\u7AEF \u00B7 \u6BCF 2 \u5C0F\u65F6\u81EA\u52A8\u66F4\u65B0 \u00B7 \u5173\u6CE8\u65E0\u4E0A\u9650 \u00B7 \u5F85\u529E\u53EF\u7559\u5B58/\u5F52\u6863" })] }));
}
exports.PANEL_CSS = `
.dsh-cau_panel{position:fixed;top:var(--cau-panel-top,12px);right:12px;bottom:12px;z-index:30;display:flex;flex-direction:column;width:var(--cau-panel-w,540px);max-width:calc(100vw - 48px);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 90%,transparent);backdrop-filter:blur(18px) saturate(1.15);-webkit-backdrop-filter:blur(18px) saturate(1.15);border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.1));border-radius:16px;box-shadow:var(--dsw-shadow-lv3,0 8px 28px rgba(0,0,0,.18));overflow:hidden;animation:dsh-cau-fadein .16s ease-out;--cau-brand:#008038}
body[data-ds-dark-theme] .dsh-cau_panel{--cau-brand:#00b856}
body.dsh-cau-drawer-open{--cau-panel-w:max(0px,min(540px,calc(100vw - 640px)))}
body.dsh-cau-drawer-open [data-conversation-scroll]{margin-right:calc(var(--cau-panel-w) + 24px);transition:margin-right var(--ds-transition-duration-slow,.2s) var(--ds-ease-in-out,ease-out)}
@keyframes dsh-cau-fadein{from{opacity:0}to{opacity:1}}
@keyframes dsh-cau-spin{to{transform:rotate(360deg)}}
.dsh-cau_panelHead{flex:none;display:flex;align-items:center;height:44px;padding:0 12px;gap:8px;border-bottom:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06))}
.dsh-cau_panelEmblem{flex:none;display:flex;color:var(--cau-brand)}
.dsh-cau_panelEmblem svg{display:block;height:18px;width:auto}
.dsh-cau_panelName{flex:1;min-width:0;display:flex;align-items:center;gap:6px;overflow:hidden}
.dsh-cau_panelNameImg{flex:none;display:flex;align-items:center}
.dsh-cau_panelNameImg svg{display:block;width:auto;height:22px}
.dsh-cau_panelTitle{flex:none;font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary,#555);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_panelMeta{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_panelClose{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);cursor:pointer;font-size:13px;line-height:1}
.dsh-cau_panelClose:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_panelPin{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary,#888);cursor:pointer}
.dsh-cau_panelPin:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_panelPin svg{display:block;height:15px;width:auto}
.dsh-cau_panelPin[data-pinned='true']{color:var(--cau-brand)}
.dsh-cau_panelTab{flex:none;height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:11px;cursor:pointer;white-space:nowrap}
.dsh-cau_panelTab:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_panelTab[aria-pressed="true"]{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-primary,#111);border-color:var(--cau-brand,#008038)}
.dsh-cau_panelBody{flex:1;min-height:0;overflow-y:auto;padding:4px 12px 12px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2)) transparent}
.dsh-cau_panelBody::-webkit-scrollbar{width:8px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2));border-radius:4px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,rgba(0,0,0,.3))}
.dsh-cau_panelFoot{flex:none;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06));font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_view{display:block}
.dsh-cau_loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:28px 0;font-size:12px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.1));border-top-color:var(--dsw-alias-label-tertiary,#888);animation:dsh-cau-spin .8s linear infinite}
.dsh-cau_msg{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin:14px 0 4px;padding:12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:8px}
.dsh-cau_msgText{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_msgBtn{display:inline-flex;align-items:center;padding:5px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_msgBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_msgBtnPrimary{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:transparent;color:#fff}
.dsh-cau_hint{margin-top:8px;padding:8px 10px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04));font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_hintErr{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_sec{margin-top:14px}
.dsh-cau_sec:first-child{margin-top:6px}
.dsh-cau_secHead{display:flex;align-items:center;height:20px;margin-bottom:6px;gap:6px}
.dsh-cau_secMark{flex:none;width:3px;height:12px;border-radius:2px;background:var(--cau-brand)}
.dsh-cau_secTitle{flex:1;min-width:0;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_card{border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.08));border-radius:8px;padding:4px;overflow:hidden}
.dsh-cau_empty{padding:10px 8px;font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_textBtn{padding:0 4px;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-state-business-primary,#4176e6);font-size:11px;cursor:pointer}
.dsh-cau_textBtn:hover{text-decoration:underline}
.dsh-cau_textBtn.dsh-cau_on{color:var(--cau-brand);font-weight:600}
.dsh-cau_bread{display:flex;align-items:center;gap:8px;padding:2px 0 8px}
.dsh-cau_backBtn{flex:none;padding:3px 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-state-business-primary,#4176e6);font-size:12px;cursor:pointer}
.dsh-cau_backBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_breadPath{flex:1;min-width:0;font-size:11px;color:var(--dsw-alias-label-tertiary,#999);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_dlRow{padding:6px 8px;border-radius:6px}
.dsh-cau_dlRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.dsh-cau_dlTop{display:flex;align-items:baseline;gap:6px;min-width:0}
.dsh-cau_dlItem{flex:none;font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.dsh-cau_dlDate{flex:none;font-size:11px;font-weight:500;color:var(--dsw-alias-state-warn,#f59e0b)}
.dsh-cau_dlCol{flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_dlTitleWrap{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px}
.dsh-cau_dlTitle{flex:1;min-width:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.dsh-cau_dlTitle:hover{color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_dlAct{flex:none;display:flex;gap:6px}
.dsh-cau_impRow{display:flex;gap:7px;width:100%;padding:7px 8px;border-radius:6px}
.dsh-cau_impRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.dsh-cau_impDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#999);margin-top:5px}
.dsh-cau_impDot[data-read='1']{opacity:0}
.dsh-cau_impMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_impTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_impTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_impSummary{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#555);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_impMeta{font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_followBtn{flex:none;align-self:flex-start;height:24px;min-width:24px;margin-right:10px;padding:0 4px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary,#999);font-size:15px;line-height:24px;cursor:pointer}
.dsh-cau_followBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_followBtn.dsh-cau_on{color:var(--cau-brand)}
.dsh-cau_badge{flex:none;font-size:10px;line-height:16px;padding:0 5px;border-radius:4px;font-weight:500}
.dsh-cau_badgeHigh{color:var(--dsw-alias-state-error-primary,#ec1313);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#ec1313) 12%,transparent)}
.dsh-cau_badgeMid{color:var(--dsw-alias-state-warn,#c77d00);background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 16%,transparent)}
.dsh-cau_badgeLow{color:var(--dsw-alias-label-tertiary,#888);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}
.dsh-cau_colGroup{margin-bottom:10px}
.dsh-cau_colGroup:last-child{margin-bottom:0}
.dsh-cau_colSiteBtn{display:block;width:100%;padding:5px 8px;border:none;border-radius:6px;background:transparent;text-align:left;font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary,#111);cursor:pointer}
.dsh-cau_colSiteBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_colChips{display:flex;flex-wrap:wrap;gap:6px;padding-left:8px}
.dsh-cau_chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:999px;font-size:12px;color:var(--dsw-alias-label-secondary,#555);cursor:default;background:transparent}
.dsh-cau_chipBtn{cursor:pointer}
.dsh-cau_chipBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_chipCount{font-style:normal;font-size:10px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_quick{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.dsh-cau_quickLink{display:flex;align-items:center;justify-content:center;padding:7px 8px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.12));border-radius:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#555);text-decoration:none}
.dsh-cau_quickLink:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_tags{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px}
.dsh-cau_tag{padding:3px 9px;border:none;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-secondary,#555);font-size:11px;cursor:pointer}
.dsh-cau_tagOn{background:color-mix(in srgb,var(--cau-brand) 18%,transparent);color:var(--cau-brand)}
.dsh-cau_list{display:flex;flex-direction:column}
.dsh-cau_row{display:flex;gap:7px;width:100%;padding:7px 8px;border:none;border-radius:6px;background:transparent;text-align:left;cursor:pointer;font:inherit;color:inherit}
.dsh-cau_row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04))}
.dsh-cau_rowDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#999);margin-top:5px}
.dsh-cau_rowDot[data-read='1']{opacity:0}
.dsh-cau_rowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_rowTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_rowTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_rowSummary{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#555);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_rowMeta{font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_atitle{font-size:16px;font-weight:600;line-height:24px;color:var(--dsw-alias-label-primary,#111);margin:2px 0 6px}
.dsh-cau_ameta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#999);margin-bottom:10px}
.dsh-cau_aimgTag{padding:0 5px;border-radius:4px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-tertiary,#888)}
.dsh-cau_asummary{padding:10px 12px;border-radius:8px;background:color-mix(in srgb,var(--cau-brand) 7%,transparent);margin-bottom:10px}
.dsh-cau_asumHead{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--cau-brand);margin-bottom:4px}
.dsh-cau_asumText{font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary,#111)}
.dsh-cau_adeadline{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;padding:9px 12px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 12%,transparent);margin-bottom:10px}
.dsh-cau_adeadlineIcon{font-size:13px}
.dsh-cau_adeadlineItem{font-size:13px;font-weight:600;color:var(--dsw-alias-state-warn,#c77d00)}
.dsh-cau_adeadlineDate{font-size:12px;font-weight:600;color:var(--dsw-alias-state-warn,#c77d00)}
.dsh-cau_adeadlineEv{font-size:11px;color:var(--dsw-alias-label-secondary,#555)}
.dsh-cau_abody{font-size:14px;line-height:26px;color:var(--dsw-alias-label-primary,#111);white-space:pre-wrap;word-break:break-word}
.dsh-cau_aactions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.06))}
.dsh-cau_aBtn{display:inline-flex;align-items:center;padding:5px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_aBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_aBtnOn{border-color:color-mix(in srgb,var(--cau-brand) 45%,transparent);color:var(--cau-brand)}
.dsh-cau_aBtnPrimary{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:transparent;color:#fff}
.dsh-cau_aBtnPrimary:hover{background:var(--dsw-alias-state-business-primary,#4176e6);opacity:.92}
.dsh-cau_anav{display:flex;justify-content:space-between;margin-top:12px}
.dsh-cau_anavBtn{flex:none;padding:5px 10px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-state-business-primary,#4176e6);font-size:12px;cursor:pointer}
.dsh-cau_anavBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_acacheTag{padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--cau-brand) 10%,transparent);color:var(--cau-brand)}
.dsh-cau_mgIntro{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#555);margin:4px 0 10px}
.dsh-cau_mgToolbar{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
.dsh-cau_mgSearch{width:100%;box-sizing:border-box;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;outline:none}
.dsh-cau_mgSearch:focus{border-color:color-mix(in srgb,var(--cau-brand) 55%,transparent)}
.dsh-cau_mgFilters{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dsh-cau_mgChip{height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:11px;cursor:pointer}
.dsh-cau_mgChip:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_mgChip.on{background:color-mix(in srgb,var(--cau-brand) 12%,transparent);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_mgSel{height:24px;padding:0 6px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:11px}
.dsh-cau_mgActs{display:flex;gap:6px;flex-wrap:wrap}
.dsh-cau_mgBtn{height:26px;padding:0 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#111);font-size:12px;cursor:pointer}
.dsh-cau_mgBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dsh-cau_mgBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_mgBtn.warn{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 45%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_mgBar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.045));font-size:12px;color:var(--dsw-alias-label-secondary,#555);margin-bottom:8px}
.dsh-cau_mgDel{flex:none;height:28px;padding:0 14px;border:none;border-radius:6px;background:var(--dsw-alias-state-error-primary,#e5484d);color:#fff;font-size:12px;cursor:pointer}
.dsh-cau_mgDel:hover{opacity:.9}
.dsh-cau_mgDel:disabled{opacity:.45;cursor:default}
.dsh-cau_mgConfirm{margin-bottom:8px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 35%,transparent);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 6%,transparent)}
.dsh-cau_mgConfirmText{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary,#111);margin-bottom:8px}
.dsh-cau_mgConfirmActs{display:flex;gap:6px}
.dsh-cau_mgMsg{margin:6px 0;padding:8px 10px;border-radius:8px;font-size:12px;line-height:18px}
.dsh-cau_mgMsg.ok{background:color-mix(in srgb,var(--dsw-alias-state-success,#2f9e44) 10%,transparent);color:var(--dsw-alias-state-success,#2f9e44)}
.dsh-cau_mgMsg.error{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_mgList{display:flex;flex-direction:column;gap:10px}
.dsh-cau_mgGroup{border:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.08));border-radius:10px;overflow:hidden}
.dsh-cau_mgGroupName{padding:6px 10px;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#555);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.03))}
.dsh-cau_mgRow{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-inverted,rgba(15,17,21,.05));cursor:pointer}
.dsh-cau_mgRow input{margin-top:3px}
.dsh-cau_mgRowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dsh-cau_mgRowTitle{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mgStar{color:var(--dsw-alias-state-warn,#c77d00);margin-left:4px}
.dsh-cau_mgRowSub{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11px;color:var(--dsw-alias-label-tertiary,#999)}
.dsh-cau_mgOld{padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--dsw-alias-state-warn,#f59e0b) 14%,transparent);color:var(--dsw-alias-state-warn,#c77d00)}
.dsh-cau_mgHl{color:var(--cau-brand);font-weight:600;background:color-mix(in srgb,var(--cau-brand) 12%,transparent);border-radius:3px;padding:0 1px}
.dsh-cau_mgRowUrl{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

return module.exports; })();
var settings_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_CSS = void 0;
exports.CauSettings = CauSettings;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 设置页（2026-08-29 重构：分组卡片「一筐一筐」管理）：
 * 首页 = 分组卡片墙（每卡右上角启用/禁用开关 + 状态徽章）＋ 顶部提醒条（红=基本需求不满足 / 黄=注意）。
 * 子页：① AI 加工·模型配置（模型选择 + 用量柱状图 7/30/90 天 + 指标切换 + 分账表）
 *      ② 令牌管理（多令牌登记：值/过期日/剩余天数/快捷跳转 GitHub 管理页/逐枚开关）
 *      ③ 面板偏好（自动附加 + 引用协同开关） ④ 待办提醒与关注 ⑤ 数据源（连通检查） ⑥ 安全·门户与链接。
 * 全部纯客户端（localStorage），浏览器刷新生效。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.backfillFollowCaches = backfillFollowCaches;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const GH_REPO = 'zhouxuanting52-lab/cau-portal';
const GH_BRANCH = 'main';
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        throw new Error('未配置 GitHub 只读令牌');
    try {
        return await ghFetchText(rel, t);
    }
    catch {
        return serverProxyText(rel, t);
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0] || loadSettings().githubToken;
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
/** 一次性补齐关注缓存：对尚未缓存的关注文章尝试从云端拉取快照（面板挂载时静默调用） */
async function backfillFollowCaches(token) {
    const follow = loadFollow();
    const cache = loadFollowCacheAll();
    let got = 0;
    for (const f of follow) {
        if (!f?.id || (cache[f.id] && cache[f.id].article))
            continue;
        const art = await readCloudJson(`data/articles/${f.id}.json`, token);
        if (art) {
            cache[f.id] = { cached_at: Date.now(), article: art };
            got++;
        }
        // 云端已裁剪的旧关注：跳过（该文章仅在关注时之外无快照，阅读时走「已过保留期」提示）
    }
    if (got)
        saveFollowCacheAll(cache);
    return got;
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期` });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）` });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口' });
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}

return module.exports; })();
var ctx_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCtx = bindCtx;
exports.getCtx = getCtx;
/**
 * 跨组件树共享插件 ctx（面板树 ↔ 设置页 都要用会话服务与模型目录）。
 *
 * 注意：build.mjs 的内联器**不做模块去重**——同一个模块被两处 require 会内联成
 * 两份独立 IIFE，各自持有自己的模块级状态。因此这里不能用模块级变量存单例，
 * 必须挂到 window 上（全局、跨所有内联副本共享），否则 bindCtx/getCtx 会读错对象。
 */
function bindCtx(c) {
    ;
    window.__CAU_CTX__ = c;
}
function getCtx() {
    return window.__CAU_CTX__;
}

return module.exports; })();
const noop = () => { };
exports.SETTINGS_CSS = `
.dsh-cau_set{display:flex;flex-direction:column;gap:14px;padding:16px 0 24px;max-width:640px}
/* ---- 提醒条 ---- */
.dsh-cau_alert{display:flex;align-items:flex-start;gap:8px;padding:9px 12px;border-radius:8px;font-size:12px;line-height:17px}
.dsh-cau_alert.error{border:1px solid var(--dsw-alias-state-error-primary,rgba(229,72,77,.5));background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_alert.warn{border:1px solid var(--dsw-alias-state-warn,rgba(255,180,0,.5));background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 10%,transparent);color:var(--dsw-alias-state-warn,#d99c00)}
.dsh-cau_alertDot{flex:none;width:8px;height:8px;margin-top:4px;border-radius:50%;background:currentColor}
/* ---- 分组卡片 ---- */
.dsh-cau_cards{display:flex;flex-direction:column;gap:10px}
.dsh-cau_card{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));border-radius:12px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.03));cursor:pointer;transition:border-color .12s ease}
.dsh-cau_card:hover{border-color:color-mix(in srgb,var(--cau-brand,#008038) 55%,transparent)}
.dsh-cau_cardMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.dsh-cau_cardName{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_cardIcon{flex:none;font-size:15px;line-height:1}
.dsh-cau_cardDesc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cardBadge{flex:none;font-size:11px;padding:2px 7px;border-radius:999px;white-space:nowrap}
.dsh-cau_cardBadge.ok{background:color-mix(in srgb,var(--dsw-alias-state-success,#2f9e44) 14%,transparent);color:var(--dsw-alias-state-success,#2f9e44)}
.dsh-cau_cardBadge.warn{background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 14%,transparent);color:var(--dsw-alias-state-warn,#d99c00)}
.dsh-cau_cardBadge.off{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.07));color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cardBadge.err{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 14%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
/* ---- 开关 ---- */
.dsh-cau_switch{flex:none;position:relative;width:34px;height:20px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.2));border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));cursor:pointer;transition:background .15s ease,border-color .15s ease}
.dsh-cau_switch span{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#8b95a5);transition:transform .15s ease,background .15s ease}
.dsh-cau_switch.on{border-color:color-mix(in srgb,var(--cau-brand,#008038) 60%,transparent);background:color-mix(in srgb,var(--cau-brand,#008038) 22%,transparent)}
.dsh-cau_switch.on span{transform:translateX(14px);background:var(--cau-brand,#008038)}
/* ---- 子页 ---- */
.dsh-cau_setPageHead{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dsh-cau_setSubBack{flex:none;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;cursor:pointer}
.dsh-cau_setSubBack:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
.dsh-cau_setBlocks{display:flex;flex-direction:column;gap:14px}
.dsh-cau_setBlock{display:flex;flex-direction:column;gap:8px}
.dsh-cau_setTitle{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_setTitle::before{content:"";flex:none;width:3px;height:12px;border-radius:2px;background:var(--cau-brand,#008038)}
.dsh-cau_setDesc{font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_setRow{display:flex;align-items:center;gap:10px}
.dsh-cau_setLabel{flex:1;min-width:0;font-size:13px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_setInput{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;outline:none}
.dsh-cau_setInput:focus{border-color:var(--cau-brand,#008038)}
.dsh-cau_setSelect{box-sizing:border-box;min-width:0;flex:1;height:32px;padding:0 8px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:var(--dsw-specific-menu,#1b1e24);color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;outline:none;cursor:pointer}
.dsh-cau_setBtn{flex:none;height:32px;padding:0 14px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:12px;cursor:pointer}
.dsh-cau_setBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
.dsh-cau_setBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_setBtn.danger{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 45%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_setHint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_setOk{font-size:12px;color:var(--dsw-alias-state-success,#34c77b)}
.dsh-cau_setErr{font-size:12px;color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_setWarn{font-size:12px;line-height:17px;color:var(--dsw-alias-state-warn,#ffb400)}
.dsh-cau_setCheck{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#9aa4b2);cursor:pointer}
.dsh-cau_setCheck input{accent-color:var(--cau-brand,#008038)}
.dsh-cau_infoCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:8px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.03))}
/* ---- 用量图 ---- */
.dsh-cau_chart{display:block;width:100%;height:150px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
.dsh-cau_chip{height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);font-size:11px;cursor:pointer}
.dsh-cau_chip.on{background:color-mix(in srgb,var(--cau-brand,#008038) 14%,transparent);border-color:var(--cau-brand,#008038);color:var(--cau-brand,#00b856)}
.dsh-cau_usageTable{width:100%;border-collapse:collapse;font-size:12px;color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_usageTable th,.dsh-cau_usageTable td{padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.08));text-align:right;white-space:nowrap}
.dsh-cau_usageTable th:first-child,.dsh-cau_usageTable td:first-child{text-align:left}
.dsh-cau_usageTable th{color:var(--dsw-alias-label-tertiary,#8b95a5);font-weight:500}
/* ---- 令牌 ---- */
.dsh-cau_tokList{display:flex;flex-direction:column;gap:8px}
.dsh-cau_tok{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));border-radius:10px}
.dsh-cau_tokMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.dsh-cau_tokName{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_tokMeta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_tokActs{display:flex;gap:6px;flex:none}
.dsh-cau_tokBtn{flex:none;height:26px;padding:0 9px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.14));border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa4b2);font-size:11px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.dsh-cau_tokBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_links{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.dsh-cau_link{display:inline-flex;align-items:center;padding:5px 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.16));border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:11px;text-decoration:none;cursor:pointer}
.dsh-cau_link:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
`;
const ROLE_LABEL = {
    enrich: '爬虫管道加工',
    'on-demand': '面板按需加工',
    monitor: '监控',
    other: '其他',
};
function fmtNum(n) {
    if (n >= 1e6)
        return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4)
        return (n / 1e4).toFixed(1) + 'w';
    return String(n);
}
function daysUntil(dateStr) {
    if (!dateStr)
        return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime()))
        return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400e3);
}
function expiryBadge(expires) {
    const n = daysUntil(expires);
    if (n == null)
        return { cls: 'dsh-cau_setHint', text: '未设过期日' };
    if (n < 0)
        return { cls: 'dsh-cau_setErr', text: `已过期 ${-n} 天` };
    if (n <= 30)
        return { cls: 'dsh-cau_setWarn', text: `${n} 天后过期` };
    return { cls: 'dsh-cau_setOk', text: `${n} 天后过期` };
}
const KEY_LINKS = [
    { key: 'github-read', label: 'GitHub 令牌管理', url: 'https://github.com/settings/personal-access-tokens' },
    { key: 'repo', label: '数据仓库', url: 'https://github.com/zhouxuanting52-lab/cau-portal' },
    { key: 'actions', label: '定时抓取 Actions', url: 'https://github.com/zhouxuanting52-lab/cau-portal/actions' },
    { key: 'cron', label: 'cron-job.org', url: 'https://console.cron-job.org/jobs' },
    { key: 'ds', label: 'DeepSeek 平台', url: 'https://platform.deepseek.com' },
    { key: 'portal', label: '统一门户', url: 'https://one.cau.edu.cn' },
];
/** 自绘 SVG 柱状图（无图表库依赖） */
function BarChart({ items, unit }) {
    const W = 460;
    const H = 150;
    const PAD = 8;
    const BASE = 24;
    const TOP = 24;
    const max = Math.max(1, ...items.map((i) => i.value));
    const n = items.length;
    const step = Math.max(1, Math.ceil(n / 10));
    const slot = (W - PAD * 2) / n;
    const bw = Math.max(2, slot - 3);
    return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: `0 0 ${W} ${H}`, className: "dsh-cau_chart", role: "img", "aria-label": "\u7528\u91CF\u67F1\u72B6\u56FE", children: [(0, jsx_runtime_1.jsx)("line", { x1: PAD, y1: H - BASE, x2: W - PAD, y2: H - BASE, stroke: "currentColor", opacity: ".25" }), (0, jsx_runtime_1.jsxs)("text", { x: PAD, y: 14, fontSize: "10", fill: "currentColor", opacity: ".6", children: ["max ", fmtNum(max), " ", unit] }), items.map((it, i) => {
                const h = Math.max(1.5, (it.value / max) * (H - BASE - TOP - 10));
                const x = PAD + i * slot + (slot - bw) / 2;
                const on = it.value > 0;
                return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("rect", { x: x, y: H - BASE - h, width: bw, height: h, rx: 2, fill: on ? 'var(--cau-brand)' : 'currentColor', opacity: on ? 1 : 0.12, children: (0, jsx_runtime_1.jsx)("title", { children: `${it.label}：${fmtNum(it.value)} ${unit}` }) }), i % step === 0 && ((0, jsx_runtime_1.jsx)("text", { x: x + bw / 2, y: H - 8, fontSize: "9", fill: "currentColor", opacity: ".55", textAnchor: "middle", children: it.label }))] }, i));
            })] }));
}
function Toggle({ on, onToggle, label }) {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_switch' + (on ? ' on' : ''), "aria-pressed": on, "aria-label": label, title: on ? '点击禁用' : '点击启用', onClick: (e) => { e.stopPropagation(); onToggle(); }, children: (0, jsx_runtime_1.jsx)("span", {}) }));
}
function CauSettings(props) {
    const _ctx = (0, ctx_1.getCtx)() || {};
    const sessions = props.sessions ?? _ctx.sessions;
    const modelDirectories = props.modelDirectories ?? _ctx.modelDirectories;
    const [page, setPage] = (0, react_1.useState)('home');
    const [settings, setSettings] = (0, react_1.useState)(() => (0, data_1.loadSettings)());
    const [mods, setMods] = (0, react_1.useState)(() => (0, data_1.loadModules)());
    const [tokens, setTokens] = (0, react_1.useState)(() => (0, data_1.loadTokens)());
    const [savedFlash, setSavedFlash] = (0, react_1.useState)(false);
    const upd = (next) => {
        setSettings(next);
        (0, data_1.saveSettings)(next);
    };
    const toggleMod = (k) => {
        const next = { ...mods, [k]: !mods[k] };
        setMods(next);
        (0, data_1.saveModules)(next);
    };
    const persistTokens = (next) => {
        setTokens(next);
        (0, data_1.saveTokens)(next);
    };
    const alerts = (0, react_1.useMemo)(() => (0, data_1.computeAlerts)(), [mods, tokens, settings]);
    const flash = () => {
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 2000);
    };
    // ---------- 子页：AI 加工 · 模型配置 ----------
    const subList = (cb) => {
        try {
            return sessions?.list ? sessions.list.subscribe(cb) : noop;
        }
        catch {
            return noop;
        }
    };
    const snapList = () => {
        try {
            return sessions?.list?.getSnapshot();
        }
        catch {
            return undefined;
        }
    };
    const listSnap = (0, react_1.useSyncExternalStore)(subList, snapList);
    const sessionId = listSnap?.current;
    const [groups, setGroups] = (0, react_1.useState)([]);
    const [modelState, setModelState] = (0, react_1.useState)('idle');
    const [modelNote, setModelNote] = (0, react_1.useState)('');
    const loadModelDir = async () => {
        setModelState('loading');
        setModelNote('');
        if (!sessionId || !modelDirectories) {
            setModelState('fail');
            setModelNote('当前没有打开的会话，或模型目录服务不可用');
            return;
        }
        let d = null;
        try {
            d = modelDirectories.directoryFor(sessionId);
        }
        catch {
            setModelState('fail');
            setModelNote('当前会话无法解析模型目录');
            return;
        }
        let settled = false;
        const timer = window.setTimeout(() => {
            if (settled)
                return;
            settled = true;
            setModelState('fail');
            setModelNote('模型目录未响应（将使用服务端默认模型）');
        }, 6000);
        try {
            await d.load();
            settled = true;
            window.clearTimeout(timer);
            setGroups(d.store?.getSnapshot()?.groups || []);
            setModelState('ok');
        }
        catch {
            settled = true;
            window.clearTimeout(timer);
            setModelState('fail');
            setModelNote('模型目录加载失败（将使用服务端默认模型）');
        }
    };
    const monitor = settings.monitorModel || null;
    const selGroup = groups.find((g) => g.id === monitor?.provider) || groups[0] || null;
    const selModel = selGroup?.models?.find((m) => m.id === monitor?.model) || null;
    const pickModel = (provider, model) => upd({ ...settings, monitorModel: { provider, model } });
    // 用量
    const [rows, setRows] = (0, react_1.useState)(null);
    const [metric, setMetric] = (0, react_1.useState)('calls');
    const [days, setDays] = (0, react_1.useState)(30);
    (0, react_1.useEffect)(() => {
        let alive = true;
        void (0, data_1.loadUsageRows)().then((r) => {
            if (alive)
                setRows(r);
        });
        return () => {
            alive = false;
        };
    }, []);
    const daily = (0, react_1.useMemo)(() => (rows ? (0, data_1.buildDailyUsage)(rows, days, metric) : []), [rows, days, metric]);
    const byRole = (0, react_1.useMemo)(() => (rows ? (0, data_1.summarizeUsage)(rows, days) : null), [rows, days]);
    const METRIC_UNIT = { calls: '次', prompt: '输入tok', completion: '输出tok', cost: '元' };
    // ---------- 子页：令牌管理 ----------
    const [tokEditing, setTokEditing] = (0, react_1.useState)(null);
    const [tokDraft, setTokDraft] = (0, react_1.useState)({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    const startEdit = (t) => {
        if (t) {
            setTokEditing(t.id);
            setTokDraft({ ...t });
        }
        else {
            setTokEditing(null);
            setTokDraft({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
        }
    };
    const saveTokDraft = () => {
        const d = tokDraft;
        if (!d.name.trim())
            return;
        const rec = { ...d, id: d.id || `tok-${Date.now().toString(36)}`, value: d.value || '' };
        const next = tokEditing ? tokens.map((t) => (t.id === tokEditing ? rec : t)) : [...tokens, rec];
        persistTokens(next);
        setTokEditing(null);
        flash();
    };
    const removeTok = (id) => {
        if (!window.confirm('删除该令牌登记？（令牌值仅本机，删除后不可恢复）'))
            return;
        persistTokens(tokens.filter((t) => t.id !== id));
    };
    const toggleTok = (id) => persistTokens(tokens.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
    // ---------- 子页：数据源连通检查 ----------
    const [cloudState, setCloudState] = (0, react_1.useState)('idle');
    const [cloudMsg, setCloudMsg] = (0, react_1.useState)('');
    const checkCloud = async () => {
        setCloudState('loading');
        setCloudMsg('');
        try {
            const text = await (0, data_1.readCloudText)('data/index.json');
            const j = JSON.parse(text);
            setCloudState('ok');
            setCloudMsg(`已连通 ✓ 数据更新至 ${j.last_updated || '未知'}，条目 ${j.stats?.total_items ?? '?'} 条 / 正文 ${j.stats?.articles_stored ?? '?'} 篇`);
        }
        catch (e) {
            setCloudState('fail');
            setCloudMsg(String(e?.message || e));
        }
    };
    // ---------- 首页卡片 ----------
    const tokBadge = (() => {
        const err = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) != null && daysUntil(t.expires) < 0);
        const warn = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) <= 30 && daysUntil(t.expires) >= 0);
        const active = tokens.filter((t) => t.enabled && t.value).length;
        return err ? { cls: 'err', text: `${active} 枚在用 · ⚠ 已过期` } : warn ? { cls: 'warn', text: `${active} 枚在用 · ⚠ 临期` } : { cls: 'ok', text: `${active} 枚在用` };
    })();
    const cards = [
        {
            key: 'ai',
            icon: '🤖',
            name: 'AI 加工 · 模型配置',
            desc: '模型选择 + 用量柱状图（7/30/90 天，次数/token/费用切换）',
            badge: monitor ? { cls: 'ok', text: monitor.model } : { cls: 'warn', text: '未指定模型' },
            need: mods.ai,
            page: 'ai',
        },
        {
            key: null,
            icon: '🔑',
            name: '令牌管理',
            desc: 'GitHub / 调度桥等令牌：过期日期、剩余天数、一键跳转 GitHub 管理页',
            badge: tokBadge,
            need: true,
            page: 'tokens',
        },
        {
            key: 'context',
            icon: '💬',
            name: '面板偏好 · 引用协同',
            desc: '自动附加阅读上下文、引用到对话（上下文条/工具卡片）',
            badge: mods.context ? { cls: 'ok', text: '引用协同开' } : { cls: 'off', text: '已禁用' },
            need: mods.context,
            page: 'prefs',
        },
        {
            key: 'deadline',
            icon: '⏰',
            name: '待办提醒 · 关注',
            desc: '首页待办卡（截止提醒）与关注功能',
            badge: mods.deadline ? { cls: 'ok', text: '已启用' } : { cls: 'off', text: '已禁用' },
            need: mods.deadline,
            page: 'prefs',
        },
        {
            key: 'cloud',
            icon: '☁️',
            name: '数据源',
            desc: 'GitHub 云端数据（每 2 小时自动更新）+ 连通性检查',
            badge: mods.cloud ? { cls: 'ok', text: '已连接云端' } : { cls: 'err', text: '已禁用! 插件无数据' },
            need: mods.cloud,
            page: 'cloud',
        },
        {
            key: 'portal',
            icon: '🔐',
            name: '安全 · 门户',
            desc: '统一门户密码（阶段 5）、密钥与重要链接',
            badge: { cls: 'ok', text: '阶段5 预留' },
            need: true,
            page: 'security',
        },
    ];
    // ---------- 渲染 ----------
    const errCount = (0, react_1.useMemo)(() => alerts.filter((a) => a.level === 'error').length, [alerts]);
    if (page === 'home') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [alerts.map((a, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `dsh-cau_alert ${a.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_alertDot" }), (0, jsx_runtime_1.jsx)("span", { children: a.text })] }, i))), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5206\u9879\u7BA1\u7406\u5404\u529F\u80FD\u4E0E\u51ED\u636E\uFF1B\u6BCF\u9879\u53EF\u72EC\u7ACB\u542F\u7528/\u7981\u7528\uFF0C\u5173\u952E\u9879\u7F3A\u5931\u4F1A\u5728\u6B64\u63D0\u9192\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_cards", children: cards.map((c) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", role: "button", tabIndex: 0, onClick: () => setPage(c.page), onKeyDown: (e) => e.key === 'Enter' && setPage(c.page), children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_cardMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_cardName", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardIcon", children: c.icon }), c.name, (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_cardBadge ${c.badge.cls}`, children: c.badge.text })] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardDesc", children: c.desc })] }), c.key && (0, jsx_runtime_1.jsx)(Toggle, { on: mods[c.key], onToggle: () => toggleMod(c.key), label: `切换 ${c.name}` })] }, c.name))) })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setPageHead", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setSubBack", onClick: () => setPage('home'), children: "\u2039 \u8FD4\u56DE" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: page === 'ai' ? 'AI 加工 · 模型配置' : page === 'tokens' ? '令牌管理' : page === 'prefs' ? '面板偏好 · 引用协同' : page === 'cloud' ? '数据源' : '安全 · 门户' }), errCount > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setWarn", children: ["\u26A0 \u6709 ", errCount, " \u9879\u914D\u7F6E\u95EE\u9898"] })] }), page === 'ai' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u9009\u62E9" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u72EC\u7ACB\u914D\u7F6E\u69FD\uFF1A\u7528\u4E8E\u9762\u677F\u6309\u9700\u52A0\u5DE5\uFF08AI \u6458\u8981/\u5206\u7C7B/\u91CD\u8981\u5EA6/deadline\uFF09\u4E0E\u540E\u7EED\u76D1\u63A7\uFF0C\u4E0E\u4E3B\u5BF9\u8BDD\u6A21\u578B\u4E92\u4E0D\u5F71\u54CD\u3002\u6362\u6A21\u578B\u53EA\u5F71\u54CD\u4E4B\u540E\u7684\u52A0\u5DE5\uFF0C\u6570\u636E\u65E0\u9700\u91CD\u722C\u3002" }), !sessionId || !modelDirectories ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: !modelDirectories ? '模型目录服务不可用（按需加工将使用服务端默认模型）。' : '当前没有打开的会话——打开一个会话后即可从 DSH 模型目录中选择。' })) : modelState === 'loading' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u52A0\u8F7D\u4E2D\u2026" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'fail' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: modelNote }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u91CD\u8BD5" })] })) : modelState === 'ok' && groups.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u4E3A\u7A7A\uFF08\u68C0\u67E5 provider \u914D\u7F6E\u540E\u91CD\u8BD5\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'ok' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selGroup?.id || '', onChange: (e) => { const g = groups.find((x) => x.id === e.target.value); if (g?.models?.length)
                                                    pickModel(g.id, g.models[0].id); }, children: groups.map((g) => ((0, jsx_runtime_1.jsx)("option", { value: g.id, children: g.name }, g.id))) }), selGroup?.models?.length ? ((0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selModel?.id || selGroup.models[0].id, onChange: (e) => pickModel(selGroup.id, e.target.value), children: selGroup.models.map((m) => ((0, jsx_runtime_1.jsx)("option", { value: m.id, children: m.name || m.id }, m.id))) })) : null] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u5F53\u524D\uFF1A", monitor ? `${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: monitor ? `当前：${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u52A0\u8F7D\u6A21\u578B\u76EE\u5F55" })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u7528\u91CF \u00B7 \u67F1\u72B6\u56FE" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9ED8\u8BA4\u8FD1 30 \u5929\uFF1B\u65F6\u95F4\u8DE8\u5EA6\u4E0E\u6307\u6807\u53EF\u5207\u6362\uFF08\u4E91\u7AEF\u7BA1\u9053 + \u672C\u673A\u6309\u9700\u5408\u8BA1\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: [7, 30, 90].map((d) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_chip' + (days === d ? ' on' : ''), onClick: () => setDays(d), children: [d, " \u5929"] }, d))) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: ['calls', 'prompt', 'completion', 'cost'].map((m) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_chip' + (metric === m ? ' on' : ''), onClick: () => setMetric(m), children: METRIC_UNIT[m] }, m))) }), rows === null ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u52A0\u8F7D\u7528\u91CF\u4E2D\u2026" })) : daily.length === 0 || !daily.some((d) => d.value > 0) ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u8FD1 ", days, " \u5929\u6682\u65E0\u7528\u91CF\u8BB0\u5F55\uFF08AI \u52A0\u5DE5\u5C1A\u672A\u89E6\u53D1\u6216\u7528\u65F6\u4E0D\u8DB3\uFF09\u3002"] })) : ((0, jsx_runtime_1.jsx)(BarChart, { items: daily, unit: METRIC_UNIT[metric] })), byRole && Object.keys(byRole).length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("table", { className: "dsh-cau_usageTable", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "\u89D2\u8272" }), (0, jsx_runtime_1.jsx)("th", { children: "\u6B21\u6570" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u5165" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u51FA" }), (0, jsx_runtime_1.jsx)("th", { children: "\u7F13\u5B58\u8BFB" }), (0, jsx_runtime_1.jsx)("th", { children: "\u91D1\u989D(\u5143)" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: Object.entries(byRole).map(([role, v]) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: ROLE_LABEL[role] || role }), (0, jsx_runtime_1.jsx)("td", { children: v.calls }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.prompt) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.completion) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.cached) }), (0, jsx_runtime_1.jsx)("td", { children: v.cost ? v.cost.toFixed(4) : '—' })] }, role))) })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u91D1\u989D\u4EC5\u5BF9 DeepSeek \u9644\u5E26\u7684\u8BA1\u4EF7\u8C03\u7528\u663E\u793A\uFF1B\u300C\u5237\u65B0\u300D\u540E\u66F4\u65B0\u3002" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6309\u9700\u8865\u6458\u8981" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setDesc", children: "\u6587\u7AE0\u9875\u5BF9\u672A\u52A0\u5DE5\u7684\u6587\u7AE0\u63D0\u4F9B\u300CAI \u8865\u6458\u8981\u300D\uFF1A\u8C03\u7528\u63D2\u4EF6\u670D\u52A1\u7AEF\u8DEF\u7531\uFF08DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\uFF09\uFF0C\u6D4F\u89C8\u5668\u4E0D\u5B58\u4EFB\u4F55 API key\uFF1B\u7ED3\u679C\u4EC5\u672C\u6B21\u4F1A\u8BDD\u5185\u663E\u793A\uFF0C\u4E0D\u56DE\u5199\u4E91\u7AEF\u3002" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u89E6\u53D1\u4F4D\u7F6E\uFF1A\u6587\u7AE0\u9605\u8BFB\u9875\u6458\u8981\u533A\uFF08\u65E0 AI \u6458\u8981\u65F6\u51FA\u73B0\u6309\u94AE\uFF09\u3002\u7981\u7528\u672C\u6A21\u5757\u540E\u6309\u94AE\u9690\u85CF\u3002" })] })] })] })), page === 'tokens' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u4EE4\u724C\u767B\u8BB0" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6BCF\u679A\u4EE4\u724C\u53EF\u9009\u542F\u7528/\u7981\u7528\uFF1B\u300C\u503C\u300D\u4EC5\u5B58\u672C\u673A\u6D4F\u89C8\u5668\uFF1B\u8FC7\u671F\u65E5\u671F\u7528\u4E8E\u5230\u671F\u63D0\u9192\uFF1B\u300C\u7BA1\u7406 \u2197\u300D\u8DF3\u8F6C GitHub \u4EE4\u724C\u7BA1\u7406\u9875\u3002\u505C\u7528\u5168\u90E8\u4EE4\u724C = \u9762\u677F\u65E0\u6570\u636E\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokList", children: [tokens.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6682\u672A\u767B\u8BB0\u4EE4\u724C\u3002\u8BF7\u6DFB\u52A0 GitHub \u6570\u636E\u4EE4\u724C\uFF08\u7EC6\u7C92\u5EA6 PAT\uFF0CContents: Read\uFF0C\u79C1\u6709\u6570\u636E\u4ED3\uFF09\u3002" }), tokens.map((t) => {
                                    const eb = expiryBadge(t.expires);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tok", children: [(0, jsx_runtime_1.jsx)(Toggle, { on: t.enabled, onToggle: () => toggleTok(t.id), label: `${t.name} 启用` }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokName", children: [t.name, !t.enabled && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge off", children: "\u5DF2\u505C\u7528" }), !t.value && t.expires && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge warn", children: "\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokMeta", children: [t.usage && (0, jsx_runtime_1.jsx)("span", { children: t.usage }), t.expires && ((0, jsx_runtime_1.jsxs)("span", { className: eb.cls, children: ["\u8FC7\u671F ", t.expires, " \u00B7 ", eb.text] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokActs", children: [t.adminUrl && ((0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_tokBtn", href: t.adminUrl, target: "_blank", rel: "noreferrer", children: "\u7BA1\u7406 \u2197" })), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn", onClick: () => startEdit(t), children: "\u7F16\u8F91" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn danger", onClick: () => removeTok(t.id), children: "\u5220\u9664" })] })] }, t.id));
                                })] }), !tokEditing ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => startEdit(), children: "+ \u6DFB\u52A0\u4EE4\u724C" }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { fontSize: 12 }, children: tokEditing ? '编辑令牌' : '添加令牌' }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u540D\u79F0\uFF08\u5982 GitHub \u6570\u636E\u4EE4\u724C\uFF09", value: tokDraft.name, onChange: (e) => setTokDraft({ ...tokDraft, name: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7528\u9014\u8BF4\u660E\uFF08\u5982 \u8BFB\u53D6\u4E91\u7AEF\u6570\u636E\uFF09", value: tokDraft.usage, onChange: (e) => setTokDraft({ ...tokDraft, usage: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "password", placeholder: "\u4EE4\u724C\u503C\uFF08\u4EC5\u672C\u673A\uFF1B\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5\u7684\u53EF\u7559\u7A7A\uFF09", value: tokDraft.value, onChange: (e) => setTokDraft({ ...tokDraft, value: e.target.value }), spellCheck: false }) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", style: { maxWidth: 170 }, type: "date", value: tokDraft.expires, onChange: (e) => setTokDraft({ ...tokDraft, expires: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7BA1\u7406\u9875 URL\uFF08\u9ED8\u8BA4 GitHub \u4EE4\u724C\u9875\uFF09", value: tokDraft.adminUrl, onChange: (e) => setTokDraft({ ...tokDraft, adminUrl: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: !tokDraft.name.trim(), onClick: saveTokDraft, children: "\u4FDD\u5B58" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => setTokEditing(null), children: "\u53D6\u6D88" })] })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }) })), page === 'prefs' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9605\u8BFB\u4E0A\u4E0B\u6587\u5F15\u7528" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.autoAttach, onChange: (e) => upd({ ...settings, autoAttach: e.target.checked }) }), "\u6253\u5F00\u6587\u7AE0\u65F6\u81EA\u52A8\u9644\u52A0\u9605\u8BFB\u4E0A\u4E0B\u6587\uFF08\u53D1\u9001\u63D0\u95EE\u65F6\u4F5C\u4E3A\u5F15\u7528\u6750\u6599\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u6587\u7AE0\u9605\u8BFB\u9875\u70B9\u300C", (0, jsx_runtime_1.jsx)("b", { children: "\u5F15\u7528\u5230\u5BF9\u8BDD" }), "\u300D\u2192 \u6587\u7AE0\u4F5C\u4E3A\u4E0A\u4E0B\u6587\u5F15\u7528\u5230\u804A\u5929\u8F93\u5165\u6846\u4E0A\u65B9\uFF08chip\uFF09\uFF0C\u8349\u7A3F\u6CE8\u5165\u6807\u8BB0\u884C\uFF1B\u53D1\u9001\u540E\u81EA\u52A8\u89E3\u9664\u3002\u5173\u95ED\u672C\u6A21\u5757\uFF08\u5361\u7247\u5F00\u5173\uFF09\u540E\u5F15\u7528\u6309\u94AE\u4E0E\u4E0A\u4E0B\u6587\u6761\u9690\u85CF\u3002"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u5F85\u529E\u63D0\u9192 \u00B7 \u5173\u6CE8" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9996\u9875\u300C\u5F85\u529E\u5361\u300D\u5C55\u793A\u672A\u8FC7\u671F\u622A\u6B62\u4E8B\u9879\uFF08\u22647 \u5929\uFF09\uFF0C\u652F\u6301\u7559\u5B58/\u5F52\u6863\uFF1B\u5173\u6CE8\u65E0\u4E0A\u9650\uFF0C\u6587\u7AE0\u9875 \u2605 \u52A0\u5165\u3002\u5173\u95ED\u672C\u6A21\u5757\u540E\u5F85\u529E\u5361\u4E0E\u5173\u6CE8\u5165\u53E3\u9690\u85CF\u3002" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9762\u677F\u56FA\u5B9A" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9762\u677F\u5934\u90E8 \uD83D\uDCCC \u56FA\u5B9A\u540E\uFF0C\u70B9\u51FB\u5916\u90E8/Esc \u4E0D\u5173\u95ED\uFF0C\u4EC5 \u2715 \u5173\u95ED\uFF08\u72B6\u6001\u6301\u4E45\u5316\uFF09\u3002" })] })] })), page === 'cloud' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6570\u636E\u6E90" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6570\u636E\u5B58\u4E8E GitHub \u79C1\u6709\u4ED3\u5E93\uFF08`zhouxuanting52-lab/cau-portal` \u7684 data/\uFF09\uFF0C\u7531 Actions \u6BCF 2 \u5C0F\u65F6\u6293\u53D6+AI \u52A0\u5DE5\u5E76\u63D0\u4EA4\uFF1B\u9762\u677F\u4E0E MCP \u76F4\u63A5\u8BFB\u4E91\u7AEF\u3002\u5173\u95ED\u672C\u6A21\u5757\u5C06\u5B8C\u5168\u505C\u6B62\u6570\u636E\u8BFB\u53D6\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: cloudState === 'loading', onClick: () => void checkCloud(), children: cloudState === 'loading' ? '检查中…' : '连通性检查' }), cloudState === 'ok' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: cloudMsg }), cloudState === 'fail' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: cloudMsg })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.slice(0, 3).map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, " \u2197"] }, l.key))) })] }) })), page === 'security' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u7EDF\u4E00\u95E8\u6237\u5BC6\u7801\uFF08\u9636\u6BB5 5\uFF09" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5B9E\u9A8C\u529F\u80FD\uFF08\u4EE3\u767B\u5F55\u7EDF\u4E00\u95E8\u6237\uFF09\uFF0C\u9636\u6BB5 5 \u624D\u5F00\u653E\uFF1B\u82E5\u5F00\u653E\u4E5F\u4EC5\u5B58\u672C\u673A\u3001\u4E0D\u8FDB\u4ED3\u5E93\u3001\u4E0D\u8FDB AI \u5BF9\u8BDD\u3002" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "password", placeholder: "\u6682\u672A\u5F00\u653E", disabled: true })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u5BC6\u94A5\u4E0E\u91CD\u8981\u94FE\u63A5" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5E38\u7528\u9875\u9762\u4E00\u952E\u76F4\u8FBE\uFF1B\u4EE4\u724C\u8BE6\u60C5\u4E0E\u8FC7\u671F\u65E5\u5728\u300C\u4EE4\u724C\u7BA1\u7406\u300D\u9875\u7EF4\u62A4\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, " \u2197"] }, l.key))) })] })] }))] }));
}

return module.exports; })();
var ctx_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCtx = bindCtx;
exports.getCtx = getCtx;
/**
 * 跨组件树共享插件 ctx（面板树 ↔ 设置页 都要用会话服务与模型目录）。
 *
 * 注意：build.mjs 的内联器**不做模块去重**——同一个模块被两处 require 会内联成
 * 两份独立 IIFE，各自持有自己的模块级状态。因此这里不能用模块级变量存单例，
 * 必须挂到 window 上（全局、跨所有内联副本共享），否则 bindCtx/getCtx 会读错对象。
 */
function bindCtx(c) {
    ;
    window.__CAU_CTX__ = c;
}
function getCtx() {
    return window.__CAU_CTX__;
}

return module.exports; })();
var ctxbar_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTXBAR_CSS = void 0;
exports.CtxBar = CtxBar;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * 阶段6 双向协同 · 阅读上下文附加条（conversation.input.dock，会话级 list 槽）。
 * 面板打开文章时（bus.setAttached）自动在输入框上方显示「📄《标题》· 来源 ×」条，
 * 并按 autoAttach 设置在输入草稿注入标记行 `〔cau:article:<id>〕《标题》`，
 * 用户正常提问发送即可让 AI 经 mcp__cau__get_article 读全文作答；× 移除标记。
 */
const react_1 = require("react");
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
const MARKER_RE = /〔cau:article:[^〕]*〕[^\n]*\n?/g;
function markerOf(a) {
    return `〔cau:article:${a.id}〕《${a.title}》\n`;
}
/** 保底：上下文条渲染出错只显示提示，绝不拖垮整个应用 */
class CtxBarBoundary extends react_1.Component {
    state = { err: null };
    static getDerivedStateFromError(err) {
        return { err };
    }
    componentDidCatch(err) {
        console.error('[cau-portal ctxbar]', err);
    }
    render() {
        if (this.state.err) {
            return (0, jsx_runtime_1.jsxs)("div", { style: { padding: '6px 12px', fontSize: 12, color: '#e5484d' }, children: ["\u4E0A\u4E0B\u6587\u6761\u51FA\u9519\uFF1A", String(this.state.err?.message || this.state.err)] });
        }
        return this.props.children;
    }
}
exports.CTXBAR_CSS = `
.dsh-cau_ctxbarList{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance,16px) - var(--dsh-composer-side-clearance,16px));max-width:calc(var(--dsh-composer-card-max-width,780px) - var(--dsh-composer-dock-inset,8px) - var(--dsh-composer-dock-inset,8px));padding:0 var(--dsh-composer-dock-inset,8px);margin:0 auto 4px;min-width:0;display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px}
.dsh-cau_ctxbarStatus{flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary,#8b95a5);opacity:.85;margin-right:2px}
.dsh-cau_ctxbar{display:flex;align-items:center;gap:6px;box-sizing:border-box;flex:0 1 auto;min-width:0;max-width:300px;padding:5px 8px 5px 7px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.16));border-radius:999px;background:var(--dsw-specific-tip,rgba(255,255,255,.05));color:var(--dsw-alias-label-secondary,#9aa4b2)}
.dsh-cau_ctxbarEmblem{flex:none;display:flex;align-items:center;color:var(--cau-brand,#008038)}
.dsh-cau_ctxbarEmblem svg{display:block;height:16px;width:auto}
.dsh-cau_ctxbarTitle{flex:0 1 auto;min-width:0;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_ctxbarX{flex:none;display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary,#8b95a5);cursor:pointer;font-size:12px;line-height:1}
.dsh-cau_ctxbarX:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e6e8eb)}
`;
function CtxBar(props) {
    const inputActions = props?.inputActions;
    const attached = (0, react_1.useSyncExternalStore)(bus_1.subscribeAttached, bus_1.getAttached);
    const [injected, setInjected] = (0, react_1.useState)(false);
    const [tip, setTip] = (0, react_1.useState)('');
    const emblem = window.__CAU_EMBLEM__ || '';
    const draftRef = (0, react_1.useRef)(props?.input?.draft || '');
    (0, react_1.useEffect)(() => {
        draftRef.current = props?.input?.draft || '';
    });
    // 无引用时清空状态
    (0, react_1.useEffect)(() => {
        if ((attached || []).length === 0) {
            setInjected(false);
            setTip('');
        }
    }, [attached]);
    // 发送时自动附带引用标记（输入框平时干净；消息带上引用、AI 自动读取）
    (0, react_1.useEffect)(() => {
        if (!inputActions || typeof inputActions.submit !== 'function')
            return;
        const orig = inputActions.submit;
        inputActions.submit = () => {
            try {
                const items = (0, bus_1.getAttached)() || [];
                if (items.length) {
                    const draft = draftRef.current || '';
                    const cleaned = draft.replace(MARKER_RE, '');
                    const markers = items.map((a) => markerOf(a)).join('');
                    inputActions.setDraft(markers + cleaned);
                }
            }
            catch (e) {
                console.error('[cau-portal ctxbar] submit inject', e);
            }
            return orig();
        };
        return () => {
            inputActions.submit = orig;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputActions]);
    // 发问后自动解除：仅当草稿【从非空变为空】（消息已发出）才清掉全部引用
    const prevDraftRef = (0, react_1.useRef)(props?.input?.draft || '');
    (0, react_1.useEffect)(() => {
        const draft = props?.input?.draft || '';
        const prev = prevDraftRef.current;
        prevDraftRef.current = draft;
        if ((attached || []).length === 0)
            return;
        if (prev !== '' && draft === '') {
            try {
                if (inputActions)
                    inputActions.setDraft('');
            }
            catch (e) {
                console.error('[cau-portal ctxbar] post-send clear', e);
            }
            (0, bus_1.clearAttached)();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props?.input?.draft, attached, inputActions]);
    if (!attached || attached.length === 0)
        return null;
    const removeOne = (id) => {
        try {
            if (inputActions) {
                const draft = draftRef.current || '';
                inputActions.setDraft(draft.replace(new RegExp(`〔cau:article:${id}〕[^\\n]*\\n?`, 'g'), ''));
            }
        }
        catch (e) {
            console.error('[cau-portal ctxbar] remove', e);
        }
        (0, bus_1.removeAttached)(id);
    };
    return ((0, jsx_runtime_1.jsx)(CtxBarBoundary, { children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ctxbarList", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_ctxbarStatus", children: [(attached || []).length, " \u7BC7\u5F15\u7528 \u00B7 \u53D1\u9001\u65F6\u9644\u5E26"] }), (attached || []).map((it) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ctxbar", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_ctxbarEmblem", dangerouslySetInnerHTML: { __html: emblem } }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_ctxbarTitle", title: it.title, children: it.title }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_ctxbarX", "aria-label": "\u79FB\u9664\u5F15\u7528", onClick: () => removeOne(it.id), children: "\u00D7" })] }, it.id)))] }) }));
}

return module.exports; })();
var toolview_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOLVIEW_CSS = void 0;
exports.ToolCard = ToolCard;
exports.registerToolViews = registerToolViews;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * 阶段6 双向协同 · 工具结果新闻卡片（tool.call.toolview，键控槽，key=mcp__cau__*）。
 * AI 调用 mcp__cau__* 工具后，结果渲染为新闻卡片（标题/摘要/重要度），
 * 内置「在面板中打开」（bus.requestOpenArticle）+「查看原文」（新标签）按钮，而非裸 JSON。
 * 未注册的 key 回落通用行；我们只接管自己的工具名。
 */
const react_1 = require("react");
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
exports.TOOLVIEW_CSS = `
.dsh-cau_tvWrap{display:flex;flex-direction:column;gap:8px;width:100%}
.dsh-cau_tvCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.1));border-radius:10px;background:var(--dsw-specific-tip,rgba(255,255,255,.03))}
.dsh-cau_tvTitle{font-size:13px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-primary,#e6e8eb);cursor:pointer;word-break:break-word}
.dsh-cau_tvTitle:hover{color:var(--cau-brand,#008038)}
.dsh-cau_tvMeta{font-size:11px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_tvSum{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#9aa4b2);word-break:break-word}
.dsh-cau_tvActions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsh-cau_tvBtn{display:inline-flex;align-items:center;height:24px;padding:0 10px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.16));border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#e6e8eb);font-size:11px;cursor:pointer;text-decoration:none}
.dsh-cau_tvBtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}
.dsh-cau_tvBtnPrimary{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:transparent;color:#fff}
.dsh-cau_tvImp{display:inline-flex;align-items:center;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:500}
.dsh-cau_tvImp-high{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 15%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}
.dsh-cau_tvImp-mid{background:color-mix(in srgb,var(--dsw-alias-state-warn,#ffb400) 15%,transparent);color:var(--dsw-alias-state-warn,#ffb400)}
.dsh-cau_tvImp-low{background:color-mix(in srgb,var(--dsw-alias-state-business-tertiary,#4176e6) 15%,transparent);color:var(--dsw-alias-state-business-tertiary,#4176e6)}
`;
function tryJson(t) {
    const s = String(t).trim();
    if (!s)
        return null;
    // 尝试剥掉可能的 ```json 围栏
    const clean = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    try {
        return JSON.parse(clean);
    }
    catch {
        return null;
    }
}
function parseBlock(block) {
    if (!block)
        return null;
    const res = block?.result ?? block;
    if (res && typeof res === 'object') {
        const content = res.content;
        if (Array.isArray(content)) {
            const text = content.filter((c) => c?.type === 'text').map((c) => c.text).join('');
            const j = text ? tryJson(text) : null;
            if (j)
                return j;
            return { __raw: text };
        }
        if (typeof res.text === 'string') {
            const j = tryJson(res.text);
            if (j)
                return j;
        }
        return res;
    }
    if (typeof res === 'string') {
        const j = tryJson(res);
        if (j)
            return j;
        return { __raw: res };
    }
    return null;
}
function cardItems(parsed) {
    if (Array.isArray(parsed?.items) && parsed.items.length)
        return parsed.items;
    if (Array.isArray(parsed))
        return parsed;
    if (parsed && parsed.title)
        return [parsed];
    return [];
}
function itemId(it) {
    return it.article_id || it.id || it.article_url || it.url || '';
}
function itemUrl(it) {
    return it.article_url || it.url || '';
}
function impClass(v) {
    if (v === '高')
        return 'dsh-cau_tvImp-high';
    if (v === '中')
        return 'dsh-cau_tvImp-mid';
    return 'dsh-cau_tvImp-low';
}
function Card({ it }) {
    const id = itemId(it);
    const title = it.title || it.name || it.item || '(无标题)';
    const meta = [it.date || it.time || '', it.source_name || it.site_name || it.column_name || it.source || ''].filter(Boolean).join(' · ');
    const sum = it.ai?.summary || it.summary || '';
    const imp = it.ai?.importance || it.importance || '';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvCard", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvTitle", onClick: () => id && (0, bus_1.requestOpenArticle)(id), children: title }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvMeta", children: [meta, imp ? (0, jsx_runtime_1.jsx)("span", { className: 'dsh-cau_tvImp ' + impClass(imp), style: { marginLeft: 6 }, children: imp }) : null] }), sum ? (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvSum", children: sum }) : null, (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvActions", children: [id ? ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tvBtn dsh-cau_tvBtnPrimary", onClick: () => (0, bus_1.requestOpenArticle)(id), children: "\u5728\u9762\u677F\u4E2D\u6253\u5F00" })) : null, itemUrl(it) ? ((0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_tvBtn", href: itemUrl(it), target: "_blank", rel: "noreferrer", children: "\u67E5\u770B\u539F\u6587 \u2197" })) : null] })] }));
}
function ToolCard(props) {
    const { toolName, block } = props;
    const parsed = (0, react_1.useMemo)(() => parseBlock(block), [block]);
    if (!parsed) {
        return (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvWrap", children: "\uFF08\u5DE5\u5177\u7ED3\u679C\u672A\u89E3\u6790\uFF09" });
    }
    const items = cardItems(parsed);
    if (items.length === 0) {
        return (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvWrap", children: parsed.__raw ? (0, jsx_runtime_1.jsx)("pre", { className: "dsh-cau_tvSum", children: parsed.__raw }) : (0, jsx_runtime_1.jsx)("pre", { className: "dsh-cau_tvSum", children: JSON.stringify(parsed, null, 2) }) });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvWrap", children: [items.slice(0, 5).map((it, i) => ((0, jsx_runtime_1.jsx)(Card, { it: it }, itemId(it) || i))), items.length > 5 ? (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvMeta", children: ["\u2026\u5171 ", items.length, " \u6761\uFF0C\u5176\u4F59\u5728\u9762\u677F\u4E2D\u6D4F\u89C8"] }) : null] }));
}
const TOOL_KEYS = [
    'mcp__cau__get_article',
    'mcp__cau__search_news',
    'mcp__cau__list_latest',
    'mcp__cau__list_deadlines',
    'mcp__cau__list_sites',
    'mcp__cau__get_usage',
];
function registerToolViews(ctx) {
    for (const k of TOOL_KEYS) {
        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key: k }, ToolCard), 'cau-portal: toolview ' + k);
    }
}

return module.exports; })();
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
// 校徽 SVG（currentColor 版）、校名题字 SVG（官方绿版）与题字 currentColor 版由 build.mjs 以文本内联（占位符替换）
const emblemSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"507\" height=\"624\" viewBox=\"0 0 507 624\" version=\"1.1\">\n\t<path d=\"M 216 25.500 C 216 26.759, 213.833 27, 202.500 27 C 191.167 27, 189 27.241, 189 28.500 C 189 29.767, 186.667 30, 174 30 C 161.333 30, 159 30.233, 159 31.500 C 159 32.738, 157.167 33, 148.500 33 C 139.833 33, 138 33.262, 138 34.500 C 138 35.722, 136.333 36, 129 36 C 121.667 36, 120 36.278, 120 37.500 C 120 38.700, 118.500 39, 112.500 39 C 106.500 39, 105 39.300, 105 40.500 C 105 41.667, 103.667 42, 99 42 C 94.333 42, 93 42.333, 93 43.500 C 93 44.667, 91.667 45, 87 45 C 82.333 45, 81 45.333, 81 46.500 C 81 47.611, 79.833 48, 76.500 48 C 73.167 48, 72 48.389, 72 49.500 C 72 50.611, 70.833 51, 67.500 51 C 64.167 51, 63 51.389, 63 52.500 C 63 53.611, 61.833 54, 58.500 54 C 55.167 54, 54 54.389, 54 55.500 C 54 56.611, 52.833 57, 49.500 57 C 46.167 57, 45 57.389, 45 58.500 C 45 59.500, 44 60, 42 60 C 40 60, 39 60.500, 39 61.500 C 39 62.500, 38 63, 36 63 C 34 63, 33 63.500, 33 64.500 C 33 65.500, 32 66, 30 66 C 28 66, 27 66.500, 27 67.500 C 27 68.325, 26.325 69, 25.500 69 C 24.333 69, 24 70.333, 24 75 C 24 79.667, 24.333 81, 25.500 81 C 26.500 81, 27 82, 27 84 C 27 86, 26.500 87, 25.500 87 C 24.675 87, 24 87.675, 24 88.500 C 24 89.325, 24.675 90, 25.500 90 C 26.806 90, 27 94.667, 27 126 C 27 157.333, 27.194 162, 28.500 162 C 29.809 162, 30 167.167, 30 202.500 C 30 237.833, 30.191 243, 31.500 243 C 32.809 243, 33 248.167, 33 283.500 C 33 318.833, 33.191 324, 34.500 324 C 35.803 324, 36 328.333, 36 357 C 36 385.667, 36.197 390, 37.500 390 C 38.722 390, 39 391.667, 39 399 C 39 406.333, 39.278 408, 40.500 408 C 41.611 408, 42 409.167, 42 412.500 C 42 415.833, 42.389 417, 43.500 417 C 44.611 417, 45 418.167, 45 421.500 C 45 424.833, 45.389 426, 46.500 426 C 47.611 426, 48 427.167, 48 430.500 C 48 433.833, 48.389 435, 49.500 435 C 50.500 435, 51 436, 51 438 C 51 440, 51.500 441, 52.500 441 C 53.500 441, 54 442, 54 444 C 54 446, 54.500 447, 55.500 447 C 56.500 447, 57 448, 57 450 C 57 452, 57.500 453, 58.500 453 C 59.325 453, 60 453.675, 60 454.500 C 60 455.325, 60.675 456, 61.500 456 C 62.500 456, 63 457, 63 459 C 63 461, 63.500 462, 64.500 462 C 65.325 462, 66 462.675, 66 463.500 C 66 464.325, 66.675 465, 67.500 465 C 68.500 465, 69 466, 69 468 C 69 470, 69.500 471, 70.500 471 C 71.325 471, 72 471.675, 72 472.500 C 72 473.325, 72.675 474, 73.500 474 C 74.325 474, 75 474.675, 75 475.500 C 75 476.325, 75.675 477, 76.500 477 C 77.500 477, 78 478, 78 480 C 78 482, 78.500 483, 79.500 483 C 80.325 483, 81 483.675, 81 484.500 C 81 485.325, 81.675 486, 82.500 486 C 83.325 486, 84 486.675, 84 487.500 C 84 488.325, 84.675 489, 85.500 489 C 86.325 489, 87 489.675, 87 490.500 C 87 491.325, 87.675 492, 88.500 492 C 89.325 492, 90 492.675, 90 493.500 C 90 494.325, 90.675 495, 91.500 495 C 92.325 495, 93 495.675, 93 496.500 C 93 497.325, 93.675 498, 94.500 498 C 95.325 498, 96 498.675, 96 499.500 C 96 500.325, 96.675 501, 97.500 501 C 98.325 501, 99 501.675, 99 502.500 C 99 503.325, 99.675 504, 100.500 504 C 101.325 504, 102 504.675, 102 505.500 C 102 506.325, 102.675 507, 103.500 507 C 104.325 507, 105 507.675, 105 508.500 C 105 509.325, 105.675 510, 106.500 510 C 107.325 510, 108 510.675, 108 511.500 C 108 512.325, 108.675 513, 109.500 513 C 110.325 513, 111 513.675, 111 514.500 C 111 515.325, 111.675 516, 112.500 516 C 113.325 516, 114 516.675, 114 517.500 C 114 518.325, 114.675 519, 115.500 519 C 116.325 519, 117 519.675, 117 520.500 C 117 521.325, 117.675 522, 118.500 522 C 119.325 522, 120 522.675, 120 523.500 C 120 524.500, 121 525, 123 525 C 125 525, 126 525.500, 126 526.500 C 126 527.325, 126.675 528, 127.500 528 C 128.325 528, 129 528.675, 129 529.500 C 129 530.325, 129.675 531, 130.500 531 C 131.325 531, 132 531.675, 132 532.500 C 132 533.500, 133 534, 135 534 C 137 534, 138 534.500, 138 535.500 C 138 536.325, 138.675 537, 139.500 537 C 140.325 537, 141 537.675, 141 538.500 C 141 539.325, 141.675 540, 142.500 540 C 143.325 540, 144 540.675, 144 541.500 C 144 542.500, 145 543, 147 543 C 149 543, 150 543.500, 150 544.500 C 150 545.325, 150.675 546, 151.500 546 C 152.325 546, 153 546.675, 153 547.500 C 153 548.500, 154 549, 156 549 C 158 549, 159 549.500, 159 550.500 C 159 551.325, 159.675 552, 160.500 552 C 161.325 552, 162 552.675, 162 553.500 C 162 554.500, 163 555, 165 555 C 167 555, 168 555.500, 168 556.500 C 168 557.325, 168.675 558, 169.500 558 C 170.325 558, 171 558.675, 171 559.500 C 171 560.500, 172 561, 174 561 C 176 561, 177 561.500, 177 562.500 C 177 563.500, 178 564, 180 564 C 182 564, 183 564.500, 183 565.500 C 183 566.500, 184 567, 186 567 C 188 567, 189 567.500, 189 568.500 C 189 569.500, 190 570, 192 570 C 194 570, 195 570.500, 195 571.500 C 195 572.325, 195.675 573, 196.500 573 C 197.325 573, 198 573.675, 198 574.500 C 198 575.500, 199 576, 201 576 C 203 576, 204 576.500, 204 577.500 C 204 578.500, 205 579, 207 579 C 209 579, 210 579.500, 210 580.500 C 210 581.500, 211 582, 213 582 C 215 582, 216 582.500, 216 583.500 C 216 584.500, 217 585, 219 585 C 221 585, 222 585.500, 222 586.500 C 222 587.611, 223.167 588, 226.500 588 C 229.833 588, 231 588.389, 231 589.500 C 231 590.500, 232 591, 234 591 C 236 591, 237 591.500, 237 592.500 C 237 593.611, 238.167 594, 241.500 594 C 244.833 594, 246 594.389, 246 595.500 C 246 596.500, 247 597, 249 597 C 251 597, 252 597.500, 252 598.500 C 252 599.325, 252.675 600, 253.500 600 C 254.325 600, 255 599.325, 255 598.500 C 255 597.500, 256 597, 258 597 C 260 597, 261 596.500, 261 595.500 C 261 594.389, 262.167 594, 265.500 594 C 268.833 594, 270 593.611, 270 592.500 C 270 591.500, 271 591, 273 591 C 275 591, 276 590.500, 276 589.500 C 276 588.500, 277 588, 279 588 C 281 588, 282 587.500, 282 586.500 C 282 585.500, 283 585, 285 585 C 287 585, 288 584.500, 288 583.500 C 288 582.500, 289 582, 291 582 C 293 582, 294 581.500, 294 580.500 C 294 579.500, 295 579, 297 579 C 299 579, 300 578.500, 300 577.500 C 300 576.389, 301.167 576, 304.500 576 C 307.833 576, 309 575.611, 309 574.500 C 309 573.675, 309.675 573, 310.500 573 C 311.325 573, 312 572.325, 312 571.500 C 312 570.500, 313 570, 315 570 C 317 570, 318 569.500, 318 568.500 C 318 567.500, 319 567, 321 567 C 323 567, 324 566.500, 324 565.500 C 324 564.500, 325 564, 327 564 C 329 564, 330 563.500, 330 562.500 C 330 561.675, 330.675 561, 331.500 561 C 332.325 561, 333 560.325, 333 559.500 C 333 558.500, 334 558, 336 558 C 338 558, 339 557.500, 339 556.500 C 339 555.500, 340 555, 342 555 C 344 555, 345 554.500, 345 553.500 C 345 552.675, 345.675 552, 346.500 552 C 347.325 552, 348 551.325, 348 550.500 C 348 549.500, 349 549, 351 549 C 353 549, 354 548.500, 354 547.500 C 354 546.675, 354.675 546, 355.500 546 C 356.325 546, 357 545.325, 357 544.500 C 357 543.500, 358 543, 360 543 C 362 543, 363 542.500, 363 541.500 C 363 540.675, 363.675 540, 364.500 540 C 365.325 540, 366 539.325, 366 538.500 C 366 537.675, 366.675 537, 367.500 537 C 368.325 537, 369 536.325, 369 535.500 C 369 534.500, 370 534, 372 534 C 374 534, 375 533.500, 375 532.500 C 375 531.675, 375.675 531, 376.500 531 C 377.325 531, 378 530.325, 378 529.500 C 378 528.675, 378.675 528, 379.500 528 C 380.325 528, 381 527.325, 381 526.500 C 381 525.675, 381.675 525, 382.500 525 C 383.325 525, 384 524.325, 384 523.500 C 384 522.500, 385 522, 387 522 C 389 522, 390 521.500, 390 520.500 C 390 519.675, 390.675 519, 391.500 519 C 392.325 519, 393 518.325, 393 517.500 C 393 516.675, 393.675 516, 394.500 516 C 395.325 516, 396 515.325, 396 514.500 C 396 513.675, 396.675 513, 397.500 513 C 398.325 513, 399 512.325, 399 511.500 C 399 510.675, 399.675 510, 400.500 510 C 401.325 510, 402 509.325, 402 508.500 C 402 507.675, 402.675 507, 403.500 507 C 404.325 507, 405 506.325, 405 505.500 C 405 504.675, 405.675 504, 406.500 504 C 407.325 504, 408 503.325, 408 502.500 C 408 501.675, 408.675 501, 409.500 501 C 410.325 501, 411 500.325, 411 499.500 C 411 498.675, 411.675 498, 412.500 498 C 413.325 498, 414 497.325, 414 496.500 C 414 495.675, 414.675 495, 415.500 495 C 416.325 495, 417 494.325, 417 493.500 C 417 492.675, 417.675 492, 418.500 492 C 419.325 492, 420 491.325, 420 490.500 C 420 489.675, 420.675 489, 421.500 489 C 422.325 489, 423 488.325, 423 487.500 C 423 486.675, 423.675 486, 424.500 486 C 425.500 486, 426 485, 426 483 C 426 481, 426.500 480, 427.500 480 C 428.325 480, 429 479.325, 429 478.500 C 429 477.675, 429.675 477, 430.500 477 C 431.325 477, 432 476.325, 432 475.500 C 432 474.675, 432.675 474, 433.500 474 C 434.325 474, 435 473.325, 435 472.500 C 435 471.675, 435.675 471, 436.500 471 C 437.500 471, 438 470, 438 468 C 438 466, 438.500 465, 439.500 465 C 440.325 465, 441 464.325, 441 463.500 C 441 462.675, 441.675 462, 442.500 462 C 443.500 462, 444 461, 444 459 C 444 457, 444.500 456, 445.500 456 C 446.500 456, 447 455, 447 453 C 447 451, 447.500 450, 448.500 450 C 449.500 450, 450 449, 450 447 C 450 445, 450.500 444, 451.500 444 C 452.500 444, 453 443, 453 441 C 453 439, 453.500 438, 454.500 438 C 455.500 438, 456 437, 456 435 C 456 433, 456.500 432, 457.500 432 C 458.611 432, 459 430.833, 459 427.500 C 459 424.167, 459.389 423, 460.500 423 C 461.500 423, 462 422, 462 420 C 462 418, 462.500 417, 463.500 417 C 464.667 417, 465 415.667, 465 411 C 465 406.333, 465.333 405, 466.500 405 C 467.738 405, 468 403.167, 468 394.500 C 468 385.833, 468.262 384, 469.500 384 C 470.808 384, 471 379, 471 345 C 471 311, 471.192 306, 472.500 306 C 473.806 306, 474 301.333, 474 270 C 474 238.667, 474.194 234, 475.500 234 C 476.325 234, 477 233.325, 477 232.500 C 477 231.675, 476.325 231, 475.500 231 C 474.500 231, 474 230, 474 228 C 474 226, 474.500 225, 475.500 225 C 476.806 225, 477 220.333, 477 189 C 477 157.667, 477.194 153, 478.500 153 C 479.325 153, 480 152.325, 480 151.500 C 480 150.675, 479.325 150, 478.500 150 C 477.500 150, 477 149, 477 147 C 477 145, 477.500 144, 478.500 144 C 479.796 144, 480 140.333, 480 117 C 480 93.667, 480.204 90, 481.500 90 C 482.738 90, 483 88.167, 483 79.500 C 483 70.833, 482.738 69, 481.500 69 C 480.675 69, 480 68.325, 480 67.500 C 480 66.500, 479 66, 477 66 C 475 66, 474 65.500, 474 64.500 C 474 63.500, 473 63, 471 63 C 469 63, 468 62.500, 468 61.500 C 468 60.389, 466.833 60, 463.500 60 C 460.167 60, 459 59.611, 459 58.500 C 459 57.500, 458 57, 456 57 C 454 57, 453 56.500, 453 55.500 C 453 54.389, 451.833 54, 448.500 54 C 445.167 54, 444 53.611, 444 52.500 C 444 51.389, 442.833 51, 439.500 51 C 436.167 51, 435 50.611, 435 49.500 C 435 48.389, 433.833 48, 430.500 48 C 427.167 48, 426 47.611, 426 46.500 C 426 45.333, 424.667 45, 420 45 C 415.333 45, 414 44.667, 414 43.500 C 414 42.333, 412.667 42, 408 42 C 403.333 42, 402 41.667, 402 40.500 C 402 39.300, 400.500 39, 394.500 39 C 388.500 39, 387 38.700, 387 37.500 C 387 36.278, 385.333 36, 378 36 C 370.667 36, 369 35.722, 369 34.500 C 369 33.250, 367 33, 357 33 C 347 33, 345 32.750, 345 31.500 C 345 30.241, 342.833 30, 331.500 30 C 320.167 30, 318 29.759, 318 28.500 C 318 27.222, 315.333 27, 300 27 C 284.667 27, 282 26.778, 282 25.500 C 282 24.202, 278.167 24, 253.500 24 C 228.833 24, 225 24.202, 225 25.500 C 225 26.500, 224 27, 222 27 C 220 27, 219 26.500, 219 25.500 C 219 24.675, 218.325 24, 217.500 24 C 216.675 24, 216 24.675, 216 25.500 M 195 37.500 C 195 38.767, 192.667 39, 180 39 C 167.333 39, 165 39.233, 165 40.500 C 165 41.750, 163 42, 153 42 C 143 42, 141 42.250, 141 43.500 C 141 44.700, 139.500 45, 133.500 45 C 127.500 45, 126 45.300, 126 46.500 C 126 47.700, 124.500 48, 118.500 48 C 112.500 48, 111 48.300, 111 49.500 C 111 50.700, 109.500 51, 103.500 51 C 97.500 51, 96 51.300, 96 52.500 C 96 53.611, 94.833 54, 91.500 54 C 88.167 54, 87 54.389, 87 55.500 C 87 56.667, 85.667 57, 81 57 C 76.333 57, 75 57.333, 75 58.500 C 75 59.611, 73.833 60, 70.500 60 C 67.167 60, 66 60.389, 66 61.500 C 66 62.500, 65 63, 63 63 C 61 63, 60 63.500, 60 64.500 C 60 65.611, 58.833 66, 55.500 66 C 52.167 66, 51 66.389, 51 67.500 C 51 68.500, 50 69, 48 69 C 46 69, 45 69.500, 45 70.500 C 45 71.500, 44 72, 42 72 C 40 72, 39 72.500, 39 73.500 C 39 74.500, 38 75, 36 75 L 33 75 33 99 C 33 119.667, 33.208 123, 34.500 123 C 35.807 123, 36 127.833, 36 160.500 C 36 193.167, 36.193 198, 37.500 198 C 38.808 198, 39 203, 39 237 C 39 271, 39.192 276, 40.500 276 C 41.809 276, 42 281.167, 42 316.500 C 42 351.833, 42.191 357, 43.500 357 C 44.782 357, 45 359.833, 45 376.500 C 45 393.167, 45.218 396, 46.500 396 C 47.667 396, 48 397.333, 48 402 C 48 406.667, 48.333 408, 49.500 408 C 50.611 408, 51 409.167, 51 412.500 C 51 415.833, 51.389 417, 52.500 417 C 53.611 417, 54 418.167, 54 421.500 C 54 424.833, 54.389 426, 55.500 426 C 56.500 426, 57 427, 57 429 C 57 431, 57.500 432, 58.500 432 C 59.500 432, 60 433, 60 435 C 60 437, 60.500 438, 61.500 438 C 62.500 438, 63 439, 63 441 C 63 443, 63.500 444, 64.500 444 C 65.325 444, 66 444.675, 66 445.500 C 66 446.325, 66.675 447, 67.500 447 C 68.500 447, 69 448, 69 450 C 69 452, 69.500 453, 70.500 453 C 71.325 453, 72 453.675, 72 454.500 C 72 455.325, 72.675 456, 73.500 456 C 74.500 456, 75 457, 75 459 C 75 461, 75.500 462, 76.500 462 C 77.325 462, 78 462.675, 78 463.500 C 78 464.325, 78.675 465, 79.500 465 C 80.325 465, 81 465.675, 81 466.500 C 81 467.325, 81.675 468, 82.500 468 C 83.325 468, 84 468.675, 84 469.500 C 84 470.325, 84.675 471, 85.500 471 C 86.325 471, 87 471.675, 87 472.500 C 87 473.325, 87.675 474, 88.500 474 C 89.325 474, 90 474.675, 90 475.500 C 90 476.325, 90.675 477, 91.500 477 C 92.325 477, 93 477.675, 93 478.500 C 93 479.325, 93.675 480, 94.500 480 C 95.325 480, 96 480.675, 96 481.500 C 96 482.325, 96.675 483, 97.500 483 C 98.325 483, 99 483.675, 99 484.500 C 99 485.325, 99.675 486, 100.500 486 C 101.325 486, 102 486.675, 102 487.500 C 102 488.325, 102.675 489, 103.500 489 C 104.325 489, 105 489.675, 105 490.500 C 105 491.325, 105.675 492, 106.500 492 C 107.325 492, 108 492.675, 108 493.500 C 108 494.325, 108.675 495, 109.500 495 C 110.325 495, 111 495.675, 111 496.500 C 111 497.325, 111.675 498, 112.500 498 C 113.325 498, 114 498.675, 114 499.500 C 114 500.500, 115 501, 117 501 C 119 501, 120 501.500, 120 502.500 C 120 503.325, 120.675 504, 121.500 504 C 122.325 504, 123 504.675, 123 505.500 C 123 506.325, 123.675 507, 124.500 507 C 125.325 507, 126 507.675, 126 508.500 C 126 509.500, 127 510, 129 510 C 131 510, 132 510.500, 132 511.500 C 132 512.325, 132.675 513, 133.500 513 C 134.325 513, 135 513.675, 135 514.500 C 135 515.500, 136 516, 138 516 C 140 516, 141 516.500, 141 517.500 C 141 518.325, 141.675 519, 142.500 519 C 143.325 519, 144 519.675, 144 520.500 C 144 521.500, 145 522, 147 522 C 149 522, 150 522.500, 150 523.500 C 150 524.325, 150.675 525, 151.500 525 C 152.325 525, 153 525.675, 153 526.500 C 153 527.500, 154 528, 156 528 C 158 528, 159 528.500, 159 529.500 C 159 530.500, 160 531, 162 531 C 164 531, 165 531.500, 165 532.500 C 165 533.500, 166 534, 168 534 C 170 534, 171 534.500, 171 535.500 C 171 536.325, 171.675 537, 172.500 537 C 173.325 537, 174 537.675, 174 538.500 C 174 539.500, 175 540, 177 540 C 179 540, 180 540.500, 180 541.500 C 180 542.500, 181 543, 183 543 C 185 543, 186 543.500, 186 544.500 C 186 545.500, 187 546, 189 546 C 191 546, 192 546.500, 192 547.500 C 192 548.500, 193 549, 195 549 C 197 549, 198 549.500, 198 550.500 C 198 551.611, 199.167 552, 202.500 552 C 205.833 552, 207 552.389, 207 553.500 C 207 554.500, 208 555, 210 555 C 212 555, 213 555.500, 213 556.500 C 213 557.500, 214 558, 216 558 C 218 558, 219 558.500, 219 559.500 C 219 560.500, 220 561, 222 561 C 224 561, 225 561.500, 225 562.500 C 225 563.611, 226.167 564, 229.500 564 C 232.833 564, 234 564.389, 234 565.500 C 234 566.500, 235 567, 237 567 C 239 567, 240 567.500, 240 568.500 C 240 569.611, 241.167 570, 244.500 570 C 247.833 570, 249 570.389, 249 571.500 C 249 572.611, 250.167 573, 253.500 573 C 256.833 573, 258 572.611, 258 571.500 C 258 570.389, 259.167 570, 262.500 570 C 265.833 570, 267 569.611, 267 568.500 C 267 567.500, 268 567, 270 567 C 272 567, 273 566.500, 273 565.500 C 273 564.500, 274 564, 276 564 C 278 564, 279 563.500, 279 562.500 C 279 561.389, 280.167 561, 283.500 561 C 286.833 561, 288 560.611, 288 559.500 C 288 558.500, 289 558, 291 558 C 293 558, 294 557.500, 294 556.500 C 294 555.500, 295 555, 297 555 C 299 555, 300 554.500, 300 553.500 C 300 552.500, 301 552, 303 552 C 305 552, 306 551.500, 306 550.500 C 306 549.500, 307 549, 309 549 C 311 549, 312 548.500, 312 547.500 C 312 546.389, 313.167 546, 316.500 546 C 319.833 546, 321 545.611, 321 544.500 C 321 543.675, 321.675 543, 322.500 543 C 323.325 543, 324 542.325, 324 541.500 C 324 540.500, 325 540, 327 540 C 329 540, 330 539.500, 330 538.500 C 330 537.500, 331 537, 333 537 C 335 537, 336 536.500, 336 535.500 C 336 534.500, 337 534, 339 534 C 341 534, 342 533.500, 342 532.500 C 342 531.500, 343 531, 345 531 C 347 531, 348 530.500, 348 529.500 C 348 528.675, 348.675 528, 349.500 528 C 350.325 528, 351 527.325, 351 526.500 C 351 525.500, 352 525, 354 525 C 356 525, 357 524.500, 357 523.500 C 357 522.500, 358 522, 360 522 C 362 522, 363 521.500, 363 520.500 C 363 519.675, 363.675 519, 364.500 519 C 365.325 519, 366 518.325, 366 517.500 C 366 516.500, 367 516, 369 516 C 371 516, 372 515.500, 372 514.500 C 372 513.675, 372.675 513, 373.500 513 C 374.325 513, 375 512.325, 375 511.500 C 375 510.675, 375.675 510, 376.500 510 C 377.325 510, 378 509.325, 378 508.500 C 378 507.500, 379 507, 381 507 C 383 507, 384 506.500, 384 505.500 C 384 504.675, 384.675 504, 385.500 504 C 386.325 504, 387 503.325, 387 502.500 C 387 501.675, 387.675 501, 388.500 501 C 389.325 501, 390 500.325, 390 499.500 C 390 498.500, 391 498, 393 498 C 395 498, 396 497.500, 396 496.500 C 396 495.675, 396.675 495, 397.500 495 C 398.325 495, 399 494.325, 399 493.500 C 399 492.675, 399.675 492, 400.500 492 C 401.325 492, 402 491.325, 402 490.500 C 402 489.675, 402.675 489, 403.500 489 C 404.325 489, 405 488.325, 405 487.500 C 405 486.675, 405.675 486, 406.500 486 C 407.325 486, 408 485.325, 408 484.500 C 408 483.675, 408.675 483, 409.500 483 C 410.325 483, 411 482.325, 411 481.500 C 411 480.675, 411.675 480, 412.500 480 C 413.325 480, 414 479.325, 414 478.500 C 414 477.675, 414.675 477, 415.500 477 C 416.325 477, 417 476.325, 417 475.500 C 417 474.675, 417.675 474, 418.500 474 C 419.325 474, 420 473.325, 420 472.500 C 420 471.675, 420.675 471, 421.500 471 C 422.325 471, 423 470.325, 423 469.500 C 423 468.675, 423.675 468, 424.500 468 C 425.325 468, 426 467.325, 426 466.500 C 426 465.675, 426.675 465, 427.500 465 C 428.500 465, 429 464, 429 462 C 429 460, 429.500 459, 430.500 459 C 431.325 459, 432 458.325, 432 457.500 C 432 456.675, 432.675 456, 433.500 456 C 434.325 456, 435 455.325, 435 454.500 C 435 453.675, 435.675 453, 436.500 453 C 437.500 453, 438 452, 438 450 C 438 448, 438.500 447, 439.500 447 C 440.500 447, 441 446, 441 444 C 441 442, 441.500 441, 442.500 441 C 443.325 441, 444 440.325, 444 439.500 C 444 438.675, 444.675 438, 445.500 438 C 446.500 438, 447 437, 447 435 C 447 433, 447.500 432, 448.500 432 C 449.611 432, 450 430.833, 450 427.500 C 450 424.167, 450.389 423, 451.500 423 C 452.500 423, 453 422, 453 420 C 453 418, 453.500 417, 454.500 417 C 455.611 417, 456 415.833, 456 412.500 C 456 409.167, 456.389 408, 457.500 408 C 458.700 408, 459 406.500, 459 400.500 C 459 394.500, 459.300 393, 460.500 393 C 461.796 393, 462 389.333, 462 366 C 462 342.667, 462.204 339, 463.500 339 C 464.808 339, 465 334, 465 300 C 465 266, 465.192 261, 466.500 261 C 467.808 261, 468 256, 468 222 C 468 188, 468.192 183, 469.500 183 C 470.808 183, 471 178, 471 144 C 471 110, 471.192 105, 472.500 105 C 473.767 105, 474 102.667, 474 90 L 474 75 471 75 C 469 75, 468 74.500, 468 73.500 C 468 72.500, 467 72, 465 72 C 463 72, 462 71.500, 462 70.500 C 462 69.500, 461 69, 459 69 C 457 69, 456 68.500, 456 67.500 C 456 66.389, 454.833 66, 451.500 66 C 448.167 66, 447 65.611, 447 64.500 C 447 63.500, 446 63, 444 63 C 442 63, 441 62.500, 441 61.500 C 441 60.389, 439.833 60, 436.500 60 C 433.167 60, 432 59.611, 432 58.500 C 432 57.333, 430.667 57, 426 57 C 421.333 57, 420 56.667, 420 55.500 C 420 54.333, 418.667 54, 414 54 C 409.333 54, 408 53.667, 408 52.500 C 408 51.333, 406.667 51, 402 51 C 397.333 51, 396 50.667, 396 49.500 C 396 48.300, 394.500 48, 388.500 48 C 382.500 48, 381 47.700, 381 46.500 C 381 45.278, 379.333 45, 372 45 C 364.667 45, 363 44.722, 363 43.500 C 363 42.262, 361.167 42, 352.500 42 C 343.833 42, 342 41.738, 342 40.500 C 342 39.233, 339.667 39, 327 39 C 314.333 39, 312 38.767, 312 37.500 C 312 36.184, 304.833 36, 253.500 36 C 202.167 36, 195 36.184, 195 37.500 M 222 55.500 C 222 56.611, 220.833 57, 217.500 57 L 213 57 213 61.500 C 213 65.833, 212.889 66, 210 66 C 208 66, 207 66.500, 207 67.500 C 207 68.325, 206.325 69, 205.500 69 C 204.333 69, 204 70.333, 204 75 C 204 79.667, 204.333 81, 205.500 81 C 206.325 81, 207 81.675, 207 82.500 C 207 83.325, 207.675 84, 208.500 84 C 209.500 84, 210 85, 210 87 C 210 89, 210.500 90, 211.500 90 C 212.325 90, 213 90.675, 213 91.500 C 213 92.325, 212.325 93, 211.500 93 C 210.675 93, 210 93.675, 210 94.500 C 210 95.325, 209.325 96, 208.500 96 C 207.500 96, 207 97, 207 99 C 207 101, 206.500 102, 205.500 102 C 204.675 102, 204 102.675, 204 103.500 C 204 104.325, 203.325 105, 202.500 105 C 201.500 105, 201 106, 201 108 C 201 110, 200.500 111, 199.500 111 C 198.675 111, 198 111.675, 198 112.500 C 198 113.500, 199 114, 201 114 C 203 114, 204 113.500, 204 112.500 C 204 111.675, 204.675 111, 205.500 111 C 206.325 111, 207 110.325, 207 109.500 C 207 108.500, 208 108, 210 108 C 212 108, 213 107.500, 213 106.500 C 213 105.675, 213.675 105, 214.500 105 C 215.500 105, 216 106, 216 108 C 216 110, 215.500 111, 214.500 111 C 213.300 111, 213 112.500, 213 118.500 C 213 124.500, 213.300 126, 214.500 126 C 215.667 126, 216 124.667, 216 120 C 216 115.333, 216.333 114, 217.500 114 C 218.500 114, 219 113, 219 111 C 219 109, 219.500 108, 220.500 108 C 221.500 108, 222 109, 222 111 C 222 113, 222.500 114, 223.500 114 C 224.325 114, 225 114.675, 225 115.500 C 225 116.325, 225.675 117, 226.500 117 C 227.325 117, 228 117.675, 228 118.500 C 228 119.325, 228.675 120, 229.500 120 C 230.325 120, 231 120.675, 231 121.500 C 231 122.500, 232 123, 234 123 C 236 123, 237 123.500, 237 124.500 C 237 125.611, 238.167 126, 241.500 126 C 244.833 126, 246 125.611, 246 124.500 C 246 123.675, 245.325 123, 244.500 123 C 243.675 123, 243 122.325, 243 121.500 C 243 120.675, 242.325 120, 241.500 120 C 240.675 120, 240 119.325, 240 118.500 C 240 117.675, 239.325 117, 238.500 117 C 237.675 117, 237 116.325, 237 115.500 C 237 114.500, 236 114, 234 114 C 232 114, 231 113.500, 231 112.500 C 231 111.675, 231.675 111, 232.500 111 C 233.500 111, 234 110, 234 108 C 234 105.333, 233.667 105, 231 105 C 229 105, 228 105.500, 228 106.500 C 228 107.500, 227 108, 225 108 C 223 108, 222 107.500, 222 106.500 C 222 105.675, 222.675 105, 223.500 105 C 224.325 105, 225 104.325, 225 103.500 C 225 102.389, 226.167 102, 229.500 102 C 233.833 102, 234 101.889, 234 99 C 234 96.333, 233.667 96, 231 96 C 229 96, 228 96.500, 228 97.500 C 228 98.611, 226.833 99, 223.500 99 C 220.167 99, 219 98.611, 219 97.500 C 219 96.500, 220 96, 222 96 C 224.667 96, 225 95.667, 225 93 C 225 91, 224.500 90, 223.500 90 C 222.675 90, 222 89.325, 222 88.500 C 222 87.675, 222.675 87, 223.500 87 C 224.500 87, 225 86, 225 84 C 225 82, 225.500 81, 226.500 81 C 227.325 81, 228 80.325, 228 79.500 C 228 78.500, 229 78, 231 78 C 233 78, 234 77.500, 234 76.500 C 234 75.675, 234.675 75, 235.500 75 C 236.667 75, 237 73.667, 237 69 C 237 64.333, 236.667 63, 235.500 63 C 234.675 63, 234 62.325, 234 61.500 C 234 60.500, 233 60, 231 60 C 228.333 60, 228 59.667, 228 57 C 228 54.333, 227.667 54, 225 54 C 223 54, 222 54.500, 222 55.500 M 276 63 L 276 69 273 69 C 271 69, 270 69.500, 270 70.500 C 270 71.325, 269.325 72, 268.500 72 C 267.675 72, 267 72.675, 267 73.500 C 267 74.500, 268 75, 270 75 C 272 75, 273 74.500, 273 73.500 C 273 72.500, 274 72, 276 72 C 278.667 72, 279 72.333, 279 75 C 279 77.667, 278.667 78, 276 78 C 274 78, 273 78.500, 273 79.500 C 273 80.500, 272 81, 270 81 C 268 81, 267 81.500, 267 82.500 C 267 83.500, 266 84, 264 84 C 262 84, 261 84.500, 261 85.500 C 261 86.611, 262.167 87, 265.500 87 C 268.833 87, 270 86.611, 270 85.500 C 270 84.389, 271.167 84, 274.500 84 C 278.833 84, 279 84.111, 279 87 C 279 89, 278.500 90, 277.500 90 C 276.500 90, 276 91, 276 93 C 276 95, 276.500 96, 277.500 96 C 278.325 96, 279 96.675, 279 97.500 C 279 98.325, 278.325 99, 277.500 99 C 276.675 99, 276 99.675, 276 100.500 C 276 101.325, 276.675 102, 277.500 102 C 278.325 102, 279 102.675, 279 103.500 C 279 104.500, 278 105, 276 105 C 274 105, 273 105.500, 273 106.500 C 273 107.611, 274.167 108, 277.500 108 L 282 108 282 115.500 L 282 123 285 123 C 287.667 123, 288 122.667, 288 120 C 288 117.111, 288.167 117, 292.500 117 C 296.833 117, 297 116.889, 297 114 C 297 111.333, 296.667 111, 294 111 C 291.333 111, 291 110.667, 291 108 C 291 106, 291.500 105, 292.500 105 C 293.667 105, 294 103.667, 294 99 C 294 94.333, 293.667 93, 292.500 93 C 291.675 93, 291 92.325, 291 91.500 C 291 90.500, 292 90, 294 90 C 296 90, 297 89.500, 297 88.500 C 297 87.675, 296.325 87, 295.500 87 C 294.389 87, 294 85.833, 294 82.500 L 294 78 298.500 78 C 301.833 78, 303 77.611, 303 76.500 C 303 75.333, 304.333 75, 309 75 C 313.667 75, 315 74.667, 315 73.500 C 315 72.675, 314.325 72, 313.500 72 C 312.675 72, 312 71.325, 312 70.500 C 312 69.675, 311.325 69, 310.500 69 C 309.675 69, 309 69.675, 309 70.500 C 309 71.700, 307.500 72, 301.500 72 C 295.500 72, 294 72.300, 294 73.500 C 294 74.500, 293 75, 291 75 C 289 75, 288 74.500, 288 73.500 C 288 72.675, 288.675 72, 289.500 72 C 290.325 72, 291 71.325, 291 70.500 C 291 69.500, 292 69, 294 69 C 296 69, 297 68.500, 297 67.500 C 297 66.675, 297.675 66, 298.500 66 C 299.325 66, 300 65.325, 300 64.500 C 300 63.675, 300.675 63, 301.500 63 C 302.325 63, 303 62.325, 303 61.500 C 303 60.675, 302.325 60, 301.500 60 C 300.675 60, 300 59.325, 300 58.500 C 300 57.675, 299.325 57, 298.500 57 C 297.675 57, 297 57.675, 297 58.500 C 297 59.325, 296.325 60, 295.500 60 C 294.675 60, 294 59.325, 294 58.500 C 294 57.500, 293 57, 291 57 C 289 57, 288 57.500, 288 58.500 C 288 59.325, 287.325 60, 286.500 60 C 285.675 60, 285 59.325, 285 58.500 C 285 57.389, 283.833 57, 280.500 57 L 276 57 276 63 M 90 69 C 90 73.667, 89.667 75, 88.500 75 C 87.675 75, 87 75.675, 87 76.500 C 87 77.325, 86.325 78, 85.500 78 C 84.500 78, 84 79, 84 81 C 84 83.667, 84.333 84, 87 84 C 89.889 84, 90 84.167, 90 88.500 C 90 91.833, 89.611 93, 88.500 93 C 87.675 93, 87 93.675, 87 94.500 C 87 95.325, 86.325 96, 85.500 96 C 84.675 96, 84 95.325, 84 94.500 C 84 93.675, 83.325 93, 82.500 93 C 81.500 93, 81 92, 81 90 C 81 87.333, 80.667 87, 78 87 C 76 87, 75 87.500, 75 88.500 C 75 89.325, 74.325 90, 73.500 90 C 72.500 90, 72 91, 72 93 C 72 95, 72.500 96, 73.500 96 C 74.500 96, 75 97, 75 99 L 75 102 82.500 102 L 90 102 90 105 C 90 107, 90.500 108, 91.500 108 C 92.750 108, 93 110, 93 120 C 93 130, 93.250 132, 94.500 132 C 95.325 132, 96 132.675, 96 133.500 C 96 134.325, 96.675 135, 97.500 135 C 98.782 135, 99 132.167, 99 115.500 L 99 96 102 96 C 104 96, 105 95.500, 105 94.500 C 105 93.675, 105.675 93, 106.500 93 C 107.325 93, 108 92.325, 108 91.500 C 108 90.675, 108.675 90, 109.500 90 C 110.500 90, 111 89, 111 87 C 111 85, 111.500 84, 112.500 84 C 113.667 84, 114 82.667, 114 78 C 114 73.333, 113.667 72, 112.500 72 C 111.675 72, 111 71.325, 111 70.500 C 111 69.333, 109.667 69, 105 69 C 100.333 69, 99 69.333, 99 70.500 C 99 71.325, 98.325 72, 97.500 72 C 96.389 72, 96 70.833, 96 67.500 C 96 63.167, 95.889 63, 93 63 L 90 63 90 69 M 156 67.500 C 156 68.500, 155 69, 153 69 C 151 69, 150 69.500, 150 70.500 C 150 71.325, 149.325 72, 148.500 72 C 147.500 72, 147 73, 147 75 C 147 77.667, 147.333 78, 150 78 C 152 78, 153 78.500, 153 79.500 C 153 80.325, 152.325 81, 151.500 81 C 150.675 81, 150 81.675, 150 82.500 C 150 83.325, 149.325 84, 148.500 84 C 147.675 84, 147 84.675, 147 85.500 C 147 86.325, 147.675 87, 148.500 87 C 149.325 87, 150 87.675, 150 88.500 C 150 89.325, 149.325 90, 148.500 90 C 147.675 90, 147 90.675, 147 91.500 C 147 92.325, 146.325 93, 145.500 93 C 144.500 93, 144 94, 144 96 C 144 98, 144.500 99, 145.500 99 C 146.325 99, 147 99.675, 147 100.500 C 147 101.325, 147.675 102, 148.500 102 C 149.500 102, 150 103, 150 105 C 150 107, 149.500 108, 148.500 108 C 147.675 108, 147 108.675, 147 109.500 C 147 110.325, 147.675 111, 148.500 111 C 149.325 111, 150 111.675, 150 112.500 C 150 113.325, 150.675 114, 151.500 114 C 152.325 114, 153 114.675, 153 115.500 C 153 116.325, 152.325 117, 151.500 117 C 150.500 117, 150 118, 150 120 C 150 122.667, 150.333 123, 153 123 C 155 123, 156 122.500, 156 121.500 C 156 120.278, 157.667 120, 165 120 C 172.333 120, 174 119.722, 174 118.500 C 174 117.675, 174.675 117, 175.500 117 C 176.611 117, 177 115.833, 177 112.500 C 177 109.167, 177.389 108, 178.500 108 C 179.759 108, 180 105.833, 180 94.500 C 180 83.167, 179.759 81, 178.500 81 C 177.389 81, 177 79.833, 177 76.500 C 177 73.167, 176.611 72, 175.500 72 C 174.675 72, 174 71.325, 174 70.500 C 174 69.675, 173.325 69, 172.500 69 C 171.675 69, 171 68.325, 171 67.500 C 171 66.300, 169.500 66, 163.500 66 C 157.500 66, 156 66.300, 156 67.500 M 225 67.500 C 225 68.325, 225.675 69, 226.500 69 C 227.325 69, 228 69.675, 228 70.500 C 228 71.325, 228.675 72, 229.500 72 C 230.500 72, 231 71, 231 69 C 231 66.333, 230.667 66, 228 66 C 226 66, 225 66.500, 225 67.500 M 420 67.500 C 420 68.325, 419.325 69, 418.500 69 C 417.333 69, 417 70.333, 417 75 L 417 81 414 81 C 412 81, 411 80.500, 411 79.500 C 411 78.675, 411.675 78, 412.500 78 C 413.500 78, 414 77, 414 75 C 414 72.333, 413.667 72, 411 72 C 408.333 72, 408 72.333, 408 75 C 408 77, 407.500 78, 406.500 78 C 405.675 78, 405 77.325, 405 76.500 C 405 75.675, 404.325 75, 403.500 75 C 402.675 75, 402 74.325, 402 73.500 C 402 72.675, 401.325 72, 400.500 72 C 399.675 72, 399 72.675, 399 73.500 C 399 74.325, 398.325 75, 397.500 75 C 396.389 75, 396 76.167, 396 79.500 C 396 82.833, 395.611 84, 394.500 84 C 393.500 84, 393 85, 393 87 C 393 89, 393.500 90, 394.500 90 C 395.325 90, 396 90.675, 396 91.500 C 396 92.325, 396.675 93, 397.500 93 C 398.325 93, 399 92.325, 399 91.500 C 399 90.500, 400 90, 402 90 C 404 90, 405 90.500, 405 91.500 C 405 92.325, 404.325 93, 403.500 93 C 402.675 93, 402 93.675, 402 94.500 C 402 95.500, 401 96, 399 96 C 396.333 96, 396 96.333, 396 99 C 396 101.667, 396.333 102, 399 102 C 401 102, 402 101.500, 402 100.500 C 402 99.675, 402.675 99, 403.500 99 C 404.500 99, 405 100, 405 102 C 405 104, 405.500 105, 406.500 105 C 407.500 105, 408 106, 408 108 C 408 110, 407.500 111, 406.500 111 C 405.675 111, 405 111.675, 405 112.500 C 405 113.700, 403.500 114, 397.500 114 C 391.500 114, 390 114.300, 390 115.500 C 390 116.325, 389.325 117, 388.500 117 C 387.500 117, 387 118, 387 120 L 387 123 394.500 123 C 400.500 123, 402 122.700, 402 121.500 C 402 120.675, 402.675 120, 403.500 120 C 404.500 120, 405 121, 405 123 C 405 125.667, 404.667 126, 402 126 C 399.111 126, 399 126.167, 399 130.500 C 399 134.833, 399.111 135, 402 135 C 404 135, 405 134.500, 405 133.500 C 405 132.675, 405.675 132, 406.500 132 C 407.325 132, 408 131.325, 408 130.500 C 408 129.675, 408.675 129, 409.500 129 C 410.611 129, 411 127.833, 411 124.500 C 411 121.167, 411.389 120, 412.500 120 C 413.325 120, 414 120.675, 414 121.500 C 414 122.325, 414.675 123, 415.500 123 C 416.325 123, 417 122.325, 417 121.500 C 417 120.675, 417.675 120, 418.500 120 C 419.500 120, 420 119, 420 117 C 420 114.111, 419.833 114, 415.500 114 C 411.167 114, 411 113.889, 411 111 C 411 109, 411.500 108, 412.500 108 C 413.500 108, 414 107, 414 105 C 414 103, 413.500 102, 412.500 102 C 411.675 102, 411 101.325, 411 100.500 C 411 99.675, 410.325 99, 409.500 99 C 408.675 99, 408 98.325, 408 97.500 C 408 96.262, 409.833 96, 418.500 96 C 427.167 96, 429 96.262, 429 97.500 C 429 98.325, 428.325 99, 427.500 99 C 426.675 99, 426 99.675, 426 100.500 C 426 101.325, 425.325 102, 424.500 102 C 423.675 102, 423 102.675, 423 103.500 C 423 104.500, 424 105, 426 105 C 428 105, 429 104.500, 429 103.500 C 429 102.675, 429.675 102, 430.500 102 C 431.325 102, 432 101.325, 432 100.500 C 432 99.675, 432.675 99, 433.500 99 C 434.325 99, 435 98.325, 435 97.500 C 435 96.675, 434.325 96, 433.500 96 C 432.675 96, 432 95.325, 432 94.500 C 432 93.500, 431 93, 429 93 C 427 93, 426 92.500, 426 91.500 C 426 90.500, 425 90, 423 90 C 420.333 90, 420 89.667, 420 87 C 420 84.333, 420.333 84, 423 84 C 425.667 84, 426 83.667, 426 81 C 426 79, 425.500 78, 424.500 78 C 423.675 78, 423 77.325, 423 76.500 C 423 75.675, 423.675 75, 424.500 75 C 425.611 75, 426 73.833, 426 70.500 C 426 66.167, 425.889 66, 423 66 C 421 66, 420 66.500, 420 67.500 M 342 72 C 342 74, 341.500 75, 340.500 75 C 339.500 75, 339 76, 339 78 L 339 81 333 81 L 327 81 327 84 C 327 86, 327.500 87, 328.500 87 C 329.325 87, 330 87.675, 330 88.500 C 330 89.500, 331 90, 333 90 C 335 90, 336 90.500, 336 91.500 C 336 92.325, 335.325 93, 334.500 93 C 333.500 93, 333 94, 333 96 C 333 98, 332.500 99, 331.500 99 C 330.675 99, 330 99.675, 330 100.500 C 330 101.325, 329.325 102, 328.500 102 C 327.675 102, 327 102.675, 327 103.500 C 327 104.325, 326.325 105, 325.500 105 C 324.675 105, 324 105.675, 324 106.500 C 324 107.500, 325 108, 327 108 C 329 108, 330 107.500, 330 106.500 C 330 105.500, 331 105, 333 105 C 335 105, 336 104.500, 336 103.500 C 336 102.675, 336.675 102, 337.500 102 C 338.500 102, 339 101, 339 99 C 339 97, 339.500 96, 340.500 96 C 341.325 96, 342 96.675, 342 97.500 C 342 98.325, 342.675 99, 343.500 99 C 344.500 99, 345 100, 345 102 C 345 104, 345.500 105, 346.500 105 C 347.500 105, 348 106, 348 108 C 348 110, 348.500 111, 349.500 111 C 350.325 111, 351 111.675, 351 112.500 C 351 113.325, 351.675 114, 352.500 114 C 353.325 114, 354 114.675, 354 115.500 C 354 116.611, 355.167 117, 358.500 117 C 361.833 117, 363 117.389, 363 118.500 C 363 119.325, 363.675 120, 364.500 120 C 365.325 120, 366 119.325, 366 118.500 C 366 117.675, 366.675 117, 367.500 117 C 368.325 117, 369 116.325, 369 115.500 C 369 114.675, 368.325 114, 367.500 114 C 366.675 114, 366 113.325, 366 112.500 C 366 111.675, 365.325 111, 364.500 111 C 363.675 111, 363 110.325, 363 109.500 C 363 108.675, 362.325 108, 361.500 108 C 360.675 108, 360 107.325, 360 106.500 C 360 105.675, 359.325 105, 358.500 105 C 357.675 105, 357 104.325, 357 103.500 C 357 102.675, 356.325 102, 355.500 102 C 354.675 102, 354 101.325, 354 100.500 C 354 99.675, 353.325 99, 352.500 99 C 351.675 99, 351 98.325, 351 97.500 C 351 96.675, 350.325 96, 349.500 96 C 348.675 96, 348 95.325, 348 94.500 C 348 93.675, 347.325 93, 346.500 93 C 345.675 93, 345 92.325, 345 91.500 C 345 90.675, 345.675 90, 346.500 90 C 347.325 90, 348 89.325, 348 88.500 C 348 87.389, 349.167 87, 352.500 87 C 355.833 87, 357 86.611, 357 85.500 C 357 84.675, 357.675 84, 358.500 84 C 359.500 84, 360 83, 360 81 C 360 78.333, 359.667 78, 357 78 C 355 78, 354 77.500, 354 76.500 C 354 75.675, 353.325 75, 352.500 75 C 351.500 75, 351 74, 351 72 C 351 69.111, 350.833 69, 346.500 69 C 342.167 69, 342 69.111, 342 72 M 159 75 C 159 77, 159.500 78, 160.500 78 C 161.325 78, 162 77.325, 162 76.500 C 162 75.675, 162.675 75, 163.500 75 C 164.325 75, 165 74.325, 165 73.500 C 165 72.500, 164 72, 162 72 C 159.333 72, 159 72.333, 159 75 M 210 75 C 210 77, 210.500 78, 211.500 78 C 212.500 78, 213 77, 213 75 C 213 73, 212.500 72, 211.500 72 C 210.500 72, 210 73, 210 75 M 225 73.500 C 225 74.325, 225.675 75, 226.500 75 C 227.325 75, 228 74.325, 228 73.500 C 228 72.675, 227.325 72, 226.500 72 C 225.675 72, 225 72.675, 225 73.500 M 222 76.500 C 222 77.325, 222.675 78, 223.500 78 C 224.325 78, 225 77.325, 225 76.500 C 225 75.675, 224.325 75, 223.500 75 C 222.675 75, 222 75.675, 222 76.500 M 102 79.500 C 102 80.500, 101 81, 99 81 C 96.333 81, 96 81.333, 96 84 C 96 86, 96.500 87, 97.500 87 C 98.325 87, 99 87.675, 99 88.500 C 99 89.325, 99.675 90, 100.500 90 C 101.325 90, 102 89.325, 102 88.500 C 102 87.675, 102.675 87, 103.500 87 C 104.611 87, 105 85.833, 105 82.500 C 105 79.167, 104.611 78, 103.500 78 C 102.675 78, 102 78.675, 102 79.500 M 135 82.500 C 135 83.325, 134.325 84, 133.500 84 C 132.241 84, 132 86.167, 132 97.500 C 132 108.833, 132.241 111, 133.500 111 C 134.611 111, 135 112.167, 135 115.500 C 135 119.833, 135.111 120, 138 120 C 140 120, 141 119.500, 141 118.500 C 141 117.675, 141.675 117, 142.500 117 C 143.325 117, 144 116.325, 144 115.500 C 144 114.675, 143.325 114, 142.500 114 C 141.227 114, 141 111.500, 141 97.500 L 141 81 138 81 C 136 81, 135 81.500, 135 82.500 M 168 82.500 C 168 83.500, 167 84, 165 84 C 163 84, 162 84.500, 162 85.500 C 162 86.325, 162.675 87, 163.500 87 C 164.325 87, 165 87.675, 165 88.500 C 165 89.611, 166.167 90, 169.500 90 L 174 90 174 85.500 C 174 81.167, 173.889 81, 171 81 C 169 81, 168 81.500, 168 82.500 M 402 85.500 C 402 86.325, 402.675 87, 403.500 87 C 404.325 87, 405 86.325, 405 85.500 C 405 84.675, 404.325 84, 403.500 84 C 402.675 84, 402 84.675, 402 85.500 M 255 90 C 255 92, 255.500 93, 256.500 93 C 257.325 93, 258 92.325, 258 91.500 C 258 90.675, 258.675 90, 259.500 90 C 260.325 90, 261 89.325, 261 88.500 C 261 87.500, 260 87, 258 87 C 255.333 87, 255 87.333, 255 90 M 411 88.500 C 411 89.325, 411.675 90, 412.500 90 C 413.325 90, 414 89.325, 414 88.500 C 414 87.675, 413.325 87, 412.500 87 C 411.675 87, 411 87.675, 411 88.500 M 279 94.500 C 279 95.325, 279.675 96, 280.500 96 C 281.325 96, 282 95.325, 282 94.500 C 282 93.675, 281.325 93, 280.500 93 C 279.675 93, 279 93.675, 279 94.500 M 159 97.500 C 159 98.325, 159.675 99, 160.500 99 C 161.325 99, 162 98.325, 162 97.500 C 162 96.675, 161.325 96, 160.500 96 C 159.675 96, 159 96.675, 159 97.500 M 171 102 L 171 108 163.500 108 C 157.500 108, 156 108.300, 156 109.500 C 156 110.325, 155.325 111, 154.500 111 C 153.675 111, 153 111.675, 153 112.500 C 153 113.611, 154.167 114, 157.500 114 C 160.833 114, 162 113.611, 162 112.500 C 162 111.500, 163 111, 165 111 C 167 111, 168 111.500, 168 112.500 C 168 113.500, 169 114, 171 114 L 174 114 174 105 C 174 97.667, 173.722 96, 172.500 96 C 171.333 96, 171 97.333, 171 102 M 387 97.500 C 387 98.325, 387.675 99, 388.500 99 C 389.325 99, 390 98.325, 390 97.500 C 390 96.675, 389.325 96, 388.500 96 C 387.675 96, 387 96.675, 387 97.500 M 216 100.500 C 216 101.325, 216.675 102, 217.500 102 C 218.325 102, 219 101.325, 219 100.500 C 219 99.675, 218.325 99, 217.500 99 C 216.675 99, 216 99.675, 216 100.500 M 384 100.500 C 384 101.325, 383.325 102, 382.500 102 C 381.389 102, 381 103.167, 381 106.500 C 381 110.833, 381.111 111, 384 111 L 387 111 387 105 C 387 100.333, 386.667 99, 385.500 99 C 384.675 99, 384 99.675, 384 100.500 M 156 103.500 C 156 104.325, 156.675 105, 157.500 105 C 158.325 105, 159 104.325, 159 103.500 C 159 102.675, 158.325 102, 157.500 102 C 156.675 102, 156 102.675, 156 103.500 M 270 115.500 C 270 119.833, 270.111 120, 273 120 C 275.889 120, 276 119.833, 276 115.500 C 276 111.167, 275.889 111, 273 111 C 270.111 111, 270 111.167, 270 115.500 M 48 147 C 48 149, 47.500 150, 46.500 150 C 45.389 150, 45 151.167, 45 154.500 C 45 157.833, 45.389 159, 46.500 159 C 47.325 159, 48 159.675, 48 160.500 C 48 161.325, 48.675 162, 49.500 162 C 50.325 162, 51 162.675, 51 163.500 C 51 164.500, 52 165, 54 165 C 56 165, 57 164.500, 57 163.500 C 57 162.675, 57.675 162, 58.500 162 C 59.500 162, 60 161, 60 159 C 60 157, 59.500 156, 58.500 156 C 57.675 156, 57 156.675, 57 157.500 C 57 158.500, 56 159, 54 159 L 51 159 51 153 L 51 147 54 147 C 56 147, 57 147.500, 57 148.500 C 57 149.325, 57.675 150, 58.500 150 C 59.500 150, 60 149, 60 147 L 60 144 54 144 L 48 144 48 147 M 63 153 L 63 162 66 162 C 68.667 162, 69 161.667, 69 159 C 69 156.333, 69.333 156, 72 156 C 74.889 156, 75 156.167, 75 160.500 C 75 163.833, 75.389 165, 76.500 165 C 77.738 165, 78 163.167, 78 154.500 C 78 145.833, 77.738 144, 76.500 144 C 75.500 144, 75 145, 75 147 C 75 149.667, 74.667 150, 72 150 C 69.333 150, 69 149.667, 69 147 C 69 144.333, 68.667 144, 66 144 L 63 144 63 153 M 81 154.500 C 81 163.167, 81.262 165, 82.500 165 C 83.738 165, 84 163.167, 84 154.500 C 84 145.833, 83.738 144, 82.500 144 C 81.262 144, 81 145.833, 81 154.500 M 87 154.500 C 87 163.167, 87.262 165, 88.500 165 C 89.611 165, 90 163.833, 90 160.500 C 90 156.167, 90.111 156, 93 156 C 95.667 156, 96 156.333, 96 159 C 96 161, 96.500 162, 97.500 162 C 98.325 162, 99 162.675, 99 163.500 C 99 164.325, 99.675 165, 100.500 165 C 101.738 165, 102 163.167, 102 154.500 C 102 145.833, 101.738 144, 100.500 144 C 99.389 144, 99 145.167, 99 148.500 C 99 151.833, 98.611 153, 97.500 153 C 96.675 153, 96 152.325, 96 151.500 C 96 150.675, 95.325 150, 94.500 150 C 93.500 150, 93 149, 93 147 C 93 144.333, 92.667 144, 90 144 L 87 144 87 154.500 M 108 148.500 C 108 151.833, 107.611 153, 106.500 153 C 105.333 153, 105 154.333, 105 159 C 105 163.667, 105.333 165, 106.500 165 C 107.500 165, 108 164, 108 162 C 108 159.333, 108.333 159, 111 159 C 113 159, 114 159.500, 114 160.500 C 114 161.325, 114.675 162, 115.500 162 C 116.325 162, 117 162.675, 117 163.500 C 117 164.325, 117.675 165, 118.500 165 C 119.611 165, 120 163.833, 120 160.500 C 120 157.167, 119.611 156, 118.500 156 C 117.389 156, 117 154.833, 117 151.500 C 117 148.167, 116.611 147, 115.500 147 C 114.675 147, 114 146.325, 114 145.500 C 114 144.500, 113 144, 111 144 C 108.111 144, 108 144.167, 108 148.500 M 135 145.500 C 135 146.325, 134.325 147, 133.500 147 C 132.389 147, 132 148.167, 132 151.500 C 132 154.833, 131.611 156, 130.500 156 C 129.389 156, 129 157.167, 129 160.500 C 129 163.833, 129.389 165, 130.500 165 C 131.325 165, 132 164.325, 132 163.500 C 132 162.675, 132.675 162, 133.500 162 C 134.325 162, 135 161.325, 135 160.500 C 135 159.500, 136 159, 138 159 C 140.667 159, 141 159.333, 141 162 C 141 164.667, 141.333 165, 144 165 C 146 165, 147 164.500, 147 163.500 C 147 162.675, 146.325 162, 145.500 162 C 144.389 162, 144 160.833, 144 157.500 C 144 154.167, 143.611 153, 142.500 153 C 141.389 153, 141 151.833, 141 148.500 C 141 144.167, 140.889 144, 138 144 C 136 144, 135 144.500, 135 145.500 M 150 145.500 C 150 146.325, 149.325 147, 148.500 147 C 147.333 147, 147 148.333, 147 153 C 147 157.667, 147.333 159, 148.500 159 C 149.325 159, 150 159.675, 150 160.500 C 150 161.325, 150.675 162, 151.500 162 C 152.325 162, 153 162.675, 153 163.500 C 153 164.500, 154 165, 156 165 C 158 165, 159 164.500, 159 163.500 C 159 162.675, 159.675 162, 160.500 162 C 161.325 162, 162 161.325, 162 160.500 C 162 159.675, 162.675 159, 163.500 159 C 164.500 159, 165 160, 165 162 C 165 164, 165.500 165, 166.500 165 C 167.325 165, 168 164.325, 168 163.500 C 168 162.675, 168.675 162, 169.500 162 C 170.500 162, 171 161, 171 159 C 171 157, 171.500 156, 172.500 156 C 173.500 156, 174 157, 174 159 C 174 161, 174.500 162, 175.500 162 C 176.325 162, 177 162.675, 177 163.500 C 177 164.611, 178.167 165, 181.500 165 L 186 165 186 160.500 C 186 157.167, 186.389 156, 187.500 156 C 188.500 156, 189 157, 189 159 C 189 161, 189.500 162, 190.500 162 C 191.325 162, 192 162.675, 192 163.500 C 192 164.611, 193.167 165, 196.500 165 C 199.833 165, 201 164.611, 201 163.500 C 201 162.675, 201.675 162, 202.500 162 C 203.500 162, 204 161, 204 159 C 204 157, 203.500 156, 202.500 156 C 201.675 156, 201 156.675, 201 157.500 C 201 158.500, 200 159, 198 159 C 196 159, 195 158.500, 195 157.500 C 195 156.675, 194.325 156, 193.500 156 C 192.500 156, 192 155, 192 153 C 192 151, 192.500 150, 193.500 150 C 194.325 150, 195 149.325, 195 148.500 C 195 147.500, 196 147, 198 147 C 200 147, 201 147.500, 201 148.500 C 201 149.325, 201.675 150, 202.500 150 C 203.500 150, 204 149, 204 147 L 204 144 198 144 C 193.333 144, 192 144.333, 192 145.500 C 192 146.325, 191.325 147, 190.500 147 C 189.675 147, 189 147.675, 189 148.500 C 189 149.325, 188.325 150, 187.500 150 C 186.500 150, 186 149, 186 147 C 186 145, 185.500 144, 184.500 144 C 183.278 144, 183 145.667, 183 153 C 183 160.333, 182.722 162, 181.500 162 C 180.500 162, 180 161, 180 159 C 180 157, 179.500 156, 178.500 156 C 177.675 156, 177 155.325, 177 154.500 C 177 153.675, 177.675 153, 178.500 153 C 179.611 153, 180 151.833, 180 148.500 L 180 144 172.500 144 L 165 144 165 150 C 165 154.667, 164.667 156, 163.500 156 C 162.675 156, 162 155.325, 162 154.500 C 162 153.500, 161 153, 159 153 C 157 153, 156 153.500, 156 154.500 C 156 155.325, 156.675 156, 157.500 156 C 158.325 156, 159 156.675, 159 157.500 C 159 158.500, 158 159, 156 159 C 154 159, 153 158.500, 153 157.500 C 153 156.675, 152.325 156, 151.500 156 C 150.500 156, 150 155, 150 153 C 150 151, 150.500 150, 151.500 150 C 152.325 150, 153 149.325, 153 148.500 C 153 147.500, 154 147, 156 147 C 158 147, 159 147.500, 159 148.500 C 159 149.325, 159.675 150, 160.500 150 C 161.500 150, 162 149, 162 147 L 162 144 156 144 C 151.333 144, 150 144.333, 150 145.500 M 207 153 C 207 160.333, 207.278 162, 208.500 162 C 209.325 162, 210 162.675, 210 163.500 C 210 164.611, 211.167 165, 214.500 165 C 218.833 165, 219 164.889, 219 162 C 219 160, 219.500 159, 220.500 159 C 221.700 159, 222 157.500, 222 151.500 L 222 144 219 144 L 216 144 216 151.500 L 216 159 213 159 L 210 159 210 151.500 C 210 145.500, 209.700 144, 208.500 144 C 207.278 144, 207 145.667, 207 153 M 225 154.500 L 225 165 231 165 L 237 165 237 162 C 237 159.111, 236.833 159, 232.500 159 L 228 159 228 151.500 C 228 145.500, 227.700 144, 226.500 144 C 225.262 144, 225 145.833, 225 154.500 M 234 145.500 C 234 146.500, 235 147, 237 147 L 240 147 240 156 C 240 163.333, 240.278 165, 241.500 165 C 242.325 165, 243 164.325, 243 163.500 C 243 162.675, 243.675 162, 244.500 162 C 245.700 162, 246 160.500, 246 154.500 L 246 147 249 147 L 252 147 252 154.500 C 252 160.500, 252.300 162, 253.500 162 C 254.325 162, 255 162.675, 255 163.500 C 255 164.500, 256 165, 258 165 C 260 165, 261 164.500, 261 163.500 C 261 162.675, 261.675 162, 262.500 162 C 263.722 162, 264 160.333, 264 153 C 264 145.667, 263.722 144, 262.500 144 C 261.300 144, 261 145.500, 261 151.500 L 261 159 258 159 L 255 159 255 151.500 L 255 144 244.500 144 C 235.833 144, 234 144.262, 234 145.500 M 267 153 C 267 160.333, 267.278 162, 268.500 162 C 269.325 162, 270 162.675, 270 163.500 C 270 164.325, 270.675 165, 271.500 165 C 272.611 165, 273 163.833, 273 160.500 C 273 157.167, 273.389 156, 274.500 156 C 275.325 156, 276 156.675, 276 157.500 C 276 158.325, 276.675 159, 277.500 159 C 278.500 159, 279 160, 279 162 C 279 164.889, 279.167 165, 283.500 165 C 287.833 165, 288 164.889, 288 162 C 288 159.111, 288.167 159, 292.500 159 C 296.833 159, 297 159.111, 297 162 C 297 164, 297.500 165, 298.500 165 C 299.667 165, 300 163.667, 300 159 C 300 154.333, 299.667 153, 298.500 153 C 297.500 153, 297 152, 297 150 C 297 148, 296.500 147, 295.500 147 C 294.675 147, 294 146.325, 294 145.500 C 294 144.675, 293.325 144, 292.500 144 C 291.675 144, 291 144.675, 291 145.500 C 291 146.325, 290.325 147, 289.500 147 C 288.389 147, 288 148.167, 288 151.500 C 288 154.833, 287.611 156, 286.500 156 C 285.675 156, 285 156.675, 285 157.500 C 285 158.325, 284.325 159, 283.500 159 C 282.675 159, 282 158.325, 282 157.500 C 282 156.675, 281.325 156, 280.500 156 C 279.675 156, 279 155.325, 279 154.500 C 279 153.675, 279.675 153, 280.500 153 C 281.611 153, 282 151.833, 282 148.500 L 282 144 274.500 144 L 267 144 267 153 M 303 154.500 L 303 165 309 165 L 315 165 315 162 C 315 159.111, 314.833 159, 310.500 159 L 306 159 306 151.500 C 306 145.500, 305.700 144, 304.500 144 C 303.262 144, 303 145.833, 303 154.500 M 321 153 C 321 160.333, 321.278 162, 322.500 162 C 323.325 162, 324 162.675, 324 163.500 C 324 164.611, 325.167 165, 328.500 165 C 331.833 165, 333 164.611, 333 163.500 C 333 162.675, 333.675 162, 334.500 162 C 335.722 162, 336 160.333, 336 153 C 336 145.667, 335.722 144, 334.500 144 C 333.300 144, 333 145.500, 333 151.500 L 333 159 330 159 L 327 159 327 151.500 L 327 144 324 144 L 321 144 321 153 M 339 154.500 C 339 163.167, 339.262 165, 340.500 165 C 341.611 165, 342 163.833, 342 160.500 C 342 157.167, 342.389 156, 343.500 156 C 344.325 156, 345 156.675, 345 157.500 C 345 158.325, 345.675 159, 346.500 159 C 347.325 159, 348 159.675, 348 160.500 C 348 161.325, 348.675 162, 349.500 162 C 350.325 162, 351 162.675, 351 163.500 C 351 164.325, 351.675 165, 352.500 165 C 353.738 165, 354 163.167, 354 154.500 C 354 145.833, 353.738 144, 352.500 144 C 351.389 144, 351 145.167, 351 148.500 C 351 151.833, 350.611 153, 349.500 153 C 348.675 153, 348 152.325, 348 151.500 C 348 150.675, 347.325 150, 346.500 150 C 345.500 150, 345 149, 345 147 C 345 144.333, 344.667 144, 342 144 L 339 144 339 154.500 M 357 154.500 C 357 163.167, 357.262 165, 358.500 165 C 359.722 165, 360 163.333, 360 156 C 360 148.667, 360.278 147, 361.500 147 C 362.611 147, 363 148.167, 363 151.500 C 363 154.833, 363.389 156, 364.500 156 C 365.611 156, 366 157.167, 366 160.500 C 366 164.833, 366.111 165, 369 165 C 371.889 165, 372 164.833, 372 160.500 C 372 157.167, 372.389 156, 373.500 156 C 374.611 156, 375 154.833, 375 151.500 C 375 148.167, 375.389 147, 376.500 147 C 377.722 147, 378 148.667, 378 156 L 378 165 385.500 165 C 391.500 165, 393 164.700, 393 163.500 C 393 162.675, 393.675 162, 394.500 162 C 395.325 162, 396 162.675, 396 163.500 C 396 164.325, 396.675 165, 397.500 165 C 398.611 165, 399 163.833, 399 160.500 C 399 157.167, 399.389 156, 400.500 156 C 401.325 156, 402 156.675, 402 157.500 C 402 158.325, 402.675 159, 403.500 159 C 404.500 159, 405 160, 405 162 C 405 164, 405.500 165, 406.500 165 C 407.611 165, 408 163.833, 408 160.500 C 408 157.167, 407.611 156, 406.500 156 C 405.675 156, 405 155.325, 405 154.500 C 405 153.675, 405.675 153, 406.500 153 C 407.611 153, 408 151.833, 408 148.500 L 408 144 390 144 L 372 144 372 148.500 C 372 152.833, 371.889 153, 369 153 C 366.111 153, 366 152.833, 366 148.500 L 366 144 361.500 144 L 357 144 357 154.500 M 411 148.500 C 411 151.833, 411.389 153, 412.500 153 C 413.325 153, 414 153.675, 414 154.500 C 414 155.325, 413.325 156, 412.500 156 C 411.500 156, 411 157, 411 159 C 411 161, 411.500 162, 412.500 162 C 413.325 162, 414 162.675, 414 163.500 C 414 164.611, 415.167 165, 418.500 165 C 421.833 165, 423 164.611, 423 163.500 C 423 162.500, 424 162, 426 162 C 428 162, 429 162.500, 429 163.500 C 429 164.325, 429.675 165, 430.500 165 C 431.722 165, 432 163.333, 432 156 L 432 147 435 147 L 438 147 438 156 C 438 163.333, 438.278 165, 439.500 165 C 440.722 165, 441 163.333, 441 156 L 441 147 445.500 147 C 449.833 147, 450 147.111, 450 150 C 450 152, 450.500 153, 451.500 153 C 452.667 153, 453 154.333, 453 159 C 453 163.667, 453.333 165, 454.500 165 C 455.667 165, 456 163.667, 456 159 C 456 154.333, 456.333 153, 457.500 153 C 458.325 153, 459 152.325, 459 151.500 C 459 150.675, 459.675 150, 460.500 150 C 461.500 150, 462 149, 462 147 C 462 144.333, 461.667 144, 459 144 C 456.333 144, 456 144.333, 456 147 C 456 149, 455.500 150, 454.500 150 C 453.500 150, 453 149, 453 147 L 453 144 439.500 144 L 426 144 426 150 C 426 154.667, 425.667 156, 424.500 156 C 423.675 156, 423 155.325, 423 154.500 C 423 153.675, 422.325 153, 421.500 153 C 420.675 153, 420 152.325, 420 151.500 C 420 150.675, 420.675 150, 421.500 150 C 422.500 150, 423 149, 423 147 L 423 144 417 144 L 411 144 411 148.500 M 171 150 C 171 152, 171.500 153, 172.500 153 C 173.325 153, 174 152.325, 174 151.500 C 174 150.675, 174.675 150, 175.500 150 C 176.325 150, 177 149.325, 177 148.500 C 177 147.500, 176 147, 174 147 C 171.333 147, 171 147.333, 171 150 M 273 150 C 273 152, 273.500 153, 274.500 153 C 275.325 153, 276 152.325, 276 151.500 C 276 150.675, 276.675 150, 277.500 150 C 278.325 150, 279 149.325, 279 148.500 C 279 147.500, 278 147, 276 147 C 273.333 147, 273 147.333, 273 150 M 384 148.500 C 384 149.500, 385 150, 387 150 C 389.667 150, 390 150.333, 390 153 C 390 155.889, 389.833 156, 385.500 156 C 382.167 156, 381 156.389, 381 157.500 C 381 158.611, 382.167 159, 385.500 159 C 388.833 159, 390 159.389, 390 160.500 C 390 161.325, 390.675 162, 391.500 162 C 392.700 162, 393 160.500, 393 154.500 L 393 147 388.500 147 C 385.167 147, 384 147.389, 384 148.500 M 399 150 C 399 152, 399.500 153, 400.500 153 C 401.325 153, 402 152.325, 402 151.500 C 402 150.675, 402.675 150, 403.500 150 C 404.325 150, 405 149.325, 405 148.500 C 405 147.500, 404 147, 402 147 C 399.333 147, 399 147.333, 399 150 M 417 148.500 C 417 149.325, 417.675 150, 418.500 150 C 419.325 150, 420 149.325, 420 148.500 C 420 147.675, 419.325 147, 418.500 147 C 417.675 147, 417 147.675, 417 148.500 M 111 154.500 C 111 155.325, 111.675 156, 112.500 156 C 113.325 156, 114 155.325, 114 154.500 C 114 153.675, 113.325 153, 112.500 153 C 111.675 153, 111 153.675, 111 154.500 M 135 154.500 C 135 155.325, 135.675 156, 136.500 156 C 137.325 156, 138 155.325, 138 154.500 C 138 153.675, 137.325 153, 136.500 153 C 135.675 153, 135 153.675, 135 154.500 M 291 154.500 C 291 155.325, 291.675 156, 292.500 156 C 293.325 156, 294 155.325, 294 154.500 C 294 153.675, 293.325 153, 292.500 153 C 291.675 153, 291 153.675, 291 154.500 M 414 157.500 C 414 158.500, 415 159, 417 159 C 419 159, 420 158.500, 420 157.500 C 420 156.500, 419 156, 417 156 C 415 156, 414 156.500, 414 157.500 M 459 178.500 C 459 179.325, 458.325 180, 457.500 180 C 456.675 180, 456 180.675, 456 181.500 C 456 182.325, 455.325 183, 454.500 183 C 453.675 183, 453 183.675, 453 184.500 C 453 185.325, 452.325 186, 451.500 186 C 450.193 186, 450 190.833, 450 223.500 C 450 256.167, 449.807 261, 448.500 261 C 447.241 261, 447 263.167, 447 274.500 C 447 285.833, 446.759 288, 445.500 288 C 444.193 288, 444 283.167, 444 250.500 C 444 217.833, 444.193 213, 445.500 213 C 446.738 213, 447 211.167, 447 202.500 C 447 193.833, 446.738 192, 445.500 192 C 444.675 192, 444 192.675, 444 193.500 C 444 194.325, 443.325 195, 442.500 195 C 441.675 195, 441 195.675, 441 196.500 C 441 197.325, 440.325 198, 439.500 198 C 438.200 198, 438 202, 438 228 C 438 254, 437.800 258, 436.500 258 C 435.211 258, 435 261.167, 435 280.500 C 435 299.833, 434.789 303, 433.500 303 C 432.188 303, 432 297.167, 432 256.500 C 432 215.833, 432.188 210, 433.500 210 C 434.325 210, 435 209.325, 435 208.500 C 435 207.500, 434 207, 432 207 C 430 207, 429 207.500, 429 208.500 C 429 209.325, 428.325 210, 427.500 210 C 426.233 210, 426 212.333, 426 225 C 426 237.667, 425.767 240, 424.500 240 C 423.202 240, 423 243.833, 423 268.500 C 423 293.167, 422.798 297, 421.500 297 C 420.193 297, 420 292.167, 420 259.500 C 420 226.833, 419.807 222, 418.500 222 C 417.675 222, 417 222.675, 417 223.500 C 417 224.325, 416.325 225, 415.500 225 C 414.262 225, 414 226.833, 414 235.500 C 414 244.167, 413.738 246, 412.500 246 C 411.189 246, 411 251.667, 411 291 C 411 330.333, 410.811 336, 409.500 336 C 408.214 336, 408 339, 408 357 C 408 375, 407.786 378, 406.500 378 C 405.333 378, 405 379.333, 405 384 C 405 388.667, 404.667 390, 403.500 390 C 402.389 390, 402 391.167, 402 394.500 C 402 397.833, 401.611 399, 400.500 399 C 399.500 399, 399 400, 399 402 C 399 404, 398.500 405, 397.500 405 C 396.500 405, 396 406, 396 408 C 396 410, 395.500 411, 394.500 411 C 393.500 411, 393 412, 393 414 C 393 416, 392.500 417, 391.500 417 C 390.675 417, 390 417.675, 390 418.500 C 390 419.325, 389.325 420, 388.500 420 C 387.675 420, 387 420.675, 387 421.500 C 387 422.325, 386.325 423, 385.500 423 C 384.233 423, 384 420.667, 384 408 C 384 395.333, 383.767 393, 382.500 393 C 381.204 393, 381 389.333, 381 366 C 381 342.667, 380.796 339, 379.500 339 C 378.204 339, 378 335.333, 378 312 C 378 288.667, 377.796 285, 376.500 285 C 375.278 285, 375 283.333, 375 276 C 375 268.667, 375.278 267, 376.500 267 C 377.500 267, 378 266, 378 264 C 378 262, 378.500 261, 379.500 261 C 380.325 261, 381 260.325, 381 259.500 C 381 258.675, 381.675 258, 382.500 258 C 383.325 258, 384 257.325, 384 256.500 C 384 255.675, 384.675 255, 385.500 255 C 386.500 255, 387 254, 387 252 C 387 250, 386.500 249, 385.500 249 C 384.675 249, 384 248.325, 384 247.500 C 384 246.675, 383.325 246, 382.500 246 C 381.300 246, 381 244.500, 381 238.500 C 381 232.500, 380.700 231, 379.500 231 C 378.389 231, 378 229.833, 378 226.500 C 378 222.167, 377.889 222, 375 222 L 372 222 372 216 C 372 211.333, 372.333 210, 373.500 210 C 374.325 210, 375 209.325, 375 208.500 C 375 207.675, 374.325 207, 373.500 207 C 372.500 207, 372 206, 372 204 C 372 202, 371.500 201, 370.500 201 C 369.675 201, 369 200.325, 369 199.500 C 369 198.300, 367.500 198, 361.500 198 C 355.500 198, 354 198.300, 354 199.500 C 354 200.325, 353.325 201, 352.500 201 C 351.675 201, 351 201.675, 351 202.500 C 351 203.325, 350.325 204, 349.500 204 C 348.389 204, 348 205.167, 348 208.500 C 348 211.833, 348.389 213, 349.500 213 C 350.700 213, 351 214.500, 351 220.500 C 351 226.500, 350.700 228, 349.500 228 C 348.300 228, 348 229.500, 348 235.500 C 348 241.500, 347.700 243, 346.500 243 C 345.675 243, 345 243.675, 345 244.500 C 345 245.500, 344 246, 342 246 C 340 246, 339 246.500, 339 247.500 C 339 248.667, 337.667 249, 333 249 C 328.333 249, 327 248.667, 327 247.500 C 327 246.675, 326.325 246, 325.500 246 C 324.675 246, 324 245.325, 324 244.500 C 324 243.675, 323.325 243, 322.500 243 C 321.675 243, 321 242.325, 321 241.500 C 321 240.675, 320.325 240, 319.500 240 C 318.389 240, 318 238.833, 318 235.500 C 318 232.167, 318.389 231, 319.500 231 C 320.325 231, 321 230.325, 321 229.500 C 321 228.675, 321.675 228, 322.500 228 C 323.325 228, 324 227.325, 324 226.500 C 324 225.675, 324.675 225, 325.500 225 C 326.667 225, 327 223.667, 327 219 C 327 214.333, 326.667 213, 325.500 213 C 324.675 213, 324 212.325, 324 211.500 C 324 210.333, 322.667 210, 318 210 C 313.333 210, 312 209.667, 312 208.500 C 312 207.389, 310.833 207, 307.500 207 C 304.167 207, 303 206.611, 303 205.500 C 303 204.500, 302 204, 300 204 C 298 204, 297 204.500, 297 205.500 C 297 206.325, 297.675 207, 298.500 207 C 299.325 207, 300 207.675, 300 208.500 C 300 209.500, 299 210, 297 210 C 295 210, 294 209.500, 294 208.500 C 294 207.675, 293.325 207, 292.500 207 C 291.675 207, 291 206.325, 291 205.500 C 291 204.500, 292 204, 294 204 C 296 204, 297 203.500, 297 202.500 C 297 201.675, 296.325 201, 295.500 201 C 294.675 201, 294 200.325, 294 199.500 C 294 198.675, 293.325 198, 292.500 198 C 291.675 198, 291 197.325, 291 196.500 C 291 195.675, 290.325 195, 289.500 195 C 288.675 195, 288 194.325, 288 193.500 C 288 192.675, 287.325 192, 286.500 192 C 285.500 192, 285 193, 285 195 C 285 197, 284.500 198, 283.500 198 C 282.675 198, 282 197.325, 282 196.500 C 282 195.675, 281.325 195, 280.500 195 C 279.675 195, 279 194.325, 279 193.500 C 279 192.675, 278.325 192, 277.500 192 C 276.675 192, 276 191.325, 276 190.500 C 276 189.500, 277 189, 279 189 C 281 189, 282 189.500, 282 190.500 C 282 191.325, 282.675 192, 283.500 192 C 284.500 192, 285 191, 285 189 C 285 186.333, 284.667 186, 282 186 C 280 186, 279 185.500, 279 184.500 C 279 183.500, 278 183, 276 183 C 274 183, 273 182.500, 273 181.500 C 273 180.500, 272 180, 270 180 C 268 180, 267 180.500, 267 181.500 C 267 182.325, 266.325 183, 265.500 183 C 264.675 183, 264 182.325, 264 181.500 C 264 180.389, 262.833 180, 259.500 180 C 255.167 180, 255 180.111, 255 183 C 255 185, 255.500 186, 256.500 186 C 257.325 186, 258 186.675, 258 187.500 C 258 188.611, 256.833 189, 253.500 189 C 250.167 189, 249 188.611, 249 187.500 C 249 186.675, 249.675 186, 250.500 186 C 251.325 186, 252 185.325, 252 184.500 C 252 183.675, 251.325 183, 250.500 183 C 249.675 183, 249 182.325, 249 181.500 C 249 180.500, 248 180, 246 180 C 244 180, 243 180.500, 243 181.500 C 243 182.325, 243.675 183, 244.500 183 C 245.611 183, 246 184.167, 246 187.500 C 246 191.833, 245.889 192, 243 192 C 241 192, 240 191.500, 240 190.500 C 240 189.389, 238.833 189, 235.500 189 C 232.167 189, 231 189.389, 231 190.500 C 231 191.500, 230 192, 228 192 C 226 192, 225 191.500, 225 190.500 C 225 189.675, 225.675 189, 226.500 189 C 227.325 189, 228 188.325, 228 187.500 C 228 186.500, 227 186, 225 186 C 223 186, 222 186.500, 222 187.500 C 222 188.325, 221.325 189, 220.500 189 C 219.500 189, 219 190, 219 192 C 219 194, 219.500 195, 220.500 195 C 221.325 195, 222 194.325, 222 193.500 C 222 192.675, 222.675 192, 223.500 192 C 224.500 192, 225 193, 225 195 C 225 197, 224.500 198, 223.500 198 C 222.675 198, 222 198.675, 222 199.500 C 222 200.325, 221.325 201, 220.500 201 C 219.675 201, 219 201.675, 219 202.500 C 219 203.325, 218.325 204, 217.500 204 C 216.500 204, 216 203, 216 201 C 216 199, 215.500 198, 214.500 198 C 213.675 198, 213 198.675, 213 199.500 C 213 200.325, 212.325 201, 211.500 201 C 210.675 201, 210 201.675, 210 202.500 C 210 203.500, 211 204, 213 204 C 215 204, 216 204.500, 216 205.500 C 216 206.325, 215.325 207, 214.500 207 C 213.675 207, 213 207.675, 213 208.500 C 213 209.500, 212 210, 210 210 C 208 210, 207 209.500, 207 208.500 C 207 207.675, 207.675 207, 208.500 207 C 209.325 207, 210 206.325, 210 205.500 C 210 204.500, 209 204, 207 204 C 205 204, 204 204.500, 204 205.500 C 204 206.611, 202.833 207, 199.500 207 C 196.167 207, 195 207.389, 195 208.500 C 195 209.667, 193.667 210, 189 210 C 184.333 210, 183 210.333, 183 211.500 C 183 212.325, 182.325 213, 181.500 213 C 180.333 213, 180 214.333, 180 219 C 180 223.667, 180.333 225, 181.500 225 C 182.325 225, 183 225.675, 183 226.500 C 183 227.325, 183.675 228, 184.500 228 C 185.325 228, 186 228.675, 186 229.500 C 186 230.325, 186.675 231, 187.500 231 C 188.500 231, 189 232, 189 234 C 189 236, 188.500 237, 187.500 237 C 186.500 237, 186 238, 186 240 C 186 242, 185.500 243, 184.500 243 C 183.675 243, 183 243.675, 183 244.500 C 183 245.325, 182.325 246, 181.500 246 C 180.675 246, 180 246.675, 180 247.500 C 180 248.667, 178.667 249, 174 249 C 169.333 249, 168 248.667, 168 247.500 C 168 246.500, 167 246, 165 246 C 163 246, 162 245.500, 162 244.500 C 162 243.675, 161.325 243, 160.500 243 C 159.300 243, 159 241.500, 159 235.500 C 159 229.500, 158.700 228, 157.500 228 C 156.675 228, 156 227.325, 156 226.500 C 156 225.675, 155.325 225, 154.500 225 C 153.675 225, 153 224.325, 153 223.500 C 153 222.675, 153.675 222, 154.500 222 C 155.611 222, 156 220.833, 156 217.500 C 156 214.167, 156.389 213, 157.500 213 C 158.611 213, 159 211.833, 159 208.500 C 159 205.167, 158.611 204, 157.500 204 C 156.675 204, 156 203.325, 156 202.500 C 156 201.675, 155.325 201, 154.500 201 C 153.675 201, 153 200.325, 153 199.500 C 153 198.300, 151.500 198, 145.500 198 C 139.500 198, 138 198.300, 138 199.500 C 138 200.325, 137.325 201, 136.500 201 C 135.675 201, 135 201.675, 135 202.500 C 135 203.325, 134.325 204, 133.500 204 C 132.389 204, 132 205.167, 132 208.500 C 132 211.833, 132.389 213, 133.500 213 C 134.611 213, 135 214.167, 135 217.500 C 135 221.833, 134.889 222, 132 222 C 129.111 222, 129 222.167, 129 226.500 C 129 229.833, 128.611 231, 127.500 231 C 126.500 231, 126 232, 126 234 C 126 236, 125.500 237, 124.500 237 C 123.675 237, 123 237.675, 123 238.500 C 123 239.325, 123.675 240, 124.500 240 C 125.500 240, 126 241, 126 243 C 126 245, 125.500 246, 124.500 246 C 123.675 246, 123 246.675, 123 247.500 C 123 248.325, 122.325 249, 121.500 249 C 120.500 249, 120 250, 120 252 C 120 254, 120.500 255, 121.500 255 C 122.325 255, 123 255.675, 123 256.500 C 123 257.325, 123.675 258, 124.500 258 C 125.325 258, 126 258.675, 126 259.500 C 126 260.325, 126.675 261, 127.500 261 C 128.611 261, 129 262.167, 129 265.500 C 129 268.833, 129.389 270, 130.500 270 C 131.325 270, 132 270.675, 132 271.500 C 132 272.325, 131.325 273, 130.500 273 C 129.202 273, 129 276.833, 129 301.500 C 129 326.167, 128.798 330, 127.500 330 C 126.204 330, 126 333.667, 126 357 C 126 380.333, 125.796 384, 124.500 384 C 123.218 384, 123 386.833, 123 403.500 C 123 420.167, 122.782 423, 121.500 423 C 120.675 423, 120 422.325, 120 421.500 C 120 420.675, 119.325 420, 118.500 420 C 117.675 420, 117 419.325, 117 418.500 C 117 417.675, 116.325 417, 115.500 417 C 114.500 417, 114 416, 114 414 C 114 412, 113.500 411, 112.500 411 C 111.500 411, 111 410, 111 408 C 111 406, 110.500 405, 109.500 405 C 108.500 405, 108 404, 108 402 C 108 400, 107.500 399, 106.500 399 C 105.389 399, 105 397.833, 105 394.500 C 105 391.167, 104.611 390, 103.500 390 C 102.333 390, 102 388.667, 102 384 C 102 379.333, 101.667 378, 100.500 378 C 99.206 378, 99 374.500, 99 352.500 C 99 330.500, 98.794 327, 97.500 327 C 96.190 327, 96 321.500, 96 283.500 C 96 245.500, 95.810 240, 94.500 240 C 93.300 240, 93 238.500, 93 232.500 C 93 226.500, 92.700 225, 91.500 225 C 90.675 225, 90 224.325, 90 223.500 C 90 222.675, 89.325 222, 88.500 222 C 87.197 222, 87 226.333, 87 255 C 87 283.667, 87.197 288, 88.500 288 C 89.500 288, 90 289, 90 291 C 90 293, 89.500 294, 88.500 294 C 87.675 294, 87 294.675, 87 295.500 C 87 296.325, 86.325 297, 85.500 297 C 84.197 297, 84 292.667, 84 264 C 84 235.333, 83.803 231, 82.500 231 C 81.262 231, 81 229.167, 81 220.500 C 81 211.833, 80.738 210, 79.500 210 C 78.675 210, 78 209.325, 78 208.500 C 78 207.675, 77.325 207, 76.500 207 C 75.188 207, 75 213, 75 255 C 75 297, 74.813 303, 73.500 303 C 72.208 303, 72 299.667, 72 279 C 72 258.333, 71.792 255, 70.500 255 C 69.202 255, 69 251.167, 69 226.500 C 69 201.833, 68.798 198, 67.500 198 C 66.675 198, 66 197.325, 66 196.500 C 66 195.500, 65 195, 63 195 C 60.333 195, 60 195.333, 60 198 C 60 200, 60.500 201, 61.500 201 C 62.810 201, 63 206.500, 63 244.500 C 63 282.500, 62.810 288, 61.500 288 C 60.227 288, 60 285.500, 60 271.500 C 60 257.500, 59.773 255, 58.500 255 C 57.196 255, 57 250.500, 57 220.500 C 57 190.500, 56.804 186, 55.500 186 C 54.675 186, 54 185.325, 54 184.500 C 54 183.675, 53.325 183, 52.500 183 C 51.675 183, 51 182.325, 51 181.500 C 51 180.675, 50.325 180, 49.500 180 C 48.193 180, 48 184.833, 48 217.500 C 48 250.167, 48.193 255, 49.500 255 C 50.809 255, 51 260.167, 51 295.500 C 51 330.833, 51.191 336, 52.500 336 C 53.794 336, 54 339.500, 54 361.500 C 54 383.500, 54.206 387, 55.500 387 C 56.722 387, 57 388.667, 57 396 C 57 403.333, 57.278 405, 58.500 405 C 59.611 405, 60 406.167, 60 409.500 C 60 412.833, 60.389 414, 61.500 414 C 62.611 414, 63 415.167, 63 418.500 C 63 421.833, 63.389 423, 64.500 423 C 65.500 423, 66 424, 66 426 C 66 428, 66.500 429, 67.500 429 C 68.500 429, 69 430, 69 432 C 69 434, 69.500 435, 70.500 435 C 71.500 435, 72 436, 72 438 C 72 440, 72.500 441, 73.500 441 C 74.500 441, 75 442, 75 444 C 75 446, 75.500 447, 76.500 447 C 77.325 447, 78 447.675, 78 448.500 C 78 449.325, 78.675 450, 79.500 450 C 80.325 450, 81 450.675, 81 451.500 C 81 452.325, 81.675 453, 82.500 453 C 83.500 453, 84 454, 84 456 C 84 458, 84.500 459, 85.500 459 C 86.325 459, 87 459.675, 87 460.500 C 87 461.325, 87.675 462, 88.500 462 C 89.325 462, 90 462.675, 90 463.500 C 90 464.325, 90.675 465, 91.500 465 C 92.325 465, 93 465.675, 93 466.500 C 93 467.325, 93.675 468, 94.500 468 C 95.325 468, 96 468.675, 96 469.500 C 96 470.325, 96.675 471, 97.500 471 C 98.325 471, 99 471.675, 99 472.500 C 99 473.325, 99.675 474, 100.500 474 C 101.325 474, 102 474.675, 102 475.500 C 102 476.325, 102.675 477, 103.500 477 C 104.325 477, 105 477.675, 105 478.500 C 105 479.325, 105.675 480, 106.500 480 C 107.325 480, 108 480.675, 108 481.500 C 108 482.325, 108.675 483, 109.500 483 C 110.325 483, 111 483.675, 111 484.500 C 111 485.325, 111.675 486, 112.500 486 C 113.325 486, 114 486.675, 114 487.500 C 114 488.325, 114.675 489, 115.500 489 C 116.325 489, 117 489.675, 117 490.500 C 117 491.325, 117.675 492, 118.500 492 C 119.325 492, 120 492.675, 120 493.500 C 120 494.500, 121 495, 123 495 C 125 495, 126 495.500, 126 496.500 C 126 497.325, 126.675 498, 127.500 498 C 128.325 498, 129 498.675, 129 499.500 C 129 500.611, 130.167 501, 133.500 501 L 138 501 138 496.500 C 138 493.167, 138.389 492, 139.500 492 C 140.325 492, 141 491.325, 141 490.500 C 141 489.675, 141.675 489, 142.500 489 C 143.500 489, 144 488, 144 486 L 144 483 135 483 C 127.667 483, 126 482.722, 126 481.500 C 126 480.389, 124.833 480, 121.500 480 C 118.167 480, 117 479.611, 117 478.500 C 117 477.500, 116 477, 114 477 C 112 477, 111 476.500, 111 475.500 C 111 474.675, 110.325 474, 109.500 474 C 108.675 474, 108 473.325, 108 472.500 C 108 471.675, 107.325 471, 106.500 471 C 105.675 471, 105 470.325, 105 469.500 C 105 468.675, 104.325 468, 103.500 468 C 102.675 468, 102 467.325, 102 466.500 C 102 465.675, 101.325 465, 100.500 465 C 99.675 465, 99 464.325, 99 463.500 C 99 462.278, 100.667 462, 108 462 C 115.333 462, 117 462.278, 117 463.500 C 117 464.500, 118 465, 120 465 C 122 465, 123 465.500, 123 466.500 C 123 467.500, 124 468, 126 468 C 128 468, 129 468.500, 129 469.500 C 129 470.325, 129.675 471, 130.500 471 C 131.325 471, 132 471.675, 132 472.500 C 132 473.500, 133 474, 135 474 C 137 474, 138 474.500, 138 475.500 C 138 476.325, 138.675 477, 139.500 477 C 140.325 477, 141 477.675, 141 478.500 C 141 479.500, 142 480, 144 480 C 146.667 480, 147 479.667, 147 477 C 147 474.333, 146.667 474, 144 474 C 142 474, 141 473.500, 141 472.500 C 141 471.675, 140.325 471, 139.500 471 C 138.675 471, 138 470.325, 138 469.500 C 138 468.675, 137.325 468, 136.500 468 C 135.675 468, 135 467.325, 135 466.500 C 135 465.675, 134.325 465, 133.500 465 C 132.500 465, 132 464, 132 462 C 132 460, 131.500 459, 130.500 459 C 129.333 459, 129 457.667, 129 453 L 129 447 132 447 C 134 447, 135 447.500, 135 448.500 C 135 449.325, 135.675 450, 136.500 450 C 137.325 450, 138 450.675, 138 451.500 C 138 452.325, 138.675 453, 139.500 453 C 140.325 453, 141 453.675, 141 454.500 C 141 455.325, 141.675 456, 142.500 456 C 143.325 456, 144 456.675, 144 457.500 C 144 458.325, 144.675 459, 145.500 459 C 146.500 459, 147 460, 147 462 C 147 464, 147.500 465, 148.500 465 C 149.500 465, 150 466, 150 468 C 150 470.667, 150.333 471, 153 471 C 155.667 471, 156 470.667, 156 468 C 156 466, 156.500 465, 157.500 465 C 158.325 465, 159 464.325, 159 463.500 C 159 462.675, 159.675 462, 160.500 462 C 161.325 462, 162 461.325, 162 460.500 C 162 459.675, 161.325 459, 160.500 459 C 159.675 459, 159 458.325, 159 457.500 C 159 456.500, 158 456, 156 456 C 154 456, 153 455.500, 153 454.500 C 153 453.675, 152.325 453, 151.500 453 C 150.675 453, 150 452.325, 150 451.500 C 150 450.500, 149 450, 147 450 C 145 450, 144 449.500, 144 448.500 C 144 447.675, 143.325 447, 142.500 447 C 141.675 447, 141 446.325, 141 445.500 C 141 444.675, 140.325 444, 139.500 444 C 138.675 444, 138 443.325, 138 442.500 C 138 441.675, 137.325 441, 136.500 441 C 135.675 441, 135 440.325, 135 439.500 C 135 438.675, 134.325 438, 133.500 438 C 132.675 438, 132 437.325, 132 436.500 C 132 435.675, 131.325 435, 130.500 435 C 129.500 435, 129 434, 129 432 C 129 430, 129.500 429, 130.500 429 C 131.325 429, 132 428.325, 132 427.500 C 132 426.675, 132.675 426, 133.500 426 C 134.808 426, 135 421, 135 387 C 135 353, 135.192 348, 136.500 348 C 137.808 348, 138 343, 138 309 L 138 270 144 270 L 150 270 150 342 C 150 405.333, 150.181 414, 151.500 414 C 152.325 414, 153 413.325, 153 412.500 C 153 411.500, 154 411, 156 411 C 158 411, 159 410.500, 159 409.500 C 159 408.675, 159.675 408, 160.500 408 C 161.500 408, 162 407, 162 405 L 162 402 169.500 402 C 175.500 402, 177 401.700, 177 400.500 C 177 399.675, 177.675 399, 178.500 399 C 179.325 399, 180 398.325, 180 397.500 C 180 396.675, 179.325 396, 178.500 396 C 177.250 396, 177 394, 177 384 C 177 374, 177.250 372, 178.500 372 C 179.611 372, 180 370.833, 180 367.500 C 180 364.167, 180.389 363, 181.500 363 C 182.500 363, 183 362, 183 360 C 183 358, 183.500 357, 184.500 357 C 185.325 357, 186 356.325, 186 355.500 C 186 354.675, 186.675 354, 187.500 354 C 188.325 354, 189 353.325, 189 352.500 C 189 351.675, 189.675 351, 190.500 351 C 191.325 351, 192 350.325, 192 349.500 C 192 348.675, 192.675 348, 193.500 348 C 194.325 348, 195 347.325, 195 346.500 C 195 345.500, 196 345, 198 345 C 200 345, 201 344.500, 201 343.500 C 201 342.675, 201.675 342, 202.500 342 C 203.325 342, 204 341.325, 204 340.500 C 204 339.500, 205 339, 207 339 C 209 339, 210 338.500, 210 337.500 C 210 336.389, 211.167 336, 214.500 336 C 217.833 336, 219 335.611, 219 334.500 C 219 333.333, 220.333 333, 225 333 C 229.667 333, 231 332.667, 231 331.500 C 231 330.214, 234 330, 252 330 C 270 330, 273 330.214, 273 331.500 C 273 332.700, 274.500 333, 280.500 333 C 286.500 333, 288 333.300, 288 334.500 C 288 335.500, 289 336, 291 336 C 293 336, 294 336.500, 294 337.500 C 294 338.611, 295.167 339, 298.500 339 C 301.833 339, 303 339.389, 303 340.500 C 303 341.325, 303.675 342, 304.500 342 C 305.325 342, 306 342.675, 306 343.500 C 306 344.500, 307 345, 309 345 C 311 345, 312 345.500, 312 346.500 C 312 347.325, 312.675 348, 313.500 348 C 314.325 348, 315 348.675, 315 349.500 C 315 350.325, 315.675 351, 316.500 351 C 317.325 351, 318 351.675, 318 352.500 C 318 353.325, 318.675 354, 319.500 354 C 320.325 354, 321 354.675, 321 355.500 C 321 356.325, 321.675 357, 322.500 357 C 323.500 357, 324 358, 324 360 C 324 362, 324.500 363, 325.500 363 C 326.778 363, 327 365.667, 327 381 C 327 396.333, 327.222 399, 328.500 399 C 329.325 399, 330 399.675, 330 400.500 C 330 401.700, 331.500 402, 337.500 402 L 345 402 345 405 C 345 407, 345.500 408, 346.500 408 C 347.325 408, 348 408.675, 348 409.500 C 348 410.325, 348.675 411, 349.500 411 C 350.325 411, 351 411.675, 351 412.500 C 351 413.500, 352 414, 354 414 L 357 414 357 342 L 357 270 361.500 270 L 366 270 366 276 C 366 280.667, 366.333 282, 367.500 282 C 368.808 282, 369 287, 369 321 C 369 355, 369.192 360, 370.500 360 C 371.803 360, 372 364.333, 372 393 C 372 421.667, 372.197 426, 373.500 426 C 374.325 426, 375 426.675, 375 427.500 C 375 428.325, 375.675 429, 376.500 429 C 377.500 429, 378 430, 378 432 C 378 434, 377.500 435, 376.500 435 C 375.675 435, 375 435.675, 375 436.500 C 375 437.325, 374.325 438, 373.500 438 C 372.675 438, 372 438.675, 372 439.500 C 372 440.325, 371.325 441, 370.500 441 C 369.675 441, 369 441.675, 369 442.500 C 369 443.325, 368.325 444, 367.500 444 C 366.675 444, 366 444.675, 366 445.500 C 366 446.325, 365.325 447, 364.500 447 C 363.675 447, 363 447.675, 363 448.500 C 363 449.500, 362 450, 360 450 C 358 450, 357 450.500, 357 451.500 C 357 452.325, 356.325 453, 355.500 453 C 354.675 453, 354 453.675, 354 454.500 C 354 455.325, 353.325 456, 352.500 456 C 351.675 456, 351 456.675, 351 457.500 C 351 458.500, 350 459, 348 459 C 346 459, 345 459.500, 345 460.500 C 345 461.325, 345.675 462, 346.500 462 C 347.325 462, 348 462.675, 348 463.500 C 348 464.325, 348.675 465, 349.500 465 C 350.500 465, 351 466, 351 468 C 351 470.667, 351.333 471, 354 471 C 356.667 471, 357 470.667, 357 468 C 357 466, 357.500 465, 358.500 465 C 359.500 465, 360 464, 360 462 C 360 460, 360.500 459, 361.500 459 C 362.325 459, 363 458.325, 363 457.500 C 363 456.675, 363.675 456, 364.500 456 C 365.325 456, 366 455.325, 366 454.500 C 366 453.675, 366.675 453, 367.500 453 C 368.325 453, 369 452.325, 369 451.500 C 369 450.500, 370 450, 372 450 C 374 450, 375 449.500, 375 448.500 C 375 447.675, 375.675 447, 376.500 447 C 377.667 447, 378 448.333, 378 453 C 378 457.667, 377.667 459, 376.500 459 C 375.500 459, 375 460, 375 462 C 375 464, 374.500 465, 373.500 465 C 372.675 465, 372 465.675, 372 466.500 C 372 467.325, 371.325 468, 370.500 468 C 369.675 468, 369 468.675, 369 469.500 C 369 470.325, 368.325 471, 367.500 471 C 366.675 471, 366 471.675, 366 472.500 C 366 473.500, 365 474, 363 474 C 360.333 474, 360 474.333, 360 477 C 360 479.667, 360.333 480, 363 480 C 365 480, 366 479.500, 366 478.500 C 366 477.500, 367 477, 369 477 C 371 477, 372 476.500, 372 475.500 C 372 474.675, 372.675 474, 373.500 474 C 374.325 474, 375 473.325, 375 472.500 C 375 471.675, 375.675 471, 376.500 471 C 377.325 471, 378 470.325, 378 469.500 C 378 468.500, 379 468, 381 468 C 383 468, 384 467.500, 384 466.500 C 384 465.500, 385 465, 387 465 C 389 465, 390 464.500, 390 463.500 C 390 462.278, 391.667 462, 399 462 L 408 462 408 465 C 408 467.667, 407.667 468, 405 468 C 403 468, 402 468.500, 402 469.500 C 402 470.325, 401.325 471, 400.500 471 C 399.675 471, 399 471.675, 399 472.500 C 399 473.325, 398.325 474, 397.500 474 C 396.675 474, 396 474.675, 396 475.500 C 396 476.500, 395 477, 393 477 C 391 477, 390 477.500, 390 478.500 C 390 479.611, 388.833 480, 385.500 480 C 382.167 480, 381 480.389, 381 481.500 C 381 482.722, 379.333 483, 372 483 C 364.667 483, 363 483.278, 363 484.500 C 363 485.325, 363.675 486, 364.500 486 C 365.500 486, 366 487, 366 489 C 366 491, 366.500 492, 367.500 492 C 368.611 492, 369 493.167, 369 496.500 L 369 501 373.500 501 C 376.833 501, 378 500.611, 378 499.500 C 378 498.675, 378.675 498, 379.500 498 C 380.325 498, 381 497.325, 381 496.500 C 381 495.500, 382 495, 384 495 C 386 495, 387 494.500, 387 493.500 C 387 492.675, 387.675 492, 388.500 492 C 389.325 492, 390 491.325, 390 490.500 C 390 489.675, 390.675 489, 391.500 489 C 392.325 489, 393 488.325, 393 487.500 C 393 486.675, 393.675 486, 394.500 486 C 395.325 486, 396 485.325, 396 484.500 C 396 483.675, 396.675 483, 397.500 483 C 398.325 483, 399 482.325, 399 481.500 C 399 480.675, 399.675 480, 400.500 480 C 401.325 480, 402 479.325, 402 478.500 C 402 477.675, 402.675 477, 403.500 477 C 404.325 477, 405 476.325, 405 475.500 C 405 474.675, 405.675 474, 406.500 474 C 407.325 474, 408 473.325, 408 472.500 C 408 471.675, 408.675 471, 409.500 471 C 410.325 471, 411 470.325, 411 469.500 C 411 468.675, 411.675 468, 412.500 468 C 413.325 468, 414 467.325, 414 466.500 C 414 465.675, 414.675 465, 415.500 465 C 416.325 465, 417 464.325, 417 463.500 C 417 462.675, 417.675 462, 418.500 462 C 419.325 462, 420 461.325, 420 460.500 C 420 459.675, 420.675 459, 421.500 459 C 422.325 459, 423 458.325, 423 457.500 C 423 456.675, 423.675 456, 424.500 456 C 425.500 456, 426 455, 426 453 C 426 451, 426.500 450, 427.500 450 C 428.325 450, 429 449.325, 429 448.500 C 429 447.675, 429.675 447, 430.500 447 C 431.500 447, 432 446, 432 444 C 432 442, 432.500 441, 433.500 441 C 434.500 441, 435 440, 435 438 C 435 436, 435.500 435, 436.500 435 C 437.500 435, 438 434, 438 432 C 438 430, 438.500 429, 439.500 429 C 440.500 429, 441 428, 441 426 C 441 424, 441.500 423, 442.500 423 C 443.500 423, 444 422, 444 420 C 444 418, 444.500 417, 445.500 417 C 446.667 417, 447 415.667, 447 411 C 447 406.333, 447.333 405, 448.500 405 C 449.700 405, 450 403.500, 450 397.500 C 450 391.500, 450.300 390, 451.500 390 C 452.794 390, 453 386.500, 453 364.500 C 453 342.500, 453.206 339, 454.500 339 C 455.808 339, 456 334, 456 300 C 456 266, 456.192 261, 457.500 261 C 458.808 261, 459 256, 459 222 C 459 188, 459.192 183, 460.500 183 C 461.500 183, 462 182, 462 180 C 462 178, 461.500 177, 460.500 177 C 459.675 177, 459 177.675, 459 178.500 M 231 181.500 C 231 182.325, 230.325 183, 229.500 183 C 228.675 183, 228 183.675, 228 184.500 C 228 185.700, 229.500 186, 235.500 186 C 241.500 186, 243 185.700, 243 184.500 C 243 183.500, 242 183, 240 183 C 238 183, 237 182.500, 237 181.500 C 237 180.500, 236 180, 234 180 C 232 180, 231 180.500, 231 181.500 M 258 184.500 C 258 185.325, 258.675 186, 259.500 186 C 260.325 186, 261 185.325, 261 184.500 C 261 183.675, 260.325 183, 259.500 183 C 258.675 183, 258 183.675, 258 184.500 M 261 190.500 C 261 194.833, 260.889 195, 258 195 C 256 195, 255 194.500, 255 193.500 C 255 192.500, 254 192, 252 192 C 250 192, 249 192.500, 249 193.500 C 249 194.500, 248 195, 246 195 C 244 195, 243 195.500, 243 196.500 C 243 197.500, 242 198, 240 198 C 238 198, 237 198.500, 237 199.500 C 237 200.500, 238 201, 240 201 C 242 201, 243 201.500, 243 202.500 C 243 203.325, 243.675 204, 244.500 204 C 245.325 204, 246 203.325, 246 202.500 C 246 201.333, 247.333 201, 252 201 C 256.667 201, 258 201.333, 258 202.500 C 258 203.325, 257.325 204, 256.500 204 C 255.675 204, 255 204.675, 255 205.500 C 255 206.500, 256 207, 258 207 C 260 207, 261 206.500, 261 205.500 C 261 204.675, 261.675 204, 262.500 204 C 263.325 204, 264 203.325, 264 202.500 C 264 201.500, 265 201, 267 201 C 269 201, 270 200.500, 270 199.500 C 270 198.500, 269 198, 267 198 C 264.111 198, 264 197.833, 264 193.500 L 264 189 270 189 C 274.667 189, 276 188.667, 276 187.500 C 276 186.300, 274.500 186, 268.500 186 L 261 186 261 190.500 M 216 196.500 C 216 197.325, 216.675 198, 217.500 198 C 218.325 198, 219 197.325, 219 196.500 C 219 195.675, 218.325 195, 217.500 195 C 216.675 195, 216 195.675, 216 196.500 M 285 199.500 C 285 200.325, 285.675 201, 286.500 201 C 287.325 201, 288 200.325, 288 199.500 C 288 198.675, 287.325 198, 286.500 198 C 285.675 198, 285 198.675, 285 199.500 M 141 202.500 C 141 203.325, 140.325 204, 139.500 204 C 138.500 204, 138 205, 138 207 L 138 210 145.500 210 L 153 210 153 207 C 153 205, 152.500 204, 151.500 204 C 150.675 204, 150 203.325, 150 202.500 C 150 201.389, 148.833 201, 145.500 201 C 142.167 201, 141 201.389, 141 202.500 M 288 202.500 C 288 203.325, 288.675 204, 289.500 204 C 290.325 204, 291 203.325, 291 202.500 C 291 201.675, 290.325 201, 289.500 201 C 288.675 201, 288 201.675, 288 202.500 M 357 202.500 C 357 203.325, 356.325 204, 355.500 204 C 354.675 204, 354 204.675, 354 205.500 C 354 206.325, 353.325 207, 352.500 207 C 351.675 207, 351 207.675, 351 208.500 C 351 209.722, 352.667 210, 360 210 L 369 210 369 207 C 369 205, 368.500 204, 367.500 204 C 366.675 204, 366 203.325, 366 202.500 C 366 201.389, 364.833 201, 361.500 201 C 358.167 201, 357 201.389, 357 202.500 M 234 205.500 C 234 206.500, 235 207, 237 207 C 239 207, 240 206.500, 240 205.500 C 240 204.500, 239 204, 237 204 C 235 204, 234 204.500, 234 205.500 M 246 205.500 C 246 206.500, 247 207, 249 207 C 251 207, 252 206.500, 252 205.500 C 252 204.500, 251 204, 249 204 C 247 204, 246 204.500, 246 205.500 M 267 205.500 C 267 206.500, 268 207, 270 207 C 272 207, 273 206.500, 273 205.500 C 273 204.500, 272 204, 270 204 C 268 204, 267 204.500, 267 205.500 M 231 208.500 C 231 209.325, 230.325 210, 229.500 210 C 228.675 210, 228 210.675, 228 211.500 C 228 212.325, 227.325 213, 226.500 213 C 225.675 213, 225 213.675, 225 214.500 C 225 215.325, 224.325 216, 223.500 216 C 222.675 216, 222 216.675, 222 217.500 C 222 218.500, 223 219, 225 219 C 227 219, 228 219.500, 228 220.500 C 228 221.325, 227.325 222, 226.500 222 C 225.500 222, 225 223, 225 225 C 225 227.667, 225.333 228, 228 228 C 230.667 228, 231 227.667, 231 225 C 231 223, 231.500 222, 232.500 222 C 233.325 222, 234 221.325, 234 220.500 C 234 219.500, 233 219, 231 219 C 229 219, 228 218.500, 228 217.500 C 228 216.675, 228.675 216, 229.500 216 C 230.325 216, 231 215.325, 231 214.500 C 231 213.675, 231.675 213, 232.500 213 C 233.500 213, 234 212, 234 210 C 234 208, 233.500 207, 232.500 207 C 231.675 207, 231 207.675, 231 208.500 M 273 210 C 273 212, 273.500 213, 274.500 213 C 275.325 213, 276 213.675, 276 214.500 C 276 215.325, 276.675 216, 277.500 216 C 278.325 216, 279 216.675, 279 217.500 C 279 218.500, 278 219, 276 219 C 274 219, 273 219.500, 273 220.500 C 273 221.325, 273.675 222, 274.500 222 C 275.500 222, 276 223, 276 225 C 276 227.667, 276.333 228, 279 228 C 281.667 228, 282 227.667, 282 225 C 282 223, 281.500 222, 280.500 222 C 279.675 222, 279 221.325, 279 220.500 C 279 219.500, 280 219, 282 219 C 284 219, 285 218.500, 285 217.500 C 285 216.675, 284.325 216, 283.500 216 C 282.675 216, 282 215.325, 282 214.500 C 282 213.675, 281.325 213, 280.500 213 C 279.675 213, 279 212.325, 279 211.500 C 279 210.675, 278.325 210, 277.500 210 C 276.675 210, 276 209.325, 276 208.500 C 276 207.675, 275.325 207, 274.500 207 C 273.500 207, 273 208, 273 210 M 201 211.500 C 201 212.500, 202 213, 204 213 C 206 213, 207 212.500, 207 211.500 C 207 210.500, 206 210, 204 210 C 202 210, 201 210.500, 201 211.500 M 240 249 L 240 288 253.500 288 L 267 288 267 250.500 C 267 217.833, 266.807 213, 265.500 213 C 264.675 213, 264 212.325, 264 211.500 C 264 210.250, 262 210, 252 210 L 240 210 240 249 M 300 211.500 C 300 212.500, 301 213, 303 213 C 305 213, 306 212.500, 306 211.500 C 306 210.500, 305 210, 303 210 C 301 210, 300 210.500, 300 211.500 M 186 214.500 C 186 215.700, 187.500 216, 193.500 216 C 199.500 216, 201 215.700, 201 214.500 C 201 213.300, 199.500 213, 193.500 213 C 187.500 213, 186 213.300, 186 214.500 M 252 214.500 C 252 215.325, 251.325 216, 250.500 216 C 249.333 216, 249 217.333, 249 222 L 249 228 253.500 228 C 257.833 228, 258 227.889, 258 225 C 258 223, 257.500 222, 256.500 222 C 255.675 222, 255 221.325, 255 220.500 C 255 219.675, 255.675 219, 256.500 219 C 257.325 219, 258 218.325, 258 217.500 C 258 216.675, 257.325 216, 256.500 216 C 255.675 216, 255 215.325, 255 214.500 C 255 213.675, 254.325 213, 253.500 213 C 252.675 213, 252 213.675, 252 214.500 M 306 214.500 C 306 215.700, 307.500 216, 313.500 216 C 319.500 216, 321 215.700, 321 214.500 C 321 213.300, 319.500 213, 313.500 213 C 307.500 213, 306 213.300, 306 214.500 M 270 217.500 C 270 218.325, 270.675 219, 271.500 219 C 272.325 219, 273 218.325, 273 217.500 C 273 216.675, 272.325 216, 271.500 216 C 270.675 216, 270 216.675, 270 217.500 M 138 223.500 C 138 224.325, 137.325 225, 136.500 225 C 135.500 225, 135 226, 135 228 L 135 231 141 231 L 147 231 147 234 C 147 236.667, 147.333 237, 150 237 C 152 237, 153 236.500, 153 235.500 C 153 234.675, 153.675 234, 154.500 234 C 155.325 234, 156 233.325, 156 232.500 C 156 231.675, 155.325 231, 154.500 231 C 153.675 231, 153 230.325, 153 229.500 C 153 228.675, 152.325 228, 151.500 228 C 150.500 228, 150 227, 150 225 L 150 222 144 222 C 139.333 222, 138 222.333, 138 223.500 M 357 225 C 357 227, 356.500 228, 355.500 228 C 354.675 228, 354 228.675, 354 229.500 C 354 230.325, 353.325 231, 352.500 231 C 351.675 231, 351 231.675, 351 232.500 C 351 233.325, 351.675 234, 352.500 234 C 353.325 234, 354 234.675, 354 235.500 C 354 236.500, 355 237, 357 237 C 359.667 237, 360 236.667, 360 234 L 360 231 366 231 L 372 231 372 228 C 372 225.333, 371.667 225, 369 225 C 367 225, 366 224.500, 366 223.500 C 366 222.389, 364.833 222, 361.500 222 C 357.167 222, 357 222.111, 357 225 M 198 226.500 C 198 227.500, 197 228, 195 228 L 192 228 192 235.500 C 192 241.500, 191.700 243, 190.500 243 C 189.675 243, 189 243.675, 189 244.500 C 189 245.325, 188.325 246, 187.500 246 C 186.675 246, 186 246.675, 186 247.500 C 186 248.325, 185.325 249, 184.500 249 C 183.675 249, 183 249.675, 183 250.500 C 183 251.722, 181.333 252, 174 252 C 166.667 252, 165 251.722, 165 250.500 C 165 249.675, 164.325 249, 163.500 249 C 162.500 249, 162 250, 162 252 C 162 254.889, 162.167 255, 166.500 255 C 169.833 255, 171 255.389, 171 256.500 C 171 257.611, 172.167 258, 175.500 258 C 178.833 258, 180 257.611, 180 256.500 C 180 255.500, 181 255, 183 255 C 185 255, 186 254.500, 186 253.500 C 186 252.675, 186.675 252, 187.500 252 C 188.325 252, 189 251.325, 189 250.500 C 189 249.675, 189.675 249, 190.500 249 C 191.325 249, 192 248.325, 192 247.500 C 192 246.675, 192.675 246, 193.500 246 C 194.700 246, 195 244.500, 195 238.500 L 195 231 199.500 231 C 202.833 231, 204 230.611, 204 229.500 C 204 228.675, 204.675 228, 205.500 228 C 206.325 228, 207 227.325, 207 226.500 C 207 225.389, 205.833 225, 202.500 225 C 199.167 225, 198 225.389, 198 226.500 M 213 226.500 C 213 227.325, 212.325 228, 211.500 228 C 210.675 228, 210 228.675, 210 229.500 C 210 230.611, 211.167 231, 214.500 231 C 217.833 231, 219 230.611, 219 229.500 C 219 228.675, 219.675 228, 220.500 228 C 221.325 228, 222 227.325, 222 226.500 C 222 225.389, 220.833 225, 217.500 225 C 214.167 225, 213 225.389, 213 226.500 M 285 226.500 C 285 227.325, 285.675 228, 286.500 228 C 287.325 228, 288 228.675, 288 229.500 C 288 230.611, 289.167 231, 292.500 231 C 295.833 231, 297 230.611, 297 229.500 C 297 228.675, 296.325 228, 295.500 228 C 294.675 228, 294 227.325, 294 226.500 C 294 225.389, 292.833 225, 289.500 225 C 286.167 225, 285 225.389, 285 226.500 M 300 226.500 C 300 227.325, 300.675 228, 301.500 228 C 302.325 228, 303 228.675, 303 229.500 C 303 230.500, 304 231, 306 231 C 308 231, 309 231.500, 309 232.500 C 309 233.325, 309.675 234, 310.500 234 C 311.667 234, 312 235.333, 312 240 C 312 244.667, 312.333 246, 313.500 246 C 314.500 246, 315 247, 315 249 C 315 251, 314.500 252, 313.500 252 C 312.675 252, 312 251.325, 312 250.500 C 312 249.675, 311.325 249, 310.500 249 C 309.675 249, 309 248.325, 309 247.500 C 309 246.333, 307.667 246, 303 246 C 298.333 246, 297 246.333, 297 247.500 C 297 248.325, 296.325 249, 295.500 249 C 294.675 249, 294 249.675, 294 250.500 C 294 251.325, 293.325 252, 292.500 252 C 291.675 252, 291 252.675, 291 253.500 C 291 254.500, 290 255, 288 255 C 285.333 255, 285 254.667, 285 252 C 285 250, 285.500 249, 286.500 249 C 287.325 249, 288 248.325, 288 247.500 C 288 246.675, 288.675 246, 289.500 246 C 290.325 246, 291 245.325, 291 244.500 C 291 243.675, 291.675 243, 292.500 243 C 293.325 243, 294 242.325, 294 241.500 C 294 240.675, 294.675 240, 295.500 240 C 296.325 240, 297 239.325, 297 238.500 C 297 237.675, 296.325 237, 295.500 237 C 294.675 237, 294 236.325, 294 235.500 C 294 234.389, 292.833 234, 289.500 234 C 286.167 234, 285 233.611, 285 232.500 C 285 231.675, 284.325 231, 283.500 231 C 282.675 231, 282 231.675, 282 232.500 C 282 233.500, 281 234, 279 234 C 277 234, 276 233.500, 276 232.500 C 276 231.500, 275 231, 273 231 C 271 231, 270 231.500, 270 232.500 C 270 233.325, 270.675 234, 271.500 234 C 272.325 234, 273 234.675, 273 235.500 C 273 236.700, 274.500 237, 280.500 237 L 288 237 288 240 C 288 242, 287.500 243, 286.500 243 C 285.675 243, 285 243.675, 285 244.500 C 285 245.325, 284.325 246, 283.500 246 C 282.675 246, 282 246.675, 282 247.500 C 282 248.325, 281.325 249, 280.500 249 C 279.389 249, 279 250.167, 279 253.500 C 279 256.833, 279.389 258, 280.500 258 C 281.325 258, 282 258.675, 282 259.500 C 282 260.611, 283.167 261, 286.500 261 C 289.833 261, 291 260.611, 291 259.500 C 291 258.500, 292 258, 294 258 C 296 258, 297 257.500, 297 256.500 C 297 255.675, 297.675 255, 298.500 255 C 299.325 255, 300 254.325, 300 253.500 C 300 252.500, 301 252, 303 252 L 306 252 306 258 C 306 262.667, 305.667 264, 304.500 264 C 303.675 264, 303 264.675, 303 265.500 C 303 266.500, 302 267, 300 267 C 298 267, 297 267.500, 297 268.500 C 297 269.325, 297.675 270, 298.500 270 C 299.500 270, 300 271, 300 273 C 300 275.667, 299.667 276, 297 276 C 295 276, 294 276.500, 294 277.500 C 294 278.611, 295.167 279, 298.500 279 C 301.833 279, 303 278.611, 303 277.500 C 303 276.675, 303.675 276, 304.500 276 C 305.325 276, 306 275.325, 306 274.500 C 306 273.675, 306.675 273, 307.500 273 C 308.325 273, 309 272.325, 309 271.500 C 309 270.389, 310.167 270, 313.500 270 C 317.833 270, 318 269.889, 318 267 C 318 264.333, 317.667 264, 315 264 C 313 264, 312 263.500, 312 262.500 C 312 261.675, 312.675 261, 313.500 261 C 314.611 261, 315 259.833, 315 256.500 C 315 252.167, 315.111 252, 318 252 C 320 252, 321 252.500, 321 253.500 C 321 254.500, 322 255, 324 255 C 326 255, 327 255.500, 327 256.500 C 327 257.611, 328.167 258, 331.500 258 C 334.833 258, 336 257.611, 336 256.500 C 336 255.389, 337.167 255, 340.500 255 C 344.833 255, 345 254.889, 345 252 C 345 250, 344.500 249, 343.500 249 C 342.675 249, 342 249.675, 342 250.500 C 342 251.722, 340.333 252, 333 252 C 325.667 252, 324 251.722, 324 250.500 C 324 249.500, 323 249, 321 249 C 318.333 249, 318 248.667, 318 246 C 318 244, 317.500 243, 316.500 243 C 315.300 243, 315 241.500, 315 235.500 L 315 228 312 228 C 310 228, 309 227.500, 309 226.500 C 309 225.389, 307.833 225, 304.500 225 C 301.167 225, 300 225.389, 300 226.500 M 132 234 C 132 236, 132.500 237, 133.500 237 C 134.500 237, 135 236, 135 234 C 135 232, 134.500 231, 133.500 231 C 132.500 231, 132 232, 132 234 M 207 232.500 C 207 233.325, 207.675 234, 208.500 234 C 209.325 234, 210 233.325, 210 232.500 C 210 231.675, 209.325 231, 208.500 231 C 207.675 231, 207 231.675, 207 232.500 M 222 232.500 C 222 233.611, 220.833 234, 217.500 234 C 214.167 234, 213 234.389, 213 235.500 C 213 236.325, 212.325 237, 211.500 237 C 210.500 237, 210 238, 210 240 C 210 242, 210.500 243, 211.500 243 C 212.325 243, 213 243.675, 213 244.500 C 213 245.500, 214 246, 216 246 C 218 246, 219 246.500, 219 247.500 C 219 248.325, 219.675 249, 220.500 249 C 221.500 249, 222 250, 222 252 C 222 254.667, 221.667 255, 219 255 C 217 255, 216 254.500, 216 253.500 C 216 252.675, 215.325 252, 214.500 252 C 213.675 252, 213 251.325, 213 250.500 C 213 249.675, 212.325 249, 211.500 249 C 210.675 249, 210 248.325, 210 247.500 C 210 246.333, 208.667 246, 204 246 C 199.333 246, 198 246.333, 198 247.500 C 198 248.325, 197.325 249, 196.500 249 C 195.675 249, 195 249.675, 195 250.500 C 195 251.325, 194.325 252, 193.500 252 C 192.389 252, 192 253.167, 192 256.500 C 192 259.833, 192.389 261, 193.500 261 C 194.325 261, 195 261.675, 195 262.500 C 195 263.611, 193.833 264, 190.500 264 C 187.167 264, 186 264.389, 186 265.500 C 186 266.325, 186.675 267, 187.500 267 C 188.325 267, 189 267.675, 189 268.500 C 189 269.500, 190 270, 192 270 C 194 270, 195 270.500, 195 271.500 C 195 272.500, 196 273, 198 273 C 200 273, 201 273.500, 201 274.500 C 201 275.325, 200.325 276, 199.500 276 C 198.675 276, 198 276.675, 198 277.500 C 198 278.325, 198.675 279, 199.500 279 C 200.325 279, 201 278.325, 201 277.500 C 201 276.675, 201.675 276, 202.500 276 C 203.325 276, 204 276.675, 204 277.500 C 204 278.611, 205.167 279, 208.500 279 C 211.833 279, 213 278.611, 213 277.500 C 213 276.500, 212 276, 210 276 C 207.333 276, 207 275.667, 207 273 C 207 271, 207.500 270, 208.500 270 C 209.325 270, 210 269.325, 210 268.500 C 210 267.389, 208.833 267, 205.500 267 L 201 267 201 262.500 C 201 259.167, 200.611 258, 199.500 258 C 198.675 258, 198 257.325, 198 256.500 C 198 255.675, 198.675 255, 199.500 255 C 200.325 255, 201 254.325, 201 253.500 C 201 252.500, 202 252, 204 252 C 206 252, 207 252.500, 207 253.500 C 207 254.325, 207.675 255, 208.500 255 C 209.325 255, 210 255.675, 210 256.500 C 210 257.325, 210.675 258, 211.500 258 C 212.325 258, 213 258.675, 213 259.500 C 213 260.667, 214.333 261, 219 261 C 223.667 261, 225 260.667, 225 259.500 C 225 258.675, 225.675 258, 226.500 258 C 227.611 258, 228 256.833, 228 253.500 C 228 250.167, 227.611 249, 226.500 249 C 225.675 249, 225 248.325, 225 247.500 C 225 246.675, 224.325 246, 223.500 246 C 222.675 246, 222 245.325, 222 244.500 C 222 243.500, 221 243, 219 243 C 216.333 243, 216 242.667, 216 240 L 216 237 225 237 C 232.333 237, 234 236.722, 234 235.500 C 234 234.675, 234.675 234, 235.500 234 C 236.325 234, 237 233.325, 237 232.500 C 237 231.500, 236 231, 234 231 C 232 231, 231 231.500, 231 232.500 C 231 233.500, 230 234, 228 234 C 226 234, 225 233.500, 225 232.500 C 225 231.675, 224.325 231, 223.500 231 C 222.675 231, 222 231.675, 222 232.500 M 297 232.500 C 297 233.325, 297.675 234, 298.500 234 C 299.325 234, 300 233.325, 300 232.500 C 300 231.675, 299.325 231, 298.500 231 C 297.675 231, 297 231.675, 297 232.500 M 372 234 C 372 236, 372.500 237, 373.500 237 C 374.500 237, 375 236, 375 234 C 375 232, 374.500 231, 373.500 231 C 372.500 231, 372 232, 372 234 M 204 235.500 C 204 236.325, 204.675 237, 205.500 237 C 206.325 237, 207 236.325, 207 235.500 C 207 234.675, 206.325 234, 205.500 234 C 204.675 234, 204 234.675, 204 235.500 M 249 235.500 C 249 236.325, 248.325 237, 247.500 237 C 246.500 237, 246 238, 246 240 L 246 243 252 243 C 256.667 243, 258 242.667, 258 241.500 C 258 240.675, 258.675 240, 259.500 240 C 260.325 240, 261 239.325, 261 238.500 C 261 237.675, 260.325 237, 259.500 237 C 258.675 237, 258 236.325, 258 235.500 C 258 234.389, 256.833 234, 253.500 234 C 250.167 234, 249 234.389, 249 235.500 M 300 235.500 C 300 236.325, 300.675 237, 301.500 237 C 302.325 237, 303 236.325, 303 235.500 C 303 234.675, 302.325 234, 301.500 234 C 300.675 234, 300 234.675, 300 235.500 M 231 244.500 C 231 245.325, 231.675 246, 232.500 246 C 233.700 246, 234 247.500, 234 253.500 C 234 259.500, 233.700 261, 232.500 261 C 231.675 261, 231 261.675, 231 262.500 C 231 263.325, 230.325 264, 229.500 264 C 228.675 264, 228 264.675, 228 265.500 C 228 266.500, 227 267, 225 267 C 222.333 267, 222 267.333, 222 270 C 222 272, 222.500 273, 223.500 273 C 224.611 273, 225 274.167, 225 277.500 C 225 280.833, 224.611 282, 223.500 282 C 222.675 282, 222 282.675, 222 283.500 C 222 284.500, 221 285, 219 285 C 217 285, 216 285.500, 216 286.500 C 216 287.325, 215.325 288, 214.500 288 C 213.675 288, 213 288.675, 213 289.500 C 213 290.500, 214 291, 216 291 C 218 291, 219 290.500, 219 289.500 C 219 288.389, 220.167 288, 223.500 288 C 226.833 288, 228 287.611, 228 286.500 C 228 285.675, 228.675 285, 229.500 285 C 230.325 285, 231 284.325, 231 283.500 C 231 282.500, 232 282, 234 282 L 237 282 237 262.500 L 237 243 234 243 C 232 243, 231 243.500, 231 244.500 M 270 247.500 C 270 250.833, 270.389 252, 271.500 252 C 272.500 252, 273 251, 273 249 C 273 247, 273.500 246, 274.500 246 C 275.325 246, 276 245.325, 276 244.500 C 276 243.500, 275 243, 273 243 C 270.111 243, 270 243.167, 270 247.500 M 126 252 C 126 254.889, 126.167 255, 130.500 255 C 133.833 255, 135 255.389, 135 256.500 C 135 257.667, 136.333 258, 141 258 C 145.667 258, 147 257.667, 147 256.500 C 147 255.333, 148.333 255, 153 255 C 157.667 255, 159 254.667, 159 253.500 C 159 252.675, 158.325 252, 157.500 252 C 156.675 252, 156 251.325, 156 250.500 C 156 249.389, 154.833 249, 151.500 249 C 148.167 249, 147 249.389, 147 250.500 C 147 251.325, 146.325 252, 145.500 252 C 144.675 252, 144 252.675, 144 253.500 C 144 254.500, 143 255, 141 255 C 139 255, 138 254.500, 138 253.500 C 138 252.675, 137.325 252, 136.500 252 C 135.675 252, 135 251.325, 135 250.500 C 135 249.389, 133.833 249, 130.500 249 C 126.167 249, 126 249.111, 126 252 M 252 252 C 252 254, 251.500 255, 250.500 255 C 249.500 255, 249 256, 249 258 C 249 260, 248.500 261, 247.500 261 C 246.675 261, 246 261.675, 246 262.500 C 246 263.500, 247 264, 249 264 C 251 264, 252 263.500, 252 262.500 C 252 261.675, 252.675 261, 253.500 261 C 254.325 261, 255 261.675, 255 262.500 C 255 263.500, 256 264, 258 264 C 260 264, 261 263.500, 261 262.500 C 261 261.500, 260 261, 258 261 C 256 261, 255 260.500, 255 259.500 C 255 258.675, 255.675 258, 256.500 258 C 257.500 258, 258 257, 258 255 C 258 253, 257.500 252, 256.500 252 C 255.675 252, 255 251.325, 255 250.500 C 255 249.675, 254.325 249, 253.500 249 C 252.500 249, 252 250, 252 252 M 351 250.500 C 351 251.325, 350.325 252, 349.500 252 C 348.675 252, 348 252.675, 348 253.500 C 348 254.667, 349.333 255, 354 255 C 358.667 255, 360 255.333, 360 256.500 C 360 257.667, 361.333 258, 366 258 C 370.667 258, 372 257.667, 372 256.500 C 372 255.389, 373.167 255, 376.500 255 C 380.833 255, 381 254.889, 381 252 C 381 249.111, 380.833 249, 376.500 249 C 373.167 249, 372 249.389, 372 250.500 C 372 251.325, 371.325 252, 370.500 252 C 369.675 252, 369 252.675, 369 253.500 C 369 254.500, 368 255, 366 255 C 364 255, 363 254.500, 363 253.500 C 363 252.675, 362.325 252, 361.500 252 C 360.675 252, 360 251.325, 360 250.500 C 360 249.389, 358.833 249, 355.500 249 C 352.167 249, 351 249.389, 351 250.500 M 270 270 L 270 282 273 282 C 275.667 282, 276 282.333, 276 285 L 276 288 282 288 C 286.667 288, 288 288.333, 288 289.500 C 288 290.500, 289 291, 291 291 C 293 291, 294 290.500, 294 289.500 C 294 288.675, 293.325 288, 292.500 288 C 291.675 288, 291 287.325, 291 286.500 C 291 285.500, 290 285, 288 285 C 286 285, 285 284.500, 285 283.500 C 285 282.675, 284.325 282, 283.500 282 C 282.389 282, 282 280.833, 282 277.500 C 282 274.167, 282.389 273, 283.500 273 C 284.500 273, 285 272, 285 270 C 285 267.333, 284.667 267, 282 267 C 280 267, 279 266.500, 279 265.500 C 279 264.500, 278 264, 276 264 C 273.333 264, 273 263.667, 273 261 C 273 259, 272.500 258, 271.500 258 C 270.250 258, 270 260, 270 270 M 165 262.500 C 165 263.325, 164.325 264, 163.500 264 C 162.389 264, 162 265.167, 162 268.500 C 162 272.833, 162.111 273, 165 273 C 167 273, 168 273.500, 168 274.500 C 168 275.500, 169 276, 171 276 L 174 276 174 268.500 L 174 261 169.500 261 C 166.167 261, 165 261.389, 165 262.500 M 333 262.500 C 333 263.325, 332.325 264, 331.500 264 C 330.675 264, 330 264.675, 330 265.500 C 330 266.325, 330.675 267, 331.500 267 C 332.611 267, 333 268.167, 333 271.500 C 333 275.833, 333.111 276, 336 276 C 338 276, 339 275.500, 339 274.500 C 339 273.500, 340 273, 342 273 C 344.889 273, 345 272.833, 345 268.500 C 345 265.167, 344.611 264, 343.500 264 C 342.675 264, 342 263.325, 342 262.500 C 342 261.389, 340.833 261, 337.500 261 C 334.167 261, 333 261.389, 333 262.500 M 255 268.500 C 255 269.611, 253.833 270, 250.500 270 C 246.167 270, 246 270.111, 246 273 C 246 275, 246.500 276, 247.500 276 C 248.500 276, 249 277, 249 279 C 249 281, 249.500 282, 250.500 282 C 251.325 282, 252 282.675, 252 283.500 C 252 284.325, 252.675 285, 253.500 285 C 254.325 285, 255 284.325, 255 283.500 C 255 282.675, 255.675 282, 256.500 282 C 257.500 282, 258 281, 258 279 C 258 277, 258.500 276, 259.500 276 C 260.325 276, 261 275.325, 261 274.500 C 261 273.675, 260.325 273, 259.500 273 C 258.500 273, 258 272, 258 270 C 258 268, 257.500 267, 256.500 267 C 255.675 267, 255 267.675, 255 268.500 M 180 274.500 C 180 275.325, 179.325 276, 178.500 276 C 177.500 276, 177 277, 177 279 L 177 282 184.500 282 C 190.500 282, 192 282.300, 192 283.500 C 192 284.325, 192.675 285, 193.500 285 C 194.325 285, 195 284.325, 195 283.500 C 195 282.675, 195.675 282, 196.500 282 C 197.325 282, 198 281.325, 198 280.500 C 198 279.675, 197.325 279, 196.500 279 C 195.675 279, 195 278.325, 195 277.500 C 195 276.500, 194 276, 192 276 C 190 276, 189 276.500, 189 277.500 C 189 278.325, 188.325 279, 187.500 279 C 186.675 279, 186 278.325, 186 277.500 C 186 276.675, 185.325 276, 184.500 276 C 183.675 276, 183 275.325, 183 274.500 C 183 273.675, 182.325 273, 181.500 273 C 180.675 273, 180 273.675, 180 274.500 M 324 274.500 C 324 275.500, 323 276, 321 276 C 319 276, 318 276.500, 318 277.500 C 318 278.325, 317.325 279, 316.500 279 C 315.675 279, 315 278.325, 315 277.500 C 315 276.675, 314.325 276, 313.500 276 C 312.675 276, 312 276.675, 312 277.500 C 312 278.325, 311.325 279, 310.500 279 C 309.675 279, 309 279.675, 309 280.500 C 309 281.325, 309.675 282, 310.500 282 C 311.325 282, 312 282.675, 312 283.500 C 312 284.325, 312.675 285, 313.500 285 C 314.325 285, 315 284.325, 315 283.500 C 315 282.300, 316.500 282, 322.500 282 L 330 282 330 279 C 330 277, 329.500 276, 328.500 276 C 327.675 276, 327 275.325, 327 274.500 C 327 273.675, 326.325 273, 325.500 273 C 324.675 273, 324 273.675, 324 274.500 M 306 277.500 C 306 278.325, 306.675 279, 307.500 279 C 308.325 279, 309 278.325, 309 277.500 C 309 276.675, 308.325 276, 307.500 276 C 306.675 276, 306 276.675, 306 277.500 M 153 295.500 C 153 296.823, 164.833 297, 253.500 297 C 342.167 297, 354 296.823, 354 295.500 C 354 294.177, 342.167 294, 253.500 294 C 164.833 294, 153 294.177, 153 295.500 M 60 315 C 60 325, 60.250 327, 61.500 327 C 62.500 327, 63 328, 63 330 C 63 332, 63.500 333, 64.500 333 C 65.325 333, 66 333.675, 66 334.500 C 66 335.325, 66.675 336, 67.500 336 C 68.325 336, 69 336.675, 69 337.500 C 69 338.325, 69.675 339, 70.500 339 C 71.325 339, 72 339.675, 72 340.500 C 72 341.325, 72.675 342, 73.500 342 C 74.738 342, 75 340.167, 75 331.500 C 75 322.833, 74.738 321, 73.500 321 C 72.389 321, 72 319.833, 72 316.500 C 72 313.167, 71.611 312, 70.500 312 C 69.675 312, 69 311.325, 69 310.500 C 69 309.675, 68.325 309, 67.500 309 C 66.675 309, 66 308.325, 66 307.500 C 66 306.675, 65.325 306, 64.500 306 C 63.675 306, 63 305.325, 63 304.500 C 63 303.675, 62.325 303, 61.500 303 C 60.250 303, 60 305, 60 315 M 225 304.500 C 225 305.700, 223.500 306, 217.500 306 C 211.500 306, 210 306.300, 210 307.500 C 210 308.611, 208.833 309, 205.500 309 C 202.167 309, 201 309.389, 201 310.500 C 201 311.500, 200 312, 198 312 C 196 312, 195 312.500, 195 313.500 C 195 314.500, 194 315, 192 315 C 190 315, 189 315.500, 189 316.500 C 189 317.500, 188 318, 186 318 C 184 318, 183 318.500, 183 319.500 C 183 320.500, 182 321, 180 321 C 178 321, 177 321.500, 177 322.500 C 177 323.325, 176.325 324, 175.500 324 C 174.675 324, 174 324.675, 174 325.500 C 174 326.325, 173.325 327, 172.500 327 C 171.675 327, 171 327.675, 171 328.500 C 171 329.325, 170.325 330, 169.500 330 C 168.675 330, 168 330.675, 168 331.500 C 168 332.325, 167.325 333, 166.500 333 C 165.675 333, 165 333.675, 165 334.500 C 165 335.325, 164.325 336, 163.500 336 C 162.675 336, 162 336.675, 162 337.500 C 162 338.325, 161.325 339, 160.500 339 C 159.675 339, 159 339.675, 159 340.500 C 159 341.325, 158.325 342, 157.500 342 C 156.333 342, 156 343.333, 156 348 C 156 352.667, 156.333 354, 157.500 354 C 158.500 354, 159 353, 159 351 C 159 349, 159.500 348, 160.500 348 C 161.325 348, 162 347.325, 162 346.500 C 162 345.675, 162.675 345, 163.500 345 C 164.325 345, 165 344.325, 165 343.500 C 165 342.675, 165.675 342, 166.500 342 C 167.325 342, 168 341.325, 168 340.500 C 168 339.675, 168.675 339, 169.500 339 C 170.325 339, 171 338.325, 171 337.500 C 171 336.675, 171.675 336, 172.500 336 C 173.325 336, 174 335.325, 174 334.500 C 174 333.675, 174.675 333, 175.500 333 C 176.325 333, 177 332.325, 177 331.500 C 177 330.675, 177.675 330, 178.500 330 C 179.325 330, 180 329.325, 180 328.500 C 180 327.675, 180.675 327, 181.500 327 C 182.325 327, 183 326.325, 183 325.500 C 183 324.500, 184 324, 186 324 C 188 324, 189 323.500, 189 322.500 C 189 321.500, 190 321, 192 321 C 194 321, 195 320.500, 195 319.500 C 195 318.500, 196 318, 198 318 C 200 318, 201 317.500, 201 316.500 C 201 315.389, 202.167 315, 205.500 315 C 208.833 315, 210 314.611, 210 313.500 C 210 312.333, 211.333 312, 216 312 C 220.667 312, 222 311.667, 222 310.500 C 222 309.262, 223.833 309, 232.500 309 C 241.167 309, 243 308.738, 243 307.500 C 243 306.262, 244.833 306, 253.500 306 C 262.167 306, 264 306.262, 264 307.500 C 264 308.738, 265.833 309, 274.500 309 C 283.167 309, 285 309.262, 285 310.500 C 285 311.667, 286.333 312, 291 312 C 295.667 312, 297 312.333, 297 313.500 C 297 314.611, 298.167 315, 301.500 315 C 304.833 315, 306 315.389, 306 316.500 C 306 317.500, 307 318, 309 318 C 311 318, 312 318.500, 312 319.500 C 312 320.500, 313 321, 315 321 C 317 321, 318 321.500, 318 322.500 C 318 323.325, 318.675 324, 319.500 324 C 320.325 324, 321 324.675, 321 325.500 C 321 326.500, 322 327, 324 327 C 326 327, 327 327.500, 327 328.500 C 327 329.325, 327.675 330, 328.500 330 C 329.325 330, 330 330.675, 330 331.500 C 330 332.325, 330.675 333, 331.500 333 C 332.325 333, 333 333.675, 333 334.500 C 333 335.325, 333.675 336, 334.500 336 C 335.325 336, 336 336.675, 336 337.500 C 336 338.325, 336.675 339, 337.500 339 C 338.325 339, 339 339.675, 339 340.500 C 339 341.325, 339.675 342, 340.500 342 C 341.325 342, 342 342.675, 342 343.500 C 342 344.325, 342.675 345, 343.500 345 C 344.500 345, 345 346, 345 348 C 345 350, 345.500 351, 346.500 351 C 347.325 351, 348 351.675, 348 352.500 C 348 353.325, 348.675 354, 349.500 354 C 350.611 354, 351 352.833, 351 349.500 C 351 346.167, 350.611 345, 349.500 345 C 348.500 345, 348 344, 348 342 C 348 340, 347.500 339, 346.500 339 C 345.675 339, 345 338.325, 345 337.500 C 345 336.675, 344.325 336, 343.500 336 C 342.675 336, 342 335.325, 342 334.500 C 342 333.675, 341.325 333, 340.500 333 C 339.675 333, 339 332.325, 339 331.500 C 339 330.675, 338.325 330, 337.500 330 C 336.675 330, 336 329.325, 336 328.500 C 336 327.675, 335.325 327, 334.500 327 C 333.675 327, 333 326.325, 333 325.500 C 333 324.500, 332 324, 330 324 C 328 324, 327 323.500, 327 322.500 C 327 321.675, 326.325 321, 325.500 321 C 324.675 321, 324 320.325, 324 319.500 C 324 318.500, 323 318, 321 318 C 319 318, 318 317.500, 318 316.500 C 318 315.500, 317 315, 315 315 C 313 315, 312 314.500, 312 313.500 C 312 312.500, 311 312, 309 312 C 307 312, 306 311.500, 306 310.500 C 306 309.389, 304.833 309, 301.500 309 C 298.167 309, 297 308.611, 297 307.500 C 297 306.300, 295.500 306, 289.500 306 C 283.500 306, 282 305.700, 282 304.500 C 282 303.202, 278.167 303, 253.500 303 C 228.833 303, 225 303.202, 225 304.500 M 444 304.500 C 444 305.325, 443.325 306, 442.500 306 C 441.675 306, 441 306.675, 441 307.500 C 441 308.325, 440.325 309, 439.500 309 C 438.675 309, 438 309.675, 438 310.500 C 438 311.325, 437.325 312, 436.500 312 C 435.300 312, 435 313.500, 435 319.500 C 435 325.500, 434.700 327, 433.500 327 C 432.300 327, 432 328.500, 432 334.500 C 432 340.500, 432.300 342, 433.500 342 C 434.325 342, 435 341.325, 435 340.500 C 435 339.675, 435.675 339, 436.500 339 C 437.325 339, 438 338.325, 438 337.500 C 438 336.675, 438.675 336, 439.500 336 C 440.325 336, 441 335.325, 441 334.500 C 441 333.675, 441.675 333, 442.500 333 C 443.325 333, 444 332.325, 444 331.500 C 444 330.675, 444.675 330, 445.500 330 C 446.759 330, 447 327.833, 447 316.500 C 447 305.167, 446.759 303, 445.500 303 C 444.675 303, 444 303.675, 444 304.500 M 87 307.500 C 87 308.325, 86.325 309, 85.500 309 C 84.675 309, 84 309.675, 84 310.500 C 84 311.325, 83.325 312, 82.500 312 C 81.389 312, 81 313.167, 81 316.500 C 81 319.833, 80.611 321, 79.500 321 C 78.389 321, 78 322.167, 78 325.500 C 78 328.833, 78.389 330, 79.500 330 C 80.667 330, 81 331.333, 81 336 C 81 340.667, 81.333 342, 82.500 342 C 83.500 342, 84 341, 84 339 C 84 337, 84.500 336, 85.500 336 C 86.500 336, 87 335, 87 333 C 87 331, 87.500 330, 88.500 330 C 89.750 330, 90 328, 90 318 C 90 308, 89.750 306, 88.500 306 C 87.675 306, 87 306.675, 87 307.500 M 417 318 C 417 328, 417.250 330, 418.500 330 C 419.500 330, 420 331, 420 333 C 420 335, 420.500 336, 421.500 336 C 422.500 336, 423 337, 423 339 C 423 341, 423.500 342, 424.500 342 C 425.611 342, 426 340.833, 426 337.500 C 426 334.167, 426.389 333, 427.500 333 C 428.700 333, 429 331.500, 429 325.500 C 429 319.500, 428.700 318, 427.500 318 C 426.500 318, 426 317, 426 315 C 426 313, 425.500 312, 424.500 312 C 423.675 312, 423 311.325, 423 310.500 C 423 309.675, 422.325 309, 421.500 309 C 420.675 309, 420 308.325, 420 307.500 C 420 306.675, 419.325 306, 418.500 306 C 417.250 306, 417 308, 417 318 M 240 319.500 L 240 324 246 324 L 252 324 252 319.500 L 252 315 246 315 L 240 315 240 319.500 M 255 319.500 L 255 324 261 324 L 267 324 267 319.500 L 267 315 261 315 L 255 315 255 319.500 M 222 322.500 L 222 327 228 327 L 234 327 234 322.500 L 234 318 228 318 L 222 318 222 322.500 M 273 322.500 L 273 327 277.500 327 C 280.833 327, 282 326.611, 282 325.500 C 282 324.675, 282.675 324, 283.500 324 C 284.500 324, 285 323, 285 321 L 285 318 279 318 L 273 318 273 322.500 M 207 322.500 C 207 323.325, 206.325 324, 205.500 324 C 204.675 324, 204 324.675, 204 325.500 C 204 326.325, 204.675 327, 205.500 327 C 206.500 327, 207 328, 207 330 C 207 332.667, 207.333 333, 210 333 C 212 333, 213 332.500, 213 331.500 C 213 330.500, 214 330, 216 330 C 218.667 330, 219 329.667, 219 327 C 219 325, 218.500 324, 217.500 324 C 216.675 324, 216 323.325, 216 322.500 C 216 321.389, 214.833 321, 211.500 321 C 208.167 321, 207 321.389, 207 322.500 M 288 325.500 C 288 329.833, 288.111 330, 291 330 C 293 330, 294 330.500, 294 331.500 C 294 332.500, 295 333, 297 333 C 299.667 333, 300 332.667, 300 330 C 300 328, 300.500 327, 301.500 327 C 302.325 327, 303 326.325, 303 325.500 C 303 324.675, 302.325 324, 301.500 324 C 300.675 324, 300 323.325, 300 322.500 C 300 321.333, 298.667 321, 294 321 L 288 321 288 325.500 M 195 328.500 C 195 329.500, 194 330, 192 330 C 189.333 330, 189 330.333, 189 333 C 189 335, 189.500 336, 190.500 336 C 191.325 336, 192 336.675, 192 337.500 C 192 338.500, 193 339, 195 339 C 197 339, 198 338.500, 198 337.500 C 198 336.500, 199 336, 201 336 C 203 336, 204 335.500, 204 334.500 C 204 333.675, 203.325 333, 202.500 333 C 201.500 333, 201 332, 201 330 C 201 327.333, 200.667 327, 198 327 C 196 327, 195 327.500, 195 328.500 M 306 328.500 C 306 329.325, 305.325 330, 304.500 330 C 303.500 330, 303 331, 303 333 C 303 335, 303.500 336, 304.500 336 C 305.325 336, 306 336.675, 306 337.500 C 306 338.611, 307.167 339, 310.500 339 C 313.833 339, 315 338.611, 315 337.500 C 315 336.675, 315.675 336, 316.500 336 C 317.500 336, 318 335, 318 333 C 318 330.333, 317.667 330, 315 330 C 313 330, 312 329.500, 312 328.500 C 312 327.500, 311 327, 309 327 C 307 327, 306 327.500, 306 328.500 M 183 337.500 C 183 338.325, 182.325 339, 181.500 339 C 180.675 339, 180 339.675, 180 340.500 C 180 341.325, 179.325 342, 178.500 342 C 177.500 342, 177 343, 177 345 C 177 347, 177.500 348, 178.500 348 C 179.325 348, 180 348.675, 180 349.500 C 180 350.325, 180.675 351, 181.500 351 C 182.325 351, 183 350.325, 183 349.500 C 183 348.675, 183.675 348, 184.500 348 C 185.325 348, 186 347.325, 186 346.500 C 186 345.675, 186.675 345, 187.500 345 C 188.500 345, 189 344, 189 342 C 189 340, 188.500 339, 187.500 339 C 186.675 339, 186 338.325, 186 337.500 C 186 336.675, 185.325 336, 184.500 336 C 183.675 336, 183 336.675, 183 337.500 M 321 337.500 C 321 338.325, 320.325 339, 319.500 339 C 318.389 339, 318 340.167, 318 343.500 C 318 346.833, 318.389 348, 319.500 348 C 320.325 348, 321 348.675, 321 349.500 C 321 350.500, 322 351, 324 351 C 326 351, 327 350.500, 327 349.500 C 327 348.675, 327.675 348, 328.500 348 C 329.500 348, 330 347, 330 345 C 330 343, 329.500 342, 328.500 342 C 327.675 342, 327 341.325, 327 340.500 C 327 339.675, 326.325 339, 325.500 339 C 324.675 339, 324 338.325, 324 337.500 C 324 336.675, 323.325 336, 322.500 336 C 321.675 336, 321 336.675, 321 337.500 M 60 354 C 60 364, 60.250 366, 61.500 366 C 62.611 366, 63 367.167, 63 370.500 C 63 373.833, 63.389 375, 64.500 375 C 65.325 375, 66 375.675, 66 376.500 C 66 377.325, 66.675 378, 67.500 378 C 68.325 378, 69 378.675, 69 379.500 C 69 380.325, 69.675 381, 70.500 381 C 71.325 381, 72 381.675, 72 382.500 C 72 383.500, 73 384, 75 384 C 77.889 384, 78 383.833, 78 379.500 C 78 376.167, 77.611 375, 76.500 375 C 75.278 375, 75 373.333, 75 366 C 75 358.667, 74.722 357, 73.500 357 C 72.500 357, 72 356, 72 354 C 72 352, 71.500 351, 70.500 351 C 69.675 351, 69 350.325, 69 349.500 C 69 348.675, 68.325 348, 67.500 348 C 66.675 348, 66 347.325, 66 346.500 C 66 345.675, 65.325 345, 64.500 345 C 63.675 345, 63 344.325, 63 343.500 C 63 342.675, 62.325 342, 61.500 342 C 60.250 342, 60 344, 60 354 M 444 343.500 C 444 344.325, 443.325 345, 442.500 345 C 441.675 345, 441 345.675, 441 346.500 C 441 347.325, 440.325 348, 439.500 348 C 438.675 348, 438 348.675, 438 349.500 C 438 350.325, 437.325 351, 436.500 351 C 435.500 351, 435 352, 435 354 C 435 356, 434.500 357, 433.500 357 C 432.262 357, 432 358.833, 432 367.500 C 432 376.167, 431.738 378, 430.500 378 C 429.500 378, 429 379, 429 381 C 429 383.667, 429.333 384, 432 384 C 434 384, 435 383.500, 435 382.500 C 435 381.675, 435.675 381, 436.500 381 C 437.325 381, 438 380.325, 438 379.500 C 438 378.675, 438.675 378, 439.500 378 C 440.325 378, 441 377.325, 441 376.500 C 441 375.675, 441.675 375, 442.500 375 C 443.500 375, 444 374, 444 372 C 444 370, 444.500 369, 445.500 369 C 446.759 369, 447 366.833, 447 355.500 C 447 344.167, 446.759 342, 445.500 342 C 444.675 342, 444 342.675, 444 343.500 M 417 358.500 C 417 369.833, 417.241 372, 418.500 372 C 419.500 372, 420 373, 420 375 C 420 377, 420.500 378, 421.500 378 C 422.325 378, 423 378.675, 423 379.500 C 423 380.325, 423.675 381, 424.500 381 C 425.750 381, 426 379, 426 369 C 426 359, 425.750 357, 424.500 357 C 423.500 357, 423 356, 423 354 C 423 352, 422.500 351, 421.500 351 C 420.500 351, 420 350, 420 348 C 420 346, 419.500 345, 418.500 345 C 417.241 345, 417 347.167, 417 358.500 M 87 349.500 C 87 350.325, 86.325 351, 85.500 351 C 84.500 351, 84 352, 84 354 C 84 356, 83.500 357, 82.500 357 C 81.250 357, 81 359, 81 369 C 81 379, 81.250 381, 82.500 381 C 83.325 381, 84 380.325, 84 379.500 C 84 378.675, 84.675 378, 85.500 378 C 86.325 378, 87 377.325, 87 376.500 C 87 375.675, 87.675 375, 88.500 375 C 89.759 375, 90 372.833, 90 361.500 C 90 350.167, 89.759 348, 88.500 348 C 87.675 348, 87 348.675, 87 349.500 M 171 349.500 C 171 350.325, 170.325 351, 169.500 351 C 168.500 351, 168 352, 168 354 C 168 356, 167.500 357, 166.500 357 C 165.675 357, 165 357.675, 165 358.500 C 165 359.325, 165.675 360, 166.500 360 C 167.325 360, 168 360.675, 168 361.500 C 168 362.611, 169.167 363, 172.500 363 C 176.833 363, 177 362.889, 177 360 C 177 358, 177.500 357, 178.500 357 C 179.325 357, 180 356.325, 180 355.500 C 180 354.675, 179.325 354, 178.500 354 C 177.675 354, 177 353.325, 177 352.500 C 177 351.675, 176.325 351, 175.500 351 C 174.675 351, 174 350.325, 174 349.500 C 174 348.675, 173.325 348, 172.500 348 C 171.675 348, 171 348.675, 171 349.500 M 333 349.500 C 333 350.325, 332.325 351, 331.500 351 C 330.675 351, 330 351.675, 330 352.500 C 330 353.325, 329.325 354, 328.500 354 C 327.675 354, 327 354.675, 327 355.500 C 327 356.325, 327.675 357, 328.500 357 C 329.500 357, 330 358, 330 360 C 330 362.667, 330.333 363, 333 363 C 335 363, 336 362.500, 336 361.500 C 336 360.500, 337 360, 339 360 C 341 360, 342 359.500, 342 358.500 C 342 357.675, 341.325 357, 340.500 357 C 339.500 357, 339 356, 339 354 C 339 352, 338.500 351, 337.500 351 C 336.675 351, 336 350.325, 336 349.500 C 336 348.675, 335.325 348, 334.500 348 C 333.675 348, 333 348.675, 333 349.500 M 162 372 L 162 378 168 378 L 174 378 174 373.500 C 174 370.167, 173.611 369, 172.500 369 C 171.675 369, 171 368.325, 171 367.500 C 171 366.389, 169.833 366, 166.500 366 L 162 366 162 372 M 336 367.500 C 336 368.325, 335.325 369, 334.500 369 C 333.389 369, 333 370.167, 333 373.500 L 333 378 339 378 L 345 378 345 372 L 345 366 340.500 366 C 337.167 366, 336 366.389, 336 367.500 M 204 373.500 C 204 374.500, 203 375, 201 375 C 199 375, 198 375.500, 198 376.500 C 198 377.325, 198.675 378, 199.500 378 C 200.325 378, 201 378.675, 201 379.500 C 201 380.325, 201.675 381, 202.500 381 C 203.738 381, 204 382.833, 204 391.500 L 204 402 201 402 C 199 402, 198 402.500, 198 403.500 C 198 404.722, 199.667 405, 207 405 C 214.333 405, 216 404.722, 216 403.500 C 216 402.500, 215 402, 213 402 L 210 402 210 387 L 210 372 207 372 C 205 372, 204 372.500, 204 373.500 M 234 373.500 C 234 374.325, 234.675 375, 235.500 375 C 236.325 375, 237 375.675, 237 376.500 C 237 377.325, 237.675 378, 238.500 378 C 239.325 378, 240 378.675, 240 379.500 C 240 380.325, 240.675 381, 241.500 381 C 242.500 381, 243 382, 243 384 C 243 386, 242.500 387, 241.500 387 C 240.675 387, 240 387.675, 240 388.500 C 240 389.500, 239 390, 237 390 C 235 390, 234 389.500, 234 388.500 C 234 387.675, 233.325 387, 232.500 387 C 231.500 387, 231 386, 231 384 C 231 382, 231.500 381, 232.500 381 C 233.500 381, 234 380, 234 378 C 234 375.333, 233.667 375, 231 375 C 229 375, 228 375.500, 228 376.500 C 228 377.325, 227.325 378, 226.500 378 C 225.333 378, 225 379.333, 225 384 C 225 388.667, 225.333 390, 226.500 390 C 227.325 390, 228 390.675, 228 391.500 C 228 392.667, 229.333 393, 234 393 L 240 393 240 396 C 240 398, 239.500 399, 238.500 399 C 237.675 399, 237 399.675, 237 400.500 C 237 401.611, 235.833 402, 232.500 402 C 229.167 402, 228 402.389, 228 403.500 C 228 404.667, 229.333 405, 234 405 C 238.667 405, 240 404.667, 240 403.500 C 240 402.675, 240.675 402, 241.500 402 C 242.325 402, 243 401.325, 243 400.500 C 243 399.675, 243.675 399, 244.500 399 C 245.500 399, 246 398, 246 396 C 246 394, 246.500 393, 247.500 393 C 248.700 393, 249 391.500, 249 385.500 C 249 379.500, 248.700 378, 247.500 378 C 246.675 378, 246 377.325, 246 376.500 C 246 375.500, 245 375, 243 375 C 241 375, 240 374.500, 240 373.500 C 240 372.500, 239 372, 237 372 C 235 372, 234 372.500, 234 373.500 M 264 373.500 C 264 374.500, 263 375, 261 375 C 258.333 375, 258 375.333, 258 378 C 258 380, 257.500 381, 256.500 381 C 255.278 381, 255 382.667, 255 390 C 255 397.333, 255.278 399, 256.500 399 C 257.325 399, 258 399.675, 258 400.500 C 258 401.325, 258.675 402, 259.500 402 C 260.325 402, 261 402.675, 261 403.500 C 261 404.667, 262.333 405, 267 405 C 271.667 405, 273 404.667, 273 403.500 C 273 402.675, 273.675 402, 274.500 402 C 275.325 402, 276 401.325, 276 400.500 C 276 399.675, 276.675 399, 277.500 399 C 278.722 399, 279 397.333, 279 390 C 279 382.667, 278.722 381, 277.500 381 C 276.500 381, 276 380, 276 378 C 276 375.333, 275.667 375, 273 375 C 271 375, 270 374.500, 270 373.500 C 270 372.500, 269 372, 267 372 C 265 372, 264 372.500, 264 373.500 M 288 381 L 288 390 294 390 C 298.667 390, 300 390.333, 300 391.500 C 300 392.325, 300.675 393, 301.500 393 C 302.325 393, 303 393.675, 303 394.500 C 303 395.325, 302.325 396, 301.500 396 C 300.500 396, 300 397, 300 399 C 300 401.889, 299.833 402, 295.500 402 C 291.167 402, 291 401.889, 291 399 C 291 396.333, 290.667 396, 288 396 C 285.333 396, 285 396.333, 285 399 C 285 401, 285.500 402, 286.500 402 C 287.325 402, 288 402.675, 288 403.500 C 288 404.700, 289.500 405, 295.500 405 C 301.500 405, 303 404.700, 303 403.500 C 303 402.675, 303.675 402, 304.500 402 C 305.325 402, 306 401.325, 306 400.500 C 306 399.675, 306.675 399, 307.500 399 C 308.611 399, 309 397.833, 309 394.500 C 309 391.167, 308.611 390, 307.500 390 C 306.675 390, 306 389.325, 306 388.500 C 306 387.500, 305 387, 303 387 C 301 387, 300 386.500, 300 385.500 C 300 384.389, 298.833 384, 295.500 384 C 291.167 384, 291 383.889, 291 381 L 291 378 298.500 378 L 306 378 306 375 C 306 372.333, 305.667 372, 303 372 C 301 372, 300 372.500, 300 373.500 C 300 374.500, 299 375, 297 375 C 295 375, 294 374.500, 294 373.500 C 294 372.500, 293 372, 291 372 L 288 372 288 381 M 264 379.500 C 264 380.325, 263.325 381, 262.500 381 C 261.300 381, 261 382.500, 261 388.500 C 261 394.500, 261.300 396, 262.500 396 C 263.500 396, 264 397, 264 399 C 264 401.667, 264.333 402, 267 402 C 269.667 402, 270 401.667, 270 399 C 270 397, 270.500 396, 271.500 396 C 272.700 396, 273 394.500, 273 388.500 C 273 382.500, 272.700 381, 271.500 381 C 270.675 381, 270 380.325, 270 379.500 C 270 378.500, 269 378, 267 378 C 265 378, 264 378.500, 264 379.500 M 63 390 C 63 394.667, 63.333 396, 64.500 396 C 65.611 396, 66 397.167, 66 400.500 C 66 403.833, 66.389 405, 67.500 405 C 68.500 405, 69 406, 69 408 C 69 410, 69.500 411, 70.500 411 C 71.325 411, 72 411.675, 72 412.500 C 72 413.325, 72.675 414, 73.500 414 C 74.325 414, 75 414.675, 75 415.500 C 75 416.325, 75.675 417, 76.500 417 C 77.325 417, 78 417.675, 78 418.500 C 78 419.500, 79 420, 81 420 C 83 420, 84 420.500, 84 421.500 C 84 422.325, 84.675 423, 85.500 423 C 86.500 423, 87 422, 87 420 C 87 418, 86.500 417, 85.500 417 C 84.389 417, 84 415.833, 84 412.500 C 84 409.167, 83.611 408, 82.500 408 C 81.333 408, 81 406.667, 81 402 C 81 397.333, 80.667 396, 79.500 396 C 78.675 396, 78 395.325, 78 394.500 C 78 393.675, 77.325 393, 76.500 393 C 75.675 393, 75 392.325, 75 391.500 C 75 390.675, 74.325 390, 73.500 390 C 72.675 390, 72 389.325, 72 388.500 C 72 387.500, 71 387, 69 387 C 67 387, 66 386.500, 66 385.500 C 66 384.675, 65.325 384, 64.500 384 C 63.333 384, 63 385.333, 63 390 M 93 385.500 C 93 386.325, 92.325 387, 91.500 387 C 90.500 387, 90 388, 90 390 C 90 392, 89.500 393, 88.500 393 C 87.300 393, 87 394.500, 87 400.500 C 87 406.500, 87.300 408, 88.500 408 C 89.611 408, 90 409.167, 90 412.500 C 90 415.833, 90.389 417, 91.500 417 C 92.325 417, 93 417.675, 93 418.500 C 93 419.325, 93.675 420, 94.500 420 C 95.611 420, 96 418.833, 96 415.500 C 96 412.167, 96.389 411, 97.500 411 C 98.722 411, 99 409.333, 99 402 C 99 394.667, 98.722 393, 97.500 393 C 96.389 393, 96 391.833, 96 388.500 C 96 385.167, 95.611 384, 94.500 384 C 93.675 384, 93 384.675, 93 385.500 M 162 390 L 162 396 168 396 L 174 396 174 390 L 174 384 168 384 L 162 384 162 390 M 333 390 L 333 396 339 396 L 345 396 345 390 L 345 384 339 384 L 333 384 333 390 M 411 390 C 411 394.667, 410.667 396, 409.500 396 C 408.300 396, 408 397.500, 408 403.500 C 408 409.500, 408.300 411, 409.500 411 C 410.611 411, 411 412.167, 411 415.500 C 411 418.833, 411.389 420, 412.500 420 C 413.325 420, 414 419.325, 414 418.500 C 414 417.675, 414.675 417, 415.500 417 C 416.500 417, 417 416, 417 414 C 417 412, 417.500 411, 418.500 411 C 419.738 411, 420 409.167, 420 400.500 C 420 391.833, 419.738 390, 418.500 390 C 417.675 390, 417 389.325, 417 388.500 C 417 387.675, 416.325 387, 415.500 387 C 414.675 387, 414 386.325, 414 385.500 C 414 384.675, 413.325 384, 412.500 384 C 411.333 384, 411 385.333, 411 390 M 441 385.500 C 441 386.325, 440.325 387, 439.500 387 C 438.675 387, 438 387.675, 438 388.500 C 438 389.500, 437 390, 435 390 C 433 390, 432 390.500, 432 391.500 C 432 392.325, 431.325 393, 430.500 393 C 429.500 393, 429 394, 429 396 C 429 398, 428.500 399, 427.500 399 C 426.389 399, 426 400.167, 426 403.500 C 426 406.833, 425.611 408, 424.500 408 C 423.389 408, 423 409.167, 423 412.500 C 423 415.833, 422.611 417, 421.500 417 C 420.500 417, 420 418, 420 420 C 420 422.667, 420.333 423, 423 423 C 425 423, 426 422.500, 426 421.500 C 426 420.675, 426.675 420, 427.500 420 C 428.325 420, 429 419.325, 429 418.500 C 429 417.675, 429.675 417, 430.500 417 C 431.325 417, 432 416.325, 432 415.500 C 432 414.675, 432.675 414, 433.500 414 C 434.325 414, 435 413.325, 435 412.500 C 435 411.675, 435.675 411, 436.500 411 C 437.325 411, 438 410.325, 438 409.500 C 438 408.675, 438.675 408, 439.500 408 C 440.611 408, 441 406.833, 441 403.500 C 441 400.167, 441.389 399, 442.500 399 C 443.700 399, 444 397.500, 444 391.500 C 444 385.500, 443.700 384, 442.500 384 C 441.675 384, 441 384.675, 441 385.500 M 105 427.500 C 105 436.167, 105.262 438, 106.500 438 C 107.325 438, 108 438.675, 108 439.500 C 108 440.325, 108.675 441, 109.500 441 C 110.500 441, 111 442, 111 444 C 111 446, 111.500 447, 112.500 447 C 113.325 447, 114 447.675, 114 448.500 C 114 449.500, 115 450, 117 450 C 119 450, 120 450.500, 120 451.500 C 120 452.325, 120.675 453, 121.500 453 C 122.667 453, 123 451.667, 123 447 C 123 442.333, 122.667 441, 121.500 441 C 120.500 441, 120 440, 120 438 C 120 436, 119.500 435, 118.500 435 C 117.500 435, 117 434, 117 432 C 117 430, 116.500 429, 115.500 429 C 114.675 429, 114 428.325, 114 427.500 C 114 426.675, 113.325 426, 112.500 426 C 111.500 426, 111 425, 111 423 C 111 421, 110.500 420, 109.500 420 C 108.675 420, 108 419.325, 108 418.500 C 108 417.675, 107.325 417, 106.500 417 C 105.262 417, 105 418.833, 105 427.500 M 399 418.500 C 399 419.325, 398.325 420, 397.500 420 C 396.500 420, 396 421, 396 423 C 396 425, 395.500 426, 394.500 426 C 393.675 426, 393 426.675, 393 427.500 C 393 428.325, 392.325 429, 391.500 429 C 390.500 429, 390 430, 390 432 C 390 434, 389.500 435, 388.500 435 C 387.500 435, 387 436, 387 438 C 387 440, 386.500 441, 385.500 441 C 384.333 441, 384 442.333, 384 447 L 384 453 387 453 C 389 453, 390 452.500, 390 451.500 C 390 450.675, 390.675 450, 391.500 450 C 392.325 450, 393 449.325, 393 448.500 C 393 447.675, 393.675 447, 394.500 447 C 395.500 447, 396 446, 396 444 C 396 442, 396.500 441, 397.500 441 C 398.325 441, 399 440.325, 399 439.500 C 399 438.675, 399.675 438, 400.500 438 C 401.611 438, 402 436.833, 402 433.500 C 402 430.167, 402.389 429, 403.500 429 C 404.667 429, 405 427.667, 405 423 L 405 417 402 417 C 400 417, 399 417.500, 399 418.500 M 75 429 C 75 431, 75.500 432, 76.500 432 C 77.500 432, 78 433, 78 435 C 78 437, 78.500 438, 79.500 438 C 80.325 438, 81 438.675, 81 439.500 C 81 440.325, 81.675 441, 82.500 441 C 83.325 441, 84 441.675, 84 442.500 C 84 443.325, 84.675 444, 85.500 444 C 86.325 444, 87 444.675, 87 445.500 C 87 446.325, 87.675 447, 88.500 447 C 89.325 447, 90 447.675, 90 448.500 C 90 449.500, 91 450, 93 450 C 95 450, 96 450.500, 96 451.500 C 96 452.667, 97.333 453, 102 453 C 106.667 453, 108 453.333, 108 454.500 C 108 455.325, 108.675 456, 109.500 456 C 110.500 456, 111 455, 111 453 C 111 451, 110.500 450, 109.500 450 C 108.675 450, 108 449.325, 108 448.500 C 108 447.675, 107.325 447, 106.500 447 C 105.675 447, 105 446.325, 105 445.500 C 105 444.675, 104.325 444, 103.500 444 C 102.675 444, 102 443.325, 102 442.500 C 102 441.675, 101.325 441, 100.500 441 C 99.675 441, 99 440.325, 99 439.500 C 99 438.675, 98.325 438, 97.500 438 C 96.675 438, 96 437.325, 96 436.500 C 96 435.675, 95.325 435, 94.500 435 C 93.675 435, 93 434.325, 93 433.500 C 93 432.500, 92 432, 90 432 C 88 432, 87 431.500, 87 430.500 C 87 429.389, 85.833 429, 82.500 429 C 79.167 429, 78 428.611, 78 427.500 C 78 426.675, 77.325 426, 76.500 426 C 75.500 426, 75 427, 75 429 M 243 427.500 C 243 428.325, 242.325 429, 241.500 429 C 240.675 429, 240 429.675, 240 430.500 C 240 431.325, 240.675 432, 241.500 432 C 242.700 432, 243 433.500, 243 439.500 C 243 445.500, 242.700 447, 241.500 447 C 240.675 447, 240 447.675, 240 448.500 C 240 449.722, 238.333 450, 231 450 L 222 450 222 445.500 C 222 442.167, 221.611 441, 220.500 441 C 219.389 441, 219 439.833, 219 436.500 C 219 432.167, 218.889 432, 216 432 C 214 432, 213 432.500, 213 433.500 C 213 434.500, 212 435, 210 435 C 208 435, 207 435.500, 207 436.500 C 207 437.611, 205.833 438, 202.500 438 C 199.167 438, 198 438.389, 198 439.500 C 198 440.325, 197.325 441, 196.500 441 C 195.675 441, 195 441.675, 195 442.500 C 195 443.325, 195.675 444, 196.500 444 C 197.500 444, 198 445, 198 447 C 198 449, 198.500 450, 199.500 450 C 200.325 450, 201 450.675, 201 451.500 C 201 452.325, 201.675 453, 202.500 453 C 203.611 453, 204 454.167, 204 457.500 C 204 460.833, 203.611 462, 202.500 462 C 201.675 462, 201 462.675, 201 463.500 C 201 464.500, 200 465, 198 465 C 196 465, 195 465.500, 195 466.500 C 195 467.325, 194.325 468, 193.500 468 C 192.675 468, 192 468.675, 192 469.500 C 192 470.325, 191.325 471, 190.500 471 C 189.675 471, 189 470.325, 189 469.500 C 189 468.675, 188.325 468, 187.500 468 C 186.675 468, 186 467.325, 186 466.500 C 186 465.675, 185.325 465, 184.500 465 C 183.675 465, 183 464.325, 183 463.500 C 183 462.675, 182.325 462, 181.500 462 C 180.675 462, 180 461.325, 180 460.500 C 180 459.675, 179.325 459, 178.500 459 C 177.675 459, 177 458.325, 177 457.500 C 177 456.675, 176.325 456, 175.500 456 C 174.675 456, 174 456.675, 174 457.500 C 174 458.325, 173.325 459, 172.500 459 C 171.675 459, 171 459.675, 171 460.500 C 171 461.325, 170.325 462, 169.500 462 C 168.675 462, 168 462.675, 168 463.500 C 168 464.325, 167.325 465, 166.500 465 C 165.675 465, 165 465.675, 165 466.500 C 165 467.325, 164.325 468, 163.500 468 C 162.500 468, 162 469, 162 471 C 162 473, 162.500 474, 163.500 474 C 164.325 474, 165 474.675, 165 475.500 C 165 476.325, 165.675 477, 166.500 477 C 167.325 477, 168 477.675, 168 478.500 C 168 479.325, 168.675 480, 169.500 480 C 170.325 480, 171 480.675, 171 481.500 C 171 482.325, 171.675 483, 172.500 483 C 173.500 483, 174 484, 174 486 C 174 488, 173.500 489, 172.500 489 C 171.675 489, 171 489.675, 171 490.500 C 171 491.325, 170.325 492, 169.500 492 C 168.500 492, 168 493, 168 495 C 168 497, 167.500 498, 166.500 498 C 165.675 498, 165 498.675, 165 499.500 C 165 500.325, 164.325 501, 163.500 501 C 162.675 501, 162 500.325, 162 499.500 C 162 498.500, 161 498, 159 498 C 157 498, 156 497.500, 156 496.500 C 156 495.500, 155 495, 153 495 C 151 495, 150 494.500, 150 493.500 C 150 492.500, 149 492, 147 492 C 144.333 492, 144 492.333, 144 495 C 144 497, 143.500 498, 142.500 498 C 141.333 498, 141 499.333, 141 504 L 141 510 144 510 C 146 510, 147 510.500, 147 511.500 C 147 512.500, 148 513, 150 513 C 152 513, 153 513.500, 153 514.500 C 153 515.325, 153.675 516, 154.500 516 C 155.325 516, 156 516.675, 156 517.500 C 156 518.500, 157 519, 159 519 C 161 519, 162 519.500, 162 520.500 C 162 521.500, 163 522, 165 522 C 167 522, 168 522.500, 168 523.500 C 168 524.611, 169.167 525, 172.500 525 L 177 525 177 520.500 C 177 517.167, 177.389 516, 178.500 516 C 179.500 516, 180 515, 180 513 C 180 511, 180.500 510, 181.500 510 C 182.500 510, 183 509, 183 507 C 183 505, 183.500 504, 184.500 504 C 185.325 504, 186 503.325, 186 502.500 C 186 501.675, 186.675 501, 187.500 501 C 188.325 501, 189 500.325, 189 499.500 C 189 498.675, 189.675 498, 190.500 498 C 191.500 498, 192 497, 192 495 C 192 493, 192.500 492, 193.500 492 C 194.325 492, 195 491.325, 195 490.500 C 195 489.675, 195.675 489, 196.500 489 C 197.325 489, 198 488.325, 198 487.500 C 198 486.500, 199 486, 201 486 C 203 486, 204 485.500, 204 484.500 C 204 483.675, 204.675 483, 205.500 483 C 206.325 483, 207 482.325, 207 481.500 C 207 480.675, 207.675 480, 208.500 480 C 209.325 480, 210 479.325, 210 478.500 C 210 477.500, 211 477, 213 477 C 215 477, 216 476.500, 216 475.500 C 216 474.500, 217 474, 219 474 C 221 474, 222 473.500, 222 472.500 C 222 471.389, 223.167 471, 226.500 471 C 229.833 471, 231 470.611, 231 469.500 C 231 468.214, 234 468, 252 468 C 270 468, 273 468.214, 273 469.500 C 273 470.611, 274.167 471, 277.500 471 C 280.833 471, 282 471.389, 282 472.500 C 282 473.611, 283.167 474, 286.500 474 C 289.833 474, 291 474.389, 291 475.500 C 291 476.325, 291.675 477, 292.500 477 C 293.325 477, 294 477.675, 294 478.500 C 294 479.500, 295 480, 297 480 C 299 480, 300 480.500, 300 481.500 C 300 482.325, 300.675 483, 301.500 483 C 302.325 483, 303 483.675, 303 484.500 C 303 485.325, 303.675 486, 304.500 486 C 305.325 486, 306 486.675, 306 487.500 C 306 488.500, 307 489, 309 489 C 311.667 489, 312 489.333, 312 492 C 312 494, 312.500 495, 313.500 495 C 314.325 495, 315 495.675, 315 496.500 C 315 497.325, 315.675 498, 316.500 498 C 317.325 498, 318 498.675, 318 499.500 C 318 500.325, 318.675 501, 319.500 501 C 320.500 501, 321 502, 321 504 C 321 506, 321.500 507, 322.500 507 C 323.325 507, 324 507.675, 324 508.500 C 324 509.325, 324.675 510, 325.500 510 C 326.611 510, 327 511.167, 327 514.500 C 327 517.833, 327.389 519, 328.500 519 C 329.500 519, 330 520, 330 522 C 330 524.889, 330.167 525, 334.500 525 C 337.833 525, 339 524.611, 339 523.500 C 339 522.500, 340 522, 342 522 C 344 522, 345 521.500, 345 520.500 C 345 519.500, 346 519, 348 519 C 350 519, 351 518.500, 351 517.500 C 351 516.675, 351.675 516, 352.500 516 C 353.325 516, 354 515.325, 354 514.500 C 354 513.500, 355 513, 357 513 C 359 513, 360 512.500, 360 511.500 C 360 510.500, 361 510, 363 510 C 365.889 510, 366 509.833, 366 505.500 C 366 502.167, 365.611 501, 364.500 501 C 363.500 501, 363 500, 363 498 C 363 496, 362.500 495, 361.500 495 C 360.675 495, 360 494.325, 360 493.500 C 360 492.500, 359 492, 357 492 C 355 492, 354 492.500, 354 493.500 C 354 494.500, 353 495, 351 495 C 349 495, 348 495.500, 348 496.500 C 348 497.325, 347.325 498, 346.500 498 C 345.675 498, 345 498.675, 345 499.500 C 345 500.325, 344.325 501, 343.500 501 C 342.675 501, 342 500.325, 342 499.500 C 342 498.675, 341.325 498, 340.500 498 C 339.675 498, 339 497.325, 339 496.500 C 339 495.675, 338.325 495, 337.500 495 C 336.500 495, 336 494, 336 492 C 336 490, 335.500 489, 334.500 489 C 333.675 489, 333 488.325, 333 487.500 C 333 486.675, 332.325 486, 331.500 486 C 330.675 486, 330 485.325, 330 484.500 C 330 483.675, 330.675 483, 331.500 483 C 332.325 483, 333 482.325, 333 481.500 C 333 480.500, 334 480, 336 480 C 338 480, 339 479.500, 339 478.500 C 339 477.675, 339.675 477, 340.500 477 C 341.325 477, 342 476.325, 342 475.500 C 342 474.675, 342.675 474, 343.500 474 C 344.500 474, 345 473, 345 471 C 345 469, 344.500 468, 343.500 468 C 342.675 468, 342 467.325, 342 466.500 C 342 465.675, 341.325 465, 340.500 465 C 339.675 465, 339 464.325, 339 463.500 C 339 462.675, 338.325 462, 337.500 462 C 336.675 462, 336 461.325, 336 460.500 C 336 459.675, 335.325 459, 334.500 459 C 333.675 459, 333 458.325, 333 457.500 C 333 456.500, 332 456, 330 456 C 328 456, 327 456.500, 327 457.500 C 327 458.325, 326.325 459, 325.500 459 C 324.675 459, 324 459.675, 324 460.500 C 324 461.325, 323.325 462, 322.500 462 C 321.675 462, 321 462.675, 321 463.500 C 321 464.325, 320.325 465, 319.500 465 C 318.675 465, 318 465.675, 318 466.500 C 318 467.500, 317 468, 315 468 C 313 468, 312 467.500, 312 466.500 C 312 465.500, 311 465, 309 465 C 307 465, 306 464.500, 306 463.500 C 306 462.675, 305.325 462, 304.500 462 C 303.675 462, 303 461.325, 303 460.500 C 303 459.675, 302.325 459, 301.500 459 C 300.675 459, 300 458.325, 300 457.500 C 300 456.675, 300.675 456, 301.500 456 C 302.500 456, 303 455, 303 453 C 303 451, 303.500 450, 304.500 450 C 305.325 450, 306 449.325, 306 448.500 C 306 447.675, 306.675 447, 307.500 447 C 308.500 447, 309 446, 309 444 C 309 442, 308.500 441, 307.500 441 C 306.675 441, 306 440.325, 306 439.500 C 306 438.500, 305 438, 303 438 C 301 438, 300 437.500, 300 436.500 C 300 435.500, 299 435, 297 435 C 295 435, 294 434.500, 294 433.500 C 294 432.500, 293 432, 291 432 C 289 432, 288 432.500, 288 433.500 C 288 434.325, 287.325 435, 286.500 435 C 285.333 435, 285 436.333, 285 441 C 285 445.667, 284.667 447, 283.500 447 C 282.675 447, 282 447.675, 282 448.500 C 282 449.700, 280.500 450, 274.500 450 C 268.500 450, 267 449.700, 267 448.500 C 267 447.675, 266.325 447, 265.500 447 C 264.262 447, 264 445.167, 264 436.500 L 264 426 253.500 426 C 244.833 426, 243 426.262, 243 427.500 M 429 427.500 C 429 428.611, 427.833 429, 424.500 429 C 421.167 429, 420 429.389, 420 430.500 C 420 431.500, 419 432, 417 432 C 415 432, 414 432.500, 414 433.500 C 414 434.325, 413.325 435, 412.500 435 C 411.675 435, 411 435.675, 411 436.500 C 411 437.325, 410.325 438, 409.500 438 C 408.675 438, 408 438.675, 408 439.500 C 408 440.325, 407.325 441, 406.500 441 C 405.675 441, 405 441.675, 405 442.500 C 405 443.325, 404.325 444, 403.500 444 C 402.675 444, 402 444.675, 402 445.500 C 402 446.325, 401.325 447, 400.500 447 C 399.675 447, 399 447.675, 399 448.500 C 399 449.325, 398.325 450, 397.500 450 C 396.500 450, 396 451, 396 453 C 396 455.667, 396.333 456, 399 456 C 401 456, 402 455.500, 402 454.500 C 402 453.389, 403.167 453, 406.500 453 C 409.833 453, 411 452.611, 411 451.500 C 411 450.500, 412 450, 414 450 C 416 450, 417 449.500, 417 448.500 C 417 447.675, 417.675 447, 418.500 447 C 419.325 447, 420 446.325, 420 445.500 C 420 444.675, 420.675 444, 421.500 444 C 422.325 444, 423 443.325, 423 442.500 C 423 441.675, 423.675 441, 424.500 441 C 425.325 441, 426 440.325, 426 439.500 C 426 438.675, 426.675 438, 427.500 438 C 428.500 438, 429 437, 429 435 C 429 433, 429.500 432, 430.500 432 C 431.500 432, 432 431, 432 429 C 432 427, 431.500 426, 430.500 426 C 429.675 426, 429 426.675, 429 427.500 M 243 472.500 C 243 473.667, 241.667 474, 237 474 C 232.333 474, 231 474.333, 231 475.500 C 231 476.611, 229.833 477, 226.500 477 C 223.167 477, 222 477.389, 222 478.500 C 222 479.500, 221 480, 219 480 C 217 480, 216 480.500, 216 481.500 C 216 482.500, 215 483, 213 483 C 210.333 483, 210 483.333, 210 486 L 210 489 216 489 C 220.667 489, 222 489.333, 222 490.500 C 222 491.500, 223 492, 225 492 C 227 492, 228 492.500, 228 493.500 C 228 494.500, 229 495, 231 495 C 233 495, 234 495.500, 234 496.500 C 234 497.325, 234.675 498, 235.500 498 C 236.325 498, 237 498.675, 237 499.500 C 237 500.500, 238 501, 240 501 C 242 501, 243 501.500, 243 502.500 C 243 503.325, 243.675 504, 244.500 504 C 245.325 504, 246 504.675, 246 505.500 C 246 506.325, 246.675 507, 247.500 507 C 248.325 507, 249 507.675, 249 508.500 C 249 509.325, 249.675 510, 250.500 510 C 251.325 510, 252 510.675, 252 511.500 C 252 512.325, 252.675 513, 253.500 513 C 254.325 513, 255 512.325, 255 511.500 C 255 510.675, 255.675 510, 256.500 510 C 257.325 510, 258 509.325, 258 508.500 C 258 507.675, 258.675 507, 259.500 507 C 260.325 507, 261 506.325, 261 505.500 C 261 504.675, 261.675 504, 262.500 504 C 263.325 504, 264 503.325, 264 502.500 C 264 501.675, 264.675 501, 265.500 501 C 266.325 501, 267 500.325, 267 499.500 C 267 498.500, 268 498, 270 498 C 272 498, 273 497.500, 273 496.500 C 273 495.500, 274 495, 276 495 C 278 495, 279 494.500, 279 493.500 C 279 492.500, 280 492, 282 492 C 284 492, 285 491.500, 285 490.500 C 285 489.389, 286.167 489, 289.500 489 C 292.833 489, 294 488.611, 294 487.500 C 294 486.675, 294.675 486, 295.500 486 C 296.325 486, 297 485.325, 297 484.500 C 297 483.500, 296 483, 294 483 C 292 483, 291 482.500, 291 481.500 C 291 480.500, 290 480, 288 480 C 286 480, 285 479.500, 285 478.500 C 285 477.389, 283.833 477, 280.500 477 C 277.167 477, 276 476.611, 276 475.500 C 276 474.333, 274.667 474, 270 474 C 265.333 474, 264 473.667, 264 472.500 C 264 471.262, 262.167 471, 253.500 471 C 244.833 471, 243 471.262, 243 472.500 M 204 490.500 C 204 491.325, 203.325 492, 202.500 492 C 201.675 492, 201 492.675, 201 493.500 C 201 494.325, 200.325 495, 199.500 495 C 198.675 495, 198 495.675, 198 496.500 C 198 497.325, 197.325 498, 196.500 498 C 195.675 498, 195 498.675, 195 499.500 C 195 500.611, 196.167 501, 199.500 501 C 202.833 501, 204 501.389, 204 502.500 C 204 503.667, 205.333 504, 210 504 C 214.667 504, 216 504.333, 216 505.500 C 216 506.611, 217.167 507, 220.500 507 C 223.833 507, 225 507.389, 225 508.500 C 225 509.500, 226 510, 228 510 C 230 510, 231 510.500, 231 511.500 C 231 512.500, 232 513, 234 513 C 236 513, 237 513.500, 237 514.500 C 237 515.325, 237.675 516, 238.500 516 C 239.325 516, 240 516.675, 240 517.500 C 240 518.500, 241 519, 243 519 C 245 519, 246 519.500, 246 520.500 C 246 521.325, 246.675 522, 247.500 522 C 248.325 522, 249 522.675, 249 523.500 C 249 524.325, 249.675 525, 250.500 525 C 251.325 525, 252 525.675, 252 526.500 C 252 527.325, 252.675 528, 253.500 528 C 254.325 528, 255 527.325, 255 526.500 C 255 525.675, 255.675 525, 256.500 525 C 257.325 525, 258 524.325, 258 523.500 C 258 522.675, 258.675 522, 259.500 522 C 260.325 522, 261 521.325, 261 520.500 C 261 519.675, 261.675 519, 262.500 519 C 263.325 519, 264 518.325, 264 517.500 C 264 516.500, 265 516, 267 516 C 269 516, 270 515.500, 270 514.500 C 270 513.500, 271 513, 273 513 C 275 513, 276 512.500, 276 511.500 C 276 510.500, 277 510, 279 510 C 281 510, 282 509.500, 282 508.500 C 282 507.500, 283 507, 285 507 C 287 507, 288 506.500, 288 505.500 C 288 504.300, 289.500 504, 295.500 504 C 301.500 504, 303 503.700, 303 502.500 C 303 501.389, 304.167 501, 307.500 501 C 310.833 501, 312 500.611, 312 499.500 C 312 498.675, 311.325 498, 310.500 498 C 309.675 498, 309 497.325, 309 496.500 C 309 495.675, 308.325 495, 307.500 495 C 306.675 495, 306 494.325, 306 493.500 C 306 492.675, 305.325 492, 304.500 492 C 303.675 492, 303 491.325, 303 490.500 C 303 489.675, 302.325 489, 301.500 489 C 300.675 489, 300 489.675, 300 490.500 C 300 491.667, 298.667 492, 294 492 C 289.333 492, 288 492.333, 288 493.500 C 288 494.500, 287 495, 285 495 C 283 495, 282 495.500, 282 496.500 C 282 497.500, 281 498, 279 498 C 277 498, 276 498.500, 276 499.500 C 276 500.500, 275 501, 273 501 C 271 501, 270 501.500, 270 502.500 C 270 503.325, 269.325 504, 268.500 504 C 267.675 504, 267 504.675, 267 505.500 C 267 506.325, 266.325 507, 265.500 507 C 264.675 507, 264 507.675, 264 508.500 C 264 509.325, 263.325 510, 262.500 510 C 261.675 510, 261 510.675, 261 511.500 C 261 512.325, 260.325 513, 259.500 513 C 258.675 513, 258 513.675, 258 514.500 C 258 515.325, 257.325 516, 256.500 516 C 255.675 516, 255 516.675, 255 517.500 C 255 518.325, 254.325 519, 253.500 519 C 252.675 519, 252 518.325, 252 517.500 C 252 516.675, 251.325 516, 250.500 516 C 249.675 516, 249 515.325, 249 514.500 C 249 513.675, 248.325 513, 247.500 513 C 246.675 513, 246 512.325, 246 511.500 C 246 510.675, 245.325 510, 244.500 510 C 243.675 510, 243 509.325, 243 508.500 C 243 507.675, 242.325 507, 241.500 507 C 240.675 507, 240 506.325, 240 505.500 C 240 504.500, 239 504, 237 504 C 235 504, 234 503.500, 234 502.500 C 234 501.675, 233.325 501, 232.500 501 C 231.675 501, 231 500.325, 231 499.500 C 231 498.500, 230 498, 228 498 C 226 498, 225 497.500, 225 496.500 C 225 495.389, 223.833 495, 220.500 495 C 217.167 495, 216 494.611, 216 493.500 C 216 492.389, 214.833 492, 211.500 492 C 208.167 492, 207 491.611, 207 490.500 C 207 489.675, 206.325 489, 205.500 489 C 204.675 489, 204 489.675, 204 490.500 M 192 505.500 C 192 506.325, 191.325 507, 190.500 507 C 189.675 507, 189 507.675, 189 508.500 C 189 509.325, 188.325 510, 187.500 510 C 186.389 510, 186 511.167, 186 514.500 L 186 519 196.500 519 C 205.167 519, 207 519.262, 207 520.500 C 207 521.667, 208.333 522, 213 522 C 217.667 522, 219 522.333, 219 523.500 C 219 524.611, 220.167 525, 223.500 525 C 226.833 525, 228 525.389, 228 526.500 C 228 527.500, 229 528, 231 528 C 233 528, 234 528.500, 234 529.500 C 234 530.500, 235 531, 237 531 C 239 531, 240 531.500, 240 532.500 C 240 533.325, 240.675 534, 241.500 534 C 242.325 534, 243 534.675, 243 535.500 C 243 536.500, 244 537, 246 537 C 248 537, 249 537.500, 249 538.500 C 249 539.325, 249.675 540, 250.500 540 C 251.325 540, 252 540.675, 252 541.500 C 252 542.325, 252.675 543, 253.500 543 C 254.325 543, 255 542.325, 255 541.500 C 255 540.675, 255.675 540, 256.500 540 C 257.325 540, 258 539.325, 258 538.500 C 258 537.500, 259 537, 261 537 C 263 537, 264 536.500, 264 535.500 C 264 534.675, 264.675 534, 265.500 534 C 266.325 534, 267 533.325, 267 532.500 C 267 531.500, 268 531, 270 531 C 272 531, 273 530.500, 273 529.500 C 273 528.500, 274 528, 276 528 C 278 528, 279 527.500, 279 526.500 C 279 525.389, 280.167 525, 283.500 525 C 286.833 525, 288 524.611, 288 523.500 C 288 522.389, 289.167 522, 292.500 522 C 295.833 522, 297 521.611, 297 520.500 C 297 519.250, 299 519, 309 519 L 321 519 321 514.500 C 321 511.167, 320.611 510, 319.500 510 C 318.675 510, 318 509.325, 318 508.500 C 318 507.675, 317.325 507, 316.500 507 C 315.675 507, 315 506.325, 315 505.500 C 315 504.675, 314.325 504, 313.500 504 C 312.675 504, 312 504.675, 312 505.500 C 312 506.700, 310.500 507, 304.500 507 C 298.500 507, 297 507.300, 297 508.500 C 297 509.667, 295.667 510, 291 510 C 286.333 510, 285 510.333, 285 511.500 C 285 512.500, 284 513, 282 513 C 280 513, 279 513.500, 279 514.500 C 279 515.500, 278 516, 276 516 C 274 516, 273 516.500, 273 517.500 C 273 518.325, 272.325 519, 271.500 519 C 270.675 519, 270 519.675, 270 520.500 C 270 521.500, 269 522, 267 522 C 265 522, 264 522.500, 264 523.500 C 264 524.325, 263.325 525, 262.500 525 C 261.675 525, 261 525.675, 261 526.500 C 261 527.325, 260.325 528, 259.500 528 C 258.675 528, 258 528.675, 258 529.500 C 258 530.325, 257.325 531, 256.500 531 C 255.675 531, 255 531.675, 255 532.500 C 255 533.500, 254 534, 252 534 C 249.333 534, 249 533.667, 249 531 C 249 529, 248.500 528, 247.500 528 C 246.675 528, 246 527.325, 246 526.500 C 246 525.500, 245 525, 243 525 C 241 525, 240 524.500, 240 523.500 C 240 522.675, 239.325 522, 238.500 522 C 237.675 522, 237 521.325, 237 520.500 C 237 519.500, 236 519, 234 519 C 232 519, 231 518.500, 231 517.500 C 231 516.675, 230.325 516, 229.500 516 C 228.675 516, 228 515.325, 228 514.500 C 228 513.389, 226.833 513, 223.500 513 C 220.167 513, 219 512.611, 219 511.500 C 219 510.389, 217.833 510, 214.500 510 C 211.167 510, 210 509.611, 210 508.500 C 210 507.300, 208.500 507, 202.500 507 C 196.500 507, 195 506.700, 195 505.500 C 195 504.675, 194.325 504, 193.500 504 C 192.675 504, 192 504.675, 192 505.500 M 180 526.500 C 180 530.833, 180.111 531, 183 531 C 185 531, 186 531.500, 186 532.500 C 186 533.500, 187 534, 189 534 C 191 534, 192 534.500, 192 535.500 C 192 536.500, 193 537, 195 537 C 197 537, 198 537.500, 198 538.500 C 198 539.500, 199 540, 201 540 C 203 540, 204 540.500, 204 541.500 C 204 542.611, 205.167 543, 208.500 543 C 211.833 543, 213 543.389, 213 544.500 C 213 545.500, 214 546, 216 546 C 218 546, 219 546.500, 219 547.500 C 219 548.500, 220 549, 222 549 C 224 549, 225 549.500, 225 550.500 C 225 551.611, 226.167 552, 229.500 552 C 232.833 552, 234 552.389, 234 553.500 C 234 554.500, 235 555, 237 555 C 239 555, 240 555.500, 240 556.500 C 240 557.611, 241.167 558, 244.500 558 C 247.833 558, 249 558.389, 249 559.500 C 249 560.611, 250.167 561, 253.500 561 C 256.833 561, 258 560.611, 258 559.500 C 258 558.500, 259 558, 261 558 C 263 558, 264 557.500, 264 556.500 C 264 555.389, 265.167 555, 268.500 555 C 271.833 555, 273 554.611, 273 553.500 C 273 552.500, 274 552, 276 552 C 278 552, 279 551.500, 279 550.500 C 279 549.389, 280.167 549, 283.500 549 C 286.833 549, 288 548.611, 288 547.500 C 288 546.500, 289 546, 291 546 C 293 546, 294 545.500, 294 544.500 C 294 543.500, 295 543, 297 543 C 299 543, 300 542.500, 300 541.500 C 300 540.389, 301.167 540, 304.500 540 C 307.833 540, 309 539.611, 309 538.500 C 309 537.500, 310 537, 312 537 C 314 537, 315 536.500, 315 535.500 C 315 534.500, 316 534, 318 534 C 320 534, 321 533.500, 321 532.500 C 321 531.675, 321.675 531, 322.500 531 C 323.325 531, 324 530.325, 324 529.500 C 324 528.675, 324.675 528, 325.500 528 C 326.325 528, 327 527.325, 327 526.500 C 327 525.675, 326.325 525, 325.500 525 C 324.675 525, 324 524.325, 324 523.500 C 324 522.278, 322.333 522, 315 522 C 307.667 522, 306 522.278, 306 523.500 C 306 524.700, 304.500 525, 298.500 525 C 292.500 525, 291 525.300, 291 526.500 C 291 527.611, 289.833 528, 286.500 528 C 283.167 528, 282 528.389, 282 529.500 C 282 530.500, 281 531, 279 531 C 277 531, 276 531.500, 276 532.500 C 276 533.500, 275 534, 273 534 C 271 534, 270 534.500, 270 535.500 C 270 536.325, 269.325 537, 268.500 537 C 267.675 537, 267 537.675, 267 538.500 C 267 539.325, 266.325 540, 265.500 540 C 264.675 540, 264 540.675, 264 541.500 C 264 542.325, 263.325 543, 262.500 543 C 261.389 543, 261 544.167, 261 547.500 L 261 552 253.500 552 C 247.500 552, 246 551.700, 246 550.500 C 246 549.675, 245.325 549, 244.500 549 C 243.389 549, 243 547.833, 243 544.500 C 243 541.167, 242.611 540, 241.500 540 C 240.675 540, 240 539.325, 240 538.500 C 240 537.500, 239 537, 237 537 C 235 537, 234 536.500, 234 535.500 C 234 534.675, 233.325 534, 232.500 534 C 231.675 534, 231 533.325, 231 532.500 C 231 531.389, 229.833 531, 226.500 531 C 223.167 531, 222 530.611, 222 529.500 C 222 528.389, 220.833 528, 217.500 528 C 214.167 528, 213 527.611, 213 526.500 C 213 525.333, 211.667 525, 207 525 C 202.333 525, 201 524.667, 201 523.500 C 201 522.262, 199.167 522, 190.500 522 L 180 522 180 526.500\" stroke=\"none\" fill=\"currentColor\" fill-rule=\"evenodd\"/>\n</svg>";
const nameSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1020\" height=\"250\" viewBox=\"0 0 1020 250\" version=\"1.1\">\n\t<path d=\"M 956.250 14.525 C 954.601 16.287, 954 18.139, 954 21.464 C 954 23.959, 953.550 26, 953 26 C 952.450 26, 952 26.719, 952 27.599 C 952 28.478, 950.650 30.459, 949 32 C 947.350 33.541, 946 35.522, 946 36.401 C 946 37.281, 945.550 38, 945 38 C 944.450 38, 944 39.350, 944 41 C 944 43.039, 944.495 44, 945.545 44 C 947.662 44, 952.814 49.229, 951.222 49.759 C 949.764 50.245, 949.560 56, 951 56 C 952.518 56, 952.195 60.948, 950.571 62.571 C 949.786 63.357, 948.190 64, 947.026 64 C 945.862 64, 943.805 65.105, 942.455 66.455 C 940.439 68.470, 940 69.900, 940 74.455 L 940 80 944 80 C 946.200 80, 948 79.550, 948 79 C 948 78.450, 948.900 78, 950 78 C 951.556 78, 952 78.667, 952 81 C 952 82.650, 951.550 84, 951 84 C 950.450 84, 950 84.707, 950 85.571 C 950 87.499, 947.623 90, 945.792 90 C 945.049 90, 943.793 90.900, 943 92 C 942.207 93.100, 940.758 94, 939.779 94 C 938.801 94, 938 94.450, 938 95 C 938 95.550, 937.100 96, 936 96 C 934.900 96, 934 95.550, 934 95 C 934 94.450, 934.450 94, 935 94 C 935.611 94, 936 89.333, 936 82 C 936 74.667, 936.389 70, 937 70 C 937.593 70, 938 66.333, 938 61 C 938 55.667, 938.407 52, 939 52 C 940.589 52, 940.216 41.073, 938.571 39.429 C 936.956 37.813, 930 37.466, 930 39 C 930 39.550, 929.305 40, 928.455 40 C 927.605 40, 925.805 41.105, 924.455 42.455 C 922.282 44.627, 922 45.777, 922 52.455 C 922 56.818, 921.578 60, 921 60 C 920.381 60, 920 65.333, 920 74 C 920 82.667, 919.619 88, 919 88 C 917.466 88, 917.813 94.956, 919.429 96.571 C 920.214 97.357, 921.564 98, 922.429 98 C 923.293 98, 924 98.450, 924 99 C 924 99.550, 925.350 100, 927 100 C 928.650 100, 930 100.257, 930 100.571 C 930 101.594, 927.174 104, 925.973 104 C 925.329 104, 923.541 105.350, 922 107 C 920.459 108.650, 918.478 110, 917.599 110 C 916.719 110, 916 110.450, 916 111 C 916 111.550, 914.749 112, 913.221 112 C 911.589 112, 909.847 112.826, 909 114 C 908.207 115.100, 906.758 116, 905.779 116 C 904.801 116, 904 116.450, 904 117 C 904 117.550, 903.100 118, 902 118 C 900.373 118, 900 118.667, 900 121.571 C 900 126.722, 901.795 128, 909.027 128 C 914.594 128, 915.472 127.706, 918 125 C 919.541 123.350, 921.791 122, 923 122 C 924.209 122, 926.459 120.650, 928 119 C 929.541 117.350, 931.522 116, 932.401 116 C 933.281 116, 934 115.550, 934 115 C 934 114.450, 934.900 114, 936 114 C 937.100 114, 938 113.550, 938 113 C 938 112.450, 938.801 112, 939.779 112 C 940.758 112, 942.207 111.100, 943 110 C 943.847 108.826, 945.589 108, 947.221 108 C 948.749 108, 950 107.550, 950 107 C 950 106.450, 951.350 106, 953 106 C 954.650 106, 956 105.550, 956 105 C 956 104.450, 957.350 104, 959 104 C 960.650 104, 962 103.550, 962 103 C 962 102.444, 964.667 102, 968 102 C 971.333 102, 974 101.556, 974 101 C 974 99.278, 990.888 99.746, 992.659 101.517 C 994.015 102.872, 993.848 103.340, 991.088 105.918 C 989.390 107.504, 988 109.522, 988 110.401 C 988 111.333, 987.166 112, 986 112 C 984.834 112, 984 112.667, 984 113.599 C 984 114.478, 982.650 116.459, 981 118 C 979.350 119.541, 978 121.779, 978 122.973 C 978 125.597, 981.119 129.144, 981.753 127.241 C 981.981 126.558, 983.479 126, 985.083 126 C 986.688 126, 988 125.550, 988 125 C 988 124.450, 988.900 124, 990 124 C 991.100 124, 992 123.550, 992 123 C 992 122.450, 992.685 122, 993.522 122 C 994.359 122, 997.509 119.535, 1000.522 116.522 C 1005.544 111.499, 1006 110.667, 1006 106.522 C 1006 104.035, 1006.450 102, 1007 102 C 1007.550 102, 1008 100.863, 1008 99.474 C 1008 96.029, 999.971 88, 996.526 88 C 995.137 88, 994 87.550, 994 87 C 994 86.450, 992.650 86, 991 86 C 989.350 86, 988 86.450, 988 87 C 988 87.550, 987.100 88, 986 88 C 984.900 88, 984 87.550, 984 87 C 984 86.444, 981.333 86, 978 86 C 974.667 86, 972 86.444, 972 87 C 972 87.550, 969.750 88, 967 88 C 961.604 88, 960.864 87.260, 964 85 C 965.597 83.849, 966 82.411, 966 77.863 C 966 74.217, 965.553 72.018, 964.759 71.753 C 963.204 71.235, 966.176 68, 968.208 68 C 968.951 68, 970.207 67.100, 971 66 C 971.793 64.900, 973.049 64, 973.792 64 C 975.825 64, 978 61.416, 978 59 C 978 55.416, 975.613 54, 969.571 54 C 966.507 54, 964 54.450, 964 55 C 964 55.550, 963.100 56, 962 56 C 960.444 56, 960 55.333, 960 53 C 960 51.350, 960.450 50, 961 50 C 961.550 50, 962 49.100, 962 48 C 962 46.900, 962.450 46, 963 46 C 963.550 46, 964 45.281, 964 44.401 C 964 43.522, 965.350 41.541, 967 40 C 968.650 38.459, 970 36.577, 970 35.820 C 970 35.062, 970.900 33.793, 972 33 C 974.692 31.059, 974.753 26, 972.083 26 C 971.029 26, 969.938 25.438, 969.659 24.750 C 969.270 23.791, 968.923 23.829, 968.167 24.912 C 967.328 26.115, 966.946 26.089, 965.591 24.734 C 963.843 22.986, 963.406 18, 965 18 C 966.485 18, 966.210 15.067, 964.571 13.429 C 962.459 11.316, 958.804 11.798, 956.250 14.525 M 426.250 22.525 C 425.012 23.847, 424 25.620, 424 26.464 C 424 27.309, 423.550 28, 423 28 C 422.450 28, 422 29.800, 422 32 C 422 34.200, 422.450 36, 423 36 C 423.550 36, 424 36.900, 424 38 C 424 39.152, 423.333 40, 422.429 40 C 420.610 40, 418 37.658, 418 36.026 C 418 35.412, 416.895 33.805, 415.545 32.455 C 413.659 30.568, 412.038 30, 408.545 30 C 406.045 30, 404 30.450, 404 31 C 404 31.550, 403.293 32, 402.429 32 C 399.255 32, 398 34.672, 398 41.429 C 398 45.143, 398.435 48, 399 48 C 399.550 48, 400 48.900, 400 50 C 400 51.100, 399.550 52, 399 52 C 398.450 52, 398 53.350, 398 55 C 398 57.333, 397.556 58, 396 58 C 394.900 58, 394 58.450, 394 59 C 394 59.550, 393.199 60, 392.221 60 C 391.242 60, 389.793 60.900, 389 62 C 388.207 63.100, 386.512 64, 385.234 64 C 382.146 64, 378 68.272, 378 71.455 C 378 72.855, 377.550 74, 377 74 C 376.381 74, 376 79.333, 376 88 C 376 96.667, 376.381 102, 377 102 C 377.550 102, 378 102.695, 378 103.545 C 378 106.404, 382.664 110, 386.371 110 C 388.275 110, 390.035 109.437, 390.282 108.750 C 390.586 107.902, 391.375 108.224, 392.733 109.750 C 394.264 111.471, 395.823 112, 399.367 112 C 401.915 112, 404 112.450, 404 113 C 404 113.550, 402.650 114, 401 114 C 399.350 114, 398 114.450, 398 115 C 398 115.550, 397.293 116, 396.429 116 C 393.919 116, 392 118.600, 392 122 C 392 125.813, 393.979 128, 397.429 128 C 401.187 128, 400.675 130.508, 396 135 C 393.800 137.114, 392 139.454, 392 140.201 C 392 140.948, 391.100 142.207, 390 143 C 388.900 143.793, 388 145.242, 388 146.221 C 388 147.199, 387.550 148, 387 148 C 386.450 148, 386 148.801, 386 149.779 C 386 150.758, 385.100 152.207, 384 153 C 382.900 153.793, 382 155.242, 382 156.221 C 382 157.199, 381.550 158, 381 158 C 380.450 158, 380 158.900, 380 160 C 380 161.100, 379.550 162, 379 162 C 378.450 162, 378 162.900, 378 164 C 378 165.100, 377.550 166, 377 166 C 376.450 166, 376 166.900, 376 168 C 376 169.100, 375.550 170, 375 170 C 374.450 170, 374 170.900, 374 172 C 374 173.100, 373.550 174, 373 174 C 372.450 174, 372 175.350, 372 177 C 372 178.650, 371.550 180, 371 180 C 370.450 180, 370 180.900, 370 182 C 370 183.100, 369.550 184, 369 184 C 368.450 184, 368 184.900, 368 186 C 368 187.100, 367.550 188, 367 188 C 366.450 188, 366 189.762, 366 191.917 C 366 194.146, 365.465 196.012, 364.759 196.247 C 363.888 196.537, 364.087 197.230, 365.429 198.571 C 366.770 199.913, 367.463 200.112, 367.753 199.241 C 368 198.499, 369.970 198, 372.655 198 C 378.097 198, 380 196.334, 380 191.571 C 380 189.607, 380.450 188, 381 188 C 381.550 188, 382 186.650, 382 185 C 382 183.350, 382.450 182, 383 182 C 383.550 182, 384 181.100, 384 180 C 384 178.900, 384.450 178, 385 178 C 385.550 178, 386 177.293, 386 176.429 C 386 175.564, 386.643 174.214, 387.429 173.429 C 389.067 171.790, 392 171.515, 392 173 C 392 173.556, 394.667 174, 398 174 C 401.333 174, 404 173.556, 404 173 C 404 172.450, 405.350 172, 407 172 C 408.650 172, 410 171.550, 410 171 C 410 170.450, 410.900 170, 412 170 C 413.333 170, 414 170.667, 414 172 C 414 173.100, 413.550 174, 413 174 C 412.450 174, 412 175.350, 412 177 C 412 178.650, 411.550 180, 411 180 C 410.450 180, 410 181.350, 410 183 C 410 184.650, 409.550 186, 409 186 C 408.450 186, 408 187.800, 408 190 C 408 192.200, 407.550 194, 407 194 C 406.417 194, 406 197.333, 406 202 C 406 206.667, 405.583 210, 405 210 C 404.444 210, 404 212.667, 404 216 C 404 219.333, 404.444 222, 405 222 C 405.550 222, 406 223.157, 406 224.571 C 406 227.426, 408.060 230, 410.345 230 C 411.164 230, 412.015 230.546, 412.237 231.212 C 412.759 232.777, 420 225.614, 420 223.533 C 420 222.690, 419.550 222, 419 222 C 418.450 222, 418 222.450, 418 223 C 418 224.518, 413.052 224.195, 411.429 222.571 C 409.805 220.948, 409.482 216, 411 216 C 411.550 216, 412 213.750, 412 211 C 412 208.250, 412.450 206, 413 206 C 413.550 206, 414 203.750, 414 201 C 414 198.250, 414.450 196, 415 196 C 415.550 196, 416 194.200, 416 192 C 416 189.800, 416.450 188, 417 188 C 417.550 188, 418 186.650, 418 185 C 418 183.350, 418.450 182, 419 182 C 419.550 182, 420 180.650, 420 179 C 420 177.350, 420.450 176, 421 176 C 421.550 176, 422 174.650, 422 173 C 422 171.350, 422.450 170, 423 170 C 423.550 170, 424 168.650, 424 167 C 424 164.333, 424.333 164, 427 164 C 428.650 164, 430 163.550, 430 163 C 430 162.450, 431.350 162, 433 162 C 434.650 162, 436 161.550, 436 161 C 436 160.450, 437.350 160, 439 160 C 440.650 160, 442 159.550, 442 159 C 442 158.450, 443.350 158, 445 158 C 446.650 158, 448 157.550, 448 157 C 448 156.450, 449.140 156, 450.533 156 C 453.370 156, 461.279 148.926, 459.212 148.237 C 458.546 148.015, 458 147.164, 458 146.345 C 458 143.613, 455.243 142, 450.571 142 C 448.057 142, 446 142.450, 446 143 C 446 143.550, 445.100 144, 444 144 C 442.900 144, 442 144.450, 442 145 C 442 145.550, 441.100 146, 440 146 C 438.900 146, 438 146.450, 438 147 C 438 147.550, 437.100 148, 436 148 C 434.900 148, 434 148.450, 434 149 C 434 149.550, 432.650 150, 431 150 C 429.350 150, 428 150.450, 428 151 C 428 151.550, 427.100 152, 426 152 C 424.900 152, 424 152.450, 424 153 C 424 153.550, 422.650 154, 421 154 C 419.350 154, 418 154.450, 418 155 C 418 155.550, 417.100 156, 416 156 C 414.900 156, 414 156.450, 414 157 C 414 157.550, 412.650 158, 411 158 C 409.350 158, 408 157.731, 408 157.401 C 408 157.072, 409.350 155.541, 411 154 C 412.650 152.459, 414 150.683, 414 150.053 C 414 148.370, 418.660 144, 420.455 144 C 421.305 144, 422 144.450, 422 145 C 422 145.550, 424.040 146, 426.533 146 C 430.373 146, 431.597 145.469, 434.533 142.533 C 436.440 140.627, 438 138.414, 438 137.617 C 438 136.819, 438.563 135.904, 439.250 135.583 C 440.250 135.117, 440.250 134.883, 439.250 134.417 C 438.563 134.096, 438 133.164, 438 132.345 C 438 130.396, 435.558 128, 433.571 128 C 432.707 128, 432 127.550, 432 127 C 432 126.450, 430.200 126, 428 126 C 424.667 126, 424 125.667, 424 124 C 424 122.749, 424.667 122, 425.779 122 C 426.758 122, 428.207 121.100, 429 120 C 429.793 118.900, 431.049 118, 431.792 118 C 436.727 118, 437.462 110.169, 432.925 105.930 L 429.851 103.058 432.380 100.529 C 433.771 99.138, 435.605 98, 436.455 98 C 437.305 98, 438 97.550, 438 97 C 438 96.450, 439.350 96, 441 96 C 442.650 96, 444 95.550, 444 95 C 444 94.450, 444.900 94, 446 94 C 447.100 94, 448 93.550, 448 93 C 448 92.450, 448.685 92, 449.522 92 C 452.140 92, 462 81.350, 462 78.522 C 462 77.135, 462.450 76, 463 76 C 463.583 76, 464 72.667, 464 68 C 464 63.333, 463.583 60, 463 60 C 462.450 60, 462 58.650, 462 57 C 462 55.350, 461.550 54, 461 54 C 460.450 54, 460 53.100, 460 52 C 460 50.900, 459.550 50, 459 50 C 458.450 50, 458 49.305, 458 48.455 C 458 46.454, 453.546 42, 451.545 42 C 450.695 42, 450 41.550, 450 41 C 450 40.450, 448.200 40, 446 40 C 443.800 40, 442 39.550, 442 39 C 442 38.450, 441.100 38, 440 38 C 438.444 38, 438 37.333, 438 35 C 438 33.350, 438.450 32, 439 32 C 439.550 32, 440 30.855, 440 29.455 C 440 26.648, 435.975 22, 433.545 22 C 432.695 22, 432 21.550, 432 21 C 432 19.169, 428.531 20.090, 426.250 22.525 M 65.250 33.496 C 64.563 34.277, 64 35.610, 64 36.458 C 64 37.306, 63.550 38, 63 38 C 62.381 38, 62 43.333, 62 52 C 62 60.667, 61.619 66, 61 66 C 60.450 66, 60 66.900, 60 68 C 60 69.251, 59.333 70, 58.221 70 C 57.242 70, 55.793 70.900, 55 72 C 54.207 73.100, 52.968 74, 52.246 74 C 51.524 74, 49.373 75.560, 47.467 77.467 C 44.417 80.517, 44 81.547, 44 86.038 C 44 89.129, 44.564 91.706, 45.429 92.571 C 47.094 94.237, 60 94.616, 60 93 C 60 92.450, 60.450 92, 61 92 C 61.604 92, 62 96.190, 62 102.571 C 62 113.472, 61.166 116, 57.571 116 C 56.707 116, 56 116.450, 56 117 C 56 117.550, 55.100 118, 54 118 C 52.900 118, 52 118.450, 52 119 C 52 119.550, 51.100 120, 50 120 C 48.900 120, 48 120.450, 48 121 C 48 121.550, 47.199 122, 46.221 122 C 45.242 122, 43.793 122.900, 43 124 C 40.663 127.242, 40 126.358, 40 120 C 40 116.667, 39.556 114, 39 114 C 38.450 114, 38 112.200, 38 110 C 38 107.800, 37.550 106, 37 106 C 36.450 106, 36 105.305, 36 104.455 C 36 102.454, 31.546 98, 29.545 98 C 28.695 98, 28 97.550, 28 97 C 28 96.450, 26.650 96, 25 96 C 23.350 96, 22 96.450, 22 97 C 22 97.550, 21.293 98, 20.429 98 C 18.408 98, 16 100.408, 16 102.429 C 16 103.293, 15.550 104, 15 104 C 14.450 104, 14 105.350, 14 107 C 14 108.650, 13.550 110, 13 110 C 12.450 110, 12 111.350, 12 113 C 12 114.650, 12.450 116, 13 116 C 13.571 116, 14 119, 14 123 C 14 127, 14.429 130, 15 130 C 15.550 130, 16 130.695, 16 131.545 C 16 133.546, 20.454 138, 22.455 138 C 23.305 138, 24 138.450, 24 139 C 24 139.550, 26.250 140, 29 140 C 31.750 140, 34 139.550, 34 139 C 34 138.450, 34.900 138, 36 138 C 37.100 138, 38 137.550, 38 137 C 38 136.394, 42.333 136, 49 136 L 60 136 60 174 C 60 198.667, 60.351 212, 61 212 C 61.550 212, 62 214.250, 62 217 C 62 219.750, 62.450 222, 63 222 C 63.550 222, 64 223.350, 64 225 C 64 226.650, 64.450 228, 65 228 C 65.550 228, 66 229.607, 66 231.571 C 66 233.536, 66.675 235.818, 67.500 236.643 C 69.872 239.015, 72 236.144, 72 230.571 C 72 228.057, 72.450 226, 73 226 C 73.571 226, 74 223, 74 219 C 74 215, 74.429 212, 75 212 C 75.550 212, 76 210.200, 76 208 C 76 205.800, 76.450 204, 77 204 C 77.648 204, 78 191.667, 78 169 C 78 146.333, 78.352 134, 79 134 C 79.550 134, 80 133.100, 80 132 C 80 130.667, 80.667 130, 82 130 C 83.100 130, 84 129.550, 84 129 C 84 128.444, 86.667 128, 90 128 C 93.333 128, 96 127.556, 96 127 C 96 126.450, 96.900 126, 98 126 C 99.623 126, 100 125.333, 100 122.467 C 100 119.768, 100.819 118.114, 103.467 115.467 C 105.373 113.560, 107.410 112, 107.993 112 C 109.513 112, 118 103.304, 118 101.747 C 118 101.029, 118.900 99.793, 120 99 C 121.100 98.207, 122 96.758, 122 95.779 C 122 94.801, 122.450 94, 123 94 C 123.550 94, 124 93.100, 124 92 C 124 90.900, 124.450 90, 125 90 C 125.550 90, 126 89.100, 126 88 C 126 86.900, 126.450 86, 127 86 C 127.550 86, 128 84.650, 128 83 C 128 81.350, 128.450 80, 129 80 C 129.551 80, 130 77.407, 130 74.221 C 130 69.589, 129.603 68.155, 128 67 C 126.900 66.207, 126 64.951, 126 64.208 C 126 62.467, 123.533 60, 121.792 60 C 121.049 60, 119.793 59.100, 119 58 C 118.207 56.900, 116.758 56, 115.779 56 C 114.801 56, 114 55.550, 114 55 C 114 54.389, 109.333 54, 102 54 C 94.667 54, 90 54.389, 90 55 C 90 55.550, 88.650 56, 87 56 C 85.350 56, 84 56.450, 84 57 C 84 57.550, 83.100 58, 82 58 C 80.190 58, 80 57.333, 80 51 C 80 47, 80.429 44, 81 44 C 81.550 44, 82 42.650, 82 41 C 82 39.350, 81.550 38, 81 38 C 80.450 38, 80 37.293, 80 36.429 C 80 35.564, 79.357 34.214, 78.571 33.429 C 76.666 31.523, 66.943 31.573, 65.250 33.496 M 584 33 C 584 33.550, 583.293 34, 582.429 34 C 580.408 34, 578 36.408, 578 38.429 C 578 39.293, 577.550 40, 577 40 C 576.429 40, 576 43, 576 47 C 576 51, 576.429 54, 577 54 C 577.550 54, 578 55.800, 578 58 C 578 60.200, 578.450 62, 579 62 C 580.499 62, 580.264 73.710, 578.750 74.417 C 577.750 74.883, 577.750 75.117, 578.750 75.583 C 579.438 75.904, 580 77.286, 580 78.655 C 580 80.023, 580.643 81.786, 581.429 82.571 C 583.044 84.187, 590 84.534, 590 83 C 590 82.450, 590.900 82, 592 82 C 593.100 82, 594 81.550, 594 81 C 594 80.450, 594.450 80, 595 80 C 596.485 80, 596.210 82.933, 594.571 84.571 C 593.786 85.357, 592.436 86, 591.571 86 C 590.707 86, 590 86.450, 590 87 C 590 87.550, 589.100 88, 588 88 C 586.900 88, 586 88.450, 586 89 C 586 89.550, 585.199 90, 584.221 90 C 583.242 90, 581.793 90.900, 581 92 C 580.207 93.100, 578.758 94, 577.779 94 C 576.801 94, 576 94.450, 576 95 C 576 95.550, 574.650 96, 573 96 C 571.350 96, 570 96.450, 570 97 C 570 97.550, 568.650 98, 567 98 C 565.350 98, 564 98.450, 564 99 C 564 99.550, 563.100 100, 562 100 C 560.900 100, 560 100.450, 560 101 C 560 101.550, 559.100 102, 558 102 C 556.900 102, 556 102.450, 556 103 C 556 103.550, 554.749 104, 553.221 104 C 551.589 104, 549.847 104.826, 549 106 C 548.207 107.100, 546.758 108, 545.779 108 C 544.801 108, 544 108.450, 544 109 C 544 109.550, 542.749 110, 541.221 110 C 539.589 110, 537.847 110.826, 537 112 C 536.207 113.100, 534.758 114, 533.779 114 C 532.801 114, 532 114.450, 532 115 C 532 115.550, 531.100 116, 530 116 C 528.900 116, 528 116.450, 528 117 C 528 117.550, 526.650 118, 525 118 C 523.350 118, 522 118.450, 522 119 C 522 119.550, 520.843 120, 519.429 120 C 515.870 120, 514 122.214, 514 126.429 C 514 129.333, 514.373 130, 516 130 C 517.100 130, 518 130.450, 518 131 C 518 131.550, 520.250 132, 523 132 C 526.879 132, 528 131.648, 528 130.429 C 528 128.501, 530.377 126, 532.208 126 C 532.951 126, 534.207 125.100, 535 124 C 535.793 122.900, 537.242 122, 538.221 122 C 539.199 122, 540 121.550, 540 121 C 540 120.450, 540.900 120, 542 120 C 543.100 120, 544 119.550, 544 119 C 544 118.450, 544.900 118, 546 118 C 547.100 118, 548 117.550, 548 117 C 548 116.450, 548.900 116, 550 116 C 551.100 116, 552 115.550, 552 115 C 552 114.450, 552.900 114, 554 114 C 555.100 114, 556 113.550, 556 113 C 556 112.450, 557.350 112, 559 112 C 560.650 112, 562 111.550, 562 111 C 562 110.450, 563.350 110, 565 110 C 566.650 110, 568 109.550, 568 109 C 568 108.450, 568.900 108, 570 108 C 571.100 108, 572 107.550, 572 107 C 572 106.450, 573.350 106, 575 106 C 576.650 106, 578 105.550, 578 105 C 578 104.450, 579.350 104, 581 104 C 583.667 104, 584 104.333, 584 107 C 584 108.650, 584.450 110, 585 110 C 585.550 110, 586 110.900, 586 112 C 586 113.100, 586.450 114, 587 114 C 587.550 114, 588 114.862, 588 115.917 C 588 116.971, 588.541 118.014, 589.201 118.234 C 590.526 118.675, 577.697 132, 575.947 132 C 575.348 132, 574.182 132.675, 573.357 133.500 C 572.024 134.833, 572.024 135.167, 573.357 136.500 C 574.182 137.325, 575.527 138, 576.345 138 C 577.164 138, 578.096 138.563, 578.417 139.250 C 578.883 140.250, 579.117 140.250, 579.583 139.250 C 579.954 138.457, 582.328 138, 586.083 138 C 589.361 138, 592 137.554, 592 137 C 592 136.450, 593.350 136, 595 136 C 597.333 136, 598 136.444, 598 138 C 598 139.100, 597.550 140, 597 140 C 596.450 140, 596 140.900, 596 142 C 596 143.251, 595.333 144, 594.221 144 C 593.242 144, 591.793 144.900, 591 146 C 590.205 147.103, 588.411 148, 587 148 C 585.589 148, 583.795 148.897, 583 150 C 582.207 151.100, 580.501 152, 579.208 152 C 576.277 152, 574 154.186, 574 157 C 574 158.179, 574.643 159.786, 575.429 160.571 C 577.051 162.194, 586 162.557, 586 161 C 586 160.450, 587.350 160, 589 160 C 590.650 160, 592 159.550, 592 159 C 592 158.450, 592.900 158, 594 158 C 595.100 158, 596 158.245, 596 158.545 C 596 159.762, 590.985 164, 589.545 164 C 588.695 164, 588 164.450, 588 165 C 588 165.550, 587.100 166, 586 166 C 584.900 166, 584 166.450, 584 167 C 584 167.550, 582.200 168, 580 168 C 577.800 168, 576 168.450, 576 169 C 576 169.550, 575.293 170, 574.429 170 C 572.199 170, 570 172.483, 570 175 C 570 176.179, 570.643 177.786, 571.429 178.571 C 573.051 180.194, 582 180.557, 582 179 C 582 178.450, 582.900 178, 584 178 C 585.100 178, 586 177.550, 586 177 C 586 176.450, 586.900 176, 588 176 C 589.100 176, 590 175.550, 590 175 C 590 174.450, 591.350 174, 593 174 C 595.933 174, 596 174.111, 596 179 C 596 182.879, 595.648 184, 594.429 184 C 592.913 184, 590 186.255, 590 187.429 C 590 187.743, 591.350 188, 593 188 C 595.823 188, 596 188.231, 596 191.917 C 596 194.146, 596.535 196.012, 597.241 196.247 C 598.112 196.537, 597.913 197.230, 596.571 198.571 C 595.230 199.913, 594.537 200.112, 594.247 199.241 C 594.019 198.558, 592.971 198, 591.917 198 C 590.454 198, 590 198.710, 590 201 C 590 202.650, 590.450 204, 591 204 C 591.565 204, 592 206.848, 592 210.545 C 592 216.162, 592.348 217.439, 594.455 219.545 C 596.561 221.652, 597.838 222, 603.455 222 C 609.333 222, 610 221.796, 610 220 C 610 218.900, 610.450 218, 611 218 C 611.550 218, 612 216.650, 612 215 C 612 213.350, 612.450 212, 613 212 C 613.550 212, 614 209.943, 614 207.429 C 614 200.829, 615.275 200, 625.429 200 C 630.476 200, 634 199.589, 634 199 C 634 198.450, 634.900 198, 636 198 C 637.333 198, 638 197.333, 638 196 C 638 194.900, 638.450 194, 639 194 C 639.550 194, 640 192.855, 640 191.455 C 640 188.648, 635.975 184, 633.545 184 C 632.695 184, 632 183.550, 632 183 C 632 182.450, 630.650 182, 629 182 C 627.350 182, 626 181.550, 626 181 C 626 180.444, 623.333 180, 620 180 L 614 180 614 177 C 614 175.350, 614.450 174, 615 174 C 615.550 174, 616 173.293, 616 172.429 C 616 170.408, 618.408 168, 620.429 168 C 621.293 168, 622 167.550, 622 167 C 622 166.450, 623.157 166, 624.571 166 C 628.365 166, 630 163.763, 630 158.571 C 630 154.159, 629.896 154, 627 154 C 624.667 154, 624 153.556, 624 152 C 624 150.848, 624.667 150, 625.571 150 C 628.074 150, 630 147.402, 630 144.026 C 630 140.372, 626.173 136, 622.974 136 C 620.479 136, 618 133.792, 618 131.571 C 618 130.439, 618.988 130, 621.533 130 C 624.271 130, 625.895 129.171, 628.746 126.321 C 630.950 124.116, 631.939 122.480, 631.212 122.237 C 630.546 122.015, 630 121.164, 630 120.345 C 630 118.396, 627.558 116, 625.571 116 C 624.707 116, 624 115.550, 624 115 C 624 114.450, 622.650 114, 621 114 C 619.350 114, 618 113.550, 618 113 C 618 112.450, 618.450 112, 619 112 C 619.550 112, 620 111.199, 620 110.221 C 620 109.242, 620.900 107.793, 622 107 C 623.520 105.904, 624 104.411, 624 100.779 C 624 98.151, 623.550 96, 623 96 C 622.450 96, 622 95.100, 622 94 C 622 92.333, 622.667 92, 626 92 C 628.200 92, 630 91.550, 630 91 C 630 90.450, 632.250 90, 635 90 C 637.750 90, 640 89.550, 640 89 C 640 88.429, 643 88, 647 88 C 651 88, 654 87.571, 654 87 C 654 86.407, 657.667 86, 663 86 C 668.333 86, 672 85.593, 672 85 C 672 84.450, 673.607 84, 675.571 84 C 677.536 84, 679.786 83.357, 680.571 82.571 C 682.195 80.948, 682.518 76, 681 76 C 680.450 76, 680 75.100, 680 74 C 680 72.667, 679.333 72, 678 72 C 676.900 72, 676 71.550, 676 71 C 676 70.450, 674.200 70, 672 70 C 669.800 70, 668 70.450, 668 71 C 668 71.550, 667.100 72, 666 72 C 664.900 72, 664 72.450, 664 73 C 664 73.550, 661.750 74, 659 74 C 656.250 74, 654 74.450, 654 75 C 654 75.571, 651 76, 647 76 C 643 76, 640 76.429, 640 77 C 640 77.556, 637.333 78, 634 78 C 630.667 78, 628 78.444, 628 79 C 628 79.550, 627.100 80, 626 80 C 624.900 80, 624 80.450, 624 81 C 624 81.571, 621 82, 617 82 C 613 82, 610 82.429, 610 83 C 610 83.550, 608.650 84, 607 84 C 605.350 84, 604 83.550, 604 83 C 604 82.450, 604.704 82, 605.565 82 C 606.426 82, 609.321 79.750, 612 77 C 614.679 74.250, 617.574 72, 618.435 72 C 619.296 72, 620 71.550, 620 71 C 620 70.450, 621.132 70, 622.516 70 C 624.313 70, 627.170 67.862, 632.516 62.516 C 636.632 58.400, 640 54.449, 640 53.737 C 640 53.024, 640.900 51.793, 642 51 C 643.100 50.207, 644 48.758, 644 47.779 C 644 46.801, 644.450 46, 645 46 C 646.534 46, 646.187 39.044, 644.571 37.429 C 643.786 36.643, 642.436 36, 641.571 36 C 640.707 36, 640 35.550, 640 35 C 640 34.450, 639.100 34, 638 34 C 636.900 34, 636 34.450, 636 35 C 636 35.550, 635.293 36, 634.429 36 C 632.408 36, 630 38.408, 630 40.429 C 630 41.293, 629.550 42, 629 42 C 628.450 42, 628 43.157, 628 44.571 C 628 46.888, 626.035 50, 624.571 50 C 624.257 50, 624 47.510, 624 44.467 C 624 39.486, 623.654 38.587, 620.533 35.467 C 616.093 31.027, 610.299 30.610, 606.455 34.455 C 604.191 36.718, 604 37.653, 604 46.455 C 604 52.152, 603.597 56, 603 56 C 602.450 56, 602 58.250, 602 61 C 602 63.750, 601.550 66, 601 66 C 600.450 66, 600 66.900, 600 68 C 600 69.100, 599.550 70, 599 70 C 598.450 70, 598 67.750, 598 65 C 598 62.250, 598.450 60, 599 60 C 599.597 60, 600 56.156, 600 50.467 L 600 40.933 596.533 37.467 C 594.402 35.336, 592.091 34, 590.533 34 C 589.140 34, 588 33.550, 588 33 C 588 32.450, 587.100 32, 586 32 C 584.900 32, 584 32.450, 584 33 M 903 50 C 902.207 51.100, 900.962 52, 900.234 52 C 898.409 52, 894 56.565, 894 58.455 C 894 59.305, 893.550 60, 893 60 C 892.369 60, 892 66.844, 892 78.533 L 892 97.067 895.467 100.533 C 897.373 102.440, 899.586 104, 900.383 104 C 901.181 104, 902.096 104.563, 902.417 105.250 C 902.883 106.250, 903.117 106.250, 903.583 105.250 C 903.904 104.563, 904.816 104, 905.610 104 C 906.403 104, 909.066 101.987, 911.526 99.526 C 915.745 95.307, 916 94.738, 916 89.526 C 916 86.487, 915.550 84, 915 84 C 914.450 84, 914 83.100, 914 82 C 914 80.900, 914.450 80, 915 80 C 915.556 80, 916 77.333, 916 74 C 916 70.667, 916.444 68, 917 68 C 917.550 68, 918 66.200, 918 64 C 918 61.800, 917.550 60, 917 60 C 916.450 60, 916 58.749, 916 57.221 C 916 55.589, 915.174 53.847, 914 53 C 912.900 52.207, 912 50.758, 912 49.779 C 912 47.122, 904.950 47.295, 903 50 M 254 51 C 254 51.550, 252.200 52, 250 52 C 247.800 52, 246 52.450, 246 53 C 246 53.550, 244.650 54, 243 54 C 241.350 54, 240 54.450, 240 55 C 240 55.550, 239.100 56, 238 56 C 236.900 56, 236 56.450, 236 57 C 236 57.550, 235.100 58, 234 58 C 232.900 58, 232 58.450, 232 59 C 232 59.550, 231.317 60, 230.481 60 C 228.173 60, 216 72.632, 216 75.027 C 216 77.894, 220.390 82, 223.455 82 C 224.855 82, 226 81.550, 226 81 C 226 79.515, 228.933 79.790, 230.571 81.429 C 231.393 82.250, 232 84.800, 232 87.429 C 232 91.333, 231.708 92, 230 92 C 228.900 92, 228 92.450, 228 93 C 228 93.550, 227.310 94, 226.467 94 C 224.734 94, 218 100.363, 218 102 C 218 103.637, 224.734 110, 226.467 110 C 227.333 110, 228 110.870, 228 112 C 228 113.333, 227.333 114, 226 114 C 224.900 114, 224 114.450, 224 115 C 224 115.550, 223.199 116, 222.221 116 C 221.242 116, 219.793 116.900, 219 118 C 218.207 119.100, 216.951 120, 216.208 120 C 214.377 120, 212 122.501, 212 124.429 C 212 125.293, 211.550 126, 211 126 C 210.417 126, 210 129.333, 210 134 C 210 138.667, 210.417 142, 211 142 C 211.550 142, 212 142.707, 212 143.571 C 212 145.592, 214.408 148, 216.429 148 C 217.293 148, 218 148.450, 218 149 C 218 149.550, 219.800 150, 222 150 C 225.168 150, 226 150.370, 226 151.779 C 226 152.758, 225.100 154.207, 224 155 C 222.900 155.793, 222 157.143, 222 158 C 222 158.857, 221.100 160.207, 220 161 C 218.900 161.793, 218 163.242, 218 164.221 C 218 165.199, 217.550 166, 217 166 C 216.450 166, 216 166.900, 216 168 C 216 169.100, 215.550 170, 215 170 C 213.167 170, 213.970 173.060, 216.455 175.545 C 217.805 176.895, 219.605 178, 220.455 178 C 221.305 178, 222 178.450, 222 179 C 222 179.550, 222.900 180, 224 180 C 225.100 180, 226 179.550, 226 179 C 226 178.450, 227.251 178, 228.779 178 C 230.411 178, 232.153 177.174, 233 176 C 233.793 174.900, 235.042 174, 235.776 174 C 236.510 174, 239.761 171.300, 243 168 C 246.239 164.700, 249.139 162, 249.445 162 C 249.750 162, 250 162.900, 250 164 C 250 165.100, 249.550 166, 249 166 C 248.450 166, 248 167.800, 248 170 C 248 173.778, 248.167 174, 251 174 C 252.650 174, 254 173.550, 254 173 C 254 172.450, 255.169 172, 256.599 172 C 258.221 172, 260.296 170.824, 262.120 168.871 L 265.043 165.743 266.889 167.871 C 269.456 170.832, 274.410 170.681, 277.545 167.545 C 278.895 166.195, 280 164.433, 280 163.629 C 280 162.825, 280.563 161.904, 281.250 161.583 C 282.250 161.117, 282.250 160.883, 281.250 160.417 C 280.563 160.096, 280 158.971, 280 157.917 C 280 156.862, 279.550 156, 279 156 C 278.450 156, 278 153.750, 278 151 C 278 148.250, 278.450 146, 279 146 C 279.550 146, 280 145.100, 280 144 C 280 142.900, 280.450 142, 281 142 C 281.550 142, 282 141.100, 282 140 C 282 138.900, 282.450 138, 283 138 C 283.550 138, 284 137.100, 284 136 C 284 134.900, 284.450 134, 285 134 C 285.550 134, 286 133.100, 286 132 C 286 130.900, 286.450 130, 287 130 C 288.589 130, 288.216 119.073, 286.571 117.429 C 285.706 116.563, 283.127 116, 280.026 116 C 275.927 116, 274.421 116.488, 272.455 118.455 C 271.105 119.805, 270 122.055, 270 123.455 C 270 125.333, 269.476 126, 268 126 C 266.667 126, 266 125.333, 266 124 C 266 122.900, 265.550 122, 265 122 C 264.450 122, 264 120.650, 264 119 C 264 117.350, 263.550 116, 263 116 C 262.450 116, 262 114.650, 262 113 C 262 111.350, 261.550 110, 261 110 C 260.450 110, 260 108.200, 260 106 C 260 103.030, 260.405 102, 261.571 102 C 263.932 102, 266 99.465, 266 96.571 C 266 95.157, 266.450 94, 267 94 C 267.550 94, 268 95.800, 268 98 C 268 101.333, 268.333 102, 270 102 C 271.152 102, 272 101.333, 272 100.429 C 272 98.408, 274.408 96, 276.429 96 C 277.293 96, 278 95.550, 278 95 C 278 94.450, 279.145 94, 280.545 94 C 284.734 94, 288 89.857, 288 84.545 C 288 82.045, 288.450 80, 289 80 C 289.556 80, 290 82.667, 290 86 C 290 89.333, 290.444 92, 291 92 C 291.648 92, 292 104.667, 292 128 C 292 151.333, 291.648 164, 291 164 C 290.450 164, 290 165.800, 290 168 C 290 170.200, 289.550 172, 289 172 C 288.450 172, 288 173.350, 288 175 C 288 176.650, 287.550 178, 287 178 C 286.450 178, 286 178.900, 286 180 C 286 181.100, 285.550 182, 285 182 C 284.450 182, 284 182.707, 284 183.571 C 284 185.932, 281.465 188, 278.571 188 C 276.900 188, 276 187.450, 276 186.429 C 276 184.408, 273.592 182, 271.571 182 C 270.707 182, 270 181.550, 270 181 C 270 180.450, 269.100 180, 268 180 C 266.900 180, 266 179.550, 266 179 C 266 178.450, 264.200 178, 262 178 C 259.800 178, 258 178.450, 258 179 C 258 179.550, 256.200 180, 254 180 C 251.800 180, 250 180.450, 250 181 C 250 181.550, 248.200 182, 246 182 C 243.800 182, 242 182.450, 242 183 C 242 183.550, 240.650 184, 239 184 C 237.350 184, 236 184.450, 236 185 C 236 185.550, 234.749 186, 233.221 186 C 231.589 186, 229.847 186.826, 229 188 C 228.207 189.100, 226.795 190, 225.863 190 C 224.930 190, 223.904 190.563, 223.583 191.250 C 223.117 192.250, 222.883 192.250, 222.417 191.250 C 221.727 189.773, 214 189.543, 214 191 C 214 191.550, 213.293 192, 212.429 192 C 209.928 192, 208 194.596, 208 197.962 C 208 200.171, 209 202.067, 211.467 204.533 C 214.715 207.781, 215.345 208, 221.467 208 C 225.156 208, 228 207.565, 228 207 C 228 206.450, 229.350 206, 231 206 C 232.650 206, 234 205.550, 234 205 C 234 204.450, 234.900 204, 236 204 C 237.100 204, 238 203.550, 238 203 C 238 202.450, 238.900 202, 240 202 C 241.100 202, 242 201.550, 242 201 C 242 200.450, 243.350 200, 245 200 C 246.650 200, 248 199.550, 248 199 C 248 198.389, 252.667 198, 260 198 C 267.333 198, 272 198.389, 272 199 C 272 199.550, 272.900 200, 274 200 C 275.100 200, 276 200.450, 276 201 C 276 201.550, 277.800 202, 280 202 C 282.200 202, 284 201.550, 284 201 C 284 200.450, 284.695 200, 285.545 200 C 287.546 200, 292 195.546, 292 193.545 C 292 192.695, 292.450 192, 293 192 C 293.550 192, 294 191.100, 294 190 C 294 188.900, 294.450 188, 295 188 C 295.550 188, 296 186.650, 296 185 C 296 183.350, 296.450 182, 297 182 C 297.550 182, 298 180.650, 298 179 C 298 177.350, 298.450 176, 299 176 C 299.556 176, 300 173.333, 300 170 C 300 166.667, 300.444 164, 301 164 C 301.583 164, 302 160.667, 302 156 C 302 151.333, 302.417 148, 303 148 C 303.647 148, 304 136, 304 114 C 304 92, 303.647 80, 303 80 C 302.450 80, 302 78.200, 302 76 C 302 73.800, 301.550 72, 301 72 C 300.450 72, 300 71.100, 300 70 C 300 68.900, 299.550 68, 299 68 C 298.450 68, 298 67.315, 298 66.478 C 298 64.498, 287.502 54, 285.522 54 C 284.685 54, 284 53.550, 284 53 C 284 52.450, 282.650 52, 281 52 C 279.350 52, 278 51.550, 278 51 C 278 50.389, 273.333 50, 266 50 C 258.667 50, 254 50.389, 254 51 M 435.250 57.496 C 434.563 58.277, 434 59.572, 434 60.374 C 434 61.177, 433.438 62.096, 432.750 62.417 C 431.750 62.883, 431.750 63.117, 432.750 63.583 C 433.438 63.904, 434 65.029, 434 66.083 C 434 67.138, 434.450 68, 435 68 C 435.550 68, 436 68.862, 436 69.917 C 436 70.971, 436.563 72.096, 437.250 72.417 C 438.250 72.883, 438.250 73.117, 437.250 73.583 C 436.563 73.904, 436 74.819, 436 75.617 C 436 77.544, 429.479 84, 427.533 84 C 425.502 84, 425.505 88.648, 427.538 90.681 C 428.922 92.065, 429.259 92.007, 430.905 90.109 C 431.911 88.949, 433.265 88, 433.913 88 C 435.622 88, 440 83.358, 440 81.545 C 440 80.695, 440.450 80, 441 80 C 441.550 80, 442 79.100, 442 78 C 442 76.900, 442.450 76, 443 76 C 443.550 76, 444 74.650, 444 73 C 444 71.350, 444.450 70, 445 70 C 445.550 70, 446 68.410, 446 66.467 C 446 63.768, 445.181 62.114, 442.533 59.467 C 438.785 55.718, 437.194 55.288, 435.250 57.496 M 421.250 63.496 C 419.518 65.463, 419.679 66, 422 66 C 423.333 66, 424 65.333, 424 64 C 424 61.672, 423.015 61.491, 421.250 63.496 M 560.250 66.525 C 559.013 67.847, 558 69.620, 558 70.464 C 558 71.309, 557.550 72, 557 72 C 556.450 72, 556 73.350, 556 75 C 556 76.650, 555.550 78, 555 78 C 553.049 78, 554.037 83.128, 556.455 85.545 C 558.951 88.042, 566 89.116, 566 87 C 566 86.450, 566.900 86, 568 86 C 569.333 86, 570 85.333, 570 84 C 570 82.900, 570.450 82, 571 82 C 571.550 82, 572 79.750, 572 77 C 572 74.250, 572.450 72, 573 72 C 573.550 72, 574 71.100, 574 70 C 574 68.667, 573.333 68, 572 68 C 570.900 68, 570 68.450, 570 69 C 570 69.550, 569.550 70, 569 70 C 568.450 70, 568 69.293, 568 68.429 C 568 66.487, 565.600 63.979, 563.821 64.061 C 563.095 64.095, 561.487 65.204, 560.250 66.525 M 754.250 70.549 C 750.134 74.814, 750 75.160, 750 81.477 C 750 85.159, 749.564 88, 749 88 C 748.450 88, 748 90.507, 748 93.571 C 748 99.305, 746.584 102, 743.571 102 C 742.707 102, 742 102.450, 742 103 C 742 103.550, 740.650 104, 739 104 C 737.350 104, 736 104.450, 736 105 C 736 105.556, 733.333 106, 730 106 C 726.667 106, 724 106.444, 724 107 C 724 107.550, 723.100 108, 722 108 C 720.900 108, 720 108.450, 720 109 C 720 109.550, 719.100 110, 718 110 C 716.231 110, 716 110.667, 716 115.779 C 716 120.411, 716.397 121.845, 718 123 C 719.100 123.793, 720 125.038, 720 125.766 C 720 126.495, 721.105 128.195, 722.455 129.545 C 724.678 131.769, 725.715 132, 733.455 132 C 738.485 132, 742 132.411, 742 133 C 742 133.550, 741.550 134, 741 134 C 740.450 134, 740 135.350, 740 137 C 740 138.650, 739.550 140, 739 140 C 738.450 140, 738 141.350, 738 143 C 738 144.650, 737.550 146, 737 146 C 736.450 146, 736 147.350, 736 149 C 736 150.650, 735.550 152, 735 152 C 734.450 152, 734 152.900, 734 154 C 734 155.100, 733.550 156, 733 156 C 732.450 156, 732 157.350, 732 159 C 732 161.061, 731.508 162, 730.429 162 C 728.408 162, 726 164.408, 726 166.429 C 726 167.293, 725.550 168, 725 168 C 724.450 168, 724 168.707, 724 169.571 C 724 171.390, 721.658 174, 720.026 174 C 718.365 174, 714 178.675, 714 180.455 C 714 181.305, 713.550 182, 713 182 C 712.450 182, 712 182.450, 712 183 C 712 183.550, 712.900 184, 714 184 C 715.100 184, 716 183.550, 716 183 C 716 182.450, 716.900 182, 718 182 C 719.100 182, 720 181.550, 720 181 C 720 180.450, 722.250 180, 725 180 C 727.750 180, 730 179.550, 730 179 C 730 178.450, 731.587 178, 733.526 178 C 736.369 178, 737.920 177.133, 741.526 173.526 C 744.237 170.815, 746 168.144, 746 166.747 C 746 165.479, 746.900 163.793, 748 163 C 749.100 162.207, 750 160.758, 750 159.779 C 750 158.801, 750.450 158, 751 158 C 751.550 158, 752 157.100, 752 156 C 752 154.900, 752.450 154, 753 154 C 753.550 154, 754 153.293, 754 152.429 C 754 151.564, 754.664 150.193, 755.475 149.382 C 756.775 148.082, 757.606 148.562, 762.475 153.432 C 765.514 156.470, 768 159.542, 768 160.258 C 768 160.973, 768.900 162.207, 770 163 C 771.100 163.793, 772 165.052, 772 165.799 C 772 166.546, 773.800 168.886, 776 171 C 778.200 173.114, 780 175.335, 780 175.936 C 780 177.614, 796.768 194, 798.486 194 C 799.319 194, 800 194.450, 800 195 C 800 195.550, 800.900 196, 802 196 C 803.100 196, 804 196.450, 804 197 C 804 197.550, 805.350 198, 807 198 C 808.650 198, 810 198.450, 810 199 C 810 199.550, 811.800 200, 814 200 C 816.200 200, 818 200.450, 818 201 C 818 201.556, 820.667 202, 824 202 C 827.333 202, 830 201.556, 830 201 C 830 200.450, 832.250 200, 835 200 C 837.750 200, 840 199.550, 840 199 C 840 198.450, 840.707 198, 841.571 198 C 842.436 198, 843.809 197.334, 844.624 196.519 C 845.932 195.211, 845.694 194.627, 842.586 191.519 C 840.650 189.584, 838.476 188, 837.754 188 C 837.032 188, 835.793 187.100, 835 186 C 834.207 184.900, 832.857 184, 832 184 C 831.143 184, 829.793 183.100, 829 182 C 828.207 180.900, 826.758 180, 825.779 180 C 824.801 180, 824 179.550, 824 179 C 824 178.450, 823.100 178, 822 178 C 820.900 178, 820 177.550, 820 177 C 820 176.450, 819.100 176, 818 176 C 816.900 176, 816 175.550, 816 175 C 816 174.450, 815.100 174, 814 174 C 812.900 174, 812 173.550, 812 173 C 812 172.450, 811.296 172, 810.435 172 C 809.574 172, 806.679 169.750, 804 167 C 801.321 164.250, 798.621 162, 798 162 C 797.379 162, 794.679 159.750, 792 157 C 789.321 154.250, 786.615 152, 785.987 152 C 785.358 152, 783.114 150.200, 781 148 C 778.886 145.800, 776.627 144, 775.980 144 C 775.332 144, 773.541 142.650, 772 141 C 770.459 139.350, 768.221 138, 767.027 138 C 764.588 138, 762 135.834, 762 133.792 C 762 133.049, 762.900 131.793, 764 131 C 765.100 130.207, 766 128.971, 766 128.253 C 766 126.432, 774.613 118, 776.474 118 C 777.313 118, 778 117.550, 778 117 C 778 116.450, 780.250 116, 783 116 C 785.750 116, 788 115.550, 788 115 C 788 114.450, 789.350 114, 791 114 C 792.650 114, 794 113.550, 794 113 C 794 112.450, 795.145 112, 796.545 112 C 797.945 112, 800.195 110.895, 801.545 109.545 C 803.718 107.373, 804 106.223, 804 99.545 L 804 92 801 92 C 799.350 92, 798 91.550, 798 91 C 798 90.450, 797.100 90, 796 90 C 794.900 90, 794 89.550, 794 89 C 794 88.444, 791.333 88, 788 88 C 784.667 88, 782 88.444, 782 89 C 782 89.550, 781.550 90, 781 90 C 780.450 90, 780 88.650, 780 87 C 780 85.350, 779.550 84, 779 84 C 778.450 84, 778 82.650, 778 81 C 778 79.350, 777.550 78, 777 78 C 776.450 78, 776 77.310, 776 76.467 C 776 74.476, 769.524 68, 767.533 68 C 766.690 68, 766 67.550, 766 67 C 766 66.450, 764.313 66.033, 762.250 66.072 C 759.174 66.132, 757.736 66.937, 754.250 70.549 M 258 69 C 258 69.550, 256.200 70, 254 70 C 251.800 70, 250 70.450, 250 71 C 250 71.550, 249.100 72, 248 72 C 246.667 72, 246 72.667, 246 74 C 246 75.100, 246.450 76, 247 76 C 247.550 76, 248 76.707, 248 77.571 C 248 79.932, 250.535 82, 253.429 82 C 254.843 82, 256 82.450, 256 83 C 256 83.550, 256.900 84, 258 84 C 259.100 84, 260 84.450, 260 85 C 260 85.550, 260.450 86, 261 86 C 261.550 86, 262 83.955, 262 81.455 C 262 74.534, 265.011 72, 273.234 72 C 278.411 72, 279.820 72.363, 281 74 C 281.793 75.100, 283.242 76, 284.221 76 C 285.333 76, 286 76.749, 286 78 C 286 79.100, 286.450 80, 287 80 C 289.347 80, 287.834 74.768, 284.533 71.467 L 281.067 68 269.533 68 C 262.511 68, 258 68.391, 258 69 M 394 85 C 394 93, 394.385 98, 395 98 C 395.550 98, 396 98.900, 396 100 C 396 102.369, 396.634 102.509, 398.571 100.571 C 399.393 99.750, 400 97.200, 400 94.571 C 400 90.667, 399.708 90, 398 90 C 396.370 90, 396 89.333, 396 86.401 C 396 83.692, 396.742 82.110, 399 80 C 400.845 78.277, 402 76.197, 402 74.599 C 402 72.234, 401.641 72, 398 72 L 394 72 394 85 M 92 79 C 92 79.550, 90.650 80, 89 80 C 87.350 80, 86 80.450, 86 81 C 86 81.550, 85.293 82, 84.429 82 C 80.762 82, 80 84.483, 80 96.429 C 80 107.333, 80.115 108, 82 108 C 83.100 108, 84 107.550, 84 107 C 84 106.450, 84.900 106, 86 106 C 87.100 106, 88 105.550, 88 105 C 88 104.450, 88.687 104, 89.526 104 C 91.387 104, 100 95.568, 100 93.747 C 100 93.029, 100.900 91.793, 102 91 C 103.174 90.153, 104 88.411, 104 86.779 C 104 85.251, 104.450 84, 105 84 C 105.550 84, 106 82.650, 106 81 L 106 78 99 78 C 95 78, 92 78.429, 92 79 M 600 85 C 600 85.550, 600.900 86, 602 86 C 603.100 86, 604 85.550, 604 85 C 604 84.450, 603.100 84, 602 84 C 600.900 84, 600 84.450, 600 85 M 185.250 89.540 C 183.463 91.412, 182 93.631, 182 94.472 C 182 95.312, 181.550 96, 181 96 C 180.450 96, 180 97.350, 180 99 C 180 100.650, 179.550 102, 179 102 C 178.450 102, 178 104.250, 178 107 C 178 109.750, 177.550 112, 177 112 C 176.352 112, 176 124.667, 176 148 C 176 171.333, 176.352 184, 177 184 C 177.550 184, 178 185.350, 178 187 C 178 188.650, 178.450 190, 179 190 C 179.550 190, 180 190.695, 180 191.545 C 180 192.395, 181.105 194.195, 182.455 195.545 C 186.865 199.956, 198 198.542, 198 193.571 C 198 192.707, 198.450 192, 199 192 C 199.550 192, 200 190.650, 200 189 C 200 187.350, 200.450 186, 201 186 C 201.550 186, 202 184.650, 202 183 C 202 181.350, 201.550 180, 201 180 C 200.450 180, 200 178.200, 200 176 C 200 173.800, 199.550 172, 199 172 C 198.367 172, 198 164.667, 198 152 C 198 139.333, 198.367 132, 199 132 C 199.571 132, 200 129, 200 125 C 200 121, 200.429 118, 201 118 C 201.556 118, 202 115.333, 202 112 C 202 108.667, 202.444 106, 203 106 C 203.565 106, 204 103.156, 204 99.467 C 204 93.345, 203.781 92.715, 200.533 89.467 C 197.619 86.552, 196.384 86.011, 192.783 86.069 C 189.262 86.125, 187.922 86.743, 185.250 89.540 M 600 98.571 C 600 98.886, 600.675 99.818, 601.500 100.643 C 602.833 101.976, 603.167 101.976, 604.500 100.643 C 606.657 98.486, 606.381 98, 603 98 C 601.350 98, 600 98.257, 600 98.571 M 933.250 121.540 C 931.462 123.412, 930 125.871, 930 127.005 C 930 129.401, 936.212 136, 938.467 136 C 939.640 136, 940 137.174, 940 141 C 940 143.750, 940.450 146, 941 146 C 941.556 146, 942 148.667, 942 152 C 942 157.246, 941.759 158, 940.083 158 C 939.029 158, 937.904 158.563, 937.583 159.250 C 937.117 160.250, 936.883 160.250, 936.417 159.250 C 936.071 158.510, 933.916 158, 931.137 158 C 927.589 158, 926.089 158.489, 925 160 C 924.153 161.174, 922.411 162, 920.779 162 C 919.251 162, 918 162.450, 918 163 C 918 163.550, 915.750 164, 913 164 C 910.250 164, 908 164.450, 908 165 C 908 165.550, 907.100 166, 906 166 C 904.900 166, 904 166.450, 904 167 C 904 167.550, 903.100 168, 902 168 C 900.900 168, 900 168.450, 900 169 C 900 169.550, 899.305 170, 898.455 170 C 897.605 170, 895.805 171.105, 894.455 172.455 C 892.568 174.341, 892 175.962, 892 179.455 C 892 181.955, 892.450 184, 893 184 C 893.550 184, 894 185.157, 894 186.571 C 894 190.729, 896.156 192, 903.208 192 C 908.411 192, 909.819 191.639, 911 190 C 911.793 188.900, 913.242 188, 914.221 188 C 915.199 188, 916 187.550, 916 187 C 916 186.450, 917.350 186, 919 186 C 920.650 186, 922 185.550, 922 185 C 922 184.450, 922.900 184, 924 184 C 925.100 184, 926 183.550, 926 183 C 926 182.444, 928.667 182, 932 182 C 935.333 182, 938 181.556, 938 181 C 938 180.450, 938.900 180, 940 180 C 941.100 180, 942 179.550, 942 179 C 942 178.450, 943.350 178, 945 178 C 946.650 178, 948 178.450, 948 179 C 948 179.550, 947.550 180, 947 180 C 946.450 180, 946 182.069, 946 184.599 C 946 188.419, 945.492 189.672, 943 192 C 941.155 193.723, 940 195.803, 940 197.401 C 940 200.727, 939.428 200.670, 936 197 C 934.459 195.350, 932.516 194, 931.682 194 C 930.849 194, 929.981 193.442, 929.753 192.759 C 929.452 191.856, 928.884 191.973, 927.670 193.188 C 925.862 194.995, 925.370 200, 927 200 C 927.589 200, 928 203.515, 928 208.545 C 928 216.285, 928.231 217.322, 930.455 219.545 C 932.940 222.030, 936 222.833, 936 221 C 936 220.450, 937.590 220, 939.533 220 C 942.232 220, 943.886 219.181, 946.533 216.533 C 948.440 214.627, 950 212.377, 950 211.533 C 950 210.690, 950.450 210, 951 210 C 951.550 210, 952 209.100, 952 208 C 952 206.900, 952.450 206, 953 206 C 953.550 206, 954 205.199, 954 204.221 C 954 203.242, 954.900 201.793, 956 201 C 957.393 199.996, 958 198.411, 958 195.779 C 958 193.701, 958.450 192, 959 192 C 959.550 192, 960 190.650, 960 189 C 960 187.350, 959.550 186, 959 186 C 957.443 186, 957.806 177.051, 959.429 175.429 C 960.433 174.424, 963.276 174, 969 174 C 977.945 174, 980 172.986, 980 168.571 C 980 167.157, 980.450 166, 981 166 C 981.550 166, 982 164.650, 982 163 C 982 161.350, 981.550 160, 981 160 C 980.450 160, 980 158.843, 980 157.429 C 980 156.014, 979.357 154.214, 978.571 153.429 C 976.949 151.806, 968 151.443, 968 153 C 968 153.550, 965.750 154, 963 154 C 960.250 154, 958 154.450, 958 155 C 958 156.833, 954.940 156.030, 952.455 153.545 C 949.958 151.049, 948.884 144, 951 144 C 951.550 144, 952 143.100, 952 142 C 952 140.900, 952.450 140, 953 140 C 953.550 140, 954 139.100, 954 138 C 954 136.900, 954.450 136, 955 136 C 955.551 136, 956 133.407, 956 130.221 C 956 125.589, 955.603 124.155, 954 123 C 952.900 122.207, 952 120.758, 952 119.779 C 952 118.221, 951.039 118.009, 944.250 118.069 C 936.776 118.135, 936.384 118.259, 933.250 121.540 M 878.250 124.525 C 877.013 125.847, 876 128.070, 876 129.464 C 876 130.859, 875.550 132, 875 132 C 874.450 132, 874 132.900, 874 134 C 874 135.100, 873.550 136, 873 136 C 872.450 136, 872 137.350, 872 139 C 872 140.650, 871.550 142, 871 142 C 870.450 142, 870 142.900, 870 144 C 870 145.100, 870.450 146, 871 146 C 871.550 146, 872 146.900, 872 148 C 872 149.100, 871.550 150, 871 150 C 870.450 150, 870 150.900, 870 152 C 870 153.100, 870.450 154, 871 154 C 871.550 154, 872 155.140, 872 156.533 C 872 159.083, 877.854 166, 880.012 166 C 881.644 166, 886 161.304, 886 159.545 C 886 158.695, 886.450 158, 887 158 C 887.550 158, 888 155.849, 888 153.221 C 888 149.589, 887.520 148.096, 886 147 C 884.273 145.755, 884 144.411, 884 137.147 C 884 129.834, 884.276 128.495, 886.109 126.905 C 888.007 125.259, 888.065 124.922, 886.681 123.538 C 884.467 121.325, 880.850 121.748, 878.250 124.525 M 246 128.917 C 246 130.521, 245.438 132.035, 244.750 132.282 C 243.902 132.586, 244.224 133.375, 245.750 134.733 C 249.208 137.809, 248.742 142.325, 244.533 146.533 C 242.627 148.440, 240.581 150, 239.988 150 C 238.462 150, 234 154.645, 234 156.234 C 234 156.962, 233.100 158.207, 232 159 C 230.253 160.259, 229.032 166, 230.511 166 C 230.791 166, 236.191 160.830, 242.511 154.511 C 252.799 144.222, 254 142.654, 254 139.511 C 254 137.580, 253.550 136, 253 136 C 252.450 136, 252 134.855, 252 133.455 C 252 131.262, 248.149 126, 246.545 126 C 246.245 126, 246 127.313, 246 128.917 M 406 143 C 406 143.550, 406.450 144, 407 144 C 407.550 144, 408 143.550, 408 143 C 408 142.450, 407.550 142, 407 142 C 406.450 142, 406 142.450, 406 143 M 404 145 C 404 145.550, 404.450 146, 405 146 C 405.550 146, 406 145.550, 406 145 C 406 144.450, 405.550 144, 405 144 C 404.450 144, 404 144.450, 404 145 M 250 161 C 250 161.550, 250.450 162, 251 162 C 251.550 162, 252 161.550, 252 161 C 252 160.450, 251.550 160, 251 160 C 250.450 160, 250 160.450, 250 161 M 449.250 165.496 C 448.563 166.277, 448 167.405, 448 168.003 C 448 170.052, 443.092 174, 440.545 174 C 439.145 174, 438 173.550, 438 173 C 438 172.450, 436.650 172, 435 172 C 433.350 172, 432 172.450, 432 173 C 432 173.550, 430.200 174, 428 174 C 425.800 174, 424 174.450, 424 175 C 424 175.550, 424.450 176, 425 176 C 425.550 176, 426 176.719, 426 177.599 C 426 178.478, 427.350 180.459, 429 182 C 430.650 183.541, 432 185.522, 432 186.401 C 432 187.281, 432.450 188, 433 188 C 433.551 188, 434 190.593, 434 193.779 C 434 198.411, 433.603 199.845, 432 201 C 430.900 201.793, 430 203.242, 430 204.221 C 430 205.199, 429.550 206, 429 206 C 428.450 206, 428 206.801, 428 207.779 C 428 208.758, 427.100 210.207, 426 211 C 424.230 212.276, 423.137 216, 424.533 216 C 425.772 216, 432 208.938, 432 207.533 C 432 206.690, 432.450 206, 433 206 C 433.550 206, 434 205.199, 434 204.221 C 434 203.242, 434.900 201.793, 436 201 C 437.100 200.207, 438 198.758, 438 197.779 C 438 196.801, 438.690 196, 439.533 196 C 441.259 196, 448 202.360, 448 203.988 C 448 204.569, 450.465 207.509, 453.478 210.522 C 457.219 214.263, 459.756 216, 461.478 216 C 462.865 216, 464 216.450, 464 217 C 464 217.550, 466.250 218, 469 218 C 471.750 218, 474 218.450, 474 219 C 474 219.604, 478.190 220, 484.571 220 C 492.574 220, 495.503 219.640, 496.624 218.519 C 497.932 217.211, 497.694 216.627, 494.586 213.519 C 492.589 211.523, 490.066 210, 488.754 210 C 487.482 210, 485.793 209.100, 485 208 C 484.207 206.900, 482.948 206, 482.201 206 C 481.454 206, 479.114 204.200, 477 202 C 474.886 199.800, 472.627 198, 471.980 198 C 471.332 198, 469.541 196.650, 468 195 C 466.459 193.350, 464.668 192, 464.020 192 C 463.373 192, 461.114 190.200, 459 188 C 456.886 185.800, 454.447 184, 453.578 184 C 452.710 184, 452 183.760, 452 183.467 C 452 182.447, 458.940 176, 460.038 176 C 462.115 176, 464 173.145, 464 170 C 464 168.271, 463.357 166.214, 462.571 165.429 C 460.666 163.523, 450.943 163.573, 449.250 165.496 M 414 169 C 414 169.550, 414.450 170, 415 170 C 415.550 170, 416 169.550, 416 169 C 416 168.450, 415.550 168, 415 168 C 414.450 168, 414 168.450, 414 169 M 561.250 187.540 C 558.314 190.615, 558 191.529, 558 197.017 C 558 202.133, 558.387 203.478, 560.455 205.545 C 561.805 206.895, 563.605 208, 564.455 208 C 565.305 208, 566 208.450, 566 209 C 566 210.534, 572.956 210.187, 574.571 208.571 C 575.357 207.786, 576 206.436, 576 205.571 C 576 204.707, 576.450 204, 577 204 C 577.550 204, 578 202.299, 578 200.221 C 578 197.589, 578.607 196.004, 580 195 C 582.400 193.270, 582.581 192, 580.429 192 C 578.408 192, 576 189.592, 576 187.571 C 576 186.667, 575.152 186, 574 186 C 572.900 186, 572 185.550, 572 185 C 572 184.450, 570.313 184.031, 568.250 184.069 C 565.338 184.122, 563.774 184.898, 561.250 187.540 M 614 194 C 614 196.369, 614.634 196.509, 616.571 194.571 C 618.509 192.634, 618.369 192, 616 192 C 614.667 192, 614 192.667, 614 194\" stroke=\"none\" fill=\"#008038\" fill-rule=\"evenodd\"/>\n</svg>";
const nameSvgCurrent = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1020\" height=\"250\" viewBox=\"0 0 1020 250\" version=\"1.1\">\n\t<path d=\"M 956.250 14.525 C 954.601 16.287, 954 18.139, 954 21.464 C 954 23.959, 953.550 26, 953 26 C 952.450 26, 952 26.719, 952 27.599 C 952 28.478, 950.650 30.459, 949 32 C 947.350 33.541, 946 35.522, 946 36.401 C 946 37.281, 945.550 38, 945 38 C 944.450 38, 944 39.350, 944 41 C 944 43.039, 944.495 44, 945.545 44 C 947.662 44, 952.814 49.229, 951.222 49.759 C 949.764 50.245, 949.560 56, 951 56 C 952.518 56, 952.195 60.948, 950.571 62.571 C 949.786 63.357, 948.190 64, 947.026 64 C 945.862 64, 943.805 65.105, 942.455 66.455 C 940.439 68.470, 940 69.900, 940 74.455 L 940 80 944 80 C 946.200 80, 948 79.550, 948 79 C 948 78.450, 948.900 78, 950 78 C 951.556 78, 952 78.667, 952 81 C 952 82.650, 951.550 84, 951 84 C 950.450 84, 950 84.707, 950 85.571 C 950 87.499, 947.623 90, 945.792 90 C 945.049 90, 943.793 90.900, 943 92 C 942.207 93.100, 940.758 94, 939.779 94 C 938.801 94, 938 94.450, 938 95 C 938 95.550, 937.100 96, 936 96 C 934.900 96, 934 95.550, 934 95 C 934 94.450, 934.450 94, 935 94 C 935.611 94, 936 89.333, 936 82 C 936 74.667, 936.389 70, 937 70 C 937.593 70, 938 66.333, 938 61 C 938 55.667, 938.407 52, 939 52 C 940.589 52, 940.216 41.073, 938.571 39.429 C 936.956 37.813, 930 37.466, 930 39 C 930 39.550, 929.305 40, 928.455 40 C 927.605 40, 925.805 41.105, 924.455 42.455 C 922.282 44.627, 922 45.777, 922 52.455 C 922 56.818, 921.578 60, 921 60 C 920.381 60, 920 65.333, 920 74 C 920 82.667, 919.619 88, 919 88 C 917.466 88, 917.813 94.956, 919.429 96.571 C 920.214 97.357, 921.564 98, 922.429 98 C 923.293 98, 924 98.450, 924 99 C 924 99.550, 925.350 100, 927 100 C 928.650 100, 930 100.257, 930 100.571 C 930 101.594, 927.174 104, 925.973 104 C 925.329 104, 923.541 105.350, 922 107 C 920.459 108.650, 918.478 110, 917.599 110 C 916.719 110, 916 110.450, 916 111 C 916 111.550, 914.749 112, 913.221 112 C 911.589 112, 909.847 112.826, 909 114 C 908.207 115.100, 906.758 116, 905.779 116 C 904.801 116, 904 116.450, 904 117 C 904 117.550, 903.100 118, 902 118 C 900.373 118, 900 118.667, 900 121.571 C 900 126.722, 901.795 128, 909.027 128 C 914.594 128, 915.472 127.706, 918 125 C 919.541 123.350, 921.791 122, 923 122 C 924.209 122, 926.459 120.650, 928 119 C 929.541 117.350, 931.522 116, 932.401 116 C 933.281 116, 934 115.550, 934 115 C 934 114.450, 934.900 114, 936 114 C 937.100 114, 938 113.550, 938 113 C 938 112.450, 938.801 112, 939.779 112 C 940.758 112, 942.207 111.100, 943 110 C 943.847 108.826, 945.589 108, 947.221 108 C 948.749 108, 950 107.550, 950 107 C 950 106.450, 951.350 106, 953 106 C 954.650 106, 956 105.550, 956 105 C 956 104.450, 957.350 104, 959 104 C 960.650 104, 962 103.550, 962 103 C 962 102.444, 964.667 102, 968 102 C 971.333 102, 974 101.556, 974 101 C 974 99.278, 990.888 99.746, 992.659 101.517 C 994.015 102.872, 993.848 103.340, 991.088 105.918 C 989.390 107.504, 988 109.522, 988 110.401 C 988 111.333, 987.166 112, 986 112 C 984.834 112, 984 112.667, 984 113.599 C 984 114.478, 982.650 116.459, 981 118 C 979.350 119.541, 978 121.779, 978 122.973 C 978 125.597, 981.119 129.144, 981.753 127.241 C 981.981 126.558, 983.479 126, 985.083 126 C 986.688 126, 988 125.550, 988 125 C 988 124.450, 988.900 124, 990 124 C 991.100 124, 992 123.550, 992 123 C 992 122.450, 992.685 122, 993.522 122 C 994.359 122, 997.509 119.535, 1000.522 116.522 C 1005.544 111.499, 1006 110.667, 1006 106.522 C 1006 104.035, 1006.450 102, 1007 102 C 1007.550 102, 1008 100.863, 1008 99.474 C 1008 96.029, 999.971 88, 996.526 88 C 995.137 88, 994 87.550, 994 87 C 994 86.450, 992.650 86, 991 86 C 989.350 86, 988 86.450, 988 87 C 988 87.550, 987.100 88, 986 88 C 984.900 88, 984 87.550, 984 87 C 984 86.444, 981.333 86, 978 86 C 974.667 86, 972 86.444, 972 87 C 972 87.550, 969.750 88, 967 88 C 961.604 88, 960.864 87.260, 964 85 C 965.597 83.849, 966 82.411, 966 77.863 C 966 74.217, 965.553 72.018, 964.759 71.753 C 963.204 71.235, 966.176 68, 968.208 68 C 968.951 68, 970.207 67.100, 971 66 C 971.793 64.900, 973.049 64, 973.792 64 C 975.825 64, 978 61.416, 978 59 C 978 55.416, 975.613 54, 969.571 54 C 966.507 54, 964 54.450, 964 55 C 964 55.550, 963.100 56, 962 56 C 960.444 56, 960 55.333, 960 53 C 960 51.350, 960.450 50, 961 50 C 961.550 50, 962 49.100, 962 48 C 962 46.900, 962.450 46, 963 46 C 963.550 46, 964 45.281, 964 44.401 C 964 43.522, 965.350 41.541, 967 40 C 968.650 38.459, 970 36.577, 970 35.820 C 970 35.062, 970.900 33.793, 972 33 C 974.692 31.059, 974.753 26, 972.083 26 C 971.029 26, 969.938 25.438, 969.659 24.750 C 969.270 23.791, 968.923 23.829, 968.167 24.912 C 967.328 26.115, 966.946 26.089, 965.591 24.734 C 963.843 22.986, 963.406 18, 965 18 C 966.485 18, 966.210 15.067, 964.571 13.429 C 962.459 11.316, 958.804 11.798, 956.250 14.525 M 426.250 22.525 C 425.012 23.847, 424 25.620, 424 26.464 C 424 27.309, 423.550 28, 423 28 C 422.450 28, 422 29.800, 422 32 C 422 34.200, 422.450 36, 423 36 C 423.550 36, 424 36.900, 424 38 C 424 39.152, 423.333 40, 422.429 40 C 420.610 40, 418 37.658, 418 36.026 C 418 35.412, 416.895 33.805, 415.545 32.455 C 413.659 30.568, 412.038 30, 408.545 30 C 406.045 30, 404 30.450, 404 31 C 404 31.550, 403.293 32, 402.429 32 C 399.255 32, 398 34.672, 398 41.429 C 398 45.143, 398.435 48, 399 48 C 399.550 48, 400 48.900, 400 50 C 400 51.100, 399.550 52, 399 52 C 398.450 52, 398 53.350, 398 55 C 398 57.333, 397.556 58, 396 58 C 394.900 58, 394 58.450, 394 59 C 394 59.550, 393.199 60, 392.221 60 C 391.242 60, 389.793 60.900, 389 62 C 388.207 63.100, 386.512 64, 385.234 64 C 382.146 64, 378 68.272, 378 71.455 C 378 72.855, 377.550 74, 377 74 C 376.381 74, 376 79.333, 376 88 C 376 96.667, 376.381 102, 377 102 C 377.550 102, 378 102.695, 378 103.545 C 378 106.404, 382.664 110, 386.371 110 C 388.275 110, 390.035 109.437, 390.282 108.750 C 390.586 107.902, 391.375 108.224, 392.733 109.750 C 394.264 111.471, 395.823 112, 399.367 112 C 401.915 112, 404 112.450, 404 113 C 404 113.550, 402.650 114, 401 114 C 399.350 114, 398 114.450, 398 115 C 398 115.550, 397.293 116, 396.429 116 C 393.919 116, 392 118.600, 392 122 C 392 125.813, 393.979 128, 397.429 128 C 401.187 128, 400.675 130.508, 396 135 C 393.800 137.114, 392 139.454, 392 140.201 C 392 140.948, 391.100 142.207, 390 143 C 388.900 143.793, 388 145.242, 388 146.221 C 388 147.199, 387.550 148, 387 148 C 386.450 148, 386 148.801, 386 149.779 C 386 150.758, 385.100 152.207, 384 153 C 382.900 153.793, 382 155.242, 382 156.221 C 382 157.199, 381.550 158, 381 158 C 380.450 158, 380 158.900, 380 160 C 380 161.100, 379.550 162, 379 162 C 378.450 162, 378 162.900, 378 164 C 378 165.100, 377.550 166, 377 166 C 376.450 166, 376 166.900, 376 168 C 376 169.100, 375.550 170, 375 170 C 374.450 170, 374 170.900, 374 172 C 374 173.100, 373.550 174, 373 174 C 372.450 174, 372 175.350, 372 177 C 372 178.650, 371.550 180, 371 180 C 370.450 180, 370 180.900, 370 182 C 370 183.100, 369.550 184, 369 184 C 368.450 184, 368 184.900, 368 186 C 368 187.100, 367.550 188, 367 188 C 366.450 188, 366 189.762, 366 191.917 C 366 194.146, 365.465 196.012, 364.759 196.247 C 363.888 196.537, 364.087 197.230, 365.429 198.571 C 366.770 199.913, 367.463 200.112, 367.753 199.241 C 368 198.499, 369.970 198, 372.655 198 C 378.097 198, 380 196.334, 380 191.571 C 380 189.607, 380.450 188, 381 188 C 381.550 188, 382 186.650, 382 185 C 382 183.350, 382.450 182, 383 182 C 383.550 182, 384 181.100, 384 180 C 384 178.900, 384.450 178, 385 178 C 385.550 178, 386 177.293, 386 176.429 C 386 175.564, 386.643 174.214, 387.429 173.429 C 389.067 171.790, 392 171.515, 392 173 C 392 173.556, 394.667 174, 398 174 C 401.333 174, 404 173.556, 404 173 C 404 172.450, 405.350 172, 407 172 C 408.650 172, 410 171.550, 410 171 C 410 170.450, 410.900 170, 412 170 C 413.333 170, 414 170.667, 414 172 C 414 173.100, 413.550 174, 413 174 C 412.450 174, 412 175.350, 412 177 C 412 178.650, 411.550 180, 411 180 C 410.450 180, 410 181.350, 410 183 C 410 184.650, 409.550 186, 409 186 C 408.450 186, 408 187.800, 408 190 C 408 192.200, 407.550 194, 407 194 C 406.417 194, 406 197.333, 406 202 C 406 206.667, 405.583 210, 405 210 C 404.444 210, 404 212.667, 404 216 C 404 219.333, 404.444 222, 405 222 C 405.550 222, 406 223.157, 406 224.571 C 406 227.426, 408.060 230, 410.345 230 C 411.164 230, 412.015 230.546, 412.237 231.212 C 412.759 232.777, 420 225.614, 420 223.533 C 420 222.690, 419.550 222, 419 222 C 418.450 222, 418 222.450, 418 223 C 418 224.518, 413.052 224.195, 411.429 222.571 C 409.805 220.948, 409.482 216, 411 216 C 411.550 216, 412 213.750, 412 211 C 412 208.250, 412.450 206, 413 206 C 413.550 206, 414 203.750, 414 201 C 414 198.250, 414.450 196, 415 196 C 415.550 196, 416 194.200, 416 192 C 416 189.800, 416.450 188, 417 188 C 417.550 188, 418 186.650, 418 185 C 418 183.350, 418.450 182, 419 182 C 419.550 182, 420 180.650, 420 179 C 420 177.350, 420.450 176, 421 176 C 421.550 176, 422 174.650, 422 173 C 422 171.350, 422.450 170, 423 170 C 423.550 170, 424 168.650, 424 167 C 424 164.333, 424.333 164, 427 164 C 428.650 164, 430 163.550, 430 163 C 430 162.450, 431.350 162, 433 162 C 434.650 162, 436 161.550, 436 161 C 436 160.450, 437.350 160, 439 160 C 440.650 160, 442 159.550, 442 159 C 442 158.450, 443.350 158, 445 158 C 446.650 158, 448 157.550, 448 157 C 448 156.450, 449.140 156, 450.533 156 C 453.370 156, 461.279 148.926, 459.212 148.237 C 458.546 148.015, 458 147.164, 458 146.345 C 458 143.613, 455.243 142, 450.571 142 C 448.057 142, 446 142.450, 446 143 C 446 143.550, 445.100 144, 444 144 C 442.900 144, 442 144.450, 442 145 C 442 145.550, 441.100 146, 440 146 C 438.900 146, 438 146.450, 438 147 C 438 147.550, 437.100 148, 436 148 C 434.900 148, 434 148.450, 434 149 C 434 149.550, 432.650 150, 431 150 C 429.350 150, 428 150.450, 428 151 C 428 151.550, 427.100 152, 426 152 C 424.900 152, 424 152.450, 424 153 C 424 153.550, 422.650 154, 421 154 C 419.350 154, 418 154.450, 418 155 C 418 155.550, 417.100 156, 416 156 C 414.900 156, 414 156.450, 414 157 C 414 157.550, 412.650 158, 411 158 C 409.350 158, 408 157.731, 408 157.401 C 408 157.072, 409.350 155.541, 411 154 C 412.650 152.459, 414 150.683, 414 150.053 C 414 148.370, 418.660 144, 420.455 144 C 421.305 144, 422 144.450, 422 145 C 422 145.550, 424.040 146, 426.533 146 C 430.373 146, 431.597 145.469, 434.533 142.533 C 436.440 140.627, 438 138.414, 438 137.617 C 438 136.819, 438.563 135.904, 439.250 135.583 C 440.250 135.117, 440.250 134.883, 439.250 134.417 C 438.563 134.096, 438 133.164, 438 132.345 C 438 130.396, 435.558 128, 433.571 128 C 432.707 128, 432 127.550, 432 127 C 432 126.450, 430.200 126, 428 126 C 424.667 126, 424 125.667, 424 124 C 424 122.749, 424.667 122, 425.779 122 C 426.758 122, 428.207 121.100, 429 120 C 429.793 118.900, 431.049 118, 431.792 118 C 436.727 118, 437.462 110.169, 432.925 105.930 L 429.851 103.058 432.380 100.529 C 433.771 99.138, 435.605 98, 436.455 98 C 437.305 98, 438 97.550, 438 97 C 438 96.450, 439.350 96, 441 96 C 442.650 96, 444 95.550, 444 95 C 444 94.450, 444.900 94, 446 94 C 447.100 94, 448 93.550, 448 93 C 448 92.450, 448.685 92, 449.522 92 C 452.140 92, 462 81.350, 462 78.522 C 462 77.135, 462.450 76, 463 76 C 463.583 76, 464 72.667, 464 68 C 464 63.333, 463.583 60, 463 60 C 462.450 60, 462 58.650, 462 57 C 462 55.350, 461.550 54, 461 54 C 460.450 54, 460 53.100, 460 52 C 460 50.900, 459.550 50, 459 50 C 458.450 50, 458 49.305, 458 48.455 C 458 46.454, 453.546 42, 451.545 42 C 450.695 42, 450 41.550, 450 41 C 450 40.450, 448.200 40, 446 40 C 443.800 40, 442 39.550, 442 39 C 442 38.450, 441.100 38, 440 38 C 438.444 38, 438 37.333, 438 35 C 438 33.350, 438.450 32, 439 32 C 439.550 32, 440 30.855, 440 29.455 C 440 26.648, 435.975 22, 433.545 22 C 432.695 22, 432 21.550, 432 21 C 432 19.169, 428.531 20.090, 426.250 22.525 M 65.250 33.496 C 64.563 34.277, 64 35.610, 64 36.458 C 64 37.306, 63.550 38, 63 38 C 62.381 38, 62 43.333, 62 52 C 62 60.667, 61.619 66, 61 66 C 60.450 66, 60 66.900, 60 68 C 60 69.251, 59.333 70, 58.221 70 C 57.242 70, 55.793 70.900, 55 72 C 54.207 73.100, 52.968 74, 52.246 74 C 51.524 74, 49.373 75.560, 47.467 77.467 C 44.417 80.517, 44 81.547, 44 86.038 C 44 89.129, 44.564 91.706, 45.429 92.571 C 47.094 94.237, 60 94.616, 60 93 C 60 92.450, 60.450 92, 61 92 C 61.604 92, 62 96.190, 62 102.571 C 62 113.472, 61.166 116, 57.571 116 C 56.707 116, 56 116.450, 56 117 C 56 117.550, 55.100 118, 54 118 C 52.900 118, 52 118.450, 52 119 C 52 119.550, 51.100 120, 50 120 C 48.900 120, 48 120.450, 48 121 C 48 121.550, 47.199 122, 46.221 122 C 45.242 122, 43.793 122.900, 43 124 C 40.663 127.242, 40 126.358, 40 120 C 40 116.667, 39.556 114, 39 114 C 38.450 114, 38 112.200, 38 110 C 38 107.800, 37.550 106, 37 106 C 36.450 106, 36 105.305, 36 104.455 C 36 102.454, 31.546 98, 29.545 98 C 28.695 98, 28 97.550, 28 97 C 28 96.450, 26.650 96, 25 96 C 23.350 96, 22 96.450, 22 97 C 22 97.550, 21.293 98, 20.429 98 C 18.408 98, 16 100.408, 16 102.429 C 16 103.293, 15.550 104, 15 104 C 14.450 104, 14 105.350, 14 107 C 14 108.650, 13.550 110, 13 110 C 12.450 110, 12 111.350, 12 113 C 12 114.650, 12.450 116, 13 116 C 13.571 116, 14 119, 14 123 C 14 127, 14.429 130, 15 130 C 15.550 130, 16 130.695, 16 131.545 C 16 133.546, 20.454 138, 22.455 138 C 23.305 138, 24 138.450, 24 139 C 24 139.550, 26.250 140, 29 140 C 31.750 140, 34 139.550, 34 139 C 34 138.450, 34.900 138, 36 138 C 37.100 138, 38 137.550, 38 137 C 38 136.394, 42.333 136, 49 136 L 60 136 60 174 C 60 198.667, 60.351 212, 61 212 C 61.550 212, 62 214.250, 62 217 C 62 219.750, 62.450 222, 63 222 C 63.550 222, 64 223.350, 64 225 C 64 226.650, 64.450 228, 65 228 C 65.550 228, 66 229.607, 66 231.571 C 66 233.536, 66.675 235.818, 67.500 236.643 C 69.872 239.015, 72 236.144, 72 230.571 C 72 228.057, 72.450 226, 73 226 C 73.571 226, 74 223, 74 219 C 74 215, 74.429 212, 75 212 C 75.550 212, 76 210.200, 76 208 C 76 205.800, 76.450 204, 77 204 C 77.648 204, 78 191.667, 78 169 C 78 146.333, 78.352 134, 79 134 C 79.550 134, 80 133.100, 80 132 C 80 130.667, 80.667 130, 82 130 C 83.100 130, 84 129.550, 84 129 C 84 128.444, 86.667 128, 90 128 C 93.333 128, 96 127.556, 96 127 C 96 126.450, 96.900 126, 98 126 C 99.623 126, 100 125.333, 100 122.467 C 100 119.768, 100.819 118.114, 103.467 115.467 C 105.373 113.560, 107.410 112, 107.993 112 C 109.513 112, 118 103.304, 118 101.747 C 118 101.029, 118.900 99.793, 120 99 C 121.100 98.207, 122 96.758, 122 95.779 C 122 94.801, 122.450 94, 123 94 C 123.550 94, 124 93.100, 124 92 C 124 90.900, 124.450 90, 125 90 C 125.550 90, 126 89.100, 126 88 C 126 86.900, 126.450 86, 127 86 C 127.550 86, 128 84.650, 128 83 C 128 81.350, 128.450 80, 129 80 C 129.551 80, 130 77.407, 130 74.221 C 130 69.589, 129.603 68.155, 128 67 C 126.900 66.207, 126 64.951, 126 64.208 C 126 62.467, 123.533 60, 121.792 60 C 121.049 60, 119.793 59.100, 119 58 C 118.207 56.900, 116.758 56, 115.779 56 C 114.801 56, 114 55.550, 114 55 C 114 54.389, 109.333 54, 102 54 C 94.667 54, 90 54.389, 90 55 C 90 55.550, 88.650 56, 87 56 C 85.350 56, 84 56.450, 84 57 C 84 57.550, 83.100 58, 82 58 C 80.190 58, 80 57.333, 80 51 C 80 47, 80.429 44, 81 44 C 81.550 44, 82 42.650, 82 41 C 82 39.350, 81.550 38, 81 38 C 80.450 38, 80 37.293, 80 36.429 C 80 35.564, 79.357 34.214, 78.571 33.429 C 76.666 31.523, 66.943 31.573, 65.250 33.496 M 584 33 C 584 33.550, 583.293 34, 582.429 34 C 580.408 34, 578 36.408, 578 38.429 C 578 39.293, 577.550 40, 577 40 C 576.429 40, 576 43, 576 47 C 576 51, 576.429 54, 577 54 C 577.550 54, 578 55.800, 578 58 C 578 60.200, 578.450 62, 579 62 C 580.499 62, 580.264 73.710, 578.750 74.417 C 577.750 74.883, 577.750 75.117, 578.750 75.583 C 579.438 75.904, 580 77.286, 580 78.655 C 580 80.023, 580.643 81.786, 581.429 82.571 C 583.044 84.187, 590 84.534, 590 83 C 590 82.450, 590.900 82, 592 82 C 593.100 82, 594 81.550, 594 81 C 594 80.450, 594.450 80, 595 80 C 596.485 80, 596.210 82.933, 594.571 84.571 C 593.786 85.357, 592.436 86, 591.571 86 C 590.707 86, 590 86.450, 590 87 C 590 87.550, 589.100 88, 588 88 C 586.900 88, 586 88.450, 586 89 C 586 89.550, 585.199 90, 584.221 90 C 583.242 90, 581.793 90.900, 581 92 C 580.207 93.100, 578.758 94, 577.779 94 C 576.801 94, 576 94.450, 576 95 C 576 95.550, 574.650 96, 573 96 C 571.350 96, 570 96.450, 570 97 C 570 97.550, 568.650 98, 567 98 C 565.350 98, 564 98.450, 564 99 C 564 99.550, 563.100 100, 562 100 C 560.900 100, 560 100.450, 560 101 C 560 101.550, 559.100 102, 558 102 C 556.900 102, 556 102.450, 556 103 C 556 103.550, 554.749 104, 553.221 104 C 551.589 104, 549.847 104.826, 549 106 C 548.207 107.100, 546.758 108, 545.779 108 C 544.801 108, 544 108.450, 544 109 C 544 109.550, 542.749 110, 541.221 110 C 539.589 110, 537.847 110.826, 537 112 C 536.207 113.100, 534.758 114, 533.779 114 C 532.801 114, 532 114.450, 532 115 C 532 115.550, 531.100 116, 530 116 C 528.900 116, 528 116.450, 528 117 C 528 117.550, 526.650 118, 525 118 C 523.350 118, 522 118.450, 522 119 C 522 119.550, 520.843 120, 519.429 120 C 515.870 120, 514 122.214, 514 126.429 C 514 129.333, 514.373 130, 516 130 C 517.100 130, 518 130.450, 518 131 C 518 131.550, 520.250 132, 523 132 C 526.879 132, 528 131.648, 528 130.429 C 528 128.501, 530.377 126, 532.208 126 C 532.951 126, 534.207 125.100, 535 124 C 535.793 122.900, 537.242 122, 538.221 122 C 539.199 122, 540 121.550, 540 121 C 540 120.450, 540.900 120, 542 120 C 543.100 120, 544 119.550, 544 119 C 544 118.450, 544.900 118, 546 118 C 547.100 118, 548 117.550, 548 117 C 548 116.450, 548.900 116, 550 116 C 551.100 116, 552 115.550, 552 115 C 552 114.450, 552.900 114, 554 114 C 555.100 114, 556 113.550, 556 113 C 556 112.450, 557.350 112, 559 112 C 560.650 112, 562 111.550, 562 111 C 562 110.450, 563.350 110, 565 110 C 566.650 110, 568 109.550, 568 109 C 568 108.450, 568.900 108, 570 108 C 571.100 108, 572 107.550, 572 107 C 572 106.450, 573.350 106, 575 106 C 576.650 106, 578 105.550, 578 105 C 578 104.450, 579.350 104, 581 104 C 583.667 104, 584 104.333, 584 107 C 584 108.650, 584.450 110, 585 110 C 585.550 110, 586 110.900, 586 112 C 586 113.100, 586.450 114, 587 114 C 587.550 114, 588 114.862, 588 115.917 C 588 116.971, 588.541 118.014, 589.201 118.234 C 590.526 118.675, 577.697 132, 575.947 132 C 575.348 132, 574.182 132.675, 573.357 133.500 C 572.024 134.833, 572.024 135.167, 573.357 136.500 C 574.182 137.325, 575.527 138, 576.345 138 C 577.164 138, 578.096 138.563, 578.417 139.250 C 578.883 140.250, 579.117 140.250, 579.583 139.250 C 579.954 138.457, 582.328 138, 586.083 138 C 589.361 138, 592 137.554, 592 137 C 592 136.450, 593.350 136, 595 136 C 597.333 136, 598 136.444, 598 138 C 598 139.100, 597.550 140, 597 140 C 596.450 140, 596 140.900, 596 142 C 596 143.251, 595.333 144, 594.221 144 C 593.242 144, 591.793 144.900, 591 146 C 590.205 147.103, 588.411 148, 587 148 C 585.589 148, 583.795 148.897, 583 150 C 582.207 151.100, 580.501 152, 579.208 152 C 576.277 152, 574 154.186, 574 157 C 574 158.179, 574.643 159.786, 575.429 160.571 C 577.051 162.194, 586 162.557, 586 161 C 586 160.450, 587.350 160, 589 160 C 590.650 160, 592 159.550, 592 159 C 592 158.450, 592.900 158, 594 158 C 595.100 158, 596 158.245, 596 158.545 C 596 159.762, 590.985 164, 589.545 164 C 588.695 164, 588 164.450, 588 165 C 588 165.550, 587.100 166, 586 166 C 584.900 166, 584 166.450, 584 167 C 584 167.550, 582.200 168, 580 168 C 577.800 168, 576 168.450, 576 169 C 576 169.550, 575.293 170, 574.429 170 C 572.199 170, 570 172.483, 570 175 C 570 176.179, 570.643 177.786, 571.429 178.571 C 573.051 180.194, 582 180.557, 582 179 C 582 178.450, 582.900 178, 584 178 C 585.100 178, 586 177.550, 586 177 C 586 176.450, 586.900 176, 588 176 C 589.100 176, 590 175.550, 590 175 C 590 174.450, 591.350 174, 593 174 C 595.933 174, 596 174.111, 596 179 C 596 182.879, 595.648 184, 594.429 184 C 592.913 184, 590 186.255, 590 187.429 C 590 187.743, 591.350 188, 593 188 C 595.823 188, 596 188.231, 596 191.917 C 596 194.146, 596.535 196.012, 597.241 196.247 C 598.112 196.537, 597.913 197.230, 596.571 198.571 C 595.230 199.913, 594.537 200.112, 594.247 199.241 C 594.019 198.558, 592.971 198, 591.917 198 C 590.454 198, 590 198.710, 590 201 C 590 202.650, 590.450 204, 591 204 C 591.565 204, 592 206.848, 592 210.545 C 592 216.162, 592.348 217.439, 594.455 219.545 C 596.561 221.652, 597.838 222, 603.455 222 C 609.333 222, 610 221.796, 610 220 C 610 218.900, 610.450 218, 611 218 C 611.550 218, 612 216.650, 612 215 C 612 213.350, 612.450 212, 613 212 C 613.550 212, 614 209.943, 614 207.429 C 614 200.829, 615.275 200, 625.429 200 C 630.476 200, 634 199.589, 634 199 C 634 198.450, 634.900 198, 636 198 C 637.333 198, 638 197.333, 638 196 C 638 194.900, 638.450 194, 639 194 C 639.550 194, 640 192.855, 640 191.455 C 640 188.648, 635.975 184, 633.545 184 C 632.695 184, 632 183.550, 632 183 C 632 182.450, 630.650 182, 629 182 C 627.350 182, 626 181.550, 626 181 C 626 180.444, 623.333 180, 620 180 L 614 180 614 177 C 614 175.350, 614.450 174, 615 174 C 615.550 174, 616 173.293, 616 172.429 C 616 170.408, 618.408 168, 620.429 168 C 621.293 168, 622 167.550, 622 167 C 622 166.450, 623.157 166, 624.571 166 C 628.365 166, 630 163.763, 630 158.571 C 630 154.159, 629.896 154, 627 154 C 624.667 154, 624 153.556, 624 152 C 624 150.848, 624.667 150, 625.571 150 C 628.074 150, 630 147.402, 630 144.026 C 630 140.372, 626.173 136, 622.974 136 C 620.479 136, 618 133.792, 618 131.571 C 618 130.439, 618.988 130, 621.533 130 C 624.271 130, 625.895 129.171, 628.746 126.321 C 630.950 124.116, 631.939 122.480, 631.212 122.237 C 630.546 122.015, 630 121.164, 630 120.345 C 630 118.396, 627.558 116, 625.571 116 C 624.707 116, 624 115.550, 624 115 C 624 114.450, 622.650 114, 621 114 C 619.350 114, 618 113.550, 618 113 C 618 112.450, 618.450 112, 619 112 C 619.550 112, 620 111.199, 620 110.221 C 620 109.242, 620.900 107.793, 622 107 C 623.520 105.904, 624 104.411, 624 100.779 C 624 98.151, 623.550 96, 623 96 C 622.450 96, 622 95.100, 622 94 C 622 92.333, 622.667 92, 626 92 C 628.200 92, 630 91.550, 630 91 C 630 90.450, 632.250 90, 635 90 C 637.750 90, 640 89.550, 640 89 C 640 88.429, 643 88, 647 88 C 651 88, 654 87.571, 654 87 C 654 86.407, 657.667 86, 663 86 C 668.333 86, 672 85.593, 672 85 C 672 84.450, 673.607 84, 675.571 84 C 677.536 84, 679.786 83.357, 680.571 82.571 C 682.195 80.948, 682.518 76, 681 76 C 680.450 76, 680 75.100, 680 74 C 680 72.667, 679.333 72, 678 72 C 676.900 72, 676 71.550, 676 71 C 676 70.450, 674.200 70, 672 70 C 669.800 70, 668 70.450, 668 71 C 668 71.550, 667.100 72, 666 72 C 664.900 72, 664 72.450, 664 73 C 664 73.550, 661.750 74, 659 74 C 656.250 74, 654 74.450, 654 75 C 654 75.571, 651 76, 647 76 C 643 76, 640 76.429, 640 77 C 640 77.556, 637.333 78, 634 78 C 630.667 78, 628 78.444, 628 79 C 628 79.550, 627.100 80, 626 80 C 624.900 80, 624 80.450, 624 81 C 624 81.571, 621 82, 617 82 C 613 82, 610 82.429, 610 83 C 610 83.550, 608.650 84, 607 84 C 605.350 84, 604 83.550, 604 83 C 604 82.450, 604.704 82, 605.565 82 C 606.426 82, 609.321 79.750, 612 77 C 614.679 74.250, 617.574 72, 618.435 72 C 619.296 72, 620 71.550, 620 71 C 620 70.450, 621.132 70, 622.516 70 C 624.313 70, 627.170 67.862, 632.516 62.516 C 636.632 58.400, 640 54.449, 640 53.737 C 640 53.024, 640.900 51.793, 642 51 C 643.100 50.207, 644 48.758, 644 47.779 C 644 46.801, 644.450 46, 645 46 C 646.534 46, 646.187 39.044, 644.571 37.429 C 643.786 36.643, 642.436 36, 641.571 36 C 640.707 36, 640 35.550, 640 35 C 640 34.450, 639.100 34, 638 34 C 636.900 34, 636 34.450, 636 35 C 636 35.550, 635.293 36, 634.429 36 C 632.408 36, 630 38.408, 630 40.429 C 630 41.293, 629.550 42, 629 42 C 628.450 42, 628 43.157, 628 44.571 C 628 46.888, 626.035 50, 624.571 50 C 624.257 50, 624 47.510, 624 44.467 C 624 39.486, 623.654 38.587, 620.533 35.467 C 616.093 31.027, 610.299 30.610, 606.455 34.455 C 604.191 36.718, 604 37.653, 604 46.455 C 604 52.152, 603.597 56, 603 56 C 602.450 56, 602 58.250, 602 61 C 602 63.750, 601.550 66, 601 66 C 600.450 66, 600 66.900, 600 68 C 600 69.100, 599.550 70, 599 70 C 598.450 70, 598 67.750, 598 65 C 598 62.250, 598.450 60, 599 60 C 599.597 60, 600 56.156, 600 50.467 L 600 40.933 596.533 37.467 C 594.402 35.336, 592.091 34, 590.533 34 C 589.140 34, 588 33.550, 588 33 C 588 32.450, 587.100 32, 586 32 C 584.900 32, 584 32.450, 584 33 M 903 50 C 902.207 51.100, 900.962 52, 900.234 52 C 898.409 52, 894 56.565, 894 58.455 C 894 59.305, 893.550 60, 893 60 C 892.369 60, 892 66.844, 892 78.533 L 892 97.067 895.467 100.533 C 897.373 102.440, 899.586 104, 900.383 104 C 901.181 104, 902.096 104.563, 902.417 105.250 C 902.883 106.250, 903.117 106.250, 903.583 105.250 C 903.904 104.563, 904.816 104, 905.610 104 C 906.403 104, 909.066 101.987, 911.526 99.526 C 915.745 95.307, 916 94.738, 916 89.526 C 916 86.487, 915.550 84, 915 84 C 914.450 84, 914 83.100, 914 82 C 914 80.900, 914.450 80, 915 80 C 915.556 80, 916 77.333, 916 74 C 916 70.667, 916.444 68, 917 68 C 917.550 68, 918 66.200, 918 64 C 918 61.800, 917.550 60, 917 60 C 916.450 60, 916 58.749, 916 57.221 C 916 55.589, 915.174 53.847, 914 53 C 912.900 52.207, 912 50.758, 912 49.779 C 912 47.122, 904.950 47.295, 903 50 M 254 51 C 254 51.550, 252.200 52, 250 52 C 247.800 52, 246 52.450, 246 53 C 246 53.550, 244.650 54, 243 54 C 241.350 54, 240 54.450, 240 55 C 240 55.550, 239.100 56, 238 56 C 236.900 56, 236 56.450, 236 57 C 236 57.550, 235.100 58, 234 58 C 232.900 58, 232 58.450, 232 59 C 232 59.550, 231.317 60, 230.481 60 C 228.173 60, 216 72.632, 216 75.027 C 216 77.894, 220.390 82, 223.455 82 C 224.855 82, 226 81.550, 226 81 C 226 79.515, 228.933 79.790, 230.571 81.429 C 231.393 82.250, 232 84.800, 232 87.429 C 232 91.333, 231.708 92, 230 92 C 228.900 92, 228 92.450, 228 93 C 228 93.550, 227.310 94, 226.467 94 C 224.734 94, 218 100.363, 218 102 C 218 103.637, 224.734 110, 226.467 110 C 227.333 110, 228 110.870, 228 112 C 228 113.333, 227.333 114, 226 114 C 224.900 114, 224 114.450, 224 115 C 224 115.550, 223.199 116, 222.221 116 C 221.242 116, 219.793 116.900, 219 118 C 218.207 119.100, 216.951 120, 216.208 120 C 214.377 120, 212 122.501, 212 124.429 C 212 125.293, 211.550 126, 211 126 C 210.417 126, 210 129.333, 210 134 C 210 138.667, 210.417 142, 211 142 C 211.550 142, 212 142.707, 212 143.571 C 212 145.592, 214.408 148, 216.429 148 C 217.293 148, 218 148.450, 218 149 C 218 149.550, 219.800 150, 222 150 C 225.168 150, 226 150.370, 226 151.779 C 226 152.758, 225.100 154.207, 224 155 C 222.900 155.793, 222 157.143, 222 158 C 222 158.857, 221.100 160.207, 220 161 C 218.900 161.793, 218 163.242, 218 164.221 C 218 165.199, 217.550 166, 217 166 C 216.450 166, 216 166.900, 216 168 C 216 169.100, 215.550 170, 215 170 C 213.167 170, 213.970 173.060, 216.455 175.545 C 217.805 176.895, 219.605 178, 220.455 178 C 221.305 178, 222 178.450, 222 179 C 222 179.550, 222.900 180, 224 180 C 225.100 180, 226 179.550, 226 179 C 226 178.450, 227.251 178, 228.779 178 C 230.411 178, 232.153 177.174, 233 176 C 233.793 174.900, 235.042 174, 235.776 174 C 236.510 174, 239.761 171.300, 243 168 C 246.239 164.700, 249.139 162, 249.445 162 C 249.750 162, 250 162.900, 250 164 C 250 165.100, 249.550 166, 249 166 C 248.450 166, 248 167.800, 248 170 C 248 173.778, 248.167 174, 251 174 C 252.650 174, 254 173.550, 254 173 C 254 172.450, 255.169 172, 256.599 172 C 258.221 172, 260.296 170.824, 262.120 168.871 L 265.043 165.743 266.889 167.871 C 269.456 170.832, 274.410 170.681, 277.545 167.545 C 278.895 166.195, 280 164.433, 280 163.629 C 280 162.825, 280.563 161.904, 281.250 161.583 C 282.250 161.117, 282.250 160.883, 281.250 160.417 C 280.563 160.096, 280 158.971, 280 157.917 C 280 156.862, 279.550 156, 279 156 C 278.450 156, 278 153.750, 278 151 C 278 148.250, 278.450 146, 279 146 C 279.550 146, 280 145.100, 280 144 C 280 142.900, 280.450 142, 281 142 C 281.550 142, 282 141.100, 282 140 C 282 138.900, 282.450 138, 283 138 C 283.550 138, 284 137.100, 284 136 C 284 134.900, 284.450 134, 285 134 C 285.550 134, 286 133.100, 286 132 C 286 130.900, 286.450 130, 287 130 C 288.589 130, 288.216 119.073, 286.571 117.429 C 285.706 116.563, 283.127 116, 280.026 116 C 275.927 116, 274.421 116.488, 272.455 118.455 C 271.105 119.805, 270 122.055, 270 123.455 C 270 125.333, 269.476 126, 268 126 C 266.667 126, 266 125.333, 266 124 C 266 122.900, 265.550 122, 265 122 C 264.450 122, 264 120.650, 264 119 C 264 117.350, 263.550 116, 263 116 C 262.450 116, 262 114.650, 262 113 C 262 111.350, 261.550 110, 261 110 C 260.450 110, 260 108.200, 260 106 C 260 103.030, 260.405 102, 261.571 102 C 263.932 102, 266 99.465, 266 96.571 C 266 95.157, 266.450 94, 267 94 C 267.550 94, 268 95.800, 268 98 C 268 101.333, 268.333 102, 270 102 C 271.152 102, 272 101.333, 272 100.429 C 272 98.408, 274.408 96, 276.429 96 C 277.293 96, 278 95.550, 278 95 C 278 94.450, 279.145 94, 280.545 94 C 284.734 94, 288 89.857, 288 84.545 C 288 82.045, 288.450 80, 289 80 C 289.556 80, 290 82.667, 290 86 C 290 89.333, 290.444 92, 291 92 C 291.648 92, 292 104.667, 292 128 C 292 151.333, 291.648 164, 291 164 C 290.450 164, 290 165.800, 290 168 C 290 170.200, 289.550 172, 289 172 C 288.450 172, 288 173.350, 288 175 C 288 176.650, 287.550 178, 287 178 C 286.450 178, 286 178.900, 286 180 C 286 181.100, 285.550 182, 285 182 C 284.450 182, 284 182.707, 284 183.571 C 284 185.932, 281.465 188, 278.571 188 C 276.900 188, 276 187.450, 276 186.429 C 276 184.408, 273.592 182, 271.571 182 C 270.707 182, 270 181.550, 270 181 C 270 180.450, 269.100 180, 268 180 C 266.900 180, 266 179.550, 266 179 C 266 178.450, 264.200 178, 262 178 C 259.800 178, 258 178.450, 258 179 C 258 179.550, 256.200 180, 254 180 C 251.800 180, 250 180.450, 250 181 C 250 181.550, 248.200 182, 246 182 C 243.800 182, 242 182.450, 242 183 C 242 183.550, 240.650 184, 239 184 C 237.350 184, 236 184.450, 236 185 C 236 185.550, 234.749 186, 233.221 186 C 231.589 186, 229.847 186.826, 229 188 C 228.207 189.100, 226.795 190, 225.863 190 C 224.930 190, 223.904 190.563, 223.583 191.250 C 223.117 192.250, 222.883 192.250, 222.417 191.250 C 221.727 189.773, 214 189.543, 214 191 C 214 191.550, 213.293 192, 212.429 192 C 209.928 192, 208 194.596, 208 197.962 C 208 200.171, 209 202.067, 211.467 204.533 C 214.715 207.781, 215.345 208, 221.467 208 C 225.156 208, 228 207.565, 228 207 C 228 206.450, 229.350 206, 231 206 C 232.650 206, 234 205.550, 234 205 C 234 204.450, 234.900 204, 236 204 C 237.100 204, 238 203.550, 238 203 C 238 202.450, 238.900 202, 240 202 C 241.100 202, 242 201.550, 242 201 C 242 200.450, 243.350 200, 245 200 C 246.650 200, 248 199.550, 248 199 C 248 198.389, 252.667 198, 260 198 C 267.333 198, 272 198.389, 272 199 C 272 199.550, 272.900 200, 274 200 C 275.100 200, 276 200.450, 276 201 C 276 201.550, 277.800 202, 280 202 C 282.200 202, 284 201.550, 284 201 C 284 200.450, 284.695 200, 285.545 200 C 287.546 200, 292 195.546, 292 193.545 C 292 192.695, 292.450 192, 293 192 C 293.550 192, 294 191.100, 294 190 C 294 188.900, 294.450 188, 295 188 C 295.550 188, 296 186.650, 296 185 C 296 183.350, 296.450 182, 297 182 C 297.550 182, 298 180.650, 298 179 C 298 177.350, 298.450 176, 299 176 C 299.556 176, 300 173.333, 300 170 C 300 166.667, 300.444 164, 301 164 C 301.583 164, 302 160.667, 302 156 C 302 151.333, 302.417 148, 303 148 C 303.647 148, 304 136, 304 114 C 304 92, 303.647 80, 303 80 C 302.450 80, 302 78.200, 302 76 C 302 73.800, 301.550 72, 301 72 C 300.450 72, 300 71.100, 300 70 C 300 68.900, 299.550 68, 299 68 C 298.450 68, 298 67.315, 298 66.478 C 298 64.498, 287.502 54, 285.522 54 C 284.685 54, 284 53.550, 284 53 C 284 52.450, 282.650 52, 281 52 C 279.350 52, 278 51.550, 278 51 C 278 50.389, 273.333 50, 266 50 C 258.667 50, 254 50.389, 254 51 M 435.250 57.496 C 434.563 58.277, 434 59.572, 434 60.374 C 434 61.177, 433.438 62.096, 432.750 62.417 C 431.750 62.883, 431.750 63.117, 432.750 63.583 C 433.438 63.904, 434 65.029, 434 66.083 C 434 67.138, 434.450 68, 435 68 C 435.550 68, 436 68.862, 436 69.917 C 436 70.971, 436.563 72.096, 437.250 72.417 C 438.250 72.883, 438.250 73.117, 437.250 73.583 C 436.563 73.904, 436 74.819, 436 75.617 C 436 77.544, 429.479 84, 427.533 84 C 425.502 84, 425.505 88.648, 427.538 90.681 C 428.922 92.065, 429.259 92.007, 430.905 90.109 C 431.911 88.949, 433.265 88, 433.913 88 C 435.622 88, 440 83.358, 440 81.545 C 440 80.695, 440.450 80, 441 80 C 441.550 80, 442 79.100, 442 78 C 442 76.900, 442.450 76, 443 76 C 443.550 76, 444 74.650, 444 73 C 444 71.350, 444.450 70, 445 70 C 445.550 70, 446 68.410, 446 66.467 C 446 63.768, 445.181 62.114, 442.533 59.467 C 438.785 55.718, 437.194 55.288, 435.250 57.496 M 421.250 63.496 C 419.518 65.463, 419.679 66, 422 66 C 423.333 66, 424 65.333, 424 64 C 424 61.672, 423.015 61.491, 421.250 63.496 M 560.250 66.525 C 559.013 67.847, 558 69.620, 558 70.464 C 558 71.309, 557.550 72, 557 72 C 556.450 72, 556 73.350, 556 75 C 556 76.650, 555.550 78, 555 78 C 553.049 78, 554.037 83.128, 556.455 85.545 C 558.951 88.042, 566 89.116, 566 87 C 566 86.450, 566.900 86, 568 86 C 569.333 86, 570 85.333, 570 84 C 570 82.900, 570.450 82, 571 82 C 571.550 82, 572 79.750, 572 77 C 572 74.250, 572.450 72, 573 72 C 573.550 72, 574 71.100, 574 70 C 574 68.667, 573.333 68, 572 68 C 570.900 68, 570 68.450, 570 69 C 570 69.550, 569.550 70, 569 70 C 568.450 70, 568 69.293, 568 68.429 C 568 66.487, 565.600 63.979, 563.821 64.061 C 563.095 64.095, 561.487 65.204, 560.250 66.525 M 754.250 70.549 C 750.134 74.814, 750 75.160, 750 81.477 C 750 85.159, 749.564 88, 749 88 C 748.450 88, 748 90.507, 748 93.571 C 748 99.305, 746.584 102, 743.571 102 C 742.707 102, 742 102.450, 742 103 C 742 103.550, 740.650 104, 739 104 C 737.350 104, 736 104.450, 736 105 C 736 105.556, 733.333 106, 730 106 C 726.667 106, 724 106.444, 724 107 C 724 107.550, 723.100 108, 722 108 C 720.900 108, 720 108.450, 720 109 C 720 109.550, 719.100 110, 718 110 C 716.231 110, 716 110.667, 716 115.779 C 716 120.411, 716.397 121.845, 718 123 C 719.100 123.793, 720 125.038, 720 125.766 C 720 126.495, 721.105 128.195, 722.455 129.545 C 724.678 131.769, 725.715 132, 733.455 132 C 738.485 132, 742 132.411, 742 133 C 742 133.550, 741.550 134, 741 134 C 740.450 134, 740 135.350, 740 137 C 740 138.650, 739.550 140, 739 140 C 738.450 140, 738 141.350, 738 143 C 738 144.650, 737.550 146, 737 146 C 736.450 146, 736 147.350, 736 149 C 736 150.650, 735.550 152, 735 152 C 734.450 152, 734 152.900, 734 154 C 734 155.100, 733.550 156, 733 156 C 732.450 156, 732 157.350, 732 159 C 732 161.061, 731.508 162, 730.429 162 C 728.408 162, 726 164.408, 726 166.429 C 726 167.293, 725.550 168, 725 168 C 724.450 168, 724 168.707, 724 169.571 C 724 171.390, 721.658 174, 720.026 174 C 718.365 174, 714 178.675, 714 180.455 C 714 181.305, 713.550 182, 713 182 C 712.450 182, 712 182.450, 712 183 C 712 183.550, 712.900 184, 714 184 C 715.100 184, 716 183.550, 716 183 C 716 182.450, 716.900 182, 718 182 C 719.100 182, 720 181.550, 720 181 C 720 180.450, 722.250 180, 725 180 C 727.750 180, 730 179.550, 730 179 C 730 178.450, 731.587 178, 733.526 178 C 736.369 178, 737.920 177.133, 741.526 173.526 C 744.237 170.815, 746 168.144, 746 166.747 C 746 165.479, 746.900 163.793, 748 163 C 749.100 162.207, 750 160.758, 750 159.779 C 750 158.801, 750.450 158, 751 158 C 751.550 158, 752 157.100, 752 156 C 752 154.900, 752.450 154, 753 154 C 753.550 154, 754 153.293, 754 152.429 C 754 151.564, 754.664 150.193, 755.475 149.382 C 756.775 148.082, 757.606 148.562, 762.475 153.432 C 765.514 156.470, 768 159.542, 768 160.258 C 768 160.973, 768.900 162.207, 770 163 C 771.100 163.793, 772 165.052, 772 165.799 C 772 166.546, 773.800 168.886, 776 171 C 778.200 173.114, 780 175.335, 780 175.936 C 780 177.614, 796.768 194, 798.486 194 C 799.319 194, 800 194.450, 800 195 C 800 195.550, 800.900 196, 802 196 C 803.100 196, 804 196.450, 804 197 C 804 197.550, 805.350 198, 807 198 C 808.650 198, 810 198.450, 810 199 C 810 199.550, 811.800 200, 814 200 C 816.200 200, 818 200.450, 818 201 C 818 201.556, 820.667 202, 824 202 C 827.333 202, 830 201.556, 830 201 C 830 200.450, 832.250 200, 835 200 C 837.750 200, 840 199.550, 840 199 C 840 198.450, 840.707 198, 841.571 198 C 842.436 198, 843.809 197.334, 844.624 196.519 C 845.932 195.211, 845.694 194.627, 842.586 191.519 C 840.650 189.584, 838.476 188, 837.754 188 C 837.032 188, 835.793 187.100, 835 186 C 834.207 184.900, 832.857 184, 832 184 C 831.143 184, 829.793 183.100, 829 182 C 828.207 180.900, 826.758 180, 825.779 180 C 824.801 180, 824 179.550, 824 179 C 824 178.450, 823.100 178, 822 178 C 820.900 178, 820 177.550, 820 177 C 820 176.450, 819.100 176, 818 176 C 816.900 176, 816 175.550, 816 175 C 816 174.450, 815.100 174, 814 174 C 812.900 174, 812 173.550, 812 173 C 812 172.450, 811.296 172, 810.435 172 C 809.574 172, 806.679 169.750, 804 167 C 801.321 164.250, 798.621 162, 798 162 C 797.379 162, 794.679 159.750, 792 157 C 789.321 154.250, 786.615 152, 785.987 152 C 785.358 152, 783.114 150.200, 781 148 C 778.886 145.800, 776.627 144, 775.980 144 C 775.332 144, 773.541 142.650, 772 141 C 770.459 139.350, 768.221 138, 767.027 138 C 764.588 138, 762 135.834, 762 133.792 C 762 133.049, 762.900 131.793, 764 131 C 765.100 130.207, 766 128.971, 766 128.253 C 766 126.432, 774.613 118, 776.474 118 C 777.313 118, 778 117.550, 778 117 C 778 116.450, 780.250 116, 783 116 C 785.750 116, 788 115.550, 788 115 C 788 114.450, 789.350 114, 791 114 C 792.650 114, 794 113.550, 794 113 C 794 112.450, 795.145 112, 796.545 112 C 797.945 112, 800.195 110.895, 801.545 109.545 C 803.718 107.373, 804 106.223, 804 99.545 L 804 92 801 92 C 799.350 92, 798 91.550, 798 91 C 798 90.450, 797.100 90, 796 90 C 794.900 90, 794 89.550, 794 89 C 794 88.444, 791.333 88, 788 88 C 784.667 88, 782 88.444, 782 89 C 782 89.550, 781.550 90, 781 90 C 780.450 90, 780 88.650, 780 87 C 780 85.350, 779.550 84, 779 84 C 778.450 84, 778 82.650, 778 81 C 778 79.350, 777.550 78, 777 78 C 776.450 78, 776 77.310, 776 76.467 C 776 74.476, 769.524 68, 767.533 68 C 766.690 68, 766 67.550, 766 67 C 766 66.450, 764.313 66.033, 762.250 66.072 C 759.174 66.132, 757.736 66.937, 754.250 70.549 M 258 69 C 258 69.550, 256.200 70, 254 70 C 251.800 70, 250 70.450, 250 71 C 250 71.550, 249.100 72, 248 72 C 246.667 72, 246 72.667, 246 74 C 246 75.100, 246.450 76, 247 76 C 247.550 76, 248 76.707, 248 77.571 C 248 79.932, 250.535 82, 253.429 82 C 254.843 82, 256 82.450, 256 83 C 256 83.550, 256.900 84, 258 84 C 259.100 84, 260 84.450, 260 85 C 260 85.550, 260.450 86, 261 86 C 261.550 86, 262 83.955, 262 81.455 C 262 74.534, 265.011 72, 273.234 72 C 278.411 72, 279.820 72.363, 281 74 C 281.793 75.100, 283.242 76, 284.221 76 C 285.333 76, 286 76.749, 286 78 C 286 79.100, 286.450 80, 287 80 C 289.347 80, 287.834 74.768, 284.533 71.467 L 281.067 68 269.533 68 C 262.511 68, 258 68.391, 258 69 M 394 85 C 394 93, 394.385 98, 395 98 C 395.550 98, 396 98.900, 396 100 C 396 102.369, 396.634 102.509, 398.571 100.571 C 399.393 99.750, 400 97.200, 400 94.571 C 400 90.667, 399.708 90, 398 90 C 396.370 90, 396 89.333, 396 86.401 C 396 83.692, 396.742 82.110, 399 80 C 400.845 78.277, 402 76.197, 402 74.599 C 402 72.234, 401.641 72, 398 72 L 394 72 394 85 M 92 79 C 92 79.550, 90.650 80, 89 80 C 87.350 80, 86 80.450, 86 81 C 86 81.550, 85.293 82, 84.429 82 C 80.762 82, 80 84.483, 80 96.429 C 80 107.333, 80.115 108, 82 108 C 83.100 108, 84 107.550, 84 107 C 84 106.450, 84.900 106, 86 106 C 87.100 106, 88 105.550, 88 105 C 88 104.450, 88.687 104, 89.526 104 C 91.387 104, 100 95.568, 100 93.747 C 100 93.029, 100.900 91.793, 102 91 C 103.174 90.153, 104 88.411, 104 86.779 C 104 85.251, 104.450 84, 105 84 C 105.550 84, 106 82.650, 106 81 L 106 78 99 78 C 95 78, 92 78.429, 92 79 M 600 85 C 600 85.550, 600.900 86, 602 86 C 603.100 86, 604 85.550, 604 85 C 604 84.450, 603.100 84, 602 84 C 600.900 84, 600 84.450, 600 85 M 185.250 89.540 C 183.463 91.412, 182 93.631, 182 94.472 C 182 95.312, 181.550 96, 181 96 C 180.450 96, 180 97.350, 180 99 C 180 100.650, 179.550 102, 179 102 C 178.450 102, 178 104.250, 178 107 C 178 109.750, 177.550 112, 177 112 C 176.352 112, 176 124.667, 176 148 C 176 171.333, 176.352 184, 177 184 C 177.550 184, 178 185.350, 178 187 C 178 188.650, 178.450 190, 179 190 C 179.550 190, 180 190.695, 180 191.545 C 180 192.395, 181.105 194.195, 182.455 195.545 C 186.865 199.956, 198 198.542, 198 193.571 C 198 192.707, 198.450 192, 199 192 C 199.550 192, 200 190.650, 200 189 C 200 187.350, 200.450 186, 201 186 C 201.550 186, 202 184.650, 202 183 C 202 181.350, 201.550 180, 201 180 C 200.450 180, 200 178.200, 200 176 C 200 173.800, 199.550 172, 199 172 C 198.367 172, 198 164.667, 198 152 C 198 139.333, 198.367 132, 199 132 C 199.571 132, 200 129, 200 125 C 200 121, 200.429 118, 201 118 C 201.556 118, 202 115.333, 202 112 C 202 108.667, 202.444 106, 203 106 C 203.565 106, 204 103.156, 204 99.467 C 204 93.345, 203.781 92.715, 200.533 89.467 C 197.619 86.552, 196.384 86.011, 192.783 86.069 C 189.262 86.125, 187.922 86.743, 185.250 89.540 M 600 98.571 C 600 98.886, 600.675 99.818, 601.500 100.643 C 602.833 101.976, 603.167 101.976, 604.500 100.643 C 606.657 98.486, 606.381 98, 603 98 C 601.350 98, 600 98.257, 600 98.571 M 933.250 121.540 C 931.462 123.412, 930 125.871, 930 127.005 C 930 129.401, 936.212 136, 938.467 136 C 939.640 136, 940 137.174, 940 141 C 940 143.750, 940.450 146, 941 146 C 941.556 146, 942 148.667, 942 152 C 942 157.246, 941.759 158, 940.083 158 C 939.029 158, 937.904 158.563, 937.583 159.250 C 937.117 160.250, 936.883 160.250, 936.417 159.250 C 936.071 158.510, 933.916 158, 931.137 158 C 927.589 158, 926.089 158.489, 925 160 C 924.153 161.174, 922.411 162, 920.779 162 C 919.251 162, 918 162.450, 918 163 C 918 163.550, 915.750 164, 913 164 C 910.250 164, 908 164.450, 908 165 C 908 165.550, 907.100 166, 906 166 C 904.900 166, 904 166.450, 904 167 C 904 167.550, 903.100 168, 902 168 C 900.900 168, 900 168.450, 900 169 C 900 169.550, 899.305 170, 898.455 170 C 897.605 170, 895.805 171.105, 894.455 172.455 C 892.568 174.341, 892 175.962, 892 179.455 C 892 181.955, 892.450 184, 893 184 C 893.550 184, 894 185.157, 894 186.571 C 894 190.729, 896.156 192, 903.208 192 C 908.411 192, 909.819 191.639, 911 190 C 911.793 188.900, 913.242 188, 914.221 188 C 915.199 188, 916 187.550, 916 187 C 916 186.450, 917.350 186, 919 186 C 920.650 186, 922 185.550, 922 185 C 922 184.450, 922.900 184, 924 184 C 925.100 184, 926 183.550, 926 183 C 926 182.444, 928.667 182, 932 182 C 935.333 182, 938 181.556, 938 181 C 938 180.450, 938.900 180, 940 180 C 941.100 180, 942 179.550, 942 179 C 942 178.450, 943.350 178, 945 178 C 946.650 178, 948 178.450, 948 179 C 948 179.550, 947.550 180, 947 180 C 946.450 180, 946 182.069, 946 184.599 C 946 188.419, 945.492 189.672, 943 192 C 941.155 193.723, 940 195.803, 940 197.401 C 940 200.727, 939.428 200.670, 936 197 C 934.459 195.350, 932.516 194, 931.682 194 C 930.849 194, 929.981 193.442, 929.753 192.759 C 929.452 191.856, 928.884 191.973, 927.670 193.188 C 925.862 194.995, 925.370 200, 927 200 C 927.589 200, 928 203.515, 928 208.545 C 928 216.285, 928.231 217.322, 930.455 219.545 C 932.940 222.030, 936 222.833, 936 221 C 936 220.450, 937.590 220, 939.533 220 C 942.232 220, 943.886 219.181, 946.533 216.533 C 948.440 214.627, 950 212.377, 950 211.533 C 950 210.690, 950.450 210, 951 210 C 951.550 210, 952 209.100, 952 208 C 952 206.900, 952.450 206, 953 206 C 953.550 206, 954 205.199, 954 204.221 C 954 203.242, 954.900 201.793, 956 201 C 957.393 199.996, 958 198.411, 958 195.779 C 958 193.701, 958.450 192, 959 192 C 959.550 192, 960 190.650, 960 189 C 960 187.350, 959.550 186, 959 186 C 957.443 186, 957.806 177.051, 959.429 175.429 C 960.433 174.424, 963.276 174, 969 174 C 977.945 174, 980 172.986, 980 168.571 C 980 167.157, 980.450 166, 981 166 C 981.550 166, 982 164.650, 982 163 C 982 161.350, 981.550 160, 981 160 C 980.450 160, 980 158.843, 980 157.429 C 980 156.014, 979.357 154.214, 978.571 153.429 C 976.949 151.806, 968 151.443, 968 153 C 968 153.550, 965.750 154, 963 154 C 960.250 154, 958 154.450, 958 155 C 958 156.833, 954.940 156.030, 952.455 153.545 C 949.958 151.049, 948.884 144, 951 144 C 951.550 144, 952 143.100, 952 142 C 952 140.900, 952.450 140, 953 140 C 953.550 140, 954 139.100, 954 138 C 954 136.900, 954.450 136, 955 136 C 955.551 136, 956 133.407, 956 130.221 C 956 125.589, 955.603 124.155, 954 123 C 952.900 122.207, 952 120.758, 952 119.779 C 952 118.221, 951.039 118.009, 944.250 118.069 C 936.776 118.135, 936.384 118.259, 933.250 121.540 M 878.250 124.525 C 877.013 125.847, 876 128.070, 876 129.464 C 876 130.859, 875.550 132, 875 132 C 874.450 132, 874 132.900, 874 134 C 874 135.100, 873.550 136, 873 136 C 872.450 136, 872 137.350, 872 139 C 872 140.650, 871.550 142, 871 142 C 870.450 142, 870 142.900, 870 144 C 870 145.100, 870.450 146, 871 146 C 871.550 146, 872 146.900, 872 148 C 872 149.100, 871.550 150, 871 150 C 870.450 150, 870 150.900, 870 152 C 870 153.100, 870.450 154, 871 154 C 871.550 154, 872 155.140, 872 156.533 C 872 159.083, 877.854 166, 880.012 166 C 881.644 166, 886 161.304, 886 159.545 C 886 158.695, 886.450 158, 887 158 C 887.550 158, 888 155.849, 888 153.221 C 888 149.589, 887.520 148.096, 886 147 C 884.273 145.755, 884 144.411, 884 137.147 C 884 129.834, 884.276 128.495, 886.109 126.905 C 888.007 125.259, 888.065 124.922, 886.681 123.538 C 884.467 121.325, 880.850 121.748, 878.250 124.525 M 246 128.917 C 246 130.521, 245.438 132.035, 244.750 132.282 C 243.902 132.586, 244.224 133.375, 245.750 134.733 C 249.208 137.809, 248.742 142.325, 244.533 146.533 C 242.627 148.440, 240.581 150, 239.988 150 C 238.462 150, 234 154.645, 234 156.234 C 234 156.962, 233.100 158.207, 232 159 C 230.253 160.259, 229.032 166, 230.511 166 C 230.791 166, 236.191 160.830, 242.511 154.511 C 252.799 144.222, 254 142.654, 254 139.511 C 254 137.580, 253.550 136, 253 136 C 252.450 136, 252 134.855, 252 133.455 C 252 131.262, 248.149 126, 246.545 126 C 246.245 126, 246 127.313, 246 128.917 M 406 143 C 406 143.550, 406.450 144, 407 144 C 407.550 144, 408 143.550, 408 143 C 408 142.450, 407.550 142, 407 142 C 406.450 142, 406 142.450, 406 143 M 404 145 C 404 145.550, 404.450 146, 405 146 C 405.550 146, 406 145.550, 406 145 C 406 144.450, 405.550 144, 405 144 C 404.450 144, 404 144.450, 404 145 M 250 161 C 250 161.550, 250.450 162, 251 162 C 251.550 162, 252 161.550, 252 161 C 252 160.450, 251.550 160, 251 160 C 250.450 160, 250 160.450, 250 161 M 449.250 165.496 C 448.563 166.277, 448 167.405, 448 168.003 C 448 170.052, 443.092 174, 440.545 174 C 439.145 174, 438 173.550, 438 173 C 438 172.450, 436.650 172, 435 172 C 433.350 172, 432 172.450, 432 173 C 432 173.550, 430.200 174, 428 174 C 425.800 174, 424 174.450, 424 175 C 424 175.550, 424.450 176, 425 176 C 425.550 176, 426 176.719, 426 177.599 C 426 178.478, 427.350 180.459, 429 182 C 430.650 183.541, 432 185.522, 432 186.401 C 432 187.281, 432.450 188, 433 188 C 433.551 188, 434 190.593, 434 193.779 C 434 198.411, 433.603 199.845, 432 201 C 430.900 201.793, 430 203.242, 430 204.221 C 430 205.199, 429.550 206, 429 206 C 428.450 206, 428 206.801, 428 207.779 C 428 208.758, 427.100 210.207, 426 211 C 424.230 212.276, 423.137 216, 424.533 216 C 425.772 216, 432 208.938, 432 207.533 C 432 206.690, 432.450 206, 433 206 C 433.550 206, 434 205.199, 434 204.221 C 434 203.242, 434.900 201.793, 436 201 C 437.100 200.207, 438 198.758, 438 197.779 C 438 196.801, 438.690 196, 439.533 196 C 441.259 196, 448 202.360, 448 203.988 C 448 204.569, 450.465 207.509, 453.478 210.522 C 457.219 214.263, 459.756 216, 461.478 216 C 462.865 216, 464 216.450, 464 217 C 464 217.550, 466.250 218, 469 218 C 471.750 218, 474 218.450, 474 219 C 474 219.604, 478.190 220, 484.571 220 C 492.574 220, 495.503 219.640, 496.624 218.519 C 497.932 217.211, 497.694 216.627, 494.586 213.519 C 492.589 211.523, 490.066 210, 488.754 210 C 487.482 210, 485.793 209.100, 485 208 C 484.207 206.900, 482.948 206, 482.201 206 C 481.454 206, 479.114 204.200, 477 202 C 474.886 199.800, 472.627 198, 471.980 198 C 471.332 198, 469.541 196.650, 468 195 C 466.459 193.350, 464.668 192, 464.020 192 C 463.373 192, 461.114 190.200, 459 188 C 456.886 185.800, 454.447 184, 453.578 184 C 452.710 184, 452 183.760, 452 183.467 C 452 182.447, 458.940 176, 460.038 176 C 462.115 176, 464 173.145, 464 170 C 464 168.271, 463.357 166.214, 462.571 165.429 C 460.666 163.523, 450.943 163.573, 449.250 165.496 M 414 169 C 414 169.550, 414.450 170, 415 170 C 415.550 170, 416 169.550, 416 169 C 416 168.450, 415.550 168, 415 168 C 414.450 168, 414 168.450, 414 169 M 561.250 187.540 C 558.314 190.615, 558 191.529, 558 197.017 C 558 202.133, 558.387 203.478, 560.455 205.545 C 561.805 206.895, 563.605 208, 564.455 208 C 565.305 208, 566 208.450, 566 209 C 566 210.534, 572.956 210.187, 574.571 208.571 C 575.357 207.786, 576 206.436, 576 205.571 C 576 204.707, 576.450 204, 577 204 C 577.550 204, 578 202.299, 578 200.221 C 578 197.589, 578.607 196.004, 580 195 C 582.400 193.270, 582.581 192, 580.429 192 C 578.408 192, 576 189.592, 576 187.571 C 576 186.667, 575.152 186, 574 186 C 572.900 186, 572 185.550, 572 185 C 572 184.450, 570.313 184.031, 568.250 184.069 C 565.338 184.122, 563.774 184.898, 561.250 187.540 M 614 194 C 614 196.369, 614.634 196.509, 616.571 194.571 C 618.509 192.634, 618.369 192, 616 192 C 614.667 192, 614 192.667, 614 194\" stroke=\"none\" fill=\"currentColor\" fill-rule=\"evenodd\"/>\n</svg>";
const CSS = `
.dsh-cau_pillRow{display:flex;align-items:center;box-sizing:border-box;height:42px;padding:0 6px;min-width:0}
.dsh-cau_pill{--cau-brand:#008038;flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.09));border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.045));color:var(--dsw-alias-label-primary,#e6e8eb);cursor:pointer;transition:background .15s ease,border-color .15s ease;text-align:left}
body[data-ds-dark-theme] .dsh-cau_pill{--cau-brand:#00b856}
.dsh-cau_pill:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.09));border-color:var(--dsw-alias-border-l3,rgba(255,255,255,.18));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pill[aria-expanded='true']{color:var(--cau-brand);border-color:color-mix(in srgb,var(--cau-brand) 55%,transparent);background:color-mix(in srgb,var(--cau-brand) 12%,transparent)}
.dsh-cau_pill[aria-expanded='true']:hover{color:var(--cau-brand);border-color:color-mix(in srgb,var(--cau-brand) 75%,transparent)}
.dsh-cau_pill svg{display:block;width:auto;height:18px;flex:none}
.dsh-cau_pillName{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pillName svg{display:block;width:auto;height:16px}
.dsh-cau_pillCount{flex:none;padding:0 7px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
${panel_1.PANEL_CSS}
${settings_1.SETTINGS_CSS}
${ctxbar_1.CTXBAR_CSS}
${toolview_1.TOOLVIEW_CSS}
`;
function CauButton(props) {
    const wide = !!props?.wide;
    const rowRef = (0, react_1.useRef)(null);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [count, setCount] = (0, react_1.useState)(0);
    // 页面加载即取未读计数（令牌缺失/云端无 summary 时静默为 0）
    (0, react_1.useEffect)(() => {
        let alive = true;
        (0, panel_1.fetchUnreadCount)()
            .then((n) => {
            if (alive)
                setCount(n);
        })
            .catch(() => {
            /* 静默 */
        });
        return () => {
            alive = false;
        };
    }, []);
    // 面板开合 → body 类（驱动聊天区让位收缩，页面充实饱满、不盖对话）
    (0, react_1.useEffect)(() => {
        document.body.classList.toggle('dsh-cau-drawer-open', open);
        return () => {
            document.body.classList.remove('dsh-cau-drawer-open');
        };
    }, [open]);
    // 阶段6：聊天区 toolview 卡片「在面板中打开」→ 展开抽屉（面板挂载后自行跳文章）
    (0, react_1.useEffect)(() => {
        return (0, bus_1.subscribeBus)(() => {
            if ((0, bus_1.getOpenRequest)())
                setOpen(true);
        });
    }, []);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_pillRow", ref: rowRef, children: (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_pill", "aria-label": "\u519C\u5927\u95E8\u6237", "aria-expanded": open, onClick: () => setOpen((o) => !o), title: wide ? undefined : count > 0 ? `农大门户 · ${count} 条未读` : '农大门户', children: [(0, jsx_runtime_1.jsx)("span", { dangerouslySetInnerHTML: { __html: emblemSvg } }), wide && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_pillName", dangerouslySetInnerHTML: { __html: nameSvgCurrent } }), wide && count > 0 && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_pillCount", children: count })] }) }), open && ((0, jsx_runtime_1.jsx)(panel_1.CauPanel, { outsideIgnore: rowRef.current, emblem: emblemSvg, nameSvg: nameSvg, onClose: () => setOpen(false), onUnreadChange: setCount }))] }));
}
exports.inject = ['slots', 'sessions', 'modelDirectories'];
function apply(ctx) {
    // 共享校徽（供上下文条/引用 chip 复用；build 的 emblem token 只在此文件替换）
    ;
    window.__CAU_EMBLEM__ = emblemSvg;
    // 全局错误浮层：插件/面板出错时在屏幕左下角显示红字（原生 DOM，React 崩了也留着）
    ctx.effect(() => {
        const onErr = (e) => {
            const m = String(e?.message || e?.error?.message || e?.reason?.message || e?.reason || e || '');
            if (!m)
                return;
            let el = document.getElementById('dsh-cau-errbar');
            if (!el) {
                el = document.createElement('div');
                el.id = 'dsh-cau-errbar';
                el.setAttribute('style', 'position:fixed;left:8px;bottom:40px;z-index:99999;max-width:72vw;padding:8px 12px;border-radius:8px;background:rgba(160,30,30,.94);color:#fff;font:11px/16px sans-serif;white-space:pre-wrap;box-shadow:0 2px 10px rgba(0,0,0,.3)');
                document.body.appendChild(el);
            }
            el.textContent = 'cau-portal 错误: ' + m;
        };
        window.addEventListener('error', onErr);
        window.addEventListener('unhandledrejection', onErr);
        return () => {
            window.removeEventListener('error', onErr);
            window.removeEventListener('unhandledrejection', onErr);
        };
    }, 'cau-portal: error overlay');
    ctx.effect(() => {
        const style = document.createElement('style');
        style.setAttribute('data-dsh-plugin', 'cau-portal');
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => {
            style.remove();
        };
    }, 'cau-portal: styles');
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'cau-portal',
        order: 100,
    }, CauButton), 'cau-portal: sidebar button');
    // 设置页做成面板内的「设置」页签（用户定案：不进全局 Settings）。
    // 这里只绑定 ctx 供面板树/设置页使用；设置页签名见 panel.tsx（settings 视图）。
    (0, ctx_1.bindCtx)(ctx);
    // 阶段6：阅读上下文附加条（conversation.input.dock，会话级）
    ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'cau-context', order: 50 }, ctxbar_1.CtxBar), 'cau-portal: context bar');
    // 阶段6：工具结果新闻卡片（tool.call.toolview，按 mcp__cau__* 键控）
    (0, toolview_1.registerToolViews)(ctx);
}

return module.exports; } });
