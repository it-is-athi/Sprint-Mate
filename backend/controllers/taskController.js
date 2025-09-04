const Task = require('../models/Task');

// @desc    Create a new task
exports.createTask = async (req, res) => {
  try {
    const { name, topic, duration, starting_time, date, description, schedule_id } = req.body;

    const task = new Task({
      name,
      topic,
      duration,
      starting_time,
      date,
      description,
      schedule_id
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// @desc    Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// @desc    Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

// @desc    Toggle task status (pending → in-progress → completed)
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // cycle through statuses
    if (task.status === "pending") task.status = "in-progress";
    else if (task.status === "in-progress") task.status = "completed";
    else task.status = "pending"; // reset back to pending if completed

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle task status', error: error.message });
  }
};
