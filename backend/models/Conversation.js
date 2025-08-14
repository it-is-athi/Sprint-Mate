// backend/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
