import { Task } from "@/hooks/useApi";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import React, { useState } from "react";

import TaskDetailModal from "@/components/TaskDetailModal";
import { getPriorityTheme, getPriorityBadgeClasses, getPriorityCardClasses, getPriorityShadowClasses } from "@/lib/priorityThemes";
import { Priority } from "@/services/apiService";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = getPriorityTheme(task.priority as Priority);
  
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-900 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/20 font-semibold shadow-sm";
      case "Work In Progress":
        return "bg-blue-100 text-blue-900 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20 font-semibold shadow-sm";
      case "Under Review":
        return "bg-yellow-100 text-yellow-900 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-500/20 font-semibold shadow-sm";
      default:
        return "bg-gray-100 text-gray-900 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/20 font-semibold shadow-sm";
    }
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (task.status === "Completed") return null;
    
    if (isBefore(dueDate, now)) {
      return { type: "overdue", text: "Overdue", color: "text-red-600 dark:text-red-400" };
    } else if (formatDistanceToNow(dueDate).includes("day") && parseInt(formatDistanceToNow(dueDate)) <= 2) {
      return { type: "due-soon", text: "Due soon", color: "text-orange-600 dark:text-orange-400" };
    }
    
    return null;
  };

  const dueDateStatus = getDueDateStatus();
  
  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`group relative bg-white dark:bg-dark-secondary rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 ${getPriorityCardClasses(task.priority as Priority)} overflow-hidden hover:scale-[1.02] transform`}
      >
        {/* Priority accent bar */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 group-hover:w-1.5"
          style={{ backgroundColor: theme.primaryColor }}
        />
        
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors line-clamp-2">
                {task.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">
                ID: {task.id}
              </p>
            </div>
            
            {/* Priority badge */}
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getPriorityBadgeClasses(task.priority as Priority)} ml-3 flex-shrink-0 shadow-sm`}>
              {task.priority}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-gray-700 dark:text-gray-200 text-sm line-clamp-2 mb-4 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Attachment preview */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="mb-4">
              <img
                src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
                alt={task.attachments[0].fileName}
                className="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600"
              />
              {task.attachments.length > 1 && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                  +{task.attachments.length - 1} more attachment{task.attachments.length > 2 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Status and Tags Row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ring-1 ring-inset ${getStatusBadgeClasses(task.status)}`}>
              {task.status}
            </span>
            
            {task.tags && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                <span>🏷️</span>
                <span>{task.tags}</span>
              </div>
            )}
          </div>

          {/* Dates and Due Status */}
          <div className="space-y-2 mb-4">
            {task.dueDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-200 font-medium">
                  <span className="mr-2">📅</span>
                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                </div>
                {dueDateStatus && (
                  <span className={`text-xs font-medium ${dueDateStatus.color}`}>
                    {dueDateStatus.text}
                  </span>
                )}
              </div>
            )}
            
            {task.startDate && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-200 font-medium">
                <span className="mr-2">🚀</span>
                Started: {format(new Date(task.startDate), "MMM d, yyyy")}
              </div>
            )}
          </div>

          {/* Team members */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm">
              {task.author && (
                <div className="flex items-center text-gray-700 dark:text-gray-200 font-medium">
                  <span className="mr-1">👤</span>
                  <span>By {task.author.username}</span>
                </div>
              )}
              
              {task.assignee && (
                <div className="flex items-center text-gray-700 dark:text-gray-200 font-medium">
                  <span className="mr-1">👥</span>
                  <span>→ {task.assignee.username}</span>
                </div>
              )}
            </div>
            
            {/* Hover indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={task.id}
        editMode={false}
      />
    </>
  );
};

export default TaskCard;
