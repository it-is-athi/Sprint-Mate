// backend/controllers/chatbotController.js
const Conversation = require('../models/Conversation');
const Schedule = require('../models/Schedule');
const { askMentor } = require('../services/aiService');
const { createSchedule, reallocateMissed } = require('../services/schedulerService');

const CONTEXT_TURNS = parseInt(process.env.CONTEXT_TURNS || '8', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'; // not used directly here, but handy

// GET recent history (for UI)
async function getHistory(req, res) {
  try {
    const { userId } = req.params;
    const history = await Conversation.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ history: history.reverse() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

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
  

// POST /schedule/create — create and save a plan
async function createPlan(req, res) {
  try {
    const { userId, subjects, startDate, deadline, dailyStart, dailyEnd, breakMin } = req.body;
    if (!userId || !Array.isArray(subjects) || !startDate || !deadline || !dailyStart || !dailyEnd) {
      return res.status(400).json({ error: 'userId, subjects[], startDate, deadline, dailyStart, dailyEnd are required' });
    }

    const { summary, sessions } = createSchedule({ subjects, startDate, deadline, dailyStart, dailyEnd, breakMin });
    const saved = await Schedule.create({ userId, summary, deadline, sessions });

    res.json({ schedule: saved });
  } catch (e) {
    console.error('createPlan error:', e);
    res.status(500).json({ error: 'create plan failed' });
  }
}

// PUT /schedule/update — mark missed and reallocate
async function updatePlan(req, res) {
  try {
    const { scheduleId, missedSessionIds = [], fromDate, dailyStart = '17:00', dailyEnd = '21:00', breakMin = 15 } = req.body;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ error: 'schedule not found' });

    // mark missed
    schedule.sessions = schedule.sessions.map((s, idx) => {
      if (missedSessionIds.includes(String(idx))) return { ...s.toObject(), status: 'missed' };
      return s;
    });

    // reallocate
    const updated = reallocateMissed({
      sessions: schedule.sessions.map(s => s.toObject()),
      fromDate: fromDate || schedule.sessions.reduce((max, s) => (s.day > max ? s.day : max), schedule.deadline),
      dailyStart, dailyEnd, breakMin
    });

    schedule.sessions = updated;
    await schedule.save();

    res.json({ schedule });
  } catch (e) {
    console.error('updatePlan error:', e);
    res.status(500).json({ error: 'update plan failed' });
  }
}

// GET /schedule/view/:userId — fetch latest schedule
async function viewPlan(req, res) {
  try {
    const { userId } = req.params;
    const schedule = await Schedule.findOne({ userId }).sort({ createdAt: -1 });
    if (!schedule) return res.json({ schedule: null });
    res.json({ schedule });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// POST /feedback — store free-form feedback for future tuning
async function submitFeedback(req, res) {
  try {
    const { userId, text } = req.body;
    if (!userId || !text) return res.status(400).json({ error: 'userId and text are required' });

    await Conversation.create({ userId, role: 'user', message: `[FEEDBACK] ${text}` });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = {
  getHistory,
  chat,
  createPlan,
  updatePlan,
  viewPlan,
  submitFeedback
};
