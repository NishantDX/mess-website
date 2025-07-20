const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {verifyAdmin} = require('../middleware/firebaseAdmin');

router.get('/stats/students', verifyAdmin, adminController.getTotalStudents);
router.get('/stats/meals/today', verifyAdmin, adminController.getMealsServedToday);
router.get('/stats/revenue/month', verifyAdmin, adminController.getMonthlyRevenue);
router.post('/create', adminController.createAdmin);
router.get('/attendance', verifyAdmin, adminController.getAllAttendance);
module.exports = router;
