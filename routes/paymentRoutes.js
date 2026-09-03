const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken, verifyAdmin } = require("../middleware/firebaseAdmin");

// Admin: per-student billing status (owed vs paid)
router.get("/summary", verifyAdmin, paymentController.getPaymentsSummary);

// Route to create Razorpay order
router.post("/create-order", verifyToken, paymentController.initiatePayment);

// Route to verify Razorpay payment
router.post("/verify", verifyToken, paymentController.verifyPayment);
router.get(
  "/history/:student_id",
  verifyToken,
  paymentController.getPaymentHistory
);
module.exports = router;
