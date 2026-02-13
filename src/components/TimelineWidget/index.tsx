import React, { useEffect, useState } from 'react';
import { apiService, TimelineEvent, TimelineEventCategory, TimelineEventType } from '../../services/apiService';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  GitCommit, 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Rocket, 
  User, 
  Bot,
  MessageSquare,
  Play,
  AlertCircle
} from 'lucide-react';

interface TimelineWidgetProps {
  taskId?: number;
  projectId?: number;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

const categoryColors: Record<TimelineEventCategory, string> = {
  task: 'bg-blue-100 text-blue-700 border-blue-200',
  git: 'bg-purple-100 text-purple-700 border-purple-200',
  deployment: 'bg-green-100 text-green-700 border-green-200',
  ci: 'bg-orange-100 text-orange-700 border-orange-200',
  system: 'bg-gray-100 text-gray-700 border-gray-200',
};

const categoryIcons: Record<TimelineEventCategory, React.ReactNode> = {
  task: <User className="w-4 h-4" />,
  git: <GitCommit className="w-4 h-4" />,
  deployment: <Rocket className="w-4 h-4" />,
  ci: <Clock className="w-4 h-4" />,
  system: <Bot className="w-4 h-4" />,
};

const eventTypeIcons: Record<TimelineEventType, React.ReactNode> = {
  task_assigned: <User className="w-4 h-4" />,
  task_started: <Play className="w-4 h-4" />,
  task_completed: <CheckCircle2 className="w-4 h-4" />,
  status_changed: <AlertCircle className="w-4 h-4" />,
  commit_pushed: <GitCommit className="w-4 h-4" />,
  pr_opened: <GitPullRequest className="w-4 h-4" />,
  pr_merged: <CheckCircle2 className="w-4 h-4" />,
  pr_closed: <XCircle className="w-4 h-4" />,
  build_started: <Clock className="w-4 h-4" />,
  build_completed: <CheckCircle2 className="w-4 h-4" />,
  deploy_started: <Rocket className="w-4 h-4" />,
  deploy_completed: <CheckCircle2 className="w-4 h-4" />,
  comment_added: <MessageSquare className="w-4 h-4" />,
  agent_handoff: <Bot className="w-4 h-4" />,
};

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({
  taskId,
  projectId,
  limit = 20,
  showFilters = true,
  className = '',
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<TimelineEventCategory[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchEvents = async (currentOffset: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        limit,
        offset: currentOffset,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      };

      if (taskId) params.taskId = taskId;
      if (projectId) params.projectId = projectId;

      let response;
      if (taskId) {
        response = await apiService.getTaskTimeline(taskId, params);
      } else {
        response = await apiService.getTimeline(params);
      }

      if (append) {
        setEvents(prev => [...prev, ...response.events]);
      } else {
        setEvents(response.events);
      }
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      setError('Failed to load timeline events');
      console.error('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchEvents(0, false);
  }, [taskId, projectId, selectedCategories]);

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchEvents(newOffset, true);
  };

  const toggleCategory = (category: TimelineEventCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={() => fetchEvents(0, false)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
          <span className="text-sm text-gray-500">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {(['task', 'git', 'deployment', 'ci', 'system'] as TimelineEventCategory[]).map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  selectedCategories.includes(category)
                    ? categoryColors[category]
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1">
                  {categoryIcons[category]}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No events found</p>
            <p className="text-sm mt-1">Activity will appear here as work progresses</p>
          </div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${categoryColors[event.eventCategory]}`}>
                  {eventTypeIcons[event.eventType] || categoryIcons[event.eventCategory]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {event.description}
                        </p>
                      )}
                      
                      {/* Links */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.prLink && (
                          <a
                            href={event.prLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <GitPullRequest className="w-3 h-3" />
                            PR #{event.prNumber}
                          </a>
                        )}
                        {event.commitLink && (
                          <a
                            href={event.commitLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <GitCommit className="w-3 h-3" />
                            {event.commitSha?.substring(0, 7)}
                          </a>
                        )}
                        {event.taskLink && (
                          <a
                            href={event.taskLink}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <User className="w-3 h-3" />
                            View Task
                          </a>
                        )}
                        {event.deploymentLink && (
                          <a
                            href={event.deploymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <Rocket className="w-3 h-3" />
                            Deployment
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right side: Time & Status */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatEventTime(event.occurredAt)}
                      </span>
                      {getStatusIcon(event.status)}
                    </div>
                  </div>

                  {/* Actor */}
                  <div className="flex items-center gap-2 mt-2">
                    {event.actorAvatar ? (
                      <img
                        src={event.actorAvatar}
                        alt={event.actorName}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          {event.actorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500">
                      {event.actorName}
                      <span className="mx-1">·</span>
                      <span className="capitalize">{event.actorType}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineWidget;
