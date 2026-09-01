# 农大门户（cau-portal）

给中国农业大学学生用的 **DeepSeek Harness（DSH）插件与数据管道**：自动抓取学院/学校通知公告，AI 生成摘要/分类/重要度/截止日期，在 DSH 侧边栏面板浏览，并可在对话中直接查询（MCP 工具）。

> 本项目**只开源工具本身**：数据由每位使用者自己收集、自己保管，不作为工具服务的一部分。校内数据版权归学校所有，公开页面信息仅作个人学习使用（见文末免责声明）。

## 功能特性

- **侧边栏面板**：右侧全高抽屉，今日要览 / 我的事项（截止提醒）/ 栏目频道 / 关注与归档 / 文章阅读（原文 + AI 摘要 + deadline 高亮 + 一键引用到对话）
- **对话查询**：6 个 MCP 工具（最新通知 / 关键词检索 / 截止事项 / 站点目录 / 用量统计 / 文章详情），AI 可以直接在对话中回答"最近有什么通知""推免报名截止几号"
- **AI 加工**：DeepSeek 模型生成一句话摘要、分类（通知/新闻/讲座/竞赛/评奖/选课/学术）、重要度、截止日期（本地校验防幻觉）
- **数据自主**：数据仓库可配置（owner/repo），完全由你掌控；令牌仅存本机浏览器
- **定时管道**：GitHub Actions 每 2 小时自动抓取 + AI 加工（无需电脑开机）

## 架构

```
┌─────────────┐   GitHub Contents API / 代理    ┌──────────────────┐
│  DSH 浏览器  │ ──────────────────────────────▶ │  你的数据仓库       │
│  侧边栏面板  │                                 │  data/           │
│  （插件）    │                                 │  ├ index.json     │
└──────┬──────┘                                 │  ├ feed/ 栏目列表  │
       │                                        │  ├ articles/ 全文  │
┌──────▼──────┐   MCP（stdio）                  │  └ usage.jsonl     │
│  对话查询    │ ──────────────────────────────▶ └──────────────────┘
│  mcp__cau__*│
└─────────────┘
        ▲
        │ 工具代码公开；数据各自收集
┌───────┴────────────────────────────────────────┐
│  爬虫管道 tools/scraper（本仓库，公开）           │
│  抓取 → AI 加工 → 提交到**你自己的**数据仓库       │
└────────────────────────────────────────────────┘
```

**数据流**：爬虫抓取公开网页 → AI 加工（DeepSeek API）→ 产物提交到你的数据仓库 `data/` → 插件与 MCP 读取展示。数据仓库与你绑定，与工具代码解耦。

## 快速开始

### 前置要求

- DeepSeek Harness（DSH）web 环境
- Node.js 18+
- 一个 GitHub 账号与一个**私有仓库**（存放你的数据；见下）
- DeepSeek API Key（管道 AI 加工用；`deepseek-v4-flash` 等）

## 凭据与服务来源一览

| 需要什么 | 从哪获取 | 用途 |
|---|---|---|
| **DeepSeek API Key** | [platform.deepseek.com](https://platform.deepseek.com) → 注册/登录 → **API Keys** → 创建（账户需有余额） | 管道 AI 加工、面板按需摘要 |
| **GitHub 数据仓** | [github.com/new](https://github.com/new) → 新建 **私有** 仓 | 存放你的 `data/` |
| **GitHub 细粒度令牌** | [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens) → **Fine-grained tokens** → 选你的数据仓 → **Contents: Read**(+/Write) | 面板/MCP 读你的数据 |
| **cron-job.org（调度桥）** | [console.cron-job.org](https://console.cron-job.org) → 免费注册 → 新建 job | 定时触发抓取（免费私有仓的 `schedule` 被禁用，需外部触发） |
| **SMTP 邮箱授权码** | QQ：[设置→账户→SMTP](https://mail.qq.com)生成授权码；163：[设置→POP3/SMTP/IMAP](https://mail.163.com)授权密码；Outlook：[账户→安全→应用密码](https://account.microsoft.com) | 每日邮件报告（可选） |

> 安全：这些 key/令牌只服务于你自己的数据与调度；除调度桥的令牌需填入 cron-job.org（第三方）外，其余凭据只存本机。

### 第 1 步：安装插件

```bash
dsh plugin --profile web add "github:ZBber-lab/cau-portal-open"
```

（这是官方仓库；若你 fork 了自己的一份，把地址换成你自己的 `github:你的用户名/仓库名`。安装后侧边栏出现「农大门户」入口。）

### 第 2 步：准备数据仓库

1. 新建（或复用）一个 GitHub 仓库（建议私有），作为你的数据仓；
2. 在该仓库开通一个**细粒度令牌**：GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → 选「**Only select repositories**」→ 勾选你的数据仓 → Permissions → **Contents: Read**（如需面板「删除」功能再加 **Read and write**）；令牌只存在你自己浏览器里；
3. 仓库内建 `data/` 目录（可先留空，管道会自动生成内容）。

### 第 3 步：配置插件

打开 DSH 侧边栏 →「设置」：

1. **数据源**：把「数据仓库（owner/repo）」填成你的数据仓（如 `yourname/cau-data`）；
2. **令牌管理**：登记第 2 步的令牌；
3. **AI 加工 · 模型配置**：选择管道/面板按需加工用的模型（独立配置槽，与主对话模型解耦）。

### 第 4 步：运行管道攒数据

本地试跑（在插件仓库目录）：

```bash
node tools/scraper/crawl.mjs --pages 2 --articles 8   # 抓取
DEEPSEEK_API_KEY=sk-... node tools/scraper/enrich.mjs --limit 8   # AI 加工
```

> Windows PowerShell 用户：用 `$env:DEEPSEEK_API_KEY='sk-...'; node tools/scraper/enrich.mjs --limit 8`（第 4 步的 `DEEPSEEK_API_KEY=... node ...` 是 macOS/Linux shell 语法）。

确认 `data/` 出现 `index.json` / `feed/` / `articles/` 后，提交推送，插件即可读到数据。

### 第 5 步：定时自动抓取（可选）

把 `.github/workflows/crawl.yml` 复制到你**自己的数据仓库**，并配置仓库 Secret `DEEPSEEK_API_KEY`（AI 加工用；缺省时抓取照常、AI 加工跳过）。

本 workflow 用 `workflow_dispatch`（手动触发）而非原生 `schedule`，因为 **GitHub 免费私有仓的 `schedule` 触发器不生效**。要实现「每 2 小时自动」，需用外部触发器调用 Actions 的 dispatch 接口，常用 **cron-job.org**（免费）：

1. 在数据仓建一个**尽量最小权限**的细粒度令牌：仅选该数据仓，Permissions → **Actions: Read & write**；
2. 到 cron-job.org 新建一个 cron job：
   - Method：`POST`，URL：`https://api.github.com/repos/<你的用户名>/<你的数据仓>/actions/workflows/crawl.yml/dispatches`
   - Headers：`Authorization: Bearer <第 1 步的令牌>`、`Accept: application/vnd.github+json`
   - Body：`{"ref":"main"}`
3. 设执行频率（如每 2 小时），保存即可。

> 安全提醒：该调度令牌只用于触发，请只授予 `Actions: Read & write` 一个最小权限，且**不要写进任何仓库或共享给他人**。

### 第 6 步：接入对话查询（MCP，推荐）

想让 AI 直接在对话里查询（如`最近有什么通知`、`推免报名截止几号`），需把 MCP 服务器接入 DSH：

1. **安装 MCP 依赖**（一次性）：
   ```bash
   cd tools/mcp && pnpm install
   ```
2. **注册 MCP client**：在 DSH profile 的 `cordis.patch.yml` 里加（Windows：`C:\Users\<你>\.dsh\profiles\web\cordis.patch.yml`；macOS/Linux：`~/.dsh/profiles/web/cordis.patch.yml`；`@deepseek-ai/dsh-mcp-client` 是 DSH 内置插件；`<...>` 换成你的实际路径）：
   ```yaml
   - id: mcp-cau
     name: '@deepseek-ai/dsh-mcp-client'
     serverName: cau
     transport: stdio
     command: <Node 可执行文件路径，如 D:\nodejs1\node.exe>
     args: [<本仓库路径>\tools\mcp\index.mjs]
     cwd: <本仓库路径>\tools\mcp
     env:
       CAU_GITHUB_TOKEN: <你的数据仓只读令牌>   # 与面板令牌一致
   ```
3. **重启 dsh web**，对话里即可使用 `mcp__cau__*` 工具（共 6 个：最新通知 / 检索 / 截止事项 / 站点目录 / 用量统计 / 文章详情）。

> 说明：MCP 服务器与面板都读你配置的数据仓库；两者共用同一个只读令牌（`CAU_GITHUB_TOKEN`）。

## 配置项一览（设置页）

| 模块 | 说明 |
|---|---|
| AI 加工 · 模型配置 | 独立模型槽 + 用量柱状图（次数/token/费用，7/30/90 天） |
| 令牌管理 | 多令牌登记：值/过期日/剩余天数/逐枚开关 |
| 数据源 | 数据仓库（owner/repo）、GitHub 云端开关、连通性检查 |
| 面板偏好 · 引用协同 | 自动附加阅读上下文、引用到对话、面板固定 |
| 待办提醒 · 关注 | 关注规则（关键词/来源/重要度）、系统通知 |
| 每日邮件报告 | 每天定时把今日高重要通知/截止事项推到邮箱 |

## 安全与隐私

- 令牌 / API Key / 邮箱授权码：**只存在本机**（浏览器 localStorage / 本地工具目录），不进仓库、不进日志、不经过任何第三方服务；
- 数据仓库完全由你掌控，可随时停更或删除；
- 插件代码不含任何凭据与个人数据；
- 本仓库为**纯工具代码开源**：不含任何校园系统的登录自动化、不内置任何账号/凭据，仅在 `sites.json` 中面向**公开页面**进行抓取。

## 版权说明

- 本仓库为**开源版**，**不使用中国农业大学官方校徽、校名题字等学校标识素材**：界面徽标采用中性「CAU」文本、题字采用系统宋体文字，仓库内不包含任何官方校徽/校名文件。
- 本项目抓取的数据来源于各学校/单位**公开网页**，版权归原作者/单位所有；本项目不存储、不提供任何数据服务，仅提供工具与数据处理能力。

## 目录结构

```
├── src/                  # 插件源码（服务端路由 + 客户端面板）
├── lib/                  # 构建产物（随包发布）
├── tools/
│   ├── scraper/          # 爬虫 + AI 加工管道（零重型依赖，Node fetch 手写解析）
│   └── mcp/              # MCP 服务器（6 个查询工具；需 pnpm install + cordis.yaml 注册，见快速开始第 6 步）
├── assets/               # 开发期素材/脚本（不含官方校徽、校名素材）
├── sites.json            # 站点/栏目配置（数据驱动，可自行增改）
├── docs/AI-SETUP-GUIDE.md# 给 AI agent 的配置指南（见下）
└── .github/workflows/    # Actions 定时抓取模板
```

站点/栏目是数据驱动的（`sites.json`）：默认内置中国农业大学土地科学与技术学院 / 教务处 / 校新闻网 / 统一门户的栏目；想适配其他院校或栏目，改 `sites.json` 即可。

## 给 AI 看的文档

本项目同时提供 **[docs/AI-SETUP-GUIDE.md](docs/AI-SETUP-GUIDE.md)**——写给 DSH 里的 AI agent 看的配置指南：把本文件路径发给 AI，或让用户把文件内容贴给 AI，AI 就能按步骤指导用户完成完整配置（安装 → 令牌 → 数据源 → 跑管道 → 验证）。

## 免责声明

- 本项目为按现状（AS-IS）提供的个人学习/效率工具，不承担任何因使用产生的责任；
- **数据由使用者自行收集与保管**（见「数据自主」）：使用者应遵守目标网站的使用条款、合理控制抓取频率，并遵守所在学校/单位的网络与信息系统使用规定；涉及个人信息的内容请谨慎处理并由使用者自行承担合规责任；
- 本项目不包含、不鼓励任何规避访问控制、批量注册、账号共享或攻击性行为。

## 许可证

见 [LICENSE](LICENSE)。
