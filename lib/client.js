window.__ModuleLoader__.load({ id: 'cau-portal', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
exports.apply = apply;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 客户端（阶段4 第4步：弹层面板）。
 * 侧边栏底部「农大门户」按钮：点击开关弹层面板（panel.tsx）；
 * 按钮规格（定稿）：42px 行高 / 36px 圆钮，宽栏显示名称，收起态悬停 Tooltip；
 * 未读计数：宽栏行尾 tertiary 计数（无红点），收起态并入 Tooltip；
 * 配色全用 DSH --dsw-* 语义 token（带回退值），校徽 currentColor 跟随主题。
 * 后续步骤在本文件扩展：上下文附加条（第6步）。
 */
const react_1 = require("react");
var panel_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PANEL_CSS = void 0;
exports.fetchUnreadCount = fetchUnreadCount;
exports.CauPanel = CauPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 面板（阶段4 第4步 批②/③：全套浏览）。
 * 圆角毛玻璃卡片浮层（右缘留边距、垂直居中 540px/74vh）+ 导航栈：
 * L0 首页（panel-home）→ L1 栏目页（panel-column，站点/栏目）→ L2 文章阅读（panel-article）+ 归档/关注 视图。
 * 头部有「固定」开关（固定后点外部/Esc 不关闭，仅 ✕ 关）。
 * 未读口径：AI 重要（高/中）+近 7 天；打开即读（计数即时减一）；tertiary 计数无红点。
 */
const react_1 = require("react");
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
var panel_home_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeView = HomeView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal L0：首页聚合（阶段4 第4步 批②/③）。
 * 待办截止卡（能手动 留存/归档；点击→原文；「归档 n」入口回溯）+ 要闻（AI 重要，上限10、可加入关注）+
 * 关注栏（无上限）+ 栏目频道（可点进学院/栏目专栏，列出全部推文）+ 快捷入口。
 * 数据：index.json + summary.json（缓存由调用方/本组件直接读云端，量小）。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var empty_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = Empty;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批①：统一空态（图标 + 主文案 + 可选引导行）。零逻辑纯展示组件。
 * UI 批②：icon 改为任意节点（线性 SVG 图标，<Ic n="…"/>），不再传 emoji 字符串。
 * 列表级「暂无内容」类提示统一走这里；卡片内嵌的短提示仍用 .dsh-cau_empty 文本。
 */
function Empty(props) {
    const { icon, main, sub } = props;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_empty", children: [icon ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyIcon", children: icon }) : null, (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyMain", children: main }), sub ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptySub", children: sub }) : null] }));
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
function fmtCn(iso) {
    if (!iso)
        return '';
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(iso);
    return m ? `${+m[2]}月${+m[3]}日` : '';
}
function ImpBadge({ level }) {
    const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow';
    return (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_badge ${cls}`, children: level || '低' });
}
function HomeView(props) {
    const { onOpenColumn, onOpenArticle, onViewArchive, onViewFollow, onViewDeadlines, onReadChange } = props;
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [indexJson, setIndexJson] = (0, react_1.useState)(null);
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [readSet, setReadSet] = (0, react_1.useState)(() => (0, data_1.loadReadSet)());
    const [follow, setFollow] = (0, react_1.useState)(() => (0, data_1.loadFollow)());
    const [ops, setOps] = (0, react_1.useState)(() => (0, data_1.loadDeadlineOps)());
    const [mine, setMine] = (0, react_1.useState)(() => (0, data_1.loadMine)());
    const [mineEdit, setMineEdit] = (0, react_1.useState)(null);
    const startMineEdit = (id) => {
        setMineEdit(getMineEditDraft(id));
    };
    const getMineEditDraft = (id) => {
        if (id) {
            const m = (0, data_1.loadMine)()[id];
            const shown = mineRows.find((r) => r.id === id);
            return { id, name: shown?.title || m?.title || '', date: (0, data_1.mineDeadlineOf)(m) || '', url: m?.article_url || '' };
        }
        return { id: null, name: '', date: '', url: '' };
    };
    const [needToken, setNeedToken] = (0, react_1.useState)(false);
    const mods = (0, react_1.useMemo)(() => (0, data_1.loadModules)(), []);
    const load = async () => {
        setPhase('loading');
        const [idx, sum] = await Promise.all([(0, data_1.readCloudJson)('data/index.json'), (0, data_1.readCloudJson)('data/summary.json')]);
        if (!idx && !sum) {
            setNeedToken(true);
            setPhase('maybe-token');
            return;
        }
        setIndexJson(idx);
        setSummary(sum);
        (0, data_1.migrateMineFromPin)();
        setMine((0, data_1.loadMine)());
        setPhase('ready');
    };
    (0, react_1.useEffect)(() => {
        void load();
    }, []);
    const important = (0, react_1.useMemo)(() => (summary?.important || []).filter((it) => !(0, data_1.isPruned)(it.article_id || it.url) && ops[it.article_id || it.url] !== 'archive'), [summary, ops]);
    /** 要闻分块：其他来源；各限 8 条，归档一条自动补一条 */
    const isPortalIt = (it) => /tp_up/.test(String(it.url || ''));
    const portalNews = (0, react_1.useMemo)(() => (mods.portal ? important.filter(isPortalIt).slice(0, 8) : []), [important, mods.portal]);
    const otherNews = (0, react_1.useMemo)(() => important.filter((it) => !isPortalIt(it)).slice(0, 8), [important]);
    const archiveFromNews = (id) => {
        (0, data_1.setDeadlineOp)(id, 'archive');
        setOps((prev) => ({ ...(prev || {}), [id]: 'archive' }));
    };
    /** 我的事项：精选大卡（标题/日期快照 + 云端 deadline 富集；含已过期） */
    const mineRows = (0, react_1.useMemo)(() => {
        const dlById = new Map((summary?.deadlines || []).map((d) => [d.article_id || d.url, d]));
        return Object.entries(mine)
            .map(([id, m]) => {
            const d = dlById.get(id);
            const date = (0, data_1.mineDeadlineOf)(m) || d?.date || null;
            // 事项名语义：m.task=true 用 m.title（用户给定）；旧记录优先 AI 提取的事项名 d.item
            const title = m.task ? m.title || d?.item : d?.item || m.title || d?.title || '(事项)';
            return { id, title, date, column: m.column || d?.column || '', artUrl: m.article_url || d?.url || '', artTitle: d?.title || '' };
        })
            .sort((a, b) => String(b.date || '9999-12-31').localeCompare(String(a.date || '9999-12-31')));
    }, [mine, summary]);
    /** 全部未过期截止数（未归档） */
    const allDeadlines = (0, react_1.useMemo)(() => (summary?.deadlines || []).filter((d) => ops[d.article_id || d.url] !== 'archive').length, [summary, ops]);
    // ---------- 今日要览（主动察觉层：高重要新进 · 3天内截止 · 关注规则命中） ----------
    const watchRules = (0, react_1.useMemo)(() => (0, data_1.loadRules)().filter((r) => r.enabled), []);
    const overview = (0, react_1.useMemo)(() => {
        const imp = (summary?.important || []).filter((it) => !(0, data_1.isPruned)(it.article_id || it.url) &&
            ops[it.article_id || it.url] !== 'archive' &&
            (mods.portal || !isPortalIt(it)));
        const cut = Date.now() - 3 * 86400000;
        const recentOk = (t) => {
            const x = Date.parse(String(t || ''));
            return !Number.isFinite(x) || x >= cut;
        };
        const high = imp.filter((it) => it.importance === '高' && recentOk(it.time));
        const hits = imp.filter((it) => (0, data_1.matchRules)(watchRules, it).length > 0 && recentOk(it.time));
        const dueSoon = (summary?.deadlines || []).filter((d) => ops[d.article_id || d.url] !== 'archive').filter((d) => {
            const n = (0, data_1.daysLeft)(d.date);
            return Number.isFinite(n) && n >= 0 && n <= 3;
        });
        const top = [...high.map((it) => ({ ...it, tag: 'high' })), ...hits.map((it) => ({ ...it, tag: 'hit' }))]
            .filter((v, i, arr) => arr.findIndex((x) => (x.article_id || x.url) === (v.article_id || v.url)) === i)
            .slice(0, 3);
        return { high: high.length, due: dueSoon.length, hits: hits.length, top };
    }, [summary, watchRules, ops, mods.portal]);
    const archiveCount = (0, react_1.useMemo)(() => (summary?.deadlines || []).filter((d) => ops[d.article_id || d.url] === 'archive').length, [summary, ops]);
    /** 打开文章：40 位 hex id → 面板内阅读；否则（无正文条目/自定义事项）新标签开原文 */
    const openArt = (it, sibs, index) => {
        const id = it.article_id || it.url;
        if (id && /^[0-9a-f]{40}$/.test(id.replace(/\.json$/, '')))
            onOpenArticle(id, sibs, index);
        else if (it.url)
            window.open(it.url, '_blank', 'noopener');
    };
    const toggleFollow = (it) => {
        const cur = (0, data_1.loadFollow)();
        const idx = cur.findIndex((x) => x.id === it.id);
        let next;
        if (idx >= 0)
            next = cur.filter((x) => x.id !== it.id);
        else
            next = [{ id: it.id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary }, ...cur];
        (0, data_1.saveFollow)(next);
        setFollow(next);
    };
    const allImportantIds = (0, react_1.useMemo)(() => important.map((it) => it.article_id || it.url), [important]);
    /** 要闻行（两块共用）：点标题进步详情 / ☆ 关注 / 归档自动补位 */
    const newsRow = (it, i, sibs) => {
        const id = it.article_id || it.url;
        const read = readSet.includes(id);
        const followed = follow.some((x) => x.id === id);
        return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_impRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impDot", "data-read": read ? '1' : '0' }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_impMain", onClick: () => openArt(it, sibs, i), children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_impTop", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impTitle", children: it.title }), (0, jsx_runtime_1.jsx)(ImpBadge, { level: it.importance }), (0, data_1.matchRules)(watchRules, it).length > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impHit", title: "\u547D\u4E2D\u5173\u6CE8\u89C4\u5219", children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "target" }) }))] }), it.summary && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impSummary", children: it.summary }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_impMeta", children: [it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ') })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_impActs", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_followBtn' + (followed ? ' dsh-cau_on' : ''), title: followed ? '取消关注' : '加入关注', onClick: () => toggleFollow({ id, title: it.title, url: it.url, time: it.time, source: it.source, column: it.column, importance: it.importance, summary: it.summary }), children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: followed ? 'starFill' : 'star' }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_impArch", title: "\u5F52\u6863\uFF08\u4ECE\u6B64\u5904\u79FB\u9664\uFF0C\u53EF\u5728\u300C\u5F52\u6863\u300D\u89C6\u56FE\u4E2D\u627E\u56DE\uFF09", onClick: () => archiveFromNews(id), children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "archive" }) })] })] }, id));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u4E2D\u2026" })] })), phase === 'maybe-token' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: "\u9700\u8981 GitHub \u53EA\u8BFB\u4EE4\u724C\u624D\u80FD\u8BFB\u53D6\u4E91\u7AEF\u6570\u636E\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn dsh-cau_msgBtnPrimary", onClick: () => void load(), children: "\u53BB\u914D\u7F6E" })] })), phase === 'error' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: "\u4E91\u7AEF\u8BFB\u53D6\u5931\u8D25\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn", onClick: () => void load(), children: "\u91CD\u8BD5" })] })), phase === 'ready' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!summary && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_hint", children: "\u805A\u5408\u6570\u636E\u751F\u6210\u4E2D\u2026\u680F\u76EE\u4E0E\u5FEB\u6377\u5165\u53E3\u4ECD\u53EF\u7528\u3002" }), (summary?.summaryReason === 'missing' || summary?.summaryReason === 'error') && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_hint", children: "\u5F85\u529E\u4E0E\u8981\u95FB\u805A\u5408\u6682\u4E0D\u53EF\u7528\uFF08\u4E91\u7AEF summary.json \u672A\u5C31\u7EEA\uFF09\uFF0C\u5176\u4F59\u529F\u80FD\u6B63\u5E38\u3002" })), (overview.high > 0 || overview.due > 0 || overview.hits > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ov", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_ovTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "sparkle" }), "\u4ECA\u65E5\u8981\u89C8"] }), overview.high > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_ovChip hl", children: ["\u9AD8\u91CD\u8981\u65B0\u8FDB ", overview.high] }), overview.due > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_ovChip due", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "clock" }), "3 \u5929\u5185\u622A\u6B62 ", overview.due] })), overview.hits > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_ovChip hit", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "target" }), "\u547D\u4E2D\u5173\u6CE8 ", overview.hits] })), overview.top.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_ovList", children: overview.top.map((it) => ((0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_ovRow", onClick: () => openArt(it, [], 0), children: [(0, jsx_runtime_1.jsx)("em", { children: it.tag === 'high' ? '高' : (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "target" }) }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_ovTitleTxt", children: it.title }), (0, jsx_runtime_1.jsx)("i", { children: [it.column, it.source].filter(Boolean).join(' · ') })] }, String(it.article_id || it.url)))) }))] })), mods.deadline && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_secTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "star" }), "\u6211\u7684\u4E8B\u9879"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secLine" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_secActs", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: () => startMineEdit(), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "plus" }), "\u81EA\u5B9A\u4E49\u4E8B\u9879"] }), allDeadlines > 0 && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: onViewDeadlines, children: ["\u5168\u90E8\u5F85\u529E ", allDeadlines, " \u203A"] }))] })] }), mineRows.length === 0 ? ((0, jsx_runtime_1.jsx)(empty_1.Empty, { icon: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "note" }), main: "\u8FD8\u6CA1\u6709\u6211\u7684\u4E8B\u9879", sub: "\u70B9\u300C+ \u81EA\u5B9A\u4E49\u4E8B\u9879\u300D\u76F4\u63A5\u8BB0\u5F55\u8981\u529E\u7684\u4E8B\uFF1B\u6216\u5728\u300C\u5168\u90E8\u5F85\u529E\u300D/\u6587\u7AE0\u9875\u70B9\u300C\u6211\u7684\u4E8B\u9879\u300D\u7CBE\u9009\uFF08\u9644\u539F\u6587\u94FE\u63A5\uFF09" })) : ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mineGrid", children: mineRows.map(({ id, title, date, column, artUrl, artTitle }) => {
                                    const mm = /^\d{4}-(\d{1,2})-(\d{1,2})/.exec(String(date || ''));
                                    const n = date ? (0, data_1.daysLeft)(String(date)) : Number.NaN;
                                    const expired = Number.isFinite(n) && n < 0;
                                    const urgent = Number.isFinite(n) && n >= 0 && n <= 3;
                                    const canArticle = !String(id).startsWith('custom-');
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: 'dsh-cau_mineCard' + (expired ? ' expired' : urgent ? (n <= 1 ? ' due' : ' soon') : ''), children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineDate", children: [mm ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mineDay", children: +mm[2] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mineYM", children: [+mm[1], "\u6708"] })] })) : ((0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mineYM", children: "\u672A\u8BBE\u65E5\u671F" })), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mineCount", children: !Number.isFinite(n) ? '—' : expired ? '已过期' : n === 0 ? '今天' : `剩 ${n} 天` })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mineTitle", title: title, children: title }), artTitle && artTitle !== title && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mineSrc", title: artTitle, children: artTitle })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineFoot", children: [column && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mineCol", children: column }), !column && (0, jsx_runtime_1.jsx)("span", {}), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mineActs", children: [artUrl && canArticle && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_mineArt", title: "\u6253\u5F00\u5BF9\u5E94\u6587\u7AE0", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    if (id)
                                                                        openArt({ article_id: id, url: artUrl }, [], 0);
                                                                }, children: ["\u539F\u6587", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] })), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    startMineEdit(id);
                                                                }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "edit" }), "\u7F16\u8F91"] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    (0, data_1.removeMine)(id);
                                                                    setMine((0, data_1.loadMine)());
                                                                }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "close" }), "\u79FB\u51FA"] })] })] }), mineEdit && (mineEdit.id || '') === id && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineEdit", onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u4E8B\u9879\u540D\uFF08\u70B9\u6B64\u4FEE\u6539\uFF0C\u5982\u300C\u571F\u5730\u5B66\u96622027\u63A8\u514D\u751F\u62A5\u540D\u300D\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", value: mineEdit.name, onChange: (e) => setMineEdit({ ...mineEdit, name: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineEditRow", children: [(0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u622A\u6B62\u65E5\u671F" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "date", value: mineEdit.date, onChange: (e) => setMineEdit({ ...mineEdit, date: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u539F\u6587\u94FE\u63A5\uFF08\u53EF\u7A7A\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", value: mineEdit.url, onChange: (e) => setMineEdit({ ...mineEdit, url: e.target.value }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineEditRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_textBtn dsh-cau_on", onClick: () => {
                                                                    if (mineEdit.id)
                                                                        (0, data_1.updateMine)(mineEdit.id, { title: mineEdit.name, url: mineEdit.url, deadline: mineEdit.date });
                                                                    else if (mineEdit.name.trim())
                                                                        (0, data_1.addCustomMine)({ title: mineEdit.name.trim(), deadline: mineEdit.date, url: mineEdit.url });
                                                                    setMine((0, data_1.loadMine)());
                                                                    setMineEdit(null);
                                                                }, children: "\u4FDD\u5B58" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_textBtn", onClick: () => setMineEdit(null), children: "\u53D6\u6D88" })] })] }))] }, id));
                                }) })), mineEdit && !mineEdit.id && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineEdit dsh-cau_mineEditNew", children: [(0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u4E8B\u9879\u540D\uFF08\u8981\u505A\u4EC0\u4E48\uFF0C\u5982\u300C\u571F\u5730\u5B66\u96622027\u63A8\u514D\u751F\u62A5\u540D\u300D\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", value: mineEdit.name, onChange: (e) => setMineEdit({ ...mineEdit, name: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineEditRow", children: [(0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u622A\u6B62\u65E5\u671F\uFF08\u53EF\u7A7A\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "date", value: mineEdit.date, onChange: (e) => setMineEdit({ ...mineEdit, date: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u539F\u6587\u94FE\u63A5\uFF08\u53EF\u7A7A\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", value: mineEdit.url, onChange: (e) => setMineEdit({ ...mineEdit, url: e.target.value }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mineEditRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_textBtn dsh-cau_on", onClick: () => {
                                                    if (mineEdit.name.trim()) {
                                                        (0, data_1.addCustomMine)({ title: mineEdit.name.trim(), deadline: mineEdit.date, url: mineEdit.url });
                                                        setMine((0, data_1.loadMine)());
                                                        setMineEdit(null);
                                                    }
                                                }, children: "\u4FDD\u5B58" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_textBtn", onClick: () => setMineEdit(null), children: "\u53D6\u6D88" })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_deadlineEntry", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_deadlineEntryMain", role: "button", onClick: onViewDeadlines, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "clipboard" }), "\u5168\u90E8\u5F85\u529E\uFF08\u542B\u6240\u6709\u622A\u6B62\u4E8B\u9879\uFF09", (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_deadlineEntryArrow", children: "\u7B5B\u9009\u4E0E\u67E5\u770B \u203A" })] }), archiveCount > 0 && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: onViewArchive, children: ["\u5F52\u6863 ", archiveCount] }))] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_secTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "flame" }), "\u8981\u95FB"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secLine" }), important.length > 0 && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_textBtn", onClick: () => {
                                            setReadSet((0, data_1.markAllRead)(allImportantIds));
                                            onReadChange?.();
                                        }, children: "\u5168\u90E8\u5DF2\u8BFB" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [!summary && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u805A\u5408\u6570\u636E\u6682\u4E0D\u53EF\u7528" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_newsSubHead", children: [(0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "news" }), " \u5176\u4ED6\u6765\u6E90"] }), (0, jsx_runtime_1.jsxs)("em", { children: [otherNews.length, " \u6761"] })] }), summary && otherNews.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_empty", children: "\u6682\u65E0\u5176\u4ED6\u6765\u6E90\u91CD\u8981\u901A\u77E5" }), otherNews.map((it, i) => newsRow(it, i, otherNews.map((x) => ({ id: x.article_id || x.url, title: x.title }))))] })] }), mods.deadline && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_secTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "bookmark" }), "\u5173\u6CE8"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secLine" }), follow.length > 0 && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: onViewFollow, children: ["\u67E5\u770B\u5168\u90E8 ", follow.length] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [follow.length === 0 && (0, jsx_runtime_1.jsx)(empty_1.Empty, { icon: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "bookmark" }), main: "\u8FD8\u6CA1\u6709\u5173\u6CE8\u5185\u5BB9", sub: "\u5728\u6587\u7AE0\u91CC\u70B9\u300C\u52A0\u5165\u5173\u6CE8\u300D\uFF0C\u91CD\u8981\u5185\u5BB9\u96C6\u4E2D\u5728\u8FD9\uFF0C\u4E0D\u8BBE\u4E0A\u9650" }), follow.slice(0, 5).map((it) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_row", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowMain", onClick: () => onOpenArticle(it.id, follow.map((x) => ({ id: x.id, title: x.title })), 0), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowTitle", children: it.title }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowMeta", children: [it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ') })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_followBtn dsh-cau_on", title: "\u53D6\u6D88\u5173\u6CE8", onClick: () => toggleFollow(it), children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "starFill" }) })] }, it.id)))] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_secTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "books" }), "\u680F\u76EE\u9891\u9053"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secLine" })] }), (indexJson?.sites || []).map((site) => {
                                const off = site.id === 'portal';
                                return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_colGroup", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_colSiteBtn' + (off ? ' dsh-cau_dis' : ''), disabled: off, onClick: () => !off && onOpenColumn(site.id, null), children: [site.name, " \u203A", off && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_disTag", children: "\u4E0D\u53EF\u7528" })] }), !off && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_colChips", children: (site.columns || []).map((c) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_chip dsh-cau_chipBtn", onClick: () => onOpenColumn(site.id, c.key), children: [c.name, typeof c.items === 'number' && (0, jsx_runtime_1.jsx)("em", { className: "dsh-cau_chipCount", children: c.items })] }, c.key))) }))] }, site.id));
                            })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_sec", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_secHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_secTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "link" }), "\u5FEB\u6377\u5165\u53E3"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secLine" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_quick", children: [(0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_quickLink", href: "https://one.cau.edu.cn", target: "_blank", rel: "noreferrer", children: ["\u7EDF\u4E00\u95E8\u6237", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] }), (0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_quickLink", href: "https://clst.cau.edu.cn", target: "_blank", rel: "noreferrer", children: ["\u5B66\u9662\u5B98\u7F51", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] }), (0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_quickLink", href: "https://jwc.cau.edu.cn", target: "_blank", rel: "noreferrer", children: ["\u6559\u52A1\u5904", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] }), (0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_quickLink", href: "https://news.cau.edu.cn", target: "_blank", rel: "noreferrer", children: ["\u6821\u65B0\u95FB\u7F51", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] })] })] })] }))] }));
}

return module.exports; })();
var panel_column_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnView = ColumnView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal L1：栏目页（阶段4 第4步 批②/③）。
 * site 视图=该学院全部栏目合并；column 视图=单栏。行=标题+AI 摘要+重要度徽章+未读点+栏目，
 * 顶部主题标签（讲座/竞赛/评奖/选课/学术等，来自 ai.category）跨站聚合筛选；点行进 L2。
 * 数据：index.json（站点/栏目目录）+ summary.json（ai_map 徽章与筛选）+ feed/<site>__<col>.json。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var empty_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = Empty;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批①：统一空态（图标 + 主文案 + 可选引导行）。零逻辑纯展示组件。
 * UI 批②：icon 改为任意节点（线性 SVG 图标，<Ic n="…"/>），不再传 emoji 字符串。
 * 列表级「暂无内容」类提示统一走这里；卡片内嵌的短提示仍用 .dsh-cau_empty 文本。
 */
function Empty(props) {
    const { icon, main, sub } = props;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_empty", children: [icon ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyIcon", children: icon }) : null, (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyMain", children: main }), sub ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptySub", children: sub }) : null] }));
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
const articleId = (item) => (typeof item.article === 'string' ? item.article.replace(/\.json$/, '') : '') || item.url || '';
function ImpBadge({ level }) {
    const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow';
    return (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_badge ${cls}`, children: level || '低' });
}
function ColumnView(props) {
    const { site, column, siteName, columnName, onBack, onOpenArticle, onOpenColumn } = props;
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [indexJson, setIndexJson] = (0, react_1.useState)(null);
    const [rows, setRows] = (0, react_1.useState)([]);
    const [tag, setTag] = (0, react_1.useState)('全部');
    const [readSet, setReadSet] = (0, react_1.useState)(() => (0, data_1.loadReadSet)());
    const [siteLabel, setSiteLabel] = (0, react_1.useState)(siteName || site);
    const [colLabel, setColLabel] = (0, react_1.useState)(columnName || '');
    const [errMsg, setErrMsg] = (0, react_1.useState)('');
    const load = async () => {
        if (site === 'portal' && !(0, data_1.loadModules)().portal) {
            setErrMsg('统一门户模块已在设置中关闭；可到 设置 → 数据源 → 统一门户 重新启用。');
            setPhase('error');
            return;
        }
        setErrMsg('');
        setPhase('loading');
        const [idx, sum] = await Promise.all([(0, data_1.readCloudJson)('data/index.json'), (0, data_1.readCloudJson)('data/summary.json')]);
        setIndexJson(idx);
        setSummary(sum);
        // 从 index 推导站点/栏目中文名（shell 不传原名时用）
        if (idx) {
            const siteDir = (idx.sites || []).find((s) => s.id === site);
            const sn = siteDir?.name || siteName || site;
            setSiteLabel(sn);
            const cn = column ? siteDir?.columns?.find((c) => c.key === column)?.name || columnName || '' : '';
            setColLabel(cn);
        }
        // 加载 feed（站点视图并发拉取各栏目；单个失败不影响其余）
        const feeds = [];
        if (!column && idx) {
            const siteDir = (idx.sites || []).find((s) => s.id === site);
            const cols = siteDir?.columns || [];
            const results = await Promise.all(cols.map((c) => (0, data_1.readFeed)(site, c.key)));
            for (const f of results)
                if (f && Array.isArray(f.items))
                    feeds.push(f);
        }
        else {
            const f = await (0, data_1.readFeed)(site, column);
            if (f && Array.isArray(f.items))
                feeds.push(f);
        }
        const aiMap = sum?.ai_map || {};
        const out = [];
        for (const f of feeds) {
            for (const it of f.items || []) {
                const id = articleId(it);
                if ((0, data_1.isPruned)(id))
                    continue; // 已被用户删除（管理模式）→ 隐藏
                out.push({
                    id,
                    url: it.url || '',
                    title: it.title || '',
                    date: it.date || null,
                    site_name: f.site_name || f.site || site,
                    column_name: f.column_name || '',
                    ai: aiMap[id.replace(/\.json$/, '')] || null,
                });
            }
        }
        out.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        setRows(out);
        setTag('全部');
        setPhase('ready');
    };
    (0, react_1.useEffect)(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [site, column]);
    const categories = (0, react_1.useMemo)(() => {
        const set = new Set();
        for (const r of rows)
            if (r.ai?.category && r.ai.category !== '其他')
                set.add(r.ai.category);
        return ['全部', ...set];
    }, [rows]);
    const visible = (0, react_1.useMemo)(() => (tag === '全部' ? rows : rows.filter((r) => r.ai?.category === tag)), [rows, tag]);
    const openRow = (r, index) => {
        const sibs = visible.map((x) => ({ id: x.id, title: x.title }));
        if (r.id && /^[0-9a-f]{40}$/.test(r.id.replace(/\.json$/, ''))) {
            onOpenArticle(r.id, sibs, index);
        }
        else {
            // 无已存正文：新标签开原文
            if (r.url)
                window.open(resolveUrl(r.url, site), '_blank', 'noopener');
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_backBtn", onClick: onBack, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u8FD4\u56DE"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: column ? [siteLabel, colLabel].filter(Boolean).join(' / ') : siteLabel || site })] }), phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u4E2D\u2026" })] })), phase === 'error' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: errMsg || '栏目加载失败。' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn", onClick: () => void load(), children: "\u91CD\u8BD5" })] })), phase === 'ready' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [categories.length > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tags", children: categories.map((c) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_tag' + (tag === c ? ' dsh-cau_tagOn' : ''), onClick: () => setTag(c), children: c }, c))) })), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_list", children: [visible.length === 0 && (0, jsx_runtime_1.jsx)(empty_1.Empty, { icon: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "doc" }), main: "\u6682\u65E0\u5185\u5BB9", sub: "\u6362\u4E2A\u680F\u76EE\u6216\u7B5B\u9009\u6761\u4EF6\u8BD5\u8BD5" }), visible.map((r, i) => {
                                const read = r.id && readSet.includes(r.id);
                                return ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_row", onClick: () => openRow(r, i), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowDot", "data-read": read ? '1' : '0' }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowTop", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowTitle", children: r.title }), r.ai?.importance && (0, jsx_runtime_1.jsx)(ImpBadge, { level: r.ai.importance })] }), r.ai?.summary && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowSummary", children: r.ai.summary }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowMeta", children: [r.column_name, r.date].filter(Boolean).join(' · ') })] })] }, r.id + r.url));
                            })] })] }))] }));
}
function resolveUrl(url, siteId) {
    if (/^https?:\/\//i.test(url))
        return url;
    const host = { clst: 'https://clst.cau.edu.cn', jwc: 'https://jwc.cau.edu.cn', news: 'https://news.cau.edu.cn' };
    const root = host[siteId];
    return root ? root + (url.startsWith('/') ? url : '/' + url) : url;
}

return module.exports; })();
var panel_article_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleView = ArticleView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal L2：文章原文阅读（阶段4 第4步 批②/③）。
 * 面包屑（来源 → 栏目 → 标题）+ 标题/来源/时间 + AI 摘要框 + deadline 高亮 +
 * 正文全文（pre-wrap）+ 查看原文（新标签）+ 上一篇/下一篇 +
 * 加入/取消关注（无上限）+ 待办类文章的 留存/归档。
 * 数据：data/articles/<id>.json（经数据层读取；ai 已内联在文章文件）。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
const idOf = (it) => it.article_id || it.url || '';
/** 统一门户（tp_up）→ 专属界面（不标注「正文未抓取」） */
const isPortal = (u) => /tp_up/.test(String(u || ''));
function fmt(iso) {
    if (!iso)
        return '';
    return String(iso);
}
function ArticleView(props) {
    const { articleId, siteName, columnName, onBack, onOpenArticle, siblings, index, onTitle } = props;
    const mods = (0, react_1.useMemo)(() => (0, data_1.loadModules)(), []);
    const [art, setArt] = (0, react_1.useState)(null);
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [followed, setFollowed] = (0, react_1.useState)(false);
    const [deadlineOp, setDeadlineOpState] = (0, react_1.useState)(null);
    const [aiBusy, setAiBusy] = (0, react_1.useState)(false);
    const [aiOut, setAiOut] = (0, react_1.useState)(null);
    const [aiErr, setAiErr] = (0, react_1.useState)('');
    const [fromCache, setFromCache] = (0, react_1.useState)(false);
    const [mined, setMined] = (0, react_1.useState)(() => (0, data_1.isMine)(articleId));
    const reload = async () => {
        setPhase('loading');
        setAiOut(null);
        setAiErr('');
        const r = await (0, data_1.readArticleMeta)(articleId);
        if (!r) {
            setPhase('error');
            return;
        }
        setArt(r.article);
        setFromCache(r.cached);
        setPhase('ready');
        setFollowed((0, data_1.isFollowed)(articleId));
        setDeadlineOpState((0, data_1.loadDeadlineOps)()[articleId] || null);
        setQuoted((0, bus_1.hasAttached)(articleId));
        // autoAttach：打开文章时自动附加阅读上下文（设置 → 面板偏好；已手动引用的不重复）
        try {
            if ((0, data_1.loadSettings)().autoAttach && !(0, bus_1.hasAttached)(articleId) && r.article.title) {
                (0, bus_1.addAttached)({ id: articleId, title: r.article.title, source: r.article.source || siteName || '' });
                setQuoted(true);
            }
        }
        catch {
            /* 附加失败不影响阅读 */
        }
        if (r.article.title)
            onTitle?.(r.article.title);
    };
    (0, react_1.useEffect)(() => {
        void reload();
    }, [articleId]);
    const runEnrich = async () => {
        setAiBusy(true);
        setAiErr('');
        const s = (0, data_1.loadSettings)();
        const out = await (0, data_1.enrichArticle)(articleId, {
            provider: s.monitorModel?.provider,
            model: s.monitorModel?.model,
        });
        setAiBusy(false);
        if (out?.ok)
            setAiOut(out.result);
        else
            setAiErr(String(out?.error || '加工失败'));
    };
    // 引用到对话：追加这篇（可多篇）；点击切换引用/取消
    const [quoted, setQuoted] = (0, react_1.useState)(false);
    const attachToChat = () => {
        if (!art?.title)
            return;
        if ((0, bus_1.hasAttached)(articleId)) {
            (0, bus_1.removeAttached)(articleId);
            setQuoted(false);
        }
        else {
            (0, bus_1.addAttached)({ id: articleId, title: art.title, source: art.source || siteName || '' });
            setQuoted(true);
        }
    };
    const toggleFollowNow = () => {
        const cur = (0, data_1.loadFollow)();
        const idx = cur.findIndex((x) => x.id === articleId);
        let next;
        if (idx >= 0)
            next = cur.filter((x) => x.id !== articleId);
        else
            next = [
                { id: articleId, title: art?.title || '', url: art?.url || '', time: art?.time || null, source: art?.source || '', column: columnName || '', importance: art?.ai?.importance, summary: art?.ai?.summary },
                ...cur,
            ];
        (0, data_1.saveFollow)(next);
        setFollowed(idx < 0);
        // 关注 → 存整篇本地快照（云端保留期外仍可读）；取消 → 清除快照
        (0, data_1.cacheFollowArticle)(articleId, idx < 0 ? art : null);
    };
    const hasDeadline = !!(art?.ai?.deadline && art?.ai?.deadline.date);
    const op = deadlineOp || '';
    const toggleMineNow = async () => {
        if ((0, data_1.isMine)(articleId)) {
            (0, data_1.removeMine)(articleId);
            setMined(false);
        }
        else {
            await (0, data_1.addMine)(articleId, {
                title: art?.ai?.deadline?.item || art?.title || '事项',
                url: art?.url || '',
                deadline: hasDeadline ? art.ai.deadline.date : undefined,
                source: art?.source || '',
                column: columnName || '',
            });
            setMined(true);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_backBtn", onClick: onBack, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u8FD4\u56DE"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: [siteName || art?.source, columnName].filter(Boolean).join(' · ') })] }), phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u4E2D\u2026" })] })), phase === 'error' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_msg", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_msgText", children: (0, data_1.isPruned)(articleId)
                            ? '该数据已被删除（数据管理模式）。'
                            : '文章读取失败（正文可能尚未抓取入库，或已被删除）。' }), art && art.url ? ((0, jsx_runtime_1.jsx)("a", { className: "dsh-cau_msgBtn", href: art.url, target: "_blank", rel: "noreferrer", children: "\u67E5\u770B\u539F\u6587" })) : null, (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_msgBtn", onClick: () => void reload(), children: "\u91CD\u8BD5" })] })), phase === 'ready' && art && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h1", { className: "dsh-cau_atitle", children: art.title || '(无标题)' }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ameta", children: [isPortal(art?.url) && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_portalTag", children: "\u6821\u5185\u5E73\u53F0" }), art.source && (0, jsx_runtime_1.jsx)("span", { children: art.source }), art.time && (0, jsx_runtime_1.jsx)("span", { children: fmt(art.time) }), art.is_image_only && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_aimgTag", children: "\u7EAF\u56FE\u516C\u544A" }), fromCache && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_acacheTag", children: "\u672C\u5730\u7F13\u5B58" })] }), mods.ai && art.ai?.summary && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asummary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asumHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { children: "AI \u6458\u8981" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_asumText", children: art.ai.summary })] })), mods.ai && !art.ai?.summary && !aiOut && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asummary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asumHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { children: "AI \u6458\u8981" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_asumText dsh-cau_empty", children: "\u672C\u6587\u6682\u65E0 AI \u52A0\u5DE5\uFF08\u6458\u8981/\u5206\u7C7B/\u91CD\u8981\u5EA6/deadline\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_aactions", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_aBtn", disabled: aiBusy, onClick: () => void runEnrich(), children: aiBusy ? '加工中…' : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "sparkle" }), "AI \u8865\u6458\u8981"] })) }) }), aiErr && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setErr", children: aiErr })] })), mods.ai && aiOut && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asummary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_asumHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_secMark" }), (0, jsx_runtime_1.jsx)("span", { children: "AI \u6458\u8981\uFF08\u672C\u6B21\u4F1A\u8BDD\u5185\u751F\u6210\uFF09" })] }), aiOut.summary && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_asumText", children: aiOut.summary }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ameta", children: [aiOut.category && (0, jsx_runtime_1.jsxs)("span", { children: ["\u5206\u7C7B\uFF1A", aiOut.category] }), aiOut.importance && (0, jsx_runtime_1.jsxs)("span", { children: ["\u91CD\u8981\u5EA6\uFF1A", aiOut.importance] }), aiOut.deadline_note && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: aiOut.deadline_note })] })] })), hasDeadline && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_adeadline", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_adeadlineIcon", children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "clock" }) }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_adeadlineItem", children: art.ai.deadline.item }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_adeadlineDate", children: art.ai.deadline.date }), art.ai.deadline.evidence && (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_adeadlineEv", children: ["\u300C", art.ai.deadline.evidence, "\u300D"] })] })), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_abody", children: isPortal(art?.url) ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_portalCard", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_portalCardTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "idCard" }), "\u6821\u5185\u5E73\u53F0\u901A\u77E5"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_portalCardDesc", children: ["\u672C\u7BC7\u6765\u81EA", (0, jsx_runtime_1.jsx)("b", { children: "\u7EDF\u4E00\u95E8\u6237" }), "\uFF08\u6821\u5185\u5E73\u53F0\uFF09\uFF0C\u6B63\u6587\u5728\u95E8\u6237\u5185\u3001\u9700\u767B\u5F55\u540E\u67E5\u770B\u3002\u4E3A\u4FDD\u62A4\u4E2A\u4EBA\u654F\u611F\u4FE1\u606F\uFF08\u540D\u5355\u3001\u6210\u7EE9\u3001\u5B66\u7C4D\u7B49\u4E0D\u53D7\u63A7\uFF09\uFF0C \u63D2\u4EF6\u6309\u9690\u79C1\u539F\u5219", (0, jsx_runtime_1.jsx)("b", { children: "\u4E0D\u6536\u5F55\u6B63\u6587" }), "\uFF0C\u53EA\u4FDD\u7559\u6807\u9898\u3001\u6765\u6E90\u4E0E AI \u6458\u8981\u3002"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_aactions", children: art.url && ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_aBtn dsh-cau_aBtnPrimary", href: art.url, target: "_blank", rel: "noreferrer", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" }), "\u65B0\u6807\u7B7E\u6253\u5F00\u95E8\u6237\u539F\u6587"] })) })] })) : (art.body || (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_empty", children: "\u6B63\u6587\u672A\u6293\u53D6\u3002\u8BF7\u70B9\u300C\u67E5\u770B\u539F\u6587\u300D\u3002" })) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_aactions", children: [art.url && ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_aBtn", href: art.url, target: "_blank", rel: "noreferrer", children: ["\u67E5\u770B\u539F\u6587", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] })), mods.context && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_aBtn' + (quoted ? ' dsh-cau_aBtnOn' : ' dsh-cau_aBtnPrimary'), onClick: attachToChat, children: quoted ? '已引用 ✓（点此取消）' : '引用到对话' })), mods.deadline && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_aBtn' + (followed ? ' dsh-cau_aBtnOn' : ''), onClick: toggleFollowNow, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: followed ? 'starFill' : 'star' }), followed ? '已关注' : '加入关注'] })), hasDeadline && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_aBtn' + (mined ? ' dsh-cau_aBtnOn' : ''), onClick: () => void toggleMineNow(), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: mined ? 'starFill' : 'star' }), mined ? '已在我的事项' : '我的事项'] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_aBtn' + (op === 'archive' ? ' dsh-cau_aBtnOn' : ''), onClick: () => setDeadlineOpState((0, data_1.setDeadlineOp)(articleId, op === 'archive' ? null : 'archive')[articleId] || null), children: "\u5F52\u6863" })] }))] }), (siblings && siblings.length > 1) && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_anav", children: [index != null && index > 0 ? ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_anavBtn", onClick: () => onOpenArticle(siblings[index - 1].id, siblings, index - 1), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u4E0A\u4E00\u7BC7"] })) : ((0, jsx_runtime_1.jsx)("span", {})), index != null && index < siblings.length - 1 ? ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_anavBtn", onClick: () => onOpenArticle(siblings[index + 1].id, siblings, index + 1), children: ["\u4E0B\u4E00\u7BC7", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevRight" })] })) : ((0, jsx_runtime_1.jsx)("span", {}))] }))] }))] }));
}

return module.exports; })();
var panel_manage_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageView = ManageView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 数据管理视图（管理模式）：
 * 浏览全部数据（按站点/栏目分组）、按【起止日期自由区间】筛选（起始留空=最早、终止留空=至今）、
 * 「只看已归档」开关、搜索/站点叠加、「选择全部当前筛选」一键勾选、
 * 删除所选（二次确认；关注中条目附警示）→ 提交云端删除清单（下轮抓取 ≤2h 执行），
 * 本地立即隐藏；可随时退出管理模式。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var empty_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = Empty;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批①：统一空态（图标 + 主文案 + 可选引导行）。零逻辑纯展示组件。
 * UI 批②：icon 改为任意节点（线性 SVG 图标，<Ic n="…"/>），不再传 emoji 字符串。
 * 列表级「暂无内容」类提示统一走这里；卡片内嵌的短提示仍用 .dsh-cau_empty 文本。
 */
function Empty(props) {
    const { icon, main, sub } = props;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_empty", children: [icon ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyIcon", children: icon }) : null, (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyMain", children: main }), sub ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptySub", children: sub }) : null] }));
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
const idKey = (it) => (typeof it.article === 'string' ? it.article.replace(/\.json$/, '') : '') || it.url || '';
const submitKey = (it) => (typeof it.article === 'string' ? it.article : it.url || '');
function fmtD(d) {
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
}
/** 关键词高亮：命中片段包 <mark>；q 空时原样返回 */
function highlight(text, q) {
    const t = String(text ?? '');
    const ql = q.trim().toLowerCase();
    if (!ql)
        return t;
    const lower = t.toLowerCase();
    const parts = [];
    let i = 0;
    let idx = lower.indexOf(ql, i);
    let k = 0;
    while (idx >= 0 && k < 30) {
        if (idx > i)
            parts.push(t.slice(i, idx));
        parts.push((0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgHl", children: t.slice(idx, idx + ql.length) }, k));
        k++;
        i = idx + ql.length;
        idx = lower.indexOf(ql, i);
    }
    if (i < t.length)
        parts.push(t.slice(i));
    return parts.length ? parts : t;
}
function ManageView(props) {
    const { onBack } = props;
    const [phase, setPhase] = (0, react_1.useState)('loading');
    const [rows, setRows] = (0, react_1.useState)([]);
    const [sel, setSel] = (0, react_1.useState)(new Set());
    const [dateFrom, setDateFrom] = (0, react_1.useState)(''); // 空 = 最早
    const [dateTo, setDateTo] = (0, react_1.useState)(''); // 空 = 至今
    const [archOnly, setArchOnly] = (0, react_1.useState)(false);
    const [siteFilter, setSiteFilter] = (0, react_1.useState)('');
    const [query, setQuery] = (0, react_1.useState)('');
    const [busy, setBusy] = (0, react_1.useState)(false);
    const [confirm, setConfirm] = (0, react_1.useState)(false);
    const [done, setDone] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const load = async () => {
        setPhase('loading');
        const idx = await (0, data_1.readCloudJson)('data/index.json');
        if (!idx?.sites) {
            setError('无法读取云端目录（index.json）');
            setPhase('error');
            return;
        }
        const followSet = new Set((0, data_1.loadFollow)().map((f) => f.id));
        const mineSet = new Set(Object.keys((0, data_1.loadMine)()));
        const opsMap = (0, data_1.loadDeadlineOps)();
        const out = [];
        // 并发拉取全部站点/栏目的 feed（单个失败跳过）
        const jobs = [];
        for (const site of idx.sites) {
            for (const col of site.columns || [])
                jobs.push({ site, col });
        }
        const results = await Promise.all(jobs.map((j) => (0, data_1.readFeed)(j.site.id, j.col.key)));
        for (let i = 0; i < jobs.length; i++) {
            const { site, col } = jobs[i];
            const f = results[i];
            if (!f || !Array.isArray(f.items))
                continue;
            for (const it of f.items || []) {
                if (!it?.url)
                    continue;
                const id = idKey(it);
                if ((0, data_1.isPruned)(id))
                    continue;
                out.push({
                    id,
                    submit: submitKey(it),
                    url: it.url,
                    title: it.title || '(无标题)',
                    date: it.date || null,
                    siteKey: site.id,
                    siteName: f.site_name || site.name || site.id,
                    colName: f.column_name || col.name || '',
                    followed: followSet.has(id),
                    mined: mineSet.has(id),
                    archived: opsMap[id] === 'archive',
                });
            }
        }
        setRows(out);
        setPhase('ready');
    };
    (0, react_1.useEffect)(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const shown = (0, react_1.useMemo)(() => {
        let list = rows;
        // 日期区间（值均为 YYYY-MM-DD；空=不限）
        if (dateFrom || dateTo)
            list = list.filter((r) => {
                const d = fmtD(String(r.date || ''));
                if (!d)
                    return false; // 无日期条目仅在“不限时间”时出现
                if (dateFrom && d < dateFrom)
                    return false;
                if (dateTo && d > dateTo)
                    return false;
                return true;
            });
        if (archOnly)
            list = list.filter((r) => r.archived);
        if (siteFilter)
            list = list.filter((r) => r.siteKey === siteFilter);
        const q = query.trim().toLowerCase();
        if (q)
            list = list.filter((r) => (r.title || '').toLowerCase().includes(q) || (r.url || '').toLowerCase().includes(q));
        return list;
    }, [rows, dateFrom, dateTo, archOnly, siteFilter, query]);
    const archCount = (0, react_1.useMemo)(() => rows.filter((r) => r.archived).length, [rows]);
    const sites = (0, react_1.useMemo)(() => {
        const m = new Map();
        for (const r of rows)
            if (!m.has(r.siteKey))
                m.set(r.siteKey, r.siteName);
        return [...m.entries()];
    }, [rows]);
    const selFollow = (0, react_1.useMemo)(() => rows.filter((r) => r.followed && sel.has(r.id)).length, [rows, sel]);
    const selMine = (0, react_1.useMemo)(() => rows.filter((r) => r.mined && sel.has(r.id)).length, [rows, sel]);
    const selArch = (0, react_1.useMemo)(() => rows.filter((r) => r.archived && sel.has(r.id)).length, [rows, sel]);
    const toggle = (id) => {
        setSel((s) => {
            const n = new Set(s);
            if (n.has(id))
                n.delete(id);
            else
                n.add(id);
            return n;
        });
    };
    const selectAllShown = () => setSel(new Set(shown.map((r) => r.id)));
    const clearSel = () => setSel(new Set());
    const doDelete = async () => {
        setBusy(true);
        setError('');
        const chosen = rows.filter((r) => sel.has(r.id));
        const res = await (0, data_1.queuePruneRequest)(chosen.map((r) => r.submit));
        setBusy(false);
        if (res.ok) {
            setDone(`已提交删除 ${chosen.length} 条（云端队列共 ${res.total} 条）。本地已隐藏，云端将在下一轮抓取（≤2 小时）后真正删除。`);
            setRows((prev) => prev.filter((r) => !sel.has(r.id)));
            setSel(new Set());
            setConfirm(false);
            setDateFrom('');
            setDateTo('');
            setSiteFilter('');
        }
        else {
            setError(`提交失败：${res.error || '未知错误'}（可稍后重试）`);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_backBtn", onClick: onBack, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u9000\u51FA\u7BA1\u7406"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: "\u6570\u636E\u7BA1\u7406" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgIntro", children: "\u6309\u3010\u8D77\u59CB\u65E5\u671F ~ \u7EC8\u6B62\u65E5\u671F\u3011\u7B5B\u9009\uFF08\u8D77\u59CB\u7559\u7A7A=\u6700\u65E9\uFF0C\u7EC8\u6B62\u7559\u7A7A=\u81F3\u4ECA\uFF1B\u65E0\u65E5\u671F\u6761\u76EE\u53EA\u5728\u90FD\u4E0D\u9650\u65F6\u51FA\u73B0\uFF09\u3002\u5220\u9664\u4E0D\u53EF\u6062\u590D\uFF1A\u672C\u5730\u7ACB\u5373\u9690\u85CF\uFF0C\u4E91\u7AEF\u5C06\u4E8E\u4E0B\u4E00\u8F6E\u6293\u53D6\uFF08\u22642 \u5C0F\u65F6\uFF09\u540E\u771F\u6B63\u5220\u9664\uFF1B\u5173\u6CE8\u4E2D\u7684\u6587\u7AE0\u5C06\u4FDD\u7559\u672C\u5730\u7F13\u5B58\u53EF\u8BFB\u3002" }), phase === 'loading' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u6570\u636E\u76EE\u5F55\u2026" })] })), phase === 'error' && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgMsg error", children: error }), phase === 'ready' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgToolbar", children: [(0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_mgSearch", type: "search", placeholder: "\u641C\u7D22\u6807\u9898\u6216\u94FE\u63A5\u2026\uFF08\u4E0E\u7B5B\u9009\u53E0\u52A0\uFF09", value: query, onChange: (e) => setQuery(e.target.value) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgFilters", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgLabel", children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_mgDate", type: "date", value: dateFrom, max: dateTo || undefined, title: "\u8D77\u59CB\u65E5\u671F\uFF08\u7559\u7A7A=\u6700\u65E9\uFF09", onChange: (e) => setDateFrom(e.target.value) }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgLabel", children: "~" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_mgDate", type: "date", value: dateTo, min: dateFrom || undefined, title: "\u7EC8\u6B62\u65E5\u671F\uFF08\u7559\u7A7A=\u81F3\u4ECA\uFF09", onChange: (e) => setDateTo(e.target.value) }), (dateFrom || dateTo) && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgChipBtn", onClick: () => { setDateFrom(''); setDateTo(''); }, children: "\u91CD\u7F6E\uFF08\u5168\u90E8\uFF09" })), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mgCheck", title: "\u53EA\u663E\u793A\u5DF2\u5F52\u6863\u7684\u6570\u636E", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: archOnly, onChange: (e) => setArchOnly(e.target.checked) }), "\u53EA\u770B\u5DF2\u5F52\u6863 ", archOnly ? `(${archCount})` : ''] }), (0, jsx_runtime_1.jsxs)("select", { className: "dsh-cau_mgSel", value: siteFilter, onChange: (e) => setSiteFilter(e.target.value), title: "\u6309\u7AD9\u70B9\u7B5B\u9009", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "\u5168\u90E8\u7AD9\u70B9" }), sites.map(([k, n]) => ((0, jsx_runtime_1.jsx)("option", { value: k, children: n }, k)))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgActs", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_mgBtn", onClick: selectAllShown, disabled: !shown.length, title: "\u52FE\u9009\u5F53\u524D\u7B5B\u9009/\u7AD9\u70B9/\u641C\u7D22\u547D\u4E2D\u7684\u5168\u90E8\u6570\u636E", children: ["\u9009\u62E9\u5168\u90E8\u5F53\u524D\u7B5B\u9009\uFF08", shown.length, "\uFF09"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgBtn", onClick: clearSel, disabled: !sel.size, children: "\u6E05\u7A7A\u9009\u62E9" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgBar", children: ["\u5DF2\u9009 ", (0, jsx_runtime_1.jsx)("b", { children: sel.size }), " \u6761\uFF08\u6211\u7684\u4E8B\u9879 ", selMine, " \u00B7 \u5173\u6CE8\u4E2D ", selFollow, selArch > 0 ? ` · 已归档 ${selArch}` : '', "\uFF09", (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_mgDel", disabled: !sel.size || busy, onClick: () => setConfirm(true), children: ["\u5220\u9664\u6240\u9009\uFF08", sel.size, "\uFF09"] })] }), confirm && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgConfirm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgConfirmText", children: ["\u786E\u5B9A\u5220\u9664\u6240\u9009 ", (0, jsx_runtime_1.jsx)("b", { children: sel.size }), " \u6761\u6570\u636E\uFF1F", ' ', (selMine > 0 || selFollow > 0) && ((0, jsx_runtime_1.jsx)("b", { style: { color: 'var(--dsw-alias-state-warn,#b8860b)' }, children: [selMine > 0 && `${selMine} 条我的事项`, selFollow > 0 && `${selFollow} 条关注中`].filter(Boolean).join('，') })), ' ', (selMine > 0 || selFollow > 0) && (0, jsx_runtime_1.jsx)("span", { children: "\uFF08\u672C\u5730\u7F13\u5B58\u4ECD\u53EF\u8BFB\uFF0C\u4F46\u4E91\u7AEF\u5C06\u5220\u9664\uFF0C\u6211\u7684\u4E8B\u9879\u539F\u6587\u94FE\u63A5\u5C06\u5931\u6548\uFF09" }), "\u5220\u9664\u4E0D\u53EF\u6062\u590D\u3002"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgConfirmActs", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgBtn warn", disabled: busy, onClick: () => void doDelete(), children: busy ? '提交中…' : '确认删除' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_mgBtn", disabled: busy, onClick: () => setConfirm(false), children: "\u53D6\u6D88" })] })] })), done && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgMsg ok", children: done }), error && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgMsg error", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgList", children: [shown.length === 0 && (0, jsx_runtime_1.jsx)(empty_1.Empty, { icon: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "search" }), main: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u6570\u636E", sub: "\u653E\u5BBD\u65E5\u671F/\u7AD9\u70B9\u7B5B\u9009\u6216\u6E05\u7A7A\u641C\u7D22\u8BCD\u518D\u8BD5" }), sites
                                .map(([k, n]) => ({ k, n, items: shown.filter((r) => r.siteKey === k) }))
                                .filter((g) => g.items.length)
                                .map((g) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_mgGroup", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_mgGroupName", children: g.n }), g.items.map((r) => {
                                        const selMineRow = sel.has(r.id) && (r.mined || r.followed);
                                        return ((0, jsx_runtime_1.jsxs)("label", { className: 'dsh-cau_mgRow' + (selMineRow ? ' pro' : ''), children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: sel.has(r.id), onChange: () => toggle(r.id) }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mgRowMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mgRowTitle", children: [highlight(r.title, query), r.mined && ((0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgMine", title: "\u6211\u7684\u4E8B\u9879", children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "star" }) })), r.followed && ((0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgStar", title: "\u5173\u6CE8\u4E2D", children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "starFill" }) })), r.archived && ((0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgArch", title: "\u5DF2\u5F52\u6863\uFF08\u5168\u90E8\u5F85\u529E\u4E0D\u518D\u663E\u793A\uFF0C\u53EF\u53D6\u6D88\u5F52\u6863\uFF09", children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "archive" }) }))] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_mgRowSub", children: [r.colName, r.date ? ` · ${r.date}` : ' · 无日期', r.url && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_mgRowUrl", children: highlight(r.url, query) })] })] })] }, r.id));
                                    })] }, g.k)))] })] }))] }));
}

return module.exports; })();
var panel_deadlines_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlinesView = DeadlinesView;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 待办中心（下半部分「全部待办」点进来的视图）：
 * 展示全部未过期截止事项（summary.deadlines 全量，不再限 7 天）；
 * 顶部时间跨度筛选（剩余天数 7/30/90/全部）；每条可点进文章、可加/移「⭐ 我的事项」。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var empty_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = Empty;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批①：统一空态（图标 + 主文案 + 可选引导行）。零逻辑纯展示组件。
 * UI 批②：icon 改为任意节点（线性 SVG 图标，<Ic n="…"/>），不再传 emoji 字符串。
 * 列表级「暂无内容」类提示统一走这里；卡片内嵌的短提示仍用 .dsh-cau_empty 文本。
 */
function Empty(props) {
    const { icon, main, sub } = props;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_empty", children: [icon ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyIcon", children: icon }) : null, (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyMain", children: main }), sub ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptySub", children: sub }) : null] }));
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
function DeadlinesView(props) {
    const { onBack, onOpenArticle } = props;
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [range, setRange] = (0, react_1.useState)(30);
    const [mine, setMine] = (0, react_1.useState)(() => (0, data_1.loadMine)());
    const [ops, setOps] = (0, react_1.useState)(() => (0, data_1.loadDeadlineOps)());
    const [busy, setBusy] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        let alive = true;
        void (0, data_1.readCloudJson)('data/summary.json').then((s) => {
            if (alive)
                setSummary(s);
        });
        return () => {
            alive = false;
        };
    }, []);
    const rows = (0, react_1.useMemo)(() => {
        const all = (summary?.deadlines || []);
        // 归档 = 从当前待办列表移除（找回/取消归档走首页「归档」入口）
        const active = all.filter((d) => ops[d.article_id || d.url] !== 'archive');
        const list = active.map((d) => ({ d, n: (0, data_1.daysLeft)(d.date) }));
        if (range !== 'all')
            return list.filter((x) => Number.isFinite(x.n) && x.n >= 0 && x.n <= range);
        return list;
    }, [summary, range, ops]);
    const archivedCount = (0, react_1.useMemo)(() => (summary?.deadlines || []).filter((d) => ops[d.article_id || d.url] === 'archive').length, [summary, ops]);
    const toggleMine = async (d) => {
        const id = d.article_id || d.url;
        if (busy)
            return;
        setBusy(id);
        if ((0, data_1.isMine)(id)) {
            (0, data_1.removeMine)(id);
            setMine((0, data_1.loadMine)());
        }
        else {
            await (0, data_1.addMine)(id, { title: d.item || d.title || '(事项)', url: d.url || '', deadline: d.date, source: d.source, column: d.column });
            setMine((0, data_1.loadMine)());
        }
        setBusy('');
    };
    const sorted = [...rows].sort((a, b) => String(a.d.date).localeCompare(String(b.d.date)));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_backBtn", onClick: onBack, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u8FD4\u56DE"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: "\u5168\u90E8\u5F85\u529E" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlHint", children: ["\u6240\u6709\u542B\u622A\u6B62\u65E5\u671F\u7684\u4E8B\u9879\uFF08\u672A\u8FC7\u671F\uFF0C\u6309\u622A\u6B62\u65E5\u5347\u5E8F\uFF09\u3002\u300C\u6211\u7684\u4E8B\u9879\u300D\u53EF\u7CBE\u9009\u5230\u9996\u9875\u5927\u5361\u9762\u677F\uFF1B\u300C\u5F52\u6863\u300D\u540E\u4ECE\u672C\u5217\u8868\u6D88\u5931\uFF0C\u53EF\u5728\u9996\u9875\u300C\u5F52\u6863\u300D\u5165\u53E3\u627E\u56DE\u6216\u53D6\u6D88\u5F52\u6863\u3002", archivedCount > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_dlArch", children: ["\u5DF2\u5F52\u6863 ", archivedCount, " \u6761"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", style: { marginBottom: 8 }, children: [7, 30, 90, 'all'].map((k) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_dlChip' + (range === k ? ' on' : ''), onClick: () => setRange(k), children: k === 'all' ? '全部' : `剩余 ${k} 天内` }, k))) }), !summary ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_loading", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "\u52A0\u8F7D\u4E2D\u2026" })] })) : sorted.length === 0 ? ((0, jsx_runtime_1.jsx)(empty_1.Empty, { icon: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "clipboard" }), main: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6682\u65E0\u622A\u6B62\u4E8B\u9879", sub: `全部未过期截止共 ${(summary?.deadlines || []).length} 条` })) : ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_dlList", children: sorted.map(({ d, n }) => {
                    const id = d.article_id || d.url;
                    const mined = !!mine[id];
                    const archived = ops[id] === 'archive';
                    return ((0, jsx_runtime_1.jsxs)("div", { className: 'dsh-cau_dlRow' + (n <= 1 ? ' due' : n <= 3 ? ' soon' : ''), children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlTop", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlItem", children: d.item || '截止事项' }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_dlDate", children: [d.date, " \u00B7 ", n < 0 ? '已过期' : n === 0 ? '今天' : `剩 ${n} 天`] }), d.column && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlCol", children: d.column })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlTitleWrap", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlTitle", title: d.title, onClick: () => onOpenArticle(id), children: d.title }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_dlAct", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_textBtn' + (mined ? ' dsh-cau_on' : ''), disabled: busy === id, onClick: () => void toggleMine(d), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: mined ? 'starFill' : 'star' }), mined ? '已在我的事项' : '我的事项'] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", disabled: busy === id, onClick: () => {
                                                    const next = { ...ops, [id]: 'archive' };
                                                    setOps(next);
                                                    (0, data_1.setDeadlineOp)(id, 'archive');
                                                }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "archive" }), "\u5F52\u6863"] })] })] })] }, id));
                }) }))] }));
}

return module.exports; })();
var settings_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_CSS = void 0;
exports.CauSettings = CauSettings;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 设置页（2026-09-01 结构重设计：方案C 分组卡片墙 + 语义统一）：
 * 首页 = 3 组分组卡片（智能与数据 / 通知与关注 / 面板行为）＋ 顶部提醒条（红=基本需求不满足 / 黄=注意）。
 *   开关语义统一：功能卡（AI/数据源/待办/引用协同/邮件）首页即有总开关；凭据卡（令牌/门户账号，淡底）无开关只显状态。
 * 子页（卡片↔子页严格 1:1；页头下内联本模块相关提醒，另有其他模块问题时显示可点击计数 chip 回首页）：
 *   ① AI 加工·模型配置（模型选择 + 用量柱状图 7/30/90 天 + 指标切换 + 分账表 + 按需补摘要说明）
 *   ② 令牌管理（多令牌登记：值/过期日/剩余天数/快捷跳转 GitHub 管理页/逐枚开关）
 *   ③ 面板偏好·引用协同（自动附加 + 引用协同开关 + 面板固定）  ④ 待办提醒·关注（模块开关 + 关注规则 + 系统通知）
 *   ⑤ 数据源（GitHub 云端 + 统一门户开关 + 连通检查）  ⑥ 每日邮件报告  ⑦ 门户账号（开源版不可用 + 重要链接）
 * 全部纯客户端（localStorage），浏览器刷新生效。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var ctx_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCtx = bindCtx;
exports.getCtx = getCtx;
/**
 * 跨组件树共享插件 ctx（面板树 ↔ 设置页 都要用会话服务与模型目录）。
 *
 * 注意：build.mjs 的内联器**不做模块去重**——同一个模块被两处 require 会内联成
 * 两份独立 IIFE，各自持有自己的模块级状态。因此这里不能用模块级变量存单例，
 * 必须挂到 window 上（全局、跨所有内联副本共享），否则 bindCtx/getCtx 会读错对象。
 */
function bindCtx(c) {
    ;
    window.__CAU_CTX__ = c;
}
function getCtx() {
    return window.__CAU_CTX__;
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
const noop = () => { };
exports.SETTINGS_CSS = `
.dsh-cau_set{display:flex;flex-direction:column;gap:14px;padding:16px 0 24px;max-width:640px;width:100%;min-width:0;overflow-x:hidden}
/* ---- 提醒条 ---- */
.dsh-cau_alert{display:flex;align-items:flex-start;gap:8px;padding:9px 12px;border-radius:10px;font-size:12px;line-height:17px}
.dsh-cau_alert.error{border:1px solid color-mix(in srgb,var(--cau-err) 45%,transparent);background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_alert.warn{border:1px solid color-mix(in srgb,var(--cau-warn) 45%,transparent);background:color-mix(in srgb,var(--cau-warn) 10%,transparent);color:var(--cau-warn)}
.dsh-cau_alertDot{flex:none;width:8px;height:8px;margin-top:4px;border-radius:50%;background:currentColor}
/* ---- 分组 ---- */
.dsh-cau_setGroup{display:flex;flex-direction:column;gap:10px}
.dsh-cau_setGroupTitle{display:flex;align-items:center;gap:8px;padding:2px 2px 0;font-size:11px;font-weight:600;letter-spacing:.07em;color:var(--cau-ink3)}
.dsh-cau_setGroupTitle::after{content:"";flex:1;height:1px;background:var(--cau-line-soft)}
/* ---- 分组卡片 ---- */
.dsh-cau_cards{display:flex;flex-direction:column;gap:10px}
.dsh-cau_setCard{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 26%,transparent);box-shadow:0 1px 2px rgba(10,15,22,.03);cursor:pointer;transition:border-color .12s ease}
.dsh-cau_setCard:hover{border-color:var(--cau-brand-a55)}
.dsh-cau_setCardAlt{background:var(--cau-fill)}
.dsh-cau_cardMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.dsh-cau_cardName{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_cardIcon{flex:none;display:flex;color:var(--cau-brand)}
.dsh-cau_cardIcon svg{width:15px;height:15px}
.dsh-cau_cardDesc{font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_cardBadge{flex:none;font-size:11px;padding:2px 7px;border-radius:999px;white-space:nowrap}
.dsh-cau_cardBadge.ok{background:color-mix(in srgb,var(--cau-ok) 14%,transparent);color:var(--cau-ok)}
.dsh-cau_cardBadge.warn{background:color-mix(in srgb,var(--cau-warn) 14%,transparent);color:var(--cau-warn)}
.dsh-cau_cardBadge.off{background:var(--cau-fill);color:var(--cau-ink3)}
.dsh-cau_cardBadge.err{background:color-mix(in srgb,var(--cau-err) 14%,transparent);color:var(--cau-err)}
/* ---- 开关 ---- */
.dsh-cau_switch{flex:none;position:relative;width:34px;height:20px;border:1px solid var(--cau-line);border-radius:999px;background:var(--cau-fill);cursor:pointer;transition:background .15s ease,border-color .15s ease}
.dsh-cau_switch span{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--cau-ink3);transition:transform .15s ease,background .15s ease}
.dsh-cau_switch.on{border-color:var(--cau-brand-a55);background:var(--cau-brand-a22)}
.dsh-cau_switch.on span{transform:translateX(14px);background:var(--cau-brand)}
/* ---- 子页 ---- */
.dsh-cau_setPageHead{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dsh-cau_setSubBack{flex:none;display:inline-flex;align-items:center;gap:3px;height:28px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-brand);font-size:12px;cursor:pointer}
.dsh-cau_setSubBack:hover{background:var(--cau-brand-a9)}
.dsh-cau_setSubBack svg{width:12px;height:12px}
.dsh-cau_setBlocks{display:flex;flex-direction:column;gap:14px}
.dsh-cau_setBlock{display:flex;flex-direction:column;gap:8px}
.dsh-cau_setTitle{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_setTitle::before{content:"";flex:none;width:2px;height:12px;border-radius:2px;background:var(--cau-brand)}
.dsh-cau_setTitle svg{width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_setDesc{font-size:12px;line-height:17px;color:var(--cau-ink3)}
.dsh-cau_setRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0}
.dsh-cau_mineLabel{display:flex;flex-direction:column;gap:4px;margin:0}
.dsh-cau_mineLabel span{font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_mineLabel .dsh-cau_setSelect{width:100%;flex:none}
.dsh-cau_setLabel{flex:1;min-width:0;font-size:13px;color:var(--cau-ink2)}
.dsh-cau_setInput{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink);font-size:12px;outline:none}
.dsh-cau_setInput:focus{border-color:var(--cau-brand)}
.dsh-cau_setSelect{box-sizing:border-box;min-width:0;flex:1;height:32px;padding:0 8px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:var(--dsw-specific-menu,#1b1e24);color:var(--cau-ink);font-size:12px;outline:none;cursor:pointer}
.dsh-cau_setBtn{flex:none;display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 14px;border:1px solid var(--cau-line);border-radius:10px;background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer}
.dsh-cau_setBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_setBtn svg{width:12px;height:12px}
.dsh-cau_setBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_setBtn.danger{border-color:color-mix(in srgb,var(--cau-err) 45%,transparent);color:var(--cau-err)}
.dsh-cau_setBtn.danger:hover{background:color-mix(in srgb,var(--cau-err) 8%,transparent)}
.dsh-cau_setHint{font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_setOk{font-size:12px;color:var(--cau-ok)}
.dsh-cau_setErr{font-size:12px;color:var(--cau-err)}
.dsh-cau_setWarn{font-size:12px;line-height:17px;color:var(--cau-warn)}
.dsh-cau_setOther{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border:1px solid color-mix(in srgb,var(--cau-warn) 40%,transparent);border-radius:999px;background:color-mix(in srgb,var(--cau-warn) 8%,transparent);color:var(--cau-warn);font-size:11px;cursor:pointer}
.dsh-cau_setOther:hover{background:color-mix(in srgb,var(--cau-warn) 14%,transparent)}
.dsh-cau_setCheck{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--cau-ink2);cursor:pointer}
.dsh-cau_setCheck input{accent-color:var(--cau-brand)}
.dsh-cau_infoCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--cau-line-soft);border-radius:10px;background:var(--cau-fill)}
/* ---- 用量图 ---- */
.dsh-cau_chart{display:block;width:100%;height:150px;color:var(--cau-ink2)}
.dsh-cau_setChip{height:24px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_setChip.on{background:var(--cau-brand-a12);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_usageTable{width:100%;border-collapse:collapse;font-size:12px;color:var(--cau-ink2)}
.dsh-cau_usageTable th,.dsh-cau_usageTable td{padding:6px 8px;border-bottom:1px solid var(--cau-line-soft);text-align:right;white-space:nowrap}
.dsh-cau_usageTable th:first-child,.dsh-cau_usageTable td:first-child{text-align:left}
.dsh-cau_usageTable th{color:var(--cau-ink3);font-weight:500}
/* ---- 令牌 ---- */
.dsh-cau_tokList{display:flex;flex-direction:column;gap:8px}
.dsh-cau_tok{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m)}
.dsh-cau_tokMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.dsh-cau_tokName{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_tokMeta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--cau-ink3)}
.dsh-cau_tokActs{display:flex;gap:6px;flex:none}
.dsh-cau_tokBtn{flex:none;display:inline-flex;align-items:center;gap:3px;height:26px;padding:0 9px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer;text-decoration:none}
.dsh-cau_tokBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_tokBtn svg{width:11px;height:11px}
.dsh-cau_tokBtn.danger{color:var(--cau-err);border-color:color-mix(in srgb,var(--cau-err) 40%,transparent)}
.dsh-cau_tokBtn.danger:hover{background:color-mix(in srgb,var(--cau-err) 8%,transparent)}
.dsh-cau_links{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.dsh-cau_link{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px;text-decoration:none;cursor:pointer}
.dsh-cau_link:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_link svg{width:11px;height:11px}
`;
const ROLE_LABEL = {
    enrich: '爬虫管道加工',
    'on-demand': '面板按需加工',
    monitor: '监控',
    other: '其他',
};
function fmtNum(n) {
    if (n >= 1e6)
        return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4)
        return (n / 1e4).toFixed(1) + 'w';
    return String(n);
}
function daysUntil(dateStr) {
    if (!dateStr)
        return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime()))
        return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400e3);
}
function expiryBadge(expires) {
    const n = daysUntil(expires);
    if (n == null)
        return { cls: 'dsh-cau_setHint', text: '未设过期日' };
    if (n < 0)
        return { cls: 'dsh-cau_setErr', text: `已过期 ${-n} 天` };
    if (n <= 30)
        return { cls: 'dsh-cau_setWarn', text: `${n} 天后过期` };
    return { cls: 'dsh-cau_setOk', text: `${n} 天后过期` };
}
const KEY_LINKS = [
    { key: 'github-read', label: 'GitHub 令牌管理', url: 'https://github.com/settings/personal-access-tokens' },
    { key: 'repo', label: '数据仓库', url: 'https://github.com/ZBber-lab/cau-portal' },
    { key: 'actions', label: '定时抓取 Actions', url: 'https://github.com/ZBber-lab/cau-portal/actions' },
    { key: 'cron', label: 'cron-job.org', url: 'https://console.cron-job.org/jobs' },
    { key: 'ds', label: 'DeepSeek 平台', url: 'https://platform.deepseek.com' },
    { key: 'portal', label: '统一门户', url: 'https://one.cau.edu.cn' },
];
/** 自绘 SVG 柱状图（无图表库依赖） */
function BarChart({ items, unit }) {
    const W = 460;
    const H = 150;
    const PAD = 8;
    const BASE = 24;
    const TOP = 24;
    const max = Math.max(1, ...items.map((i) => i.value));
    const n = items.length;
    const step = Math.max(1, Math.ceil(n / 10));
    const slot = (W - PAD * 2) / n;
    const bw = Math.max(2, slot - 3);
    return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: `0 0 ${W} ${H}`, className: "dsh-cau_chart", role: "img", "aria-label": "\u7528\u91CF\u67F1\u72B6\u56FE", children: [(0, jsx_runtime_1.jsx)("line", { x1: PAD, y1: H - BASE, x2: W - PAD, y2: H - BASE, stroke: "currentColor", opacity: ".25" }), (0, jsx_runtime_1.jsxs)("text", { x: PAD, y: 14, fontSize: "10", fill: "currentColor", opacity: ".6", children: ["max ", fmtNum(max), " ", unit] }), items.map((it, i) => {
                const h = Math.max(1.5, (it.value / max) * (H - BASE - TOP - 10));
                const x = PAD + i * slot + (slot - bw) / 2;
                const on = it.value > 0;
                return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("rect", { x: x, y: H - BASE - h, width: bw, height: h, rx: 2, fill: on ? 'var(--cau-brand)' : 'currentColor', opacity: on ? 1 : 0.12, children: (0, jsx_runtime_1.jsx)("title", { children: `${it.label}：${fmtNum(it.value)} ${unit}` }) }), i % step === 0 && ((0, jsx_runtime_1.jsx)("text", { x: x + bw / 2, y: H - 8, fontSize: "9", fill: "currentColor", opacity: ".55", textAnchor: "middle", children: it.label }))] }, i));
            })] }));
}
function Toggle({ on, onToggle, label }) {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_switch' + (on ? ' on' : ''), "aria-pressed": on, "aria-label": label, title: on ? '点击禁用' : '点击启用', onClick: (e) => { e.stopPropagation(); onToggle(); }, children: (0, jsx_runtime_1.jsx)("span", {}) }));
}
function CauSettings(props) {
    const _ctx = (0, ctx_1.getCtx)() || {};
    const sessions = props.sessions ?? _ctx.sessions;
    const modelDirectories = props.modelDirectories ?? _ctx.modelDirectories;
    const [page, setPage] = (0, react_1.useState)('home');
    const [settings, setSettings] = (0, react_1.useState)(() => (0, data_1.loadSettings)());
    const [mods, setMods] = (0, react_1.useState)(() => (0, data_1.loadModules)());
    const [tokens, setTokens] = (0, react_1.useState)(() => (0, data_1.loadTokens)());
    const [savedFlash, setSavedFlash] = (0, react_1.useState)(false);
    const upd = (next) => {
        setSettings(next);
        (0, data_1.saveSettings)(next);
    };
    const toggleMod = (k) => {
        const next = { ...mods, [k]: !mods[k] };
        setMods(next);
        (0, data_1.saveModules)(next);
    };
    const persistTokens = (next) => {
        setTokens(next);
        (0, data_1.saveTokens)(next);
    };
    const alerts = (0, react_1.useMemo)(() => (0, data_1.computeAlerts)(), [mods, tokens, settings]);
    const flash = () => {
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 2000);
    };
    // ---------- 子页：AI 加工 · 模型配置 ----------
    const subList = (cb) => {
        try {
            return sessions?.list ? sessions.list.subscribe(cb) : noop;
        }
        catch {
            return noop;
        }
    };
    const snapList = () => {
        try {
            return sessions?.list?.getSnapshot();
        }
        catch {
            return undefined;
        }
    };
    const listSnap = (0, react_1.useSyncExternalStore)(subList, snapList);
    const sessionId = listSnap?.current;
    const [groups, setGroups] = (0, react_1.useState)([]);
    const [modelState, setModelState] = (0, react_1.useState)('idle');
    const [modelNote, setModelNote] = (0, react_1.useState)('');
    const loadModelDir = async () => {
        setModelState('loading');
        setModelNote('');
        if (!sessionId || !modelDirectories) {
            setModelState('fail');
            setModelNote('当前没有打开的会话，或模型目录服务不可用');
            return;
        }
        let d = null;
        try {
            d = modelDirectories.directoryFor(sessionId);
        }
        catch {
            setModelState('fail');
            setModelNote('当前会话无法解析模型目录');
            return;
        }
        let settled = false;
        const timer = window.setTimeout(() => {
            if (settled)
                return;
            settled = true;
            setModelState('fail');
            setModelNote('模型目录未响应（将使用服务端默认模型）');
        }, 6000);
        try {
            await d.load();
            settled = true;
            window.clearTimeout(timer);
            setGroups(d.store?.getSnapshot()?.groups || []);
            setModelState('ok');
        }
        catch {
            settled = true;
            window.clearTimeout(timer);
            setModelState('fail');
            setModelNote('模型目录加载失败（将使用服务端默认模型）');
        }
    };
    const monitor = settings.monitorModel || null;
    const selGroup = groups.find((g) => g.id === monitor?.provider) || groups[0] || null;
    const selModel = selGroup?.models?.find((m) => m.id === monitor?.model) || null;
    const pickModel = (provider, model) => {
        upd({ ...settings, monitorModel: { provider, model } });
        flash();
    };
    // 用量
    const [rows, setRows] = (0, react_1.useState)(null);
    const [metric, setMetric] = (0, react_1.useState)('calls');
    const [days, setDays] = (0, react_1.useState)(30);
    (0, react_1.useEffect)(() => {
        let alive = true;
        void (0, data_1.loadUsageRows)().then((r) => {
            if (alive)
                setRows(r);
        });
        return () => {
            alive = false;
        };
    }, []);
    const daily = (0, react_1.useMemo)(() => (rows ? (0, data_1.buildDailyUsage)(rows, days, metric) : []), [rows, days, metric]);
    const byRole = (0, react_1.useMemo)(() => (rows ? (0, data_1.summarizeUsage)(rows, days) : null), [rows, days]);
    const METRIC_UNIT = { calls: '次', prompt: '输入tok', completion: '输出tok', cost: '元' };
    // ---------- 子页：令牌管理 ----------
    const [tokEditing, setTokEditing] = (0, react_1.useState)(null);
    const [tokDraft, setTokDraft] = (0, react_1.useState)({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    const startEdit = (t) => {
        if (t) {
            setTokEditing(t.id);
            setTokDraft({ ...t });
        }
        else {
            setTokEditing('new');
            setTokDraft({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
        }
    };
    const saveTokDraft = () => {
        const d = tokDraft;
        if (!d.name.trim())
            return;
        const rec = { ...d, id: d.id || `tok-${Date.now().toString(36)}`, value: d.value || '' };
        const next = tokEditing && tokEditing !== 'new' ? tokens.map((t) => (t.id === tokEditing ? rec : t)) : [...tokens, rec];
        persistTokens(next);
        setTokEditing(null);
        flash();
    };
    const removeTok = (id) => {
        if (!window.confirm('删除该令牌登记？（令牌值仅本机，删除后不可恢复）'))
            return;
        persistTokens(tokens.filter((t) => t.id !== id));
    };
    const toggleTok = (id) => persistTokens(tokens.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
    // ---------- 子页：数据源连通检查 ----------
    const [cloudState, setCloudState] = (0, react_1.useState)('idle');
    const [cloudMsg, setCloudMsg] = (0, react_1.useState)('');
    const checkCloud = async () => {
        setCloudState('loading');
        setCloudMsg('');
        try {
            const text = await (0, data_1.readCloudText)('data/index.json');
            const j = JSON.parse(text);
            setCloudState('ok');
            setCloudMsg(`已连通 ✓ 数据更新至 ${j.last_updated || '未知'}，条目 ${j.stats?.total_items ?? '?'} 条 / 正文 ${j.stats?.articles_stored ?? '?'} 篇`);
        }
        catch (e) {
            setCloudState('fail');
            setCloudMsg(String(e?.message || e));
        }
    };
    // ---------- 每日邮件报告（阶段6） ----------
    const fetchEmailStatus = async () => {
        try {
            const r = await fetch('/api/cau/email/status');
            const j = await r.json();
            if (j && j.ok !== false) {
                setMailCfg((c) => ({
                    ...c,
                    enabled: !!j.enabled,
                    sender: j.sender || c.sender,
                    recipient: j.recipient || c.recipient || j.sender || c.sender,
                    sendTime: j.sendTime || c.sendTime,
                    hasCode: !!j.hasCode,
                    provider: j.provider ? String(j.provider) : '',
                }));
            }
        }
        catch (e) {
            /* 服务端不可用时保持现状 */
        }
    };
    const [mailCfg, setMailCfg] = (0, react_1.useState)({ enabled: false, sender: '', authCode: '', recipient: '', sendTime: '08:00', hasCode: false, provider: '', rulesCount: 0 });
    const [mailState, setMailState] = (0, react_1.useState)('idle');
    const [mailMsg, setMailMsg] = (0, react_1.useState)('');
    const [mailLast, setMailLast] = (0, react_1.useState)('');
    const refreshMailInfo = async () => {
        await fetchEmailStatus();
        try {
            const r = await fetch('/api/cau/email/status');
            const j = await r.json();
            if (j && j.ok !== false) {
                setMailLast(j.last_sent
                    ? `上次发送：${new Date(j.last_sent).toLocaleString('zh-CN', { hour12: false })}（${j.last_mode === 'test' ? '测试' : '日报'}）${j.last_ok === false ? ' · ❌ ' + (j.last_error || '失败') : ' · ✅ 成功'}`
                    : '尚未发送过（启用后每天 ' + (j.sendTime || '08:00') + ' 自动发送；测试按钮可先试发）');
                setMailCfg((c) => ({ ...c, rulesCount: j.rulesCount || 0, provider: j.provider || c.provider }));
            }
        }
        catch (e) {
            /* 忽略 */
        }
    };
    const doMailSave = async (enabledOverride) => {
        const enabled = enabledOverride ?? mailCfg.enabled;
        setMailState('loading');
        setMailMsg('');
        try {
            const r = await fetch('/api/cau/email/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled,
                    sender: mailCfg.sender,
                    authCode: mailCfg.authCode,
                    recipient: mailCfg.recipient,
                    sendTime: mailCfg.sendTime,
                }),
            });
            const j = await r.json();
            if (j?.ok) {
                setMailState('ok');
                setMailMsg(enabled ? '✅ 已保存并启用：每天 ' + (j.sendTime || mailCfg.sendTime) + ' 自动发送（错过时间开机自动补发）；建议点「测试发送」确认' : '已保存（未启用）');
                setMailCfg((c) => ({ ...c, authCode: '' }));
                void refreshMailInfo();
            }
            else {
                setMailState('fail');
                setMailMsg(j?.error || '保存失败');
            }
        }
        catch (e) {
            setMailState('fail');
            setMailMsg('服务端不可用：' + String(e?.message || e));
        }
    };
    const doMailToggle = async () => {
        const next = !mailCfg.enabled;
        // 未配置就启用 → 直接引导去配置
        if (next && !mailCfg.sender) {
            setPage('mail');
            setMailState('fail');
            setMailMsg('启用前请先填写发件邮箱与授权码');
            return;
        }
        try {
            const r = await fetch('/api/cau/email/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: next }),
            });
            const j = await r.json();
            if (j?.ok) {
                setMailCfg((c) => ({ ...c, enabled: !!j.enabled }));
                setMailState(next ? 'ok' : 'idle');
                setMailMsg(next ? '已启用：每天 ' + (j.sendTime || mailCfg.sendTime) + ' 自动发送（错过时间开机补发）' : '已禁用：日报暂停（配置保留）');
            }
            else {
                setMailState('fail');
                setMailMsg((j?.error || '切换失败') + '（可进页面查看/修复）');
            }
        }
        catch (e) {
            setMailState('fail');
            setMailMsg('服务端不可用：' + String(e?.message || e));
        }
    };
    const doMailTest = async () => {
        setMailState('loading');
        setMailMsg('发送中（30 秒内）…');
        try {
            const r = await fetch('/api/cau/email/test', { method: 'POST' });
            const j = await r.json();
            if (j?.ok) {
                setMailState('ok');
                setMailMsg(`✅ 测试邮件已发出：「${j.subject || '农大门户日报'}」→ 请查看收件箱（含垃圾箱）`);
            }
            else {
                setMailState('fail');
                setMailMsg('发送失败：' + (j?.error || '未知错误') + '（常见：授权码错误 / 服务商被封 / 收件地址不对）');
            }
            void refreshMailInfo();
        }
        catch (e) {
            setMailState('fail');
            setMailMsg('请求失败：' + String(e?.message || e));
        }
    };
    // 关注规则变化 → 同步快照给服务端（邮件的 🎯 段用）；静默失败
    const syncRulesToEmail = (next) => {
        try {
            void fetch('/api/cau/email/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules: next.filter((r) => r.enabled !== false && r.keyword) }),
            });
        }
        catch (e) {
            /* 忽略 */
        }
    };
    (0, react_1.useEffect)(() => {
        void fetchEmailStatus();
    }, []);
    // ---------- 关注规则 + 系统通知 ----------
    const [rules, setRules] = (0, react_1.useState)(() => (0, data_1.loadRules)());
    const [ruleDraft, setRuleDraft] = (0, react_1.useState)({ keyword: '', source: '', minImportance: '' });
    const [notifyStatus, setNotifyStatus] = (0, react_1.useState)(() => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'));
    const persistRules = (next) => {
        setRules(next);
        (0, data_1.saveRules)(next);
        syncRulesToEmail(next);
    };
    const addRule = () => {
        const k = ruleDraft.keyword.trim();
        if (!k)
            return;
        persistRules([
            ...rules,
            {
                id: (0, data_1.newRuleId)(),
                keyword: k.slice(0, 30),
                source: ruleDraft.source.trim().slice(0, 30) || undefined,
                minImportance: ruleDraft.minImportance ? ruleDraft.minImportance : undefined,
                enabled: true,
            },
        ]);
        setRuleDraft({ keyword: '', source: '', minImportance: '' });
    };
    // ---------- 首页卡片 ----------
    const tokBadge = (() => {
        const err = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) != null && daysUntil(t.expires) < 0);
        const warn = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) <= 30 && daysUntil(t.expires) >= 0);
        const active = tokens.filter((t) => t.enabled && t.value).length;
        return err ? { cls: 'err', text: `${active} 枚在用 · ⚠ 已过期` } : warn ? { cls: 'warn', text: `${active} 枚在用 · ⚠ 临期` } : { cls: 'ok', text: `${active} 枚在用` };
    })();
    const cardGroups = [
        {
            title: '智能与数据',
            cards: [
                {
                    key: 'ai',
                    icon: 'robot',
                    name: 'AI 加工 · 模型配置',
                    desc: '模型选择 + 用量柱状图（7/30/90 天，次数/token/费用切换）',
                    badge: monitor ? { cls: 'ok', text: monitor.model } : { cls: 'warn', text: '未指定模型' },
                    need: mods.ai,
                    page: 'ai',
                },
                {
                    key: 'cloud',
                    icon: 'database',
                    name: '数据源',
                    desc: 'GitHub 云端数据（每 2 小时自动更新）；统一门户 · 校内通知开关在页面内',
                    badge: mods.cloud ? { cls: 'ok', text: '已连接云端' } : { cls: 'err', text: '已禁用! 插件无数据' },
                    need: mods.cloud,
                    page: 'cloud',
                },
                {
                    key: null,
                    icon: 'key',
                    name: '令牌管理',
                    desc: 'GitHub / 调度桥等令牌：过期日期、剩余天数、一键跳转 GitHub 管理页',
                    badge: tokBadge,
                    need: true,
                    page: 'tokens',
                    alt: true,
                },
                {
                    key: null,
                    icon: 'lock',
                    name: '统一门户 · 账号',
                    desc: '由于安全考量，该功能在开源工具中不可用',
                    badge: { cls: 'warn', text: '不可用' },
                    need: true,
                    page: 'security',
                    alt: true,
                },
            ],
        },
        {
            title: '通知与关注',
            cards: [
                {
                    key: 'deadline',
                    icon: 'clock',
                    name: '待办提醒 · 关注',
                    desc: '首页待办卡（截止提醒）、关注规则（关键词订阅）与系统通知',
                    badge: mods.deadline ? { cls: 'ok', text: '已启用' } : { cls: 'off', text: '已禁用' },
                    need: mods.deadline,
                    page: 'follow',
                },
                {
                    key: null,
                    icon: 'mail',
                    name: '每日邮件报告',
                    desc: '每天 8:00 自动推送今日摘要到邮箱（错过自动补发）；授权码仅存本机',
                    badge: mailCfg.enabled ? { cls: 'ok', text: '已启用' } : mailCfg.sender ? { cls: 'warn', text: '未启用' } : { cls: 'off', text: '未配置' },
                    need: true,
                    page: 'mail',
                },
            ],
        },
        {
            title: '面板行为',
            cards: [
                {
                    key: 'context',
                    icon: 'chat',
                    name: '面板偏好 · 引用协同',
                    desc: '自动附加阅读上下文、引用到对话（上下文条/工具卡片）；面板固定',
                    badge: mods.context ? { cls: 'ok', text: '引用协同开' } : { cls: 'off', text: '已禁用' },
                    need: mods.context,
                    page: 'prefs',
                },
            ],
        },
    ];
    // ---------- 渲染 ----------
    if (page === 'home') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [alerts.map((a, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `dsh-cau_alert ${a.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_alertDot" }), (0, jsx_runtime_1.jsx)("span", { children: a.text })] }, i))), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6309\u7EC4\u7BA1\u7406\u529F\u80FD\u4E0E\u51ED\u636E\uFF1A\u529F\u80FD\u5361\u53EF\u76F4\u63A5\u5F00\u5173\uFF0C\u51ED\u636E\u5361\uFF08\u6DE1\u5E95\uFF09\u8FDB\u5165\u7EF4\u62A4\uFF1B\u5173\u952E\u9879\u7F3A\u5931\u4F1A\u5728\u6B64\u63D0\u9192\u3002" }), cardGroups.map((g) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setGroup", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setGroupTitle", children: g.title }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_cards", children: g.cards.map((c) => ((0, jsx_runtime_1.jsxs)("div", { className: 'dsh-cau_setCard' + (c.alt ? ' dsh-cau_setCardAlt' : ''), role: "button", tabIndex: 0, onClick: () => setPage(c.page), onKeyDown: (e) => e.key === 'Enter' && setPage(c.page), children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_cardMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_cardName", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardIcon", children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: c.icon }) }), c.name, (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_cardBadge ${c.badge.cls}`, children: c.badge.text })] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardDesc", children: c.desc })] }), c.key ? (0, jsx_runtime_1.jsx)(Toggle, { on: mods[c.key], onToggle: () => toggleMod(c.key), label: `切换 ${c.name}` }) : c.page === 'mail' ? (0, jsx_runtime_1.jsx)(Toggle, { on: mailCfg.enabled, onToggle: () => void doMailToggle(), label: "\u5207\u6362 \u6BCF\u65E5\u90AE\u4EF6\u62A5\u544A" }) : null] }, c.name))) })] }, g.title)))] }));
    }
    const pageAlerts = alerts.filter((a) => a.page === page);
    const otherCount = alerts.length - pageAlerts.length;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setPageHead", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setSubBack", onClick: () => setPage('home'), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u8FD4\u56DE"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: page === 'ai' ? 'AI 加工 · 模型配置' : page === 'tokens' ? '令牌管理' : page === 'prefs' ? '面板偏好 · 引用协同' : page === 'follow' ? '待办提醒 · 关注' : page === 'cloud' ? '数据源' : page === 'mail' ? '每日邮件报告' : '统一门户 · 账号' }), otherCount > 0 && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setOther", title: "\u8FD4\u56DE\u8BBE\u7F6E\u9996\u9875\u67E5\u770B\u5168\u90E8\u63D0\u9192", onClick: () => setPage('home'), children: ["\u26A0 \u53E6\u6709 ", otherCount, " \u9879\u95EE\u9898"] }))] }), pageAlerts.map((a, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `dsh-cau_alert ${a.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_alertDot" }), (0, jsx_runtime_1.jsx)("span", { children: a.text })] }, i))), page === 'ai' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u9009\u62E9" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u72EC\u7ACB\u914D\u7F6E\u69FD\uFF1A\u7528\u4E8E\u9762\u677F\u6309\u9700\u52A0\u5DE5\uFF08AI \u6458\u8981/\u5206\u7C7B/\u91CD\u8981\u5EA6/deadline\uFF09\u4E0E\u540E\u7EED\u76D1\u63A7\uFF0C\u4E0E\u4E3B\u5BF9\u8BDD\u6A21\u578B\u4E92\u4E0D\u5F71\u54CD\u3002\u6362\u6A21\u578B\u53EA\u5F71\u54CD\u4E4B\u540E\u7684\u52A0\u5DE5\uFF0C\u6570\u636E\u65E0\u9700\u91CD\u722C\u3002" }), !sessionId || !modelDirectories ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: !modelDirectories ? '模型目录服务不可用（按需加工将使用服务端默认模型）。' : '当前没有打开的会话——打开一个会话后即可从 DSH 模型目录中选择。' })) : modelState === 'loading' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u52A0\u8F7D\u4E2D\u2026" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'fail' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: modelNote }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u91CD\u8BD5" })] })) : modelState === 'ok' && groups.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u4E3A\u7A7A\uFF08\u68C0\u67E5 provider \u914D\u7F6E\u540E\u91CD\u8BD5\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'ok' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selGroup?.id || '', onChange: (e) => { const g = groups.find((x) => x.id === e.target.value); if (g?.models?.length)
                                                    pickModel(g.id, g.models[0].id); }, children: groups.map((g) => ((0, jsx_runtime_1.jsx)("option", { value: g.id, children: g.name }, g.id))) }), selGroup?.models?.length ? ((0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selModel?.id || selGroup.models[0].id, onChange: (e) => pickModel(selGroup.id, e.target.value), children: selGroup.models.map((m) => ((0, jsx_runtime_1.jsx)("option", { value: m.id, children: m.name || m.id }, m.id))) })) : null] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u5F53\u524D\uFF1A", monitor ? `${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: monitor ? `当前：${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u52A0\u8F7D\u6A21\u578B\u76EE\u5F55" })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u7528\u91CF \u00B7 \u67F1\u72B6\u56FE" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9ED8\u8BA4\u8FD1 30 \u5929\uFF1B\u65F6\u95F4\u8DE8\u5EA6\u4E0E\u6307\u6807\u53EF\u5207\u6362\uFF08\u4E91\u7AEF\u7BA1\u9053 + \u672C\u673A\u6309\u9700\u5408\u8BA1\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: [7, 30, 90].map((d) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_setChip' + (days === d ? ' on' : ''), onClick: () => setDays(d), children: [d, " \u5929"] }, d))) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: ['calls', 'prompt', 'completion', 'cost'].map((m) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_setChip' + (metric === m ? ' on' : ''), onClick: () => setMetric(m), children: METRIC_UNIT[m] }, m))) }), rows === null ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u52A0\u8F7D\u7528\u91CF\u4E2D\u2026" })) : daily.length === 0 || !daily.some((d) => d.value > 0) ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u8FD1 ", days, " \u5929\u6682\u65E0\u7528\u91CF\u8BB0\u5F55\uFF08AI \u52A0\u5DE5\u5C1A\u672A\u89E6\u53D1\u6216\u7528\u65F6\u4E0D\u8DB3\uFF09\u3002"] })) : ((0, jsx_runtime_1.jsx)(BarChart, { items: daily, unit: METRIC_UNIT[metric] })), byRole && Object.keys(byRole).length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("table", { className: "dsh-cau_usageTable", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "\u89D2\u8272" }), (0, jsx_runtime_1.jsx)("th", { children: "\u6B21\u6570" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u5165" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u51FA" }), (0, jsx_runtime_1.jsx)("th", { children: "\u7F13\u5B58\u8BFB" }), (0, jsx_runtime_1.jsx)("th", { children: "\u91D1\u989D(\u5143)" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: Object.entries(byRole).map(([role, v]) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: ROLE_LABEL[role] || role }), (0, jsx_runtime_1.jsx)("td", { children: v.calls }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.prompt) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.completion) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.cached) }), (0, jsx_runtime_1.jsx)("td", { children: v.cost ? v.cost.toFixed(4) : '—' })] }, role))) })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u91D1\u989D\u4EC5\u5BF9 DeepSeek \u9644\u5E26\u7684\u8BA1\u4EF7\u8C03\u7528\u663E\u793A\uFF1B\u300C\u5237\u65B0\u300D\u540E\u66F4\u65B0\u3002" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6309\u9700\u8865\u6458\u8981" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setDesc", children: "\u6587\u7AE0\u9875\u5BF9\u672A\u52A0\u5DE5\u7684\u6587\u7AE0\u63D0\u4F9B\u300CAI \u8865\u6458\u8981\u300D\uFF1A\u8C03\u7528\u63D2\u4EF6\u670D\u52A1\u7AEF\u8DEF\u7531\uFF08DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\uFF09\uFF0C\u6D4F\u89C8\u5668\u4E0D\u5B58\u4EFB\u4F55 API key\uFF1B\u7ED3\u679C\u4EC5\u672C\u6B21\u4F1A\u8BDD\u5185\u663E\u793A\uFF0C\u4E0D\u56DE\u5199\u4E91\u7AEF\u3002" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u89E6\u53D1\u4F4D\u7F6E\uFF1A\u6587\u7AE0\u9605\u8BFB\u9875\u6458\u8981\u533A\uFF08\u65E0 AI \u6458\u8981\u65F6\u51FA\u73B0\u6309\u94AE\uFF09\u3002\u7981\u7528\u672C\u6A21\u5757\u540E\u6309\u94AE\u9690\u85CF\u3002" })] })] })] })), page === 'tokens' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u4EE4\u724C\u767B\u8BB0" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6BCF\u679A\u4EE4\u724C\u53EF\u9009\u542F\u7528/\u7981\u7528\uFF1B\u300C\u503C\u300D\u4EC5\u5B58\u672C\u673A\u6D4F\u89C8\u5668\uFF1B\u8FC7\u671F\u65E5\u671F\u7528\u4E8E\u5230\u671F\u63D0\u9192\uFF1B\u300C\u7BA1\u7406\u300D\u8DF3\u8F6C GitHub \u4EE4\u724C\u7BA1\u7406\u9875\u3002\u505C\u7528\u5168\u90E8\u4EE4\u724C = \u9762\u677F\u65E0\u6570\u636E\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokList", children: [tokens.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6682\u672A\u767B\u8BB0\u4EE4\u724C\u3002\u8BF7\u6DFB\u52A0 GitHub \u6570\u636E\u4EE4\u724C\uFF08\u7EC6\u7C92\u5EA6 PAT\uFF0CContents: Read\uFF0C\u79C1\u6709\u6570\u636E\u4ED3\uFF09\u3002" }), tokens.map((t) => {
                                    const eb = expiryBadge(t.expires);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tok", children: [(0, jsx_runtime_1.jsx)(Toggle, { on: t.enabled, onToggle: () => toggleTok(t.id), label: `${t.name} 启用` }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokName", children: [t.name, !t.enabled && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge off", children: "\u5DF2\u505C\u7528" }), !t.value && t.expires && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge warn", children: "\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokMeta", children: [t.usage && (0, jsx_runtime_1.jsx)("span", { children: t.usage }), t.expires && ((0, jsx_runtime_1.jsxs)("span", { className: eb.cls, children: ["\u8FC7\u671F ", t.expires, " \u00B7 ", eb.text] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokActs", children: [t.adminUrl && ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_tokBtn", href: t.adminUrl, target: "_blank", rel: "noreferrer", children: ["\u7BA1\u7406", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] })), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn", onClick: () => startEdit(t), children: "\u7F16\u8F91" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn danger", onClick: () => removeTok(t.id), children: "\u5220\u9664" })] })] }, t.id));
                                })] }), !tokEditing ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => startEdit(), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "plus" }), "\u6DFB\u52A0\u4EE4\u724C"] }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { fontSize: 12 }, children: tokEditing && tokEditing !== 'new' ? '编辑令牌' : '添加令牌' }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u540D\u79F0\uFF08\u5982 GitHub \u6570\u636E\u4EE4\u724C\uFF09", value: tokDraft.name, onChange: (e) => setTokDraft({ ...tokDraft, name: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7528\u9014\u8BF4\u660E\uFF08\u5982 \u8BFB\u53D6\u4E91\u7AEF\u6570\u636E\uFF09", value: tokDraft.usage, onChange: (e) => setTokDraft({ ...tokDraft, usage: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "password", placeholder: "\u4EE4\u724C\u503C\uFF08\u4EC5\u672C\u673A\uFF1B\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5\u7684\u53EF\u7559\u7A7A\uFF09", value: tokDraft.value, onChange: (e) => setTokDraft({ ...tokDraft, value: e.target.value }), spellCheck: false }) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", style: { maxWidth: 170 }, type: "date", value: tokDraft.expires, onChange: (e) => setTokDraft({ ...tokDraft, expires: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7BA1\u7406\u9875 URL\uFF08\u9ED8\u8BA4 GitHub \u4EE4\u724C\u9875\uFF09", value: tokDraft.adminUrl, onChange: (e) => setTokDraft({ ...tokDraft, adminUrl: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: !tokDraft.name.trim(), onClick: saveTokDraft, children: "\u4FDD\u5B58" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => setTokEditing(null), children: "\u53D6\u6D88" })] })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }) })), page === 'prefs' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9605\u8BFB\u4E0A\u4E0B\u6587\u5F15\u7528" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.autoAttach, onChange: (e) => upd({ ...settings, autoAttach: e.target.checked }) }), "\u6253\u5F00\u6587\u7AE0\u65F6\u81EA\u52A8\u9644\u52A0\u9605\u8BFB\u4E0A\u4E0B\u6587\uFF08\u53D1\u9001\u63D0\u95EE\u65F6\u4F5C\u4E3A\u5F15\u7528\u6750\u6599\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u6587\u7AE0\u9605\u8BFB\u9875\u70B9\u300C", (0, jsx_runtime_1.jsx)("b", { children: "\u5F15\u7528\u5230\u5BF9\u8BDD" }), "\u300D\u2192 \u6587\u7AE0\u4F5C\u4E3A\u4E0A\u4E0B\u6587\u5F15\u7528\u5230\u804A\u5929\u8F93\u5165\u6846\u4E0A\u65B9\uFF08chip\uFF09\uFF0C\u8349\u7A3F\u6CE8\u5165\u6807\u8BB0\u884C\uFF1B\u53D1\u9001\u540E\u81EA\u52A8\u89E3\u9664\u3002\u5173\u95ED\u672C\u6A21\u5757\uFF08\u5361\u7247\u5F00\u5173\uFF09\u540E\u5F15\u7528\u6309\u94AE\u4E0E\u4E0A\u4E0B\u6587\u6761\u9690\u85CF\u3002"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9762\u677F\u56FA\u5B9A" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.panelPinned, onChange: (e) => upd({ ...settings, panelPinned: e.target.checked }) }), "\u56FA\u5B9A\u9762\u677F\uFF08\u70B9\u51FB\u5916\u90E8/Esc \u4E0D\u5173\u95ED\uFF0C\u4EC5 \u2715 \u5173\u95ED\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u4E0E\u9762\u677F\u5934\u90E8\u56FE\u9489\u662F\u540C\u4E00\u72B6\u6001\uFF1B\u5DF2\u6253\u5F00\u7684\u9762\u677F\u5728\u4E0B\u6B21\u6253\u5F00\u65F6\u751F\u6548\u3002" })] })] })), page === 'follow' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", style: { gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "clock" }), "\u5F85\u529E\u63D0\u9192 \u00B7 \u5173\u6CE8"] }), (0, jsx_runtime_1.jsx)(Toggle, { on: mods.deadline, onToggle: () => toggleMod('deadline'), label: "\u5207\u6362 \u5F85\u529E\u63D0\u9192 \u00B7 \u5173\u6CE8" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9996\u9875\u300C\u5F85\u529E\u5361\u300D\u5C55\u793A\u672A\u8FC7\u671F\u622A\u6B62\u4E8B\u9879\uFF08\u22647 \u5929\uFF09\uFF0C\u652F\u6301\u7559\u5B58/\u5F52\u6863\uFF1B\u5173\u6CE8\u65E0\u4E0A\u9650\uFF0C\u6587\u7AE0\u9875\u70B9\u661F\u6807\u52A0\u5165\u3002\u5173\u95ED\u672C\u6A21\u5757\u540E\u5F85\u529E\u5361\u4E0E\u5173\u6CE8\u5165\u53E3\u9690\u85CF\u3002" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "target" }), "\u5173\u6CE8\u89C4\u5219\uFF08\u5173\u952E\u8BCD/\u6765\u6E90\u8BA2\u9605\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u547D\u4E2D\u7684\u901A\u77E5\u5728\u9996\u9875\u300C\u4ECA\u65E5\u8981\u89C8\u300D\u6807\u51FA\u3001\u53EF\u89E6\u53D1\u7CFB\u7EDF\u901A\u77E5\uFF08\u4E0B\u65B9\u5F00\u5173\uFF09\u3002\u89C4\u5219\u4FDD\u5B58\u4E8E\u672C\u673A\u6D4F\u89C8\u5668\uFF1B\u5173\u952E\u793A\u4F8B\uFF1A\u63A8\u514D\u3001\u9009\u8BFE\u3001\u5956\u5B66\u91D1\u3001\u6210\u7EE9\u3001\u571F\u5730\u5B66\u9662\u3001\u6559\u52A1\u5904\u2026" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokList", children: [rules.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6682\u65E0\u89C4\u5219\u3002\u6DFB\u52A0\u5173\u952E\u8BCD\u540E\u4F1A\u6807\u51FA\u6240\u6709\u6765\u6E90\u547D\u4E2D\u7684\u6761\u76EE\uFF08\u591A\u89C4\u5219\u53D6\u5E76\u96C6\uFF09\u3002" }), rules.map((r) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tok", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokName", children: [r.keyword, !r.enabled && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge off", children: "\u5DF2\u505C\u7528" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokMeta", children: [r.source ? `来源含「${r.source}」` : '全部来源', r.minImportance ? ` · 重要度≥${r.minImportance === '高' ? '高' : '高/中'}` : ' · 不限重要度'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokActs", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn", onClick: () => persistRules(rules.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x))), children: r.enabled ? '停用' : '启用' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn danger", onClick: () => persistRules(rules.filter((x) => x.id !== r.id)), children: "\u5220\u9664" })] })] }, r.id)))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u5173\u952E\u8BCD\uFF08\u5FC5\u586B\uFF0C\u5982 \u63A8\u514D / \u9009\u8BFE / \u5956\u5B66\u91D1\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u5982\uFF1A\u63A8\u514D / \u9009\u8BFE / \u5956\u5B66\u91D1 / \u571F\u5730\u5B66\u9662", value: ruleDraft.keyword, onChange: (e) => setRuleDraft({ ...ruleDraft, keyword: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u6765\u6E90\u5305\u542B\uFF08\u53EF\u7A7A\uFF0C\u5982 \u6559\u52A1\u5904 / \u56E2\u59D4 / \u571F\u5730\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u53EF\u7A7A\uFF08\u5982 \u6559\u52A1\u5904 / \u56E2\u59D4 / \u571F\u5730\uFF09", value: ruleDraft.source, onChange: (e) => setRuleDraft({ ...ruleDraft, source: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u91CD\u8981\u5EA6\u4E0B\u9650\uFF08\u4E0D\u9650 / \u9AD8\u6216\u4E2D / \u53EA\u8981\u9AD8\uFF09" }), (0, jsx_runtime_1.jsxs)("select", { className: "dsh-cau_setSelect", value: ruleDraft.minImportance, onChange: (e) => setRuleDraft({ ...ruleDraft, minImportance: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "\u4E0D\u9650\u91CD\u8981\u5EA6" }), (0, jsx_runtime_1.jsx)("option", { value: "\u4E2D", children: "\u9AD8\u6216\u4E2D" }), (0, jsx_runtime_1.jsx)("option", { value: "\u9AD8", children: "\u53EA\u8981\u9AD8" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: !ruleDraft.keyword.trim(), onClick: addRule, children: "\u6DFB\u52A0\u89C4\u5219" }), rules.length > 0 && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn danger", onClick: () => persistRules([]), children: "\u6E05\u7A7A\u5168\u90E8" }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "bell" }), "\u7CFB\u7EDF\u901A\u77E5\uFF08\u53EF\u9009\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9875\u9762\u5F00\u7740\uFF08\u4E0D\u9650\u662F\u5426\u6253\u5F00\u9762\u677F\uFF09\u65F6\u6BCF 10 \u5206\u949F\u68C0\u67E5\uFF1A\u547D\u4E2D\u5173\u6CE8\u89C4\u5219\u6216\u65B0\u589E\u9AD8\u91CD\u8981\u901A\u77E5\u5373\u5F39\u7CFB\u7EDF\u901A\u77E5\u3002\u9996\u6B21\u9700\u70B9\u300C\u8BF7\u6C42\u901A\u77E5\u6388\u6743\u300D\u3002" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.notifyOn, onChange: (e) => upd({ ...settings, notifyOn: e.target.checked }) }), "\u542F\u7528\u7CFB\u7EDF\u901A\u77E5"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => {
                                            if (typeof Notification === 'undefined')
                                                return;
                                            Notification.requestPermission().then((p) => setNotifyStatus(p));
                                        }, children: "\u8BF7\u6C42\u901A\u77E5\u6388\u6743" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: notifyStatus === 'granted' ? '已授权 ✓' : notifyStatus === 'denied' ? '已被拒绝（需在浏览器站点设置中允许通知）' : notifyStatus === 'unsupported' ? '当前环境不支持通知' : '未授权' })] })] })] })), page === 'cloud' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", style: { gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "database" }), "\u6570\u636E\u6E90 \u00B7 GitHub \u4E91\u7AEF"] }), (0, jsx_runtime_1.jsx)(Toggle, { on: mods.cloud, onToggle: () => toggleMod('cloud'), label: "\u5207\u6362 \u6570\u636E\u6E90" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setDesc", children: ["\u6570\u636E\u5B58\u4E8E GitHub \u4ED3\u5E93\u7684 `data/`\uFF08\u6BCF 2 \u5C0F\u65F6\u6293\u53D6+AI \u52A0\u5DE5\u5E76\u63D0\u4EA4\uFF09\uFF1B\u9762\u677F\u4E0E MCP \u76F4\u63A5\u8BFB\u4E91\u7AEF\u3002\u9ED8\u8BA4\u6307\u5411 `ZBber-lab/cau-portal`\uFF1B\u81EA\u5EFA\u6570\u636E\u8005\u6539\u4E3A\u81EA\u5DF1\u7684\u4ED3\u5E93\u3002\u5173\u95ED\u672C\u5F00\u5173\u5C06\u5B8C\u5168\u505C\u6B62\u6570\u636E\u8BFB\u53D6\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002", (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauDataRepo", children: "\u6570\u636E\u4ED3\u5E93\uFF08owner/repo\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauDataRepo", className: "dsh-cau_setInput", value: settings.dataRepo || '', onChange: (e) => upd({ ...settings, dataRepo: e.target.value }), placeholder: "\u5982 ZBber-lab/cau-portal\uFF08\u7559\u7A7A=\u9ED8\u8BA4\uFF09", spellCheck: false, autoComplete: "off" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6307\u5411\u542B `data/` \u4E0E\u722C\u866B\u4EA7\u7269\u7684\u4ED3\u5E93\uFF1B\u8BFB\u53D6/\u5199\u5165\u7528\u300C\u4EE4\u724C\u7BA1\u7406\u300D\u9875\u914D\u7F6E\u7684\u4EE4\u724C\u3002\u652F\u6301\u586B\u5B8C\u6574 GitHub \u94FE\u63A5\u3002" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: cloudState === 'loading', onClick: () => void checkCloud(), children: cloudState === 'loading' ? '检查中…' : '连通性检查' }), cloudState === 'ok' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: cloudMsg }), cloudState === 'fail' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: cloudMsg })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.slice(0, 3).map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] }, l.key))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", style: { gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "bank" }), "\u7EDF\u4E00\u95E8\u6237 \u00B7 \u6821\u5185\u901A\u77E5"] }), (0, jsx_runtime_1.jsx)(Toggle, { on: mods.portal, onToggle: () => toggleMod('portal'), label: "\u5207\u6362 \u7EDF\u4E00\u95E8\u6237" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u95E8\u6237\u6570\u636E\u6765\u81EA\u7EDF\u4E00\u95E8\u6237\uFF08one.cau.edu.cn\uFF09\uFF0C\u9700\u767B\u5F55\u6821\u56ED\u7F51/SSO \u770B\u539F\u6587\uFF08\u8D26\u53F7\u5165\u53E3\u89C1\u9996\u9875\u300C\u7EDF\u4E00\u95E8\u6237 \u00B7 \u8D26\u53F7\u300D\uFF09\u3002\u5173\u95ED\u6B64\u5F00\u5173\u540E\uFF0C\u9762\u677F\u9690\u85CF\u95E8\u6237\u901A\u77E5\uFF08\u8981\u95FB / \u680F\u76EE / \u5F85\u529E / \u672A\u8BFB\u8BA1\u6570\uFF09\uFF1B\u5BF9\u8BDD\u67E5\u8BE2\u4E0D\u53D7\u5F71\u54CD\u3002\u9ED8\u8BA4\u5F00\u542F\u3002" })] })] })), page === 'mail' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "mail" }), "\u6BCF\u65E5\u62A5\u544A\u90AE\u4EF6"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setDesc", children: ["\u6BCF\u5929 ", (0, jsx_runtime_1.jsx)("b", { children: mailCfg.sendTime }), " \u81EA\u52A8\u628A\u300C\u4ECA\u65E5\u9AD8\u91CD\u8981\u901A\u77E5 + 3 \u5929\u5185\u622A\u6B62 + \u547D\u4E2D\u5173\u6CE8\u89C4\u5219 + \u6628\u65E5\u56DE\u987E\u300D\u63A8\u9001\u5230\u4F60\u7684\u90AE\u7BB1\uFF1B\u82E5\u53D1\u9001\u65F6\u95F4\u5DF2\u8FC7\u624D\u5F00\u673A\uFF0C\u4F1A\u81EA\u52A8", (0, jsx_runtime_1.jsx)("b", { children: "\u8865\u53D1" }), "\u3002\u53D1\u4EF6\u4E0E\u6536\u4EF6\u53EF\u586B\u540C\u4E00\u4E2A\u90AE\u7BB1\uFF08\u81EA\u5DF1\u53D1\u7ED9\u81EA\u5DF1\uFF09\u3002\u6388\u6743\u7801\u53EA\u5B58\u672C\u673A\uFF08\u4ED3\u5E93\u5916\uFF09\uFF0C\u4E0D\u4F1A\u4E0A\u4F20\u6216\u663E\u793A\u5728\u65E5\u5FD7\u91CC\u3002"] }), (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailSender", children: "\u53D1\u4EF6\u90AE\u7BB1\uFF08\u5982 QQ \u53F7@qq.com\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailSender", className: "dsh-cau_setInput", value: mailCfg.sender, onChange: (e) => setMailCfg({ ...mailCfg, sender: e.target.value }), placeholder: "\u5982 [REDACTED-EMAIL]\uFF08QQ/163/Outlook/\u519C\u5927\u90AE\u7BB1\u5747\u53EF\uFF09", autoComplete: "off", spellCheck: false }), mailCfg.provider && (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u5DF2\u8BC6\u522B\u670D\u52A1\u5546\uFF1A", mailCfg.provider, "\uFF08SMTP \u81EA\u52A8\u914D\u7F6E\uFF0C\u65E0\u9700\u624B\u586B\uFF09"] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailCode", children: ["\u90AE\u7BB1\u6388\u6743\u7801 ", mailCfg.hasCode ? '（已保存；留空则不修改）' : ''] }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailCode", className: "dsh-cau_setInput", type: "password", value: mailCfg.authCode, onChange: (e) => setMailCfg({ ...mailCfg, authCode: e.target.value }), placeholder: mailCfg.hasCode ? '已保存授权码，留空保持不变' : 'QQ 邮箱：设置→账户→开启 SMTP→生成授权码', autoComplete: "new-password" }), (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailTo", children: "\u6536\u4EF6\u90AE\u7BB1\uFF08\u7559\u7A7A = \u53D1\u4EF6\u90AE\u7BB1\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailTo", className: "dsh-cau_setInput", value: mailCfg.recipient, onChange: (e) => setMailCfg({ ...mailCfg, recipient: e.target.value }), placeholder: "\u7559\u7A7A\u5219\u53D1\u7ED9\u81EA\u5DF1\uFF08\u4E0E\u53D1\u4EF6\u90AE\u7BB1\u76F8\u540C\uFF09", autoComplete: "off", spellCheck: false }), (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailTime", children: "\u53D1\u9001\u65F6\u95F4\uFF08\u672C\u673A\u65F6\u95F4\uFF0C\u9ED8\u8BA4 08:00\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailTime", className: "dsh-cau_setInput", type: "time", value: mailCfg.sendTime, onChange: (e) => setMailCfg({ ...mailCfg, sendTime: e.target.value || '08:00' }) }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: mailCfg.enabled, onChange: (e) => setMailCfg({ ...mailCfg, enabled: e.target.checked }) }), "\u542F\u7528\u6BCF\u65E5\u90AE\u4EF6\u62A5\u544A\uFF08\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\uFF1A\u6B21\u65E5 ", mailCfg.sendTime || '08:00', " \u8D77\u81EA\u52A8\u53D1\u9001\uFF09"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: mailState === 'loading', onClick: () => void doMailSave(), children: mailState === 'loading' ? '保存中…' : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "check" }), "\u4FDD\u5B58\u914D\u7F6E"] })) }), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setBtn", disabled: mailState === 'loading', onClick: () => void doMailTest(), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "mail" }), "\u6D4B\u8BD5\u53D1\u9001"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void refreshMailInfo(), children: "\u5237\u65B0\u72B6\u6001" })] }), mailState === 'loading' && mailMsg && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setWarn", children: mailMsg }), mailState === 'ok' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: mailMsg }), mailState === 'fail' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: mailMsg }), mailState === 'idle' && mailMsg && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: mailMsg }), mailLast && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: mailLast }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u5173\u6CE8\u89C4\u5219\u5DF2\u540C\u6B65 ", mailCfg.rulesCount, " \u6761\u7ED9\u62A5\u544A\uFF1B\u6539\u89C4\u5219\u540E\u81EA\u52A8\u66F4\u65B0\u3002\u627E\u4E0D\u5230\u90AE\u7BB1\u6388\u6743\u7801\uFF1F\u6700\u5E38\u7528\u8DEF\u5F84\u2014\u2014", (0, jsx_runtime_1.jsx)("b", { children: "QQ \u90AE\u7BB1" }), "\uFF1A\u7F51\u9875\u7248 \u2192 \u8BBE\u7F6E \u2192 \u8D26\u6237 \u2192 \u5F00\u542F\u300CSMTP \u670D\u52A1\u300D\u2192 \u6309\u63D0\u793A\u53D1\u77ED\u4FE1\u540E\u751F\u6210 16 \u4F4D\u6388\u6743\u7801\uFF08\u4E0D\u662F QQ \u5BC6\u7801\uFF09\u3002", (0, jsx_runtime_1.jsx)("b", { children: "163" }), "\uFF1A\u8BBE\u7F6E \u2192 POP3/SMTP/IMAP \u2192 \u5F00\u542F SMTP \u2192 \u5BA2\u6237\u7AEF\u6388\u6743\u5BC6\u7801\u3002"] }) })] }) })), page === 'security' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u7EDF\u4E00\u95E8\u6237 \u00B7 \u8D26\u53F7" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", style: { alignItems: 'center' }, children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u7531\u4E8E\u5B89\u5168\u8003\u91CF\uFF0C\u7EDF\u4E00\u95E8\u6237\u767B\u5F55\u529F\u80FD\u5728\u5F00\u6E90\u7248\u672C\u4E2D", (0, jsx_runtime_1.jsx)("b", { children: "\u4E0D\u53EF\u7528" }), "\u3002\u8BE5\u529F\u80FD\u6D89\u53CA\u8BBF\u95EE\u6821\u5185\u7CFB\u7EDF\u4E0E\u51ED\u636E\u5904\u7406\uFF0C\u4E3A\u907F\u514D\u8FDD\u53CD\u6821\u56ED\u4FE1\u606F\u7CFB\u7EDF\u4F7F\u7528\u89C4\u5B9A\uFF0C\u672A\u5305\u542B\u5728\u5F00\u6E90\u5DE5\u5177\u4E2D\u3002"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u5BC6\u94A5\u4E0E\u91CD\u8981\u94FE\u63A5" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5E38\u7528\u9875\u9762\u4E00\u952E\u76F4\u8FBE\uFF1B\u4EE4\u724C\u8BE6\u60C5\u4E0E\u8FC7\u671F\u65E5\u5728\u300C\u4EE4\u724C\u7BA1\u7406\u300D\u9875\u7EF4\u62A4\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] }, l.key))) })] })] }))] }));
}

return module.exports; })();
var empty_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = Empty;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批①：统一空态（图标 + 主文案 + 可选引导行）。零逻辑纯展示组件。
 * UI 批②：icon 改为任意节点（线性 SVG 图标，<Ic n="…"/>），不再传 emoji 字符串。
 * 列表级「暂无内容」类提示统一走这里；卡片内嵌的短提示仍用 .dsh-cau_empty 文本。
 */
function Empty(props) {
    const { icon, main, sub } = props;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_empty", children: [icon ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyIcon", children: icon }) : null, (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptyMain", children: main }), sub ? (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_emptySub", children: sub }) : null] }));
}

return module.exports; })();
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
/** 设置页错误边界：出错了显示错误文字（便于定位），不再静默白屏 */
class CauSettingsBoundary extends react_1.Component {
    state = { err: null };
    static getDerivedStateFromError(err) {
        return { err };
    }
    componentDidCatch(err) {
        console.error('[cau-portal settings]', err);
    }
    render() {
        if (this.state.err) {
            return (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setErr", children: ["\u8BBE\u7F6E\u9875\u52A0\u8F7D\u51FA\u9519\uFF1A", String(this.state.err?.message || this.state.err)] });
        }
        return this.props.children;
    }
}
let bundleCache = null;
const CACHE_MS = 60000;
async function tryJson(rel, token) {
    try {
        return { ok: true, data: JSON.parse(await (0, data_1.readCloudText)(rel, token)) };
    }
    catch (e) {
        const msg = String(e?.message ?? e);
        return { ok: false, reason: (/404/.test(msg) ? 'missing' : 'error'), message: msg };
    }
}
async function loadBundle(token) {
    if (bundleCache && Date.now() - bundleCache.ts < CACHE_MS)
        return bundleCache;
    const [idx, sum] = await Promise.all([tryJson('data/index.json', token), tryJson('data/summary.json', token)]);
    const bundle = { ts: Date.now(), index: idx.ok ? idx.data : null, summary: sum.ok ? sum.data : null };
    bundleCache = bundle;
    return bundle;
}
/** 未读候选：summary.important 中（门户模块开关关闭时排除门户条目；已归档的不计未读） */
function unreadCandidates(summary) {
    const list = (summary?.important || []);
    const ops = (0, data_1.loadDeadlineOps)();
    const active = list.filter((it) => ops[it.article_id || it.url] !== 'archive');
    if ((0, data_1.loadModules)().portal)
        return active;
    return active.filter((it) => !/tp_up/.test(String(it.url || '')));
}
/** 页面加载时初始化按钮未读计数（不弹窗；无令牌/无 summary 时返回 0） */
async function fetchUnreadCount() {
    const token = (0, data_1.activeTokenValues)()[0];
    if (!token)
        return 0;
    const b = await loadBundle(token);
    if (!b.summary)
        return 0;
    const readSet = (0, data_1.loadReadSet)();
    return unreadCandidates(b.summary).filter((it) => !readSet.includes(it.article_id || it.url)).length;
}
function shortTime(iso) {
    if (!iso)
        return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
/**
 * 测量「上方栏」（会话头部：标题行 + 对话/轨迹标签）高度，让面板从它下方开始。
 * 优先实测会话头部组件（.wSkVaW_header，DSH 随版本可能换 hash，故保留结构兜底）；
 * 失败退回 56px（会话头部常见高度）+ 默认 12px。
 */
function measureTopInset() {
    try {
        const header = document.querySelector('.wSkVaW_header');
        if (header) {
            const r = header.getBoundingClientRect();
            if (r.height > 0 && r.height < 400)
                return Math.ceil(r.top + r.height) + 8;
        }
        const frame = document.querySelector('.pI_x6G_frame');
        if (frame) {
            const r = frame.getBoundingClientRect();
            if (r.top > 0)
                return Math.ceil(r.top) + 8;
        }
        const col = document.querySelector('.pI_x6G_centerCol');
        if (col) {
            const first = col.firstElementChild;
            if (first) {
                const fr = first.getBoundingClientRect();
                const colH = col.getBoundingClientRect().height || window.innerHeight;
                if (fr.height > 0 && fr.height < colH * 0.5)
                    return Math.ceil(fr.height) + 8;
            }
        }
    }
    catch {
        /* noop */
    }
    return 56;
}
/** 头部 28px 幽灵图标钮（UI 批②：替代原文字小页签与 ✕） */
function IconBtn(props) {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_iconBtn", "data-on": props.on ? 'true' : undefined, "aria-label": props.label, "aria-pressed": typeof props.on === 'boolean' ? props.on : undefined, title: props.title || props.label, onClick: props.onClick, children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: props.n }) }));
}
// ---- 归档视图（已归档待办）----
function ArchiveView(props) {
    const [rows, setRows] = (0, react_1.useState)([]);
    const refresh = () => {
        void (async () => {
            const token = (0, data_1.activeTokenValues)()[0];
            if (!token)
                return;
            const b = await loadBundle(token);
            const ops = (0, data_1.loadDeadlineOps)();
            const list = (b.summary?.deadlines || []).filter((d) => ops[d.article_id || d.url] === 'archive');
            setRows(list);
        })();
    };
    (0, react_1.useEffect)(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_backBtn", onClick: props.onBack, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u8FD4\u56DE"] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_breadPath", children: "\u5DF2\u5F52\u6863\u5F85\u529E" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_dlHint", children: "\u5F52\u6863\u7684\u622A\u6B62\u4E8B\u9879\u4FDD\u7559\u5728\u8FD9\u91CC\uFF1B\u70B9\u300C\u53D6\u6D88\u5F52\u6863\u300D\u53EF\u56DE\u5230\u300C\u5168\u90E8\u5F85\u529E\u300D\u3002" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [rows.length === 0 && (0, jsx_runtime_1.jsx)(empty_1.Empty, { icon: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "inbox" }), main: "\u6682\u65E0\u5F52\u6863\u5F85\u529E", sub: "\u5728\u5F85\u529E\u6216\u6587\u7AE0\u9875\u70B9\u300C\u5F52\u6863\u300D\u7684\u4E8B\u9879\u4F1A\u4FDD\u7559\u5728\u8FD9\u91CC" }), rows.map((d) => {
                        const id = d.article_id || d.url;
                        return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_dlRow", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_dlTitleWrap", onClick: () => props.onOpenArticle(id), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlItem", children: d.item }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlTitle", children: d.title })] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_dlCol", children: d.date }), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_textBtn", onClick: () => {
                                        (0, data_1.setDeadlineOp)(id, null);
                                        refresh();
                                    }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "undo" }), "\u53D6\u6D88\u5F52\u6863"] })] }, id));
                    })] })] }));
}
// ---- 关注视图（无上限）----
function FollowView(props) {
    const list = (0, data_1.loadFollow)();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_bread", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_backBtn", onClick: props.onBack, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u8FD4\u56DE"] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_breadPath", children: ["\u5173\u6CE8\uFF08", list.length, "\uFF09"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_card", children: [list.length === 0 && (0, jsx_runtime_1.jsx)(empty_1.Empty, { icon: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "bookmark" }), main: "\u8FD8\u6CA1\u6709\u5173\u6CE8\u5185\u5BB9", sub: "\u5728\u6587\u7AE0\u9875\u70B9\u300C\u52A0\u5165\u5173\u6CE8\u300D\u5373\u53EF\u6536\u85CF" }), list.map((it) => ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_row", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_rowMain", onClick: () => props.onOpenArticle(it.id), children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowTitle", children: it.title }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_rowMeta", children: [it.column, it.source].filter(Boolean).join(' · ') })] }) }, it.id)))] })] }));
}
function CauPanel(props) {
    const { outsideIgnore, onClose, onUnreadChange } = props;
    const rootRef = (0, react_1.useRef)(null);
    const [stack, setStack] = (0, react_1.useState)([{ name: 'home' }]);
    const [metaTime, setMetaTime] = (0, react_1.useState)('');
    const [unread, setUnread] = (0, react_1.useState)(0);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [pinned, setPinned] = (0, react_1.useState)(() => !!(0, data_1.loadSettings)().panelPinned);
    const [topInset, setTopInset] = (0, react_1.useState)(() => measureTopInset());
    const [refreshKey, setRefreshKey] = (0, react_1.useState)(0);
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    const view = stack[stack.length - 1];
    const togglePinned = () => setPinned((p) => {
        const next = !p;
        (0, data_1.saveSettings)({ ...(0, data_1.loadSettings)(), panelPinned: next });
        return next;
    });
    // 底部状态栏数据：云端更新时间 + 未读数（挂载时与手动刷新都会走这里）
    const loadHead = async () => {
        const token = (0, data_1.activeTokenValues)()[0];
        if (!token) {
            setMetaTime('');
            setUnread(0);
            return;
        }
        const b = await loadBundle(token);
        setMetaTime(b.summary?.last_updated || b.index?.last_updated ? shortTime(b.summary?.last_updated || b.index?.last_updated) : '');
        const readSet = (0, data_1.loadReadSet)();
        setUnread(unreadCandidates(b.summary).filter((it) => !readSet.includes(it.article_id || it.url)).length);
    };
    (0, react_1.useEffect)(() => {
        void loadHead();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /** ⟳ 强制刷新：清 60s 缓存 → 重拉状态栏 → 重挂载当前视图（各视图自行重取数据） */
    const refresh = async () => {
        if (refreshing)
            return;
        setRefreshing(true);
        bundleCache = null;
        try {
            await loadHead();
        }
        catch {
            /* 静默：状态栏保持旧值 */
        }
        setRefreshKey((k) => k + 1);
        setRefreshing(false);
    };
    (0, react_1.useEffect)(() => {
        onUnreadChange?.(unread);
    }, [unread, onUnreadChange]);
    // 阶段6：聊天区 toolview 卡片「在面板中打开」→ 跳转到文章
    (0, react_1.useEffect)(() => {
        return (0, bus_1.subscribeBus)(() => {
            try {
                const req = (0, bus_1.getOpenRequest)();
                if (req && req.id) {
                    if (!(view?.name === 'article' && view.id === req.id))
                        openArticle(req.id);
                    (0, bus_1.clearOpenRequest)();
                }
            }
            catch (e) {
                console.error('[cau-portal] open', e);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view?.name, view?.id]);
    // 阶段6：面板挂载时，若有尚未消费的「在面板中打开」请求，先跳到对应文章
    //（面板关闭时点击卡片 → 展开抽屉发生在发信号之后，订阅回调收不到已过信号，故此处补一次）
    (0, react_1.useEffect)(() => {
        try {
            const req = (0, bus_1.getOpenRequest)();
            if (req && req.id) {
                openArticle(req.id);
                (0, bus_1.clearOpenRequest)();
            }
        }
        catch (e) {
            console.error('[cau-portal] open-on-mount', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // 点击外部（面板与按钮之外）/ Esc 关闭
    (0, react_1.useEffect)(() => {
        const onDoc = (e) => {
            if (pinned)
                return;
            const t = e.target;
            if (rootRef.current?.contains(t))
                return;
            if (outsideIgnore?.contains(t))
                return;
            onClose();
        };
        const onKey = (e) => {
            if (pinned)
                return;
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, [outsideIgnore, onClose, pinned]);
    const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    /** 打开即已读：按已加载的 summary 重算未读数（SPEC 口径：打开即读、计数即时减一） */
    const recountUnread = () => {
        const b = bundleCache;
        if (!b?.summary)
            return;
        const readSet = (0, data_1.loadReadSet)();
        const n = unreadCandidates(b.summary).filter((it) => !readSet.includes(it.article_id || it.url)).length;
        setUnread(n);
    };
    const openArticle = (id, siteName, columnName, siblings, index) => {
        (0, data_1.markRead)(id);
        recountUnread();
        setStack((s) => [...s, { name: 'article', id, back: s[s.length - 1], siteName, columnName, siblings, index }]);
    };
    const replaceArticle = (id, siblings, index) => {
        (0, data_1.markRead)(id);
        recountUnread();
        setStack((s) => {
            const top = s[s.length - 1];
            if (top.name === 'article')
                return [...s.slice(0, -1), { ...top, id, siblings, index }];
            return [...s, { name: 'article', id, back: top, siblings, index }];
        });
    };
    const openColumn = (site, column) => setStack((s) => [...s, column ? { name: 'column', site, column } : { name: 'site', site }]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: rootRef, className: "dsh-cau_panel", role: "dialog", "aria-label": "\u519C\u5927\u95E8\u6237", style: { ['--cau-panel-top']: `${topInset}px` }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_panelHead", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_panelEmblem dsh-cau_cauLogo", children: "CAU" }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_panelName", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_panelNameImg dsh-cau_songtiName", children: "\u4E2D\u56FD\u519C\u4E1A\u5927\u5B66" }), showSettings && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_panelTitle", children: "\u8BBE\u7F6E" })] }), (0, jsx_runtime_1.jsx)(IconBtn, { n: "pinFill", label: pinned ? '取消固定面板' : '固定面板', title: pinned ? '取消固定（点击外部/Esc 会关闭）' : '固定面板（点击外部/Esc 不关闭）', on: pinned, onClick: togglePinned }), (0, jsx_runtime_1.jsx)(IconBtn, { n: "sliders", label: "\u6570\u636E\u7BA1\u7406", title: "\u6570\u636E\u7BA1\u7406\uFF08\u6E05\u7406\u65E7\u6570\u636E\uFF09", onClick: () => setStack((s) => [...s, { name: 'manage' }]) }), (0, jsx_runtime_1.jsx)(IconBtn, { n: "gear", label: "\u8BBE\u7F6E", title: showSettings ? '返回首页' : '设置', on: showSettings, onClick: () => setShowSettings((v) => !v) }), (0, jsx_runtime_1.jsx)(IconBtn, { n: "close", label: "\u5173\u95ED", onClick: onClose })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_panelBody", children: showSettings ? ((0, jsx_runtime_1.jsx)(CauSettingsBoundary, { children: (0, jsx_runtime_1.jsx)(settings_1.CauSettings, {}) })) : ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'contents' }, children: [view.name === 'home' && ((0, jsx_runtime_1.jsx)(panel_home_1.HomeView, { onOpenColumn: openColumn, onOpenArticle: (id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx), onViewArchive: () => setStack((s) => [...s, { name: 'archive' }]), onViewFollow: () => setStack((s) => [...s, { name: 'follow' }]), onViewDeadlines: () => setStack((s) => [...s, { name: 'deadlines' }]), onReadChange: recountUnread })), view.name === 'site' && ((0, jsx_runtime_1.jsx)(panel_column_1.ColumnView, { site: view.site, onBack: back, onOpenArticle: (id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx), onOpenColumn: openColumn })), view.name === 'column' && ((0, jsx_runtime_1.jsx)(panel_column_1.ColumnView, { site: view.site, column: view.column, onBack: back, onOpenArticle: (id, sibs, idx) => openArticle(id, undefined, undefined, sibs, idx), onOpenColumn: openColumn })), view.name === 'article' && ((0, jsx_runtime_1.jsx)(panel_article_1.ArticleView, { articleId: view.id, siteName: view.siteName, columnName: view.columnName, onBack: back, onOpenArticle: replaceArticle, siblings: view.siblings, index: view.index })), view.name === 'archive' && (0, jsx_runtime_1.jsx)(ArchiveView, { onBack: back, onOpenArticle: (id) => openArticle(id) }), view.name === 'follow' && (0, jsx_runtime_1.jsx)(FollowView, { onBack: back, onOpenArticle: (id) => openArticle(id) }), view.name === 'manage' && (0, jsx_runtime_1.jsx)(panel_manage_1.ManageView, { onBack: back }), view.name === 'deadlines' && (0, jsx_runtime_1.jsx)(panel_deadlines_1.DeadlinesView, { onBack: back, onOpenArticle: (id) => openArticle(id) })] }, refreshKey)) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_panelFoot", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_footDot", "data-on": metaTime ? '1' : '0' }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_footText", children: ["\u4E91\u7AEF\u66F4\u65B0\u4E8E ", metaTime || '—', " \u00B7 \u672A\u8BFB ", unread] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_footBtn' + (refreshing ? ' spin' : ''), title: "\u5F3A\u5236\u5237\u65B0\uFF08\u91CD\u65B0\u62C9\u53D6\u4E91\u7AEF\u6570\u636E\uFF09", "aria-label": "\u5237\u65B0", onClick: () => void refresh(), children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "refresh" }) })] })] }));
}
exports.PANEL_CSS = `
.dsh-cau_panel{position:fixed;top:var(--cau-panel-top,12px);right:12px;bottom:12px;z-index:30;display:flex;flex-direction:column;width:var(--cau-panel-w,540px);max-width:calc(100vw - 48px);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 86%,transparent);backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2);border:1px solid var(--cau-line);border-radius:var(--cau-r-l);box-shadow:var(--dsw-shadow-lv3,0 16px 40px rgba(8,12,18,.16)),inset 0 1px 0 rgba(255,255,255,.06);overflow:hidden;animation:dsh-cau-rise .18s ease-out}
body[data-ds-dark-theme] .dsh-cau_panel{background:color-mix(in srgb,var(--dsw-specific-menu,#14161a) 93%,transparent)}
body[data-ds-dark-theme] .dsh-cau_ov{background:var(--cau-brand-a9)}
body.dsh-cau-drawer-open{--cau-panel-w:max(0px,min(540px,calc(100vw - 640px)))}
body.dsh-cau-drawer-open [data-conversation-scroll]{margin-right:calc(var(--cau-panel-w) + 24px);transition:margin-right var(--ds-transition-duration-slow,.2s) var(--ds-ease-in-out,ease-out)}
@keyframes dsh-cau-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes dsh-cau-viewin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes dsh-cau-spin{to{transform:rotate(360deg)}}
.dsh-cau_panelHead{flex:none;display:flex;align-items:center;height:48px;padding:0 8px 0 14px;gap:3px;border-bottom:1px solid var(--cau-line-soft)}
.dsh-cau_panelEmblem{flex:none;display:flex;color:var(--cau-brand);margin-right:3px}
.dsh-cau_panelEmblem svg{display:block;height:18px;width:auto}
.dsh-cau_panelName{flex:1;min-width:0;display:flex;align-items:center;gap:8px;overflow:hidden}
.dsh-cau_panelNameImg{flex:none;display:flex;align-items:center;color:var(--cau-brand)}
.dsh-cau_panelNameImg svg{display:block;width:auto;height:20px}
.dsh-cau_panelHead .dsh-cau_cauLogo{font-size:18px}
.dsh-cau_panelHead .dsh-cau_songtiName{font-size:19px;color:var(--cau-brand);white-space:nowrap}
.dsh-cau_panelTitle{flex:none;font-size:12px;font-weight:600;letter-spacing:.05em;color:var(--cau-ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_iconBtn{flex:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink3);cursor:pointer}
.dsh-cau_iconBtn:hover{background:var(--cau-hover);color:var(--cau-ink)}
.dsh-cau_iconBtn[data-on='true']{color:var(--cau-brand);background:var(--cau-brand-a9)}
.dsh-cau_iconBtn svg{display:block;width:16px;height:16px}
.dsh-cau_panelBody{flex:1;min-height:0;overflow-y:auto;padding:6px 14px 14px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2)) transparent}
.dsh-cau_panelBody::-webkit-scrollbar{width:8px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,rgba(0,0,0,.2));border-radius:4px}
.dsh-cau_panelBody::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,rgba(0,0,0,.3))}
.dsh-cau_panelFoot{flex:none;display:flex;align-items:center;gap:7px;height:34px;padding:0 8px 0 14px;border-top:1px solid var(--cau-line-soft);font-size:11px;color:var(--cau-ink3)}
.dsh-cau_footDot{flex:none;width:5px;height:5px;border-radius:50%;background:var(--cau-ink3)}
.dsh-cau_footDot[data-on='1']{background:var(--cau-ok)}
.dsh-cau_footText{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_footBtn{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--cau-ink3);cursor:pointer}
.dsh-cau_footBtn:hover{background:var(--cau-hover);color:var(--cau-ink)}
.dsh-cau_footBtn svg{display:block;width:13px;height:13px}
.dsh-cau_footBtn.spin svg{animation:dsh-cau-spin .8s linear infinite}
.dsh-cau_view{display:block}
.dsh-cau_view>*{animation:dsh-cau-viewin .18s ease-out both}
.dsh-cau_view>*:nth-child(2){animation-delay:.04s}
.dsh-cau_view>*:nth-child(3){animation-delay:.07s}
.dsh-cau_view>*:nth-child(4){animation-delay:.1s}
.dsh-cau_view>*:nth-child(n+5){animation-delay:.13s}
.dsh-cau_loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:28px 0;font-size:12px;color:var(--cau-ink3)}
.dsh-cau_spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--cau-brand-a16);border-top-color:var(--cau-brand);animation:dsh-cau-spin .8s linear infinite}
.dsh-cau_msg{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin:14px 0 4px;padding:12px;border:1px solid var(--cau-line);border-radius:var(--cau-r-m)}
.dsh-cau_msgText{font-size:12px;line-height:18px;color:var(--cau-ink2)}
.dsh-cau_msgBtn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border:1px solid var(--cau-line);border-radius:10px;background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_msgBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_msgBtnPrimary{background:var(--cau-brand);border-color:transparent;color:#fff;border-radius:999px}
.dsh-cau_msgBtnPrimary:hover{background:var(--cau-brand);color:#fff;opacity:.9}
.dsh-cau_hint{margin-top:8px;padding:8px 10px;border-radius:var(--cau-r-s);background:var(--cau-fill);font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_hintErr{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_sec{margin-top:18px}
.dsh-cau_sec:first-child{margin-top:6px}
.dsh-cau_secHead{display:flex;align-items:center;height:22px;margin-bottom:8px;gap:8px}
.dsh-cau_secMark{flex:none;width:2px;height:11px;border-radius:2px;background:var(--cau-brand);opacity:.85}
.dsh-cau_secTitle{flex:none;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;letter-spacing:.07em;color:var(--cau-ink2)}
.dsh-cau_secTitle svg{display:block;width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_secLine{flex:1;min-width:12px;height:1px;background:var(--cau-line-soft)}
.dsh-cau_secActs{flex:none;display:flex;align-items:center;gap:2px}
.dsh-cau_card{border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);padding:4px;overflow:hidden;background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 28%,transparent);box-shadow:0 1px 2px rgba(10,15,22,.03)}
.dsh-cau_empty{display:flex;flex-direction:column;align-items:center;gap:5px;padding:20px 12px;text-align:center;font-size:12px;color:var(--cau-ink3)}
.dsh-cau_emptyIcon{display:flex;color:var(--cau-ink3);opacity:.75}
.dsh-cau_emptyIcon svg{width:22px;height:22px}
.dsh-cau_emptyMain{font-size:12px;line-height:18px;color:var(--cau-ink2)}
.dsh-cau_emptySub{font-size:11px;line-height:16px;color:var(--cau-ink3);max-width:330px}
.dsh-cau_textBtn{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border:none;border-radius:6px;background:transparent;color:var(--cau-brand);font-size:11px;cursor:pointer}
.dsh-cau_textBtn:hover{background:var(--cau-brand-a9)}
.dsh-cau_textBtn.dsh-cau_on{font-weight:600}
.dsh-cau_textBtn:disabled{opacity:.5;cursor:default}
.dsh-cau_textBtn svg{width:11px;height:11px}
.dsh-cau_bread{display:flex;align-items:center;gap:8px;padding:2px 0 10px}
.dsh-cau_backBtn{flex:none;display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border:none;border-radius:999px;background:transparent;color:var(--cau-brand);font-size:12px;cursor:pointer}
.dsh-cau_backBtn:hover{background:var(--cau-brand-a9)}
.dsh-cau_backBtn svg{width:12px;height:12px}
.dsh-cau_breadPath{flex:1;min-width:0;font-size:11px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_dlRow{padding:7px 8px;border-radius:var(--cau-r-s)}
.dsh-cau_dlRow:hover{background:var(--cau-hover)}
.dsh-cau_dlRow.soon{background:color-mix(in srgb,var(--cau-warn) 8%,transparent)}
.dsh-cau_dlRow.due{background:color-mix(in srgb,var(--cau-err) 9%,transparent)}
.dsh-cau_dlRow.soon .dsh-cau_dlDate{color:var(--cau-warn)}
.dsh-cau_dlRow.due .dsh-cau_dlDate{color:var(--cau-err)}
.dsh-cau_dlRow.archived{opacity:.6}
.dsh-cau_dlArch{flex:none;font-size:10px;padding:1px 7px;border-radius:999px;background:var(--cau-fill);color:var(--cau-ink3)}
.dsh-cau_mgArch{flex:none;display:flex;color:var(--cau-warn)}
.dsh-cau_mgArch svg{width:12px;height:12px}
/* ---- 我的事项大卡 + 全部待办入口 ---- */
.dsh-cau_mineGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:10px;margin-bottom:10px}
.dsh-cau_mineCard{position:relative;display:flex;flex-direction:column;gap:4px;padding:12px 13px 12px 16px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 30%,transparent);box-shadow:0 1px 2px rgba(10,15,22,.03);cursor:pointer;overflow:hidden}
.dsh-cau_mineCard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--cau-brand),var(--cau-brand-a35))}
.dsh-cau_mineCard:hover{border-color:var(--cau-brand-a35)}
.dsh-cau_mineCard.expired{opacity:.75}
.dsh-cau_mineCard.expired::before{background:var(--cau-ink3);opacity:.45}
.dsh-cau_mineCard.soon::before{background:linear-gradient(180deg,var(--cau-warn),color-mix(in srgb,var(--cau-warn) 35%,transparent))}
.dsh-cau_mineCard.due::before{background:linear-gradient(180deg,var(--cau-err),color-mix(in srgb,var(--cau-err) 35%,transparent))}
.dsh-cau_mineCard.soon .dsh-cau_mineDay{color:var(--cau-warn)}
.dsh-cau_mineCard.due .dsh-cau_mineDay{color:var(--cau-err)}
/* 今日要览（主动察觉层 Hero：对角极浅品牌渐变，首页唯一一处「浓」品牌色） */
.dsh-cau_ov{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:11px 13px;border:1px solid var(--cau-brand-a22);border-radius:14px;background:linear-gradient(135deg,var(--cau-brand-a12),var(--cau-brand-a6) 60%,transparent)}
.dsh-cau_ovTitle{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_ovTitle svg{width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_ovChip{display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:2px 9px;border-radius:999px;background:var(--cau-fill);color:var(--cau-ink2)}
.dsh-cau_ovChip svg{width:11px;height:11px}
.dsh-cau_ovChip.hl{background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_ovChip.due{background:color-mix(in srgb,var(--cau-warn) 12%,transparent);color:var(--cau-warn)}
.dsh-cau_ovChip.hit{background:var(--cau-brand-a12);color:var(--cau-brand)}
.dsh-cau_ovList{display:flex;flex-direction:column;gap:2px;width:100%;margin-top:3px}
.dsh-cau_ovRow{display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:11px;line-height:15px;color:var(--cau-ink2);cursor:pointer;border-radius:6px}
.dsh-cau_ovRow:hover{background:var(--cau-brand-a6)}
.dsh-cau_ovRow em{flex:none;display:inline-flex;align-items:center;font-style:normal;font-size:10px;padding:1px 6px;border-radius:999px;background:var(--cau-brand-a16);color:var(--cau-brand)}
.dsh-cau_ovRow em svg{width:10px;height:10px}
.dsh-cau_ovRow .dsh-cau_ovTitleTxt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--cau-ink)}
.dsh-cau_ovRow i{flex:none;font-style:normal;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--cau-ink3)}
.dsh-cau_impHit{flex:none;display:flex;color:var(--cau-brand)}
.dsh-cau_impHit svg{width:12px;height:12px}
.dsh-cau_mineDate{display:flex;align-items:baseline;gap:6px}
.dsh-cau_mineDay{font-size:30px;font-weight:700;line-height:1;color:var(--cau-brand)}
.dsh-cau_mineCard.expired .dsh-cau_mineDay{color:var(--cau-ink3)}
.dsh-cau_mineYM{font-size:13px;font-weight:500;color:var(--cau-ink2)}
.dsh-cau_mineCount{flex:none;margin-left:auto;font-size:11px;font-weight:600;color:var(--cau-brand)}
.dsh-cau_mineCard.expired .dsh-cau_mineCount{color:var(--cau-err)}
.dsh-cau_mineTitle{font-size:13px;line-height:19px;color:var(--cau-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:38px}
.dsh-cau_mineFoot{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-cau_mineCol{flex:1;min-width:0;font-size:11px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mineActs{flex:none;display:flex;align-items:center;gap:2px}
.dsh-cau_mineEditRow{display:flex;gap:6px;align-items:flex-end;margin-top:2px}
.dsh-cau_deadlineEntry{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 13px;border:1px dashed var(--cau-line);border-radius:var(--cau-r-m)}
.dsh-cau_deadlineEntry:hover{border-color:var(--cau-brand-a35);background:var(--cau-brand-a6)}
.dsh-cau_deadlineEntryMain{flex:1;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--cau-ink2);cursor:pointer}
.dsh-cau_deadlineEntryMain svg{width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_deadlineEntryMain:hover{color:var(--cau-brand)}
.dsh-cau_deadlineEntryArrow{margin-left:auto;color:var(--cau-ink3)}
/* ---- 待办中心（全部待办视图） ---- */
.dsh-cau_dlHint{font-size:12px;line-height:17px;color:var(--cau-ink3);margin:4px 0 8px}
.dsh-cau_dlChip{height:24px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_dlChip:hover{background:var(--cau-hover)}
.dsh-cau_dlChip.on{background:var(--cau-brand-a12);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_dlList{display:flex;flex-direction:column;gap:2px}
.dsh-cau_dlTop{display:flex;align-items:baseline;gap:6px;min-width:0}
.dsh-cau_dlItem{flex:none;font-size:12px;font-weight:500;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.dsh-cau_dlDate{flex:none;font-size:11px;font-weight:500;color:var(--cau-warn)}
.dsh-cau_dlCol{flex:none;font-size:10px;color:var(--cau-ink3)}
.dsh-cau_dlTitleWrap{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px}
.dsh-cau_dlTitle{flex:1;min-width:0;font-size:11px;line-height:16px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.dsh-cau_dlTitle:hover{color:var(--cau-ink)}
.dsh-cau_dlAct{flex:none;display:flex;align-items:center;gap:4px}
.dsh-cau_impRow{display:flex;gap:7px;width:100%;padding:8px;border-radius:var(--cau-r-s)}
.dsh-cau_impRow:hover{background:var(--cau-hover)}
.dsh-cau_impDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--cau-brand);margin-top:6px}
.dsh-cau_impDot[data-read='1']{opacity:0}
.dsh-cau_impMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_impTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_impTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_impSummary{font-size:12px;line-height:17px;color:var(--cau-ink2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_impMeta{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_followBtn,.dsh-cau_impArch{flex:none;align-self:flex-start;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--cau-ink3);cursor:pointer}
.dsh-cau_followBtn{margin-right:10px}
.dsh-cau_followBtn:hover,.dsh-cau_impArch:hover{background:var(--cau-hover);color:var(--cau-ink)}
.dsh-cau_followBtn.dsh-cau_on{color:var(--cau-brand)}
.dsh-cau_followBtn svg,.dsh-cau_impArch svg{width:14px;height:14px}
.dsh-cau_impActs{flex:none;display:flex;align-items:flex-start;gap:2px;margin-right:10px;align-self:flex-start}
.dsh-cau_impRow .dsh-cau_followBtn{margin-right:0}
.dsh-cau_newsSubHead{display:flex;align-items:center;gap:6px;padding:8px 8px 4px;font-size:11px;font-weight:600;letter-spacing:.05em;color:var(--cau-ink2);margin-top:6px;border-top:1px solid var(--cau-line-soft)}
.dsh-cau_newsSubHead:first-child{border-top:none;margin-top:0;padding-top:2px}
.dsh-cau_newsSubHead svg{width:12px;height:12px;color:var(--cau-brand)}
.dsh-cau_newsSubHead>span{display:inline-flex;align-items:center;gap:4px}
.dsh-cau_newsSubHead em{font-style:normal;font-size:10px;font-weight:500;color:var(--cau-ink3)}
.dsh-cau_secCount{flex:none;font-size:10px;color:var(--cau-ink3);padding:1px 7px;border-radius:999px;background:var(--cau-fill)}
.dsh-cau_portalTag{flex:none;font-size:10px;line-height:16px;padding:0 6px;border-radius:999px;font-weight:500;color:var(--cau-brand);background:var(--cau-brand-a12)}
.dsh-cau_portalCard{display:flex;flex-direction:column;gap:9px;padding:12px;border:1px dashed var(--cau-brand-a35);border-radius:var(--cau-r-m);background:linear-gradient(135deg,var(--cau-brand-a9),transparent 70%)}
.dsh-cau_portalCardTitle{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--cau-brand)}
.dsh-cau_portalCardTitle svg{width:14px;height:14px}
.dsh-cau_portalCardDesc{font-size:12px;line-height:18px;color:var(--cau-ink2)}
.dsh-cau_badge{flex:none;font-size:10px;line-height:16px;padding:0 7px;border-radius:999px;font-weight:500}
.dsh-cau_badgeHigh{color:var(--cau-err);background:color-mix(in srgb,var(--cau-err) 12%,transparent)}
.dsh-cau_badgeMid{color:var(--cau-warn);background:color-mix(in srgb,var(--cau-warn) 16%,transparent)}
.dsh-cau_badgeLow{color:var(--cau-ink3);background:var(--cau-fill)}
.dsh-cau_colGroup{margin-bottom:10px}
.dsh-cau_colGroup:last-child{margin-bottom:0}
.dsh-cau_colSiteBtn{display:block;width:100%;padding:5px 8px;border:none;border-radius:var(--cau-r-s);background:transparent;text-align:left;font-size:13px;font-weight:500;color:var(--cau-ink);cursor:pointer}
.dsh-cau_colSiteBtn:hover{background:var(--cau-hover)}
.dsh-cau_colSiteBtn.dsh-cau_dis{color:var(--cau-ink3);cursor:default}
.dsh-cau_colSiteBtn.dsh-cau_dis:hover{background:transparent}
.dsh-cau_disTag{display:inline-flex;align-items:center;margin-left:6px;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--cau-warn) 16%,transparent);color:var(--cau-warn);font-size:11px;font-weight:500}
.dsh-cau_colChips{display:flex;flex-wrap:wrap;gap:6px;padding-left:8px}
.dsh-cau_chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--cau-line-soft);border-radius:999px;font-size:12px;color:var(--cau-ink2);cursor:default;background:transparent}
.dsh-cau_chipBtn{cursor:pointer}
.dsh-cau_chipBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_chipCount{font-style:normal;font-size:10px;color:var(--cau-ink3)}
.dsh-cau_quick{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.dsh-cau_quickLink{display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border:1px solid var(--cau-line-soft);border-radius:10px;font-size:12px;color:var(--cau-ink2);text-decoration:none;background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 26%,transparent)}
.dsh-cau_quickLink:hover{color:var(--cau-brand);border-color:var(--cau-brand-a35);background:var(--cau-brand-a6)}
.dsh-cau_quickLink svg{width:11px;height:11px;opacity:.75}
.dsh-cau_tags{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
.dsh-cau_tag{padding:3px 9px;border:none;border-radius:999px;background:var(--cau-fill);color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_tagOn{background:var(--cau-brand-a16);color:var(--cau-brand)}
.dsh-cau_list{display:flex;flex-direction:column}
.dsh-cau_row{display:flex;gap:7px;width:100%;padding:8px;border:none;border-radius:var(--cau-r-s);background:transparent;text-align:left;cursor:pointer;font:inherit;color:inherit}
.dsh-cau_row:hover{background:var(--cau-hover)}
.dsh-cau_rowDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--cau-brand);margin-top:6px}
.dsh-cau_rowDot[data-read='1']{opacity:0}
.dsh-cau_rowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.dsh-cau_rowTop{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-cau_rowTitle{flex:1;min-width:0;font-size:13px;line-height:18px;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_rowSummary{font-size:12px;line-height:17px;color:var(--cau-ink2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsh-cau_rowMeta{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_atitle{font-size:17px;font-weight:600;line-height:25px;color:var(--cau-ink);margin:2px 0 6px}
.dsh-cau_ameta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--cau-ink3);margin-bottom:10px}
.dsh-cau_aimgTag{padding:0 5px;border-radius:6px;background:var(--cau-fill);color:var(--cau-ink3)}
.dsh-cau_asummary{padding:10px 12px;border:1px solid var(--cau-brand-a16);border-radius:10px;background:var(--cau-brand-a6);margin-bottom:10px}
.dsh-cau_asumHead{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--cau-brand);margin-bottom:4px}
.dsh-cau_asumText{font-size:13px;line-height:20px;color:var(--cau-ink)}
.dsh-cau_adeadline{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;padding:9px 12px;border-radius:10px;background:color-mix(in srgb,var(--cau-warn) 12%,transparent);margin-bottom:10px}
.dsh-cau_adeadlineIcon{display:flex;color:var(--cau-warn)}
.dsh-cau_adeadlineIcon svg{width:13px;height:13px}
.dsh-cau_adeadlineItem{font-size:13px;font-weight:600;color:var(--cau-warn)}
.dsh-cau_adeadlineDate{font-size:12px;font-weight:600;color:var(--cau-warn)}
.dsh-cau_adeadlineEv{font-size:11px;color:var(--cau-ink2)}
.dsh-cau_abody{font-size:14px;line-height:26px;color:var(--cau-ink);white-space:pre-wrap;word-break:break-word}
.dsh-cau_aactions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid var(--cau-line-soft)}
.dsh-cau_aBtn{display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border:1px solid var(--cau-line);border-radius:10px;background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer;text-decoration:none}
.dsh-cau_aBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_aBtn svg{width:12px;height:12px}
.dsh-cau_aBtnOn{border-color:var(--cau-brand-a55);color:var(--cau-brand);background:var(--cau-brand-a9)}
.dsh-cau_aBtnPrimary{background:var(--cau-brand);border-color:transparent;color:#fff}
.dsh-cau_aBtnPrimary:hover{background:var(--cau-brand);color:#fff;opacity:.9}
.dsh-cau_anav{display:flex;justify-content:space-between;margin-top:12px}
.dsh-cau_anavBtn{flex:none;display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border:none;border-radius:999px;background:transparent;color:var(--cau-brand);font-size:12px;cursor:pointer}
.dsh-cau_anavBtn:hover{background:var(--cau-brand-a9)}
.dsh-cau_anavBtn svg{width:12px;height:12px}
.dsh-cau_acacheTag{padding:0 5px;border-radius:6px;background:var(--cau-brand-a9);color:var(--cau-brand)}
.dsh-cau_mgIntro{font-size:12px;line-height:18px;color:var(--cau-ink2);margin:4px 0 10px}
.dsh-cau_mgToolbar{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
.dsh-cau_mgSearch{width:100%;box-sizing:border-box;height:28px;padding:0 10px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink);font-size:12px;outline:none}
.dsh-cau_mgSearch:focus{border-color:var(--cau-brand-a55)}
.dsh-cau_mgFilters{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dsh-cau_mgChip{height:24px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_mgChip:hover{background:var(--cau-hover)}
.dsh-cau_mgChip.on{background:var(--cau-brand-a12);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_mgSel{height:24px;padding:0 6px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px}
.dsh-cau_mgLabel{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_mgDate{height:24px;box-sizing:border-box;padding:0 6px;border:1px solid var(--cau-line);border-radius:6px;background:transparent;color:var(--cau-ink);font-size:11px}
.dsh-cau_mgCheck{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-s);color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_mgCheck input{accent-color:var(--cau-brand)}
.dsh-cau_mgChipBtn{height:24px;padding:0 10px;border:1px dashed var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_mgActs{display:flex;gap:6px;flex-wrap:wrap}
.dsh-cau_mgBtn{height:26px;padding:0 12px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer}
.dsh-cau_mgBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_mgBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_mgBtn.warn{background:color-mix(in srgb,var(--cau-err) 12%,transparent);border-color:color-mix(in srgb,var(--cau-err) 45%,transparent);color:var(--cau-err)}
.dsh-cau_mgBar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:var(--cau-r-s);background:var(--cau-fill);font-size:12px;color:var(--cau-ink2);margin-bottom:8px}
.dsh-cau_mgDel{flex:none;height:28px;padding:0 14px;border:none;border-radius:var(--cau-r-s);background:var(--cau-err);color:#fff;font-size:12px;cursor:pointer}
.dsh-cau_mgDel:hover{opacity:.9}
.dsh-cau_mgDel:disabled{opacity:.45;cursor:default}
.dsh-cau_mgConfirm{margin-bottom:8px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--cau-err) 35%,transparent);border-radius:var(--cau-r-s);background:color-mix(in srgb,var(--cau-err) 6%,transparent)}
.dsh-cau_mgConfirmText{font-size:12px;line-height:18px;color:var(--cau-ink);margin-bottom:8px}
.dsh-cau_mgConfirmActs{display:flex;gap:6px}
.dsh-cau_mgMsg{margin:6px 0;padding:8px 10px;border-radius:var(--cau-r-s);font-size:12px;line-height:18px}
.dsh-cau_mgMsg.ok{background:color-mix(in srgb,var(--cau-ok) 10%,transparent);color:var(--cau-ok)}
.dsh-cau_mgMsg.error{background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_mgList{display:flex;flex-direction:column;gap:10px}
.dsh-cau_mgGroup{border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);overflow:hidden}
.dsh-cau_mgGroupName{padding:6px 10px;font-size:12px;font-weight:500;color:var(--cau-ink2);background:var(--cau-fill)}
.dsh-cau_mgRow{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-top:1px solid var(--cau-line-soft);cursor:pointer}
.dsh-cau_mgRow input{margin-top:3px}
.dsh-cau_mgRow.pro{border-left:3px solid var(--cau-warn);background:color-mix(in srgb,var(--cau-warn) 7%,transparent)}
.dsh-cau_mgMine{display:flex;color:var(--cau-warn)}
.dsh-cau_mgMine svg{width:12px;height:12px}
.dsh-cau_mineArt{flex:none;display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 10px;border:1px solid var(--cau-brand-a35);border-radius:999px;background:var(--cau-brand-a9);color:var(--cau-brand);font-size:11px;cursor:pointer}
.dsh-cau_mineArt:hover{background:var(--cau-brand-a16)}
.dsh-cau_mineArt svg{width:10px;height:10px}
.dsh-cau_mineEdit{display:flex;flex-direction:column;gap:6px;margin-top:2px;padding-top:8px;border-top:1px dashed var(--cau-line)}
.dsh-cau_mineEditNew{padding:10px 12px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s)}
.dsh-cau_mineLabel{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;font-size:11px;color:var(--cau-ink3)}
.dsh-cau_mineLabel span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mineSrc{font-size:11px;line-height:16px;color:var(--cau-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.dsh-cau_mgRowMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dsh-cau_mgRowTitle{font-size:13px;line-height:18px;color:var(--cau-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-cau_mgStar{display:inline-flex;color:var(--cau-warn);margin-left:4px}
.dsh-cau_mgStar svg{width:11px;height:11px}
.dsh-cau_mgRowSub{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11px;color:var(--cau-ink3)}
.dsh-cau_mgOld{padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--cau-warn) 14%,transparent);color:var(--cau-warn)}
.dsh-cau_mgHl{color:var(--cau-brand);font-weight:600;background:var(--cau-brand-a12);border-radius:3px;padding:0 1px}
.dsh-cau_mgRowUrl{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

return module.exports; })();
var settings_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_CSS = void 0;
exports.CauSettings = CauSettings;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * cau-portal 设置页（2026-09-01 结构重设计：方案C 分组卡片墙 + 语义统一）：
 * 首页 = 3 组分组卡片（智能与数据 / 通知与关注 / 面板行为）＋ 顶部提醒条（红=基本需求不满足 / 黄=注意）。
 *   开关语义统一：功能卡（AI/数据源/待办/引用协同/邮件）首页即有总开关；凭据卡（令牌/门户账号，淡底）无开关只显状态。
 * 子页（卡片↔子页严格 1:1；页头下内联本模块相关提醒，另有其他模块问题时显示可点击计数 chip 回首页）：
 *   ① AI 加工·模型配置（模型选择 + 用量柱状图 7/30/90 天 + 指标切换 + 分账表 + 按需补摘要说明）
 *   ② 令牌管理（多令牌登记：值/过期日/剩余天数/快捷跳转 GitHub 管理页/逐枚开关）
 *   ③ 面板偏好·引用协同（自动附加 + 引用协同开关 + 面板固定）  ④ 待办提醒·关注（模块开关 + 关注规则 + 系统通知）
 *   ⑤ 数据源（GitHub 云端 + 统一门户开关 + 连通检查）  ⑥ 每日邮件报告  ⑦ 门户账号（开源版不可用 + 重要链接）
 * 全部纯客户端（localStorage），浏览器刷新生效。
 */
const react_1 = require("react");
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
var ctx_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCtx = bindCtx;
exports.getCtx = getCtx;
/**
 * 跨组件树共享插件 ctx（面板树 ↔ 设置页 都要用会话服务与模型目录）。
 *
 * 注意：build.mjs 的内联器**不做模块去重**——同一个模块被两处 require 会内联成
 * 两份独立 IIFE，各自持有自己的模块级状态。因此这里不能用模块级变量存单例，
 * 必须挂到 window 上（全局、跨所有内联副本共享），否则 bindCtx/getCtx 会读错对象。
 */
function bindCtx(c) {
    ;
    window.__CAU_CTX__ = c;
}
function getCtx() {
    return window.__CAU_CTX__;
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
const noop = () => { };
exports.SETTINGS_CSS = `
.dsh-cau_set{display:flex;flex-direction:column;gap:14px;padding:16px 0 24px;max-width:640px;width:100%;min-width:0;overflow-x:hidden}
/* ---- 提醒条 ---- */
.dsh-cau_alert{display:flex;align-items:flex-start;gap:8px;padding:9px 12px;border-radius:10px;font-size:12px;line-height:17px}
.dsh-cau_alert.error{border:1px solid color-mix(in srgb,var(--cau-err) 45%,transparent);background:color-mix(in srgb,var(--cau-err) 10%,transparent);color:var(--cau-err)}
.dsh-cau_alert.warn{border:1px solid color-mix(in srgb,var(--cau-warn) 45%,transparent);background:color-mix(in srgb,var(--cau-warn) 10%,transparent);color:var(--cau-warn)}
.dsh-cau_alertDot{flex:none;width:8px;height:8px;margin-top:4px;border-radius:50%;background:currentColor}
/* ---- 分组 ---- */
.dsh-cau_setGroup{display:flex;flex-direction:column;gap:10px}
.dsh-cau_setGroupTitle{display:flex;align-items:center;gap:8px;padding:2px 2px 0;font-size:11px;font-weight:600;letter-spacing:.07em;color:var(--cau-ink3)}
.dsh-cau_setGroupTitle::after{content:"";flex:1;height:1px;background:var(--cau-line-soft)}
/* ---- 分组卡片 ---- */
.dsh-cau_cards{display:flex;flex-direction:column;gap:10px}
.dsh-cau_setCard{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m);background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 26%,transparent);box-shadow:0 1px 2px rgba(10,15,22,.03);cursor:pointer;transition:border-color .12s ease}
.dsh-cau_setCard:hover{border-color:var(--cau-brand-a55)}
.dsh-cau_setCardAlt{background:var(--cau-fill)}
.dsh-cau_cardMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.dsh-cau_cardName{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_cardIcon{flex:none;display:flex;color:var(--cau-brand)}
.dsh-cau_cardIcon svg{width:15px;height:15px}
.dsh-cau_cardDesc{font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_cardBadge{flex:none;font-size:11px;padding:2px 7px;border-radius:999px;white-space:nowrap}
.dsh-cau_cardBadge.ok{background:color-mix(in srgb,var(--cau-ok) 14%,transparent);color:var(--cau-ok)}
.dsh-cau_cardBadge.warn{background:color-mix(in srgb,var(--cau-warn) 14%,transparent);color:var(--cau-warn)}
.dsh-cau_cardBadge.off{background:var(--cau-fill);color:var(--cau-ink3)}
.dsh-cau_cardBadge.err{background:color-mix(in srgb,var(--cau-err) 14%,transparent);color:var(--cau-err)}
/* ---- 开关 ---- */
.dsh-cau_switch{flex:none;position:relative;width:34px;height:20px;border:1px solid var(--cau-line);border-radius:999px;background:var(--cau-fill);cursor:pointer;transition:background .15s ease,border-color .15s ease}
.dsh-cau_switch span{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--cau-ink3);transition:transform .15s ease,background .15s ease}
.dsh-cau_switch.on{border-color:var(--cau-brand-a55);background:var(--cau-brand-a22)}
.dsh-cau_switch.on span{transform:translateX(14px);background:var(--cau-brand)}
/* ---- 子页 ---- */
.dsh-cau_setPageHead{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dsh-cau_setSubBack{flex:none;display:inline-flex;align-items:center;gap:3px;height:28px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-brand);font-size:12px;cursor:pointer}
.dsh-cau_setSubBack:hover{background:var(--cau-brand-a9)}
.dsh-cau_setSubBack svg{width:12px;height:12px}
.dsh-cau_setBlocks{display:flex;flex-direction:column;gap:14px}
.dsh-cau_setBlock{display:flex;flex-direction:column;gap:8px}
.dsh-cau_setTitle{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_setTitle::before{content:"";flex:none;width:2px;height:12px;border-radius:2px;background:var(--cau-brand)}
.dsh-cau_setTitle svg{width:13px;height:13px;color:var(--cau-brand)}
.dsh-cau_setDesc{font-size:12px;line-height:17px;color:var(--cau-ink3)}
.dsh-cau_setRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0}
.dsh-cau_mineLabel{display:flex;flex-direction:column;gap:4px;margin:0}
.dsh-cau_mineLabel span{font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_mineLabel .dsh-cau_setSelect{width:100%;flex:none}
.dsh-cau_setLabel{flex:1;min-width:0;font-size:13px;color:var(--cau-ink2)}
.dsh-cau_setInput{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink);font-size:12px;outline:none}
.dsh-cau_setInput:focus{border-color:var(--cau-brand)}
.dsh-cau_setSelect{box-sizing:border-box;min-width:0;flex:1;height:32px;padding:0 8px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:var(--dsw-specific-menu,#1b1e24);color:var(--cau-ink);font-size:12px;outline:none;cursor:pointer}
.dsh-cau_setBtn{flex:none;display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 14px;border:1px solid var(--cau-line);border-radius:10px;background:transparent;color:var(--cau-ink);font-size:12px;cursor:pointer}
.dsh-cau_setBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_setBtn svg{width:12px;height:12px}
.dsh-cau_setBtn:disabled{opacity:.45;cursor:default}
.dsh-cau_setBtn.danger{border-color:color-mix(in srgb,var(--cau-err) 45%,transparent);color:var(--cau-err)}
.dsh-cau_setBtn.danger:hover{background:color-mix(in srgb,var(--cau-err) 8%,transparent)}
.dsh-cau_setHint{font-size:11px;line-height:16px;color:var(--cau-ink3)}
.dsh-cau_setOk{font-size:12px;color:var(--cau-ok)}
.dsh-cau_setErr{font-size:12px;color:var(--cau-err)}
.dsh-cau_setWarn{font-size:12px;line-height:17px;color:var(--cau-warn)}
.dsh-cau_setOther{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border:1px solid color-mix(in srgb,var(--cau-warn) 40%,transparent);border-radius:999px;background:color-mix(in srgb,var(--cau-warn) 8%,transparent);color:var(--cau-warn);font-size:11px;cursor:pointer}
.dsh-cau_setOther:hover{background:color-mix(in srgb,var(--cau-warn) 14%,transparent)}
.dsh-cau_setCheck{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--cau-ink2);cursor:pointer}
.dsh-cau_setCheck input{accent-color:var(--cau-brand)}
.dsh-cau_infoCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--cau-line-soft);border-radius:10px;background:var(--cau-fill)}
/* ---- 用量图 ---- */
.dsh-cau_chart{display:block;width:100%;height:150px;color:var(--cau-ink2)}
.dsh-cau_setChip{height:24px;padding:0 11px;border:1px solid var(--cau-line);border-radius:999px;background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer}
.dsh-cau_setChip.on{background:var(--cau-brand-a12);border-color:var(--cau-brand);color:var(--cau-brand)}
.dsh-cau_usageTable{width:100%;border-collapse:collapse;font-size:12px;color:var(--cau-ink2)}
.dsh-cau_usageTable th,.dsh-cau_usageTable td{padding:6px 8px;border-bottom:1px solid var(--cau-line-soft);text-align:right;white-space:nowrap}
.dsh-cau_usageTable th:first-child,.dsh-cau_usageTable td:first-child{text-align:left}
.dsh-cau_usageTable th{color:var(--cau-ink3);font-weight:500}
/* ---- 令牌 ---- */
.dsh-cau_tokList{display:flex;flex-direction:column;gap:8px}
.dsh-cau_tok{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--cau-line-soft);border-radius:var(--cau-r-m)}
.dsh-cau_tokMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.dsh-cau_tokName{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--cau-ink)}
.dsh-cau_tokMeta{display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--cau-ink3)}
.dsh-cau_tokActs{display:flex;gap:6px;flex:none}
.dsh-cau_tokBtn{flex:none;display:inline-flex;align-items:center;gap:3px;height:26px;padding:0 9px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px;cursor:pointer;text-decoration:none}
.dsh-cau_tokBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_tokBtn svg{width:11px;height:11px}
.dsh-cau_tokBtn.danger{color:var(--cau-err);border-color:color-mix(in srgb,var(--cau-err) 40%,transparent)}
.dsh-cau_tokBtn.danger:hover{background:color-mix(in srgb,var(--cau-err) 8%,transparent)}
.dsh-cau_links{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.dsh-cau_link{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:1px solid var(--cau-line);border-radius:var(--cau-r-s);background:transparent;color:var(--cau-ink2);font-size:11px;text-decoration:none;cursor:pointer}
.dsh-cau_link:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_link svg{width:11px;height:11px}
`;
const ROLE_LABEL = {
    enrich: '爬虫管道加工',
    'on-demand': '面板按需加工',
    monitor: '监控',
    other: '其他',
};
function fmtNum(n) {
    if (n >= 1e6)
        return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4)
        return (n / 1e4).toFixed(1) + 'w';
    return String(n);
}
function daysUntil(dateStr) {
    if (!dateStr)
        return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime()))
        return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400e3);
}
function expiryBadge(expires) {
    const n = daysUntil(expires);
    if (n == null)
        return { cls: 'dsh-cau_setHint', text: '未设过期日' };
    if (n < 0)
        return { cls: 'dsh-cau_setErr', text: `已过期 ${-n} 天` };
    if (n <= 30)
        return { cls: 'dsh-cau_setWarn', text: `${n} 天后过期` };
    return { cls: 'dsh-cau_setOk', text: `${n} 天后过期` };
}
const KEY_LINKS = [
    { key: 'github-read', label: 'GitHub 令牌管理', url: 'https://github.com/settings/personal-access-tokens' },
    { key: 'repo', label: '数据仓库', url: 'https://github.com/ZBber-lab/cau-portal' },
    { key: 'actions', label: '定时抓取 Actions', url: 'https://github.com/ZBber-lab/cau-portal/actions' },
    { key: 'cron', label: 'cron-job.org', url: 'https://console.cron-job.org/jobs' },
    { key: 'ds', label: 'DeepSeek 平台', url: 'https://platform.deepseek.com' },
    { key: 'portal', label: '统一门户', url: 'https://one.cau.edu.cn' },
];
/** 自绘 SVG 柱状图（无图表库依赖） */
function BarChart({ items, unit }) {
    const W = 460;
    const H = 150;
    const PAD = 8;
    const BASE = 24;
    const TOP = 24;
    const max = Math.max(1, ...items.map((i) => i.value));
    const n = items.length;
    const step = Math.max(1, Math.ceil(n / 10));
    const slot = (W - PAD * 2) / n;
    const bw = Math.max(2, slot - 3);
    return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: `0 0 ${W} ${H}`, className: "dsh-cau_chart", role: "img", "aria-label": "\u7528\u91CF\u67F1\u72B6\u56FE", children: [(0, jsx_runtime_1.jsx)("line", { x1: PAD, y1: H - BASE, x2: W - PAD, y2: H - BASE, stroke: "currentColor", opacity: ".25" }), (0, jsx_runtime_1.jsxs)("text", { x: PAD, y: 14, fontSize: "10", fill: "currentColor", opacity: ".6", children: ["max ", fmtNum(max), " ", unit] }), items.map((it, i) => {
                const h = Math.max(1.5, (it.value / max) * (H - BASE - TOP - 10));
                const x = PAD + i * slot + (slot - bw) / 2;
                const on = it.value > 0;
                return ((0, jsx_runtime_1.jsxs)("g", { children: [(0, jsx_runtime_1.jsx)("rect", { x: x, y: H - BASE - h, width: bw, height: h, rx: 2, fill: on ? 'var(--cau-brand)' : 'currentColor', opacity: on ? 1 : 0.12, children: (0, jsx_runtime_1.jsx)("title", { children: `${it.label}：${fmtNum(it.value)} ${unit}` }) }), i % step === 0 && ((0, jsx_runtime_1.jsx)("text", { x: x + bw / 2, y: H - 8, fontSize: "9", fill: "currentColor", opacity: ".55", textAnchor: "middle", children: it.label }))] }, i));
            })] }));
}
function Toggle({ on, onToggle, label }) {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_switch' + (on ? ' on' : ''), "aria-pressed": on, "aria-label": label, title: on ? '点击禁用' : '点击启用', onClick: (e) => { e.stopPropagation(); onToggle(); }, children: (0, jsx_runtime_1.jsx)("span", {}) }));
}
function CauSettings(props) {
    const _ctx = (0, ctx_1.getCtx)() || {};
    const sessions = props.sessions ?? _ctx.sessions;
    const modelDirectories = props.modelDirectories ?? _ctx.modelDirectories;
    const [page, setPage] = (0, react_1.useState)('home');
    const [settings, setSettings] = (0, react_1.useState)(() => (0, data_1.loadSettings)());
    const [mods, setMods] = (0, react_1.useState)(() => (0, data_1.loadModules)());
    const [tokens, setTokens] = (0, react_1.useState)(() => (0, data_1.loadTokens)());
    const [savedFlash, setSavedFlash] = (0, react_1.useState)(false);
    const upd = (next) => {
        setSettings(next);
        (0, data_1.saveSettings)(next);
    };
    const toggleMod = (k) => {
        const next = { ...mods, [k]: !mods[k] };
        setMods(next);
        (0, data_1.saveModules)(next);
    };
    const persistTokens = (next) => {
        setTokens(next);
        (0, data_1.saveTokens)(next);
    };
    const alerts = (0, react_1.useMemo)(() => (0, data_1.computeAlerts)(), [mods, tokens, settings]);
    const flash = () => {
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 2000);
    };
    // ---------- 子页：AI 加工 · 模型配置 ----------
    const subList = (cb) => {
        try {
            return sessions?.list ? sessions.list.subscribe(cb) : noop;
        }
        catch {
            return noop;
        }
    };
    const snapList = () => {
        try {
            return sessions?.list?.getSnapshot();
        }
        catch {
            return undefined;
        }
    };
    const listSnap = (0, react_1.useSyncExternalStore)(subList, snapList);
    const sessionId = listSnap?.current;
    const [groups, setGroups] = (0, react_1.useState)([]);
    const [modelState, setModelState] = (0, react_1.useState)('idle');
    const [modelNote, setModelNote] = (0, react_1.useState)('');
    const loadModelDir = async () => {
        setModelState('loading');
        setModelNote('');
        if (!sessionId || !modelDirectories) {
            setModelState('fail');
            setModelNote('当前没有打开的会话，或模型目录服务不可用');
            return;
        }
        let d = null;
        try {
            d = modelDirectories.directoryFor(sessionId);
        }
        catch {
            setModelState('fail');
            setModelNote('当前会话无法解析模型目录');
            return;
        }
        let settled = false;
        const timer = window.setTimeout(() => {
            if (settled)
                return;
            settled = true;
            setModelState('fail');
            setModelNote('模型目录未响应（将使用服务端默认模型）');
        }, 6000);
        try {
            await d.load();
            settled = true;
            window.clearTimeout(timer);
            setGroups(d.store?.getSnapshot()?.groups || []);
            setModelState('ok');
        }
        catch {
            settled = true;
            window.clearTimeout(timer);
            setModelState('fail');
            setModelNote('模型目录加载失败（将使用服务端默认模型）');
        }
    };
    const monitor = settings.monitorModel || null;
    const selGroup = groups.find((g) => g.id === monitor?.provider) || groups[0] || null;
    const selModel = selGroup?.models?.find((m) => m.id === monitor?.model) || null;
    const pickModel = (provider, model) => {
        upd({ ...settings, monitorModel: { provider, model } });
        flash();
    };
    // 用量
    const [rows, setRows] = (0, react_1.useState)(null);
    const [metric, setMetric] = (0, react_1.useState)('calls');
    const [days, setDays] = (0, react_1.useState)(30);
    (0, react_1.useEffect)(() => {
        let alive = true;
        void (0, data_1.loadUsageRows)().then((r) => {
            if (alive)
                setRows(r);
        });
        return () => {
            alive = false;
        };
    }, []);
    const daily = (0, react_1.useMemo)(() => (rows ? (0, data_1.buildDailyUsage)(rows, days, metric) : []), [rows, days, metric]);
    const byRole = (0, react_1.useMemo)(() => (rows ? (0, data_1.summarizeUsage)(rows, days) : null), [rows, days]);
    const METRIC_UNIT = { calls: '次', prompt: '输入tok', completion: '输出tok', cost: '元' };
    // ---------- 子页：令牌管理 ----------
    const [tokEditing, setTokEditing] = (0, react_1.useState)(null);
    const [tokDraft, setTokDraft] = (0, react_1.useState)({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    const startEdit = (t) => {
        if (t) {
            setTokEditing(t.id);
            setTokDraft({ ...t });
        }
        else {
            setTokEditing('new');
            setTokDraft({ id: '', name: '', usage: '', value: '', expires: '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
        }
    };
    const saveTokDraft = () => {
        const d = tokDraft;
        if (!d.name.trim())
            return;
        const rec = { ...d, id: d.id || `tok-${Date.now().toString(36)}`, value: d.value || '' };
        const next = tokEditing && tokEditing !== 'new' ? tokens.map((t) => (t.id === tokEditing ? rec : t)) : [...tokens, rec];
        persistTokens(next);
        setTokEditing(null);
        flash();
    };
    const removeTok = (id) => {
        if (!window.confirm('删除该令牌登记？（令牌值仅本机，删除后不可恢复）'))
            return;
        persistTokens(tokens.filter((t) => t.id !== id));
    };
    const toggleTok = (id) => persistTokens(tokens.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
    // ---------- 子页：数据源连通检查 ----------
    const [cloudState, setCloudState] = (0, react_1.useState)('idle');
    const [cloudMsg, setCloudMsg] = (0, react_1.useState)('');
    const checkCloud = async () => {
        setCloudState('loading');
        setCloudMsg('');
        try {
            const text = await (0, data_1.readCloudText)('data/index.json');
            const j = JSON.parse(text);
            setCloudState('ok');
            setCloudMsg(`已连通 ✓ 数据更新至 ${j.last_updated || '未知'}，条目 ${j.stats?.total_items ?? '?'} 条 / 正文 ${j.stats?.articles_stored ?? '?'} 篇`);
        }
        catch (e) {
            setCloudState('fail');
            setCloudMsg(String(e?.message || e));
        }
    };
    // ---------- 每日邮件报告（阶段6） ----------
    const fetchEmailStatus = async () => {
        try {
            const r = await fetch('/api/cau/email/status');
            const j = await r.json();
            if (j && j.ok !== false) {
                setMailCfg((c) => ({
                    ...c,
                    enabled: !!j.enabled,
                    sender: j.sender || c.sender,
                    recipient: j.recipient || c.recipient || j.sender || c.sender,
                    sendTime: j.sendTime || c.sendTime,
                    hasCode: !!j.hasCode,
                    provider: j.provider ? String(j.provider) : '',
                }));
            }
        }
        catch (e) {
            /* 服务端不可用时保持现状 */
        }
    };
    const [mailCfg, setMailCfg] = (0, react_1.useState)({ enabled: false, sender: '', authCode: '', recipient: '', sendTime: '08:00', hasCode: false, provider: '', rulesCount: 0 });
    const [mailState, setMailState] = (0, react_1.useState)('idle');
    const [mailMsg, setMailMsg] = (0, react_1.useState)('');
    const [mailLast, setMailLast] = (0, react_1.useState)('');
    const refreshMailInfo = async () => {
        await fetchEmailStatus();
        try {
            const r = await fetch('/api/cau/email/status');
            const j = await r.json();
            if (j && j.ok !== false) {
                setMailLast(j.last_sent
                    ? `上次发送：${new Date(j.last_sent).toLocaleString('zh-CN', { hour12: false })}（${j.last_mode === 'test' ? '测试' : '日报'}）${j.last_ok === false ? ' · ❌ ' + (j.last_error || '失败') : ' · ✅ 成功'}`
                    : '尚未发送过（启用后每天 ' + (j.sendTime || '08:00') + ' 自动发送；测试按钮可先试发）');
                setMailCfg((c) => ({ ...c, rulesCount: j.rulesCount || 0, provider: j.provider || c.provider }));
            }
        }
        catch (e) {
            /* 忽略 */
        }
    };
    const doMailSave = async (enabledOverride) => {
        const enabled = enabledOverride ?? mailCfg.enabled;
        setMailState('loading');
        setMailMsg('');
        try {
            const r = await fetch('/api/cau/email/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled,
                    sender: mailCfg.sender,
                    authCode: mailCfg.authCode,
                    recipient: mailCfg.recipient,
                    sendTime: mailCfg.sendTime,
                }),
            });
            const j = await r.json();
            if (j?.ok) {
                setMailState('ok');
                setMailMsg(enabled ? '✅ 已保存并启用：每天 ' + (j.sendTime || mailCfg.sendTime) + ' 自动发送（错过时间开机自动补发）；建议点「测试发送」确认' : '已保存（未启用）');
                setMailCfg((c) => ({ ...c, authCode: '' }));
                void refreshMailInfo();
            }
            else {
                setMailState('fail');
                setMailMsg(j?.error || '保存失败');
            }
        }
        catch (e) {
            setMailState('fail');
            setMailMsg('服务端不可用：' + String(e?.message || e));
        }
    };
    const doMailToggle = async () => {
        const next = !mailCfg.enabled;
        // 未配置就启用 → 直接引导去配置
        if (next && !mailCfg.sender) {
            setPage('mail');
            setMailState('fail');
            setMailMsg('启用前请先填写发件邮箱与授权码');
            return;
        }
        try {
            const r = await fetch('/api/cau/email/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: next }),
            });
            const j = await r.json();
            if (j?.ok) {
                setMailCfg((c) => ({ ...c, enabled: !!j.enabled }));
                setMailState(next ? 'ok' : 'idle');
                setMailMsg(next ? '已启用：每天 ' + (j.sendTime || mailCfg.sendTime) + ' 自动发送（错过时间开机补发）' : '已禁用：日报暂停（配置保留）');
            }
            else {
                setMailState('fail');
                setMailMsg((j?.error || '切换失败') + '（可进页面查看/修复）');
            }
        }
        catch (e) {
            setMailState('fail');
            setMailMsg('服务端不可用：' + String(e?.message || e));
        }
    };
    const doMailTest = async () => {
        setMailState('loading');
        setMailMsg('发送中（30 秒内）…');
        try {
            const r = await fetch('/api/cau/email/test', { method: 'POST' });
            const j = await r.json();
            if (j?.ok) {
                setMailState('ok');
                setMailMsg(`✅ 测试邮件已发出：「${j.subject || '农大门户日报'}」→ 请查看收件箱（含垃圾箱）`);
            }
            else {
                setMailState('fail');
                setMailMsg('发送失败：' + (j?.error || '未知错误') + '（常见：授权码错误 / 服务商被封 / 收件地址不对）');
            }
            void refreshMailInfo();
        }
        catch (e) {
            setMailState('fail');
            setMailMsg('请求失败：' + String(e?.message || e));
        }
    };
    // 关注规则变化 → 同步快照给服务端（邮件的 🎯 段用）；静默失败
    const syncRulesToEmail = (next) => {
        try {
            void fetch('/api/cau/email/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules: next.filter((r) => r.enabled !== false && r.keyword) }),
            });
        }
        catch (e) {
            /* 忽略 */
        }
    };
    (0, react_1.useEffect)(() => {
        void fetchEmailStatus();
    }, []);
    // ---------- 关注规则 + 系统通知 ----------
    const [rules, setRules] = (0, react_1.useState)(() => (0, data_1.loadRules)());
    const [ruleDraft, setRuleDraft] = (0, react_1.useState)({ keyword: '', source: '', minImportance: '' });
    const [notifyStatus, setNotifyStatus] = (0, react_1.useState)(() => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'));
    const persistRules = (next) => {
        setRules(next);
        (0, data_1.saveRules)(next);
        syncRulesToEmail(next);
    };
    const addRule = () => {
        const k = ruleDraft.keyword.trim();
        if (!k)
            return;
        persistRules([
            ...rules,
            {
                id: (0, data_1.newRuleId)(),
                keyword: k.slice(0, 30),
                source: ruleDraft.source.trim().slice(0, 30) || undefined,
                minImportance: ruleDraft.minImportance ? ruleDraft.minImportance : undefined,
                enabled: true,
            },
        ]);
        setRuleDraft({ keyword: '', source: '', minImportance: '' });
    };
    // ---------- 首页卡片 ----------
    const tokBadge = (() => {
        const err = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) != null && daysUntil(t.expires) < 0);
        const warn = tokens.some((t) => t.enabled && t.expires && daysUntil(t.expires) <= 30 && daysUntil(t.expires) >= 0);
        const active = tokens.filter((t) => t.enabled && t.value).length;
        return err ? { cls: 'err', text: `${active} 枚在用 · ⚠ 已过期` } : warn ? { cls: 'warn', text: `${active} 枚在用 · ⚠ 临期` } : { cls: 'ok', text: `${active} 枚在用` };
    })();
    const cardGroups = [
        {
            title: '智能与数据',
            cards: [
                {
                    key: 'ai',
                    icon: 'robot',
                    name: 'AI 加工 · 模型配置',
                    desc: '模型选择 + 用量柱状图（7/30/90 天，次数/token/费用切换）',
                    badge: monitor ? { cls: 'ok', text: monitor.model } : { cls: 'warn', text: '未指定模型' },
                    need: mods.ai,
                    page: 'ai',
                },
                {
                    key: 'cloud',
                    icon: 'database',
                    name: '数据源',
                    desc: 'GitHub 云端数据（每 2 小时自动更新）；统一门户 · 校内通知开关在页面内',
                    badge: mods.cloud ? { cls: 'ok', text: '已连接云端' } : { cls: 'err', text: '已禁用! 插件无数据' },
                    need: mods.cloud,
                    page: 'cloud',
                },
                {
                    key: null,
                    icon: 'key',
                    name: '令牌管理',
                    desc: 'GitHub / 调度桥等令牌：过期日期、剩余天数、一键跳转 GitHub 管理页',
                    badge: tokBadge,
                    need: true,
                    page: 'tokens',
                    alt: true,
                },
                {
                    key: null,
                    icon: 'lock',
                    name: '统一门户 · 账号',
                    desc: '由于安全考量，该功能在开源工具中不可用',
                    badge: { cls: 'warn', text: '不可用' },
                    need: true,
                    page: 'security',
                    alt: true,
                },
            ],
        },
        {
            title: '通知与关注',
            cards: [
                {
                    key: 'deadline',
                    icon: 'clock',
                    name: '待办提醒 · 关注',
                    desc: '首页待办卡（截止提醒）、关注规则（关键词订阅）与系统通知',
                    badge: mods.deadline ? { cls: 'ok', text: '已启用' } : { cls: 'off', text: '已禁用' },
                    need: mods.deadline,
                    page: 'follow',
                },
                {
                    key: null,
                    icon: 'mail',
                    name: '每日邮件报告',
                    desc: '每天 8:00 自动推送今日摘要到邮箱（错过自动补发）；授权码仅存本机',
                    badge: mailCfg.enabled ? { cls: 'ok', text: '已启用' } : mailCfg.sender ? { cls: 'warn', text: '未启用' } : { cls: 'off', text: '未配置' },
                    need: true,
                    page: 'mail',
                },
            ],
        },
        {
            title: '面板行为',
            cards: [
                {
                    key: 'context',
                    icon: 'chat',
                    name: '面板偏好 · 引用协同',
                    desc: '自动附加阅读上下文、引用到对话（上下文条/工具卡片）；面板固定',
                    badge: mods.context ? { cls: 'ok', text: '引用协同开' } : { cls: 'off', text: '已禁用' },
                    need: mods.context,
                    page: 'prefs',
                },
            ],
        },
    ];
    // ---------- 渲染 ----------
    if (page === 'home') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [alerts.map((a, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `dsh-cau_alert ${a.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_alertDot" }), (0, jsx_runtime_1.jsx)("span", { children: a.text })] }, i))), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6309\u7EC4\u7BA1\u7406\u529F\u80FD\u4E0E\u51ED\u636E\uFF1A\u529F\u80FD\u5361\u53EF\u76F4\u63A5\u5F00\u5173\uFF0C\u51ED\u636E\u5361\uFF08\u6DE1\u5E95\uFF09\u8FDB\u5165\u7EF4\u62A4\uFF1B\u5173\u952E\u9879\u7F3A\u5931\u4F1A\u5728\u6B64\u63D0\u9192\u3002" }), cardGroups.map((g) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setGroup", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setGroupTitle", children: g.title }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_cards", children: g.cards.map((c) => ((0, jsx_runtime_1.jsxs)("div", { className: 'dsh-cau_setCard' + (c.alt ? ' dsh-cau_setCardAlt' : ''), role: "button", tabIndex: 0, onClick: () => setPage(c.page), onKeyDown: (e) => e.key === 'Enter' && setPage(c.page), children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_cardMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_cardName", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardIcon", children: (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: c.icon }) }), c.name, (0, jsx_runtime_1.jsx)("span", { className: `dsh-cau_cardBadge ${c.badge.cls}`, children: c.badge.text })] }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardDesc", children: c.desc })] }), c.key ? (0, jsx_runtime_1.jsx)(Toggle, { on: mods[c.key], onToggle: () => toggleMod(c.key), label: `切换 ${c.name}` }) : c.page === 'mail' ? (0, jsx_runtime_1.jsx)(Toggle, { on: mailCfg.enabled, onToggle: () => void doMailToggle(), label: "\u5207\u6362 \u6BCF\u65E5\u90AE\u4EF6\u62A5\u544A" }) : null] }, c.name))) })] }, g.title)))] }));
    }
    const pageAlerts = alerts.filter((a) => a.page === page);
    const otherCount = alerts.length - pageAlerts.length;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_set", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setPageHead", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setSubBack", onClick: () => setPage('home'), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "chevLeft" }), "\u8FD4\u56DE"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: page === 'ai' ? 'AI 加工 · 模型配置' : page === 'tokens' ? '令牌管理' : page === 'prefs' ? '面板偏好 · 引用协同' : page === 'follow' ? '待办提醒 · 关注' : page === 'cloud' ? '数据源' : page === 'mail' ? '每日邮件报告' : '统一门户 · 账号' }), otherCount > 0 && ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setOther", title: "\u8FD4\u56DE\u8BBE\u7F6E\u9996\u9875\u67E5\u770B\u5168\u90E8\u63D0\u9192", onClick: () => setPage('home'), children: ["\u26A0 \u53E6\u6709 ", otherCount, " \u9879\u95EE\u9898"] }))] }), pageAlerts.map((a, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `dsh-cau_alert ${a.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_alertDot" }), (0, jsx_runtime_1.jsx)("span", { children: a.text })] }, i))), page === 'ai' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u9009\u62E9" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u72EC\u7ACB\u914D\u7F6E\u69FD\uFF1A\u7528\u4E8E\u9762\u677F\u6309\u9700\u52A0\u5DE5\uFF08AI \u6458\u8981/\u5206\u7C7B/\u91CD\u8981\u5EA6/deadline\uFF09\u4E0E\u540E\u7EED\u76D1\u63A7\uFF0C\u4E0E\u4E3B\u5BF9\u8BDD\u6A21\u578B\u4E92\u4E0D\u5F71\u54CD\u3002\u6362\u6A21\u578B\u53EA\u5F71\u54CD\u4E4B\u540E\u7684\u52A0\u5DE5\uFF0C\u6570\u636E\u65E0\u9700\u91CD\u722C\u3002" }), !sessionId || !modelDirectories ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: !modelDirectories ? '模型目录服务不可用（按需加工将使用服务端默认模型）。' : '当前没有打开的会话——打开一个会话后即可从 DSH 模型目录中选择。' })) : modelState === 'loading' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u52A0\u8F7D\u4E2D\u2026" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'fail' ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: modelNote }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u91CD\u8BD5" })] })) : modelState === 'ok' && groups.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u6A21\u578B\u76EE\u5F55\u4E3A\u7A7A\uFF08\u68C0\u67E5 provider \u914D\u7F6E\u540E\u91CD\u8BD5\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u5237\u65B0" })] })) : modelState === 'ok' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selGroup?.id || '', onChange: (e) => { const g = groups.find((x) => x.id === e.target.value); if (g?.models?.length)
                                                    pickModel(g.id, g.models[0].id); }, children: groups.map((g) => ((0, jsx_runtime_1.jsx)("option", { value: g.id, children: g.name }, g.id))) }), selGroup?.models?.length ? ((0, jsx_runtime_1.jsx)("select", { className: "dsh-cau_setSelect", value: selModel?.id || selGroup.models[0].id, onChange: (e) => pickModel(selGroup.id, e.target.value), children: selGroup.models.map((m) => ((0, jsx_runtime_1.jsx)("option", { value: m.id, children: m.name || m.id }, m.id))) })) : null] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u5F53\u524D\uFF1A", monitor ? `${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）'] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: monitor ? `当前：${monitor.provider} / ${monitor.model}` : '未指定（按需加工使用服务端默认 deepseek-v4-flash）' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void loadModelDir(), children: "\u52A0\u8F7D\u6A21\u578B\u76EE\u5F55" })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6A21\u578B\u7528\u91CF \u00B7 \u67F1\u72B6\u56FE" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9ED8\u8BA4\u8FD1 30 \u5929\uFF1B\u65F6\u95F4\u8DE8\u5EA6\u4E0E\u6307\u6807\u53EF\u5207\u6362\uFF08\u4E91\u7AEF\u7BA1\u9053 + \u672C\u673A\u6309\u9700\u5408\u8BA1\uFF09\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: [7, 30, 90].map((d) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: 'dsh-cau_setChip' + (days === d ? ' on' : ''), onClick: () => setDays(d), children: [d, " \u5929"] }, d))) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_chips", children: ['calls', 'prompt', 'completion', 'cost'].map((m) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: 'dsh-cau_setChip' + (metric === m ? ' on' : ''), onClick: () => setMetric(m), children: METRIC_UNIT[m] }, m))) }), rows === null ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u52A0\u8F7D\u7528\u91CF\u4E2D\u2026" })) : daily.length === 0 || !daily.some((d) => d.value > 0) ? ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u8FD1 ", days, " \u5929\u6682\u65E0\u7528\u91CF\u8BB0\u5F55\uFF08AI \u52A0\u5DE5\u5C1A\u672A\u89E6\u53D1\u6216\u7528\u65F6\u4E0D\u8DB3\uFF09\u3002"] })) : ((0, jsx_runtime_1.jsx)(BarChart, { items: daily, unit: METRIC_UNIT[metric] })), byRole && Object.keys(byRole).length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("table", { className: "dsh-cau_usageTable", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "\u89D2\u8272" }), (0, jsx_runtime_1.jsx)("th", { children: "\u6B21\u6570" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u5165" }), (0, jsx_runtime_1.jsx)("th", { children: "\u8F93\u51FA" }), (0, jsx_runtime_1.jsx)("th", { children: "\u7F13\u5B58\u8BFB" }), (0, jsx_runtime_1.jsx)("th", { children: "\u91D1\u989D(\u5143)" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: Object.entries(byRole).map(([role, v]) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: ROLE_LABEL[role] || role }), (0, jsx_runtime_1.jsx)("td", { children: v.calls }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.prompt) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.completion) }), (0, jsx_runtime_1.jsx)("td", { children: fmtNum(v.cached) }), (0, jsx_runtime_1.jsx)("td", { children: v.cost ? v.cost.toFixed(4) : '—' })] }, role))) })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u91D1\u989D\u4EC5\u5BF9 DeepSeek \u9644\u5E26\u7684\u8BA1\u4EF7\u8C03\u7528\u663E\u793A\uFF1B\u300C\u5237\u65B0\u300D\u540E\u66F4\u65B0\u3002" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u6309\u9700\u8865\u6458\u8981" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setDesc", children: "\u6587\u7AE0\u9875\u5BF9\u672A\u52A0\u5DE5\u7684\u6587\u7AE0\u63D0\u4F9B\u300CAI \u8865\u6458\u8981\u300D\uFF1A\u8C03\u7528\u63D2\u4EF6\u670D\u52A1\u7AEF\u8DEF\u7531\uFF08DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\uFF09\uFF0C\u6D4F\u89C8\u5668\u4E0D\u5B58\u4EFB\u4F55 API key\uFF1B\u7ED3\u679C\u4EC5\u672C\u6B21\u4F1A\u8BDD\u5185\u663E\u793A\uFF0C\u4E0D\u56DE\u5199\u4E91\u7AEF\u3002" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: "\u89E6\u53D1\u4F4D\u7F6E\uFF1A\u6587\u7AE0\u9605\u8BFB\u9875\u6458\u8981\u533A\uFF08\u65E0 AI \u6458\u8981\u65F6\u51FA\u73B0\u6309\u94AE\uFF09\u3002\u7981\u7528\u672C\u6A21\u5757\u540E\u6309\u94AE\u9690\u85CF\u3002" })] })] })] })), page === 'tokens' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u4EE4\u724C\u767B\u8BB0" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u6BCF\u679A\u4EE4\u724C\u53EF\u9009\u542F\u7528/\u7981\u7528\uFF1B\u300C\u503C\u300D\u4EC5\u5B58\u672C\u673A\u6D4F\u89C8\u5668\uFF1B\u8FC7\u671F\u65E5\u671F\u7528\u4E8E\u5230\u671F\u63D0\u9192\uFF1B\u300C\u7BA1\u7406\u300D\u8DF3\u8F6C GitHub \u4EE4\u724C\u7BA1\u7406\u9875\u3002\u505C\u7528\u5168\u90E8\u4EE4\u724C = \u9762\u677F\u65E0\u6570\u636E\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokList", children: [tokens.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6682\u672A\u767B\u8BB0\u4EE4\u724C\u3002\u8BF7\u6DFB\u52A0 GitHub \u6570\u636E\u4EE4\u724C\uFF08\u7EC6\u7C92\u5EA6 PAT\uFF0CContents: Read\uFF0C\u79C1\u6709\u6570\u636E\u4ED3\uFF09\u3002" }), tokens.map((t) => {
                                    const eb = expiryBadge(t.expires);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tok", children: [(0, jsx_runtime_1.jsx)(Toggle, { on: t.enabled, onToggle: () => toggleTok(t.id), label: `${t.name} 启用` }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokName", children: [t.name, !t.enabled && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge off", children: "\u5DF2\u505C\u7528" }), !t.value && t.expires && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge warn", children: "\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokMeta", children: [t.usage && (0, jsx_runtime_1.jsx)("span", { children: t.usage }), t.expires && ((0, jsx_runtime_1.jsxs)("span", { className: eb.cls, children: ["\u8FC7\u671F ", t.expires, " \u00B7 ", eb.text] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokActs", children: [t.adminUrl && ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_tokBtn", href: t.adminUrl, target: "_blank", rel: "noreferrer", children: ["\u7BA1\u7406", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] })), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn", onClick: () => startEdit(t), children: "\u7F16\u8F91" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn danger", onClick: () => removeTok(t.id), children: "\u5220\u9664" })] })] }, t.id));
                                })] }), !tokEditing ? ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => startEdit(), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "plus" }), "\u6DFB\u52A0\u4EE4\u724C"] }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", style: { fontSize: 12 }, children: tokEditing && tokEditing !== 'new' ? '编辑令牌' : '添加令牌' }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u540D\u79F0\uFF08\u5982 GitHub \u6570\u636E\u4EE4\u724C\uFF09", value: tokDraft.name, onChange: (e) => setTokDraft({ ...tokDraft, name: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7528\u9014\u8BF4\u660E\uFF08\u5982 \u8BFB\u53D6\u4E91\u7AEF\u6570\u636E\uFF09", value: tokDraft.usage, onChange: (e) => setTokDraft({ ...tokDraft, usage: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setRow", children: (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", type: "password", placeholder: "\u4EE4\u724C\u503C\uFF08\u4EC5\u672C\u673A\uFF1B\u4EC5\u767B\u8BB0\u8FC7\u671F\u65E5\u7684\u53EF\u7559\u7A7A\uFF09", value: tokDraft.value, onChange: (e) => setTokDraft({ ...tokDraft, value: e.target.value }), spellCheck: false }) }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", style: { maxWidth: 170 }, type: "date", value: tokDraft.expires, onChange: (e) => setTokDraft({ ...tokDraft, expires: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u7BA1\u7406\u9875 URL\uFF08\u9ED8\u8BA4 GitHub \u4EE4\u724C\u9875\uFF09", value: tokDraft.adminUrl, onChange: (e) => setTokDraft({ ...tokDraft, adminUrl: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: !tokDraft.name.trim(), onClick: saveTokDraft, children: "\u4FDD\u5B58" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => setTokEditing(null), children: "\u53D6\u6D88" })] })] })), savedFlash && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: "\u5DF2\u4FDD\u5B58 \u2713" })] }) })), page === 'prefs' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9605\u8BFB\u4E0A\u4E0B\u6587\u5F15\u7528" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.autoAttach, onChange: (e) => upd({ ...settings, autoAttach: e.target.checked }) }), "\u6253\u5F00\u6587\u7AE0\u65F6\u81EA\u52A8\u9644\u52A0\u9605\u8BFB\u4E0A\u4E0B\u6587\uFF08\u53D1\u9001\u63D0\u95EE\u65F6\u4F5C\u4E3A\u5F15\u7528\u6750\u6599\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u6587\u7AE0\u9605\u8BFB\u9875\u70B9\u300C", (0, jsx_runtime_1.jsx)("b", { children: "\u5F15\u7528\u5230\u5BF9\u8BDD" }), "\u300D\u2192 \u6587\u7AE0\u4F5C\u4E3A\u4E0A\u4E0B\u6587\u5F15\u7528\u5230\u804A\u5929\u8F93\u5165\u6846\u4E0A\u65B9\uFF08chip\uFF09\uFF0C\u8349\u7A3F\u6CE8\u5165\u6807\u8BB0\u884C\uFF1B\u53D1\u9001\u540E\u81EA\u52A8\u89E3\u9664\u3002\u5173\u95ED\u672C\u6A21\u5757\uFF08\u5361\u7247\u5F00\u5173\uFF09\u540E\u5F15\u7528\u6309\u94AE\u4E0E\u4E0A\u4E0B\u6587\u6761\u9690\u85CF\u3002"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u9762\u677F\u56FA\u5B9A" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.panelPinned, onChange: (e) => upd({ ...settings, panelPinned: e.target.checked }) }), "\u56FA\u5B9A\u9762\u677F\uFF08\u70B9\u51FB\u5916\u90E8/Esc \u4E0D\u5173\u95ED\uFF0C\u4EC5 \u2715 \u5173\u95ED\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u4E0E\u9762\u677F\u5934\u90E8\u56FE\u9489\u662F\u540C\u4E00\u72B6\u6001\uFF1B\u5DF2\u6253\u5F00\u7684\u9762\u677F\u5728\u4E0B\u6B21\u6253\u5F00\u65F6\u751F\u6548\u3002" })] })] })), page === 'follow' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", style: { gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "clock" }), "\u5F85\u529E\u63D0\u9192 \u00B7 \u5173\u6CE8"] }), (0, jsx_runtime_1.jsx)(Toggle, { on: mods.deadline, onToggle: () => toggleMod('deadline'), label: "\u5207\u6362 \u5F85\u529E\u63D0\u9192 \u00B7 \u5173\u6CE8" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9996\u9875\u300C\u5F85\u529E\u5361\u300D\u5C55\u793A\u672A\u8FC7\u671F\u622A\u6B62\u4E8B\u9879\uFF08\u22647 \u5929\uFF09\uFF0C\u652F\u6301\u7559\u5B58/\u5F52\u6863\uFF1B\u5173\u6CE8\u65E0\u4E0A\u9650\uFF0C\u6587\u7AE0\u9875\u70B9\u661F\u6807\u52A0\u5165\u3002\u5173\u95ED\u672C\u6A21\u5757\u540E\u5F85\u529E\u5361\u4E0E\u5173\u6CE8\u5165\u53E3\u9690\u85CF\u3002" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "target" }), "\u5173\u6CE8\u89C4\u5219\uFF08\u5173\u952E\u8BCD/\u6765\u6E90\u8BA2\u9605\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u547D\u4E2D\u7684\u901A\u77E5\u5728\u9996\u9875\u300C\u4ECA\u65E5\u8981\u89C8\u300D\u6807\u51FA\u3001\u53EF\u89E6\u53D1\u7CFB\u7EDF\u901A\u77E5\uFF08\u4E0B\u65B9\u5F00\u5173\uFF09\u3002\u89C4\u5219\u4FDD\u5B58\u4E8E\u672C\u673A\u6D4F\u89C8\u5668\uFF1B\u5173\u952E\u793A\u4F8B\uFF1A\u63A8\u514D\u3001\u9009\u8BFE\u3001\u5956\u5B66\u91D1\u3001\u6210\u7EE9\u3001\u571F\u5730\u5B66\u9662\u3001\u6559\u52A1\u5904\u2026" }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokList", children: [rules.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6682\u65E0\u89C4\u5219\u3002\u6DFB\u52A0\u5173\u952E\u8BCD\u540E\u4F1A\u6807\u51FA\u6240\u6709\u6765\u6E90\u547D\u4E2D\u7684\u6761\u76EE\uFF08\u591A\u89C4\u5219\u53D6\u5E76\u96C6\uFF09\u3002" }), rules.map((r) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tok", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokMain", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokName", children: [r.keyword, !r.enabled && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cardBadge off", children: "\u5DF2\u505C\u7528" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_tokMeta", children: [r.source ? `来源含「${r.source}」` : '全部来源', r.minImportance ? ` · 重要度≥${r.minImportance === '高' ? '高' : '高/中'}` : ' · 不限重要度'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tokActs", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn", onClick: () => persistRules(rules.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x))), children: r.enabled ? '停用' : '启用' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tokBtn danger", onClick: () => persistRules(rules.filter((x) => x.id !== r.id)), children: "\u5220\u9664" })] })] }, r.id)))] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_infoCard", children: [(0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u5173\u952E\u8BCD\uFF08\u5FC5\u586B\uFF0C\u5982 \u63A8\u514D / \u9009\u8BFE / \u5956\u5B66\u91D1\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u5982\uFF1A\u63A8\u514D / \u9009\u8BFE / \u5956\u5B66\u91D1 / \u571F\u5730\u5B66\u9662", value: ruleDraft.keyword, onChange: (e) => setRuleDraft({ ...ruleDraft, keyword: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u6765\u6E90\u5305\u542B\uFF08\u53EF\u7A7A\uFF0C\u5982 \u6559\u52A1\u5904 / \u56E2\u59D4 / \u571F\u5730\uFF09" }), (0, jsx_runtime_1.jsx)("input", { className: "dsh-cau_setInput", placeholder: "\u53EF\u7A7A\uFF08\u5982 \u6559\u52A1\u5904 / \u56E2\u59D4 / \u571F\u5730\uFF09", value: ruleDraft.source, onChange: (e) => setRuleDraft({ ...ruleDraft, source: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_mineLabel", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u91CD\u8981\u5EA6\u4E0B\u9650\uFF08\u4E0D\u9650 / \u9AD8\u6216\u4E2D / \u53EA\u8981\u9AD8\uFF09" }), (0, jsx_runtime_1.jsxs)("select", { className: "dsh-cau_setSelect", value: ruleDraft.minImportance, onChange: (e) => setRuleDraft({ ...ruleDraft, minImportance: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "\u4E0D\u9650\u91CD\u8981\u5EA6" }), (0, jsx_runtime_1.jsx)("option", { value: "\u4E2D", children: "\u9AD8\u6216\u4E2D" }), (0, jsx_runtime_1.jsx)("option", { value: "\u9AD8", children: "\u53EA\u8981\u9AD8" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: !ruleDraft.keyword.trim(), onClick: addRule, children: "\u6DFB\u52A0\u89C4\u5219" }), rules.length > 0 && ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn danger", onClick: () => persistRules([]), children: "\u6E05\u7A7A\u5168\u90E8" }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "bell" }), "\u7CFB\u7EDF\u901A\u77E5\uFF08\u53EF\u9009\uFF09"] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u9875\u9762\u5F00\u7740\uFF08\u4E0D\u9650\u662F\u5426\u6253\u5F00\u9762\u677F\uFF09\u65F6\u6BCF 10 \u5206\u949F\u68C0\u67E5\uFF1A\u547D\u4E2D\u5173\u6CE8\u89C4\u5219\u6216\u65B0\u589E\u9AD8\u91CD\u8981\u901A\u77E5\u5373\u5F39\u7CFB\u7EDF\u901A\u77E5\u3002\u9996\u6B21\u9700\u70B9\u300C\u8BF7\u6C42\u901A\u77E5\u6388\u6743\u300D\u3002" }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!settings.notifyOn, onChange: (e) => upd({ ...settings, notifyOn: e.target.checked }) }), "\u542F\u7528\u7CFB\u7EDF\u901A\u77E5"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => {
                                            if (typeof Notification === 'undefined')
                                                return;
                                            Notification.requestPermission().then((p) => setNotifyStatus(p));
                                        }, children: "\u8BF7\u6C42\u901A\u77E5\u6388\u6743" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: notifyStatus === 'granted' ? '已授权 ✓' : notifyStatus === 'denied' ? '已被拒绝（需在浏览器站点设置中允许通知）' : notifyStatus === 'unsupported' ? '当前环境不支持通知' : '未授权' })] })] })] })), page === 'cloud' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", style: { gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "database" }), "\u6570\u636E\u6E90 \u00B7 GitHub \u4E91\u7AEF"] }), (0, jsx_runtime_1.jsx)(Toggle, { on: mods.cloud, onToggle: () => toggleMod('cloud'), label: "\u5207\u6362 \u6570\u636E\u6E90" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setDesc", children: ["\u6570\u636E\u5B58\u4E8E GitHub \u4ED3\u5E93\u7684 `data/`\uFF08\u6BCF 2 \u5C0F\u65F6\u6293\u53D6+AI \u52A0\u5DE5\u5E76\u63D0\u4EA4\uFF09\uFF1B\u9762\u677F\u4E0E MCP \u76F4\u63A5\u8BFB\u4E91\u7AEF\u3002\u9ED8\u8BA4\u6307\u5411 `ZBber-lab/cau-portal`\uFF1B\u81EA\u5EFA\u6570\u636E\u8005\u6539\u4E3A\u81EA\u5DF1\u7684\u4ED3\u5E93\u3002\u5173\u95ED\u672C\u5F00\u5173\u5C06\u5B8C\u5168\u505C\u6B62\u6570\u636E\u8BFB\u53D6\uFF08\u9876\u90E8\u7EA2\u6761\u63D0\u9192\uFF09\u3002", (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauDataRepo", children: "\u6570\u636E\u4ED3\u5E93\uFF08owner/repo\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauDataRepo", className: "dsh-cau_setInput", value: settings.dataRepo || '', onChange: (e) => upd({ ...settings, dataRepo: e.target.value }), placeholder: "\u5982 ZBber-lab/cau-portal\uFF08\u7559\u7A7A=\u9ED8\u8BA4\uFF09", spellCheck: false, autoComplete: "off" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: "\u6307\u5411\u542B `data/` \u4E0E\u722C\u866B\u4EA7\u7269\u7684\u4ED3\u5E93\uFF1B\u8BFB\u53D6/\u5199\u5165\u7528\u300C\u4EE4\u724C\u7BA1\u7406\u300D\u9875\u914D\u7F6E\u7684\u4EE4\u724C\u3002\u652F\u6301\u586B\u5B8C\u6574 GitHub \u94FE\u63A5\u3002" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: cloudState === 'loading', onClick: () => void checkCloud(), children: cloudState === 'loading' ? '检查中…' : '连通性检查' }), cloudState === 'ok' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: cloudMsg }), cloudState === 'fail' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: cloudMsg })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.slice(0, 3).map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] }, l.key))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", style: { gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", style: { margin: 0 }, children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "bank" }), "\u7EDF\u4E00\u95E8\u6237 \u00B7 \u6821\u5185\u901A\u77E5"] }), (0, jsx_runtime_1.jsx)(Toggle, { on: mods.portal, onToggle: () => toggleMod('portal'), label: "\u5207\u6362 \u7EDF\u4E00\u95E8\u6237" })] }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u95E8\u6237\u6570\u636E\u6765\u81EA\u7EDF\u4E00\u95E8\u6237\uFF08one.cau.edu.cn\uFF09\uFF0C\u9700\u767B\u5F55\u6821\u56ED\u7F51/SSO \u770B\u539F\u6587\uFF08\u8D26\u53F7\u5165\u53E3\u89C1\u9996\u9875\u300C\u7EDF\u4E00\u95E8\u6237 \u00B7 \u8D26\u53F7\u300D\uFF09\u3002\u5173\u95ED\u6B64\u5F00\u5173\u540E\uFF0C\u9762\u677F\u9690\u85CF\u95E8\u6237\u901A\u77E5\uFF08\u8981\u95FB / \u680F\u76EE / \u5F85\u529E / \u672A\u8BFB\u8BA1\u6570\uFF09\uFF1B\u5BF9\u8BDD\u67E5\u8BE2\u4E0D\u53D7\u5F71\u54CD\u3002\u9ED8\u8BA4\u5F00\u542F\u3002" })] })] })), page === 'mail' && ((0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setBlocks", children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setTitle", children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "mail" }), "\u6BCF\u65E5\u62A5\u544A\u90AE\u4EF6"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setDesc", children: ["\u6BCF\u5929 ", (0, jsx_runtime_1.jsx)("b", { children: mailCfg.sendTime }), " \u81EA\u52A8\u628A\u300C\u4ECA\u65E5\u9AD8\u91CD\u8981\u901A\u77E5 + 3 \u5929\u5185\u622A\u6B62 + \u547D\u4E2D\u5173\u6CE8\u89C4\u5219 + \u6628\u65E5\u56DE\u987E\u300D\u63A8\u9001\u5230\u4F60\u7684\u90AE\u7BB1\uFF1B\u82E5\u53D1\u9001\u65F6\u95F4\u5DF2\u8FC7\u624D\u5F00\u673A\uFF0C\u4F1A\u81EA\u52A8", (0, jsx_runtime_1.jsx)("b", { children: "\u8865\u53D1" }), "\u3002\u53D1\u4EF6\u4E0E\u6536\u4EF6\u53EF\u586B\u540C\u4E00\u4E2A\u90AE\u7BB1\uFF08\u81EA\u5DF1\u53D1\u7ED9\u81EA\u5DF1\uFF09\u3002\u6388\u6743\u7801\u53EA\u5B58\u672C\u673A\uFF08\u4ED3\u5E93\u5916\uFF09\uFF0C\u4E0D\u4F1A\u4E0A\u4F20\u6216\u663E\u793A\u5728\u65E5\u5FD7\u91CC\u3002"] }), (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailSender", children: "\u53D1\u4EF6\u90AE\u7BB1\uFF08\u5982 QQ \u53F7@qq.com\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailSender", className: "dsh-cau_setInput", value: mailCfg.sender, onChange: (e) => setMailCfg({ ...mailCfg, sender: e.target.value }), placeholder: "\u5982 [REDACTED-EMAIL]\uFF08QQ/163/Outlook/\u519C\u5927\u90AE\u7BB1\u5747\u53EF\uFF09", autoComplete: "off", spellCheck: false }), mailCfg.provider && (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setHint", children: ["\u5DF2\u8BC6\u522B\u670D\u52A1\u5546\uFF1A", mailCfg.provider, "\uFF08SMTP \u81EA\u52A8\u914D\u7F6E\uFF0C\u65E0\u9700\u624B\u586B\uFF09"] }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailCode", children: ["\u90AE\u7BB1\u6388\u6743\u7801 ", mailCfg.hasCode ? '（已保存；留空则不修改）' : ''] }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailCode", className: "dsh-cau_setInput", type: "password", value: mailCfg.authCode, onChange: (e) => setMailCfg({ ...mailCfg, authCode: e.target.value }), placeholder: mailCfg.hasCode ? '已保存授权码，留空保持不变' : 'QQ 邮箱：设置→账户→开启 SMTP→生成授权码', autoComplete: "new-password" }), (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailTo", children: "\u6536\u4EF6\u90AE\u7BB1\uFF08\u7559\u7A7A = \u53D1\u4EF6\u90AE\u7BB1\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailTo", className: "dsh-cau_setInput", value: mailCfg.recipient, onChange: (e) => setMailCfg({ ...mailCfg, recipient: e.target.value }), placeholder: "\u7559\u7A7A\u5219\u53D1\u7ED9\u81EA\u5DF1\uFF08\u4E0E\u53D1\u4EF6\u90AE\u7BB1\u76F8\u540C\uFF09", autoComplete: "off", spellCheck: false }), (0, jsx_runtime_1.jsx)("label", { className: "dsh-cau_setLabel", htmlFor: "cauMailTime", children: "\u53D1\u9001\u65F6\u95F4\uFF08\u672C\u673A\u65F6\u95F4\uFF0C\u9ED8\u8BA4 08:00\uFF09" }), (0, jsx_runtime_1.jsx)("input", { id: "cauMailTime", className: "dsh-cau_setInput", type: "time", value: mailCfg.sendTime, onChange: (e) => setMailCfg({ ...mailCfg, sendTime: e.target.value || '08:00' }) }), (0, jsx_runtime_1.jsxs)("label", { className: "dsh-cau_setCheck", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: mailCfg.enabled, onChange: (e) => setMailCfg({ ...mailCfg, enabled: e.target.checked }) }), "\u542F\u7528\u6BCF\u65E5\u90AE\u4EF6\u62A5\u544A\uFF08\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\uFF1A\u6B21\u65E5 ", mailCfg.sendTime || '08:00', " \u8D77\u81EA\u52A8\u53D1\u9001\uFF09"] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setRow", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", disabled: mailState === 'loading', onClick: () => void doMailSave(), children: mailState === 'loading' ? '保存中…' : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "check" }), "\u4FDD\u5B58\u914D\u7F6E"] })) }), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_setBtn", disabled: mailState === 'loading', onClick: () => void doMailTest(), children: [(0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "mail" }), "\u6D4B\u8BD5\u53D1\u9001"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_setBtn", onClick: () => void refreshMailInfo(), children: "\u5237\u65B0\u72B6\u6001" })] }), mailState === 'loading' && mailMsg && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setWarn", children: mailMsg }), mailState === 'ok' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setOk", children: mailMsg }), mailState === 'fail' && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setErr", children: mailMsg }), mailState === 'idle' && mailMsg && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_setHint", children: mailMsg }), mailLast && (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setHint", children: mailLast }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u5173\u6CE8\u89C4\u5219\u5DF2\u540C\u6B65 ", mailCfg.rulesCount, " \u6761\u7ED9\u62A5\u544A\uFF1B\u6539\u89C4\u5219\u540E\u81EA\u52A8\u66F4\u65B0\u3002\u627E\u4E0D\u5230\u90AE\u7BB1\u6388\u6743\u7801\uFF1F\u6700\u5E38\u7528\u8DEF\u5F84\u2014\u2014", (0, jsx_runtime_1.jsx)("b", { children: "QQ \u90AE\u7BB1" }), "\uFF1A\u7F51\u9875\u7248 \u2192 \u8BBE\u7F6E \u2192 \u8D26\u6237 \u2192 \u5F00\u542F\u300CSMTP \u670D\u52A1\u300D\u2192 \u6309\u63D0\u793A\u53D1\u77ED\u4FE1\u540E\u751F\u6210 16 \u4F4D\u6388\u6743\u7801\uFF08\u4E0D\u662F QQ \u5BC6\u7801\uFF09\u3002", (0, jsx_runtime_1.jsx)("b", { children: "163" }), "\uFF1A\u8BBE\u7F6E \u2192 POP3/SMTP/IMAP \u2192 \u5F00\u542F SMTP \u2192 \u5BA2\u6237\u7AEF\u6388\u6743\u5BC6\u7801\u3002"] }) })] }) })), page === 'security' && ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlocks", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u7EDF\u4E00\u95E8\u6237 \u00B7 \u8D26\u53F7" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_infoCard", style: { alignItems: 'center' }, children: (0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_setDesc", children: ["\u7531\u4E8E\u5B89\u5168\u8003\u91CF\uFF0C\u7EDF\u4E00\u95E8\u6237\u767B\u5F55\u529F\u80FD\u5728\u5F00\u6E90\u7248\u672C\u4E2D", (0, jsx_runtime_1.jsx)("b", { children: "\u4E0D\u53EF\u7528" }), "\u3002\u8BE5\u529F\u80FD\u6D89\u53CA\u8BBF\u95EE\u6821\u5185\u7CFB\u7EDF\u4E0E\u51ED\u636E\u5904\u7406\uFF0C\u4E3A\u907F\u514D\u8FDD\u53CD\u6821\u56ED\u4FE1\u606F\u7CFB\u7EDF\u4F7F\u7528\u89C4\u5B9A\uFF0C\u672A\u5305\u542B\u5728\u5F00\u6E90\u5DE5\u5177\u4E2D\u3002"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_setBlock", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setTitle", children: "\u5BC6\u94A5\u4E0E\u91CD\u8981\u94FE\u63A5" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_setDesc", children: "\u5E38\u7528\u9875\u9762\u4E00\u952E\u76F4\u8FBE\uFF1B\u4EE4\u724C\u8BE6\u60C5\u4E0E\u8FC7\u671F\u65E5\u5728\u300C\u4EE4\u724C\u7BA1\u7406\u300D\u9875\u7EF4\u62A4\u3002" }), (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_links", children: KEY_LINKS.map((l) => ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_link", href: l.url, target: "_blank", rel: "noreferrer", children: [l.label, (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] }, l.key))) })] })] }))] }));
}

return module.exports; })();
var ctx_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCtx = bindCtx;
exports.getCtx = getCtx;
/**
 * 跨组件树共享插件 ctx（面板树 ↔ 设置页 都要用会话服务与模型目录）。
 *
 * 注意：build.mjs 的内联器**不做模块去重**——同一个模块被两处 require 会内联成
 * 两份独立 IIFE，各自持有自己的模块级状态。因此这里不能用模块级变量存单例，
 * 必须挂到 window 上（全局、跨所有内联副本共享），否则 bindCtx/getCtx 会读错对象。
 */
function bindCtx(c) {
    ;
    window.__CAU_CTX__ = c;
}
function getCtx() {
    return window.__CAU_CTX__;
}

return module.exports; })();
var ctxbar_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTXBAR_CSS = void 0;
exports.CtxBar = CtxBar;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * 阶段6 双向协同 · 阅读上下文附加条（conversation.input.dock，会话级 list 槽）。
 * 面板打开文章时（bus.setAttached）自动在输入框上方显示「📄《标题》· 来源 ×」条，
 * 并按 autoAttach 设置在输入草稿注入标记行 `〔cau:article:<id>〕《标题》`，
 * 用户正常提问发送即可让 AI 经 mcp__cau__get_article 读全文作答；× 移除标记。
 */
const react_1 = require("react");
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
const MARKER_RE = /〔cau:article:[^〕]*〕[^\n]*\n?/g;
function markerOf(a) {
    return `〔cau:article:${a.id}〕《${a.title}》\n`;
}
/** 保底：上下文条渲染出错只显示提示，绝不拖垮整个应用 */
class CtxBarBoundary extends react_1.Component {
    state = { err: null };
    static getDerivedStateFromError(err) {
        return { err };
    }
    componentDidCatch(err) {
        console.error('[cau-portal ctxbar]', err);
    }
    render() {
        if (this.state.err) {
            return (0, jsx_runtime_1.jsxs)("div", { style: { padding: '6px 12px', fontSize: 12, color: '#e5484d' }, children: ["\u4E0A\u4E0B\u6587\u6761\u51FA\u9519\uFF1A", String(this.state.err?.message || this.state.err)] });
        }
        return this.props.children;
    }
}
exports.CTXBAR_CSS = `
.dsh-cau_ctxbarList{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance,16px) - var(--dsh-composer-side-clearance,16px));max-width:calc(var(--dsh-composer-card-max-width,780px) - var(--dsh-composer-dock-inset,8px) - var(--dsh-composer-dock-inset,8px));padding:0 var(--dsh-composer-dock-inset,8px);margin:0 auto 4px;min-width:0;display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px}
.dsh-cau_ctxbarStatus{flex:none;font-size:10px;color:var(--cau-ink3);opacity:.85;margin-right:2px}
.dsh-cau_ctxbar{display:flex;align-items:center;gap:6px;box-sizing:border-box;flex:0 1 auto;min-width:0;max-width:300px;padding:5px 8px 5px 7px;border:1px solid var(--cau-line);border-radius:999px;background:var(--dsw-specific-tip,rgba(255,255,255,.05));color:var(--cau-ink2)}
.dsh-cau_ctxbarEmblem{flex:none;display:flex;align-items:center;color:var(--cau-brand)}
.dsh-cau_ctxbarEmblem svg{display:block;height:16px;width:auto}
.dsh-cau_ctxbar .dsh-cau_cauLogo{font-size:12px}
.dsh-cau_ctxbarTitle{flex:0 1 auto;min-width:0;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--cau-ink)}
.dsh-cau_ctxbarX{flex:none;display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:50%;background:transparent;color:var(--cau-ink3);cursor:pointer;font-size:12px;line-height:1}
.dsh-cau_ctxbarX:hover{background:var(--cau-hover);color:var(--cau-ink)}
`;
function CtxBar(props) {
    const inputActions = props?.inputActions;
    const attached = (0, react_1.useSyncExternalStore)(bus_1.subscribeAttached, bus_1.getAttached);
    const [injected, setInjected] = (0, react_1.useState)(false);
    const [tip, setTip] = (0, react_1.useState)('');
    const draftRef = (0, react_1.useRef)(props?.input?.draft || '');
    (0, react_1.useEffect)(() => {
        draftRef.current = props?.input?.draft || '';
    });
    // 无引用时清空状态
    (0, react_1.useEffect)(() => {
        if ((attached || []).length === 0) {
            setInjected(false);
            setTip('');
        }
    }, [attached]);
    // 发送时自动附带引用标记（输入框平时干净；消息带上引用、AI 自动读取）
    (0, react_1.useEffect)(() => {
        if (!inputActions || typeof inputActions.submit !== 'function')
            return;
        const orig = inputActions.submit;
        inputActions.submit = () => {
            try {
                const items = (0, bus_1.getAttached)() || [];
                if (items.length) {
                    const draft = draftRef.current || '';
                    const cleaned = draft.replace(MARKER_RE, '');
                    const markers = items.map((a) => markerOf(a)).join('');
                    inputActions.setDraft(markers + cleaned);
                }
            }
            catch (e) {
                console.error('[cau-portal ctxbar] submit inject', e);
            }
            return orig();
        };
        return () => {
            inputActions.submit = orig;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputActions]);
    // 发问后自动解除：仅当草稿【从非空变为空】（消息已发出）才清掉全部引用
    const prevDraftRef = (0, react_1.useRef)(props?.input?.draft || '');
    (0, react_1.useEffect)(() => {
        const draft = props?.input?.draft || '';
        const prev = prevDraftRef.current;
        prevDraftRef.current = draft;
        if ((attached || []).length === 0)
            return;
        if (prev !== '' && draft === '') {
            try {
                if (inputActions)
                    inputActions.setDraft('');
            }
            catch (e) {
                console.error('[cau-portal ctxbar] post-send clear', e);
            }
            (0, bus_1.clearAttached)();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props?.input?.draft, attached, inputActions]);
    if (!attached || attached.length === 0)
        return null;
    const removeOne = (id) => {
        try {
            if (inputActions) {
                const draft = draftRef.current || '';
                inputActions.setDraft(draft.replace(new RegExp(`〔cau:article:${id}〕[^\\n]*\\n?`, 'g'), ''));
            }
        }
        catch (e) {
            console.error('[cau-portal ctxbar] remove', e);
        }
        (0, bus_1.removeAttached)(id);
    };
    return ((0, jsx_runtime_1.jsx)(CtxBarBoundary, { children: (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ctxbarList", children: [(0, jsx_runtime_1.jsxs)("span", { className: "dsh-cau_ctxbarStatus", children: [(attached || []).length, " \u7BC7\u5F15\u7528 \u00B7 \u53D1\u9001\u65F6\u9644\u5E26"] }), (attached || []).map((it) => ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_ctxbar", children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_ctxbarEmblem dsh-cau_cauLogo", children: "CAU" }), (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_ctxbarTitle", title: it.title, children: it.title }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_ctxbarX", "aria-label": "\u79FB\u9664\u5F15\u7528", onClick: () => removeOne(it.id), children: "\u00D7" })] }, it.id)))] }) }));
}

return module.exports; })();
var toolview_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOLVIEW_CSS = void 0;
exports.ToolCard = ToolCard;
exports.registerToolViews = registerToolViews;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * 阶段6 双向协同 · 工具结果新闻卡片（tool.call.toolview，键控槽，key=mcp__cau__*）。
 * AI 调用 mcp__cau__* 工具后，结果渲染为新闻卡片（标题/摘要/重要度），
 * 内置「在面板中打开」（bus.requestOpenArticle）+「查看原文」（新标签）按钮，而非裸 JSON。
 * 未注册的 key 回落通用行；我们只接管自己的工具名。
 */
const react_1 = require("react");
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
var icons_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic = Ic;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * UI 批②：统一线性 SVG 图标集（替代 emoji）。
 * 1.5px 描边 / 圆角端点 / 24 视窗；颜色一律 currentColor（随上下文 token）。
 * 少数实心图标（starFill/pinFill/target 中心点）用 fill。
 * 用法：<Ic n="star" />，尺寸由 CSS 控制（父级 font/上下文），也可传 size。
 * 注意：图标一律写成函数（() => JSX），避免模块顶层执行 jsx()（sim-load 桩只打组件不渲染）。
 */
const ICONS = {
    // ---- 导航 / 头部 ----
    close: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 6l12 12" }), (0, jsx_runtime_1.jsx)("path", { d: "M18 6L6 18" })] })),
    chevLeft: () => (0, jsx_runtime_1.jsx)("path", { d: "M14.5 5.5L8 12l6.5 6.5" }),
    chevRight: () => (0, jsx_runtime_1.jsx)("path", { d: "M9.5 5.5L16 12l-6.5 6.5" }),
    gear: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "3" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    sliders: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 6.5h9M17.5 6.5H20M4 12h5M11 12h9M4 17.5h12.5M18.5 17.5H20" }), (0, jsx_runtime_1.jsx)("circle", { cx: "15", cy: "6.5", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9", cy: "12", r: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "16.5", cy: "17.5", r: "2" })] })),
    refresh: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }), (0, jsx_runtime_1.jsx)("path", { d: "M21 3v5h-5" })] })),
    undo: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M8.5 5.5L4 10l4.5 4.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 10h10.5a5.5 5.5 0 0 1 0 11H11" })] })),
    // ---- 分区 / 功能 ----
    sparkle: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.5l2 5.9 5.9 2-5.9 2-2 5.9-2-5.9-5.9-2 5.9-2z" }),
    flame: () => ((0, jsx_runtime_1.jsx)("path", { d: "M12 21c4 0 6.5-2.6 6.5-6.2 0-2.6-1.5-4.6-3-6.3-.4 1-1 1.8-2 2.4.2-2.7-1-5.6-3.5-7.4.2 3-1 4.1-2.3 5.6C6.3 10.6 5.5 12 5.5 14.8 5.5 18.4 8 21 12 21z" })),
    star: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    starFill: () => (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M12 3.3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.4 2.85 1.03-6L3.3 9.7l6-.9z" }),
    bookmark: () => (0, jsx_runtime_1.jsx)("path", { d: "M6.5 3.5h11a1 1 0 0 1 1 1V20.5l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" }),
    books: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M5 4h3.5v16H5a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 5 4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 4h4v16h-4z" }), (0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.6l3.8 1-3.6 14.9-3.8-1z" })] })),
    link: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M10 13.5a4.2 4.2 0 0 0 6 .5l2.8-2.8a4.24 4.24 0 0 0-6-6L11.3 6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M14 10.5a4.2 4.2 0 0 0-6-.5l-2.8 2.8a4.24 4.24 0 0 0 6 6l1.5-1.5" })] })),
    news: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "4.5", width: "16", height: "15", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M7.5 8.5h9M7.5 12h9M7.5 15.5h5.5" })] })),
    bank: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M3.2 9L12 3.8 20.8 9" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 9.2h15" }), (0, jsx_runtime_1.jsx)("path", { d: "M6.5 9.2v7.5M10.2 9.2v7.5M13.8 9.2v7.5M17.5 9.2v7.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.5 16.7h15M3.5 20.2h17" })] })),
    // ---- 对象 / 动作 ----
    calendar: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4.8", width: "17", height: "15.7", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M3.5 9.8h17M8 3v3.6M16 3v3.6" })] })),
    clipboard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "1.8" }), (0, jsx_runtime_1.jsx)("rect", { x: "8.5", y: "2.8", width: "7", height: "3.2", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.8 11h6.4M8.8 15h4.4" })] })),
    clock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7.2V12l3.3 2" })] })),
    target: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8.3" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "4.4" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "1.1", fill: "currentColor", stroke: "none" })] })),
    archive: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.5", y: "4", width: "17", height: "4.5", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 12.5h4" })] })),
    inbox: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M4 13l2.2-8h11.6L20 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 13h5l1.6 2.5h2.8L15 13h5" })] })),
    doc: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M7 3.5h6.5L18.5 8.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M13 3.5V9h5.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M8.5 13h7M8.5 16.2h4.5" })] })),
    note: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M6 3.5h12A1.5 1.5 0 0 1 19.5 5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 8.5h8M8 12.5h8M8 16.5h5" })] })),
    bell: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M18.5 9.3a6.5 6.5 0 1 0-13 0c0 5.5-2.3 6.7-2.3 6.7h17.6s-2.3-1.2-2.3-6.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.2 20a2 2 0 0 0 3.6 0" })] })),
    edit: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M14.8 4.8l4.4 4.4L8 20.4H3.6V16z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12.6 7l4.4 4.4" })] })),
    ext: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M13.5 4.5H19.5V10.5" }), (0, jsx_runtime_1.jsx)("path", { d: "M19.5 4.5L11 13" }), (0, jsx_runtime_1.jsx)("path", { d: "M19 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6.5A1.5 1.5 0 0 1 6 5h3.5" })] })),
    search: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "11", cy: "11", r: "6.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M20.2 20.2L15.6 15.6" })] })),
    plus: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }),
    check: () => (0, jsx_runtime_1.jsx)("path", { d: "M4.5 12.5l5 5L19.5 7" }),
    key: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: "7.8", cy: "15.8", r: "4.3" }), (0, jsx_runtime_1.jsx)("path", { d: "M11 12.7L20.3 3.4M16.5 7.2l3 3M13.8 9.9l2.2 2.2" })] })),
    mail: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3.2", y: "5", width: "17.6", height: "14", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M4 7.2l8 5.8 8-5.8" })] })),
    shield: () => (0, jsx_runtime_1.jsx)("path", { d: "M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8z" }),
    lock: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "10.5", width: "14", height: "9.5", rx: "1.8" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 10.5V7.5a4 4 0 0 1 8 0v3" })] })),
    database: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("ellipse", { cx: "12", cy: "5.6", rx: "7.3", ry: "2.7" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 5.6v12.8c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7V5.6" }), (0, jsx_runtime_1.jsx)("path", { d: "M4.7 12c0 1.5 3.3 2.7 7.3 2.7s7.3-1.2 7.3-2.7" })] })),
    chart: () => (0, jsx_runtime_1.jsx)("path", { d: "M18 20V9.5M12 20V4M6 20v-5.5" }),
    robot: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "5", y: "8", width: "14", height: "10.5", rx: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 8V4.6" }), (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "3.7", r: "1" }), (0, jsx_runtime_1.jsx)("circle", { cx: "9.3", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("circle", { cx: "14.7", cy: "12.5", r: ".9", fill: "currentColor", stroke: "none" }), (0, jsx_runtime_1.jsx)("path", { d: "M9.5 15.8h5M3.5 11v4M20.5 11v4" })] })),
    chat: () => (0, jsx_runtime_1.jsx)("path", { d: "M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.6A8.5 8.5 0 1 1 20.5 12z" }),
    idCard: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), (0, jsx_runtime_1.jsx)("circle", { cx: "8.5", cy: "11", r: "2" }), (0, jsx_runtime_1.jsx)("path", { d: "M5.8 16.5c.5-1.8 1.5-2.7 2.7-2.7s2.2.9 2.7 2.7M14 9.5h5M14 13h5" })] })),
    bookOpen: () => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 6.5C10.5 5 8.3 4.5 4.5 4.5v13c3.8 0 6 .5 7.5 2 1.5-1.5 3.7-2 7.5-2v-13c-3.8 0-6 .5-7.5 2z" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6.5v13" })] })),
    pinFill: () => ((0, jsx_runtime_1.jsx)("path", { fill: "currentColor", stroke: "none", d: "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" })),
};
function Ic(props) {
    const s = props.size || 16;
    const g = ICONS[props.n];
    return ((0, jsx_runtime_1.jsx)("svg", { className: props.className, width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: g ? g() : null }));
}

return module.exports; })();
exports.TOOLVIEW_CSS = `
.dsh-cau_tvWrap{display:flex;flex-direction:column;gap:8px;width:100%}
.dsh-cau_tvCard{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--cau-line-soft);border-radius:12px;background:var(--dsw-specific-tip,rgba(255,255,255,.03))}
.dsh-cau_tvTitle{font-size:13px;line-height:18px;font-weight:500;color:var(--cau-ink);cursor:pointer;word-break:break-word}
.dsh-cau_tvTitle:hover{color:var(--cau-brand)}
.dsh-cau_tvMeta{font-size:11px;color:var(--cau-ink3)}
.dsh-cau_tvSum{font-size:12px;line-height:17px;color:var(--cau-ink2);word-break:break-word}
.dsh-cau_tvActions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsh-cau_tvBtn{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border:1px solid var(--cau-line);border-radius:8px;background:transparent;color:var(--cau-ink);font-size:11px;cursor:pointer;text-decoration:none}
.dsh-cau_tvBtn:hover{border-color:var(--cau-brand-a35);color:var(--cau-brand);background:var(--cau-brand-a6)}
.dsh-cau_tvBtn svg{width:11px;height:11px}
.dsh-cau_tvBtnPrimary{background:var(--cau-brand);border-color:transparent;color:#fff}
.dsh-cau_tvBtnPrimary:hover{background:var(--cau-brand);color:#fff;opacity:.9}
.dsh-cau_tvImp{display:inline-flex;align-items:center;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:500}
.dsh-cau_tvImp-high{background:color-mix(in srgb,var(--cau-err) 15%,transparent);color:var(--cau-err)}
.dsh-cau_tvImp-mid{background:color-mix(in srgb,var(--cau-warn) 15%,transparent);color:var(--cau-warn)}
.dsh-cau_tvImp-low{background:var(--cau-fill);color:var(--cau-ink3)}
`;
function tryJson(t) {
    const s = String(t).trim();
    if (!s)
        return null;
    // 尝试剥掉可能的 ```json 围栏
    const clean = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    try {
        return JSON.parse(clean);
    }
    catch {
        return null;
    }
}
function parseBlock(block) {
    if (!block)
        return null;
    const res = block?.result ?? block;
    if (res && typeof res === 'object') {
        const content = res.content;
        if (Array.isArray(content)) {
            const text = content.filter((c) => c?.type === 'text').map((c) => c.text).join('');
            const j = text ? tryJson(text) : null;
            if (j)
                return j;
            return { __raw: text };
        }
        if (typeof res.text === 'string') {
            const j = tryJson(res.text);
            if (j)
                return j;
        }
        return res;
    }
    if (typeof res === 'string') {
        const j = tryJson(res);
        if (j)
            return j;
        return { __raw: res };
    }
    return null;
}
function cardItems(parsed) {
    if (Array.isArray(parsed?.items) && parsed.items.length)
        return parsed.items;
    if (Array.isArray(parsed))
        return parsed;
    if (parsed && parsed.title)
        return [parsed];
    return [];
}
function itemId(it) {
    return it.article_id || it.id || it.article_url || it.url || '';
}
function itemUrl(it) {
    return it.article_url || it.url || '';
}
function impClass(v) {
    if (v === '高')
        return 'dsh-cau_tvImp-high';
    if (v === '中')
        return 'dsh-cau_tvImp-mid';
    return 'dsh-cau_tvImp-low';
}
function Card({ it }) {
    const id = itemId(it);
    const title = it.title || it.name || it.item || '(无标题)';
    const meta = [it.date || it.time || '', it.source_name || it.site_name || it.column_name || it.source || ''].filter(Boolean).join(' · ');
    const sum = it.ai?.summary || it.summary || '';
    const imp = it.ai?.importance || it.importance || '';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvCard", children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvTitle", onClick: () => id && (0, bus_1.requestOpenArticle)(id), children: title }), (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvMeta", children: [meta, imp ? (0, jsx_runtime_1.jsx)("span", { className: 'dsh-cau_tvImp ' + impClass(imp), style: { marginLeft: 6 }, children: imp }) : null] }), sum ? (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvSum", children: sum }) : null, (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvActions", children: [id ? ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "dsh-cau_tvBtn dsh-cau_tvBtnPrimary", onClick: () => (0, bus_1.requestOpenArticle)(id), children: "\u5728\u9762\u677F\u4E2D\u6253\u5F00" })) : null, itemUrl(it) ? ((0, jsx_runtime_1.jsxs)("a", { className: "dsh-cau_tvBtn", href: itemUrl(it), target: "_blank", rel: "noreferrer", children: ["\u67E5\u770B\u539F\u6587", (0, jsx_runtime_1.jsx)(icons_1.Ic, { n: "ext" })] })) : null] })] }));
}
function ToolCard(props) {
    const { toolName, block } = props;
    const parsed = (0, react_1.useMemo)(() => parseBlock(block), [block]);
    if (!parsed) {
        return (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvWrap", children: "\uFF08\u5DE5\u5177\u7ED3\u679C\u672A\u89E3\u6790\uFF09" });
    }
    const items = cardItems(parsed);
    if (items.length === 0) {
        return (0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_tvWrap", children: parsed.__raw ? (0, jsx_runtime_1.jsx)("pre", { className: "dsh-cau_tvSum", children: parsed.__raw }) : (0, jsx_runtime_1.jsx)("pre", { className: "dsh-cau_tvSum", children: JSON.stringify(parsed, null, 2) }) });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvWrap", children: [items.slice(0, 5).map((it, i) => ((0, jsx_runtime_1.jsx)(Card, { it: it }, itemId(it) || i))), items.length > 5 ? (0, jsx_runtime_1.jsxs)("div", { className: "dsh-cau_tvMeta", children: ["\u2026\u5171 ", items.length, " \u6761\uFF0C\u5176\u4F59\u5728\u9762\u677F\u4E2D\u6D4F\u89C8"] }) : null] }));
}
/** 只接管「新闻条目形」结果（标题/摘要/重要度）的工具；用量、站点目录等非新闻形结果交还 DSH 默认渲染 */
const TOOL_KEYS = [
    'mcp__cau__get_article',
    'mcp__cau__search_news',
    'mcp__cau__list_latest',
    'mcp__cau__list_deadlines',
];
function registerToolViews(ctx) {
    for (const k of TOOL_KEYS) {
        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key: k }, ToolCard), 'cau-portal: toolview ' + k);
    }
}

return module.exports; })();
var bus_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * 跨组件树命令/上下文总线（阶段6 双向协同）。
 * 面板树（CauPanel）↔ 聊天区槽（对话输入 dock / 工具结果 toolview）之间共享两件事：
 *  1) 阅读上下文引用：面板文章页「引用到对话」追加一篇文章 → 聊天输入框上方显示多个引用 chip。
 *  2) 「在面板中打开」：toolview 卡片点按钮 → 面板跳到对应文章。
 * 支持一次引用多篇（数组）。注意：build.mjs 内联器不做模块去重，状态+订户集合必须挂 window
 *（跨所有内联副本共享），否则面板发信号、dock 组件（不同副本）收不到。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttached = getAttached;
exports.addAttached = addAttached;
exports.removeAttached = removeAttached;
exports.hasAttached = hasAttached;
exports.clearAttached = clearAttached;
exports.subscribeAttached = subscribeAttached;
exports.getOpenRequest = getOpenRequest;
exports.requestOpenArticle = requestOpenArticle;
exports.clearOpenRequest = clearOpenRequest;
exports.subscribeBus = subscribeBus;
function ref() {
    let r = window.__CAU_CTXBAR__;
    // 兼容旧版/热更新残留的过期状态形状（attached 曾为 null），读到怀疑形状就重置为新数组结构
    if (!r || !Array.isArray(r.attached) || typeof r.open !== 'object' || !(r.subs instanceof Set)) {
        r = { attached: [], open: null, subs: new Set() };
        window.__CAU_CTXBAR__ = r;
    }
    return r;
}
function emit() {
    for (const fn of [...ref().subs]) {
        try {
            fn();
        }
        catch (e) {
            console.error('[cau-portal bus]', e);
        }
    }
}
function getAttached() {
    return ref().attached;
}
/** 追加一篇引用；若已存在则返回 false */
function addAttached(item) {
    const r = ref();
    if (r.attached.some((a) => a.id === item.id))
        return false;
    r.attached = [...r.attached, item];
    emit();
    return true;
}
/** 移除一篇引用；返回是否移除 */
function removeAttached(id) {
    const r = ref();
    const before = r.attached.length;
    r.attached = r.attached.filter((a) => a.id !== id);
    const removed = r.attached.length !== before;
    if (removed)
        emit();
    return removed;
}
function hasAttached(id) {
    return ref().attached.some((a) => a.id === id);
}
/** 清空全部引用 */
function clearAttached() {
    const r = ref();
    if (r.attached.length) {
        r.attached = [];
        emit();
    }
}
function subscribeAttached(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}
function getOpenRequest() {
    return ref().open;
}
function requestOpenArticle(id) {
    const r = ref();
    r.open = { seq: (r.open?.seq ?? 0) + 1, id };
    emit();
}
function clearOpenRequest() {
    ref().open = null;
    emit();
}
function subscribeBus(fn) {
    ref().subs.add(fn);
    return () => ref().subs.delete(fn);
}

return module.exports; })();
var data_1 = (function(){ var module={exports:{}}; var exports=module.exports;
"use strict";
/**
 * cau-portal 客户端数据层（阶段4 第3步）：
 * - localStorage 设置（键约定 dsh.cau-portal.*；githubToken 仅存本机）
 * - GitHub Contents API 读取 data/ 下文件（直连优先，服务端 /api/cau/data 代理兜底）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODULES = void 0;
exports.dataRepo = dataRepo;
exports.loadSettings = loadSettings;
exports.saveSettings = saveSettings;
exports.readCloudText = readCloudText;
exports.readCloudJson = readCloudJson;
exports.loadPrunedSet = loadPrunedSet;
exports.isPruned = isPruned;
exports.queuePruneRequest = queuePruneRequest;
exports.loadModules = loadModules;
exports.saveModules = saveModules;
exports.loadTokens = loadTokens;
exports.saveTokens = saveTokens;
exports.activeTokenValues = activeTokenValues;
exports.loadReadSet = loadReadSet;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.loadFollow = loadFollow;
exports.saveFollow = saveFollow;
exports.toggleFollow = toggleFollow;
exports.isFollowed = isFollowed;
exports.loadFollowCacheAll = loadFollowCacheAll;
exports.cacheFollowArticle = cacheFollowArticle;
exports.readFollowCache = readFollowCache;
exports.daysLeft = daysLeft;
exports.loadDeadlineOps = loadDeadlineOps;
exports.setDeadlineOp = setDeadlineOp;
exports.loadMine = loadMine;
exports.migrateMineFromPin = migrateMineFromPin;
exports.isMine = isMine;
exports.addMine = addMine;
exports.addCustomMine = addCustomMine;
exports.updateMine = updateMine;
exports.removeMine = removeMine;
exports.setMineDeadline = setMineDeadline;
exports.mineDeadlineOf = mineDeadlineOf;
exports.readArticle = readArticle;
exports.readArticleMeta = readArticleMeta;
exports.readFeed = readFeed;
exports.loadUsageLog = loadUsageLog;
exports.appendUsageLog = appendUsageLog;
exports.summarizeUsage = summarizeUsage;
exports.loadUsageRows = loadUsageRows;
exports.buildDailyUsage = buildDailyUsage;
exports.computeAlerts = computeAlerts;
exports.enrichArticle = enrichArticle;
exports.loadRules = loadRules;
exports.saveRules = saveRules;
exports.newRuleId = newRuleId;
exports.matchRules = matchRules;
exports.loadNotifySeen = loadNotifySeen;
exports.saveNotifySeen = saveNotifySeen;
exports.computeNewAlerts = computeNewAlerts;
const SETTINGS_KEY = 'dsh.cau-portal.settings.v1';
const DEFAULT_DATA_REPO = 'ZBber-lab/cau-portal';
const GH_BRANCH = 'main';
/** 当前数据仓库（owner/repo）：设置页可配，空=默认仓；兼容粘贴完整 URL / .git 后缀 */
function dataRepo() {
    try {
        const r = String(loadSettings().dataRepo || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        if (r && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r))
            return r;
    }
    catch {
        /* 忽略 */
    }
    return DEFAULT_DATA_REPO;
}
function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
async function ghFetchText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.raw',
            'User-Agent': 'cau-portal-panel',
        },
    });
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    return res.text();
}
async function serverProxyText(rel, token) {
    const res = await fetch('/api/cau/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rel, token, repo: dataRepo() }),
    });
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        /* fallthrough */
    }
    if (!res.ok || !data?.ok)
        throw new Error(data?.error || `proxy ${res.status}`);
    return data.text;
}
/** 读取 data/ 下相对子路径的文本；未配置令牌时抛错。
 * 多令牌故障转移：依次尝试启用的令牌，仅鉴权类错误（401/403）换下一枚；
 * 404（文件不存在）等非鉴权错误不换令牌；全部失败后走服务端代理兜底。 */
async function readCloudText(rel, token) {
    if (!loadModules().cloud)
        throw new Error('数据源已在设置中禁用');
    const tokens = (token ? [token] : activeTokenValues()).filter(Boolean);
    if (!tokens.length)
        throw new Error('未配置 GitHub 只读令牌');
    let lastErr = null;
    for (const t of tokens) {
        try {
            return await ghFetchText(rel, t);
        }
        catch (e) {
            lastErr = e;
            const m = String(e?.message || e);
            if (!/(401|403|Bad credentials|Unauthorized)/i.test(m))
                break;
        }
    }
    try {
        return await serverProxyText(rel, tokens[0]);
    }
    catch (e) {
        throw lastErr || e;
    }
}
async function readCloudJson(rel, token) {
    try {
        return JSON.parse(await readCloudText(rel, token));
    }
    catch {
        return null;
    }
}
const PRUNE_REQUEST_REL = 'data/prune-request.json';
const PRUNED_KEY = 'dsh.cau-portal.pruned.v1';
/** 读取 GitHub 文件元信息（sha + 解码文本）；文件不存在返回空 */
async function ghFetchShaAndText(rel, token) {
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}?ref=${GH_BRANCH}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cau-portal-panel' },
    });
    if (res.status === 404)
        return { sha: '', text: '' };
    if (!res.ok)
        throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    let text = '';
    try {
        text = decodeURIComponent(escape(atob(String(j.content || ''))));
    }
    catch { /* base64 解码失败：忽略 */ }
    return { sha: String(j.sha || ''), text };
}
/** 写 GitHub 文件（Contents API PUT；存在时带 sha 防覆盖） */
async function ghPutText(rel, token, content, sha) {
    const body = {
        message: 'data: prune request (panel)',
        content: btoa(unescape(encodeURIComponent(content))),
        branch: GH_BRANCH,
    };
    if (sha)
        body.sha = sha;
    const res = await fetch(`https://api.github.com/repos/${dataRepo()}/contents/${rel}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'cau-portal-panel',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok)
        throw new Error(`GitHub write ${res.status}`);
}
/** 本机「已删除」集合（删除后立即隐藏；键 dsh.cau-portal.pruned.v1） */
function loadPrunedSet() {
    try {
        const v = JSON.parse(localStorage.getItem(PRUNED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function savePrunedSet(ids) {
    try {
        localStorage.setItem(PRUNED_KEY, JSON.stringify(ids.slice(-5000)));
    }
    catch {
        /* 静默 */
    }
}
/** 该条目是否已被删除（本地软过滤用；id 为文章 base 或 URL） */
function isPruned(id) {
    return loadPrunedSet().includes(id);
}
/**
 * 提交删除请求：条目 id（文章文件名 xxxx.json 或 URL）写入云端清单（合并去重），
 * 并记入本机已删集合。云端将在下轮抓取（≤2 小时）真正删除。
 */
async function queuePruneRequest(newIds, token) {
    const t = token || activeTokenValues()[0];
    if (!t)
        return { ok: false, total: 0, error: '未配置 GitHub 令牌' };
    const clean = (newIds || []).filter((x) => typeof x === 'string' && x);
    if (!clean.length)
        return { ok: false, total: 0, error: '未选择要删除的数据' };
    try {
        const meta = await ghFetchShaAndText(PRUNE_REQUEST_REL, t);
        let prev = [];
        try {
            const p = JSON.parse(meta.text);
            if (Array.isArray(p?.ids))
                prev = p.ids.filter((x) => typeof x === 'string');
        }
        catch { /* 旧/坏清单按空处理 */ }
        const merged = [...new Set([...prev, ...clean])];
        await ghPutText(PRUNE_REQUEST_REL, t, JSON.stringify({ version: 1, requested_at: new Date().toISOString(), ids: merged }, null, 2), meta.sha);
        savePrunedSet([...new Set([...loadPrunedSet(), ...clean])]);
        return { ok: true, total: merged.length };
    }
    catch (e) {
        return { ok: false, total: 0, error: String(e?.message || e) };
    }
}
const MODULES_KEY = 'dsh.cau-portal.modules.v1';
exports.DEFAULT_MODULES = {
    ai: true,
    context: true,
    deadline: true,
    cloud: true,
    portal: true,
};
function loadModules() {
    try {
        const v = JSON.parse(localStorage.getItem(MODULES_KEY) || '{}');
        return { ...exports.DEFAULT_MODULES, ...(v && typeof v === 'object' ? v : {}) };
    }
    catch {
        return { ...exports.DEFAULT_MODULES };
    }
}
function saveModules(m) {
    try {
        localStorage.setItem(MODULES_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
const TOKENS_KEY = 'dsh.cau-portal.tokens.v1';
function loadTokens() {
    try {
        const v = JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
        if (Array.isArray(v))
            return v.filter((x) => x && typeof x.id === 'string');
    }
    catch {
        /* fallthrough */
    }
    // 旧版迁移（展示层读取，不主动重写存储）
    const s = loadSettings();
    const legacy = [];
    if (s.githubToken)
        legacy.push({ id: 'github-read', name: 'GitHub 数据令牌', usage: '读取云端数据（面板/MCP）', value: s.githubToken, expires: s.keyExpiries?.github || '', adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.bridge)
        legacy.push({ id: 'bridge', name: '调度桥令牌', usage: 'cron-job.org 触发 Actions（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.bridge, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    if (s.keyExpiries?.push)
        legacy.push({ id: 'push', name: '推送令牌（临时）', usage: '本地推送脚本用（登记过期日，值不在本机）', value: '', expires: s.keyExpiries.push, adminUrl: 'https://github.com/settings/personal-access-tokens', enabled: true });
    return legacy;
}
function saveTokens(list) {
    try {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 启用的、有值的令牌值集合 */
function activeTokenValues() {
    return loadTokens()
        .filter((t) => t.enabled && t.value)
        .map((t) => t.value);
}
// ---- 已读状态（localStorage；键 dsh.cau-portal.read.v1，存文章 id 数组）----
const READ_KEY = 'dsh.cau-portal.read.v1';
function loadReadSet() {
    try {
        const v = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveReadSet(ids) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }
    catch {
        /* 隐私模式等写入失败时静默 */
    }
}
/** 标记单条已读；返回最新已读集合 */
function markRead(id) {
    const cur = loadReadSet();
    if (!id || cur.includes(id))
        return cur;
    const next = [...cur, id];
    saveReadSet(next);
    return next;
}
/** 批量标记已读；返回最新已读集合 */
function markAllRead(ids) {
    const cur = loadReadSet();
    const next = [...cur];
    for (const id of ids)
        if (id && !next.includes(id))
            next.push(id);
    saveReadSet(next);
    return next;
}
const FOLLOW_KEY = 'dsh.cau-portal.follow.v1';
function loadFollow() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveFollow(list) {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    }
    catch {
        /* 静默 */
    }
}
/** 加入/取消关注；返回最新关注列表 */
function toggleFollow(item) {
    const cur = loadFollow();
    const idx = cur.findIndex((x) => x.id === item.id);
    let next;
    if (idx >= 0)
        next = [...cur.slice(0, idx), ...cur.slice(idx + 1)];
    else
        next = [item, ...cur];
    saveFollow(next);
    return next;
}
function isFollowed(id) {
    return loadFollow().some((x) => x.id === id);
}
const FOLLOW_CACHE_KEY = 'dsh.cau-portal.followcache.v1';
function loadFollowCacheAll() {
    try {
        const v = JSON.parse(localStorage.getItem(FOLLOW_CACHE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveFollowCacheAll(m) {
    try {
        localStorage.setItem(FOLLOW_CACHE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默（配额不足时丢弃缓存，不影响主体功能） */
    }
}
/** 关注时存整篇快照；传 null 则清除（取消关注时调用） */
function cacheFollowArticle(id, article) {
    const m = loadFollowCacheAll();
    if (article)
        m[id] = { cached_at: Date.now(), article };
    else
        delete m[id];
    saveFollowCacheAll(m);
}
/** 读单篇关注缓存（无则 null） */
function readFollowCache(id) {
    return loadFollowCacheAll()[id]?.article ?? null;
}
// ---- 待办留存/归档（localStorage；键 dsh.cau-portal.deadline.v1，article_id → 'pin'|'archive'|null）----
// 用户手动决定某条待办是「保留(驻留)」还是「归档」；不同人关注不同
/**
 * 剩余天数（以本地今天 0 点为基准，整天对齐）；非法/无法解析日期返回 NaN。
 * 全项目唯一实现：首页我的事项/今日要览与待办中心共用同一口径。
 */
function daysLeft(date) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(String(date || '')))
        return Number.NaN;
    const d = Date.parse(date);
    if (!Number.isFinite(d))
        return Number.NaN;
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    return Math.round((d - day0.getTime()) / 86400000);
}
const DEADLINE_KEY = 'dsh.cau-portal.deadline.v1';
function loadDeadlineOps() {
    try {
        const v = JSON.parse(localStorage.getItem(DEADLINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveDeadlineOps(m) {
    try {
        localStorage.setItem(DEADLINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 设置某条待办操作（pin/archive/null=默认）；返回最新映射 */
function setDeadlineOp(id, op) {
    const m = loadDeadlineOps();
    if (op == null)
        delete m[id];
    else
        m[id] = op;
    saveDeadlineOps(m);
    return m;
}
const MINE_KEY = 'dsh.cau-portal.mine.v1';
function loadMine() {
    try {
        const v = JSON.parse(localStorage.getItem(MINE_KEY) || '{}');
        return v && typeof v === 'object' ? v : {};
    }
    catch {
        return {};
    }
}
function saveMine(m) {
    try {
        localStorage.setItem(MINE_KEY, JSON.stringify(m));
    }
    catch {
        /* 静默 */
    }
}
/** 从旧版 deadlineOps 的 pin 迁移（一次性） */
function migrateMineFromPin() {
    const m = loadMine();
    const ops = loadDeadlineOps();
    let changed = false;
    for (const [id, op] of Object.entries(ops)) {
        if (op === 'pin' && !m[id]) {
            m[id] = { added_at: Date.now(), title: '', url: '' };
            changed = true;
        }
    }
    if (changed)
        saveMine(m);
}
function isMine(id) {
    return !!loadMine()[id];
}
/** 加入我的事项（title=事项名；同步进关注列表 + 异步补本地全文快照） */
async function addMine(id, item) {
    migrateMineFromPin();
    const m = loadMine();
    if (!m[id]) {
        m[id] = { added_at: Date.now(), title: item.title, article_url: item.url || undefined, deadline: item.deadline, source: item.source, column: item.column, custom: item.custom || false, task: true };
        saveMine(m);
    }
    // 同步进关注列表（有关联文章时；无上限；重复自动去重）
    if (item.url) {
        const cur = loadFollow();
        if (!cur.some((x) => x.id === id)) {
            saveFollow([{ id, title: item.title, url: item.url, time: null, source: item.source, column: item.column, importance: undefined, summary: undefined }, ...cur]);
        }
    }
    // 异步补本地全文快照（成功则缓存，失败静默）
    if (item.url && /^[0-9a-f]{40}$/.test(String(id))) {
        try {
            const art = await readArticle(id);
            if (art)
                cacheFollowArticle(id, art);
        }
        catch {
            /* 静默 */
        }
    }
}
/** 纯自定义事项（无关联文章也可；id 生成 custom-*） */
function addCustomMine(item) {
    migrateMineFromPin();
    const id = `custom-${Date.now().toString(36)}`;
    const m = loadMine();
    m[id] = { added_at: Date.now(), title: item.title || '新事项', article_url: item.url || undefined, custom_deadline: item.deadline || undefined, custom: true, task: true };
    saveMine(m);
    return id;
}
/** 更新我的事项（事项名/原文链接/自定义截止日） */
function updateMine(id, patch) {
    const m = loadMine();
    if (!m[id])
        return;
    if (patch.title !== undefined) {
        m[id].title = patch.title;
        m[id].task = true;
    }
    if (patch.url !== undefined)
        m[id].article_url = patch.url || undefined;
    if (patch.deadline !== undefined)
        m[id].custom_deadline = patch.deadline || undefined;
    saveMine(m);
}
/** 移出我的事项（不影响关注列表，关注须在关注区另行取消） */
function removeMine(id) {
    const m = loadMine();
    if (!m[id])
        return;
    delete m[id];
    saveMine(m);
}
/** 自定义截止日（空串=恢复 AI 提取值） */
function setMineDeadline(id, date) {
    const m = loadMine();
    if (!m[id])
        return;
    m[id].custom_deadline = date || undefined;
    saveMine(m);
}
/** 显示用截止日：custom 优先 */
function mineDeadlineOf(m) {
    return m.custom_deadline || m.deadline || null;
}
// ---- 便捷读取：文章 / 栏目 feed（相对 data/）----
/** 读取文章（含缓存兜底）：云端无（已过保留期/404）时回退本地关注缓存；失败返回 null */
function readArticle(id, token) {
    if (!id)
        return Promise.resolve(null);
    return readArticleMeta(id, token).then((r) => r?.article ?? null);
}
/** 读取文章并标记来源：{article, cached}（cached=true 表示来自本地关注缓存） */
async function readArticleMeta(id, token) {
    if (!id)
        return null;
    try {
        const art = await readCloudJson(`data/articles/${id}.json`, token);
        if (art)
            return { article: art, cached: false };
    }
    catch {
        /* 网络/解析异常 → 走本地缓存兜底 */
    }
    const cached = readFollowCache(id);
    if (cached)
        return { article: cached, cached: true };
    return null;
}
/** 读取某栏目 feed（data/feed/<site>__<column>.json） */
function readFeed(site, column, token) {
    if (!site || !column)
        return Promise.resolve(null);
    return readCloudJson(`data/feed/${site}__${column}.json`, token);
}
const USAGE_KEY = 'dsh.cau-portal.usage.v1';
function loadUsageLog() {
    try {
        const v = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => x && typeof x.ts === 'string') : [];
    }
    catch {
        return [];
    }
}
function saveUsageLog(list) {
    try {
        localStorage.setItem(USAGE_KEY, JSON.stringify(list.slice(-500)));
    }
    catch {
        /* 静默 */
    }
}
function appendUsageLog(rec) {
    saveUsageLog([...loadUsageLog(), rec]);
}
/** 近 N 天用量按角色聚合（兼容两种字段名） */
function summarizeUsage(rows, days = 30) {
    const cutoff = Date.now() - days * 86400e3;
    const agg = {};
    for (const r of rows) {
        const ts = Date.parse(String(r.ts || ''));
        if (!Number.isNaN(ts) && ts < cutoff)
            continue;
        const role = String(r.role || 'other');
        const a = (agg[role] ||= { calls: 0, prompt: 0, completion: 0, cached: 0, cost: 0 });
        a.calls += 1;
        a.prompt += r.prompt_tokens ?? r.inputTokens ?? 0;
        a.completion += r.completion_tokens ?? r.outputTokens ?? 0;
        a.cached += r.cached_tokens ?? r.cacheReadTokens ?? 0;
        a.cost += typeof r.cost_yuan === 'number' ? r.cost_yuan : 0;
    }
    return agg;
}
/** 合并云端 usage.jsonl（角色 enrich）与本机按需日志（on-demand） */
async function loadUsageRows() {
    const rows = [];
    try {
        const text = await readCloudText('data/usage.jsonl');
        for (const line of String(text).split('\n')) {
            if (!line.trim())
                continue;
            try {
                const o = JSON.parse(line);
                rows.push({ ...o, role: o.role || 'enrich' });
            }
            catch {
                /* 跳过坏行 */
            }
        }
    }
    catch {
        /* 云端可能不存在 */
    }
    for (const r of loadUsageLog())
        rows.push(r);
    return rows;
}
const localDay = (v) => new Date(v).toLocaleDateString('en-CA');
/** 近 N 天按日聚合（补齐无数据天；metric: calls|prompt|completion|cost） */
function buildDailyUsage(rows, days, metric) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400e3);
        map[localDay(d)] = { label: d.toISOString().slice(5, 10), calls: 0, prompt: 0, completion: 0, cost: 0 };
    }
    for (const r of rows) {
        const k = r.ts ? localDay(r.ts) : '';
        const slot = map[k];
        if (!slot)
            continue;
        slot.calls += 1;
        slot.prompt += r.prompt ?? r.prompt_tokens ?? r.inputTokens ?? 0;
        slot.completion += r.completion ?? r.completion_tokens ?? r.outputTokens ?? 0;
        slot.cost += Number(r.cost ?? r.cost_yuan ?? 0);
    }
    return Object.values(map).map((v) => ({ label: v.label, value: v[metric] }));
}
/** 全局配置提醒：error=基本需求不满足（红条）；warn=注意项（黄条） */
function computeAlerts() {
    const out = [];
    const mods = loadModules();
    const tokens = loadTokens();
    const hasActiveValue = tokens.some((t) => t.enabled && t.value);
    if (!hasActiveValue)
        out.push({ level: 'error', text: '未配置有效令牌：面板无法读取云端数据（设置 → 令牌管理）', page: 'tokens' });
    if (!mods.cloud)
        out.push({ level: 'error', text: '数据源已禁用：插件将无法读取云端数据', page: 'cloud' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const t of tokens) {
        if (!t.enabled)
            continue; // 停用的令牌不参与到期提醒
        if (!t.expires)
            continue;
        const d = Date.parse(t.expires);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `令牌「${t.name}」已过期（${t.expires}），请前往续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `令牌「${t.name}」将于 ${left} 天后过期（${t.expires}）`, page: 'tokens' });
    }
    if (!mods.ai)
        out.push({ level: 'warn', text: 'AI 摘要已禁用：文章页不显示摘要与补摘要', page: 'ai' });
    if (!mods.context)
        out.push({ level: 'warn', text: '引用协同已禁用：引用按钮与上下文条已隐藏', page: 'prefs' });
    if (!mods.deadline)
        out.push({ level: 'warn', text: '待办与关注已禁用：首页不显示待办卡/关注入口', page: 'follow' });
    // 系统通知：开启但未授权/被拒 → 提醒授权路径（避免"开了不响"的错觉）
    const s = loadSettings();
    if (s.notifyOn) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
        if (perm === 'default')
            out.push({ level: 'warn', text: '系统通知已开启但尚未授权：设置 → 待办提醒 · 关注 → 点「请求通知授权」', page: 'follow' });
        else if (perm === 'denied')
            out.push({ level: 'warn', text: '系统通知已开启但被浏览器拒绝：请在浏览器站点设置中允许通知', page: 'follow' });
        else if (perm === 'unsupported')
            out.push({ level: 'warn', text: '系统通知已开启，但当前浏览器不支持通知 API', page: 'follow' });
    }
    // 过期日登记（settings.keyExpiries 独立键）：不被令牌列表覆盖的键提醒（如 github-read/bridge）
    const keyExp = s.keyExpiries || {};
    const tokenDates = new Set(tokens.map((t) => t.expires).filter(Boolean));
    for (const [k, exp] of Object.entries(keyExp)) {
        if (!exp || tokenDates.has(exp))
            continue;
        const d = Date.parse(exp);
        if (!Number.isFinite(d))
            continue;
        const left = Math.floor((d - Date.now()) / 86400e3);
        if (left < 0)
            out.push({ level: 'error', text: `凭据「${k}」已过期（${exp}），请前往 GitHub 续期`, page: 'tokens' });
        else if (left <= 30)
            out.push({ level: 'warn', text: `凭据「${k}」将于 ${left} 天后过期（${exp}）`, page: 'tokens' });
    }
    return out;
}
/**
 * 调用服务端 /api/cau/enrich 按需加工（浏览器不存 API key）；
 * 成功时记一条本机用量日志；返回 {ok, result, tokens, ...} 或 {ok:false, error}。
 */
async function enrichArticle(id, opts) {
    const art = await readArticle(id);
    if (!art)
        return { ok: false, error: '文章读取失败（正文未入库）' };
    const body = typeof art.body === 'string' ? art.body : '';
    if (!body)
        return { ok: false, error: '文章正文为空，无法加工' };
    let data = null;
    try {
        const res = await fetch('/api/cau/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: art.title,
                content: body.slice(0, 6000),
                time: art.time || art.published || '',
                source: art.source || art.site_name || '',
                provider: opts?.provider,
                model: opts?.model,
            }),
        });
        data = await res.json();
    }
    catch (error) {
        return { ok: false, error: String(error?.message || error) };
    }
    if (data?.ok && data.tokens) {
        appendUsageLog({
            ts: new Date().toISOString(),
            role: 'on-demand',
            provider: data.provider || opts?.provider || '',
            model: data.model || opts?.model || '',
            article: id,
            prompt_tokens: data.tokens.promptTokens ?? data.tokens.inputTokens ?? 0,
            completion_tokens: data.tokens.completionTokens ?? data.tokens.outputTokens ?? 0,
            cached_tokens: data.tokens.cacheReadTokens ?? 0,
        });
    }
    return data;
}
const RULES_KEY = 'dsh.cau-portal.rules.v1';
function loadRules() {
    try {
        const v = JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
        return Array.isArray(v) ? v.filter((r) => r && r.id && r.keyword) : [];
    }
    catch {
        return [];
    }
}
function saveRules(list) {
    try {
        localStorage.setItem(RULES_KEY, JSON.stringify(list.slice(0, 60)));
    }
    catch { /* 静默 */ }
}
function newRuleId() { return 'r-' + Math.random().toString(36).slice(2, 9); }
/** 规则命中：keyword（标题/来源/站点名/栏目名/栏目key 任一含，忽略大小写）+ source 含（来源/站点名）+ 重要度下限。
 *  字段口径与 tools/email/report.mjs 的 matchRule 对齐：面板🎯 与邮件日报🎯 命中一致。 */
function matchRules(rules, item) {
    if (!rules || !rules.length)
        return [];
    const hay = `${item.title || ''} ${item.source || ''} ${item.site_name || ''} ${item.column_name || ''} ${item.column || ''}`.toLowerCase();
    const srcHay = `${item.source || ''} ${item.site_name || ''}`.toLowerCase();
    return rules.filter((r) => {
        if (!r.enabled || !r.keyword)
            return false;
        if (!hay.includes(r.keyword.toLowerCase()))
            return false;
        if (r.source && !srcHay.includes(r.source.toLowerCase()))
            return false;
        if (r.minImportance === '高' && item.importance !== '高')
            return false;
        if (r.minImportance === '中' && item.importance !== '高' && item.importance !== '中')
            return false;
        return true;
    });
}
// ---- 通知去重水位（键 dsh.cau-portal.notifyseen.v1：已通知过的条目 id）----
const NOTIFY_SEEN_KEY = 'dsh.cau-portal.notifyseen.v1';
function loadNotifySeen() {
    try {
        return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    }
    catch {
        return new Set();
    }
}
function saveNotifySeen(ids) {
    try {
        localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify([...ids].slice(-400)));
    }
    catch { /* 静默 */ }
}
/**
 * 计算本次应通知的条目（供系统通知轮询）：
 * - importance 高 且 3 天内发布，或命中关注规则（同样 3 天内发布）
 * - id 不在 seen（已通知过的不重复）
 */
function computeNewAlerts(summary, rules, seen) {
    const items = summary?.important || [];
    const out = [];
    const limit = Date.now() - 72 * 3600 * 1000;
    for (const it of items) {
        const id = it.article_id || it.url;
        if (!id || seen.has(id))
            continue;
        const t = Date.parse(String(it.time || ''));
        if (!Number.isFinite(t) || t < limit)
            continue;
        const ruleHit = matchRules(rules, it).length > 0;
        if (it.importance !== '高' && !ruleHit)
            continue;
        out.push({ ...it, id, rule_hit: ruleHit });
        if (out.length >= 5)
            break;
    }
    return out;
}

return module.exports; })();
// 开源版中性化：不再内联学校校徽/校名题字 SVG（build.mjs 不再注入），改用中性「CAU」徽标 + 宋体题字，配色由 currentColor 跟随所在容器。
const CSS = `
/* ---- UI 批②：设计 token 层（挂 body：DSH 的 --dsw-* token 定义在 body/[data-ds-dark-theme] 上，
     挂 :root 会在求值时找不到它们、全部烤成兜底值（暗色下标题变黑的教训 2026-08-31） ---- */
body{
  --cau-brand:#008038;
  --cau-brand-a6:color-mix(in srgb,var(--cau-brand) 6%,transparent);
  --cau-brand-a9:color-mix(in srgb,var(--cau-brand) 9%,transparent);
  --cau-brand-a12:color-mix(in srgb,var(--cau-brand) 12%,transparent);
  --cau-brand-a16:color-mix(in srgb,var(--cau-brand) 16%,transparent);
  --cau-brand-a22:color-mix(in srgb,var(--cau-brand) 22%,transparent);
  --cau-brand-a35:color-mix(in srgb,var(--cau-brand) 35%,transparent);
  --cau-brand-a55:color-mix(in srgb,var(--cau-brand) 55%,transparent);
  --cau-ink:var(--dsw-alias-label-primary,#16181d);
  --cau-ink2:var(--dsw-alias-label-secondary,#5a6372);
  --cau-ink3:var(--dsw-alias-label-tertiary,#8b95a5);
  --cau-line:var(--dsw-alias-border-inverted,rgba(15,17,21,.1));
  --cau-line-soft:color-mix(in srgb,var(--dsw-alias-border-inverted,rgba(15,17,21,.1)) 55%,transparent);
  --cau-hover:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.045));
  --cau-fill:color-mix(in srgb,var(--dsw-alias-label-primary,#16181d) 4%,transparent);
  --cau-warn:var(--dsw-alias-state-warn,#c77d00);
  --cau-err:var(--dsw-alias-state-error-primary,#e5484d);
  --cau-ok:var(--dsw-alias-state-success,#2f9e44);
  --cau-r-s:8px;--cau-r-m:12px;--cau-r-l:16px;
}
body[data-ds-dark-theme]{--cau-brand:#00b856}
.dsh-cau_pillRow{display:flex;align-items:center;box-sizing:border-box;height:42px;padding:0 6px;min-width:0}
.dsh-cau_pill{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.09));border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.045));color:var(--dsw-alias-label-primary,#e6e8eb);cursor:pointer;transition:background .15s ease,border-color .15s ease;text-align:left}
.dsh-cau_pill:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.09));border-color:var(--dsw-alias-border-l3,rgba(255,255,255,.18));color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pill[aria-expanded='true']{color:var(--cau-brand);border-color:var(--cau-brand-a55);background:var(--cau-brand-a12)}
.dsh-cau_pill[aria-expanded='true']:hover{color:var(--cau-brand);border-color:color-mix(in srgb,var(--cau-brand) 75%,transparent)}
.dsh-cau_pill svg{display:block;width:auto;height:18px;flex:none}
.dsh-cau_pillName{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden;color:var(--dsw-alias-label-primary,#e6e8eb)}
.dsh-cau_pillName svg{display:block;width:auto;height:16px}
.dsh-cau_pillCount{flex:none;padding:0 7px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary,#8b95a5)}
.dsh-cau_cauLogo{flex:none;display:flex;align-items:center;font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:.02em;color:currentColor}
.dsh-cau_songtiName{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden;font-family:SimSun,'Songti SC','STSong',serif;font-weight:600;letter-spacing:.02em;color:inherit}
.dsh-cau_pill .dsh-cau_cauLogo{font-size:15px}
.dsh-cau_pill .dsh-cau_songtiName{font-size:13px;white-space:nowrap}
.dsh-cau_tags{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:8px}
.dsh-cau_chips{display:flex;flex-wrap:wrap;gap:6px}
/* 键盘焦点环 + 交互过渡（对所有 dsh-cau_* 元素生效；输入框已有 focus 边框不再加轮廓） */
[class*='dsh-cau_']:not(input):not(select):not(textarea):focus-visible{outline:2px solid var(--cau-brand-a55);outline-offset:1px}
[class*='dsh-cau_']{transition:background-color .12s ease,border-color .12s ease,color .12s ease,opacity .12s ease,box-shadow .12s ease}
${panel_1.PANEL_CSS}
${settings_1.SETTINGS_CSS}
${ctxbar_1.CTXBAR_CSS}
${toolview_1.TOOLVIEW_CSS}
`;
function CauButton(props) {
    const wide = !!props?.wide;
    const rowRef = (0, react_1.useRef)(null);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [count, setCount] = (0, react_1.useState)(0);
    // 页面加载即取未读计数（令牌缺失/云端无 summary 时静默为 0）
    (0, react_1.useEffect)(() => {
        let alive = true;
        (0, panel_1.fetchUnreadCount)()
            .then((n) => {
            if (alive)
                setCount(n);
        })
            .catch(() => {
            /* 静默 */
        });
        return () => {
            alive = false;
        };
    }, []);
    // 面板开合 → body 类（驱动聊天区让位收缩，页面充实饱满、不盖对话）
    (0, react_1.useEffect)(() => {
        document.body.classList.toggle('dsh-cau-drawer-open', open);
        return () => {
            document.body.classList.remove('dsh-cau-drawer-open');
        };
    }, [open]);
    // 阶段6：聊天区 toolview 卡片「在面板中打开」→ 展开抽屉（面板挂载后自行跳文章）
    (0, react_1.useEffect)(() => {
        return (0, bus_1.subscribeBus)(() => {
            if ((0, bus_1.getOpenRequest)())
                setOpen(true);
        });
    }, []);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "dsh-cau_pillRow", ref: rowRef, children: (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "dsh-cau_pill", "aria-label": "\u519C\u5927\u95E8\u6237", "aria-expanded": open, onClick: () => setOpen((o) => !o), title: wide ? undefined : count > 0 ? `农大门户 · ${count} 条未读` : '农大门户', children: [(0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_cauLogo", children: "CAU" }), wide && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_pillName dsh-cau_songtiName", children: "\u4E2D\u56FD\u519C\u4E1A\u5927\u5B66" }), wide && count > 0 && (0, jsx_runtime_1.jsx)("span", { className: "dsh-cau_pillCount", children: count })] }) }), open && ((0, jsx_runtime_1.jsx)(panel_1.CauPanel, { outsideIgnore: rowRef.current, onClose: () => setOpen(false), onUnreadChange: setCount }))] }));
}
exports.inject = ['slots', 'sessions', 'modelDirectories'];
function apply(ctx) {
    // 全局错误浮层：插件/面板出错时在屏幕左下角显示红字（原生 DOM，React 崩了也留着）
    ctx.effect(() => {
        const onErr = (e) => {
            const m = String(e?.message || e?.error?.message || e?.reason?.message || e?.reason || e || '');
            if (!m)
                return;
            let el = document.getElementById('dsh-cau-errbar');
            if (!el) {
                el = document.createElement('div');
                el.id = 'dsh-cau-errbar';
                el.setAttribute('style', 'position:fixed;left:8px;bottom:40px;z-index:99999;max-width:72vw;padding:8px 12px;border-radius:8px;background:rgba(160,30,30,.94);color:#fff;font:11px/16px sans-serif;white-space:pre-wrap;box-shadow:0 2px 10px rgba(0,0,0,.3)');
                document.body.appendChild(el);
            }
            el.textContent = 'cau-portal 错误: ' + m;
        };
        window.addEventListener('error', onErr);
        window.addEventListener('unhandledrejection', onErr);
        return () => {
            window.removeEventListener('error', onErr);
            window.removeEventListener('unhandledrejection', onErr);
        };
    }, 'cau-portal: error overlay');
    ctx.effect(() => {
        const style = document.createElement('style');
        style.setAttribute('data-dsh-plugin', 'cau-portal');
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => {
            style.remove();
        };
    }, 'cau-portal: styles');
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'cau-portal',
        order: 100,
    }, CauButton), 'cau-portal: sidebar button');
    // 设置页做成面板内的「设置」页签（用户定案：不进全局 Settings）。
    // 这里只绑定 ctx 供面板树/设置页使用；设置页签名见 panel.tsx（settings 视图）。
    (0, ctx_1.bindCtx)(ctx);
    // 阶段6：阅读上下文附加条（conversation.input.dock，会话级）
    ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'cau-context', order: 50 }, ctxbar_1.CtxBar), 'cau-portal: context bar');
    // 阶段6：工具结果新闻卡片（tool.call.toolview，按 mcp__cau__* 键控）
    (0, toolview_1.registerToolViews)(ctx);
    // 阶段5.5：系统通知轮询（高重要/命中关注规则 → 浏览器通知；面板开不开都生效，需页面开着 + 用户授权）
    ctx.effect(() => {
        if (typeof Notification === 'undefined')
            return;
        const runNotify = async () => {
            try {
                const s = (0, data_1.loadSettings)();
                if (!s.notifyOn || Notification.permission !== 'granted')
                    return;
                const summary = await (0, data_1.readCloudJson)('data/summary.json').catch(() => null);
                if (!summary?.important)
                    return;
                const rules = (0, data_1.loadRules)();
                const seen = (0, data_1.loadNotifySeen)();
                const alerts = (0, data_1.computeNewAlerts)(summary, rules, seen);
                if (!alerts.length)
                    return;
                for (const a of alerts) {
                    seen.add(a.id);
                    try {
                        new Notification(`农大门户 · ${a.rule_hit ? '🎯 关注命中' : '高重要'}：${String(a.title || '').slice(0, 42)}`, {
                            body: [a.column, a.source, a.time ? String(a.time).slice(0, 10) : '', a.summary ? String(a.summary).slice(0, 90) : '']
                                .filter(Boolean)
                                .join(' · '),
                            tag: 'cau-portal-' + a.id,
                        });
                    }
                    catch { /* 单个通知失败忽略 */ }
                }
                (0, data_1.saveNotifySeen)(seen);
            }
            catch { /* 静默（无令牌/网络波动时跳过本轮） */ }
        };
        void runNotify();
        const t = window.setInterval(() => void runNotify(), 10 * 60 * 1000);
        return () => window.clearInterval(t);
    }, 'cau-portal: notify watcher');
}

return module.exports; } });
