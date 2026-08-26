import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'brand-raw');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36';
const REF = 'https://www.cau.edu.cn/xxgk/whbz/sjsbxt/index.htm';
const target = path.join(outDir, '3AI.rar');
if (fs.existsSync(target) && fs.statSync(target).size > 0) {
  console.log('EXISTS', fs.statSync(target).size);
  process.exit(0);
}
const ctrl = new AbortController();
const timer = setTimeout(() => ctrl.abort(), 600000);
try {
  const r = await fetch('https://www.cau.edu.cn/attach/0/3AI.rar', {
    headers: { 'User-Agent': UA, Referer: REF, Accept: '*/*' },
    redirect: 'follow',
    signal: ctrl.signal,
  });
  if (!r.ok) {
    console.log('FAIL', r.status);
    process.exit(1);
  }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(target, buf);
  console.log('OK', buf.length, 'bytes');
} catch (e) {
  console.log('ERR', e.name, e.message);
  process.exit(1);
} finally {
  clearTimeout(timer);
}
