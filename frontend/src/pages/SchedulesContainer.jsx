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
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    setShowCreateModal(true);
  };

  const createSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      console.log('Creating AI-powered schedule:', scheduleData);
      const response = await api.post('/bot/create-schedule', scheduleData);
      console.log('AI Schedule created:', response.data);
      
      // Refresh schedules list
      await fetchSchedules();
      setShowCreateModal(false);
      alert(`Schedule "${response.data.schedule.schedule_title}" created successfully with AI-generated tasks!`);
    } catch (error) {
      console.error('Error creating schedule:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      } else {
        alert(`Failed to create schedule: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SchedulesPage 
        schedules={schedules}
        loading={loading}
        onScheduleClick={handleScheduleClick}
        onCreateClick={handleCreateClick}
      />
      
      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl border border-yellow-600/30 w-[600px] max-w-[90vw]">
            <h3 className="text-xl font-semibold text-white mb-6">Create New Schedule</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const scheduleData = {
                schedule_title: formData.get('schedule_title'),
                description: formData.get('description'),
                repeat_pattern: formData.get('repeat_pattern') || 'daily',
                starting_date: formData.get('starting_date') || new Date().toISOString().split('T')[0]
              };
              createSchedule(scheduleData);
            }}>
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Schedule Title *
                    </label>
                    <input
                      type="text"
                      name="schedule_title"
                      required
                      placeholder="e.g., Computer Networks Study"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Repeat Pattern
                    </label>
                    <select
                      name="repeat_pattern"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="once">Once</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Starting Date *
                    </label>
                    <input
                      type="date"
                      name="starting_date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Topics to Cover (for AI)
                    </label>
                    <textarea
                      name="description"
                      rows="6"
                      placeholder="e.g., OSI layers, TCP/IP protocols, network security, routing algorithms..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">AI will use this to generate specific tasks and learning objectives</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-black rounded-lg hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SchedulesContainer;