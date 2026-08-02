const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getBrowserAnalysisPrompt } = require('../prompts/browserAnalysis.prompt');

// Allowed Categories for SessionLens
const ALLOWED_CATEGORIES = [
  'Coding',
  'Learning',
  'Documentation',
  'Research',
  'Shopping',
  'Entertainment',
  'Meetings',
  'Social Media',
  'News',
  'Other'
];

/**
 * Sends a list of browser events to the Gemini API and parses the AI-generated session metadata.
 * 
 * @param {Array} events - List of browser events.
 * @returns {Promise<Object>} Object containing sessionTitle, category, summary, and tags.
 */
async function analyzeSession(events) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini Service] GEMINI_API_KEY environment variable is missing.');
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    throw new Error('Invalid input: events array is required and cannot be empty');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-3.5-flash for fast and cost-effective text analysis
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        // Enforcing JSON output makes response parsing extremely robust
        responseMimeType: 'application/json',
        maxOutputTokens: 1000
      }
    });

    const prompt = getBrowserAnalysisPrompt(events);
    
    // Extract multimodal visual context from the events
    const mediaParts = [];
    events.forEach(evt => {
      if (evt.screenshot) {
        const part = parseMediaPart(evt.screenshot);
        if (part) mediaParts.push(part);
      }
      if (evt.video) {
        const part = parseMediaPart(evt.video);
        if (part) mediaParts.push(part);
      }
    });
    
    console.log(`[Gemini Service] Requesting analysis for ${events.length} browser events and ${mediaParts.length} visual media files...`);
    
    // Pass prompt and mediaParts together to model.generateContent()
    const contentPayload = mediaParts.length > 0 ? [prompt, ...mediaParts] : prompt;
    const result = await model.generateContent(contentPayload);
    const responseText = result.response.text();
    
    console.log(`[Gemini Service] Received response: ${responseText}`);

    let sessionData;
    let cleanText = responseText.trim();
    try {
      sessionData = JSON.parse(cleanText);
    } catch (parseError) {
      console.warn('[Gemini Service] Initial JSON parse failed, attempting auto-repair...');
      try {
        // Simple JSON auto-repair for common trailing truncation
        if (cleanText.startsWith('{') && !cleanText.endsWith('}')) {
          if (cleanText.includes('"tags": [') && !cleanText.includes(']')) {
            cleanText += ']}';
          } else {
            cleanText += '}';
          }
          sessionData = JSON.parse(cleanText);
          console.log('[Gemini Service] Auto-repaired JSON successfully!');
        } else {
          throw parseError;
        }
      } catch (repairError) {
        console.error('[Gemini Service] Failed to parse JSON response text:', responseText, parseError);
        throw new Error('Gemini API response did not contain valid JSON format');
      }
    }

    // Response validation and cleaning
    const validatedData = {
      sessionTitle: sessionData.sessionTitle || 'Browsing Session',
      category: sessionData.category || 'Other',
      summary: sessionData.summary || 'User visited multiple pages in this session.',
      tags: Array.isArray(sessionData.tags) ? sessionData.tags : []
    };

    // Ensure category is strictly within the allowed set
    if (!ALLOWED_CATEGORIES.includes(validatedData.category)) {
      console.warn(`[Gemini Service] Invalid category returned: "${validatedData.category}". Coercing to "Other".`);
      validatedData.category = 'Other';
    }

    return validatedData;
  } catch (error) {
    console.error('[Gemini Service] Error during session analysis:', error);
    throw error;
  }
}

/**
 * Helper to parse a data URL (e.g. data:image/jpeg;base64,...) into a generative part for Gemini.
 */
function parseMediaPart(dataUrl) {
  try {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
    const matches = dataUrl.match(/^data:([a-zA-Z0-9\-]+\/[a-zA-Z0-9\-\.\+]+);base64,(.+)$/);
    if (!matches) return null;
    return {
      inlineData: {
        data: matches[2],
        mimeType: matches[1]
      }
    };
  } catch (e) {
    console.warn('[Gemini Service] Failed to parse media part data URL:', e.message);
    return null;
  }
}

module.exports = {
  analyzeSession
};
