
import { useGlobalStore } from "@/stores/globalStore";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Priority, Task } from "@/hooks/useApi";
import { useGetTasksByUserQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";
import { useAuth } from "@/app/authProvider";

type Props = {
  priority: Priority;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value?.author || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value?.assignee || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const auth = useAuth();
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  
  // Improved user ID resolution with better debugging
  const userId = auth.user?.sub ? parseInt(auth.user.sub) : currentUser?.userId ?? null;
  
  console.log('Priority Page Debug:', {
    priority,
    authUser: auth.user,
    currentUser,
    userId,
    userLoading,
    isAuthenticated: auth.isAuthenticated
  });
  
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
    error: tasksError,
  } = useGetTasksByUserQuery(userId || 0, { skip: userId === null || !auth.isAuthenticated });

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

  if (userLoading || isLoading) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name={`${priority} Priority Tasks`} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {priority.toLowerCase()} priority tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user || userId === null) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name={`${priority} Priority Tasks`} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Authentication required to view tasks</p>
            <button 
              onClick={() => window.location.href = '/auth/login'} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
        <Header name={`${priority} Priority Tasks`} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Error loading {priority.toLowerCase()} priority tasks
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {tasksError?.message || 'Unknown error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name={`${priority} Priority Tasks`} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No tasks found</p>
            <button
              onClick={() => setIsModalNewTaskOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create First Task
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (filteredTasks?.length === 0) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name={`${priority} Priority Tasks`} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No {priority.toLowerCase()} priority tasks found</p>
            <p className="text-gray-500 text-sm mb-4">
              You have {tasks.length} total tasks, but none with {priority} priority.
            </p>
            <button
              onClick={() => setIsModalNewTaskOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create {priority} Priority Task
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name={`${priority} Priority Tasks`}
        buttonComponent={
          <button
            className="mr-3 bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 rounded transition-colors"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add {priority} Task
          </button>
        }
      />

      {/* Summary Stats */}
      <div className="mb-6 bg-white dark:bg-dark-secondary rounded-lg p-6 shadow">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold dark:text-white mb-2">
              {priority} Priority Tasks
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredTasks?.length || 0} of {tasks?.length || 0} total tasks have {priority.toLowerCase()} priority
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredTasks?.length || 0}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">{priority} Tasks</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredTasks?.filter(task => task.status === 'Completed').length || 0}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
            </div>
          </div>
        </div>
      </div>
      {/* View Toggle */}
      <div className="mb-6 bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
        <div className="flex justify-between items-center">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 text-sm transition-colors ${
                view === "list" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 text-sm transition-colors ${
                view === "table" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              Table View
            </button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredTasks?.length || 0} {priority.toLowerCase()} priority tasks
          </div>
        </div>
      </div>

      {/* Content Area */}
      {view === "list" ? (
        <div className="space-y-4">
          {filteredTasks?.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        view === "table" && filteredTasks && (
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow">
            <DataGrid
              rows={filteredTasks}
              columns={columns}
              checkboxSelection
              getRowId={(row) => row.id}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
              autoHeight
              disableRowSelectionOnClick
            />
          </div>
        )
      )}
    </div>
  );
};

export default ReusablePriorityPage;
