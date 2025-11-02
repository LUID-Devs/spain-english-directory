import { Task } from "@/hooks/useApi";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import React from "react";
import { 
  Calendar, 
  Rocket, 
  User, 
  Users, 
  Tag, 
  ChevronRight,
  AlertTriangle,
  Target,
  Activity,
  Clock,
  List as ListIcon,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTaskModal } from "@/contexts/TaskModalContext";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const { openTaskModal } = useTaskModal();

  const getPriorityConfig = (priority: string) => {
    const configs = {
      "Urgent": { 
        variant: "destructive" as const,
        icon: AlertTriangle,
      },
      "High": { 
        variant: "default" as const,
        icon: Target,
      },
      "Medium": { 
        variant: "secondary" as const,
        icon: Activity,
      },
      "Low": { 
        variant: "outline" as const,
        icon: Clock,
      },
      "Backlog": { 
        variant: "outline" as const,
        icon: ListIcon,
      },
    };
    return configs[priority as keyof typeof configs] || { variant: "outline" as const, icon: Activity };
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      "Completed": { variant: "default" as const, icon: CheckCircle2 },
      "Work In Progress": { variant: "secondary" as const, icon: Activity },
      "Under Review": { variant: "outline" as const, icon: Clock },
      "To Do": { variant: "outline" as const, icon: ListIcon },
    };
    return configs[status as keyof typeof configs] || { variant: "outline" as const, icon: ListIcon };
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (task.status === "Completed") return null;
    
    if (isBefore(dueDate, now)) {
      return { type: "overdue", text: "Overdue", variant: "destructive" as const };
    } else if (formatDistanceToNow(dueDate).includes("day") && parseInt(formatDistanceToNow(dueDate)) <= 2) {
      return { type: "due-soon", text: "Due soon", variant: "secondary" as const };
    }
    
    return null;
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status || "To Do");
  const dueDateStatus = getDueDateStatus();
  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;
  
  return (
    <Card 
      onClick={() => openTaskModal(task.id)}
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform"
    >
      <CardContent className="p-4 space-y-4">
        {/* Attachment preview */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="relative rounded-md overflow-hidden">
            <img
              src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              className="h-32 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {task.attachments.length > 1 && (
              <p className="absolute bottom-2 right-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                +{task.attachments.length - 1} more
              </p>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
              {task.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              ID: {task.id}
            </p>
          </div>
          
          {/* Priority badge */}
          {task.priority && (
            <Badge variant={priorityConfig.variant} className="text-xs ml-2 flex-shrink-0">
              <PriorityIcon className="h-3 w-3 mr-1" />
              {task.priority}
            </Badge>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Status and Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusConfig.variant} className="text-xs">
            <StatusIcon className="h-3 w-3 mr-1" />
            {task.status || "To Do"}
          </Badge>
          
          {task.tags && (
            <Badge variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {task.tags}
            </Badge>
          )}

          {dueDateStatus && (
            <Badge variant={dueDateStatus.variant} className="text-xs">
              {dueDateStatus.text}
            </Badge>
          )}
        </div>

        {/* Dates */}
        {(task.dueDate || task.startDate) && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-2" />
                <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
              </div>
            )}
            
            {task.startDate && (
              <div className="flex items-center">
                <Rocket className="h-3 w-3 mr-2" />
                <span>Started: {format(new Date(task.startDate), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        )}

        {/* Team members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            {task.assignee ? (
              <div className="flex items-center space-x-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl}`}
                    alt={task.assignee.username}
                  />
                  <AvatarFallback className="text-xs">
                    {task.assignee.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">{task.assignee.username}</span>
              </div>
            ) : task.author && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">By {task.author.username}</span>
              </div>
            )}
          </div>
          
          {/* Hover indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
