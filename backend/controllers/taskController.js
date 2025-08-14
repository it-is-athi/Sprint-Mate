const Task = require('../models/Task');

// @desc    Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      dueDate,
      userId: req.user ? req.user.id : '64d1e10b6e9f123456789abc', // use req.user.id after auth, dummy ID for now
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
// @desc    Get all tasks for the user, with optional filters
exports.getTasks = async (req, res) => {
  try {
    const filters = {
      userId: req.user ? req.user.id : '64d1e10b6e9f123456789abc'
    };

    // Optional filter: completed = true/false
    if (req.query.completed !== undefined) {
      filters.isCompleted = req.query.completed === 'true';
    }

    // Optional filter: dueDate = YYYY-MM-DD
    if (req.query.dueDate) {
      const date = new Date(req.query.dueDate);
      // Set time boundaries to include the full day
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      filters.dueDate = {
        $gte: date,
        $lt: nextDay
      };
    }

    const tasks = await Task.find(filters).sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

exports.toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.isCompleted = !task.isCompleted;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle task', error: error.message });
  }
};
