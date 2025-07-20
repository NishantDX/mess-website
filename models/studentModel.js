const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const studentSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  student_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
});
module.exports = mongoose.model("student", studentSchema);
