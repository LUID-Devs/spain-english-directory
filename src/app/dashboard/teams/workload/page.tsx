import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/authProvider";
import { fetchAuthSession } from 'aws-amplify/auth';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGetTasksQuery, useUpdateTaskMutation, useGetProjectsQuery, Task } from "@/hooks/useApi";
import type { DropTargetMonitor, DragSourceMonitor } from 'react-dnd';
import { toast } from "sonner";
import {
  Users,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  Calendar,
  AlertTriangle,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { escapeHtml } from "@/lib/escapeHtml";
import { Link } from "react-router-dom";
import { format, isPast, isToday, isTomorrow } from "date-fns";

interface WorkspaceMember {
  odId: number;
  odUserId: number;
  organizationId: number;
  userId: number;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    userId: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

interface MemberWorkload {
  member: WorkspaceMember;
  tasks: Task[];
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
    highPriority: number;
  };
  capacity: number; // percentage (0-100)
}

// Draggable task item type
const TASK_ITEM_TYPE = "workload-task";

// Get auth headers helper
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  try {
    const session = await fetchAuthSession();
    if (session?.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${session.tokens.accessToken}`;
    }
    if (session?.tokens?.idToken) {
      headers['X-ID-Token'] = `${session.tokens.idToken}`;
    }
  } catch (e) {
    // No Cognito session available
  }
  return headers;
};

// Priority config
const PRIORITY_CONFIGS = {
  "Urgent": { color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  "High": { color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  "Medium": { color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200" },
  "Low": { color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
  "Backlog": { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

const TeamWorkloadPage = () => {
  const { activeOrganization, user } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [updateTask] = useUpdateTaskMutation();

  // Fetch all tasks for the organization
  const { data: tasks, isLoading: isLoadingTasks, refetch: refetchTasks } = useGetTasksQuery(
    // @ts-ignore - organizationId is supported at runtime but not in types
    { organizationId: activeOrganization?.id },
    { skip: !activeOrganization?.id }
  );

  // Fetch projects for filter dropdown
  const { data: projects, isLoading: isLoadingProjects } = useGetProjectsQuery(
    { organizationId: activeOrganization?.id },
    { skip: !activeOrganization?.id }
  );

  // Fetch workspace members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeOrganization?.id) {
        setIsLoadingMembers(false);
        return;
      }

      setIsLoadingMembers(true);
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/organizations/${activeOrganization.id}/members`,
          { credentials: 'include', headers }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMembers(data.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching members:', err);
        toast.error("Failed to load team members");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [activeOrganization?.id]);

  // Filter tasks by selected project
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    if (selectedProjectId === "all") return tasks;
    return tasks.filter(task => task.projectId === Number(selectedProjectId));
  }, [tasks, selectedProjectId]);

  // Calculate workload data for each member
  const workloadData: MemberWorkload[] = useMemo(() => {
    if (!filteredTasks || !members.length) return [];

    return members.map(member => {
      const memberTasks = filteredTasks.filter(task =>
        task.assignedUsers?.some((u: { userId: number }) => u.userId === member.userId) ||
        task.assignedUserId === member.userId
      );

      const stats = {
        total: memberTasks.length,
        inProgress: memberTasks.filter(t => t.status === 'Work In Progress').length,
        completed: memberTasks.filter(t => t.status === 'Completed').length,
        overdue: memberTasks.filter(t => {
          if (!t.dueDate || t.status === 'Completed') return false;
          return isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
        }).length,
        highPriority: memberTasks.filter(t =>
          t.priority === 'Urgent' || t.priority === 'High'
        ).length,
      };

      // Calculate capacity (assume 5 tasks is 100% capacity)
      // Green: < 60%, Yellow: 60-80%, Red: > 80%
      const capacity = Math.min((stats.inProgress / 5) * 100, 100);

      return {
        member,
        tasks: memberTasks,
        stats,
        capacity,
      };
    }).sort((a, b) => b.capacity - a.capacity); // Sort by workload (highest first)
  }, [filteredTasks, members]);

  // Handle task reassignment via drag-drop
  const handleTaskReassign = async (taskId: number, newAssigneeId: number) => {
    try {
      const task = tasks?.find(t => t.id === taskId);
      if (!task) return;

      // Get current assignees (excluding the one being moved from)
      const currentAssignees = task.assignedUsers?.map((u: { userId: number }) => u.userId) || [];
      const newAssignees = [...new Set([...currentAssignees, newAssigneeId])];

      await updateTask({
        taskId,
        task: { assignedUserIds: newAssignees }
      }).unwrap();

      toast.success("Task reassigned successfully!");
      refetchTasks();
    } catch (error) {
      console.error('Failed to reassign task:', error);
      toast.error("Failed to reassign task");
    }
  };

  // Calculate team totals
  const teamTotals = useMemo(() => {
    return workloadData.reduce((acc, member) => ({
      total: acc.total + member.stats.total,
      inProgress: acc.inProgress + member.stats.inProgress,
      completed: acc.completed + member.stats.completed,
      overdue: acc.overdue + member.stats.overdue,
      highPriority: acc.highPriority + member.stats.highPriority,
    }), { total: 0, inProgress: 0, completed: 0, overdue: 0, highPriority: 0 });
  }, [workloadData]);

  const isLoading = isLoadingMembers || isLoadingTasks || isLoadingProjects;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/teams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading team workload...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/teams">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <LayoutGrid className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                Team Workload
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Drag and drop tasks to reassign team members
              </p>
            </div>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProjectId !== "all" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedProjectId("all")}
                className="h-9 w-9"
                aria-label="Clear project filter"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{teamTotals.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{teamTotals.inProgress}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{teamTotals.completed}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{teamTotals.highPriority}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">High Priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-2xl font-bold">{teamTotals.overdue}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Workload Board */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4 min-w-max">
            {workloadData.map((workload) => (
              <MemberColumn
                key={workload.member.userId}
                workload={workload}
                onTaskReassign={handleTaskReassign}
                currentUserId={user?.userId}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {workloadData.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No team members found</h3>
              <p className="text-muted-foreground max-w-sm">
                Add team members to see their workload and manage task assignments
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DndProvider>
  );
};

// Member Column Component
interface MemberColumnProps {
  workload: MemberWorkload;
  onTaskReassign: (taskId: number, newAssigneeId: number) => void;
  currentUserId?: number;
}

const MemberColumn = ({ workload, onTaskReassign, currentUserId }: MemberColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: TASK_ITEM_TYPE,
    drop: (item: { id: number }) => {
      onTaskReassign(item.id, workload.member.userId);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const { member, tasks, stats, capacity } = workload;

  // Capacity color: Green (< 60%), Yellow (60-80%), Red (> 80%)
  const getCapacityColor = (cap: number) => {
    if (cap < 60) return { bar: "bg-green-500", text: "text-green-600", border: "border-green-200", bg: "bg-green-50" };
    if (cap <= 80) return { bar: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-200", bg: "bg-yellow-50" };
    return { bar: "bg-red-500", text: "text-red-600", border: "border-red-200", bg: "bg-red-50" };
  };

  const capacityColors = getCapacityColor(capacity);
  const isOverCapacity = capacity > 80;
  const isAtRisk = stats.overdue > 0 || stats.highPriority > 2;

  return (
    <Card
      ref={(instance) => { drop(instance); }}
      className={cn(
        "w-[320px] flex-shrink-0 transition-all duration-200",
        isOver && "ring-2 ring-primary ring-offset-2",
        isOverCapacity && capacityColors.border
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {member.user?.profilePictureUrl ? (
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={`https://pm-s3-images.s3.us-east-1.amazonaws.com/${member.user.profilePictureUrl}`}
                alt={member.user.username}
              />
              <AvatarFallback>{member.user.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                {member.user?.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium truncate">
                {member.user?.username || 'Unknown'}
              </CardTitle>
              {member.userId === currentUserId && (
                <Badge variant="outline" className="text-[10px] px-1">You</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{escapeHtml(member.user?.email)}</p>
            
            {/* Capacity Bar with Green/Yellow/Red colors */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Capacity</span>
                <span className={cn("font-medium", capacityColors.text)}>
                  {Math.round(capacity)}%
                </span>
              </div>
              <div className={cn("h-2 rounded-full bg-gray-100 overflow-hidden")}>
                <div
                  className={cn("h-full rounded-full transition-all duration-300", capacityColors.bar)}
                  style={{ width: `${capacity}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">
            {stats.total} tasks
          </Badge>
          {stats.inProgress > 0 && (
            <Badge variant="outline" className="text-[10px] text-blue-600">
              {stats.inProgress} active
            </Badge>
          )}
          {stats.overdue > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats.overdue} overdue
            </Badge>
          )}
          {isAtRisk && stats.overdue === 0 && (
            <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              At Risk
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No assigned tasks</p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag tasks here to assign
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

// Draggable Task Card Component
interface DraggableTaskCardProps {
  task: Task;
}

const DraggableTaskCard = ({ task }: DraggableTaskCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: TASK_ITEM_TYPE,
    item: { id: task.id },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const priorityConfig = PRIORITY_CONFIGS[task.priority as keyof typeof PRIORITY_CONFIGS] || 
    PRIORITY_CONFIGS["Medium"];

  const getDueDateLabel = () => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    if (isToday(due)) return { text: "Today", color: "text-blue-500" };
    if (isTomorrow(due)) return { text: "Tomorrow", color: "text-yellow-500" };
    if (isPast(due) && task.status !== 'Completed') return { text: "Overdue", color: "text-destructive" };
    return { text: format(due, "MMM d"), color: "text-muted-foreground" };
  };

  const dueLabel = getDueDateLabel();

  return (
    <Card
      ref={(instance) => { drag(instance); }}
      className={cn(
        "cursor-move transition-all duration-200 hover:shadow-md",
        isDragging && "opacity-50 rotate-2 scale-95",
        priorityConfig.border,
        priorityConfig.bg
      )}
    >
      <CardContent className="p-3 space-y-2">
        {/* Title */}
        <h4 className="text-sm font-medium line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Tags Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn("text-[10px] px-1.5 py-0", priorityConfig.color)}
          >
            {task.priority}
          </Badge>
          {task.status && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {task.status}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {dueLabel && (
            <div className={cn("flex items-center gap-1 text-xs", dueLabel.color)}>
              <Calendar className="h-3 w-3" />
              <span>{dueLabel.text}</span>
            </div>
          )}
          {task.project && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
              {task.project.name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamWorkloadPage;
