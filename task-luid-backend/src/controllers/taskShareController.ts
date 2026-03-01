import { Request, Response } from "express";
import {
  shareTaskWithExternalUser,
  revokeTaskShare,
  listTaskShares,
  getTaskVisibilityInfo,
  getSharedTask,
  listSharedTasks,
} from "../services/taskShare.service";
import {
  ShareTaskRequest,
  RevokeShareRequest,
} from "../types/taskShare.types";

/**
 * Share a task with an external user
 * POST /api/tasks/:taskId/share
 */
export async function shareTask(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Check if user has Enterprise plan (mock check - implement based on your subscription model)
    // For now, we'll allow all authenticated users
    const hasEnterprisePlan = true; // TODO: Check user's subscription tier
    if (!hasEnterprisePlan) {
      res.status(403).json({ success: false, error: "Enterprise plan required for external sharing" });
      return;
    }

    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const data: ShareTaskRequest = req.body;
    if (!data.email || data.email.trim().length === 0) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    const result = await shareTaskWithExternalUser(
      taskId,
      user.organizationId,
      user.userId,
      data
    );

    if (!result.success) {
      const statusCode = result.error?.includes("not found") ? 404 : 400;
      res.status(statusCode).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in shareTask controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * Revoke external access to a task
 * DELETE /api/tasks/:taskId/share/:externalUserId
 */
export async function revokeShare(req: Request, res: Response): Promise<void> {
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

    const externalUserId = parseInt(req.params.externalUserId, 10);
    if (isNaN(externalUserId)) {
      res.status(400).json({ success: false, error: "Invalid external user ID" });
      return;
    }

    const result = await revokeTaskShare(taskId, user.organizationId, externalUserId);

    if (!result.success) {
      const statusCode = result.error?.includes("not found") ? 404 : 400;
      res.status(statusCode).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in revokeShare controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * List all external shares for a task
 * GET /api/tasks/:taskId/shares
 */
export async function getTaskShares(req: Request, res: Response): Promise<void> {
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

    const shares = await listTaskShares(taskId, user.organizationId);
    res.json({ success: true, shares });
  } catch (error) {
    console.error("Error in getTaskShares controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * Get visibility info for a task (shows who has external access)
 * GET /api/tasks/:taskId/visibility
 */
export async function getTaskVisibility(req: Request, res: Response): Promise<void> {
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

    const visibilityInfo = await getTaskVisibilityInfo(taskId, user.organizationId);
    
    if (!visibilityInfo) {
      res.status(404).json({ success: false, error: "Task not found" });
      return;
    }

    res.json({ success: true, visibility: visibilityInfo });
  } catch (error) {
    console.error("Error in getTaskVisibility controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * Get a shared task by access token (for external users)
 * GET /api/shared-tasks/:taskId?token=xxx
 */
export async function getSharedTaskByToken(req: Request, res: Response): Promise<void> {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const token = req.query.token as string;
    if (!token) {
      res.status(400).json({ success: false, error: "Access token required" });
      return;
    }

    const result = await getSharedTask(token, taskId);

    if (!result.success) {
      const statusCode = result.error?.includes("denied") ? 403 : 
                        result.error?.includes("Invalid") ? 401 : 404;
      res.status(statusCode).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in getSharedTaskByToken controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * List all tasks shared with an external user
 * GET /api/shared-tasks?token=xxx
 */
export async function listSharedTasksForExternalUser(req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.token as string;
    if (!token) {
      res.status(400).json({ success: false, error: "Access token required" });
      return;
    }

    const result = await listSharedTasks(token);

    if (!result.success) {
      const statusCode = result.error?.includes("Invalid") ? 401 : 500;
      res.status(statusCode).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in listSharedTasksForExternalUser controller:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

export default {
  shareTask,
  revokeShare,
  getTaskShares,
  getTaskVisibility,
  getSharedTaskByToken,
  listSharedTasksForExternalUser,
};
