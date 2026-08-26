import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import potrace from 'potrace';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawDir = path.join(__dirname, 'brand-raw');
const outDir = path.join(__dirname, 'brand-svg');
const tmpDir = path.join(__dirname, 'tmp');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

const OFFICIAL_GREEN = '#008038';

function loadPng(f) { return PNG.sync.read(fs.readFileSync(f)); }
function loadJpeg(f) {
  const raw = jpeg.decode(fs.readFileSync(f), { useTArray: true, formatAsRGBA: true });
  return { width: raw.width, height: raw.height, data: raw.data };
}
// 二值化：亮度 < thr → 黑(字形)，否则白(背景)
function binarize(img, thr) {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = lum < thr ? 0 : 255;
    d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
  }
}
function contentBbox(img) {
  const d = img.data, w = img.width;
  let minX = w, minY = img.height, maxX = 0, maxY = 0, n = 0;
  for (let y = 0; y < img.height; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4] < 128) {
      n++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  return n === 0 ? null : { minX, minY, maxX, maxY };
}
function crop(img, box, pad = 4) {
  const w = box.maxX - box.minX + 1 + pad * 2, h = box.maxY - box.minY + 1 + pad * 2;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = box.minX - pad + x, sy = box.minY - pad + y;
    if (sx < 0 || sy < 0 || sx >= img.width || sy >= img.height) {
      const di = (y * w + x) * 4;
      out[di] = 255; out[di + 1] = 255; out[di + 2] = 255; out[di + 3] = 255;
      continue;
    }
    const si = (sy * img.width + sx) * 4, di = (y * w + x) * 4;
    out[di] = img.data[si]; out[di + 1] = img.data[si + 1];
    out[di + 2] = img.data[si + 2]; out[di + 3] = 255;
  }
  return { width: w, height: h, data: out };
}
// 最近邻放大（二值安全）
function upscaleNearest(img, k) {
  const w = img.width * k, h = img.height * k;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(Math.floor(x / k), img.width - 1);
    const sy = Math.min(Math.floor(y / k), img.height - 1);
    const si = (sy * img.width + sx) * 4, di = (y * w + x) * 4;
    out[di] = img.data[si]; out[di + 1] = img.data[si + 1];
    out[di + 2] = img.data[si + 2]; out[di + 3] = 255;
  }
  return { width: w, height: h, data: out };
}
function tracePotrace(pngBuffer) {
  return new Promise((resolve, reject) => {
    potrace.trace(pngBuffer, {
      threshold: 128, turnPolicy: 'majority', turdSize: 2,
      alphaMax: 1, optCurve: true, optTolerance: 0.2,
      blackOnWhite: true, color: '#000000', background: 'transparent',
    }, (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}
function cleanPotraceSvg(svg, fillColor) {
  // 去掉可能存在的背景 rect，统一颜色
  let s = svg.replace(/<rect[^>]*\/>|<rect[^>]*><\/rect>/g, '');
  s = s.replace(/fill="#000000"/g, `fill="${fillColor}"`);
  return s;
}
function iouScore(svgStr, refImg) {
  try {
    const r = new Resvg(svgStr);
    const rendered = PNG.sync.read(r.render().asPng());
    let inter = 0, union = 0;
    const n = Math.min(refImg.data.length, rendered.data.length);
    for (let i = 0; i < n; i += 4) {
      const refA = refImg.data[i] < 128 ? 1 : 0;
      const renA = rendered.data[i + 3] > 40 ? 1 : 0;
      if (refA || renA) union++;
      if (refA && renA) inter++;
    }
    return union === 0 ? 1 : Math.round((inter / union) * 1000) / 1000;
  } catch (e) {
    return null;
  }
}

async function makeAsset({ name, load, thr, k, pad }) {
  const img = load();
  binarize(img, thr);
  const box = contentBbox(img);
  if (!box) return null;
  const cropped = crop(img, box, pad);
  const up = upscaleNearest(cropped, k);
  const ref = { width: up.width, height: up.height, data: new Uint8ClampedArray(up.data) };
  const pngBuf = PNG.sync.write(up);
  const tmpFile = path.join(tmpDir, name + '.png');
  fs.writeFileSync(tmpFile, pngBuf);
  const svgRaw = await tracePotrace(pngBuf);
  const mono = cleanPotraceSvg(svgRaw, 'currentColor');
  const green = cleanPotraceSvg(svgRaw, OFFICIAL_GREEN);
  fs.writeFileSync(path.join(outDir, `${name}.svg`), mono);
  fs.writeFileSync(path.join(outDir, `${name}-green.svg`), green);
  return { name, size: mono.length, iou: iouScore(mono, ref), dims: up.width + 'x' + up.height };
}

const results = [];
results.push(await makeAsset({
  name: 'cau-name',
  load: () => loadJpeg(path.join(rawDir, 'a4', 'a4.jpg')),
  thr: 150, k: 2, pad: 6,
}));
results.push(await makeAsset({
  name: 'cau-emblem',
  load: () => loadPng(path.join(rawDir, 'sub016_img1.png')),
  thr: 170, k: 3, pad: 8,
}));
console.log(JSON.stringify(results, null, 2));
