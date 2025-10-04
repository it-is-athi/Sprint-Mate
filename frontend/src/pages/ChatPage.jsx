// pages/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // <-- 1. IMPORT THE GFM PLUGIN
import { Send, FileText, XCircle } from 'lucide-react';

function ChatPage() {
  // ... (keep all your existing state and functions: useState, useEffect, handleFileChange, etc.)
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isRagMode, setIsRagMode] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
    setUploadStatus('Processing document...');
    setChatHistory([]);
    const formData = new FormData();
    formData.append('pdfFile', file);
    try {
      const response = await axios.post('http://localhost:5000/api/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus(response.data.message);
      setIsRagMode(true);
      setFile(null);
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
    const userMessage = { sender: 'user', text: question };
    setIsLoading(true);
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion('');
    try {
      const response = await axios.post('http://localhost:5000/api/rag/ask', {
        question: question,
        isGeneral: !isRagMode,
      });
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


  return (
    <div className="flex flex-col h-full w-full">
      {/* Optional Upload Section */}
      <div className="flex-shrink-0 mb-4 p-4 border border-slate-700 rounded-lg bg-slate-800">
        {isRagMode ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <FileText size={18} />
              <p className="text-sm">{uploadStatus}</p>
            </div>
            <button onClick={handleClearDocument} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
              <XCircle size={18} />
              Clear Document
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <input type="file" accept=".pdf" onChange={handleFileChange} className="flex-grow text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-500 cursor-pointer" />
            <button onClick={handleUpload} disabled={isLoading || !file} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Processing...' : 'Chat with PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex-grow overflow-y-auto mb-4 pr-4 space-y-4">
          {chatHistory.length === 0 && (
              <div className="text-center text-slate-500 pt-10">
                  <p>{isRagMode ? "Ask a question about your document." : "Ask a general question or upload a PDF to begin."}</p>
              </div>
          )}
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${chat.sender === 'user' ? 'px-4 py-3 rounded-lg bg-slate-600 text-white max-w-2xl' : 'w-full'}`}>
                {chat.sender === 'bot' ? (
                  // The @tailwindcss/typography plugin provides default styling for tables, which is great!
                  <div className="prose prose-sm prose-invert max-w-none">
                     {/* <-- 2. ADD THE PLUGIN TO THE COMPONENT --> */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{chat.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (<div className="flex justify-start"><div className="px-4 py-2 rounded-lg bg-slate-700"><p className="animate-pulse">Thinking...</p></div></div>)}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleAskQuestion} className="flex-shrink-0 flex space-x-2">
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={isRagMode ? "Ask about the document..." : "Ask a general question..."} className="flex-grow p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-gray-500" disabled={isLoading} />
          <button type="submit" disabled={isLoading || !question.trim()} className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
            <Send className="w-5 h-5"/>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;