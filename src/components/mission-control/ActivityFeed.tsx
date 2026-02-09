import React from "react";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: number;
  agentId: number;
  action: string;
  taskId?: number;
  details: Record<string, any>;
  createdAt: string;
  agent: {
    id: number;
    name: string;
    displayName: string;
    role: string;
  };
  task?: {
    id: number;
    title: string;
  } | null;
}

interface ActivityFeedProps {
  activities: ActivityLog[];
  isLoading: boolean;
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
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No activity yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 sm:pt-0">
        <ScrollArea className="h-[350px] sm:h-[400px] lg:h-[500px] pr-2 sm:pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = actionConfig[activity.action] || actionConfig.status_updated;
              const ActionIcon = config.icon;
              const emoji = characterEmojis[activity.agent.name] || "🤖";

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b last:border-0"
                >
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                    {emoji}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {activity.agent.displayName}
                      </span>
                      <ActionIcon className={`h-4 w-4 ${config.color}`} />
                      <span className="text-sm text-muted-foreground">
                        {config.label}
                      </span>
                      {activity.task && (
                        <span className="text-sm font-medium truncate">
                          "{activity.task.title}"
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    {activity.details?.message && activity.action === "heartbeat" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.details.message}
                      </p>
                    )}
                    {activity.details?.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {activity.details.content}
                      </p>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
