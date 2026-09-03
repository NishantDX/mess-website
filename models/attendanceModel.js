const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema(
  {
    student_id: { type: String, required: true },
    date: { type: String, required: true }, // Year-Month-Date (YYYY-MM-DD)
    attendance: { type: String, enum: ["breakfast", "lunch", "dinner"] },
    // status: { type: String, enum: ["eaten", "not_eaten"], default: "not_eaten" },
  },
  { timestamps: true } // adds createdAt / updatedAt (Date)
);

// Speeds up the "already marked?" lookup and the by-date admin queries.
attendanceSchema.index({ student_id: 1, date: 1, attendance: 1 });

// Keep storage bounded: attendance rows auto-delete 90 days after creation.
// (Mongo's TTL monitor sweeps ~once a minute. Docs without a createdAt Date
// are ignored, so any pre-existing rows are untouched.)
attendanceSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model("attendance", attendanceSchema);
