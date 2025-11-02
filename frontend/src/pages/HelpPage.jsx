import React from 'react';
import { ArrowLeft, MessageCircle, AlertCircle, BookOpen, Users, Settings, Calendar, FileText, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function HelpPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const lightTheme = theme === 'light';

  const handleFeedback = () => {
    const email = 'feedback@sprintmate.com';
    const subject = 'Feedback for Sprint Mate';
    const body = 'Dear Sprint Mate Team,\n\nI would like to share the following feedback:\n\n[Please share your thoughts, suggestions, or experiences here]\n\nRating: [Please rate your experience from 1-5]\n\nBest regards,\n[Your Name]';
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleReportProblem = () => {
    const email = 'support@sprintmate.com';
    const subject = 'Problem Report - Sprint Mate';
    const body = 'Dear Sprint Mate Support Team,\n\nI would like to report the following issue:\n\nProblem Description:\n[Please describe the issue you encountered]\n\nSteps to Reproduce:\n1. [Step one]\n2. [Step two]\n3. [Step three]\n\nExpected Behavior:\n[What should have happened]\n\nActual Behavior:\n[What actually happened]\n\nDevice/Browser Information:\n[Please include your device and browser details]\n\nScreenshots (if applicable):\n[Attach screenshots if relevant]\n\nBest regards,\n[Your Name]';
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const helpSections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      items: [
        "Create your account and complete your profile",
        "Set up your first project or task list",
        "Explore the dashboard to see your progress overview",
        "Customize your preferences in Settings"
      ]
    },
    {
      title: "Managing Tasks",
      icon: FileText,
      items: [
        "Create new tasks with due dates and priorities",
        "Mark tasks as complete to track your progress",
        "Edit or delete tasks as needed",
        "Use filters to organize your task view"
      ]
    },
    {
      title: "Schedules & Planning",
      icon: Calendar,
      items: [
        "Create recurring schedules for regular activities",
        "Set reminders for important deadlines",
        "View your calendar to plan your week",
        "Sync with external calendar apps (if available)"
      ]
    },
    {
      title: "Chat & AI Assistant",
      icon: MessageCircle,
      items: [
        "Ask general questions to get quick answers",
        "Upload PDF documents to chat about specific content",
        "Save important conversations for future reference",
        "Switch between General, PDF, and Saved Chat modes"
      ]
    },
    {
      title: "Progress Tracking",
      icon: Settings,
      items: [
        "Monitor your task completion rates",
        "View weekly and monthly progress charts",
        "Track your productivity streaks",
        "Analyze patterns in your work habits"
      ]
    },
    {
      title: "Account Management",
      icon: Users,
      items: [
        "Update your profile information anytime",
        "Change your password for security",
        "Customize your app theme (Light/Dark mode)",
        "Manage your notification preferences"
      ]
    }
  ];

  return (
    <div className={`min-h-screen p-6 ${
      lightTheme 
        ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 text-gray-900' 
        : 'bg-black text-white'
    }`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              lightTheme 
                ? 'bg-white/70 hover:bg-white border border-gray-200' 
                : 'bg-white/10 hover:bg-white/20 border border-white/20'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
              Help & Support
            </h1>
            <p className={`text-sm ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
              Get help with Sprint Mate features and functionality
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleFeedback}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
              lightTheme 
                ? 'bg-white/70 border-blue-200 hover:shadow-lg hover:border-blue-300' 
                : 'bg-blue-900/20 border-blue-500/30 hover:shadow-blue-500/10 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Mail className={`w-6 h-6 ${lightTheme ? 'text-blue-600' : 'text-blue-400'}`} />
              <h3 className={`text-lg font-semibold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
                Send Feedback
              </h3>
            </div>
            <p className={`text-sm text-left ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
              Share your thoughts and suggestions to help us improve Sprint Mate
            </p>
          </button>

          <button
            onClick={handleReportProblem}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
              lightTheme 
                ? 'bg-white/70 border-orange-200 hover:shadow-lg hover:border-orange-300' 
                : 'bg-orange-900/20 border-orange-500/30 hover:shadow-orange-500/10 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className={`w-6 h-6 ${lightTheme ? 'text-orange-600' : 'text-orange-400'}`} />
              <h3 className={`text-lg font-semibold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
                Report Problem
              </h3>
            </div>
            <p className={`text-sm text-left ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
              Let us know about any issues or bugs you've encountered
            </p>
          </button>
        </div>

        {/* Help Sections */}
        <div className="space-y-6">
          <h2 className={`text-2xl font-bold ${lightTheme ? 'text-gray-900' : 'text-white'} mb-4`}>
            How to Use Sprint Mate
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {helpSections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border ${
                    lightTheme 
                      ? 'bg-white/70 border-gray-200' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className={`w-6 h-6 ${lightTheme ? 'text-blue-600' : 'text-blue-400'}`} />
                    <h3 className={`text-lg font-semibold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li 
                        key={itemIndex}
                        className={`text-sm flex items-start gap-2 ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                          lightTheme ? 'bg-blue-500' : 'bg-blue-400'
                        }`}></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
