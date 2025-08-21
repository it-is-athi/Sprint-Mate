// backend/services/aiService.js
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:latest';

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
      "name": "...", // Give each task with the same schedule name make sure all tasks belonging to the same schedule have the same name
      "topic": "...", // All other subtopics that describe the task should be in here separated by "-"
      "date": "...",// Use a single date in YYYY-MM-DD format for each task. Do NOT use a date range.
      "duration": ...,
      "starting_time": "...",
      "description": "...", // Describe what will be covered uniquely for each day
      "status": "pending"
    },
    ...
  ]
}

Your job is to think creatively and break down the subject or plan into unique daily tasks, portions, or topics, based on the user's input. 
For example, if the user asks for a 1-month ML plan, generate 30 unique ML topics and assign each to a different day. Do not repeat the same topic. 
If the subject is unfamiliar, research and break it down into logical learning steps. 
Always ensure each task is unique and relevant to the subject and duration. Do not include any extra text outside the JSON object.
`;

async function askMentor({ message, context }) {
  const prompt = `${mentorSystemPrompt}
Context:
${context.join('\n')}

User: ${message}
Assistant:`;

  // Use Groq API only
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_URL) {
    const response = await fetch(process.env.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages: [
          { role: 'system', content: mentorSystemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`Groq error: ${response.status}`);
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
