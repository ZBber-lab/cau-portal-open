// 临时探测9：getAllPimList 实调（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

const H = {
  'Content-Type': 'application/json;charset=utf-8',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://one.cau.edu.cn/tp_up/view?m=up',
  'Origin': 'https://one.cau.edu.cn',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
};
async function tryIt(name, path, body) {
  try {
    const r = await sessionFetch(path, { method: 'POST', body, headers: H });
    const t = await r.text();
    console.log(`\n[${name}] -> ${r.status} ${r.headers.get('content-type') || ''} bytes=${t.length}`);
    console.log(t.slice(0, 1200));
  } catch (e) { console.log(`[${name}] ERR`, e.message); }
}
await tryIt('getAllPimList', '/tp_up/up/pim/allpim/getAllPimList', JSON.stringify({ two: 'yes', pageNum: 1, pageSize: 5 }));
await tryIt('getSelectPimType', '/tp_up/up/pim/allpim/getSelectPimType', JSON.stringify({ two: 'yes' }));
console.log('\nDONE');
