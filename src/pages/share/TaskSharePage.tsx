import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeHtmlContent } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

interface SharedTask {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  project?: {
    id: number;
    name: string;
  } | null;
  assignedTo?: string | null;
  updatedAt?: string | null;
}

interface ExternalComment {
  id: number;
  text: string;
  authorName: string;
  createdAt: string;
}

interface SharedTaskResponse {
  success: boolean;
  task: SharedTask;
  allowComments: boolean;
  externalComments: ExternalComment[];
  expiresAt?: string | null;
}

const TaskSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedTaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [activePassword, setActivePassword] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTaskShare = useCallback(async (sharePassword?: string) => {
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

      const response = await fetch(`${API_URL}/share/${token}`, { headers });

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
        setError("This task share link is not found or has been revoked.");
        setLoading(false);
        return;
      }

      if (response.status === 410) {
        setError("This task share link has expired.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load shared task");
      }

      const result = (await response.json()) as SharedTaskResponse;
      setData(result);
      setPasswordRequired(false);
      setActivePassword(sharePassword ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTaskShare();
  }, [fetchTaskShare]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTaskShare(password);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!commentText.trim() || !authorName.trim()) {
      setCommentError("Name and comment are required.");
      return;
    }

    if (!token) return;

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (activePassword) {
        headers["x-share-password"] = activePassword;
      }

      const response = await fetch(`${API_URL}/share/${token}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: commentText.trim(),
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
        }),
      });

      if (response.status === 401) {
        setCommentError("Password required.");
        setPasswordRequired(true);
        return;
      }

      if (response.status === 403) {
        const errorData = await response.json().catch(() => null);
        setCommentError(errorData?.message || "Unable to post comment.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const result = await response.json();
      const newComment = result.comment as ExternalComment;
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          externalComments: [...(prev.externalComments || []), newComment],
        };
      });
      setCommentText("");
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastUpdated = useMemo(() => {
    if (!data?.task?.updatedAt) return null;
    const date = new Date(data.task.updatedAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  }, [data?.task?.updatedAt]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-2">
          <h1 className="text-2xl font-semibold">Unable to load task</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-background border border-border rounded-lg p-6 space-y-4">
          <h1 className="text-xl font-semibold">Password Required</h1>
          <p className="text-muted-foreground">Enter the password to view this shared task.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-password">Password</Label>
              <Input
                id="share-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Unlock Task</Button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Shared Task</p>
          <h1 className="text-3xl font-semibold">{data.task.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {data.task.project?.name && (
              <span>Project: <span className="font-medium text-foreground">{data.task.project.name}</span></span>
            )}
            {data.task.status && (
              <span>Status: <span className="font-medium text-foreground">{data.task.status}</span></span>
            )}
            {data.task.priority && (
              <span>Priority: <span className="font-medium text-foreground">{data.task.priority}</span></span>
            )}
            {data.task.assignedTo && (
              <span>Assignee: <span className="font-medium text-foreground">{data.task.assignedTo}</span></span>
            )}
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          )}
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Description</h2>
          {data.task.description ? (
            <div
              className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(data.task.description) }}
            />
          ) : (
            <p className="text-muted-foreground">No description provided.</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Comments</h2>
          {data.externalComments?.length ? (
            <div className="space-y-4">
              {data.externalComments.map((comment) => (
                <div key={comment.id} className="border border-border rounded-lg p-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{comment.authorName}</span>
                    <span className="text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No external comments yet.</p>
          )}

          {data.allowComments && (
            <form onSubmit={handleCommentSubmit} className="space-y-4 border border-border rounded-lg p-4">
              <h3 className="text-md font-semibold">Add a comment</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="author-name">Your name</Label>
                  <Input
                    id="author-name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author-email">Email (optional)</Label>
                  <Input
                    id="author-email"
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment-text">Comment</Label>
                <textarea
                  id="comment-text"
                  className="w-full min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
              </div>
              {commentError && (
                <p className="text-sm text-destructive">{commentError}</p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post comment"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default TaskSharePage;
