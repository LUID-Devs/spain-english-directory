import { useGetTasksQuery } from "@/hooks/useApi";
import React, { useMemo, useState } from "react";
import { useGlobalStore } from "@/stores/globalStore";
import { Plus, Table2, Calendar, Clock, Search, Download, AlertTriangle, Target, Activity, List as ListIcon } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  tasks?: any[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

const TableView = ({ 
  id, 
  setIsModalNewTaskOpen, 
  tasks: propTasks, 
  tasksLoading, 
  tasksError, 
  refetchTasks 
}: Props) => {
  const isDarkMode = useGlobalStore().isDarkMode;
  
  // Fallback to fetching data if not provided via props
  const { data: fetchedTasks, isLoading: fetchedLoading, error: fetchedError } = useGetTasksQuery(
    { projectId: Number(id) }, 
    { skip: !!propTasks }
  );
  
  // Use prop data if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks;
  const isLoading = tasksLoading !== undefined ? tasksLoading : fetchedLoading;
  const error = tasksError !== undefined ? tasksError : fetchedError;

  const [searchQuery, setSearchQuery] = useState("");

  const getPriorityBadge = (priority: string) => {
    const configs = {
      "Urgent": { variant: "destructive" as const, icon: AlertTriangle },
      "High": { variant: "default" as const, icon: Target },
      "Medium": { variant: "secondary" as const, icon: Activity },
      "Low": { variant: "outline" as const, icon: Clock },
      "Backlog": { variant: "outline" as const, icon: ListIcon },
    };
    return configs[priority as keyof typeof configs] || { variant: "outline" as const, icon: Activity };
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "To Do": "outline" as const,
      "Work In Progress": "secondary" as const,
      "Under Review": "default" as const,
      "Completed": "default" as const,
    };
    return variants[status as keyof typeof variants] || "outline";
  };


  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks || [];
    
    return (tasks || []).filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.priority?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);


  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !tasks) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive">An error occurred while fetching tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Table2 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Tasks Table</CardTitle>
                <CardDescription>
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} displayed
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setIsModalNewTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filteredTasks.length === 0 && searchQuery ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No matching tasks
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try adjusting your search to find more tasks.
            </p>
          </CardContent>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Table2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tasks yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by creating your first task for this project.
            </p>
            <Button onClick={() => setIsModalNewTaskOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tasks Table</CardTitle>
            <CardDescription>
              Detailed view of all project tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const priorityBadge = getPriorityBadge(task.priority);
                  const statusVariant = getStatusBadge(task.status || "To Do");
                  const PriorityIcon = priorityBadge.icon;

                  return (
                    <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium text-foreground">{task.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant} className="text-xs">
                          {task.status || "To Do"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.priority ? (
                          <Badge variant={priorityBadge.variant} className="text-xs">
                            {task.priority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.taskType ? (
                          <Badge variant="outline" className="text-xs">
                            {task.taskType}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.assignee ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl}`}
                                alt={task.assignee.username}
                              />
                              <AvatarFallback className="text-xs">
                                {task.assignee.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-foreground">
                              {task.assignee.username}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className="flex items-center space-x-1 text-sm text-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.tags ? (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.split(",").slice(0, 2).map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                            {task.tags.split(",").length > 2 && (
                              <span className="text-xs text-muted-foreground">+{task.tags.split(",").length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TableView;
