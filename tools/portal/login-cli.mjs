// tools/portal/login-cli.mjs — 门户登录 CLI（本机手动登录用）
// 用法：
//   node tools/portal/login-cli.mjs            交互登录（密码隐藏输入）→ 存 session.json + account.json
//   node tools/portal/login-cli.mjs --check    检查现存会话是否有效
//   node tools/portal/login-cli.mjs --dummy    假凭据冒烟（验证加密/表单正确性，不存任何文件）
import { login, checkSession, loadSession } from './engine.mjs';
import * as readline from 'node:readline';

const arg = process.argv[2] || '';

/* 隐藏输入（不回声） */
async function promptHidden(rl, prompt) {
  return new Promise(resolve => {
    let buf = '';
    const term = process.stdin.isTTY;
    if (term) process.stdin.setRawMode(true);
    process.stdout.write(prompt);
    const onData = (chunk) => {
      const s = chunk.toString('utf8');
      for (const ch of s) {
        if (ch === '\r' || ch === '\n') {
          if (term) process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(buf);
          return;
        }
        if (ch === '\u0003') { process.exit(130); }
        if (ch === '\u007f' || ch === '\b') { buf = buf.slice(0, -1); continue; }
        if (ch >= ' ' && ch !== '*') buf += ch;
      }
    };
    process.stdin.on('data', onData);
  });
}

/* 假凭据冒烟：服务端回「用户名或密码错误」= 加密与表单 100% 正确 */
async function dummy() {
  console.log('[dummy] 用假凭据 testuser / testpass 试登录（不保存任何文件）...');
  const res = await login('testuser', 'testpass', { save: false });
  console.log('[dummy] 结果:', res.ok ? '⚠️ 意外登录成功？' : res.message);
  process.exit(res.ok ? 1 : 0);
}

async function check() {
  const s = loadSession();
  if (!s) { console.log('未找到 session.json'); process.exit(2); }
  const r = await checkSession(s);
  console.log(r.valid ? '✅ 会话有效' : '❌ 会话失效：' + r.reason);
  process.exit(r.valid ? 0 : 1);
}

async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const username = await new Promise(res => rl.question('账号（职工号/学号）: ', res));
  const password = await promptHidden(rl, '密码（输入不显示）: ');
  rl.close();
  if (!username || !password) { console.log('账号或密码为空'); process.exit(1); }
  console.log('登录中...');
  const res = await login(username, password, { save: false });
  if (!res.ok) { console.log('❌ ' + res.message); process.exit(1); }
  // 成功后：存 session + 存账号（自动重登用）
  const { saveSession, saveAccount } = await import('./engine.mjs');
  saveSession(res.session);
  saveAccount(username, password);
  console.log('✅ 登录成功，已保存会话（session.json）+ 账号（account.json，自动重登用）');
  console.log('   落点:', res.session.portalUrl);
}

if (arg === '--dummy') await dummy();
else if (arg === '--check') await check();
else await interactive();
