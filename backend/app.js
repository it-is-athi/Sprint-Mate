// backend/app.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // for parsing JSON requests

// Example Route
app.get('/', (req, res) => {
  res.send('✨ Hello from SprintMate API!');
});

const cookieParser = require('cookie-parser');
app.use(cookieParser());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/api/bot', chatbotRoutes);

module.exports = app;
