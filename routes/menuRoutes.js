const express = require("express");
const {
  addOrUpdateMenu,
  getMenuByDate,
  getWeeklyMenu,
  getMenuByDay,
} = require("../controllers/menuController");
const {verifyToken} = require("../middleware/firebaseAdmin"); // If you need authentication

const router = express.Router();

// Add or update menu (admin only)
router.post("/", verifyToken, addOrUpdateMenu);

// Get menu for a specific date (returns menu for that day of week)
router.get("/date/:date", getMenuByDate);

// Get menu for a specific day
router.get("/day/:day", getMenuByDay);

// Get all menus for the week
router.get("/week", getWeeklyMenu);

module.exports = router;
