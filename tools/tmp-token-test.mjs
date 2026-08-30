// 临时探测13：ajaxSetup/ajaxSend 中的 token 注入（用完即删）
import { ensureSession, sessionFetch, CookieJar, loadSession } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }
const jar = new CookieJar();
jar.cookies = loadSession().cookies;

const cjs = await (await sessionFetch('/tp_up/resource/plugin/common.js?v=v2.998142', { jar })).text();
for (const src of [/ajaxSetup[\s\S]{0,400}/i, /ajaxSend[\s\S]{0,300}/i, /token[\s\S]{0,200}/i]) {
  const re = new RegExp(src.source, src.flags + 'g');
  const hits = [...cjs.matchAll(re)];
  hits.slice(0, 4).forEach((m, i) => console.log(`--- match#${i} ---\n${m[0].slice(0, 400)}\n`));
}

// token 参数加到 body 再试
async function t(name, url, opts) {
  try {
    const r = await sessionFetch(url, { ...opts, jar });
    const b = await r.text();
    console.log(`[${name}] -> ${r.status} ${b.slice(0, 600).replace(/\s+/g, ' ')}`);
  } catch (e) { console.log(`[${name}] ERR ${e.message}`); }
}
const tok = await (await sessionFetch('/tp_up/getToken', { method: 'POST', jar })).text();
console.log('token =', tok.slice(0, 40));
await t('with-token-in-body', '/tp_up/up/pim/allpim/getAllPimList', {
  method: 'POST',
  body: JSON.stringify({ two: 'yes', pageNum: 1, pageSize: 5, token: tok.trim() }),
  headers: { 'Content-Type': 'application/json;charset=utf-8', 'X-Requested-With': 'XMLHttpRequest' },
});
await t('with-token-header', '/tp_up/up/pim/allpim/getAllPimList', {
  method: 'POST',
  body: '{"two":"yes","pageNum":1,"pageSize":5}',
  headers: { 'Content-Type': 'application/json;charset=utf-8', 'X-Requested-With': 'XMLHttpRequest', 'token': tok.trim() },
});
console.log('DONE');
