import { useGlobalStore } from "@/stores/globalStore";
import { useGetTasksQuery } from "@/hooks/useApi";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { Plus, Calendar, Filter, BarChart3, Clock, ChevronDown } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  tasks?: any[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ 
  id, 
  setIsModalNewTaskOpen, 
  tasks: propTasks, 
  tasksLoading, 
  tasksError, 
  refetchTasks 
}: Props) => {
  const isDarkMode = useGlobalStore().isDarkMode;
  
  // Fallback to fetching data if not provided via props
  const { data: fetchedTasks, isLoading: fetchedLoading, error: fetchedError } = useGetTasksQuery(
    { projectId: Number(id) }, 
    { skip: !!propTasks }
  );
  
  // Use prop data if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks;
  const isLoading = tasksLoading !== undefined ? tasksLoading : fetchedLoading;
  const error = tasksError !== undefined ? tasksError : fetchedError;

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  // Priority colors for Gantt bars
  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "Urgent": return "#FF3B30";
      case "High": return "#FF9500"; 
      case "Medium": return "#007AFF";
      case "Low": return "#34C759";
      default: return "#8E8E93";
    }
  };

  const ganttTasks = useMemo(() => {
    return (
      tasks?.filter(task => task.startDate && task.dueDate).map((task) => ({
        start: new Date(task.startDate as string),
        end: new Date(task.dueDate as string),
        name: task.title,
        id: `Task-${task.id}`,
        type: "task" as TaskTypeItems,
        progress: task.status === "Completed" ? 100 : task.points ? Math.min((task.points / 10) * 100, 90) : 0,
        isDisabled: false,
        styles: {
          backgroundColor: getPriorityColor(task.priority),
          backgroundSelectedColor: getPriorityColor(task.priority),
          progressColor: isDarkMode ? "#ffffff" : "#000000",
          progressSelectedColor: isDarkMode ? "#ffffff" : "#000000",
        },
      })) || []
    );
  }, [tasks, isDarkMode]);

  const handleViewModeChange = (viewMode: ViewMode) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode,
    }));
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case ViewMode.Day: return "📅";
      case ViewMode.Week: return "📋";
      case ViewMode.Month: return "🗓️";
      default: return "📅";
    }
  };

  const tasksWithDates = tasks?.filter(task => task.startDate && task.dueDate) || [];
  const tasksWithoutDates = tasks?.filter(task => !task.startDate || !task.dueDate) || [];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading timeline...</p>
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
    <div className="px-6 pb-8 max-w-[1800px] mx-auto">
      {/* Enhanced Header */}
      <div className="py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={24} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Project Timeline
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tasksWithDates.length} task{tasksWithDates.length !== 1 ? 's' : ''} scheduled
              {tasksWithoutDates.length > 0 && (
                <span className="text-orange-600 dark:text-orange-400">
                  {" "}• {tasksWithoutDates.length} task{tasksWithoutDates.length !== 1 ? 's' : ''} missing dates
                </span>
              )}
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

        {/* View Mode Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-dark-secondary">
              {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    displayOptions.viewMode === mode
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{getViewModeIcon(mode)}</span>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Urgent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-400">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      {ganttTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4 opacity-50">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No scheduled tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Tasks need start and due dates to appear on the timeline. Create or edit tasks to add scheduling information.
          </p>
          <button
            onClick={() => setIsModalNewTaskOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={18} />
            Create Scheduled Task
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="timeline-container">
            <Gantt
              tasks={ganttTasks}
              {...displayOptions}
              columnWidth={displayOptions.viewMode === ViewMode.Month ? 180 : displayOptions.viewMode === ViewMode.Week ? 120 : 80}
              listCellWidth="200px"
              barBackgroundColor={isDarkMode ? "#374151" : "#E5E7EB"}
              barBackgroundSelectedColor={isDarkMode ? "#1F2937" : "#D1D5DB"}
              arrowColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
              fontFamily="Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
              fontSize="13px"
              gridLineColor={isDarkMode ? "#374151" : "#F3F4F6"}
              todayColor={isDarkMode ? "#1E40AF" : "#3B82F6"}
              TooltipContent={({ task, fontSize, fontFamily }) => (
                <div 
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 max-w-xs"
                  style={{ fontSize, fontFamily }}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {task.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Start: {task.start.toLocaleDateString()}</div>
                    <div>End: {task.end.toLocaleDateString()}</div>
                    <div>Progress: {Math.round(task.progress || 0)}%</div>
                  </div>
                </div>
              )}
            />
          </div>
          
          {/* Tasks without dates warning */}
          {tasksWithoutDates.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-orange-50 dark:bg-orange-900/10">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Clock size={16} />
                <span className="text-sm font-medium">
                  {tasksWithoutDates.length} task{tasksWithoutDates.length !== 1 ? 's' : ''} not shown (missing start/due dates)
                </span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Add dates to these tasks to include them in the timeline view.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Timeline;
