import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Flag, Tag, User } from 'lucide-react';
import { useGetTaskQuery } from '@/hooks/useApi';
import { useTaskModal } from '@/contexts/TaskModalContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AttachmentsSection from '@/components/AttachmentsSection';
import CommentsSection from '@/components/CommentsSection';
import { sanitizeHtmlContent } from '@/lib/utils';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTaskModalOpen } = useTaskModal();
  const [showFallback, setShowFallback] = useState(false);

  const taskId = Number(id);
  const isValidTaskId = Boolean(id) && !Number.isNaN(taskId);

  useEffect(() => {
    setShowFallback(false);

    const timeout = setTimeout(() => {
      setShowFallback(true);
    }, 350);

    return () => clearTimeout(timeout);
  }, [id, isTaskModalOpen]);

  const { data: task, isLoading, error } = useGetTaskQuery(taskId, {
    skip: !isValidTaskId || !showFallback,
  });

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Task #{taskId}</p>
          <h1 className="text-2xl font-semibold">{task.title || 'Untitled task'}</h1>
          <p className="text-sm text-muted-foreground">{projectName}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tasks
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {task.status && <Badge>{task.status}</Badge>}
        {task.priority && <Badge variant="secondary">{task.priority}</Badge>}
        {task.taskType && <Badge variant="outline">{task.taskType}</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
};

export default TaskDetailPage;
