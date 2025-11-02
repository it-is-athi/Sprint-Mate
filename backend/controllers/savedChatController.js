// controllers/savedChatController.js

const SavedChat = require('../models/SavedChat');

// Save a new chat
const saveChat = async (req, res) => {
  try {
    const { title, chatType, messages, pdfName } = req.body;
    const userId = req.user.id; // Assuming auth middleware provides user

    const savedChat = new SavedChat({
      userId,
      title,
      chatType,
      messages,
      pdfName: chatType === 'pdf' ? pdfName : null
    });

    await savedChat.save();

    res.status(201).json({
      success: true,
      message: 'Chat saved successfully',
      savedChat: {
        id: savedChat._id,
        title: savedChat.title,
        chatType: savedChat.chatType,
        pdfName: savedChat.pdfName,
        savedAt: savedChat.savedAt,
        messageCount: savedChat.messages.length
      }
    });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save chat'
    });
  }
};

// Get all saved chats for a user
const getSavedChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedChats = await SavedChat.find({ userId })
      .select('title chatType pdfName savedAt lastUpdated messages')
      .sort({ lastUpdated: -1 });

    const chatSummaries = savedChats.map(chat => ({
      id: chat._id,
      title: chat.title,
      chatType: chat.chatType,
      pdfName: chat.pdfName,
      savedAt: chat.savedAt,
      lastUpdated: chat.lastUpdated,
      messageCount: chat.messages.length,
      preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text.substring(0, 100) + '...' : ''
    }));

    res.json({
      success: true,
      savedChats: chatSummaries
    });
  } catch (error) {
    console.error('Error fetching saved chats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved chats'
    });
  }
};

// Get a specific saved chat with all messages
const getSavedChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const savedChat = await SavedChat.findOne({ _id: chatId, userId });

    if (!savedChat) {
      return res.status(404).json({
        success: false,
        error: 'Saved chat not found'
      });
    }

    res.json({
      success: true,
      savedChat: {
        id: savedChat._id,
        title: savedChat.title,
        chatType: savedChat.chatType,
        pdfName: savedChat.pdfName,
        messages: savedChat.messages,
        savedAt: savedChat.savedAt,
        lastUpdated: savedChat.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching saved chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved chat'
    });
  }
};

// Add message to existing saved chat (for follow-up)
const addMessageToSavedChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body; // { sender: 'user', text: '...' }
    const userId = req.user.id;

    const savedChat = await SavedChat.findOne({ _id: chatId, userId });

    if (!savedChat) {
      return res.status(404).json({
        success: false,
        error: 'Saved chat not found'
      });
    }

    savedChat.messages.push({
      sender: message.sender,
      text: message.text,
      timestamp: new Date()
    });

    await savedChat.save();

    res.json({
      success: true,
      message: 'Message added to saved chat',
      newMessage: savedChat.messages[savedChat.messages.length - 1]
    });
  } catch (error) {
    console.error('Error adding message to saved chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add message to saved chat'
    });
  }
};

// Delete a saved chat
const deleteSavedChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const deletedChat = await SavedChat.findOneAndDelete({ _id: chatId, userId });

    if (!deletedChat) {
      return res.status(404).json({
        success: false,
        error: 'Saved chat not found'
      });
    }

    res.json({
      success: true,
      message: 'Saved chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saved chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete saved chat'
    });
  }
};

module.exports = {
  saveChat,
  getSavedChats,
  getSavedChat,
  addMessageToSavedChat,
  deleteSavedChat
};