const express = require('express');
const router = express.Router();
const { getPredictedAttendance } = require('../controllers/aiController');

router.get('/predict', getPredictedAttendance);

module.exports = router;
