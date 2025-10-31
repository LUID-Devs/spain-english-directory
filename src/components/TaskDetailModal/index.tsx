"use client";

import React, { useState, useEffect } from "react";
import { useGetTaskQuery, useUpdateTaskMutation, useGetUsersQuery } from "@/hooks/useApi";
import { format } from "date-fns";
import { 
  X, 
  Edit, 
  Save, 
  Calendar, 
  User, 
  Flag, 
  Clock, 
  Paperclip
} from "lucide-react";
import CommentsSection from "@/components/CommentsSection";
import AttachmentsSection from "@/components/AttachmentsSection";
import { Status, Priority } from "@/hooks/useApi";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  editMode?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, taskId, editMode = false }) => {
  const { data: task, isLoading, error } = useGetTaskQuery(taskId, { skip: !isOpen });
  const { data: users = [] } = useGetUsersQuery(undefined, {
    skip: !isOpen, // Only load users when modal is open
  });
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  
  const [isEditing, setIsEditing] = useState(editMode);
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

  useEffect(() => {
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

  const handleClose = () => {
    setIsEditing(editMode);
    onClose();
  };

  // Update editing state when editMode or modal open state changes
  useEffect(() => {
    if (isOpen) {
      setIsEditing(editMode);
    }
  }, [isOpen, editMode]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Task #{taskId}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
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
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ) : error || !task ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Task Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The task you're looking for doesn't exist or has been deleted.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title */}
              <div>
                {!isEditing ? (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {task.title}
                  </h1>
                ) : (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="text-2xl font-bold w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Task title..."
                  />
                )}
              </div>

              {/* Status and Priority Badges */}
              <div className="flex items-center gap-4">
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                {!isEditing ? (
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.description || "No description provided."}
                  </div>
                ) : (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description..."
                  />
                )}
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignee */}
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Assignee</label>
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
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Author</label>
                    <div className="text-gray-900 dark:text-white">
                      {task.author ? task.author.username : "Unknown"}
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Start Date</label>
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
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Due Date</label>
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
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Story Points</label>
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
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Tags</label>
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

              {/* Attachments Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <AttachmentsSection taskId={taskId} />
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <CommentsSection taskId={taskId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;