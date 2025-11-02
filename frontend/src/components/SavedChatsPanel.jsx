import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function SavedChatsPanel({ open, onClose, onLoadSavedChat }) {
  const { user } = useContext(AuthContext);
  const [savedChats, setSavedChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchSavedChats();
  }, [open]);

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

  const handleLoad = async (id) => {
    try {
      const res = await api.get(`/saved-chats/${id}`);
      if (res.data && res.data.savedChat) {
        onLoadSavedChat(res.data.savedChat);
        onClose();
      }
    } catch (err) {
      console.error('Error loading saved chat', err);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="w-11/12 max-w-2xl bg-white dark:bg-black rounded-lg p-4 z-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Saved Chats</h3>
          <button onClick={onClose} className="text-sm px-2 py-1">Close</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : savedChats.length === 0 ? (
          <div>No saved chats yet.</div>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {savedChats.map(chat => (
              <li key={chat.id} className="border rounded p-2 flex justify-between items-start">
                <div>
                  <div className="font-semibold">{chat.title}</div>
                  <div className="text-xs text-gray-500">{chat.chatType.toUpperCase()} • {chat.messageCount} messages</div>
                  <div className="text-xs mt-1 text-gray-600">{chat.preview}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleLoad(chat.id)} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Open</button>
                  <button onClick={() => handleDelete(chat.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
