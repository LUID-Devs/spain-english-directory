import { Router } from "express";
import {
  filterTasks,
  validateFilter,
  convertFilter,
  getFilterMetadata,
  applySavedView,
} from "../controllers/advancedFilterController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/tasks/advanced-filter
 * Apply advanced filters with AND/OR logic to tasks
 */
router.post("/tasks/advanced-filter", filterTasks);

/**
 * POST /api/tasks/advanced-filter/validate
 * Validate a filter structure without executing it
 */
router.post("/tasks/advanced-filter/validate", validateFilter);

/**
 * POST /api/tasks/advanced-filter/convert
 * Convert legacy filter format to advanced filter format
 */
router.post("/tasks/advanced-filter/convert", convertFilter);

/**
 * GET /api/tasks/filter-metadata
 * Get metadata for building filters (available fields, operators, etc.)
 */
router.get("/tasks/filter-metadata", getFilterMetadata);

/**
 * POST /api/saved-views/:viewId/apply
 * Apply a saved view's filters to get matching tasks
 */
router.post("/saved-views/:viewId/apply", applySavedView);

export default router;
