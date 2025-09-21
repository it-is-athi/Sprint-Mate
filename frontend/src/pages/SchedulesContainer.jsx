import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SchedulesPage from '../pages/SchedulesPage';
import api from '../api/axios';

function SchedulesContainer() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) {
      console.log('No user found, skipping schedule fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching schedules for user:', user._id);
      const response = await api.get('/schedules/user-schedules');
      console.log('Schedules response:', response.data);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      }
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleClick = (schedule) => {
    navigate(`/dashboard/schedules/tasks/${schedule._id}`);
  };

  const handleCreateClick = () => {
    // TODO: Navigate to create schedule page or show modal
    alert('Create schedule functionality coming soon!');
  };

  return (
    <SchedulesPage 
      schedules={schedules}
      loading={loading}
      onScheduleClick={handleScheduleClick}
      onCreateClick={handleCreateClick}
    />
  );
}

export default SchedulesContainer;