/**
 * Types for Third-Party Integration Hub
 */

export type IntegrationProvider = "ASANA" | "LINEAR" | "GITHUB" | "JIRA" | "TRELLO";
export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "ERROR" | "SYNCING";

export interface Integration {
  id: number;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  externalWorkspaceId?: string;
  externalWorkspaceName?: string;
  lastSyncAt?: string;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegratedTask {
  id: number;
  externalId: string;
  externalUrl?: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assigneeEmail?: string;
  assigneeName?: string;
  dueDate?: string;
  sourceProjectId?: string;
  sourceProjectName?: string;
  sourceProvider: IntegrationProvider;
  lastSyncedAt: string;
}

// OAuth flow types
export interface OAuthInitiateRequest {
  provider: IntegrationProvider;
  redirectUri: string;
}

export interface OAuthInitiateResponse {
  success: boolean;
  authorizationUrl?: string;
  state?: string;
  error?: string;
}

export interface OAuthCallbackRequest {
  provider: IntegrationProvider;
  code: string;
  state: string;
}

export interface OAuthCallbackResponse {
  success: boolean;
  integration?: Integration;
  error?: string;
}

// Integration management
export interface ListIntegrationsResponse {
  success: boolean;
  integrations?: Integration[];
  error?: string;
}

export interface DisconnectIntegrationResponse {
  success: boolean;
  error?: string;
}

// Sync types
export interface SyncIntegrationResponse {
  success: boolean;
  tasksSynced?: number;
  error?: string;
}

export interface ListIntegratedTasksRequest {
  integrationId?: number;
  provider?: IntegrationProvider;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListIntegratedTasksResponse {
  success: boolean;
  tasks?: IntegratedTask[];
  total?: number;
  error?: string;
}

// Asana-specific types
export interface AsanaProject {
  gid: string;
  name: string;
}

export interface AsanaTask {
  gid: string;
  name: string;
  notes?: string;
  completed: boolean;
  due_on?: string;
  assignee?: {
    gid: string;
    name: string;
    email?: string;
  } | null;
  projects?: AsanaProject[];
  permalink_url?: string;
  created_at: string;
  modified_at: string;
}

export interface AsanaWorkspace {
  gid: string;
  name: string;
}

// Linear-specific types
export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    name: string;
  };
  priority: number;
  assignee?: {
    name: string;
    email: string;
  } | null;
  dueDate?: string;
  project?: {
    id: string;
    name: string;
  } | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinearTeam {
  id: string;
  name: string;
}

// Unified search
export interface UnifiedSearchRequest {
  query: string;
  providers?: IntegrationProvider[];
  limit?: number;
}

export interface UnifiedSearchResponse {
  success: boolean;
  results?: {
    provider: IntegrationProvider;
    tasks: IntegratedTask[];
  }[];
  error?: string;
}

// AI Query types
export interface AIQueryRequest {
  query: string;
  providers?: IntegrationProvider[];
}

export interface AIQueryResponse {
  success: boolean;
  answer?: string;
  tasks?: IntegratedTask[];
  error?: string;
}
