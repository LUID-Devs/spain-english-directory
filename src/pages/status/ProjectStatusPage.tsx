import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { 
  Lock, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  Layout,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  startDate: string | null;
  dueDate: string | null;
  points: number | null;
  assignedUserId?: number | null;
  assignee?: {
    username: string;
    profilePictureUrl: string | null;
  } | null;
  _count?: {
    comments: number;
  };
}

interface Column {
  id: number;
  name: string;
  color: string | null;
  order: number;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface ShareOptions {
  showTaskDetails: boolean;
  showAssignees: boolean;
  showComments: boolean;
}

interface ProjectStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  completed: number;
  inProgress: number;
}

interface ProjectShareData {
  success: boolean;
  project: Project;
  tasks: Task[];
  columns: Column[];
  stats: ProjectStats;
  shareOptions: ShareOptions;
  expiresAt: string | null;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-blue-500",
  Backlog: "bg-gray-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  Completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  "Work In Progress": <Clock className="w-4 h-4 text-blue-500" />,
  "To Do": <Circle className="w-4 h-4 text-gray-400" />,
};

const ProjectStatusPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<ProjectShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const fetchProjectData = async (sharePassword?: string) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sharePassword) {
        headers["x-share-password"] = sharePassword;
      }

      const response = await fetch(`${API_URL}/status/${token}`, {
        headers,
      });

      if (response.status === 401) {
        setPasswordRequired(true);
        setLoading(false);
        return;
      }

      if (response.status === 403) {
        setError("Invalid password. Please try again.");
        setPasswordRequired(true);
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        setError("This project share link is not found or has been revoked.");
        setLoading(false);
        return;
      }

      if (response.status === 410) {
        setError("This project share link has expired.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load project data");
      }

      const result = await response.json();
      setData(result);
      setPasswordRequired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjectData(password);
  };

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    if (!selectedColumn) return data.tasks;
    return data.tasks.filter((task) => task.status === selectedColumn);
  }, [data?.tasks, selectedColumn]);

  const groupedTasks = useMemo(() => {
    if (!data?.tasks || !data?.columns) return {};
    
    const grouped: Record<string, Task[]> = {};
    
    // Initialize with columns
    data.columns.forEach((col) => {
      grouped[col.name] = [];
    });
    
    // Add "Unknown" column for tasks with status not in columns
    grouped["Unknown"] = [];
    
    // Group tasks
    data.tasks.forEach((task) => {
      const columnName = data.columns.find((c) => c.name === task.status)?.name || "Unknown";
      if (!grouped[columnName]) grouped[columnName] = [];
      grouped[columnName].push(task);
    });
    
    return grouped;
  }, [data?.tasks, data?.columns]);

  const completionPercentage = useMemo(() => {
    if (!data?.stats) return 0;
    if (data.stats.total === 0) return 0;
    return Math.round((data.stats.completed / data.stats.total) * 100);
  }, [data?.stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Password Protected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              This project requires a password to view.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <Button type="submit" className="w-full">
                View Project
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { project, stats, shareOptions } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layout className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Public Project Board
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {(project.startDate || project.endDate) && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {project.startDate && format(new Date(project.startDate), "MMM d")}
                    {project.startDate && project.endDate && " - "}
                    {project.endDate && format(new Date(project.endDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Public View</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Layout className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
                    <p className="text-2xl font-bold">{completionPercentage}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        {shareOptions.showTaskDetails && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "board" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("board")}
              >
                Board
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
              <select
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800"
                value={selectedColumn || ""}
                onChange={(e) => setSelectedColumn(e.target.value || null)}
              >
                <option value="">All Columns</option>
                {data.columns.map((col) => (
                  <option key={col.id} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Board View */}
        {viewMode === "board" && shareOptions.showTaskDetails && (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {data.columns.map((column) => {
              const columnTasks = groupedTasks[column.name] || [];
              if (selectedColumn && selectedColumn !== column.name) return null;

              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-80"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color || "#6B7280" }}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                              {task.title}
                            </h4>
                            {task.priority && (
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  priorityColors[task.priority] || "bg-gray-400"
                                }`}
                                title={task.priority}
                              />
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              {shareOptions.showAssignees && task.assignee && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{task.assignee.username}</span>
                                </div>
                              )}
                            </div>
                            {task.dueDate && (
                              <span className={new Date(task.dueDate) < new Date() ? "text-red-500" : ""}>
                                Due {format(new Date(task.dueDate), "MMM d")}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && shareOptions.showTaskDetails && (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {statusIcons[task.status] || <Circle className="w-5 h-5 text-gray-400" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      style={{
                        backgroundColor: data.columns.find((c) => c.name === task.status)?.color || "#6B7280",
                      }}
                      className="text-white"
                    >
                      {task.status}
                    </Badge>
                    {task.priority && (
                      <Badge
                        className={`${priorityColors[task.priority]} text-white`}
                      >
                        {task.priority}
                      </Badge>
                    )}
                    {shareOptions.showAssignees && task.assignee && (
                      <span className="text-sm text-gray-500">{task.assignee.username}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Limited View Message */}
        {!shareOptions.showTaskDetails && (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Task Details Hidden
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                The project owner has chosen to share only the project statistics.
              </p>
              <div className="mt-6 flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>Powered by TaskLuid</p>
            {data.expiresAt && (
              <p>
                Link expires: {format(new Date(data.expiresAt), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectStatusPage;
