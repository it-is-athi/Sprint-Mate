import React from 'react';
import { Clock, CheckCircle, Play, Calendar, MessageSquare } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'task_started' | 'schedule_created' | 'chat_session';
  title: string;
  description: string;
  timestamp: Date;
}

const RecentActivity: React.FC = () => {
  // Mock data - replace with actual API call
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      title: 'Completed Linear Regression',
      description: 'Finished studying linear regression concepts',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'task_started',
      title: 'Started Neural Networks',
      description: 'Began learning about neural network fundamentals',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'schedule_created',
      title: 'Created React Bootcamp',
      description: 'New 30-day React development schedule',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      type: 'chat_session',
      title: 'Chat with Mentor',
      description: 'Asked about machine learning best practices',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'task_started':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'schedule_created':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'chat_session':
        return <MessageSquare className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
              <p className="text-gray-600 text-sm">{activity.description}</p>
              <p className="text-gray-400 text-xs mt-1">{formatTimestamp(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;