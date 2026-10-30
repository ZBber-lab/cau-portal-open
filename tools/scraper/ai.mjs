// AI 加工后端（可插拔）：deepseek-api（默认，v4-flash 非思考+JSON Output）| local-ollama（预留，零 token 成本）
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sleep } from './fetch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const PRICES = JSON.parse(readFileSync(join(HERE, 'price.json'), 'utf-8'));

export const CATEGORIES = ['通知', '新闻', '讲座', '竞赛', '评奖', '选课', '学术', '其他'];
export const IMPORTANCE = ['低', '中', '高'];

// ---- API key 解析：env → tools/scraper/.env → ~/.dsh/.credentials.yaml（复用 DSH 的 key） ----
export function resolveApiKey() {
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY;
  const envPath = join(ROOT, 'tools', 'scraper', '.env');
  if (existsSync(envPath)) {
    const m = readFileSync(envPath, 'utf8').match(/DEEPSEEK_API_KEY\s*=\s*["']?(sk-[A-Za-z0-9_-]+)["']?/);
    if (m) return m[1];
  }
  // DSH 主目录优先取 DSH_HOME（数据目录搬到别的盘后仍能找到凭据），否则回落 ~/.dsh
  const dshHome = String(process.env.DSH_HOME || '').trim() || join(homedir(), '.dsh');
  const credPath = join(dshHome, '.credentials.yaml');
  if (existsSync(credPath)) {
    const m = readFileSync(credPath, 'utf8').match(/DEEPSEEK_API_KEY:\s*(sk-[A-Za-z0-9_-]+)/);
    if (m) return m[1];
  }
  return null;
}

// ---- 峰谷判定（北京时间；2026-08-23 起周末全天低谷） ----
export function isPeakHour(ts = Date.now()) {
  const bj = new Date(ts + 8 * 3600e3);
  const dow = bj.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  const h = bj.getUTCHours();
  return (h >= 9 && h < 12) || (h >= 14 && h < 18);
}

export function costOf(model, usage = {}, ts = Date.now()) {
  const p = PRICES.models[model] ?? PRICES.models['deepseek-v4-flash'];
  const k = isPeakHour(ts) ? 'peak' : 'off';
  const cached = usage.prompt_cache_hit_tokens ?? usage.cached_tokens ?? 0;
  const uncached = Math.max(0, (usage.prompt_tokens ?? 0) - cached);
  const out = usage.completion_tokens ?? 0;
  return (cached / 1e6) * p.input_cached[k] + (uncached / 1e6) * p.input_uncached[k] + (out / 1e6) * p.output[k];
}

export function logUsage(dataDir, rec) {
  appendFileSync(join(dataDir, 'usage.jsonl'), JSON.stringify(rec) + '\n');
}

// ---- 提示词 ----
const SYSTEM_PROMPT = `你是中国农业大学新闻处理助手。阅读给定文章，输出一个 JSON 对象（只输出 JSON，不要输出任何其他文字）。

JSON 格式示例：
{"summary":"一句话摘要，不超过60个汉字","category":"通知","importance":"中","deadline":{"item":"学校出资类奖学金（含学业）学院报送","date":"2026-11-04","evidence":"11月4日前报送"}或null,"deadlines_extra":[{"item":"崇德先锋、文体优秀奖学材料报校团委","date":"2026-10-30","evidence":"10月30日前报送至校团委"}]}

规则：
1. summary：用中文概括文章核心事项，不超过60字；
2. category：从["通知","新闻","讲座","竞赛","评奖","选课","学术","其他"]中选择最贴切的一个；
3. importance：与学业、评奖评优、考试、报名、缴费、学位授予、选课等切身利益相关的为"高"；一般事务性通知为"中"；常规新闻动态、宣传报道为"低"；
4. deadline：若文中存在明确的截止时间（如"X月X日前""截止至X月X日""于X月X日之前"），给出事项名 item、绝对日期 date（YYYY-MM-DD）和原文表述 evidence（从正文原样摘录包含该时间的那句话片段，20字以内）。
   （1）多截止时选哪一条（重要）：① 与标题所指的**主事项**直接相关的优先于某个分项/单项奖学金/单一人群的节点；② 覆盖整体流程的**最终报送或公示**节点优先于分支节点（例：一份《学校出资类奖学金评选工作通知》里，"11月4日前各单位报送评选结果"应优先于"10月30日崇德先锋、文体优秀材料报校团委"）；③ 仍难区分时取最早的一条。
   （2）item 写法：主体+动作+类型，必须能看出"是谁在办什么事"（如「土地学院2027推免生报名」「研究生奖学金申请」），20字内；若这份通知是**覆盖多个奖项/多项工作的综合通知**，item 必须写主项目的概括名（如「学校出资类奖学金（含学业）学院报送」），**禁止**用某个分项名（如「崇德先锋、文体优秀材料报送」）代表整份通知。
   （3）相对表述（如"下周五""两周内"）需按文章发布时间换算成绝对日期；若年份未写明，使用文章发布时间所在年份。
   （4）deadlines_extra：除主 deadline 之外**其它明确的截止时间**，数组，最多 3 条，元素格式同 deadline，按日期升序；没有就输出 []。与主 deadline 日期相同的不要重复放进去。
   （5）若没有任何明确截止时间：deadline 输出 null，deadlines_extra 输出 []。`;

/**
 * 长正文截取（2026-09-22）：原来是 `slice(0, 3000)` 只接头 3000 字 —— 但通知的截止日期几乎都写在
 * **最后**（「请于X月X日前报送」「公示期至X月X日」）。实测长通知全长 2000–6000 字，
 * 只接头就会把 deadline 切掉（门户「学校出资类奖学金」通知全文 2761 字，截止日期在末尾）。
 * 现在：≤3600 字全送；更长就送「头 2000 + 尾 1500」，保证末尾的截止信息进得了 prompt。
 */
export const BODY_HEAD = 2000;
export const BODY_TAIL = 1500;
export function clipBody(body) {
  const s = String(body || '');
  if (s.length <= BODY_HEAD + BODY_TAIL + 100) return s;
  return s.slice(0, BODY_HEAD) + '\n…（中间省略）…\n' + s.slice(-BODY_TAIL);
}

export function buildUserPrompt(article) {
  const body = clipBody((article.body || '').replace(/\s+/g, ' '));
  return `标题：${article.title || ''}\n发布时间：${article.time || ''}\n来源：${article.source || ''}\n正文：\n${body}`;
}

// ---- DeepSeek API 调用（OpenAI 格式；非思考模式 + JSON Output） ----
async function callDeepseek(key, model, system, user) {
  const body = {
    model,
    thinking: { type: 'disabled' },
    response_format: { type: 'json_object' },
    max_tokens: 1200,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  return { content: data.choices?.[0]?.message?.content ?? '', usage: data.usage ?? null };
}

function parseJson(content) {
  const s = String(content).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// ---- deadline 本地校验（坏 deadline 比没有更害人） ----
/** 单条 deadline 校验：主项与附项共用同一套规则；不通过返回 null */
function normalizeDeadline(d, article) {
  if (!d || typeof d !== 'object' || typeof d.date !== 'string') return null;
  const date = d.date.trim();
  const okFormat = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
  const pub = article.time ? Date.parse(String(article.time).slice(0, 10)) : 0;
  const notPast = !pub || Date.parse(date) >= pub - 24 * 3600e3;
  const evidence = typeof d.evidence === 'string' ? d.evidence.replace(/\s+/g, '') : '';
  const normBody = (article.body || '').replace(/\s+/g, '');
  const evidenceOk = evidence.length >= 3 ? normBody.includes(evidence) : true;
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const md = m ? `${+m[2]}月${+m[3]}日` : '';
  const dateInBody = normBody.includes(date) || (md && normBody.includes(md));
  if (!(okFormat && notPast && (evidenceOk || dateInBody))) return null;
  return { item: typeof d.item === 'string' ? d.item.trim().slice(0, 40) : '', date };
}

export function validateAiResult(raw, article) {
  const out = { summary: '', category: '其他', importance: '低', deadline: null };
  if (typeof raw?.summary === 'string') out.summary = raw.summary.replace(/\s+/g, ' ').trim().slice(0, 60);
  if (CATEGORIES.includes(raw?.category)) out.category = raw.category;
  if (IMPORTANCE.includes(raw?.importance)) out.importance = raw.importance;
  const d = raw?.deadline;
  if (d && typeof d === 'object' && typeof d.date === 'string') {
    const main = normalizeDeadline(d, article);
    if (main) out.deadline = main;
    else out.deadline_note = 'deadline 未通过校验（格式/时间/证据不符），已忽略';
  }
  // 附项（2026-10-20 用户反馈）：一份通知常有多条截止，主项之外的节点保留下来，**只用于文章页展示**，
  // 不进 summary.deadlines（待办仍是一条，不把列表撑长）。
  const extras = [];
  const seen = new Set(out.deadline ? [out.deadline.date] : []);
  const rawExtras = Array.isArray(raw?.deadlines_extra) ? raw.deadlines_extra.slice(0, 3) : [];
  for (const e of rawExtras) {
    const n = normalizeDeadline(e, article);
    if (!n || seen.has(n.date)) continue;
    seen.add(n.date);
    extras.push(n);
  }
  if (extras.length) {
    extras.sort((a, b) => a.date.localeCompare(b.date));
    out.deadlines_extra = extras;
  }
  return out;
}

export async function enrichWithDeepseek(article, { key, model = 'deepseek-v4-flash' } = {}) {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const { content, usage } = await callDeepseek(key, model, SYSTEM_PROMPT, buildUserPrompt(article));
      const parsed = content ? parseJson(content) : null;
      if (parsed) return { ai: validateAiResult(parsed, article), usage, model };
      lastErr = new Error(`第 ${i + 1} 次返回空/非 JSON`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(1000 * (i + 1));
  }
  throw lastErr;
}

// ---- 本地 Ollama 后端（预留，零 token 成本；需本机装 Ollama + qwen3:4b 等模型） ----
export async function enrichWithOllama(article, { model = 'qwen3:4b', baseUrl = 'http://127.0.0.1:11434' } = {}) {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      format: 'json',
      stream: false,
      options: { temperature: 0.2 },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(article) },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  const content = data.message?.content ?? '';
  const parsed = parseJson(content);
  if (!parsed) throw new Error('Ollama 返回空/非 JSON');
  const usage = { prompt_tokens: data.prompt_eval_count ?? 0, completion_tokens: data.eval_count ?? 0, cached_tokens: 0 };
  return { ai: validateAiResult(parsed, article), usage, model };
}

export async function enrichArticle(article, { backend = 'deepseek-api', ...opts } = {}) {
  if (backend === 'local-ollama') return enrichWithOllama(article, opts);
  return enrichWithDeepseek(article, opts);
}
