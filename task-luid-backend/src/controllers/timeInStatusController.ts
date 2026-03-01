import { Request, Response } from "express";
import {
  getTaskStatusHistory,
  getTaskStatusTimeBreakdown,
  getProjectStatusTimeAnalytics,
  initializeTaskStatusHistory,
  recordStatusChange,
} from "../services/timeInStatus.service";

/**
 * Get status history for a task
 * GET /api/tasks/:taskId/status-history
 */
export async function getTaskStatusHistoryController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const history = await getTaskStatusHistory(taskId, user.organizationId);

    res.json({
      success: true,
      taskId,
      history,
    });
  } catch (error) {
    console.error("Error in getTaskStatusHistoryController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Initialize status history for a new task
 * POST /api/tasks/:taskId/status-history
 * Called by main API when a task is created
 */
export async function initializeTaskStatusHistoryController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const { status, userId } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: "Status is required" });
      return;
    }

    const result = await initializeTaskStatusHistory(
      taskId,
      status,
      user.organizationId,
      userId || user.userId
    );

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || "Failed to initialize status history",
      });
      return;
    }

    res.status(201).json({
      success: true,
      taskId,
      historyEntry: result.historyEntry,
    });
  } catch (error) {
    console.error("Error in initializeTaskStatusHistoryController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Record a status change for a task
 * POST /api/tasks/:taskId/status-change
 * Called by main API when task status is updated
 */
export async function recordStatusChangeController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const { newStatus, changedAt } = req.body;
    if (!newStatus) {
      res.status(400).json({ success: false, error: "newStatus is required" });
      return;
    }

    const result = await recordStatusChange({
      taskId,
      newStatus,
      userId: user.userId,
      organizationId: user.organizationId,
      changedAt: changedAt ? new Date(changedAt) : undefined,
    });

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || "Failed to record status change",
      });
      return;
    }

    res.json({
      success: true,
      taskId,
      historyEntry: result.historyEntry,
      closedPreviousEntry: result.closedPreviousEntry,
    });
  } catch (error) {
    console.error("Error in recordStatusChangeController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get time breakdown for each status for a task
 * GET /api/tasks/:taskId/status-time-breakdown
 */
export async function getTaskStatusTimeBreakdownController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const breakdown = await getTaskStatusTimeBreakdown(
      taskId,
      user.organizationId
    );

    if (!breakdown) {
      res.status(404).json({
        success: false,
        error: "Task not found",
      });
      return;
    }

    res.json(breakdown);
  } catch (error) {
    console.error("Error in getTaskStatusTimeBreakdownController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get status time analytics for a project
 * GET /api/projects/:projectId/status-time-analytics
 */
export async function getProjectStatusTimeAnalyticsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    // Parse optional date filters
    const fromDate = req.query.from
      ? new Date(req.query.from as string)
      : undefined;
    const toDate = req.query.to
      ? new Date(req.query.to as string)
      : undefined;

    // Validate dates
    if (fromDate && isNaN(fromDate.getTime())) {
      res.status(400).json({
        success: false,
        error: "Invalid from date",
      });
      return;
    }

    if (toDate && isNaN(toDate.getTime())) {
      res.status(400).json({
        success: false,
        error: "Invalid to date",
      });
      return;
    }

    const analytics = await getProjectStatusTimeAnalytics(
      projectId,
      user.organizationId,
      fromDate,
      toDate
    );

    if (!analytics) {
      res.status(404).json({
        success: false,
        error: "Project not found",
      });
      return;
    }

    res.json(analytics);
  } catch (error) {
    console.error("Error in getProjectStatusTimeAnalyticsController:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export default {
  getTaskStatusHistory: getTaskStatusHistoryController,
  initializeTaskStatusHistory: initializeTaskStatusHistoryController,
  recordStatusChange: recordStatusChangeController,
  getTaskStatusTimeBreakdown: getTaskStatusTimeBreakdownController,
  getProjectStatusTimeAnalytics: getProjectStatusTimeAnalyticsController,
};
