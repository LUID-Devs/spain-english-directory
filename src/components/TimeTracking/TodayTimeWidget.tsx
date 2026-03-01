import React, { useState, useEffect } from "react";
import { Clock, ArrowRight, Calendar, Timer, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/apiService";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface TodayTimeWidgetProps {
  className?: string;
}

export const TodayTimeWidget: React.FC<TodayTimeWidgetProps> = ({ className }) => {
  const [todayData, setTodayData] = useState<{
    totalMinutes: number;
    totalFormatted: string;
    count: number;
    logs: Array<{
      id: number;
      task?: { title: string; project?: { name: string } };
      durationMinutes?: number;
      durationFormatted?: string;
      startedAt: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<{
    hasActiveTimer: boolean;
    elapsedMinutes: number;
    elapsedFormatted: string;
    taskTitle?: string;
  } | null>(null);

  useEffect(() => {
    loadTodayData();
    loadActiveTimer();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(() => {
      loadTodayData();
      loadActiveTimer();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTodayData = async () => {
    try {
      // Get today's date range
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = now.toISOString();
      const startDate = startOfDay.toISOString();
      
      const response = await apiService.getMyTimeLogs({ startDate, endDate });
      
      setTodayData({
        totalMinutes: response.summary.totalMinutes,
        totalFormatted: response.summary.totalFormatted,
        count: response.summary.count,
        logs: response.logs.slice(0, 3), // Top 3 recent entries
      });
    } catch (error) {
      console.error("Failed to load today's time data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveTimer = async () => {
    try {
      const response = await apiService.getActiveTimer();
      setActiveTimer(response);
    } catch (error) {
      console.error("Failed to load active timer:", error);
    }
  };

  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today's Tracked Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const hasData = todayData && todayData.totalMinutes > 0;
  const hasActiveTimer = activeTimer?.hasActiveTimer;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          Today's Tracked Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasActiveTimer && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Timer Running
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {activeTimer?.taskTitle || "Working on a task"}
            </p>
            <p className="text-lg font-mono font-semibold text-amber-600 dark:text-amber-400 mt-1">
              {activeTimer?.elapsedFormatted || "0m"}
            </p>
          </div>
        )}

        {hasData ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{formatHours(todayData!.totalMinutes)}</span>
              <span className="text-sm text-muted-foreground">logged today</span>
            </div>

            {todayData!.logs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Recent entries</p>
                {todayData!.logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="truncate font-medium">{log.task?.title || "Unknown Task"}</p>
                      {log.task?.project && (
                        <p className="text-xs text-muted-foreground truncate">{log.task.project.name}</p>
                      )}
                    </div>
                    <span className="text-xs font-mono whitespace-nowrap">{log.durationFormatted}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link to="/dashboard/time-reports">
                  View Report
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="px-2" asChild>
                <Link to="/dashboard/time-reports?export=today">
                  <Download className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No time tracked today</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a timer on any task to begin tracking
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/projects">Go to Tasks</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayTimeWidget;
