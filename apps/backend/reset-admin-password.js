// Resets the password of the pm2.web owner account.
// Usage: node reset-admin-password.js [email]
// Prints the generated password once - it is never stored in plaintext.
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Ambiguous characters (O/0, l/1/I) left out so it can be typed reliably.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const SYMBOLS = "!@#$%^&*-_=+";

function generatePassword(length = 20) {
  const chars = ALPHABET + SYMBOLS;
  let out = "";
  while (out.length < length) {
    const byte = crypto.randomBytes(1)[0];
    // Reject values that would bias the modulo, then map into the alphabet.
    if (byte >= 256 - (256 % chars.length)) continue;
    out += chars[byte % chars.length];
  }
  return out;
}

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/pm2web?directConnection=true");
  const users = mongoose.connection.db.collection("users");

  const email = process.argv[2];
  const query = email ? { email } : { "acl.owner": true };
  const user = await users.findOne(query);

  if (!user) {
    console.error("No matching user found.");
    process.exit(1);
  }

  const password = generatePassword();
  const hash = await bcrypt.hash(password, 10);

  await users.updateOne({ _id: user._id }, { $set: { password: hash } });

  // Prove the new password actually validates against what was stored.
  const stored = await users.findOne({ _id: user._id });
  const verified = await bcrypt.compare(password, stored.password);

  console.log("EMAIL    :", user.email);
  console.log("NAME     :", user.name);
  console.log("OWNER    :", user.acl?.owner === true);
  console.log("PASSWORD :", password);
  console.log("VERIFIED :", verified ? "yes - login will accept this" : "NO - something is wrong");

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
