const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const { protect } = require('../middlewares/authMiddleware');

// Get all schedules for the authenticated user
router.get('/user-schedules', protect, async (req, res) => {
  try {
    const schedules = await Schedule.find({ owner_id: req.user.id })
      .sort({ createdAt: -1 });
    
    // Calculate progress for each schedule based on task completion
    const schedulesWithProgress = await Promise.all(
      schedules.map(async (schedule) => {
        const totalTasks = await Task.countDocuments({ 
          schedule_id: schedule._id 
        });
        
        const completedTasks = await Task.countDocuments({ 
          schedule_id: schedule._id, 
          status: 'completed' 
        });
        
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Auto-update schedule status based on progress
        let updatedStatus = schedule.status;
        if (totalTasks > 0 && completedTasks === totalTasks && schedule.status === 'active') {
          // All tasks completed, update schedule to completed
          await Schedule.findByIdAndUpdate(schedule._id, { status: 'completed' });
          updatedStatus = 'completed';
        }
        
        return {
          ...schedule.toObject(),
          status: updatedStatus, // Use updated status
          progress: {
            totalTasks,
            completedTasks,
            percentage: progressPercentage
          }
        };
      })
    );
    
    // Sort schedules: active first, then completed, then others
    const sortedSchedules = schedulesWithProgress.sort((a, b) => {
      const statusOrder = { 'active': 1, 'completed': 2, 'archived': 3 };
      const aOrder = statusOrder[a.status] || 4;
      const bOrder = statusOrder[b.status] || 4;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      // If same status, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    res.json(sortedSchedules);
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
});

// Get a specific schedule by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ 
      _id: req.params.id, 
      owner_id: req.user.id 
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
});

// Update schedule status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user.id },
      { status },
      { new: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({ message: 'Failed to update schedule' });
  }
});

// Update schedule title and description
router.put('/:id', protect, async (req, res) => {
  try {
    const { schedule_title, description } = req.body;
    
    // Validate input
    if (!schedule_title || schedule_title.trim() === '') {
      return res.status(400).json({ message: 'Schedule title is required' });
    }
    
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user.id },
      { 
        schedule_title: schedule_title.trim(),
        description: description ? description.trim() : ''
      },
      { new: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Failed to update schedule' });
  }
});

// Delete a schedule and its tasks
router.delete('/:id', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ 
      _id: req.params.id, 
      owner_id: req.user.id 
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    // Delete all tasks associated with this schedule
    await Task.deleteMany({ schedule_id: req.params.id });
    
    // Delete the schedule
    await Schedule.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Schedule and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Failed to delete schedule' });
  }
});

module.exports = router;
