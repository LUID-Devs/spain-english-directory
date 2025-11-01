import {
  Priority,
  Project,
  Task,
} from "@/hooks/useApi";
import { useAuth } from "@/app/authProvider";
import { useGetProjectsQuery, useGetTasksByUserQuery } from "@/hooks/useApi";
import { useGlobalStore } from "@/stores/globalStore";
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 250, flex: 1 },
  { 
    field: "status", 
    headerName: "Status", 
    width: 150,
    renderCell: (params) => {
      const status = params.value;
      let bgColor = 'bg-gray-100 text-gray-800';
      if (status === 'Completed') bgColor = 'bg-green-100 text-green-800';
      else if (status === 'Work In Progress') bgColor = 'bg-yellow-100 text-yellow-800';
      else if (status === 'Under Review') bgColor = 'bg-blue-100 text-blue-800';
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
          {status}
        </span>
      );
    }
  },
  { 
    field: "priority", 
    headerName: "Priority", 
    width: 120,
    renderCell: (params) => {
      const priority = params.value;
      let bgColor = 'bg-gray-100 text-gray-800';
      if (priority === 'Urgent') bgColor = 'bg-red-100 text-red-800';
      else if (priority === 'High') bgColor = 'bg-orange-100 text-orange-800';
      else if (priority === 'Medium') bgColor = 'bg-yellow-100 text-yellow-800';
      else if (priority === 'Low') bgColor = 'bg-green-100 text-green-800';
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
          {priority}
        </span>
      );
    }
  },
  { 
    field: "dueDate", 
    headerName: "Due Date", 
    width: 130,
    renderCell: (params) => {
      if (!params.value) return <span className="text-gray-400">No date</span>;
      
      const dueDate = new Date(params.value);
      const today = new Date();
      const isOverdue = dueDate < today;
      const isNearDue = dueDate < new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      return (
        <span className={`text-sm ${
          isOverdue ? 'text-red-600 font-medium' : 
          isNearDue ? 'text-yellow-600' : 
          'text-gray-600'
        }`}>
          {dueDate.toLocaleDateString()}
        </span>
      );
    }
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
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
  
  console.log('Dashboard Debug:', {
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
  const { data: projects, isLoading: isProjectsLoading, isError: projectsError } =
    useGetProjectsQuery();

  const isDarkMode = useGlobalStore((state) => state.isDarkMode);

  // Show loading while authenticating or fetching data
  if (authLoading || tasksLoading || isProjectsLoading) {
    return (
      <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {authLoading ? "Authenticating..." : "Loading dashboard data..."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Authentication required</p>
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

  // Handle critical errors - but don't block dashboard if only one data source fails
  if (tasksError && projectsError) {
    return (
      <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Unable to load dashboard data</p>
            <p className="text-gray-600 mb-4 text-sm">This may be a temporary network issue</p>
            <div className="space-x-2">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
              <button 
                onClick={() => window.location.href = '/auth/logout'} 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priorityCount = (tasks || []).reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      if (priority) {
        acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = (projects || []).reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold dark:text-white mb-2">
            Welcome back, {user?.preferred_username || user?.username || 'User'}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your project overview and recent activity.
          </p>
        </div>
      </div>
      
      {/* Error Alerts for Partial Failures */}
      {(tasksError || projectsError) && (
        <div className="mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  {tasksError && !projectsError && "Unable to load your tasks. "}
                  {projectsError && !tasksError && "Unable to load projects. "}
                  {tasksError && projectsError && "Unable to load some dashboard data. "}
                  Some information may be incomplete.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Status */}
      <div className="mb-6">
        <SubscriptionStatus />
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(tasks || []).length}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(tasks || []).filter(task => task.status === 'Completed').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {(tasks || []).filter(task => task.status === 'Work In Progress').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projects</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(projects || []).length}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Task Priority Distribution
          </h3>
          {taskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.barGrid}
                />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip
                  contentStyle={{
                    width: "min-content",
                    height: "min-content",
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill={chartColors.bar} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No tasks assigned to you yet</p>
                <p className="text-sm mt-1">Start by creating your first task!</p>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Project Status Overview
          </h3>
          {projectStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                  {projectStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No projects available</p>
                <p className="text-sm mt-1">Create your first project to get started!</p>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold dark:text-white">
              Your Recent Tasks
            </h3>
            {(tasks || []).length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min((tasks || []).length, 10)} of {(tasks || []).length} tasks
              </p>
            )}
          </div>
          <div style={{ height: 400, width: "100%" }}>
            {(tasks || []).length > 0 ? (
              <DataGrid
                rows={tasks || []}
                columns={taskColumns}
                checkboxSelection
                loading={tasksLoading}
                getRowClassName={() => "data-grid-row"}
                getCellClassName={() => "data-grid-cell"}
                className={dataGridClassNames}
                sx={dataGridSxStyles(isDarkMode)}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10, 20]}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <svg className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-lg mb-2">No tasks assigned</p>
                  <p className="text-sm">Tasks assigned to you will appear here. Get started by joining a project!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;