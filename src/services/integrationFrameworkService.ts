/**
 * Integration Framework Service
 * Core API service for managing third-party integrations
 */

import { apiService } from './apiService';
import type {
  IntegrationConfig,
  IntegrationProvider,
  IntegrationProviderInfo,
  IntegrationSettings,
  SyncConfiguration,
  WebhookConfiguration,
  SyncJob,
  SyncStats,
  ImportJob,
  ImportOptions,
  ImportPreview,
  WebhookEndpoint,
  WebhookDelivery,
  WebhookEventType,
  IntegrationListResponse,
  IntegrationDetailResponse,
  SyncStartResponse,
  ImportStartResponse,
  ImportPreviewResponse,
  IntegrationHealth,
  ConnectedIntegration,
  FieldMapping,
} from '@/types/integrations';

// ==================== Integration Management ====================

/**
 * Get all available integration providers
 */
export async function getIntegrationProviders(): Promise<{
  data?: IntegrationProviderInfo[];
  error?: string;
}> {
  try {
    const data = await apiService.request<IntegrationProviderInfo[]>('/integrations/providers');
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch integration providers' };
  }
}

/**
 * Get all configured integrations for the organization
 */
export async function getIntegrations(): Promise<IntegrationListResponse & { error?: string }> {
  try {
    const data = await apiService.request<IntegrationListResponse>('/integrations');
    return data;
  } catch (error: any) {
    return { success: false, integrations: [], providers: [], error: error.message };
  }
}

/**
 * Get a specific integration configuration
 */
export async function getIntegration(
  integrationId: number
): Promise<IntegrationDetailResponse & { error?: string }> {
  try {
    const data = await apiService.request<IntegrationDetailResponse>(`/integrations/${integrationId}`);
    return data;
  } catch (error: any) {
    return { 
      success: false, 
      integration: {} as IntegrationConfig, 
      syncJobs: [], 
      health: {} as IntegrationHealth, 
      error: error.message 
    };
  }
}

/**
 * Create a new integration configuration
 */
export async function createIntegration(
  provider: IntegrationProvider,
  name: string,
  settings: Partial<IntegrationSettings> = {}
): Promise<{ success: boolean; integration?: IntegrationConfig; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; integration: IntegrationConfig }>('/integrations', {
      method: 'POST',
      body: JSON.stringify({ provider, name, settings }),
    });
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an integration configuration
 */
export async function updateIntegration(
  integrationId: number,
  updates: Partial<IntegrationConfig>
): Promise<{ success: boolean; integration?: IntegrationConfig; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; integration: IntegrationConfig }>(
      `/integrations/${integrationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete an integration configuration
 */
export async function deleteIntegration(
  integrationId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; message: string }>(
      `/integrations/${integrationId}`,
      { method: 'DELETE' }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Test an integration connection
 */
export async function testIntegrationConnection(
  integrationId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; message: string }>(
      `/integrations/${integrationId}/test`
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== OAuth Flow ====================

/**
 * Get OAuth authorization URL for a provider
 */
export async function getOAuthUrl(
  provider: IntegrationProvider,
  redirectUrl?: string
): Promise<{ url?: string; state?: string; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (redirectUrl) params.append('redirectUrl', redirectUrl);
    
    const data = await apiService.request<{ url: string; state: string }>(
      `/integrations/oauth/${provider}/authorize?${params.toString()}`
    );
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Exchange OAuth code for tokens
 */
export async function exchangeOAuthCode(
  provider: IntegrationProvider,
  code: string,
  state: string
): Promise<{ success: boolean; integration?: IntegrationConfig; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; integration: IntegrationConfig }>(
      `/integrations/oauth/${provider}/callback`,
      {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Disconnect an integration (revoke tokens)
 */
export async function disconnectIntegration(
  integrationId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; message: string }>(
      `/integrations/${integrationId}/disconnect`,
      { method: 'POST' }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== Sync Management ====================

/**
 * Start a sync job
 */
export async function startSync(
  integrationId: number,
  direction: 'to_taskluid' | 'from_taskluid' | 'bidirectional',
  options?: { fullSync?: boolean; taskIds?: number[] }
): Promise<SyncStartResponse & { error?: string }> {
  try {
    const data = await apiService.request<SyncStartResponse>(`/integrations/${integrationId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ direction, ...options }),
    });
    return data;
  } catch (error: any) {
    return { success: false, jobId: 0, message: error.message, error: error.message };
  }
}

/**
 * Get sync jobs for an integration
 */
export async function getSyncJobs(
  integrationId: number,
  options?: { limit?: number; offset?: number }
): Promise<{ success: boolean; jobs: SyncJob[]; total: number; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const data = await apiService.request<{ success: boolean; jobs: SyncJob[]; total: number }>(
      `/integrations/${integrationId}/sync-jobs?${params.toString()}`
    );
    return data;
  } catch (error: any) {
    return { success: false, jobs: [], total: 0, error: error.message };
  }
}

/**
 * Get sync job details
 */
export async function getSyncJob(
  jobId: number
): Promise<{ success: boolean; job?: SyncJob; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; job: SyncJob }>(`/sync-jobs/${jobId}`);
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancel a running sync job
 */
export async function cancelSyncJob(
  jobId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; message: string }>(
      `/sync-jobs/${jobId}/cancel`,
      { method: 'POST' }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update sync configuration
 */
export async function updateSyncConfig(
  integrationId: number,
  config: Partial<SyncConfiguration>
): Promise<{ success: boolean; config?: SyncConfiguration; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; config: SyncConfiguration }>(
      `/integrations/${integrationId}/sync-config`,
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== Import Wizard ====================

/**
 * Get import preview
 */
export async function getImportPreview(
  provider: IntegrationProvider,
  options: Partial<ImportOptions>
): Promise<ImportPreviewResponse & { error?: string }> {
  try {
    const data = await apiService.request<ImportPreviewResponse>('/integrations/import/preview', {
      method: 'POST',
      body: JSON.stringify({ provider, options }),
    });
    return data;
  } catch (error: any) {
    return { success: false, preview: null as any, error: error.message };
  }
}

/**
 * Start import job
 */
export async function startImport(
  provider: IntegrationProvider,
  options: ImportOptions
): Promise<ImportStartResponse & { error?: string }> {
  try {
    const data = await apiService.request<ImportStartResponse>('/integrations/import', {
      method: 'POST',
      body: JSON.stringify({ provider, options }),
    });
    return data;
  } catch (error: any) {
    return { success: false, importId: 0, message: error.message, error: error.message };
  }
}

/**
 * Get import job status
 */
export async function getImportJob(
  importId: number
): Promise<{ success: boolean; job?: ImportJob; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; job: ImportJob }>(`/import-jobs/${importId}`);
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancel import job
 */
export async function cancelImportJob(
  importId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; message: string }>(
      `/import-jobs/${importId}/cancel`,
      { method: 'POST' }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get available import sources (connected integrations that support import)
 */
export async function getImportSources(): Promise<{
  success: boolean;
  sources: Array<{ provider: IntegrationProvider; configId: number; name: string }>;
  error?: string;
}> {
  try {
    const data = await apiService.request<{
      success: boolean;
      sources: Array<{ provider: IntegrationProvider; configId: number; name: string }>;
    }>('/integrations/import/sources');
    return data;
  } catch (error: any) {
    return { success: false, sources: [], error: error.message };
  }
}

// ==================== Webhook Management ====================

/**
 * Get webhook endpoints
 */
export async function getWebhookEndpoints(
  integrationId?: number
): Promise<{ success: boolean; endpoints: WebhookEndpoint[]; error?: string }> {
  try {
    const params = integrationId ? `?integrationId=${integrationId}` : '';
    const data = await apiService.request<{ success: boolean; endpoints: WebhookEndpoint[] }>(
      `/webhooks/endpoints${params}`
    );
    return data;
  } catch (error: any) {
    return { success: false, endpoints: [], error: error.message };
  }
}

/**
 * Create webhook endpoint
 */
export async function createWebhookEndpoint(
  endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt' | 'lastError'>
): Promise<{ success: boolean; endpoint?: WebhookEndpoint; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; endpoint: WebhookEndpoint }>(
      '/webhooks/endpoints',
      {
        method: 'POST',
        body: JSON.stringify(endpoint),
      }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update webhook endpoint
 */
export async function updateWebhookEndpoint(
  endpointId: number,
  updates: Partial<WebhookEndpoint>
): Promise<{ success: boolean; endpoint?: WebhookEndpoint; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; endpoint: WebhookEndpoint }>(
      `/webhooks/endpoints/${endpointId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete webhook endpoint
 */
export async function deleteWebhookEndpoint(
  endpointId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; message: string }>(
      `/webhooks/endpoints/${endpointId}`,
      { method: 'DELETE' }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get webhook deliveries
 */
export async function getWebhookDeliveries(
  endpointId: number,
  options?: { limit?: number; offset?: number }
): Promise<{ success: boolean; deliveries: WebhookDelivery[]; total: number; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const data = await apiService.request<{ success: boolean; deliveries: WebhookDelivery[]; total: number }>(
      `/webhooks/endpoints/${endpointId}/deliveries?${params.toString()}`
    );
    return data;
  } catch (error: any) {
    return { success: false, deliveries: [], total: 0, error: error.message };
  }
}

/**
 * Regenerate webhook secret
 */
export async function regenerateWebhookSecret(
  endpointId: number
): Promise<{ success: boolean; secret?: string; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; secret: string }>(
      `/webhooks/endpoints/${endpointId}/regenerate-secret`,
      { method: 'POST' }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update webhook configuration for an integration
 */
export async function updateWebhookConfig(
  integrationId: number,
  config: Partial<WebhookConfiguration>
): Promise<{ success: boolean; config?: WebhookConfiguration; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; config: WebhookConfiguration }>(
      `/integrations/${integrationId}/webhook-config`,
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== Health & Status ====================

/**
 * Get integration health status
 */
export async function getIntegrationHealth(
  integrationId: number
): Promise<{ success: boolean; health?: IntegrationHealth; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; health: IntegrationHealth }>(
      `/integrations/${integrationId}/health`
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all connected integrations with health info
 */
export async function getConnectedIntegrations(): Promise<{
  success: boolean;
  integrations: ConnectedIntegration[];
  error?: string;
}> {
  try {
    const data = await apiService.request<{ success: boolean; integrations: ConnectedIntegration[] }>(
      '/integrations/connected'
    );
    return data;
  } catch (error: any) {
    return { success: false, integrations: [], error: error.message };
  }
}

// ==================== Field Mapping ====================

/**
 * Get suggested field mappings for a provider
 */
export async function getSuggestedFieldMappings(
  provider: IntegrationProvider
): Promise<{ success: boolean; mappings?: FieldMapping[]; error?: string }> {
  try {
    const data = await apiService.request<{ success: boolean; mappings: FieldMapping[] }>(
      `/integrations/providers/${provider}/field-mappings`
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Validate field mappings
 */
export async function validateFieldMappings(
  provider: IntegrationProvider,
  mappings: FieldMapping[]
): Promise<{ success: boolean; valid: boolean; errors?: string[] }> {
  try {
    const data = await apiService.request<{ success: boolean; valid: boolean; errors: string[] }>(
      `/integrations/providers/${provider}/validate-mappings`,
      {
        method: 'POST',
        body: JSON.stringify({ mappings }),
      }
    );
    return data;
  } catch (error: any) {
    return { success: false, valid: false, errors: [error.message] };
  }
}
