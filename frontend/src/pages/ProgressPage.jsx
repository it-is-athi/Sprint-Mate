import React, { useEffect, useRef } from 'react';
import { TrendingUp, Target, Calendar, Trophy, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

function ProgressPage({ 
  progressData = { 
    totalTasks: 0, 
    completedTasks: 0, 
    consistencyPercentage: 0,
    weeklyProgress: []
  } 
}) {
  const { theme } = useTheme();
  const chartRef = useRef(null);
  const progressRef = useRef(null);

  const lightTheme = theme === 'light';
  const rootBg = lightTheme
    ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 text-gray-900'
    : 'bg-black text-white';

  // Calculate progress percentage
  const progressPercentage = progressData.totalTasks > 0 
    ? Math.round((progressData.completedTasks / progressData.totalTasks) * 100) 
    : 0;

  // Animation effects
  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
    }

    if (chartRef.current) {
      gsap.fromTo(chartRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3 }
      );
    }
  }, []);

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 120 }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={lightTheme ? "#f3f4f6" : "#374151"}
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={lightTheme ? "#eab308" : "#fbbf24"}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: lightTheme ? 'none' : 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
              {percentage}%
            </div>
            <div className={`text-xs ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
              Consistency
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Line Chart Component
  const LineChart = ({ data = [] }) => {
    const maxValue = Math.max(...data.map(d => d.value), 10);
    const chartWidth = 800;
    const chartHeight = 300;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (point.value / maxValue) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full h-80 flex items-center justify-center">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={`grid-${i}`}
              x1="0"
              y1={i * (chartHeight / 4)}
              x2={chartWidth}
              y2={i * (chartHeight / 4)}
              stroke={lightTheme ? "#e5e7eb" : "#374151"}
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Vertical grid lines */}
          {data.map((_, index) => (
            <line
              key={`vgrid-${index}`}
              x1={(index / (data.length - 1)) * chartWidth}
              y1="0"
              x2={(index / (data.length - 1)) * chartWidth}
              y2={chartHeight}
              stroke={lightTheme ? "#e5e7eb" : "#374151"}
              strokeWidth="1"
              opacity="0.2"
            />
          ))}
          
          {/* Chart line */}
          {data.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={lightTheme ? "#eab308" : "#fbbf24"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: lightTheme ? 'none' : 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))'
              }}
            />
          )}
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = chartHeight - (point.value / maxValue) * chartHeight;
            return (
              <circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r="6"
                fill={lightTheme ? "#eab308" : "#fbbf24"}
                stroke={lightTheme ? "#ffffff" : "#000000"}
                strokeWidth="3"
                style={{
                  filter: lightTheme ? 'none' : 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                }}
              />
            );
          })}
          
          {/* X-axis labels */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            return (
              <text
                key={`label-${index}`}
                x={x}
                y={chartHeight + 25}
                textAnchor="middle"
                className={`text-sm ${lightTheme ? 'fill-gray-600' : 'fill-gray-400'}`}
                style={{ fontFamily: "'Bodoni Moda', serif" }}
              >
                {point.day}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen space-y-6 p-6 overflow-x-hidden ${rootBg}`}
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
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        </div>
      )}

      {/* Stats Cards Row with Progress Circle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Tasks Completed */}
        <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
          lightTheme 
            ? 'bg-white/70 border-gray-200 hover:shadow-lg' 
            : 'bg-black/40 border-yellow-500/20 hover:shadow-yellow-500/10 hover:shadow-lg'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                Tasks Completed
              </p>
              <p className={`text-3xl font-bold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
                {progressData.completedTasks}
              </p>
              <p className={`text-sm ${lightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                of {progressData.totalTasks} total
              </p>
            </div>
            <div className={`p-3 rounded-full ${lightTheme ? 'bg-yellow-100' : 'bg-yellow-500/20'}`}>
              <Trophy className={`w-6 h-6 ${lightTheme ? 'text-yellow-600' : 'text-yellow-400'}`} />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
          lightTheme 
            ? 'bg-white/70 border-gray-200 hover:shadow-lg' 
            : 'bg-black/40 border-yellow-500/20 hover:shadow-yellow-500/10 hover:shadow-lg'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                Current Streak
              </p>
              <p className={`text-3xl font-bold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
                {progressData.currentStreak || 0}
              </p>
              <p className={`text-sm mt-1 ${lightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                days
              </p>
            </div>
            <div className={`p-3 rounded-full ${lightTheme ? 'bg-yellow-100' : 'bg-yellow-500/20'}`}>
              <Calendar className={`w-6 h-6 ${lightTheme ? 'text-yellow-600' : 'text-yellow-400'}`} />
            </div>
          </div>
        </div>

        {/* Progress Circle */}
        <div ref={progressRef} className="flex items-center justify-center">
          <CircularProgress percentage={progressData.consistencyPercentage} size={160} />
        </div>
      </div>

      {/* Progress Chart - Bottom - Expanded */}
      <div ref={chartRef} className={`p-8 rounded-2xl border backdrop-blur-sm min-h-[400px] ${
        lightTheme 
          ? 'bg-white/70 border-gray-200' 
          : 'bg-black/40 border-yellow-500/20'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${lightTheme ? 'bg-yellow-100' : 'bg-yellow-500/20'}`}>
            <BarChart3 className={`w-5 h-5 ${lightTheme ? 'text-yellow-600' : 'text-yellow-400'}`} />
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>
              Weekly Progress
            </h3>
            <p className={`text-sm ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
              Track your daily task completion over time
            </p>
          </div>
        </div>
        
        <LineChart data={progressData.weeklyProgress} />
        
        {/* Chart Legend */}
        <div className="flex items-center justify-center mt-8 space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${lightTheme ? 'bg-yellow-500' : 'bg-yellow-400'}`}></div>
            <span className={`text-sm ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
              Tasks Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;