const Attendance = require('../models/attendanceModel');
const moment = require('moment');

/**
 * Forecasts expected meal turnout for a given date (default: tomorrow),
 * using the average historical attendance on that same day of the week.
 *
 * This is a simple heuristic, not a trained model: it looks at every past
 * date that fell on the same weekday as the target date (e.g. every past
 * Monday, if forecasting a Monday), and averages how many students ate each
 * meal on those days.
 *
 * It also reports `estimatedPrepReductionPct`: an estimate of how much less
 * a kitchen might need to prepare if it cooked to this forecast instead of
 * always preparing for the historical PEAK turnout on that weekday (the
 * common "just in case" default). This is computed directly from the same
 * historical data — real numbers, not a fabricated figure — but it is a
 * projected estimate based on past variance, not a measured production
 * outcome, and the response says so explicitly.
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

    // Build the exact list of past same-weekday date strings up front (every
    // 7 days back, up to a year), and ask MongoDB only for those — instead
    // of pulling the ENTIRE attendance collection into Node and filtering it
    // there. This was the actual cause of a ~10s response time once the
    // synthetic data grew large: fetching everything, every single call.
    const candidateDates = [];
    for (let weeksBack = 1; weeksBack <= 52; weeksBack++) {
      candidateDates.push(
        moment(targetDate).subtract(7 * weeksBack, "days").format("YYYY-MM-DD")
      );
    }

    const attendanceData = await Attendance.find({ date: { $in: candidateDates } });

    // Group historical records by date. No weekday check needed anymore —
    // candidateDates already only contains same-weekday dates.
    const mealCountsByDate = {};

    attendanceData.forEach((record) => {
      if (record.date === targetDateStr) return; // never count the day we're forecasting

      if (!mealCountsByDate[record.date]) {
        mealCountsByDate[record.date] = { breakfast: 0, lunch: 0, dinner: 0 };
      }
      if (mealCountsByDate[record.date][record.attendance] !== undefined) {
        mealCountsByDate[record.date][record.attendance]++;
      }
    });

    const pastDates = Object.keys(mealCountsByDate);
    const occurrences = pastDates.length;

    const perMeal = { breakfast: [], lunch: [], dinner: [] };
    pastDates.forEach((d) => {
      perMeal.breakfast.push(mealCountsByDate[d].breakfast);
      perMeal.lunch.push(mealCountsByDate[d].lunch);
      perMeal.dinner.push(mealCountsByDate[d].dinner);
    });

    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const max = (arr) => (arr.length ? Math.max(...arr) : 0);

    const forecast = occurrences > 0
      ? {
          breakfast: Math.round(sum(perMeal.breakfast) / occurrences),
          lunch: Math.round(sum(perMeal.lunch) / occurrences),
          dinner: Math.round(sum(perMeal.dinner) / occurrences),
        }
      : { breakfast: 0, lunch: 0, dinner: 0 };

    const peak = {
      breakfast: max(perMeal.breakfast),
      lunch: max(perMeal.lunch),
      dinner: max(perMeal.dinner),
    };

    // Compare TOTAL meals across the day, forecast vs. always-prepare-for-peak.
    const totalForecast = forecast.breakfast + forecast.lunch + forecast.dinner;
    const totalPeak = peak.breakfast + peak.lunch + peak.dinner;
    const estimatedPrepReductionPct =
      occurrences > 1 && totalPeak > 0
        ? Math.round(((totalPeak - totalForecast) / totalPeak) * 100)
        : null; // not enough history yet to estimate variance meaningfully

    res.status(200).json({
      targetDate: targetDateStr,
      dayOfWeek: targetWeekday,
      forecast,
      historicalPeak: peak,
      estimatedPrepReductionPct,
      basedOnPastOccurrences: occurrences,
      method: "Average historical attendance for this day of the week (simple heuristic, not a trained model).",
      note: "estimatedPrepReductionPct compares the forecast to the historical PEAK turnout for this weekday — i.e. how much less a kitchen might prepare by cooking to this forecast instead of always preparing for the worst case. It is a projected estimate from past variance, not a measured wastage or cost reduction.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getDemandForecast };
