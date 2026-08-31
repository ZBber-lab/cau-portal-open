// tools/email/smtp.mjs — 免依赖 SMTP 客户端（Node net/tls）
// 支持：465 直连 SSL / 587 STARTTLS 自动升级；AUTH LOGIN；UTF-8 base64 编码；
//       常用服务商域名自动推断（QQ/163/126/Outlook/农大邮箱）。
// 安全：授权码仅用于本次会话，不落盘不打印。
import net from 'node:net';
import tls from 'node:tls';

export const PROVIDERS = {
  'qq.com': { host: 'smtp.qq.com', port: 465, secure: true },
  'foxmail.com': { host: 'smtp.qq.com', port: 465, secure: true },
  '163.com': { host: 'smtp.163.com', port: 465, secure: true },
  '126.com': { host: 'smtp.126.com', port: 465, secure: true },
  'outlook.com': { host: 'smtp.office365.com', port: 587, secure: false },
  'hotmail.com': { host: 'smtp.office365.com', port: 587, secure: false },
  'live.com': { host: 'smtp.office365.com', port: 587, secure: false },
  'cau.edu.cn': { host: 'smtp.cau.edu.cn', port: 465, secure: true },
};

/** 按发件域名推断服务商；未知域名返回空（由上层给默认/让用户改） */
export function inferProvider(sender) {
  const m = String(sender || '').match(/@([^@\s]+)$/i);
  if (!m) return null;
  const host = m[1].toLowerCase();
  for (const g of Object.keys(PROVIDERS)) {
    if (host === g || host.endsWith('.' + g)) return { ...PROVIDERS[g], provider: g };
  }
  return { host: 'smtp.' + host, port: 465, secure: true, provider: host, };
}

/** 流式行读取器（含队列，promise 化） */
function createReader(stream) {
  let buf = '';
  const queue = [];
  let waiting = null;
  const pump = (line) => {
    if (waiting) { const w = waiting; waiting = null; w(line); } else queue.push(line);
  };
  stream.on('data', (d) => {
    buf += d.toString('utf8');
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).replace(/\r$/, '');
      buf = buf.slice(i + 1);
      pump(line);
    }
  });
  stream.on('end', () => pump(null));
  stream.on('close', () => pump(null));
  stream.on('error', () => pump(null));
  return () => {
    if (queue.length) return Promise.resolve(queue.shift());
    if (waiting) return Promise.resolve(null);
    return new Promise((resolve) => { waiting = resolve; });
  };
}

/** 读完整应答（250-xxx 多行直到 250 xxx） */
async function readReply(readLine) {
  const lines = [];
  for (;;) {
    const line = await readLine();
    if (line === null || line === undefined) throw new Error('SMTP 连接被服务端关闭');
    lines.push(line);
    if (/^\d{3}[ ]/.test(line)) break;
  }
  const code = parseInt(lines[lines.length - 1].slice(0, 3), 10);
  return { code, lines };
}

async function cmd(stream, readLine, text, expect) {
  stream.write(text + '\r\n');
  const r = await readReply(readLine);
  if (expect && !expect.includes(r.code)) {
    throw new Error(`SMTP ${r.code}: ${r.lines.slice(-2).join(' / ').slice(0, 160)}`);
  }
  return r;
}

function connect(host, port, secure) {
  return new Promise((resolve, reject) => {
    const s = secure
      ? tls.connect({ host, port, servername: host, rejectUnauthorized: false })
      : net.connect({ host, port });
    const ev = secure ? 'secureConnect' : 'connect';
    const onErr = (e) => reject(e);
    s.once('error', onErr);
    s.once(ev, () => { s.off('error', onErr); resolve(s); });
  });
}

function b64(s) {
  return Buffer.from(String(s), 'utf8').toString('base64');
}

/** MIME 编码（UTF-8 标题/base64 正文，规避 SMTP 8bit 兼容问题） */
function buildMime({ fromName, from, to, subject, text, date }) {
  const enc = (u) => `=?UTF-8?B?${b64(u)}?=`;
  const bodyB64 = b64(text).replace(/(.{60})/g, '$1\r\n');
  return [
    `From: ${fromName ? `${enc(fromName)} ` : ''}<${from}>`,
    `To: <${to}>`,
    `Subject: ${enc(subject)}`,
    `Date: ${date.toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="utf-8"`,
    `Content-Transfer-Encoding: base64`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2, 10)}@cau-portal.local>`,
    '',
    bodyB64,
  ].join('\r\n');
}

/**
 * 发送邮件。
 * @param {object} cfg {sender, authCode, recipient, subject, text, fromName?, host?, port?, secure?}
 * @returns {Promise<{ok:boolean, error?:string}>}
 */
export async function sendMail(cfg) {
  const sender = String(cfg.sender || '').trim();
  const recipient = String(cfg.recipient || '').trim();
  const subject = String(cfg.subject || '农大门户日报');
  const text = String(cfg.text || '(空)');
  const authCode = String(cfg.authCode || '');
  if (!sender || !recipient || !sender.includes('@') || !recipient.includes('@')) {
    return { ok: false, error: '发件/收件邮箱格式不正确' };
  }
  const pt = inferProvider(sender) || { host: null, port: 465, secure: true };
  const host = String(cfg.host || pt.host || '');
  if (!host) return { ok: false, error: `无法识别 ${sender} 的 SMTP 服务器，请在高级设置里填写` };

  // 依次尝试：指定 secure 端口 → 587 STARTTLS 兜底
  const skipStartTls = cfg.startTls === false;
  const attempts = [
    { host, port: Number(cfg.port) || pt.port || 465, secure: cfg.secure != null ? !!cfg.secure : pt.secure !== false },
    { host, port: 587, secure: false },
  ];

  let lastErr = '';
  for (const a of attempts) {
    let s = null;
    let readLine = null;
    try {
      s = await connect(a.host, a.port, a.secure);
      readLine = createReader(s);
      let r = await readReply(readLine);
      if (r.code !== 220) throw new Error('网关 ' + r.code);
      await cmd(s, readLine, 'EHLO cau-portal', [250]);
      if (!a.secure && !skipStartTls) {
        await cmd(s, readLine, 'STARTTLS', [220]);
        const sec = tls.connect({ socket: s, servername: a.host, rejectUnauthorized: false });
        await new Promise((res, rej) => { sec.once('secureConnect', res); sec.once('error', rej); });
        s = sec;
        readLine = createReader(s);
        await cmd(s, readLine, 'EHLO cau-portal', [250]);
      }
      if (authCode) {
        r = await cmd(s, readLine, 'AUTH LOGIN', [334]);
        if (r.code === 334) {
          await cmd(s, readLine, b64(sender), [334]);
          await cmd(s, readLine, b64(authCode), [235]);
        }
      }
      await cmd(s, readLine, `MAIL FROM:<${sender}>`, [250]);
      await cmd(s, readLine, `RCPT TO:<${recipient}>`, [250, 251, 252]);
      await cmd(s, readLine, 'DATA', [354]);
      // 正文：点行转义（dot-stuffing）
      const mail = buildMime({ fromName: '农大门户日报', from: sender, to: recipient, subject, text, date: new Date() });
      const stuffed = mail.replace(/^\./gm, '..');
      s.write(stuffed + '\r\n.\r\n');
      await readReply(readLine);
      await cmd(s, readLine, 'QUIT', [221]);
      try { s.end(); } catch { /* 忽略 */ }
      return { ok: true };
    } catch (e) {
      lastErr = String(e?.message || e);
      try { if (s) s.destroy(); } catch { /* 忽略 */ }
      // 若是「连接层」失败（认证前），尝试下一档；认证失败（网关 535）不必再试 587
      if (/535|534|535 5\.7|AUTH/i.test(lastErr) && lastErr.includes('535')) break;
    }
  }
  return { ok: false, error: lastErr.slice(0, 200) || 'SMTP 连接失败' };
}
