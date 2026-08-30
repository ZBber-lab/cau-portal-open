// 临时探测10：单 jar：先 GET 页面（吸收新 cookie）再 POST 接口（用完即删）
import { ensureSession, sessionFetch, CookieJar, loadSession } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

const jar = new CookieJar();
jar.cookies = loadSession().cookies;

// 1) GET 目标/入口页吸收 Set-Cookie
for (const p of ['/tp_up/up/pim/allpim', '/tp_up/view?m=up']) {
  const r = await sessionFetch(p, { jar });
  const t = await r.text();
  console.log(`GET ${p} -> ${r.status} bytes=${t.length} jarCookies=${jar.cookies.map(c => c.name).join(',')}`);
}

const H = {
  'Content-Type': 'application/json;charset=utf-8',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://one.cau.edu.cn/tp_up/view?m=up',
  'Origin': 'https://one.cau.edu.cn',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
};
const r2 = await sessionFetch('/tp_up/up/pim/allpim/getAllPimList', {
  jar, method: 'POST', body: JSON.stringify({ two: 'yes', pageNum: 1, pageSize: 5 }), headers: H,
});
const t2 = await r2.text();
console.log(`\nPOST getAllPimList -> ${r2.status} ${r2.headers.get('content-type') || ''} bytes=${t2.length}`);
console.log(t2.slice(0, 1500));
console.log('\nDONE');
