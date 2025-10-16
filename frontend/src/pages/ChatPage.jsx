// pages/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, FileText, XCircle, BrainCircuit, FileUp } from 'lucide-react'; // Updated icons
import { useLocation } from 'react-router-dom';
import Aurora from '../components/Aurora'; // Import the Aurora component
import { useTheme } from '../context/ThemeContext'; // Import theme context
import SplitText from '../components/SplitText'; // Import SplitText component

function ChatPage() {
  const { theme } = useTheme(); // Get current theme
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isRagMode, setIsRagMode] = useState(false);
  const [studyProcessed, setStudyProcessed] = useState(false);
  const chatEndRef = useRef(null);
  const studyTaskRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle study mode when task details are passed from other pages
  useEffect(() => {
    const studyTask = location.state?.studyTask;
    
    // Check if we have a study task and it's different from the last processed one
    if (studyTask && 
        !studyProcessed && 
        JSON.stringify(studyTask) !== JSON.stringify(studyTaskRef.current)) {
      
      studyTaskRef.current = studyTask; // Store current task
      const { task, scheduleName } = studyTask;
      
      setIsRagMode(false); // Use general chat mode for studying
      setChatHistory([]);
      setStudyProcessed(true); // Prevent duplicate processing
      
      // Create a clean study prompt with essential task details
      const studyPrompt = `I want to study and learn about: "${task.task_title || task.name}"

${task.task_description || task.description ? `**Topic Details:** ${task.task_description || task.description}` : ''}
**From:** ${scheduleName || 'My Studies'}

Please teach me about this topic with clear explanations and practical examples.`;

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
  }, [location.state, studyProcessed, isLoading]);

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
      
      const response = await axios.post('http://localhost:5000/api/rag/ask', {
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
      setFile(selectedFile);
      setUploadStatus(`Ready to upload: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setUploadStatus('📤 Analysing Document...');
    setChatHistory([]);
    const formData = new FormData();
    formData.append('pdfFile', file);
    try {
      const response = await axios.post('http://localhost:5000/api/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('✅ PDF uploaded and processed successfully!');
      setIsRagMode(true);
      
      // Add a system message to chat
      setTimeout(() => {
        setChatHistory([{
          sender: 'bot',
          text: '🎉 **PDF Upload Complete!**\n\nYour document has been successfully processed and I\'m ready to answer questions about it. You can ask me to:\n\n- **Summarize** the main points\n- **Explain** specific concepts\n- **Find** particular information\n- **Compare** different sections\n\nWhat would you like to know about your document?'
        }]);
      }, 1000);
      
    } catch (error) {
      setUploadStatus(error.response?.data?.error || 'Error uploading file.');
      setIsRagMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    console.log(`🚀 Frontend - Sending question: "${question}", isRagMode: ${isRagMode}, isGeneral: ${!isRagMode}`);
    
    const userMessage = { sender: 'user', text: question };
    setIsLoading(true);
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion('');
    try {
      const response = await axios.post('http://localhost:5000/api/rag/ask', {
        question: question,
        isGeneral: !isRagMode,
      });
      console.log(`✅ Frontend - Received response successfully`);
      const botMessage = { sender: 'bot', text: response.data.answer };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: error.response?.data?.error || 'Sorry, I encountered an error.' };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDocument = () => {
    setIsRagMode(false);
    setUploadStatus('');
    setFile(null);
    setChatHistory([]);
  };

  const lightTheme = theme === 'light';

  const textareaRef = useRef(null);

  return (
    <div className={`relative flex flex-col h-full w-full overflow-hidden font-sans ${lightTheme ? 'bg-white' : 'bg-black'}`}>
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0 opacity-70">
        <Aurora 
          isLightMode={lightTheme}
          colorStops={lightTheme ? ['#FFFF00', '#FFA500', '#FFFF00'] : ['#FFEA00', '#FFBF00', '#FFEA00']} 
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full w-full p-6">
        {/* Header with Mode Selection */}
        <div className="flex-shrink-0 mb-6">
              <div className={`p-2 rounded-xl border w-auto ${lightTheme ? 'bg-white border-gray-300' : 'bg-black/20 border-white/10'} backdrop-blur-md`}>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsRagMode(false);
                  setChatHistory([]);
                  setFile(null);
                  setUploadStatus('');
                  setStudyProcessed(false);
                  studyTaskRef.current = null;
                }}
                className={`px-8 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  !isRagMode 
                    ? (lightTheme ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30')
                    : (lightTheme ? 'bg-transparent text-gray-700 hover:bg-black/10' : 'bg-transparent text-gray-300 hover:bg-white/10')
                }`}
              >
                <BrainCircuit className={`w-5 h-5 ${lightTheme ? 'text-white' : 'text-yellow-200'}`} />
                General
              </button>
              <button
                onClick={() => {
                  setIsRagMode(true);
                  setChatHistory([]);
                  setFile(null);
                  setUploadStatus('');
                  setStudyProcessed(false);
                  studyTaskRef.current = null;
                }}
                className={`px-8 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  isRagMode 
                    ? (lightTheme ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30')
                    : (lightTheme ? 'bg-transparent text-gray-700 hover:bg-black/10' : 'bg-transparent text-gray-300 hover:bg-white/10')
                }`}
              >
                <FileText className="w-5 h-5" />
                With PDF
              </button>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-grow flex flex-col min-h-0 h-[80vh]">
          {/* Chat Messages Area */}
          <div className="flex-grow overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar">
            {chatHistory.length === 0 && !uploadStatus && !location.state?.studyTask && (
              <div className="text-center flex items-center justify-center h-full">
                {isRagMode ? (
                  <div className={`p-8 max-w-md mx-auto rounded-2xl border ${lightTheme ? 'bg-white border-gray-300' : 'bg-black/20 border-white/10'} backdrop-blur-sm`}>
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className={`text-xl font-semibold font-sans ${lightTheme ? 'text-gray-800' : 'text-gray-100'} mb-2`}>Chat with your PDF</h3>
                    <p className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'} font-sans`}>
                      Got a PDF? Upload it and start asking — I will handle the rest.
                    </p>
                  </div>
                ) : (
                  <div className={`p-8 max-w-md mx-auto rounded-2xl border ${lightTheme ? 'bg-white border-gray-300' : 'bg-black/20 border-white/10'} backdrop-blur-sm`}>
                    <div className="text-6xl mb-4"> </div>
                    <h3 className={`text-xl font-semibold font-sans ${lightTheme ? 'text-gray-800' : 'text-gray-100'} mb-2`}>AI Assistant</h3>
                    <p className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'} font-sans`}>
                      Ask me anything — I’ll help you plan, learn, and get things done!!
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
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.text}</ReactMarkdown>
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
                      if (question.trim() && !isLoading && !(isRagMode && !uploadStatus.includes('processed successfully'))) {
                        handleAskQuestion(e);
                      }
                    }
                  }}
                  placeholder={isRagMode ? (uploadStatus.includes('processed successfully') ? "Ask about your document..." : "Upload a PDF first...") : "Ask me anything..."}
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
        </div>
      </div>
    </div>
  );
}

export default ChatPage;