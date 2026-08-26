import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'brand-raw');
fs.mkdirSync(outDir, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36';
const REF = 'https://www.cau.edu.cn/xxgk/whbz/sjsbxt/index.htm';
const base = 'https://www.cau.edu.cn';
const files = [
  '/attach/0/1VI.rar',
  '/attach/0/2JPG.rar',
  '/attach/0/3AI.rar',
  '/attach/0/a1.rar',
  '/attach/0/a2.rar',
  '/attach/0/a3.rar',
  '/attach/0/a4.rar',
  '/attach/0/1505290911188697283.pdf',
  '/attach/0/1601031634510286090.pdf',
];

async function dl(url, name) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 180000);
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, 'Referer': REF, 'Accept': '*/*' },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    if (!r.ok) {
      console.log('FAIL', r.status, name);
      return;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(outDir, name), buf);
    console.log('OK', String(buf.length).padStart(9), name, r.headers.get('content-type'));
  } catch (e) {
    console.log('ERR', name, e.name, e.message);
  } finally {
    clearTimeout(timer);
  }
}

for (const f of files) {
  const name = f.split('/').pop();
  const target = path.join(outDir, name);
  if (fs.existsSync(target) && fs.statSync(target).size > 0) {
    console.log('SKIP (exists)', name, fs.statSync(target).size);
    continue;
  }
  await dl(base + f, name);
  await new Promise((r) => setTimeout(r, 500));
}
console.log('DONE');
