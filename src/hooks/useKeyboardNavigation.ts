import { useState, useEffect, useCallback, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  itemSelector: string;
  onSelect?: (element: HTMLElement) => void;
  onOpen?: (element: HTMLElement) => void;
  onToggle?: (element: HTMLElement) => void;
  enabled?: boolean;
}

interface UseKeyboardNavigationReturn {
  selectedIndex: number;
  selectedElement: HTMLElement | null;
  resetSelection: () => void;
}

/**
 * Hook for keyboard navigation of lists (tasks, projects, etc.)
 * Supports j/k and arrow keys for navigation, Enter to open, Space to toggle (optional)
 */
export const useKeyboardNavigation = ({
  itemSelector,
  onSelect,
  onOpen,
  onToggle,
  enabled = true,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const itemRefs = useRef<HTMLElement[]>([]);
  const isNavigating = useRef(false);

  // Update item refs when items change
  useEffect(() => {
    if (!enabled) return;
    
    // Small delay to allow DOM to update
    const timeout = setTimeout(() => {
      itemRefs.current = Array.from(document.querySelectorAll(itemSelector)) as HTMLElement[];
      
      // Reset selection if current index is out of bounds
      if (selectedIndex >= itemRefs.current.length) {
        setSelectedIndex(itemRefs.current.length > 0 ? 0 : -1);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [itemSelector, enabled]);

  // Update selected element when index changes
  useEffect(() => {
    if (!enabled || selectedIndex < 0) {
      setSelectedElement(null);
      return;
    }

    const element = itemRefs.current[selectedIndex];
    setSelectedElement(element || null);

    if (element && onSelect) {
      onSelect(element);
    }

    // Scroll element into view if needed
    if (element && isNavigating.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      isNavigating.current = false;
    }
  }, [selectedIndex, enabled, onSelect]);

  const resetSelection = useCallback(() => {
    setSelectedIndex(-1);
    setSelectedElement(null);
    itemRefs.current = [];
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in an input, textarea, or contenteditable
      const activeElement = document.activeElement;
      const isTyping = 
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true' ||
        activeElement?.closest('[role="dialog"]') !== null;

      if (isTyping) return;

      // Don't navigate if any modal is open
      const isModalOpen = document.querySelector('[role="dialog"]') !== null;
      if (isModalOpen) return;

      const items = itemRefs.current;
      if (items.length === 0) return;

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          isNavigating.current = true;
          setSelectedIndex((prev) => {
            const newIndex = prev < items.length - 1 ? prev + 1 : 0;
            return newIndex;
          });
          break;

        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          isNavigating.current = true;
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : items.length - 1;
            return newIndex;
          });
          break;

        case 'Enter':
          if (selectedIndex >= 0 && selectedElement) {
            e.preventDefault();
            if (onOpen) {
              onOpen(selectedElement);
            } else {
              // Default behavior: click the element or its first clickable child
              const clickable = selectedElement.querySelector('button, a, [role="button"]') as HTMLElement;
              if (clickable) {
                clickable.click();
              } else {
                selectedElement.click();
              }
            }
          }
          break;

        case ' ':
        case 'Space':
        case 'Spacebar':
          if (selectedIndex >= 0 && selectedElement) {
            e.preventDefault();
            if (onToggle) {
              onToggle(selectedElement);
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          isNavigating.current = true;
          setSelectedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          isNavigating.current = true;
          setSelectedIndex(items.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, selectedIndex, selectedElement, onOpen, onToggle]);

  return {
    selectedIndex,
    selectedElement,
    resetSelection,
  };
};

export default useKeyboardNavigation;
