// 监听下一个调度槽：04:30Z 后是否还出现 schedule 运行 / 桥 14:00 北京 dispatch 是否照常
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const home = process.env.USERPROFILE || 'C:\\Users\\1';
const yml = readFileSync(join(home, '.dsh', 'profiles', 'web', 'cordis.patch.yml'), 'utf8');
const tok = (yml.match(/CAU_GITHUB_TOKEN:\s*(\S+)/) || [])[1];
const H = { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-watch' };
const R = 'https://api.github.com/repos/zhouxuanting52-lab/cau-portal';
const cutoff = Date.parse('2026-08-31T04:35:00Z');
console.log('watch start', new Date().toISOString(), 'cutoff', cutoff);
const end = Date.now() + 80 * 60 * 1000;
while (Date.now() < end) {
  await new Promise((r) => setTimeout(r, 120000));
  try {
    const runs = await (await fetch(R + '/actions/runs?per_page=10', { headers: H })).json();
    if (!runs.workflow_runs) continue;
    const fresh = runs.workflow_runs.filter((r) => Date.parse(r.created_at) > cutoff);
    if (fresh.length) {
      console.log('--- NEW RUNS @', new Date().toISOString());
      for (const r of fresh) console.log(r.id, r.event, r.status, r.conclusion, r.created_at);
    }
  } catch (e) { console.log('poll err', e.message); }
}
console.log('watch end', new Date().toISOString());
process.exit(0);
