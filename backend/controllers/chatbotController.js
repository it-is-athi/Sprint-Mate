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
    const requiredFields = ['schedule_title', 'starting_date', 'end_date', 'repeat_pattern'];
    const missingFields = requiredFields.filter(field => !scheduleData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate date range
    const validateStartDate = new Date(scheduleData.starting_date);
    const validateEndDate = new Date(scheduleData.end_date);
    
    if (validateEndDate < validateStartDate) {
      return res.status(400).json({ 
        message: 'End date cannot be before start date' 
      });
    }

    // Add owner_id to the schedule data
    scheduleData.owner_id = userId;

    // Generate tasks using AI based on the complete schedule details
    const fullSchedule = await aiService.generateScheduleFromForm(scheduleData);

    // Validate and filter tasks to ensure they don't exceed the end date
    const startDate = new Date(scheduleData.starting_date);
    const endDate = new Date(scheduleData.end_date);
    
    // Filter out any tasks that are beyond the end date
    const validTasks = fullSchedule.tasks_data.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startDate && taskDate <= endDate;
    });

    console.log(`Original tasks generated: ${fullSchedule.tasks_data.length}, Valid tasks within range: ${validTasks.length}`);
    
    // Update the tasks data with filtered tasks
    fullSchedule.tasks_data = validTasks;

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

