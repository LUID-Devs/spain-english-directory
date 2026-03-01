/**
 * Types for Time in Status feature
 * Tracks how long tasks spend in each status for workflow analytics
 */

/** Task Status History entry - records each time a task enters a status */
export interface TaskStatusHistory {
  id: number;
  taskId: number;
  status: string;
  enteredAt: string | Date;
  exitedAt?: string | Date | null;
  durationSeconds?: number | null;
  enteredByUserId?: number | null;
  enteredBy?: {
    userId: number;
    username: string | null;
    email: string;
  } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** Status time breakdown for a single status */
export interface StatusTimeBreakdown {
  status: string;
  totalSeconds: number;
  entryCount: number;
  averageDurationSeconds: number;
  firstEnteredAt: string | Date;
  lastExitedAt?: string | Date | null;
}

/** Response for task status time breakdown */
export interface StatusTimeBreakdownResponse {
  success: boolean;
  taskId: number;
  currentStatus: string;
  currentStatusSince: string | Date;
  timeInCurrentStatusSeconds: number;
  breakdown: StatusTimeBreakdown[];
  totalTrackedSeconds: number;
}

/** Project status analytics item */
export interface ProjectStatusAnalyticsItem {
  status: string;
  taskCount: number;
  totalSeconds: number;
  averageSeconds: number;
  medianSeconds: number;
  minSeconds: number;
  maxSeconds: number;
  p95Seconds: number;
}

/** Response for project status time analytics */
export interface ProjectStatusTimeAnalyticsResponse {
  success: boolean;
  projectId: number;
  periodFrom?: string | Date | null;
  periodTo?: string | Date | null;
  tasksAnalyzed: number;
  statusBreakdown: ProjectStatusAnalyticsItem[];
}

/** Filter options for time in status queries */
export interface TimeInStatusFilter {
  status?: string;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  fromDate?: string | Date;
  toDate?: string | Date;
}

/** Request to record a status change */
export interface RecordStatusChangeRequest {
  taskId: number;
  newStatus: string;
  previousStatus?: string;
  userId?: number;
  organizationId: number;
  changedAt?: Date;
}

/** Response for status change recording */
export interface RecordStatusChangeResponse {
  success: boolean;
  historyEntry?: TaskStatusHistory;
  closedPreviousEntry?: boolean;
  error?: string;
}
