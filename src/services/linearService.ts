/**
 * Linear Integration Service
 * Handles sync between TaskLuid and Linear
 */

import { apiService } from './apiService';

// Linear Types
export interface LinearOrganization {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  color?: string;
  organization?: LinearOrganization;
}

export interface LinearProject {
  id: string;
  name: string;
  state: string;
  url: string;
  team?: LinearTeam;
}

export interface LinearUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  displayName?: string;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
  priority: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignee?: LinearUser;
  team?: LinearTeam;
  project?: LinearProject;
  labels?: {
    id: string;
    name: string;
    color: string;
  }[];
  cycle?: {
    id: string;
    number: number;
    name?: string;
  };
}

export interface LinearCycle {
  id: string;
  number: number;
  name?: string;
  startsAt: string;
  endsAt: string;
  state: string;
}

export interface LinearState {
  id: string;
  name: string;
  color: string;
  type: string;
}

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
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
  linearUrl: string;
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
  labelIds?: string[];
  syncDirection: 'to_linear' | 'from_linear' | 'bidirectional';
  fieldMappings: {
    title: boolean;
    description: boolean;
    status: boolean;
    dueDate: boolean;
    assignee: boolean;
    priority: boolean;
    labels: boolean;
  };
}

export interface LinearSyncResult {
  success: boolean;
  linearIssueId?: string;
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
 * Get Linear organizations for the authenticated user
 */
export async function getLinearOrganizations(): Promise<ApiResponse<LinearOrganization[]>> {
  try {
    const data = await apiService.request<LinearOrganization[]>('/integrations/linear/organizations');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear organizations' };
  }
}

/**
 * Get Linear teams for an organization
 */
export async function getLinearTeams(organizationId: string): Promise<ApiResponse<LinearTeam[]>> {
  try {
    const data = await apiService.request<LinearTeam[]>(`/integrations/linear/organizations/${organizationId}/teams`);
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
 * Get Linear states for a team
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
 * Get Linear users for an organization
 */
export async function getLinearUsers(organizationId: string): Promise<ApiResponse<LinearUser[]>> {
  try {
    const data = await apiService.request<LinearUser[]>(`/integrations/linear/organizations/${organizationId}/users`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear users' };
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
  organizationCount?: number;
  defaultOrganizationId?: string;
}>> {
  try {
    const data = await apiService.request<{ connected: boolean; organizationCount?: number; defaultOrganizationId?: string }>('/integrations/linear/status');
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
      method: 'DELETE',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to disconnect Linear' };
  }
}

/**
 * Get all Linear issues for unified search
 */
export async function getAllLinearIssues(filters?: {
  teamId?: string;
  state?: string;
  assigneeId?: string;
  projectId?: string;
  searchQuery?: string;
}): Promise<ApiResponse<LinearIssue[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.teamId) params.append('teamId', filters.teamId);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);
    
    const queryString = params.toString();
    const url = `/integrations/linear/issues${queryString ? `?${queryString}` : ''}`;
    
    const data = await apiService.request<LinearIssue[]>(url);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Linear issues' };
  }
}