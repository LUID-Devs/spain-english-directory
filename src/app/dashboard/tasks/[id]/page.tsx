
import React, { useState } from "react";
import { useGetTaskQuery, useUpdateTaskMutation, useGetUsersQuery } from "@/hooks/useApi";
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
  MessageSquare,
  Paperclip
} from "lucide-react";
import { Link } from "react-router-dom";
import { Status, Priority } from "@/hooks/useApi";

type Props = {
  params: Promise<{ id: string }>;
};

const TaskDetailPage = ({ params }: Props) => {
  const { id } = React.use(params);
  const taskId = parseInt(id);
  
  const { data: task, isLoading, error } = useGetTaskQuery(taskId);
  const { data: users = [] } = useGetUsersQuery();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: Status.ToDo,
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
        return "bg-red-100 text-red-800 border-red-200";
      case Priority.High:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case Priority.Medium:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case Priority.Low:
        return "bg-green-100 text-green-800 border-green-200";
      case Priority.Backlog:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.ToDo:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case Status.WorkInProgress:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case Status.UnderReview:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case Status.Completed:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Task Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Link 
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
            href={`/dashboard/projects/${task.projectId}`}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Task #{task.id}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Task
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Title */}
        <div className="mb-6">
          {!isEditing ? (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h1>
          ) : (
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="text-3xl font-bold w-full bg-transparent border-none outline-none text-gray-900 dark:text-white mb-2 focus:ring-2 focus:ring-blue-500 rounded p-2"
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
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Status })}
                className="px-3 py-1 rounded-full text-sm font-medium border bg-white dark:bg-dark-secondary dark:border-gray-600 dark:text-white"
              >
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
                className="px-3 py-1 rounded-full text-sm font-medium border bg-white dark:bg-dark-secondary dark:border-gray-600 dark:text-white"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
          {!isEditing ? (
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {task.description || "No description provided."}
            </div>
          ) : (
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={6}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Task description..."
            />
          )}
        </div>

        {/* Task Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Assignee */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignee</label>
              {!isEditing ? (
                <div className="text-gray-900 dark:text-white">
                  {task.assignee ? task.assignee.username : "Unassigned"}
                </div>
              ) : (
                <select
                  value={editForm.assignedUserId || ""}
                  onChange={(e) => setEditForm({ ...editForm, assignedUserId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>{user.username}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Author</label>
              <div className="text-gray-900 dark:text-white">
                {task.author ? task.author.username : "Unknown"}
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</label>
              {!isEditing ? (
                <div className="text-gray-900 dark:text-white">
                  {task.startDate ? format(new Date(task.startDate), "PPP") : "Not set"}
                </div>
              ) : (
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</label>
              {!isEditing ? (
                <div className="text-gray-900 dark:text-white">
                  {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Not set"}
                </div>
              ) : (
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center gap-3">
            <Flag className="h-5 w-5 text-gray-400" />
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Story Points</label>
              {!isEditing ? (
                <div className="text-gray-900 dark:text-white">
                  {task.points || 0} points
                </div>
              ) : (
                <input
                  type="number"
                  value={editForm.points}
                  onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 flex items-center justify-center">🏷️</span>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags</label>
              {!isEditing ? (
                <div className="text-gray-900 dark:text-white">
                  {task.tags || "No tags"}
                </div>
              ) : (
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                />
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {task.comments && task.comments.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comments ({task.comments.length})
              </h3>
            </div>
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.user?.username || "Unknown User"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.createdAt && format(new Date(comment.createdAt), "PPP 'at' p")}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    {comment.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attachments ({task.attachments.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {task.attachments.map((attachment) => (
                <div key={attachment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {attachment.fileName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {attachment.fileURL}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;