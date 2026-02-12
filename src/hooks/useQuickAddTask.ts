import { useEffect, useCallback, useState } from 'react';

interface UseGlobalShortcutOptions {
  key: string;
  shift?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
}

export const useGlobalShortcut = (
  options: UseGlobalShortcutOptions,
  callback: () => void
) => {
  const { key, shift = false, ctrl = false, meta = false, alt = false, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      const shiftMatch = event.shiftKey === shift;
      const ctrlMatch = event.ctrlKey === ctrl;
      const metaMatch = event.metaKey === meta;
      const altMatch = event.altKey === alt;

      // Check for Cmd+Shift+T (or Ctrl+Shift+T on Windows/Linux)
      if (keyMatch && shiftMatch && (ctrlMatch || metaMatch) && altMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [key, shift, ctrl, meta, alt, preventDefault, callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook specifically for Quick Add Task modal state
interface UseQuickAddTaskReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useQuickAddTask = (): UseQuickAddTaskReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Register global keyboard shortcut: Cmd/Ctrl + Shift + T
  useGlobalShortcut(
    { key: 't', shift: true, ctrl: true, meta: true },
    open
  );

  return { isOpen, open, close, toggle };
};
