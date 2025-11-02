
import React, { useEffect } from "react";
import { useGetTasksQuery, useUpdateTaskStatusMutation, useDeleteTaskMutation } from "@/hooks/useApi";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/hooks/useApi";
import { EllipsisVertical, MessageSquareMore, Plus, Edit, Trash2, Eye, Clock, User, Calendar } from "lucide-react";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";

import TaskDetailModal from "@/components/TaskDetailModal";
import DeleteTaskModal from "@/components/DeleteTaskModal";
import type { DropTargetMonitor, DragSourceMonitor } from 'react-dnd';

// Literal type for status values
type TaskStatus = "To Do" | "Work In Progress" | "Under Review" | "Completed";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus: TaskStatus[] = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const { data: tasks, isLoading, error, refetch } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [selectedTask, setSelectedTask] = React.useState<{ taskId: number; editMode: boolean } | null>(null);

  const moveTask = async (taskId: number, toStatus: TaskStatus) => {
    try {
      await updateTaskStatus({ taskId, status: toStatus });
      // Refetch tasks to update the board immediately
      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Listen for task updates from other components (like TaskDetailModal)
  useEffect(() => {
    const handleTaskUpdated = () => {
      refetch();
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdated);
    };
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 xl:grid-cols-4 max-w-[1600px] mx-auto">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks || []}
              moveTask={moveTask}
              setIsModalNewTaskOpen={setIsModalNewTaskOpen}
              onTaskSelect={setSelectedTask}
            />
          ))}
        </div>
      </DndProvider>
      
      {/* Modal rendered at page level */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          taskId={selectedTask.taskId}
          editMode={selectedTask.editMode}
        />
      )}
    </>
  );
};

type TaskColumnProps = {
  status: TaskStatus;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: TaskStatus) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  onTaskSelect: (task: { taskId: number; editMode: boolean }) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  onTaskSelect,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver()
    }),
  }));

  const tasksCount = tasks.filter((task) => (task.status || "To Do") === status).length;

  // Enhanced status configuration with Apple HIG principles
  const statusConfig: Record<TaskStatus, {
    color: string;
    bgColor: string;
    lightBg: string;
    darkBg: string;
    icon: string;
  }> = {
    "To Do": {
      color: "#007AFF",
      bgColor: "bg-blue-50",
      lightBg: "bg-blue-50/80",
      darkBg: "bg-blue-950/30",
      icon: ""
    },
    "Work In Progress": {
      color: "#34C759",
      bgColor: "bg-green-50",
      lightBg: "bg-green-50/80", 
      darkBg: "bg-green-950/30",
      icon: ""
    },
    "Under Review": {
      color: "#FF9500",
      bgColor: "bg-orange-50",
      lightBg: "bg-orange-50/80",
      darkBg: "bg-orange-950/30", 
      icon: ""
    },
    "Completed": {
      color: "#8E8E93",
      bgColor: "bg-gray-50",
      lightBg: "bg-gray-50/80",
      darkBg: "bg-gray-950/30",
      icon: ""
    },
  };

  const config = statusConfig[status];

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`transition-all duration-300 ease-out ${
        isOver 
          ? "scale-[1.02] ring-2 ring-blue-500/30 ring-offset-2 dark:ring-offset-dark-bg" 
          : ""
      }`}
    >
      <div className="mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800 shadow-sm">
          {/* Header with gradient accent */}
          <div className="relative">
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundColor: config.color }}
            />
            <div className="relative px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{config.icon}</span>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                      {status}
                    </h3>
                  </div>
                  <div 
                    className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full text-xs font-medium text-white shadow-sm"
                    style={{ backgroundColor: config.color }}
                  >
                    {tasksCount}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-500 dark:text-gray-400">
                    <EllipsisVertical size={16} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg transition-all duration-200 text-white shadow-sm hover:shadow-md transform hover:scale-105"
                    style={{ backgroundColor: config.color }}
                    onClick={() => setIsModalNewTaskOpen(true)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tasks container */}
          <div className="p-3 min-h-[200px] space-y-3"
            style={{ 
              background: `linear-gradient(180deg, ${config.lightBg} 0%, transparent 100%)` 
            }}
          >
            {tasks
              .filter((task) => (task.status || "To Do") === status)
              .map((task) => (
                <Task key={task.id} task={task} onTaskSelect={onTaskSelect} />
              ))}
            
            {tasksCount === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-3xl mb-2 opacity-50">{config.icon}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  No {status.toLowerCase()} tasks
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Drag tasks here or create new ones
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  onTaskSelect: (task: { taskId: number; editMode: boolean }) => void;
};

const Task = ({ task, onTaskSelect }: TaskProps) => {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging()
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if dragging or if clicking on menu button
    if (!isDragging) {
      onTaskSelect({ taskId: task.id, editMode: false });
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    
    switch(action) {
      case 'view':
        onTaskSelect({ taskId: task.id, editMode: false });
        break;
      case 'edit':
        onTaskSelect({ taskId: task.id, editMode: true });
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task.id).unwrap();
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      // You could add a toast notification here
      alert(error?.data?.message || 'Failed to delete task. Please try again.');
      setShowDeleteModal(false);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const getPriorityConfig = (priority: TaskType["priority"]) => {
    switch (priority) {
      case "Urgent":
        return { 
          color: "#FF3B30", 
          bg: "bg-red-50", 
          text: "text-red-700", 
          icon: "",
          ring: "ring-red-200"
        };
      case "High":
        return { 
          color: "#FF9500", 
          bg: "bg-orange-50", 
          text: "text-orange-700", 
          icon: "",
          ring: "ring-orange-200"
        };
      case "Medium":
        return { 
          color: "#007AFF", 
          bg: "bg-blue-50", 
          text: "text-blue-700", 
          icon: "",
          ring: "ring-blue-200"
        };
      case "Low":
        return { 
          color: "#34C759", 
          bg: "bg-green-50", 
          text: "text-green-700", 
          icon: "",
          ring: "ring-green-200"
        };
      default:
        return { 
          color: "#8E8E93", 
          bg: "bg-gray-50", 
          text: "text-gray-700", 
          icon: "",
          ring: "ring-gray-200"
        };
    }
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (task.status === "Completed") return null;
    
    if (isBefore(dueDate, now)) {
      return { type: "overdue", text: "Overdue", color: "#FF3B30", bg: "bg-red-50", textColor: "text-red-700" };
    } else if (formatDistanceToNow(dueDate).includes("day") && parseInt(formatDistanceToNow(dueDate)) <= 2) {
      return { type: "due-soon", text: "Due soon", color: "#FF9500", bg: "bg-orange-50", textColor: "text-orange-700" };
    }
    
    return null;
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const dueDateStatus = getDueDateStatus();

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`relative group transition-all duration-300 ease-out ${
        isDragging ? "opacity-60 scale-95 rotate-2" : "opacity-100"
      }`}
    >
      <div 
        onClick={handleCardClick}
        className="relative overflow-hidden rounded-xl bg-white dark:bg-dark-secondary border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-[1.02] backdrop-blur-sm"
      >
        {/* Priority accent line */}
        {task.priority && (
          <div 
            className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
            style={{ backgroundColor: priorityConfig.color }}
          />
        )}

        {/* Due date status indicator */}
        {dueDateStatus && (
          <div 
            className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${dueDateStatus.bg} ${dueDateStatus.textColor}`}
          >
            {dueDateStatus.text}
          </div>
        )}

        {/* Image attachment */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="relative">
            <img
              src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              className="h-32 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header with menu */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Priority and tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {task.priority && (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.ring}`}>
                    <span>{priorityConfig.icon}</span>
                    {task.priority}
                  </div>
                )}
                {taskTagsSplit.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </div>
                ))}
              </div>
              
              {/* Title and points */}
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                  {task.title}
                </h4>
                
              </div>
            </div>
            
            {/* Action menu */}
            <div className="relative ml-2">
              <button 
                onClick={handleMenuClick}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <EllipsisVertical size={14} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-8 z-30 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg py-1 w-36 backdrop-blur-sm">
                  <button
                    onClick={(e) => handleMenuAction('view', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={(e) => handleMenuAction('edit', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-600 my-1" />
                  <button
                    onClick={(e) => handleMenuAction('delete', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Dates */}
          {(formattedStartDate || formattedDueDate) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {formattedStartDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Start: {formattedStartDate}</span>
                </div>
              )}
              {formattedDueDate && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>Due: {formattedDueDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              {task.assignee && (
                <div className="flex items-center space-x-1">
                  <img
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                    alt={task.assignee.username}
                    className="h-6 w-6 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                    {task.assignee.username}
                  </span>
                </div>
              )}
              {task.author && !task.assignee && (
                <div className="flex items-center space-x-1">
                  <img
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl!}`}
                    alt={task.author.username}
                    className="h-6 w-6 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                    {task.author.username}
                  </span>
                </div>
              )}
            </div>

            {/* Comments */}
            {numberOfComments > 0 && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MessageSquareMore size={14} />
                <span className="text-xs">{numberOfComments}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={task.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default BoardView;