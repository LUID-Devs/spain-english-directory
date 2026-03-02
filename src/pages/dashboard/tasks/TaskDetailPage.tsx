import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Flag, Tag, User, Timer, Play, History, Share2, Copy, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import {
  useGetTaskQuery,
  useGetTimeLogsQuery,
  useGetTimeEstimateQuery,
  useGetActiveTimerQuery,
  useStartTimerMutation,
  useStopTimerMutation,
  useSetTimeEstimateMutation,
  useUpdateTimeLogMutation,
  TimeLog,
} from '@/hooks/useApi';
import { useTaskModal } from '@/contexts/TaskModalContext';
import { apiService, type TaskShareInfo } from '@/services/apiService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AttachmentsSection from '@/components/AttachmentsSection';
import CommentsSection from '@/components/CommentsSection';
import { TimeTrackingSection } from '@/components/TimeTracking';
import { ManualTimeEntryForm } from '@/components/TimeTracking';
import { TaskStatusHistoryPanel } from '@/components/TaskStatusHistoryPanel';
import { sanitizeHtmlContent } from '@/lib/utils';
import { toast } from 'sonner';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTaskModalOpen } = useTaskModal();
  const [showFallback, setShowFallback] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Share dialog state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<TaskShareInfo | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareAllowComments, setShareAllowComments] = useState(false);
  const [shareRequirePassword, setShareRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const taskId = Number(id);
  const isValidTaskId = Boolean(id) && !Number.isNaN(taskId);

  // Time tracking hooks
  const { data: timeLogsData, refetch: refetchTimeLogs } = useGetTimeLogsQuery(
    isValidTaskId ? taskId : undefined,
    { skip: !isValidTaskId }
  );
  const { data: timeEstimateData, refetch: refetchTimeEstimate } = useGetTimeEstimateQuery(
    isValidTaskId ? taskId : undefined,
    { skip: !isValidTaskId }
  );
  const { data: activeTimerData, refetch: refetchActiveTimer } = useGetActiveTimerQuery({
    skip: !isValidTaskId,
  });
  const [startTimer] = useStartTimerMutation();
  const [stopTimer] = useStopTimerMutation();
  const [setTimeEstimate] = useSetTimeEstimateMutation();
  const [updateTimeLog] = useUpdateTimeLogMutation();

  // Check if timer is running for this task
  const isTimerRunningForThisTask = activeTimerData?.timer?.taskId === taskId;
  const activeTimeLogId = activeTimerData?.timer?.id;

  // Calculate elapsed time for running timer
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowFallback(true);
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [id, isTaskModalOpen]);

  const { data: task, isLoading, error, refetch } = useGetTaskQuery(taskId, {
    skip: !isValidTaskId || !showFallback,
  });

  const isPrivateTask = task?.project?.visibility
    ? task.project.visibility === 'private'
    : true;

  // Load share info
  const loadShareInfo = useCallback(async () => {
    if (!taskId) return;
    setShareLoading(true);
    setShareError(null);
    try {
      const data = await apiService.getTaskShare(taskId);
      setShareData(data);
      setShareAllowComments(data.allowComments);
      setShareRequirePassword(data.requirePassword);
    } catch (error) {
      // No existing share - that's ok
      setShareData(null);
    } finally {
      setShareLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isShareOpen) {
      loadShareInfo();
    }
  }, [isShareOpen, loadShareInfo]);

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

      // Only require password when:
      // 1. Creating a new password-protected share, OR
      // 2. Updating and password protection is being enabled for the first time, OR
      // 3. User explicitly enters a new password (changing existing password)
      if (shareRequirePassword) {
        const trimmed = sharePassword.trim();
        const isNewShare = !shareData;
        const isEnablingPassword = shareData && !shareData.requirePassword;
        const isChangingPassword = trimmed.length > 0;

        if ((isNewShare || isEnablingPassword) && trimmed.length < 6) {
          setShareError('Password must be at least 6 characters');
          setShareLoading(false);
          return;
        }

        // Only include password in payload if user entered a new one
        if (isChangingPassword) {
          payload.password = trimmed;
        }
      }

      const data = await apiService.createTaskShare(taskId, payload);
      setShareData(data);
      setSharePassword('');
      toast.success(shareData ? 'Share link updated' : 'Share link created');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create share link';
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
      setSharePassword('');
      toast.success('Share link revoked');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke share link';
      setShareError(message);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyShareLink = useCallback(() => {
    if (!shareData?.shareUrl) return;
    navigator.clipboard.writeText(shareData.shareUrl);
    toast.success('Share link copied to clipboard');
  }, [shareData?.shareUrl]);

  // Email validation function
  const validateEmails = (emails: string): boolean => {
    if (!emails.trim()) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
    return emailList.every(email => emailRegex.test(email));
  };

  const handleInviteExternal = useCallback(() => {
    if (!shareData?.shareUrl || !inviteEmails.trim()) {
      toast.error('Please create a share link and enter email addresses');
      return;
    }
    if (!validateEmails(inviteEmails)) {
      setEmailError('Please enter valid email addresses separated by commas');
      return;
    }
    setEmailError(null);
    const subject = encodeURIComponent(`Shared Task: ${task?.title || 'Task'}`);
    const body = encodeURIComponent(
      `Hi,\n\nI've shared a task with you:\n\n${shareData.shareUrl}\n\nBest regards`
    );
    window.open(`mailto:${inviteEmails.trim()}?subject=${subject}&body=${body}`);
    toast.success('Email client opened');
  }, [shareData?.shareUrl, inviteEmails, task?.title]);

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

    if (typeof log.durationMinutes === 'number') {
      return Math.round(log.durationMinutes * 60);
    }

    return 0;
  };

  const getTimeLogUserName = (log: TimeLog): string => {
    const username = log.user?.username?.trim() || '';
    const looksLikeToken = /^[0-9a-f-]{16,}$/i.test(username);
    if (username && !looksLikeToken) {
      return username;
    }

    const email = log.user?.email?.trim();
    if (email) {
      return email;
    }

    const fallbackId = log.user?.userId ?? log.userId;
    if (typeof fallbackId === 'number') {
      return `User ${fallbackId}`;
    }

    return username || 'Unknown';
  };

  // Time tracking handlers
  const handleStartTimer = useCallback(async () => {
    try {
      await startTimer({ taskId }).unwrap();
      await refetchTimeLogs();
      await refetchActiveTimer();
      toast.success('Timer started!');
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  }, [startTimer, taskId, refetchTimeLogs, refetchActiveTimer]);

  const handleStopTimer = useCallback(async (description: string) => {
    if (!activeTimeLogId) return;
    try {
      await stopTimer(activeTimeLogId).unwrap();
      if (description.trim()) {
        try {
          await updateTimeLog({ logId: activeTimeLogId, description: description.trim() }).unwrap();
        } catch (updateError) {
          console.warn('Failed to update time log description:', updateError);
        }
      }
      toast.success('Timer stopped!');
    } catch (error) {
      console.error('Failed to stop timer:', error);
    } finally {
      await Promise.allSettled([refetchTimeLogs(), refetchTimeEstimate(), refetchActiveTimer()]);
    }
  }, [stopTimer, activeTimeLogId, updateTimeLog, refetchTimeLogs, refetchTimeEstimate, refetchActiveTimer]);

  const handleUpdateEstimate = useCallback(async (minutes: number) => {
    try {
      await setTimeEstimate({ taskId, estimate: formatMinutesToEstimate(minutes) }).unwrap();
      await refetchTimeEstimate();
      toast.success('Time estimate updated!');
    } catch (error) {
      console.error('Failed to set time estimate:', error);
    }
  }, [setTimeEstimate, taskId, refetchTimeEstimate]);

  const handleDeleteTimeLog = useCallback(async () => {
    toast.info('Delete time log - not yet implemented');
  }, []);

  // Keyboard shortcut for timer (Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Ctrl+Space or Cmd+Space to avoid blocking normal scrolling
      if (e.key !== ' ' || !(e.ctrlKey || e.metaKey)) return;

      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTyping) return;

      e.preventDefault();
      if (isTimerRunningForThisTask) {
        handleStopTimer('');
      } else {
        handleStartTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTimerRunningForThisTask, handleStartTimer, handleStopTimer]);

  const formattedDates = useMemo(() => {
    const formatDate = (value?: string | null) => {
      if (!value) return 'Not set';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return 'Not set';
      return parsed.toLocaleDateString();
    };

    return {
      startDate: formatDate(task?.startDate),
      dueDate: formatDate(task?.dueDate),
      createdAt: formatDate(task?.createdAt),
      updatedAt: formatDate(task?.updatedAt),
    };
  }, [task]);

  if (!isValidTaskId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">We couldn&apos;t find that task.</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tasks
          </Button>
        </div>
      </div>
    );
  }

  if (!showFallback) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Opening task details...</p>
          <Button variant="ghost" size="sm" onClick={() => setShowFallback(true)}>
            View details here
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold">Task Not Found</h2>
          <p className="text-muted-foreground">The task may have been deleted or is unavailable.</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tasks
          </Button>
        </div>
      </div>
    );
  }

  const projectName = task.project?.name || task.projectName || (task.projectId ? `Project #${task.projectId}` : 'Project');
  const assigneeName = task.assignee?.username || task.assignee?.name || 'Unassigned';
  const authorName = task.author?.username || task.author?.name || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Shared banner - shows when task is shared externally */}
      {shareData && (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">This issue is shared externally</p>
            <p className="text-xs mt-0.5">
              External guests can view this {isPrivateTask ? 'private team ' : ''}issue via the share link.
              {shareData.requirePassword && ' Password protection is enabled.'}
              {shareData.allowComments && ' External comments are allowed.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setIsShareOpen(true)}
          >
            Manage
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Task #{taskId}</p>
          <h1 className="text-2xl font-semibold">{task.title || 'Untitled task'}</h1>
          <p className="text-sm text-muted-foreground">{projectName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareOpen(true)}
            className="gap-1"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tasks
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {task.status && <Badge>{task.status}</Badge>}
        {task.priority && <Badge variant="secondary">{task.priority}</Badge>}
        {task.taskType && <Badge variant="outline">{task.taskType}</Badge>}
        {isTimerRunningForThisTask && (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 gap-1">
            <Timer className="h-3 w-3 animate-pulse" />
            Tracking Time
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Time Tracking Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Timer className="h-4 w-4" /> Time Tracking
              {isTimerRunningForThisTask && (
                <Badge variant="default" className="bg-amber-500 text-[10px] ml-2">
                  <Play className="h-2 w-2 mr-1" />
                  Running
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeTrackingSection
              taskId={taskId}
              timeEstimate={timeEstimateData?.estimatedMinutes}
              timeLogs={timeLogsData?.logs.map((log) => ({
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
            <div className="mt-4 pt-4 border-t border-border">
              <ManualTimeEntryForm
                taskId={taskId}
                taskTitle={task.title || 'Task'}
                onSubmit={async (data) => {
                  toast.info('Manual time entry: ' + data.duration);
                  await refetchTimeLogs();
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Assignee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{assigneeName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" /> Author
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{authorName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Start date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{formattedDates.startDate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Due date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{formattedDates.dueDate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flag className="h-4 w-4" /> Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{formattedDates.createdAt}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Last updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{formattedDates.updatedAt}</p>
          </CardContent>
        </Card>

        {/* Time in Status Panel */}
        <TaskStatusHistoryPanel task={task} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Description</CardTitle>
        </CardHeader>
        <CardContent>
          {task.description ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(task.description) }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No description provided.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentsSection taskId={taskId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentsSection taskId={taskId} />
          </CardContent>
        </Card>
      </div>

      {/* Share Dialog */}
      <Dialog
        open={isShareOpen}
        onOpenChange={(open) => {
          setIsShareOpen(open);
          if (open) {
            loadShareInfo();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share issue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Invite external guests to view this {isPrivateTask ? 'private team ' : ''}issue.
            </p>

            {/* External access notice */}
            <div className="rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">External access</p>
                <p className="text-xs">Anyone with the link can view this issue. The link can be revoked at any time.</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="space-y-0.5">
                <Label className="text-sm">Allow external comments</Label>
                <p className="text-xs text-muted-foreground">
                  Guests can comment on the shared issue.
                </p>
              </div>
              <Switch
                checked={shareAllowComments}
                onCheckedChange={(checked) => setShareAllowComments(Boolean(checked))}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="space-y-0.5">
                <Label className="text-sm">Require password</Label>
                <p className="text-xs text-muted-foreground">
                  Guests must enter a password to view.
                </p>
              </div>
              <Switch
                checked={shareRequirePassword}
                onCheckedChange={(checked) => setShareRequirePassword(Boolean(checked))}
              />
            </div>

            {shareRequirePassword && (
              <div className="space-y-2">
                <Label className="text-sm">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                />
              </div>
            )}

            {shareError && <p className="text-xs text-destructive">{shareError}</p>}

            {shareLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            )}

            {shareData ? (
              <div className="space-y-3">
                <div className="rounded-md bg-muted p-3 space-y-2">
                  <Label className="text-sm">Share link</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input value={shareData.shareUrl} readOnly className="flex-1" />
                    <Button type="button" variant="outline" onClick={handleCopyShareLink} className="shrink-0">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleCreateOrUpdateShare} disabled={shareLoading}>
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
              <Button type="button" onClick={handleCreateOrUpdateShare} disabled={shareLoading} className="w-full">
                Create share link
              </Button>
            )}

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm">Invite by email</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="name@company.com, name2@company.com"
                  value={inviteEmails}
                  onChange={(event) => {
                    setInviteEmails(event.target.value);
                    setEmailError(null);
                  }}
                />
                <Button type="button" onClick={handleInviteExternal} disabled={shareLoading || !shareData}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This will open your email client with the share link.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetailPage;
