import Header from "@/components/Header";
import { Task, useGetTasksQuery } from "@/hooks/useApi";
import React, { useState, useMemo } from "react";
import TaskCard from "@/components/TaskCard";
import { Plus, Filter, SortAsc, Grid3X3, List, Search } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  tasks?: Task[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

type ViewMode = "grid" | "list";
type SortOption = "priority" | "dueDate" | "title" | "status";
type FilterOption = "all" | "To Do" | "Work In Progress" | "Under Review" | "Completed";

const ListView = ({ 
  id, 
  setIsModalNewTaskOpen, 
  tasks: propTasks, 
  tasksLoading, 
  tasksError, 
  refetchTasks 
}: Props) => {
  // Fallback to fetching data if not provided via props
  const { data: fetchedTasks, isLoading: fetchedLoading, error: fetchedError } = useGetTasksQuery(
    { projectId: Number(id) }, 
    { skip: !!propTasks }
  );
  
  // Use prop data if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks;
  const isLoading = tasksLoading !== undefined ? tasksLoading : fetchedLoading;
  const error = tasksError !== undefined ? tasksError : fetchedError;

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const priorityOrder = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3, "Backlog": 4 };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks || [];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter(task => (task.status || "To Do") === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 5;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 5;
          return aPriority - bPriority;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return (a.status || "To Do").localeCompare(b.status || "To Do");
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, filterBy, sortBy]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
      </div>
    </div>
  );
  
  if (error) return (
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Task List
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={() => setIsModalNewTaskOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Enhanced Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
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

          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-dark-secondary text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="To Do">To Do</option>
              <option value="Work In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-dark-secondary text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="title">Sort by Title</option>
              <option value="status">Sort by Status</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-dark-secondary">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-all duration-200 ${
                  viewMode === "grid" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-all duration-200 ${
                  viewMode === "list" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid/List */}
      {filteredAndSortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4 opacity-50">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || filterBy !== "all" ? "No matching tasks" : "No tasks yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {searchQuery || filterBy !== "all" 
              ? "Try adjusting your search or filters to find more tasks."
              : "Get started by creating your first task for this project."
            }
          </p>
          {(!searchQuery && filterBy === "all") && (
            <button
              onClick={() => setIsModalNewTaskOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <Plus size={18} />
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div className={`
          ${viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }
        `}>
          {filteredAndSortedTasks.map((task: Task) => (
            <div key={task.id} className={viewMode === "list" ? "max-w-none" : ""}>
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListView;
