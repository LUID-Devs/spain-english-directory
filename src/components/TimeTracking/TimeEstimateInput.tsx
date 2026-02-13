import React, { useState, useCallback } from "react";
import { Clock, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimeEstimateInputProps {
  value?: number; // in minutes
  onChange?: (minutes: number) => void;
  onSave?: (minutes: number) => void;
  className?: string;
  readOnly?: boolean;
}

// Format minutes into readable text
export const formatEstimate = (minutes?: number): string => {
  if (!minutes || minutes === 0) return "No estimate";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
};

export const TimeEstimateInput: React.FC<TimeEstimateInputProps> = ({
  value,
  onChange,
  onSave,
  className,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hours, setHours] = useState(Math.floor((value || 0) / 60).toString());
  const [minutes, setMinutes] = useState(((value || 0) % 60).toString());

  const handleSave = useCallback(() => {
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    onChange?.(totalMinutes);
    onSave?.(totalMinutes);
    setIsEditing(false);
  }, [hours, minutes, onChange, onSave]);

  const handleCancel = useCallback(() => {
    setHours(Math.floor((value || 0) / 60).toString());
    setMinutes(((value || 0) % 60).toString());
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="0"
            max="999"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 h-8 text-sm"
            placeholder="0"
            autoFocus
          />
          <span className="text-sm text-muted-foreground">h</span>
          <Input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 h-8 text-sm"
            placeholder="0"
          />
          <span className="text-sm text-muted-foreground">m</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="h-7 w-7"
          aria-label="Save time estimate"
        >
          <Check className="h-4 w-4 text-green-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-7 w-7"
          aria-label="Cancel editing time estimate"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {formatEstimate(value)}
      </span>
      {!readOnly && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Edit time estimate"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default TimeEstimateInput;
