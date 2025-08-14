// backend/app.js

const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // for parsing JSON requests

// Example Route
app.get('/', (req, res) => {
  res.send('✨ Hello from SprintMate API!');
});

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

module.exports = app;
