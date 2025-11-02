// models/SavedChat.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const savedChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  chatType: {
    type: String,
    required: true,
    enum: ['general', 'pdf']
  },
  pdfName: {
    type: String,
    default: null // Only for PDF chats
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true // For continuing conversations
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated when messages are added
savedChatSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('SavedChat', savedChatSchema);