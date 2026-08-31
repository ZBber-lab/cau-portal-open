# 可行性探索结论（2026-08 实测）

> 阶段0 已按本结论完成并验收（2026-08）：爬虫原型 `tools/scraper/` 跑通三站点 11 栏目，0 错误。本文件为探路记录，最新实施事实见 SPEC §14.4。

> 探路脚本与 HTML 样本均在 `explore/` 下，全部经 Node fetch 实测（本沙箱唯一可联网通道）。

## 结论：整体可行 ✅

| 验证项 | 结果 | 证据 |
|---|---|---|
| 土地学院 clst.cau.edu.cn 连通 | ✅ 200 | 首页/列表/详情/分页接口全部直连成功（Node fetch + 浏览器 UA） |
| 教务处 jwc.cau.edu.cn 连通 | ✅ 200 | 同为博达 CMS（/art/YYYY/M/D/art_41xxx_*.html），同一套管道可复用 |
| 校新闻网 news.cau.edu.cn 连通 | ✅ 200 | 另一套 CMS，文章在 caunewspaper.ihwrm.com（release_id URL），需单独解析器 |
| DeepSeek API 可达 | ✅ | api.deepseek.com/v1/models → 401（无 key，网络通） |
| GitHub API 可达 | ✅ | api.github.com/rate_limit → 200（无 token 60次/时，PAT 后 5000次/时） |
| 编码 | ✅ 全 UTF-8 | 三站点均为 meta charset=utf-8（早期 GBK 猜测作废） |

## 土地学院（博达 CMS）结构事实

- **栏目 ID**：`31131`=通知公告（首页上下文直证），`31132`=学术报告，`31133`=学院新闻；另有 31065/31068/31070（教学基地等静态栏）、31142/31156/31256/40016 待映射。
- **列表页**：`/col/col<ID>/index.html`，30 条/页静态 HTML，条目结构 `<li><a title="标题" href="/art/..."><div>标题</div><div class="bt_date">YYYY-MM-DD</div></a></li>`。
- **分页**：JS jpage 组件 → AJAX 接口 `GET /module/web/jpage/dataproxy.jsp?page=N&appid=1&webid=130&path=/&columnid=<ID>&unitid=<unitid>&webname=<URL编码站名>&permissiontype=0`，返回 **XML**：`<datastore><totalrecord>1376</totalrecord><totalpage>14</totalpage>...`（每页约 100 条）。通知公告共 1376 条。unitid 各栏目不同，需从栏目首页 HTML 里提取（正则 `jpageform_(\d+)` / `unitid=(\d+)`）。
- **详情页** `/art/YYYY/M/D/art_<栏目ID>_<文章ID>.html`：
  - 标题：`<title>` 三段式（站名 栏目 标题）取最后一段；
  - 时间：`<meta name='Maketime' content='YYYY-MM-DD HH:mm:ss'>`；
  - 来源：`信息来源：<!--<$[信息来源]>begin-->XXX<!--<$[信息来源]>end-->`；
  - 正文：`<!--ZJEG_RSS.content.begin-->` 与 `ZJEG_RSS.content.end` 之间，按 `<p>` 切分剥标签，尾部/头部需剔除标记残留（`ZJEG_RSS.content.begin-->` 与尾随 `<!--`）。
  - 实测清洗：44 段、4357 字，标题/时间/来源全对（样例 `explore/extract-demo.mjs`）。

## 校新闻网结构事实（初步）

- 首页栏目目录式：`ttgznew/`(头条关注)、`zhxwnew/`(综合新闻)、`jcdt/`(基层动态)、`kxyj/`(科学研究)、`mtndnew/`、`rwgs/` 等，栏目页形如 `/<栏目>/index.htm`。
- 文章真实地址在 **caunewspaper.ihwrm.com**：`https://caunewspaper.ihwrm.com/index/index/index/release_id/233981.html`（校报平台）。
- 栏目页也有 hash 型链接（如 `b5bab4932ef5431fb70647867e3181fa.htm`），需在爬虫阶段摸清跳转关系；详情页结构待实测（阶段0 爬虫原型时做）。

## 对 SPEC 的影响

1. **全 Node 技术栈建议成立**：爬虫（fetch 手写解析，无需重型依赖）、MCP（@modelcontextprotocol/sdk）、Actions 均为 Node，沙箱内可端到端测试。
2. §5.1 栏目表可更新：土地学院三栏目 ID 已核实；教务处栏目待映射（art_41xxx 同构）。
3. §5.2 抓取策略补充：博达 CMS 分页走 dataproxy.jsp XML 接口（比翻静态页更省流量）；列表 30 条/页静态页本身也可用。
4. §11 风险表「TLS 拦截」一项解除（Node fetch 直连全通）；校新闻网解析新增为一个小风险项。

## 遗留待办（阶段0 实施时）

- [ ] 摸清 caunewspaper.ihwrm.com 详情页结构（新闻网站文章正文抽取）
- [ ] 教务处首页栏目映射（通知类栏目 ID 确认）
- [ ] news 各栏目 index.htm 分页方式（疑似 hash URL + JS，需实测）
