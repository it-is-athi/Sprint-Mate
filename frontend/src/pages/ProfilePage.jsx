import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Users, Key, LogOut, HelpCircle, MessageSquare, Edit3, Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function ProfilePage({ user, onUpdateProfile, onLogout, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    gender: user?.gender || ''
  });
  const [message, setMessage] = useState('');
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({ 
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      gender: user?.gender || ''
    });
    setMessage('');
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setMessage('Name cannot be empty');
      return;
    }

    const result = await onUpdateProfile({ 
      name: editForm.name,
      phoneNumber: editForm.phoneNumber,
      gender: editForm.gender
    });
    
    if (result.success) {
      setIsEditing(false);
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ 
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      gender: user?.gender || ''
    });
    setMessage('');
  };

  const handleResetPassword = () => {
    navigate('/forgot-password');
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleHelp = () => {
    alert('Help & Support: For assistance, please contact us at support@sprintmate.com');
  };

  const handleReportProblem = () => {
    const email = 'support@sprintmate.com';
    const subject = 'Problem Report - Sprint Mate';
    const body = 'Dear Sprint Mate Team,\n\nI would like to report the following issue:\n\n[Please describe your problem here]\n\nBest regards,\n' + (user?.name || 'User');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const lightTheme = theme === 'light';
  const rootBg = lightTheme
    ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 text-gray-900'
    : 'bg-black text-white';

  return (
    <div 
      className={`min-h-screen space-y-6 p-6 ${rootBg}`}
      style={lightTheme ? { background: undefined } : {
        backgroundColor: "#0a0a0a",
        backgroundImage: `
          linear-gradient(to right, rgba(234, 179, 8, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(234, 179, 8, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        backgroundPosition: "0 0"
      }}
    >
      {/* Font Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Ambient glow effects */}
      {!lightTheme && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-orange-500/5 rounded-full blur-[96px] animate-pulse" style={{ animationDuration: '6s' }} />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h2 
          className={`text-3xl font-bold ${lightTheme ? 'text-yellow-900' : 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500'} hover:scale-[1.01] transition-transform duration-300`}
          style={{ 
            fontFamily: "'Bodoni Moda', serif",
            backgroundSize: '200% auto',
            animation: 'gradient 8s linear infinite'
          }}
        >
          My Profile
        </h2>
        <p 
          className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'} mt-2 hover:text-gray-500 transition-colors duration-300`} 
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className={`relative max-w-2xl mx-auto rounded-2xl p-8 border ${
        lightTheme 
          ? 'bg-white/80 backdrop-blur-sm border-yellow-300/70' 
          : 'bg-gray-900/60 backdrop-blur-md border-yellow-600/30'
      } shadow-2xl shadow-yellow-500/5 transition-all duration-300`}>
        
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

        {/* Profile Information */}
        <div className="space-y-6 mb-8">
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
                  className={`p-2 rounded-full transition-all duration-200 ${lightTheme ? 'text-gray-600 hover:bg-gray-200/80' : 'text-yellow-400 hover:bg-yellow-500/20'}`}
                  title="Edit Profile"
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
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    lightTheme 
                      ? 'bg-gray-100/50 border-gray-300 text-gray-900 focus:ring-yellow-500/80' 
                      : 'bg-gray-800/50 border-yellow-500/30 text-white focus:ring-yellow-500/50'
                  }`}
                  placeholder="Enter your name"
                  disabled={loading}
                />
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50"
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
              <div className={`w-full px-4 py-2 rounded-lg ${
                lightTheme 
                  ? 'bg-gray-100/50 border-gray-300 text-gray-800' 
                  : 'bg-gray-800/50 border-yellow-500/30 text-white'
              }`}>
                {user?.name || 'Not set'}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${lightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
              <Mail className="w-4 h-4" />
              Email
            </label>
            <div className={`w-full px-4 py-2 rounded-lg opacity-75 ${
              lightTheme 
                ? 'bg-gray-100/50 border-gray-300 text-gray-700' 
                : 'bg-gray-800/50 border-yellow-500/30 text-white'
            }`}>
              {user?.email || 'Not set'}
            </div>
            <p className={`text-xs mt-2 ${lightTheme ? 'text-gray-500' : 'text-gray-500'}`}>Email cannot be changed</p>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${lightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  lightTheme 
                    ? 'bg-gray-100/50 border-gray-300 text-gray-900 focus:ring-yellow-500/80' 
                    : 'bg-gray-800/50 border-yellow-500/30 text-white focus:ring-yellow-500/50'
                }`}
                placeholder="Enter your phone number (optional)"
                disabled={loading}
              />
            ) : (
              <div className={`w-full px-4 py-2 rounded-lg ${
                lightTheme 
                  ? 'bg-gray-100/50 border-gray-300 text-gray-700' 
                  : 'bg-gray-800/50 border-yellow-500/30 text-gray-400'
              }`}>
                {user?.phoneNumber || 'Not provided'}
              </div>
            )}
          </div>

          {/* Gender Field */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${lightTheme ? 'text-gray-600' : 'text-gray-300'}`}>
              <Users className="w-4 h-4" />
              Gender
            </label>
            {isEditing ? (
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  lightTheme 
                    ? 'bg-gray-100/50 border-gray-300 text-gray-900 focus:ring-yellow-500/80' 
                    : 'bg-gray-800/50 border-yellow-500/30 text-white focus:ring-yellow-500/50'
                }`}
                disabled={loading}
              >
                <option value="">Select Gender (optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <div className={`w-full px-4 py-2 rounded-lg ${
                lightTheme 
                  ? 'bg-gray-100/50 border-gray-300 text-gray-700' 
                  : 'bg-gray-800/50 border-yellow-500/30 text-gray-400'
              }`}>
                {user?.gender || 'Not specified'}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Reset Password Button */}
          <button
            onClick={handleResetPassword}
            className={`w-full flex items-center justify-center gap-3 ${
              lightTheme 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30'
            } px-6 py-3 rounded-xl transition-all duration-300 font-medium`}
          >
            <Key className="w-5 h-5" />
            Reset Password
          </button>

          {/* Help & Feedback Button */}
          <button
            onClick={handleHelp}
            className={`w-full flex items-center justify-center gap-3 ${
              lightTheme 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30'
            } px-6 py-3 rounded-xl transition-all duration-300 font-medium`}
          >
            <HelpCircle className="w-5 h-5" />
            Help & Feedback
          </button>

          {/* Report Problem Button */}
          <button
            onClick={handleReportProblem}
            className={`w-full flex items-center justify-center gap-3 ${
              lightTheme 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30'
            } px-6 py-3 rounded-xl transition-all duration-300 font-medium`}
          >
            <MessageSquare className="w-5 h-5" />
            Report Problem
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 ${
              lightTheme 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
            } px-6 py-3 rounded-xl transition-all duration-300 font-medium`}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;