// backend/services/aiService.js
const axios = require('axios');

// --- Prompt Definitions for Readability ---

const JSON_STRUCTURE_GUIDE = `
  **Schedule JSON Structure:**
  {
    "schedule_title": "string",
    "starting_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "description": "string",
    "repeat_pattern": "['once', 'daily', 'weekly', 'monthly']"
  }

  **Task JSON Structure (for the tasks_data array):**
  {
    "name": "string",
    "topic": "string",
    "duration": "number (in minutes)",
    "starting_time": "HH:MM (24-hour format)",
    "date": "YYYY-MM-DD",
    "description": "string"
  }
`;

// --- AI Service Functions ---

/**
 * Extracts initial details from the user's prompt with a friendly and robust persona.
 * @param {string} userPrompt - The user's raw message.
 * @returns {Promise<object>} - A JSON object with extracted fields.
 */
exports.extractScheduleDetails = async (userPrompt, existingContext = {}) => {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fullDateString = today.toLocaleDateString('en-US', options); // e.g., "Wednesday, September 10, 2025"

  // Create a string representation of the current context to pass to the AI.
  const contextString = JSON.stringify(existingContext, null, 2);

  const systemPrompt = `
    You are a friendly and supportive scheduling assistant named SprintMate. Your goal is to act as a study mentor and friend, helping users plan their time effectively.

    **Your Task:**
    Your primary goal is to fill in or update a JSON object of schedule details.
    You will be given the **Current Schedule Details** (which may be partially filled) and a new **User Message**.
    Analyze the **User Message** to fill in any \`null\` values in the **Current Schedule Details**.
    If the user provides a correction, update the existing value.
    Return the **complete, updated** JSON object.

    **Current Schedule Details:**
    \`\`\`json
    ${contextString}
    \`\`\`

    **Analysis Rules:**
    - **Dates:** Today is **${fullDateString}**. Use this as your absolute reference. Convert terms like "tomorrow," "this Saturday," or "next Monday" into a strict 'YYYY-MM-DD' format. Be precise: "this Saturday" from a Wednesday must be the upcoming Saturday. Schedules cannot be in the past.
    - **Title Hint:** The 'schedule_title' is often found within single or double quotes. For example, if the user says 'remind me to "Review my Goals"', the title is "Review my Goals".
    - **Times:** Convert specific times like "6pm," "10 in the morning," or "6 o'clock" into a strict "HH:MM" 24-hour format.
      - If a user provides an ambiguous time (e.g., "at 10", "around 2"), set 'task_time' to 'null' and set the 'description' field to a special string: "AM_PM_REQUIRED_FOR_X", where X is the number they gave (e.g., "AM_PM_REQUIRED_FOR_10").
      - If no time is mentioned at all, 'task_time' MUST be null and the description should not be changed.
    - **Durations:** Understand "1 hour" as 60 minutes, "a month" as "1 month", etc.
    - **Repeat Pattern:** Interpret phrases like "every day" as 'daily', "every week" as 'weekly', and "every month" as 'monthly'.

    **Fields to Extract:**
    - schedule_title: The name or title of the plan.
    - starting_date: The specific start date in YYYY-MM-DD format.
    - end_date: The specific end date in YYYY-MM-DD format (if mentioned).
    - description: Any additional details about the schedule's purpose.
    - repeat_pattern: Must be one of ["daily", "weekly", "monthly", "once"].
    - duration: A number representing the length of the schedule (e.g., 30, 4).
    - duration_unit: The unit for the duration, must be one of ["day", "week", "month", "year"].
    - task_time: The time of day for tasks in HH:MM format.
    - task_duration: The duration for each task in minutes.

    **Important Distinction:**
    - \`duration\` and \`duration_unit\` refer to the **total length of the entire schedule** (e.g., a plan that lasts for "3 weeks").
    - \`task_duration\` refers to the **length of a single session or task** within the schedule (e.g., studying "for 90 minutes" each day).

    **Example 1 (Study Plan):**
    - **User Message:** "I need a 2-month plan to prepare for my 'Data Structures' exam. I want to study for 90 minutes every weekday evening."
    - **Correct Extraction:** { "schedule_title": "Data Structures Exam Prep", "duration": 2, "duration_unit": "month", "task_duration": 90, "repeat_pattern": "daily", "task_time": "18:00", ... }

    **Example 2 (Weekly Review):**
    - **User Message:** "Help me review 'Algorithms' every Saturday for 1 hour, for the next 8 weeks."
    - **Correct Extraction:** { "schedule_title": "Algorithms Review", "duration": 8, "duration_unit": "week", "task_duration": 60, "repeat_pattern": "weekly", ... }

    **User Message:** "${userPrompt}"

    Your response MUST be a single, raw, updated JSON object based on the **Current Schedule Details** and the new **User Message**. Do not add any conversational text or comments.
  `;

  try {
    const response = await axios.post(process.env.GROQ_API_URL, {
      model: process.env.GROQ_MODEL,
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error calling Groq API for extraction:', error.response ? error.response.data : error.message);
    throw new Error('Failed to extract details from AI model.');
  }
};

/**
 * Generates a full schedule and tasks from a complete context.
 * @param {object} context - The complete context with all required schedule details.
 * @returns {Promise<object>} - A JSON object with schedule_data and tasks_data.
 */
exports.generateFullSchedule = async (context) => {
  const systemPrompt = `
    You are SprintMate, an expert task scheduler and encouraging study mentor. Your goal is to create a detailed, actionable schedule that helps the user achieve their goals.

    **Your Task:**
    Generate a complete schedule based on the plan details provided. The response MUST be a single JSON object with two keys: "schedule_data" and "tasks_data".

    **CRITICAL LOGIC TO FOLLOW:**
    1.  **Use Provided Title:** The schedule's title MUST be exactly what is in the \`schedule_title\` field from the plan details. Do not invent a new title.
    2.  **Calculate Task Count:** Your primary instruction is to calculate the number of tasks based on the \`repeat_pattern\`, \`duration\`, and \`duration_unit\`. Use the following logic and be precise:
        - **daily**: The number of tasks is the total number of days in the period. For example, a 3-month 'daily' plan should have about 90 tasks. "Every day" means 7 days a week.
        - **weekly**: The number of tasks is the total number of weeks in the period. For example, a 3-month 'weekly' plan should have about 12-13 tasks.
        - **monthly**: The number of tasks is the total number of months. A 3-month 'monthly' plan has 3 tasks.
        - **once**: You MUST create only 1 task.
        - Adhere to this logic strictly. Do not skip days unless the user explicitly says so (e.g., "every weekday").
    3.  **Research and Breakdown:** After calculating the dates, research the main topic ("${context.schedule_title}") and break it down into logical sub-topics, one for each task.

    **JSON Output Structure:**
    - **schedule_data**: An object for the main schedule.
    - **tasks_data**: An array of task objects.
    - Adhere strictly to the structures below.
    ${JSON_STRUCTURE_GUIDE}

    **Plan Details to Use:**
    ${JSON.stringify(context, null, 2)}

    Generate the schedule now. Be encouraging in your task descriptions. Do not add any conversational text, just the JSON object.
  `;

  try {
    const response = await axios.post(process.env.GROQ_API_URL, {
      model: process.env.GROQ_MODEL,
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error calling Groq API for generation:', error.response ? error.response.data : error.message);
    throw new Error('Failed to generate schedule from AI model.');
  }
};

/**
 * Generates a friendly, contextual follow-up question.
 * @param {object} context - The currently known details.
 * @param {string} missingField - The next field that is missing.
 * @returns {Promise<string>} - A friendly question.
 */
exports.generateFollowUpQuestion = async (context, missingField) => {
    const questionMap = {
        schedule_title: "What would you like to call this schedule?",
        starting_date: "When would you like this schedule to start? You can say 'tomorrow' or give a specific date.",
        duration: "How long should the schedule last? (e.g., '30 days', '4 months')",
        repeat_pattern: "How often should the tasks repeat? (e.g., 'daily', 'weekly', or just 'once')",
        task_time: "What time of day should the tasks be scheduled for? (e.g., '6pm')",
        task_duration: "And how long should each task be? (e.g., '1 hour', '90 minutes')",
    };

    const systemPrompt = `
        You are SprintMate, a friendly and helpful scheduling assistant. Your user is in the middle of creating a schedule.
        You need to ask them for the next piece of missing information in a natural, conversational way.

        **Known Information:**
        - Schedule Title: ${context.schedule_title || 'Not yet known'}
        - Start Date: ${context.starting_date || 'Not yet known'}
        - Other Details: ${context.description || 'None'}

        **Information you need to ask for:**
        - ${missingField}

        **Your Task:**
        Based on the known information, generate a single, friendly follow-up question.
        - Acknowledge what you already know to show you're listening.
        - Ask for the missing piece of information clearly.
        - Keep it short and encouraging.

        **Example if you need 'starting_date':**
        "Great, a plan for 'JS Mastery'! When would you like to kick that off?"

        **Example if you need 'task_time':**
        "Okay, the 'Launch Week' plan starts on 2023-10-31. What time should we set for the daily tasks?"

        Now, generate a question to ask for the '${missingField}'. Your response should be only the question itself, with no extra text.
    `;

    try {
        const response = await axios.post(process.env.GROQ_API_URL, {
            model: process.env.GROQ_MODEL,
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.7, // More creative/natural language
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Fallback to a simple question if the API fails or returns empty
        const generatedQuestion = response.data.choices[0].message.content.trim();
        return generatedQuestion || questionMap[missingField];

    } catch (error) {
        console.error('Error calling Groq API for question generation:', error);
        // Fallback to the simple map in case of an API error
        return questionMap[missingField];
    }
};
