
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useGetTaskQuery,
  useUpdateTaskMutation,
  useGetUsersQuery,
  useUploadTaskDescriptionImageMutation,
  useGetProjectStatusesQuery,
  useGetTaskGitLinksQuery,
  useGetTimeLogsQuery,
  useGetTimeEstimateQuery,
  useGetActiveTimerQuery,
  useStartTimerMutation,
  useStopTimerMutation,
  useSetTimeEstimateMutation,
  useUpdateTimeLogMutation,
  useCreateTaskShareMutation,
  Status,
  Priority,
  TaskType,
  TimeLog,
} from "@/hooks/useApi";
import { TimeTrackingSection } from "@/components/TimeTracking";
import { toast } from "sonner";
import { Calendar, User, Flag, Clock, Paperclip, Tag, CircleDot, Loader2, Image, Share2, Bot, X, HelpCircle, Copy } from "lucide-react";
import CommentsSection from "@/components/CommentsSection";
import AttachmentsSection from "@/components/AttachmentsSection";
import RichTextEditor from "@/components/RichTextEditor";
import GitActivity from "@/components/GitActivity";
import GitReviewPanel from "@/components/gitReview/GitReviewPanel";
import apiService, { type TaskShareInfo } from "@/services/apiService";
import { useAgents, useAssignTaskToAgent, useTaskAgentAssignments, useUnassignTaskFromAgent } from "@/hooks/useMissionControl";
import { UsageGate } from "@/components/subscription/UsageGate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

// Wrapper component for review panel - receives gitLinks to avoid duplicate fetch
const GitReviewPanelWrapper: React.FC<{ taskId: number; gitLinks?: { id: number; type: string }[] }> = ({ taskId, gitLinks }) => {
  const pullRequests = gitLinks?.filter((link) => link.type === "pull_request") || [];

  if (pullRequests.length === 0) return null;

  return <GitReviewPanel taskId={taskId} pullRequests={pullRequests as any} />;
};

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
  // Fetch git links once for both GitActivity and GitReviewPanel
  const { data: gitLinks } = useGetTaskGitLinksQuery(taskId, { skip: !isOpen || !taskId });
  const { data: agents = [], isLoading: isAgentsLoading } = useAgents();
  const {
    data: taskAgentAssignments = [],
    isLoading: isTaskAgentAssignmentsLoading,
    refetch: refetchTaskAgentAssignments,
  } = useTaskAgentAssignments(isOpen ? taskId : undefined);
  const assignTaskToAgent = useAssignTaskToAgent();
  const unassignTaskFromAgent = useUnassignTaskFromAgent();

  // Time tracking hooks
  const { data: timeLogsData, refetch: refetchTimeLogs } = useGetTimeLogsQuery(isOpen ? taskId : undefined, { skip: !isOpen });
  const { data: timeEstimateData, refetch: refetchTimeEstimate } = useGetTimeEstimateQuery(isOpen ? taskId : undefined, { skip: !isOpen });
  const { data: activeTimerData, refetch: refetchActiveTimer } = useGetActiveTimerQuery({ skip: !isOpen });
  const [startTimer] = useStartTimerMutation();
  const [stopTimer] = useStopTimerMutation();
  const [setTimeEstimate] = useSetTimeEstimateMutation();
  const [updateTimeLog] = useUpdateTimeLogMutation();
  const [createTaskShare] = useCreateTaskShareMutation();

  // Check if timer is running for this task
  const isTimerRunningForThisTask = activeTimerData?.timer?.taskId === taskId;
  const activeTimeLogId = activeTimerData?.timer?.id;

  // Calculate elapsed time for running timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!isTimerRunningForThisTask || !activeTimerData?.timer?.startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = new Date(activeTimerData.timer.startedAt).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - startedAt) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunningForThisTask, activeTimerData?.timer?.startedAt]);

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

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<TaskShareInfo | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareAllowComments, setShareAllowComments] = useState(false);
  const [shareRequirePassword, setShareRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");

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

  const isPrivateTask = task?.project?.visibility
    ? task.project.visibility === "private"
    : true;

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

  // Auto-save function (defined BEFORE handleKeyDown to avoid TDZ)
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

  // Handle form field changes with auto-save (defined BEFORE handleKeyDown to avoid TDZ)
  const handleFieldChange = useCallback((field: keyof typeof editForm, value: any) => {
    setEditForm(prev => {
      const newForm = { ...prev, [field]: value };
      debouncedSave(newForm);
      return newForm;
    });
  }, [debouncedSave]);

  // Handle keyboard scrolling and shortcuts (moved AFTER autoSave and handleFieldChange)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Keyboard shortcut: 'C' to mark task as complete (when not typing in an input)
    if (e.key === 'c' || e.key === 'C') {
      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');
      
      if (!isTyping && editForm.status !== Status.Completed) {
        e.preventDefault();
        handleFieldChange('status', Status.Completed);
        toast.success("Task marked as complete!", { duration: 2000 });
        return;
      }
    }

    // Keyboard shortcut: Cmd/Ctrl + Enter to save and close
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      autoSave(editForm).then(() => {
        onClose();
      });
      return;
    }

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
  }, [editForm, handleFieldChange, autoSave, onClose]);

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

  const handleCreateOrUpdateShare = async () => {
    setShareLoading(true);
    setShareError(null);

    try {
      const payload: {
        allowComments?: boolean;
        requirePassword?: boolean;
        password?: string;
      } = {
        allowComments: shareAllowComments,
        requirePassword: shareRequirePassword,
      };

      if (shareRequirePassword) {
        const trimmed = sharePassword.trim();
        if (trimmed.length < 6) {
          setShareError("Password must be at least 6 characters");
          setShareLoading(false);
          return;
        }
        payload.password = trimmed;
      }

      const data = await apiService.createTaskShare(taskId, payload);
      setShareData(data);
      setSharePassword("");
      toast.success(shareData ? "Share link updated" : "Share link created");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create share link";
      setShareError(message);
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!shareData) return;
    setShareLoading(true);
    setShareError(null);

    try {
      await apiService.revokeTaskShare(taskId);
      setShareData(null);
      setShareAllowComments(false);
      setShareRequirePassword(false);
      setSharePassword("");
      toast.success("Share link revoked");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to revoke share link";
      setShareError(message);
    } finally {
      setShareLoading(false);
    }
  };

  useEffect(() => {
    if (isShareOpen) {
      loadShareInfo();
    }
  }, [isShareOpen, loadShareInfo]);

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

  // Helper to format minutes as "HH:MM" string for API
  const formatMinutesToEstimate = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getTimeLogDurationSeconds = (log: TimeLog): number => {
    const startMs = new Date(log.startedAt).getTime();
    const endMs = log.endedAt ? new Date(log.endedAt).getTime() : null;

    if (!Number.isNaN(startMs) && endMs && !Number.isNaN(endMs) && endMs >= startMs) {
      return Math.floor((endMs - startMs) / 1000);
    }

    if (typeof log.durationMinutes === "number") {
      return Math.round(log.durationMinutes * 60);
    }

    return 0;
  };

  const getTimeLogUserName = (log: TimeLog): string => {
    const username = log.user?.username?.trim() || "";
    const looksLikeToken = /^[0-9a-f-]{16,}$/i.test(username);
    if (username && !looksLikeToken) {
      return username;
    }

    const email = log.user?.email?.trim();
    if (email) {
      return email;
    }

    const fallbackId = log.user?.userId ?? log.userId;
    if (typeof fallbackId === "number") {
      return `User ${fallbackId}`;
    }

    return username || "Unknown";
  };

  // Time tracking handlers
  const handleStartTimer = useCallback(async () => {
    try {
      await startTimer({ taskId }).unwrap();
      await refetchTimeLogs();
      await refetchActiveTimer();
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  }, [startTimer, taskId, refetchTimeLogs, refetchActiveTimer]);

  const handleStopTimer = useCallback(async (description: string) => {
    if (!activeTimeLogId) return;
    try {
      await stopTimer(activeTimeLogId).unwrap();
      // Update the time log with the description if provided
      if (description.trim()) {
        try {
          await updateTimeLog({ logId: activeTimeLogId, description: description.trim() }).unwrap();
        } catch (updateError) {
          console.warn("Failed to update time log description:", updateError);
        }
      }
    } catch (error) {
      console.error("Failed to stop timer:", error);
    } finally {
      await Promise.allSettled([refetchTimeLogs(), refetchTimeEstimate(), refetchActiveTimer()]);
    }
  }, [stopTimer, activeTimeLogId, updateTimeLog, refetchTimeLogs, refetchTimeEstimate, refetchActiveTimer]);

  const handleUpdateEstimate = useCallback(async (minutes: number) => {
    try {
      await setTimeEstimate({ taskId, estimate: formatMinutesToEstimate(minutes) }).unwrap();
      await refetchTimeEstimate();
    } catch (error) {
      console.error("Failed to set time estimate:", error);
    }
  }, [setTimeEstimate, taskId, refetchTimeEstimate]);

  const handleDeleteTimeLog = useCallback(async (logId: number) => {
    // TODO: Implement delete time log mutation
    toast.info("Delete time log - not yet implemented");
  }, []);

  return (
    <React.Fragment>
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
              <div className="w-full lg:w-72 flex-shrink-0 order-1 lg:order-2 border-b lg:border-b-0 pb-4 lg:pb-0">
                <div className="flex flex-col gap-4">
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
                            <div className="pt-2 border-t border-border">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Tip:</span> Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">C</kbd> to quickly mark a task as complete.
                              </p>
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
                  <div className="space-y-1 lg:space-y-2">
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

                  {/* Time Tracking */}
                  <div className="space-y-1 lg:space-y-2">
                    <TimeTrackingSection
                      taskId={taskId}
                      timeEstimate={timeEstimateData?.estimatedMinutes}
                      timeLogs={timeLogsData?.logs.map(log => ({
                        id: log.id,
                        taskId: log.taskId,
                        userId: log.userId,
                        userName: getTimeLogUserName(log),
                        userAvatar: log.user?.profilePictureUrl,
                        duration: getTimeLogDurationSeconds(log),
                        description: log.description,
                        startedAt: log.startedAt,
                        endedAt: log.endedAt || log.startedAt,
                        createdAt: log.createdAt,
                      })) || []}
                      isTimerRunning={isTimerRunningForThisTask}
                      currentElapsedTime={elapsedSeconds}
                      onStartTimer={handleStartTimer}
                      onStopTimer={handleStopTimer}
                      onUpdateEstimate={handleUpdateEstimate}
                      onDeleteTimeLog={handleDeleteTimeLog}
                    />
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
                  <div className="space-y-1 lg:space-y-2">
                    <Label className="text-foreground font-medium text-xs lg:text-sm">Tags</Label>
                    <Input
                      value={editForm.tags}
                      onChange={(e) => handleFieldChange('tags', e.target.value)}
                      placeholder="Comma separated…"
                      className="w-full h-9 lg:h-10"
                    />
                  </div>

                  {/* Author - full width on mobile */}
                  <div className="space-y-1 lg:space-y-2">
                    <Label className="text-foreground font-medium text-xs lg:text-sm">Author</Label>
                    <div className="text-sm text-muted-foreground p-2 border rounded bg-muted/30">
                      {task.author?.username || "Unknown"}
                    </div>
                  </div>

                  {/* Git Activity - full width */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-xs lg:text-sm">
                      <svg className="h-3 w-3 lg:h-4 lg:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 2 0 20"/><path d="m2 12 20 0"/></svg>
                      Git Activity
                    </Label>
                    <div className="border rounded-md p-3">
                      <GitActivity taskId={taskId} gitLinks={gitLinks} />
                    </div>
                  </div>

                  {/* Git Review Panel */}
                  <div className="space-y-2">
                    <GitReviewPanelWrapper taskId={taskId} gitLinks={gitLinks} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </DialogContent>
      </Dialog>

    <Dialog
      open={isShareDialogOpen}
      onOpenChange={(open) => {
        setIsShareDialogOpen(open);
        if (open) {
          fetchShareInfo();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Invite external guests to view this private team issue.
          </p>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="space-y-0.5">
              <Label className="text-sm">Allow external comments</Label>
              <p className="text-xs text-muted-foreground">
                Guests can comment on the shared issue.
              </p>
            </div>
            <Switch
              checked={allowExternalComments}
              onCheckedChange={(checked) => setAllowExternalComments(Boolean(checked))}
            />
          </div>

          {shareError && <p className="text-xs text-destructive">{shareError}</p>}

          {shareInfo ? (
            <div className="space-y-2">
              <Label className="text-sm">Share link</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input value={shareInfo.shareUrl} readOnly />
                <Button type="button" variant="outline" onClick={handleCopyShareLink}>
                  Copy
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleCreateShare} disabled={shareLoading}>
                  Update link
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRevokeShare}
                  disabled={shareLoading}
                >
                  Revoke link
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" onClick={handleCreateShare} disabled={shareLoading}>
              Create share link
            </Button>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Invite by email</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="name@company.com, name2@company.com"
                value={inviteEmails}
                onChange={(event) => setInviteEmails(event.target.value)}
              />
              <Button type="button" onClick={handleInviteExternal} disabled={shareLoading}>
                Send invite
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We will open your email client with the share link.
            </p>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default TaskDetailModal;
