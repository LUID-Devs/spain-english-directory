import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bot,
  ClipboardList,
  Bell,
  Activity,
  MessageSquare,
  PlayCircle,
  Heart,
  X,
  ExternalLink,
  Key,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  useAgent,
  useAgentTasks,
  useAgentNotifications,
  Agent,
  TaskAssignment,
  Notification,
} from "@/hooks/useMissionControl";
import { useActivityFeed } from "@/hooks/useMissionControl";
import { useAuth } from "@/app/authProvider";
import TaskDetailModal from "@/components/TaskDetailModal";

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: number;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onRegenerateKey?: (agent: Agent) => void;
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
  idle: { color: "bg-gray-400", icon: Clock, label: "Idle", textColor: "text-gray-500" },
  active: { color: "bg-green-500", icon: CheckCircle, label: "Active", textColor: "text-green-500" },
  blocked: { color: "bg-red-500", icon: AlertCircle, label: "Blocked", textColor: "text-red-500" },
};

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

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-gray-300 text-black",
};

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  isOpen,
  onClose,
  agentId,
  onEdit,
  onDelete,
  onRegenerateKey,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { activeOrganization } = useAuth();

  const { data: agent, isLoading: isAgentLoading } = useAgent(agentId);
  const { data: tasks, isLoading: isTasksLoading } = useAgentTasks(agentId);
  const { data: notifications, isLoading: isNotificationsLoading } = useAgentNotifications(agentId);
  const { data: allActivities, isLoading: isActivitiesLoading } = useActivityFeed(activeOrganization?.id, 100);

  // Filter activities for this agent
  const activities = React.useMemo(() => {
    if (!allActivities || !agent) return [];
    return allActivities.filter((a) => a.agentId === agent.id);
  }, [allActivities, agent]);

  const canManageAgents = activeOrganization?.role === "admin" || activeOrganization?.role === "owner";

  if (isAgentLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!agent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Agent Not Found</h3>
            <p className="text-muted-foreground">The agent you're looking for doesn't exist or has been deleted.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const StatusIcon = statusConfig[agent.status]?.icon || Clock;
  const emoji = characterEmojis[agent.name] || "🤖";
  const roleColor = roleColors[agent.role] || "bg-gray-500";

  // Calculate stats
  const stats = {
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter((t) => t.task.status.toLowerCase() === "done" || t.task.status.toLowerCase() === "completed").length || 0,
    inProgressTasks: tasks?.filter((t) => t.status === "in_progress").length || 0,
    unreadNotifications: notifications?.filter((n) => !n.read).length || 0,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {/* Header with Agent Info */}
          <div className="relative">
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig[agent.status]?.color || "bg-gray-400"}`} />

            <DialogHeader className="p-4 sm:p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 text-2xl sm:text-3xl flex-shrink-0">
                    <AvatarFallback className="bg-muted">{emoji}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg sm:text-xl font-semibold truncate">
                      {agent.displayName}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs text-white ${roleColor}`}>
                        {agent.role.replace("-", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">@{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusIcon className={`h-4 w-4 ${statusConfig[agent.status]?.textColor}`} />
                      <span className={`text-sm ${statusConfig[agent.status]?.textColor}`}>
                        {statusConfig[agent.status]?.label}
                      </span>
                      {agent.lastHeartbeat && (
                        <span className="text-xs text-muted-foreground">
                          • Last seen {formatDistanceToNow(new Date(agent.lastHeartbeat), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {canManageAgents && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRegenerateKey?.(agent)}
                      className="flex items-center gap-1.5"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Regenerate Key</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(agent)}
                      className="flex items-center gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete?.(agent)}
                      className="flex items-center gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>

            {/* Tabs */}
            <div className="px-4 sm:px-6 mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full h-auto flex flex-wrap sm:flex-nowrap gap-1 p-1 bg-muted/50">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[40px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Bot className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[40px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <ClipboardList className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Tasks</span>
                    {stats.totalTasks > 0 && (
                      <span className="ml-1 text-[10px] bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                        {stats.totalTasks}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[40px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Bell className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Notifications</span>
                    {stats.unreadNotifications > 0 && (
                      <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                        {stats.unreadNotifications}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[40px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Activity className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Activity</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 pt-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-xs text-muted-foreground">Total Tasks</p>
                      <p className="text-xl sm:text-2xl font-bold">{stats.totalTasks}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-xs text-muted-foreground">In Progress</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <p className="text-xs text-muted-foreground">Unread</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.unreadNotifications}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Task */}
                {agent.currentTask && (
                  <Card>
                    <CardHeader className="p-3 sm:p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                        Current Task
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setSelectedTaskId(agent.currentTask!.id)}
                      >
                        <div>
                          <p className="font-medium text-sm">{agent.currentTask.title}</p>
                          <p className="text-xs text-muted-foreground">Status: {agent.currentTask.status}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity Preview */}
                <Card>
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    {isActivitiesLoading ? (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                    ) : (
                      <div className="space-y-3">
                        {activities.slice(0, 3).map((activity) => {
                          const config = actionConfig[activity.action] || actionConfig.status_updated;
                          const ActionIcon = config.icon;
                          return (
                            <div key={activity.id} className="flex items-start gap-2 text-sm">
                              <ActionIcon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                              <div className="flex-1">
                                <span className="text-muted-foreground">{config.label}</span>
                                {activity.task && (
                                  <span className="font-medium ml-1">"{activity.task.title}"</span>
                                )}
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {activities.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => setActiveTab("activity")}
                          >
                            View all {activities.length} activities
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-0">
                {isTasksLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !tasks || tasks.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-48">
                      <p className="text-muted-foreground">No tasks assigned yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((assignment: TaskAssignment) => (
                      <Card
                        key={assignment.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTaskId(assignment.task.id)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{assignment.task.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <Badge variant="secondary" className="text-xs">
                                  {assignment.status.replace("_", " ")}
                                </Badge>
                                {assignment.task.priority && (
                                  <Badge
                                    className={`text-xs ${priorityColors[assignment.task.priority.toLowerCase()] || priorityColors.medium}`}
                                  >
                                    {assignment.task.priority}
                                  </Badge>
                                )}
                                {assignment.task.project && (
                                  <span className="text-xs text-muted-foreground">
                                    {assignment.task.project.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Assigned {formatDistanceToNow(new Date(assignment.assignedAt), { addSuffix: true })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-0">
                {isNotificationsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-48">
                      <p className="text-muted-foreground">No notifications</p>
                    </CardContent>
                  </Card>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-2">
                      {notifications.map((notification: Notification) => (
                        <Card
                          key={notification.id}
                          className={`${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {notification.type === "assignment" ? (
                                  <ClipboardList className="h-5 w-5 text-blue-500" />
                                ) : notification.type === "mention" ? (
                                  <MessageSquare className="h-5 w-5 text-purple-500" />
                                ) : (
                                  <Bell className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{notification.title}</p>
                                {notification.task && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Task: {notification.task.title}
                                  </p>
                                )}
                                {notification.senderAgent && (
                                  <p className="text-xs text-muted-foreground">
                                    From: {notification.senderAgent.displayName}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                                  New
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-0">
                {isActivitiesLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : activities.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-48">
                      <p className="text-muted-foreground">No activity yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-2">
                      {activities.map((activity) => {
                        const config = actionConfig[activity.action] || actionConfig.status_updated;
                        const ActionIcon = config.icon;

                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 pb-3 border-b last:border-0"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                              {emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-medium text-sm">{agent.displayName}</span>
                                <ActionIcon className={`h-4 w-4 ${config.color}`} />
                                <span className="text-sm text-muted-foreground">{config.label}</span>
                                {activity.task && (
                                  <span
                                    className="text-sm font-medium cursor-pointer hover:underline"
                                    onClick={() => setSelectedTaskId(activity.task!.id)}
                                  >
                                    "{activity.task.title}"
                                  </span>
                                )}
                              </div>
                              {activity.details?.message && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {activity.details.message}
                                </p>
                              )}
                              {activity.details?.content && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {activity.details.content}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={selectedTaskId !== null}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId || 0}
      />
    </>
  );
};

export default AgentDetailModal;
