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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
