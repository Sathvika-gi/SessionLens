const express = require('express');
const router = express.Router();
const geminiService = require('../services/gemini.service');
const Session = require('../models/Session');
const Activity = require('../models/Activity');

/**
 * Helper to safely extract domain name from a URL string.
 */
function extractDomain(urlStr) {
  try {
    if (!urlStr || urlStr === 'unknown') return null;
    const parsed = new URL(urlStr);
    return parsed.hostname.replace('www.', '');
  } catch (e) {
    return null;
  }
}

/**
 * POST /api/ai/analyze-session
 * 
 * Takes a list of browser events, calls the Gemini API to analyze and categorize them,
 * links them to database activity IDs, and stores the resulting session in MongoDB.
 */
router.post('/analyze-session', async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: "events" array is required and cannot be empty.'
      });
    }

    console.log(`[AI Route] Analyzing a session with ${events.length} events.`);

    // 1. Call Gemini service to perform AI analysis
    let aiAnalysis;
    try {
      aiAnalysis = await geminiService.analyzeSession(events);
    } catch (geminiError) {
      console.error('[AI Route] Gemini service call failed:', geminiError);
      return res.status(502).json({
        success: false,
        message: 'AI Service failed to analyze browser activity.',
        error: geminiError.message
      });
    }

    // 2. Map event payload to database ObjectIds (Activity schema)
    const relatedEvents = [];
    for (const event of events) {
      if (event._id) {
        relatedEvents.push(event._id);
      } else {
        // Find existing activity log by matching URL and timestamp
        let activity = await Activity.findOne({
          url: event.url,
          timestamp: new Date(event.timestamp)
        });

        // If the activity log doesn't exist in MongoDB, insert it
        // to maintain document reference integrity
        if (!activity) {
          activity = await Activity.create({
            url: event.url,
            title: event.title || 'Untitled',
            timestamp: new Date(event.timestamp),
            eventType: event.eventType || 'url_updated'
          });
        }
        relatedEvents.push(activity._id);
      }
    }

    // 3. Extract unique website domains visited
    const websitesSet = new Set();
    events.forEach(e => {
      const dom = extractDomain(e.url);
      if (dom) websitesSet.add(dom);
    });
    const websitesVisited = Array.from(websitesSet);

    // 4. Calculate start, end, and duration metrics
    const timestamps = events
      .map(e => new Date(e.timestamp).getTime())
      .filter(t => !isNaN(t));

    const startTime = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : new Date();
    const endTime = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date();
    
    let duration = endTime.getTime() - startTime.getTime();
    if (duration === 0) {
      duration = 120000; // Fallback to 2 minutes duration if single event
    }

    // 5. Store session in MongoDB
    const session = await Session.create({
      sessionTitle: aiAnalysis.sessionTitle,
      category: aiAnalysis.category,
      summary: aiAnalysis.summary,
      tags: aiAnalysis.tags,
      relatedEvents,
      websitesVisited,
      startTime,
      endTime,
      duration
    });

    console.log(`[AI Route] Saved new session: "${session.sessionTitle}" (${session.category})`);

    // Return the newly created Mongoose session document
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('[AI Route] Error processing analyze-session request:', error);
    res.status(500).json({
      success: false,
      message: 'An internal error occurred while saving the AI session.',
      error: error.message
    });
  }
});

module.exports = router;
