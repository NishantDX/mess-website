const express = require("express");
const router = express.Router();
const { 
  addAnnouncement,
  getAnnouncements,
  removeAnnouncement,
  updateAnnouncement
} = require("../controllers/announcementController");
const { verifyToken, verifyAdmin } = require("../middleware/firebaseAdmin");

// Public routes
router.get("/", getAnnouncements);  // Anyone can view announcements

// Protected routes (admin only)
router.post("/", verifyToken, verifyAdmin, addAnnouncement);  // Only admins can create
router.put("/:id", verifyToken, verifyAdmin, updateAnnouncement);  // Only admins can update
router.delete("/:id", verifyToken, verifyAdmin, removeAnnouncement);  // Only admins can delete

module.exports = router;