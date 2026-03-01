import { Router } from "express";
import {
  shareTask,
  revokeShare,
  getTaskShares,
  getTaskVisibility,
  getSharedTaskByToken,
  listSharedTasksForExternalUser,
} from "../controllers/taskShareController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Internal routes (require authentication)
router.post("/tasks/:taskId/share", authenticateToken, shareTask);
router.delete("/tasks/:taskId/share/:externalUserId", authenticateToken, revokeShare);
router.get("/tasks/:taskId/shares", authenticateToken, getTaskShares);
router.get("/tasks/:taskId/visibility", authenticateToken, getTaskVisibility);

// External routes (token-based access, no auth required)
router.get("/shared-tasks", listSharedTasksForExternalUser);
router.get("/shared-tasks/:taskId", getSharedTaskByToken);

export default router;
