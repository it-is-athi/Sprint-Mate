import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import HomePage from '../pages/HomePage';
import api from '../api/axios';

function HomeContainer() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [todaysTasks, setTodaysTasks] = useState([]);

  useEffect(() => {
    fetchTodaysTasks();
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

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // Refresh today's tasks after update
      await fetchTodaysTasks();
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
      updateTaskStatus={updateTaskStatus}
      user={user}
    />
  );
}

export default HomeContainer;