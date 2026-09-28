# Objavujem svet - maly lokalny server
# ------------------------------------------------------------------------
# Pouziva iba PowerShell, ktory je sucastou Windows (nic sa neinstaluje).
# Vdaka nemu:
#   - hlasy a zvuky funguju spolahlivo (prehliadac aplikaciu berie ako web),
#   - postup sa uklada aj do priecinka "data" (prenesie sa s priecinkom
#     aplikacie a kazdy den sa robi zaloha).
# Spusta sa cez "Spustit objavovanie.bat". Zatvorenim okna sa server vypne.
# ------------------------------------------------------------------------
param(
  [int]$Port = 8766,
  [switch]$NoBrowser
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPrefix = $root.TrimEnd('\') + '\'
$url = "http://localhost:$Port/"
$dataDir = Join-Path $root 'data'
$stateFile = Join-Path $dataDir 'postup.json'
$utf8 = New-Object System.Text.UTF8Encoding($false)

try { $Host.UI.RawUI.WindowTitle = 'Objavujem svet - server (nezatvarajte pocas hry)' } catch {}

function Open-App([string]$target) {
  if ($NoBrowser) { return }
  $candidates = @()
  if (${env:ProgramFiles(x86)}) { $candidates += Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe' }
  if ($env:ProgramFiles) { $candidates += Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe' }
  $edge = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if ($edge) { Start-Process -FilePath $edge -ArgumentList "--app=$target" }
  else { Start-Process $target }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try {
  $listener.Start()
}
catch {
  $startError = $_.Exception.Message
  # server uz bezi (aplikacia spustena druhykrat) -> len otvor okno aplikacie
  try {
    $ping = Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri ($url + 'api/ping')
    if ($ping.Content -like '*objav*') { Open-App $url; exit }   # tento server (aj starsia verzia)
  }
  catch {}
  Write-Host "Server sa nepodarilo spustit: $startError"
  Write-Host 'Otvaram aplikaciu priamo zo suboru (postup sa bude ukladat len v prehliadaci).'
  Open-App ([Uri](Join-Path $root 'index.html')).AbsoluteUri
  Start-Sleep -Seconds 8
  exit
}

Write-Host "Objavujem svet bezi na $url"
Write-Host 'Toto okno nechajte otvorene (moze byt minimalizovane). Zatvorenim sa server vypne.'
Open-App $url

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.svg'  = 'image/svg+xml; charset=utf-8'
  '.ico'  = 'image/x-icon'
  '.mp3'  = 'audio/mpeg'
  '.wav'  = 'audio/wav'
  '.woff2' = 'font/woff2'
}

function Send-Bytes($res, [byte[]]$bytes, [string]$type) {
  $res.ContentType = $type
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
}

while ($listener.IsListening) {
  try { $ctx = $listener.GetContext() } catch { break }
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $res.Headers.Add('Cache-Control', 'no-store')
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)

    if ($path -eq '/api/ping') {
      Send-Bytes $res $utf8.GetBytes('objavujem-svet') 'text/plain; charset=utf-8'
    }
    elseif ($path -eq '/api/state') {
      if ($req.HttpMethod -eq 'POST') {
        # zapisovat smie iba samotna aplikacia (nie ina stranka v prehliadaci)
        $origin = $req.Headers['Origin']
        if ($origin -and $origin -ne $url.TrimEnd('/')) { $res.StatusCode = 403 }
        else {
          $reader = New-Object System.IO.StreamReader($req.InputStream, $utf8)
          $body = $reader.ReadToEnd()
          $reader.Close()
          if ($body.Length -lt 2 -or $body.TrimStart()[0] -ne '{') { $res.StatusCode = 400 }
          else {
            if (-not (Test-Path -LiteralPath $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }
            $tmp = "$stateFile.tmp"
            [System.IO.File]::WriteAllText($tmp, $body, $utf8)
            [System.IO.File]::Copy($tmp, $stateFile, $true)
            Remove-Item -LiteralPath $tmp -Force
            # denna zaloha (poslednych 14 dni)
            $backup = Join-Path $dataDir ('zaloha-' + (Get-Date -Format 'yyyy-MM-dd') + '.json')
            [System.IO.File]::Copy($stateFile, $backup, $true)
            Get-ChildItem -LiteralPath $dataDir -Filter 'zaloha-*.json' | Sort-Object Name -Descending | Select-Object -Skip 14 | Remove-Item -Force
            $res.StatusCode = 204
          }
        }
      }
      elseif (Test-Path -LiteralPath $stateFile) {
        Send-Bytes $res ([System.IO.File]::ReadAllBytes($stateFile)) 'application/json; charset=utf-8'
      }
      else { $res.StatusCode = 404 }
    }
    else {
      if ($path -eq '/') { $path = '/index.html' }
      $file = [System.IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $inside = $file.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -and
                -not $file.StartsWith($dataDir, [StringComparison]::OrdinalIgnoreCase)
      if ($inside -and $mime.ContainsKey($ext) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
        Send-Bytes $res ([System.IO.File]::ReadAllBytes($file)) $mime[$ext]
      }
      else { $res.StatusCode = 404 }
    }
  }
  catch {
    try { $res.StatusCode = 500 } catch {}
  }
  finally {
    try { $res.Close() } catch {}
  }
}
