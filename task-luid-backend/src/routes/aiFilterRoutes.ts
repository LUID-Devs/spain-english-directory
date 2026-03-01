import { Router } from "express";
import {
  parseSearchFilter,
  getSuggestions,
  getCredits,
  validateQuery,
} from "../controllers/aiFilterController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All AI routes require authentication
router.use(authenticateToken);

/**
 * POST /api/ai/parse-search-filter
 * Parse a natural language search query into structured filter criteria
 * 
 * Request body:
 * {
 *   text: string;
 *   availableProjects?: string[];
 *   availableLabels?: string[];
 *   teamMembers?: string[];
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   data: ParsedSearchFilter;
 *   advancedFilter?: AdvancedTaskFilter;
 *   creditsUsed: number;
 *   remainingCredits: number;
 *   rateLimit?: { remaining: number; window: string };
 * }
 */
router.post("/ai/parse-search-filter", parseSearchFilter);

/**
 * GET /api/ai/suggestions
 * Get example natural language queries for suggestions
 * 
 * Query params:
 * - availableProjects: comma-separated list
 * - teamMembers: comma-separated list
 * 
 * Response:
 * {
 *   success: boolean;
 *   suggestions: string[];
 * }
 */
router.get("/ai/suggestions", getSuggestions);

/**
 * GET /api/ai/credits
 * Get user's AI credit balance
 * 
 * Response:
 * {
 *   success: boolean;
 *   credits: {
 *     used: number;
 *     remaining: number;
 *     total: number;
 *   };
 * }
 */
router.get("/ai/credits", getCredits);

/**
 * POST /api/ai/validate-query
 * Validate a natural language query without using credits
 * 
 * Request body:
 * {
 *   text: string;
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   valid: boolean;
 *   wouldUseCredits: boolean;
 *   suggestions?: string[];
 * }
 */
router.post("/ai/validate-query", validateQuery);

export default router;
