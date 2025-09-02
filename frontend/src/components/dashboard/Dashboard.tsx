import React from 'react';
import { Calendar, MessageSquare, TrendingUp, Target } from 'lucide-react';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onTabChange: (tab: 'chat' | 'schedule' | 'progress' | 'profile') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Schedules',
      value: '3',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Tasks Completed',
      value: '28',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Current Streak',
      value: '7 days',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Chat Sessions',
      value: '15',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <QuickActions
          onCreateSchedule={() => onTabChange('schedule')}
          onStartChat={() => onTabChange('chat')}
          onViewProgress={() => onTabChange('progress')}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        {/* Today's Tasks */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Tasks</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Neural Networks Basics</p>
                <p className="text-gray-600 text-xs">09:30 AM • 2.5 hours</p>
              </div>
              <span className="text-blue-600 text-xs font-medium">In Progress</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">React Components Review</p>
                <p className="text-gray-600 text-xs">02:00 PM • 1 hour</p>
              </div>
              <span className="text-gray-500 text-xs font-medium">Pending</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Linear Regression</p>
                <p className="text-gray-600 text-xs">Completed at 11:30 AM</p>
              </div>
              <span className="text-green-600 text-xs font-medium">Completed</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => onTabChange('schedule')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;