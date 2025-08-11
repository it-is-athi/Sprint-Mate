// backend/app.js

const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // for parsing JSON requests

// Example Route
app.get('/', (req, res) => {
  res.send('✨ Hello from SprintMate API!');
});

// You can plug in more routes here, like:
// const userRoutes = require('./routes/users');
// app.use('/api/users', userRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
module.exports = app;
