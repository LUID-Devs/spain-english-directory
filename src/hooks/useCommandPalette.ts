import { useState, useCallback } from 'react';
import { useGlobalShortcut } from './useQuickAddTask';

interface UseCommandPaletteReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandPalette = (): UseCommandPaletteReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Register global keyboard shortcut: Cmd/Ctrl + K
  useGlobalShortcut(
    { key: 'k', ctrl: true, meta: true },
    toggle
  );

  return { isOpen, open, close, toggle };
};

export default useCommandPalette;
