
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGetTaskQuery, useUpdateTaskMutation, useGetUsersQuery, useUploadTaskDescriptionImageMutation, useGetProjectStatusesQuery } from "@/hooks/useApi";
import { toast } from "sonner";
import { Calendar, User, Flag, Clock, Paperclip, Tag, CircleDot, Loader2, Image, Share2 } from "lucide-react";
import CommentsSection from "@/components/CommentsSection";
import AttachmentsSection from "@/components/AttachmentsSection";
import RichTextEditor from "@/components/RichTextEditor";
import { Status, Priority, TaskType } from "@/hooks/useApi";
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
        assignedUserId: task.assignedUserId || undefined,
      });
      isInitializedRef.current = true;
    }
  }, [task]);

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
                Task #{taskId}
              </span>
              {(isSaving || isUploadingImage) && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {isUploadingImage ? "Uploading..." : "Saving..."}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div
          ref={scrollContainerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="overflow-y-scroll max-h-[calc(90vh-120px)] pr-2 focus:outline-none"
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-muted rounded animate-pulse" />
                <div className="h-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : error || !task ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Task Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The task you're looking for doesn't exist or has been deleted.
              </p>
            </div>
          ) : (
            <div className="flex gap-6">
              {/* Left Column - Main Content */}
              <div className="flex-1 space-y-5 min-w-0">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground font-medium">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Enter task title..."
                    className="text-lg"
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

              {/* Right Column - Sidebar Metadata */}
              <div className="w-64 flex-shrink-0 space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium text-sm">
                    <CircleDot className="h-4 w-4" />
                    Status
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => handleFieldChange('status', value)}
                  >
                    <SelectTrigger className="w-full">
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium text-sm">
                    <Flag className="h-4 w-4" />
                    Priority
                  </Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(value) => handleFieldChange('priority', value as Priority)}
                  >
                    <SelectTrigger className="w-full">
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium text-sm">
                    <Tag className="h-4 w-4" />
                    Type
                  </Label>
                  <Select
                    value={editForm.taskType || "none"}
                    onValueChange={(value) => handleFieldChange('taskType', value === "none" ? undefined : value as TaskType)}
                  >
                    <SelectTrigger className="w-full">
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium text-sm">
                    <User className="h-4 w-4" />
                    Assignee
                  </Label>
                  <Select
                    value={editForm.assignedUserId?.toString() || "unassigned"}
                    onValueChange={(value) => handleFieldChange('assignedUserId', value === "unassigned" ? undefined : parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
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

                <div className="border-t pt-4 space-y-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-sm">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium text-sm">
                      <Clock className="h-4 w-4" />
                      Due Date
                    </Label>
                    <Input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium text-sm">Tags</Label>
                    <Input
                      value={editForm.tags}
                      onChange={(e) => handleFieldChange('tags', e.target.value)}
                      placeholder="Comma separated"
                      className="w-full"
                    />
                  </div>

                  {/* Author */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium text-sm">Author</Label>
                    <div className="text-sm text-muted-foreground p-2 border rounded bg-muted/30">
                      {task.author?.username || "Unknown"}
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
