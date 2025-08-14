// backend/models/Schedule.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: String,          // e.g., "Chemistry: Unit 3"
    day: String,            // e.g., "2025-08-14"
    start: String,          // e.g., "17:00"
    durationMin: Number,    // e.g., 45
    subject: String,        // e.g., "Chemistry"
    status: { type: String, enum: ['pending', 'done', 'missed'], default: 'pending' }
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    summary: String,
    deadline: String,       // ISO date string, for simplicity
    sessions: [sessionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
