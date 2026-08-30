// tools/portal/engine.mjs — 农大门户「统一门户」引擎（本机专用）
// 功能：3DES 加密登录（onecas CAS）、会话 cookie 存取、登录态探活、HTTP 抓取助手。
// 安全：账号密码仅存本机 gitignore 文件（tools/portal/account.json）；
//       会话 cookie 仅存本机 gitignore 文件（tools/portal/session.json）；均不进仓库/对话/日志。
// 来源：strEnc 3DES 实现为 onecas 登录页 /tpass/comm/js/des.js 原样抓取（tools/portal/des.js），
//       按页面 login6.js 的调用方式复刻：rsa = strEnc(username + password + lt, '1', '2', '3')。
//       注意：des.js 是浏览器非严格模式代码（隐式全局变量），故用 new Function（默认非严格）包装加载，
//       与页面执行环境行为一致；Node ESM 严格模式直接加载会炸（实测 ReferenceError）。

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const _dir = dirname(fileURLToPath(import.meta.url));
const _desSrc = readFileSync(join(_dir, 'des.js'), 'utf8');
const { strEnc } = new Function(_desSrc + '\n; return { strEnc: strEnc };')();
export const SESSION_FILE = join(_dir, 'session.json');
export const ACCOUNT_FILE = join(_dir, 'account.json');

export const CAS_HOST = 'https://onecas.cau.edu.cn';
export const PORTAL_HOST = 'https://one.cau.edu.cn';
export const SERVICE_URL = PORTAL_HOST + '/tp_up/view?m=up';   // 门户内核入口（登录后 land 在此）
export const LOGIN_URL = CAS_HOST + '/tpass/login?service=' + encodeURIComponent(SERVICE_URL);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/* ---------------- 极简 CookieJar（RFC6265 够用子集） ---------------- */
export class CookieJar {
  constructor() { this.cookies = []; }
  store(url, setCookieHeaders) {
    if (!setCookieHeaders) return;
    const { host } = new URL(url);
    for (const sc of setCookieHeaders) {
      const parts = sc.split(';');
      const [name, ...rest] = parts[0].split('=');
      if (!name) continue;
      let domain = host, path = '/', expires = null;
      for (const p of parts.slice(1)) {
        const [k, v] = p.trim().split('=');
        const kk = k.toLowerCase();
        if (kk === 'domain') domain = (v || '').trim().toLowerCase().replace(/^\./, '');
        else if (kk === 'path') path = (v || '/').trim();
        else if (kk === 'expires') expires = Date.parse(v || '');
      }
      const idx = this.cookies.findIndex(c => c.name === name && c.domain === domain && c.path === path);
      const c = { name, value: rest.join('='), domain, path, expires };
      if (idx >= 0) this.cookies[idx] = c; else this.cookies.push(c);
    }
  }
  headerFor(url) {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname;
    return this.cookies
      .filter(c => !!c.value && !(c.expires && c.expires <= Date.now()) &&
        (host === c.domain || host.endsWith('.' + c.domain)) &&
        (path === c.path || path.startsWith(c.path)))
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
  }
}

/* ---------------- 带 CookieJar 的 fetch ---------------- */
async function f(url, { jar = null, redirect = 'follow', method = 'GET', body = null, headers = {} } = {}) {
  const h = { 'User-Agent': UA, ...headers };
  if (jar) {
    const c = jar.headerFor(url);
    if (c) h['Cookie'] = c;
  }
  const r = await fetch(url, { method, redirect, headers: h, body, signal: AbortSignal.timeout(25000) });
  if (jar) jar.store(url, r.headers.getSetCookie ? r.headers.getSetCookie() : splitSetCookie(r.headers.get('set-cookie')));
  return r;
}
function splitSetCookie(v) { return v ? v.split(/,(?=[^;,]+=)/) : []; }

/* ---------------- 会话存取 ---------------- */
export function loadSession() {
  try { return JSON.parse(readFileSync(SESSION_FILE, 'utf8')); } catch { return null; }
}
export function saveSession(session) {
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
}
export function loadAccount() {
  try {
    const a = JSON.parse(readFileSync(ACCOUNT_FILE, 'utf8'));
    if (a && a.username && a.pwd_b64) return a;
    return null;
  } catch { return null; }
}
export function saveAccount(username, password) {
  writeFileSync(ACCOUNT_FILE, JSON.stringify({ username, pwd_b64: Buffer.from(password, 'utf8').toString('base64') }, null, 2));
}
export function clearAccount() {
  if (existsSync(ACCOUNT_FILE)) writeFileSync(ACCOUNT_FILE, JSON.stringify({ username: null, pwd_b64: null }, null, 2));
}
export function clearSession() {
  if (existsSync(SESSION_FILE)) writeFileSync(SESSION_FILE, JSON.stringify({ cleared: true }, null, 2));
}
function accountPassword(a) { return Buffer.from(a.pwd_b64, 'base64').toString('utf8'); }

/* ---------------- 状态汇总（供面板显示，不触发重登） ---------------- */
export async function statusInfo() {
  const acc = loadAccount();
  const s = loadSession();
  let valid = false;
  if (s && Array.isArray(s.cookies) && s.cookies.length) {
    try { valid = (await checkSession(s)).valid; } catch { valid = false; }
  }
  return {
    loggedIn: valid,
    user: (valid && s?.user) || acc?.username || null,
    accountSaved: !!acc && !!acc?.username && !!acc?.pwd_b64,
    sessionAt: s?.saved_at || null,
  };
}

/* ---------------- 登录 ---------------- */
// 从登录页 HTML 解析隐藏字段 lt / execution
function parseLoginForm(html) {
  const lt = (html.match(/id=['"]lt['"][^>]*value=['"]([^'"]+)['"]/) || [])[1]
          || (html.match(/name=['"]lt['"][^>]*value=['"]([^'"]+)['"]/) || [])[1];
  const execution = (html.match(/name=['"]execution['"][^>]*value=['"]([^'"]+)['"]/) || [])[1]
                 || (html.match(/id=['"]execution['"][^>]*value=['"]([^'"]+)['"]/) || [])[1];
  return { lt: lt || '', execution: execution || 'e1s1' };
}

// 完整登录：返回 { ok, session, message?, fallbackHtml? }
// session = { saved_at, cookies: string(JSON), user: username }
export async function login(username, password, { save = true } = {}) {
  const jar = new CookieJar();
  // 1) GET 登录页（拿 lt/execution + 会话 cookie）
  const page = await f(LOGIN_URL, { jar, redirect: 'follow' });
  const html = await page.text();
  if (!page.ok || !html.includes('loginForm')) {
    return { ok: false, message: `登录页获取失败（HTTP ${page.status}）`, jar };
  }
  const { lt, execution } = parseLoginForm(html);
  if (!lt) return { ok: false, message: '登录页未找到 lt 票据字段（页面结构可能变更）', jar };

  // 2) 3DES 加密 payload（与 login6.js 完全一致）
  const rsa = strEnc(username + password + lt, '1', '2', '3');
  const body = new URLSearchParams({
    rsa,
    ul: String(username.length),
    pl: String(password.length),
    sl: '0',
    lt,
    execution,
    _eventId: 'submit',
    un: username,
    pd: password,
    rememberMe: 'on',
  }).toString();

  // 3) POST 提交（不跟随，拿 302 Location）
  const post = await f(LOGIN_URL, {
    jar, redirect: 'manual', method: 'POST', body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': CAS_HOST,
      'Referer': LOGIN_URL,
    },
  });
  const loc = post.headers.get('location') || '';
  const postText = post.status !== 302 && post.status !== 303 ? await post.text().catch(() => '') : '';

  if ((post.status === 302 || post.status === 303) && /ticket=ST-/.test(loc)) {
    // 4) 带 ticket 访问服务地址 → 302 回门户（此步设置 one.cau.edu.cn 会话 cookie）
    let cur = loc;
    for (let i = 0; i < 6; i++) {
      const r = await f(cur, { jar, redirect: 'manual' });
      if (r.status === 302 || r.status === 303) { cur = r.headers.get('location') || cur; continue; }
      const text = await r.text();
      const finalUrl = r.url;
      // 登录成功标志：最终落在 one.cau.edu.cn 且不回 SSO
      if (finalUrl.startsWith(PORTAL_HOST) && !finalUrl.includes('tpass')) {
        const session = {
          saved_at: new Date().toISOString(),
          user: username,
          cookies: jar.cookies,
          portalUrl: finalUrl,
        };
        if (save) saveSession(session);
        return { ok: true, session, message: '登录成功', jar };
      }
      // 落在其他的（如门户内跳转或错误页）继续跟随一次
      if (!text.includes('loginForm')) {
        const session = { saved_at: new Date().toISOString(), user: username, cookies: jar.cookies, portalUrl: finalUrl };
        if (save) saveSession(session);
        return { ok: true, session, message: '登录成功（落点 ' + finalUrl + '）', jar };
      }
      return { ok: false, message: '登录后被送回 SSO 登录页（ticket 无效或会话未建立）', jar };
    }
    return { ok: false, message: 'ticket 验证跳转超限，未能建立会话', jar };
  }

  // 3b) 非 302 → 失败，尽量解析页面上的人性化错误
  let message = `登录失败（HTTP ${post.status}）`;
  const errText = stripTags(postText);
  const msgMatch = errText.match(/[\u4e00-\u9fa5A-Za-z0-9]{4,60}(错误|失败|不正确|过期|重复|过多|锁定|停止|禁用|不存在|为空|不正确|无效)[\s\S]{0,30}/i);
  if (msgMatch) message = msgMatch[0].trim();
  return { ok: false, message: (message + ' | ' + (postText.length ? `响应片段: ${postText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160)}` : '')), jar };
}
function stripTags(s) { return (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

/* ---------------- 登录态探活 / 自动重登 ---------------- */
// 用已存会话试探门户：200 且不回 SSO = 有效
export async function checkSession(session = loadSession()) {
  if (!session || !Array.isArray(session.cookies) || !session.cookies.length) return { valid: false, reason: 'no-session' };
  const jar = new CookieJar();
  jar.cookies = session.cookies;
  const r = await f(SERVICE_URL, { jar, redirect: 'manual' });
  if (r.status === 302) {
    const loc = r.headers.get('location') || '';
    if (loc.includes('tpass')) return { valid: false, reason: 'expired', jar };
    const r2 = await f(loc, { jar, redirect: 'manual' });
    if (r2.status === 200) return { valid: true, jar };
    if ((r2.headers.get('location') || '').includes('tpass')) return { valid: false, reason: 'expired', jar };
    return { valid: false, reason: `unexpected-${r2.status}`, jar };
  }
  if (r.status === 200) {
    const t = await r.text();
    if (t.includes('loginForm')) return { valid: false, reason: 'expired', jar };
    return { valid: true, jar };
  }
  return { valid: false, reason: `unexpected-${r.status}`, jar };
}

// 确保有效会话（过期→用存档密码自动重登；无存档→抛错等用户）
export async function ensureSession({ allowRelogin = true } = {}) {
  const cur = await checkSession();
  if (cur.valid) return { ok: true, session: loadSession() };
  const acc = loadAccount();
  if (allowRelogin && acc) {
    const res = await login(acc.username, accountPassword(acc));
    if (res.ok) return { ok: true, session: res.session };
    return { ok: false, message: '自动重登失败：' + res.message };
  }
  return { ok: false, message: cur.reason === 'no-session' ? '未登录（请先在面板「安全·门户」登录）' : '登录已过期，需要重新登录', needUser: true };
}

/* ---------------- 带会话抓取助手 ---------------- */
export async function sessionFetch(path, { follow = true, body = null, method = 'GET', jar = null } = {}) {
  const j = jar || new CookieJar();
  if (!jar) {
    const s = loadSession();
    if (s && Array.isArray(s.cookies)) j.cookies = s.cookies;
  }
  const url = path.startsWith('http') ? path : PORTAL_HOST + path;
  return f(url, { jar: j, redirect: follow ? 'follow' : 'manual', method, body,
    headers: body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {} });
}
