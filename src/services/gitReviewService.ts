/**
 * Git Review Service
 * Manages local storage for PR review state
 */

export interface PRReviewState {
  status: 'pending' | 'reviewing' | 'approved' | 'changes_requested' | 'merged';
  notes: string;
  checklist: Array<{ id: string; label: string; checked: boolean }>;
  reviewedAt?: string;
}

const STORAGE_KEY = 'taskluid_pr_reviews';

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
