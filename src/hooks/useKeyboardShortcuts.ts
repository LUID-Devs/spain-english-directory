import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseKeyboardShortcutsOptions {
  onShowHelp: () => void;
  onCreateTask: () => void;
  onFocusSearch: () => void;
  onOpenCommandPalette: () => void;
  enabled?: boolean;
}

/**
 * Global keyboard shortcuts hook for TaskLuid
 * Handles: ?, c, /, Cmd+K, and G-key navigation
 */
export const useKeyboardShortcuts = ({
  onShowHelp,
  onCreateTask,
  onFocusSearch,
  onOpenCommandPalette,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  const navigate = useNavigate();
  const [gotoSequence, setGotoSequence] = useState<string | null>(null);

  // Handle goto navigation (G + key)
  const handleGoto = useCallback((key: string) => {
    switch (key.toLowerCase()) {
      case 'd':
        navigate('/dashboard');
        break;
      case 'p':
        navigate('/dashboard/projects');
        break;
      case 't':
        navigate('/dashboard/tasks');
        break;
      case 'm':
        navigate('/dashboard/teams');
        break;
      case 's':
        navigate('/dashboard/settings');
        break;
      case 'c':
        navigate('/dashboard/mission-control');
        break;
      case 'l':
        navigate('/dashboard/timeline');
        break;
      case 'a':
        navigate('/dashboard/archived-tasks');
        break;
      default:
        // Unknown key, do nothing
        break;
    }
    setGotoSequence(null);
  }, [navigate]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const activeElement = document.activeElement;
      const isTyping = 
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Don't trigger when modifiers are pressed (except for specific combinations)
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      // Check if any modal/dialog is open
      const isModalOpen = document.querySelector('[role="dialog"]') !== null;

      // Handle goto sequence
      if (gotoSequence === 'g' && !isTyping) {
        // If user pressed G and now presses another key, handle goto
        if (e.key.length === 1) {
          e.preventDefault();
          handleGoto(e.key);
          return;
        }
        // Cancel goto on Escape or other non-character keys
        if (e.key === 'Escape') {
          setGotoSequence(null);
          return;
        }
      }

      // Command palette - Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // Quick add task - Cmd/Ctrl + Shift + T
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        onCreateTask();
        return;
      }

      // If user is typing or modal is open (except for Escape), don't process other shortcuts
      if (isTyping || (isModalOpen && e.key !== 'Escape')) return;

      switch (e.key) {
        case '?':
          e.preventDefault();
          onShowHelp();
          break;

        case 'c':
        case 'C':
          // Only trigger if not in a modal
          if (!isModalOpen) {
            e.preventDefault();
            onCreateTask();
          }
          break;

        case '/':
          // Only trigger if not in a modal
          if (!isModalOpen) {
            e.preventDefault();
            onFocusSearch();
          }
          break;

        case 'g':
        case 'G':
          // Start goto sequence
          if (!hasModifier) {
            e.preventDefault();
            setGotoSequence('g');
            // Reset after 2 seconds if no follow-up key
            setTimeout(() => setGotoSequence(null), 2000);
          }
          break;

        case 'Escape':
          // Cancel goto sequence
          if (gotoSequence) {
            setGotoSequence(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, gotoSequence, onShowHelp, onCreateTask, onFocusSearch, onOpenCommandPalette, handleGoto]);

  // Show visual feedback when in goto mode
  return {
    isGotoMode: gotoSequence === 'g',
  };
};

export default useKeyboardShortcuts;
