param([ValidateSet('Serve', 'Test', 'Open')][string]$Mode = 'Open')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$nodeExe = (Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $nodeExe -and $env:NODE_HOME) {
  $candidate = Join-Path $env:NODE_HOME 'node.exe'
  if (Test-Path -LiteralPath $candidate -PathType Leaf) { $nodeExe = $candidate }
}
if (-not $nodeExe) {
  $candidate = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (Test-Path -LiteralPath $candidate -PathType Leaf) { $nodeExe = $candidate }
}
if (-not $nodeExe) { throw 'Для запуска нужен Node.js 22 или новее.' }
if ($Mode -eq 'Test') { & $nodeExe --test; exit $LASTEXITCODE }
if ($Mode -eq 'Serve') { & $nodeExe server.mjs; exit $LASTEXITCODE }

$port = if ($env:PORT) { [int]$env:PORT } else { 5173 }
$url = "http://localhost:$port"
try { $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2; $running = $response.Content -match 'НАУЧДВИЖ' } catch { $running = $false }
if (-not $running) {
  Start-Process -FilePath $nodeExe -ArgumentList 'server.mjs' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $PSScriptRoot 'server.log') -RedirectStandardError (Join-Path $PSScriptRoot 'server-error.log')
  $ready = $false
  foreach ($attempt in 1..20) {
    Start-Sleep -Milliseconds 250
    try {
      $page = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 1
      if ($page.Content -match 'НАУЧДВИЖ') { $ready = $true; break }
    } catch { }
  }
  if (-not $ready) { throw 'Сайт не ответил. Проверьте server-error.log и доступность порта 5173.' }
}
Start-Process $url
Write-Host $url
