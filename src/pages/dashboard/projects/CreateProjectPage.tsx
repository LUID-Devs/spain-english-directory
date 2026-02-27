import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProjectMutation } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/stores/userStore";
import { apiService, Task } from "@/services/apiService";
import { 
  ArrowLeft, 
  FolderPlus, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Loader2,
  Check,
  Sparkles
} from "lucide-react";
import { formatISO } from "date-fns";

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const { currentUser } = useCurrentUser();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [success, setSuccess] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Cleanup timeout on unmount
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser?.userId) return;
      setTasksLoading(true);
      try {
        const tasks = await apiService.getTasksByUser(currentUser.userId);
        setAvailableTasks(tasks);
      } catch (err: any) {
        setError(err?.message || "Failed to load tasks. Please try again.");
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser?.userId]);
  const filteredTasks = useMemo(() => {
    if (!taskSearch.trim()) return availableTasks;
    const query = taskSearch.toLowerCase();
    return availableTasks.filter((task) => task.title.toLowerCase().includes(query));
  }, [availableTasks, taskSearch]);

  const toggleTask = (taskId: number) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const attachTasksToProject = async (projectId: number) => {
    const taskIds = Array.from(selectedTaskIds);
    if (taskIds.length === 0) return;

    try {
      const result = await apiService.bulkMoveToProject(taskIds, projectId);
      if (!result?.success) {
        setAttachmentError(result?.message || "Failed to attach tasks to the new project.");
      }
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : "Failed to attach tasks to the new project.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !startDate || !endDate) return;
    
    // Validate end date is not before start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setError("End date cannot be before start date");
      return;
    }
    
    setError("");
    setAttachmentError("");

    try {
      const formattedStartDate = formatISO(start, {
        representation: "complete",
      });
      const formattedEndDate = formatISO(end, {
        representation: "complete",
      });

      const newProject = await createProject({
        name: projectName,
        description,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      }).unwrap();

      const newProjectId = Number(newProject?.id);
      if (Number.isFinite(newProjectId)) {
        await attachTasksToProject(newProjectId);
      }

      setSuccess(true);
      timeoutRef.current = setTimeout(() => {
        navigate("/dashboard/projects");
      }, 1500);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to create project. Please try again.");
    }
  };

  const isFormValid = projectName && startDate && endDate;

  // Calculate duration display
  const getDurationText = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Don't show duration if dates are invalid (end before start)
    if (end < start) return null;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6 pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Project Created!</h2>
            <p className="text-muted-foreground">
              Redirecting to projects...
            </p>
            {attachmentError && (
              <p className="mt-2 text-xs text-amber-600">
                {attachmentError}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard/projects")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">New Project</h1>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            size="sm"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </header>

      {/* Mobile-First Form */}
      <main className="p-4 pb-24 max-w-lg mx-auto">
        {/* Hero / Context */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create a Project</h2>
              <p className="text-sm text-muted-foreground">
                Organize your work
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name - Prominent for mobile */}
          <div className="space-y-2">
            <Label htmlFor="projectName" className="flex items-center gap-2 text-base">
              <FolderPlus className="h-4 w-4 text-primary" />
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectName"
              type="text"
              placeholder="e.g., Website Redesign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What's this project about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Timeline - Mobile optimized */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Timeline <span className="text-destructive">*</span>
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12"
                  min={startDate}
                />
              </div>
            </div>

            {getDurationText() && (
              <p className="text-sm text-center text-muted-foreground bg-muted rounded-lg py-2">
                Project duration: <span className="font-medium text-foreground">{getDurationText()}</span>
              </p>
            )}
          </div>

          {/* Attach Existing Tasks */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <FolderPlus className="h-4 w-4 text-primary" />
              Attach Existing Tasks
            </Label>
            <Input
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="h-12"
            />
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border p-3 space-y-3">
              {tasksLoading ? (
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              ) : filteredTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks found.</p>
              ) : (
                filteredTasks.map((task) => (
                  <label key={task.id} className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.has(task.id)}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex flex-col">
                      <span className="text-foreground">{task.title}</span>
                      {task.project?.name && (
                        <span className="text-xs text-muted-foreground">Current: {task.project.name}</span>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select tasks to move into this project after creation.
            </p>
          </div>

          {/* Quick Tips Card */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium text-sm">Quick Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use clear, descriptive names</li>
                <li>• Set realistic timelines</li>
                <li>• Add descriptions for context</li>
              </ul>
            </CardContent>
          </Card>
        </form>
      </main>

      {/* Mobile Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden">
        <Button 
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <FolderPlus className="h-5 w-5 mr-2" />
              Create Project
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateProjectPage;
