const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/add', stockController.getAddStock);
router.post('/add', stockController.postAddStock);
router.get('/reduce', stockController.getReduceStock);
router.post('/reduce', stockController.postReduceStock);
router.get('/history', stockController.getHistory);

module.exports = router;
