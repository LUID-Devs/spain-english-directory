import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Lock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SharedTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  updatedAt: string;
  project?: {
    id: number;
    name: string;
  };
  assignedTo?: string | null;
}

interface ExternalComment {
  id: number;
  text: string;
  authorName: string;
  createdAt: string;
}

interface TaskShareResponse {
  success: boolean;
  task: SharedTask;
  allowComments: boolean;
  externalComments: ExternalComment[];
  expiresAt: string | null;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const TaskSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<TaskShareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShare = async (sharePassword?: string) => {
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

      const result = await response.json();
      setData(result);
      setPasswordRequired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShare();
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShare(password);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !data?.allowComments) return;

    if (!commentName.trim() || !commentText.trim()) {
      toast.error("Name and comment are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (password) {
        headers["x-share-password"] = password;
      }

      const response = await fetch(`${API_URL}/share/${token}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          authorName: commentName.trim(),
          authorEmail: commentEmail.trim() || undefined,
          text: commentText.trim(),
        }),
      });

      if (response.status === 401) {
        setPasswordRequired(true);
        toast.error("Password required to comment.");
        return;
      }

      if (response.status === 403) {
        toast.error("Invalid password. Please try again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const updated = await response.json();
      if (updated?.comment) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                externalComments: [...prev.externalComments, updated.comment],
              }
            : prev
        );
      } else {
        await fetchShare(password);
      }

      setCommentText("");
      toast.success("Comment added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <Card>
            <CardContent className="p-6">Loading task…</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : passwordRequired ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4" />
                Password required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <Label htmlFor="share-password">Share password</Label>
                <Input
                  id="share-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <Button type="submit">View task</Button>
              </form>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            <Card>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary">{data.task.status}</Badge>
                  <Badge variant="outline">{data.task.priority}</Badge>
                </div>
                <CardTitle className="text-2xl">{data.task.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {data.task.project?.name ? `${data.task.project.name} · ` : ""}
                  Last updated {new Date(data.task.updatedAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.task.description && (
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Description</Label>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{data.task.description}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {data.task.assignedTo && (
                    <div>
                      <span className="font-medium text-foreground">Assigned:</span> {data.task.assignedTo}
                    </div>
                  )}
                  {data.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Expires {new Date(data.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {data.allowComments && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leave a comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="comment-name">Name</Label>
                        <Input
                          id="comment-name"
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="comment-email">Email (optional)</Label>
                        <Input
                          id="comment-email"
                          type="email"
                          value={commentEmail}
                          onChange={(e) => setCommentEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="comment-text">Comment</Label>
                      <Textarea
                        id="comment-text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write your comment"
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting…" : "Submit comment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {data.externalComments?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.externalComments.map((comment) => (
                    <div key={comment.id} className="space-y-1">
                      <p className="text-sm font-medium">{comment.authorName}</p>
                      <p className="text-sm text-muted-foreground">{comment.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TaskSharePage;
