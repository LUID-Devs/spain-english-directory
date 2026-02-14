import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

interface UndoableDeleteOptions {
  duration?: number; // milliseconds before permanent deletion
  onDelete: (id: number) => Promise<void>;
  onCancel?: (id: number) => void;
  itemName?: string;
}

interface PendingDeletion {
  id: number;
  timeoutId: NodeJS.Timeout;
  itemName: string;
}

/**
 * useUndoableDelete Hook
 * 
 * Provides undo functionality for delete operations.
 * Shows a toast with undo button that delays the actual deletion.
 * 
 * Usage:
 * const { deleteWithUndo, cancelDeletion, isPending } = useUndoableDelete({
 *   onDelete: async (id) => await api.deleteTask(id),
 *   duration: 5000, // 5 seconds
 * });
 * 
 * // In your component:
 * deleteWithUndo(taskId, taskTitle);
 */
export function useUndoableDelete({
  duration = 5000,
  onDelete,
  onCancel,
  itemName = 'Item',
}: UndoableDeleteOptions) {
  const [pendingDeletions, setPendingDeletions] = useState<Map<number, PendingDeletion>>(new Map());
  const toastIdMap = useRef<Map<number, string | number>>(new Map());
  
  // Use refs to track current state for callbacks (avoids stale closure issues)
  const pendingMapRef = useRef<Map<number, PendingDeletion>>(new Map());
  
  // Keep ref in sync with state
  pendingMapRef.current = pendingDeletions;

  const isPending = useCallback((id: number) => {
    return pendingMapRef.current.has(id);
  }, []);

  const cancelDeletion = useCallback((id: number) => {
    const current = pendingMapRef.current.get(id);
    if (current) {
      // Clear the timeout
      clearTimeout(current.timeoutId);
      
      // Dismiss the toast
      const toastId = toastIdMap.current.get(id);
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      // Remove from pending
      const newMap = new Map(pendingMapRef.current);
      newMap.delete(id);
      pendingMapRef.current = newMap;
      setPendingDeletions(newMap);
      
      // Call cancel callback
      onCancel?.(id);
      
      // Show cancellation confirmation
      toast.info(`${current.itemName} restored`, {
        duration: 2000,
      });
    }
  }, [onCancel]);

  const executeDeletion = useCallback(async (id: number, name: string) => {
    // Double-check we're still pending (prevent race conditions)
    if (!pendingMapRef.current.has(id)) {
      // This deletion was cancelled - don't execute
      return;
    }
    
    try {
      await onDelete(id);
      toast.success(`${name} deleted`, {
        duration: 2000,
      });
    } catch (error) {
      toast.error(`Failed to delete ${name.toLowerCase()}`, {
        duration: 3000,
      });
      console.error('Delete failed:', error);
    } finally {
      const newMap = new Map(pendingMapRef.current);
      newMap.delete(id);
      pendingMapRef.current = newMap;
      setPendingDeletions(newMap);
      toastIdMap.current.delete(id);
    }
  }, [onDelete]);

  const deleteWithUndo = useCallback((id: number, name: string = itemName) => {
    // If already pending, cancel first (toggle behavior)
    if (pendingMapRef.current.has(id)) {
      cancelDeletion(id);
      return;
    }

    // Show toast with undo action
    const toastId = toast(
      React.createElement('div', { className: 'flex items-center justify-between gap-4' },
        React.createElement('span', { className: 'text-sm' }, `"${name}" will be deleted...`),
        React.createElement(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: () => cancelDeletion(id),
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
          if (pendingMapRef.current.has(id)) {
            executeDeletion(id, name);
          }
        },
      }
    );

    // Store toast ID for later dismissal
    toastIdMap.current.set(id, toastId);

    // Set timeout for actual deletion
    const timeoutId = setTimeout(() => {
      // Use ref to get current state (avoids stale closure)
      if (pendingMapRef.current.has(id)) {
        executeDeletion(id, name);
      }
    }, duration);

    // Add to pending deletions
    const newPending: PendingDeletion = { id, timeoutId, itemName: name };
    const newMap = new Map(pendingMapRef.current);
    newMap.set(id, newPending);
    pendingMapRef.current = newMap;
    setPendingDeletions(newMap);
  }, [duration, itemName, cancelDeletion, executeDeletion]);

  // Cleanup function for unmounting
  const cleanup = useCallback(() => {
    pendingMapRef.current.forEach((pending) => {
      clearTimeout(pending.timeoutId);
    });
    pendingMapRef.current.clear();
    setPendingDeletions(new Map());
    toastIdMap.current.clear();
  }, []);

  return {
    deleteWithUndo,
    cancelDeletion,
    isPending,
    cleanup,
    pendingCount: pendingDeletions.size,
    pendingIds: Array.from(pendingDeletions.keys()),
  };
}

export default useUndoableDelete;
