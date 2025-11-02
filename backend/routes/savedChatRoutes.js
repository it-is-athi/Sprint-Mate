// routes/savedChatRoutes.js

const express = require('express');
const {
  saveChat,
  getSavedChats,
  getSavedChat,
  addMessageToSavedChat,
  deleteSavedChat
} = require('../controllers/savedChatController');

const router = express.Router();

// All routes require authentication (middleware should be added in app.js)

// Save a new chat
router.post('/save', saveChat);

// Get all saved chats for user
router.get('/', getSavedChats);

// Get specific saved chat
router.get('/:chatId', getSavedChat);

// Add message to saved chat (for follow-up)
router.post('/:chatId/message', addMessageToSavedChat);

// Delete saved chat
router.delete('/:chatId', deleteSavedChat);

module.exports = router;