# cau-portal MCP 服务器冒烟测试：文件重定向喂 JSON-RPC，检查协议握手与全部工具
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = 'D:\nodejs1\node.exe'
$input = Join-Path $root 'smoke-input.jsonl'
$out = Join-Path $root 'smoke-out.jsonl'
$err = Join-Path $root 'smoke-err.log'

Remove-Item $out, $err -ErrorAction SilentlyContinue
Get-Content $input -Encoding UTF8 | & $node (Join-Path $root 'index.mjs') 1> $out 2> $err
Write-Output "exit: $LASTEXITCODE"
Write-Output '=== stdout (responses) ==='
if (Test-Path $out) { Get-Content $out -Encoding Unicode } else { 'NO OUTPUT FILE' }
Write-Output '=== stderr ==='
if (Test-Path $err) { Get-Content $err -Encoding Unicode } else { '(empty)' }
