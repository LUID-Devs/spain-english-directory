import React, { useState, useEffect } from "react";
import { Clock, ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/apiService";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface WeeklyTimeWidgetProps {
  className?: string;
}

export const WeeklyTimeWidget: React.FC<WeeklyTimeWidgetProps> = ({ className }) => {
  const [weeklyData, setWeeklyData] = useState<{
    totalMinutes: number;
    totalFormatted: string;
    count: number;
    logs: Array<{
      id: number;
      task: { title: string; project?: { name: string } };
      durationMinutes: number;
      durationFormatted?: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      // Get logs from the last 7 days
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await apiService.getMyTimeLogs({ startDate, endDate });
      
      setWeeklyData({
        totalMinutes: response.summary.totalMinutes,
        totalFormatted: response.summary.totalFormatted,
        count: response.summary.count,
        logs: response.logs.slice(0, 5), // Top 5 recent entries
      });
    } catch (error) {
      console.error("Failed to load weekly time data:", error);
    } finally {
      setIsLoading(false);
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
            Time This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const hasData = weeklyData && weeklyData.totalMinutes > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          Time This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{formatHours(weeklyData!.totalMinutes)}</span>
              <span className="text-sm text-muted-foreground">logged</span>
            </div>

            {weeklyData!.logs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Recent entries</p>
                {weeklyData!.logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="truncate font-medium">{log.task.title}</p>
                      {log.task.project && (
                        <p className="text-xs text-muted-foreground truncate">{log.task.project.name}</p>
                      )}
                    </div>
                    <span className="text-xs font-mono whitespace-nowrap">{log.durationFormatted}</span>
                  </div>
                ))}
              </div>
            )}

            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/dashboard/time-reports">
                View Full Report
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No time logged this week</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a timer on any task to track your work
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

export default WeeklyTimeWidget;
