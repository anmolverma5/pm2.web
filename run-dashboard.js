// Runs the ALREADY-BUILT dashboard. Deliberately does not go through
// "turbo run start", because turbo.json makes the start task depend on
// lint + build - which means every PM2 restart would re-lint and rebuild
// into the same .next folder the previous server is still serving from.
// That race corrupted .next/BUILD_ID once already (stale build served ->
// 404s on _buildManifest.js -> React never hydrates -> the login form
// degrades to a plain HTML GET with the password in the URL), and a single
// lint error would take the whole dashboard down.
//
// Build explicitly at deploy time instead - start-pm2-web.ps1 does that
// once, before anything is started.
const { execSync } = require("child_process");
const path = require("path");

execSync("pnpm exec next start -p 3600 -H 127.0.0.1", {
  stdio: "inherit",
  cwd: path.join(__dirname, "apps", "dashboard"),
});
