import { Request, Response } from 'express';
import * as gitReviewService from '../services/gitReview.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    username: string;
    profilePictureUrl?: string;
    organizationId: number;
  };
}

// ==================== REVIEW STATE ====================

export async function getReviewState(req: AuthenticatedRequest, res: Response) {
  try {
    const { taskId, prId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const state = await gitReviewService.getReviewState(
      parseInt(taskId),
      parseInt(prId),
      userId
    );

    res.json({ success: true, state });
  } catch (error) {
    console.error('Error getting review state:', error);
    res.status(500).json({ success: false, error: 'Failed to get review state' });
  }
}

export async function saveReviewState(req: AuthenticatedRequest, res: Response) {
  try {
    const { taskId, prId } = req.params;
    const { state } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username || '';
    const profilePictureUrl = req.user?.profilePictureUrl || null;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const savedState = await gitReviewService.saveReviewState(
      parseInt(taskId),
      parseInt(prId),
      userId,
      username,
      profilePictureUrl,
      state
    );

    res.json({ success: true, state: savedState });
  } catch (error) {
    console.error('Error saving review state:', error);
    res.status(500).json({ success: false, error: 'Failed to save review state' });
  }
}

export async function deleteReviewState(req: AuthenticatedRequest, res: Response) {
  try {
    const { taskId, prId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await gitReviewService.deleteReviewState(parseInt(taskId), parseInt(prId), userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting review state:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review state' });
  }
}

// ==================== DIFF ====================

export async function getPRDiff(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const diff = await gitReviewService.getPRDiff(parseInt(prId));

    res.json({ success: true, diff });
  } catch (error) {
    console.error('Error getting PR diff:', error);
    res.status(500).json({ success: false, error: 'Failed to get PR diff' });
  }
}

// ==================== COMMENTS ====================

export async function getInlineComments(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const comments = await gitReviewService.getInlineComments(parseInt(prId));

    res.json({ success: true, comments });
  } catch (error) {
    console.error('Error getting inline comments:', error);
    res.status(500).json({ success: false, error: 'Failed to get inline comments' });
  }
}

export async function createInlineComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const { filePath, lineNumber, text, commitId, replyToId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const comment = await gitReviewService.createInlineComment(
      parseInt(prId),
      userId,
      { prId: parseInt(prId), filePath, lineNumber, text, commitId, replyToId }
    );

    res.json({ success: true, comment });
  } catch (error) {
    console.error('Error creating inline comment:', error);
    res.status(500).json({ success: false, error: 'Failed to create inline comment' });
  }
}

export async function updateInlineComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const comment = await gitReviewService.updateInlineComment(
      parseInt(commentId),
      userId,
      text
    );

    res.json({ success: true, comment });
  } catch (error) {
    console.error('Error updating inline comment:', error);
    res.status(500).json({ success: false, error: 'Failed to update inline comment' });
  }
}

export async function deleteInlineComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await gitReviewService.deleteInlineComment(parseInt(commentId), userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting inline comment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete inline comment' });
  }
}

export async function resolveInlineComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const comment = await gitReviewService.resolveInlineComment(parseInt(commentId), userId);

    res.json({ success: true, comment });
  } catch (error) {
    console.error('Error resolving inline comment:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve inline comment' });
  }
}

// ==================== REVIEW REQUESTS ====================

export async function getReviewRequests(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const requests = await gitReviewService.getReviewRequests(parseInt(prId));

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error getting review requests:', error);
    res.status(500).json({ success: false, error: 'Failed to get review requests' });
  }
}

export async function getPendingReviewRequests(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const requests = await gitReviewService.getPendingReviewRequests(userId);

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error getting pending review requests:', error);
    res.status(500).json({ success: false, error: 'Failed to get pending review requests' });
  }
}

export async function createReviewRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const { taskId, requestedFromUserId, message, dueDate } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const request = await gitReviewService.createReviewRequest(
      parseInt(prId),
      taskId,
      userId,
      requestedFromUserId,
      message,
      dueDate
    );

    res.json({ success: true, request });
  } catch (error) {
    console.error('Error creating review request:', error);
    res.status(500).json({ success: false, error: 'Failed to create review request' });
  }
}

export async function respondToReviewRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const { accept, message } = req.body;

    const request = await gitReviewService.respondToReviewRequest(
      parseInt(requestId),
      accept,
      message
    );

    res.json({ success: true, request });
  } catch (error) {
    console.error('Error responding to review request:', error);
    res.status(500).json({ success: false, error: 'Failed to respond to review request' });
  }
}

// ==================== AI REVIEW ====================

export async function getAIReviewResults(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const reviews = await gitReviewService.getAIReviewResults(parseInt(prId));

    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error getting AI review results:', error);
    res.status(500).json({ success: false, error: 'Failed to get AI review results' });
  }
}

export async function startAIReview(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const { agentId, checkSecurity, checkPerformance, checkBestPractices } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get agent details if agentId provided
    let agentName = 'Default AI Agent';
    if (agentId) {
      const agent = await prisma.aIAgent.findUnique({
        where: { id: agentId },
      });
      if (agent) {
        agentName = agent.name;
      }
    }

    const review = await gitReviewService.startAIReview(
      parseInt(prId),
      agentId || 1,
      agentName,
      { checkSecurity, checkPerformance, checkBestPractices }
    );

    res.json({ success: true, review });
  } catch (error) {
    console.error('Error starting AI review:', error);
    res.status(500).json({ success: false, error: 'Failed to start AI review' });
  }
}

// ==================== SUMMARY ====================

export async function getPRReviewSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const { prId } = req.params;
    const { taskId } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!taskId) {
      return res.status(400).json({ success: false, error: 'taskId is required' });
    }

    const summary = await gitReviewService.getPRReviewSummary(
      parseInt(prId),
      parseInt(taskId as string),
      userId
    );

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error getting PR review summary:', error);
    res.status(500).json({ success: false, error: 'Failed to get PR review summary' });
  }
}

// ==================== DEFAULT CHECKLIST ====================

export function getDefaultChecklist(req: Request, res: Response) {
  const checklist = gitReviewService.getDefaultChecklist();
  res.json({ success: true, checklist });
}
