import React from 'react';
import {
  AlertTriangle,
  Calendar,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OverlappingCycle } from '@/services/apiService';
import { format } from 'date-fns';

interface CycleOverlapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjustDates: () => void;
  onCreateAnyway: () => void;
  overlappingCycles: OverlappingCycle[];
  newCycleStart?: Date;
  newCycleEnd?: Date;
}

export const CycleOverlapModal: React.FC<CycleOverlapModalProps> = ({
  isOpen,
  onClose,
  onAdjustDates,
  onCreateAnyway,
  overlappingCycles,
  newCycleStart,
  newCycleEnd,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Calculate overlap days between two date ranges
  const calculateOverlapDays = (
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): number => {
    const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
    const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
    const diffTime = overlapEnd.getTime() - overlapStart.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Date Overlap Detected
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                This cycle overlaps with existing cycles
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* New cycle info */}
          {newCycleStart && newCycleEnd && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Your New Cycle
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(newCycleStart, 'MMM d')} - {format(newCycleEnd, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          )}

          {/* Overlapping cycles list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Conflicting Cycles ({overlappingCycles.length})
            </p>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {overlappingCycles.map((cycle) => {
                const overlapDays =
                  newCycleStart && newCycleEnd
                    ? calculateOverlapDays(
                        newCycleStart,
                        newCycleEnd,
                        new Date(cycle.startDate),
                        new Date(cycle.endDate)
                      )
                    : 0;

                return (
                  <div
                    key={cycle.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cycle.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                        </p>
                      </div>
                    </div>
                    {overlapDays > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-medium">{overlapDays} day overlap</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning message */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Overlapping cycles can cause task assignment conflicts and workload
                calculation errors. We recommend adjusting dates or reviewing the
                conflicting cycles first.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onAdjustDates}
            className="w-full sm:w-auto border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Adjust Dates
          </Button>
          <Button
            variant="default"
            onClick={onCreateAnyway}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Create Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CycleOverlapModal;
