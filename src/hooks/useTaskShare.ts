import { useState, useEffect, useCallback } from 'react';
import { apiService, TaskExternalShare, ExternalUser, TaskVisibilityInfo, ShareTaskRequest } from '../services/apiService';

interface UseTaskShareOptions {
  taskId: number | null;
}

export function useTaskShare(options: UseTaskShareOptions) {
  const { taskId } = options;
  const [shares, setShares] = useState<(TaskExternalShare & { externalUser: ExternalUser })[]>([]);
  const [visibility, setVisibility] = useState<TaskVisibilityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    if (!taskId) {
      setShares([]);
      setVisibility(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [sharesResponse, visibilityResponse] = await Promise.all([
        apiService.getTaskShares(taskId),
        apiService.getTaskVisibility(taskId),
      ]);
      setShares(sharesResponse.shares);
      setVisibility(visibilityResponse.visibility);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task shares');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const shareTask = async (data: ShareTaskRequest) => {
    if (!taskId) throw new Error('Task ID required');

    const response = await apiService.shareTask(taskId, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to share task');
    }
    if (response.share) {
      setShares(prev => [response.share!, ...prev]);
    }
    // Refresh visibility info
    const visibilityResponse = await apiService.getTaskVisibility(taskId);
    setVisibility(visibilityResponse.visibility);
    return response.share;
  };

  const revokeShare = async (externalUserId: number) => {
    if (!taskId) throw new Error('Task ID required');

    const response = await apiService.revokeTaskShare(taskId, externalUserId);
    if (!response.success) {
      throw new Error(response.error || 'Failed to revoke access');
    }
    setShares(prev => prev.filter(s => s.externalUserId !== externalUserId));
    // Refresh visibility info
    const visibilityResponse = await apiService.getTaskVisibility(taskId);
    setVisibility(visibilityResponse.visibility);
  };

  return {
    shares,
    visibility,
    loading,
    error,
    refetch: fetchShares,
    shareTask,
    revokeShare,
    isSharedExternally: visibility?.isSharedExternally ?? false,
  };
}

// Hook for external users accessing shared tasks
export function useSharedTask(taskId: number | null, token: string | null) {
  const [task, setTask] = useState<apiService.Task | null>(null);
  const [sharedBy, setSharedBy] = useState<{ userId: number; username?: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSharedTask = useCallback(async () => {
    if (!taskId || !token) {
      setTask(null);
      setSharedBy(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getSharedTask(taskId, token);
      if (!response.success) {
        throw new Error(response.error || 'Failed to access shared task');
      }
      if (response.task) {
        setTask(response.task);
      }
      if (response.sharedBy) {
        setSharedBy(response.sharedBy);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access shared task');
    } finally {
      setLoading(false);
    }
  }, [taskId, token]);

  useEffect(() => {
    fetchSharedTask();
  }, [fetchSharedTask]);

  return {
    task,
    sharedBy,
    loading,
    error,
    refetch: fetchSharedTask,
  };
}
