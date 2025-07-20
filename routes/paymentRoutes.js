const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/firebaseAdmin");

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
