import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { Visibility as VisibilityIcon, People as PeopleIcon } from '@mui/icons-material';
import { TaskVisibilityInfo } from '../../services/apiService';

interface TaskVisibilityBannerProps {
  visibility: TaskVisibilityInfo | null;
  onManageSharing?: () => void;
}

export const TaskVisibilityBanner: React.FC<TaskVisibilityBannerProps> = ({
  visibility,
  onManageSharing,
}) => {
  if (!visibility?.isSharedExternally) {
    return null;
  }

  const activeShares = visibility.externalShares.filter(s => s.isActive);
  const shareCount = activeShares.length;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        bgcolor: 'info.light',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'info.main',
      }}
    >
      <VisibilityIcon color="info" fontSize="small" />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="info.contrastText">
          This task is shared externally
        </Typography>
        <Typography variant="caption" color="info.contrastText" sx={{ opacity: 0.8 }}>
          {shareCount} external {shareCount === 1 ? 'user has' : 'users have'} access
        </Typography>
      </Box>
      <Tooltip title="View who has access">
        <Chip
          icon={<PeopleIcon fontSize="small" />}
          label={`${shareCount}`}
          size="small"
          color="info"
          variant="outlined"
          onClick={onManageSharing}
          sx={{
            cursor: onManageSharing ? 'pointer' : 'default',
            '&:hover': onManageSharing ? { bgcolor: 'info.main', color: 'info.contrastText' } : undefined,
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default TaskVisibilityBanner;
