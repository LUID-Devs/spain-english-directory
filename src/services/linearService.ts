/**
 * Linear Integration Service
 * Handles sync between TaskLuid and Linear
 */

import { apiService } from './apiService';

// Linear Types
export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  color?: string;
  icon?: string;
}

export interface LinearProject {
  id: string;
  name: string;
  color?: string;
  state: 'backlog' | 'planned' | 'started' | 'paused' | 'completed' | 'canceled';
}

export interface LinearCycle {
  id: string;
  number: number;
  name: string;
  startsAt: string;
  endsAt: string;
  state: 'upcoming' | 'started' | 'completed';
}

export interface LinearState {
  id: string;
  name: string;
  color: string;
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
}

export interface LinearUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  displayName: string;
}

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    id: string;
    name: string;
    type: string;
  };
  priority: number;
  priorityLabel: 'No priority' | 'Urgent' | 'High' | 'Medium' | 'Low';
  assignee?: LinearUser;
  creator: LinearUser;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  url: string;
  team?: LinearTeam;
  project?: LinearProject;
  cycle?: LinearCycle;
  labels?: LinearLabel[];
}

export interface LinearLink {
  id: number;
  taskId: number;
  linearIssueId: string;
  linearIssueIdentifier: string;
  linearIssueTitle: string;
  linearTeamId?: string;
  linearTeamName?: string;
  linearProjectId?: string;
  linearProjectName?: string;
  linearPermalink?: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  syncDirection: 'to_linear' | 'from_linear' | 'bidirectional';
  integrationConfigId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LinearSyncConfig {
  teamId: string;
  projectId?: string;
  cycleId?: string;
  stateId?: string;
  syncDirection: 'to_linear' | 'from_linear' | 'bidirectional';
  fieldMappings: {
    title: boolean;
    description: boolean;
    status: boolean;
    dueDate: boolean;
    assignee: boolean;
    priority: boolean;
  };
}

export interface LinearSyncResult {
  success: boolean;
  linearIssueId?: string;
  linearIssueIdentifier?: string;
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
 * Get Linear teams for the authenticated user
 */
export async function getLinearTeams(): Promise<ApiResponse<LinearTeam[]>> {
  try {
    const data = await apiService.request<LinearTeam[]>('/integrations/linear/teams');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear teams' };
  }
}

/**
 * Get Linear projects for a team
 */
export async function getLinearProjects(teamId: string): Promise<ApiResponse<LinearProject[]>> {
  try {
    const data = await apiService.request<LinearProject[]>(`/integrations/linear/teams/${teamId}/projects`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear projects' };
  }
}

/**
 * Get Linear cycles for a team
 */
export async function getLinearCycles(teamId: string): Promise<ApiResponse<LinearCycle[]>> {
  try {
    const data = await apiService.request<LinearCycle[]>(`/integrations/linear/teams/${teamId}/cycles`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear cycles' };
  }
}

/**
 * Get Linear states (workflow states) for a team
 */
export async function getLinearStates(teamId: string): Promise<ApiResponse<LinearState[]>> {
  try {
    const data = await apiService.request<LinearState[]>(`/integrations/linear/teams/${teamId}/states`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear states' };
  }
}

/**
 * Get Linear users for a team
 */
export async function getLinearUsers(teamId: string): Promise<ApiResponse<LinearUser[]>> {
  try {
    const data = await apiService.request<LinearUser[]>(`/integrations/linear/teams/${teamId}/users`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear users' };
  }
}

/**
 * Get Linear labels for a team
 */
export async function getLinearLabels(teamId: string): Promise<ApiResponse<LinearLabel[]>> {
  try {
    const data = await apiService.request<LinearLabel[]>(`/integrations/linear/teams/${teamId}/labels`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear labels' };
  }
}

/**
 * Search Linear issues
 */
export async function searchLinearIssues(
  teamId: string,
  query: string
): Promise<ApiResponse<LinearIssue[]>> {
  try {
    const params = new URLSearchParams({ teamId, query });
    const data = await apiService.request<LinearIssue[]>(`/integrations/linear/search?${params.toString()}`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to search Linear issues' };
  }
}

/**
 * Get Linear links for a TaskLuid task
 */
export async function getTaskLinearLinks(taskId: number): Promise<ApiResponse<LinearLink[]>> {
  try {
    const data = await apiService.request<LinearLink[]>(`/tasks/${taskId}/linear-links`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear links' };
  }
}

/**
 * Link a TaskLuid task to a Linear issue
 */
export async function linkLinearIssue(
  taskId: number,
  linearIssueId: string,
  config?: Partial<LinearSyncConfig>
): Promise<ApiResponse<LinearLink>> {
  try {
    const data = await apiService.request<LinearLink>(`/tasks/${taskId}/linear-links`, {
      method: 'POST',
      body: JSON.stringify({ linearIssueId, ...config }),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to link Linear issue' };
  }
}

/**
 * Create a new Linear issue and link it
 */
export async function createAndLinkLinearIssue(
  taskId: number,
  config: LinearSyncConfig
): Promise<ApiResponse<LinearLink>> {
  try {
    const data = await apiService.request<LinearLink>(`/tasks/${taskId}/linear-links/create`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to create and link Linear issue' };
  }
}

/**
 * Update Linear link configuration
 */
export async function updateLinearLink(
  linkId: number,
  updates: Partial<LinearSyncConfig> & { syncEnabled?: boolean }
): Promise<ApiResponse<LinearLink>> {
  try {
    const data = await apiService.request<LinearLink>(`/linear-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to update Linear link' };
  }
}

/**
 * Delete a Linear link
 */
export async function deleteLinearLink(linkId: number): Promise<ApiResponse<void>> {
  try {
    await apiService.request<void>(`/linear-links/${linkId}`, {
      method: 'DELETE',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to delete Linear link' };
  }
}

/**
 * Sync a task to Linear (push changes)
 */
export async function syncToLinear(taskId: number, linkId?: number): Promise<ApiResponse<LinearSyncResult>> {
  try {
    const url = linkId 
      ? `/linear-links/${linkId}/sync-to-linear`
      : `/tasks/${taskId}/linear-sync/to-linear`;
    const data = await apiService.request<LinearSyncResult>(url, {
      method: 'POST',
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync to Linear' };
  }
}

/**
 * Sync a task from Linear (pull changes)
 */
export async function syncFromLinear(taskId: number, linkId?: number): Promise<ApiResponse<LinearSyncResult>> {
  try {
    const url = linkId 
      ? `/linear-links/${linkId}/sync-from-linear`
      : `/tasks/${taskId}/linear-sync/from-linear`;
    const data = await apiService.request<LinearSyncResult>(url, {
      method: 'POST',
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync from Linear' };
  }
}

/**
 * Get Linear integration status
 */
export async function getLinearIntegrationStatus(): Promise<ApiResponse<{
  connected: boolean;
  teamCount?: number;
  defaultTeamId?: string;
}>> {
  try {
    const data = await apiService.request<{ connected: boolean; teamCount?: number; defaultTeamId?: string }>('/integrations/linear/status');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to get Linear status' };
  }
}

/**
 * Disconnect Linear integration
 */
export async function disconnectLinear(): Promise<ApiResponse<void>> {
  try {
    await apiService.request<void>('/integrations/linear/disconnect', {
      method: 'POST',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to disconnect Linear' };
  }
}
