import React from 'react';
import { MessageCircle } from 'lucide-react';

function ChatPage() {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-yellow-600/30 text-center">
      <MessageCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">AI Chat Assistant</h3>
      <p className="text-gray-400">Coming soon! Chat with AI to help plan your schedules.</p>
    </div>
  );
}

export default ChatPage;