import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useTaskShare } from '../../hooks/useTaskShare';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface TaskShareDialogProps {
  taskId: number;
  taskTitle: string;
  open: boolean;
  onClose: () => void;
}

export const TaskShareDialog: React.FC<TaskShareDialogProps> = ({
  taskId,
  taskTitle,
  open,
  onClose,
}) => {
  const { shares, loading, error, shareTask, revokeShare, isSharedExternally } = useTaskShare({ taskId });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleShare = async () => {
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Invalid email format');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await shareTask({ email: email.trim(), name: name.trim() || undefined });
      setEmail('');
      setName('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to share task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (externalUserId: number) => {
    try {
      await revokeShare(externalUserId);
    } catch (err) {
      console.error('Failed to revoke share:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShareIcon />
          <Typography variant="h6">Share Task</Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          {taskTitle}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Visibility Banner */}
        {isSharedExternally && (
          <Alert 
            severity="info" 
            icon={<VisibilityIcon />}
            sx={{ mb: 2 }}
          >
            This task is shared externally. External users can view this task.
          </Alert>
        )}

        {/* Add New Share */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Invite External User
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              size="small"
              fullWidth
              disabled={isSubmitting}
              error={!!formError}
              helperText={formError}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleShare();
                }
              }}
            />
            <TextField
              label="Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              size="small"
              fullWidth
              disabled={isSubmitting}
            />
            <Button
              variant="contained"
              onClick={handleShare}
              disabled={isSubmitting || !email.trim()}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <EmailIcon />}
            >
              Send Invite
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Active Shares List */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Shared With
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : shares.length === 0 ? (
          <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: 'center' }}>
            Not shared with anyone yet
          </Typography>
        ) : (
          <List dense>
            {shares.map((share) => (
              <ListItem key={share.id}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {share.externalUser.name || share.externalUser.email}
                      </Typography>
                      <Chip
                        label={share.isActive ? 'Active' : 'Revoked'}
                        size="small"
                        color={share.isActive ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.75rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {share.externalUser.email}
                      {share.externalUser.lastAccessedAt && (
                        <>
                          {' · Last viewed '}
                          {formatDistanceToNow(new Date(share.externalUser.lastAccessedAt))}
                          {' ago'}
                        </>
                      )}
                      {share.externalUser.accessCount > 0 && (
                        <>
                          {' · '}{share.externalUser.accessCount} view
                          {share.externalUser.accessCount !== 1 ? 's' : ''}
                        </>
                      )}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  {share.isActive && (
                    <Tooltip title="Revoke Access">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRevoke(share.externalUserId)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskShareDialog;
