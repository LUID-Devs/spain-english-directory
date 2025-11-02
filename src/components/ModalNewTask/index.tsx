import { Priority, Status, useCreateTaskMutation, useGetUsersQuery, useGetProjectsQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
  defaultPriority?: Priority;
};

const ModalNewTask = ({ isOpen, onClose, id = null, defaultPriority }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation() as any;
  const { currentUser } = useCurrentUser();
  const {data: users} = useGetUsersQuery(undefined, {
    skip: !isOpen, // Only load when modal is open
  });
  const {data: projects} = useGetProjectsQuery({}, {
    skip: !isOpen, // Only load when modal is open
  });
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(defaultPriority || Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  // Set current user as default author when user data loads
  useEffect(() => {
    if (currentUser?.userId && !authorUserId) {
      setAuthorUserId(currentUser.userId.toString());
    }
  }, [currentUser, authorUserId]);

  // Update priority when defaultPriority changes
  useEffect(() => {
    if (defaultPriority) {
      setPriority(defaultPriority);
    }
  }, [defaultPriority]);

  const handleSubmit = async () => {
    console.log('handleSubmit called', { title, authorUserId, id, projectId });
    if (!title || !authorUserId || !((id !== null) || projectId)) {
      console.log('Validation failed', { title, authorUserId, id, projectId });
      return;
    }

    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        tags,
        startDate: startDate ? formatISO(new Date(startDate)) : undefined,
        dueDate: dueDate ? formatISO(new Date(dueDate)) : undefined,
        authorUserId: parseInt(authorUserId),
        assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
        projectId: id !== null ? Number(id) : Number(projectId),
      };

      console.log('Creating task with data:', taskData);
      await createTask(taskData).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const isFormValid = () => {
    return title && authorUserId && (id !== null || projectId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>
            Create New Task
            {defaultPriority && (
              <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                ({priority} Priority)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form
          className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900 dark:text-gray-100 font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 dark:text-gray-100 font-medium">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context and requirements..."
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100 font-medium">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(Status[value as keyof typeof Status])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Status.ToDo}>To Do</SelectItem>
                  <SelectItem value={Status.WorkInProgress}>Work In Progress</SelectItem>
                  <SelectItem value={Status.UnderReview}>Under Review</SelectItem>
                  <SelectItem value={Status.Completed}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100 font-medium">
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(Priority[value as keyof typeof Priority])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.Urgent}>Urgent</SelectItem>
                  <SelectItem value={Priority.High}>High</SelectItem>
                  <SelectItem value={Priority.Medium}>Medium</SelectItem>
                  <SelectItem value={Priority.Low}>Low</SelectItem>
                  <SelectItem value={Priority.Backlog}>Backlog</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-gray-900 dark:text-gray-100 font-medium">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
            {tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-gray-900 dark:text-gray-100 font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-gray-900 dark:text-gray-100 font-medium">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Team Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100 font-medium">
                Author <span className="text-destructive">*</span>
              </Label>
              <Select
                value={authorUserId}
                onValueChange={setAuthorUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.userId} value={user.userId.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100 font-medium">Assignee</Label>
              <Select
                value={assignedUserId || "unassigned"}
                onValueChange={(value) => setAssignedUserId(value === "unassigned" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee (optional)" />
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
          </div>

          {/* Project Selection (only if not in a specific project) */}
          {id === null && (
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100 font-medium">
                Project <span className="text-destructive">*</span>
              </Label>
              <Select
                value={projectId}
                onValueChange={setProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating Task...
                </>
              ) : (
                `Create ${priority} Priority Task`
              )}
            </Button>
            
            {!isFormValid() && (
              <p className="text-xs text-destructive text-center">
                Please fill in all required fields marked with *
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalNewTask;
