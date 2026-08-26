# 农大门户（cau-portal）

给中国农业大学（土地科学与技术学院）学生做的 DeepSeek Harness 插件与数据管道：抓取学院/学校通知公告，AI 摘要/分类/截止日期提取，在 DSH 侧边栏面板浏览，AI 可在对话中查询。

> 私有仓库；完整规格见 [SPEC.md](SPEC.md)（含路线图与全部实测事实）。

## 结构

```
├── package.json          # 插件包元数据（阶段4 起承载 DSH 客户端插件）
├── sites.json            # 站点/栏目配置（数据驱动）
├── data/                 # 爬虫产出的新闻数据（JSON）
│   ├── index.json        # 聚合目录与统计
│   ├── feed/             # 栏目条目列表（<site>__<column>.json）
│   ├── articles/         # 单篇全文 + AI 元数据（<sha1>.json）
│   └── usage.jsonl       # DeepSeek API 用量账本（成本记录）
├── tools/
│   ├── scraper/          # Node 爬虫 + AI 加工管道（零重型依赖，fetch 手写解析）
│   └── mcp/              # Node MCP 服务器（@modelcontextprotocol/sdk，6 个查询工具）
├── assets/               # 品牌资产（校徽/题字 SVG、预览页）
├── explore/              # 调研与参考（FEASIBILITY.md、参考实现存档）
└── .github/workflows/    # Actions 定时抓取
```

## 数据管道

- 来源：土地科学与技术学院（clst.cau.edu.cn）、教务处（jwc.cau.edu.cn）、校新闻网（news.cau.edu.cn），共 11 栏目。
- 抓取：增量更新，URL 去重，列表翻页走博达 dataproxy XML；详情页按 CMS 标记清洗正文。
- AI 加工：DeepSeek API（`deepseek-v4-flash`，非思考模式 + 错峰调度）生成一句话摘要/分类/重要度/deadline（本地校验防幻觉）；花费写入 `data/usage.jsonl`。
- 本地运行：
  ```bash
  node tools/scraper/crawl.mjs --pages 2 --articles 8   # 抓取
  node tools/scraper/enrich.mjs --limit 8               # AI 加工（需 DEEPSEEK_API_KEY）
  ```

## GitHub Actions

- 北京时间 8:00–23:00 每 30 分钟自动抓取 + AI 加工，变更提交回本仓库（无需电脑开机）。
- 需要仓库 Secret：`DEEPSEEK_API_KEY`（缺省时抓取照常、AI 加工跳过）。

## 接入 DSH

- MCP：在 DSH web profile 的 `cordis.patch.yml` 注册 `@deepseek-ai/dsh-mcp-client`（serverName `cau`，stdio 指向 `tools/mcp/index.mjs`），聊天区即获得 `mcp__cau__*` 工具。
- Skill：`~/.dsh/skills/cau-portal.md`（本仓库同款指引见 [SPEC.md §6](SPEC.md)）。
- 侧边栏插件：阶段 4（见 SPEC 路线图）。
