import React from 'react';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle,
  Plus,
  MessageCircle,
  Paperclip,
  Users,
  FolderPlus,
  Edit3,
  Archive,
  AlertCircle,
  GitCommit,
  GitPullRequest,
  Rocket,
  Play,
  Bot,
  User,
  XCircle
} from 'lucide-react';

export type ActivityType = 
  | 'task_created' 
  | 'task_completed' 
  | 'task_updated'
  | 'task_assigned'
  | 'task_started'
  | 'status_changed'
  | 'project_created'
  | 'project_updated'
  | 'comment_added'
  | 'file_uploaded'
  | 'commit_pushed'
  | 'pr_opened'
  | 'pr_merged'
  | 'pr_closed'
  | 'build_started'
  | 'build_completed'
  | 'deploy_started'
  | 'deploy_completed'
  | 'agent_handoff'
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
      case 'task_assigned': return <User className="h-4 w-4" />;
      case 'task_started': return <Play className="h-4 w-4" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4" />;
      case 'task_updated': return <Edit3 className="h-4 w-4" />;
      case 'status_changed': return <AlertCircle className="h-4 w-4" />;
      case 'project_created': return <FolderPlus className="h-4 w-4" />;
      case 'project_updated': return <Archive className="h-4 w-4" />;
      case 'comment_added': return <MessageCircle className="h-4 w-4" />;
      case 'file_uploaded': return <Paperclip className="h-4 w-4" />;
      case 'commit_pushed': return <GitCommit className="h-4 w-4" />;
      case 'pr_opened': return <GitPullRequest className="h-4 w-4" />;
      case 'pr_merged': return <CheckCircle className="h-4 w-4" />;
      case 'pr_closed': return <XCircle className="h-4 w-4" />;
      case 'build_started': return <Clock className="h-4 w-4" />;
      case 'build_completed': return <CheckCircle className="h-4 w-4" />;
      case 'deploy_started': return <Rocket className="h-4 w-4" />;
      case 'deploy_completed': return <CheckCircle className="h-4 w-4" />;
      case 'agent_handoff': return <Bot className="h-4 w-4" />;
      case 'user_activity': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'task_created':
      case 'task_assigned':
      case 'task_started':
      case 'task_completed':
      case 'task_updated':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'status_changed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'project_created':
      case 'project_updated':
        return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'comment_added':
      case 'file_uploaded':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'commit_pushed':
      case 'pr_opened':
      case 'pr_merged':
      case 'pr_closed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'build_started':
      case 'build_completed':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'deploy_started':
      case 'deploy_completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'agent_handoff':
      case 'user_activity':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-accent transition-colors">
      <div className="flex items-start space-x-3 sm:space-x-4">
        {/* Activity Icon */}
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground">
                {activity.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-none">
                {activity.description}
              </p>
            </div>
            <time className="text-xs text-muted-foreground whitespace-nowrap sm:ml-4">
              {format(activity.timestamp, 'HH:mm')}
            </time>
          </div>

          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
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
                <span className="truncate max-w-[120px] sm:max-w-[200px]">{activity.metadata.projectName}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
