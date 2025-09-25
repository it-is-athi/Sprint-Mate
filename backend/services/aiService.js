// backend/services/aiService.js
const axios = require('axios');

// --- Prompt Definitions for Readability ---

const JSON_STRUCTURE_GUIDE = `
  **Schedule JSON Structure:**
  {
    "schedule_title": "string (use exactly as provided)",
    "starting_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD", 
    "description": "string (2-line professional summary of the learning path you created)",
    "repeat_pattern": "['once', 'daily', 'weekly', 'monthly']",
    "status": "active"
  }

  **Task JSON Structure (for the tasks_data array) - MUST match exactly:**
  {
    "name": "string (required) - e.g., 'Day 1: Variables & Loops'",
    "topic": "string - Unique portion/topic for the day",
    "date": "string (required) - YYYY-MM-DD format",
    "description": "string - Detailed description of what to learn/do",
    "status": "pending",
    "missed": false
  }
`;

// --- AI Service Functions ---
/**
 * Generates a complete schedule and tasks from form data.
 * @param {object} scheduleData - Complete schedule details from the form.
 * @returns {Promise<object>} - A JSON object with schedule_data and tasks_data.
 */
exports.generateScheduleFromForm = async (scheduleData) => {
  // Handle optional description
  const hasUserDescription = scheduleData.description && scheduleData.description.trim().length > 0;
  
  const systemPrompt = `
    You are SprintMate, an expert task scheduler and study mentor. You will receive complete schedule details from a form and need to generate appropriate tasks.

    **Your Task:**
    Create a detailed, actionable schedule with tasks. The response MUST be a single JSON object with two keys: "schedule_data" and "tasks_data".

    **CRITICAL TASK GENERATION RULES:**
    1. **Use Exact Title:** Use the provided schedule_title exactly as given.
    2. **Generate Professional Description:** Create a 2-line professional summary of the learning path you designed. This should describe what the schedule covers and the learning progression, regardless of whether user provided description or not.
    3. **Content Strategy:** ${hasUserDescription 
        ? 'User provided specific topics/description - use this as guidance but expand with your expertise to create comprehensive learning progression.'
        : 'No specific topics provided - research the schedule title and create a complete, logical curriculum from your knowledge base.'
    }
    4. **Calculate Task Count:** Based on repeat_pattern and date range (starting_date to end_date):
       - **daily**: Create a task for EACH DAY in the date range
       - **weekly**: Create a task for EACH WEEK in the date range  
       - **monthly**: Create a task for EACH MONTH in the date range
       - **once**: Create only 1 task
    5. **Task Fields (ALL REQUIRED):**
       - **name**: Progressive names like "Day 1: Introduction to Basics", "Day 2: Advanced Concepts"
       - **topic**: Specific learning topic for that session
       - **date**: Exact date for each task in YYYY-MM-DD format
       - **description**: Detailed learning objectives for that session
       - **status**: Always "pending"
       - **missed**: Always false
    6. **Research & Progression:** ${hasUserDescription
        ? 'Use the provided topics as foundation, but enhance with additional relevant concepts for comprehensive learning.'
        : 'Research the schedule subject thoroughly and create a complete learning path with proper skill progression.'
    }

    **IMPORTANT DESCRIPTION REQUIREMENT:**
    Always generate a professional 2-line description in the schedule_data that summarizes the complete learning journey you created. This should be engaging and informative, describing the scope and progression of the curriculum.

    **Schedule Details Provided:**
    ${JSON.stringify(scheduleData, null, 2)}

    **IMPORTANT:** The tasks_data array must contain individual task objects that match the Task schema exactly. Each task must have all required fields.

    ${JSON_STRUCTURE_GUIDE}

    Generate the complete schedule now. Be encouraging and educational in task descriptions.
  `;

  try {
    const response = await axios.post(process.env.GROQ_API_URL, {
      model: process.env.GROQ_MODEL,
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error calling Groq API for form-based generation:', error.response ? error.response.data : error.message);
    throw new Error('Failed to generate schedule from form data.');
  }
};
