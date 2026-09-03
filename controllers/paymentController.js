const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const Attendance = require("../models/attendanceModel");
const Student = require("../models/studentModel");

const COST_PER_MEAL = 50;

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 🚀 1. Initiate Payment
const initiatePayment = async (req, res) => {
  try {
    const { amount, student_id } = req.body;

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${student_id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment initiation failed", error: error.message });
  }
};

// ✅ 2. Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_id,
      amount,
    } = req.body;

    // Verify the signature using SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Save to DB
      const payment = new Payment({
        student_id,
        amount,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: "success",
      });

      await payment.save();
      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification error", error: error.message });
  }
};

// 📄 3. Get Payment History for a Student
const getPaymentHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const payments = await Payment.find({ student_id }).sort({ timestamp: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment history", error: error.message });
  }
};

// GET /api/payments/summary — per-student billing status for the admin panel.
// owed = (meals eaten) * COST_PER_MEAL ; paid = sum of successful payments.
const getPaymentsSummary = async (req, res) => {
  try {
    const [students, mealAgg, payAgg] = await Promise.all([
      Student.find({}, { student_id: 1, name: 1, department: 1, _id: 0 }).lean(),
      Attendance.aggregate([{ $group: { _id: "$student_id", meals: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: "$student_id", paid: { $sum: "$amount" } } },
      ]),
    ]);

    const mealsBy = {};
    mealAgg.forEach((m) => { mealsBy[m._id] = m.meals; });
    const paidBy = {};
    payAgg.forEach((p) => { paidBy[p._id] = p.paid; });

    let collected = 0, pending = 0, paidCount = 0, partialCount = 0, unpaidCount = 0;

    const records = students.map((s) => {
      const meals = mealsBy[s.student_id] || 0;
      const owed = meals * COST_PER_MEAL;
      const paid = paidBy[s.student_id] || 0;

      let status = "Unpaid";
      if (owed > 0 && paid >= owed) status = "Paid";
      else if (paid > 0) status = "Partial";

      if (status === "Paid") paidCount++;
      else if (status === "Partial") partialCount++;
      else unpaidCount++;

      collected += Math.min(paid, owed || paid);
      pending += Math.max(owed - paid, 0);

      return {
        student_id: s.student_id,
        name: s.name,
        department: s.department || "-",
        meals,
        owed,
        paid,
        status,
      };
    });

    records.sort((a, b) => b.owed - a.owed);

    res.status(200).json({
      records,
      stats: {
        totalStudents: students.length,
        paidCount,
        partialCount,
        unpaidCount,
        collected,
        pending,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentsSummary,
};