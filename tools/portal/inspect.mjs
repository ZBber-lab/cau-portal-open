// tools/portal/inspect.mjs — 登录后摸「校内通知」结构（本机跑，报告写 tools/portal/inspect-report.txt）
// 用法：node tools/portal/inspect.mjs
import { ensureSession, sessionFetch, SERVICE_URL, PORTAL_HOST } from './engine.mjs';
import { writeFileSync } from 'node:fs';

const report = [];
const say = s => { console.log(s); report.push(s); };

const ens = await ensureSession();
if (!ens.ok) { say('❌ 会话不可用：' + ens.message); say('（请先运行 tools\\portal\\登录.cmd 登录一次）'); writeFileSync('tools/portal/inspect-report.txt', report.join('\n')); process.exit(1); }
say('✅ 会话有效，用户=' + (ens.session?.user || '?'));

/* 1) 门户落地页全貌 */
const page = await sessionFetch(SERVICE_URL);
const html = await page.text();
say(`\n===== [1] 门户落地页 ${SERVICE_URL} =====`);
say(`HTTP ${page.status}  bytes=${html.length}  final=${page.url}`);
const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
say('title=' + title.trim());

/* 2) 页面内所有链接（找通知类） */
const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{0,80}?)<\/a>/gi)]
  .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }))
  .filter(l => l.href && l.href !== '#' && !l.href.startsWith('javascript'));
const noticeLink = links.filter(l => /通知|公告|notice|notice/i.test(l.text + l.href));
say(`\n===== [2] 链接总数 ${links.length}，通知类 ${noticeLink.length} =====`);
noticeLink.slice(0, 25).forEach(l => say(`  ${l.text.slice(0, 40)} -> ${l.href.slice(0, 100)}`));
say('-- 全部链接样例(前 30) --');
links.slice(0, 30).forEach(l => say(`  [${l.text.slice(0, 30)}] ${l.href.slice(0, 100)}`));

/* 3) script/iframe/module 线索 */
const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
const iframes = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
say(`\n===== [3] scripts=${scripts.length} iframes=${iframes.length} =====`);
[...scripts, ...iframes].slice(0, 30).forEach(s => say('  ' + s.slice(0, 140)));
const apiHits = [...html.matchAll(/["'`]((?:https?:)?\/\/[^"'`]*|\/[a-zA-Z0-9_\-]+(?:\/[a-zA-Z0-9_\-]+)+)["'`]/g)]
  .map(m => m[1]).filter(s => /(api|service|json|notice|portal|list)/i.test(s)).slice(0, 40);
say(`-- api线索 --`); [...new Set(apiHits)].forEach(s => say('  ' + s.slice(0, 140)));

/* 4) 常见门户子路径探测（带会话） */
say('\n===== [4] 子路径探测 =====');
const paths = [
  '/tp_up/pc/home', '/tp_up/pc/notice', '/tp_up/pc/index',
  '/tp_up/notice', '/tp_up/news', '/tp_up/message',
  '/tp_up/api/notice', '/tp_up/api/portal/notice',
  '/portal/api/notice', '/portal/notice',
  '/am/notice', '/notice', '/news',
];
for (const p of paths) {
  try {
    const r = await sessionFetch(p, { follow: false });
    const loc = r.headers.get('location') || '-';
    const ct = r.headers.get('content-type') || '-';
    say(`  [${r.status}] ${p}  loc=${loc.slice(0, 90)}  ct=${ct.slice(0, 40)}`);
  } catch (e) { say(`  [ERR] ${p} ${e.message}`); }
}

writeFileSync('tools/portal/inspect-report.txt', report.join('\n'));
console.log('\n报告已存 tools/portal/inspect-report.txt');
