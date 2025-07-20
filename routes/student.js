const express = require("express");
const router = express.Router();
const {
  signup,
  getStudents,
  deleteStudent,
  updateStudent,
  getStudentById,
} = require("../controllers/studentController");
const {verifyToken} = require("../middleware/firebaseAdmin");
const authMiddleware=require("../middleware/requireAuth")
router.post("/signup", verifyToken, signup); // Register a new student
router.get("/", verifyToken, getStudents); // Get all students
router.get("/:student_id", verifyToken, getStudentById); // Get student by ID
router.patch("/:student_id", verifyToken, updateStudent); // Update student details
router.delete("/:student_id", verifyToken, deleteStudent); // Delete student
module.exports=router;