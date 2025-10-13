import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './ui/dropdown-menu';

function formatDateKey(date) {
  // YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

const WeekCalendar = ({ todaysTasks = [], getTasksForDate = () => [] }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const lightTheme = theme === 'light';
  
  // Open state for dropdowns by date key
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  const getWeekDates = startDate => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      dates.push({
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: checkDate.getTime() === today.getTime(),
      });
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };
  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // For each date: open/close its tasks dropdown
  const toggleDropdownForDate = date => {
    const key = formatDateKey(date);
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const closeDropdownForDate = date => {
    const key = formatDateKey(date);
    setOpenDropdowns(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className={`w-full mx-auto border-2 shadow-xl rounded-2xl ${
      lightTheme 
        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-amber-200/50' 
        : 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border-yellow-500/30'
    }`}>
      <div className="p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent ${
              lightTheme 
                ? 'bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-600' 
                : 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500'
            }`} style={{ fontFamily: "'Bodoni Moda', serif" }}>
              Week Calendar
            </h2>
            <p className={`text-xs mt-1 ${lightTheme ? 'text-amber-700/70' : 'text-yellow-300/70'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>
              {weekDates[0].month} {weekDates[0].dayNumber} - {weekDates[6].month} {weekDates[6].dayNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevWeek}
              className={`border rounded-lg p-2 transition ${
                lightTheme 
                  ? 'bg-white/80 border-amber-300 hover:bg-amber-100 hover:border-amber-400 text-amber-700' 
                  : 'bg-gray-700/80 border-yellow-500/30 hover:bg-gray-600 hover:border-yellow-500/50 text-yellow-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className={`border rounded-lg p-2 transition ${
                lightTheme 
                  ? 'bg-white/80 border-amber-300 hover:bg-amber-100 hover:border-amber-400 text-amber-700' 
                  : 'bg-gray-700/80 border-yellow-500/30 hover:bg-gray-600 hover:border-yellow-500/50 text-yellow-300'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Week Days With Task Dropdown Menu */}
        <div className="grid grid-cols-7 gap-2 md:gap-3 w-full">
          {weekDates.map((dateInfo, idx) => {
            const dateKey = formatDateKey(dateInfo.date);
            const open = !!openDropdowns[dateKey];
            const tasksForDay = getTasksForDate(dateInfo.date);
            return (
              <DropdownMenu key={idx} open={open} onOpenChange={val => setOpenDropdowns(prev => ({ ...prev, [dateKey]: val }))}>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={() => toggleDropdownForDate(dateInfo.date)}
                    className={`relative w-full flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 ease-in-out
                      ${dateInfo.isToday
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/50 ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-50'
                        : open
                        ? lightTheme
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-400/40'
                          : 'bg-gradient-to-br from-yellow-600 to-amber-500 text-white shadow-md shadow-yellow-600/40'
                        : lightTheme
                          ? 'bg-white/70 hover:bg-white hover:shadow-md text-amber-900 border border-amber-200/50'
                          : 'bg-gray-700/70 hover:bg-gray-600 hover:shadow-md text-yellow-200 border border-yellow-500/30'
                    } hover:scale-105 active:scale-95`}
                  >
                    {dateInfo.isToday && (
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full border-2 border-white shadow-sm animate-pulse" />
                    )}
                    <span className={`text-xs font-semibold mb-1 ${dateInfo.isToday || open ? 'text-white/90' : lightTheme ? 'text-amber-600' : 'text-yellow-400'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>{dateInfo.day}</span>
                    <span className={`text-xl md:text-2xl font-bold ${dateInfo.isToday || open ? 'text-white' : lightTheme ? 'text-amber-800' : 'text-yellow-200'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>{dateInfo.dayNumber}</span>
                    <span className={`text-xs mt-1 ${dateInfo.isToday || open ? 'text-white/80' : lightTheme ? 'text-amber-600/70' : 'text-yellow-300/70'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>{dateInfo.month}</span>
                    {tasksForDay.length > 0 && <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-blink" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="bottom" 
                  align="center"
                  className={`${lightTheme 
                    ? 'border-amber-200/50 bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/50 text-gray-800 shadow-2xl shadow-amber-500/20' 
                    : 'border-yellow-500/30 bg-gradient-to-br from-gray-800 via-gray-900/95 to-black text-yellow-200 shadow-2xl shadow-yellow-500/20'
                  }`}
                >
                  {tasksForDay.length === 0 ? (
                    <DropdownMenuItem 
                      disabled 
                      className={`${lightTheme ? 'text-gray-500' : 'text-gray-400'} text-center py-3`}
                      style={{ fontFamily: "'Bodoni Moda', serif" }}
                    >
                      No tasks for this day
                    </DropdownMenuItem>
                  ) : (
                    tasksForDay.map(task => (
                      <DropdownMenuItem 
                        key={task._id} 
                        className={`flex flex-col items-start gap-1 p-3 hover:bg-gradient-to-r hover:from-amber-100/50 hover:to-yellow-100/50 focus:bg-gradient-to-r focus:from-amber-100/50 focus:to-yellow-100/50 ${
                          lightTheme 
                            ? 'hover:text-amber-800 focus:text-amber-800' 
                            : 'hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-amber-500/10 focus:bg-gradient-to-r focus:from-yellow-500/10 focus:to-amber-500/10 hover:text-yellow-200 focus:text-yellow-200'
                        }`}
                        onClick={() => task.schedule_id && navigate(`/dashboard/schedules/tasks/${task.schedule_id._id}`)}
                      >
                        <span className={`font-semibold text-sm leading-tight ${lightTheme ? 'text-gray-800' : 'text-yellow-200'}`} style={{ fontFamily: "'Bodoni Moda', serif" }}>
                          {task.title}
                        </span>
                        {task.schedule_id?.schedule_title && (
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            lightTheme 
                              ? 'bg-yellow-200/50 text-yellow-800 border-yellow-300/50' 
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`} style={{ fontFamily: "'Bodoni Moda', serif" }}>
                            {task.schedule_id.schedule_title}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekCalendar;
