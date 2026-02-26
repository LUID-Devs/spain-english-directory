import Modal from "@/components/Modal";
import { useCreateProjectMutation, useGetTasksByUserQuery, useUpdateTaskMutation } from "@/hooks/useApi";
import React, { useState } from "react";
import { formatISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from "@/stores/userStore";
import { toast } from "sonner";
import { AlertTriangle, Loader2, FolderPlus, Calendar, FileText, HelpCircle, Lock, Globe } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalNewProject = ({ isOpen, onClose }: Props) => {
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { currentUser } = useCurrentUser();
  const { data: tasks } = useGetTasksByUserQuery(currentUser?.userId ?? null, {
    skip: !currentUser?.userId,
  });
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [error, setError] = useState<string>("");

  const filteredTasks = (tasks || [])
    .filter((task) => !task.archivedAt)
    .filter((task) => task.title?.toLowerCase().includes(taskSearch.toLowerCase()));

  const toggleTaskSelection = (taskId: number, isChecked: boolean) => {
    setSelectedTaskIds((prev) =>
      isChecked ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  };

  const attachTasksToProject = async (projectId: number) => {
    if (!selectedTaskIds.length) return;
    const results = await Promise.allSettled(
      selectedTaskIds.map((taskId) =>
        updateTask({ taskId, task: { projectId } }).unwrap()
      )
    );
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length) {
      toast.error(
        `Project created, but ${failures.length} task${failures.length === 1 ? "" : "s"} could not be attached.`
      );
    }
  };

  const handleSubmit = async () => {
    if (!projectName || !startDate || !endDate) return;

    // Validate end date is not before start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setError("End date cannot be before start date");
      return;
    }

    setError(""); // Clear any previous errors

    try {
      const formattedStartDate = formatISO(new Date(startDate), {
        representation: "complete",
      });
      const formattedEndDate = formatISO(new Date(endDate), {
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

      // Success - clear form and close modal
      setProjectName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setTaskSearch("");
      setSelectedTaskIds([]);
      setError("");
      onClose();
    } catch (err: any) {
      // Handle error
      setError(err?.data?.message || "Failed to create project. Please try again.");
    }
  };

  const handleClose = () => {
    setProjectName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setTaskSearch("");
    setSelectedTaskIds([]);
    setError("");
    onClose();
  };

  const isFormValid = () => {
    return projectName && startDate && endDate;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} name="Create New Project">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Header description */}
        <p className="text-sm text-muted-foreground">
          Create a new project to organize your tasks and collaborate with your team.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Project Name */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="projectName" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-muted-foreground" />
              Project Name *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Project Name Tips</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Use a clear, descriptive name</li>
                    <li>• Include version or phase if applicable (e.g., "v2" or "Phase 1")</li>
                    <li>• Keep it concise but informative</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Input
            id="projectName"
            type="text"
            placeholder="e.g., Website Redesign"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-11"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Choose a name that clearly describes the project&apos;s purpose.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">What to Include</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Project goals and objectives</li>
                    <li>• Key deliverables</li>
                    <li>• Target audience or stakeholders</li>
                    <li>• Any constraints or requirements</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Textarea
            id="description"
            placeholder="What is this project about? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Optional but recommended. Helps team members understand the project scope.
          </p>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Project Timeline *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Setting Timelines</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Start date: When work officially begins</li>
                    <li>• End date: Target completion deadline</li>
                    <li>• Can be adjusted later as needed</li>
                    <li>• Used for progress tracking and reporting</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Start Date</span>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">End Date</span>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11"
                min={startDate}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Define the project duration. All tasks within this project should fall within these dates.
          </p>
        </div>

        {/* Attach Existing Tasks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Attach Existing Tasks</Label>
            <span className="text-xs text-muted-foreground">
              {selectedTaskIds.length} selected
            </span>
          </div>
          <Input
            type="text"
            placeholder="Search your tasks..."
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto rounded-md border border-border p-3 space-y-2">
            {filteredTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tasks match your search.</p>
            ) : (
              filteredTasks.map((task) => (
                <label key={task.id} className="flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={selectedTaskIds.includes(task.id)}
                    onCheckedChange={(checked) => toggleTaskSelection(task.id, checked === true)}
                  />
                  <span className="text-foreground leading-snug">{task.title}</span>
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            You can also move tasks later from the Tasks page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 bg-primary hover:bg-primary/90"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalNewProject;
