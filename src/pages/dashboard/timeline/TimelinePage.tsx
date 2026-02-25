import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/authProvider';
import { apiService } from '@/services/apiService';
import type { TimelineEvent, TimelineEventCategory } from '@/services/apiService';
import Header from '@/components/Header';
import ActivityCard, { TimelineActivity } from '@/components/ActivityCard';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import {
  Search,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { TimelinePageSkeleton } from '@/components/TimelineSkeleton';

const TimelinePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterCategory, setFilterCategory] = useState<TimelineEventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchTimeline = useCallback(
    async (currentOffset: number = 0, append: boolean = false) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const params = {
          limit,
          offset: currentOffset,
          categories: filterCategory === 'all' ? undefined : [filterCategory],
        };
        const response = await apiService.getTimeline(params);
        setEvents((prev) => (append ? [...prev, ...response.events] : response.events));
        setHasMore(response.pagination.hasMore);
      } catch (fetchError) {
        console.error('Failed to fetch timeline events:', fetchError);
        setError('Failed to load timeline events');
      } finally {
        setLoading(false);
      }
    },
    [filterCategory, isAuthenticated]
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    setOffset(0);
    fetchTimeline(0, false);
  }, [fetchTimeline, isAuthenticated]);

  const timelineActivities = useMemo((): TimelineActivity[] => {
    if (!events.length) return [];

    const query = searchQuery.trim().toLowerCase();
    const filteredEvents = query
      ? events.filter((event) => {
          const searchable = [
            event.title,
            event.description,
            event.actorName,
            event.eventType,
            event.branchName,
            event.commitSha,
            event.prNumber?.toString(),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return searchable.includes(query);
        })
      : events;

    return filteredEvents
      .map((event) => ({
        id: `event-${event.id}`,
        type: event.eventType,
        title: event.title,
        description: event.description || event.title,
        timestamp: parseISO(event.occurredAt),
        user: {
          name: event.actorName,
          avatar: event.actorAvatar,
        },
        metadata: {
          status: event.status,
          category: event.eventCategory,
          taskId: event.taskId,
          projectId: event.projectId,
          commitSha: event.commitSha,
          prNumber: event.prNumber,
          branchName: event.branchName,
        },
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events, searchQuery]);

  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: TimelineActivity[] } = {};

    timelineActivities.forEach((activity) => {
      let dateKey: string;

      if (isToday(activity.timestamp)) {
        dateKey = 'Today';
      } else if (isYesterday(activity.timestamp)) {
        dateKey = 'Yesterday';
      } else if (isThisWeek(activity.timestamp)) {
        dateKey = 'This Week';
      } else {
        dateKey = format(activity.timestamp, 'MMMM d, yyyy');
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return groups;
  }, [timelineActivities]);

  const stats = useMemo(() => {
    const today = timelineActivities.filter((activity) => isToday(activity.timestamp)).length;
    const thisWeek = timelineActivities.filter((activity) => isThisWeek(activity.timestamp)).length;
    const taskActivities = timelineActivities.filter(
      (activity) => activity.metadata?.category === 'task'
    ).length;
    const otherActivities = timelineActivities.length - taskActivities;

    return { today, thisWeek, taskActivities, otherActivities };
  }, [timelineActivities]);

  if (authLoading || (loading && events.length === 0)) {
    return <TimelinePageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container h-full w-full bg-background px-4 py-4 sm:p-8">
        <Header name="Timeline" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4 text-sm sm:text-base">Authentication required</p>
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm sm:text-base"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container h-full w-full bg-background px-4 py-4 sm:p-8">
      <Header name="Activity Timeline" />

      <div className="mb-4 sm:mb-6 bg-card border border-border rounded-lg p-4 sm:p-6 shadow">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Activity Timeline</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track all activities across your projects and tasks
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center w-full lg:w-auto">
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.today}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.thisWeek}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.taskActivities}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Task Events</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.otherActivities}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Other Events</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 bg-card border border-border rounded-lg p-3 sm:p-4 shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as TimelineEventCategory | 'all')}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="all">All Activities</option>
            <option value="task">Task Events</option>
            <option value="git">Git Events</option>
            <option value="deployment">Deployments</option>
            <option value="ci">CI Events</option>
            <option value="system">System Events</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-200">{error}</p>
                <button
                  onClick={() => fetchTimeline(0, false)}
                  className="mt-2 text-sm text-primary hover:text-primary/80 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedActivities).length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-12 shadow text-center">
            <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              No Recent Activity
            </h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              {searchQuery
                ? `No activities found matching "${searchQuery}"`
                : 'Activity will appear here as work progresses.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedActivities).map(([dateGroup, activities]) => (
            <div key={dateGroup} className="bg-card border border-border rounded-lg shadow">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">{dateGroup}</h3>
                  <span className="text-xs sm:text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-border">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {timelineActivities.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Showing {timelineActivities.length} recent activities
          </p>
        </div>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const nextOffset = offset + limit;
              setOffset(nextOffset);
              fetchTimeline(nextOffset, true);
            }}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
