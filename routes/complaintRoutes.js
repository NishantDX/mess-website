const express = require("express");
const {
  registerComplaint,
  getStudentComplaints,
  getAllComplaints,
  resolveComplaint,
} = require("../controllers/complaintController");

const router = express.Router();

// Student registers complaint
router.post("/", registerComplaint);

// View all complaints (for staff/admin) - must come before /:student_id route
router.get("/", getAllComplaints);

// View complaints of a specific student
router.get("/:student_id", getStudentComplaints);

// Resolve a complaint
router.put("/:complaint_id", resolveComplaint);

module.exports = router;