import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Lock as LockIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useSharedTask } from '../hooks/useTaskShare';
import { formatDate } from '../utils/dateUtils';
import { sanitizeHtmlContent } from '@/lib/utils';

export const SharedTaskView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const taskId = parseInt(searchParams.get('taskId') || '', 10);
  const token = searchParams.get('token') || null;

  const { task, sharedBy, loading, error } = useSharedTask(
    isNaN(taskId) ? null : taskId,
    token
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !task) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" variant="outlined">
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            {error || 'This task is no longer available or you do not have access to view it.'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <LockIcon color="action" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Shared Task
            </Typography>
            <Typography variant="h4" component="h1" gutterBottom>
              {task.title}
            </Typography>
            {sharedBy && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Shared by
                </Typography>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {sharedBy.username?.[0]?.toUpperCase() || sharedBy.email[0].toUpperCase()}
                </Avatar>
                <Typography variant="body2">
                  {sharedBy.username || sharedBy.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Metadata */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {task.status && (
            <Chip
              label={task.status}
              size="small"
              color={task.status === 'Completed' ? 'success' : 'default'}
            />
          )}
          {task.priority && (
            <Chip
              label={task.priority}
              size="small"
              variant="outlined"
              sx={{
                borderColor: getPriorityColor(task.priority),
                color: getPriorityColor(task.priority),
              }}
            />
          )}
          {task.taskType && (
            <Chip label={task.taskType} size="small" variant="outlined" />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {task.project && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Project:
              </Typography>
              <Typography variant="body2">{task.project.name}</Typography>
            </Box>
          )}

          {task.assignee && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Assignee:
              </Typography>
              <Typography variant="body2">{task.assignee.username || 'Unassigned'}</Typography>
            </Box>
          )}

          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Due Date:
              </Typography>
              <Typography variant="body2">{formatDate(new Date(task.dueDate))}</Typography>
            </Box>
          )}
        </Box>

        {task.description && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Description
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                '& p': { margin: 0 },
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(task.description) }}
            />
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Created {formatDate(new Date(task.createdAt))}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last updated {formatDate(new Date(task.updatedAt))}
          </Typography>
        </Box>
      </Paper>

      {/* Footer */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          This is a shared view of a private task. You only have read access.
        </Typography>
      </Box>
    </Container>
  );
};

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    Urgent: '#dc2626',
    High: '#ea580c',
    Medium: '#ca8a04',
    Low: '#16a34a',
    Backlog: '#6b7280',
  };
  return colors[priority] || '#6b7280';
}

export default SharedTaskView;
