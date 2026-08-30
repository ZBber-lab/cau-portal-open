// 临时探测5：allpim 链接上下文 + Util.load 实现 + JSON POST 试试（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

// 1) 落地页 allpim 周边（前后 600 字符）
const html = await (await sessionFetch('/tp_up/view?m=up')).text();
let idx = 0;
while ((idx = html.indexOf('allpim', idx)) !== -1) {
  console.log('===== allpim 上下文 @' + idx + ' =====');
  console.log(html.slice(Math.max(0, idx - 400), idx + 400).replace(/\s+/g, ' '));
  console.log();
  idx += 6;
}

// 2) Util.load 实现（resource/plugin/common.js 可能很大，只抓含 load 的函数体）
const cjs = await (await sessionFetch('/tp_up/resource/plugin/common.js?v=v2.998142')).text();
console.log('common.js bytes=', cjs.length);
const loadRe = /(load\s*[:=]\s*function[\s\S]{0,800}|load\s*:\s*\([^)]*\)[\s\S]{0,600})/i;
const lm = cjs.match(loadRe);
if (lm) console.log('load impl:', lm[0].slice(0, 900));
// getPageObjList / ajax 实现（POST JSON?）
for (const name of ['getPageObjList', 'ajax']) {
  const re = new RegExp('(function' + name + '[\\s\\S]{0,500}|' + name + '\\s*[:=]\\s*function[\\s\\S]{0,500})', 'i');
  const m = cjs.match(re);
  if (m) { console.log(`\n--- ${name} impl ---`); console.log(m[0].slice(0, 700)); }
}

// 3) fiveHotMsg 用 POST 试试（JSON 空参）
async function tryIt(name, path, body = null, headers = {}) {
  try {
    const r = await sessionFetch(path, {
      method: 'POST',
      body,
      headers,
    });
    const t = await r.text();
    console.log(`\n[${name}] ${path} -> ${r.status} ${r.headers.get('content-type') || ''}`);
    console.log('body head:', t.slice(0, 700).replace(/\s+/g, ' '));
  } catch (e) {
    console.log(`[${name}] ERR`, e.message);
  }
}
await tryIt('fiveHotMsg-json', '/tp_up/sys/uacm/msgcenter/fiveHotMsg', '{}', { 'Content-Type': 'application/json' });
await tryIt('look-json', '/tp_up/sys/uacm/msgcenter/look', '{"pageNum":1,"pageSize":10}', { 'Content-Type': 'application/json' });
console.log('\nDONE');
