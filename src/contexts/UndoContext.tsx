import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

interface UndoableAction {
  id: string;
  label: string;
  undo: () => void;
  timestamp: number;
}

interface UndoContextType {
  registerUndo: (action: Omit<UndoableAction, 'id' | 'timestamp'>) => string;
  unregisterUndo: (id: string) => void;
  undoLast: () => boolean;
  canUndo: boolean;
  lastAction: UndoableAction | null;
}

const UndoContext = createContext<UndoContextType | null>(null);

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo must be used within UndoProvider');
  }
  return context;
};

interface UndoProviderProps {
  children: React.ReactNode;
}

/**
 * UndoProvider - Global undo context with Cmd/Ctrl+Z support
 * 
 * Provides a central registry for undoable actions across the app.
 * Users can press Cmd/Ctrl+Z to undo the most recent action.
 * 
 * Usage:
 * ```tsx
 * const { registerUndo, undoLast } = useUndo();
 * 
 * // Register an undoable action
 * registerUndo({
 *   label: 'Delete task "My Task"',
 *   undo: () => restoreTask(taskId),
 * });
 * ```
 */
export const UndoProvider: React.FC<UndoProviderProps> = ({ children }) => {
  const [lastAction, setLastAction] = useState<UndoableAction | null>(null);
  const actionsRef = useRef<Map<string, UndoableAction>>(new Map());
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const idCounter = useRef(0);

  const generateId = () => `undo-${Date.now()}-${++idCounter.current}`;

  const registerUndo = useCallback((action: Omit<UndoableAction, 'id' | 'timestamp'>) => {
    const id = generateId();
    const undoableAction: UndoableAction = {
      ...action,
      id,
      timestamp: Date.now(),
    };
    
    actionsRef.current.set(id, undoableAction);
    setLastAction(undoableAction);
    
    // Auto-cleanup after 30 seconds
    const timeoutId = setTimeout(() => {
      actionsRef.current.delete(id);
      timeoutsRef.current.delete(id);
      setLastAction(current => current?.id === id ? null : current);
    }, 30000);
    timeoutsRef.current.set(id, timeoutId);
    
    return id;
  }, []);

  const unregisterUndo = useCallback((id: string) => {
    actionsRef.current.delete(id);
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setLastAction(current => current?.id === id ? null : current);
  }, []);

  const undoLast = useCallback(() => {
    if (!lastAction) return false;
    
    try {
      lastAction.undo();
      actionsRef.current.delete(lastAction.id);
      const timeoutId = timeoutsRef.current.get(lastAction.id);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutsRef.current.delete(lastAction.id);
      }
      
      // Find next most recent action
      let nextRecent: UndoableAction | null = null;
      actionsRef.current.forEach(action => {
        if (!nextRecent || action.timestamp > nextRecent.timestamp) {
          nextRecent = action;
        }
      });
      setLastAction(nextRecent);
      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      return false;
    }
  }, [lastAction]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  // Register global Cmd/Ctrl+Z shortcut
  useGlobalShortcuts({
    enabled: true,
    shortcuts: [
      {
        key: 'z',
        metaKey: true,
        handler: undoLast,
        description: 'Undo last action',
      },
    ],
  });

  const value: UndoContextType = {
    registerUndo,
    unregisterUndo,
    undoLast,
    canUndo: !!lastAction,
    lastAction,
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
    </UndoContext.Provider>
  );
};

export default UndoProvider;
