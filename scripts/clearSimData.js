/**
 * Remove ALL synthetic demo data (SIM students + their attendance).
 *
 *   node scripts/clearSimData.js
 *
 * Real records are matched by student_id NOT starting with "SIM" and are left
 * alone.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/studentModel");
const Attendance = require("../models/attendanceModel");

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  await mongoose.connect(process.env.MONGO_URI);

  const rx = { $regex: "^SIM" };
  const a = await Attendance.deleteMany({ student_id: rx });
  const s = await Student.deleteMany({ student_id: rx });
  console.log(`Removed ${s.deletedCount} synthetic students and ${a.deletedCount} attendance rows.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Clear failed:", err.message);
  process.exit(1);
});
