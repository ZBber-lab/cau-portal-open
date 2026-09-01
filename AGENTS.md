# AGENTS.md — 农大门户（cau-portal）开源版

> 本文件是写给 AI/agent 与贡献者的仓库级工作手册（会被 agent 工具自动加载）。
> 面向开源安装者 / 维护者；涉及团队内部开发流程的私有文档（SPEC／AGENTS）不在本公开仓。

## 一、这是什么

给中国农业大学学生用的 **DeepSeek Harness（DSH）插件与数据管道**：抓取学校/学院**公开**通知公告，AI 生成摘要/分类/重要度/截止日期，在 DSH 侧边栏面板浏览，并可在对话中直接查询（MCP 工具）。

**只开源工具本身**：数据由使用者自己收集、自己保管，不是工具服务的一部分。

## 二、关键原则（勿违背）

1. **数据自主自建**：工具读/写**用户自己的**数据仓库（owner/repo 在设置页可配）；本仓库**不含任何数据**。
2. **不含凭据**：仓库里没有任何账号 / token / API key；令牌只存在使用者本机（浏览器 / 本地配置），**不进仓库、不进对话、不进日志**。
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

1. **装插件**：`dsh plugin --profile web add "github:ZBber-lab/cau-portal-open"`
2. **准备数据仓**：新建（建议私有）GitHub 仓 + 细粒度令牌（仅选该仓，Contents: Read；如需面板「删除」再加 Write）
3. **配置插件**（DSH 侧边栏→设置）：数据源填 owner/repo；令牌管理登记令牌；AI 加工·模型选择加工模型
4. **跑管道攒数据**：`node tools/scraper/crawl.mjs` + `DEEPSEEK_API_KEY=... node tools/scraper/enrich.mjs`（Windows 用 `$env:DEEPSEEK_API_KEY='...'`）
5. **定时抓取（可选）**：把 `.github/workflows/crawl.yml` 复制到用户**自己的数据仓** + 配置 Secret `DEEPSEEK_API_KEY`；用 cron-job.org 桥（POST dispatch）实现定时（免费私有仓的 `schedule` 不生效）
6. **对话查询 MCP（可选）**：`cd tools/mcp && pnpm install`；在 DSH profile `cordis.patch.yml` 里加 mcp client（stdio，指向本仓 `tools/mcp/index.mjs`，env 设 `CAU_GITHUB_TOKEN`=数据仓只读令牌）；重启 dsh web 后可用 `mcp__cau__*`（6 个工具）

> 安全提示：调度令牌只授 `Actions: Read & write` 最小权限、只填 cron-job.org、不入仓；DeepSeek API Key / 邮箱授权码等只在本机。

## 五、维护 / 开发

- **构建**：`node build.mjs`（tsc JS API 转译；文件本身是纯 JS，不要写 TS 类型注解）
- **校验**：`node --check lib/index.js`、`node --check lib/client.js`；客户端加载模拟 `node tools/sim-load.cjs`
- **数据源**：`sites.json` 数据驱动（站点/栏目），改它即可适配其他院校/栏目
- **改动生效**：客户端改 `src/client/*` → 重建 `lib/client.js` → 浏览器刷新即生效；服务端改 `src/index.ts` → 重启 dsh web
- **协作**：涉及设计/风险的分歧先与用户确认（`ask`）；构建产物 `lib/` 随仓提交。

## 六、文件地图

- `src/index.ts` 服务端路由；`src/client/*` 客户端面板；`build.mjs` → `lib/`（构建产物，随仓提交）
- `tools/scraper/` 爬虫 + AI 加工；`tools/mcp/` MCP 服务器（6 个查询工具）；`tools/email/` 每日邮件报告
- `sites.json` 站点/栏目配置；`docs/AI-SETUP-GUIDE.md` 给 AI 的详细配置指南；`.github/workflows/crawl.yml` 定时抓取模板
- `README.md` 人读指南；`LICENSE`（MIT）；`assets/` 开发期素材（不含官方校徽/校名）
- `package.json` / `dsh.plugin.json` / `cordis.patch.yml` 插件元数据与 MCP 注册

## 七、合规

- 抓取数据来源于各学校/单位**公开网页**，版权归原作者/单位所有；本项目不存储、不提供数据服务；
- 使用者应遵守目标网站使用条款、合理控制抓取频率，遵守所在学校/单位的网络与信息系统使用规定；涉及个人信息的内容自行谨慎处理并承担合规责任；
- 本项目不含任何规避访问控制、批量注册、账号共享或攻击性行为（详见 README 免责声明）。
