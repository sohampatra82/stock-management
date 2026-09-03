const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', reportController.getReports);
router.get('/stock', reportController.getStockReport);
router.get('/transactions', reportController.getTransactionReport);

module.exports = router;
