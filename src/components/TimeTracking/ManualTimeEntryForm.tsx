import React, { useState } from "react";
import { Plus, Clock, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ManualTimeEntryFormProps {
  taskId: number;
  taskTitle: string;
  onSubmit: (data: {
    duration: string;
    description: string;
    date: string;
  }) => Promise<void>;
  className?: string;
}

// Parse duration string (e.g., "2h 30m", "1.5h", "90m") to minutes
const parseDuration = (input: string): number | null => {
  const normalized = input.toLowerCase().trim();
  
  // Try "2h 30m" format
  const hoursMatch = normalized.match(/(\d+(?:\.\d+)?)\s*h/);
  const minsMatch = normalized.match(/(\d+)\s*m/);
  
  let totalMinutes = 0;
  
  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
  }
  
  if (minsMatch) {
    totalMinutes += parseInt(minsMatch[1], 10);
  }
  
  // If no matches, try plain number (assume hours)
  if (!hoursMatch && !minsMatch) {
    const plainNum = parseFloat(normalized);
    if (!isNaN(plainNum)) {
      totalMinutes = plainNum * 60;
    }
  }
  
  return totalMinutes > 0 ? totalMinutes : null;
};

export const ManualTimeEntryForm: React.FC<ManualTimeEntryFormProps> = ({
  taskId,
  taskTitle,
  onSubmit,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const durationMinutes = parseDuration(duration);
    if (!durationMinutes) {
      setError("Please enter a valid duration (e.g., '2h 30m', '1.5h', '90m')");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        duration: `${durationMinutes}m`,
        description,
        date,
      });
      setOpen(false);
      setDuration("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setError("Failed to log time. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1", className)}>
          <Plus className="h-3 w-3" />
          Log Time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Log Time
            </DialogTitle>
            <DialogDescription>
              Add a time entry for <span className="font-medium">{taskTitle}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="duration" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duration
              </Label>
              <Input
                id="duration"
                placeholder="e.g., 2h 30m, 1.5h, 90m"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter duration in hours (h) and/or minutes (m)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="What did you work on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Log Time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualTimeEntryForm;
