// What each PM2 process actually is - rendered under its name on /process.
// Keyed by exact PM2 process name.
//
// Paths come from a live infra-registry scan (PM2 + cloudflared + git), not
// from memory. `connects` lists only integrations that are actually
// documented somewhere real (the cloudflared ingress comments, a repo's own
// README/.env, or shared-secret wiring between two services) - it is
// deliberately not a guess at every network call.
//
// Mirrors ../../../INFRASTRUCTURE.md - update both together.
export interface ServiceInfo {
  description: string;
  /** Public URL, if the Cloudflare Tunnel routes one. */
  url?: string;
  /** Working directory on this machine. */
  path?: string;
  /** Local port(s) it listens on. */
  port?: string;
  /** Other PM2 services this one talks to. */
  connects?: string[];
}

export const serviceCatalog: Record<string, ServiceInfo> = {
  // --- Vezpec: freight brokerage -------------------------------------
  "vezpec-ca": {
    description: "Public marketing site for the Canadian freight-brokerage brand.",
    url: "https://vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/vezpec-platform",
    port: "3000",
  },
  "vezpec-us": {
    description: "The same codebase as vezpec-ca, configured for the US brand, Vezpec Global.",
    url: "https://vezpecglobal.com",
    path: "J:/Logistics/vezpec and vezpec global/vezpec-platform",
    port: "3001",
    connects: ["vezpec-ca"],
  },
  "vezpec-web": {
    description: "Frontend for the Vezpec Global desktop app (call_ai product line).",
    url: "https://app.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/call_ai/web",
    port: "4321",
    connects: ["vezpec-api"],
  },
  "vezpec-api": {
    description: "Backend API for the desktop app. Currently not running.",
    path: "J:/Logistics/vezpec and vezpec global/call_ai/backend",
  },
  "vezpec-call_ai-watcher": {
    description: "Background worker for the call_ai pipeline.",
    path: "J:/Logistics/vezpec and vezpec global/call_ai",
    connects: ["vezpec-api"],
  },
  "vezpec-voice": {
    description: "Text-to-speech and voice-cloning engine, with its own built-in UI.",
    url: "https://voice.vezpec.com",
    path: "C:/VEZPEC/vezpec-voice",
    port: "8765",
  },
  "vezpec-omnivoice": {
    description: "Companion voice service. Stopped by design - not meant to run continuously.",
    path: "C:/VEZPEC/vezpec-voice",
  },
  "voice-studio": {
    description: "Vite + React front end for Voice Studio. Calls the TTS engine straight from the browser.",
    url: "https://voice2.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/voice-studio",
    port: "4173",
    connects: ["vezpec-voice"],
  },
  "youtube-sync": {
    description: "VideoTogether sync server - keeps a group watching the same video in lockstep.",
    url: "https://youtube-sync.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/VideoTogether/source/go-server",
    port: "5001",
  },

  // --- Sales platform -------------------------------------------------
  "vezpec-sales-api": {
    description: "NestJS backend for the Sales Intelligence & Outreach platform. Lead-sourcing services push into its /intake/leads endpoint.",
    url: "https://sales-api.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/vezpec-sales-platform",
    port: "3300",
  },
  "vezpec-sales-dashboard": {
    description: "Dashboard for managing leads, campaigns and outreach.",
    url: "https://sales.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/vezpec-sales-platform",
    port: "3301",
    connects: ["vezpec-sales-api"],
  },
  "vezpec-sales-ingestion": {
    description: "Worker that pulls new leads in from the lead-sourcing pipelines.",
    path: "J:/Logistics/vezpec and vezpec global/vezpec-sales-platform",
    connects: ["vezpec-sales-api"],
  },
  "vezpec-sales-crm-sync": {
    description: "Worker keeping the CRM in sync with the sales platform.",
    path: "J:/Logistics/vezpec and vezpec global/vezpec-sales-platform",
    connects: ["vezpec-sales-api"],
  },
  "vezpec-sales-enrichment": {
    description: "Worker that enriches lead records with extra contact and firmographic data.",
    path: "J:/Logistics/vezpec and vezpec global/vezpec-sales-platform",
    connects: ["vezpec-sales-api"],
  },

  // --- Email tracker --------------------------------------------------
  "emailtracker-api": {
    description: "FastAPI backend serving the tracking pixel and click-through redirects. Send/open/click events score leads and fill the sales call queue.",
    url: "https://tracker-api.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/email-tracker/backend",
    port: "8100",
    connects: ["vezpec-sales-api"],
  },
  "emailtracker-admin": {
    description: "Admin dashboard for open/click analytics on tracked campaigns.",
    url: "https://tracker.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/email-tracker/admin",
    port: "8101",
    connects: ["emailtracker-api"],
  },
  quickly: {
    description: "Cold-email outreach automation - API and prebuilt UI in one process. Sends outbound webhooks to n8n and pushes leads to the sales platform.",
    url: "https://quickly.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/quickly-cold-email",
    port: "8010",
    connects: ["n8n", "vezpec-sales-api"],
  },

  // --- Osho automation ------------------------------------------------
  "osho-player": {
    description: "Public browse-and-listen archive of Osho's Hindi discourses.",
    url: "https://osho.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/Osho Automation/osho-player",
    port: "8788",
    connects: ["osho-web-integration"],
  },
  "osho-reel-studio": {
    description: "Generate and approve short-form reels from the audio archive. No login by default - not linked anywhere public.",
    url: "https://studio.vezpec.com",
    path: "J:/Osho Automation/osho-reel-studio",
    port: "8001",
    connects: ["osho-social-publisher"],
  },
  "osho-web-integration": {
    description: "Read-only API feeding reel data to the public player.",
    url: "https://reels.vezpec.com",
    path: "J:/Osho Automation/osho-web-integration",
    port: "8005",
  },
  "osho-social-publisher": {
    description: "Publishes approved reels out to the social platforms.",
    url: "https://publisher.vezpec.com",
    path: "J:/Osho Automation/osho-social-publisher",
    port: "8002",
    connects: ["osho-social-analytics"],
  },
  "osho-social-analytics": {
    description: "Tracks engagement and performance of published reels.",
    url: "https://analytics.vezpec.com",
    path: "J:/Osho Automation/osho-social-analytics",
    port: "8003",
  },
  "whatsapp-automation": {
    description: "WhatsApp bot tied into the Osho content pipeline.",
    path: "J:/Osho Automation/whatsapp-automation",
    port: "8004",
  },

  // --- Todo -----------------------------------------------------------
  vikunja: {
    description: "Core task/project-management engine. Reached through vikunja-theme-proxy, never directly.",
    path: "J:/Logistics/vezpec and vezpec global/vikunja-src",
    port: "3591",
  },
  "vikunja-theme-proxy": {
    description: "Reverse proxy that re-skins Vikunja with Vezpec branding, and the only public way in.",
    url: "https://todo.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/vikunja/theme-proxy",
    port: "3592",
    connects: ["vikunja"],
  },

  // --- Android streaming ----------------------------------------------
  "android-emulator": {
    description: "Containerized Android emulator used for the streaming demo.",
    path: "J:/Logistics/vezpec and vezpec global/android-emulator-container-scripts",
    port: "5554, 5555, 8554",
  },
  "android-gateway": {
    description: "Gateway and signaling layer sitting in front of the emulator.",
    path: "J:/Logistics/vezpec and vezpec global/android-emulator-container-scripts/gateway",
    port: "8080",
    connects: ["android-emulator"],
  },
  "android-web": {
    description: "WebRTC front end for watching and controlling the streamed emulator.",
    url: "https://android.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/android-emulator-container-scripts/js/example",
    port: "5173",
    connects: ["android-gateway"],
  },

  // --- Platform / infra -----------------------------------------------
  "cloudflare-tunnel": {
    description: "The Cloudflare Tunnel. Routes every *.vezpec.com hostname on this page to the right local port - if this stops, every public URL here goes down.",
    path: "C:/Users/test/.cloudflared/config.yml",
    port: "20241",
  },
  n8n: {
    description: "Workflow-automation engine used for internal automations and inbound webhooks.",
    url: "https://automation.vezpec.com",
    path: "J:/Logistics/n8n",
    port: "5678",
  },
  "kan-web": {
    description: "Kan - an open-source Trello-style board, used internally. Not exposed publicly.",
    path: "J:/Logistics/kan",
    port: "3501",
  },
  "zero-mail": {
    description: "Self-hosted Mail-0/Zero client for Microsoft 365. The frontend and API are isolated so a UI watcher failure cannot take mail sync down.",
    url: "https://mail.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/zero-mail",
    port: "3002",
    connects: ["zero-mail-api"],
  },
  "zero-mail-api": {
    description: "Zero Mail API and Microsoft 365 synchronization worker running on Cloudflare's local Workers runtime.",
    url: "https://mail-api.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/zero-mail",
    port: "8787",
  },

  // --- pm2.web (this tool) --------------------------------------------
  "pm2.web-mongo": {
    description: "MongoDB behind this dashboard. Single-node replica set (rs0) because the agent needs change streams. Bound to 127.0.0.1 - never exposed.",
    path: "J:/Logistics/vezpec and vezpec global/pm2-web-mongodb",
    port: "27017",
  },
  "pm2.web-daemon": {
    description: "The agent. Reads PM2's live process data and writes it into Mongo - if this stops, every process on this page goes stale.",
    path: "J:/Logistics/vezpec and vezpec global/pm2-web",
    connects: ["pm2.web-mongo"],
  },
  "pm2.web-dashboard": {
    description: "The dashboard you are looking at right now.",
    url: "https://pm2.vezpec.com",
    path: "J:/Logistics/vezpec and vezpec global/pm2-web",
    port: "3600",
    connects: ["pm2.web-mongo"],
  },
};
