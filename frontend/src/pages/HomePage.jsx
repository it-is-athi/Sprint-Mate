import React from 'react';
import { Clock, CheckCircle, TrendingUp } from 'lucide-react';

function HomePage({ todaysTasks, updateTaskStatus, user }) {
  const completedTasks = todaysTasks?.filter(task => task.status === 'completed') || [];
  const pendingTasks = todaysTasks?.filter(task => task.status !== 'completed') || [];
  const completionRate = todaysTasks?.length > 0 ? Math.round((completedTasks.length / todaysTasks.length) * 100) : 0;

  const getTaskStatus = (task) => {
    if (task.status === 'completed') {
      return {
        label: 'Completed',
        color: 'bg-green-500/20 text-green-400 border-green-500/30'
      };
    }
    
    const today = new Date();
    const dueDate = new Date(task.due_date || task.date);
    const isOverdue = dueDate < today && task.status !== 'completed';
    const isToday = dueDate.toDateString() === today.toDateString();
    
    if (isOverdue) {
      return {
        label: 'Overdue',
        color: 'bg-red-500/20 text-red-400 border-red-500/30'
      };
    } else if (isToday) {
      return {
        label: 'Due Today',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      };
    } else {
      return {
        label: 'Upcoming',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-yellow-600/10 to-amber-600/10 rounded-xl p-6 border border-yellow-600/30">
        <h2 className="text-2xl font-bold text-white mb-2">Good day, {user?.name || 'User'}! 👋</h2>
        <p className="text-gray-300">Ready to tackle your goals today? Let's make it productive!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <div className="bg-gray-900 rounded-xl p-6 border border-yellow-600/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Today's Progress</h3>
            <TrendingUp className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-2xl font-bold text-yellow-400">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {completedTasks.length} of {todaysTasks?.length || 0} tasks completed
            </p>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-gray-900 rounded-xl p-6 border border-green-600/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Completed</h3>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">{completedTasks.length}</div>
          <p className="text-sm text-gray-400">Tasks finished today</p>
        </div>

        {/* Pending Tasks */}
        <div className="bg-gray-900 rounded-xl p-6 border border-orange-600/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Pending</h3>
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-2">{pendingTasks.length}</div>
          <p className="text-sm text-gray-400">Tasks remaining</p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-gray-900 rounded-xl p-6 border border-yellow-600/30">
        <h3 className="text-xl font-semibold text-white mb-6">Today's Tasks</h3>
        
        {!todaysTasks || todaysTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No tasks scheduled for today</p>
            <p className="text-gray-500 text-sm">Enjoy your free time or plan some new tasks!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {todaysTasks.map((task) => {
              const taskStatus = getTaskStatus(task);
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in-progress' || task.status === 'in_progress';
              
              return (
                <div
                  key={task._id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-gray-800 border-gray-700 hover:border-yellow-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                        {task.task_title || task.name}
                      </h4>
                      <p className={`text-sm mb-2 ${isCompleted ? 'text-green-400/70' : 'text-gray-400'}`}>
                        {task.task_description || task.description}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${taskStatus.color}`}>
                        {taskStatus.label}
                      </span>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {!isCompleted && (
                        <>
                          {!isInProgress && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'in-progress')}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 text-sm font-medium"
                            >
                              Start
                            </button>
                          )}
                          
                          {isInProgress && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'completed')}
                              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 text-sm font-medium"
                            >
                              Complete
                            </button>
                          )}
                        </>
                      )}
                      
                      {isCompleted && (
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium text-center">
                          ✅ Done
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
