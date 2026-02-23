import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Moon,
  Sun,
  Activity,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  Clock,
  Users,
  Zap,
} from "lucide-react";
import { NightPatrolData } from "@/hooks/useMissionControl";

interface NightPatrolTimelineProps {
  data?: NightPatrolData;
  isLoading?: boolean;
}

// SpongeBob character emoji mapping
const characterEmojis: Record<string, string> = {
  "mr-krabs": "🦀",
  "spongebob": "🧽",
  "squidward": "🦑",
  "sandy": "🐿️",
  "karen": "🖥️",
  "patrick": "⭐",
  "plankton": "🦠",
  "gary": "🐌",
  "mrs-puff": "🐡",
  "mermaid-man": "🦸",
  "cletus": "🛠️",
  "emilp": "🧪",
};

const actionConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  heartbeat: { icon: Zap, color: "text-pink-500", label: "checked in" },
  task_started: { icon: PlayCircle, color: "text-blue-500", label: "started" },
  task_in_progress: { icon: PlayCircle, color: "text-blue-500", label: "working on" },
  task_completed: { icon: CheckCircle, color: "text-green-500", label: "completed" },
  task_blocked: { icon: AlertCircle, color: "text-red-500", label: "blocked on" },
  comment_added: { icon: Activity, color: "text-purple-500", label: "commented" },
  status_updated: { icon: Clock, color: "text-gray-500", label: "updated status" },
  task_handoff: { icon: Users, color: "text-orange-500", label: "handed off" },
  task_assigned: { icon: CheckCircle, color: "text-cyan-500", label: "assigned" },
};

export const NightPatrolTimeline: React.FC<NightPatrolTimelineProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No patrol data available</p>
        </CardContent>
      </Card>
    );
  }

  const timeline = data.timeline ?? [];
  const hasActivity = timeline.some((hour) => (hour.activities || []).length > 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Moon className="h-5 w-5" />
            Night Patrol
            <span className="text-sm text-muted-foreground font-normal">
              ({data.date})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-3 w-3 mr-1" />
              {data.stats.uniqueAgents} Agents
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              {data.stats.taskCompletions} Done
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {!hasActivity ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Moon className="h-12 w-12 mb-4 opacity-50" />
            <p>Quiet night - no patrol activity recorded</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {timeline.map((hourSlot) => {
                const isNightHour = hourSlot.hour.startsWith("23") || 
                  parseInt(hourSlot.hour) < 6;
                const activities = hourSlot.activities || [];
                
                if (activities.length === 0) return null;

                return (
                  <div key={hourSlot.hour} className="relative">
                    {/* Hour Label */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-md ${isNightHour ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                        {isNightHour ? (
                          <Moon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Sun className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{hourSlot.hour}</span>
                      <span className="text-xs text-muted-foreground">
                        ({activities.length} activities)
                      </span>
                    </div>

                    {/* Activities */}
                    <div className="ml-6 space-y-2 border-l-2 border-border pl-4">
                      {activities.map((activity) => {
                        const config = actionConfig[activity.action] || actionConfig.status_updated;
                        const ActionIcon = config.icon;
                        const emoji = characterEmojis[activity.agent.name] || "🤖";

                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                          >
                            <span className="text-lg">{emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-sm">
                                  {activity.agent.displayName}
                                </span>
                                <ActionIcon className={`h-3.5 w-3.5 ${config.color}`} />
                                <span className="text-xs text-muted-foreground">
                                  {config.label}
                                </span>
                                {activity.task && (
                                  <span className="text-xs font-medium truncate">
                                    {activity.task.title}
                                  </span>
                                )}
                              </div>
                              {activity.details?.content && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {activity.details.content}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(activity.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-semibold">{data.stats.totalActivities}</p>
            <p className="text-xs text-muted-foreground">Activities</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{data.stats.uniqueAgents}</p>
            <p className="text-xs text-muted-foreground">Active Agents</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600">{data.stats.taskCompletions}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-600">{data.stats.newTasks}</p>
            <p className="text-xs text-muted-foreground">New Tasks</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
