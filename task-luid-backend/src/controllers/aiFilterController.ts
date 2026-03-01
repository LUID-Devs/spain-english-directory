import { Request, Response } from "express";
import {
  parseNaturalLanguageQuery,
  convertToAdvancedFilter,
  hasFilterPatterns,
  getNaturalLanguageSuggestions,
  ParseContext,
  ParsedSearchFilter,
} from "../services/aiFilter.service";

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// Track AI credits per user (in production, use database)
const userCredits = new Map<string, { used: number; remaining: number }>();
const DEFAULT_CREDITS = 50;

/**
 * Check rate limit for a user
 */
function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new window
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT - userLimit.count };
}

/**
 * Get or initialize user credits
 */
function getUserCredits(userId: string): { used: number; remaining: number } {
  if (!userCredits.has(userId)) {
    userCredits.set(userId, { used: 0, remaining: DEFAULT_CREDITS });
  }
  return userCredits.get(userId)!;
}

/**
 * Deduct credits for AI parsing
 */
function deductCredits(userId: string, amount: number = 1): { used: number; remaining: number } | null {
  const credits = getUserCredits(userId);
  
  if (credits.remaining < amount) {
    return null;
  }
  
  credits.used += amount;
  credits.remaining -= amount;
  userCredits.set(userId, credits);
  
  return credits;
}

/**
 * POST /api/ai/parse-search-filter
 * Parse a natural language search query into structured filter criteria
 */
export async function parseSearchFilter(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    
    if (!user || !user.userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated",
      });
      return;
    }
    
    const userId = String(user.userId);
    
    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(RATE_WINDOW / 1000),
      });
      return;
    }
    
    const { text, availableProjects, availableLabels, teamMembers } = req.body as {
      text: string;
      availableProjects?: string[];
      availableLabels?: string[];
      teamMembers?: string[];
    };
    
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Text is required and must be a non-empty string",
      });
      return;
    }
    
    // Check if query is too long
    if (text.length > 500) {
      res.status(400).json({
        success: false,
        error: "Query is too long. Maximum length is 500 characters.",
      });
      return;
    }
    
    // Check if the query has any filter patterns
    if (!hasFilterPatterns(text)) {
      // Return a response with low confidence but don't fail
      const result: ParsedSearchFilter = {
        query: text.trim(),
        filters: {},
        confidence: {
          overall: 0.1,
          status: 0,
          priority: 0,
          assignee: 0,
          date: 0,
        },
      };
      
      res.json({
        success: true,
        data: result,
        warning: "No filter patterns detected in query. Try using keywords like 'high priority', 'in progress', or 'due this week'.",
        creditsUsed: 0,
        remainingCredits: getUserCredits(userId).remaining,
      });
      return;
    }
    
    // Deduct credits
    const credits = deductCredits(userId, 1);
    if (!credits) {
      res.status(402).json({
        success: false,
        error: "Insufficient AI credits. Please upgrade your plan.",
        creditsUsed: 0,
        remainingCredits: 0,
      });
      return;
    }
    
    // Build context
    const context: ParseContext = {
      availableProjects,
      availableLabels,
      teamMembers,
      currentUserId: user.userId,
    };
    
    // Parse the natural language query
    const parsedResult = parseNaturalLanguageQuery(text, context);
    
    // Convert to advanced filter format for potential use
    const advancedFilter = convertToAdvancedFilter(parsedResult);
    
    res.json({
      success: true,
      data: parsedResult,
      advancedFilter,
      creditsUsed: 1,
      remainingCredits: credits.remaining,
      rateLimit: {
        remaining: rateLimit.remaining,
        window: '1 hour',
      },
    });
  } catch (error) {
    console.error("Error parsing search filter:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * GET /api/ai/suggestions
 * Get suggestions for natural language queries
 */
export async function getSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated",
      });
      return;
    }
    
    const { availableProjects, teamMembers } = req.query as {
      availableProjects?: string;
      teamMembers?: string;
    };
    
    const context: ParseContext = {
      availableProjects: availableProjects?.split(','),
      teamMembers: teamMembers?.split(','),
    };
    
    const suggestions = getNaturalLanguageSuggestions(context);
    
    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * GET /api/ai/credits
 * Get user's AI credit balance
 */
export async function getCredits(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    
    if (!user || !user.userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated",
      });
      return;
    }
    
    const credits = getUserCredits(String(user.userId));
    
    res.json({
      success: true,
      credits: {
        used: credits.used,
        remaining: credits.remaining,
        total: DEFAULT_CREDITS,
      },
    });
  } catch (error) {
    console.error("Error getting credits:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * POST /api/ai/validate-query
 * Validate a natural language query without using credits
 */
export async function validateQuery(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated",
      });
      return;
    }
    
    const { text } = req.body as { text: string };
    
    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: "Text is required",
      });
      return;
    }
    
    const hasPatterns = hasFilterPatterns(text);
    const wouldUseCredits = hasPatterns;
    
    res.json({
      success: true,
      valid: hasPatterns,
      wouldUseCredits,
      suggestions: hasPatterns ? [] : [
        "Try phrases like 'my high priority tasks'",
        "Use 'due this week' for date filtering",
        "Say 'assigned to me' for personal tasks",
      ],
    });
  } catch (error) {
    console.error("Error validating query:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export default {
  parseSearchFilter,
  getSuggestions,
  getCredits,
  validateQuery,
};
