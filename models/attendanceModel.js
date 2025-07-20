const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const attendanceSchema = new Schema({
  student_id: { type: String, required: true },
  date: { type: String, required: true }, // Year-Month-Date
  attendance:{type:String, enum:["breakfast","lunch","dinner"]}
  //status: { type: String, enum: ["eaten", "not_eaten"], default: "not_eaten" },
});
module.exports=mongoose.model('attendance',attendanceSchema);