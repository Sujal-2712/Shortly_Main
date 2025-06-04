const mongoose = require('mongoose');
const { Schema } = mongoose;

const clickSchema = new Schema({
  url_id: {
    type: Schema.Types.ObjectId,
    ref: 'urls',
    required: [true, 'URL ID is required']
  },
  ip: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    default: 'unknown'
  },
  country: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    default: 'unknown'
  },
  device: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    default: 'unknown',
    enum: ['mobile', 'tablet', 'desktop', 'smarttv', 'wearable', 'embedded', 'unknown']
  },
  browser: {
    type: String,
    lowercase: true,
    trim: true,
    default: 'unknown'
  },
  os: {
    type: String,
    lowercase: true,
    trim: true,
    default: 'unknown'
  },
  referer: {
    type: String,
    trim: true,
    default: 'direct'
  },
  userAgent: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
// clickSchema.index({ url_id: 1 });

const CLICKS = mongoose.model('clicks', clickSchema);
module.exports = { CLICKS };