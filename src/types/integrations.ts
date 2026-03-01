/**
 * Third-Party Integration Framework Types
 * Core types and interfaces for the integration ecosystem
 */

export type IntegrationProvider = 
  | 'asana' 
  | 'jira' 
  | 'linear' 
  | 'monday' 
  | 'trello' 
  | 'github' 
  | 'gitlab' 
  | 'slack' 
  | 'teams' 
  | 'notion' 
  | 'clickup' 
  | 'zapier';

export type IntegrationCategory = 
  | 'project_management' 
  | 'issue_tracking' 
  | 'communication' 
  | 'documentation' 
  | 'automation' 
  | 'version_control';

export type SyncDirection = 'to_taskluid' | 'from_taskluid' | 'bidirectional';

export type IntegrationStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'error' 
  | 'syncing' 
  | 'paused';

export type WebhookEventType = 
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'task.status_changed'
  | 'task.assigned'
  | 'comment.added'
  | 'attachment.added'
  | 'project.created'
  | 'project.updated';

// ==================== Core Integration Types ====================

export interface IntegrationConfig {
  id: number;
  organizationId: number;
  provider: IntegrationProvider;
  name: string;
  description?: string;
  isActive: boolean;
  status: IntegrationStatus;
  credentials?: IntegrationCredentials;
  settings: IntegrationSettings;
  syncConfig: SyncConfiguration;
  webhookConfig?: WebhookConfiguration;
  lastSyncAt?: string;
  lastError?: string;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationCredentials {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  oauthCode?: string;
  oauthState?: string;
}

export interface IntegrationSettings {
  defaultProjectId?: string;
  defaultAssigneeMapping?: Record<string, number>; // external user ID -> TaskLuid user ID
  statusMapping?: Record<string, string>; // external status -> TaskLuid status
  priorityMapping?: Record<string, string>; // external priority -> TaskLuid priority
  fieldMappings?: FieldMapping[];
  filters?: IntegrationFilter;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'uppercase' | 'lowercase' | 'date_iso' | 'date_timestamp' | 'none';
  defaultValue?: string | number | boolean;
}

export interface IntegrationFilter {
  projects?: string[];
  statuses?: string[];
  assignees?: string[];
  createdAfter?: string;
  createdBefore?: string;
  includeArchived?: boolean;
  tags?: string[];
}

export interface SyncConfiguration {
  direction: SyncDirection;
  interval: 'realtime' | '5min' | '15min' | '30min' | '1hour' | 'manual';
  autoSync: boolean;
  conflictResolution: 'taskluid_wins' | 'external_wins' | 'newer_wins' | 'manual';
  batchSize: number;
  syncFields: {
    title: boolean;
    description: boolean;
    status: boolean;
    priority: boolean;
    assignee: boolean;
    dueDate: boolean;
    tags: boolean;
    comments: boolean;
    attachments: boolean;
    customFields: boolean;
  };
}

export interface WebhookConfiguration {
  enabled: boolean;
  secret?: string;
  events: WebhookEventType[];
  url?: string; // For incoming webhooks
  externalWebhookId?: string; // ID of webhook registered with external service
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
}

// ==================== Sync Job Types ====================

export interface SyncJob {
  id: number;
  integrationId: number;
  organizationId: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  direction: SyncDirection;
  startedAt: string;
  completedAt?: string;
  stats: SyncStats;
  errors: SyncError[];
  triggeredBy: 'manual' | 'scheduled' | 'webhook';
  createdAt: string;
}

export interface SyncStats {
  totalItems: number;
  processedItems: number;
  createdItems: number;
  updatedItems: number;
  skippedItems: number;
  failedItems: number;
  deletedItems?: number;
}

export interface SyncError {
  itemId: string;
  itemType: 'task' | 'project' | 'comment' | 'attachment';
  errorCode: string;
  errorMessage: string;
  retryable: boolean;
  timestamp: string;
}

// ==================== Import Wizard Types ====================

export interface ImportSource {
  provider: IntegrationProvider;
  configId?: number;
  isConnected: boolean;
}

export interface ImportPreview {
  totalTasks: number;
  totalProjects: number;
  tasksByProject: Record<string, number>;
  tasksByStatus: Record<string, number>;
  tasksByAssignee: Record<string, number>;
  estimatedImportTime: number; // in seconds
  conflicts: ImportConflict[];
}

export interface ImportConflict {
  type: 'duplicate' | 'missing_assignee' | 'missing_project' | 'invalid_status';
  severity: 'warning' | 'error';
  message: string;
  itemId: string;
  itemTitle: string;
  resolution?: 'skip' | 'create' | 'merge' | 'map';
  resolutionValue?: string;
}

export interface ImportOptions {
  targetProjectId?: number;
  createProjects: boolean;
  mapUsers: boolean;
  defaultAssigneeId?: number;
  importComments: boolean;
  importAttachments: boolean;
  importArchived: boolean;
  statusMapping: Record<string, string>;
  priorityMapping: Record<string, string>;
  onConflict: 'skip' | 'create_duplicate' | 'update_existing';
}

export interface ImportJob {
  id: number;
  organizationId: number;
  provider: IntegrationProvider;
  status: 'preview' | 'validating' | 'importing' | 'completed' | 'failed' | 'cancelled';
  sourceConfig: IntegrationConfig;
  options: ImportOptions;
  preview?: ImportPreview;
  stats: ImportStats;
  errors: ImportError[];
  createdAt: string;
  completedAt?: string;
}

export interface ImportStats {
  totalItems: number;
  importedItems: number;
  skippedItems: number;
  failedItems: number;
  processedProjects: number;
  processedTasks: number;
  processedComments: number;
}

export interface ImportError {
  row: number;
  type: string;
  message: string;
  data: Record<string, unknown>;
}

// ==================== Webhook Types ====================

export interface WebhookEndpoint {
  id: number;
  organizationId: number;
  integrationId?: number;
  name: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
  lastTriggeredAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: number;
  webhookId: number;
  event: WebhookEventType;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  responseStatus?: number;
  responseBody?: string;
  attemptCount: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  organizationId: number;
  data: Record<string, unknown>;
  signature: string;
}

// ==================== Provider-Specific Types ====================

export interface IntegrationProviderInfo {
  id: IntegrationProvider;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string;
  color: string;
  authType: 'oauth2' | 'api_key' | 'token';
  oauthConfig?: {
    authorizeUrl: string;
    scope: string[];
  };
  features: {
    bidirectionalSync: boolean;
    webhooks: boolean;
    import: boolean;
    export: boolean;
    realTimeSync: boolean;
  };
  setupInstructions?: string[];
}

export interface ConnectedIntegration {
  config: IntegrationConfig;
  provider: IntegrationProviderInfo;
  health: IntegrationHealth;
  lastSyncJob?: SyncJob;
}

export interface IntegrationHealth {
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  message?: string;
  syncLatency?: number; // in milliseconds
  errorRate?: number; // 0-1
}

// ==================== API Response Types ====================

export interface IntegrationListResponse {
  success: boolean;
  integrations: IntegrationConfig[];
  providers: IntegrationProviderInfo[];
}

export interface IntegrationDetailResponse {
  success: boolean;
  integration: IntegrationConfig;
  syncJobs: SyncJob[];
  health: IntegrationHealth;
}

export interface SyncStartResponse {
  success: boolean;
  jobId: number;
  message: string;
}

export interface ImportPreviewResponse {
  success: boolean;
  preview: ImportPreview;
}

export interface ImportStartResponse {
  success: boolean;
  importId: number;
  message: string;
}
