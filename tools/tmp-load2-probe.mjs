// 临时探测6：Util.load 完整实现 + 正确 Content-Type 重试 + 服务器路由直探（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

const cjs = await (await sessionFetch('/tp_up/resource/plugin/common.js?v=v2.998142')).text();
const idx = cjs.indexOf('load : function(url');
if (idx >= 0) {
  console.log('===== Util.load 完整实现 =====');
  console.log(cjs.slice(idx, idx + 2600).replace(/^\s+/gm, ''));
}

// 正确 Content-Type 重试
const CT = 'application/json;charset=utf-8';
async function tryIt(name, path, body) {
  try {
    const r = await sessionFetch(path, { method: 'POST', body, headers: { 'Content-Type': CT } });
    const t = await r.text();
    console.log(`\n[${name}] -> ${r.status} ${r.headers.get('content-type') || ''} bytes=${t.length}`);
    console.log('body:', t.slice(0, 900).replace(/\s+/g, ' '));
  } catch (e) { console.log(`[${name}] ERR`, e.message); }
}
await tryIt('fiveHotMsg', '/tp_up/sys/uacm/msgcenter/fiveHotMsg', '{}');
await tryIt('look', '/tp_up/sys/uacm/msgcenter/look', '{"pageNum":1,"pageSize":10,"MC_TYPE":"","IS_READ":"","WHICH_SYS":""}');
await tryIt('selUnReadCount', '/tp_up/sys/uacm/msgcenter/selUnReadCount', '{}');

// 服务器路由直探（pim）
async function tryGet(name, path) {
  try {
    const r = await sessionFetch(path, { follow: false });
    const t = await r.text();
    console.log(`\n[g:${name}] -> ${r.status} ${r.headers.get('content-type') || ''} bytes=${t.length}`);
    console.log('body:', t.slice(0, 500).replace(/\s+/g, ' '));
  } catch (e) { console.log(`[g:${name}] ERR`, e.message); }
}
await tryGet('allpim', '/tp_up/up/pim/allpim');
await tryGet('allpim-page', '/tp_up/up/pim/allpim?pageNum=1&pageSize=5');
await tryGet('pim-root', '/tp_up/up/pim');
await tryGet('up-root', '/tp_up/up');
console.log('\nDONE');
