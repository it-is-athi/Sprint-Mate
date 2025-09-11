// backend/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const { chat, reschedule, createScheduleFromForm } = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware');

// A general chat route (can be used for greetings or non-scheduling tasks)
router.post('/chat', protect, chat);

// NEW: Form-based schedule creation route
router.post('/create-schedule', protect, createScheduleFromForm);

// A route for rescheduling a task (to be implemented)
router.post('/reschedule', protect, reschedule);

module.exports = router;
