$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$RunDir = Join-Path $RootDir ".run"
$LogDir = Join-Path $RunDir "logs"
$WebPort = if ($env:WEB_PORT) { $env:WEB_PORT } else { "5173" }
$NgrokApi = "http://127.0.0.1:4040/api/tunnels"

if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
    Write-Host "[error] ngrok no está instalado." -ForegroundColor Red
    exit 1
}

$NgrokCheck = ngrok config check 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[error] ngrok no está configurado. Falta authtoken." -ForegroundColor Red
    Write-Host "Corre: ngrok config add-authtoken TU_TOKEN"
    exit 1
}

$ServerPidFile = Join-Path $RunDir "server.pid"
$WebPidFile = Join-Path $RunDir "web.pid"
$NgrokPidFile = Join-Path $RunDir "ngrok.pid"

if (-not (Test-Path $ServerPidFile) -or -not (Test-Path $WebPidFile)) {
    & "$RootDir\scripts\start-local.ps1"
}

if (Test-Path $NgrokPidFile) {
    Write-Host "[error] Ya hay un túnel ngrok levantado. Usa npm run stop primero." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$NgrokJob = Start-Job -ScriptBlock {
    param($Port, $LogPath)
    ngrok http $Port *> $LogPath
} -ArgumentList $WebPort, (Join-Path $LogDir "ngrok.log")

Start-Sleep -Seconds 1

$Timeout = 30
$Started = $false
for ($i = 0; $i -lt $Timeout; $i++) {
    try {
        $Response = Invoke-RestMethod -Uri $NgrokApi -ErrorAction SilentlyContinue
        if ($Response.tunnels) {
            $Started = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
}

if (-not $Started) {
    Write-Host "[error] ngrok no expuso su API local. Revisa $LogDir\ngrok.log" -ForegroundColor Red
    exit 1
}

$PublicUrl = $null
foreach ($Tunnel in $Response.tunnels) {
    if ($Tunnel.public_url -match "^https://") {
        $PublicUrl = $Tunnel.public_url
        break
    }
}

if (-not $PublicUrl) {
    Write-Host "[error] No pude obtener la URL pública de ngrok." -ForegroundColor Red
    exit 1
}

$PublicUrlFile = Join-Path $RunDir "public-url.txt"
$PublicUrl | Out-File -FilePath $PublicUrlFile -Encoding UTF8

Write-Host ""
Write-Host "FrozenGuild público listo" -ForegroundColor Green
Write-Host "- URL pública: $PublicUrl"
Write-Host "- Frontend local: http://127.0.0.1:$WebPort"
Write-Host "- Logs: $LogDir"
Write-Host ""
Write-Host "Para apagar: npm run stop"