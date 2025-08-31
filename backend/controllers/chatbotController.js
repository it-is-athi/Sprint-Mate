// backend/controllers/chatbotController.js
const Conversation = require('../models/Conversation');
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const { askMentor, extractPlanDetails } = require('../services/aiService');

const CONTEXT_TURNS = parseInt(process.env.CONTEXT_TURNS || '8', 10);

// Temporary storage for incomplete schedules
const tempSchedules = new Map();

// Enhanced time parsing function
function parseTimeToHHMM(timeStr) {
  if (!timeStr) return null;
  
  const timeStrLower = timeStr.toLowerCase().trim();
  
  // Handle various time formats
  const timePatterns = [
    // "8pm", "8 pm", "8:00pm", "8:00 pm"
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i,
    // "20:00", "08:00"  
    /^(\d{1,2}):(\d{2})$/,
    // "8" (assume this is hour only, no am/pm specified - treat as 24hr)
    /^(\d{1,2})$/
  ];
  
  for (const pattern of timePatterns) {
    const match = timeStrLower.match(pattern);
    if (match) {
      let hour = parseInt(match[1]);
      const minute = match[2] ? parseInt(match[2]) : 0;
      const ampm = match[3] ? match[3].toLowerCase() : null;
      
      // Validate hour and minute ranges
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        continue; // Try next pattern
      }
      
      // Convert 12-hour to 24-hour format
      if (ampm) {
        if (ampm === 'pm' && hour !== 12) {
          hour += 12;
        } else if (ampm === 'am' && hour === 12) {
          hour = 0;
        }
      }
      
      // Ensure hour is in valid 24-hour range after conversion
      if (hour >= 0 && hour <= 23) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
  }
  
  return null;
}

// chat route for general chat
async function chat(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id; // ✅ Extract from token (set by protect middleware)
  
      if (!message) {
        return res.status(400).json({ error: 'message is required' });
      }
  
      // Fetch recent conversation context
      const recent = await Conversation.find({ userId })
        .sort({ createdAt: -1 })
        .limit(CONTEXT_TURNS);
  
      const context = recent.reverse().map(turn => `${turn.role.toUpperCase()}: ${turn.message}`);
  
      // Get AI reply
      const reply = await askMentor({ message, context });
  
      // Save user message
      await Conversation.create({ userId, role: 'user', message });
      // Save assistant reply
      await Conversation.create({ userId, role: 'assistant', message: reply });
  
      res.json({ reply });
    } catch (e) {
      console.error('chat error:', e);
      res.status(500).json({ error: 'chat failed' });
    }
}

// create schedule route
async function createSchedule(req, res) {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if user has a pending schedule
    const pendingSchedule = tempSchedules.get(userId);
    
    if (pendingSchedule) {
      // User is providing missing details
      return await handleMissingDetails(req, res, userId, message, pendingSchedule);
    }

    // New schedule request
    return await handleNewSchedule(req, res, userId, message);
  } catch (e) {
    console.error('createSchedule error:', e);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
}

// Helper function to parse natural language dates
function parseNaturalDate(dateStr, referenceDate = new Date()) {
  if (!dateStr) return null;
  
  try {
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dateStrLower = dateStr.toLowerCase().trim();
    
    // Handle relative dates
    if (dateStrLower.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    if (dateStrLower.includes('tomorrow')) {
      return tomorrow.toISOString().split('T')[0];
    }
    if (dateStrLower.includes('next week')) {
      const nextMonday = new Date(today);
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      return nextMonday.toISOString().split('T')[0];
    }
    
    // Handle duration-based dates (like "2 weeks", "1 month")
    const durationMatch = dateStrLower.match(/(\d+)\s*(day|week|month)s?/);
    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2];
      const endDate = new Date(referenceDate);
      
      switch (unit) {
        case 'day':
          endDate.setDate(endDate.getDate() + amount);
          break;
        case 'week':
          endDate.setDate(endDate.getDate() + (amount * 7));
          break;
        case 'month':
          endDate.setMonth(endDate.getMonth() + amount);
          break;
      }
      return endDate.toISOString().split('T')[0];
    }
    
    // Try to parse as regular date
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
    
    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

// Enhanced function to extract schedule details from natural language
async function extractScheduleFromMessage(message, existingDetails = {}) {
  // First try manual parsing for common patterns
  const manualExtraction = extractScheduleManually(message, existingDetails);
  
  // If manual extraction found something, use it
  if (Object.keys(manualExtraction).length > Object.keys(existingDetails).length) {
    console.log('Manual extraction successful:', manualExtraction);
    return manualExtraction;
  }

  // Enhanced AI extraction prompt with better time handling
  const extractionPrompt = `Extract study schedule details from this message. Return ONLY a valid JSON object.

Message: "${message}"
Current date: ${new Date().toISOString().split('T')[0]}

Extract these fields if mentioned:
- title: The subject or topic to study
- startDate: When to start (in YYYY-MM-DD format)  
- duration: How long the plan should last (like "2 weeks", "1 month")
- dailyDuration: How long each session should be in minutes (number only)
- startingTime: What time to start each day (convert to HH:MM format - e.g., "8pm" becomes "20:00", "9am" becomes "09:00")
- repeatPattern: How often (daily, weekly, monthly)
- description: Any additional details

IMPORTANT: For startingTime, convert 12-hour format to 24-hour:
- "8am" or "8:00am" -> "08:00"
- "8pm" or "8:00pm" -> "20:00"
- "12pm" -> "12:00" 
- "12am" -> "00:00"

Return this exact JSON format:
{
  "title": "extracted title or null",
  "startDate": "YYYY-MM-DD or null",
  "duration": "extracted duration or null", 
  "dailyDuration": null_or_number,
  "startingTime": "HH:MM or null",
  "repeatPattern": "daily/weekly/monthly or null",
  "description": "extracted description or null"
}`;

  try {
    console.log('Trying AI extraction...');
    const response = await askMentor({ 
      message: extractionPrompt, 
      context: [] 
    });
    
    console.log('AI Response:', response);
    
    // Clean the response to extract JSON
    let cleanResponse = response.trim();
    
    // Remove any markdown code blocks
    cleanResponse = cleanResponse.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
    
    // Find JSON object
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      console.log('AI Extracted:', extracted);
      
      // Process extracted data with existing details as defaults
      const result = { ...existingDetails };
      
      // Only update fields that have actual values (not null)
      if (extracted.title && extracted.title !== 'null') result.title = extracted.title;
      if (extracted.startDate && extracted.startDate !== 'null') {
        result.startDate = parseNaturalDate(extracted.startDate);
      }
      if (extracted.duration && extracted.duration !== 'null' && !result.endDate) {
        const startDate = result.startDate || parseNaturalDate('today');
        if (startDate) {
          result.endDate = parseNaturalDate(extracted.duration, new Date(startDate));
        }
      }
      if (extracted.dailyDuration && typeof extracted.dailyDuration === 'number') {
        result.dailyDuration = extracted.dailyDuration;
      }
      // ENHANCED: Better time handling with parsing
      if (extracted.startingTime && extracted.startingTime !== 'null') {
        const parsedTime = parseTimeToHHMM(extracted.startingTime);
        result.startingTime = parsedTime || extracted.startingTime;
      }
      if (extracted.repeatPattern && extracted.repeatPattern !== 'null') {
        result.repeatPattern = extracted.repeatPattern;
      }
      if (extracted.description && extracted.description !== 'null') {
        result.description = extracted.description;
      }
      
      return result;
    }
  } catch (error) {
    console.error('AI extraction failed:', error);
  }
  
  console.log('Using manual extraction as fallback');
  return manualExtraction;
}

// FIXED: Title extraction patterns - Add these to your subjectPatterns array
const improvedSubjectPatterns = [
  // Handle "Create a 2 month C++ Programming study plan" - extract the subject before "study plan"
  /create\s+a?\s+(?:\d+\s+\w+\s+)?([a-zA-Z\s\+\#\.]+?)\s+study\s+plan/i,
  
  // Handle "C++ Programming study plan starting tomorrow"
  /^([a-zA-Z\s\+\#\.]+?)\s+study\s+plan/i,
  
  // Handle "javascript session" - extract just the main subject
  /^([a-zA-Z\+\#\.]+)(?:\s+session)?\s+for\s+/i,
  
  // Handle "study X" and "learn X" - IMPROVED version
  /(?:study|learn)\s+([a-zA-Z\s\+\#\.]+?)(?:\s+study\s+plan|\s+plan|\s+for|\s+from|\s+starting|\s+at|\s+daily|\s+weekly|\s+monthly|\s*$)/i,
  
  // Handle "The subject is X" and "subject is X"
  /(?:the\s+)?subject\s+is\s+([a-zA-Z\s\+\#\.]+?)(?:\s+and|\s*$)/i,
  
  // Handle "The topic is X" and "topic is X"  
  /(?:the\s+)?topic\s+is\s+([a-zA-Z\s\+\#\.]+?)(?:\s+and|\s*$)/i,
  
  // Handle "want to learn X" and "want to study X"
  /(?:want to learn|want to study)\s+([a-zA-Z\s\+\#\.]+?)(?:\s+for|\s+from|\s+starting|\s+at|\s+daily|\s+weekly|\s+monthly|\s*$)/i,
  
  // Handle "it's X" or "its X"
  /it'?s\s+([a-zA-Z\s\+\#\.]+?)(?:\s+and|\s+for|\s+from|\s+starting|\s+at|\s+daily|\s+weekly|\s+monthly|\s*$)/i
];

// FIXED: Duration extraction patterns - Add these to your periodPatterns array
const improvedPeriodPatterns = [
  // Handle "Create a 2 month plan" - extract from anywhere in message
  /create\s+a?\s+(\d+)\s*(days?|weeks?|months?)/i,
  
  // Handle "for 2 months" 
  /for\s+(\d+)\s*(days?|weeks?|months?)/i,
  
  // Handle "2 months daily" or "2 months ending" or just "2 months"
  /(\d+)\s*(days?|weeks?|months?)(?:\s+(?:daily|weekly|monthly|ending|plan|study)|$)/i,
  
  // Handle "last for 2 months" or "duration of 2 months"
  /(?:last\s+for|duration\s+of)\s+(\d+)\s*(days?|weeks?|months?)/i,
  
  // Handle "end it after 2 months"
  /end\s+it\s+after\s+(\d+)\s*(days?|weeks?|months?)/i,
  
  // Handle "2 months from now"
  /(\d+)\s*(days?|weeks?|months?)\s+from\s+now/i
];

// Updated extractScheduleManually function with better patterns
function extractScheduleManually(message, existingDetails = {}) {
  const result = { ...existingDetails };
  const messageLower = message.toLowerCase();
  
  // IMPROVED subject/title extraction
  if (!result.title) {
    for (const pattern of improvedSubjectPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        // Validate it's actually a subject, not a sentence fragment
        const invalidSubjects = ['session duration', 'duration', 'session duration is', 'minutes', 'hour', 'hours', 'plan', 'study'];
        if (extracted.length >= 2 && !invalidSubjects.some(invalid => extracted.toLowerCase().includes(invalid))) {
          result.title = extracted;
          console.log(`Extracted subject: "${extracted}" using pattern: ${pattern.source}`);
          break;
        }
      }
    }
  }
  
  // Extract time patterns (keep existing working code)
  if (!result.startingTime) {
    const timePatterns = [
      /(?:at|start\s+at)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
      /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i,
      /\b(\d{1,2}:\d{2})\b/,
    ];
    
    for (const pattern of timePatterns) {
      const match = message.match(pattern);
      if (match) {
        const parsedTime = parseTimeToHHMM(match[1]);
        if (parsedTime) {
          result.startingTime = parsedTime;
          console.log(`Extracted and parsed time: "${match[1]}" -> "${parsedTime}"`);
          break;
        }
      }
    }
  }
  
  // Extract duration in minutes (keep existing working code)
  if (!result.dailyDuration) {
    const durationPatterns = [
      /(\d+)\s*minutes?/i,
      /(\d+)\s*mins?/i,
      /(?:for\s+)?(\d+)\s*hours?\s*(\d+)?\s*minutes?/i,
      /(?:for\s+)?(\d+)\s*hours?(?!\s*minutes)/i
    ];
    
    for (const pattern of durationPatterns) {
      const match = message.match(pattern);
      if (match) {
        if (pattern.source.includes('hours')) {
          const hours = parseInt(match[1]) || 0;
          const minutes = parseInt(match[2]) || 0;
          result.dailyDuration = (hours * 60) + minutes;
        } else {
          result.dailyDuration = parseInt(match[1]);
        }
        console.log(`Extracted duration: ${result.dailyDuration} minutes`);
        break;
      }
    }
  }
  
  // Extract date references (keep existing working code)
  if (!result.startDate) {
    if (messageLower.includes('tomorrow')) {
      result.startDate = parseNaturalDate('tomorrow');
    } else if (messageLower.includes('today')) {
      result.startDate = parseNaturalDate('today');
    } else if (messageLower.includes('next week')) {
      result.startDate = parseNaturalDate('next week');
    }
  }
  
  // IMPROVED duration period extraction
  if (!result.endDate) {
    for (const pattern of improvedPeriodPatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = match[1];
        const unit = match[2];
        const startDate = result.startDate || parseNaturalDate('today');
        if (startDate) {
          result.endDate = parseNaturalDate(`${amount} ${unit}`, new Date(startDate));
          console.log(`Extracted period: ${amount} ${unit} -> End Date: ${result.endDate}`);
          break;
        }
      }
    }
  }
  
  // Extract repeat pattern (keep existing working code)
  if (!result.repeatPattern) {
  if (/\bdaily\b/i.test(messageLower)) result.repeatPattern = 'daily';
  else if (/\bweekly\b/i.test(messageLower)) result.repeatPattern = 'weekly';
  else if (/\bmonthly\b/i.test(messageLower)) result.repeatPattern = 'monthly';
}
  
  // Clean up invalid titles
  if (result.title) {
    const invalidTitles = ['session duration', 'duration', 'session duration is', 'minutes', 'hour', 'plan'];
    if (invalidTitles.some(invalid => result.title.toLowerCase().includes(invalid))) {
      delete result.title;
    }
  }
  
  return result;
}

// UPDATED validation function to provide better debugging and use result instead of details
function validateScheduleDetails(result) {
  const missing = [];
  const errors = [];
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  console.log('Validating schedule result:', result);
  
  // Check required fields
  if (!result.title || result.title.trim() === '') {
    missing.push('study subject/topic');
    console.log('Missing: title');
  }
  if (!result.startDate) {
    missing.push('starting date');
    console.log('Missing: startDate');
  }
  if (!result.endDate) {
    missing.push('duration or ending date');
    console.log('Missing: endDate');
  }
  if (!result.dailyDuration || result.dailyDuration <= 0) {
    missing.push('session duration in minutes');
    console.log('Missing: dailyDuration');
  }
  if (!result.startingTime || result.startingTime.trim() === '') {
    missing.push('starting time for each session');
    console.log('Missing: startingTime');
  }
  if (!result.repeatPattern) {
  missing.push('repeat pattern (daily, weekly, monthly)');
  console.log('Missing: repeatPattern');
}

  
  // Validate title is not a sentence fragment about duration
  if (result.title) {
    const invalidTitles = ['session duration', 'duration', 'session duration is', 'minutes', 'hour', 'hours'];
    if (invalidTitles.some(invalid => result.title.toLowerCase().includes(invalid))) {
      errors.push('Invalid study subject detected. Please provide a valid subject name like "JavaScript", "Python", "Mathematics", etc.');
    }
  }
  
  // Date validations
  if (result.startDate) {
    const startDate = new Date(result.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format');
    } else if (startDate < currentDate) {
      errors.push('Start date must be today or in the future');
    }
  }
  
  if (result.endDate) {
    const endDate = new Date(result.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format');
    } else if (endDate < currentDate) {
      errors.push('End date must be today or in the future');
    }
  }
  
  if (result.startDate && result.endDate) {
    const startDate = new Date(result.startDate);
    const endDate = new Date(result.endDate);
    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }
  }
  
  // FIXED: More flexible time validation - accepts any valid HH:MM format
  if (result.startingTime) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(result.startingTime)) {
      // Try to parse and convert the time format
      const parsedTime = parseTimeToHHMM(result.startingTime);
      if (parsedTime) {
        // Update the result with properly formatted time
        result.startingTime = parsedTime;
        console.log(`Fixed time format: ${result.startingTime} -> ${parsedTime}`);
      } else {
        errors.push('Starting time must be in valid format (e.g., "9am", "2:30pm", "14:30")');
      }
    }
  }
  
  // Duration validation
  if (result.dailyDuration && (result.dailyDuration < 1 || result.dailyDuration > 480)) {
    errors.push('Daily duration must be between 1 and 480 minutes');
  }
  
  console.log('Validation result - Missing:', missing, 'Errors:', errors);
  
  return { missing, errors };
}

async function handleNewSchedule(req, res, userId, message) {
  try {
    // Extract initial result from the message using enhanced NLP
    const extractedResult = await extractScheduleFromMessage(message);
    
    // Validate extracted result
    const validation = validateScheduleDetails(extractedResult);
    
    // If there are validation errors, return them
    if (validation.errors.length > 0) {
      await Conversation.create({ userId, role: 'user', message });
      const errorMsg = `I found some issues with the schedule result: ${validation.errors.join(', ')}. Please provide correct information.`;
      await Conversation.create({ userId, role: 'assistant', message: errorMsg });
      
      return res.status(400).json({ 
        error: errorMsg,
        validationErrors: validation.errors 
      });
    }

    // If there are missing fields, store context and ask for them
    if (validation.missing.length > 0) {
      // Store the conversation context and partial result
      tempSchedules.set(userId, {
        ...extractedResult,
        missing: validation.missing,
        conversationHistory: [
          { role: 'user', message: message },
        ],
        lastAskedFor: validation.missing.slice()
      });

      // Save the user's message
      await Conversation.create({ userId, role: 'user', message });

      // Create a more structured follow-up question
      let followUpMsg = "I need a few more details to create your study schedule:\n\n";
      followUpMsg += "Current info:\n";
      if (extractedResult.title) followUpMsg += `• Subject: ${extractedResult.title}\n`;
      if (extractedResult.startDate) followUpMsg += `• Start Date: ${extractedResult.startDate}\n`;
      if (extractedResult.endDate) followUpMsg += `• End Date: ${extractedResult.endDate}\n`;
      if (extractedResult.dailyDuration) followUpMsg += `• Session Duration: ${extractedResult.dailyDuration} minutes\n`;
      if (extractedResult.startingTime) followUpMsg += `• Start Time: ${extractedResult.startingTime}\n`;
      
      followUpMsg += "\nStill needed:\n";
      validation.missing.forEach(item => {
        followUpMsg += `• ${item}\n`;
      });
      
      followUpMsg += "\nPlease provide the missing information.";

      await Conversation.create({ userId, role: 'assistant', message: followUpMsg });

      return res.status(200).json({ 
        ask: followUpMsg,
        partial: true,
        extractedSoFar: extractedResult,
        missing: validation.missing 
      });
    }

    // All required fields are present and valid, create the schedule
    return await createFinalSchedule(res, userId, extractedResult, message);
    
  } catch (error) {
    console.error('handleNewSchedule error:', error);
    res.status(500).json({ error: 'Failed to process schedule request' });
  }
}

async function handleMissingDetails(req, res, userId, message, pendingSchedule) {
  try {
    // Add current message to conversation history
    pendingSchedule.conversationHistory.push({ role: 'user', message: message });
    
    // Extract additional result from the new message, preserving existing ones
    const updatedResult = await extractScheduleFromMessage(message, pendingSchedule);
    
    // Validate all fields
    const validation = validateScheduleDetails(updatedResult);

    // Save user message
    await Conversation.create({ userId, role: 'user', message });

    // Check for validation errors
    if (validation.errors.length > 0) {
      const errorMsg = `I found some issues: ${validation.errors.join(', ')}. Please provide correct information.`;
      await Conversation.create({ userId, role: 'assistant', message: errorMsg });
      
      return res.status(400).json({ 
        error: errorMsg,
        validationErrors: validation.errors 
      });
    }

    if (validation.missing.length > 0) {
      // Still missing result - update the stored context
      tempSchedules.set(userId, {
        ...updatedResult,
        missing: validation.missing,
        conversationHistory: pendingSchedule.conversationHistory,
        lastAskedFor: validation.missing.slice()
      });
      
      // Create simpler follow-up message
      let followUpMsg = "Thanks! I still need:\n";
      validation.missing.forEach(item => {
        followUpMsg += `• ${item}\n`;
      });
      followUpMsg += "\nCould you provide these details?";
      
      await Conversation.create({ userId, role: 'assistant', message: followUpMsg });
      
      return res.status(200).json({ 
        ask: followUpMsg,
        partial: true,
        extractedSoFar: updatedResult,
        missing: validation.missing 
      });
    }

    // All result complete - clear temporary data and create schedule
    tempSchedules.delete(userId);
    
    return await createFinalSchedule(res, userId, updatedResult, message);
    
  } catch (error) {
    console.error('handleMissingDetails error:', error);
    res.status(500).json({ error: 'Failed to process missing details' });
  }
}

async function createFinalSchedule(res, userId, scheduleResult, originalMessage) {
  try {
    // Create a simpler, more reliable prompt for AI task generation
    const taskGenerationPrompt = `Create study tasks for a ${scheduleResult.title} schedule.

Schedule Details:
- Subject: ${scheduleResult.title}
- Start: ${scheduleResult.startDate}
- End: ${scheduleResult.endDate}
- Daily Duration: ${scheduleResult.dailyDuration} minutes
- Start Time: ${scheduleResult.startingTime}
- Repeat Pattern: ${scheduleResult.repeatPattern}

Generate study tasks as JSON array based on the repeat pattern:
- Daily: Create tasks for each day
- Weekly: Create tasks for each week (same day each week)
- Monthly: Create tasks for each month (same date each month)

Each task should have:
{
  "name": "Session X: Topic Name",
  "topic": "Specific topic for this session",
  "duration": ${scheduleResult.dailyDuration},
  "starting_time": "${scheduleResult.startingTime}",
  "date": "YYYY-MM-DD",
  "description": "What to study this session"
}

Return only the JSON array of tasks.`;

    // Generate tasks using AI with error handling
    let tasksArray = [];
    try {
      const aiResponse = await askMentor({ 
        message: taskGenerationPrompt, 
        context: [] 
      });
      
      // Extract tasks from AI response
      const [_, extractedTasks] = extractPlanDetails(aiResponse, originalMessage);
      tasksArray = extractedTasks || [];
      
      // If no tasks extracted, create basic daily tasks
      if (tasksArray.length === 0) {
        tasksArray = generateBasicTasks(scheduleResult);
      }
    } catch (aiError) {
      console.error('AI task generation failed, using fallback:', aiError);
      tasksArray = generateBasicTasks(scheduleResult);
    }

    // Create schedule in database
    const schedule = await Schedule.create({
      schedule_title: scheduleResult.title,
      starting_date: new Date(scheduleResult.startDate),
      end_date: new Date(scheduleResult.endDate),
      status: 'active',
      owner_id: userId,
      description: scheduleResult.description || `Study plan for ${scheduleResult.title}`,
      repeat_pattern: scheduleResult.repeatPattern,
    });

    // Create tasks with proper validation
    const tasksToCreate = tasksArray.map(task => ({
      name: task.name || `Study Session`,
      topic: task.topic || scheduleResult.title,
      duration: task.duration || scheduleResult.dailyDuration,
      starting_time: task.starting_time || scheduleResult.startingTime,
      date: new Date(task.date || scheduleResult.startDate),
      description: task.description || `Study ${task.topic || scheduleResult.title}`,
      status: 'pending',
      missed: false,
      schedule_id: schedule._id,
    }));
    
    // Insert tasks in batch
    await Task.insertMany(tasksToCreate);

    // Save conversation
    await Conversation.create({ userId, role: 'user', message: originalMessage });
    const successMsg = `✅ Schedule "${scheduleResult.title}" created successfully with ${tasksToCreate.length} tasks from ${scheduleResult.startDate} to ${scheduleResult.endDate}.`;
    await Conversation.create({ userId, role: 'assistant', message: successMsg });

    return res.json({ 
      success: true,
      message: successMsg,
      schedule, 
      tasksCreated: tasksToCreate.length 
    });

  } catch (error) {
    console.error('createFinalSchedule error:', error);
    res.status(500).json({ error: 'Failed to create final schedule' });
  }
}

// Fallback function to generate basic tasks when AI fails
function generateBasicTasks(scheduleResult) {
  const tasks = [];
  const startDate = new Date(scheduleResult.startDate);
  const endDate = new Date(scheduleResult.endDate);
  const repeatPattern = scheduleResult.repeatPattern;
  
  let currentDate = new Date(startDate);
  let sessionCounter = 1;
  
  while (currentDate <= endDate) {
    tasks.push({
      name: `Session ${sessionCounter}: Study ${scheduleResult.title}`,
      topic: scheduleResult.title,
      duration: scheduleResult.dailyDuration,
      starting_time: scheduleResult.startingTime,
      date: currentDate.toISOString().split('T')[0],
      description: `Study session ${sessionCounter} for ${scheduleResult.title}`
    });
    
    // Move to next occurrence based on repeat pattern
    switch (repeatPattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        currentDate.setDate(currentDate.getDate() + 1);
    }
    sessionCounter++;
  }
  
  return tasks;
}

module.exports = {
  chat,
  createSchedule,
};