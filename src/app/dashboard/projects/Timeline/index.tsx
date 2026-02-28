import { useGlobalStore } from "@/stores/globalStore";
import { useGetTasksQuery } from "@/hooks/useApi";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { Calendar, Filter, BarChart3, Clock, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  id: string;
  tasks?: any[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({
  id,
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

  // Priority colors for Gantt bars (grayscale)
  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "Urgent": return "#111827"; // gray-900
      case "High": return "#374151"; // gray-700
      case "Medium": return "#6B7280"; // gray-500
      case "Low": return "#D1D5DB"; // gray-300
      default: return "#F3F4F6"; // gray-100
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

  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case ViewMode.Day: return "Day";
      case ViewMode.Week: return "Week";
      case ViewMode.Month: return "Month";
      default: return "Day";
    }
  };

  const tasksWithDates = tasks?.filter(task => task.startDate && task.dueDate) || [];
  const tasksWithoutDates = tasks?.filter(task => !task.startDate || !task.dueDate) || [];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading timeline...</p>
      </div>
    </div>
  );

  if (error || !tasks) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-destructive">An error occurred while fetching tasks</p>
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
              <BarChart3 className="text-primary" size={24} />
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Project Timeline
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {tasksWithDates.length} task{tasksWithDates.length !== 1 ? 's' : ''} scheduled
              {tasksWithoutDates.length > 0 && (
                <span className="text-orange-600 dark:text-orange-400">
                  {" "}• {tasksWithoutDates.length} task{tasksWithoutDates.length !== 1 ? 's' : ''} missing dates
                </span>
              )}
            </p>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">View:</span>
            <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
              {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    displayOptions.viewMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {getViewModeLabel(mode)}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-900"></div>
              <span className="text-muted-foreground">Urgent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-700"></div>
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-500"></div>
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-300"></div>
              <span className="text-muted-foreground">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      {ganttTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No scheduled tasks
            </h3>
            <p className="text-muted-foreground max-w-md">
              Tasks need start and due dates to appear on the timeline. Edit tasks to add scheduling information.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
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
                todayColor={isDarkMode ? "#1E40AF" : "#3B82F6"}
                TooltipContent={({ task, fontSize, fontFamily }) => (
                  <div 
                    className="bg-background border border-border rounded-lg shadow-lg p-3 max-w-xs"
                    style={{ fontSize, fontFamily }}
                  >
                    <div className="font-semibold text-foreground mb-1">
                      {task.name}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
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
              <Alert className="m-4">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">
                    {tasksWithoutDates.length} task{tasksWithoutDates.length !== 1 ? 's' : ''} not shown (missing start/due dates)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Add dates to these tasks to include them in the timeline view.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Timeline;
