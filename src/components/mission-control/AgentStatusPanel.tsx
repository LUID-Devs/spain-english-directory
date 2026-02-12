import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Activity,
  Zap,
  Users
} from "lucide-react";
import { AgentWithOnlineStatus } from "@/hooks/useMissionControl";
import { formatDistanceToNow } from "date-fns";

interface AgentStatusPanelProps {
  agents: AgentWithOnlineStatus[];
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
  "qa": "bg-teal-500",
};

const statusConfig = {
  idle: { color: "bg-gray-400", icon: Clock, label: "Idle" },
  active: { color: "bg-green-500", icon: Zap, label: "Active" },
  blocked: { color: "bg-red-500", icon: AlertCircle, label: "Blocked" },
};

const onlineStatusConfig = {
  online: { color: "text-green-500", bgColor: "bg-green-500", icon: Wifi, label: "Online" },
  away: { color: "text-yellow-500", bgColor: "bg-yellow-500", icon: Clock, label: "Away" },
  offline: { color: "text-gray-400", bgColor: "bg-gray-400", icon: WifiOff, label: "Offline" },
};

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ 
  agents, 
  isLoading 
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

  const onlineAgents = agents.filter((a) => a.isOnline);
  const activeAgents = agents.filter((a) => a.status === "active");
  const blockedAgents = agents.filter((a) => a.status === "blocked");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-5 w-5" />
            Agent Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Wifi className="h-3 w-3 mr-1" />
              {onlineAgents.length} Online
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Zap className="h-3 w-3 mr-1" />
              {activeAgents.length} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid gap-2 sm:gap-3">
          {agents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No agents configured</p>
          ) : (
            agents.map((agent) => {
              const emoji = characterEmojis[agent.name] || "🤖";
              const roleColor = roleColors[agent.role] || "bg-gray-500";
              const StatusIcon = statusConfig[agent.status]?.icon || Clock;
              const OnlineIcon = agent.isOnline ? Wifi : WifiOff;
              const onlineColor = agent.isOnline 
                ? "text-green-500" 
                : agent.lastHeartbeat 
                  ? "text-yellow-500" 
                  : "text-gray-400";

              return (
                <div
                  key={agent.id}
                  className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <Avatar className="h-10 w-10 text-xl">
                      <AvatarFallback className="bg-muted">{emoji}</AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                        agent.isOnline ? "bg-green-500" : agent.lastHeartbeat ? "bg-yellow-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{agent.displayName}</span>
                      <Badge className={`text-[10px] text-white ${roleColor}`}>
                        {agent.role.replace("-", " ")}
                      </Badge>
                    </div>

                    {/* Current Task */}
                    {agent.currentTask && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        <span className="text-foreground">{agent.currentTask.title}</span>
                      </div>
                    )}

                    {/* Status Row */}
                    <div className="flex items-center gap-2 sm:gap-3 mt-1">
                      <div className={`flex items-center gap-1 text-xs ${onlineColor}`}>
                        <OnlineIcon className="h-3 w-3" />
                        <span>{agent.isOnline ? "Online" : agent.lastHeartbeat ? "Away" : "Offline"}</span>
                      </div>
                      {agent.lastHeartbeat && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(agent.lastHeartbeat), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Stats */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {agent._count?.assignedTasks || 0}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${statusConfig[agent.status]?.color.replace("bg-", "text-")}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[agent.status]?.label}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
