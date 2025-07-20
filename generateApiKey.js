const crypto = require("crypto");

// Generate a secure random API key
const apiKey = crypto.randomBytes(32).toString("hex");

console.log("Generated Internal API Key:");
console.log(apiKey);
console.log("\nAdd this to your .env file:");
console.log(`INTERNAL_API_KEY=${apiKey}`);
console.log("\nKeep this key secure and do not share it!");
