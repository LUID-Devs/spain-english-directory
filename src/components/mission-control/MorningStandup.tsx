import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sunrise,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Activity,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { MorningStandupData } from "@/hooks/useMissionControl";

interface MorningStandupProps {
  data?: MorningStandupData;
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

const priorityColors: Record<string, string> = {
  "High": "text-red-500 bg-red-100 dark:bg-red-900/30",
  "Medium": "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
  "Low": "text-green-500 bg-green-100 dark:bg-green-900/30",
  "Urgent": "text-red-600 bg-red-100 dark:bg-red-900/30",
};

export const MorningStandup: React.FC<MorningStandupProps> = ({
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
          <p className="text-muted-foreground">No standup data available</p>
        </CardContent>
      </Card>
    );
  }

  const yesterday = data.yesterday ?? [];
  const today = data.today ?? [];
  const highlights = data.highlights ?? {
    totalCompleted: 0,
    totalBlocked: 0,
    activeAgents: 0,
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sunrise className="h-5 w-5" />
            Morning Standup
            <span className="text-sm text-muted-foreground font-normal">
              ({data.date})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {highlights.totalCompleted} Done
            </Badge>
            {highlights.totalBlocked > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {highlights.totalBlocked} Blocked
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Yesterday's Summary */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Yesterday
              </h3>
              {yesterday.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-6">No completed work recorded</p>
              ) : (
                <div className="space-y-3">
                  {yesterday.map((agentSummary) => {
                    const emoji = characterEmojis[agentSummary.agent.name] || "🤖";
                    
                    return (
                      <div
                        key={agentSummary.agent.id}
                        className="border rounded-lg p-3 bg-card"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{emoji}</span>
                          <span className="font-medium">{agentSummary.agent.displayName}</span>
                        </div>
                        
                        <div className="space-y-1.5">
                          {/* Completed Tasks */}
                          {agentSummary.completedTasks.length > 0 && (
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Completed:</p>
                                <ul className="text-sm">
                                  {agentSummary.completedTasks.map((task, idx) => (
                                    <li key={idx} className="text-green-700 dark:text-green-400">
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* In Progress */}
                          {agentSummary.inProgressTasks.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">In Progress:</p>
                                <ul className="text-sm">
                                  {agentSummary.inProgressTasks.map((task, idx) => (
                                    <li key={idx}>{task}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Blocked Tasks */}
                          {agentSummary.blockedTasks.length > 0 && (
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Blocked:</p>
                                <ul className="text-sm">
                                  {agentSummary.blockedTasks.map((task, idx) => (
                                    <li key={idx} className="text-red-600">
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* No activity */}
                          {agentSummary.completedTasks.length === 0 && 
                           agentSummary.inProgressTasks.length === 0 && 
                           agentSummary.blockedTasks.length === 0 && (
                            <p className="text-sm text-muted-foreground">No activity recorded</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Today's Plan */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Today&apos;s Plan
              </h3>
              {today.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-6">No pending tasks</p>
              ) : (
                <div className="space-y-3">
                  {today.map((agentPlan) => (
                    <div
                      key={agentPlan.agent.id}
                      className="border rounded-lg p-3 bg-card"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{agentPlan.agent.displayName}</span>
                      </div>
                      
                      <div className="space-y-1">
                        {agentPlan.pendingTasks.map((task, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="flex-1">{task.title}</span>
                            {task.priority && (
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${priorityColors[task.priority] || ""}`}
                              >
                                {task.priority}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600">{highlights.totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Completed Yesterday</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{highlights.activeAgents}</p>
            <p className="text-xs text-muted-foreground">Active Agents</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">{highlights.totalBlocked}</p>
            <p className="text-xs text-muted-foreground">Blocked Items</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
