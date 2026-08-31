# cau-portal 功能性问题修复清单（2026-08-31 傍晚 · 交接版）

> 本清单由复盘后全量通读 `src/client/*` 得出，每条均已对照源码坐实（文件:行号）。
> 与 `REVIEW-2026-08-31.md` 的关系：该文件里 P1 已全部修完并推送（commit 79657b5）；
> 本清单是**新发现的功能口径问题 + 遗留 P2 中偏功能的部分**，尚未修。
>
> **状态（2026-08-31 晚）**：F-A ~ F-J 已全部本地实现并构建验证通过（node build.mjs + node --check + sim-load ✅），
> 未推送——等用户点头后与 UI 批一起或单独推送。
>
> **执行规则（重要）**：
> 1. 只改本地 → `node build.mjs` → `node --check lib/index.js lib/client.js` → `node tools/sim-load.cjs` 验证。
> 2. **不要推送、不要 pnpm update**——攒批，等用户点名「推」再走推送流程（见 AGENTS.md 规则 1.1）。
> 3. build.mjs 会把 `require("./x")` 内联成 IIFE、把中文转义成 \uXXXX 大写十六进制——核验 bundle 时用大写转义形。
> 4. 客户端改动（lib/client.js）用户强刷即生效；只有改 `src/index.ts`（服务端）才需要重启 dsh web。

---

## P0（口径 bug，建议优先）

### F-A. 已归档条目仍计入「未读数」和「今日要览」
- **根因**：两处过滤都漏了归档操作（`loadDeadlineOps()` 里值为 `'archive'` 的条目）。
  - `src/client/panel.tsx:79-83` `unreadCandidates()`：只按门户模块开关过滤，不排除归档
    → 侧栏按钮未读数把「已归档但未读」的条目算进去。用户在首页归档一行后：列表里没了，侧栏计数没减。
  - `src/client/panel-home.tsx:139` `overview` 的 `imp` 过滤：只查 `isPruned` + 门户开关，不排除归档
    → 已归档条目仍计入「今日要览 · 高重要新进」计数，还可能出现在 top3 列表里。
- **修法**：两处都加归档排除。
  - `unreadCandidates` 内：`const ops = loadDeadlineOps()`（panel.tsx 已 import `loadDeadlineOps`），过滤条件加 `ops[it.article_id || it.url] !== 'archive'`。
  - `overview` 的 `imp` 过滤加同样条件（组件内已有 `ops` state，注意加进 useMemo 依赖数组）。
- **验证**：归档一条未读要闻 → 侧栏计数立即减一、今日要览芯片计数同步减。

### F-B. 首页文章点击「静默无响应」
- **位置**：`src/client/panel-home.tsx:162-164` `openArt()` 只接受 `/^[0-9a-f]{40}$/` 的 id，否则什么都不做（无反馈、无兜底）。
- **对照**：`src/client/panel-column.tsx:120-128` `openRow()` 对非 hex id 有兜底：`window.open(resolveUrl(r.url, site), '_blank')`。
- **修法**：home 的 `openArt` 加同样兜底——id 不是 40-hex 且有 url 时新标签开原文（门户 tp_up 链接可直接 window.open）。
- **验证**：构造/找一条 URL 键控的要闻条目点击 → 新标签打开而非无反应。

## P1（功能不符/不一致）

### F-C. 多令牌只试第一枚，无故障转移
- **位置**：`src/client/data.ts:73` `readCloudText` 只用 `activeTokenValues()[0]`；第一枚失效（401/403）时不会尝试第二枚，只回退服务端代理（仍带同一枚）。
- **矛盾**：设置页「令牌管理」支持登记多枚并逐枚启用，读取路径却永远只用第一枚 → 第二枚形同虚设。
- **修法**：`readCloudText` 遍历 `activeTokenValues()` 依次尝试（401/403 时试下一枚），全部失败再走 `serverProxyText`（带第一枚），最后抛错。注意 404（文件不存在）不应触发换令牌——只有鉴权类错误才换。
- **验证**：登记两枚令牌、第一枚故意改错 → 面板仍能读出数据（走了第二枚）。

### F-D. toolview 接管了「非新闻形」工具，输出一坨 JSON
- **位置**：`src/client/toolview.tsx:135-142` `TOOL_KEYS` 包含 `mcp__cau__get_usage`、`mcp__cau__list_sites`。
  这两个工具返回的不是新闻条目结构（`cardItems()` 返回空数组）→ 走 `JSON.stringify` 糊成 `<pre>` 一坨，比 DSH 默认渲染还难看。
- **修法**：从 `TOOL_KEYS` 删掉 `get_usage`、`list_sites`（交还 DSH 默认渲染）；或者为这两个写专用渲染（用量表/站点列表）。推荐前者，成本最低。
- **验证**：对话里让 AI 调 `mcp__cau__get_usage` → 结果不再是本插件的 JSON 糊块。

### F-E. ArchiveView 令牌口径与其他视图不一致
- **位置**：`src/client/panel.tsx:172` `activeTokenValues()[0] || loadSettings().githubToken || ''`。
  其他所有视图（panel.tsx:87、:271、data.ts:73）都只用 `activeTokenValues()[0]`；`githubToken` 是废弃旧键。
- **修法**：删掉 `|| loadSettings().githubToken || ''` 回退（若 `loadSettings` import 因此闲置一并清理）。

### F-D2. 侧栏按钮未读数只在页面加载时取一次
- **位置**：`src/client/index.tsx:54-66` `fetchUnreadCount()` 仅在挂载时调用；之后只有开面板（`onUnreadChange`）才更新。云端每 2h 更新，长时间开着页面计数陈旧。
- **修法（二选一）**：① 与通知轮询同频（10min）定时重取 `fetchUnreadCount`；② 暂不修，等 UI 批做「⟳ 手动刷新」时一起解决（推荐②，届时面板底部状态行+刷新按钮会带动计数刷新）。

## P2（卫生/健壮性，顺手做）

### F-F. 死代码删除
- `src/client/panel.tsx:95-125` `ensureToken()`（window.prompt 那套）——无调用方（令牌登记流程早已走设置页）。
- `src/client/data.ts:388` `backfillFollowCaches()`——无调用方。
- `src/client/panel-deadlines.tsx:135` `mineIdOf()`——无调用方。
- 删除后 `node --check` + sim-load 验证。

### F-G. daysLeft 两份实现不一致 + 非法日期不拦截
- `src/client/panel-home.tsx:35`（午夜对齐 `Math.round`）vs `src/client/panel-deadlines.tsx:9`（`Math.ceil` 含时刻）→ 边界日两处可能差 1 天。
- 且 `Date.parse('2026-02-31')` 会自动进位成 3 月 3 日，非法日期不报错（REVIEW P2 遗留）。
- **修法**：抽一个共享 `daysLeft(date)` 到 `data.ts` 导出（口径：午夜对齐、非法日期返回 NaN），两处 import 替换。

### F-H. feed 串行拉取 → 并发
- `src/client/panel-manage.tsx:87` 管理视图逐列 `await readFeed`（全部站点 15+ 次串行请求，GitHub 模式首次明显慢）。
- `src/client/panel-column.tsx:72` 站点视图（未指定栏目）同样串行。
- **修法**：改 `Promise.all`（全量并发即可，列数量小；或简单限流 6 并发）。注意保持「失败单个跳过」语义（当前 `if (f && Array.isArray(f.items))`）。

### F-I. CSS 跨文件隐式依赖
- `src/client/panel-deadlines.tsx:73` 用了 `dsh-cau_chips`，其定义在 `settings.tsx` 的 SETTINGS_CSS 里（碰巧都注入所以可用）。
- **修法**：把 `.dsh-cau_chips` 挪进 `PANEL_CSS`（panel.tsx），消除跨文件依赖。

### F-J. 关注栏未读点硬编码（视觉 bug）
- `src/client/panel-home.tsx:494` 关注行 `<span className="dsh-cau_rowDot" data-read="0" />` 常显灰点，与要闻未读点同款 → 误导。
- **修法**：删除该 span（关注不是未读概念）。
- 备注：此项也算 UI，可留给 UI 批；但它是硬编码假数据，列在这里。

---

## 已排除的「假问题」（不要改）
- ~~已过期待办不可见~~：`panel-deadlines.tsx:36-37` 选「全部」时已过期条目可见（n<0 也在列表里）。非 bug。
- ~~归档/关注状态返回首页不刷新~~：视图是条件渲染、返回即重挂载，state 全部重新加载。非 bug。
- 通知轮询 10min 与计数陈旧：见 F-D2，归入刷新入口一并解决。

## 修复后自检清单
1. `node build.mjs` 无报错。
2. `node --check lib/index.js`、`node --check lib/client.js` 通过。
3. `node tools/sim-load.cjs` 通过（stub ModuleLoader 验证导出/apply/slot）。
4. 客户端行为抽查（用户强刷后）：归档一条未读要闻看侧栏计数；要览芯片；toolview 调 get_usage；管理页加载速度。
