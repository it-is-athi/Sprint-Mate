import React, { useState, useEffect, useContext } from 'react';
import ProgressPage from './ProgressPage';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

function ProgressContainer() {
  const { user } = useContext(AuthContext);
  const [progressData, setProgressData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    consistencyPercentage: 0,
    currentStreak: 0,
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch progress data
  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks to calculate progress using the correct endpoint
      const tasksResponse = await api.get('/tasks/user-tasks');
      const tasks = tasksResponse.data || [];

      // Calculate total and completed tasks
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;

      // Calculate consistency percentage
      const consistencyPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

      // Calculate current streak (simplified logic)
      const currentStreak = calculateCurrentStreak(tasks);

      // Generate weekly progress data for the chart
      const weeklyProgress = generateWeeklyProgressData(tasks);

      setProgressData({
        totalTasks,
        completedTasks,
        consistencyPercentage,
        currentStreak,
        weeklyProgress
      });

    } catch (err) {
      console.error('Error fetching progress data:', err);
      // If API fails, show empty data instead of mock data
      setProgressData({
        totalTasks: 0,
        completedTasks: 0,
        consistencyPercentage: 0,
        currentStreak: 0,
        weeklyProgress: []
      });
      setError(err.response?.data?.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate current streak of consecutive days with completed tasks
  const calculateCurrentStreak = (tasks) => {
    // Get tasks from the last 30 days and group by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTasks = tasks.filter(task => 
      new Date(task.date || task.createdAt) >= thirtyDaysAgo
    );

    // Group tasks by date
    const tasksByDate = {};
    recentTasks.forEach(task => {
      const dateKey = new Date(task.date || task.createdAt).toISOString().split('T')[0];
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

    // Calculate streak from today backwards
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      
      const dayTasks = tasksByDate[dateKey] || [];
      const hasCompletedTask = dayTasks.some(task => task.status === 'completed');
      
      if (hasCompletedTask) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  };

  // Generate weekly progress data for the chart
  const generateWeeklyProgressData = (tasks) => {
    const weeklyData = [];
    const today = new Date();
    
    // Get data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      // Filter tasks for this date
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date || task.createdAt).toISOString().split('T')[0];
        return taskDate === dateKey;
      });
      
      const completedCount = dayTasks.filter(task => task.status === 'completed').length;
      
      weeklyData.push({
        date: dateKey,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: completedCount
      });
    }

    return weeklyData;
  };

  // Fetch data on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  // Refresh data every minute to keep it current
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchProgressData();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchProgressData}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <ProgressPage progressData={progressData} />;
}

export default ProgressContainer;