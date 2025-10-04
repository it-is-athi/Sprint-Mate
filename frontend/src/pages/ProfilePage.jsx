import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';

function ProfilePage({ user, onUpdateProfile, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '' });
  const [message, setMessage] = useState('');

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

  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-yellow-600/30">
      <h3 className="text-xl font-semibold text-yellow-400 mb-6">Profile Settings</h3>
      
      {/* Success/Error Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.includes('successfully') 
            ? 'bg-green-500/20 border-green-500/30 text-green-400'
            : 'bg-red-500/20 border-red-500/30 text-red-400'
        }`}>
          {message}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">Name</label>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 hover:text-blue-300 transition-all duration-200"
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
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-yellow-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                placeholder="Enter your name"
                disabled={loading}
              />
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 hover:text-green-300 transition-all duration-200 disabled:opacity-50"
                title="Save Changes"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="p-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 hover:border-gray-400/50 hover:text-gray-300 transition-all duration-200 disabled:opacity-50"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={user?.name || ''}
              readOnly
              className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
            />
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white opacity-75"
          />
          <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;