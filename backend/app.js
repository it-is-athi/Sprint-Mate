const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    /https:\/\/.*\.vercel\.app$/  // Allow any vercel.app subdomain
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Example Route
app.get('/', (req, res) => {
  res.send('✨ Hello from SprintMate API!');
});

// --- Application Routes ---
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const ragRoutes = require('./routes/ragRoutes');
const savedChatRoutes = require('./routes/savedChatRoutes');
const { protect } = require('./middlewares/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/bot', chatbotRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/rag', ragRoutes);
// Saved chats (requires authentication)
app.use('/api/saved-chats', protect, savedChatRoutes);

module.exports = app;
