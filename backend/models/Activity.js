const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  screenshot: {
    type: String,
    required: false
  },
  video: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
