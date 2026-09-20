const Attendance = require('../models/attendanceModel');
const moment = require('moment');

/**
 * Forecasts expected meal turnout for a given date (default: tomorrow),
 * using the average historical attendance on that same day of the week.
 *
 * This is a simple heuristic, not a trained model: it looks at every past
 * date that fell on the same weekday as the target date (e.g. every past
 * Monday, if forecasting a Monday), and averages how many students ate each
 * meal on those days. It does not track food quantities or wastage — it
 * only estimates expected headcount per meal, which a kitchen could use as
 * an input when deciding how much to prepare.
 */
const getDemandForecast = async (req, res) => {
  try {
    const targetDate = req.query.date
      ? moment(req.query.date, "YYYY-MM-DD", true)
      : moment().add(1, "day");

    if (!targetDate.isValid()) {
      return res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD." });
    }

    const targetDateStr = targetDate.format("YYYY-MM-DD");
    const targetWeekday = targetDate.format("dddd");

    const attendanceData = await Attendance.find({});

    // Group historical records by date, restricted to the same weekday as
    // the target date, so we're comparing "past Mondays" to "this Monday"
    // rather than mixing in unrelated days of the week.
    const mealCountsByDate = {};

    attendanceData.forEach((record) => {
      if (record.date === targetDateStr) return; // never count the day we're forecasting
      const recordWeekday = moment(record.date, "YYYY-MM-DD").format("dddd");
      if (recordWeekday !== targetWeekday) return;

      if (!mealCountsByDate[record.date]) {
        mealCountsByDate[record.date] = { breakfast: 0, lunch: 0, dinner: 0 };
      }
      if (mealCountsByDate[record.date][record.attendance] !== undefined) {
        mealCountsByDate[record.date][record.attendance]++;
      }
    });

    const pastDates = Object.keys(mealCountsByDate);
    const occurrences = pastDates.length;

    const totals = { breakfast: 0, lunch: 0, dinner: 0 };
    pastDates.forEach((d) => {
      totals.breakfast += mealCountsByDate[d].breakfast;
      totals.lunch += mealCountsByDate[d].lunch;
      totals.dinner += mealCountsByDate[d].dinner;
    });

    const forecast = occurrences > 0
      ? {
          breakfast: Math.round(totals.breakfast / occurrences),
          lunch: Math.round(totals.lunch / occurrences),
          dinner: Math.round(totals.dinner / occurrences),
        }
      : { breakfast: 0, lunch: 0, dinner: 0 };

    res.status(200).json({
      targetDate: targetDateStr,
      dayOfWeek: targetWeekday,
      forecast,
      basedOnPastOccurrences: occurrences,
      method: "Average historical attendance for this day of the week (simple heuristic, not a trained model).",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getDemandForecast };
