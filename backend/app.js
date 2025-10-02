const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

app.use('/api/auth', authRoutes);
app.use('/api/bot', chatbotRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/rag', ragRoutes);

module.exports = app;
