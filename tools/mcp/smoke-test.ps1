# cau-portal MCP 服务器冒烟测试（自包含：不需要任何额外文件、不写入仓库目录、不含任何人的数据或 id）
#
# 用法（在 tools/mcp 目录下；Windows PowerShell 5.1 用 powershell，PowerShell 7 用 pwsh）：
#   powershell -File smoke-test.ps1                 # 协议握手 + 6 个工具是否注册（不依赖任何数据）
#   powershell -File smoke-test.ps1 -WithData       # 额外调用 5 个查询工具（数据来自你自己配置的数据源）
#   powershell -File smoke-test.ps1 -ArticleId <id> # 再测 get_article（id 用你自己数据里的文章 id）
#
# 前置：本目录已 `pnpm install`（或 npm install）装好 @modelcontextprotocol/sdk；node 在 PATH 中（或用 CAU_NODE 指定）。
# 输入/输出都在系统临时目录、跑完自动清理 —— 每个人的数据与产物都由自己管理，不进仓库。
# 注意：本文件保存为 UTF-8 with BOM（Windows PowerShell 5.1 读无 BOM 的 UTF-8 脚本会把中文显示成乱码）。
param(
  [switch]$WithData,
  [string]$ArticleId = ''
)
$ErrorActionPreference = 'Continue'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$entry = Join-Path $root 'index.mjs'

# ---- 0. 前置检查（给出可执行的提示，而不是让脚本莫名失败）----
$node = $env:CAU_NODE
if (-not $node) { $node = (Get-Command node -ErrorAction SilentlyContinue).Source }
if (-not $node -or -not (Test-Path $node)) {
  Write-Host '找不到 node：请安装 Node.js 并确保在 PATH 中，或用环境变量 CAU_NODE 指定 node 可执行文件。' -ForegroundColor Red
  exit 2
}
if (-not (Test-Path (Join-Path $root 'node_modules'))) {
  Write-Host "缺少依赖：请先在 $root 下执行 pnpm install（或 npm install）。" -ForegroundColor Red
  exit 2
}

# ---- 1. 生成 JSON-RPC 输入（临时目录，BOM-less UTF-8）----
$tmp = Join-Path ([IO.Path]::GetTempPath()) ('cau-mcp-smoke-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
$in = Join-Path $tmp 'in.jsonl'

$lines = @(
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke","version":"1"}}}',
  '{"jsonrpc":"2.0","method":"notifications/initialized"}',
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
)
$dataIds = @()
if ($WithData) {
  $calls = @(
    '{"name":"list_sites","arguments":{}}',
    '{"name":"list_latest","arguments":{"limit":5}}',
    '{"name":"list_deadlines","arguments":{"days":30}}',
    '{"name":"get_usage","arguments":{"days":30}}',
    '{"name":"search_news","arguments":{"query":"通知"}}'
  )
  $id = 10
  foreach ($c in $calls) {
    $lines += ('{"jsonrpc":"2.0","id":' + $id + ',"method":"tools/call","params":' + $c + '}')
    $dataIds += $id
    $id++
  }
}
if ($ArticleId) {
  $lines += ('{"jsonrpc":"2.0","id":99,"method":"tools/call","params":{"name":"get_article","arguments":{"id_or_url":"' + $ArticleId + '"}}}')
  $dataIds += 99
}
[IO.File]::WriteAllLines($in, $lines, (New-Object Text.UTF8Encoding($false)))

# ---- 2. 跑 ----
# 2>&1 把服务器 stderr（启动日志）与 stdout 一起收进管道再分开：
# Windows PowerShell 5.1 把「原生命令写了 stderr」包装成 NativeCommandError 抛到调用方，
# 若用 `2> 文件` 重定向，那层包装仍会漏到外面的错误流（外面套一层调用就会看到一堆红字），
# 所以这里用 2>&1 + 按记录类型拆分，既拿得到 stderr 又不污染调用方。
# 另外：Windows PowerShell 5.1 用 `$OutputEncoding` 决定「管道喂给原生命令的字符串」怎么编码，
# 它默认是 ASCII → 中文参数会被换成 "?"（实测 search_news 的 query 变成 "??"）。临时切 UTF-8，跑完还原。
$prevOutEnc = $OutputEncoding
try { $OutputEncoding = New-Object Text.UTF8Encoding($false) } catch { }
$all = Get-Content $in -Encoding utf8 | & $node $entry 2>&1
$code = $LASTEXITCODE
try { $OutputEncoding = $prevOutEnc } catch { }
$res = (@($all | Where-Object { -not ($_ -is [System.Management.Automation.ErrorRecord]) }) -join "`n")
$errs = (@($all | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] } | ForEach-Object { $_.ToString() }) -join "`n")

# ---- 3. 断言 ----
$fail = 0
function Check([bool]$cond, [string]$msg) {
  if ($cond) { Write-Host "  ok   $msg" } else { Write-Host "  FAIL $msg" -ForegroundColor Red; $script:fail++ }
}

Write-Host "node : $node"
Write-Host "exit : $code"
Check ($code -eq 0) '进程正常退出'
Check ($res -match '"serverInfo"') '协议握手返回 serverInfo'
$ver = [regex]::Match($res, '"serverInfo":\{"name":"([^"]+)","version":"([^"]+)"')
if ($ver.Success) { Write-Host ('  info serverInfo = ' + $ver.Groups[1].Value + ' ' + $ver.Groups[2].Value) }
foreach ($t in @('list_sites', 'list_latest', 'search_news', 'get_article', 'list_deadlines', 'get_usage')) {
  Check ($res -match ('"name":"' + $t + '"')) "工具已注册：$t"
}
if ($dataIds.Count) {
  # 响应 JSON 里 id 是最后一个字段（"id":N} 或 "id":N,），两种都要认
  foreach ($n in $dataIds) { Check ($res -match ('"id":' + $n + '[},]')) "数据工具有响应（id $n）" }
  if ($fail -eq 0) {
    Write-Host ''
    Write-Host '=== 数据工具响应（截断显示；数据来自你自己配置的数据源）==='
    foreach ($line in ($res -split "`n")) {
      if ($line -match '"id":(1[0-9]|99)[},]') { Write-Host ('  ' + $line.Substring(0, [Math]::Min(220, $line.Length))) }
    }
  }
  if ($res -match '"isError":true') {
    Write-Host '  注意 有工具返回 isError：请检查数据仓 owner/repo 与只读令牌是否已在插件设置里配好（本机无 data/ 且无令牌时属正常）。' -ForegroundColor Yellow
  }
}
if ($errs.Trim()) {
  # 服务器启动日志走 stderr（如 "[cau-portal-mcp] ready, data dir: …"）属正常；失败时才全量打印
  $firstErr = ($errs -split "`r?`n" | Where-Object { $_.Trim() } | Select-Object -First 1)
  if ($fail -eq 0) {
    Write-Host "  info stderr（启动日志，通常可忽略）：$firstErr"
  } else {
    Write-Host ''
    Write-Host '=== stderr（前 40 行）==='
    ($errs -split "`r?`n") | Select-Object -First 40 | ForEach-Object { Write-Host "  $_" }
  }
}

Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
Write-Host ''
if ($fail -eq 0) { Write-Host '冒烟测试通过 ✓'; exit 0 }
Write-Host "$fail 项失败 ✗" -ForegroundColor Red
exit 1
