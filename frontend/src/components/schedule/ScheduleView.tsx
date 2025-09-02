import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, Plus, Filter } from 'lucide-react';
import { Schedule, Task } from '../../types';
import TaskCard from './TaskCard';
import ScheduleCard from './ScheduleCard';

const ScheduleView: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockSchedules: Schedule[] = [
        {
          _id: '1',
          schedule_title: 'Machine Learning Fundamentals',
          starting_date: '2025-01-01',
          end_date: '2025-01-31',
          status: 'active',
          owner_id: 'user1',
          description: 'Complete introduction to machine learning concepts and practical applications',
          repeat_pattern: 'daily',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          _id: '2',
          schedule_title: 'React Development Bootcamp',
          starting_date: '2025-01-15',
          end_date: '2025-02-15',
          status: 'active',
          owner_id: 'user1',
          description: 'Master React development from basics to advanced concepts',
          repeat_pattern: 'daily',
          createdAt: '2025-01-15T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z',
        },
      ];

      const mockTasks: Task[] = [
        {
          _id: '1',
          name: 'ML Fundamentals',
          topic: 'Introduction to Machine Learning',
          duration: 120,
          starting_time: '09:00',
          date: '2025-01-20',
          description: 'Learn the basics of ML, types of learning, and common algorithms',
          status: 'completed',
          missed: false,
          schedule_id: '1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-20T00:00:00Z',
        },
        {
          _id: '2',
          name: 'ML Fundamentals',
          topic: 'Linear Regression and Classification',
          duration: 90,
          starting_time: '10:00',
          date: '2025-01-21',
          description: 'Deep dive into linear regression and basic classification techniques',
          status: 'in-progress',
          missed: false,
          schedule_id: '1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-21T00:00:00Z',
        },
        {
          _id: '3',
          name: 'ML Fundamentals',
          topic: 'Neural Networks Basics',
          duration: 150,
          starting_time: '09:30',
          date: '2025-01-22',
          description: 'Understanding neural networks, perceptrons, and backpropagation',
          status: 'pending',
          missed: false,
          schedule_id: '1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          _id: '4',
          name: 'React Development',
          topic: 'JSX and Components',
          duration: 120,
          starting_time: '14:00',
          date: '2025-01-21',
          description: 'Learn JSX syntax and how to create reusable React components',
          status: 'pending',
          missed: false,
          schedule_id: '2',
          createdAt: '2025-01-15T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z',
        },
      ];

      setSchedules(mockSchedules);
      setTasks(mockTasks);
      setSelectedSchedule(mockSchedules[0]._id);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSchedule = !selectedSchedule || task.schedule_id === selectedSchedule;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSchedule && matchesStatus;
  });

  const getStatusStats = () => {
    const scheduleTasks = selectedSchedule 
      ? tasks.filter(task => task.schedule_id === selectedSchedule)
      : tasks;
    
    return {
      total: scheduleTasks.length,
      completed: scheduleTasks.filter(task => task.status === 'completed').length,
      pending: scheduleTasks.filter(task => task.status === 'pending').length,
      inProgress: scheduleTasks.filter(task => task.status === 'in-progress').length,
    };
  };

  const stats = getStatusStats();
  const selectedScheduleData = schedules.find(s => s._id === selectedSchedule);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your schedules...</p>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schedules Yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first learning schedule by chatting with your mentor in the Chat tab.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-blue-800 text-sm">
            💡 Try asking: "Create a 2-week Python programming schedule" or "I want to learn React in 1 month"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Schedule Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Learning Schedules</h1>
          <p className="text-gray-600 mt-1">Track your progress and stay on schedule</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedSchedule || ''}
            onChange={(e) => setSelectedSchedule(e.target.value)}
            className="input-field min-w-48"
          >
            <option value="">All Schedules</option>
            {schedules.map(schedule => (
              <option key={schedule._id} value={schedule._id}>
                {schedule.schedule_title}
              </option>
            ))}
          </select>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Circle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Selected Schedule Info */}
      {selectedScheduleData && (
        <ScheduleCard schedule={selectedScheduleData} />
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedScheduleData ? `${selectedScheduleData.schedule_title} Tasks` : 'All Tasks'}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tasks found for the selected filters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('chat');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthFlow />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'chat' ? <ChatInterface /> : <ScheduleView />}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;