const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/dashboard', getDashboardAnalytics);

module.exports = router;
