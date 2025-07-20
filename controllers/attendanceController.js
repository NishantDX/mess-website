const Attendance = require("../models/attendanceModel");
const Student = require("../models/studentModel");

/**
 * Mark attendance for a student for a specific meal
 */
async function markAttendance(req, res) {
  try {
    const { student_id, attendance } = req.body;
    const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format

    // Validate meal type
    if (!["breakfast", "lunch", "dinner"].includes(attendance)) {
      return res.status(400).json({ message: "Invalid meal type. Must be 'breakfast', 'lunch', or 'dinner'" });
    }

    // Check if student exists
    const student = await Student.findOne({ student_id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if already marked for today for this meal type
    const alreadyMarked = await Attendance.findOne({ 
      student_id, 
      date: today, 
      attendance: attendance 
    });
    
    if (alreadyMarked) {
      return res.status(400).json({ 
        message: `${attendance} attendance already marked for today` 
      });
    }

    // Mark attendance
    const newAttendance = new Attendance({
      student_id,
      date: today,
      attendance: attendance
    });
    await newAttendance.save();

    res.status(201).json({
      message: `${attendance} attendance marked successfully`,
      attendance: newAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * Get all attendance records for a specific student
 */
async function getAttendance(req, res) {
  try {
    const { student_id } = req.params;
    const attendanceRecords = await Attendance.find({ student_id });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    // Return records in the format you want - an array of complete records
    res.status(200).json({
      student_id,
      records: attendanceRecords
    });
    
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * Get all attendance records for a specific date
 */
async function getAttendanceByDate(req, res) {
  try {
    const { date } = req.params;
    const { meal } = req.query; // Optional meal filter
    
    // Build query
    const query = { date };
    if (meal) {
      if (!["breakfast", "lunch", "dinner"].includes(meal)) {
        return res.status(400).json({ message: "Invalid meal type" });
      }
      query.attendance = meal;
    }
    
    const attendanceRecords = await Attendance.find(query);

    if (!attendanceRecords.length) {
      return res.status(404).json({ 
        message: `No attendance records found for ${meal || 'any meal'} on ${date}` 
      });
    }

    // Group by meal type for better organization
    const mealCounts = {
      breakfast: 0,
      lunch: 0,
      dinner: 0
    };

    attendanceRecords.forEach(record => {
      mealCounts[record.attendance]++;
    });

    // Total students count for each meal
    const summary = {
      date,
      total: attendanceRecords.length,
      mealCounts,
      details: attendanceRecords
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * Get attendance stats for a specific date range
 */
async function getAttendanceStats(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    const attendanceRecords = await Attendance.find(query);

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found for this date range" });
    }

    // Calculate statistics
    const stats = {
      dateRange: `${startDate} to ${endDate}`,
      totalMeals: attendanceRecords.length,
      mealBreakdown: {
        breakfast: attendanceRecords.filter(r => r.attendance === "breakfast").length,
        lunch: attendanceRecords.filter(r => r.attendance === "lunch").length,
        dinner: attendanceRecords.filter(r => r.attendance === "dinner").length
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = { 
  markAttendance, 
  getAttendance, 
  getAttendanceByDate,
  getAttendanceStats
};