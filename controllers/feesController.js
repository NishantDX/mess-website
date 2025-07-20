const Attendance = require("../models/attendanceModel");
const Student = require("../models/studentModel");

const costPerMeal = 50;

 const calculateStudentFees = async (req, res) => {
  try {
    const { student_id } = req.params;

    const student = await Student.findOne({ student_id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Count all attendance entries (each = 1 meal eaten)
    const mealsEaten = await Attendance.countDocuments({ student_id });
    const totalFees = mealsEaten * costPerMeal;

    return res.status(200).json({
      student_id,
      name: student.name,
      mealsEaten,
      costPerMeal,
      totalFees,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

 const getAllStudentsFees = async (req, res) => {
  try {
    const students = await Student.find();
    const feesData = [];

    for (let student of students) {
      const mealsEaten = await Attendance.countDocuments({
        student_id: student.student_id,
      });

      const totalFees = mealsEaten * costPerMeal;

      feesData.push({
        student_id: student.student_id,
        name: student.name,
        mealsEaten,
        totalFees,
      });
    }

    return res.status(200).json(feesData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports={calculateStudentFees,getAllStudentsFees}