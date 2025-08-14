// backend/services/aiService.js
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:latest';

const mentorSystemPrompt = `
You are SprintMate AI, a warm, supportive study mentor + scheduler.
- Propose realistic plans with breaks.
- Encourage without guilt.
- Keep answers short and structured.
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

module.exports = { askMentor };
