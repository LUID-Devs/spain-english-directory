import React, { useMemo } from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDurationShort, TimeThresholds, getThresholdLabel } from '@/lib/timeInStatus';

interface TimeInStatusDisplayProps {
  seconds: number;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'warning';
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

export function TimeInStatusDisplay({
  seconds,
  className,
  showIcon = true,
  variant = 'default',
  thresholds = {
    warning: TimeThresholds.THREE_DAYS,
    critical: TimeThresholds.ONE_WEEK,
  },
}: TimeInStatusDisplayProps) {
  const formatted = useMemo(() => formatDurationShort(seconds), [seconds]);
  
  const statusColor = useMemo(() => {
    if (seconds >= (thresholds.critical || TimeThresholds.ONE_WEEK)) {
      return 'text-red-500';
    }
    if (seconds >= (thresholds.warning || TimeThresholds.THREE_DAYS)) {
      return 'text-amber-500';
    }
    return 'text-muted-foreground';
  }, [seconds, thresholds]);

  if (variant === 'compact') {
    return (
      <span className={cn("text-xs font-mono", statusColor, className)}>
        {formatted}
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-1 text-sm", statusColor, className)}>
      {showIcon && (
        seconds >= (thresholds.critical || TimeThresholds.ONE_WEEK) ? (
          <Hourglass className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        )
      )}
      <span>{formatted}</span>
    </span>
  );
}

interface StatusWithTimeProps {
  status: string;
  secondsInStatus: number;
  className?: string;
  onClick?: () => void;
}

export function StatusWithTime({ status, secondsInStatus, className, onClick }: StatusWithTimeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-sm font-medium",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors",
        className
      )}
    >
      <span>{status}</span>
      <span className="w-px h-3 bg-secondary-foreground/30" />
      <TimeInStatusDisplay seconds={secondsInStatus} showIcon={false} variant="compact" />
    </button>
  );
}

interface TimeInStatusFilterChipProps {
  threshold: number;
  isActive?: boolean;
  count?: number;
  onClick?: () => void;
}

export function TimeInStatusFilterChip({
  threshold,
  isActive,
  count,
  onClick,
}: TimeInStatusFilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{getThresholdLabel(threshold)}</span>
      {count !== undefined && (
        <span className={cn(
          "ml-1 px-1.5 py-0.5 rounded-full text-xs",
          isActive ? "bg-primary-foreground/20" : "bg-secondary-foreground/20"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
