// 临时探测：挖 msgcenter/common JS 里的 XHR 端点（用完即删）
import { ensureSession, sessionFetch, PORTAL_HOST } from './portal/engine.mjs';

const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }
console.log('session ok');

const jsFiles = [
  '/tp_up/resource/js/sys/uacm/msgcenter/msgcenter_brief.js?v=v2.998142',
  '/tp_up/resource/js/common/common.js?v=v2.998142',
  '/tp_up/resource/js/common/actions.js?v=v2.998142',
  '/tp_up/resource/js/common/menu.js?v=v2.998142',
];
for (const f of jsFiles) {
  const r = await sessionFetch(f);
  const text = await r.text();
  console.log(`\n========== ${f} (${r.status}, ${text.length}b) ==========`);
  // 找 URL/接口线索
  const hits = [];
  const re = /["'`]((?:https?:)?\/\/[^"'`]{2,120}|(?:\.\.?\/)?[a-zA-Z0-9_\-./@]+\.(?:json|do|jsp|html|action|htm)[^"'`]{0,80})["'`]/gi;
  let m;
  while ((m = re.exec(text)) && hits.length < 60) hits.push(m[1]);
  const uniq = [...new Set(hits)];
  uniq.slice(0, 40).forEach(u => console.log('  URL:', u));
  const ajaxHits = [];
  const re2 = /(url\s*:\s*["'`][^"'`]{2,120}["'`]|(?:\.get|\.post|\.ajax)\s*\(\s*["'`][^"'`]{2,120}["'`])/gi;
  let m2;
  while ((m2 = re2.exec(text)) && ajaxHits.length < 40) ajaxHits.push(m2[0].slice(0, 140));
  const ajaxSet = [...new Set(ajaxHits)];
  ajaxSet.slice(0, 25).forEach(u => console.log('  AJAX:', u));
  // 包含 msg/pim/notice/announce 的路径关键词
  const kwMatches = [...text.matchAll(/["'`][^"'`]{0,80}(?:msg|pim|notice|announce|allpim|brief|poll|xmt)[^"'`]{0,80}["'`]/gi)].map(x => x[0].slice(0, 140));
  [...new Set(kwMatches)].slice(0, 30).forEach(u => console.log('  KW:', u));
}
console.log('\nDONE');
