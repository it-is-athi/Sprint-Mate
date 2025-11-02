// pages/ChatPage.jsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, FileText, XCircle, BrainCircuit, FileUp, BookOpen } from 'lucide-react'; // Updated icons
import { useLocation } from 'react-router-dom';
import Aurora from '../components/Aurora'; // Import the Aurora component
import LightBackground from '../components/LightBackground'; // Import the Light background component
import { useTheme } from '../context/ThemeContext'; // Import theme context
import { AuthContext } from '../context/AuthContext'; // Import auth context
import SplitText from '../components/SplitText'; // Import SplitText component
import '../styles/GeminiChat.css'; // Import CSS for hiding scrollbar
import SavedChatsPanel from '../components/SavedChatsPanel';

// Inline SavedChats component
function SavedChatsViewInline({ onLoadSavedChat, lightTheme, user }) {
  const [savedChats, setSavedChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSavedChats();
  }, []);

  const fetchSavedChats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/saved-chats');
      if (res.data && res.data.savedChats) {
        setSavedChats(res.data.savedChats);
      }
    } catch (err) {
      console.error('Error fetching saved chats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this saved chat?')) return;
    try {
      await api.delete(`/saved-chats/${id}`);
      setSavedChats((prev) => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting saved chat', err);
    }
  };

  const handleOpenChat = async (chatSummary) => {
    try {
      setLoading(true);
      // Fetch the complete chat with all messages
      const res = await api.get(`/saved-chats/${chatSummary.id}`);
      if (res.data && res.data.savedChat) {
        onLoadSavedChat(res.data.savedChat);
      }
    } catch (err) {
      console.error('Error loading saved chat', err);
      alert('Failed to load saved chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex-grow flex flex-col p-6 ${lightTheme ? 'bg-white/50' : 'bg-black/20'} rounded-2xl backdrop-blur-sm border ${lightTheme ? 'border-gray-300' : 'border-white/10'}`}>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className={`w-6 h-6 ${lightTheme ? 'text-blue-600' : 'text-blue-400'}`} />
        <h2 className={`text-2xl font-bold ${lightTheme ? 'text-gray-800' : 'text-white'}`}>
          Saved Chats
        </h2>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
            <span className={lightTheme ? 'text-gray-600' : 'text-gray-300'}>Loading saved chats...</span>
          </div>
        </div>
      ) : savedChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className={`text-xl font-semibold mb-2 ${lightTheme ? 'text-gray-800' : 'text-gray-100'}`}>
            No Saved Chats Yet
          </h3>
          <p className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'} mb-4`}>
            Start a conversation and save it to see it here
          </p>
          <p className={`text-sm ${lightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
            Use the Save button after chatting to store conversations
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {savedChats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => handleOpenChat(chat)}
              className={`p-4 rounded-xl border cursor-pointer ${lightTheme ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-black/30 border-white/10 hover:border-blue-500/50'} transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    {chat.chatType === 'pdf' ? <FileText className="w-4 h-4 text-blue-500" /> : <BrainCircuit className="w-4 h-4 text-blue-500" />}
                    <h3 className={`font-semibold ${lightTheme ? 'text-gray-800' : 'text-white'}`}>
                      {chat.title}
                    </h3>
                  </div>
                  
                  {chat.pdfName && (
                    <p className={`text-sm ${lightTheme ? 'text-gray-600' : 'text-gray-300'} mb-1`}>
                      PDF: {chat.pdfName}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs mb-2">
                    <span className={`px-2 py-1 rounded-full ${chat.chatType === 'pdf' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                      {chat.chatType.toUpperCase()}
                    </span>
                    <span className={lightTheme ? 'text-gray-500' : 'text-gray-400'}>
                      {chat.messageCount} messages
                    </span>
                    <span className={lightTheme ? 'text-gray-500' : 'text-gray-400'}>
                      {new Date(chat.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {chat.preview && (
                    <p className={`text-sm ${lightTheme ? 'text-gray-600' : 'text-gray-400'} line-clamp-2`}>
                      {chat.preview}
                    </p>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening the chat when clicking delete
                      handleDelete(chat.id);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${lightTheme ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-white/10'}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatPage() {
  const { theme } = useTheme(); // Get current theme
  const { user } = useContext(AuthContext); // Get user context
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isRagMode, setIsRagMode] = useState(false);
  const [studyProcessed, setStudyProcessed] = useState(false);
  const [currentPdfName, setCurrentPdfName] = useState(''); // Track current PDF name
  const chatEndRef = useRef(null);
  const studyTaskRef = useRef(null);
  const location = useLocation();

  // Helper functions for localStorage management
  const getChatStorageKey = (mode) => {
    return user ? `sprintmate_chat_${user.id}_${mode}` : null;
  };

  const saveChatToStorage = (history, mode) => {
    const key = getChatStorageKey(mode);
    if (key) {
      localStorage.setItem(key, JSON.stringify(history));
    }
  };

  const loadChatFromStorage = (mode) => {
    const key = getChatStorageKey(mode);
    if (key) {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  };

  const clearChatStorage = () => {
    if (user) {
      localStorage.removeItem(getChatStorageKey('general'));
      localStorage.removeItem(getChatStorageKey('pdf'));
      localStorage.removeItem(`sprintmate_pdf_name_${user.id}`);
    }
  };

  // Debug function to check localStorage contents
  const debugLocalStorage = () => {
    if (!user) return;
    const generalKey = getChatStorageKey('general');
    const pdfKey = getChatStorageKey('pdf');
    const pdfNameKey = `sprintmate_pdf_name_${user.id}`;
    
    const generalChat = localStorage.getItem(generalKey);
    const pdfChat = localStorage.getItem(pdfKey);
    const pdfName = localStorage.getItem(pdfNameKey);
    
    console.log('🔍 LocalStorage Debug:');
    console.log('General chat:', generalChat ? JSON.parse(generalChat).length + ' messages' : 'empty');
    console.log('PDF chat:', pdfChat ? JSON.parse(pdfChat).length + ' messages' : 'empty');
    console.log('PDF name:', pdfName || 'none');
    console.log('Current mode:', currentMode, 'isRagMode:', isRagMode);
    console.log('Current chat history:', chatHistory.length, 'messages');
  };

  // Function to safely switch modes with proper chat separation
  const switchToGeneralMode = () => {
    console.log('🔄 Switching to General mode');
    
    // If currently in PDF mode and have chat history
    if (user && isRagMode && chatHistory.length > 0) {
      // Only save to localStorage if it's NOT a saved chat (i.e., it's an active unsaved chat)
      if (!savedChatId) {
        saveChatToStorage(chatHistory, 'pdf');
        console.log('💾 Saved PDF chat to localStorage (unsaved chat)');
      } else {
        console.log('🚫 Skipped saving PDF chat - was a saved chat');
      }
    }
    
    setCurrentMode('general');
    setIsRagMode(false);
    setFile(null);
    setUploadStatus('');
    setCurrentPdfName('');
    
    // Load general chat history - only if we weren't in a saved chat session
    if (user && !savedChatId) {
      const savedGeneralHistory = loadChatFromStorage('general');
      setChatHistory(savedGeneralHistory);
      console.log('💬 Loaded existing general chat history:', savedGeneralHistory.length, 'messages');
    } else if (savedChatId) {
      // If coming from a saved chat, start fresh
      setChatHistory([]);
      console.log('🗑️ Cleared chat history - was in saved chat session');
    }
    
    setSavedChatId(null);
    setIsSaved(false);
    setStudyProcessed(false);
    studyTaskRef.current = null;
  };

  const switchToPdfMode = () => {
    console.log('🔄 Switching to PDF mode');
    
    // If currently in General mode and have chat history
    if (user && !isRagMode && chatHistory.length > 0) {
      // Only save to localStorage if it's NOT a saved chat (i.e., it's an active unsaved chat)
      if (!savedChatId) {
        saveChatToStorage(chatHistory, 'general');
        console.log('💾 Saved general chat to localStorage (unsaved chat)');
      } else {
        console.log('🚫 Skipped saving general chat - was a saved chat');
      }
    }
    
    setCurrentMode('pdf');
    setIsRagMode(true);
    setFile(null);
    setUploadStatus('');
    
    // Load PDF chat history - only if we weren't in a saved chat session
    if (user && !savedChatId) {
      const savedPdfHistory = loadChatFromStorage('pdf');
      console.log('📄 Loading PDF chat history:', savedPdfHistory.length, 'messages');
      setChatHistory(savedPdfHistory);
      
      // Load saved PDF name if it exists
      const savedPdfName = localStorage.getItem(`sprintmate_pdf_name_${user.id}`);
      if (savedPdfName) {
        setCurrentPdfName(savedPdfName);
        console.log('📄 Loaded existing PDF context:', savedPdfName);
      } else {
        setCurrentPdfName('');
      }
    } else if (savedChatId) {
      // If coming from a saved chat, start fresh
      setChatHistory([]);
      setCurrentPdfName('');
      console.log('🗑️ Cleared chat history - was in saved chat session');
    }
    
    setSavedChatId(null);
    setIsSaved(false);
    setStudyProcessed(false);
    studyTaskRef.current = null;
  };

  const switchToSavedMode = () => {
    console.log('🔄 Switching to Saved Chats mode');
    
    // Only save current chat history if it's NOT a saved chat (i.e., it's an active unsaved chat)
    if (user && chatHistory.length > 0 && !savedChatId) {
      const mode = isRagMode ? 'pdf' : 'general';
      saveChatToStorage(chatHistory, mode);
      console.log(`💾 Saved ${mode} chat to localStorage (unsaved chat)`);
    } else if (savedChatId) {
      console.log('🚫 Skipped saving - was viewing a saved chat, closing it now');
    }
    
    setCurrentMode('saved');
    setChatHistory([]); // Clear current chat when viewing saved chats
    setIsRagMode(false);
    setFile(null);
    setUploadStatus(''); // Clear upload status messages
    setCurrentPdfName(''); // Clear PDF name
    setIsLoading(false); // Clear any loading states
    
    // Clear saved chat session state - this closes any opened saved chat
    setSavedChatId(null);
    setIsSaved(false);
    setStudyProcessed(false);
    studyTaskRef.current = null;
    
    // Also clear any PDF-related localStorage to ensure clean state
    if (user) {
      localStorage.removeItem(`sprintmate_pdf_name_${user.id}`);
    }
    
    console.log('✅ Switched to saved chats mode - all PDF context cleared');
  };

  const clearCurrentModeChat = () => {
    if (user) {
      const mode = isRagMode ? 'pdf' : 'general';
      localStorage.removeItem(getChatStorageKey(mode));
      setChatHistory([]);
      if (isRagMode) {
        setCurrentPdfName(''); // Clear PDF name when clearing PDF chat
        setUploadStatus('');
        localStorage.removeItem(`sprintmate_pdf_name_${user.id}`); // Clear PDF name from storage
      }
      console.log(`🗑️ Cleared ${mode} mode chat history`);
    }
  };

  const closeCurrentModeChat = async () => {
    if (!user) return;
    
    // If there's an unsaved conversation with messages, ask user if they want to save
    if (chatHistory.length > 0 && !isSaved) {
      const shouldSave = confirm('You have an unsaved conversation. Would you like to save it before closing?');
      if (shouldSave) {
        await saveCurrentChat();
      }
    }
    
    // Clear the current mode's chat
    const mode = isRagMode ? 'pdf' : 'general';
    localStorage.removeItem(getChatStorageKey(mode));
    setChatHistory([]);
    setIsSaved(false);
    setSavedChatId(null);
    
    if (isRagMode) {
      setCurrentPdfName(''); // Clear PDF name when closing PDF chat
      setUploadStatus('');
      localStorage.removeItem(`sprintmate_pdf_name_${user.id}`); // Clear PDF name from storage
    }
    
    console.log(`🚪 Closed ${mode} mode chat`);
  };

  // Mode state - can be 'general', 'pdf', or 'saved'
  const [currentMode, setCurrentMode] = useState('general');
  const [isSaved, setIsSaved] = useState(false); // whether current chat is saved in DB
  const [savedChatId, setSavedChatId] = useState(null);

  const saveCurrentChat = async () => {
    if (!user) return alert('Please login to save chats');
    if (!chatHistory || chatHistory.length === 0) return alert('No messages to save');
    const title = prompt('Save chat as (title):', isRagMode ? `PDF: ${currentPdfName || 'untitled'}` : 'General Chat');
    if (!title) return;
    try {
      const payload = {
        title,
        chatType: isRagMode ? 'pdf' : 'general',
        pdfName: isRagMode ? currentPdfName : null,
        messages: chatHistory
      };
      const res = await api.post('/saved-chats/save', payload);
      if (res.data && res.data.success) {
        setIsSaved(true);
        alert('Chat saved successfully');
      }
    } catch (err) {
      console.error('Error saving chat', err);
      alert('Failed to save chat');
    }
  };

  // Load initial chat history when user changes (but not when mode changes)
  useEffect(() => {
    if (user) {
      // Only load on initial user login, start with general mode
      const savedHistory = loadChatFromStorage('general');
      console.log(`� User logged in, loading general chat: ${savedHistory.length} messages`);
      setChatHistory(savedHistory);
    } else {
      // Clear chat when user logs out
      setChatHistory([]);
      setCurrentPdfName('');
    }
  }, [user]); // Only depend on user, not isRagMode

  // Save chat history whenever it changes - but only for the current mode
  // Don't auto-save if we're in a saved chat session (savedChatId exists)
  useEffect(() => {
    if (user && chatHistory.length > 0 && currentMode !== 'saved' && !savedChatId) {
      const mode = isRagMode ? 'pdf' : 'general';
      console.log(`💾 Auto-saving ${chatHistory.length} messages to ${mode} mode`);
      saveChatToStorage(chatHistory, mode);
    } else if (savedChatId) {
      console.log('🚫 Skipping auto-save - currently in saved chat session');
    }
  }, [chatHistory, user, isRagMode, savedChatId]); // Include savedChatId to track saved chat sessions

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle study mode when task details are passed from other pages
  useEffect(() => {
    const studyTask = location.state?.studyTask;
    
    // Only process study task if:
    // 1. We have a study task
    // 2. It hasn't been processed yet
    // 3. It's different from the last processed one
    // 4. We're not currently loading
    if (studyTask && 
        !studyProcessed && 
        JSON.stringify(studyTask) !== JSON.stringify(studyTaskRef.current) &&
        !isLoading) {
      
      console.log('🎯 Processing new study task:', studyTask);
      studyTaskRef.current = studyTask; // Store current task
      const { task, scheduleName } = studyTask;
      
      // Save current mode's history before switching to study mode
      if (user && chatHistory.length > 0) {
        const currentMode = isRagMode ? 'pdf' : 'general';
        saveChatToStorage(chatHistory, currentMode);
      }
      
      setIsRagMode(false); // Use general chat mode for studying
      // Clear current chat history for study mode, but don't affect storage
      setChatHistory([]);
      setStudyProcessed(true); // Prevent duplicate processing
      
      // Create a comprehensive study prompt with essential task details
      const studyPrompt = `I want to study and learn about: "${task.task_title || task.name}"

${task.task_description || task.description ? `**Topic Details:** ${task.task_description || task.description}` : ''}
**From:** ${scheduleName || 'My Studies'}

Please teach me about this topic with:
1. Clear explanations and concepts
2. Practical examples and use cases  
3. Step-by-step learning approach
4. Relevant online tutorial links from trusted educational websites

I'm looking for a comprehensive learning session with additional resources to deepen my understanding.`;

      setQuestion(studyPrompt);
      
      // Auto-send the study question with a longer delay
      setTimeout(() => {
        if (!isLoading) { // Additional check
          handleStudyQuestion(studyPrompt);
        }
      }, 1000);
      
      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]); // Removed studyProcessed and isLoading from dependencies

  const handleStudyQuestion = async (studyPrompt) => {
    // Prevent duplicate sends with multiple checks
    if (isLoading) {
      console.log('🛑 Study question blocked - already loading');
      return;
    }
    
    // Check if this exact prompt was already sent
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage?.sender === 'user' && lastMessage?.text === studyPrompt) {
      console.log('🛑 Study question blocked - duplicate prompt');
      return;
    }
    
    console.log('🚀 Sending study question...');
    const userMessage = { sender: 'user', text: studyPrompt };
    setIsLoading(true);
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion('');
    
    try {
      console.log(`🚀 Frontend - Sending study question, isRagMode: ${isRagMode}, isGeneral: ${!isRagMode}`);
      
      const response = await api.post('/rag/ask', {
        question: studyPrompt,
        isGeneral: !isRagMode, // Use general mode for studying
      });
      console.log(`✅ Frontend - Received response successfully`);
      const botMessage = { sender: 'bot', text: response.data.answer };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(`❌ Frontend - Error:`, error);
      const errorMessage = { sender: 'bot', text: error.response?.data?.error || 'Sorry, I encountered an error while trying to help you study.' };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log('📎 File selected:', selectedFile.name);
      setFile(selectedFile);
      setUploadStatus(`Ready to upload: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.log('❌ No file selected for upload');
      setUploadStatus('Please select a file first.');
      return;
    }
    
    const fileName = file.name;
    console.log('🚀 Starting PDF upload:', fileName);
    setIsLoading(true);
    setUploadStatus('📤 Analysing Document...');
    
    // If currently in PDF mode and there's an unsaved conversation, ask user
    if (user && isRagMode && chatHistory.length > 0 && !isSaved) {
      const shouldSave = confirm('You have an unsaved PDF conversation. Would you like to save it before uploading a new PDF?');
      if (shouldSave) {
        await saveCurrentChat();
      }
    }

    // Start fresh conversation for the new PDF
    if (user) {
      // Clear the current PDF conversation
      localStorage.removeItem(getChatStorageKey('pdf'));
      setChatHistory([]);
      setIsSaved(false);
      console.log('🗑️ Cleared previous PDF conversation for new document:', fileName);
    }
    
    const formData = new FormData();
    formData.append('pdfFile', file);
    try {
      const response = await api.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('✅ PDF uploaded and processed successfully!');
      setIsRagMode(true);
      setCurrentPdfName(fileName); // Set the current PDF name
      
      // Save PDF name to localStorage
      if (user) {
        localStorage.setItem(`sprintmate_pdf_name_${user.id}`, fileName);
      }
      
      // Add a system message to chat
      setTimeout(() => {
        const welcomeMessage = [{
          sender: 'bot',
          text: `🎉 **PDF "${fileName}" Upload Complete!**\n\nYour document has been successfully processed and I'm ready to answer questions about it. You can ask me to:\n\n- **Summarize** the main points\n- **Explain** specific concepts\n- **Find** particular information\n- **Compare** different sections\n\nWhat would you like to know about your document?\n\n💡 *Tip: You can upload a new PDF anytime to start a fresh conversation.*`
        }];
        setChatHistory(welcomeMessage);
        // Save the welcome message to storage
        if (user) {
          saveChatToStorage(welcomeMessage, 'pdf');
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Error uploading file.';
      setUploadStatus(`❌ Upload failed: ${errorMessage}`);
      // Don't switch back to general mode on upload failure - stay in PDF mode
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    // Check if we're in PDF mode but don't have an active PDF uploaded
    if (isRagMode && !uploadStatus.includes('processed successfully')) {
      const errorMessage = { 
        sender: 'bot', 
        text: '📄 **PDF Required**\n\nTo ask questions about a PDF document, please upload a PDF file first using the upload button above.\n\nIf you want to ask general questions, switch to "General" mode.' 
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      return;
    }
    
    // Capture the current mode and context when the question is asked
    const questionMode = isRagMode;
    const questionContext = {
      mode: questionMode ? 'pdf' : 'general',
      pdfName: currentPdfName,
      savedChatId: savedChatId
    };
    
    console.log(`🚀 Frontend - Sending question: "${question}", mode: ${questionContext.mode}`);
    
    const userMessage = { sender: 'user', text: question };
    setIsLoading(true);
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion('');
    
    try {
      const response = await api.post('/rag/ask', {
        question: question,
        isGeneral: !questionMode, // Use captured mode, not current mode
      });
      
      // If loaded from a saved chat, persist the user's message to DB
      if (questionContext.savedChatId) {
        api.post(`/saved-chats/${questionContext.savedChatId}/message`, { message: userMessage }).catch(err => console.error('Failed to persist user message to saved chat', err));
      }
      
      console.log(`✅ Frontend - Received response for ${questionContext.mode} mode`);
      const botMessage = { sender: 'bot', text: response.data.answer };
      
      // Check if we're still in the same mode as when the question was asked
      if ((questionMode && isRagMode) || (!questionMode && !isRagMode)) {
        // Same mode - add response to current chat
        setChatHistory((prev) => [...prev, botMessage]);
        console.log(`✅ Response added to current ${questionContext.mode} chat`);
      } else {
        // Mode changed - switch back to original mode to show the response
        const targetMode = questionMode ? 'pdf' : 'general';
        console.log(`⚠️ Mode changed during API call - switching back to ${targetMode} mode to show response`);
        
        if (questionMode) {
          // Switch back to PDF mode
          setCurrentMode('pdf');
          setIsRagMode(true);
          // Restore PDF context if available
          if (questionContext.pdfName) {
            setCurrentPdfName(questionContext.pdfName);
          }
        } else {
          // Switch back to General mode
          setCurrentMode('general');
          setIsRagMode(false);
          setCurrentPdfName('');
        }
        
        // Add response to current chat (which will be the correct mode after switching back)
        setChatHistory((prev) => [...prev, botMessage]);
        console.log(`✅ Switched back to ${targetMode} mode and added response`);
      }
      
      // Also persist bot message to saved chat if applicable
      if (questionContext.savedChatId) {
        api.post(`/saved-chats/${questionContext.savedChatId}/message`, { message: botMessage }).catch(err => console.error('Failed to persist bot message to saved chat', err));
      }
      
    } catch (error) {
      const errorMessage = { sender: 'bot', text: error.response?.data?.error || 'Sorry, I encountered an error.' };
      
      // Add error message to current chat regardless of mode changes
      setChatHistory((prev) => [...prev, errorMessage]);
      console.log(`❌ Error response added to current chat`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDocument = () => {
    setIsRagMode(false);
    setUploadStatus('');
    setFile(null);
    setCurrentPdfName('');
    setChatHistory([]);
    // Clear current mode's storage
    if (user) {
      const mode = isRagMode ? 'pdf' : 'general';
      localStorage.removeItem(getChatStorageKey(mode));
    }
  };

  const lightTheme = theme === 'light';

  const textareaRef = useRef(null);

  const handleLoadSavedChat = (savedChat) => {
    if (!savedChat) return;
    
    console.log('🔄 Loading saved chat:', savedChat.title, 'Type:', savedChat.chatType);
    
    // Load messages into chatHistory and set modes accordingly
    setChatHistory(savedChat.messages || []);
    setIsRagMode(savedChat.chatType === 'pdf');
    setCurrentMode(savedChat.chatType);
    setCurrentPdfName(savedChat.pdfName || '');
    setIsSaved(true);
    setSavedChatId(savedChat.id);
    
    // Clear upload status since we're loading a saved chat
    setUploadStatus('');
    setFile(null);
    
    // If it's a PDF chat, set appropriate status and add notice
    if (savedChat.chatType === 'pdf') {
      // Save the PDF name to localStorage for consistency
      if (user && savedChat.pdfName) {
        localStorage.setItem(`sprintmate_pdf_name_${user.id}`, savedChat.pdfName);
      }
      
      // Add a notice about PDF context
      setTimeout(() => {
        const noticeMessage = {
          sender: 'bot',
          text: `📄 **Saved PDF Chat Loaded: "${savedChat.pdfName || 'Unknown PDF'}"**\n\n⚠️ **To ask follow-up questions**: Upload the same PDF file again using the upload button above. The system needs the PDF to be actively uploaded to answer new questions.\n\n**Current options:**\n- 📤 **Upload "${savedChat.pdfName || 'the PDF'}" again** to continue asking questions\n- 👀 **Browse the conversation above** to read previous Q&A\n- 🔄 **Switch to General mode** for non-PDF questions`
        };
        setChatHistory(prev => [...prev, noticeMessage]);
      }, 500);
    }
  };

  return (
    <div className={`relative flex flex-col h-full w-full overflow-hidden font-sans ${
      lightTheme ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100' : 'bg-black'
    }`}>
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-70">
        {lightTheme ? (
          <LightBackground />
        ) : (
          <Aurora 
            isLightMode={false}
            colorStops={['#FFEA00', '#FFBF00', '#FFEA00']} 
          />
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full w-full p-6">
        {/* Header with Mode Selection */}
        <div className="flex-shrink-0 mb-6">
              <div className={`p-2 rounded-xl border w-auto ${lightTheme ? 'bg-white border-gray-300' : 'bg-black/20 border-white/10'} backdrop-blur-md`}>
            <div className="flex justify-between items-center w-full">
              {/* Mode buttons on the left */}
              <div className="flex gap-2">
                <button
                  onClick={switchToGeneralMode}
                  className={`px-8 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    currentMode === 'general'
                      ? (lightTheme ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30')
                      : (lightTheme ? 'bg-transparent text-gray-700 hover:bg-black/10' : 'bg-transparent text-gray-300 hover:bg-white/10')
                  }`}
                >
                  <BrainCircuit className={`w-5 h-5 ${currentMode === 'general' ? 'text-white' : (lightTheme ? 'text-gray-700' : 'text-yellow-200')}`} />
                  General
                </button>
                <button
                  onClick={switchToPdfMode}
                  className={`px-8 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    currentMode === 'pdf'
                      ? (lightTheme ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30')
                      : (lightTheme ? 'bg-transparent text-gray-700 hover:bg-black/10' : 'bg-transparent text-gray-300 hover:bg-white/10')
                  }`}
                >
                  <FileText className={`w-5 h-5 ${currentMode === 'pdf' ? 'text-white' : (lightTheme ? 'text-gray-700' : 'text-gray-300')}`} />
                  With PDF
                </button>
                <button
                  onClick={switchToSavedMode}
                  className={`px-8 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    currentMode === 'saved'
                      ? (lightTheme ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30')
                      : (lightTheme ? 'bg-transparent text-gray-700 hover:bg-black/10' : 'bg-transparent text-gray-300 hover:bg-white/10')
                  }`}
                >
                  <BookOpen className={`w-5 h-5 ${currentMode === 'saved' ? 'text-white' : (lightTheme ? 'text-gray-700' : 'text-gray-300')}`} />
                  Saved Chats
                </button>
              </div>
              
              {/* Action buttons on the right */}
              <div className="flex items-center gap-2">
                {/* Save current chat to DB */}
                {chatHistory.length > 0 && (
                  <button
                    onClick={saveCurrentChat}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                      lightTheme ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-white/10'
                    }`}
                    title="Save current chat to database"
                  >
                    Save
                  </button>
                )}
                
                {/* Close current mode chat */}
                {chatHistory.length > 0 && (
                  <button
                    onClick={closeCurrentModeChat}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                      lightTheme 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                    title={`Close ${isRagMode ? 'PDF' : 'General'} chat (asks to save if unsaved)`}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current PDF Indicator */}
        {isRagMode && currentPdfName && (
          <div className={`flex-shrink-0 mb-4 p-3 rounded-lg border ${
            lightTheme 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-blue-900/20 border-blue-500/30 text-blue-300'
          } flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">
                Currently discussing: {currentPdfName}
              </span>
            </div>
            <div className="text-xs opacity-75">
              Upload a new PDF to start fresh
            </div>
          </div>
        )}

        {/* Main Chat Interface */}
        <div className="flex-grow flex flex-col min-h-0 h-[80vh]">
          {/* Saved Chats View */}
          {currentMode === 'saved' ? (
            <SavedChatsViewInline onLoadSavedChat={handleLoadSavedChat} lightTheme={lightTheme} user={user} />
          ) : (
            <>
              {/* Chat Messages Area */}
              <div className="flex-grow overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar">
            {chatHistory.length === 0 && !uploadStatus && !location.state?.studyTask && (
              <div className="text-center flex items-center justify-center h-full">
                {isRagMode ? (
                  <div className={`p-8 max-w-md mx-auto rounded-2xl border ${lightTheme ? 'bg-white border-gray-300' : 'bg-black/20 border-white/10'} backdrop-blur-sm`}>
                    <h3 className={`text-xl font-semibold font-sans ${lightTheme ? 'text-gray-800' : 'text-gray-100'} mb-2`}>Chat with your PDF</h3>
                    <p className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'} font-sans mb-4`}>
                      Got a PDF? Upload it and start asking — I will handle the rest.
                    </p>
                    <div className="text-sm">
                      <span className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                        Click the upload icon below to get started
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`p-8 max-w-md mx-auto rounded-2xl border ${lightTheme ? 'bg-white border-gray-300' : 'bg-black/20 border-white/10'} backdrop-blur-sm`}>
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className={`text-xl font-semibold font-sans ${lightTheme ? 'text-gray-800' : 'text-gray-100'} mb-2`}>AI Learning Assistant</h3>
                    <p className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'} font-sans`}>
                      Ask me anything — I'll help you learn with detailed explanations and provide helpful tutorial links from trusted educational websites!
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                {chat.sender === 'user' ? (
                  <div className="max-w-xl lg:max-w-2xl">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-4 rounded-2xl rounded-br-md shadow-lg">
                      <p className="whitespace-pre-wrap leading-relaxed">{chat.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-none w-full">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-white/10">
                        <BrainCircuit className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="bg-black/30 backdrop-blur-sm text-gray-100 px-6 py-4 rounded-2xl rounded-tl-md shadow-lg border border-white/10 font-sans">
                          <div className="prose prose-lg prose-invert max-w-none 
                                        prose-headings:text-blue-400 prose-headings:font-semibold 
                                        prose-p:text-gray-200 
                                        prose-strong:text-blue-300
                                        prose-code:bg-gray-900/80 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-blue-300
                                        prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ node, ...props }) => (
                                  <a 
                                    {...props} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                                  />
                                )
                              }}
                            >
                              {chat.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10">
                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm text-gray-100 px-6 py-4 rounded-2xl rounded-tl-md shadow-lg border border-white/10 font-sans">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="ml-2 text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <div className={`flex-shrink-0 p-3 rounded-2xl border ${lightTheme ? 'bg-white border-gray-300' : 'bg-black/30 border-white/10'} backdrop-blur-md`}>
            {isRagMode && file && !uploadStatus.includes('processed successfully') && (
              <div className="mb-3 p-3 bg-blue-900/50 rounded-lg border border-blue-400/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileUp className="w-5 h-5 text-blue-300" />
                  <span className="text-blue-200 text-sm font-medium">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setFile(null); setUploadStatus(''); }}
                    className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30"
                    title="Remove file"
                  >
                    ✕
                  </button>
                  <button 
                    onClick={handleUpload} 
                    disabled={isLoading} 
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-1.5 rounded-lg transition-colors disabled:cursor-not-allowed text-sm font-semibold"
                  >
                    {isLoading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleAskQuestion} className="flex gap-3 items-center">
              {isRagMode && (
                <div className="flex-shrink-0">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="pdf-upload-icon"
                  />
                  <label 
                    htmlFor="pdf-upload-icon" 
                    className={`w-12 h-12 rounded-xl cursor-pointer transition-colors flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ${lightTheme ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    title="Upload PDF"
                  >
                    <FileUp className="w-6 h-6" />
                  </label>
                </div>
              )}
              
              <div className="flex-grow">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    // auto-resize
                    const ta = textareaRef.current;
                    if (ta) {
                      ta.style.height = 'auto';
                      ta.style.height = Math.min(160, ta.scrollHeight) + 'px';
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const canAsk = question.trim() && !isLoading && 
                        (!isRagMode || uploadStatus.includes('processed successfully'));
                      if (canAsk) {
                        handleAskQuestion(e);
                      }
                    }
                  }}
                  placeholder={
                    isRagMode 
                      ? (uploadStatus.includes('processed successfully') 
                          ? `Ask questions about ${currentPdfName || 'your document'}...` 
                          : currentPdfName
                            ? `Upload "${currentPdfName}" again to ask follow-up questions...`
                            : "Upload a PDF first to ask questions about it...")
                      : "Ask me anything..."
                  }
                  className={`w-full px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 font-sans resize-none overflow-auto no-scrollbar min-h-[70px] ${lightTheme ? 'bg-white/80 border-gray-300 focus:ring-gray-800 text-black placeholder-gray-500' : 'bg-black/50 border-white/10 focus:ring-blue-500 text-white placeholder-gray-400'}`}
                  disabled={isLoading || (isRagMode && !uploadStatus.includes('processed successfully'))}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !question.trim() || (isRagMode && !uploadStatus.includes('processed successfully'))} 
                className={`w-12 h-12 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center flex-shrink-0 ${lightTheme ? 'bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white'}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5"/>
                )}
              </button>
            </form>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;