const express = require("express");
const { 
  calculateStudentFees, 
  getAllStudentsFees 
} = require("../controllers/feesController");

const router = express.Router();

// Get all students' fees
router.get("/", getAllStudentsFees);  

// Get individual student's fees - must come after the "/" route to avoid conflicts
router.get("/:student_id", calculateStudentFees); 

module.exports = router;