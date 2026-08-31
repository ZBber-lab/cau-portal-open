// tools/email/service.mjs — 邮件报告服务：配置存储（本机 profile 目录，gitignore 之外）+ 发送 + 每日调度
// 安全：授权码只存本机 cau-email/config.json（仓库外），不进仓库/日志/AI 对话；日志只记成功/失败状态。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sendMail, inferProvider } from './smtp.mjs';
import { buildDailyReport } from './report.mjs';

const _dir = dirname(fileURLToPath(import.meta.url));
const home = process.env.USERPROFILE || 'C:\\Users\\1';
const DIR = process.env.CAU_EMAIL_DIR || join(home, '.dsh', 'profiles', 'web', 'cau-email');
const CONF = join(DIR, 'config.json');

const DEFAULT = {
  enabled: false,
  sender: '',
  authCode: '',
  recipient: '',
  sendTime: '08:00', // 本机时间 HH:MM
  rules: [], // 关注规则快照（客户端同步，用于 🎯 段）
  last_sent: '', // ISO
  last_ok: null, // true/false/null
  last_error: '',
  last_mode: '', // daily | test
};

export function loadConfig() {
  try {
    const c = JSON.parse(readFileSync(CONF, 'utf8'));
    return { ...DEFAULT, ...c };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveConfig(c) {
  try { mkdirSync(DIR, { recursive: true }); } catch { /* 已存在 */ }
  writeFileSync(CONF, JSON.stringify(c, null, 2), 'utf8');
}

/** 对外状态（绝不返回 authCode） */
export function statusInfo() {
  const c = loadConfig();
  const pt = inferProvider(c.sender) || null;
  return {
    ok: true,
    enabled: !!c.enabled,
    sender: c.sender,
    recipient: c.recipient || c.sender,
    sendTime: c.sendTime,
    hasCode: !!c.authCode,
    provider: pt ? (pt.provider || pt.host) : null,
    host: pt ? pt.host : null,
    rulesCount: Array.isArray(c.rules) ? c.rules.length : 0,
    last_sent: c.last_sent,
    last_ok: c.last_ok,
    last_error: c.last_error,
    last_mode: c.last_mode,
  };
}

/** 配置校验+保存（authCode 为空则保留旧值） */
export function updateConfig(input) {
  const c = loadConfig();
  const next = { ...c };
  if (input && typeof input === 'object') {
    if (typeof input.enabled === 'boolean') next.enabled = input.enabled;
    if (typeof input.sender === 'string') next.sender = input.sender.trim().slice(0, 120);
    if (typeof input.authCode === 'string' && input.authCode.trim()) next.authCode = input.authCode.trim().slice(0, 200);
    if (typeof input.recipient === 'string') next.recipient = input.recipient.trim().slice(0, 120);
    if (typeof input.sendTime === 'string' && /^\d{1,2}:\d{2}$/.test(input.sendTime.trim())) next.sendTime = input.sendTime.trim().padStart(5, '0');
    if (Array.isArray(input.rules)) next.rules = input.rules.slice(0, 60);
  }
  if (!next.sender || !next.sender.includes('@')) return { ok: false, error: '请填写发件邮箱（如 [REDACTED-EMAIL]）' };
  if (!next.authCode) return { ok: false, error: '请填写邮箱授权码（QQ/163 邮箱设置里开启 SMTP 后生成）' };
  if (!next.recipient || !next.recipient.includes('@')) next.recipient = next.sender;
  saveConfig(next);
  return { ok: true, ...statusInfo() };
}

function todayStr() {
  const d = new Date(Date.now() + 8 * 3600e3);
  return d.toISOString().slice(0, 10);
}

let sending = false;
export function isSending() { return sending; }

/** 发送一封（daily=正式日报，test=测试邮件）；任何错误都写回状态但不抛出 */
export async function sendReport({ mode = 'daily' } = {}) {
  if (sending) return { ok: false, error: '已有发送任务进行中' };
  sending = true;
  try {
    const c = loadConfig();
    if (!c.enabled && mode === 'daily') return { ok: false, error: '邮件报告未启用', skipped: true };
    if (!c.sender || !c.authCode || !c.recipient) return { ok: false, error: '配置不完整（发件/授权码/收件）' };
    let subject;
    let text;
    if (mode === 'test') {
      const r = await buildDailyReport({ rules: c.rules });
      subject = r.ok ? `【测试】${r.subject}` : '【测试】农大门户日报';
      text = r.ok ? r.text : `（测试发送：报告内容生成失败 ${r.error}，但 SMTP 链路正常则仍会收到本页）\n\n${r.error}`;
    } else {
      const r = await buildDailyReport({ rules: c.rules });
      if (!r.ok) throw new Error('报告生成失败：' + r.error);
      subject = r.subject;
      text = r.text;
    }
    const out = await sendMail({
      sender: c.sender,
      authCode: c.authCode,
      recipient: c.recipient,
      subject,
      text,
    });
    const st = { ...c, last_sent: new Date().toISOString(), last_ok: out.ok, last_mode: mode, last_error: out.error || '' };
    if (out.ok) {
      saveConfig(st);
      return { ok: true, subject };
    }
    saveConfig(st);
    return { ok: false, error: out.error };
  } catch (e) {
    const st = { ...loadConfig(), last_sent: new Date().toISOString(), last_ok: false, last_mode: mode, last_error: String(e?.message || e).slice(0, 200) };
    saveConfig(st);
    return { ok: false, error: String(e?.message || e) };
  } finally {
    sending = false;
  }
}

/* ---------------- 每日调度（启用后本地 8:00 发送 + 开机/启动补发） ---------------- */
let timer = null;

function needDailyNow() {
  const c = loadConfig();
  if (!c.enabled || !c.sender || !c.authCode || !c.recipient) return false;
  const t = c.sendTime || '08:00';
  const [hh, mm] = t.split(':').map(Number);
  const now = new Date();
  const hm = now.getHours() * 60 + now.getMinutes();
  const target = hh * 60 + (mm || 0);
  if (hm < target) return false;
  const lastDay = c.last_sent ? todayStrFromIso(c.last_sent) : '';
  return lastDay !== todayStr();
}

function todayStrFromIso(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() + 8 * 3600e3).toISOString().slice(0, 10);
}

export async function startEmailScheduler({ onResult = null } = {}) {
  if (timer) return;
  const trySend = async (why, mode) => {
    if (sending || !needDailyNow()) return;
    const r = await sendReport({ mode });
    if (onResult) try { onResult({ ok: r.ok, why, mode, error: r.error ?? null }); } catch { /* 忽略 */ }
  };
  // 启动补发：若已过发送时间且今天未发 → 立即发（开机场景）
  setTimeout(() => void trySend('startup-catchup', 'daily'), 20_000);
  timer = setInterval(() => void trySend('interval', 'daily'), 60_000);
  if (timer && timer.unref) timer.unref();
}

export function stopEmailScheduler() {
  if (timer) { clearInterval(timer); timer = null; }
}
