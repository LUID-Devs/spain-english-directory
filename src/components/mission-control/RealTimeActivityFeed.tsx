import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  MessageSquare,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  Heart,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ActivityLog } from "@/hooks/useMissionControl";
import { useWebSocket } from "@/hooks/useWebSocket";

interface RealTimeActivityFeedProps {
  organizationId?: number;
  initialActivities?: ActivityLog[];
  isLoading?: boolean;
}

const actionConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  heartbeat: { icon: Heart, color: "text-pink-500", label: "checked in" },
  task_started: { icon: PlayCircle, color: "text-blue-500", label: "started working on" },
  task_in_progress: { icon: PlayCircle, color: "text-blue-500", label: "is working on" },
  task_completed: { icon: CheckCircle, color: "text-green-500", label: "completed" },
  task_blocked: { icon: AlertCircle, color: "text-red-500", label: "is blocked on" },
  comment_added: { icon: MessageSquare, color: "text-purple-500", label: "commented on" },
  status_updated: { icon: Activity, color: "text-gray-500", label: "updated status" },
  mention_responded: { icon: MessageSquare, color: "text-cyan-500", label: "responded to mention in" },
  task_handoff: { icon: MessageSquare, color: "text-orange-500", label: "handed off" },
  task_assigned: { icon: CheckCircle, color: "text-teal-500", label: "was assigned" },
  agents_assigned_to_task: { icon: CheckCircle, color: "text-indigo-500", label: "assigned agents to" },
};

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

export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({
  organizationId,
  initialActivities = [],
  isLoading: initialLoading,
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>(initialActivities);
  const [newActivityCount, setNewActivityCount] = useState(0);

  // Update activities when initialActivities changes
  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  // Handle new activity from WebSocket
  const handleNewActivity = useCallback((activity: ActivityLog) => {
    setActivities((prev) => {
      // Check if activity already exists
      if (prev.some((a) => a.id === activity.id)) {
        return prev;
      }
      // Add new activity at the top
      return [activity, ...prev].slice(0, 100); // Keep last 100 activities
    });
    setNewActivityCount((prev) => prev + 1);
  }, []);

  // WebSocket connection
  const { isConnected } = useWebSocket({
    organizationId,
    onActivity: handleNewActivity,
  });

  // Clear new activity count when user scrolls or clicks
  const handleClearNewCount = () => {
    setNewActivityCount(0);
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-5 w-5" />
            Live Activity Feed
            {newActivityCount > 0 && (
              <Badge 
                variant="default" 
                className="bg-primary text-primary-foreground animate-pulse"
              >
                {newActivityCount} new
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 sm:pt-0">
        <ScrollArea 
          className="h-[350px] sm:h-[400px] lg:h-[500px] pr-2 sm:pr-4"
          onScroll={handleClearNewCount}
        >
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Activity className="h-12 w-12 mb-4 opacity-50" />
              <p>No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => {
                const config = actionConfig[activity.action] || actionConfig.status_updated;
                const ActionIcon = config.icon;
                const emoji = characterEmojis[activity.agent.name] || "🤖";
                const isNew = index < newActivityCount;

                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-2 sm:gap-3 p-2 rounded-lg transition-all ${
                      isNew 
                        ? "bg-primary/5 border border-primary/20 animate-pulse" 
                        : "border-b last:border-0 hover:bg-accent/50"
                    }`}
                  >
                    {/* Agent Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                      {emoji}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="font-medium text-xs sm:text-sm">
                          {activity.agent.displayName}
                        </span>
                        <ActionIcon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${config.color}`} />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {config.label}
                        </span>
                        {activity.task && (
                          <span className="text-xs sm:text-sm font-medium truncate max-w-full">
                            &quot;{activity.task.title}&quot;
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      {activity.details?.message && activity.action === "heartbeat" && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {activity.details.message}
                        </p>
                      )}
                      {activity.details?.content && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                          {activity.details.content}
                        </p>
                      )}

                      {/* Timestamp */}
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
