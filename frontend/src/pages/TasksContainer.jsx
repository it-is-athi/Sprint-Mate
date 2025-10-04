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
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

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

  const handleCreateTaskClick = () => {
    setShowCreateTaskModal(true);
  };

  const handleDeleteTaskClick = (e, task) => {
    e.stopPropagation(); // Prevent task modal from opening
    setTaskToDelete(task);
    setShowDeleteTaskModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      setLoading(true);
      console.log('Deleting task:', taskToDelete._id);
      await api.delete(`/tasks/${taskToDelete._id}`);
      
      // Refresh tasks list
      await fetchScheduleTasks();
      setShowDeleteTaskModal(false);
      setTaskToDelete(null);
      alert(`Task "${taskToDelete.name || taskToDelete.task_title}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      } else {
        alert(`Failed to delete task: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteTaskModal(false);
    setTaskToDelete(null);
  };

  const createTask = async (taskData) => {
    try {
      setLoading(true);
      console.log('Creating manual task:', taskData);
      
      const response = await api.post('/tasks', {
        ...taskData,
        schedule_id: scheduleId
      });
      
      console.log('Task created:', response.data);
      
      // Refresh tasks after creation
      await fetchScheduleTasks();
      setShowCreateTaskModal(false);
      alert(`Task "${response.data.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating task:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      } else {
        alert(`Failed to create task: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const rescheduleTask = async (taskId, newDate) => {
    try {
      setLoading(true);
      console.log('Rescheduling task:', taskId, 'to date:', newDate);
      await api.patch(`/tasks/${taskId}/reschedule`, { newDate });
      
      // Refresh tasks after rescheduling
      await fetchScheduleTasks();
      setShowRescheduleModal(false);
      setTaskToReschedule(null);
      
      // Show success message
      alert('Task rescheduled successfully!');
    } catch (error) {
      console.error('Error rescheduling task:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      } else {
        alert(`Failed to reschedule task: ${error.response?.data?.message || error.message}`);
      }
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
        onCreateTaskClick={handleCreateTaskClick}
        onDeleteTaskClick={handleDeleteTaskClick}
      />
      
      {/* Reschedule Modal */}
      {showRescheduleModal && taskToReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-yellow-600/30 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Reschedule Task</h3>
            <p className="text-gray-400 mb-4">
              Reschedule: <span className="text-yellow-400">{taskToReschedule.task_title}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Date
              </label>
              <input
                type="date"
                id="reschedule-date"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                defaultValue={new Date(taskToReschedule.due_date || taskToReschedule.date).toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const newDate = document.getElementById('reschedule-date').value;
                  if (newDate) {
                    rescheduleTask(taskToReschedule._id, newDate);
                  } else {
                    alert('Please select a new date');
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-black rounded-lg hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 font-semibold"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl border border-yellow-600/30 w-[500px] max-w-[90vw]">
            <h3 className="text-xl font-semibold text-white mb-6">Create New Task</h3>
            <p className="text-gray-400 mb-6">
              Adding task to: <span className="text-yellow-400">{schedule?.schedule_title}</span>
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const taskData = {
                task_title: formData.get('task_title'),
                task_description: formData.get('task_description'),
                date: formData.get('date')
              };
              createTask(taskData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="task_title"
                    required
                    placeholder="e.g., Advanced Concepts, Practice Problems, Review Session"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="task_description"
                    rows="3"
                    placeholder="Describe what needs to be learned or accomplished..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-black rounded-lg hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {showDeleteTaskModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-red-600/30 w-[400px] max-w-[90vw]">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Task</h3>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete this task:
              </p>
              <p className="text-yellow-400 font-semibold text-lg">
                "{taskToDelete.name || taskToDelete.task_title}"?
              </p>
              <p className="text-red-400 text-sm mt-3">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={cancelDeleteTask}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteTask}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TasksContainer;