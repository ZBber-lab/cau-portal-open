// 临时探测4：look 参数全貌 + up/pim 模块 JS + 试接口（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

// 1) msgcenter.js 23-52 行（look 参数）
const js = await (await sessionFetch('/tp_up/resource/js/sys/uacm/msgcenter/msgcenter.js?v=v2.998142')).text();
const lines = js.split('\n');
console.log('===== msgcenter.js L23-52 =====');
for (let i = 22; i < 52 && i < lines.length; i++) console.log(lines[i].trim().slice(0, 160));

// 2) up/pim JS 候选
const cands = [
  '/tp_up/resource/js/up/pim/pim.js?v=v2.998142',
  '/tp_up/resource/js/up/pim/allpim.js?v=v2.998142',
  '/tp_up/resource/js/up/pim/pim_list.js?v=v2.998142',
  '/tp_up/resource/js/up/pim/up_pim.js?v=v2.998142',
  '/tp_up/resource/js/up/up.js?v=v2.998142',
];
for (const p of cands) {
  const r = await sessionFetch(p);
  const t = await r.text();
  console.log(`\n===== ${p} (${r.status}, ${t.length}b) =====`);
  if (r.status === 200 && /url\s*[:=]/.test(t)) {
    const m = [...t.matchAll(/url\s*[:=]\s*(?:contextpath\s*\+\s*)?["']([^"']+)["']/gi)].map(x => x[1]);
    console.log('urls:', [...new Set(m)].slice(0, 20).join('\n'));
    console.log('head:', t.slice(0, 300).replace(/\s+/g, ' '));
  } else if (r.status === 200) {
    console.log('head:', t.slice(0, 200).replace(/\s+/g, ' '));
  }
}

// 3) 试接口（POST 表单 vs GET）
async function tryIt(name, path, opts = {}) {
  try {
    const r = await sessionFetch(path, opts);
    const t = await r.text();
    console.log(`\n[${name}] ${path} -> ${r.status} ${r.headers.get('content-type') || ''}`);
    console.log('body head:', t.slice(0, 500).replace(/\s+/g, ' '));
  } catch (e) {
    console.log(`[${name}] ERR`, e.message);
  }
}
await tryIt('fiveHotMsg', '/tp_up/sys/uacm/msgcenter/fiveHotMsg');
await tryIt('selUnReadCount', '/tp_up/sys/uacm/msgcenter/selUnReadCount');
await tryIt('look-post', '/tp_up/sys/uacm/msgcenter/look', { method: 'POST', body: 'pageSize=5&pageIndex=1' });
console.log('\nDONE');
