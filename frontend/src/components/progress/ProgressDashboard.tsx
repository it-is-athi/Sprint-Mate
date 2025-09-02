import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Clock, Award, BarChart3 } from 'lucide-react';
import { scheduleAPI } from '../../services/scheduleAPI';

interface ProgressStats {
  totalSchedules: number;
  activeSchedules: number;
  completedSchedules: number;
  totalTasks: number;
  completedTasks: number;
  weeklyProgress: number;
  monthlyProgress: number;
  streak: number;
}

const ProgressDashboard: React.FC = () => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await scheduleAPI.getUserProgress();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      // Mock data for demonstration
      setStats({
        totalSchedules: 3,
        activeSchedules: 2,
        completedSchedules: 1,
        totalTasks: 45,
        completedTasks: 28,
        weeklyProgress: 75,
        monthlyProgress: 62,
        streak: 7,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Progress</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your learning journey and achievements</p>
        </div>
        <button
          onClick={fetchProgressData}
          className="btn-secondary"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-primary-600">{Math.round(completionRate)}%</p>
              <p className="text-xs text-gray-500">{stats.completedTasks} of {stats.totalTasks} tasks</p>
            </div>
            <Target className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Schedules</p>
              <p className="text-3xl font-bold text-blue-600">{stats.activeSchedules}</p>
              <p className="text-xs text-gray-500">{stats.totalSchedules} total schedules</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">{stats.streak}</p>
              <p className="text-xs text-gray-500">days in a row</p>
            </div>
            <Award className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Progress</p>
              <p className="text-3xl font-bold text-green-600">{stats.weeklyProgress}%</p>
              <p className="text-xs text-gray-500">this week</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Tasks Completed</span>
                <span className="font-medium">{stats.completedTasks}/{stats.totalTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Weekly Goal</span>
                <span className="font-medium">{stats.weeklyProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.weeklyProgress}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Monthly Goal</span>
                <span className="font-medium">{stats.monthlyProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.monthlyProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Completed</span>
              </div>
              <span className="text-green-700 font-bold">{stats.completedSchedules}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Active</span>
              </div>
              <span className="text-blue-700 font-bold">{stats.activeSchedules}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Total</span>
              </div>
              <span className="text-gray-700 font-bold">{stats.totalSchedules}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Week Warrior</p>
              <p className="text-sm text-yellow-700">Completed 7 days in a row</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">Goal Crusher</p>
              <p className="text-sm text-purple-700">Exceeded weekly target</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Progress Master</p>
              <p className="text-sm text-green-700">75% completion rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;