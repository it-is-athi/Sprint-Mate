import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function to determine task status
const getTaskStatus = (task) => {
  if (task.status === 'completed') {
    return { label: 'Completed', color: 'bg-green-600 text-white' };
  }
  
  const today = new Date();
  const taskDate = new Date(task.date);
  
  // Normalize dates to compare only the date part (ignore time)
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  const isOverdue = taskDateOnly < todayDateOnly && task.status !== 'completed';
  const isToday = taskDateOnly.getTime() === todayDateOnly.getTime();
  const isUpcoming = taskDateOnly > todayDateOnly;
  
  if (isOverdue) {
    return { label: 'Overdue', color: 'bg-red-600 text-white' };
  } else if (isToday && task.status !== 'completed') {
    return { label: 'Pending', color: 'bg-yellow-600 text-white' };
  } else if (isToday && task.status === 'completed') {
    return { label: 'Completed Today', color: 'bg-green-600 text-white' };
  } else if (isUpcoming) {
    return { label: 'Upcoming', color: 'bg-blue-600 text-white' };
  } else if (task.status === 'in-progress' || task.status === 'in_progress') {
    return { label: 'In Progress', color: 'bg-blue-600 text-white' };
  } else {
    return { label: 'Pending', color: 'bg-yellow-600 text-white' };
  }
};

function TasksPage({ schedule, tasks, loading, updateTaskStatus, onRescheduleClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
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
  
  // Get the visible tasks (full window sliding)
  const startIndex = currentIndex * cardsToShow;
  const endIndex = startIndex + cardsToShow;
  const visibleTasks = tasks.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Schedule Info */}
      <div className="bg-gray-900 rounded-xl p-6 border border-yellow-600/30">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">{schedule.schedule_title}</h3>
        <p className="text-gray-400">{schedule.description}</p>
        <div className="flex items-center space-x-4 mt-4">
          <span className="text-sm text-gray-500">
            <strong>Pattern:</strong> {schedule.repeat_pattern}
          </span>
          <span className="text-sm text-gray-500">
            <strong>Status:</strong> {schedule.status}
          </span>
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
            <h3 className="text-lg font-semibold text-white">
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
                  className="bg-gray-800/90 hover:bg-gray-700 border border-yellow-600/50 rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-xl"
                >
                  <ChevronLeft className="w-5 h-5 text-yellow-400" />
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
                    <div key={task._id} className="min-w-0">
                      <div 
                        className="bg-gray-900 rounded-xl p-4 border border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 h-full cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                      >
                        <h4 className="font-semibold text-white mb-2 text-center text-sm">{task.task_title || task.name}</h4>
                        <p className="text-gray-400 text-xs mb-3 text-center line-clamp-2">{task.task_description || task.description}</p>
                        
                        <div className="flex flex-col items-center space-y-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatus.color}`}>
                            {taskStatus.label}
                          </span>
                          <span className="text-gray-500 text-xs">
                            Due: {new Date(task.due_date || task.date).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Task Action Buttons - Compact for better fit */}
                        <div className="space-y-2">
                          {!isCompleted && (
                            <>
                              {!isInProgress && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTaskStatus(task._id, 'in-progress');
                                  }}
                                  className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 text-xs font-medium shadow-lg transform hover:scale-105"
                                >
                                  🚀 Start
                                </button>
                              )}
                              
                              {isInProgress && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTaskStatus(task._id, 'completed');
                                  }}
                                  className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 text-xs font-medium shadow-lg transform hover:scale-105"
                                >
                                  ✅ Complete
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRescheduleClick(task);
                                }}
                                className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-400 hover:to-amber-400 transition-all duration-200 text-xs font-medium shadow-lg transform hover:scale-105"
                              >
                                📅 Reschedule
                              </button>
                            </>
                          )}
                          
                          {isCompleted && (
                            <div className="text-center">
                              <span className="w-full inline-block px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-xs font-medium">
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
                  className="bg-gray-800/90 hover:bg-gray-700 border border-yellow-600/50 rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-xl"
                >
                  <ChevronRight className="w-5 h-5 text-yellow-400" />
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
                      ? 'bg-yellow-500 scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
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
          <div className="bg-gray-900 p-6 rounded-xl border border-yellow-600/30 max-w-2xl w-[90vw] max-h-[80vh] overflow-auto">
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
              
              {/* Task Actions */}
              {selectedTask.status !== 'completed' && (
                <div className="flex gap-3 pt-2">
                  {selectedTask.status !== 'in-progress' && selectedTask.status !== 'in_progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(selectedTask._id, 'in-progress');
                        setShowTaskModal(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium"
                    >
                      🚀 Start Task
                    </button>
                  )}
                  
                  {(selectedTask.status === 'in-progress' || selectedTask.status === 'in_progress') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(selectedTask._id, 'completed');
                        setShowTaskModal(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 font-medium"
                    >
                      ✅ Complete Task
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTaskModal(false);
                      onRescheduleClick(selectedTask);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-400 hover:to-amber-400 transition-all duration-200 font-medium"
                  >
                    📅 Reschedule
                  </button>
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