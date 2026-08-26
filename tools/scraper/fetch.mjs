// 公共抓取工具：浏览器 UA + Referer + 超时 + 重试退避（纯 Node，零依赖）
export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
