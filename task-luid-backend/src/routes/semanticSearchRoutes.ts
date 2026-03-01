import { Router } from "express";
import {
  searchTasks,
  syncTaskEmbeddingsHandler,
  deleteTaskEmbeddingsHandler,
  getSearchSuggestionsHandler,
  getSearchConfig,
} from "../controllers/semanticSearchController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/tasks/search
 * Perform hybrid semantic search (AI + Keyword matching)
 * 
 * Request body:
 * {
 *   query: string - The search query (natural language or keywords)
 *   searchIn?: ["title", "description", "comments"] - Fields to search
 *   filters?: {
 *     projectId?: number
 *     status?: string
 *     priority?: string
 *     authorUserId?: number
 *     assignedUserId?: number
 *     tags?: string[]
 *     dateRange?: { from: string, to: string }
 *   }
 *   page?: number - Page number (default: 1)
 *   limit?: number - Results per page (default: 25, max: 100)
 *   config?: {
 *     semanticWeight?: number (0-1, default: 0.7)
 *     keywordWeight?: number (0-1, default: 0.3)
 *     minScore?: number (0-1, default: 0.3)
 *   }
 * }
 */
router.post("/tasks/search", searchTasks);

/**
 * POST /api/tasks/:taskId/sync-embeddings
 * Sync (create/update) embeddings for a task
 * Called when task content changes
 */
router.post("/tasks/:taskId/sync-embeddings", syncTaskEmbeddingsHandler);

/**
 * DELETE /api/tasks/:taskId/embeddings
 * Delete embeddings for a task
 */
router.delete("/tasks/:taskId/embeddings", deleteTaskEmbeddingsHandler);

/**
 * GET /api/search/suggestions?q={query}
 * Get search suggestions based on partial query
 */
router.get("/search/suggestions", getSearchSuggestionsHandler);

/**
 * GET /api/search/config
 * Get hybrid search configuration and feature flags
 */
router.get("/search/config", getSearchConfig);

export default router;
