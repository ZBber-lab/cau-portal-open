# AI 配置指南：农大门户（cau-portal）

> **读者**：DeepSeek Harness（DSH）里的 AI agent。用户可能把本文件内容贴给你，或让你读取本文件。你的任务是**指导用户完成 cau-portal 插件的完整配置**，让用户拥有与作者一致的使用体验（自己的数据、自己的令牌、自己的模型配置）。
>
> 面向人的快速开始见仓库根 [README.md](../README.md)；本文件是给 agent 的分步操作手册。

## 0. 你的角色与红线

- 你只负责**指导与验证**，所有凭据（令牌/API Key/密码）由用户在界面上自行填写；**不得**让用户把令牌贴进对话、写进文件、或交给任何第三方。
- 每一步都有「验证点」：完成前一步、确认生效，再进入下一步。
- 遇到报错先看「故障排查」表，不要盲目重试。

## 1. 先了解用户环境

让用户提供（或你自行探测）：

1. DSH 是否在运行、版本（`dsh --version`）；
2. 插件是否已安装（侧边栏有无「农大门户」按钮 / 设置页有无「农大门户」入口）；
3. 是否有 GitHub 账号与一个私有仓库（数据仓）；
4. 是否有 DeepSeek API Key（管道加工用；没有可先用服务端默认模型，但跑管道必须）。

## 2. 完整配置流程

### 步骤 A：安装插件

```bash
dsh plugin --profile web add "github:OWNER/cau-portal"
```

- `OWNER/cau-portal` = 公开仓实际地址。
- **验证点**：侧边栏出现「农大门户」入口；点击能打开面板（此时无数据属正常，面板会提示未配置）。

### 步骤 B：准备数据仓库

1. GitHub 新建私有仓库（如 `username/cau-data`）；
2. 生成细粒度令牌：Settings → Developer settings → Personal access tokens → Fine-grained tokens：
   - Repository access：仅该数据仓；
   - Permissions → Contents：Read（如需面板「删除」功能则 Read and write）；
   - 其他权限不勾选；
3. 在数据仓建 `data/` 目录（可空）。

- **验证点**：令牌页面能看到该令牌；浏览器 localStorage 尚无它（还没配置）。

### 步骤 C：配置插件（面板设置页）

按顺序：

1. **数据源** → 数据仓库填 `username/cau-data`（支持完整链接与 `.git` 后缀，插件会自动归一化）；
2. **令牌管理** → 添加令牌：名称（如 `github-read`）、令牌值（第 B 步生成）、过期日（建议填）、用途；
3. **数据源** → 点「连通性检查」：应提示已连通并显示 `last_updated`（数据仓还是空的话会显示不存在/条目 0——此时先跳过，跑完管道再查）；
4. （可选）**AI 加工 · 模型配置** → 选择模型；默认用服务端配置的模型即可。

- **验证点**：连通性检查返回非 4xx；无红色提醒条（「未配置有效令牌」消失）。

### 步骤 D：运行管道攒数据

管道在插件源码仓库里（`tools/scraper/`）。让用户在**本机**运行（或按其偏好部署到 Actions）：

```bash
# 1) 抓取（可选限制页数/条数，先小批量试跑）
node tools/scraper/crawl.mjs --pages 2 --articles 8

# 2) AI 加工（需要 DeepSeek API Key）
DEEPSEEK_API_KEY=sk-... node tools/scraper/enrich.mjs --limit 8
```

产物在 `data/`：`index.json`（目录与统计）、`feed/<site>__<column>.json`（栏目列表）、`articles/<sha1>.json`（全文 + AI 元数据）、`usage.jsonl`（用量账本）。

提交推送：

```bash
git add data && git commit -m "data: first crawl" && git push
```

- **验证点**：数据仓里能看到 `data/index.json` 等文件；面板「连通性检查」显示条目数 > 0；侧边栏面板出现今日要览/栏目/待办。

### 步骤 E：定时自动抓取（可选）

把 `.github/workflows/crawl.yml` 复制到用户**数据仓**，配 Secret `DEEPSEEK_API_KEY`。

- 免费私有仓的 `schedule` 触发器需要外部触发（workflow 内注释说明了 cron-job.org 的配置）；
- **验证点**：Actions 页出现一次成功运行，数据仓有新的自动提交。

### 步骤 E2：接入 MCP（对话查询，推荐）

让 AI 能在对话里直接查询数据，需注册 MCP：

1. 装 MCP 依赖：`cd tools/mcp && pnpm install`；
2. 在 DSH profile `cordis.patch.yml` 加 mcp client（`@deepseek-ai/dsh-mcp-client`）：
   ```yaml
   - id: mcp-cau
     name: '@deepseek-ai/dsh-mcp-client'
     serverName: cau
     transport: stdio
     command: <Node 可执行路径>
     args: [<本仓库路径>\tools\mcp\index.mjs]
     cwd: <本仓库路径>\tools\mcp
     env:
       CAU_GITHUB_TOKEN: <数据仓只读令牌>
   ```
3. 重启 dsh web 生效。

- **验证点**：对话里问"最近有什么通知"，AI 能调用 `mcp__cau__list_latest` 返回结果。

### 步骤 F：体验验证

让用户确认以下"与作者一致"的体验：

1. 面板：今日要览 / 我的事项（截止提醒）/ 栏目频道可浏览；
2. 对话：`搜索最新通知`、`查一下推免报名截止` 能出结果（MCP 工具生效）；
3. 文章页：AI 摘要、引用到对话、加入关注可用。

## 3. 故障排查

| 现象 | 原因 | 处理 |
|---|---|---|
| 面板提示「未配置有效令牌」 | 令牌没登记或格式错 | 设置 → 令牌管理，确认值完整、已启用 |
| 连通性检查 4xx | 仓库名错 / 令牌权限不足 | 核对 `owner/repo` 拼写；令牌 Repository access 是否含该仓、Contents 权限 |
| 面板有红色提醒「数据源已禁用」 | 数据源开关关了 | 设置 → 数据源，打开 GitHub 云端开关 |
| 管道抓取报错 | 网络/反爬/站点结构变化 | 检查目标站可达性；`sites.json` 栏目是否仍有效；降低 `--pages` 数量 |
| 加工跳过（无 AI 元数据） | `DEEPSEEK_API_KEY` 缺失或配额 | 确认环境变量；检查 `usage.jsonl` 是否有记录 |
| 面板数据不更新 | 60 秒缓存 | 面板底部 ⟳ 强制刷新 |
| 邮件/门户功能报错 | 相关凭据未配置 | 各子页有独立说明；授权码/密码仅本机 |

## 4. 安全提醒（对用户讲一遍）

- 令牌、API Key、邮箱授权码、门户密码：全部只存本机，**不要**发进对话、不要写进仓库、不要贴到任何网站；
- 数据仓库建议私有；公开仓库意味着任何人都能读到你的数据；
- 合理抓取频率，遵守目标网站条款。

## 5. 完成标准

用户能用面板浏览自己的数据、能在对话里查询、定时管道在跑——即完成。此时可提示用户把重要凭据的过期日登记进「令牌管理」以便到期提醒。
