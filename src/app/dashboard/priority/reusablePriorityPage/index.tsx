
import { useGlobalStore } from "@/stores/globalStore";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import PriorityEmptyState from "@/components/PriorityEmptyState";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Priority, Task } from "@/hooks/useApi";
import { useGetTasksByUserQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/authProvider";
import { getPriorityTheme, getPriorityButtonClasses, getPriorityGradientClasses, getPriorityBadgeClasses, getPriorityGradientOverlay, getPriorityShadowClasses, getPriorityContrastTextColor, getPriorityTextBackdrop } from "@/lib/priorityThemes";

type Props = {
  priority: Priority;
};

const getColumns = (priority: Priority): GridColDef[] => {
  const theme = getPriorityTheme(priority);
  
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-900 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/20 shadow-sm";
      case "Work In Progress":
        return "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-900 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20 shadow-sm";
      case "Under Review":
        return "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-900 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-500/20 shadow-sm";
      default:
        return "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-900 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/20 shadow-sm";
    }
  };

  return [
    {
      field: "title",
      headerName: "Title",
      width: 220,
      renderCell: (params) => (
        <div className="font-semibold text-gray-900 dark:text-gray-50 truncate px-2 py-1">
          {params.value}
        </div>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 280,
      renderCell: (params) => (
        <div className="text-gray-700 dark:text-gray-200 text-sm line-clamp-2 px-2 py-1 leading-relaxed font-medium">
          {params.value || "No description"}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => (
        <div className="px-2 py-1 flex justify-start">
          <span className={getStatusBadgeClasses(params.value)}>
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      renderCell: (params) => (
        <div className="px-2 py-1 flex justify-start">
          <span className={`${getPriorityBadgeClasses(params.value as Priority)} shadow-sm font-semibold`}>
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 140,
      renderCell: (params) => (
        <div className="text-gray-700 dark:text-gray-200 text-sm px-2 py-1">
          {params.value ? (
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-xs font-semibold">
              🏷️ {params.value}
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 italic">No tags</span>
          )}
        </div>
      ),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 140,
      renderCell: (params) => (
        <div className="text-gray-700 dark:text-gray-200 text-sm px-2 py-1 font-semibold">
          {params.value ? new Date(params.value).toLocaleDateString() : (
            <span className="text-gray-500 dark:text-gray-400 italic">Not set</span>
          )}
        </div>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 140,
      renderCell: (params) => (
        <div className="text-gray-700 dark:text-gray-200 text-sm px-2 py-1 font-semibold">
          {params.value ? (
            <span className={`${new Date(params.value) < new Date() ? 'text-red-600 dark:text-red-300 font-bold' : ''}`}>
              {new Date(params.value).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 italic">Not set</span>
          )}
        </div>
      ),
    },
    {
      field: "author",
      headerName: "Author",
      width: 160,
      renderCell: (params) => (
        <div className="text-gray-700 dark:text-gray-200 text-sm px-2 py-1 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
              {(params.row.author?.username || "U").charAt(0).toUpperCase()}
            </span>
            {params.row.author?.username || "Unknown"}
          </div>
        </div>
      ),
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 160,
      renderCell: (params) => (
        <div className="text-gray-700 dark:text-gray-200 text-sm px-2 py-1 font-semibold">
          {params.row.assignee?.username ? (
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full flex items-center justify-center text-xs font-bold">
                {params.row.assignee.username.charAt(0).toUpperCase()}
              </span>
              {params.row.assignee.username}
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 italic">Unassigned</span>
          )}
        </div>
      ),
    },
  ];
};

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const auth = useAuth();
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  const theme = getPriorityTheme(priority);
  
  // Improved user ID resolution with better debugging
  let userId: number | null = null;
  
  // Try to get userId from auth.user.userId first (database ID), then sub, then currentUser
  if (auth.user?.userId && typeof auth.user.userId === 'number') {
    userId = auth.user.userId;
  } else if (auth.user?.sub) {
    const parsedFromSub = parseInt(auth.user.sub);
    if (!isNaN(parsedFromSub)) {
      userId = parsedFromSub;
    }
  } else if (currentUser?.userId) {
    userId = currentUser.userId;
  }
  
  console.log('Priority Page Debug:', {
    priority,
    authUser: auth.user,
    authUserSub: auth.user?.sub,
    authUserUserId: auth.user?.userId,
    currentUser,
    resolvedUserId: userId,
    userLoading,
    isAuthenticated: auth.isAuthenticated
  });
  
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetTasksByUserQuery(userId, { skip: userId === null || !auth.isAuthenticated });

  const isDarkMode = useGlobalStore((state) => state.isDarkMode);
  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  console.log('Tasks Debug:', {
    tasks: tasks?.length || 0,
    filteredTasks: filteredTasks?.length || 0,
    isLoading,
    isTasksError,
    tasksError
  });

  const columns = getColumns(priority);

  // Listen for task updates and refetch tasks
  useEffect(() => {
    const handleTaskUpdated = () => {
      refetchTasks();
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdated);
    };
  }, [refetchTasks]);

  if (userLoading || isLoading) {
    return (
      <div className="flex w-full flex-col p-8">
        {/* Enhanced header with gradient */}
        <div className="mb-8">
          <div className={`relative bg-gradient-to-r ${getPriorityGradientClasses(priority)} rounded-lg p-6 ${getPriorityShadowClasses(priority)} overflow-hidden`}>
            {/* Gradient overlay for better text contrast */}
            <div className={`absolute inset-0 ${getPriorityGradientOverlay(priority)} rounded-lg`}></div>
            <div className="relative z-10">
              <div className={`inline-block ${getPriorityTextBackdrop(priority)}`}>
                <h1 className={`text-3xl font-bold ${getPriorityContrastTextColor(priority)} mb-2`}>
                  {priority} Priority Tasks
                </h1>
                <p className={`${getPriorityContrastTextColor(priority)}`}>
                  Loading your {priority.toLowerCase()} priority tasks...
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative">
              <div 
                className="animate-spin rounded-full h-16 w-16 border-4 border-opacity-25 mx-auto mb-6"
                style={{ 
                  borderColor: theme.primaryColor,
                  borderTopColor: 'transparent'
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl" role="img" aria-label="loading">
                  {theme.emptyStateIcon}
                </span>
              </div>
            </div>
            <p className="text-lg font-semibold" style={{ color: theme.primaryColor }}>
              Loading {priority.toLowerCase()} priority tasks...
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">
              Please wait while we fetch your tasks
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user || userId === null) {
    return (
      <div className="flex w-full flex-col p-8">
        {/* Enhanced header with gradient */}
        <div className="mb-8">
          <div className={`relative bg-gradient-to-r ${getPriorityGradientClasses(priority)} rounded-lg p-6 ${getPriorityShadowClasses(priority)} overflow-hidden`}>
            {/* Gradient overlay for better text contrast */}
            <div className={`absolute inset-0 ${getPriorityGradientOverlay(priority)} rounded-lg`}></div>
            <div className="relative z-10">
              <div className={`inline-block ${getPriorityTextBackdrop(priority)}`}>
                <h1 className={`text-3xl font-bold ${getPriorityContrastTextColor(priority)} mb-2`}>
                  {priority} Priority Tasks
                </h1>
                <p className={`${getPriorityContrastTextColor(priority)}`}>
                  Authentication required to view tasks
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-700 dark:text-gray-200 mb-6 font-medium">
              Please log in to view your {priority.toLowerCase()} priority tasks
            </p>
            <button 
              onClick={() => window.location.href = '/auth/login'} 
              className="bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 border-blue-500 inline-flex items-center justify-center rounded-md border px-6 py-3 text-base font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTasksError) {
    return (
      <div className="flex w-full flex-col p-8">
        {/* Enhanced header with gradient */}
        <div className="mb-8">
          <div className={`relative bg-gradient-to-r ${getPriorityGradientClasses(priority)} rounded-lg p-6 ${getPriorityShadowClasses(priority)} overflow-hidden`}>
            {/* Gradient overlay for better text contrast */}
            <div className={`absolute inset-0 ${getPriorityGradientOverlay(priority)} rounded-lg`}></div>
            <div className="relative z-10">
              <div className={`inline-block ${getPriorityTextBackdrop(priority)}`}>
                <h1 className={`text-3xl font-bold ${getPriorityContrastTextColor(priority)} mb-2`}>
                  {priority} Priority Tasks
                </h1>
                <p className={`${getPriorityContrastTextColor(priority)}`}>
                  Error loading tasks
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error Loading Tasks
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-2 font-semibold">
              Failed to load {priority.toLowerCase()} priority tasks
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 font-medium">
              {tasksError?.message || 'Unknown error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className={getPriorityButtonClasses(priority)}
            >
              <span className="mr-2">🔄</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0 || filteredTasks?.length === 0) {
    return (
      <div className="flex w-full flex-col p-8">
        <ModalNewTask
          isOpen={isModalNewTaskOpen}
          onClose={() => setIsModalNewTaskOpen(false)}
          defaultPriority={priority}
        />
        
        {/* Enhanced header with gradient */}
        <div className="mb-8">
          <div className={`relative bg-gradient-to-r ${getPriorityGradientClasses(priority)} rounded-lg p-6 ${getPriorityShadowClasses(priority)} overflow-hidden`}>
            {/* Gradient overlay for better text contrast */}
            <div className={`absolute inset-0 ${getPriorityGradientOverlay(priority)} rounded-lg`}></div>
            <div className="relative z-10">
              <div className={`inline-block ${getPriorityTextBackdrop(priority)}`}>
                <h1 className={`text-3xl font-bold ${getPriorityContrastTextColor(priority)} mb-2`}>
                  {priority} Priority Tasks
                </h1>
                <p className={`${getPriorityContrastTextColor(priority)}`}>
                  {!tasks || tasks.length === 0 
                    ? "Get started by creating your first task" 
                    : `Manage your ${priority.toLowerCase()} priority items`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <PriorityEmptyState
          priority={priority}
          onCreateTask={() => setIsModalNewTaskOpen(true)}
          totalTasks={tasks?.length || 0}
        />
      </div>
    );
  }

  return (
    <main className="flex w-full flex-col p-8" role="main" aria-labelledby={`${priority}-priority-heading`}>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        defaultPriority={priority}
      />
      
      {/* Enhanced header with gradient */}
      <div className="mb-8">
        <div className={`relative bg-gradient-to-r ${getPriorityGradientClasses(priority)} rounded-lg p-6 ${getPriorityShadowClasses(priority)} overflow-hidden`}>
          {/* Gradient overlay for better text contrast */}
          <div className={`absolute inset-0 ${getPriorityGradientOverlay(priority)} rounded-lg`}></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className={`${getPriorityTextBackdrop(priority)}`}>
              <h1 id={`${priority}-priority-heading`} className={`text-3xl font-bold ${getPriorityContrastTextColor(priority)} mb-2`}>
                {priority} Priority Tasks
              </h1>
              <p className={`${getPriorityContrastTextColor(priority)}`}>
                Manage your {priority.toLowerCase()} priority items effectively
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                className={`bg-white/30 hover:bg-white/40 backdrop-blur-sm px-6 py-3 font-bold ${getPriorityContrastTextColor(priority)} rounded-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-white/30 hover:border-white/50 filter drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2`}
                onClick={() => setIsModalNewTaskOpen(true)}
                aria-label={`Add new ${priority.toLowerCase()} priority task`}
                type="button"
              >
                <span className="mr-2" aria-hidden="true">➕</span>
                Create {priority} Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Priority Tasks */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${theme.primaryColor}15` }}
              >
                <span className="text-2xl" role="img" aria-label={`${priority} priority`}>
                  {theme.emptyStateIcon}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {priority} Priority Tasks
                </p>
                <p className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                  {filteredTasks?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <span className="text-2xl" role="img" aria-label="completed">
                  ✅
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {filteredTasks?.filter(task => task.status === 'Completed').length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <span className="text-2xl" role="img" aria-label="progress">
                  📊
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Progress
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredTasks?.length > 0 
                    ? Math.round((filteredTasks.filter(task => task.status === 'Completed').length / filteredTasks.length) * 100)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced View Toggle */}
      <div className="mb-8 bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1" role="tablist" aria-label="View options">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                view === "list" 
                  ? `text-white shadow-sm` 
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              style={view === "list" ? { backgroundColor: theme.primaryColor } : {}}
              role="tab"
              aria-selected={view === "list"}
              aria-controls="tasks-content"
              type="button"
              aria-label="Switch to list view"
            >
              <span className="mr-2" aria-hidden="true">📋</span>
              List View
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                view === "table" 
                  ? `text-white shadow-sm` 
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              style={view === "table" ? { backgroundColor: theme.primaryColor, focusRingColor: theme.primaryColor } : { focusRingColor: theme.primaryColor }}
              role="tab"
              aria-selected={view === "table"}
              aria-controls="tasks-content"
              type="button"
              aria-label="Switch to table view"
            >
              <span className="mr-2" aria-hidden="true">📊</span>
              Table View
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center font-medium">
            <span className="mr-2">📈</span>
            Showing {filteredTasks?.length || 0} {priority.toLowerCase()} priority tasks
            {tasks && tasks.length > 0 && (
              <span className="ml-2 text-xs font-medium">
                ({filteredTasks?.length || 0} of {tasks.length} total)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div id="tasks-content" role="tabpanel" aria-labelledby={`${priority}-priority-heading`}>
        {view === "list" ? (
          <div className="space-y-6" role="list" aria-label={`${priority} priority tasks list`}>
            {filteredTasks?.map((task: Task) => (
              <div key={task.id} role="listitem">
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        ) : (
        view === "table" && filteredTasks && (
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Mobile/Tablet responsive table wrapper */}
            <div className="overflow-x-auto">
              <DataGrid
                rows={filteredTasks}
                columns={columns}
                checkboxSelection
                getRowId={(row) => row.id}
                className={dataGridClassNames}
                sx={{
                  ...dataGridSxStyles(isDarkMode),
                  minWidth: '800px', // Ensure table has minimum width on mobile
                  '& .MuiDataGrid-root': {
                    border: 'none',
                    fontFamily: 'inherit',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: isDarkMode ? '#1d1f21' : theme.lightBg,
                    borderBottom: `3px solid ${theme.primaryColor}`,
                    minHeight: '56px !important',
                    '& .MuiDataGrid-columnHeader': {
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      '&:focus': {
                        outline: `2px solid ${theme.primaryColor}`,
                        outlineOffset: '-2px',
                      },
                    },
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: isDarkMode ? '#e5e7eb' : theme.textColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                  },
                  '& .MuiDataGrid-cell': {
                    border: 'none',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    '&:focus': {
                      outline: `2px solid ${theme.primaryColor}`,
                      outlineOffset: '-2px',
                    },
                  },
                  '& .MuiDataGrid-row': {
                    borderBottom: `1px solid ${isDarkMode ? '#2d3135' : '#e5e7eb'}`,
                    minHeight: '64px !important',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#2d3135' : `${theme.lightBg}80`,
                      transition: 'background-color 0.2s ease',
                    },
                    '&:focus-within': {
                      backgroundColor: isDarkMode ? '#2d3135' : `${theme.lightBg}80`,
                      outline: `2px solid ${theme.primaryColor}`,
                      outlineOffset: '-2px',
                    },
                    '&.Mui-selected': {
                      backgroundColor: isDarkMode ? `${theme.primaryColor}20` : `${theme.primaryColor}10`,
                      '&:hover': {
                        backgroundColor: isDarkMode ? `${theme.primaryColor}30` : `${theme.primaryColor}20`,
                      },
                    },
                    // Improve contrast for better accessibility
                    '& .MuiDataGrid-cell': {
                      color: isDarkMode ? '#f9fafb' : '#0f172a',
                    },
                  },
                  '& .MuiDataGrid-withBorderColor': {
                    borderColor: isDarkMode ? '#2d3135' : '#e5e7eb',
                  },
                  '& .MuiCheckbox-root': {
                    color: theme.primaryColor,
                    '&.Mui-checked': {
                      color: theme.primaryColor,
                    },
                    '&:focus': {
                      outline: `2px solid ${theme.primaryColor}`,
                      outlineOffset: '2px',
                    },
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: `1px solid ${isDarkMode ? '#2d3135' : '#e5e7eb'}`,
                    backgroundColor: isDarkMode ? '#1d1f21' : '#f9fafb',
                  },
                  // Responsive adjustments
                  '@media (max-width: 768px)': {
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontSize: '0.75rem',
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.75rem',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    },
                  },
                }}
                autoHeight
                disableRowSelectionOnClick
                rowHeight={64}
                headerHeight={56}
                // Accessibility improvements
                aria-label={`${priority} priority tasks table`}
                localeText={{
                  checkboxSelectionHeaderName: `Select ${priority} priority tasks`,
                  columnMenuLabel: 'Column menu',
                  columnMenuShowColumns: 'Show columns',
                  columnMenuFilter: 'Filter',
                  columnMenuHideColumn: 'Hide column',
                  columnMenuUnsort: 'Remove sort',
                  columnMenuSortAsc: 'Sort ascending',
                  columnMenuSortDesc: 'Sort descending',
                }}
              />
            </div>
          </div>
        )
        )}
      </div>
    </main>
  );
};

export default ReusablePriorityPage;
