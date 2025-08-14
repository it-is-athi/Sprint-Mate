// backend/app.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // for parsing JSON requests

// Example Route
app.get('/', (req, res) => {
  res.send('✨ Hello from SprintMate API!');
});


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/api/chatbot', chatbotRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedule', scheduleRoutes);

const progressRoutes = require('./routes/progressRoutes');
app.use('/api/progress', progressRoutes);

module.exports = app;
