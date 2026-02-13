
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGetTaskQuery, useUpdateTaskMutation, useGetUsersQuery, useUploadTaskDescriptionImageMutation, useGetProjectStatusesQuery } from "@/hooks/useApi";
import { toast } from "sonner";
import { Calendar, User, Flag, Clock, Paperclip, Tag, CircleDot, Loader2, Image, Share2, Bot, X, HelpCircle } from "lucide-react";
import CommentsSection from "@/components/CommentsSection";
import AttachmentsSection from "@/components/AttachmentsSection";
import RichTextEditor from "@/components/RichTextEditor";
import GitActivity from "@/components/GitActivity";
import { Status, Priority, TaskType } from "@/hooks/useApi";
import { useAgents, useAssignTaskToAgent, useTaskAgentAssignments, useUnassignTaskFromAgent } from "@/hooks/useMissionControl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  projectId?: number;
  editMode?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, taskId, projectId }) => {
  const { data: task, isLoading, error, refetch } = useGetTaskQuery(taskId, { skip: !isOpen });
  const { data: users = [] } = useGetUsersQuery(undefined, {
    skip: !isOpen,
  });
  const { data: agents = [], isLoading: isAgentsLoading } = useAgents();
  const {
    data: taskAgentAssignments = [],
    isLoading: isTaskAgentAssignmentsLoading,
    refetch: refetchTaskAgentAssignments,
  } = useTaskAgentAssignments(isOpen ? taskId : undefined);
  const assignTaskToAgent = useAssignTaskToAgent();
  const unassignTaskFromAgent = useUnassignTaskFromAgent();

  // Fetch dynamic statuses for the project
  const effectiveProjectId = projectId || task?.projectId;
  const { data: statusesData } = useGetProjectStatusesQuery(
    effectiveProjectId!,
    { skip: !isOpen || !effectiveProjectId }
  );

  // Get status names from API data or fall back to enum values
  const availableStatuses = React.useMemo(() => {
    if (statusesData && statusesData.length > 0) {
      return statusesData.map((s) => s.name);
    }
    return Object.values(Status);
  }, [statusesData]);
  const [updateTask] = useUpdateTaskMutation() as any;
  const [uploadDescriptionImage] = useUploadTaskDescriptionImageMutation();

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedAgentToAssign, setSelectedAgentToAssign] = useState<string>("none");

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: Status.ToDo as string,
    priority: Priority.Medium,
    taskType: undefined as TaskType | undefined,
    tags: "",
    startDate: "",
    dueDate: "",
    points: 0,
    assignedUserId: undefined as number | undefined,
  });

  // Track if form has been initialized from task data
  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize form when task data loads
  useEffect(() => {
    if (task && !isInitializedRef.current) {
      // Fix: Derive assignedUserId from assignee object if assignedUserId is not directly available
      // This ensures the assignee dropdown shows the correct user even if the API response
      // has inconsistent data between assignedUserId and assignee fields
      const resolvedAssignedUserId = task.assignedUserId || task.assignee?.userId || undefined;
      
      setEditForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || Status.ToDo,
        priority: task.priority || Priority.Medium,
        taskType: task.taskType || undefined,
        tags: task.tags || "",
        startDate: task.startDate ? task.startDate.split('T')[0] : "",
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
        points: task.points || 0,
        assignedUserId: resolvedAssignedUserId,
      });
      isInitializedRef.current = true;
    }
  }, [task]);

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      setSelectedAgentToAssign("none");
    }
  }, [isOpen]);

  // Handle keyboard scrolling
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 60;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        container.scrollTop += scrollAmount;
        break;
      case 'ArrowUp':
        e.preventDefault();
        container.scrollTop -= scrollAmount;
        break;
      case 'PageDown':
        e.preventDefault();
        container.scrollTop += container.clientHeight * 0.8;
        break;
      case 'PageUp':
        e.preventDefault();
        container.scrollTop -= container.clientHeight * 0.8;
        break;
      case 'Home':
        e.preventDefault();
        container.scrollTop = 0;
        break;
      case 'End':
        e.preventDefault();
        container.scrollTop = container.scrollHeight;
        break;
    }
  }, []);

  // Auto-save function
  const autoSave = useCallback(async (formData: typeof editForm) => {
    if (!isInitializedRef.current) return;

    // Validate due date is not before start date
    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      if (due < start) {
        toast.error("Due date cannot be earlier than start date");
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateTask({
        taskId,
        task: {
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        },
      }).unwrap();
      // No event dispatch needed - optimistic update handles state sync
    } catch (error) {
      console.error("Failed to auto-save task:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [taskId, updateTask]);

  // Debounced save - triggers auto-save after 800ms of no changes
  const debouncedSave = useCallback((formData: typeof editForm) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(formData);
    }, 800);
  }, [autoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle form field changes with auto-save
  const handleFieldChange = useCallback((field: keyof typeof editForm, value: any) => {
    setEditForm(prev => {
      const newForm = { ...prev, [field]: value };
      debouncedSave(newForm);
      return newForm;
    });
  }, [debouncedSave]);

  // Handle image upload for rich text editor
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await uploadDescriptionImage({ formData });
      const response = await result.unwrap();
      toast.success("Image uploaded");
      return response.imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadDescriptionImage]);

  const handleClose = () => {
    // Save any pending changes immediately before closing
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      autoSave(editForm);
    }
    onClose();
  };

  const handleShare = () => {
    const taskUrl = `${window.location.origin}/dashboard/tasks/${taskId}`;
    navigator.clipboard.writeText(taskUrl).then(() => {
      toast.success("Link copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const assignedAgentIdSet = React.useMemo(
    () => new Set(taskAgentAssignments.map((assignment) => assignment.agentId)),
    [taskAgentAssignments]
  );

  const handleAssignAgent = useCallback(
    async (value: string) => {
      setSelectedAgentToAssign(value);
      if (value === "none") return;

      const agentId = Number.parseInt(value, 10);
      if (Number.isNaN(agentId)) {
        toast.error("Invalid agent selected");
        setSelectedAgentToAssign("none");
        return;
      }

      if (assignedAgentIdSet.has(agentId)) {
        toast.info("Agent is already assigned to this task");
        setSelectedAgentToAssign("none");
        return;
      }

      try {
        await assignTaskToAgent.mutateAsync({ taskId, agentIds: [agentId] });
        await refetchTaskAgentAssignments();
        toast.success("AI agent assigned");
      } catch (assignError) {
        console.error("Failed to assign agent:", assignError);
        toast.error(assignError instanceof Error ? assignError.message : "Failed to assign AI agent");
      } finally {
        setSelectedAgentToAssign("none");
      }
    },
    [assignedAgentIdSet, assignTaskToAgent, refetchTaskAgentAssignments, taskId]
  );

  const handleUnassignAgent = useCallback(
    async (agentId: number) => {
      try {
        await unassignTaskFromAgent.mutateAsync({ taskId, agentId });
        await refetchTaskAgentAssignments();
        toast.success("AI agent unassigned");
      } catch (unassignError) {
        console.error("Failed to unassign agent:", unassignError);
        toast.error(unassignError instanceof Error ? unassignError.message : "Failed to unassign AI agent");
      }
    },
    [refetchTaskAgentAssignments, taskId, unassignTaskFromAgent]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs sm:text-sm font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
                Task #{taskId}
              </span>
              {(isSaving || isUploadingImage) && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {isUploadingImage ? "Uploading…" : "Saving…"}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 self-start sm:self-auto"
              aria-label="Share task"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div
          ref={scrollContainerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="overflow-y-scroll max-h-[calc(90vh-120px)] pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-16 bg-muted rounded animate-pulse" />
                <div className="h-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : error || !task ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Task Not Found</h3>
              <p className="text-muted-foreground">
                The task you're looking for doesn't exist or has been deleted.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Left Column - Main Content */}
              <div className="flex-1 space-y-4 lg:space-y-5 min-w-0 order-2 lg:order-1">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground font-medium">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Enter task title…"
                    className="text-lg"
                    autoComplete="off"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    Description
                    <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      Paste image with Ctrl+V
                    </span>
                  </Label>
                  <RichTextEditor
                    content={editForm.description}
                    onChange={(content) => handleFieldChange('description', content)}
                    onImageUpload={handleImageUpload}
                    placeholder="Enter task description... (paste an image with Ctrl+V)"
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <Paperclip className="h-4 w-4" />
                    Attachments
                  </Label>
                  <div className="border rounded-md p-4">
                    <AttachmentsSection taskId={taskId} />
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Comments</Label>
                  <div className="border rounded-md p-4">
                    <CommentsSection taskId={taskId} />
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar Metadata (shows first on mobile) */}
              <div className="w-full lg:w-64 flex-shrink-0 order-1 lg:order-2 border-b lg:border-b-0 pb-4 lg:pb-0">
                {/* Mobile: 2-column grid, Desktop: single column */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
                  {/* Status */}
                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                        <CircleDot className="h-3 w-3 lg:h-4 lg:w-4" />
                        Status
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72" align="start">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Task Status</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">To Do:</span>
                                <span className="text-muted-foreground">Work that hasn&apos;t started yet. The starting point for new tasks.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">In Progress:</span>
                                <span className="text-muted-foreground">Actively being worked on. Update regularly with progress.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">Under Review:</span>
                                <span className="text-muted-foreground">Work complete, awaiting review or approval from others.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">Completed:</span>
                                <span className="text-muted-foreground">Fully done and approved. The final state of finished work.</span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => handleFieldChange('status', value)}
                    >
                      <SelectTrigger className="w-full h-9 lg:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                        <Flag className="h-3 w-3 lg:h-4 lg:w-4" />
                        Priority
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72" align="start">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Understanding Priority Levels</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-red-600 shrink-0">Urgent:</span>
                                <span className="text-muted-foreground">Critical issues blocking work. Drop everything and handle immediately.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-orange-600 shrink-0">High:</span>
                                <span className="text-muted-foreground">Important tasks with near-term deadlines. Prioritize these.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-yellow-600 shrink-0">Medium:</span>
                                <span className="text-muted-foreground">Standard work items. Complete after urgent/high priority.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-blue-600 shrink-0">Low:</span>
                                <span className="text-muted-foreground">Nice-to-have improvements. Tackle when time permits.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-gray-600 shrink-0">Backlog:</span>
                                <span className="text-muted-foreground">Ideas for the future. Not scheduled yet.</span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Select
                      value={editForm.priority}
                      onValueChange={(value) => handleFieldChange('priority', value as Priority)}
                    >
                      <SelectTrigger className="w-full h-9 lg:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                        <Tag className="h-3 w-3 lg:h-4 lg:w-4" />
                        Type
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72" align="start">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Task Types</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">Feature:</span>
                                <span className="text-muted-foreground">New functionality or enhancement to the product.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">Bug:</span>
                                <span className="text-muted-foreground">Something that is broken and needs fixing.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">Improvement:</span>
                                <span className="text-muted-foreground">Optimization or enhancement to existing functionality.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">Documentation:</span>
                                <span className="text-muted-foreground">User guides, API docs, or internal documentation.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-semibold shrink-0">Testing:</span>
                                <span className="text-muted-foreground">QA, automated tests, or manual testing tasks.</span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Select
                      value={editForm.taskType || "none"}
                      onValueChange={(value) => handleFieldChange('taskType', value === "none" ? undefined : value as TaskType)}
                    >
                      <SelectTrigger className="w-full h-9 lg:h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not set</SelectItem>
                        {Object.values(TaskType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1 lg:space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                      <User className="h-3 w-3 lg:h-4 lg:w-4" />
                      Assignee
                    </Label>
                    <Select
                      value={editForm.assignedUserId?.toString() || "unassigned"}
                      onValueChange={(value) => handleFieldChange('assignedUserId', value === "unassigned" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger className="w-full h-9 lg:h-10">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users?.map((user) => (
                          <SelectItem key={user.userId} value={user.userId.toString()}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI Agent Assignee */}
                  <div className="space-y-1 lg:space-y-2 col-span-2 lg:col-span-1">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                      <Bot className="h-3 w-3 lg:h-4 lg:w-4" />
                      AI Agent
                    </Label>
                    <Select
                      value={selectedAgentToAssign}
                      onValueChange={handleAssignAgent}
                      disabled={assignTaskToAgent.isPending || isAgentsLoading}
                    >
                      <SelectTrigger className="w-full h-9 lg:h-10">
                        <SelectValue placeholder="Assign AI agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select agent</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={String(agent.id)}>
                            {agent.displayName} ({agent.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-1">
                      {isTaskAgentAssignmentsLoading ? (
                        <div className="text-xs text-muted-foreground">Loading assigned agents…</div>
                      ) : taskAgentAssignments.length === 0 ? (
                        <div className="text-xs text-muted-foreground">No AI agent assigned</div>
                      ) : (
                        taskAgentAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between rounded border px-2 py-1 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-medium truncate">{assignment.agent.displayName}</div>
                              <div className="text-muted-foreground truncate">
                                {assignment.agent.role} • {assignment.status}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleUnassignAgent(assignment.agentId)}
                              disabled={unassignTaskFromAgent.isPending}
                              aria-label={`Unassign ${assignment.agent.displayName}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1 lg:space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                      <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className="w-full h-9 lg:h-10"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1 lg:space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                      <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                      Due Date
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                      className={`w-full h-9 lg:h-10 ${!editForm.dueDate ? 'border-destructive' : ''}`}
                      required
                    />
                    {!editForm.dueDate && (
                      <p className="text-xs text-destructive">Due date is required</p>
                    )}
                  </div>

                  {/* Tags - full width on mobile */}
                  <div className="space-y-1 lg:space-y-2 col-span-2 lg:col-span-1">
                    <Label className="text-foreground font-medium text-xs lg:text-sm">Tags</Label>
                    <Input
                      value={editForm.tags}
                      onChange={(e) => handleFieldChange('tags', e.target.value)}
                      placeholder="Comma separated…"
                      className="w-full h-9 lg:h-10"
                    />
                  </div>

                  {/* Author - full width on mobile */}
                  <div className="space-y-1 lg:space-y-2 col-span-2 lg:col-span-1">
                    <Label className="text-foreground font-medium text-xs lg:text-sm">Author</Label>
                    <div className="text-sm text-muted-foreground p-2 border rounded bg-muted/30">
                      {task.author?.username || "Unknown"}
                    </div>
                  </div>

                  {/* Git Activity - full width */}
                  <div className="space-y-2 col-span-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                      <svg className="h-3 w-3 lg:h-4 lg:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 2 0 20"/><path d="m2 12 20 0"/></svg>
                      Git Activity
                    </Label>
                    <div className="border rounded-md p-3">
                      <GitActivity taskId={taskId} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
