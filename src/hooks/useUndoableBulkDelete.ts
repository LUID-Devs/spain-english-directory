import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { useUndo } from '@/contexts/UndoContext';

interface UndoableBulkDeleteOptions {
  duration?: number; // milliseconds before permanent deletion
  onDelete: (ids: number[]) => Promise<{ deletedCount: number }>;
  onCancel?: (ids: number[]) => void;
  itemName?: string;
  pluralName?: string;
}

interface PendingBulkDeletion {
  ids: number[];
  timeoutId: NodeJS.Timeout;
  count: number;
}

/**
 * useUndoableBulkDelete Hook
 * 
 * Provides undo functionality for bulk delete operations.
 * Shows a toast with undo button that delays the actual deletion.
 * 
 * Usage:
 * const { deleteWithUndo, cancelDeletion, isPending } = useUndoableBulkDelete({
 *   onDelete: async (ids) => await api.bulkDeleteTasks(ids),
 *   duration: 5000, // 5 seconds
 * });
 * 
 * // In your component:
 * deleteWithUndo([1, 2, 3]);
 */
export function useUndoableBulkDelete({
  duration = 5000,
  onDelete,
  onCancel,
  itemName = 'item',
  pluralName = 'items',
}: UndoableBulkDeleteOptions) {
  const [pendingDeletion, setPendingDeletion] = useState<PendingBulkDeletion | null>(null);
  const toastIdRef = useRef<string | number | null>(null);
  const undoIdRef = useRef<string | null>(null);
  
  // Global undo registration
  const { registerUndo, unregisterUndo } = useUndo();
  
  // Use refs to track current state for callbacks (avoids stale closure issues)
  const pendingRef = useRef<PendingBulkDeletion | null>(null);
  const cancelRef = useRef<(() => number[]) | null>(null);
  
  // Keep ref in sync with state
  pendingRef.current = pendingDeletion;

  const isPending = useCallback((ids?: number[]) => {
    const current = pendingRef.current;
    if (!current) return false;
    if (!ids) return true;
    // Check if all provided ids are in the pending deletion
    return ids.every(id => current.ids.includes(id));
  }, []);

  const cancelDeletion = useCallback(() => {
    const current = pendingRef.current;
    if (current) {
      // Clear the timeout
      clearTimeout(current.timeoutId);
      
      // Dismiss the toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      // Unregister from global undo
      if (undoIdRef.current) {
        unregisterUndo(undoIdRef.current);
        undoIdRef.current = null;
      }
      
      const cancelledIds = [...current.ids];
      const count = current.count;
      
      // Clear pending state
      setPendingDeletion(null);
      pendingRef.current = null;
      toastIdRef.current = null;
      
      // Call cancel callback
      onCancel?.(cancelledIds);
      
      // Show cancellation confirmation
      toast.info(
        `${count} ${count === 1 ? itemName : pluralName} restored`,
        { duration: 2000 }
      );
      
      return cancelledIds;
    }
    return [];
  }, [onCancel, itemName, pluralName, unregisterUndo]);
  
  // Keep cancel function ref updated
  cancelRef.current = cancelDeletion;

  const executeDeletion = useCallback(async (ids: number[], count: number) => {
    // Double-check we're still pending (prevent race conditions)
    const current = pendingRef.current;
    if (!current || 
        current.ids.length !== ids.length || 
        !current.ids.every(id => ids.includes(id))) {
      // This deletion was cancelled or superseded - don't execute
      return;
    }

    // Unregister from global undo
    if (undoIdRef.current) {
      unregisterUndo(undoIdRef.current);
      undoIdRef.current = null;
    }
    
    try {
      const result = await onDelete(ids);
      toast.success(
        `${result.deletedCount} ${result.deletedCount === 1 ? itemName : pluralName} deleted`,
        { duration: 2000 }
      );
    } catch (error) {
      toast.error(`Failed to delete ${pluralName}`, {
        duration: 3000,
      });
      console.error('Bulk delete failed:', error);
    } finally {
      setPendingDeletion(null);
      pendingRef.current = null;
      toastIdRef.current = null;
    }
  }, [onDelete, itemName, pluralName, unregisterUndo]);

  const deleteWithUndo = useCallback((ids: number[]) => {
    // If already pending, cancel first
    if (pendingRef.current) {
      cancelRef.current?.();
    }

    const count = ids.length;
    if (count === 0) return;
    
    // Store IDs in a ref that won't change for this deletion attempt
    const deletionIds = [...ids];
    const deletionCount = count;

    // Register with global undo context
    undoIdRef.current = registerUndo({
      label: `Delete ${count} ${count === 1 ? itemName : pluralName}`,
      undo: () => cancelRef.current?.(),
    });

    // Show toast with undo action
    const toastId = toast(
      React.createElement('div', { className: 'flex items-center justify-between gap-4' },
        React.createElement('span', { className: 'text-sm' },
          `${count} ${count === 1 ? itemName : pluralName} will be deleted...`
        ),
        React.createElement(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: () => cancelRef.current?.(),
          className: 'gap-1 h-7 px-2 text-xs'
        },
          React.createElement(Undo2, { className: 'h-3 w-3' }),
          'Undo'
        )
      ),
      {
        duration: duration,
        onDismiss: () => {
          // Use ref to get current state (avoids stale closure)
          const current = pendingRef.current;
          // Only delete if still pending with same IDs
          if (current && 
              current.ids.length === deletionIds.length && 
              current.ids.every(id => deletionIds.includes(id))) {
            executeDeletion(deletionIds, deletionCount);
          }
        },
      }
    );

    // Store toast ID for later dismissal
    toastIdRef.current = toastId;

    // Set timeout for actual deletion
    const timeoutId = setTimeout(() => {
      // Use ref to get current state (avoids stale closure)
      const current = pendingRef.current;
      // Only delete if still pending with same IDs
      if (current && 
          current.ids.length === deletionIds.length &&
          current.ids.every(id => deletionIds.includes(id))) {
        executeDeletion(deletionIds, deletionCount);
      }
    }, duration);

    // Add to pending deletions
    const newPending = { ids: deletionIds, timeoutId, count: deletionCount };
    pendingRef.current = newPending;
    setPendingDeletion(newPending);
  }, [duration, itemName, pluralName, executeDeletion, registerUndo]);

  // Cleanup function for unmounting
  const cleanup = useCallback(() => {
    const current = pendingRef.current;
    if (current) {
      clearTimeout(current.timeoutId);
      setPendingDeletion(null);
      pendingRef.current = null;
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    if (undoIdRef.current) {
      unregisterUndo(undoIdRef.current);
      undoIdRef.current = null;
    }
  }, [unregisterUndo]);

  return {
    deleteWithUndo,
    cancelDeletion,
    isPending,
    cleanup,
    pendingCount: pendingDeletion?.count ?? 0,
    pendingIds: pendingDeletion?.ids ?? [],
  };
}

export default useUndoableBulkDelete;
