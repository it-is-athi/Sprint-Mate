// backend/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware');

// Chat route with JWT protection
router.post('/chat', protect, ctrl.chat);
router.post('/schedule', protect, ctrl.createSchedule);

module.exports = router;
