// backend/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const { chat, schedule, reschedule } = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware');

// A general chat route (can be used for greetings or non-scheduling tasks)
router.post('/chat', protect, chat);

// The main route for creating a schedule
router.post('/schedule', protect, schedule);

// A route for rescheduling a task (to be implemented)
router.post('/reschedule', protect, reschedule);

module.exports = router;
