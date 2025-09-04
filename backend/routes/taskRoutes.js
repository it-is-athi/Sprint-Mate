const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Simple test route
router.get('/ping', (req, res) => {
  res.json({ message: "✅ Task routes are working!" });
});

// CRUD routes
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/toggle', taskController.toggleTaskStatus);

module.exports = router;
