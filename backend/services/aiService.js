// backend/services/aiService.js
const mentorSystemPrompt = `
When asked to create a study plan, always respond with a JSON object in the following format:

{
  "schedule": {
    "title": "...",
    "startDate": "...",
    "endDate": "...",
    "ownerId": "...",
    "description": "...",
    "repeatPattern": "daily"
  },
  "tasks": [
    {
      "name": "...", // Give each task with the same schedule name; all tasks belonging to the same schedule have the same name
      "topic": "...", // All other subtopics that describe the task should be in here separated by "-"
      "date": "...", // Use a single date in YYYY-MM-DD format for each task. Do NOT use a date range.
      "duration": ...,
      "starting_time": "...",
      "description": "...", // Describe what will be covered uniquely for each day
      "status": "pending"
    },
    ...
  ]
}

CRITICAL DATE RULES:
1. NEVER use dates before today. NEVER use past dates.
2. If no start date is specified, use TODAY's date.
3. If user says "tomorrow", use TOMORROW's date.
4. If user says "next week", start from next Monday.
5. Always calculate end date based on duration from start date.
6. End date must be AFTER start date.

CURRENT DATE CONTEXT: Today is ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD format).
YOUR JOB:
- Dynamically research or infer the subject.
- Break it into **unique learning topics for each day** (no repetition).
- Example: If user asks for a 30-day Python plan → Task1: variables, Task2: operators, Task3: control flow, … etc.
- Always generate the correct number of tasks (days = duration).
- Each day’s task must be **specific and progressive** in difficulty.

RESPONSE STYLE:
- Be CONCISE and DIRECT
- Keep responses SHORT but COMPLETE
- Avoid unnecessary explanations
- Get straight to the point
- Use simple, clear language

If the user's input is missing any required schedule attributes (such as ending date, repeat pattern, or start time), ask for the missing information in a SHORT, friendly way. 
Be direct and specific about what you need.

Do not include any extra text outside the JSON object unless you are asking for missing information. 
When asking for missing info, respond ONLY with a short, direct question, and do NOT include any JSON.
`;


async function askMentor({ message, context }) {
  // Get environment variables inside the function
  const GROQ_API_URL = process.env.GROQ_API_URL;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';
  
  console.log('GROQ_API_URL:', GROQ_API_URL);
  console.log('GROQ_API_KEY:', GROQ_API_KEY ? 'Set' : 'Not set');
  console.log('GROQ_MODEL:', GROQ_MODEL);

  // Use Groq API only
  if (GROQ_API_KEY && GROQ_API_URL) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: mentorSystemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    // ✅ ADDED: Better error logging to debug 400 errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Details:', errorText);
      throw new Error(`Groq error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return (data.choices && data.choices[0].message.content)
      ? data.choices[0].message.content.trim()
      : 'Sorry, I could not respond.';
  } else {
    throw new Error('Groq API credentials are not set in .env');
  }
}

function extractPlanDetails(aiResponse, originalMessage) {
  try {
    // Find the first JSON object in the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.schedule || !Array.isArray(parsed.tasks)) throw new Error('Invalid format');
    return [parsed.schedule, parsed.tasks];
  } catch (err) {
    console.error('extractPlanDetails error:', err);
    return [{}, []];
  }
}

module.exports = { askMentor, extractPlanDetails };
