const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const Task = require('../models/Task');
const { protect } = require('../middlewares/authMiddleware');

// Simple test route
router.get('/ping', (req, res) => {
  res.json({ message: "✅ Task routes are working!" });
});

// Get tasks for a specific schedule
router.get('/schedule/:scheduleId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      schedule_id: req.params.scheduleId,
      owner_id: req.user.id 
    }).sort({ date: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching schedule tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Get today's tasks for the authenticated user
router.get('/today', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Create date range for the entire day
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    const tasks = await Task.find({
      owner_id: req.user.id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).sort({ date: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ message: 'Failed to fetch today\'s tasks' });
  }
});

// Get all tasks for the authenticated user
router.get('/user-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ owner_id: req.user.id })
      .populate('schedule_id', 'schedule_title')
      .sort({ date: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// CRUD routes
router.post('/', protect, taskController.createTask);
router.put('/:id', protect, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);
router.patch('/:id/toggle', protect, taskController.toggleTaskStatus);

// Update task status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user.id },
      { status },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Reschedule task
router.patch('/:id/reschedule', protect, async (req, res) => {
  try {
    const { newDate } = req.body;
    
    if (!newDate) {
      return res.status(400).json({ message: 'New date is required' });
    }
    
    // Validate date format
    const date = new Date(newDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user.id },
      { 
        due_date: date,
        date: date // Update both fields for compatibility
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error rescheduling task:', error);
    res.status(500).json({ message: 'Failed to reschedule task' });
  }
});

module.exports = router;
