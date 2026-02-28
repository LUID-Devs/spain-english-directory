/**
 * Jira Integration Service
 * Handles sync between TaskLuid and Jira
 */

import { apiService } from './apiService';

// Jira Types
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls?: {
    '48x48'?: string;
  };
}

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  subtask: boolean;
}

export interface JiraStatus {
  id: string;
  name: string;
  description?: string;
  statusCategory?: 'new' | 'indeterminate' | 'done';
}

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  avatarUrls?: {
    '48x48'?: string;
  };
  active: boolean;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      statusCategory?: {
        key: 'new' | 'indeterminate' | 'done';
      };
    };
    priority?: {
      name: string;
    };
    assignee?: JiraUser;
    reporter?: JiraUser;
    created: string;
    updated: string;
    duedate?: string;
    issuetype?: JiraIssueType;
    project?: JiraProject;
  };
  self?: string;
}

export interface JiraLink {
  id: number;
  taskId: number;
  jiraIssueId: string;
  jiraIssueKey: string;
  jiraIssueName: string;
  jiraProjectId?: string;
  jiraProjectKey?: string;
  jiraProjectName?: string;
  jiraPermalink?: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  syncDirection: 'to_jira' | 'from_jira' | 'bidirectional';
  integrationConfigId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JiraSyncConfig {
  projectId: string;
  projectKey?: string;
  issueTypeId?: string;
  sprintId?: string;
  syncDirection: 'to_jira' | 'from_jira' | 'bidirectional';
  fieldMappings: {
    title: boolean;
    description: boolean;
    status: boolean;
    dueDate: boolean;
    assignee: boolean;
    priority: boolean;
  };
}

export interface JiraSyncResult {
  success: boolean;
  jiraIssueId?: string;
  jiraIssueKey?: string;
  message?: string;
  errors?: string[];
}

// API Response types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get Jira projects for the authenticated user
 */
export async function getJiraProjects(): Promise<ApiResponse<JiraProject[]>> {
  try {
    const data = await apiService.request<JiraProject[]>('/integrations/jira/projects');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira projects' };
  }
}

/**
 * Get Jira issue types for a project
 */
export async function getJiraIssueTypes(projectId: string): Promise<ApiResponse<JiraIssueType[]>> {
  try {
    const data = await apiService.request<JiraIssueType[]>(`/integrations/jira/projects/${projectId}/issue-types`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira issue types' };
  }
}

/**
 * Get Jira statuses for a project
 */
export async function getJiraStatuses(projectId: string): Promise<ApiResponse<JiraStatus[]>> {
  try {
    const data = await apiService.request<JiraStatus[]>(`/integrations/jira/projects/${projectId}/statuses`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira statuses' };
  }
}

/**
 * Get Jira users for a project
 */
export async function getJiraUsers(projectId: string): Promise<ApiResponse<JiraUser[]>> {
  try {
    const data = await apiService.request<JiraUser[]>(`/integrations/jira/projects/${projectId}/users`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira users' };
  }
}

/**
 * Search Jira issues
 */
export async function searchJiraIssues(
  projectId: string,
  query: string
): Promise<ApiResponse<JiraIssue[]>> {
  try {
    const params = new URLSearchParams({ projectId, query });
    const data = await apiService.request<JiraIssue[]>(`/integrations/jira/search?${params.toString()}`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to search Jira issues' };
  }
}

/**
 * Get Jira links for a TaskLuid task
 */
export async function getTaskJiraLinks(taskId: number): Promise<ApiResponse<JiraLink[]>> {
  try {
    const data = await apiService.request<JiraLink[]>(`/tasks/${taskId}/jira-links`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira links' };
  }
}

/**
 * Link a TaskLuid task to a Jira issue
 */
export async function linkJiraIssue(
  taskId: number,
  jiraIssueId: string,
  config?: Partial<JiraSyncConfig>
): Promise<ApiResponse<JiraLink>> {
  try {
    const data = await apiService.request<JiraLink>(`/tasks/${taskId}/jira-links`, {
      method: 'POST',
      body: JSON.stringify({ jiraIssueId, ...config }),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to link Jira issue' };
  }
}

/**
 * Create a new Jira issue and link it
 */
export async function createAndLinkJiraIssue(
  taskId: number,
  config: JiraSyncConfig
): Promise<ApiResponse<JiraLink>> {
  try {
    const data = await apiService.request<JiraLink>(`/tasks/${taskId}/jira-links/create`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to create and link Jira issue' };
  }
}

/**
 * Update Jira link configuration
 */
export async function updateJiraLink(
  linkId: number,
  updates: Partial<JiraSyncConfig> & { syncEnabled?: boolean }
): Promise<ApiResponse<JiraLink>> {
  try {
    const data = await apiService.request<JiraLink>(`/jira-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to update Jira link' };
  }
}

/**
 * Delete a Jira link
 */
export async function deleteJiraLink(linkId: number): Promise<ApiResponse<void>> {
  try {
    await apiService.request<void>(`/jira-links/${linkId}`, {
      method: 'DELETE',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to delete Jira link' };
  }
}

/**
 * Sync a task to Jira (push changes)
 */
export async function syncToJira(taskId: number, linkId?: number): Promise<ApiResponse<JiraSyncResult>> {
  try {
    const url = linkId 
      ? `/jira-links/${linkId}/sync-to-jira`
      : `/tasks/${taskId}/jira-sync/to-jira`;
    const data = await apiService.request<JiraSyncResult>(url, {
      method: 'POST',
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync to Jira' };
  }
}

/**
 * Sync a task from Jira (pull changes)
 */
export async function syncFromJira(taskId: number, linkId?: number): Promise<ApiResponse<JiraSyncResult>> {
  try {
    const url = linkId 
      ? `/jira-links/${linkId}/sync-from-jira`
      : `/tasks/${taskId}/jira-sync/from-jira`;
    const data = await apiService.request<JiraSyncResult>(url, {
      method: 'POST',
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync from Jira' };
  }
}

/**
 * Get Jira integration status
 */
export async function getJiraIntegrationStatus(): Promise<ApiResponse<{
  connected: boolean;
  projectCount?: number;
  defaultProjectId?: string;
  domain?: string;
}>> {
  try {
    const data = await apiService.request<{ connected: boolean; projectCount?: number; defaultProjectId?: string; domain?: string }>('/integrations/jira/status');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to get Jira status' };
  }
}

/**
 * Disconnect Jira integration
 */
export async function disconnectJira(): Promise<ApiResponse<void>> {
  try {
    await apiService.request<void>('/integrations/jira/disconnect', {
      method: 'POST',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to disconnect Jira' };
  }
}
