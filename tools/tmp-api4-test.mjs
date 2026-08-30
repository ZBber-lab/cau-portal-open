// 临时探测12：对照组 + Sec-Fetch 头（用完即删）
import { ensureSession, sessionFetch, CookieJar, loadSession } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }
const jar = new CookieJar();
jar.cookies = loadSession().cookies;

async function t(name, url, opts) {
  try {
    const r = await sessionFetch(url, { ...opts, jar });
    const b = await r.text();
    console.log(`[${name}] -> ${r.status} ${r.headers.get('content-type') || ''} ${b.slice(0, 260).replace(/\s+/g, ' ')}`);
  } catch (e) { console.log(`[${name}] ERR ${e.message}`); }
}

// 对照组：getToken（POST 无 body —— 若这也挂=全站 POST 被拦）
await t('getToken-nobody', '/tp_up/getToken', { method: 'POST' });
await t('getToken-form', '/tp_up/getToken', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' } });

// Sec-Fetch 全套
await t('json-secfetch', '/tp_up/up/pim/allpim/getAllPimList', {
  method: 'POST',
  body: '{"two":"yes","pageNum":1,"pageSize":5}',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://one.cau.edu.cn/tp_up/view?m=up',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Dest': 'empty',
    'sec-ch-ua': '"Not?A_Brand";v="99", "Chromium";v="126", "Google Chrome";v="126"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  },
});
console.log('DONE');
