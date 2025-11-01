import Modal from "@/components/Modal";
import { Priority, Status, useCreateTaskMutation, useGetUsersQuery, useGetProjectsQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { getPriorityTheme, getPriorityButtonClasses, getPriorityBadgeClasses } from "@/lib/priorityThemes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
  defaultPriority?: Priority;
};

const ModalNewTask = ({ isOpen, onClose, id = null, defaultPriority }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { currentUser } = useCurrentUser();
  const {data: users} = useGetUsersQuery(undefined, {
    skip: !isOpen, // Only load when modal is open
  });
  const {data: projects} = useGetProjectsQuery({}, {
    skip: !isOpen, // Only load when modal is open
  });
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(defaultPriority || Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  // Set current user as default author when user data loads
  useEffect(() => {
    if (currentUser?.userId && !authorUserId) {
      setAuthorUserId(currentUser.userId.toString());
    }
  }, [currentUser, authorUserId]);

  // Update priority when defaultPriority changes
  useEffect(() => {
    if (defaultPriority) {
      setPriority(defaultPriority);
    }
  }, [defaultPriority]);

  const handleSubmit = async () => {
    console.log('handleSubmit called', { title, authorUserId, id, projectId });
    if (!title || !authorUserId || !((id !== null) || projectId)) {
      console.log('Validation failed', { title, authorUserId, id, projectId });
      return;
    }

    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        tags,
        startDate: startDate ? formatISO(new Date(startDate)) : undefined,
        dueDate: dueDate ? formatISO(new Date(dueDate)) : undefined,
        authorUserId: parseInt(authorUserId),
        assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
        projectId: id !== null ? Number(id) : Number(projectId),
      };

      console.log('Creating task with data:', taskData);
      await createTask(taskData).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const isFormValid = () => {
    return title && authorUserId && (id !== null || projectId);
  };

  const theme = getPriorityTheme(priority);

  const baseInputStyles = "w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-dark-tertiary border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
  
  const focusStyles = `focus:border-transparent focus:ring-2`;
  
  const inputStyles = `${baseInputStyles} ${focusStyles}`;
  
  const selectStyles = `${baseInputStyles} ${focusStyles} cursor-pointer`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <div className="mt-6">
        {/* Priority indicator */}
        {defaultPriority && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{theme.emptyStateIcon}</span>
              <div>
                <h3 className="font-semibold" style={{ color: theme.primaryColor }}>
                  Creating {priority} Priority Task
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This task will be set to {priority.toLowerCase()} priority by default
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Title *
            </label>
            <input
              type="text"
              className={inputStyles}
              placeholder="Enter a clear, descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ 
                focusRingColor: theme.primaryColor,
                borderColor: title ? theme.primaryColor : undefined 
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows={3}
              className={inputStyles}
              placeholder="Provide additional context and details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ 
                focusRingColor: theme.primaryColor,
                borderColor: description ? theme.primaryColor : undefined 
              }}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                className={selectStyles}
                value={status}
                onChange={(e) =>
                  setStatus(Status[e.target.value as keyof typeof Status])
                }
                style={{ 
                  focusRingColor: theme.primaryColor,
                  borderColor: status ? theme.primaryColor : undefined 
                }}
              >
                <option value={Status.ToDo}>To Do</option>
                <option value={Status.WorkInProgress}>Work In Progress</option>
                <option value={Status.UnderReview}>Under Review</option>
                <option value={Status.Completed}>Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority *
              </label>
              <div className="relative">
                <select
                  className={selectStyles}
                  value={priority}
                  onChange={(e) =>
                    setPriority(Priority[e.target.value as keyof typeof Priority])
                  }
                  style={{ 
                    focusRingColor: theme.primaryColor,
                    borderColor: theme.primaryColor
                  }}
                >
                  <option value={Priority.Urgent}>🚨 Urgent</option>
                  <option value={Priority.High}>⚡ High</option>
                  <option value={Priority.Medium}>📋 Medium</option>
                  <option value={Priority.Low}>🌱 Low</option>
                  <option value={Priority.Backlog}>📦 Backlog</option>
                </select>
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <span className={getPriorityBadgeClasses(priority)}>
                    {priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <input
              type="text"
              className={inputStyles}
              placeholder="Add tags separated by commas (e.g., frontend, bug, feature)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ 
                focusRingColor: theme.primaryColor,
                borderColor: tags ? theme.primaryColor : undefined 
              }}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                className={inputStyles}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  focusRingColor: theme.primaryColor,
                  borderColor: startDate ? theme.primaryColor : undefined 
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                className={inputStyles}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ 
                  focusRingColor: theme.primaryColor,
                  borderColor: dueDate ? theme.primaryColor : undefined 
                }}
              />
            </div>
          </div>

          {/* Team Assignment */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Author *
              </label>
              <select
                className={selectStyles}
                value={authorUserId}
                onChange={(e) => setAuthorUserId(e.target.value)}
                style={{ 
                  focusRingColor: theme.primaryColor,
                  borderColor: authorUserId ? theme.primaryColor : undefined 
                }}
              >
                <option value="">Select Author</option>
                {users?.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    👤 {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assignee
              </label>
              <select
                className={selectStyles}
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                style={{ 
                  focusRingColor: theme.primaryColor,
                  borderColor: assignedUserId ? theme.primaryColor : undefined 
                }}
              >
                <option value="">Select Assignee (Optional)</option>
                {users?.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    👥 {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Selection */}
          {id === null && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project *
              </label>
              <select
                className={selectStyles}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{ 
                  focusRingColor: theme.primaryColor,
                  borderColor: projectId ? theme.primaryColor : undefined 
                }}
              >
                <option value="">Select Project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    📁 {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                !isFormValid() || isLoading 
                  ? "bg-gray-400 cursor-not-allowed opacity-50" 
                  : `${getPriorityButtonClasses(priority)} shadow-lg hover:shadow-xl`
              }`}
              disabled={!isFormValid() || isLoading}
              style={!isFormValid() || isLoading ? {} : { 
                backgroundColor: theme.primaryColor,
                focusRingColor: theme.primaryColor 
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating Task...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">✨</span>
                  Create {priority} Task
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ModalNewTask;
