const mongoose = require('mongoose');

const LiveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewerCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  streamKey: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['Sohbet', 'Müzik', 'Oyun', 'Eğlence', 'Diğer'],
    default: 'Sohbet'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for finding active streams
LiveStreamSchema.index({ isActive: 1, startedAt: -1 });
LiveStreamSchema.index({ host: 1 });

module.exports = mongoose.model('LiveStream', LiveStreamSchema);