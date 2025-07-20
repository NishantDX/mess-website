const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  name: { type: String, required: true },         // Optional: useful for UI
  issue: { type: String, required: true },        // Complaint description
  status: {
    type: String,
    enum: ["pending", "resolved"],
    default: "pending",
  },
  timestamp: { type: Date, default: Date.now },
  resolutionNote: { type: String, default: "" },  // Optional field for admin reply
});

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;