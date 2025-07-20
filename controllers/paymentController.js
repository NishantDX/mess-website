const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");

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

module.exports = {
  initiatePayment,
  verifyPayment,
  getPaymentHistory
};