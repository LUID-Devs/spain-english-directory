import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  id: number;
  name: string;
  displayName: string;
  role: string;
  status: "idle" | "active" | "blocked";
  lastHeartbeat: string | null;
  currentTask?: {
    id: number;
    title: string;
    status: string;
  } | null;
  _count?: {
    assignedTasks: number;
    notifications: number;
  };
}

interface AgentGridProps {
  agents: Agent[];
  isLoading: boolean;
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
};

const roleColors: Record<string, string> = {
  "squad-lead": "bg-yellow-500",
  "content-writer": "bg-blue-500",
  "product-analyst": "bg-purple-500",
  "customer-researcher": "bg-green-500",
  "seo-analyst": "bg-cyan-500",
  "social-media": "bg-pink-500",
  "developer": "bg-red-500",
  "documentation": "bg-gray-500",
  "email-marketing": "bg-orange-500",
  "designer": "bg-indigo-500",
};

const statusConfig = {
  idle: { color: "bg-gray-400", icon: Clock, label: "Idle" },
  active: { color: "bg-green-500", icon: CheckCircle, label: "Active" },
  blocked: { color: "bg-red-500", icon: AlertCircle, label: "Blocked" },
};

export const AgentGrid: React.FC<AgentGridProps> = ({ agents, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No agents configured yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {agents.map((agent) => {
        const StatusIcon = statusConfig[agent.status]?.icon || Clock;
        const emoji = characterEmojis[agent.name] || "🤖";
        const roleColor = roleColors[agent.role] || "bg-gray-500";

        return (
          <Card key={agent.id} className="relative overflow-hidden">
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig[agent.status]?.color || "bg-gray-400"}`} />

            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 text-2xl">
                  <AvatarFallback className="bg-muted">
                    {emoji}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {agent.displayName}
                  </CardTitle>
                  <Badge variant="outline" className={`text-xs text-white ${roleColor}`}>
                    {agent.role.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                  <StatusIcon className={`h-4 w-4 ${agent.status === "active" ? "text-green-500" : agent.status === "blocked" ? "text-red-500" : "text-gray-400"}`} />
                  <span className="text-muted-foreground">
                    {statusConfig[agent.status]?.label}
                  </span>
                </div>

                {/* Current Task */}
                {agent.currentTask && (
                  <div className="text-xs text-muted-foreground truncate">
                    Working: {agent.currentTask.title}
                  </div>
                )}

                {/* Last Heartbeat */}
                {agent.lastHeartbeat && (
                  <div className="text-xs text-muted-foreground">
                    Last seen: {formatDistanceToNow(new Date(agent.lastHeartbeat), { addSuffix: true })}
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <span>{agent._count?.assignedTasks || 0} tasks</span>
                  {(agent._count?.notifications || 0) > 0 && (
                    <span className="text-blue-500">
                      {agent._count?.notifications} mentions
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
