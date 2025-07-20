const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/firebaseAdmin");
const {
  markAttendance,
  getAttendance,
  getAttendanceByDate,
} = require("../controllers/attendanceController");

router.post("/", verifyToken, markAttendance); // Mark attendance (NFC scan)
router.post("/internal", markAttendance); // Internal attendance marking for cron jobs (no auth needed)
router.get("/:student_id", verifyToken, getAttendance); // Get attendance history of a student
router.get("/date/:date", verifyToken, getAttendanceByDate); // Get attendance by date
//router.get("/bill/:student_id", verifyToken, calculateStudentBill); // Calculate mess fee for student

module.exports = router;
