import { Request, Response } from "express";
import {
  validateFilterStructure,
  applyAdvancedFilter,
  convertLegacyFilter,
  getFilterMetadata as getFilterMetadataService,
  prisma,
} from "../services/advancedFilter.service";
import { AdvancedTaskFilter, FilterPaginationOptions } from "../types/filter.types";

/**
 * Apply advanced filters and return matching tasks with pagination
 * POST /api/tasks/advanced-filter
 */
export async function filterTasks(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    
    if (!user || !user.organizationId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated or no organization",
      });
      return;
    }

    const { filter, options } = req.body as {
      filter: AdvancedTaskFilter;
      options?: FilterPaginationOptions;
    };

    // Validate filter structure
    const validation = validateFilterStructure(filter);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    // Apply filter
    const result = await applyAdvancedFilter(filter, user.organizationId, options);
    
    res.json(result);
  } catch (error) {
    console.error("Error applying advanced filter:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * Validate a filter structure without executing it
 * POST /api/tasks/advanced-filter/validate
 */
export async function validateFilter(req: Request, res: Response): Promise<void> {
  try {
    const { filter } = req.body as { filter: AdvancedTaskFilter };

    if (!filter) {
      res.status(400).json({
        valid: false,
        error: "Filter is required",
      });
      return;
    }

    const validation = validateFilterStructure(filter);
    
    if (validation.valid) {
      res.json({
        valid: true,
        message: validation.message || "Filter structure is valid",
      });
    } else {
      res.status(400).json({
        valid: false,
        error: validation.error,
      });
    }
  } catch (error) {
    console.error("Error validating filter:", error);
    res.status(500).json({
      valid: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * Convert legacy filter format to advanced filter format
 * POST /api/tasks/advanced-filter/convert
 */
export async function convertFilter(req: Request, res: Response): Promise<void> {
  try {
    const { legacyFilter } = req.body as { legacyFilter: Record<string, unknown> };

    if (!legacyFilter || typeof legacyFilter !== "object") {
      res.status(400).json({
        success: false,
        error: "Legacy filter object is required",
      });
      return;
    }

    const advancedFilter = convertLegacyFilter(legacyFilter);

    res.json({
      success: true,
      legacyFilter,
      advancedFilter,
    });
  } catch (error) {
    console.error("Error converting filter:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * Get filter metadata including available fields, operators, and values
 * GET /api/tasks/filter-metadata
 */
export async function getFilterMetadata(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    
    if (!user || !user.organizationId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated or no organization",
      });
      return;
    }

    const metadata = await getFilterMetadataService(user.organizationId);

    res.json({
      success: true,
      metadata,
    });
  } catch (error) {
    console.error("Error getting filter metadata:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * Apply a saved view's filters to get matching tasks
 * POST /api/saved-views/:viewId/apply
 */
export async function applySavedView(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    
    if (!user || !user.organizationId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated or no organization",
      });
      return;
    }

    const { viewId } = req.params;
    const { options } = req.body as { options?: FilterPaginationOptions };

    // Fetch the saved view from database
    const savedView = await prisma.savedView.findFirst({
      where: {
        id: parseInt(viewId, 10),
        OR: [
          { ownerId: user.userId },
          { isShared: true },
        ],
        organizationId: user.organizationId,
      },
    });

    if (!savedView) {
      res.status(404).json({
        success: false,
        error: "Saved view not found or access denied",
      });
      return;
    }

    // Parse the filter from the saved view
    let filter: AdvancedTaskFilter;
    try {
      filter = typeof savedView.filters === "string" 
        ? JSON.parse(savedView.filters) 
        : savedView.filters;
    } catch {
      res.status(400).json({
        success: false,
        error: "Invalid filter format in saved view",
      });
      return;
    }

    // Validate filter structure
    const validation = validateFilterStructure(filter);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: `Invalid filter in saved view: ${validation.error}`,
      });
      return;
    }

    // Apply filter
    const result = await applyAdvancedFilter(filter, user.organizationId, options);

    res.json({
      success: true,
      view: {
        id: savedView.id,
        name: savedView.name,
        isDefault: savedView.isDefault,
        isShared: savedView.isShared,
      },
      tasks: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error applying saved view:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export default {
  filterTasks,
  validateFilter,
  convertFilter,
  getFilterMetadata,
  applySavedView,
};
