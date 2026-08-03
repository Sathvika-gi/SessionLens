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

Additionally, the request may contain attached screenshots corresponding to these browser events.

Analysis Guidelines & Priority Order:
1. Browser Events (Highest Priority): First, analyze the sequence, page titles, and URLs of the browser events.
2. Page Titles & URLs: Use these as the primary source of truth to understand the session.
3. Screenshots (Supplementary Context Only):
   - Use any attached screenshots ONLY as secondary/supporting evidence to verify, refine, or improve the accuracy of the generated details (e.g., confirming specific topics discussed on a page, styling details, or active coding problems).
   - If the screenshots do not provide additional useful context, ignore them completely and rely on the text events.
   - Screenshots must NEVER override strong evidence from browser events, page titles, or URLs.
   - Do not replace the existing reasoning logic; screenshots are strictly supplementary.

Determine:
1. sessionTitle: A clean, human-readable title that captures the core focus or user intent of the browsing block.
   Strict rules for sessionTitle:
   - Always prioritize page titles and visual context (screenshots) over raw URLs.
   - NEVER use raw URLs, domain names, or query parameters in the title (e.g. do NOT use "google.com/search?q=dribbble..." or "dribbble.com").
   - NEVER include search query strings or raw search URLs. Instead, infer the search topic and destination (e.g., use "Dribbble UI Designs" or "Design Inspiration Research" instead of "google.com/search?q=dribbble").
   - DO NOT hallucinate, assume, or invent project names, software architectures, or activities that are not directly supported by the recorded browser events. Never invent titles like "React App Architecture" or "GitHub Repository Code Review" unless those exact topics are clearly visible in the browsing history.
   - If the browsing session is primarily exploratory or mixed (e.g., Google Search -> Dribbble -> JioSaavn), generate a neutral, descriptive title (e.g., "Exploring Dribbble UI Inspiration", "Music Search Session", "UI Design Research", "React Documentation Review", "LeetCode Practice").
   - Keep the title length strictly between 3 and 8 words.
   - Make it descriptive, natural, and professional.
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
3. summary: A unique, session-specific summary describing what the user actually did during the browsing block.
   Strict rules for summary:
   - Generate a distinct, custom summary based only on the actual browser events, page titles, URLs, and screenshots.
   - Describe what actually happened, not what you assume the user was trying to do.
   - Do NOT infer project names, software architectures, or activities unless they are directly supported by the data.
   - NEVER use template sentences, generic boilerplates, or repeat the same wording across sessions.
   - Describe the actual user actions and goals in a natural, coherent, and human-readable way.
   - Prioritize page titles and the chronological browsing sequence over raw domain names.
   - Keep the summary length strictly between 30 and 60 words.
4. tags: A list of 2-5 relevant keyword tags associated with this session (e.g., ["React", "Hooks", "JavaScript"]).

Writing Guidelines:
- You MUST generate all text (sessionTitle, summary, and tags) in proper, grammatically correct, and professional English.
- Avoid generic summaries or vague boilerplates. Write details specific to the actual pages visited.

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
