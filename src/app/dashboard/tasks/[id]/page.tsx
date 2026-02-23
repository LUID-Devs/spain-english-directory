
import React, { useState, useMemo } from "react";
import { useGetTaskQuery, useUpdateTaskMutation, useGetUsersQuery, useGetProjectStatusesQuery } from "@/hooks/useApi";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Calendar,
  User,
  Flag,
  Clock,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { Status, Priority } from "@/hooks/useApi";
import AttachmentsSection from "@/components/AttachmentsSection";
import CommentsSection from "@/components/CommentsSection";
import { sanitizeHtmlContent } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

const TaskDetailPage = ({ params }: Props) => {
  const { id } = React.use(params);
  const taskId = parseInt(id);

  const { data: task, isLoading, error, refetch } = useGetTaskQuery(taskId);
  const { data: users = [] } = useGetUsersQuery();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Fetch dynamic statuses for the project
  const { data: statusesData } = useGetProjectStatusesQuery(
    task?.projectId ?? 0,
    { skip: !task?.projectId }
  );

  // Get available statuses from API or fall back to defaults
  const availableStatuses = useMemo(() => {
    if (statusesData && statusesData.length > 0) {
      return statusesData.map((s) => s.name);
    }
    return Object.values(Status);
  }, [statusesData]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: Status.ToDo as string,
    priority: Priority.Medium,
    tags: "",
    startDate: "",
    dueDate: "",
    points: 0,
    assignedUserId: undefined as number | undefined,
  });

  React.useEffect(() => {
    if (task) {
      setEditForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || Status.ToDo,
        priority: task.priority || Priority.Medium,
        tags: task.tags || "",
        startDate: task.startDate ? task.startDate.split('T')[0] : "",
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
        points: task.points || 0,
        assignedUserId: task.assignedUserId || undefined,
      });
    }
  }, [task]);

  const handleSave = async () => {
    try {
      await updateTask({
        taskId,
        task: {
          ...editForm,
          startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined,
          dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
        },
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Urgent:
        return "bg-gray-900 text-gray-100 border-gray-800";
      case Priority.High:
        return "bg-gray-700 text-gray-100 border-gray-600";
      case Priority.Medium:
        return "bg-gray-500 text-white border-gray-400";
      case Priority.Low:
        return "bg-gray-300 text-gray-800 border-gray-200";
      case Priority.Backlog:
        return "bg-gray-100 text-gray-600 border-gray-100";
      default:
        return "bg-gray-100 text-gray-600 border-gray-100";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.ToDo:
        return "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800";
      case Status.WorkInProgress:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700";
      case Status.UnderReview:
        return "bg-gray-200 text-gray-800 border-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600";
      case Status.Completed:
        return "bg-gray-300 text-gray-800 border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500";
      case Status.Archived:
        return "bg-gray-400 text-gray-900 border-gray-600 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-400";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Error Loading Task
          </h1>
          <p className="text-muted-foreground mb-2">
            We encountered an error while loading this task.
          </p>
          <p className="text-destructive text-sm mb-6">
            {error.message || "Unknown error occurred"}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/dashboard/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Task Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/dashboard/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={`/dashboard/projects/${task.projectId}`}
            className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>
          <div className="h-6 w-px bg-border"></div>
          <span className="text-sm text-muted-foreground">Task #{task.id}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Task
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        {/* Title */}
        <div className="mb-6">
          {!isEditing ? (
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {task.title}
            </h1>
          ) : (
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="text-3xl font-bold w-full bg-transparent border-none outline-none text-foreground mb-2 focus:ring-2 focus:ring-primary rounded p-2"
              placeholder="Task title..."
            />
          )}
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center gap-4 mb-6">
          {!isEditing ? (
            <>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status!)}`}>
                {task.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority!)}`}>
                {task.priority}
              </span>
            </>
          ) : (
            <>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="px-3 py-1 rounded-full text-sm font-medium border border-border bg-background text-foreground"
              >
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
                className="px-3 py-1 rounded-full text-sm font-medium border border-border bg-background text-foreground"
              >
                {Object.values(Priority).map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
          {!isEditing ? (
            <div className="text-muted-foreground">
              {task.description ? (
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(task.description) }}
                />
              ) : (
                <p className="text-muted-foreground/60 italic">No description provided.</p>
              )}
            </div>
          ) : (
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={6}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
              placeholder="Task description..."
            />
          )}
        </div>

        {/* Task Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Assignee */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assignee</label>
              {!isEditing ? (
                <div className="text-foreground">
                  {task.assignee ? task.assignee.username : "Unassigned"}
                </div>
              ) : (
                <select
                  value={editForm.assignedUserId || ""}
                  onChange={(e) => setEditForm({ ...editForm, assignedUserId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                >
                  <option value="">Unassigned</option>
                  {users?.map((user) => (
                    <option key={user.userId} value={user.userId}>{user.username}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Author</label>
              <div className="text-foreground">
                {task.author ? task.author.username : "Unknown"}
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              {!isEditing ? (
                <div className="text-foreground">
                  {task.startDate ? format(new Date(task.startDate), "PPP") : "Not set"}
                </div>
              ) : (
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                />
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Due Date</label>
              {!isEditing ? (
                <div className="text-foreground">
                  {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Not set"}
                </div>
              ) : (
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                />
              )}
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center gap-3">
            <Flag className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Story Points</label>
              {!isEditing ? (
                <div className="text-foreground">
                  {task.points || 0} points
                </div>
              ) : (
                <input
                  type="number"
                  value={editForm.points}
                  onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                />
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 flex items-center justify-center">🏷️</span>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              {!isEditing ? (
                <div className="text-foreground">
                  {task.tags || "No tags"}
                </div>
              ) : (
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                />
              )}
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="border-t border-border pt-6 mt-6">
          <AttachmentsSection taskId={taskId} />
        </div>

        {/* Comments Section */}
        <div className="border-t border-border pt-6 mt-6">
          <CommentsSection taskId={taskId} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;