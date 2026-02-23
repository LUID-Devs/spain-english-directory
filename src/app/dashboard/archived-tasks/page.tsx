import React, { useMemo, useState } from "react";
import {
  Priority,
  Task,
  Status,
  Project,
} from "@/hooks/useApi";
import { useGetProjectsQuery, useGetTasksQuery, useUnarchiveTaskMutation } from "@/hooks/useApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Archive, AlertCircle, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskModal } from "@/contexts/TaskModalContext";

// Task status styling helper
const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'work in progress':
    case 'in progress':
      return 'secondary';
    case 'under review':
      return 'outline';
    default:
      return 'secondary';
  }
};

// Priority styling helper
const getPriorityVariant = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'secondary';
    case 'medium':
      return 'outline';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

const ArchivedTasksPage = () => {
  const { openTaskModal } = useTaskModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Fetch all projects
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery();

  // Fetch archived tasks - we'll fetch from all projects
  const { data: archivedTasks, isLoading: tasksLoading, refetch } = useGetTasksQuery(
    { projectId: selectedProject || (projects?.[0]?.id ? parseInt(projects[0].id) : 0), archived: true },
    { skip: !projects || projects.length === 0 }
  );

  // Unarchive mutation
  const [unarchiveTask] = useUnarchiveTaskMutation();

  // Filter tasks by search term and project
  const filteredTasks = useMemo(() => {
    if (!archivedTasks) return [];
    
    return archivedTasks.filter((task) => {
      const matchesSearch = !searchTerm ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProject = !selectedProject || task.projectId === selectedProject;
      
      return matchesSearch && matchesProject;
    });
  }, [archivedTasks, searchTerm, selectedProject]);

  // Sort tasks by archived date (newest first)
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const aDate = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
      const bDate = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [filteredTasks]);

  const handleUnarchive = async (taskId: number) => {
    try {
      await (unarchiveTask as any)(taskId).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to unarchive task:', error);
    }
  };

  const formatArchivedDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isLoading = tasksLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Archive className="h-8 w-8" />
              Archived Tasks
            </h1>
            <p className="text-muted-foreground">View and restore archived tasks</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading archived tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-8 w-8" />
            Archived Tasks
          </h1>
          <p className="text-muted-foreground">
            {sortedTasks.length} archived task{sortedTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find archived tasks by project or search terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search archived tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Project Filter */}
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">All Projects</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Archived Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Archived Tasks ({sortedTasks.length})</CardTitle>
          <CardDescription>
            Tasks that have been archived and hidden from active views
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Archived Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <button 
                          onClick={() => openTaskModal(task.id)}
                          className="font-medium hover:underline text-left"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {task.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.split(",").map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {projects?.find(p => parseInt(p.id) === task.projectId)?.name || 'No project'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatArchivedDate(task.archivedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openTaskModal(task.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnarchive(task.id)}
                          className="flex items-center gap-1"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                          Restore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">
                No archived tasks
              </p>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedProject
                  ? "Try adjusting your search or filters"
                  : "Archived tasks will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchivedTasksPage;
