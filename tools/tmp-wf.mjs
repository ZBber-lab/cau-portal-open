// 核验：workflow 状态 + 文件无 schedule
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const home = process.env.USERPROFILE || 'C:\\Users\\1';
const yml = readFileSync(join(home, '.dsh', 'profiles', 'web', 'cordis.patch.yml'), 'utf8');
const tok = (yml.match(/CAU_GITHUB_TOKEN:\s*(\S+)/) || [])[1];
const H = { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-edit-wf' };
const R = 'https://api.github.com/repos/zhouxuanting52-lab/cau-portal';
const wf = await (await fetch(R + '/actions/workflows/crawl.yml', { headers: H })).json();
console.log('workflow:', wf.id, '| state:', wf.state, '| updated_at:', wf.updated_at);
const c = await (await fetch(R + '/contents/.github/workflows/crawl.yml?ref=main', { headers: H })).json();
const txt = Buffer.from(c.content, 'base64').toString('utf8');
console.log('has schedule block:', /schedule:/.test(txt), '| has workflow_dispatch:', /workflow_dispatch: \{\}/.test(txt), '| new sha:', c.sha);
