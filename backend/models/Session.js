const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionTitle: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  }],
  websitesVisited: {
    type: [String],
    default: []
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in milliseconds
    required: true
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('Session', sessionSchema);
