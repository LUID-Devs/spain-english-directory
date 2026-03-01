import { Request, Response } from "express";
import {
  performHybridSearch,
  syncTaskEmbeddings,
  deleteTaskEmbeddings,
  getSearchSuggestions,
} from "../services/semanticSearch.service";
import { SemanticSearchQuery, HybridSearchConfig } from "../types/semanticSearch.types";

/**
 * POST /api/tasks/search
 * Perform hybrid semantic search (AI + Keyword matching)
 */
export async function searchTasks(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const {
      query,
      searchIn = ["title", "description", "comments"],
      filters,
      page = 1,
      limit = 25,
      config,
    } = req.body as {
      query: string;
      searchIn?: Array<"title" | "description" | "comments">;
      filters?: SemanticSearchQuery["filters"];
      page?: number;
      limit?: number;
      config?: Partial<HybridSearchConfig>;
    };

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Query is required and must be a non-empty string",
      });
      return;
    }

    // Validate searchIn
    const validSearchIn = ["title", "description", "comments"];
    const validatedSearchIn = searchIn.filter(s => validSearchIn.includes(s));
    if (validatedSearchIn.length === 0) {
      res.status(400).json({
        success: false,
        error: "At least one search field must be specified",
      });
      return;
    }

    // Validate pagination
    const validatedPage = Math.max(1, parseInt(String(page)) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(String(limit)) || 25));

    // Build search query
    const searchQuery: SemanticSearchQuery = {
      query: query.trim(),
      searchIn: validatedSearchIn,
      filters: filters ? {
        projectId: filters.projectId,
        status: filters.status,
        priority: filters.priority,
        authorUserId: filters.authorUserId,
        assignedUserId: filters.assignedUserId,
        tags: filters.tags,
        dateRange: filters.dateRange ? {
          from: new Date(filters.dateRange.from),
          to: new Date(filters.dateRange.to),
        } : undefined,
      } : undefined,
    };

    // Perform search
    const result = await performHybridSearch(
      searchQuery,
      organizationId,
      validatedPage,
      validatedLimit,
      config
    );

    res.json(result);
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform search",
      details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    });
  }
}

/**
 * POST /api/tasks/:taskId/sync-embeddings
 * Sync embeddings for a task (create/update)
 */
export async function syncTaskEmbeddingsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: "Invalid task ID",
      });
      return;
    }

    await syncTaskEmbeddings(taskId);

    res.json({
      success: true,
      message: "Task embeddings synced successfully",
      taskId,
    });
  } catch (error) {
    console.error("Sync embeddings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync embeddings",
      details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    });
  }
}

/**
 * DELETE /api/tasks/:taskId/embeddings
 * Delete embeddings for a task
 */
export async function deleteTaskEmbeddingsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: "Invalid task ID",
      });
      return;
    }

    await deleteTaskEmbeddings(taskId);

    res.json({
      success: true,
      message: "Task embeddings deleted successfully",
      taskId,
    });
  } catch (error) {
    console.error("Delete embeddings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete embeddings",
      details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    });
  }
}

/**
 * GET /api/search/suggestions
 * Get search suggestions based on query
 */
export async function getSearchSuggestionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const organizationId = (req as any).user?.organizationId;

    if (!userId || !organizationId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const query = req.query.q as string;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.json({
        success: true,
        suggestions: [],
      });
      return;
    }

    const suggestions = await getSearchSuggestions(query.trim(), organizationId, userId);

    res.json({
      success: true,
      query: query.trim(),
      suggestions,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get suggestions",
      details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    });
  }
}

/**
 * GET /api/search/config
 * Get hybrid search configuration
 */
export function getSearchConfig(req: Request, res: Response): void {
  res.json({
    success: true,
    config: {
      semanticWeight: 0.7,
      keywordWeight: 0.3,
      minScore: 0.3,
      vectorDimensions: 384,
      topK: 100,
      similarityThreshold: 0.5,
      maxLimit: 100,
    },
    features: {
      semanticSearch: true,
      keywordSearch: true,
      hybridScoring: true,
      searchInTitle: true,
      searchInDescription: true,
      searchInComments: true,
      highlighting: true,
    },
  });
}
