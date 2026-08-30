// 临时探测11：请求矩阵（用完即删）
import { ensureSession, sessionFetch, CookieJar, loadSession } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }
const jar = new CookieJar();
jar.cookies = loadSession().cookies;

const URL_ = '/tp_up/up/pim/allpim/getAllPimList';
async function t(name, opts) {
  try {
    const r = await sessionFetch(URL_, { ...opts, jar });
    const b = await r.text();
    console.log(`[${name}] -> ${r.status} ${b.slice(0, 200).replace(/\s+/g, ' ')}`);
  } catch (e) { console.log(`[${name}] ERR ${e.message}`); }
}
await t('form-urlencoded', {
  method: 'POST',
  body: 'two=yes&pageNum=1&pageSize=5',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
});
await t('json-min-headers', {
  method: 'POST',
  body: '{"two":"yes","pageNum":1,"pageSize":5}',
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
});
await t('json-no-origin', {
  method: 'POST',
  body: '{"two":"yes","pageNum":1,"pageSize":5}',
  headers: { 'Content-Type': 'application/json;charset=utf-8', 'X-Requested-With': 'XMLHttpRequest', Referer: 'https://one.cau.edu.cn/tp_up/view?m=up' },
});

// getToken 实现
const cjs = await (await sessionFetch('/tp_up/resource/plugin/common.js?v=v2.998142', { jar })).text();
const gi = cjs.indexOf('getToken');
console.log('\n--- getToken 上下文 ---');
if (gi > 0) console.log(cjs.slice(gi - 100, gi + 700));
console.log('\nDONE');
