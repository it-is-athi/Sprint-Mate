import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import HomePage from '../pages/HomePage';
import api from '../api/axios';

function HomeContainer() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);

  useEffect(() => {
    fetchTodaysTasks();
    fetchWeeklyTasks();
  }, [user]);

  const fetchTodaysTasks = async () => {
    if (!user) {
      console.log('No user found, skipping tasks fetch');
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching today\'s tasks for user:', user._id, 'date:', today);
      const response = await api.get(`/tasks/today?date=${today}`);
      console.log('Today\'s tasks response:', response.data);
      setTodaysTasks(response.data);
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      }
      setTodaysTasks([]);
    }
  };

  const fetchWeeklyTasks = async () => {
    if (!user) {
      return;
    }
    
    try {
      console.log('Fetching all user tasks for calendar');
      const response = await api.get('/tasks/user-tasks');
      console.log('User tasks response:', response.data);
      
      // Get all user tasks - let the WeekCalendar component filter by date as needed
      // This ensures dots appear for ALL days that have tasks, regardless of date range
      const weeklyTasks = response.data; // Show all tasks, no date filtering
      
      console.log('All user tasks for calendar (showing dots for all days with tasks):', weeklyTasks);
      console.log(`Total tasks fetched: ${weeklyTasks.length}`);
      
      // Debug: Show dates of all tasks
      const taskDates = weeklyTasks.map(task => new Date(task.date).toISOString().split('T')[0]);
      console.log('Task dates:', taskDates);
      
      setWeeklyTasks(weeklyTasks);
    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      }
      setWeeklyTasks([]);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // Refresh both today's tasks and weekly tasks after update
      await fetchTodaysTasks();
      await fetchWeeklyTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      }
      alert('Failed to update task status. Please try again.');
    }
  };

  return (
    <HomePage 
      todaysTasks={todaysTasks}
      weeklyTasks={weeklyTasks}
      updateTaskStatus={updateTaskStatus}
      user={user}
    />
  );
}

export default HomeContainer;