import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Lock, MessageSquare, ShieldCheck } from "lucide-react";
import { apiService, type PublicTaskShare } from "@/services/apiService";
import { sanitizeHtmlContent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const TaskSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicTaskShare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);

  const fetchShare = async (sharePassword?: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getPublicTaskShare(token, sharePassword);
      setData(response);
      setNeedsPassword(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load shared issue";
      if (message.toLowerCase().includes("password")) {
        setNeedsPassword(true);
        setError("This shared issue is password protected.");
      } else if (message.toLowerCase().includes("expired")) {
        setError("This shared issue link has expired.");
      } else if (message.toLowerCase().includes("not found")) {
        setError("This shared issue link is invalid or has been revoked.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchShare(password);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Unable to load shared issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error || "This link may be invalid."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { task, allowComments, externalComments } = data;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 mt-0.5" />
          <div>
            <p className="font-medium">Private team issue shared externally</p>
            <p className="text-xs">This issue is shared from a private team. Access is limited to invited guests.</p>
          </div>
        </div>

        {needsPassword && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5" />
                Password required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <Input
                  type="password"
                  placeholder="Enter share password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Button type="submit">Unlock Issue</Button>
              </form>
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {task.status && <Badge variant="secondary">{task.status}</Badge>}
              {task.priority && <Badge variant="outline">{task.priority}</Badge>}
              {task.project?.name && <Badge variant="outline">{task.project.name}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description ? (
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Description</Label>
                <div
                  className="mt-2 text-sm prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(task.description) }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No description provided.</p>
            )}
            <div className="text-xs text-muted-foreground space-y-1">
              {task.assignedTo && <p>Assigned to: {task.assignedTo}</p>}
              {task.updatedAt && (
                <p>Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {allowComments && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {externalComments && externalComments.length > 0 ? (
                externalComments.map((comment) => (
                  <div key={comment.id} className="rounded-md border px-3 py-2 text-sm">
                    <p className="font-medium">{comment.authorName}</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskSharePage;
