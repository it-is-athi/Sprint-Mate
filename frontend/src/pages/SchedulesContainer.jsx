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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editForm, setEditForm] = useState({ schedule_title: '', description: '' });
  const [selectedRepeatPattern, setSelectedRepeatPattern] = useState('daily');
  const [startingDate, setStartingDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');

  // Handle repeat pattern change
  const handleRepeatPatternChange = (pattern) => {
    setSelectedRepeatPattern(pattern);
    // If "once" is selected, auto-fill end date with start date
    if (pattern === 'once' && startingDate) {
      setEndDate(startingDate);
    }
  };

  // Handle starting date change
  const handleStartingDateChange = (date) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Prevent selecting past dates
    if (date < today) {
      alert('Starting date cannot be in the past. Please select today or a future date.');
      return;
    }
    
    setStartingDate(date);
    // If "once" is selected, auto-fill end date with start date
    if (selectedRepeatPattern === 'once') {
      setEndDate(date);
    }
    // If end date is before the new start date, update it
    else if (endDate && endDate < date) {
      setEndDate(date);
    }
  };

  // Handle end date change
  const handleEndDateChange = (date) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Prevent selecting past dates
    if (date < today) {
      alert('End date cannot be in the past. Please select today or a future date.');
      return;
    }
    
    // Prevent selecting end date before start date
    if (date < startingDate) {
      alert('End date cannot be before start date.');
      return;
    }
    
    setEndDate(date);
    // If "once" is selected and end date differs from start date, auto-fill start date
    if (selectedRepeatPattern === 'once' && date && date !== startingDate) {
      setStartingDate(date);
    }
  };

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
    setSelectedRepeatPattern('daily'); // Reset to default
    setShowCreateModal(true);
  };

  const handleDeleteClick = (e, schedule) => {
    e.stopPropagation(); // Prevent schedule click when delete is clicked
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  const handleEditClick = (e, schedule) => {
    e.stopPropagation(); // Prevent schedule click when edit is clicked
    setEditingSchedule(schedule._id);
    setEditForm({
      schedule_title: schedule.schedule_title,
      description: schedule.description
    });
  };

  const handleEditSave = async (scheduleId) => {
    try {
      setLoading(true);
      console.log('Updating schedule:', scheduleId, editForm);
      
      await api.put(`/schedules/${scheduleId}`, {
        schedule_title: editForm.schedule_title,
        description: editForm.description
      });
      
      // Update local state immediately for better UX
      setSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule._id === scheduleId 
            ? { ...schedule, ...editForm }
            : schedule
        )
      );
      
      setEditingSchedule(null);
      setEditForm({ schedule_title: '', description: '' });
      alert('Schedule updated successfully!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      } else {
        alert(`Failed to update schedule: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingSchedule(null);
    setEditForm({ schedule_title: '', description: '' });
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;
    
    try {
      setLoading(true);
      console.log('Deleting schedule:', scheduleToDelete._id);
      await api.delete(`/schedules/${scheduleToDelete._id}`);
      
      // Refresh schedules list
      await fetchSchedules();
      setShowDeleteModal(false);
      setScheduleToDelete(null);
      alert(`Schedule "${scheduleToDelete.schedule_title}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        navigate('/');
      } else {
        alert(`Failed to delete schedule: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
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
        onDeleteClick={handleDeleteClick}
        onEditClick={handleEditClick}
        onEditSave={handleEditSave}
        onEditCancel={handleEditCancel}
        editingSchedule={editingSchedule}
        editForm={editForm}
        setEditForm={setEditForm}
      />
      
      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl border border-yellow-600/30 w-[600px] max-w-[90vw]">
            <h3 className="text-xl font-semibold text-white mb-6">Create New Schedule</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              
              const today = new Date().toISOString().split('T')[0];
              
              // Validate starting date is not in the past
              if (startingDate < today) {
                alert('Starting date cannot be in the past. Please select today or a future date.');
                return;
              }
              
              // Validate date range
              if (selectedRepeatPattern !== 'once' && endDate && new Date(endDate) < new Date(startingDate)) {
                alert('End date cannot be before start date');
                return;
              }
              
              // Validate end date is not in the past
              if (selectedRepeatPattern !== 'once' && endDate && endDate < today) {
                alert('End date cannot be in the past. Please select today or a future date.');
                return;
              }
              
              const formData = new FormData(e.target);
              const scheduleData = {
                schedule_title: formData.get('schedule_title'),
                description: formData.get('description'),
                repeat_pattern: selectedRepeatPattern,
                starting_date: startingDate,
                end_date: selectedRepeatPattern === 'once' ? startingDate : endDate,
                difficulty: selectedDifficulty
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
                      value={selectedRepeatPattern}
                      onChange={(e) => handleRepeatPatternChange(e.target.value)}
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
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner (Start from scratch)</option>
                      <option value="intermediate">Intermediate (Have basic knowledge)</option>
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
                      min={new Date().toISOString().split('T')[0]}
                      value={startingDate}
                      onChange={(e) => handleStartingDateChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Topics to Cover (Optional)
                    </label>
                    <textarea
                      name="description"
                      rows="4"
                      placeholder="e.g., OSI layers, TCP/IP protocols, network security... (Leave blank for AI to decide)"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">AI will use this as guidance if provided, or create topics automatically from the schedule title</p>
                  </div>

                  {selectedRepeatPattern !== 'once' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        required={selectedRepeatPattern !== 'once'}
                        min={startingDate || new Date().toISOString().split('T')[0]}
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Determines how many tasks AI will create (Nov 1 to Dec 1 weekly = 5 tasks max)</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date * (Same as start date for single task)
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        required
                        value={endDate}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">For one-time tasks, the end date is automatically set to match the start date</p>
                    </div>
                  )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && scheduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-red-600/30 w-[400px] max-w-[90vw]">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Schedule</h3>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete the schedule:
              </p>
              <p className="text-yellow-400 font-semibold text-lg">
                "{scheduleToDelete.schedule_title}"?
              </p>
              <p className="text-red-400 text-sm mt-3">
                ⚠️ This action cannot be undone. All associated tasks will also be deleted.
              </p>
            </div>

            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
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

export default SchedulesContainer;