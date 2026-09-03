/**
 * Backfill synthetic attendance so the admin charts have history right away.
 *
 *   node scripts/backfillAttendance.js [days]     (default 45)
 *
 * Idempotent. Only writes rows for SIM students. Rows carry a real-dated
 * createdAt, so the 90-day TTL on the attendance collection prunes them on
 * schedule and storage stays bounded.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const AttendanceSimulator = require("../services/attendanceSimulator");

const DAYS = parseInt(process.argv[2], 10) || 45;

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  await mongoose.connect(process.env.MONGO_URI);

  const sim = new AttendanceSimulator();
  const total = await sim.backfill(DAYS);
  console.log(`Backfill done: ${total} attendance rows over ${DAYS} days.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Backfill failed:", err.message);
  process.exit(1);
});
