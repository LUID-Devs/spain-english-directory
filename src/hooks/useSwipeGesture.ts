import { useRef, useCallback, useEffect } from "react";

type SwipeDirection = "left" | "right" | "up" | "down";

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe
  edgeThreshold?: number; // Distance from edge to detect edge swipes
  preventDefaultOnSwipe?: boolean;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
}

export const useSwipeGesture = (config: SwipeConfig) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    edgeThreshold = 30,
    preventDefaultOnSwipe = false,
  } = config;

  const touchData = useRef<TouchData | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchData.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchData.current.startX;
      const deltaY = touch.clientY - touchData.current.startY;
      const deltaTime = Date.now() - touchData.current.startTime;

      // Only trigger if swipe was fast enough (under 500ms)
      if (deltaTime > 500) {
        touchData.current = null;
        return;
      }

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Determine if this is a horizontal or vertical swipe
      const isHorizontal = absX > absY;

      if (isHorizontal && absX >= threshold) {
        if (preventDefaultOnSwipe) {
          e.preventDefault();
        }

        if (deltaX > 0 && onSwipeRight) {
          // Check if swipe started from left edge (for opening sidebar)
          const startedFromEdge = touchData.current.startX <= edgeThreshold;
          if (startedFromEdge || !edgeThreshold) {
            onSwipeRight();
          }
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else if (!isHorizontal && absY >= threshold) {
        if (preventDefaultOnSwipe) {
          e.preventDefault();
        }

        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }

      touchData.current = null;
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, edgeThreshold, preventDefaultOnSwipe]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: !preventDefaultOnSwipe });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd, preventDefaultOnSwipe]);

  return elementRef;
};

// Simplified hook for sidebar swipe specifically
export const useSidebarSwipe = (
  isOpen: boolean,
  onOpen: () => void,
  onClose: () => void
) => {
  return useSwipeGesture({
    onSwipeRight: () => {
      if (!isOpen) {
        onOpen();
      }
    },
    onSwipeLeft: () => {
      if (isOpen) {
        onClose();
      }
    },
    threshold: 50,
    edgeThreshold: 40, // Swipe right only works from left 40px edge
  });
};

export default useSwipeGesture;
