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
      "name": "...",
      "date": "...",
      "duration": ...,
      "starting_time": "...",
      "repeat_pattern": "...",
      "description": "...",
      "status": "pending"
    },
    ...
  ]
}

Do not include any extra text outside the JSON object.
`;

async function askMentor({ message, context }) {
  const prompt = `${mentorSystemPrompt}
Context:
${context.join('\n')}

User: ${message}
Assistant:`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false })
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  return (data && data.response) ? data.response.trim() : 'Sorry, I could not respond.';
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
