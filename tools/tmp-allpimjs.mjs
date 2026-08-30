// 临时探测8：allpimdpmlist.js 列表接口（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }
const js = await (await sessionFetch('/tp_up/resource/js/up/pim/allpim/allpimdpmlist.js?v=v2.998142')).text();
console.log(`bytes=${js.length}`);
console.log(js);
console.log('DONE');
