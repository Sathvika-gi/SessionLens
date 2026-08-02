/**
 * Generates the prompt instructing Gemini to analyze browser events.
 * 
 * @param {Array} events - Array of raw browser events containing url, title, and timestamp.
 * @returns {string} The formatted prompt string.
 */
function getBrowserAnalysisPrompt(events) {
  const formattedEvents = events.map((event, index) => {
    return `${index + 1}. Title: "${event.title || 'Untitled'}", URL: "${event.url || 'unknown'}", Time: "${event.timestamp || 'unknown'}"`;
  }).join('\n');

  return `You are an AI browser activity memory system. Your task is to analyze a chronological sequence of browser events from a user's browsing session and organize it into a structured, meaningful session summary.

Chronological browser events:
${formattedEvents}

Analyze the sequence, page titles, and URLs to determine:
1. sessionTitle: A concise, human-friendly title that captures the core focus of the browsing block (e.g., "Learning React Hooks", "Exploring Travel Deals").
2. category: Classify this session into EXACTLY ONE of the following allowed categories:
   - Coding
   - Learning
   - Documentation
   - Research
   - Shopping
   - Entertainment
   - Meetings
   - Social Media
   - News
   - Other
3. summary: A short, 1-2 sentence description explaining what the user did during this session (e.g., "Worked on understanding React Hooks while referring to official documentation and testing examples.").
4. tags: A list of 2-5 relevant keyword tags associated with this session (e.g., ["React", "Hooks", "JavaScript"]).

You MUST return ONLY a valid JSON object matching the following structure exactly. Do not wrap the JSON in markdown formatting blocks, do not include any backticks (e.g., do NOT start with \`\`\`json), and do not include any explanatory text before or after the JSON.

JSON Structure:
{
  "sessionTitle": "Session Title Here",
  "category": "One of the Allowed Categories",
  "summary": "Short summary description here.",
  "tags": ["tag1", "tag2"]
}`;
}

module.exports = {
  getBrowserAnalysisPrompt
};
