import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TasksPage from '../pages/TasksPage';
import api from '../api/axios';

function TasksContainer() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [schedule, setSchedule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [taskToReschedule, setTaskToReschedule] = useState(null);

  useEffect(() => {
    if (scheduleId && user) {
      fetchScheduleDetails();
      fetchScheduleTasks();
    }
  }, [scheduleId, user]);

  const fetchScheduleDetails = async () => {
    if (!user) {
      console.log('No user found, skipping schedule details fetch');
      return;
    }
    
    try {
      console.log('Fetching schedule details for:', scheduleId, 'user:', user._id);
      const response = await api.get(`/schedules/${scheduleId}`);
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching schedule details:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      }
    }
  };

  const fetchScheduleTasks = async () => {
    if (!user) {
      console.log('No user found, skipping tasks fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching tasks for schedule:', scheduleId, 'user:', user._id);
      const response = await api.get(`/tasks/schedule/${scheduleId}`);
      console.log('Tasks response:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching schedule tasks:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // Refresh tasks after update
      await fetchScheduleTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleRescheduleClick = (task) => {
    setTaskToReschedule(task);
    setShowRescheduleModal(true);
  };

  const rescheduleTask = async (taskId, newDate) => {
    try {
      setLoading(true);
      await api.patch(`/tasks/${taskId}/reschedule`, { newDate });
      // Refresh tasks after rescheduling
      await fetchScheduleTasks();
      setShowRescheduleModal(false);
      setTaskToReschedule(null);
    } catch (error) {
      console.error('Error rescheduling task:', error);
      alert('Failed to reschedule task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no schedule is loaded yet, show loading
  if (!schedule) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <>
      <TasksPage 
        schedule={schedule}
        tasks={tasks}
        loading={loading}
        updateTaskStatus={updateTaskStatus}
        onRescheduleClick={handleRescheduleClick}
      />
      
      {/* TODO: Add reschedule modal component */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-yellow-600/30">
            <h3 className="text-lg font-semibold text-white mb-4">Reschedule Task</h3>
            <p className="text-gray-400 mb-4">Reschedule functionality coming soon!</p>
            <button 
              onClick={() => setShowRescheduleModal(false)}
              className="px-4 py-2 bg-yellow-600 text-black rounded-lg hover:bg-yellow-500 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TasksContainer;