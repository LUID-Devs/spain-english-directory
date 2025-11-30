
import React, { useState, useEffect } from "react";
import { useGetTaskQuery, useUpdateTaskMutation, useGetUsersQuery } from "@/hooks/useApi";
import { format } from "date-fns";
import { toast } from "sonner";
import { Edit, Save, Calendar, User, Flag, Clock, Paperclip, Tag, CircleDot } from "lucide-react";
import CommentsSection from "@/components/CommentsSection";
import AttachmentsSection from "@/components/AttachmentsSection";
import { Status, Priority, TaskType } from "@/hooks/useApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  editMode?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, taskId, editMode = false }) => {
  const { data: task, isLoading, error, refetch } = useGetTaskQuery(taskId, { skip: !isOpen });
  const { data: users = [] } = useGetUsersQuery(undefined, {
    skip: !isOpen, // Only load users when modal is open
  });
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation() as any;
  
  const [isEditing, setIsEditing] = useState(editMode);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: Status.ToDo,
    priority: Priority.Medium,
    taskType: undefined as TaskType | undefined,
    tags: "",
    startDate: "",
    dueDate: "",
    points: 0,
    assignedUserId: undefined as number | undefined,
  });

  useEffect(() => {
    if (task) {
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
    }
  }, [task]);

  const handleSave = async () => {
    try {
      const updatedTask = await updateTask({
        taskId,
        task: {
          ...editForm,
          startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined,
          dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
        },
      }).unwrap();
      
      // Exit edit mode first for smoother transition
      setIsEditing(false);
      
      // Silently refetch to update modal data without loading state
      refetch();
      
      // Dispatch custom event to refresh other task-related views
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: { taskId } }));
      
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleClose = () => {
    setIsEditing(editMode);
    onClose();
  };

  // Update editing state when editMode or modal open state changes
  useEffect(() => {
    if (isOpen) {
      setIsEditing(editMode);
    }
  }, [isOpen, editMode]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Urgent:
        return "bg-red-100 text-red-800 border-red-200";
      case Priority.High:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case Priority.Medium:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case Priority.Low:
        return "bg-green-100 text-green-800 border-green-200";
      case Priority.Backlog:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskTypeColor = (taskType: TaskType | undefined) => {
    switch (taskType) {
      case TaskType.Feature:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case TaskType.Bug:
        return "bg-red-100 text-red-800 border-red-200";
      case TaskType.Chore:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.ToDo:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case Status.WorkInProgress:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case Status.UnderReview:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case Status.Completed:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
                Task #{taskId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} disabled={isUpdating} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
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
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                {!isEditing ? (
                  <h1 className="text-2xl font-bold">{task.title}</h1>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground font-medium">Title</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Enter task title..."
                    />
                  </div>
                )}
              </div>

              {/* Status, Priority, and Task Type */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <CircleDot className="h-4 w-4" />
                    Status
                  </Label>
                  {!isEditing ? (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status!)}`}>
                      {task.status}
                    </div>
                  ) : (
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm({ ...editForm, status: value as Status })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <Flag className="h-4 w-4" />
                    Priority
                  </Label>
                  {!isEditing ? (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority!)}`}>
                      {task.priority}
                    </div>
                  ) : (
                    <Select
                      value={editForm.priority}
                      onValueChange={(value) => setEditForm({ ...editForm, priority: value as Priority })}
                    >
                      <SelectTrigger>
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
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <Tag className="h-4 w-4" />
                    Type
                  </Label>
                  {!isEditing ? (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTaskTypeColor(task.taskType)}`}>
                      {task.taskType || "Not set"}
                    </div>
                  ) : (
                    <Select
                      value={editForm.taskType || "none"}
                      onValueChange={(value) => setEditForm({ ...editForm, taskType: value === "none" ? undefined : value as TaskType })}
                    >
                      <SelectTrigger>
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
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Description</Label>
                {!isEditing ? (
                  <div className="text-sm text-foreground whitespace-pre-wrap min-h-[60px] p-3 border rounded-md bg-muted/30">
                    {task.description || "No description provided."}
                  </div>
                ) : (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Enter task description..."
                    rows={4}
                  />
                )}
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Assignee */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <User className="h-4 w-4" />
                    Assignee
                  </Label>
                  {!isEditing ? (
                    <div className="text-sm text-foreground p-2 border rounded bg-muted/30">
                      {task.assignee?.username || "Unassigned"}
                    </div>
                  ) : (
                    <Select
                      value={editForm.assignedUserId?.toString() || "unassigned"}
                      onValueChange={(value) => setEditForm({ ...editForm, assignedUserId: value === "unassigned" ? undefined : parseInt(value) })}
                    >
                      <SelectTrigger>
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
                  )}
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  {!isEditing ? (
                    <div className="text-sm text-foreground p-2 border rounded bg-muted/30">
                      {task.startDate ? format(new Date(task.startDate), "PPP") : "Not set"}
                    </div>
                  ) : (
                    <Input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    />
                  )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <Clock className="h-4 w-4" />
                    Due Date
                  </Label>
                  {!isEditing ? (
                    <div className="text-sm text-foreground p-2 border rounded bg-muted/30">
                      {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Not set"}
                    </div>
                  ) : (
                    <Input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    />
                  )}
                </div>
              </div>

              {/* Author and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Author</Label>
                  <div className="text-sm text-foreground p-2 border rounded bg-muted/30">
                    {task.author?.username || "Unknown"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Tags</Label>
                  {!isEditing ? (
                    <div className="min-h-[40px] p-2 border rounded bg-muted/30">
                      {task.tags ? (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.split(',').map((tag: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No tags</span>
                      )}
                    </div>
                  ) : (
                    <Input
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="Enter tags separated by commas"
                    />
                  )}
                </div>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;