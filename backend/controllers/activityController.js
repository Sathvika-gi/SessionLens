const Activity = require('../models/Activity');

// Create a new activity log
exports.createActivity = async (req, res) => {
  try {
    const { url, title, timestamp, eventType } = req.body;
    
    if (!url || !timestamp || !eventType) {
      return res.status(400).json({ success: false, message: 'Missing required fields: url, timestamp, eventType' });
    }

    const activity = await Activity.create({
      url,
      title: title || 'Untitled',
      timestamp: new Date(timestamp),
      eventType
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get chronological activity logs
exports.getActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
