import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description?: string;
}

interface UseGlobalShortcutsOptions {
  shortcuts: ShortcutConfig[];
  enabled?: boolean;
}

/**
 * Hook for registering global keyboard shortcuts
 * Skips shortcuts when user is typing in inputs
 */
export const useGlobalShortcuts = ({
  shortcuts,
  enabled = true,
}: UseGlobalShortcutsOptions) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
    const activeElement = document.activeElement;
    const isTyping = 
      activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.getAttribute('contenteditable') === 'true';

    if (isTyping) return;

    // Don't trigger when modal is open
    const isModalOpen = document.querySelector('[role="dialog"]') !== null;
    if (isModalOpen) return;

    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === e.ctrlKey;
      const metaMatch = !!shortcut.metaKey === e.metaKey;
      const shiftMatch = !!shortcut.shiftKey === e.shiftKey;
      const altMatch = !!shortcut.altKey === e.altKey;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};

// Predefined shortcuts for TaskLuid
export const TASKLUID_SHORTCUTS = {
  // Navigation
  QUICK_CREATE: { key: 'c', description: 'Create new task' },
  QUICK_CREATE_ALT: { key: 'k', metaKey: true, description: 'Create new task (Cmd+K)' },
  
  // Task actions (when task is selected)
  COMPLETE_TASK: { key: ' ', description: 'Mark task complete (Space)' },
  OPEN_TASK: { key: 'Enter', description: 'Open task details' },
  
  // Navigation
  NEXT_TASK: { key: 'j', description: 'Next task' },
  PREV_TASK: { key: 'k', description: 'Previous task' },
  
  // Help
  SHOW_HELP: { key: '?', description: 'Show keyboard shortcuts' },
} as const;

export default useGlobalShortcuts;
