const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  status: { type: String, enum: ["success", "failed"], required: true },
  timestamp: { type: Date, default: Date.now },
});

// const Payment = mongoose.model("Payment", paymentSchema);

// module.exports = Payment;
module.exports = mongoose.model("Payment", paymentSchema);