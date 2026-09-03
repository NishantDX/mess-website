const Student = require("../models/studentModel");
const Attendance = require("../models/attendanceModel");
const admin = require("../config/firebase");
const Payment = require("../models/paymentModel");
const Admin = require("../models/adminModel");
const moment = require("moment");

const createAdmin = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Set custom claims to mark as admin
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin" });

    // 3. Create admin in your database
    const newAdmin = new Admin({
      uid: userRecord.uid,
      name,
      email,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        uid: userRecord.uid,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/stats/students
const getTotalStudents = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    res.status(200).json({ totalStudents: total });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching students", error: error.message });
  }
};

// GET /api/stats/meals/today
const getMealsServedToday = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    // Get total meals for today
    const totalMeals = await Attendance.countDocuments({ date: today });

    // Get count for each meal type
    const breakfastCount = await Attendance.countDocuments({
      date: today,
      attendance: "breakfast",
    });

    const lunchCount = await Attendance.countDocuments({
      date: today,
      attendance: "lunch",
    });

    const dinnerCount = await Attendance.countDocuments({
      date: today,
      attendance: "dinner",
    });

    // Return comprehensive meal data
    res.status(200).json({
      mealsServedToday: totalMeals,
      mealBreakdown: {
        breakfast: breakfastCount,
        lunch: lunchCount,
        dinner: dinnerCount,
      },
    });
  } catch (error) {
    console.error("Error fetching meal data:", error);
    res
      .status(500)
      .json({ message: "Error fetching meals", error: error.message });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const { date, student_id, meal } = req.query;
    const query = {};

    // Apply filters if provided
    if (date) query.date = date;
    if (student_id) query.student_id = student_id;
    if (meal) query.attendance = meal;

    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1, attendance: 1 })
      .limit(req.query.limit ? parseInt(req.query.limit) : 1000);

    // Count total records matching the query
    const totalRecords = await Attendance.countDocuments(query);

    // How many distinct days the data spans (used for average-attendance math)
    const distinctDates = await Attendance.distinct("date", query);

    // Get meal distribution
    const mealDistribution = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$attendance",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format meal distribution
    const mealCounts = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
    };

    mealDistribution.forEach((item) => {
      if (mealCounts.hasOwnProperty(item._id)) {
        mealCounts[item._id] = item.count;
      }
    });

    res.status(200).json({
      totalRecords,
      totalDays: distinctDates.length,
      mealCounts,
      records: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res
      .status(500)
      .json({
        message: "Error fetching attendance records",
        error: error.message,
      });
  }
};

// GET /api/stats/revenue/month
const getMonthlyRevenue = async (req, res) => {
  try {
    const startOfMonth = moment().startOf("month").toDate(); // Use Date object instead of string
    const endOfMonth = moment().endOf("month").toDate();

    const payments = await Payment.find({
      timestamp: { $gte: startOfMonth, $lte: endOfMonth }, // Changed from 'date' to 'timestamp'
      status: "success", // Only count successful payments
    });

    const totalRevenue = payments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );

    res.status(200).json({ monthlyRevenue: totalRevenue });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res
      .status(500)
      .json({ message: "Error calculating revenue", error: error.message });
  }
};

module.exports = {
  getTotalStudents,
  getMealsServedToday,
  getMonthlyRevenue,
  createAdmin,
  getAllAttendance
};
