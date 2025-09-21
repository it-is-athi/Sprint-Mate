import React from 'react';
import { Calendar, Plus, ArrowLeft } from 'lucide-react';

function SchedulesPage({ schedules, loading, onScheduleClick, onCreateClick }) {
  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
            My Learning Schedules
          </h2>
          <p className="text-gray-400 mt-1">Organize and track your educational journey</p>
        </div>
        
        {/* Create Schedule Button */}
        <button
          onClick={onCreateClick}
          className="group flex items-center space-x-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-black px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Create Schedule</span>
        </button>
      </div>

      {/* Schedules Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-600/30 border-t-yellow-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-amber-500 animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          </div>
        </div>
      ) : schedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              onClick={() => onScheduleClick(schedule)}
              className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 border border-yellow-600/30 hover:border-yellow-400/70 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 transform hover:scale-[1.02] overflow-hidden"
            >
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors">{schedule.schedule_title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{schedule.description}</p>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    schedule.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    schedule.status === 'completed' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {schedule.status}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-500 text-sm font-medium capitalize">{schedule.repeat_pattern}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-500 text-xs">
                    <span>Click to view tasks</span>
                    <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${schedule.progress?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
            <Calendar className="w-12 h-12 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-300 mb-3">No schedules yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Start your learning journey by creating your first schedule. Our AI will help you break down your goals into manageable daily tasks.</p>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-black px-8 py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Schedule</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SchedulesPage;