// 临时探测3：contextpath 定义 + msgcenter.js 接口结构（用完即删）
import { ensureSession, sessionFetch } from './portal/engine.mjs';
const ens = await ensureSession();
if (!ens.ok) { console.log('SESSION BAD:', ens.message); process.exit(1); }

// 1) 落地页：contextpath / 全局变量定义
const html = await (await sessionFetch('/tp_up/view?m=up')).text();
for (const re of [/contextpath\s*=\s*["'][^"']+["']/i, /ctx\s*=\s*["'][^"']+["']/i, /basePath\s*=\s*["'][^"']+["']/i, /"pim"[\s\S]{0,80}/i, /allpim[\s\S]{0,60}/i]) {
  const m = html.match(re);
  if (m) console.log('HTML:', m[0].slice(0, 160));
}
console.log('--- HTML 中 up/pim 或 msgcenter 引用 ---');
const lines = html.split('\n').filter(l => /pim|msgcenter|allpim|contextpath/i.test(l)).slice(0, 25);
lines.forEach(l => console.log(l.trim().slice(0, 200)));

// 2) msgcenter.js 中 url 与分页相关
const js = await (await sessionFetch('/tp_up/resource/js/sys/uacm/msgcenter/msgcenter.js?v=v2.998142')).text();
console.log('\n--- msgcenter.js 关键行 ---');
const jsLines = js.split('\n');
jsLines.forEach((l, i) => {
  if (/url\s*:|msgcenter|listPage|allMsg|query|pageIndex|pageSize|pagination|allList|pageList/i.test(l)) {
    console.log(`${String(i + 1).padStart(4)}: ${l.trim().slice(0, 220)}`);
  }
});
console.log('\nDONE');
