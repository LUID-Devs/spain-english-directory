/**
 * Integration Framework Hook
 * React hook for managing third-party integrations
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
  IntegrationConfig,
  IntegrationProvider,
  IntegrationProviderInfo,
  IntegrationSettings,
  SyncConfiguration,
  WebhookConfiguration,
  SyncJob,
  ImportJob,
  ImportOptions,
  ImportPreview,
  WebhookEndpoint,
  ConnectedIntegration,
  FieldMapping,
} from '@/types/integrations';
import * as integrationService from '@/services/integrationFrameworkService';

export interface UseIntegrationFrameworkReturn {
  // State
  integrations: IntegrationConfig[];
  providers: IntegrationProviderInfo[];
  connectedIntegrations: ConnectedIntegration[];
  selectedIntegration: IntegrationConfig | null;
  syncJobs: SyncJob[];
  importJobs: ImportJob[];
  webhookEndpoints: WebhookEndpoint[];
  importPreview: ImportPreview | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingProviders: boolean;
  isLoadingSyncJobs: boolean;
  isLoadingImportJobs: boolean;
  isLoadingWebhooks: boolean;
  isSyncing: boolean;
  isImporting: boolean;
  
  // Actions
  refreshIntegrations: () => Promise<void>;
  refreshProviders: () => Promise<void>;
  refreshConnectedIntegrations: () => Promise<void>;
  selectIntegration: (integrationId: number) => Promise<void>;
  createIntegration: (provider: IntegrationProvider, name: string) => Promise<boolean>;
  updateIntegration: (integrationId: number, updates: Partial<IntegrationConfig>) => Promise<boolean>;
  deleteIntegration: (integrationId: number) => Promise<boolean>;
  connectOAuth: (provider: IntegrationProvider) => Promise<void>;
  disconnectIntegration: (integrationId: number) => Promise<boolean>;
  testConnection: (integrationId: number) => Promise<boolean>;
  
  // Sync actions
  startSync: (integrationId: number, direction: 'to_taskluid' | 'from_taskluid' | 'bidirectional') => Promise<boolean>;
  refreshSyncJobs: (integrationId: number) => Promise<void>;
  cancelSyncJob: (jobId: number) => Promise<boolean>;
  updateSyncConfig: (integrationId: number, config: Partial<SyncConfiguration>) => Promise<boolean>;
  
  // Import actions
  getImportPreview: (provider: IntegrationProvider, options: Partial<ImportOptions>) => Promise<boolean>;
  startImport: (provider: IntegrationProvider, options: ImportOptions) => Promise<number | null>;
  refreshImportJobs: () => Promise<void>;
  cancelImportJob: (importId: number) => Promise<boolean>;
  
  // Webhook actions
  refreshWebhookEndpoints: (integrationId?: number) => Promise<void>;
  createWebhookEndpoint: (endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt' | 'lastError'>) => Promise<boolean>;
  updateWebhookEndpoint: (endpointId: number, updates: Partial<WebhookEndpoint>) => Promise<boolean>;
  deleteWebhookEndpoint: (endpointId: number) => Promise<boolean>;
  regenerateWebhookSecret: (endpointId: number) => Promise<string | null>;
  updateWebhookConfig: (integrationId: number, config: Partial<WebhookConfiguration>) => Promise<boolean>;
  
  // Field mapping
  getSuggestedFieldMappings: (provider: IntegrationProvider) => Promise<FieldMapping[]>;
  validateFieldMappings: (provider: IntegrationProvider, mappings: FieldMapping[]) => Promise<boolean>;
}

export function useIntegrationFramework(): UseIntegrationFrameworkReturn {
  // State
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [providers, setProviders] = useState<IntegrationProviderInfo[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [webhookEndpoints, setWebhookEndpoints] = useState<WebhookEndpoint[]>([]);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingSyncJobs, setIsLoadingSyncJobs] = useState(false);
  const [isLoadingImportJobs, setIsLoadingImportJobs] = useState(false);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // ==================== Data Fetching ====================

  const refreshIntegrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await integrationService.getIntegrations();
      if (result.success) {
        setIntegrations(result.integrations);
        setProviders(result.providers);
      } else if (result.error) {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProviders = useCallback(async () => {
    setIsLoadingProviders(true);
    try {
      const result = await integrationService.getIntegrationProviders();
      if (result.data) {
        setProviders(result.data);
      } else if (result.error) {
        toast.error(result.error);
      }
    } finally {
      setIsLoadingProviders(false);
    }
  }, []);

  const refreshConnectedIntegrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await integrationService.getConnectedIntegrations();
      if (result.success) {
        setConnectedIntegrations(result.integrations);
      } else if (result.error) {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectIntegration = useCallback(async (integrationId: number) => {
    setIsLoading(true);
    try {
      const result = await integrationService.getIntegration(integrationId);
      if (result.success) {
        setSelectedIntegration(result.integration);
        setSyncJobs(result.syncJobs);
      } else if (result.error) {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== CRUD Operations ====================

  const createIntegration = useCallback(async (provider: IntegrationProvider, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await integrationService.createIntegration(provider, name);
      if (result.success && result.integration) {
        setIntegrations(prev => [...prev, result.integration!]);
        toast.success('Integration created successfully');
        return true;
      } else if (result.error) {
        toast.error(result.error);
        return false;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIntegration = useCallback(async (integrationId: number, updates: Partial<IntegrationConfig>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await integrationService.updateIntegration(integrationId, updates);
      if (result.success && result.integration) {
        setIntegrations(prev => 
          prev.map(int => int.id === integrationId ? result.integration! : int)
        );
        if (selectedIntegration?.id === integrationId) {
          setSelectedIntegration(result.integration);
        }
        toast.success('Integration updated successfully');
        return true;
      } else if (result.error) {
        toast.error(result.error);
        return false;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedIntegration]);

  const deleteIntegration = useCallback(async (integrationId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await integrationService.deleteIntegration(integrationId);
      if (result.success) {
        setIntegrations(prev => prev.filter(int => int.id !== integrationId));
        if (selectedIntegration?.id === integrationId) {
          setSelectedIntegration(null);
        }
        toast.success('Integration deleted successfully');
        return true;
      } else if (result.error) {
        toast.error(result.error);
        return false;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedIntegration]);

  // ==================== Connection Management ====================

  const connectOAuth = useCallback(async (provider: IntegrationProvider): Promise<void> => {
    const result = await integrationService.getOAuthUrl(provider);
    if (result.url) {
      window.location.href = result.url;
    } else if (result.error) {
      toast.error(result.error);
    }
  }, []);

  const disconnectIntegration = useCallback(async (integrationId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await integrationService.disconnectIntegration(integrationId);
      if (result.success) {
        setIntegrations(prev => 
          prev.map(int => 
            int.id === integrationId 
              ? { ...int, status: 'disconnected' as const }
              : int
          )
        );
        toast.success('Integration disconnected');
        return true;
      } else if (result.error) {
        toast.error(result.error);
        return false;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (integrationId: number): Promise<boolean> => {
    const result = await integrationService.testIntegrationConnection(integrationId);
    if (result.success) {
      toast.success(result.message || 'Connection successful');
      return true;
    } else {
      toast.error(result.error || 'Connection failed');
      return false;
    }
  }, []);

  // ==================== Sync Operations ====================

  const startSync = useCallback(async (
    integrationId: number,
    direction: 'to_taskluid' | 'from_taskluid' | 'bidirectional'
  ): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const result = await integrationService.startSync(integrationId, direction);
      if (result.success) {
        toast.success(result.message || 'Sync started');
        await refreshSyncJobs(integrationId);
        return true;
      } else {
        toast.error(result.error || 'Failed to start sync');
        return false;
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refreshSyncJobs = useCallback(async (integrationId: number): Promise<void> => {
    setIsLoadingSyncJobs(true);
    try {
      const result = await integrationService.getSyncJobs(integrationId, { limit: 10 });
      if (result.success) {
        setSyncJobs(result.jobs);
      } else if (result.error) {
        toast.error(result.error);
      }
    } finally {
      setIsLoadingSyncJobs(false);
    }
  }, []);

  const cancelSyncJob = useCallback(async (jobId: number): Promise<boolean> => {
    const result = await integrationService.cancelSyncJob(jobId);
    if (result.success) {
      toast.success(result.message || 'Sync cancelled');
      return true;
    } else {
      toast.error(result.error || 'Failed to cancel sync');
      return false;
    }
  }, []);

  const updateSyncConfig = useCallback(async (integrationId: number, config: Partial<SyncConfiguration>): Promise<boolean> => {
    const result = await integrationService.updateSyncConfig(integrationId, config);
    if (result.success) {
      toast.success('Sync configuration updated');
      return true;
    } else {
      toast.error(result.error || 'Failed to update sync configuration');
      return false;
    }
  }, []);

  // ==================== Import Operations ====================

  const getImportPreview = useCallback(async (
    provider: IntegrationProvider,
    options: Partial<ImportOptions>
  ): Promise<boolean> => {
    setIsImporting(true);
    try {
      const result = await integrationService.getImportPreview(provider, options);
      if (result.success && result.preview) {
        setImportPreview(result.preview);
        return true;
      } else if (result.error) {
        toast.error(result.error);
        return false;
      }
      return false;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const startImport = useCallback(async (
    provider: IntegrationProvider,
    options: ImportOptions
  ): Promise<number | null> => {
    setIsImporting(true);
    try {
      const result = await integrationService.startImport(provider, options);
      if (result.success) {
        toast.success(result.message || 'Import started');
        return result.importId;
      } else {
        toast.error(result.error || 'Failed to start import');
        return null;
      }
    } finally {
      setIsImporting(false);
    }
  }, []);

  const refreshImportJobs = useCallback(async (): Promise<void> => {
    setIsLoadingImportJobs(true);
    try {
      // This would need a specific endpoint for all import jobs
      // For now, we'll clear the state
      setImportJobs([]);
    } finally {
      setIsLoadingImportJobs(false);
    }
  }, []);

  const cancelImportJob = useCallback(async (importId: number): Promise<boolean> => {
    const result = await integrationService.cancelImportJob(importId);
    if (result.success) {
      toast.success(result.message || 'Import cancelled');
      return true;
    } else {
      toast.error(result.error || 'Failed to cancel import');
      return false;
    }
  }, []);

  // ==================== Webhook Operations ====================

  const refreshWebhookEndpoints = useCallback(async (integrationId?: number): Promise<void> => {
    setIsLoadingWebhooks(true);
    try {
      const result = await integrationService.getWebhookEndpoints(integrationId);
      if (result.success) {
        setWebhookEndpoints(result.endpoints);
      } else if (result.error) {
        toast.error(result.error);
      }
    } finally {
      setIsLoadingWebhooks(false);
    }
  }, []);

  const createWebhookEndpoint = useCallback(async (
    endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt' | 'lastError'>
  ): Promise<boolean> => {
    const result = await integrationService.createWebhookEndpoint(endpoint);
    if (result.success && result.endpoint) {
      setWebhookEndpoints(prev => [...prev, result.endpoint!]);
      toast.success('Webhook endpoint created');
      return true;
    } else {
      toast.error(result.error || 'Failed to create webhook endpoint');
      return false;
    }
  }, []);

  const updateWebhookEndpoint = useCallback(async (
    endpointId: number,
    updates: Partial<WebhookEndpoint>
  ): Promise<boolean> => {
    const result = await integrationService.updateWebhookEndpoint(endpointId, updates);
    if (result.success && result.endpoint) {
      setWebhookEndpoints(prev => 
        prev.map(ep => ep.id === endpointId ? result.endpoint! : ep)
      );
      toast.success('Webhook endpoint updated');
      return true;
    } else {
      toast.error(result.error || 'Failed to update webhook endpoint');
      return false;
    }
  }, []);

  const deleteWebhookEndpoint = useCallback(async (endpointId: number): Promise<boolean> => {
    const result = await integrationService.deleteWebhookEndpoint(endpointId);
    if (result.success) {
      setWebhookEndpoints(prev => prev.filter(ep => ep.id !== endpointId));
      toast.success('Webhook endpoint deleted');
      return true;
    } else {
      toast.error(result.error || 'Failed to delete webhook endpoint');
      return false;
    }
  }, []);

  const regenerateWebhookSecret = useCallback(async (endpointId: number): Promise<string | null> => {
    const result = await integrationService.regenerateWebhookSecret(endpointId);
    if (result.success && result.secret) {
      toast.success('Webhook secret regenerated');
      return result.secret;
    } else {
      toast.error(result.error || 'Failed to regenerate webhook secret');
      return null;
    }
  }, []);

  const updateWebhookConfig = useCallback(async (
    integrationId: number,
    config: Partial<WebhookConfiguration>
  ): Promise<boolean> => {
    const result = await integrationService.updateWebhookConfig(integrationId, config);
    if (result.success) {
      toast.success('Webhook configuration updated');
      return true;
    } else {
      toast.error(result.error || 'Failed to update webhook configuration');
      return false;
    }
  }, []);

  // ==================== Field Mapping ====================

  const getSuggestedFieldMappings = useCallback(async (provider: IntegrationProvider): Promise<FieldMapping[]> => {
    const result = await integrationService.getSuggestedFieldMappings(provider);
    if (result.success && result.mappings) {
      return result.mappings;
    }
    return [];
  }, []);

  const validateFieldMappings = useCallback(async (
    provider: IntegrationProvider,
    mappings: FieldMapping[]
  ): Promise<boolean> => {
    const result = await integrationService.validateFieldMappings(provider, mappings);
    if (result.success && result.valid) {
      return true;
    }
    if (result.errors) {
      result.errors.forEach(error => toast.error(error));
    }
    return false;
  }, []);

  // ==================== Effects ====================

  useEffect(() => {
    refreshProviders();
    refreshIntegrations();
    refreshConnectedIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    integrations,
    providers,
    connectedIntegrations,
    selectedIntegration,
    syncJobs,
    importJobs,
    webhookEndpoints,
    importPreview,
    
    // Loading states
    isLoading,
    isLoadingProviders,
    isLoadingSyncJobs,
    isLoadingImportJobs,
    isLoadingWebhooks,
    isSyncing,
    isImporting,
    
    // Actions
    refreshIntegrations,
    refreshProviders,
    refreshConnectedIntegrations,
    selectIntegration,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    connectOAuth,
    disconnectIntegration,
    testConnection,
    
    // Sync actions
    startSync,
    refreshSyncJobs,
    cancelSyncJob,
    updateSyncConfig,
    
    // Import actions
    getImportPreview,
    startImport,
    refreshImportJobs,
    cancelImportJob,
    
    // Webhook actions
    refreshWebhookEndpoints,
    createWebhookEndpoint,
    updateWebhookEndpoint,
    deleteWebhookEndpoint,
    regenerateWebhookSecret,
    updateWebhookConfig,
    
    // Field mapping
    getSuggestedFieldMappings,
    validateFieldMappings,
  };
}
