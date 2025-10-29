"use client";

import React from "react";
import { useGetTasksQuery, useUpdateTaskStatusMutation, useDeleteTaskMutation } from "@/state/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
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
  const { data: tasks, isLoading, error } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: number, toStatus: TaskStatus) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: TaskStatus;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: TaskStatus) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver()
    }),
  }));

  const tasksCount = tasks.filter((task) => (task.status || "To Do") === status).length;

  // Specific type for statusColor
  const statusColor: Record<TaskStatus, string> = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-5 items-center justify-center dark:text-neutral-500">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => (task.status || "To Do") === status)
        .map((task) => (
          <Task key={task.id} task={task} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
};

const Task = ({ task }: TaskProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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
      setIsEditMode(false);
      setIsModalOpen(true);
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
        setIsEditMode(false);
        setIsModalOpen(true);
        break;
      case 'edit':
        setIsEditMode(true);
        setIsModalOpen(true);
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

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700"
          : priority === "High"
          ? "bg-yellow-200 text-yellow-700"
          : priority === "Medium"
          ? "bg-green-200 text-green-700"
          : priority === "Low"
          ? "bg-blue-200 text-blue-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div 
        onClick={handleCardClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md cursor-pointer"
      >
          {task.attachments && task.attachments.length > 0 && (
            <Image
              src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              width={400}
              height={200}
              className="h-auto w-full rounded-t-md"
            />
          )}
          <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={handleMenuClick}
              className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
            >
              <EllipsisVertical size={16} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-md shadow-lg py-1 w-32">
                <button
                  onClick={(e) => handleMenuAction('view', e)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={(e) => handleMenuAction('edit', e)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => handleMenuAction('delete', e)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
          {task.description}
        </p>
        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />

        {/* Users */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignee && (
              <Image
                key={task.assignee.userId}
                src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                alt={task.assignee.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
            {task.author && (
              <Image
                key={task.author.userId}
                src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl!}`}
                alt={task.author.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
          </div>
          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <MessageSquareMore size={20} />
            <span className="ml-1 text-sm dark:text-neutral-400">
              {numberOfComments}
            </span>
          </div>
        </div>
          </div>
        </div>
      
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
        }}
        taskId={task.id}
        editMode={isEditMode}
      />
      
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