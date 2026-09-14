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

/**
 * 抓一个页面。**跨洋重试**（2026-09-14 实测教训）：GitHub Actions 的 runner 在境外，
 * 抓国内教育网站点（浙大 gs/cers）时同一次运行里有的列表页成功、有的直接
 * `TypeError: fetch failed` —— 不是解析器问题，是链路丢包。因此默认放宽到
 * 5 次尝试（retries=4）+ 30s 超时 + 退避上限 8s；失败型错误通常几百毫秒就返回，
 * 多试几次成本很低。单次调用仍可用 `{ retries, timeoutMs }` 覆盖。
 */
export async function fetchText(url, { referer = null, timeoutMs = 30000, retries = 4, headers = {} } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(Math.min(8000, 1500 * attempt)); // 退避 1.5s / 3s / 4.5s / 6s（上限 8s）
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
  // 失败信息带上底层原因（ETIMEDOUT / ECONNRESET / EAI_AGAIN …）与尝试次数 —— 只看
  // 「TypeError: fetch failed」分不清是超时、被重置还是 DNS 挂了（Actions 日志实测）
  const cause = lastErr?.cause;
  const detail = cause?.code || cause?.message || '';
  return { ok: false, error: `${lastErr?.name}: ${lastErr?.message}${detail ? ` (${detail})` : ''}，已尝试 ${retries + 1} 次` };
}
