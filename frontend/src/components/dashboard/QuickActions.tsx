import React from 'react';
import { MessageSquare, Calendar, Plus, Target, TrendingUp, Clock } from 'lucide-react';

interface QuickActionsProps {
  onCreateSchedule: () => void;
  onStartChat: () => void;
  onViewProgress: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateSchedule,
  onStartChat,
  onViewProgress,
}) => {
  const actions = [
    {
      title: 'Start Learning Chat',
      description: 'Ask your AI mentor anything',
      icon: MessageSquare,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onStartChat,
    },
    {
      title: 'Create Schedule',
      description: 'Plan your learning journey',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onCreateSchedule,
    },
    {
      title: 'View Progress',
      description: 'Track your achievements',
      icon: TrendingUp,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onViewProgress,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`${action.color} text-white p-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg group-hover:bg-opacity-30 transition-all">
              <action.icon className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;