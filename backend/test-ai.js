const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const geminiService = require('./services/gemini.service');
const Session = require('./models/Session');
const Activity = require('./models/Activity');

// Load environment variables
dotenv.config();

async function runTest() {
  console.log('--- Starting SessionLens AI Processing Layer Test ---');
  
  // Connect to Database
  await connectDB();

  // Check for GEMINI_API_KEY
  if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL: GEMINI_API_KEY is not defined in backend/.env');
    console.error('Please add GEMINI_API_KEY=your_key to backend/.env and re-run.');
    process.exit(1);
  }

  // 1. Generate sample events payload
  const now = Date.now();
  const sampleEvents = [
    {
      url: 'https://react.dev/reference/react/useEffect',
      title: 'useEffect Reference Documentation - React Docs',
      timestamp: new Date(now - 30 * 60000).toISOString(),
      eventType: 'url_updated'
    },
    {
      url: 'https://github.com/facebook/react/issues/123',
      title: 'React Hooks Bug discussion - facebook/react on GitHub',
      timestamp: new Date(now - 25 * 60000).toISOString(),
      eventType: 'tab_activated'
    },
    {
      url: 'https://chatgpt.com/c/react-cleanup-help',
      title: 'ChatGPT help with useEffect cleanup functions',
      timestamp: new Date(now - 20 * 60000).toISOString(),
      eventType: 'url_updated'
    }
  ];

  try {
    // 2. Clear pre-existing test Sessions and Activities to avoid pollution (optional, but clean)
    console.log('Cleaning up old test documents...');
    await Session.deleteMany({ sessionTitle: 'Learning React Hooks' });
    
    // 3. Resolve database ObjectIds for activities (create raw logs first)
    console.log('Resolving activities ObjectIds in MongoDB...');
    const relatedEvents = [];
    for (const event of sampleEvents) {
      let activity = await Activity.create({
        url: event.url,
        title: event.title,
        timestamp: new Date(event.timestamp),
        eventType: event.eventType
      });
      relatedEvents.push(activity._id);
    }

    // 4. Test Gemini analysis service
    console.log('Sending mock events to Gemini API...');
    const aiAnalysis = await geminiService.analyzeSession(sampleEvents);
    console.log('Successfully received response from Gemini API:');
    console.log(JSON.stringify(aiAnalysis, null, 2));

    // 5. Build other metadata
    const extractDomain = (urlStr) => {
      try {
        const parsed = new URL(urlStr);
        return parsed.hostname.replace('www.', '');
      } catch (e) {
        return 'unknown';
      }
    };
    const websitesVisited = sampleEvents.map(e => extractDomain(e.url));

    const timestamps = sampleEvents.map(e => new Date(e.timestamp).getTime());
    const startTime = new Date(Math.min(...timestamps));
    const endTime = new Date(Math.max(...timestamps));
    const duration = endTime.getTime() - startTime.getTime();

    // 6. Save final session to database
    console.log('Storing Session document in MongoDB...');
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

    console.log('--- Test Succeeded ---');
    console.log('Session document stored successfully in MongoDB:');
    console.log(JSON.stringify(session, null, 2));

  } catch (error) {
    console.error('--- Test Failed ---');
    console.error('Error during test execution:', error);
  } finally {
    // Disconnect DB and close script
    console.log('Closing database connection...');
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

runTest();
