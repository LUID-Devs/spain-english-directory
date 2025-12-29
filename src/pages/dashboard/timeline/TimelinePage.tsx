import React, { useState, useMemo } from 'react';
import { useAuth } from '@/app/authProvider';
import { useGetProjectsQuery, useGetTasksByUserQuery } from '@/hooks/useApi';
import Header from '@/components/Header';
import ActivityCard, { TimelineActivity, ActivityType } from '@/components/ActivityCard';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import {
  Calendar,
  Search,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';

const TimelinePage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Improved user ID resolution - use database userId first, then fallback to sub
  let userId: number | null = null;
  if (user?.userId && typeof user.userId === 'number') {
    userId = user.userId;
  } else if (user?.sub) {
    const parsedFromSub = parseInt(user.sub);
    if (!isNaN(parsedFromSub)) {
      userId = parsedFromSub;
    }
  }
  
  console.log('Timeline Page Debug:', {
    user,
    userId,
    isAuthenticated,
    authLoading
  });
  
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksByUserQuery(userId, { skip: userId === null || !isAuthenticated });
  
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError
  } = useGetProjectsQuery();

  // Generate timeline activities from available data - MOVED BEFORE EARLY RETURNS
  const timelineActivities = useMemo((): TimelineActivity[] => {
    if (!tasks && !projects) return [];
    
    const activities: TimelineActivity[] = [];
    
    // Add task-related activities
    (tasks || []).forEach(task => {
      // Task creation (using startDate as proxy for creation)
      if (task.startDate) {
        activities.push({
          id: `task-created-${task.id}`,
          type: 'task_created',
          title: 'Task Created',
          description: `Created task "${task.title}"`,
          timestamp: parseISO(task.startDate),
          user: {
            name: task.author?.username || user?.preferred_username || 'Unknown User'
          },
          metadata: {
            taskTitle: task.title,
            priority: task.priority,
            status: task.status
          }
        });
      }
      
      // Task completion (if completed)
      if (task.status === 'Completed' && task.dueDate) {
        activities.push({
          id: `task-completed-${task.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          description: `Completed task "${task.title}"`,
          timestamp: parseISO(task.dueDate), // Using dueDate as proxy
          user: {
            name: task.assignee?.username || user?.preferred_username || 'Unknown User'
          },
          metadata: {
            taskTitle: task.title,
            priority: task.priority
          }
        });
      }
      
      // Comments
      (task.comments || []).forEach(comment => {
        activities.push({
          id: `comment-${comment.id}`,
          type: 'comment_added',
          title: 'Comment Added',
          description: `Commented on "${task.title}": ${comment.text.slice(0, 100)}${comment.text.length > 100 ? '...' : ''}`,
          timestamp: parseISO(comment.createdAt),
          user: {
            name: comment.user.username
          },
          metadata: {
            taskTitle: task.title
          }
        });
      });
      
      // Attachments
      (task.attachments || []).forEach(attachment => {
        activities.push({
          id: `attachment-${attachment.id}`,
          type: 'file_uploaded',
          title: 'File Uploaded',
          description: `Uploaded "${attachment.fileName}" to "${task.title}"`,
          timestamp: new Date(), // Would need upload timestamp
          user: {
            name: attachment.uploadedBy.username
          },
          metadata: {
            taskTitle: task.title,
            fileName: attachment.fileName
          }
        });
      });
    });
    
    // Add project-related activities
    (projects || []).forEach(project => {
      if (project.startDate) {
        activities.push({
          id: `project-created-${project.id}`,
          type: 'project_created',
          title: 'Project Created',
          description: `Created project "${project.name}"`,
          timestamp: parseISO(project.startDate),
          user: {
            name: user?.preferred_username || 'Unknown User'
          },
          metadata: {
            projectName: project.name
          }
        });
      }
      
      if (project.endDate) {
        activities.push({
          id: `project-completed-${project.id}`,
          type: 'project_updated',
          title: 'Project Completed',
          description: `Completed project "${project.name}"`,
          timestamp: parseISO(project.endDate),
          user: {
            name: user?.preferred_username || 'Unknown User'
          },
          metadata: {
            projectName: project.name,
            status: 'Completed'
          }
        });
      }
    });
    
    // Sort by timestamp (newest first) and filter
    return activities
      .filter(activity => {
        if (filterType !== 'all' && activity.type !== filterType) return false;
        if (searchQuery && !activity.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [tasks, projects, user, filterType, searchQuery]);

  // Group activities by date - MOVED BEFORE EARLY RETURNS
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: TimelineActivity[] } = {};
    
    timelineActivities.forEach(activity => {
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

  // Quick stats - MOVED BEFORE EARLY RETURNS
  const stats = useMemo(() => {
    const today = timelineActivities.filter(a => isToday(a.timestamp)).length;
    const thisWeek = timelineActivities.filter(a => isThisWeek(a.timestamp)).length;
    const taskActivities = timelineActivities.filter(a => a.type.includes('task')).length;
    const projectActivities = timelineActivities.filter(a => a.type.includes('project')).length;
    
    return { today, thisWeek, taskActivities, projectActivities };
  }, [timelineActivities]);

  // Show loading while authenticating or fetching data
  if (authLoading || tasksLoading || projectsLoading) {
    return (
      <div className="container h-full w-[100%] bg-background p-8">
        <Header name="Timeline" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? "Authenticating..." : "Loading activity timeline..."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="container h-full w-[100%] bg-background p-8">
        <Header name="Timeline" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">Authentication required</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container h-full w-[100%] bg-background p-8">
      <Header name="Activity Timeline" />

      {/* Welcome Section with Stats */}
      <div className="mb-6 bg-card border border-border rounded-lg p-6 shadow">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Activity Timeline
              </h2>
            </div>
            <p className="text-muted-foreground">
              Track all activities across your projects and tasks
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Today</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisWeek}</div>
              <div className="text-xs text-green-600 dark:text-green-400">This Week</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.taskActivities}</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Task Events</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.projectActivities}</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Project Events</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 bg-card border border-border rounded-lg p-4 shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
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

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActivityType | 'all')}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="all">All Activities</option>
            <option value="task_created">Task Created</option>
            <option value="task_completed">Task Completed</option>
            <option value="project_created">Project Created</option>
            <option value="comment_added">Comments</option>
            <option value="file_uploaded">File Uploads</option>
          </select>
        </div>
      </div>

      {/* Error Alerts for Partial Failures */}
      {(tasksError || projectsError) && (
        <div className="mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Some activity data may be incomplete due to loading issues.
                  {tasksError && " Tasks data unavailable."}
                  {projectsError && " Projects data unavailable."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Activities */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 shadow text-center">
            <Sparkles className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Recent Activity
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ?
                `No activities found matching "${searchQuery}"` :
                "Start creating tasks and projects to see your activity timeline."
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedActivities).map(([dateGroup, activities]) => (
            <div key={dateGroup} className="bg-card border border-border rounded-lg shadow">
              {/* Date Header */}
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {dateGroup}
                  </h3>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
              </div>

              {/* Activities List */}
              <div className="divide-y divide-border">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show more activities hint */}
      {timelineActivities.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Showing {timelineActivities.length} recent activities
          </p>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;