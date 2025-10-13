import React, { useState } from 'react';
import { Edit3, Check, X, User, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

function ProfilePage({ user, onUpdateProfile, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '' });
  const [message, setMessage] = useState('');
  const { theme } = useTheme(); // Get theme

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({ name: user?.name || '' });
    setMessage('');
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setMessage('Name cannot be empty');
      return;
    }

    const result = await onUpdateProfile({ name: editForm.name });
    
    if (result.success) {
      setIsEditing(false);
      setMessage(result.message);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ name: user?.name || '' });
    setMessage('');
  };

  const lightTheme = theme === 'light';
  const cardBg = lightTheme 
    ? 'bg-white/80 backdrop-blur-sm' 
    : 'bg-gray-900/60 backdrop-blur-md';
  const borderColor = lightTheme ? 'border-yellow-300/70' : 'border-yellow-600/30';
  const textColor = lightTheme ? 'text-gray-800' : 'text-yellow-400';
  const inputBg = lightTheme ? 'bg-gray-100/50' : 'bg-gray-800/50';
  const inputBorder = lightTheme ? 'border-gray-300' : 'border-yellow-500/30';
  const focusRing = lightTheme ? 'focus:ring-yellow-500/80' : 'focus:ring-yellow-500/50';

  return (
    <div className={`min-h-screen p-6 ${lightTheme ? 'bg-gradient-to-br from-yellow-50 to-amber-100' : 'bg-black'}`}>
      <link
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&display=swap"
        rel="stylesheet"
      />
      
      {!lightTheme && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[150px]" />
        </div>
      )}

      <div className={`relative max-w-2xl mx-auto rounded-2xl p-8 border ${cardBg} ${borderColor} shadow-2xl shadow-yellow-500/5 transition-all duration-300`}>
        <h3 
          className={`text-3xl font-bold mb-8 text-center ${lightTheme ? 'text-yellow-900' : 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-400'}`}
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          Profile Settings
        </h3>
        
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg border text-center text-sm ${
            message.includes('successfully') 
              ? 'bg-green-500/20 border-green-500/30 text-green-400'
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}
        
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${lightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
                <User className="w-4 h-4" />
                Name
              </label>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className={`p-2 rounded-full transition-all duration-200 ${lightTheme ? 'text-gray-600 hover:bg-gray-200/80' : 'text-blue-400 hover:bg-blue-500/20'}`}
                  title="Edit Name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ name: e.target.value })}
                  className={`flex-1 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent ${inputBg} ${inputBorder} ${focusRing} ${lightTheme ? 'text-gray-900' : 'text-white'}`}
                  placeholder="Enter your name"
                  disabled={loading}
                />
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-50"
                  title="Save Changes"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="p-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 disabled:opacity-50"
                  title="Cancel Edit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} ${lightTheme ? 'text-gray-800' : 'text-white'}`}>
                {user?.name || ''}
              </div>
            )}
          </div>
          
          {/* Email Field */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${lightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
              <Mail className="w-4 h-4" />
              Email
            </label>
            <div className={`w-full px-4 py-2 rounded-lg opacity-75 ${inputBg} ${inputBorder} ${lightTheme ? 'text-gray-700' : 'text-white'}`}>
              {user?.email || ''}
            </div>
            <p className={`text-xs mt-2 ${lightTheme ? 'text-gray-500' : 'text-gray-500'}`}>Email cannot be changed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;