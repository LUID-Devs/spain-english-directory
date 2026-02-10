import { Priority, Status, useCreateTaskMutation, useGetUsersQuery, useGetProjectsQuery, useGetProjectStatusesQuery, useUploadTaskDescriptionImageMutation } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useSubscription } from "@/stores/subscriptionStore";
import { apiService, ParsedTaskData } from "@/services/apiService";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { formatISO } from "date-fns";
import { toast } from "sonner";
import { marked } from "marked";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import { Image, Sparkles, Loader2, ChevronDown, ChevronUp, Coins } from "lucide-react";

// Configure marked for safe HTML output
marked.setOptions({
  gfm: true, // GitHub flavored markdown
  breaks: true, // Convert line breaks to <br>
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
  defaultPriority?: Priority;
};

const ModalNewTask = ({ isOpen, onClose, id = null, defaultPriority }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation() as any;
  const [uploadDescriptionImage] = useUploadTaskDescriptionImageMutation();
  const { currentUser } = useCurrentUser();
  const { totalCredits, fetchCredits } = useSubscription();
  const {data: users} = useGetUsersQuery(undefined, {
    skip: !isOpen, // Only load when modal is open
  });
  const {data: projects} = useGetProjectsQuery({}, {
    skip: !isOpen, // Only load when modal is open
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(defaultPriority || Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  // AI Quick Input state
  const [aiInput, setAiInput] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [showAiInput, setShowAiInput] = useState(true);
  const AI_CREDIT_COST = 1;

  // AI Due Date Suggestion state
  const [dueDateSuggestion, setDueDateSuggestion] = useState<{
    date: string;
    reasoning: string;
    confidence: number;
  } | null>(null);
  const [isSuggestingDueDate, setIsSuggestingDueDate] = useState(false);

  // Reset form to initial state
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(Status.ToDo);
    setPriority(defaultPriority || Priority.Backlog);
    setTags("");
    setStartDate("");
    setDueDate("");
    setAssignedUserId("");
    setAiInput("");
    setShowAiInput(true);
    setDueDateSuggestion(null);
    // Keep authorUserId as the current user
    if (currentUser?.userId) {
      setAuthorUserId(currentUser.userId.toString());
    }
    // Keep projectId if we're in a specific project context
    if (id === null) {
      setProjectId("");
    }
  };

  // AI Parse Task function
  const handleAiParse = async () => {
    if (!aiInput.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    if (totalCredits < AI_CREDIT_COST) {
      toast.error("Insufficient credits. Please purchase more credits to use AI features.");
      return;
    }

    setIsAiParsing(true);

    try {
      // Get team member names for assignee matching
      const teamMemberNames = users?.map(u => u.username) || [];

      const response = await apiService.parseTaskWithAI(aiInput.trim(), teamMemberNames);

      if (response.success && response.data) {
        const parsed = response.data;

        // Apply parsed data to form fields
        if (parsed.title) {
          setTitle(parsed.title);
        }
        if (parsed.description) {
          // Convert Markdown to HTML for the rich text editor
          const htmlContent = marked.parse(parsed.description) as string;
          setDescription(htmlContent);
        }
        if (parsed.priority) {
          setPriority(Priority[parsed.priority as keyof typeof Priority]);
        }
        if (parsed.dueDate) {
          setDueDate(parsed.dueDate);
        }
        if (parsed.tags) {
          setTags(parsed.tags);
        }

        // Handle assignee - if AI found a match, use it; otherwise assign to creator
        if (parsed.assignee && users) {
          const matchedUser = users.find(
            u => u.username.toLowerCase() === parsed.assignee?.toLowerCase()
          );
          if (matchedUser) {
            setAssignedUserId(matchedUser.userId.toString());
          } else if (currentUser?.userId) {
            // No match found, assign to creator
            setAssignedUserId(currentUser.userId.toString());
          }
        } else if (currentUser?.userId) {
          // No assignee specified by AI, assign to creator
          setAssignedUserId(currentUser.userId.toString());
        }

        // Collapse AI input and show success
        setShowAiInput(false);
        toast.success(`Task parsed! Used ${response.creditsUsed || AI_CREDIT_COST} credit.`);

        // Refresh credits to show updated balance
        fetchCredits();
      } else {
        const errorMsg = response.error?.message || "Failed to parse task";
        if (response.error?.code === 'INSUFFICIENT_CREDITS') {
          toast.error(`Insufficient credits. You need ${response.error.required} credits but have ${response.error.available}.`);
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to parse task with AI");
    } finally {
      setIsAiParsing(false);
    }
  };

  // AI Due Date Suggestion function
  const handleSuggestDueDate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title first");
      return;
    }

    if (totalCredits < AI_CREDIT_COST) {
      toast.error("Insufficient credits. Please purchase more credits to use AI features.");
      return;
    }

    setIsSuggestingDueDate(true);

    try {
      // Strip HTML tags from description for AI processing
      const plainDescription = description.replace(/<[^>]*>/g, '');
      
      const response = await apiService.suggestDueDateWithAI({
        title: title.trim(),
        description: plainDescription || undefined,
        priority,
        tags: tags || undefined,
      });

      if (response.success && response.suggestedDueDate) {
        setDueDateSuggestion({
          date: response.suggestedDueDate,
          reasoning: response.reasoning || 'Based on task priority and complexity',
          confidence: response.confidence || 0.8,
        });
        toast.success(`Due date suggested! Used ${response.creditsUsed || AI_CREDIT_COST} credit.`);
        fetchCredits();
      } else {
        const errorMsg = response.error?.message || "Failed to suggest due date";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to get AI due date suggestion");
    } finally {
      setIsSuggestingDueDate(false);
    }
  };

  // Apply suggested due date
  const applySuggestedDueDate = () => {
    if (dueDateSuggestion) {
      setDueDate(dueDateSuggestion.date);
      setDueDateSuggestion(null);
      toast.success("Due date applied!");
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Determine the effective project ID for fetching statuses
  const effectiveProjectId = id !== null ? Number(id) : (projectId ? Number(projectId) : null);

  // Fetch dynamic statuses for the selected project
  const { data: statusesData } = useGetProjectStatusesQuery(
    effectiveProjectId!,
    { skip: !isOpen || !effectiveProjectId }
  );

  // Get available statuses from API or fall back to defaults
  const availableStatuses = useMemo(() => {
    if (statusesData && statusesData.length > 0) {
      return statusesData.map((s) => s.name);
    }
    return Object.values(Status);
  }, [statusesData]);

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

  // Handle image upload for rich text editor
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
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
    }
  }, [uploadDescriptionImage]);

  const handleSubmit = async () => {
    if (!title || !authorUserId || !((id !== null) || projectId) || !dueDate) {
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

      await createTask(taskData).unwrap();
      onClose();
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const isFormValid = () => {
    return title && authorUserId && (id !== null || projectId) && dueDate;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            Create New Task
            {defaultPriority && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
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
          {/* AI Quick Input Section */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <button
              type="button"
              onClick={() => setShowAiInput(!showAiInput)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-medium text-sm">Quick Create with AI</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Coins className="h-3 w-3" aria-hidden="true" />
                  {AI_CREDIT_COST} credit
                </span>
              </div>
              {showAiInput ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
            </button>

            {showAiInput && (
              <div className="mt-3 space-y-3">
                <Textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder='Type naturally: "Fix login bug by Friday, assign to John, high priority"'
                  className="min-h-[80px] text-sm resize-none"
                  disabled={isAiParsing}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Credits: {totalCredits}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAiParse}
                    disabled={isAiParsing || !aiInput.trim() || totalCredits < AI_CREDIT_COST}
                    className="gap-2"
                  >
                    {isAiParsing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Parsing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Parse with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or fill manually
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">
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
            <Label className="flex items-center gap-2 text-foreground font-medium">
              Description
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                <Image className="h-3 w-3" aria-hidden="true" />
                Paste image with Ctrl+V
              </span>
            </Label>
            <RichTextEditor
              content={description}
              onChange={(content) => setDescription(content)}
              onImageUpload={handleImageUpload}
              placeholder="Provide additional context and requirements..."
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
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
            <Label htmlFor="tags" className="text-foreground font-medium">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
            {tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-foreground font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-foreground font-medium">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setDueDateSuggestion(null);
                }}
                required
              />
              
              {/* AI Due Date Suggestion */}
              {!dueDate && title && !dueDateSuggestion && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestDueDate}
                  disabled={isSuggestingDueDate || totalCredits < AI_CREDIT_COST}
                  className="text-xs gap-1 h-7 px-2 text-primary hover:text-primary"
                >
                  {isSuggestingDueDate ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Suggest with AI
                  <span className="text-muted-foreground">({AI_CREDIT_COST} credit)</span>
                </Button>
              )}
              
              {/* Show Suggestion */}
              {dueDateSuggestion && !dueDate && (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-2 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        Suggested: {new Date(dueDateSuggestion.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {dueDateSuggestion.reasoning}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDueDateSuggestion(null)}
                        className="h-6 px-2 text-xs"
                      >
                        Ignore
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={applySuggestedDueDate}
                        className="h-6 px-2 text-xs gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
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
              <Label className="text-foreground font-medium">Assignee</Label>
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
              <Label className="text-foreground font-medium">
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
                  Creating Task…
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
