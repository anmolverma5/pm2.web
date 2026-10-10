# Deploys pm2.web (mongo + backend agent + dashboard) to your PM2 daemon.
# Run this from your own terminal - an agent shell can't reach the PM2
# daemon pipe (EPERM), and can't touch Session 0 processes.
#
# Order matters here:
#   1. stop the old processes FIRST, so nothing is serving from .next
#   2. build once, uncontested
#   3. start processes that only RUN the built output
#
# The run-*.js wrappers deliberately don't use "turbo run start": turbo.json
# makes the start task depend on lint + build, so every restart used to
# re-lint and rebuild into the .next folder the running server was still
# serving from. That race corrupted .next/BUILD_ID (the server kept serving
# a build ID whose assets no longer existed -> 404s on _buildManifest.js ->
# React never hydrated -> the login form fell back to a plain HTML GET,
# putting the password in the URL). A lint error would also silently take
# the dashboard down. Building at deploy time removes both failure modes.

$ErrorActionPreference = "Stop"

$mongoDir = "J:\Logistics\vezpec and vezpec global\pm2-web-mongodb"
$appDir   = "J:\Logistics\vezpec and vezpec global\pm2-web"

# PM2 on Windows kills the process it spawned, but not deep grandchildren.
# Our chain is run-dashboard.js -> cmd.exe -> pnpm -> next start, so the
# real server survives "pm2 delete" as an orphan and keeps holding the port.
# Every subsequent start then dies with EADDRINUSE while the orphan carries
# on serving a stale build. Killing the port owner makes this self-healing.
# Needs an elevated shell: the orphan runs in Session 0.
function Stop-PortOwner($port) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $owner = $c.OwningProcess
    Write-Host "    port $port held by PID $owner - stopping it" -ForegroundColor Yellow
    try {
      Stop-Process -Id $owner -Force -ErrorAction Stop
    } catch {
      Write-Host "    COULD NOT KILL PID $owner - re-run this script as Administrator" -ForegroundColor Red
    }
  }
}

Write-Host "==> Stopping existing pm2.web processes" -ForegroundColor Cyan
pm2 delete pm2.web-mongo
pm2 delete pm2.web-daemon
pm2 delete pm2.web-dashboard

Write-Host "==> Clearing orphaned processes still holding our ports" -ForegroundColor Cyan
Stop-PortOwner 3600
Stop-PortOwner 27017
Start-Sleep -Seconds 2

Write-Host "==> Building (nothing is serving from .next right now)" -ForegroundColor Cyan
Push-Location $appDir
pnpm run build:apps:backend
pnpm run build:apps:dashboard
Pop-Location

Write-Host "==> Starting Mongo" -ForegroundColor Cyan
pm2 start "$mongoDir\run-mongo.js" --name pm2.web-mongo

Start-Sleep -Seconds 3

# Mongo runs as a single-node replica set (--replSet rs0) because pm2.web's
# backend uses change streams, which standalone mongod does not support.
# This is idempotent - it no-ops if the replica set is already initiated.
Write-Host "==> Ensuring replica set is initiated" -ForegroundColor Cyan
node "$appDir\apps\backend\init-replicaset.js"

Write-Host "==> Starting backend agent + dashboard" -ForegroundColor Cyan
pm2 start "$appDir\run-backend.js" --name pm2.web-daemon
pm2 start "$appDir\run-dashboard.js" --name pm2.web-dashboard

pm2 save

Write-Host ""
Write-Host "Dashboard: http://localhost:3600  /  https://pm2.vezpec.com" -ForegroundColor Green
