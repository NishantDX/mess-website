const express = require('express');
const router = express.Router();
const { getDemandForecast } = require('../controllers/aiController');

// GET /api/predict?date=YYYY-MM-DD (defaults to tomorrow)
// Returns expected meal turnout per meal type, based on historical
// day-of-week averages. See controllers/aiController.js for the method.
router.get('/predict', getDemandForecast);

module.exports = router;
