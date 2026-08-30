// 临时探测15：绕过 sessionFetch，直接 fetch + 精确 application/json（用完即删）
import { loadSession } from './portal/engine.mjs';

const s = loadSession();
const jar = s.cookies.filter(c => !!c.value);
const host = 'one.cau.edu.cn';
const cookie = jar.filter(c => c.domain === host || host.endsWith('.' + c.domain))
  .map(c => `${c.name}=${c.value}`).join('; ');

async function post(name, headers, body) {
  try {
    const r = await fetch('https://' + host + '/tp_up/up/pim/allpim/getAllPimList', {
      method: 'POST',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', Cookie: cookie, ...headers },
      body,
      signal: AbortSignal.timeout(25000),
    });
    const t = await r.text();
    console.log(`[${name}] -> ${r.status} ${r.headers.get('content-type') || ''} bytes=${t.length}`);
    console.log(t.slice(0, 1000));
  } catch (e) { console.log(`[${name}] ERR ${e.message}`); }
}

const jsonBody = JSON.stringify({ two: 'yes', pageNum: 1, pageSize: 5 });
await post('json-exact', { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://one.cau.edu.cn/tp_up/view?m=up' }, jsonBody);
console.log('\nDONE');
