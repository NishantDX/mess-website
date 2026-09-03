/**
 * Attendance simulator (demo data only).
 *
 * The mess system was never rolled out to a real hostel, so this generates a
 * realistic daily attendance stream for the synthetic students (student_id
 * starting with "SIM") — enough volume to exercise the by-meal aggregation,
 * the weekly-trends chart and the fee logic.
 *
 * It is OFF unless SIMULATE_ATTENDANCE=true. It never writes attendance for a
 * non-SIM student.
 */

const cron = require("node-cron");
const Student = require("../models/studentModel");
const Attendance = require("../models/attendanceModel");
const { SIM_PREFIX, rateFor } = require("./simData");

class AttendanceSimulator {
  constructor() {
    this.enabled = process.env.SIMULATE_ATTENDANCE === "true";
  }

  static ymd(d) {
    return d.toISOString().split("T")[0];
  }

  async simStudentIds() {
    const rows = await Student.find(
      { student_id: { $regex: `^${SIM_PREFIX}` } },
      { student_id: 1, _id: 0 }
    ).lean();
    return rows.map((r) => r.student_id);
  }

  /** Generate attendance for one YYYY-MM-DD. Idempotent (upsert per row). */
  async simulateDay(dateStr, ids) {
    ids = ids || (await this.simStudentIds());
    if (!ids.length) {
      console.warn("[sim] no SIM students found — run scripts/seedStudents.js first");
      return { date: dateStr, inserted: 0 };
    }

    const createdAt = new Date(dateStr + "T12:00:00Z");
    const ops = [];
    for (const meal of ["breakfast", "lunch", "dinner"]) {
      const rate = rateFor(meal, dateStr);
      for (const student_id of ids) {
        if (Math.random() > rate) continue;
        ops.push({
          updateOne: {
            filter: { student_id, date: dateStr, attendance: meal },
            update: { $setOnInsert: { student_id, date: dateStr, attendance: meal, createdAt } },
            upsert: true,
          },
        });
      }
    }
    if (!ops.length) return { date: dateStr, inserted: 0 };
    // timestamps:false so Mongoose doesn't also inject createdAt and clash with
    // the real-dated createdAt we set in $setOnInsert.
    const res = await Attendance.bulkWrite(ops, { ordered: false, timestamps: false });
    const inserted = res.upsertedCount || 0;
    console.log(`[sim] ${dateStr}: +${inserted} attendance rows`);
    return { date: dateStr, inserted };
  }

  /** Fill the last `days` days (default 45) so charts have history immediately. */
  async backfill(days = 45) {
    const ids = await this.simStudentIds();
    let total = 0;
    for (let i = days; i >= 1; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const r = await this.simulateDay(AttendanceSimulator.ymd(d), ids);
      total += r.inserted;
    }
    console.log(`[sim] backfill complete: ${total} rows over ${days} days`);
    return total;
  }

  /** Schedule the daily run. Call once at server start. */
  start() {
    if (!this.enabled) return;
    // 21:30 every day — after dinner service.
    cron.schedule("30 21 * * *", () => {
      this.simulateDay(AttendanceSimulator.ymd(new Date())).catch((e) =>
        console.warn("[sim] daily run failed:", e.message)
      );
    });
    console.log("[sim] attendance simulator armed (daily at 21:30)");
  }
}

module.exports = AttendanceSimulator;
