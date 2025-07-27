// Script to generate Firebase admin key file from environment variables
// This runs before the main application starts

const fs = require("fs");
const path = require("path");

function generateFirebaseKeyFile() {
  // Check if we're in production and have environment variables
  if (process.env.FIREBASE_PRIVATE_KEY) {
    const firebaseConfig = {
      type: process.env.FIREBASE_TYPE || "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
    };

    const keyFilePath = path.join(__dirname, "firebaseAdminKey.json");

    try {
      fs.writeFileSync(keyFilePath, JSON.stringify(firebaseConfig, null, 2));
      console.log(
        "✅ Firebase admin key file generated from environment variables"
      );
    } catch (error) {
      console.error("❌ Error generating Firebase key file:", error);
      process.exit(1);
    }
  } else {
    // Check if file exists for development
    const keyFilePath = path.join(__dirname, "firebaseAdminKey.json");
    if (!fs.existsSync(keyFilePath)) {
      console.error(
        "❌ Firebase admin key file not found and no environment variables set"
      );
      console.log("For development: Add firebaseAdminKey.json file");
      console.log("For production: Set Firebase environment variables");
      process.exit(1);
    }
    console.log("✅ Using existing Firebase admin key file");
  }
}

module.exports = generateFirebaseKeyFile;
