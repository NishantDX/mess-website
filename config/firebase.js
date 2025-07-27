const admin = require("firebase-admin");

// Use environment variables for Firebase config when available (for production)
// Fall back to JSON file for local development
let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY) {
  // Production: Use environment variables
  serviceAccount = {
    type: process.env.FIREBASE_TYPE || "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
  };
} else {
  // Development: Use JSON file
  try {
    serviceAccount = require("./firebaseAdminKey.json");
  } catch (error) {
    console.error(
      "Firebase admin key file not found. Make sure to set environment variables for production or add firebaseAdminKey.json for development."
    );
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
