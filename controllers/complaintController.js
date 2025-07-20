const Complaint = require("../models/complaintsModel");

// 1️⃣ Register a complaint (Student)
const registerComplaint = async (req, res) => {
  try {
    const { student_id, name, issue } = req.body;

    if (!student_id || !name || !issue) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const complaint = new Complaint({ student_id, name, issue });
    await complaint.save();

    res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (error) {
    res.status(500).json({ message: "Failed to register complaint", error: error.message });
  }
};

// 2️⃣ Get all complaints of a student
const getStudentComplaints = async (req, res) => {
  try {
    const { student_id } = req.params;

    const complaints = await Complaint.find({ student_id }).sort({ timestamp: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

// 3️⃣ Get all complaints (for staff/admin)
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ timestamp: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

// 4️⃣ Resolve a complaint
const resolveComplaint = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const { resolutionNote } = req.body;

    const complaint = await Complaint.findById(complaint_id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "resolved";
    complaint.resolutionNote = resolutionNote || "";
    await complaint.save();

    res.status(200).json({ message: "Complaint resolved", complaint });
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve complaint", error: error.message });
  }
};

module.exports = {
  registerComplaint,
  getStudentComplaints,
  getAllComplaints,
  resolveComplaint
};