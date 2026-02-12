import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface BulkDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskCount: number;
  isDeleting?: boolean;
}

const BulkDeleteConfirmationModal: React.FC<BulkDeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskCount,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-background rounded-xl sm:rounded-lg shadow-xl w-[95vw] max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-destructive/10 rounded-full shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Delete {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center hover:bg-accent rounded-lg transition-colors shrink-0"
            disabled={isDeleting}
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold">
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </span>
            ?
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            This action cannot be undone. All task data, including comments,
            attachments, and descriptions will be permanently removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-foreground bg-muted hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Deleting...
              </>
            ) : (
              <>Delete {taskCount} {taskCount === 1 ? "Task" : "Tasks"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteConfirmationModal;
