// 临时探测14：all.mini.js 里的 ajax 相关覆盖/过滤逻辑（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

const r = await sessionFetch('/tp_up/resource/plugin/all.mini.js?v=v2.998142');
const t = await r.text();
console.log('all.mini.js', r.status, 'bytes=', t.length);
// 找 Util.ajax / ajax 定义出现位置
const markers = [];
for (const m of t.matchAll(/ajax\s*:\s*function|Util\s*=\s*\{|\.ajaxSetup|ajaxSend|beforeSend|415|contentType/g)) {
  markers.push(m.index);
}
console.log('markers:', markers.slice(0, 30));
// 打印第一个 ajax : function 定义附近代码
const i = t.indexOf('ajax: function');
if (i < 0) console.log('no "ajax: function"');
else {
  console.log('--- ajax: function 上下文 ---');
  console.log(t.slice(i, i + 800));
}
// 检查是否有 requestFilter / interceptor
for (const kw of ['beforeSend', 'ajaxSend', 'ajaxSetup', 'X-Requested-With', '415']) {
  const idx = t.indexOf(kw);
  console.log(`kw ${kw}:`, idx >= 0 ? `@${idx} ${t.slice(Math.max(0, idx - 100), idx + 200).replace(/\s+/g, ' ')}` : 'not found');
}
console.log('DONE');
