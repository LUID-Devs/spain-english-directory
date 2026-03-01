/**
 * Enhanced Git Review Service
 * Manages PR review state, diffs, inline comments, and AI agent workflows
 */

import { apiService } from './apiService';

// ==================== TYPES ====================

export interface PRReviewState {
  status: 'pending' | 'reviewing' | 'approved' | 'changes_requested' | 'merged';
  notes: string;
  checklist: Array<{ id: string; label: string; checked: boolean }>;
  reviewedAt?: string;
  reviewedBy?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
}

export interface PRDiffFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied';
  additions: number;
  deletions: number;
  changes: number;
  previousFilename?: string;
  patch?: string;
  content?: string;
  isCollapsed?: boolean;
}

export interface PRDiff {
  files: PRDiffFile[];
  stats: {
    totalAdditions: number;
    totalDeletions: number;
    totalChanges: number;
    fileCount: number;
  };
}

export interface InlineComment {
  id: number;
  prId: number;
  filePath: string;
  lineNumber: number;
  commitId?: string;
  text: string;
  author: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  replyToId?: number;
  replies?: InlineComment[];
}

export interface PRReviewRequest {
  id: number;
  taskId: number;
  prId: number;
  requestedBy: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  requestedFrom: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message?: string;
  dueDate?: string;
}

export interface AIReviewResult {
  id: number;
  prId: number;
  agentId: number;
  agentName: string;
  status: 'running' | 'completed' | 'failed';
  summary: string;
  findings: Array<{
    severity: 'info' | 'warning' | 'error' | 'critical';
    category: string;
    filePath?: string;
    lineNumber?: number;
    message: string;
    suggestion?: string;
  }>;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface PRReviewSummary {
  prId: number;
  reviewState: PRReviewState | null;
  commentCount: number;
  unresolvedComments: number;
  hasDiffView: boolean;
  aiReviewStatus?: 'pending' | 'running' | 'completed' | 'failed';
  lastUpdatedAt: string;
}

// ==================== LOCAL STORAGE FUNCTIONS ====================

const STORAGE_KEY = 'taskluid_pr_reviews';
const DIFF_CACHE_KEY = 'taskluid_pr_diffs';
const COMMENTS_CACHE_KEY = 'taskluid_pr_comments';

/**
 * Get review state for a PR
 */
export function getPRReviewState(taskId: number, prId: number): PRReviewState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    return data[`${taskId}-${prId}`] || null;
  } catch {
    return null;
  }
}

/**
 * Save review state for a PR
 */
export function savePRReviewState(
  taskId: number, 
  prId: number, 
  state: PRReviewState
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    
    data[`${taskId}-${prId}`] = {
      ...state,
      reviewedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save PR review state:', error);
  }
}

/**
 * Delete review state for a PR
 */
export function deletePRReviewState(taskId: number, prId: number): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const data = JSON.parse(stored);
    delete data[`${taskId}-${prId}`];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to delete PR review state:', error);
  }
}

/**
 * Get default checklist items
 */
export function getDefaultChecklist(): Array<{ id: string; label: string; checked: boolean }> {
  return [
    { id: 'code-quality', label: 'Code quality meets standards', checked: false },
    { id: 'tests', label: 'Tests included and passing', checked: false },
    { id: 'documentation', label: 'Documentation updated if needed', checked: false },
    { id: 'security', label: 'No security concerns identified', checked: false },
    { id: 'performance', label: 'Performance impact considered', checked: false },
  ];
}

/**
 * Get all reviews for a task
 */
export function getTaskReviews(taskId: number): Record<string, PRReviewState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const data = JSON.parse(stored);
    const taskReviews: Record<string, PRReviewState> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(`${taskId}-`)) {
        const prId = key.replace(`${taskId}-`, '');
        taskReviews[prId] = value as PRReviewState;
      }
    });
    
    return taskReviews;
  } catch {
    return {};
  }
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch PR diff from backend
 * GET /api/git/pull-requests/:prId/diff
 */
export async function fetchPRDiff(prId: number): Promise<PRDiff> {
  try {
    const response = await apiService.request<{ success: boolean; diff: PRDiff }>(
      `/api/git/pull-requests/${prId}/diff`
    );
    
    // Cache the diff
    cachePRDiff(prId, response.diff);
    
    return response.diff;
  } catch (error) {
    console.error('Failed to fetch PR diff:', error);
    // Return cached diff if available
    const cached = getCachedPRDiff(prId);
    if (cached) return cached;
    throw error;
  }
}

/**
 * Fetch inline comments for a PR
 * GET /api/git/pull-requests/:prId/comments
 */
export async function fetchPRComments(prId: number): Promise<InlineComment[]> {
  try {
    const response = await apiService.request<{ success: boolean; comments: InlineComment[] }>(
      `/api/git/pull-requests/${prId}/comments`
    );
    
    // Cache the comments
    cachePRComments(prId, response.comments);
    
    return response.comments;
  } catch (error) {
    console.error('Failed to fetch PR comments:', error);
    // Return cached comments if available
    const cached = getCachedPRComments(prId);
    if (cached) return cached;
    throw error;
  }
}

/**
 * Add inline comment to a PR
 * POST /api/git/pull-requests/:prId/comments
 */
export async function addInlineComment(
  prId: number,
  comment: Omit<InlineComment, 'id' | 'createdAt' | 'updatedAt' | 'author'>
): Promise<InlineComment> {
  const response = await apiService.request<{ success: boolean; comment: InlineComment }>(
    `/api/git/pull-requests/${prId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(comment),
    }
  );
  
  // Update cache
  const existing = getCachedPRComments(prId) || [];
  cachePRComments(prId, [...existing, response.comment]);
  
  return response.comment;
}

/**
 * Update inline comment
 * PUT /api/git/comments/:commentId
 */
export async function updateInlineComment(
  commentId: number,
  text: string
): Promise<InlineComment> {
  const response = await apiService.request<{ success: boolean; comment: InlineComment }>(
    `/api/git/comments/${commentId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }
  );
  
  return response.comment;
}

/**
 * Delete inline comment
 * DELETE /api/git/comments/:commentId
 */
export async function deleteInlineComment(commentId: number): Promise<void> {
  await apiService.request(`/api/git/comments/${commentId}`, {
    method: 'DELETE',
  });
}

/**
 * Resolve inline comment
 * POST /api/git/comments/:commentId/resolve
 */
export async function resolveInlineComment(commentId: number): Promise<InlineComment> {
  const response = await apiService.request<{ success: boolean; comment: InlineComment }>(
    `/api/git/comments/${commentId}/resolve`,
    { method: 'POST' }
  );
  
  return response.comment;
}

/**
 * Request PR review from a user
 * POST /api/git/pull-requests/:prId/request-review
 */
export async function requestPRReview(
  prId: number,
  requestedFromUserId: number,
  message?: string,
  dueDate?: string
): Promise<PRReviewRequest> {
  const response = await apiService.request<{ success: boolean; request: PRReviewRequest }>(
    `/api/git/pull-requests/${prId}/request-review`,
    {
      method: 'POST',
      body: JSON.stringify({ requestedFromUserId, message, dueDate }),
    }
  );
  
  return response.request;
}

/**
 * Get review requests for a PR
 * GET /api/git/pull-requests/:prId/review-requests
 */
export async function getPRReviewRequests(prId: number): Promise<PRReviewRequest[]> {
  const response = await apiService.request<{ success: boolean; requests: PRReviewRequest[] }>(
    `/api/git/pull-requests/${prId}/review-requests`
  );
  
  return response.requests;
}

/**
 * Get pending review requests for current user
 * GET /api/git/review-requests/pending
 */
export async function getPendingReviewRequests(): Promise<PRReviewRequest[]> {
  const response = await apiService.request<{ success: boolean; requests: PRReviewRequest[] }>(
    '/api/git/review-requests/pending'
  );
  
  return response.requests;
}

/**
 * Respond to review request
 * POST /api/git/review-requests/:requestId/respond
 */
export async function respondToReviewRequest(
  requestId: number,
  accept: boolean,
  message?: string
): Promise<PRReviewRequest> {
  const response = await apiService.request<{ success: boolean; request: PRReviewRequest }>(
    `/api/git/review-requests/${requestId}/respond`,
    {
      method: 'POST',
      body: JSON.stringify({ accept, message }),
    }
  );
  
  return response.request;
}

/**
 * Start AI review for a PR
 * POST /api/git/pull-requests/:prId/ai-review
 */
export async function startAIReview(
  prId: number,
  agentId?: number,
  options?: {
    checkSecurity?: boolean;
    checkPerformance?: boolean;
    checkBestPractices?: boolean;
  }
): Promise<AIReviewResult> {
  const response = await apiService.request<{ success: boolean; review: AIReviewResult }>(
    `/api/git/pull-requests/${prId}/ai-review`,
    {
      method: 'POST',
      body: JSON.stringify({ agentId, options }),
    }
  );
  
  return response.review;
}

/**
 * Get AI review results for a PR
 * GET /api/git/pull-requests/:prId/ai-review
 */
export async function getAIReviewResults(prId: number): Promise<AIReviewResult[]> {
  const response = await apiService.request<{ success: boolean; reviews: AIReviewResult[] }>(
    `/api/git/pull-requests/${prId}/ai-review`
  );
  
  return response.reviews;
}

/**
 * Get PR review summary
 * GET /api/git/pull-requests/:prId/review-summary
 */
export async function getPRReviewSummary(prId: number): Promise<PRReviewSummary> {
  const response = await apiService.request<{ success: boolean; summary: PRReviewSummary }>(
    `/api/git/pull-requests/${prId}/review-summary`
  );
  
  return response.summary;
}

// ==================== CACHING FUNCTIONS ====================

function cachePRDiff(prId: number, diff: PRDiff): void {
  try {
    const stored = localStorage.getItem(DIFF_CACHE_KEY);
    const cache = stored ? JSON.parse(stored) : {};
    cache[prId] = { diff, cachedAt: new Date().toISOString() };
    localStorage.setItem(DIFF_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache PR diff:', error);
  }
}

function getCachedPRDiff(prId: number): PRDiff | null {
  try {
    const stored = localStorage.getItem(DIFF_CACHE_KEY);
    if (!stored) return null;
    
    const cache = JSON.parse(stored);
    const entry = cache[prId];
    
    // Cache expires after 5 minutes
    if (entry && entry.cachedAt) {
      const cachedAt = new Date(entry.cachedAt).getTime();
      const now = Date.now();
      if (now - cachedAt < 5 * 60 * 1000) {
        return entry.diff;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

function cachePRComments(prId: number, comments: InlineComment[]): void {
  try {
    const stored = localStorage.getItem(COMMENTS_CACHE_KEY);
    const cache = stored ? JSON.parse(stored) : {};
    cache[prId] = { comments, cachedAt: new Date().toISOString() };
    localStorage.setItem(COMMENTS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache PR comments:', error);
  }
}

function getCachedPRComments(prId: number): InlineComment[] | null {
  try {
    const stored = localStorage.getItem(COMMENTS_CACHE_KEY);
    if (!stored) return null;
    
    const cache = JSON.parse(stored);
    const entry = cache[prId];
    
    // Cache expires after 2 minutes
    if (entry && entry.cachedAt) {
      const cachedAt = new Date(entry.cachedAt).getTime();
      const now = Date.now();
      if (now - cachedAt < 2 * 60 * 1000) {
        return entry.comments;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// ==================== HELPERS ====================

/**
 * Parse diff patch into lines for display
 */
export function parseDiffPatch(patch?: string): Array<{
  type: 'context' | 'addition' | 'deletion';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}> {
  if (!patch) return [];
  
  const lines: ReturnType<typeof parseDiffPatch> = [];
  const patchLines = patch.split('\n');
  
  let oldLine = 0;
  let newLine = 0;
  
  for (const line of patchLines) {
    if (line.startsWith('@@')) {
      // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[2], 10);
      }
      lines.push({ type: 'context', content: line, oldLineNumber: oldLine, newLineNumber: newLine });
    } else if (line.startsWith('+')) {
      lines.push({ type: 'addition', content: line.slice(1), newLineNumber: newLine });
      newLine++;
    } else if (line.startsWith('-')) {
      lines.push({ type: 'deletion', content: line.slice(1), oldLineNumber: oldLine });
      oldLine++;
    } else if (line.startsWith('\\')) {
      // "\ No newline at end of file" - metadata line
      lines.push({ type: 'context', content: line });
    } else {
      // Context line
      lines.push({ 
        type: 'context', 
        content: line.startsWith(' ') ? line.slice(1) : line,
        oldLineNumber: oldLine,
        newLineNumber: newLine 
      });
      oldLine++;
      newLine++;
    }
  }
  
  return lines;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Get file icon based on filename
 */
export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const iconMap: Record<string, string> = {
    ts: '📘',
    tsx: '⚛️',
    js: '📒',
    jsx: '⚛️',
    py: '🐍',
    java: '☕',
    go: '🐹',
    rs: '🦀',
    cpp: '⚙️',
    c: '⚙️',
    h: '📋',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    json: '📋',
    yml: '⚙️',
    yaml: '⚙️',
    md: '📝',
    txt: '📄',
    sql: '🗄️',
    sh: '🔧',
    dockerfile: '🐳',
    xml: '📋',
    svg: '🖼️',
    png: '🖼️',
    jpg: '🖼️',
    gif: '🖼️',
  };
  
  return iconMap[ext || ''] || '📄';
}
