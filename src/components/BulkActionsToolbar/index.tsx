import React from "react";
import {
  Trash2,
  Archive,
  ArchiveRestore,
  CheckSquare,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Status, Task, User as UserType } from "@/services/apiService";

interface BulkActionsToolbarProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
  onStatusChange: (status: string) => void;
  onAssign: (userId: number | null) => void;
  onDelete: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  users?: UserType[];
  isProcessing?: boolean;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: Status.ToDo, label: "To Do" },
  { value: Status.WorkInProgress, label: "Work In Progress" },
  { value: Status.UnderReview, label: "Under Review" },
  { value: Status.Completed, label: "Completed" },
  { value: Status.Archived, label: "Archived" },
];

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedTasks,
  onClearSelection,
  onStatusChange,
  onAssign,
  onDelete,
  onArchive,
  onUnarchive,
  users = [],
  isProcessing = false,
}) => {
  const selectedCount = selectedTasks.length;

  if (selectedCount === 0) {
    return null;
  }

  // Check if all selected tasks are archived
  const allArchived = selectedTasks.every((t) => t.archivedAt !== null);
  const someArchived = selectedTasks.some((t) => t.archivedAt !== null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="bg-card border border-border shadow-xl rounded-lg px-4 py-3 flex items-center gap-3">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
            <span className="text-xs font-medium text-primary">{selectedCount}</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {selectedCount === 1 ? "task selected" : "tasks selected"}
          </span>
          <button
            onClick={onClearSelection}
            className="ml-1 p-1 hover:bg-accent rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                disabled={isProcessing}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Status
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onStatusChange(option.value)}
                  disabled={isProcessing}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assign dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                disabled={isProcessing}
              >
                <User className="h-3.5 w-3.5" />
                Assign
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => onAssign(null)} disabled={isProcessing}>
                Unassigned
              </DropdownMenuItem>
              {users.map((user) => (
                <DropdownMenuItem
                  key={user.userId}
                  onClick={() => onAssign(user.userId)}
                  disabled={isProcessing}
                >
                  {user.username}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Archive/Unarchive */}
          {someArchived ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onUnarchive}
              disabled={isProcessing}
            >
              <ArchiveRestore className="h-3.5 w-3.5" />
              Unarchive
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onArchive}
              disabled={isProcessing}
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          )}

          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-1.5"
            onClick={onDelete}
            disabled={isProcessing}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
