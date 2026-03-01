import { Router } from "express";
import {
  getTaskStatusHistoryController,
  getTaskStatusTimeBreakdownController,
  getProjectStatusTimeAnalyticsController,
  initializeTaskStatusHistoryController,
  recordStatusChangeController,
} from "../controllers/timeInStatusController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Task status history routes
router.get(
  "/tasks/:taskId/status-history",
  authenticateToken,
  getTaskStatusHistoryController
);

router.get(
  "/tasks/:taskId/status-time-breakdown",
  authenticateToken,
  getTaskStatusTimeBreakdownController
);

// Initialize status history for a new task (called by main API when task is created)
router.post(
  "/tasks/:taskId/status-history",
  authenticateToken,
  initializeTaskStatusHistoryController
);

// Record a status change (called by main API when task status is updated)
router.post(
  "/tasks/:taskId/status-change",
  authenticateToken,
  recordStatusChangeController
);

// Project status analytics route
router.get(
  "/projects/:projectId/status-time-analytics",
  authenticateToken,
  getProjectStatusTimeAnalyticsController
);

export default router;
