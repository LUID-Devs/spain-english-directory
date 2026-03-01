/**
 * Skill Service
 * 
 * Frontend API client for the agent skills system.
 * Provides methods for skill discovery, execution, and management.
 */

import { apiService as api } from './apiService';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'communication' | 'automation' | 'data' | 'integration';
  version: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: unknown;
    enumValues?: string[];
  }>;
  requiredPermissions: string[];
  enabled: boolean;
}

export interface SkillExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  executionTimeMs: number;
  requestId: string;
}

export interface SkillHealth {
  skillId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: string;
  latencyMs: number;
  errorRate: number;
  message?: string;
}

export interface SkillPermissionCheck {
  canExecute: boolean;
  reason?: string;
  missingPermissions?: string[];
  requiredPermissions: string[];
  userPermissions: string[];
}

/**
 * Get all available skills
 */
export async function getAllSkills(): Promise<SkillDefinition[]> {
  const response = await api.request<{ data: SkillDefinition[] }>('/skills');
  return response.data;
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(category: string): Promise<SkillDefinition[]> {
  const response = await api.request<{ data: SkillDefinition[] }>(`/skills/categories/${category}`);
  return response.data;
}

/**
 * Search skills
 */
export async function searchSkills(query: string): Promise<SkillDefinition[]> {
  const params = new URLSearchParams({ q: query });
  const response = await api.request<{ data: SkillDefinition[] }>(`/skills/search?${params.toString()}`);
  return response.data;
}

/**
 * Get skill details
 */
export async function getSkill(skillId: string): Promise<SkillDefinition & { health?: SkillHealth }> {
  const response = await api.request<{ data: SkillDefinition & { health?: SkillHealth } }>(`/skills/${skillId}`);
  return response.data;
}

/**
 * Execute a skill
 */
export async function executeSkill<T = unknown>(
  skillId: string,
  parameters: Record<string, unknown>,
  projectId?: number
): Promise<SkillExecutionResult<T>> {
  const response = await api.request<SkillExecutionResult<T>>(`/skills/${skillId}/execute`, {
    method: 'POST',
    body: JSON.stringify({
      parameters,
      projectId
    })
  });
  return response;
}

/**
 * Check skill permissions
 */
export async function checkSkillPermissions(
  skillId: string,
  projectId?: number
): Promise<SkillPermissionCheck> {
  const params = new URLSearchParams();
  if (projectId) {
    params.append('projectId', projectId.toString());
  }
  const queryString = params.toString();
  const response = await api.request<{ data: SkillPermissionCheck }>(
    `/skills/${skillId}/permissions${queryString ? `?${queryString}` : ''}`
  );
  return response.data;
}

/**
 * Get skills health status
 */
export async function getSkillsHealth(): Promise<{ skills: SkillHealth[]; stats: {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  topSkills: { skillId: string; count: number }[];
} }> {
  const response = await api.request<{ data: { skills: SkillHealth[]; stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    topSkills: { skillId: string; count: number }[];
  } } }>('/skills/health');
  return response.data;
}

/**
 * Get execution log (admin only)
 */
export async function getExecutionLog(options?: {
  skillId?: string;
  limit?: number;
}): Promise<Array<{
  requestId: string;
  skillId: string;
  userId: number;
  organizationId: number;
  success: boolean;
  executionTimeMs: number;
  errorCode?: string;
  timestamp: string;
}>> {
  const params = new URLSearchParams();
  if (options?.skillId) {
    params.append('skillId', options.skillId);
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  const queryString = params.toString();
  const response = await api.request<{ data: Array<{
    requestId: string;
    skillId: string;
    userId: number;
    organizationId: number;
    success: boolean;
    executionTimeMs: number;
    errorCode?: string;
    timestamp: string;
  }> }>(`/skills/executions${queryString ? `?${queryString}` : ''}`);
  return response.data;
}

// Convenience methods for specific skills

/**
 * Analyze a task
 */
export async function analyzeTask(
  taskId: number,
  analysisType: 'categorize' | 'complexity' | 'duplicates' | 'workload' | 'full' = 'full'
) {
  return executeSkill('task:analysis', { taskId, analysisType });
}

/**
 * Search across tasks, projects, and users
 */
export async function advancedSearch(
  query: string,
  targets: ('tasks' | 'projects' | 'users')[] = ['tasks'],
  filters?: Record<string, unknown>
) {
  return executeSkill('data:search', { query, targets, filters });
}

/**
 * Send notification
 */
export async function sendNotification(
  type: 'task_assigned' | 'task_due' | 'mention' | 'project_update' | 'custom',
  recipients: { userIds?: number[]; teamId?: number; projectId?: number },
  content: { title: string; message: string; taskId?: number; projectId?: number; actionUrl?: string },
  options?: { channels?: { inApp?: boolean; email?: boolean; slack?: boolean }; priority?: 'low' | 'normal' | 'high' | 'urgent' }
) {
  return executeSkill('communication:notification', {
    type,
    recipients,
    content,
    ...options
  });
}
