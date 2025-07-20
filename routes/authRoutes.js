const express = require("express");
const router = express.Router();
const { login } = require("../controllers/loginController");
const { verifyToken } = require("../middleware/firebaseAdmin");

// The verifyToken middleware will validate the Firebase token
// and attach the decoded user data to req.user
router.get("/login", verifyToken, login);

module.exports = router;