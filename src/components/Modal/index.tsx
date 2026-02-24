import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  name: string;
};

const Modal = ({ children, isOpen, onClose, name }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => setShouldRender(true));
      // Small delay to ensure the element is in the DOM before animating
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      queueMicrotask(() => setIsVisible(false));
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto p-2 sm:p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-background shadow-2xl transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-background rounded-t-xl sm:rounded-t-2xl border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex w-full items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              {name}
            </h2>
            <button
              className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
