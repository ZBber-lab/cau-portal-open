// 用 dsh-mcp-client 自身的 Config schema 校验 cordis.patch.yml 里的 MCP 配置
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const checkoutNm = 'file:///D:/npm-cache/_npx/1e7f6d9597241db0/node_modules/__probe__.js'
const req = createRequire(checkoutNm)

let mcp
try { mcp = req('@deepseek-ai/dsh-mcp-client') } catch (e) { console.log('IMPORT FAIL:', e.message); process.exit(1) }
const Config = mcp.Config
console.log('mcp-client exports:', Object.keys(mcp).join(', '))

let patchRaw
try { patchRaw = readFileSync('C:/Users/1/.dsh/profiles/web/cordis.patch.yml', 'utf8') } catch (e) { console.log('PATCH READ FAIL:', e.message); process.exit(1) }

let yaml = null
try { yaml = req('yaml') } catch { /* 无 yaml 库则跳过解析 */ }

let configObj
if (yaml) {
  const doc = yaml.parse(patchRaw)
  const entry = doc?.[0]?.insert?.[0]
  console.log('parsed entry:', JSON.stringify(entry, null, 2))
  configObj = entry?.config
} else {
  console.log('(no yaml lib in checkout; using hardcoded object)')
  configObj = {
    serverName: 'cau',
    transport: 'stdio',
    command: 'D:\\nodejs1\\node.exe',
    args: ['D:\\my_tests\\test_2\\test_3\\tools\\mcp\\index.mjs'],
    cwd: 'D:\\my_tests\\test_2\\test_3\\tools\\mcp',
    env: {},
    toolCallTimeoutMs: 60000,
    failOnStartupError: false,
  }
}

if (!configObj) { console.log('NO CONFIG FOUND IN PATCH'); process.exit(1) }
try {
  // schemastery schema：直接调用式校验（Config(cfg) 返回解析结果或抛错）
  const parsed = Config(configObj)
  console.log('SCHEMA OK ->', JSON.stringify(parsed))
} catch (e) {
  console.log('SCHEMA REJECT:')
  console.log(e.issues ?? e.message)
  process.exit(1)
}
