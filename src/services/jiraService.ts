/**
 * Jira Integration Service
 * Handles sync between TaskLuid and Jira
 */

import { apiService } from './apiService';

// Jira Types
export interface JiraSite {
  id: string;
  name: string;
  url: string;
  avatarUrl?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls?: {
    '48x48'?: string;
    '24x24'?: string;
    '16x16'?: string;
    '32x32'?: string;
  };
  projectTypeKey: string;
  style?: string;
  site?: JiraSite;
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
  statusCategory: {
    id: number;
    key: string;
    colorName: string;
    name: string;
  };
}

export interface JiraPriority {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
}

export interface JiraUser {
  accountId: string;
  accountType?: string;
  displayName: string;
  emailAddress?: string;
  avatarUrls?: {
    '48x48'?: string;
    '24x24'?: string;
    '16x16'?: string;
    '32x32'?: string;
  };
  active: boolean;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  goal?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: string | {
      type: string;
      version: number;
      content: any[];
    };
    status: JiraStatus;
    priority?: JiraPriority;
    issuetype: JiraIssueType;
    created: string;
    updated: string;
    duedate?: string;
    assignee?: JiraUser;
    reporter?: JiraUser;
    project: JiraProject;
    labels?: string[];
    sprint?: JiraSprint;
    components?: {
      id: string;
      name: string;
    }[];
    fixVersions?: {
      id: string;
      name: string;
      released: boolean;
    }[];
    customfield_10016?: number; // Story points field
    subtasks?: {
      id: string;
      key: string;
      fields: {
        summary: string;
        status: JiraStatus;
      };
    }[];
  };
}

export interface JiraLink {
  id: number;
  taskId: number;
  jiraIssueId: string;
  jiraIssueKey: string;
  jiraIssueSummary: string;
  jiraProjectId?: string;
  jiraProjectKey?: string;
  jiraProjectName?: string;
  jiraSiteId?: string;
  jiraSiteName?: string;
  jiraUrl: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  syncDirection: 'to_jira' | 'from_jira' | 'bidirectional';
  integrationConfigId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JiraSyncConfig {
  siteId: string;
  projectId: string;
  issueTypeId: string;
  sprintId?: string;
  statusId?: string;
  priorityId?: string;
  labelIds?: string[];
  componentIds?: string[];
  syncDirection: 'to_jira' | 'from_jira' | 'bidirectional';
  fieldMappings: {
    title: boolean;
    description: boolean;
    status: boolean;
    dueDate: boolean;
    assignee: boolean;
    priority: boolean;
    labels: boolean;
    storyPoints: boolean;
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
 * Get Jira sites for the authenticated user
 */
export async function getJiraSites(): Promise<ApiResponse<JiraSite[]>> {
  try {
    const data = await apiService.request<JiraSite[]>('/integrations/jira/sites');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira sites' };
  }
}

/**
 * Get Jira projects for a site
 */
export async function getJiraProjects(siteId: string): Promise<ApiResponse<JiraProject[]>> {
  try {
    const data = await apiService.request<JiraProject[]>(`/integrations/jira/sites/${siteId}/projects`);
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
 * Get Jira priorities for a site
 */
export async function getJiraPriorities(siteId: string): Promise<ApiResponse<JiraPriority[]>> {
  try {
    const data = await apiService.request<JiraPriority[]>(`/integrations/jira/sites/${siteId}/priorities`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira priorities' };
  }
}

/**
 * Get Jira sprints for a project
 */
export async function getJiraSprints(projectId: string): Promise<ApiResponse<JiraSprint[]>> {
  try {
    const data = await apiService.request<JiraSprint[]>(`/integrations/jira/projects/${projectId}/sprints`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira sprints' };
  }
}

/**
 * Get Jira users for a site
 */
export async function getJiraUsers(siteId: string): Promise<ApiResponse<JiraUser[]>> {
  try {
    const data = await apiService.request<JiraUser[]>(`/integrations/jira/sites/${siteId}/users`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira users' };
  }
}

/**
 * Get Jira components for a project
 */
export async function getJiraComponents(projectId: string): Promise<ApiResponse<{ id: string; name: string; description?: string }[]>> {
  try {
    const data = await apiService.request<{ id: string; name: string; description?: string }[]>(`/integrations/jira/projects/${projectId}/components`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira components' };
  }
}

/**
 * Search Jira issues
 */
export async function searchJiraIssues(
  siteId: string,
  query: string
): Promise<ApiResponse<JiraIssue[]>> {
  try {
    const params = new URLSearchParams({ siteId, query });
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
  siteCount?: number;
  defaultSiteId?: string;
}>> {
  try {
    const data = await apiService.request<{ connected: boolean; siteCount?: number; defaultSiteId?: string }>('/integrations/jira/status');
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
      method: 'DELETE',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to disconnect Jira' };
  }
}

/**
 * Get all Jira issues for unified search
 */
export async function getAllJiraIssues(filters?: {
  siteId?: string;
  projectId?: string;
  status?: string;
  assigneeId?: string;
  searchQuery?: string;
}): Promise<ApiResponse<JiraIssue[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.siteId) params.append('siteId', filters.siteId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);
    
    const queryString = params.toString();
    const url = `/integrations/jira/issues${queryString ? `?${queryString}` : ''}`;
    
    const data = await apiService.request<JiraIssue[]>(url);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Jira issues' };
  }
}