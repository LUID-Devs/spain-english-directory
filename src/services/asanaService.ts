/**
 * Asana Integration Service
 * Handles sync between TaskLuid and Asana
 */

import { apiService } from './apiService';

// Asana Types
export interface AsanaWorkspace {
  gid: string;
  name: string;
}

export interface AsanaProject {
  gid: string;
  name: string;
  workspace?: AsanaWorkspace;
}

export interface AsanaUser {
  gid: string;
  name: string;
  email?: string;
  photo?: {
    image_128x128?: string;
  };
}

export interface AsanaTask {
  gid: string;
  name: string;
  notes?: string;
  completed: boolean;
  due_on?: string;
  assignee?: AsanaUser;
  projects?: AsanaProject[];
  workspace?: AsanaWorkspace;
  permalink_url?: string;
  created_at?: string;
  modified_at?: string;
}

export interface AsanaSection {
  gid: string;
  name: string;
  project?: AsanaProject;
}

export interface AsanaLink {
  id: number;
  taskId: number;
  asanaTaskId: string;
  asanaTaskName: string;
  asanaProjectId?: string;
  asanaProjectName?: string;
  asanaWorkspaceId?: string;
  asanaWorkspaceName?: string;
  asanaPermalink?: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  syncDirection: 'to_asana' | 'from_asana' | 'bidirectional';
  integrationConfigId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AsanaSyncConfig {
  workspaceId: string;
  projectId?: string;
  sectionId?: string;
  syncDirection: 'to_asana' | 'from_asana' | 'bidirectional';
  fieldMappings: {
    title: boolean;
    description: boolean;
    status: boolean;
    dueDate: boolean;
    assignee: boolean;
    priority: boolean;
  };
}

export interface AsanaSyncResult {
  success: boolean;
  asanaTaskId?: string;
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
 * Get Asana workspaces for the authenticated user
 */
export async function getAsanaWorkspaces(): Promise<ApiResponse<AsanaWorkspace[]>> {
  try {
    const data = await apiService.request<AsanaWorkspace[]>('/integrations/asana/workspaces');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Asana workspaces' };
  }
}

/**
 * Get Asana projects for a workspace
 */
export async function getAsanaProjects(workspaceId: string): Promise<ApiResponse<AsanaProject[]>> {
  try {
    const data = await apiService.request<AsanaProject[]>(`/integrations/asana/workspaces/${workspaceId}/projects`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Asana projects' };
  }
}

/**
 * Get Asana sections for a project
 */
export async function getAsanaSections(projectId: string): Promise<ApiResponse<AsanaSection[]>> {
  try {
    const data = await apiService.request<AsanaSection[]>(`/integrations/asana/projects/${projectId}/sections`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Asana sections' };
  }
}

/**
 * Get Asana users for a workspace
 */
export async function getAsanaUsers(workspaceId: string): Promise<ApiResponse<AsanaUser[]>> {
  try {
    const data = await apiService.request<AsanaUser[]>(`/integrations/asana/workspaces/${workspaceId}/users`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Asana users' };
  }
}

/**
 * Search Asana tasks
 */
export async function searchAsanaTasks(
  workspaceId: string,
  query: string
): Promise<ApiResponse<AsanaTask[]>> {
  try {
    const params = new URLSearchParams({ workspaceId, query });
    const data = await apiService.request<AsanaTask[]>(`/integrations/asana/search?${params.toString()}`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to search Asana tasks' };
  }
}

/**
 * Get Asana links for a TaskLuid task
 */
export async function getTaskAsanaLinks(taskId: number): Promise<ApiResponse<AsanaLink[]>> {
  try {
    const data = await apiService.request<AsanaLink[]>(`/tasks/${taskId}/asana-links`);
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Asana links' };
  }
}

/**
 * Link a TaskLuid task to an Asana task
 */
export async function linkAsanaTask(
  taskId: number,
  asanaTaskId: string,
  config?: Partial<AsanaSyncConfig>
): Promise<ApiResponse<AsanaLink>> {
  try {
    const data = await apiService.request<AsanaLink>(`/tasks/${taskId}/asana-links`, {
      method: 'POST',
      body: JSON.stringify({ asanaTaskId, ...config }),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to link Asana task' };
  }
}

/**
 * Create a new Asana task and link it
 */
export async function createAndLinkAsanaTask(
  taskId: number,
  config: AsanaSyncConfig
): Promise<ApiResponse<AsanaLink>> {
  try {
    const data = await apiService.request<AsanaLink>(`/tasks/${taskId}/asana-links/create`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to create and link Asana task' };
  }
}

/**
 * Update Asana link configuration
 */
export async function updateAsanaLink(
  linkId: number,
  updates: Partial<AsanaSyncConfig> & { syncEnabled?: boolean }
): Promise<ApiResponse<AsanaLink>> {
  try {
    const data = await apiService.request<AsanaLink>(`/asana-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to update Asana link' };
  }
}

/**
 * Delete an Asana link
 */
export async function deleteAsanaLink(linkId: number): Promise<ApiResponse<void>> {
  try {
    await apiService.request<void>(`/asana-links/${linkId}`, {
      method: 'DELETE',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to delete Asana link' };
  }
}

/**
 * Sync a task to Asana (push changes)
 */
export async function syncToAsana(taskId: number, linkId?: number): Promise<ApiResponse<AsanaSyncResult>> {
  try {
    const url = linkId 
      ? `/asana-links/${linkId}/sync-to-asana`
      : `/tasks/${taskId}/asana-sync/to-asana`;
    const data = await apiService.request<AsanaSyncResult>(url, {
      method: 'POST',
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync to Asana' };
  }
}

/**
 * Sync a task from Asana (pull changes)
 */
export async function syncFromAsana(taskId: number, linkId?: number): Promise<ApiResponse<AsanaSyncResult>> {
  try {
    const url = linkId 
      ? `/asana-links/${linkId}/sync-from-asana`
      : `/tasks/${taskId}/asana-sync/from-asana`;
    const data = await apiService.request<AsanaSyncResult>(url, {
      method: 'POST',
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync from Asana' };
  }
}

/**
 * Get Asana integration status
 */
export async function getAsanaIntegrationStatus(): Promise<ApiResponse<{
  connected: boolean;
  workspaceCount?: number;
  defaultWorkspaceId?: string;
}>> {
  try {
    const data = await apiService.request<{ connected: boolean; workspaceCount?: number; defaultWorkspaceId?: string }>('/integrations/asana/status');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to get Asana status' };
  }
}

/**
 * Disconnect Asana integration
 */
export async function disconnectAsana(): Promise<ApiResponse<void>> {
  try {
    await apiService.request<void>('/integrations/asana/disconnect', {
      method: 'DELETE',
    });
    return {};
  } catch (error: any) {
    return { error: error.message || 'Failed to disconnect Asana' };
  }
}
