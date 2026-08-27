#!/usr/bin/env node
// AI 批量加工：对 data/articles/ 中 ai==null 且有正文的文章补 AI 元数据（增量幂等）
// 用法：node tools/scraper/enrich.mjs --limit 5 [--force] [--backend deepseek-api|local-ollama] [--model deepseek-v4-flash]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveApiKey, enrichArticle, costOf, logUsage } from './ai.mjs';
import { sleep } from './fetch.mjs';
import { writeIndex, writeSummary } from './crawl.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : d;
};

async function main() {
  const dataDir = arg('data-dir', `${ROOT}/data`);
  const limit = Number(arg('limit', 5));
  const force = process.argv.includes('--force');
  const backend = arg('backend', 'deepseek-api');
  const model = arg('model', 'deepseek-v4-flash');
  const fileArg = arg('file', null);
  const artsDir = `${dataDir}/articles`;
  if (!existsSync(artsDir)) {
    console.log('无 articles 目录，请先跑 crawl');
    return;
  }
  let key = null;
  if (backend === 'deepseek-api') {
    key = resolveApiKey();
    if (!key) {
      console.error('未找到 DEEPSEEK_API_KEY（检查 env / tools/scraper/.env / ~/.dsh/.credentials.yaml）');
      process.exit(1);
    }
  }
  const candidates = readdirSync(artsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ f, a: JSON.parse(readFileSync(`${artsDir}/${f}`, 'utf8')) }))
    .filter(({ f, a }) => a.body && (force || a.ai == null) && (!fileArg || f.startsWith(fileArg)))
    .sort((x, y) => (y.a.time || '').localeCompare(x.a.time || ''))
    .slice(0, limit);
  console.log(`[enrich] 候选 ${candidates.length}（backend=${backend} model=${model}${force ? ' force' : ''}）`);
  let done = 0;
  let cost = 0;
  for (const { f, a } of candidates) {
    try {
      const { ai, usage, model: usedModel } = await enrichArticle(a, { backend, key, model });
      a.ai = ai;
      a.ai_model = usedModel;
      a.ai_time = new Date().toISOString();
      writeFileSync(`${artsDir}/${f}`, JSON.stringify(a, null, 2));
      const c = backend === 'deepseek-api' ? costOf(usedModel, usage) : 0;
      cost += c;
      logUsage(dataDir, {
        ts: new Date().toISOString(),
        backend,
        model: usedModel,
        article: f,
        prompt_tokens: usage?.prompt_tokens ?? 0,
        completion_tokens: usage?.completion_tokens ?? 0,
        cached_tokens: usage?.prompt_cache_hit_tokens ?? 0,
        cost_yuan: +c.toFixed(6),
      });
      done++;
      console.log(
        `[ok   ] ${(a.title || '').slice(0, 34)} | ${ai.category}/${ai.importance}${ai.deadline ? ` | ⏰ ${ai.deadline.item} ${ai.deadline.date}` : ''}${ai.deadline_note ? ` | ⚠${ai.deadline_note}` : ''} | +${c.toFixed(4)}元`
      );
    } catch (e) {
      console.log(`[fail ] ${f}: ${e.message}`);
    }
    await sleep(400);
  }
  console.log(`[done ] 成功 ${done}/${candidates.length}，本次花费 ≈ ${cost.toFixed(4)} 元`);
  writeIndex(dataDir);
  writeSummary(dataDir);
  console.log(`[out  ] ${dataDir}（index.json + summary.json 已刷新）`);
}

main();
