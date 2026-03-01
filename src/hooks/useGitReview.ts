import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  PRReviewState,
  PRDiff,
  InlineComment,
  AIReviewResult,
  PRReviewRequest,
  PRReviewSummary,
  getPRReviewState,
  savePRReviewState,
  deletePRReviewState,
  getDefaultChecklist,
  fetchPRDiff,
  fetchPRComments,
  addInlineComment,
  updateInlineComment,
  deleteInlineComment,
  resolveInlineComment,
  requestPRReview,
  getPRReviewRequests,
  getPendingReviewRequests,
  respondToReviewRequest,
  startAIReview,
  getAIReviewResults,
  getPRReviewSummary,
} from '@/services/gitReviewService';
import { toast } from 'sonner';

// ==================== QUERY KEYS ====================

const gitReviewKeys = {
  all: ['gitReview'] as const,
  diff: (prId: number) => [...gitReviewKeys.all, 'diff', prId] as const,
  comments: (prId: number) => [...gitReviewKeys.all, 'comments', prId] as const,
  aiReviews: (prId: number) => [...gitReviewKeys.all, 'aiReviews', prId] as const,
  reviewRequests: (prId: number) => [...gitReviewKeys.all, 'reviewRequests', prId] as const,
  pendingRequests: () => [...gitReviewKeys.all, 'pendingRequests'] as const,
  summary: (prId: number) => [...gitReviewKeys.all, 'summary', prId] as const,
};

// ==================== DIFF HOOKS ====================

export function usePRDiff(prId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gitReviewKeys.diff(prId),
    queryFn: () => fetchPRDiff(prId),
    enabled: options?.enabled !== false && prId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== COMMENT HOOKS ====================

export function usePRComments(prId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gitReviewKeys.comments(prId),
    queryFn: () => fetchPRComments(prId),
    enabled: options?.enabled !== false && prId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddInlineComment(prId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: Omit<InlineComment, 'id' | 'createdAt' | 'updatedAt' | 'author'>) =>
      addInlineComment(prId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.comments(prId) });
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });
}

export function useUpdateInlineComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: number; text: string }) =>
      updateInlineComment(commentId, text),
    onSuccess: (_data, variables) => {
      // Invalidate all comment queries since we don't know the PR ID
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.all });
      toast.success('Comment updated');
    },
    onError: () => {
      toast.error('Failed to update comment');
    },
  });
}

export function useDeleteInlineComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInlineComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.all });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
}

export function useResolveInlineComment(prId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveInlineComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.comments(prId) });
      toast.success('Comment resolved');
    },
    onError: () => {
      toast.error('Failed to resolve comment');
    },
  });
}

// ==================== REVIEW STATE HOOKS (Local Storage) ====================

export function usePRReviewState(taskId: number, prId: number) {
  const queryClient = useQueryClient();
  const queryKey = ['prReviewState', taskId, prId];

  const { data: reviewState } = useQuery({
    queryKey,
    queryFn: () => getPRReviewState(taskId, prId),
    staleTime: Infinity,
  });

  const saveReview = useCallback(
    (state: PRReviewState) => {
      savePRReviewState(taskId, prId, state);
      queryClient.setQueryData(queryKey, state);
    },
    [taskId, prId, queryClient, queryKey]
  );

  const deleteReview = useCallback(() => {
    deletePRReviewState(taskId, prId);
    queryClient.setQueryData(queryKey, null);
  }, [taskId, prId, queryClient, queryKey]);

  const initializeReview = useCallback(() => {
    const defaultState: PRReviewState = {
      status: 'pending',
      notes: '',
      checklist: getDefaultChecklist(),
    };
    saveReview(defaultState);
    return defaultState;
  }, [saveReview]);

  return {
    reviewState,
    saveReview,
    deleteReview,
    initializeReview,
  };
}

// ==================== REVIEW REQUEST HOOKS ====================

export function usePRReviewRequests(prId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gitReviewKeys.reviewRequests(prId),
    queryFn: () => getPRReviewRequests(prId),
    enabled: options?.enabled !== false && prId > 0,
  });
}

export function usePendingReviewRequests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gitReviewKeys.pendingRequests(),
    queryFn: getPendingReviewRequests,
    enabled: options?.enabled !== false,
  });
}

export function useRequestPRReview(prId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestedFromUserId,
      message,
      dueDate,
    }: {
      requestedFromUserId: number;
      message?: string;
      dueDate?: string;
    }) => requestPRReview(prId, requestedFromUserId, message, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.reviewRequests(prId) });
      toast.success('Review requested');
    },
    onError: () => {
      toast.error('Failed to request review');
    },
  });
}

export function useRespondToReviewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      accept,
      message,
    }: {
      requestId: number;
      accept: boolean;
      message?: string;
    }) => respondToReviewRequest(requestId, accept, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.pendingRequests() });
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.all });
      toast.success('Response sent');
    },
    onError: () => {
      toast.error('Failed to respond to review request');
    },
  });
}

// ==================== AI REVIEW HOOKS ====================

export function useAIReviewResults(prId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gitReviewKeys.aiReviews(prId),
    queryFn: () => getAIReviewResults(prId),
    enabled: options?.enabled !== false && prId > 0,
  });
}

export function useStartAIReview(prId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: {
      agentId?: number;
      checkSecurity?: boolean;
      checkPerformance?: boolean;
      checkBestPractices?: boolean;
    }) => startAIReview(prId, options?.agentId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gitReviewKeys.aiReviews(prId) });
      toast.success('AI review started');
    },
    onError: () => {
      toast.error('Failed to start AI review');
    },
  });
}

// ==================== SUMMARY HOOKS ====================

export function usePRReviewSummary(prId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gitReviewKeys.summary(prId),
    queryFn: () => getPRReviewSummary(prId),
    enabled: options?.enabled !== false && prId > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ==================== NOTIFICATION HOOK ====================

export function useGitReviewNotifications() {
  const { data: pendingRequests } = usePendingReviewRequests();

  const unreadCount = pendingRequests?.filter((r) => r.status === 'pending').length || 0;

  return {
    unreadCount,
    pendingRequests: pendingRequests || [],
    hasUnread: unreadCount > 0,
  };
}
