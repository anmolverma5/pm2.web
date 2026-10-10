# Vezpec Infrastructure — Service Reference

Every process PM2 supervises on this machine, grouped by product: what it
does, where it lives on disk, which domain routes to it through the
Cloudflare Tunnel (`C:\Users\test\.cloudflared\config.yml`), and what it
talks to.

This mirrors `apps/dashboard/utils/service-catalog.ts`, which renders the
same information under each process on the dashboard's `/process` page —
**update both together**. Paths come from a live `infra-registry` scan, not
from memory. "Connects to" lists only integrations documented somewhere real
(cloudflared ingress comments, a repo's own config, or shared-secret wiring);
it is not a guess at every network call.

Process states drift — treat this as a map of what things *are*, not a live
status board. Use https://pm2.vezpec.com for that.

**20** services sit on a public domain · **14** are internal-only · **4** need
attention.

## Needs attention

| Issue | Detail |
|---|---|
| `api.vezpec.com` doesn't route to `vezpec-api` | It points at port 8484, held by a bare `node.exe` never registered in PM2. Identify it, then adopt it into PM2 or shut it down. |
| `vezpec-api` is down | The real backend for the desktop-app product isn't running. |
| `C:` drive is nearly full | Last scan showed **0.84 GB free** against a 5 GB threshold. Mongo and the build caches live on `J:`, but Windows and npm caches don't. |

## Vezpec — Freight Brokerage

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `vezpec-ca` | vezpec.com | 3000 | `J:/Logistics/vezpec and vezpec global/vezpec-platform` | — |
| `vezpec-us` | vezpecglobal.com | 3001 | `J:/Logistics/vezpec and vezpec global/vezpec-platform` | `vezpec-ca` (same codebase) |
| `vezpec-web` | app.vezpec.com | 4321 | `J:/Logistics/vezpec and vezpec global/call_ai/web` | `vezpec-api` |
| `vezpec-api` | — | — | `J:/Logistics/vezpec and vezpec global/call_ai/backend` | — |
| `vezpec-call_ai-watcher` | — | — | `J:/Logistics/vezpec and vezpec global/call_ai` | `vezpec-api` |
| `vezpec-voice` | voice.vezpec.com | 8765 | `C:/VEZPEC/vezpec-voice` | — |
| `vezpec-omnivoice` | — | — | `C:/VEZPEC/vezpec-voice` | — |
| `voice-studio` | voice2.vezpec.com | 4173 | `J:/Logistics/vezpec and vezpec global/voice-studio` | `vezpec-voice` |
| `youtube-sync` | youtube-sync.vezpec.com | 5001 | `J:/Logistics/vezpec and vezpec global/VideoTogether/source/go-server` | — |

- **vezpec-ca / vezpec-us** — one codebase, two brands (Canada and US).
- **vezpec-web / vezpec-api** — frontend and backend of the desktop app.
- **vezpec-voice** — TTS and voice cloning, with its own built-in UI.
- **voice-studio** — newer React front end; calls the TTS engine from the browser.
- **youtube-sync** — VideoTogether sync server for group watching.

## Vezpec Sales Platform

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `vezpec-sales-api` | sales-api.vezpec.com | 3300 | `.../vezpec-sales-platform` | — |
| `vezpec-sales-dashboard` | sales.vezpec.com | 3301 | `.../vezpec-sales-platform` | `vezpec-sales-api` |
| `vezpec-sales-ingestion` | — | — | `.../vezpec-sales-platform` | `vezpec-sales-api` |
| `vezpec-sales-crm-sync` | — | — | `.../vezpec-sales-platform` | `vezpec-sales-api` |
| `vezpec-sales-enrichment` | — | — | `.../vezpec-sales-platform` | `vezpec-sales-api` |

All five live in `J:/Logistics/vezpec and vezpec global/vezpec-sales-platform`.
The API owns `/intake/leads`, which every lead-sourcing service pushes into.

## Email Tracker & Outreach

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `emailtracker-api` | tracker-api.vezpec.com | 8100 | `.../email-tracker/backend` | `vezpec-sales-api` |
| `emailtracker-admin` | tracker.vezpec.com | 8101 | `.../email-tracker/admin` | `emailtracker-api` |
| `quickly` | quickly.vezpec.com | 8010 | `.../quickly-cold-email` | `n8n`, `vezpec-sales-api` |

Send/open/click events from `emailtracker-api` score leads and fill the sales
call queue. `quickly` sends outbound webhooks to n8n and pushes leads to the
sales platform.

## Osho Automation

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `osho-player` | osho.vezpec.com | 8788 | `J:/Logistics/vezpec and vezpec global/Osho Automation/osho-player` | `osho-web-integration` |
| `osho-reel-studio` | studio.vezpec.com | 8001 | `J:/Osho Automation/osho-reel-studio` | `osho-social-publisher` |
| `osho-web-integration` | reels.vezpec.com | 8005 | `J:/Osho Automation/osho-web-integration` | — |
| `osho-social-publisher` | publisher.vezpec.com | 8002 | `J:/Osho Automation/osho-social-publisher` | `osho-social-analytics` |
| `osho-social-analytics` | analytics.vezpec.com | 8003 | `J:/Osho Automation/osho-social-analytics` | — |
| `whatsapp-automation` | — | 8004 | `J:/Osho Automation/whatsapp-automation` | — |

Pipeline: the archive (`osho-player`) → reels are generated and approved in
`osho-reel-studio` → published by `osho-social-publisher` → measured by
`osho-social-analytics`. `osho-web-integration` serves reel data back to the
player. Note `osho-player` still lives under the *old* path, unlike the other
six repos which moved to `J:/Osho Automation`.

**`osho-reel-studio` has no login by default** — it can spawn render and
upload jobs, and it is publicly routed. Set its `API_KEY` before relying on it.

## Vezpec Todo

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `vikunja` | — | 3591 | `.../vikunja-src` | — |
| `vikunja-theme-proxy` | todo.vezpec.com | 3592 | `.../vikunja/theme-proxy` | `vikunja` |

The proxy re-skins Vikunja with Vezpec branding and is the only public way in.
`vikunja-theme-proxy` has **no git remote** — it exists on this disk only.

## Android Streaming

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `android-emulator` | — | 5554, 5555, 8554 | `.../android-emulator-container-scripts` | — |
| `android-gateway` | — | 8080 | `.../android-emulator-container-scripts/gateway` | `android-emulator` |
| `android-web` | android.vezpec.com | 5173 | `.../android-emulator-container-scripts/js/example` | `android-gateway` |

Chain: browser → `android-web` → `android-gateway` → `android-emulator`.

## Platform & Infra

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `cloudflare-tunnel` | — | 20241 | `C:/Users/test/.cloudflared/config.yml` | every public service |
| `n8n` | automation.vezpec.com | 5678 | `J:/Logistics/n8n` | — |
| `kan-web` | — | 3501 | `J:/Logistics/kan` | — |
| `zero-mail` | mail.vezpec.com | 3002 | `.../zero-mail` | zero-mail-api |
| `zero-mail-api` | mail-api.vezpec.com | 8787 | `.../zero-mail` | Microsoft Graph |

**`cloudflare-tunnel` is the single point of failure for every public URL on
this page.** If it stops, all `*.vezpec.com` hostnames go down at once, even
though the services behind them are still running.

## pm2.web (this project)

| Service | URL | Port | Path | Connects to |
|---|---|---|---|---|
| `pm2.web-mongo` | — | 27017 | `.../pm2-web-mongodb` | — |
| `pm2.web-daemon` | — | — | `.../pm2-web` | `pm2.web-mongo` |
| `pm2.web-dashboard` | pm2.vezpec.com | 3600 | `.../pm2-web` | `pm2.web-mongo` |

- **`pm2.web-mongo`** runs as a single-node replica set (`rs0`), not a
  standalone — the agent uses MongoDB change streams, which standalone
  `mongod` does not support. `apps/backend/init-replicaset.js` sets this up
  and is safe to re-run.
- **`pm2.web-daemon`** is the agent. If it stops, every process on the
  dashboard goes stale (red, no CPU/RAM) even though they're all fine.
- **`pm2.web-dashboard`** is gated only by its own login, and it is
  internet-facing — set a registration code in Settings.

## Operating notes

- **Deploy with `start-pm2-web.ps1`, from an elevated shell.** It stops the
  old processes, clears orphans holding ports 3600/27017, builds once, then
  starts. Run it as Administrator or it cannot kill Session 0 orphans.
- **Don't build while a server is running from the same `.next`.** PM2 used
  to start these through `turbo run start`, whose start task depends on
  lint + build; every restart rebuilt underneath the running server, which
  corrupted `.next/BUILD_ID` and left the dashboard serving a build whose
  assets no longer existed. The `run-*.js` wrappers now only run built output.
- **PM2 on Windows orphans grandchildren.** `pm2 delete` kills the process it
  spawned, not the `next start` several levels below it. The orphan keeps the
  port, so the next start dies with `EADDRINUSE` while the orphan serves a
  stale build. That is what the port-clearing step in the deploy script is for.
- **Reset the dashboard password** with
  `node apps/backend/reset-admin-password.js` (optionally pass an email).
