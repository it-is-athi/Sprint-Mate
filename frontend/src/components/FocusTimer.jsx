import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FocusTimer = () => {
  const { theme } = useTheme();
  const lightTheme = theme === 'light';
  
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // Auto-switch to break or focus
          if (!isBreak) {
            setIsBreak(true);
            return breakMinutes * 60;
          } else {
            setIsBreak(false);
            return focusMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak, focusMinutes, breakMinutes]);

  const handleFocusTimeChange = (value) => {
    const mins = value;
    setFocusMinutes(mins);
    if (!isRunning && !isBreak) {
      setTimeLeft(mins * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakMinutes * 60 : focusMinutes * 60);
  };

  const handleToggleBreak = () => {
    setIsBreak(!isBreak);
    setIsRunning(false);
    setTimeLeft(isBreak ? focusMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((breakMinutes * 60 - timeLeft) / (breakMinutes * 60)) * 100
    : ((focusMinutes * 60 - timeLeft) / (focusMinutes * 60)) * 100;

  return (
    <div className={`w-full border-2 shadow-xl rounded-2xl ${
      lightTheme 
        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-amber-200/50' 
        : 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border-yellow-500/30'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 
            className={`text-2xl font-bold bg-clip-text text-transparent ${
              lightTheme 
                ? 'bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-600' 
                : 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500'
            }`}
            style={{ fontFamily: "'Bodoni Moda', serif" }}
          >
            {isBreak ? 'Break Time' : 'Focus Timer'}
          </h2>
          <p className={`text-sm mt-1 ${lightTheme ? 'text-amber-700/70' : 'text-yellow-300/70'}`}>
            Stay productive with focused work sessions
          </p>
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={lightTheme ? "rgba(251, 191, 36, 0.2)" : "rgba(234, 179, 8, 0.2)"}
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span 
                className={`text-3xl font-bold bg-clip-text text-transparent ${
                  lightTheme 
                    ? 'bg-gradient-to-r from-amber-700 to-yellow-600' 
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-300'
                }`}
                style={{ fontFamily: "'Bodoni Moda', serif" }}
              >
                {formatTime(timeLeft)}
              </span>
              <span className={`text-sm mt-2 ${lightTheme ? 'text-amber-600/70' : 'text-yellow-400/70'}`}>
                {isBreak ? 'Break' : 'Focus'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/50 rounded-lg font-semibold transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-6 py-3 border rounded-lg font-semibold transition-all ${
              lightTheme 
                ? 'bg-white/80 border-amber-300 hover:bg-amber-100 hover:border-amber-400 text-amber-700' 
                : 'bg-gray-700/80 border-yellow-500/30 hover:bg-gray-600 hover:border-yellow-500/50 text-yellow-300'
            }`}
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </button>
          <button
            onClick={handleToggleBreak}
            className={`flex items-center gap-2 px-6 py-3 border rounded-lg font-semibold transition-all ${
              lightTheme 
                ? 'bg-white/80 border-amber-300 hover:bg-amber-100 hover:border-amber-400 text-amber-700' 
                : 'bg-gray-700/80 border-yellow-500/30 hover:bg-gray-600 hover:border-yellow-500/50 text-yellow-300'
            }`}
          >
            <Coffee className="h-5 w-5" />
            {isBreak ? 'Focus' : 'Break'}
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          {/* Focus Duration */}
          <div className={`rounded-lg p-4 border ${
            lightTheme 
              ? 'bg-white/60 border-amber-200/50' 
              : 'bg-gray-700/60 border-yellow-500/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-semibold ${lightTheme ? 'text-amber-700' : 'text-yellow-300'}`}>
                Focus Duration
              </label>
              <span 
                className={`text-xl font-bold bg-clip-text text-transparent ${
                  lightTheme 
                    ? 'bg-gradient-to-r from-amber-700 to-yellow-600' 
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-300'
                }`}
                style={{ fontFamily: "'Bodoni Moda', serif" }}
              >
                {focusMinutes} min
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={focusMinutes}
              onChange={(e) => handleFocusTimeChange(parseInt(e.target.value))}
              disabled={isRunning}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider ${
                lightTheme ? 'bg-amber-200' : 'bg-gray-600'
              }`}
            />
          </div>

          {/* Break Duration */}
          <div className={`rounded-lg p-4 border ${
            lightTheme 
              ? 'bg-white/60 border-amber-200/50' 
              : 'bg-gray-700/60 border-yellow-500/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-semibold ${lightTheme ? 'text-amber-700' : 'text-yellow-300'}`}>
                Break Duration
              </label>
              <div className="flex gap-2">
                {[5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setBreakMinutes(mins);
                      if (isBreak && !isRunning) {
                        setTimeLeft(mins * 60);
                      }
                    }}
                    disabled={isRunning}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                      breakMinutes === mins
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-400/40'
                        : lightTheme
                          ? 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'bg-gray-600 border border-yellow-500/30 text-yellow-300 hover:bg-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
