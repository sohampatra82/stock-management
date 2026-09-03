const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/login', (req, res) => res.redirect('/dashboard'));
router.post('/login', (req, res) => res.redirect('/dashboard'));
router.get('/logout', (req, res) => res.redirect('/dashboard'));
router.get('/profile', requireAuth, authController.getProfile);
router.post('/profile', requireAuth, authController.updateProfile);

module.exports = router;
