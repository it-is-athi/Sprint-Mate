import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, Calendar, MoreVertical, ArrowUpRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import WeekCalendar from '../components/WeekCalendar';
import FocusTimer from '../components/FocusTimer';
import { useTheme } from "../context/ThemeContext";

function HomePage({ todaysTasks = [], weeklyTasks = [], updateTaskStatus, user }) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Filter tasks for display
  const pendingTodaysTasks = todaysTasks.filter(task => task.status !== 'completed');
  const completedTodaysTasks = todaysTasks.filter(task => task.status === 'completed');

  // Calculate completion rate
  const completionRate = todaysTasks.length > 0
    ? Math.round((completedTodaysTasks.length / todaysTasks.length) * 100)
    : 0;

  const dailyAffirmations = [
    "Every step forward is progress.",
    "Learning is your superpower.",
    "Consistency is key to growth.",
    "Believe in your abilities.",
    "Small efforts build great outcomes.",
    "Your dedication will pay off.",
    "Stay curious and keep learning.",
    "Challenges make you stronger.",
    "Progress over perfection.",
    "You are capable of amazing things.",
  ];

  const today = new Date();
  const affirmIndex = today.getDate() % dailyAffirmations.length;
  const todayAffirmation = dailyAffirmations[affirmIndex];

  const getTasksForDate = (date) => {
    // Matches tasks for the selected date (YYYY-MM-DD)
    const day = date.toISOString().split('T')[0];
    // Use weeklyTasks instead of todaysTasks to get tasks for all dates
    return weeklyTasks.filter(task => new Date(task.date).toISOString().split('T')[0] === day);
  };

  // --- Sun Progress Component ---
  const SunProgress = ({ progress }) => {
    const safeProgress = Math.min(100, Math.max(0, progress));
    
    // Dynamic sun properties based on progress
    const sunSize = 60 + (safeProgress / 100) * 80; // Grows from 60px to 140px
    const sunOpacity = 0.4 + (safeProgress / 100) * 0.6; // Increases from 40% to 100%
    const sunVerticalPosition = 40 + ((100 - safeProgress) / 100) * 160; // Starts near bottom (200px) and rises to 40px from top
    
    // Generate star dots (only visible at low progress)
    const starOpacity = Math.max(0, 1 - (safeProgress / 30)); // Fade out by 30% progress
    const starDots = Array(20).fill(0).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: Math.random() * 2 + 1
    }));

    return (
      <div 
        className="relative rounded-2xl overflow-hidden shadow-xl flex flex-col items-center justify-center w-[280px] h-[280px]"
        style={{
          background: `linear-gradient(180deg, 
            ${safeProgress < 50 
              ? `rgb(16, 24, 50) ${100 - safeProgress * 2}%, rgb(47, 37, 78) 100%`
              : `rgb(47, 37, 78) ${100 - safeProgress}%, rgb(255, 200, 120) 100%`
            })`,
          isolation: 'isolate',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Stars */}
        {starDots.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: starOpacity,
              transition: 'opacity 1s ease-out',
            }}
          />
        ))}

        {/* Sun with Glow Effect */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10"
          style={{
            width: `${sunSize}px`,
            height: `${sunSize}px`,
            top: `${sunVerticalPosition}px`,
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Sun Glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at center,
                rgba(255, 200, 120, ${sunOpacity * 0.7}) 0%,
                rgba(234, 179, 8, ${sunOpacity * 0.5}) 40%,
                rgba(234, 179, 8, 0) 70%
              )`,
              transform: 'scale(1.5)',
              transition: 'all 1s ease-out',
            }}
          />
          {/* Sun Core */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at center,
                rgba(255, 220, 150, ${sunOpacity}) 0%,
                rgba(234, 179, 8, ${sunOpacity}) 60%,
                rgba(234, 179, 8, ${sunOpacity * 0.8}) 100%
              )`,
              boxShadow: `
                0 0 ${sunSize/3}px rgba(234, 179, 8, ${sunOpacity * 0.3}),
                0 0 ${sunSize/2}px rgba(234, 179, 8, ${sunOpacity * 0.2})
              `,
              transition: 'all 1s ease-out',
            }}
          />
        </div>

        {/* Mountain Range with Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
            style={{
              height: '120px',
            }}
          />
          <div 
            className="w-full h-[120px] bg-black"
            style={{
              clipPath: 'polygon(0% 100%, 0% 60%, 15% 65%, 25% 45%, 35% 55%, 45% 35%, 55% 50%, 65% 25%, 75% 35%, 85% 15%, 100% 45%, 100% 100%)',
              opacity: 0.85,
            }}
          />
        </div>

        {/* Container Border */}
        <div 
          className="absolute inset-0 z-30"
          style={{
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '1rem',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Heading */}
        <h3
          className="absolute top-4 text-lg tracking-wide z-40 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500"
          style={{ 
            fontFamily: "'Bodoni Moda', serif",
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          Daily Progress
        </h3>

        {/* Percentage Text */}
        <span
          className="relative text-5xl font-bold z-40 text-white"
          style={{ 
            fontFamily: "'Bodoni Moda', serif",
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
          }}
        >
          {safeProgress}%
        </span>
      </div>
    );
  };

  // --- Stats Card Component ---
  const cardBg =
    "url('https://i.pinimg.com/1200x/90/d2/66/90d266fb509642471f06efd568dd460e.jpg')";

  // Task Card Component
const TaskCard = ({ task, onStatusChange, onNavigate }) => (
    <div 
      className={`relative group rounded-lg overflow-hidden border backdrop-blur-sm transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
        lightTheme 
          ? 'border-yellow-300/50 hover:border-yellow-400/70' 
          : 'border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-yellow-500/10'
      }`}
      onClick={onNavigate}
      style={{
        background: lightTheme 
          ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.8), rgba(254, 243, 199, 0.8))'
          : 'linear-gradient(45deg, rgba(20, 20, 20, 0.5), rgba(30, 30, 30, 0.5))'
      }}
    >
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium truncate ${lightTheme ? 'text-gray-800' : 'text-white'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>{task.title}</h4>
            <ArrowUpRight className={`w-4 h-4 transition-colors ${lightTheme ? 'text-yellow-600/70 group-hover:text-yellow-600' : 'text-yellow-500/50 group-hover:text-yellow-500'}`} />
          </div>
          {task.schedule_id?.schedule_title && (
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${lightTheme ? 'bg-yellow-200/50 text-yellow-800 border-yellow-300/50' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>
                {task.schedule_id.schedule_title}
              </span>
            </div>
          )}
        </div>        <div className="flex items-center gap-3">
          <button
            onClick={onStatusChange}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              task.status === 'completed'
                ? 'bg-yellow-500 border-yellow-600'
                : lightTheme
                  ? 'border-yellow-600/50 hover:border-yellow-500'
                  : 'border-gray-600 hover:border-yellow-500'
            }`}
          >
            {task.status === 'completed' && (
              <CheckCircle className="w-4 h-4 text-black" />
            )}
          </button>
          
          <button className={`transition-colors duration-200 ${lightTheme ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // --- Main Page Layout ---
  const lightTheme = theme === 'light';
  const rootBg = lightTheme
    ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 text-gray-900'
    : 'bg-black text-white';

  return (
    <div
      className={`min-h-screen space-y-6 p-6 relative ${rootBg} transition-colors duration-300`}
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
      {/* Ambient glow effects */}
      {!lightTheme && <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
      </div>}
      <link
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Main layout with bottoms aligned */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {/* Left column: Calendar, Daily Progress, and Daily Affirmations */}
        <div className="col-span-7 md:col-span-4 flex flex-col">
          <WeekCalendar 
            todaysTasks={todaysTasks} 
            getTasksForDate={getTasksForDate} 
          />
          {/* Daily Progress and Daily Affirmations - positioned to align bottoms with Focus Timer */}
          <div className="flex-1 flex items-end">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
              <div className="flex items-end justify-center">
                <SunProgress progress={completionRate} />
              </div>
              <div className="flex items-end justify-center">
                <div className={`relative rounded-2xl flex items-center justify-center text-center p-8 w-full shadow-xl border ${lightTheme ? 'border-yellow-200 bg-yellow-50/90' : 'border-yellow-400/20 bg-gray-900/70'} min-h-[280px] transition-colors duration-300`}>
                  <h2
                    className={`relative text-2xl md:text-3xl lg:text-4xl leading-snug drop-shadow-lg max-w-2xl text-left font-bold ${lightTheme ? 'text-yellow-900' : 'text-white'}`}
                    style={{ fontFamily: "'Bodoni Moda', serif" }}
                  >
                    {todayAffirmation}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Focus Timer */}
        <div className="col-span-7 md:col-span-3 flex items-end">
          <FocusTimer />
        </div>
      </div>
      
      {/* Today's Tasks and Completed Tasks - below main layout */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className={`relative rounded-2xl overflow-hidden border ${lightTheme ? 'border-yellow-300 bg-yellow-50/70' : 'border-yellow-500/30 bg-gray-900/60'} backdrop-blur-sm shadow-xl p-6 group hover:border-yellow-500/50 transition-all duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className={`relative text-xl mb-4 flex items-center gap-2 ${lightTheme ? 'text-yellow-800' : 'text-yellow-200'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>
              <span className="p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors duration-300">
                <Calendar className="w-5 h-5" />
              </span>
              <span className={`${lightTheme ? 'text-yellow-800' : 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500'}`}>
                Today's Tasks
              </span>
              <span className={`text-sm ml-2 bg-yellow-500/10 px-2 py-1 rounded-full ${lightTheme ? 'text-yellow-700' : 'text-yellow-500/70'}`}>
                ({pendingTodaysTasks.length} pending)
              </span>
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {pendingTodaysTasks.length === 0 ? (
                <p className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>No pending tasks for today</p>
              ) : (
                pendingTodaysTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onNavigate={() => task.schedule_id && navigate(`/dashboard/schedules/tasks/${task.schedule_id._id}`)}
                    onStatusChange={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task._id, 'completed');
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        <div>
          <div className={`relative rounded-2xl overflow-hidden border backdrop-blur-sm shadow-xl p-6 ${lightTheme ? 'border-yellow-200 bg-yellow-50/90' : 'border-yellow-500/30 bg-gray-900/60'}`}>
            <h3 className={`text-xl mb-4 flex items-center gap-2 ${lightTheme ? 'text-yellow-800' : 'text-yellow-200'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>
              <span className="p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors duration-300">
                <CheckCircle className="w-5 h-5 text-yellow-500" />
              </span>
              <span className={`${lightTheme ? 'text-yellow-800' : 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500'}`}>
                Completed Tasks
              </span>
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {completedTodaysTasks.length === 0 ? (
                <p className={`${lightTheme ? 'text-gray-600' : 'text-gray-400'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>No completed tasks today</p>
              ) : (
                completedTodaysTasks.map(task => (
                  <TaskCard 
                    key={task._id}
                    task={task}
                    onNavigate={() => task.schedule_id && navigate(`/dashboard/schedules/tasks/${task.schedule_id._id}`)}
                    onStatusChange={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task._id, 'pending');
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
