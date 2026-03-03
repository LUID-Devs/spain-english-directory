"use client";

import React, { useMemo, useState } from "react";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useRoadmapData, useCreateMilestone } from "@/hooks/useRoadmapApi";
import { useAuth } from "@/app/authProvider";
import { useGlobalStore } from "@/stores/globalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  AlertCircle, 
  Target,
  GitBranch,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Health status indicators
const healthConfig = {
  on_track: { 
    label: "On Track", 
    color: "bg-emerald-500", 
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: CheckCircle2 
  },
  at_risk: { 
    label: "At Risk", 
    color: "bg-amber-500", 
    textColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: AlertTriangle 
  },
  delayed: { 
    label: "Delayed", 
    color: "bg-red-500", 
    textColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertCircle 
  },
  unknown: { 
    label: "Unknown", 
    color: "bg-gray-400", 
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Clock 
  },
};

// Milestone status config
const milestoneConfig = {
  upcoming: { label: "Upcoming", color: "bg-blue-500" },
  at_risk: { label: "At Risk", color: "bg-amber-500" },
  missed: { label: "Missed", color: "bg-red-500" },
  completed: { label: "Completed", color: "bg-emerald-500" },
};

export default function RoadmapPage() {
  const { data: roadmapData, isLoading, isError, refetch } = useRoadmapData();
  const { activeOrganization } = useAuth();
  const { isDarkMode } = useGlobalStore();
  const { createMilestone, isLoading: isCreatingMilestone } = useCreateMilestone();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "gantt">("timeline");
  const [ganttOptions, setGanttOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });
  const [milestoneForm, setMilestoneForm] = useState({
    name: "",
    description: "",
    targetDate: "",
    projectId: "all",
  });

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!roadmapData) return null;
    
    const { projects, milestones, dependencies } = roadmapData;
    const projectHealth = {
      onTrack: projects.filter((p: any) => p.healthStatus === "on_track").length,
      atRisk: projects.filter((p: any) => p.healthStatus === "at_risk").length,
      delayed: projects.filter((p: any) => p.healthStatus === "delayed").length,
    };
    
    const upcomingMilestones = milestones.filter((m: any) => {
      const daysUntil = differenceInDays(new Date(m.targetDate), new Date());
      return daysUntil >= 0 && daysUntil <= 30 && m.status !== "completed";
    });
    
    return {
      totalProjects: projects.length,
      totalMilestones: milestones.length,
      totalDependencies: dependencies.length,
      projectHealth,
      upcomingMilestones: upcomingMilestones.length,
    };
  }, [roadmapData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-8 w-8" />
              Roadmap
            </h1>
            <p className="text-muted-foreground">Strategic planning and milestone tracking</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading roadmap...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-8 w-8" />
              Roadmap
            </h1>
            <p className="text-muted-foreground">Strategic planning and milestone tracking</p>
          </div>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Failed to load roadmap"
          description="We couldn't load your roadmap data. Please try again."
          action={{
            label: "Try Again",
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }

  const { projects, milestones, dependencies } = roadmapData || { projects: [], milestones: [], dependencies: [] };
  const availableProjects = projects.map((project) => ({ id: project.id, name: project.name }));

  const ganttTasks = useMemo(() => {
    const healthToHex: Record<string, string> = {
      on_track: "#10B981",
      at_risk: "#F59E0B",
      delayed: "#EF4444",
      unknown: "#9CA3AF",
    };
    const milestoneToHex: Record<string, string> = {
      upcoming: "#3B82F6",
      at_risk: "#F59E0B",
      missed: "#EF4444",
      completed: "#10B981",
    };

    const projectTasks = projects
      .filter((project: any) => project.startDate && project.endDate)
      .map((project: any) => {
        const health = healthConfig[project.healthStatus as keyof typeof healthConfig] || healthConfig.unknown;
        const baseColor = healthToHex[project.healthStatus] || healthToHex.unknown;
        const completed = project.taskStats?.completed || 0;
        const total = project.taskStats?.total || 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          start: new Date(project.startDate),
          end: new Date(project.endDate),
          name: project.name,
          id: `project-${project.id}`,
          type: "project" as const,
          progress,
          isDisabled: false,
          styles: {
            backgroundColor: isDarkMode ? "#1F2937" : baseColor,
            backgroundSelectedColor: isDarkMode ? "#111827" : baseColor,
            progressColor: isDarkMode ? "#ffffff" : "#000000",
            progressSelectedColor: isDarkMode ? "#ffffff" : "#000000",
          },
        };
      });

    const milestoneTasks = milestones
      .filter((milestone: any) => milestone.targetDate)
      .map((milestone: any) => {
        const color = milestoneToHex[milestone.status] || "#9CA3AF";
        const target = new Date(milestone.targetDate);

        return {
          start: target,
          end: target,
          name: milestone.name,
          id: `milestone-${milestone.id}`,
          type: "milestone" as const,
          progress: milestone.progress || 0,
          isDisabled: false,
          styles: {
            backgroundColor: isDarkMode ? "#6B7280" : color,
            backgroundSelectedColor: isDarkMode ? "#4B5563" : color,
            progressColor: isDarkMode ? "#ffffff" : "#000000",
            progressSelectedColor: isDarkMode ? "#ffffff" : "#000000",
          },
        };
      });

    return [...projectTasks, ...milestoneTasks];
  }, [projects, milestones, isDarkMode]);

  const projectsMissingDates = useMemo(
    () => projects.filter((project: any) => !project.startDate || !project.endDate),
    [projects]
  );

  const handleCreateMilestone = async () => {
    const organizationId = activeOrganization?.id ?? Number(localStorage.getItem("activeOrganizationId"));
    if (!organizationId) {
      toast.error("Select a workspace to create a milestone.");
      return;
    }
    if (!milestoneForm.name.trim() || !milestoneForm.targetDate) {
      toast.error("Milestone name and target date are required.");
      return;
    }

    try {
      await createMilestone({
        organizationId,
        projectId: milestoneForm.projectId === "all" ? undefined : Number(milestoneForm.projectId),
        name: milestoneForm.name.trim(),
        description: milestoneForm.description.trim() || undefined,
        targetDate: new Date(milestoneForm.targetDate).toISOString(),
      });
      toast.success("Milestone created.");
      setMilestoneForm({ name: "", description: "", targetDate: "", projectId: "all" });
      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create milestone.");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8" />
            Roadmap
          </h1>
          <p className="text-muted-foreground">
            Strategic planning with milestones and dependencies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "timeline" ? "default" : "outline"}
            onClick={() => setViewMode("timeline")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant={viewMode === "gantt" ? "default" : "outline"}
            onClick={() => setViewMode("gantt")}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Gantt
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.projectHealth.onTrack} on track
                </span>
                {stats.projectHealth.atRisk > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {stats.projectHealth.atRisk} at risk
                  </span>
                )}
                {stats.projectHealth.delayed > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {stats.projectHealth.delayed} delayed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                  <p className="text-2xl font-bold">{stats.totalMilestones}</p>
                </div>
                <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stats.upcomingMilestones} upcoming this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dependencies</p>
                  <p className="text-2xl font-bold">{stats.totalDependencies}</p>
                </div>
                <div className="h-10 w-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Cross-project links
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                  <p className="text-2xl font-bold">
                    {stats.totalProjects > 0 
                      ? Math.round((stats.projectHealth.onTrack / stats.totalProjects) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Projects on track
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List with Health Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {viewMode === "gantt" ? "Roadmap Gantt" : "Projects Timeline"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No projects yet"
                description="Create projects to see them on the roadmap."
              />
            ) : viewMode === "timeline" ? (
              <div className="space-y-4">
                {projects.map((project: any) => {
                  const health = healthConfig[project.healthStatus as keyof typeof healthConfig] || healthConfig.unknown;
                  const HealthIcon = health.icon;
                  const startDate = project.startDate ? new Date(project.startDate) : null;
                  const endDate = project.endDate ? new Date(project.endDate) : null;
                  const daysRemaining = endDate ? differenceInDays(endDate, new Date()) : null;
                  
                  return (
                    <div
                      key={project.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all hover:shadow-md",
                        health.bgColor,
                        health.borderColor
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <Badge variant="outline" className={cn(health.textColor, health.bgColor)}>
                              <HealthIcon className="h-3 w-3 mr-1" />
                              {health.label}
                            </Badge>
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            {startDate && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Start: {format(startDate, "MMM d, yyyy")}
                              </span>
                            )}
                            {endDate && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Target className="h-4 w-4" />
                                End: {format(endDate, "MMM d, yyyy")}
                              </span>
                            )}
                            {daysRemaining !== null && (
                              <Badge 
                                variant={daysRemaining < 0 ? "destructive" : daysRemaining < 7 ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {daysRemaining < 0 
                                  ? `${Math.abs(daysRemaining)} days overdue` 
                                  : daysRemaining === 0 
                                    ? "Due today" 
                                    : `${daysRemaining} days left`}
                              </Badge>
                            )}
                          </div>
                          
                          {project.healthReason && (
                            <p className={cn("text-xs mt-2", health.textColor)}>
                              {project.healthReason}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium">
                            {project.taskStats?.completed || 0}/{project.taskStats?.total || 0} tasks
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {project.taskStats?.total > 0 
                              ? Math.round((project.taskStats.completed / project.taskStats.total) * 100) 
                              : 0}% complete
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {project.taskStats?.total > 0 && (
                        <div className="mt-3">
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all", health.color)}
                              style={{ 
                                width: `${(project.taskStats.completed / project.taskStats.total) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : ganttTasks.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No scheduled items"
                description="Add start/end dates to projects or milestone target dates to populate the Gantt view."
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={ganttOptions.viewMode === mode ? "default" : "outline"}
                      onClick={() => setGanttOptions((prev) => ({ ...prev, viewMode: mode }))}
                    >
                      {mode === ViewMode.Day ? "Day" : mode === ViewMode.Week ? "Week" : "Month"}
                    </Button>
                  ))}
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Gantt
                    tasks={ganttTasks}
                    {...ganttOptions}
                    columnWidth={ganttOptions.viewMode === ViewMode.Month ? 180 : ganttOptions.viewMode === ViewMode.Week ? 120 : 80}
                    listCellWidth="220px"
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
                {projectsMissingDates.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {projectsMissingDates.length} project{projectsMissingDates.length !== 1 ? "s" : ""} missing start or end dates.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No milestones yet"
                description="Add milestones to track key dates."
              />
            ) : (
              <div className="space-y-3">
                {milestones
                  .sort((a: any, b: any) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                  .slice(0, 10)
                  .map((milestone: any) => {
                    const targetDate = new Date(milestone.targetDate);
                    const daysUntil = differenceInDays(targetDate, new Date());
                    const isOverdue = isPast(targetDate) && !isToday(targetDate) && milestone.status !== "completed";
                    const status = milestoneConfig[milestone.status as keyof typeof milestoneConfig];
                    
                    return (
                      <div
                        key={milestone.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all",
                          isOverdue ? "bg-red-50 border-red-200" : "bg-card hover:bg-accent"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{milestone.name}</p>
                            {milestone.project && (
                              <p className="text-xs text-muted-foreground">
                                {milestone.project.name}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full text-white", status?.color || "bg-gray-400")}>
                                {status?.label || milestone.status}
                              </span>
                              <span className={cn(
                                "text-xs",
                                isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                              )}>
                                {isOverdue 
                                  ? `${Math.abs(daysUntil)} days overdue` 
                                  : daysUntil === 0 
                                    ? "Today" 
                                    : `in ${daysUntil} days`}
                              </span>
                            </div>
                          </div>
                          
                          {milestone.progress > 0 && (
                            <div className="ml-2 text-right">
                              <span className="text-sm font-medium">{milestone.progress}%</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Linked tasks indicator */}
                        {milestone.linkedTaskCount > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {milestone.completedTaskCount}/{milestone.linkedTaskCount} tasks completed
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dependencies Section */}
      {dependencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Project Dependencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {dependencies.map((dep: any) => (
                <div
                  key={dep.id}
                  className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg"
                >
                  <span className="font-medium">{dep.dependencyProject?.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{dep.dependentProject?.name}</span>
                  {dep.lagDays !== 0 && (
                    <Badge variant="outline" className="text-xs">
                      {dep.lagDays > 0 ? `+${dep.lagDays} days` : `${dep.lagDays} days`}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Milestone</DialogTitle>
            <DialogDescription>
              Track a key date or deliverable across your projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-name">Milestone name</Label>
              <Input
                id="milestone-name"
                value={milestoneForm.name}
                onChange={(event) =>
                  setMilestoneForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="e.g. Beta launch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-project">Project</Label>
              <Select
                value={milestoneForm.projectId}
                onValueChange={(value) =>
                  setMilestoneForm((prev) => ({ ...prev, projectId: value }))
                }
              >
                <SelectTrigger id="milestone-project">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-date">Target date</Label>
              <Input
                id="milestone-date"
                type="date"
                value={milestoneForm.targetDate}
                onChange={(event) =>
                  setMilestoneForm((prev) => ({ ...prev, targetDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-description">Description (optional)</Label>
              <Textarea
                id="milestone-description"
                value={milestoneForm.description}
                onChange={(event) =>
                  setMilestoneForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={3}
                placeholder="Share context or success criteria."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateMilestone}
              disabled={isCreatingMilestone || !milestoneForm.name.trim() || !milestoneForm.targetDate}
            >
              {isCreatingMilestone ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating
                </>
              ) : (
                "Create milestone"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
