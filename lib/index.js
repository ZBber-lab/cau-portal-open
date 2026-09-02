/**
 * cau-portal 服务端 cordis 插件（阶段4 第2步：服务端半区）。
 * - GET  /api/cau/health   健康检查（验证插件加载与 webServer 注入）
 * - POST /api/cau/enrich   按需 AI 加工：DSH ctx.llm 流式调用（无浏览器密钥、无 CORS），
 *   默认 provider=deepseek-official / model=deepseek-v4-flash / reasoningEffort=off
 *   （请求体可覆盖 provider/model），返回摘要/分类/重要度/deadline + 用量。
 */
export const name = 'cau-portal';
export const inject = ['webServer', 'llm'];
const VERSION = '0.1.1';
const SYSTEM_PROMPT = `你是中国农业大学新闻处理助手。阅读给定文章，输出一个 JSON 对象（只输出 JSON，不要输出任何其他文字）。

JSON 格式示例：
{"summary":"一句话摘要，不超过60个汉字","category":"通知","importance":"中","deadline":{"item":"报名","date":"2026-09-01","evidence":"8月27日前提交"}或null}

规则：
1. summary：用中文概括文章核心事项，不超过60字；
2. category：从["通知","新闻","讲座","竞赛","评奖","选课","学术","其他"]中选择最贴切的一个；
3. importance：与学业、评奖评优、考试、报名、缴费、学位授予、选课等切身利益相关的为"高"；一般事务性通知为"中"；常规新闻动态、宣传报道为"低"；
4. deadline：若文中存在明确的截止时间（如"X月X日前""截止至X月X日""于X月X日之前"），给出事项名 item、绝对日期 date（YYYY-MM-DD）和原文表述 evidence（从正文原样摘录包含该时间的那句话片段，20字以内）。item 写法：主体+动作+类型，必须能看出"是谁在办什么事"（如「土地学院2027推免生报名」「研究生奖学金申请」「新生选课确认」，禁止只写「报名」「通知」这类无主体字样），控制在20字内。相对表述（如"下周五""两周内"）需按文章发布时间换算成绝对日期；若年份未写明，使用文章发布时间所在年份；多个截止时间只取最早的一个。若无任何明确截止时间，deadline 输出 null。`;
const CATEGORIES = ['通知', '新闻', '讲座', '竞赛', '评奖', '选课', '学术', '其他'];
const IMPORTANCE = ['高', '中', '低'];
function json(res, status, obj) {
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
    });
    res.end(JSON.stringify(obj));
}
async function readBody(req) {
    const chunks = [];
    for await (const chunk of req)
        chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}
function parseJson(content) {
    const s = String(content)
        .trim()
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/, '')
        .trim();
    try {
        return JSON.parse(s);
    }
    catch {
        return null;
    }
}
/** deadline 本地校验（坏 deadline 比没有更害人；与 tools/scraper/ai.mjs 同规则） */
function validateAiResult(raw, article) {
    const out = { summary: '', category: '其他', importance: '低', deadline: null };
    if (typeof raw?.summary === 'string')
        out.summary = raw.summary.replace(/\s+/g, ' ').trim().slice(0, 60);
    if (CATEGORIES.includes(raw?.category))
        out.category = raw.category;
    if (IMPORTANCE.includes(raw?.importance))
        out.importance = raw.importance;
    const d = raw?.deadline;
    if (d && typeof d === 'object' && typeof d.date === 'string') {
        const date = d.date.trim();
        const okFormat = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
        const pub = article.time ? Date.parse(String(article.time).slice(0, 10)) : 0;
        const notPast = !pub || Date.parse(date) >= pub - 24 * 3600e3;
        const evidence = typeof d.evidence === 'string' ? d.evidence.replace(/\s+/g, '') : '';
        const normBody = (article.body || '').replace(/\s+/g, '');
        const evidenceOk = evidence.length >= 3 ? normBody.includes(evidence) : true;
        const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        const md = m ? `${+m[2]}月${+m[3]}日` : '';
        const dateInBody = normBody.includes(date) || (md ? normBody.includes(md) : false);
        if (okFormat && notPast && (evidenceOk || dateInBody)) {
            out.deadline = { item: typeof d.item === 'string' ? d.item.trim().slice(0, 40) : '', date };
        }
        else {
            out.deadline_note = 'deadline 未通过校验（格式/时间/证据不符），已忽略';
        }
    }
    return out;
}
async function runEnrich(llm, input) {
    const title = String(input.title ?? '').slice(0, 200);
    const body = String(input.content ?? '').replace(/\s+/g, ' ').slice(0, 3000);
    const source = String(input.source ?? '');
    const time = String(input.time ?? '');
    const provider = String(input.provider || 'deepseek-official');
    const model = String(input.model || 'deepseek-v4-flash');
    const user = `标题：${title}\n发布时间：${time}\n来源：${source}\n正文：\n${body}`;
    const options = {
        provider,
        model,
        reasoningEffort: 'off', // 请求级关闭思考模式（deepseek 适配器 effort=off → thinking disabled）
        maxTokens: 1200,
        messages: [
            { role: 'system', content: [{ type: 'text', text: SYSTEM_PROMPT }] },
            { role: 'user', content: [{ type: 'text', text: user }] },
        ],
    };
    let text = '';
    let usage = null;
    let finish = null;
    try {
        for await (const chunk of llm.stream(options)) {
            if (chunk?.type === 'text-delta')
                text += chunk.text;
            else if (chunk?.type === 'usage')
                usage = chunk.usage;
            else if (chunk?.type === 'finish')
                finish = chunk.reason;
        }
    }
    catch (error) {
        return { ok: false, error: String(error?.message ?? error) };
    }
    if (finish?.kind === 'error') {
        return { ok: false, error: String(finish?.failure?.message ?? finish?.failure?.code ?? 'llm error') };
    }
    if (finish?.kind === 'aborted')
        return { ok: false, error: 'aborted' };
    const parsed = text ? parseJson(text) : null;
    if (!parsed)
        return { ok: false, error: '模型未返回有效 JSON', raw: text.slice(0, 400) };
    const result = validateAiResult(parsed, { title, time, body });
    return { ok: true, provider, model, result, tokens: usage };
}
export function apply(ctx) {
    const webServer = ctx?.webServer;
    const llm = ctx?.llm;
    if (!webServer) {
        ctx?.logger?.warn('[cau-portal] ctx.webServer 不可用，跳过服务端路由');
        return;
    }
    webServer.register({
        kind: 'exact',
        path: '/api/cau/health',
        handler: (_req, res) => {
            json(res, 200, { plugin: 'cau-portal', version: VERSION, ok: true, llm: !!llm });
        },
    });
    webServer.register({
        kind: 'exact',
        path: '/api/cau/enrich',
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                json(res, 405, { ok: false, error: 'POST only' });
                return;
            }
            let input = null;
            try {
                const raw = await readBody(req);
                input = raw ? JSON.parse(raw) : {};
            }
            catch {
                json(res, 400, { ok: false, error: 'invalid JSON body' });
                return;
            }
            if (!input?.title && !input?.content) {
                json(res, 400, { ok: false, error: 'title/content required' });
                return;
            }
            if (!llm) {
                json(res, 503, { ok: false, error: 'ctx.llm unavailable' });
                return;
            }
            try {
                const out = await runEnrich(llm, input);
                json(res, out.ok ? 200 : 502, out);
            }
            catch (error) {
                json(res, 500, { ok: false, error: String(error?.message ?? error) });
            }
        },
    });
    webServer.register({
        kind: 'exact',
        path: '/api/cau/data',
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                json(res, 405, { ok: false, error: 'POST only' });
                return;
            }
            let input = null;
            try {
                const raw = await readBody(req);
                input = raw ? JSON.parse(raw) : {};
            }
            catch {
                json(res, 400, { ok: false, error: 'invalid JSON body' });
                return;
            }
            const rel = String(input?.path ?? '');
            const token = String(input?.token ?? '');
            const repo = String(input?.repo ?? 'ZBber-lab/cau-portal').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
            if (!rel || !token) {
                json(res, 400, { ok: false, error: 'path/token required' });
                return;
            }
            // 仓库名白名单格式（owner/repo，仅字母数字 _ - . 与单斜杠，防 SSRF/注入）
            if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
                json(res, 403, { ok: false, error: 'repo not allowed' });
                return;
            }
            // 路径白名单：仅允许读取 data/ 下文件与 sites.json（禁止 .. 逃逸）
            if (rel.includes('..') || !/^(data\/[A-Za-z0-9_\-./]+|sites\.json)$/.test(rel)) {
                json(res, 403, { ok: false, error: 'path not allowed' });
                return;
            }
            try {
                const gh = await fetch(`https://api.github.com/repos/${repo}/contents/${rel}?ref=main`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github.raw',
                        'User-Agent': 'cau-portal-server',
                    },
                });
                if (!gh.ok) {
                    json(res, 502, { ok: false, error: `GitHub ${gh.status}` });
                    return;
                }
                json(res, 200, { ok: true, text: await gh.text() });
            }
            catch (error) {
                json(res, 502, { ok: false, error: String(error?.message ?? error) });
            }
        },
    });
    // ---------- 阶段6：每日邮件报告（本机 SMTP 发送；授权码仅存本机 cau-email/config.json） ----------
    const emailSvc = () => import(new URL('../tools/email/service.mjs', import.meta.url).href);
    webServer.register({
        kind: 'exact',
        path: '/api/cau/email/status',
        handler: async (_req, res) => {
            try {
                const m = await emailSvc();
                json(res, 200, m.statusInfo());
            }
            catch (error) {
                json(res, 500, { ok: false, error: String(error?.message ?? error) });
            }
        },
    });
    webServer.register({
        kind: 'exact',
        path: '/api/cau/email/config',
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                json(res, 405, { ok: false, error: 'POST only' });
                return;
            }
            let input = null;
            try {
                const raw = await readBody(req);
                input = raw ? JSON.parse(raw) : {};
            }
            catch {
                json(res, 400, { ok: false, error: 'invalid JSON body' });
                return;
            }
            try {
                const m = await emailSvc();
                const out = m.updateConfig(input);
                json(res, out.ok ? 200 : 400, out);
            }
            catch (error) {
                json(res, 500, { ok: false, error: String(error?.message ?? error) });
            }
        },
    });
    webServer.register({
        kind: 'exact',
        path: '/api/cau/email/rules',
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                json(res, 405, { ok: false, error: 'POST only' });
                return;
            }
            let input = null;
            try {
                const raw = await readBody(req);
                input = raw ? JSON.parse(raw) : {};
            }
            catch {
                json(res, 400, { ok: false, error: 'invalid JSON body' });
                return;
            }
            try {
                const m = await emailSvc();
                const c = m.loadConfig();
                c.rules = Array.isArray(input?.rules) ? input.rules.slice(0, 60) : c.rules;
                m.saveConfig(c);
                json(res, 200, { ok: true, rulesCount: c.rules.length });
            }
            catch (error) {
                json(res, 500, { ok: false, error: String(error?.message ?? error) });
            }
        },
    });
    webServer.register({
        kind: 'exact',
        path: '/api/cau/email/test',
        handler: async (req, res) => {
            if (req.method !== 'POST') {
                json(res, 405, { ok: false, error: 'POST only' });
                return;
            }
            try {
                const m = await emailSvc();
                if (m.isSending()) {
                    json(res, 200, { ok: false, error: '已有发送任务进行中，请稍候' });
                    return;
                }
                const out = await m.sendReport({ mode: 'test' });
                json(res, out.ok ? 200 : 200, out);
            }
            catch (error) {
                json(res, 500, { ok: false, error: String(error?.message ?? error) });
            }
        },
    });
    // 每日调度：启动（幂等）；日志只记状态，绝不落授权码
    emailSvc()
        .then((m) => m.startEmailScheduler({
        onResult: (r) => {
            const note = r.ok ? `每日邮件报告已发送（${r.why}）` : `每日邮件报告发送失败：${r.error ?? ''}`;
            ctx?.logger?.info(`[cau-portal] ${note}`);
        },
    }))
        .catch((e) => ctx?.logger?.warn(`[cau-portal] 邮件调度启动失败：${String(e?.message ?? e)}`));
    ctx?.logger?.info('[cau-portal] server routes registered: /api/cau/health, /api/cau/enrich, /api/cau/data, /api/cau/email/{status,config,rules,test}');
}
