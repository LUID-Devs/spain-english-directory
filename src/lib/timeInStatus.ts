/**
 * Time in Status - Types and utilities for tracking task status history
 */

import { Task, Status } from '@/services/apiService';

/**
 * Represents a single status history entry for a task
 */
export interface TaskStatusHistory {
  id: number;
  taskId: number;
  status: string;
  enteredAt: string;
  exitedAt?: string | null;
  durationSeconds?: number | null;
  enteredByUserId?: number | null;
  enteredBy?: {
    userId: number;
    username: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Aggregated time spent in each status
 */
export interface StatusTimeBreakdown {
  status: string;
  totalSeconds: number;
  totalDuration: string; // Human readable format
  entryCount: number;
  firstEnteredAt: string;
  lastExitedAt?: string;
  averageDurationSeconds: number;
}

/**
 * Complete time analytics for a task
 */
export interface TaskTimeAnalytics {
  taskId: number;
  currentStatus: string;
  currentStatusSince: string;
  timeInCurrentStatus: string;
  statusHistory: TaskStatusHistory[];
  breakdown: StatusTimeBreakdown[];
  totalTrackedTime: string;
}

/**
 * Filter options for time-based queries
 */
export interface TimeInStatusFilter {
  status?: string;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  fromDate?: string;
  toDate?: string;
}

/**
 * Format seconds into human-readable duration
 * e.g., 3665 -> "1h 1m 5s", 86400 -> "1d 0h 0m"
 */
export function formatDuration(seconds: number, compact: boolean = false): string {
  if (seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (compact) {
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Format duration for display in lists/tables (compact with 2 parts max)
 * e.g., 3665 -> "1h 1m", 90061 -> "1d 1h"
 */
export function formatDurationShort(seconds: number): string {
  if (seconds < 0) return '0s';
  if (seconds === 0) return '<1s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return '<1m';
}

/**
 * Calculate time breakdown from status history
 */
export function calculateStatusTimeBreakdown(
  history: TaskStatusHistory[]
): StatusTimeBreakdown[] {
  const breakdownMap = new Map<string, StatusTimeBreakdown>();
  
  for (const entry of history) {
    const duration = entry.durationSeconds || 0;
    const existing = breakdownMap.get(entry.status);
    
    if (existing) {
      existing.totalSeconds += duration;
      existing.entryCount += 1;
      existing.averageDurationSeconds = existing.totalSeconds / existing.entryCount;
      if (entry.exitedAt && (!existing.lastExitedAt || entry.exitedAt > existing.lastExitedAt)) {
        existing.lastExitedAt = entry.exitedAt;
      }
      if (entry.enteredAt < existing.firstEnteredAt) {
        existing.firstEnteredAt = entry.enteredAt;
      }
    } else {
      breakdownMap.set(entry.status, {
        status: entry.status,
        totalSeconds: duration,
        totalDuration: formatDuration(duration),
        entryCount: 1,
        firstEnteredAt: entry.enteredAt,
        lastExitedAt: entry.exitedAt || undefined,
        averageDurationSeconds: duration,
      });
    }
  }
  
  // Update formatted durations after aggregation
  for (const item of breakdownMap.values()) {
    item.totalDuration = formatDuration(item.totalSeconds);
  }
  
  // Sort by total time descending
  return Array.from(breakdownMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);
}

/**
 * Calculate current time in status for a task
 */
export function calculateCurrentTimeInStatus(
  task: Task,
  statusHistory: TaskStatusHistory[]
): { currentStatusSince: string; timeInCurrentStatus: number; timeInCurrentStatusFormatted: string } | null {
  const currentStatus = task.status;
  if (!currentStatus) return null;
  
  // Find the most recent entry for the current status that hasn't been exited
  const currentEntry = statusHistory
    .filter(h => h.status === currentStatus && !h.exitedAt)
    .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())[0];
  
  if (!currentEntry) {
    // Fallback to task updatedAt if no history
    return {
      currentStatusSince: task.updatedAt || task.createdAt || new Date().toISOString(),
      timeInCurrentStatus: 0,
      timeInCurrentStatusFormatted: 'Unknown',
    };
  }
  
  const enteredAt = new Date(currentEntry.enteredAt).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - enteredAt) / 1000);
  
  return {
    currentStatusSince: currentEntry.enteredAt,
    timeInCurrentStatus: seconds,
    timeInCurrentStatusFormatted: formatDurationShort(seconds),
  };
}

/**
 * Get total tracked time across all statuses
 */
export function getTotalTrackedTime(breakdown: StatusTimeBreakdown[]): string {
  const total = breakdown.reduce((sum, item) => sum + item.totalSeconds, 0);
  return formatDuration(total);
}

/**
 * Compare function for sorting tasks by time in status
 */
export function compareByTimeInStatus(
  a: { timeInCurrentStatusSeconds?: number },
  b: { timeInCurrentStatusSeconds?: number },
  order: 'asc' | 'desc' = 'desc'
): number {
  const aTime = a.timeInCurrentStatusSeconds || 0;
  const bTime = b.timeInCurrentStatusSeconds || 0;
  return order === 'asc' ? aTime - bTime : bTime - aTime;
}

/**
 * Check if a task has been in a status longer than a threshold
 */
export function isInStatusLongerThan(
  task: Task,
  statusHistory: TaskStatusHistory[],
  thresholdSeconds: number
): boolean {
  const current = calculateCurrentTimeInStatus(task, statusHistory);
  if (!current) return false;
  return current.timeInCurrentStatus >= thresholdSeconds;
}

/**
 * Common thresholds for filtering
 */
export const TimeThresholds = {
  ONE_HOUR: 3600,
  FOUR_HOURS: 14400,
  EIGHT_HOURS: 28800,
  ONE_DAY: 86400,
  THREE_DAYS: 259200,
  ONE_WEEK: 604800,
  TWO_WEEKS: 1209600,
  ONE_MONTH: 2592000,
} as const;

/**
 * Get filter label for threshold
 */
export function getThresholdLabel(seconds: number): string {
  switch (seconds) {
    case TimeThresholds.ONE_HOUR: return '> 1 hour';
    case TimeThresholds.FOUR_HOURS: return '> 4 hours';
    case TimeThresholds.EIGHT_HOURS: return '> 8 hours';
    case TimeThresholds.ONE_DAY: return '> 1 day';
    case TimeThresholds.THREE_DAYS: return '> 3 days';
    case TimeThresholds.ONE_WEEK: return '> 1 week';
    case TimeThresholds.TWO_WEEKS: return '> 2 weeks';
    case TimeThresholds.ONE_MONTH: return '> 1 month';
    default: return `> ${formatDurationShort(seconds)}`;
  }
}
