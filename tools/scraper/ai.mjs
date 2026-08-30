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
  const credPath = join(homedir(), '.dsh', '.credentials.yaml');
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
{"summary":"一句话摘要，不超过60个汉字","category":"通知","importance":"中","deadline":{"item":"报名","date":"2026-09-01","evidence":"8月27日前提交"}或null}

规则：
1. summary：用中文概括文章核心事项，不超过60字；
2. category：从["通知","新闻","讲座","竞赛","评奖","选课","学术","其他"]中选择最贴切的一个；
3. importance：与学业、评奖评优、考试、报名、缴费、学位授予、选课等切身利益相关的为"高"；一般事务性通知为"中"；常规新闻动态、宣传报道为"低"；
4. deadline：若文中存在明确的截止时间（如"X月X日前""截止至X月X日""于X月X日之前"），给出事项名 item、绝对日期 date（YYYY-MM-DD）和原文表述 evidence（从正文原样摘录包含该时间的那句话片段，20字以内）。item 写法：主体+动作+类型，必须能看出"是谁在办什么事"（如「土地学院2027推免生报名」「研究生奖学金申请」「新生选课确认」，禁止只写「报名」「通知」这类无主体字样），控制在20字内。相对表述（如"下周五""两周内"）需按文章发布时间换算成绝对日期；若年份未写明，使用文章发布时间所在年份；多个截止时间只取最早的一个。若无任何明确截止时间，deadline 输出 null。`;

export function buildUserPrompt(article) {
  const body = (article.body || '').replace(/\s+/g, ' ').slice(0, 3000);
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
export function validateAiResult(raw, article) {
  const out = { summary: '', category: '其他', importance: '低', deadline: null };
  if (typeof raw?.summary === 'string') out.summary = raw.summary.replace(/\s+/g, ' ').trim().slice(0, 60);
  if (CATEGORIES.includes(raw?.category)) out.category = raw.category;
  if (IMPORTANCE.includes(raw?.importance)) out.importance = raw.importance;
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
    const dateInBody = normBody.includes(date) || (md && normBody.includes(md));
    if (okFormat && notPast && (evidenceOk || dateInBody)) {
      out.deadline = { item: typeof d.item === 'string' ? d.item.trim().slice(0, 40) : '', date };
    } else {
      out.deadline_note = 'deadline 未通过校验（格式/时间/证据不符），已忽略';
    }
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
