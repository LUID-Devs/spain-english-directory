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

// Request/Response types
export interface SaveReviewStateRequest {
  taskId: number;
  prId: number;
  state: PRReviewState;
}

export interface CreateCommentRequest {
  filePath: string;
  lineNumber: number;
  text: string;
  commitId?: string;
  replyToId?: number;
}

export interface CreateReviewRequestRequest {
  requestedFromUserId: number;
  message?: string;
  dueDate?: string;
}

export interface RespondToRequestRequest {
  accept: boolean;
  message?: string;
}

export interface StartAIReviewRequest {
  agentId?: number;
  checkSecurity?: boolean;
  checkPerformance?: boolean;
  checkBestPractices?: boolean;
}
