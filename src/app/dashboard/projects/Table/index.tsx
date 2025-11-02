import { useGlobalStore } from "@/stores/globalStore";
import { useGetTasksQuery } from "@/hooks/useApi";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useMemo, useState } from "react";
import { Plus, Table2, User, Calendar, Clock, Flag, Search, Download, Filter } from "lucide-react";
import { format } from "date-fns";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const TableView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useGlobalStore().isDarkMode;
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [searchQuery, setSearchQuery] = useState("");

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const config = {
      "Urgent": { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300", ring: "ring-red-600/20 dark:ring-red-500/20", icon: "🔥" },
      "High": { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300", ring: "ring-orange-600/20 dark:ring-orange-500/20", icon: "⚡" },
      "Medium": { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", ring: "ring-blue-600/20 dark:ring-blue-500/20", icon: "📋" },
      "Low": { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", ring: "ring-green-600/20 dark:ring-green-500/20", icon: "🌱" },
      "Backlog": { bg: "bg-gray-50 dark:bg-gray-900/20", text: "text-gray-700 dark:text-gray-300", ring: "ring-gray-600/20 dark:ring-gray-500/20", icon: "📦" },
    };
    
    const style = config[priority as keyof typeof config] || config.Backlog;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}>
        <span>{style.icon}</span>
        {priority}
      </span>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      "To Do": { bg: "bg-gray-50 dark:bg-gray-900/20", text: "text-gray-700 dark:text-gray-300", ring: "ring-gray-600/20" },
      "Work In Progress": { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", ring: "ring-blue-600/20" },
      "Under Review": { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300", ring: "ring-orange-600/20" },
      "Completed": { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", ring: "ring-green-600/20" },
    };
    
    const style = config[status as keyof typeof config] || config["To Do"];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}>
        {status}
      </span>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Task",
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <div className="py-2">
          <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
            {params.value}
          </div>
          {params.row.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
              {params.row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <StatusBadge status={params.value || "To Do"} />
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? <PriorityBadge priority={params.value} /> : <span className="text-gray-400">—</span>
      ),
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center gap-2">
          {params.value ? (
            <>
              <img
                src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${params.value.profilePictureUrl}`}
                alt={params.value.username}
                className="h-6 w-6 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {params.value.username}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
            <Calendar size={12} />
            {format(new Date(params.value), "MMM d, yyyy")}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
            <Clock size={12} />
            {format(new Date(params.value), "MMM d, yyyy")}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <div className="flex flex-wrap gap-1">
            {params.value.split(",").slice(0, 2).map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {tag.trim()}
              </span>
            ))}
            {params.value.split(",").length > 2 && (
              <span className="text-xs text-gray-400">+{params.value.split(",").length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
    {
      field: "points",
      headerName: "Points",
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {params.value}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
  ];

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks || [];
    
    return (tasks || []).filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.priority?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const customSxStyles = {
    border: 0,
    '& .MuiDataGrid-main': {
      border: 'none',
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
      borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: isDarkMode ? '#f3f4f6' : '#374151',
    },
    '& .MuiDataGrid-columnHeader': {
      '&:focus': {
        outline: 'none',
      },
      '&:focus-within': {
        outline: 'none',
      },
    },
    '& .MuiDataGrid-cell': {
      borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #f3f4f6',
      color: isDarkMode ? '#e5e7eb' : '#111827',
      fontSize: '0.875rem',
      '&:focus': {
        outline: 'none',
      },
      '&:focus-within': {
        outline: 'none',
      },
    },
    '& .MuiDataGrid-row': {
      backgroundColor: isDarkMode ? '#111827' : '#ffffff',
      '&:hover': {
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
      },
      '&.Mui-selected': {
        backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe',
        '&:hover': {
          backgroundColor: isDarkMode ? '#1d4ed8' : '#bfdbfe',
        },
      },
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
    },
    '& .MuiTablePagination-root': {
      color: isDarkMode ? '#e5e7eb' : '#374151',
    },
    '& .MuiDataGrid-selectedRowCount': {
      color: isDarkMode ? '#e5e7eb' : '#374151',
    },
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
      </div>
    </div>
  );
  
  if (error || !tasks) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-600 dark:text-red-400">An error occurred while fetching tasks</p>
      </div>
    </div>
  );

  return (
    <div className="px-6 pb-8 max-w-[1600px] mx-auto">
      {/* Enhanced Header */}
      <div className="py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Table2 className="text-blue-500" size={24} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Tasks Table
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} displayed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => setIsModalNewTaskOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-dark-secondary text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredTasks.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No matching tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Try adjusting your search to find more tasks.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Get started by creating your first task for this project.
          </p>
          <button
            onClick={() => setIsModalNewTaskOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={18} />
            Create First Task
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredTasks}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
              sx={customSxStyles}
              rowHeight={56}
              headerHeight={48}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView;
