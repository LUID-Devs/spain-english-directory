import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, GripVertical } from "lucide-react";
import { useAgentTasks } from "@/hooks/useMissionControl";

interface TaskAssignment {
  id: number;
  agentId: number;
  taskId: number;
  status: string;
  assignedAt: string;
  task: {
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    project?: {
      id: number;
      name: string;
    };
  };
  agent?: {
    id: number;
    name: string;
    displayName: string;
  };
}

const columns = [
  { id: "inbox", title: "Inbox", color: "bg-gray-500" },
  { id: "assigned", title: "Assigned", color: "bg-blue-500" },
  { id: "in_progress", title: "In Progress", color: "bg-yellow-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "completed", title: "Done", color: "bg-green-500" },
];

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-gray-300 text-black",
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

export const TaskBoard: React.FC = () => {
  const { data: assignments, isLoading } = useAgentTasks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = (assignments || []).filter(
      (a: TaskAssignment) => a.status === col.id
    );
    return acc;
  }, {} as Record<string, TaskAssignment[]>);

  return (
    <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
      {columns.map((column) => (
        <div key={column.id} className="min-w-[200px] sm:min-w-[250px] flex-shrink-0 snap-start">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className="font-medium text-sm">{column.title}</h3>
            <Badge variant="secondary" className="ml-auto">
              {tasksByStatus[column.id]?.length || 0}
            </Badge>
          </div>

          <ScrollArea className="h-[300px] sm:h-[400px] lg:h-[500px]">
            <div className="space-y-2 pr-2">
              {tasksByStatus[column.id]?.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3">
                    {/* Task Title */}
                    <p className="font-medium text-sm mb-2 line-clamp-2">
                      {assignment.task.title}
                    </p>

                    {/* Project */}
                    {assignment.task.project && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {assignment.task.project.name}
                      </p>
                    )}

                    {/* Priority & Assignee */}
                    <div className="flex items-center justify-between">
                      {assignment.task.priority && (
                        <Badge
                          className={`text-xs ${priorityColors[assignment.task.priority.toLowerCase()] || priorityColors.medium}`}
                        >
                          {assignment.task.priority}
                        </Badge>
                      )}

                      {assignment.agent && (
                        <span
                          className="text-lg"
                          title={assignment.agent.displayName}
                        >
                          {characterEmojis[assignment.agent.name] || "🤖"}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!tasksByStatus[column.id] || tasksByStatus[column.id].length === 0) && (
                <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};
