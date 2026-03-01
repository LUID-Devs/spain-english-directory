import { PrismaClient } from '@prisma/client';
import { 
  PRReviewState, 
  PRDiff, 
  PRDiffFile, 
  InlineComment, 
  PRReviewRequest,
  AIReviewResult,
  PRReviewSummary 
} from '../types/gitReview.types';

const prisma = new PrismaClient();

// ==================== REVIEW STATE ====================

export async function getReviewState(
  taskId: number, 
  prId: number,
  userId: number
): Promise<PRReviewState | null> {
  const review = await prisma.pRReview.findUnique({
    where: {
      taskId_prId_userId: {
        taskId,
        prId,
        userId,
      },
    },
  });

  if (!review) return null;

  return {
    status: review.status as PRReviewState['status'],
    notes: review.notes || '',
    checklist: (review.checklist as Array<{ id: string; label: string; checked: boolean }>) || [],
    reviewedAt: review.reviewedAt?.toISOString(),
    reviewedBy: review.reviewedByUserId ? {
      userId: review.reviewedByUserId,
      username: review.reviewedByUsername || '',
      profilePictureUrl: review.reviewedByProfilePictureUrl || undefined,
    } : undefined,
  };
}

export async function saveReviewState(
  taskId: number,
  prId: number,
  userId: number,
  username: string,
  profilePictureUrl: string | null,
  state: PRReviewState
): Promise<PRReviewState> {
  const review = await prisma.pRReview.upsert({
    where: {
      taskId_prId_userId: {
        taskId,
        prId,
        userId,
      },
    },
    update: {
      status: state.status,
      notes: state.notes,
      checklist: state.checklist as any,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
      reviewedByUsername: username,
      reviewedByProfilePictureUrl: profilePictureUrl,
    },
    create: {
      taskId,
      prId,
      userId,
      status: state.status,
      notes: state.notes,
      checklist: state.checklist as any,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
      reviewedByUsername: username,
      reviewedByProfilePictureUrl: profilePictureUrl,
    },
  });

  return {
    status: review.status as PRReviewState['status'],
    notes: review.notes || '',
    checklist: (review.checklist as Array<{ id: string; label: string; checked: boolean }>) || [],
    reviewedAt: review.reviewedAt?.toISOString(),
    reviewedBy: review.reviewedByUserId ? {
      userId: review.reviewedByUserId,
      username: review.reviewedByUsername || '',
      profilePictureUrl: review.reviewedByProfilePictureUrl || undefined,
    } : undefined,
  };
}

export async function deleteReviewState(
  taskId: number,
  prId: number,
  userId: number
): Promise<void> {
  await prisma.pRReview.deleteMany({
    where: {
      taskId,
      prId,
      userId,
    },
  });
}

// ==================== INLINE COMMENTS ====================

export async function getInlineComments(prId: number): Promise<InlineComment[]> {
  const comments = await prisma.inlineComment.findMany({
    where: { prId },
    include: {
      author: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      replies: {
        include: {
          author: {
            select: {
              userId: true,
              username: true,
              profilePictureUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return comments.map((comment: any) => ({
    id: comment.id,
    prId: comment.prId,
    filePath: comment.filePath,
    lineNumber: comment.lineNumber,
    commitId: comment.commitId || undefined,
    text: comment.text,
    author: {
      userId: comment.author.userId,
      username: comment.author.username || '',
      profilePictureUrl: comment.author.profilePictureUrl || undefined,
    },
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    resolvedAt: comment.resolvedAt?.toISOString(),
    resolvedBy: comment.resolvedBy || undefined,
    replyToId: comment.replyToId || undefined,
    replies: comment.replies?.map((reply: any) => ({
      id: reply.id,
      prId: reply.prId,
      filePath: reply.filePath,
      lineNumber: reply.lineNumber,
      commitId: reply.commitId || undefined,
      text: reply.text,
      author: {
        userId: reply.author.userId,
        username: reply.author.username || '',
        profilePictureUrl: reply.author.profilePictureUrl || undefined,
      },
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
    })),
  }));
}

export async function createInlineComment(
  prId: number,
  userId: number,
  data: Omit<InlineComment, 'id' | 'createdAt' | 'updatedAt' | 'author'>
): Promise<InlineComment> {
  const comment = await prisma.inlineComment.create({
    data: {
      prId,
      authorId: userId,
      filePath: data.filePath,
      lineNumber: data.lineNumber,
      commitId: data.commitId,
      text: data.text,
      replyToId: data.replyToId,
    },
    include: {
      author: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    prId: comment.prId,
    filePath: comment.filePath,
    lineNumber: comment.lineNumber,
    commitId: comment.commitId || undefined,
    text: comment.text,
    author: {
      userId: comment.author.userId,
      username: comment.author.username || '',
      profilePictureUrl: comment.author.profilePictureUrl || undefined,
    },
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export async function updateInlineComment(
  commentId: number,
  userId: number,
  text: string
): Promise<InlineComment> {
  const comment = await prisma.inlineComment.update({
    where: { id: commentId },
    data: { text },
    include: {
      author: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    prId: comment.prId,
    filePath: comment.filePath,
    lineNumber: comment.lineNumber,
    commitId: comment.commitId || undefined,
    text: comment.text,
    author: {
      userId: comment.author.userId,
      username: comment.author.username || '',
      profilePictureUrl: comment.author.profilePictureUrl || undefined,
    },
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export async function deleteInlineComment(commentId: number, userId: number): Promise<void> {
  await prisma.inlineComment.deleteMany({
    where: {
      id: commentId,
      authorId: userId,
    },
  });
}

export async function resolveInlineComment(
  commentId: number,
  userId: number
): Promise<InlineComment> {
  const comment = await prisma.inlineComment.update({
    where: { id: commentId },
    data: {
      resolvedAt: new Date(),
      resolvedBy: userId,
    },
    include: {
      author: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    prId: comment.prId,
    filePath: comment.filePath,
    lineNumber: comment.lineNumber,
    commitId: comment.commitId || undefined,
    text: comment.text,
    author: {
      userId: comment.author.userId,
      username: comment.author.username || '',
      profilePictureUrl: comment.author.profilePictureUrl || undefined,
    },
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    resolvedAt: comment.resolvedAt?.toISOString(),
    resolvedBy: comment.resolvedBy || undefined,
  };
}

// ==================== REVIEW REQUESTS ====================

export async function getReviewRequests(prId: number): Promise<PRReviewRequest[]> {
  const requests = await prisma.pRReviewRequest.findMany({
    where: { prId },
    include: {
      requestedBy: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      requestedFrom: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
    orderBy: { requestedAt: 'desc' },
  });

  return requests.map((req: any) => ({
    id: req.id,
    taskId: req.taskId,
    prId: req.prId,
    requestedBy: {
      userId: req.requestedBy.userId,
      username: req.requestedBy.username || '',
      profilePictureUrl: req.requestedBy.profilePictureUrl || undefined,
    },
    requestedFrom: {
      userId: req.requestedFrom.userId,
      username: req.requestedFrom.username || '',
      profilePictureUrl: req.requestedFrom.profilePictureUrl || undefined,
    },
    requestedAt: req.requestedAt.toISOString(),
    status: req.status as PRReviewRequest['status'],
    message: req.message || undefined,
    dueDate: req.dueDate?.toISOString(),
  }));
}

export async function getPendingReviewRequests(userId: number): Promise<PRReviewRequest[]> {
  const requests = await prisma.pRReviewRequest.findMany({
    where: {
      requestedFromId: userId,
      status: 'pending',
    },
    include: {
      requestedBy: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      requestedFrom: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
    orderBy: { requestedAt: 'desc' },
  });

  return requests.map((req: any) => ({
    id: req.id,
    taskId: req.taskId,
    prId: req.prId,
    requestedBy: {
      userId: req.requestedBy.userId,
      username: req.requestedBy.username || '',
      profilePictureUrl: req.requestedBy.profilePictureUrl || undefined,
    },
    requestedFrom: {
      userId: req.requestedFrom.userId,
      username: req.requestedFrom.username || '',
      profilePictureUrl: req.requestedFrom.profilePictureUrl || undefined,
    },
    requestedAt: req.requestedAt.toISOString(),
    status: req.status as PRReviewRequest['status'],
    message: req.message || undefined,
    dueDate: req.dueDate?.toISOString(),
  }));
}

export async function createReviewRequest(
  prId: number,
  taskId: number,
  requestedById: number,
  requestedFromId: number,
  message?: string,
  dueDate?: string
): Promise<PRReviewRequest> {
  const request = await prisma.pRReviewRequest.create({
    data: {
      prId,
      taskId,
      requestedById,
      requestedFromId,
      message,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending',
      requestedAt: new Date(),
    },
    include: {
      requestedBy: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      requestedFrom: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  return {
    id: request.id,
    taskId: request.taskId,
    prId: request.prId,
    requestedBy: {
      userId: request.requestedBy.userId,
      username: request.requestedBy.username || '',
      profilePictureUrl: request.requestedBy.profilePictureUrl || undefined,
    },
    requestedFrom: {
      userId: request.requestedFrom.userId,
      username: request.requestedFrom.username || '',
      profilePictureUrl: request.requestedFrom.profilePictureUrl || undefined,
    },
    requestedAt: request.requestedAt.toISOString(),
    status: request.status as PRReviewRequest['status'],
    message: request.message || undefined,
    dueDate: request.dueDate?.toISOString(),
  };
}

export async function respondToReviewRequest(
  requestId: number,
  accept: boolean,
  message?: string
): Promise<PRReviewRequest> {
  const request = await prisma.pRReviewRequest.update({
    where: { id: requestId },
    data: {
      status: accept ? 'accepted' : 'declined',
      responseMessage: message,
      respondedAt: new Date(),
    },
    include: {
      requestedBy: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      requestedFrom: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  return {
    id: request.id,
    taskId: request.taskId,
    prId: request.prId,
    requestedBy: {
      userId: request.requestedBy.userId,
      username: request.requestedBy.username || '',
      profilePictureUrl: request.requestedBy.profilePictureUrl || undefined,
    },
    requestedFrom: {
      userId: request.requestedFrom.userId,
      username: request.requestedFrom.username || '',
      profilePictureUrl: request.requestedFrom.profilePictureUrl || undefined,
    },
    requestedAt: request.requestedAt.toISOString(),
    status: request.status as PRReviewRequest['status'],
    message: request.message || undefined,
    dueDate: request.dueDate?.toISOString(),
  };
}

// ==================== AI REVIEW ====================

export async function getAIReviewResults(prId: number): Promise<AIReviewResult[]> {
  const reviews = await prisma.aIReview.findMany({
    where: { prId },
    orderBy: { startedAt: 'desc' },
  });

  return reviews.map((review: any) => ({
    id: review.id,
    prId: review.prId,
    agentId: review.agentId,
    agentName: review.agentName,
    status: review.status as AIReviewResult['status'],
    summary: review.summary,
    findings: review.findings as AIReviewResult['findings'],
    startedAt: review.startedAt.toISOString(),
    completedAt: review.completedAt?.toISOString(),
    errorMessage: review.errorMessage || undefined,
  }));
}

export async function startAIReview(
  prId: number,
  agentId: number,
  agentName: string,
  options?: {
    checkSecurity?: boolean;
    checkPerformance?: boolean;
    checkBestPractices?: boolean;
  }
): Promise<AIReviewResult> {
  const review = await prisma.aIReview.create({
    data: {
      prId,
      agentId,
      agentName,
      status: 'running',
      summary: '',
      findings: [],
      startedAt: new Date(),
      options: options as any,
    },
  });

  return {
    id: review.id,
    prId: review.prId,
    agentId: review.agentId,
    agentName: review.agentName,
    status: review.status as AIReviewResult['status'],
    summary: review.summary,
    findings: review.findings as AIReviewResult['findings'],
    startedAt: review.startedAt.toISOString(),
  };
}

export async function updateAIReview(
  reviewId: number,
  data: {
    status?: AIReviewResult['status'];
    summary?: string;
    findings?: AIReviewResult['findings'];
    errorMessage?: string;
  }
): Promise<AIReviewResult> {
  const review = await prisma.aIReview.update({
    where: { id: reviewId },
    data: {
      ...data,
      completedAt: data.status === 'completed' || data.status === 'failed' ? new Date() : undefined,
    },
  });

  return {
    id: review.id,
    prId: review.prId,
    agentId: review.agentId,
    agentName: review.agentName,
    status: review.status as AIReviewResult['status'],
    summary: review.summary,
    findings: review.findings as AIReviewResult['findings'],
    startedAt: review.startedAt.toISOString(),
    completedAt: review.completedAt?.toISOString(),
    errorMessage: review.errorMessage || undefined,
  };
}

// ==================== DIFF (Mock - would integrate with GitHub/GitLab API) ====================

export async function getPRDiff(prId: number): Promise<PRDiff> {
  // This would fetch from GitHub/GitLab API in production
  // For now, return mock data
  const mockDiff: PRDiff = {
    files: [
      {
        filename: 'src/components/Button.tsx',
        status: 'modified',
        additions: 45,
        deletions: 12,
        changes: 57,
        patch: `@@ -1,10 +1,15 @@
 import React from 'react';
+import { cn } from '@/lib/utils';
 
 interface ButtonProps {
   children: React.ReactNode;
   onClick?: () => void;
+  variant?: 'primary' | 'secondary' | 'ghost';
+  size?: 'sm' | 'md' | 'lg';
+  disabled?: boolean;
+  loading?: boolean;
 }
 
-export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
+export const Button: React.FC<ButtonProps> = ({ 
+  children, 
+  onClick,
+  variant = 'primary',
+  size = 'md',
+  disabled,
+  loading 
+}) => {
   return (
-    <button onClick={onClick}>
+    <button 
+      onClick={onClick}
+      disabled={disabled || loading}
+      className={cn(
+        'rounded-md font-medium transition-colors',
+        variant === 'primary' && 'bg-blue-500 text-white',
+        size === 'sm' && 'px-2 py-1 text-sm',
+      )}
+    >
       {children}
     </button>
   );`,
      },
      {
        filename: 'src/utils/helpers.ts',
        status: 'added',
        additions: 23,
        deletions: 0,
        changes: 23,
        patch: `@@ -0,0 +1,23 @@
+export function formatDate(date: Date): string {
+  return date.toLocaleDateString('en-US', {
+    month: 'short',
+    day: 'numeric',
+    year: 'numeric',
+  });
+}
+
+export function debounce<T extends (...args: any[]) => void>(
+  fn: T,
+  delay: number
+): (...args: Parameters<T>) => void {
+  let timeoutId: ReturnType<typeof setTimeout>;
+  return (...args: Parameters<T>) => {
+    clearTimeout(timeoutId);
+    timeoutId = setTimeout(() => fn(...args), delay);
+  };
+}`,
      },
    ],
    stats: {
      totalAdditions: 68,
      totalDeletions: 12,
      totalChanges: 80,
      fileCount: 2,
    },
  };

  return mockDiff;
}

// ==================== SUMMARY ====================

export async function getPRReviewSummary(
  prId: number,
  taskId: number,
  userId: number
): Promise<PRReviewSummary> {
  const [reviewState, comments, aiReviews] = await Promise.all([
    getReviewState(taskId, prId, userId),
    getInlineComments(prId),
    getAIReviewResults(prId),
  ]);

  const unresolvedComments = comments.filter((c) => !c.resolvedAt).length;
  const latestAIReview = aiReviews[0];

  return {
    prId,
    reviewState,
    commentCount: comments.length,
    unresolvedComments,
    hasDiffView: true,
    aiReviewStatus: latestAIReview?.status,
    lastUpdatedAt: new Date().toISOString(),
  };
}

// ==================== DEFAULT CHECKLIST ====================

export function getDefaultChecklist(): Array<{ id: string; label: string; checked: boolean }> {
  return [
    { id: 'code-quality', label: 'Code quality meets standards', checked: false },
    { id: 'tests', label: 'Tests included and passing', checked: false },
    { id: 'documentation', label: 'Documentation updated if needed', checked: false },
    { id: 'security', label: 'No security concerns identified', checked: false },
    { id: 'performance', label: 'Performance impact considered', checked: false },
  ];
}
