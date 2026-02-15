import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/stores/userStore";
import { apiService } from "@/services/apiService";
import { Task, Status } from "@/hooks/useApi";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Check,
  UserCheck,
  XCircle,
  RefreshCcw,
  Keyboard,
  Tag,
  Inbox,
} from "lucide-react";

const shortcutPills = [
  { key: "J / K", label: "Navigate" },
  { key: "A", label: "Accept" },
  { key: "M", label: "Assign to me" },
  { key: "I", label: "Ignore" },
];

const normalizeTags = (tags?: string) =>
  tags
    ? tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

const buildTags = (existing: string | undefined, input: string) => {
  const baseTags = normalizeTags(existing);
  const incoming = normalizeTags(input);
  const merged = Array.from(new Set([...baseTags, ...incoming]));
  return merged.join(", ");
};

const getPriorityVariant = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "destructive" as const;
    case "high":
      return "secondary" as const;
    case "medium":
      return "outline" as const;
    case "low":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const TriagePage = () => {
  const { currentUser } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null);
  const [tagDrafts, setTagDrafts] = useState<Record<number, string>>({});

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getTasks(undefined, {
        triageStatus: "untriaged",
        archived: false,
      });
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load triage tasks";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const { selectedIndex } = useKeyboardNavigation({
    itemSelector: "[data-triage-item]",
    enabled: true,
  });

  const selectedTask = useMemo(() => {
    if (selectedIndex < 0 || selectedIndex >= tasks.length) return null;
    return tasks[selectedIndex];
  }, [selectedIndex, tasks]);

  const updateTask = useCallback(
    async (task: Task, updates: Partial<Task>, successMessage: string) => {
      setIsUpdatingId(task.id);
      try {
        await apiService.updateTask(task.id, updates);
        setTasks((prev) => prev.filter((item) => item.id !== task.id));
        toast.success(successMessage);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Update failed";
        toast.error(message);
      } finally {
        setIsUpdatingId(null);
      }
    },
    []
  );

  const handleAccept = useCallback(
    async (task: Task) => {
      const status = task.status ?? Status.ToDo;
      await updateTask(task, { triaged: true, status }, "Task accepted into backlog");
    },
    [updateTask]
  );

  const handleAssignToMe = useCallback(
    async (task: Task) => {
      if (!currentUser?.userId) {
        toast.error("You must be logged in to assign tasks.");
        return;
      }
      const status = task.status ?? Status.ToDo;
      await updateTask(
        task,
        { triaged: true, status, assignedUserId: currentUser.userId },
        "Task assigned to you"
      );
    },
    [currentUser?.userId, updateTask]
  );

  const handleIgnore = useCallback(
    async (task: Task) => {
      await updateTask(task, { triaged: true }, "Task marked as triaged");
    },
    [updateTask]
  );

  const handleAddTag = useCallback(
    async (task: Task) => {
      const draft = tagDrafts[task.id]?.trim();
      if (!draft) return;
      const mergedTags = buildTags(task.tags, draft);
      setIsUpdatingId(task.id);
      try {
        await apiService.updateTask(task.id, { tags: mergedTags });
        setTasks((prev) =>
          prev.map((item) => (item.id === task.id ? { ...item, tags: mergedTags } : item))
        );
        setTagDrafts((prev) => ({ ...prev, [task.id]: "" }));
        toast.success("Label added");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update labels";
        toast.error(message);
      } finally {
        setIsUpdatingId(null);
      }
    },
    [tagDrafts]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.getAttribute("contenteditable") === "true" ||
        activeElement?.closest("[role='dialog']") !== null;
      if (isTyping) return;
      if (!selectedTask) return;

      switch (event.key.toLowerCase()) {
        case "a":
          event.preventDefault();
          handleAccept(selectedTask);
          break;
        case "m":
          event.preventDefault();
          handleAssignToMe(selectedTask);
          break;
        case "i":
          event.preventDefault();
          handleIgnore(selectedTask);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAccept, handleAssignToMe, handleIgnore, selectedTask]);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Inbox className="h-5 w-5 text-primary" />
              Triage Inbox
            </CardTitle>
            <CardDescription>
              Review new tasks before they hit the backlog. {tasks.length} waiting.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {shortcutPills.map((pill) => (
              <Badge key={pill.key} variant="outline" className="gap-1">
                <Keyboard className="h-3 w-3" />
                <span className="font-semibold">{pill.key}</span>
                <span className="text-muted-foreground">{pill.label}</span>
              </Badge>
            ))}
            <Button variant="outline" size="sm" onClick={fetchTasks}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/60">
        <CardContent className="pt-6">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!isLoading && !error && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Nothing to triage</h3>
                <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
              </div>
            </div>
          )}

          {!isLoading && !error && tasks.length > 0 && (
            <div className="space-y-4">
              {tasks.map((task, index) => {
                const isSelected = index === selectedIndex;
                const tagList = normalizeTags(task.tags);
                return (
                  <div
                    key={task.id}
                    data-triage-item
                    className={cn(
                      "rounded-xl border p-4 transition",
                      isSelected
                        ? "border-primary/60 bg-primary/5 shadow-sm"
                        : "border-border/60 bg-card"
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{task.title}</h3>
                          {task.project?.name && (
                            <Badge variant="outline">{task.project.name}</Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {task.priority && (
                            <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                          )}
                          {task.status && (
                            <Badge variant="outline">{task.status}</Badge>
                          )}
                          {task.assignedUserId ? (
                            <Badge variant="secondary">Assigned</Badge>
                          ) : (
                            <Badge variant="outline">Unassigned</Badge>
                          )}
                        </div>
                        {tagList.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {tagList.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(task)}
                          disabled={isUpdatingId === task.id}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAssignToMe(task)}
                          disabled={isUpdatingId === task.id}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assign to me
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleIgnore(task)}
                          disabled={isUpdatingId === task.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Ignore
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        Add label
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={tagDrafts[task.id] ?? ""}
                          onChange={(event) =>
                            setTagDrafts((prev) => ({ ...prev, [task.id]: event.target.value }))
                          }
                          placeholder="ex: onboarding, bug"
                          className="h-9"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddTag(task)}
                          disabled={isUpdatingId === task.id}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TriagePage;
