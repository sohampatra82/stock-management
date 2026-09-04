const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, redirectIfAuthenticated } = require('../middleware/authMiddleware');

router.get('/login', redirectIfAuthenticated, authController.getLogin);
router.post('/login', redirectIfAuthenticated, authController.postLogin);
router.get('/logout', authController.logout);
router.get('/profile', requireAuth, authController.getProfile);
router.post('/profile', requireAuth, authController.updateProfile);
router.post('/profile/change-password', requireAuth, authController.changePassword);

module.exports = router;
