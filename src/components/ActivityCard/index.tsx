import React from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  MessageCircle,
  Paperclip,
  Users,
  FolderPlus,
  Edit3,
  Archive,
  AlertCircle
} from 'lucide-react';

export type ActivityType = 
  | 'task_created' 
  | 'task_completed' 
  | 'task_updated'
  | 'project_created'
  | 'project_updated'
  | 'comment_added'
  | 'file_uploaded'
  | 'user_activity';

export interface TimelineActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    projectName?: string;
    taskTitle?: string;
    status?: string;
    priority?: string;
    [key: string]: any;
  };
}

interface ActivityCardProps {
  activity: TimelineActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'task_created': return <Plus className="h-4 w-4" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4" />;
      case 'task_updated': return <Edit3 className="h-4 w-4" />;
      case 'project_created': return <FolderPlus className="h-4 w-4" />;
      case 'project_updated': return <Archive className="h-4 w-4" />;
      case 'comment_added': return <MessageCircle className="h-4 w-4" />;
      case 'file_uploaded': return <Paperclip className="h-4 w-4" />;
      case 'user_activity': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'task_created': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'task_completed': return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'task_updated': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'project_created': return 'bg-gray-300 text-gray-800 border-gray-400';
      case 'project_updated': return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'comment_added': return 'bg-gray-50 text-gray-500 border-gray-100';
      case 'file_uploaded': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'user_activity': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="p-6 hover:bg-accent transition-colors">
      <div className="flex items-start space-x-4">
        {/* Activity Icon */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground">
                {activity.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
            </div>
            <time className="text-xs text-muted-foreground whitespace-nowrap ml-4">
              {format(activity.timestamp, 'HH:mm')}
            </time>
          </div>

          {/* Metadata */}
          <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {activity.user.name}
            </span>
            {activity.metadata?.priority && (
              <span className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {activity.metadata.priority}
              </span>
            )}
            {activity.metadata?.projectName && (
              <span className="flex items-center">
                <FolderPlus className="h-3 w-3 mr-1" />
                {activity.metadata.projectName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;