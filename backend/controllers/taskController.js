const Task = require('../models/Task');
const Schedule = require('../models/Schedule');

// @desc    Create a new task
exports.createTask = async (req, res) => {
  try {
    const { 
      task_title, 
      name, 
      task_description, 
      description, 
      date, 
      schedule_id 
    } = req.body;

    // Validation
    if (!schedule_id) {
      return res.status(400).json({ message: 'Schedule ID is required' });
    }

    if (!task_title && !name) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (!date) {
      return res.status(400).json({ message: 'Task date is required' });
    }

    // Verify schedule exists and belongs to the user
    const schedule = await Schedule.findOne({ 
      _id: schedule_id, 
      owner_id: req.user.id 
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found or not accessible' });
    }

    const task = new Task({
      name: task_title || name,
      date: new Date(date),
      description: task_description || description,
      schedule_id,
      owner_id: req.user.id,
      status: 'pending' // Explicitly set default status
    });

    await task.save();
    
    // Populate schedule information in response
    await task.populate('schedule_id', 'schedule_title');
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// @desc    Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user.id },
      req.body, 
      { new: true }
    ).populate('schedule_id', 'schedule_title');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not accessible' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// @desc    Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id, 
      owner_id: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not accessible' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

// @desc    Toggle task status (pending → in-progress → completed)
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner_id: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not accessible' });
    }

    // cycle through statuses
    if (task.status === "pending") task.status = "in-progress";
    else if (task.status === "in-progress") task.status = "completed";
    else task.status = "pending"; // reset back to pending if completed

    await task.save();
    
    // Populate schedule information in response
    await task.populate('schedule_id', 'schedule_title');
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error toggling task status:', error);
    res.status(500).json({ message: 'Failed to toggle task status', error: error.message });
  }
};
