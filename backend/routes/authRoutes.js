const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Example of a protected route
router.get('/me', protect, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

// OTP verification route
router.post('/verify-otp', authController.verifyOtp);
// ...existing code...
router.post('/logout', authController.logout);
// ...existing code...
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
module.exports = router;
