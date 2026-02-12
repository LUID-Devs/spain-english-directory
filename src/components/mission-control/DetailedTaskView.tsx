import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  User,
  Folder,
  ArrowUpDown,
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { TaskAssignment } from "@/hooks/useMissionControl";
import TaskDetailModal from "@/components/TaskDetailModal";

interface DetailedTaskViewProps {
  assignments: TaskAssignment[];
  agents: Array<{
    id: number;
    name: string;
    displayName: string;
    role: string;
  }>;
  isLoading: boolean;
}

type SortField = "priority" | "dueDate" | "assignedAt" | "status";
type SortDirection = "asc" | "desc";

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

const statusConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ElementType }> = {
  inbox: { color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-800", label: "Inbox", icon: Clock },
  assigned: { color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "Assigned", icon: User },
  in_progress: { color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", label: "In Progress", icon: Clock },
  review: { color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30", label: "Review", icon: AlertCircle },
  completed: { color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30", label: "Done", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { value: number; color: string; bgColor: string; label: string }> = {
  urgent: { value: 4, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", label: "Urgent" },
  high: { value: 3, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", label: "High" },
  medium: { value: 2, color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", label: "Medium" },
  low: { value: 1, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800", label: "Low" },
};

export const DetailedTaskView: React.FC<DetailedTaskViewProps> = ({
  assignments,
  agents,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("assignedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...(assignments || [])];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.task.title.toLowerCase().includes(query) ||
          a.task.project?.name.toLowerCase().includes(query) ||
          a.agent?.displayName.toLowerCase().includes(query)
      );
    }

    // Agent filter
    if (selectedAgentId !== "all") {
      filtered = filtered.filter((a) => a.agentId.toString() === selectedAgentId);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter(
        (a) => a.task.priority?.toLowerCase() === selectedPriority.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "priority":
          const priorityA = priorityConfig[a.task.priority?.toLowerCase() || "medium"]?.value || 0;
          const priorityB = priorityConfig[b.task.priority?.toLowerCase() || "medium"]?.value || 0;
          comparison = priorityB - priorityA;
          break;
        case "dueDate":
          const dateA = a.task.dueDate ? new Date(a.task.dueDate).getTime() : Infinity;
          const dateB = b.task.dueDate ? new Date(b.task.dueDate).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case "assignedAt":
          comparison = new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [assignments, searchQuery, selectedAgentId, selectedStatus, selectedPriority, sortField, sortDirection]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredAndSortedTasks.length;
    const byStatus = filteredAndSortedTasks.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overdue = filteredAndSortedTasks.filter((a) => {
      if (!a.task.dueDate) return false;
      return new Date(a.task.dueDate) < new Date() && a.status !== "completed";
    }).length;

    return { total, byStatus, overdue };
  }, [filteredAndSortedTasks]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedAgentId("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
  };

  const activeFiltersCount = [
    searchQuery,
    selectedAgentId !== "all",
    selectedStatus !== "all",
    selectedPriority !== "all",
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search and Main Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, projects, or agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="w-[160px]">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        <span className="flex items-center gap-2">
                          <span>{characterEmojis[agent.name] || "🤖"}</span>
                          <span className="truncate">{agent.displayName}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="inbox">Inbox</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Done</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-[140px]">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-normal">
                {stats.total} task{stats.total !== 1 ? "s" : ""}
              </Badge>
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="font-normal">
                  {stats.overdue} overdue
                </Badge>
              )}
              {Object.entries(stats.byStatus).map(([status, count]) => {
                const config = statusConfig[status];
                if (!config || count === 0) return null;
                return (
                  <Badge
                    key={status}
                    variant="outline"
                    className={`font-normal ${config.color} ${config.bgColor}`}
                  >
                    {config.label}: {count}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Tasks</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                    {sortField === "priority" && "Priority"}
                    {sortField === "dueDate" && "Due Date"}
                    {sortField === "assignedAt" && "Assigned"}
                    {sortField === "status" && "Status"}
                    {sortDirection === "asc" ? (
                      <SortAsc className="h-3.5 w-3.5 ml-1" />
                    ) : (
                      <SortDesc className="h-3.5 w-3.5 ml-1" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSort("priority")}>
                    Priority
                    {sortField === "priority" && " ✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("dueDate")}>
                    Due Date
                    {sortField === "dueDate" && " ✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("assignedAt")}>
                    Assigned Date
                    {sortField === "assignedAt" && " ✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("status")}>
                    Status
                    {sortField === "status" && " ✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] sm:h-[500px]">
            <div className="space-y-2">
              {filteredAndSortedTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No tasks match your filters</p>
                  {activeFiltersCount > 0 && (
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredAndSortedTasks.map((assignment) => {
                  const statusCfg = statusConfig[assignment.status] || statusConfig.inbox;
                  const priorityCfg = priorityConfig[assignment.task.priority?.toLowerCase() || "medium"];
                  const StatusIcon = statusCfg.icon;
                  const emoji = assignment.agent ? characterEmojis[assignment.agent.name] || "🤖" : "🤖";
                  const isOverdue =
                    assignment.task.dueDate &&
                    new Date(assignment.task.dueDate) < new Date() &&
                    assignment.status !== "completed";

                  return (
                    <div
                      key={assignment.id}
                      className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedTaskId(assignment.task.id);
                        setSelectedProjectId(assignment.task.project?.id);
                      }}
                    >
                      {/* Status Icon */}
                      <div className={`mt-0.5 ${statusCfg.color}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h4 className="font-medium text-sm line-clamp-2 flex-1">
                            {assignment.task.title}
                          </h4>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-[10px] shrink-0">
                              Overdue
                            </Badge>
                          )}
                        </div>

                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          {/* Priority */}
                          <Badge
                            variant="outline"
                            className={`${priorityCfg?.color} ${priorityCfg?.bgColor} border-0`}
                          >
                            {priorityCfg?.label || assignment.task.priority || "Medium"}
                          </Badge>

                          {/* Status */}
                          <Badge variant="outline" className="font-normal">
                            {statusCfg.label}
                          </Badge>

                          {/* Project */}
                          {assignment.task.project && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Folder className="h-3 w-3" />
                              {assignment.task.project.name}
                            </span>
                          )}

                          {/* Due Date */}
                          {assignment.task.dueDate && (
                            <span
                              className={`flex items-center gap-1 ${
                                isOverdue ? "text-red-500" : "text-muted-foreground"
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(assignment.task.dueDate), "MMM d")}
                            </span>
                          )}

                          {/* Assigned At */}
                          <span className="text-muted-foreground">
                            Assigned {formatDistanceToNow(new Date(assignment.assignedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Agent */}
                      {assignment.agent && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm bg-muted">
                              {emoji}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden sm:block">
                            <p className="text-xs font-medium">{assignment.agent.displayName}</p>
                            <Badge
                              className={`text-[10px] text-white ${
                                roleColors[assignment.agent.role] || "bg-gray-500"
                              }`}
                            >
                              {assignment.agent.role.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Task actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTaskId(assignment.task.id);
                              setSelectedProjectId(assignment.task.project?.id);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={selectedTaskId !== null}
        onClose={() => {
          setSelectedTaskId(null);
          setSelectedProjectId(undefined);
        }}
        taskId={selectedTaskId || 0}
        projectId={selectedProjectId}
      />
    </div>
  );
};

export default DetailedTaskView;
