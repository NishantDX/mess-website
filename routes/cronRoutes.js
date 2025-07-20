const express = require("express");
const router = express.Router();
const CronService = require("../services/cronService");

// Test endpoint to manually trigger attendance marking
router.post("/test-attendance", async (req, res) => {
  try {
    const cronService = new CronService();
    const results = await cronService.testAttendanceMarking();

    res.status(200).json({
      message: "Test attendance marking completed",
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error testing attendance marking",
      error: error.message,
    });
  }
});

// Get cron job status
router.get("/status", (req, res) => {
  res.status(200).json({
    message: "Cron service is running",
    timestamp: new Date().toISOString(),
    scheduledJobs: [
      "Breakfast: 7-9 AM (only if selected for the day)",
      "Lunch: 12-2 PM (only if selected for the day)",
      "Dinner: 7-9 PM (only if selected for the day)",
      "Random: 6 AM, 9 AM, 3 PM, 6 PM (from daily meal plan)",
      "Plan Reset: Midnight (generates new daily meal combination)",
    ],
    note: "Each day, 1-3 meals are randomly selected. Attendance is only marked for selected meals.",
  });
});

module.exports = router;
