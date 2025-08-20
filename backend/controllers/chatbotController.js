// backend/controllers/chatbotController.js
const Conversation = require('../models/Conversation');
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const { askMentor, extractPlanDetails } = require('../services/aiService');


const CONTEXT_TURNS = parseInt(process.env.CONTEXT_TURNS || '8', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'; // not used directly here, but handy

// POST /chat — talk to mentor with short context
async function chat(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id; // ✅ Extract from token (set by protect middleware)
  
      if (!message) {
        return res.status(400).json({ error: 'message is required' });
      }
  
      // Fetch recent conversation context
      const recent = await Conversation.find({ userId })
        .sort({ createdAt: -1 })
        .limit(CONTEXT_TURNS);
  
      const context = recent.reverse().map(turn => `${turn.role.toUpperCase()}: ${turn.message}`);
  
      // Get AI reply
      const reply = await askMentor({ message, context });
  
      // Save user message
      await Conversation.create({ userId, role: 'user', message });
      // Save assistant reply
      await Conversation.create({ userId, role: 'assistant', message: reply });
  
      res.json({ reply });
    } catch (e) {
      console.error('chat error:', e);
      res.status(500).json({ error: 'chat failed' });
    }
  }

// POST /schedule — create a new schedule and tasks
async function createSchedule(req, res) {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // Get AI plan details from message
    const aiResponse = await askMentor({ message, context: [] });
    const [scheduleDetails, tasksArray] = extractPlanDetails(aiResponse, message);

    // Validate schedule details
    if (!scheduleDetails.title || !scheduleDetails.startDate || !scheduleDetails.endDate) {
      return res.status(400).json({ error: 'Missing schedule details' });
    }

    // Create schedule
    const schedule = await Schedule.create({
      schedule_title: scheduleDetails.title,
      starting_date: new Date(scheduleDetails.startDate),
      end_date: new Date(scheduleDetails.endDate),
      status: 'active',
      owner_id: userId,
      description: scheduleDetails.description || '',
      repeat_pattern: scheduleDetails.repeatPattern || 'daily',
    });

    // Create tasks from tasksArray, adding schedule_id to each
    const tasksToCreate = tasksArray.map(task => ({
      ...task,
      schedule_id: schedule._id,
      missed: false,
    }));
    await Task.insertMany(tasksToCreate);

    // Save conversation
    await Conversation.create({ userId, role: 'user', message });
    await Conversation.create({ userId, role: 'assistant', message: `Schedule "${scheduleDetails.title}" created with ${tasksArray.length} tasks.` });

    res.json({ schedule, tasksCreated: tasksArray.length });
  } catch (e) {
    console.error('createSchedule error:', e);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
}

module.exports = {
  chat,
  createSchedule,
};
