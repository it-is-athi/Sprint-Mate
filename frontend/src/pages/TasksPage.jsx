import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

// Helper function to determine task status
const getTaskStatus = (task) => {
  // First priority: Check actual task status from database
  if (task.status === 'completed') {
    return { label: 'Completed', color: 'bg-green-600 text-white' };
  }
  
  if (task.status === 'in-progress' || task.status === 'in_progress') {
    return { label: 'In Progress', color: 'bg-blue-600 text-white' };
  }
  
  // Second priority: If status is 'pending', determine display based on date
  if (task.status === 'pending') {
    const today = new Date();
    const taskDate = new Date(task.date);
    
    // Normalize dates to compare only the date part (ignore time)
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    
    const isOverdue = taskDateOnly < todayDateOnly;
    const isToday = taskDateOnly.getTime() === todayDateOnly.getTime();
    const isUpcoming = taskDateOnly > todayDateOnly;
    
    if (isOverdue) {
      return { label: 'Overdue', color: 'bg-red-600 text-white' };
    } else if (isToday) {
      return { label: 'Pending', color: 'bg-yellow-600 text-white' };
    } else if (isUpcoming) {
      return { label: 'Upcoming', color: 'bg-blue-600 text-white' };
    }
  }
  
  // Default fallback
  return { label: 'Pending', color: 'bg-yellow-600 text-white' };
};

// Helper function to determine what status task should revert to when stopped
const getOriginalTaskStatus = (task) => {
  const today = new Date();
  const taskDate = new Date(task.date);
  
  // Normalize dates to compare only the date part (ignore time)
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  const isOverdue = taskDateOnly < todayDateOnly;
  const isToday = taskDateOnly.getTime() === todayDateOnly.getTime();
  const isUpcoming = taskDateOnly > todayDateOnly;
  
  if (isOverdue) {
    return 'overdue';
  } else if (isToday) {
    return 'pending';
  } else if (isUpcoming) {
    return 'upcoming';
  } else {
    return 'pending';
  }
};

function TasksPage({ schedule, tasks, loading, updateTaskStatus, onRescheduleClick, onCreateTaskClick, onDeleteTaskClick }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { theme } = useTheme(); // Get theme

  // Show exactly 3 cards for better spacing and arrow visibility
  const cardsToShow = 3;
  const totalWindows = Math.ceil(tasks.length / cardsToShow);
  const maxIndex = totalWindows - 1;
  
  const nextWindow = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const prevWindow = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  // Handle task card click to show full description
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleStudyWithAI = (e, task) => {
    e.stopPropagation();
    navigate('/dashboard/chat', {
      state: {
        studyTask: {
          task: task,
          scheduleName: schedule?.schedule_title || 'Unknown Schedule'
        }
      }
    });
  };
  
  // Get the visible tasks (full window sliding)
  const startIndex = currentIndex * cardsToShow;
  const endIndex = startIndex + cardsToShow;
  const visibleTasks = tasks.slice(startIndex, endIndex);

  const lightTheme = theme === 'light';
  const rootBg = lightTheme ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100' : 'bg-black';
  const cardBg = lightTheme ? 'bg-white/80' : 'bg-gray-900';
  const textColor = lightTheme ? 'text-gray-800' : 'text-white';
  const subTextColor = lightTheme ? 'text-gray-600' : 'text-gray-400';
  const borderColor = lightTheme ? 'border-yellow-300/70' : 'border-yellow-600/30';

  return (
    <div className={`space-y-6 ${rootBg}`}>
      {/* Schedule Info */}
      <div className={`${cardBg} rounded-xl p-6 border ${borderColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-xl font-semibold mb-2 ${lightTheme ? 'text-yellow-900' : 'text-yellow-400'} serif-lg`}>{schedule.schedule_title}</h3>
            <p className={subTextColor}>{schedule.description}</p>
            <div className="flex items-center space-x-4 mt-4">
              <span className={`text-sm ${lightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                <strong>Pattern:</strong> {schedule.repeat_pattern}
              </span>
              <span className={`text-sm ${lightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                <strong>Status:</strong> {schedule.status}
              </span>
            </div>
          </div>
          
          {/* Create Task Button */}
          <button
            onClick={onCreateTaskClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${lightTheme ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-gradient-to-r from-yellow-600 to-amber-600 text-black hover:from-yellow-500 hover:to-amber-500'}`}
          >
            <span className="text-lg">+</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Tasks Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-4">
          {/* Header with Full Window Info */}
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${textColor}`}>
              Tasks ({tasks.length})
            </h3>
            {totalWindows > 1 && (
              <div className="text-sm text-gray-400">
                {currentIndex + 1}/{totalWindows}
              </div>
            )}
          </div>

          {/* Full Window Sliding Carousel - Proper Space Management */}
          <div className="flex items-center space-x-4">
            {/* Left Arrow - Always visible space */}
            <div className="w-12 flex justify-center">
              {currentIndex > 0 && (
                <button
                  onClick={prevWindow}
                  className={`border rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-xl ${
                    lightTheme 
                      ? 'bg-white/90 hover:bg-white border-yellow-600/50 hover:border-yellow-700/70' 
                      : 'bg-gray-800/90 hover:bg-gray-700 border-yellow-600/50'
                  }`}
                >
                  <ChevronLeft className={`w-5 h-5 ${lightTheme ? 'text-yellow-600' : 'text-yellow-400'}`} />
                </button>
              )}
            </div>
            
            {/* Tasks Container - Smaller cards to fit with arrows */}
            <div className="flex-1 overflow-hidden rounded-xl">
              <div className="grid grid-cols-3 gap-3 transition-all duration-400 ease-out">
                {visibleTasks.map((task) => {
                  const taskStatus = getTaskStatus(task);
                  const isCompleted = task.status === 'completed';
                  const isInProgress = task.status === 'in-progress' || task.status === 'in_progress';
                  
                  return (
                    <div key={task._id} className="min-w-0 group">
                      <div 
                        className={`${cardBg} rounded-xl p-4 border ${borderColor} hover:border-yellow-500/50 transition-all duration-300 h-full cursor-pointer relative`}
                        onClick={() => handleTaskClick(task)}
                      >
                        {/* Delete Button - Top Right Corner */}
                        <button
                          onClick={(e) => onDeleteTaskClick(e, task)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:border-red-400/50 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        
                        <h4 className={`font-semibold mb-2 text-center text-sm pr-8 ${textColor} serif-lg`}>{task.task_title || task.name}</h4>
                        <p className={`${subTextColor} text-xs mb-3 text-center line-clamp-2`}>{task.task_description || task.description}</p>
                        
                        <div className="flex flex-col items-center space-y-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatus.color}`}>
                            {taskStatus.label}
                          </span>
                          <span className="text-gray-500 text-xs">
                            Due: {new Date(task.due_date || task.date).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Task Action Buttons - Glassy effect with side-by-side layout */}
                        <div className="space-y-2">
                          {/* Study with AI Button - Always visible */}
                          <button
                            onClick={(e) => handleStudyWithAI(e, task)}
                            className={`w-full px-3 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg hover:bg-purple-500/30 hover:border-purple-400/50 transition-all duration-200 text-xs font-medium flex items-center justify-center gap-2 ${
                              lightTheme ? 'text-purple-700 hover:text-purple-800' : 'text-purple-100'
                            }`}
                          >
                            🧠 Study with AI
                          </button>
                          
                          {!isCompleted && (
                            <>
                              {!isInProgress && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(task._id, 'in-progress');
                                    }}
                                    className={`flex-1 px-2 py-1.5 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200 text-xs font-medium ${
                                      lightTheme ? 'text-green-700 hover:text-green-800' : 'text-green-100'
                                    }`}
                                  >
                                    🚀 Start
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRescheduleClick(task);
                                    }}
                                    className={`flex-1 px-2 py-1.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-200 text-xs font-medium ${
                                      lightTheme ? 'text-blue-700 hover:text-blue-800' : 'text-blue-100'
                                    }`}
                                  >
                                    📅 Reschedule
                                  </button>
                                </div>
                              )}
                              
                              {isInProgress && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(task._id, 'completed');
                                    }}
                                    className={`flex-1 px-2 py-1.5 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200 text-xs font-medium ${
                                      lightTheme ? 'text-green-700 hover:text-green-800' : 'text-green-100'
                                    }`}
                                  >
                                    ✅ Complete
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const originalStatus = getOriginalTaskStatus(task);
                                      updateTaskStatus(task._id, originalStatus);
                                    }}
                                    className={`flex-1 px-2 py-1.5 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-200 text-xs font-medium ${
                                      lightTheme ? 'text-red-700 hover:text-red-800' : 'text-red-100'
                                    }`}
                                  >
                                    ⏹️ Stop
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                          
                          {isCompleted && (
                            <div className="text-center">
                              <span className={`w-full inline-block px-3 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg text-xs font-medium ${
                                lightTheme ? 'text-green-700' : 'text-green-100'
                              }`}>
                                ✅ Completed
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Fill empty slots if less than 3 tasks in current window */}
                {visibleTasks.length < cardsToShow && 
                  Array.from({ length: cardsToShow - visibleTasks.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="min-w-0">
                      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 h-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm">No more tasks</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* Right Arrow - Always visible space */}
            <div className="w-12 flex justify-center">
              {currentIndex < maxIndex && (
                <button
                  onClick={nextWindow}
                  className={`border rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-xl ${
                    lightTheme 
                      ? 'bg-white/90 hover:bg-white border-yellow-600/50 hover:border-yellow-700/70' 
                      : 'bg-gray-800/90 hover:bg-gray-700 border-yellow-600/50'
                  }`}
                >
                  <ChevronRight className={`w-5 h-5 ${lightTheme ? 'text-yellow-600' : 'text-yellow-400'}`} />
                </button>
              )}
            </div>
          </div>

          {/* Window Indicators */}
          {totalWindows > 1 && (
            <div className="flex justify-center space-x-3 mt-6">
              {Array.from({ length: totalWindows }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentIndex === index
                      ? (lightTheme ? 'bg-yellow-600 scale-125' : 'bg-yellow-500 scale-125')
                      : (lightTheme ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-500')
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No tasks found for this schedule.</p>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} p-6 rounded-xl border ${borderColor} max-w-2xl w-[90vw] max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white pr-4">
                {selectedTask.task_title || selectedTask.name}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Task Status and Due Date */}
              <div className="flex flex-wrap gap-3 items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTaskStatus(selectedTask).color}`}>
                  {getTaskStatus(selectedTask).label}
                </span>
                <span className="text-gray-400 text-sm">
                  Due: {new Date(selectedTask.due_date || selectedTask.date).toLocaleDateString()}
                </span>
              </div>
              
              {/* Full Task Description */}
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Description</h4>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.task_description || selectedTask.description || 'No description available.'}
                  </p>
                </div>
              </div>
              
              {/* Task Actions - Glassy effect with side-by-side layout */}
              {selectedTask.status !== 'completed' && (
                <div className="flex gap-3 pt-2">
                  {selectedTask.status !== 'in-progress' && selectedTask.status !== 'in_progress' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(selectedTask._id, 'in-progress');
                          setShowTaskModal(false);
                        }}
                        className={`flex-1 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200 font-medium ${
                          lightTheme ? 'text-green-700 hover:text-green-800' : 'text-green-100'
                        }`}
                      >
                        🚀 Start Task
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTaskModal(false);
                          onRescheduleClick(selectedTask);
                        }}
                        className={`flex-1 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-200 font-medium ${
                          lightTheme ? 'text-blue-700 hover:text-blue-800' : 'text-blue-100'
                        }`}
                      >
                        📅 Reschedule
                      </button>
                    </>
                  )}
                  
                  {(selectedTask.status === 'in-progress' || selectedTask.status === 'in_progress') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(selectedTask._id, 'completed');
                          setShowTaskModal(false);
                        }}
                        className={`flex-1 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200 font-medium ${
                          lightTheme ? 'text-green-700 hover:text-green-800' : 'text-green-100'
                        }`}
                      >
                        ✅ Complete Task
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const originalStatus = getOriginalTaskStatus(selectedTask);
                          updateTaskStatus(selectedTask._id, originalStatus);
                          setShowTaskModal(false);
                        }}
                        className={`flex-1 px-4 py-2 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-200 font-medium ${
                          lightTheme ? 'text-red-700 hover:text-red-800' : 'text-red-100'
                        }`}
                      >
                        ⏹️ Stop Task
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;