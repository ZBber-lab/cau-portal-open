// 诊断：session 现状 + 重定向链（用完即删）
import { ensureSession, checkSession, loadSession, sessionFetch, CookieJar } from './portal/engine.mjs';
const s = loadSession();
console.log('saved_at =', s?.saved_at);
console.log('cookies =', (s?.cookies || []).map(c => `${c.name}=${(c.value || '').slice(0, 18)}...`).join('\n'));

const jar = new CookieJar();
jar.cookies = s?.cookies || [];
let cur = 'https://one.cau.edu.cn/tp_up/view?m=up';
for (let i = 0; i < 8; i++) {
  try {
    const r = await sessionFetch(cur, { jar, follow: false });
    const loc = r.headers.get('location') || '';
    console.log(`[${i}] ${r.status} ${cur.slice(0, 80)}  -> loc=${loc.slice(0, 110)}`);
    if (r.status === 302 || r.status === 303) { cur = new URL(loc, 'https://one.cau.edu.cn').href; continue; }
    const body = await r.text();
    console.log(`    final bytes=${body.length} title=${(body.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || ''}`);
    break;
  } catch (e) {
    console.log(`[${i}] ERR ${e.message}`);
    break;
  }
}
const res = await checkSession(s);
console.log('\ncheckSession =', JSON.stringify(res.valid ? { valid: true } : { valid: false, reason: res.reason }));
console.log('DONE');
