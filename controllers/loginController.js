const Student = require("../models/studentModel");
const Admin = require("../models/adminModel");

// /**
//  * User login controller - handles both students and admins
//  * @route POST /api/auth/login
//  */
const login = async (req, res) => {
  try {
    // The user's Firebase UID comes from the verified token
    const uid = req.user.uid;
    
    if (!uid) {
      return res.status(400).json({ message: "Authentication failed - invalid user" });
    }
    
    // First check if user is an admin
    let admin = await Admin.findOne({ uid });
    
    if (admin) {
      return res.status(200).json({
        message: "Admin login successful",
        user: {
          uid: admin.uid,
          name: admin.name,
          email: admin.email,
          role: "admin"
        }
      });
    }
    
    // If not an admin, check if they are a student
    let student = await Student.findOne({ uid });
    
    if (student) {
      return res.status(200).json({
        message: "Student login successful",
        user: {
          uid: student.uid,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          department: student.department,
          role: "student"
        }
      });
    }
    
    // User exists in Firebase but not in our database
    return res.status(404).json({ 
      message: "User not found. Please complete registration first." 
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { login };