import { PrismaClient } from "@prisma/client";
import {
  TaskStatusHistory,
  StatusTimeBreakdown,
  StatusTimeBreakdownResponse,
  ProjectStatusAnalyticsItem,
  ProjectStatusTimeAnalyticsResponse,
  RecordStatusChangeRequest,
  RecordStatusChangeResponse,
} from "../types/timeInStatus.types";

export const prisma = new PrismaClient();

/**
 * Record a status change for a task
 * Closes the previous status entry and creates a new one
 */
export async function recordStatusChange(
  request: RecordStatusChangeRequest
): Promise<RecordStatusChangeResponse> {
  try {
    const { taskId, newStatus, userId, organizationId, changedAt } = request;
    const now = changedAt || new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Find and close the current open status entry for this task
      const currentEntry = await tx.taskStatusHistory.findFirst({
        where: {
          taskId,
          exitedAt: null,
        },
        orderBy: {
          enteredAt: "desc",
        },
      });

      let closedPreviousEntry = false;

      if (currentEntry) {
        // Calculate duration
        const durationSeconds = Math.floor(
          (now.getTime() - currentEntry.enteredAt.getTime()) / 1000
        );

        // Close the current entry
        await tx.taskStatusHistory.update({
          where: { id: currentEntry.id },
          data: {
            exitedAt: now,
            durationSeconds,
          },
        });
        closedPreviousEntry = true;
      }

      // Create new entry for the new status
      const newEntry = await tx.taskStatusHistory.create({
        data: {
          taskId,
          status: newStatus,
          enteredAt: now,
          enteredByUserId: userId || null,
          organizationId,
        },
        include: {
          enteredBy: {
            select: {
              userId: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        historyEntry: newEntry as TaskStatusHistory,
        closedPreviousEntry,
      };
    });

    return {
      success: true,
      historyEntry: result.historyEntry,
      closedPreviousEntry: result.closedPreviousEntry,
    };
  } catch (error) {
    console.error("Error recording status change:", error);
    return {
      success: false,
      error: "Failed to record status change",
    };
  }
}

/**
 * Initialize status history for a new task
 * Creates the first entry with the task's initial status
 */
export async function initializeTaskStatusHistory(
  taskId: number,
  status: string,
  organizationId: number,
  userId?: number
): Promise<RecordStatusChangeResponse> {
  try {
    const entry = await prisma.taskStatusHistory.create({
      data: {
        taskId,
        status,
        enteredAt: new Date(),
        enteredByUserId: userId || null,
        organizationId,
      },
      include: {
        enteredBy: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      historyEntry: entry as TaskStatusHistory,
      closedPreviousEntry: false,
    };
  } catch (error) {
    console.error("Error initializing task status history:", error);
    return {
      success: false,
      error: "Failed to initialize task status history",
    };
  }
}

/**
 * Get status history for a task
 */
export async function getTaskStatusHistory(
  taskId: number,
  organizationId: number
): Promise<TaskStatusHistory[]> {
  const history = await prisma.taskStatusHistory.findMany({
    where: {
      taskId,
      organizationId,
    },
    include: {
      enteredBy: {
        select: {
          userId: true,
          username: true,
          email: true,
        },
      },
    },
    orderBy: {
      enteredAt: "desc",
    },
  });

  return history as TaskStatusHistory[];
}

/**
 * Calculate time breakdown for each status
 */
function calculateStatusBreakdown(
  history: TaskStatusHistory[]
): StatusTimeBreakdown[] {
  const statusMap = new Map<string, StatusTimeBreakdown>();

  for (const entry of history) {
    const existing = statusMap.get(entry.status);

    // Calculate duration for this entry
    let durationSeconds = entry.durationSeconds || 0;
    if (!entry.exitedAt && entry.durationSeconds === null) {
      // Current status - calculate duration from enteredAt to now
      durationSeconds = Math.floor(
        (new Date().getTime() - new Date(entry.enteredAt).getTime()) / 1000
      );
    }

    if (existing) {
      existing.totalSeconds += durationSeconds;
      existing.entryCount += 1;
      // Update first entered if this is earlier
      if (new Date(entry.enteredAt) < new Date(existing.firstEnteredAt)) {
        existing.firstEnteredAt = entry.enteredAt;
      }
      // Update last exited if this is later
      if (entry.exitedAt) {
        const newExitedAt = new Date(entry.exitedAt);
        if (!existing.lastExitedAt || newExitedAt > new Date(existing.lastExitedAt)) {
          existing.lastExitedAt = entry.exitedAt;
        }
      }
    } else {
      statusMap.set(entry.status, {
        status: entry.status,
        totalSeconds: durationSeconds,
        entryCount: 1,
        averageDurationSeconds: durationSeconds,
        firstEnteredAt: entry.enteredAt,
        lastExitedAt: entry.exitedAt || null,
      });
    }
  }

  // Calculate averages
  const breakdowns = Array.from(statusMap.values());
  for (const breakdown of breakdowns) {
    breakdown.averageDurationSeconds = Math.floor(
      breakdown.totalSeconds / breakdown.entryCount
    );
  }

  return breakdowns.sort((a, b) => b.totalSeconds - a.totalSeconds);
}

/**
 * Get time breakdown for each status for a task
 */
export async function getTaskStatusTimeBreakdown(
  taskId: number,
  organizationId: number
): Promise<StatusTimeBreakdownResponse | null> {
  // Verify task exists and belongs to organization
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    select: { id: true, status: true },
  });

  if (!task) {
    return null;
  }

  const history = await getTaskStatusHistory(taskId, organizationId);

  if (history.length === 0) {
    return {
      success: true,
      taskId,
      currentStatus: task.status,
      currentStatusSince: new Date().toISOString(),
      timeInCurrentStatusSeconds: 0,
      breakdown: [],
      totalTrackedSeconds: 0,
    };
  }

  const breakdown = calculateStatusBreakdown(history);

  // Find current status entry
  const currentEntry = history.find((h) => h.exitedAt === null);
  const currentStatusSince = currentEntry
    ? currentEntry.enteredAt
    : history[0].enteredAt;
  const timeInCurrentStatusSeconds = currentEntry
    ? Math.floor(
        (new Date().getTime() - new Date(currentEntry.enteredAt).getTime()) / 1000
      )
    : 0;

  const totalTrackedSeconds = breakdown.reduce(
    (sum, b) => sum + b.totalSeconds,
    0
  );

  return {
    success: true,
    taskId,
    currentStatus: task.status,
    currentStatusSince,
    timeInCurrentStatusSeconds,
    breakdown,
    totalTrackedSeconds,
  };
}

/**
 * Calculate percentiles for an array of numbers
 */
function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return Math.round(sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight);
}

/**
 * Get status time analytics for a project
 */
export async function getProjectStatusTimeAnalytics(
  projectId: number,
  organizationId: number,
  fromDate?: Date,
  toDate?: Date
): Promise<ProjectStatusTimeAnalyticsResponse | null> {
  // Verify project exists and belongs to organization
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true, name: true },
  });

  if (!project) {
    return null;
  }

  // Get all tasks in the project
  const tasks = await prisma.task.findMany({
    where: { projectId, organizationId },
    select: { id: true },
  });

  const taskIds = tasks.map((t) => t.id);

  if (taskIds.length === 0) {
    return {
      success: true,
      projectId,
      periodFrom: fromDate || null,
      periodTo: toDate || null,
      tasksAnalyzed: 0,
      statusBreakdown: [],
    };
  }

  // Build where clause for history query
  const historyWhere: any = {
    taskId: { in: taskIds },
    organizationId,
  };

  if (fromDate || toDate) {
    historyWhere.enteredAt = {};
    if (fromDate) historyWhere.enteredAt.gte = fromDate;
    if (toDate) historyWhere.enteredAt.lte = toDate;
  }

  // Get all status history entries for these tasks
  const history = await prisma.taskStatusHistory.findMany({
    where: historyWhere,
  });

  // Group by status and calculate statistics
  const statusGroups = new Map<string, number[]>();

  for (const entry of history) {
    let durationSeconds = entry.durationSeconds || 0;
    if (!entry.exitedAt && entry.durationSeconds === null) {
      // Current status - calculate duration from enteredAt to now
      durationSeconds = Math.floor(
        (new Date().getTime() - new Date(entry.enteredAt).getTime()) / 1000
      );
    }

    // Only include entries with actual duration
    if (durationSeconds > 0) {
      const existing = statusGroups.get(entry.status);
      if (existing) {
        existing.push(durationSeconds);
      } else {
        statusGroups.set(entry.status, [durationSeconds]);
      }
    }
  }

  // Calculate statistics for each status
  const statusBreakdown: ProjectStatusAnalyticsItem[] = [];

  statusGroups.forEach((durations, status) => {
    const sorted = [...durations].sort((a, b) => a - b);
    const total = sorted.reduce((sum, d) => sum + d, 0);
    const count = sorted.length;

    statusBreakdown.push({
      status,
      taskCount: count,
      totalSeconds: total,
      averageSeconds: Math.floor(total / count),
      medianSeconds: calculatePercentile(sorted, 50),
      minSeconds: sorted[0],
      maxSeconds: sorted[sorted.length - 1],
      p95Seconds: calculatePercentile(sorted, 95),
    });
  });

  // Sort by total time (descending)
  statusBreakdown.sort((a, b) => b.totalSeconds - a.totalSeconds);

  return {
    success: true,
    projectId,
    periodFrom: fromDate || null,
    periodTo: toDate || null,
    tasksAnalyzed: taskIds.length,
    statusBreakdown,
  };
}

/**
 * Close all open status history entries for a task
 * Called when a task is deleted or archived
 */
export async function closeAllStatusHistoryEntries(
  taskId: number,
  organizationId: number
): Promise<void> {
  const now = new Date();

  const openEntries = await prisma.taskStatusHistory.findMany({
    where: {
      taskId,
      organizationId,
      exitedAt: null,
    },
  });

  for (const entry of openEntries) {
    const durationSeconds = Math.floor(
      (now.getTime() - new Date(entry.enteredAt).getTime()) / 1000
    );

    await prisma.taskStatusHistory.update({
      where: { id: entry.id },
      data: {
        exitedAt: now,
        durationSeconds,
      },
    });
  }
}
