import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Download,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileJson,
  Timer,
  TrendingUp,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService, type TimeLog, type Project } from "@/services/apiService";
import { useGetProjectsQuery } from "@/hooks/useApi";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { TimeLogList } from "@/components/TimeTracking";
import Header from "@/components/Header";

interface TimeSummary {
  totalMinutes: number;
  totalFormatted: string;
  count: number;
  byProject: Record<number, { name: string; minutes: number; count: number }>;
  byDay: Record<string, number>;
}

const TimeReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("week");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [summary, setSummary] = useState<TimeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{
    hasActiveTimer: boolean;
    taskId?: number;
    taskTitle?: string;
    elapsedFormatted?: string;
  } | null>(null);

  const { data: projects } = useGetProjectsQuery();

  // Initialize date range based on selection
  useEffect(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (dateRange) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      default:
        return; // Custom - don't auto-set
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }, [dateRange]);

  // Load time logs
  const loadTimeLogs = useCallback(async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const response = await apiService.getMyTimeLogs({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate + "T23:59:59").toISOString(),
      });

      let filteredLogs = response.logs;
      
      // Apply project filter
      if (projectFilter !== "all") {
        filteredLogs = filteredLogs.filter(
          (log) => log.task?.projectId === parseInt(projectFilter)
        );
      }

      setLogs(filteredLogs);

      // Calculate summary
      const byProject: TimeSummary["byProject"] = {};
      const byDay: Record<string, number> = {};
      let totalMinutes = 0;

      filteredLogs.forEach((log) => {
        const minutes = log.durationMinutes || 0;
        totalMinutes += minutes;

        // By project
        const projectId = log.task?.projectId || 0;
        const projectName = log.task?.project?.name || "Unknown Project";
        if (!byProject[projectId]) {
          byProject[projectId] = { name: projectName, minutes: 0, count: 0 };
        }
        byProject[projectId].minutes += minutes;
        byProject[projectId].count += 1;

        // By day
        const day = format(new Date(log.startedAt), "yyyy-MM-dd");
        byDay[day] = (byDay[day] || 0) + minutes;
      });

      setSummary({
        totalMinutes,
        totalFormatted: formatDuration(totalMinutes * 60),
        count: filteredLogs.length,
        byProject,
        byDay,
      });
    } catch (error) {
      console.error("Failed to load time logs:", error);
      toast.error("Failed to load time logs");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, projectFilter]);

  // Load active timer
  const loadActiveTimer = useCallback(async () => {
    try {
      const response = await apiService.getActiveTimer();
      setActiveTimer(response);
    } catch (error) {
      console.error("Failed to load active timer:", error);
    }
  }, []);

  useEffect(() => {
    loadTimeLogs();
    loadActiveTimer();
  }, [loadTimeLogs]);

  // Auto-refresh active timer
  useEffect(() => {
    const interval = setInterval(loadActiveTimer, 30000);
    return () => clearInterval(interval);
  }, [loadActiveTimer]);

  // Export to CSV
  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Date", "Task", "Project", "Duration", "Description"];
    const rows = logs.map((log) => [
      format(new Date(log.startedAt), "yyyy-MM-dd"),
      log.task?.title || "Unknown",
      log.task?.project?.name || "Unknown",
      log.durationFormatted || "0m",
      log.description || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  // Export to JSON
  const exportToJSON = () => {
    if (logs.length === 0) {
      toast.error("No data to export");
      return;
    }

    const data = {
      generatedAt: new Date().toISOString(),
      dateRange: { startDate, endDate },
      summary,
      logs,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-report-${startDate}-to-${endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("JSON exported successfully");
  };

  // Format duration from seconds to readable
  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  // Format minutes to hours
  function formatHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  return (
    <div className="container h-full w-full bg-background">
      <Header name="Time Reports" />

      <div className="space-y-6">
        {/* Active Timer Banner */}
        {activeTimer?.hasActiveTimer && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-amber-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium">Timer Running</p>
                  <p className="text-xs text-muted-foreground">
                    {activeTimer.taskTitle || "Working on a task"}
                  </p>
                </div>
              </div>
              <span className="text-lg font-mono font-semibold text-amber-600 dark:text-amber-400">
                {activeTimer.elapsedFormatted}
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Start</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">End</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium">Project</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportToJSON}>
                  <FileJson className="h-4 w-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatHours(summary.totalMinutes)}</p>
                <p className="text-xs text-muted-foreground">{summary.count} entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-500" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{Object.keys(summary.byProject).length}</p>
                <p className="text-xs text-muted-foreground">active projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Daily Avg
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatHours(
                    Math.round(
                      summary.totalMinutes / Math.max(Object.keys(summary.byDay).length, 1)
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Avg per Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatHours(Math.round(summary.totalMinutes / Math.max(summary.count, 1)))}
                </p>
                <p className="text-xs text-muted-foreground">per log entry</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed View */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">Time Logs</TabsTrigger>
            <TabsTrigger value="projects">By Project</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Time Log Entries</CardTitle>
                <CardDescription>
                  Detailed view of all time entries for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : logs.length > 0 ? (
                  <TimeLogList timeLogs={logs} showTaskTitle={true} />
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No time logs found</p>
                    <p className="text-sm text-muted-foreground">
                      Start tracking time on tasks to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Time by Project</CardTitle>
                <CardDescription>Breakdown of time spent per project</CardDescription>
              </CardHeader>
              <CardContent>
                {summary && Object.keys(summary.byProject).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(summary.byProject)
                      .sort((a, b) => b[1].minutes - a[1].minutes)
                      .map(([projectId, data]) => {
                        const percentage =
                          summary.totalMinutes > 0
                            ? (data.minutes / summary.totalMinutes) * 100
                            : 0;
                        return (
                          <div key={projectId} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{data.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono">{formatHours(data.minutes)}</span>
                                <Badge variant="secondary">{data.count} entries</Badge>
                              </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No project data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Daily Timeline</CardTitle>
                <CardDescription>Time tracked per day</CardDescription>
              </CardHeader>
              <CardContent>
                {summary && Object.keys(summary.byDay).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(summary.byDay)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([day, minutes]) => (
                        <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                          <span className="font-medium">
                            {format(new Date(day), "EEEE, MMM d")}
                          </span>
                          <span className="font-mono">{formatHours(minutes)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No timeline data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TimeReportsPage;
