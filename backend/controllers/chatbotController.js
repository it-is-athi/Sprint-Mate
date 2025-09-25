// backend/controllers/chatbotController.js
const Conversation = require('../models/Conversation');
const aiService = require('../services/aiService');
const scheduleService = require('../services/scheduleService');

// Fields absolutely required to begin schedule generation.
const requiredFieldsForGeneration = ['schedule_title', 'starting_date', 'repeat_pattern', 'duration', 'duration_unit', 'task_time', 'task_duration'];

exports.chat = async (req, res) => {
  // A simple, friendly greeting.
  res.status(200).json({ message: "Hello! I'm SprintMate. What would you like to plan today?" });
};

// NEW: Form-based schedule creation
exports.createScheduleFromForm = async (req, res) => {
  try {
    const scheduleData = req.body;
    const userId = req.user.id;

    // Validate required fields
    const requiredFields = ['schedule_title', 'starting_date', 'repeat_pattern'];
    const missingFields = requiredFields.filter(field => !scheduleData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // If no end_date provided, set a reasonable default based on repeat_pattern
    if (!scheduleData.end_date) {
      const startDate = new Date(scheduleData.starting_date);
      switch (scheduleData.repeat_pattern) {
        case 'daily':
          scheduleData.end_date = new Date(startDate.setDate(startDate.getDate() + 30)); // 30 days
          break;
        case 'weekly':
          scheduleData.end_date = new Date(startDate.setDate(startDate.getDate() + 84)); // 12 weeks
          break;
        case 'monthly':
          scheduleData.end_date = new Date(startDate.setMonth(startDate.getMonth() + 6)); // 6 months
          break;
        case 'once':
          scheduleData.end_date = scheduleData.starting_date; // Same day
          break;
        default:
          scheduleData.end_date = new Date(startDate.setDate(startDate.getDate() + 30)); // Default 30 days
      }
    }

    // Add owner_id to the schedule data
    scheduleData.owner_id = userId;

    // Generate tasks using AI based on the complete schedule details
    const fullSchedule = await aiService.generateScheduleFromForm(scheduleData);

    // Create the schedule and tasks
    const result = await scheduleService.createScheduleAndTasks(
      fullSchedule.schedule_data,
      fullSchedule.tasks_data,
      userId
    );

    // Success - schedule created
    return res.status(201).json({
      message: `Schedule "${result.schedule.schedule_title}" created successfully!`,
      schedule: result.schedule
    });

  } catch (error) {
    console.error('Error in /create-schedule endpoint:', error);
    res.status(500).json({ message: 'An error occurred while creating your schedule.' });
  }
};
exports.reschedule = async (req, res) => {
  // Placeholder for rescheduling functionality
  res.status(500).json({ message: "Reschedule feature not yet implemented." });
};

