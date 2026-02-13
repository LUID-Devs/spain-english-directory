import React, { useEffect, useState } from 'react';
import { apiService, TimelineEvent } from '../../services/apiService';
import { formatDistanceToNow } from 'date-fns';
import { 
  GitCommit, 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Rocket,
  MoreHorizontal
} from 'lucide-react';

interface TimelineMiniProps {
  taskId: number;
  maxEvents?: number;
  className?: string;
  onViewFull?: () => void;
}

const eventIcons: Record<string, React.ReactNode> = {
  task_assigned: <CheckCircle2 className="w-3 h-3" />,
  task_started: <Clock className="w-3 h-3" />,
  task_completed: <CheckCircle2 className="w-3 h-3 text-green-500" />,
  status_changed: <Clock className="w-3 h-3" />,
  commit_pushed: <GitCommit className="w-3 h-3" />,
  pr_opened: <GitPullRequest className="w-3 h-3" />,
  pr_merged: <CheckCircle2 className="w-3 h-3 text-purple-500" />,
  pr_closed: <XCircle className="w-3 h-3 text-red-500" />,
  build_started: <Clock className="w-3 h-3" />,
  build_completed: <CheckCircle2 className="w-3 h-3" />,
  deploy_started: <Rocket className="w-3 h-3" />,
  deploy_completed: <CheckCircle2 className="w-3 h-3 text-green-500" />,
  comment_added: <CheckCircle2 className="w-3 h-3" />,
  agent_handoff: <CheckCircle2 className="w-3 h-3" />,
};

export const TimelineMini: React.FC<TimelineMiniProps> = ({
  taskId,
  maxEvents = 3,
  className = '',
  onViewFull,
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTaskTimeline(taskId, { limit: maxEvents });
        setEvents(response.events);
        setTotalCount(response.pagination.total);
      } catch (err) {
        console.error('Error fetching mini timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [taskId, maxEvents]);

  if (loading) {
    return (
      <div className={`space-y-1 ${className}`}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <div className="h-2 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-xs text-gray-400 ${className}`}>
        No recent activity
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {events.map(event => (
        <div
          key={event.id}
          className="flex items-center gap-2 text-xs"
          title={event.title}
        >
          <span className="text-gray-500 flex-shrink-0">
            {eventIcons[event.eventType] || <CheckCircle2 className="w-3 h-3" />}
          </span>
          <span className="text-gray-700 truncate flex-1">
            {event.title}
          </span>
          <span className="text-gray-400 text-xs flex-shrink-0">
            {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
          </span>
        </div>
      ))}
      
      {totalCount > maxEvents && onViewFull && (
        <button
          onClick={onViewFull}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
        >
          <MoreHorizontal className="w-3 h-3" />
          View {totalCount - maxEvents} more
        </button>
      )}
    </div>
  );
};

export default TimelineMini;
