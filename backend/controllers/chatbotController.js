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

exports.schedule = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id;

    if (!prompt) {
      return res.status(400).json({ message: "A prompt is required to start planning." });
    }

    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = new Conversation({ userId, context: {}, state: 'idle', missingFields: [] });
    }

    // Handle state-specific logic first
    if (conversation.state === 'awaiting_reschedule_choice') {
      // The user is responding to a conflict. Extract the new time from their prompt.
      const newDetails = await aiService.extractScheduleDetails(prompt, conversation.context);
      
      // Update the context with the newly provided time.
      conversation.context.task_time = newDetails.task_time;
      conversation.markModified('context');
      
      // Now, we can proceed as if all details are gathered.
    } else {
      // This is the normal flow for a new prompt or a follow-up question.
      const updatedContext = await aiService.extractScheduleDetails(prompt, conversation.context);
      conversation.context = updatedContext;
      conversation.markModified('context');
    }

    // Step 2: Check for missing information
    const missingFields = requiredFieldsForGeneration.filter(field => !conversation.context[field]);

    if (missingFields.length > 0) {
      // Check for our special ambiguous time case first
      const description = conversation.context.description || '';
      if (missingFields.includes('task_time') && description.startsWith('AM_PM_REQUIRED_FOR_')) {
        const time = description.split('_').pop(); // Extracts the 'X' from the special string
        
        // Clean up the description so we don't ask again
        conversation.context.description = null;
        conversation.state = 'awaiting_details';
        await conversation.save();

        return res.status(200).json({
            message: `You mentioned a time of "${time}". Did you mean in the morning or in the evening?`,
            conversationState: 'awaiting_details'
        });
      }

      // If details are missing (and it's not the special time case), ask a generic follow-up question
      conversation.state = 'awaiting_details';
      conversation.missingFields = missingFields;
      await conversation.save();

      const nextQuestion = await aiService.generateFollowUpQuestion(conversation.context, missingFields[0]);
      
      return res.status(200).json({ 
        message: nextQuestion,
        conversationState: 'awaiting_details'
      });

    } else {
      // Step 3: All details present, proceed to generation and validation
      conversation.state = 'generating';
      await conversation.save();

      const fullSchedule = await aiService.generateFullSchedule(conversation.context);

      // Step 4: Validate for time conflicts BEFORE creating
      const result = await scheduleService.createScheduleAndTasks(
        fullSchedule.schedule_data,
        fullSchedule.tasks_data,
        userId
      );

      if (result.hasConflict) {
        // Handle the conflict by informing the user
        conversation.state = 'awaiting_reschedule_choice'; // Custom state for clarity
        await conversation.save();

        const conflict = result.conflicts[0];
        const message = `It looks like there's a scheduling conflict! The task "${conflict.proposedTask.name}" on ${conflict.proposedTask.date} clashes with your existing task: "${conflict.conflictingWith.name}".\n\nI found some other available times on that day: ${result.suggestedSlots.join(', ')}. Would you like to use one of these times, or suggest another?`;

        return res.status(409).json({ // 409 Conflict is the appropriate HTTP status
          message: message,
          conversationState: 'awaiting_reschedule_choice',
          suggestedSlots: result.suggestedSlots
        });
      }

      // Step 5: No conflict, so finalize creation
      conversation.state = 'idle';
      conversation.context = {};
      conversation.missingFields = [];
      conversation.markModified('context');
      await conversation.save();

      return res.status(201).json({
        message: `Awesome! Your schedule "${result.schedule.schedule_title}" has been created successfully. Let's get it done!`,
        conversationState: 'idle',
        schedule: result.schedule
      });
    }

  } catch (error) {
    console.error('Error in /schedule endpoint:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
};

exports.reschedule = async (req, res) => {
  // Placeholder for rescheduling functionality
  res.status(500).json({ message: "Reschedule feature not yet implemented." });
};
