const Attendance = require('../models/attendanceModel');
const moment = require('moment');

const getPredictedAttendance = async (req, res) => {
  try {
    const attendanceData = await Attendance.find({});

    const dayCount = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    attendanceData.forEach(record => {
      const weekday = moment(record.date, "YYYY-MM-DD").format('dddd');
      dayCount[weekday]++;
    });

    res.status(200).json({ predictions: dayCount });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getPredictedAttendance };
