const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  day: {
    type: String, // e.g., "Monday", "Tuesday"
    required: true,
    unique: true,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  breakfast: {
    type: String,
    required: true,
  },
  lunch: {
    type: String,
    required: true,
  },
  dinner: {
    type: String,
    required: true,
  },
});


module.exports = mongoose.model("Menu", menuSchema);
