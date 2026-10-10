// One-time setup: turns the standalone mongod into a single-node replica
// set, which MongoDB requires for change streams (pm2.web's backend relies
// on them to relay restart/stop/delete actions). Safe to run more than
// once - already-initialized is treated as success, not an error.
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true");
  const admin = mongoose.connection.db.admin();
  try {
    await admin.command({
      replSetInitiate: {
        _id: "rs0",
        members: [{ _id: 0, host: "127.0.0.1:27017" }],
      },
    });
    console.log("Replica set rs0 initiated.");
  } catch (e) {
    if (e.codeName === "AlreadyInitialized") {
      console.log("Replica set rs0 was already initiated - nothing to do.");
    } else {
      throw e;
    }
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
