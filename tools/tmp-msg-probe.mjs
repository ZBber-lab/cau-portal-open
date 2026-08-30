// 临时探测2：msgcenter 端点构造 + 试调（用完即删）
import { ensureSession, sessionFetch, PORTAL_HOST } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

const brief = await (await sessionFetch('/tp_up/resource/js/sys/uacm/msgcenter/msgcenter_brief.js?v=v2.998142')).text();
console.log('===== msgcenter_brief.js 全文 =====');
console.log(brief);

// 找全量 msgcenter 模块 JS
for (const p of ['/tp_up/resource/js/sys/uacm/msgcenter/msgcenter.js?v=v2.998142', '/tp_up/resource/js/sys/uacm/msgcenter/msgcenter_list.js?v=v2.998142']) {
  const r = await sessionFetch(p);
  const t = await r.text();
  console.log(`\n===== ${p} (${r.status}, ${t.length}b) =====`);
  if (r.status === 200 && t.length < 8000) console.log(t.slice(0, 4000));
  else if (r.status === 200) {
    const m = [...t.matchAll(/["'`](\/?(?:[a-zA-Z0-9_\-/]+\.(?:do|json|jsp|html|action))[^"'`]{0,80})["'`]/gi)].map(x => x[1]);
    console.log('URLs:', [...new Set(m)].slice(0, 30).join('\n'));
  }
}
console.log('\nDONE');
