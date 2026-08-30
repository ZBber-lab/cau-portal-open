// 临时探测7：allpim 模板全文（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }
const t = await (await sessionFetch('/tp_up/up/pim/allpim')).text();
console.log(t);
console.log('\nDONE');
