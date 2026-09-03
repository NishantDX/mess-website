/**
 * Seed synthetic students for the demo dataset.
 *
 *   node scripts/seedStudents.js [count]      (default 200)
 *
 * Idempotent — re-running only fills gaps. Only ever creates students whose
 * student_id starts with "SIM"; never touches real records.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/studentModel");
const { makeStudent } = require("../services/simData");

const COUNT = parseInt(process.argv[2], 10) || 200;

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  await mongoose.connect(process.env.MONGO_URI);

  const docs = Array.from({ length: COUNT }, (_, i) => makeStudent(i + 1));
  const ops = docs.map((d) => ({
    updateOne: {
      filter: { student_id: d.student_id },
      update: { $setOnInsert: d },
      upsert: true,
    },
  }));

  const res = await Student.bulkWrite(ops, { ordered: false });
  const created = res.upsertedCount || 0;
  const total = await Student.countDocuments({ student_id: { $regex: "^SIM" } });
  console.log(`Seed done: +${created} new, ${total} synthetic students total.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
