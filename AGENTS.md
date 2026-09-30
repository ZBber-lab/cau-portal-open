# AGENTS.md — 农大门户（cau-portal）开源版

> 本文件是写给 AI/agent 与贡献者的仓库级工作手册（会被 agent 工具自动加载）。
> 面向开源安装者 / 维护者；涉及团队内部开发流程的私有文档（SPEC／AGENTS）不在本公开仓。

## 一、这是什么

给中国农业大学学生用的 **DeepSeek Harness（DSH）插件与数据管道**：抓取学校/学院**公开**通知公告，AI 生成摘要/分类/重要度/截止日期，在 DSH 侧边栏面板浏览，并可在对话中直接查询（MCP 工具）。

**只开源工具本身**：数据由使用者自己收集、自己保管，不是工具服务的一部分。

## 二、关键原则（勿违背）

1. **数据自主自建**：工具读/写**用户自己的**数据仓库（owner/repo 在设置页可配）；本仓库**不含任何数据**。
2. **不含凭据**：仓库里没有任何账号 / token / API key；令牌只存在使用者本机（面板设置页写入的 `cau-portal-store/token.json`，或环境变量），**不进仓库、不进对话、不进日志**。
3. **不含登录自动化**：不做任何校园系统的登录，不内置账号/凭据；仅通过 `sites.json` 抓取**公开页面**。
4. **开源版不用官方校徽/校名**：界面徽标采用中性「CAU」文本 + 系统宋体题字；仓库内不含官方学校标识素材。
5. **MIT 许可**（见 `LICENSE`）。

## 三、架构（数据流）

```
DSH 浏览器面板 / 对话 MCP ──▶ GitHub Contents API ──▶ 用户自己的数据仓库 data/
爬虫管道 tools/scraper（本仓，公开）：抓取公开网页 → AI 加工（DeepSeek API）→ 提交到用户数据仓
```

数据仓库与使用者绑定，与工具代码解耦。

## 四、帮助安装者（agent 执行顺序）

按 `README.md` / `docs/AI-SETUP-GUIDE.md` 引导，六步：

1. **装插件**：**桌面版走界面** —— DSH 侧边栏 →「插件」→「添加插件」填 `github:ZBber-lab/cau-portal-open`，装完**点「立即启用」**（否则只是"已安装未启用"）。**有 `dsh` 命令的环境**（web/CLI；桌面版安装目录默认不带该命令）用 `dsh plugin --profile desktop add "github:ZBber-lab/cau-portal-open"`（老环境 `--profile web`）。⚠️ 第三方插件**暂不支持自动更新**：升级要先卸载再装新版
2. **准备数据仓**：新建（建议私有）GitHub 仓 + 细粒度令牌（仅选该仓，Contents: Read；如需面板「删除」再加 Write）
3. **配置插件**（DSH 侧边栏→设置）：数据源填 owner/repo；令牌管理登记令牌；AI 加工·模型选择加工模型
4. **跑管道攒数据**：`node tools/scraper/crawl.mjs` + `DEEPSEEK_API_KEY=... node tools/scraper/enrich.mjs`（Windows 用 `$env:DEEPSEEK_API_KEY='...'`）
5. **定时抓取（可选）**：把 `.github/workflows/crawl.yml` 复制到用户**自己的数据仓** + 配置 Secret `DEEPSEEK_API_KEY`；用 cron-job.org 桥（POST dispatch）实现定时（免费私有仓的 `schedule` 不生效）
6. **对话查询 MCP（可选）**：`cd tools/mcp && pnpm install`；在 DSH profile `cordis.patch.yml` 里加 mcp client（stdio，指向本仓 `tools/mcp/index.mjs`，**不必写令牌**——它读面板设置页写下的那一份）；重启 DSH 后可用 `mcp__cau__*`（6 个工具）—— 桌面版＝完全退出应用再打开，web/CLI＝重启 `dsh web`。✅ **数据仓名也不用手写**：MCP 每次调用现读本机共享存储 `<profile>\cau-portal-store\config.json`，也就是面板「设置 → 数据源」填的那一份（改完不用重启 DSH，MCP 侧 5 秒缓存）；只有想临时覆盖时才用 env `CAU_GITHUB_REPO`。**没有内置默认仓** —— 没配就明确返回「请先配置数据仓库」，不会 404、不会静默读别人的仓；自查 `list_sites` 的 `data_source` 是否为 `github:<该仓>@main`。⚠️ 若 `env:` 块里写了 `DSH_HOME` 之类变量，记得该块是**替换**而非合并继承环境

> 安全提示：调度令牌只授 `Actions: Read & write` 最小权限、只填 cron-job.org、不入仓；DeepSeek API Key / 邮箱授权码等只在本机。

## 五、维护 / 开发

- **构建**：`node build.mjs`（tsc JS API 转译；文件本身是纯 JS，不要写 TS 类型注解）
- **校验**：`node --check lib/index.js`、`node --check lib/client.js`；客户端加载模拟 `node tools/sim-load.cjs`
- **数据源**：`sites.json` 数据驱动（站点/栏目），改它即可适配其他院校/栏目
- **改动生效**：客户端改 `src/client/*` → 重建 `lib/client.js` → 浏览器刷新即生效；服务端改 `src/index.ts` → 重启 DSH（桌面版退出应用重开，web/CLI 重启 `dsh web`）
- **令牌只存一处**：面板「设置 → 令牌管理」是唯一入口；保存时经服务端路由 `PUT /api/cau/token` 写进 `<profile>\cau-portal-store\token.json`，MCP 与 `tools/` 脚本（`tools/shared/token-store.mjs`）每次现读它 —— 换令牌不需要改配置文件、也不需要重启 DSH。环境变量 `CAU_GITHUB_TOKEN` 仍可用作覆盖。
- **数据仓也只填一处**（v0.5.4 起）：面板「设置 → 数据源」保存时经 `PUT /api/cau/config` 写进 `<profile>\cau-portal-store\config.json`（`{version,dataRepo,branch,updatedAt}`，与 `token.json` **分开存放**——那份有三个写入实现，混在一起会被静默抹掉）；MCP 每次调用现读它（5 秒缓存）。**没有内置默认仓**：未配置时服务端路由与 MCP 都给出可操作提示。
  - **边界口径（v0.5.5 / v0.5.6）**：①**只支持 `main` 分支**（填别的分支会被明确拒绝）；②**填了数据仓却没登记令牌 → MCP 直接报错**（不会悄悄改读本机 `data/` —— 那会让你看到一份过期很久却"看起来像最新"的数据）；③**既没填仓也没令牌 = 本机离线模式**，允许（跑完 `crawl.mjs` 直接用），但 `list_sites` 会带 `mode:"local"` 与 `hint` 提醒"读的是本机目录、可能是旧的"，自查一律看 `data_source` 是否为 `github:<你的仓>@main`；④仓库名归一化（接受完整链接 / `.git` / 末尾斜杠）在**服务端、面板、MCP 各有一份拷贝** —— **改格式时三处一起改**，且顺序不能换（先删末尾 `/` 再删 `.git`，否则 `…/r.git/` 会解析成 `…/r.git` 而 404）；⑤面板「数据源」的同步结果（成功/失败）会显示在输入框下方，**看到失败就是 MCP 那边没生效**，别忽略；⑥面板首屏那个「正在读取本机配置…」占位**只等本机配置回读**、不等云端（v0.5.6：云端慢或挂住不该让首页一直空着）；⑦回读本机配置的代码在 `await` 回来后**要重读一次当前设置**，用户已经填了就不覆盖（v0.5.6）；⑧同步提示带请求代次，**只认最新一次请求的结果**（旧响应晚到不得把"失败"盖成"已同步"，v0.5.6）。⑥⑦⑧ 都有永久夹具兜着：`node tools/client-fixtures.cjs`（CI 每次跑），它还会把这三处修复改回旧写法做**变异测试** —— 断言必须变红，否则 CI 失败。
- **协作**：涉及设计/风险的分歧先与用户确认（`ask`）；构建产物 `lib/` 随仓提交。

## 六、文件地图

- `src/index.ts` 服务端路由；`src/client/*` 客户端面板；`build.mjs` → `lib/`（构建产物，随仓提交）
- `tools/scraper/` 爬虫 + AI 加工；`tools/mcp/` MCP 服务器（6 个查询工具）；`tools/email/` 每日邮件报告；`tools/shared/` 本机令牌共享存储读取
- `sites.json` 站点/栏目配置；`docs/AI-SETUP-GUIDE.md` 给 AI 的详细配置指南；`.github/workflows/crawl.yml` 定时抓取模板
- `README.md` 人读指南；`LICENSE`（MIT）；`assets/preview.html` 面板 UI 的开发预览页（仓库不含官方校徽/校名素材）
- `package.json` / `dsh.plugin.json` / `cordis.patch.yml` 插件元数据与 MCP 注册

## 七、合规

- 抓取数据来源于各学校/单位**公开网页**，版权归原作者/单位所有；本项目不存储、不提供数据服务；
- 使用者应遵守目标网站使用条款、合理控制抓取频率，遵守所在学校/单位的网络与信息系统使用规定；涉及个人信息的内容自行谨慎处理并承担合规责任；
- 本项目不含任何规避访问控制、批量注册、账号共享或攻击性行为（详见 README 免责声明）。
