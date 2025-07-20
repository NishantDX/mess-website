const Student = require("../models/studentModel");
const mongoose = require("mongoose");



// POST /api/students/signup
const signup = async (req, res) => {
  try {
    const {  student_id, name, email, phone, department } = req.body;
    const uid = req.user.uid;


    // Check if student already exists in DB
    const existing = await Student.findOne({ student_id });
    if (existing) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    // Create student profile in DB
    const newStudent = await Student.create({
            uid,
            student_id,
            name,
            email,
            phone,
            department,
          });
          res.status(200).json(newStudent);

    res.status(201).json({ message: "Student profile created", newStudent });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// async function addStudent(req, res) {
//   const { uid, student_id, name, email, department } = req.body;

//   const existingStudent = await Student.findOne({ uid });
//   if (existingStudent) {
//     return res.status(400).json({ message: "Student already exists" });
//   }

//   try {
//     const newStudent = await Student.create({
//       uid,
//       student_id,
//       name,
//       email,
//       phone,
//       department,
//     });
//     res.status(400).json(newStudent);
//   } catch (error) {
//     res.status(400).json({ message: "Server error", error: error.message });
//   }
// }

async function getStudents(req, res) {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function getStudentById(req, res) {
  try {
    const { student_id } = req.params;
    const student = await Student.findOne({ student_id: student_id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function updateStudent(req, res) {
  try {
    const { student_id } = req.params;
    const { name, phone, department } = req.body;

    const updatedStudent = await Student.findOneAndUpdate(
      { student_id },
      { name, phone, department },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res
      .status(200)
      .json({ message: "Student updated", student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
const deleteStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    // Remove student from MongoDB
    const deletedStudent = await Student.findOneAndDelete({ student_id });
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove student from Firebase Authentication
    await admin.auth().deleteUser(deletedStudent.uid);

    res.status(200).json({ message: "Student removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = { signup, getStudents, getStudentById, updateStudent, deleteStudent };