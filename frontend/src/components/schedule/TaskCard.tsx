import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, Circle, Play, Pause, Edit, Trash2 } from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Play className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-blue-200 bg-blue-50';
      case 'pending':
        return 'border-gray-200 bg-white';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (onStatusChange) {
      setIsUpdating(true);
      try {
        await onStatusChange(task._id, newStatus);
      } catch (error) {
        console.error('Failed to update task status:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div 
      className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getStatusColor()}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-gray-900">{task.topic}</h3>
            {task.missed && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Missed
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(task.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{task.starting_time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{formatDuration(task.duration)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4 min-h-[32px]">
          {/* Action buttons that appear on hover */}
          {showActions && (onEdit || onDelete) && (
            <div className="flex items-center space-x-1 mr-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit task"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {task.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              disabled={isUpdating}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Start</span>
            </button>
          )}
          
          {task.status === 'in-progress' && (
            <>
              <button
                onClick={() => handleStatusChange('pending')}
                disabled={isUpdating}
                className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-50"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Complete</span>
              </button>
            </>
          )}
          
          {task.status === 'completed' && (
            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
              ✓ Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;