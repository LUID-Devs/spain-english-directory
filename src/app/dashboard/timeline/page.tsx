import { useGlobalStore } from "@/stores/globalStore";
import { useGetProjectsQuery } from "@/hooks/useApi";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { 
  Calendar, 
  Loader2, 
  AlertCircle, 
  FolderPlus,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = () => {
  const isDarkMode = useGlobalStore().isDarkMode;
  const navigate = useNavigate();
  const { data: projects, isLoading, isError, refetch } = useGetProjectsQuery();

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return (
      projects?.map((project) => ({
        start: new Date(project.startDate as string),
        end: new Date(project.endDate as string),
        name: project.name,
        id: `Project-${project.id}`,
        type: "project" as TaskTypeItems,
        progress: 50,
        isDisabled: false,
      })) || []
    );
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Projects Timeline
            </h1>
            <p className="text-muted-foreground">Visualize project schedules and milestones</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading timeline...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Projects Timeline
            </h1>
            <p className="text-muted-foreground">Visualize project schedules and milestones</p>
          </div>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Failed to load timeline"
          description="We couldn't load your projects. Please try again."
          action={{
            label: "Try Again",
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }

  // Empty State - No Projects
  if (!projects || projects.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Projects Timeline
            </h1>
            <p className="text-muted-foreground">Visualize project schedules and milestones</p>
          </div>
        </div>
        <EmptyState
          icon={Clock}
          title="No projects to display"
          description="Create your first project to see it on the timeline. Projects with start and end dates will appear here."
          action={{
            label: "Create Project",
            onClick: () => navigate("/dashboard/projects"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Projects Timeline
          </h1>
          <p className="text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''} displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-border bg-background text-foreground px-4 py-2 pr-8 leading-tight shadow hover:border-primary focus:outline-none"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
          <Button onClick={() => navigate("/dashboard/projects")}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-hidden rounded-md bg-card">
            <div className="timeline">
              <Gantt
                tasks={ganttTasks}
                {...displayOptions}
                columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
                listCellWidth="100px"
                projectBackgroundColor={isDarkMode ? "#101214" : "#1f2937"}
                projectProgressColor={isDarkMode ? "#1f2937" : "#aeb8c2"}
                projectProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timeline;
