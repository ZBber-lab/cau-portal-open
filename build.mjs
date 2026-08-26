/**
 * cau-portal 构建（零进程 spawn，兼容 DSH 沙箱）：
 *   - lib/index.js    服务端 ESM（TypeScript 转译）
 *   - lib/client.js   客户端单文件 CJS（window.__ModuleLoader__.load 握手；
 *                     react / @deepseek-ai/* 由宿主模块系统提供，保持 external）
 * 说明：本机 DSH 沙箱禁止 spawn 子进程，esbuild（原生/WASM）服务模式均需
 * spawn 二进制（EPERM），故改用 TypeScript 5.x 编译器 JS API（纯 JS）转译。
 * 单入口 + 全外部依赖，无需打包器；校徽 SVG 以占位符替换内联。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const here = dirname(fileURLToPath(import.meta.url))
mkdirSync(join(here, 'lib'), { recursive: true })

const EMBLEM_TOKEN = "'__CAU_EMBLEM_SVG__'"
const emblem = readFileSync(join(here, 'assets/brand-svg/cau-emblem.svg'), 'utf8')

// ---- 客户端：TSX → CJS，外加 __ModuleLoader__ 握手 banner/footer ----
let clientSrc = readFileSync(join(here, 'src/client/index.tsx'), 'utf8')
if (!clientSrc.includes(EMBLEM_TOKEN)) {
  throw new Error('client source is missing the emblem placeholder token')
}
clientSrc = clientSrc.replace(EMBLEM_TOKEN, JSON.stringify(emblem))
const clientOut = ts.transpileModule(clientSrc, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
    isolatedModules: true,
  },
}).outputText
const clientBanner =
  "window.__ModuleLoader__.load({ id: 'cau-portal', factory: (require) => { var module = { exports: {} }; var exports = module.exports;"
const clientFooter = 'return module.exports; } });'
writeFileSync(join(here, 'lib/client.js'), clientBanner + '\n' + clientOut + '\n' + clientFooter + '\n')

// ---- 服务端：TS → ESM ----
const serverSrc = readFileSync(join(here, 'src/index.ts'), 'utf8')
const serverOut = ts.transpileModule(serverSrc, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    isolatedModules: true,
  },
}).outputText
writeFileSync(join(here, 'lib/index.js'), serverOut)

console.log('[cau-portal build] done: lib/index.js, lib/client.js')
