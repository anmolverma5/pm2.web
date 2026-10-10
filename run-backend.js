// Runs the ALREADY-BUILT backend agent (apps/backend/dist). Same reasoning
// as run-dashboard.js: "turbo run start" would re-lint and rebuild on every
// PM2 restart, so a lint error anywhere in the repo would stop the agent
// that feeds the dashboard its data. Build at deploy time instead -
// start-pm2-web.ps1 does that once, before anything is started.
const { execSync } = require("child_process");
const path = require("path");

execSync("node dist/index.js", {
  stdio: "inherit",
  cwd: path.join(__dirname, "apps", "backend"),
});
