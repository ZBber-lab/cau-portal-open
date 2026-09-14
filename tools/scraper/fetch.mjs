// 公共抓取工具：浏览器 UA + Referer + 超时 + 重试退避（纯 Node，零依赖）
export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 把列表页里的 href 拼成绝对 URL。三种实测过的坑：
 *  ① 博达某些模板给「没有协议、也没有前导斜杠」的写法（实测 clst「耕地保护」栏目：
 *     `clst.cau.edu.cn/art/2022/7/27/art_31133_874591.html`）→ 直接拼会得到
 *     `https://clst.cau.edu.cnclst.cau.edu.cn/...`（fetch failed）。
 *  ② 列表页里的相对链接（`./2026/0609/c1a2/page.htm`）必须相对**该列表页**解析，
 *     不能拿站根做字符串拼接（会拼成 `…/list.htm/2026/...` → 404）。实测浙大苏迪站踩过。
 *  ③ base 既可能是站根（`https://host`）也可能是某个页面 URL —— 统一交给 `new URL` 才都对。
 */
export function absUrl(base, href) {
  const h = String(href ?? '').trim();
  if (!h) return h;
  if (/^https?:\/\//i.test(h)) return h;
  if (h.startsWith('//')) return 'https:' + h;
  // 「host/路径」写法（无协议无斜杠）必须排在 new URL 之前，否则会被当成相对路径拼错
  if (/^[a-z0-9.-]+\.[a-z]{2,}\//i.test(h)) return 'https://' + h;
  const b = String(base ?? '');
  if (/^https?:\/\//i.test(b)) {
    try {
      return new URL(h, b).href; // 根相对 / 目录相对 ./ ../ 全部按标准解析
    } catch {
      /* 退回字符串拼接 */
    }
  }
  return b + (h.startsWith('/') ? h : '/' + h);
}

export async function fetchText(url, { referer = null, timeoutMs = 20000, retries = 2, headers = {} } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(1000 * attempt); // 退避 1s / 2s
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          ...(referer ? { Referer: referer } : {}),
          ...headers,
        },
      });
      const buf = Buffer.from(await res.arrayBuffer());
      return { ok: res.ok, status: res.status, buf, text: buf.toString('utf-8'), finalUrl: res.url };
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(t);
    }
  }
  return { ok: false, error: `${lastErr?.name}: ${lastErr?.message}` };
}
