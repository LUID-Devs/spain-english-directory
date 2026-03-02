/**
 * Unified Cross-Platform Search Service
 * Aggregates search results from Asana, Linear, and Jira
 */

import { apiService } from './apiService';
import { AsanaTask } from './asanaService';
import { LinearIssue } from './linearService';
import { JiraIssue } from './jiraService';

// Unified search result types
export type ExternalTaskSource = 'asana' | 'linear' | 'jira';

export interface UnifiedSearchResult {
  id: string;
  source: ExternalTaskSource;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  url: string;
  assignee?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  externalId: string;
  createdAt: string;
  updatedAt: string;
  // Source-specific raw data for detailed views
  rawData: AsanaTask | LinearIssue | JiraIssue;
}

export interface UnifiedSearchFilters {
  sources?: ExternalTaskSource[];
  searchQuery?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  projectId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface UnifiedSearchResponse {
  results: UnifiedSearchResult[];
  totalCount: number;
  sourceCounts: {
    asana: number;
    linear: number;
    jira: number;
  };
}

export interface ConnectedIntegrations {
  asana: boolean;
  linear: boolean;
  jira: boolean;
}

// API Response types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Search across all connected integrations
 */
export async function unifiedSearch(
  filters: UnifiedSearchFilters
): Promise<ApiResponse<UnifiedSearchResponse>> {
  try {
    const response = await apiService.request<UnifiedSearchResponse>('/integrations/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
    return { data: response };
  } catch (error: any) {
    return { error: error.message || 'Failed to perform unified search' };
  }
}

/**
 * Get search suggestions across all connected integrations
 */
export async function getUnifiedSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<ApiResponse<UnifiedSearchResult[]>> {
  try {
    const params = new URLSearchParams({ query, limit: limit.toString() });
    const data = await apiService.request<UnifiedSearchResult[]>(`/integrations/search/suggestions?${params.toString()}`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch search suggestions' };
  }
}

/**
 * Get connected integration status
 */
export async function getConnectedIntegrations(): Promise<ApiResponse<ConnectedIntegrations>> {
  try {
    const data = await apiService.request<ConnectedIntegrations>('/integrations/status');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch integration status' };
  }
}

/**
 * Get recent tasks from all connected integrations
 */
export async function getRecentExternalTasks(
  limit: number = 10
): Promise<ApiResponse<UnifiedSearchResult[]>> {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    const data = await apiService.request<UnifiedSearchResult[]>(`/integrations/recent?${params.toString()}`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch recent tasks' };
  }
}

/**
 * Get tasks assigned to current user from all connected integrations
 */
export async function getMyExternalTasks(
  limit: number = 10
): Promise<ApiResponse<UnifiedSearchResult[]>> {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    const data = await apiService.request<UnifiedSearchResult[]>(`/integrations/my-tasks?${params.toString()}`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch my tasks' };
  }
}

/**
 * Link an external task to a TaskLuid task
 */
export async function linkExternalTask(
  taskluidTaskId: number,
  source: ExternalTaskSource,
  externalTaskId: string,
  config?: {
    syncEnabled?: boolean;
    syncDirection?: 'to_external' | 'from_external' | 'bidirectional';
    title?: string;
    url?: string;
  }
): Promise<ApiResponse<{ id: number; createdAt: string }>> {
  try {
    const data = await apiService.request<{ id: number; createdAt: string }>(
      `/tasks/${taskluidTaskId}/external-links`,
      {
        method: 'POST',
        body: JSON.stringify({
          source,
          externalTaskId,
          ...config,
        }),
      }
    );
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to link external task' };
  }
}

/**
 * Get all external links for a TaskLuid task
 */
export async function getTaskExternalLinks(taskId: number): Promise<ApiResponse<{
  id: number;
  source: ExternalTaskSource;
  externalId: string;
  title: string;
  url: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}[]>> {
  try {
    const data = await apiService.request<{
      id: number;
      source: ExternalTaskSource;
      externalId: string;
      title: string;
      url: string;
      syncEnabled: boolean;
      lastSyncedAt?: string;
      createdAt: string;
    }[]>(`/tasks/${taskId}/external-links`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch external links' };
  }
}

/**
 * Delete an external link
 */
export async function deleteExternalLink(linkId: number): Promise<ApiResponse<void>> {
  try {
    await apiService.request<void>(`/external-links/${linkId}`, {
      method: 'DELETE',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to delete external link' };
  }
}

/**
 * Sync an external link
 */
export async function syncExternalLink(
  linkId: number,
  direction: 'to_external' | 'from_external'
): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    const data = await apiService.request<{ success: boolean; message?: string }>(
      `/external-links/${linkId}/sync`,
      {
        method: 'POST',
        body: JSON.stringify({ direction }),
      }
    );
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync external link' };
  }
}

// Helper function to format unified search results for display
export function formatUnifiedSearchResult(result: UnifiedSearchResult): {
  title: string;
  subtitle: string;
  status: string;
  sourceLabel: string;
  sourceColor: string;
  url: string;
} {
  const sourceLabels: Record<ExternalTaskSource, { label: string; color: string }> = {
    asana: { label: 'Asana', color: '#F06A6A' },
    linear: { label: 'Linear', color: '#5E6AD2' },
    jira: { label: 'Jira', color: '#0052CC' },
  };

  const sourceInfo = sourceLabels[result.source];

  return {
    title: result.title,
    subtitle: result.project?.name || 'No project',
    status: result.status,
    sourceLabel: sourceInfo.label,
    sourceColor: sourceInfo.color,
    url: result.url,
  };
}

// Helper function to get priority label
export function getPriorityLabel(priority?: string): string {
  if (!priority) return 'None';
  
  const priorityMap: Record<string, string> = {
    'urgent': 'Urgent',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'backlog': 'Backlog',
    'p0': 'Urgent',
    'p1': 'High',
    'p2': 'Medium',
    'p3': 'Low',
    'highest': 'Urgent',
    'high': 'High',
    'low': 'Low',
    'lowest': 'Backlog',
  };

  return priorityMap[priority.toLowerCase()] || priority;
}
