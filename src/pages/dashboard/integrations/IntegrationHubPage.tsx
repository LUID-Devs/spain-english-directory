/**
 * Enhanced Integration Hub Page
 * Complete integration management with framework features
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useIntegrationFramework } from '@/hooks/useIntegrationFramework';
import { ImportWizard } from '@/components/integrations/ImportWizard';
import { WebhookManager } from '@/components/integrations/WebhookManager';
import { IntegrationSettingsPanel } from '@/components/integrations/IntegrationSettingsPanel';
import type { IntegrationConfig, IntegrationProvider } from '@/types/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Link2,
  Plug,
  RefreshCw,
  AlertTriangle,
  Database,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  XCircle,
  Brain,
  MoreHorizontal,
  Settings,
  Trash2,
  Download,
  Webhook,
  Plus,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
} from 'lucide-react';

const IntegrationHubPage: React.FC = () => {
  const {
    integrations,
    providers,
    connectedIntegrations,
    selectedIntegration,
    syncJobs,
    isLoading,
    isSyncing,
    refreshIntegrations,
    refreshConnectedIntegrations,
    selectIntegration,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    connectOAuth,
    disconnectIntegration,
    testConnection,
    startSync,
    refreshSyncJobs,
    updateSyncConfig,
  } = useIntegrationFramework();

  const [activeTab, setActiveTab] = useState('overview');
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  
  // Confirmation dialog state
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  // Handle OAuth redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const provider = params.get('provider');
    const message = params.get('message');

    if (status === 'connected' && provider) {
      toast.success(`${provider} connected successfully!`);
      refreshIntegrations();
      refreshConnectedIntegrations();
    } else if (status === 'error' && message) {
      toast.error(`Connection failed: ${message}`);
    }

    // Clean up URL
    if (status || provider) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshIntegrations, refreshConnectedIntegrations]);

  const handleConnect = async (provider: IntegrationProvider) => {
    setSelectedProvider(provider);
    await connectOAuth(provider);
  };

  const handleDisconnect = async (integrationId: number) => {
    setPendingActionId(integrationId);
    setDisconnectDialogOpen(true);
  };
  
  const confirmDisconnect = async () => {
    if (pendingActionId !== null) {
      await disconnectIntegration(pendingActionId);
    }
    setDisconnectDialogOpen(false);
    setPendingActionId(null);
  };

  const handleDelete = async (integrationId: number) => {
    setPendingActionId(integrationId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (pendingActionId !== null) {
      await deleteIntegration(pendingActionId);
    }
    setDeleteDialogOpen(false);
    setPendingActionId(null);
  };

  const handleStartSync = async (integrationId: number, direction: 'to_taskluid' | 'from_taskluid' | 'bidirectional') => {
    await startSync(integrationId, direction);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-600">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'syncing':
        return <Badge variant="default" className="bg-blue-600">Syncing...</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'to_taskluid':
        return <ArrowLeft className="h-4 w-4" />;
      case 'from_taskluid':
        return <ArrowRight className="h-4 w-4" />;
      case 'bidirectional':
        return <ArrowLeftRight className="h-4 w-4" />;
      default:
        return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'to_taskluid':
        return 'Import';
      case 'from_taskluid':
        return 'Export';
      case 'bidirectional':
        return 'Two-way';
      default:
        return direction;
    }
  };

  const connectedCount = connectedIntegrations.length;
  const activeIntegrations = integrations.filter(i => i.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Integration Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect TaskLuid to external tools and manage your integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { refreshIntegrations(); refreshConnectedIntegrations(); }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsConnectDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">
            Integrations ({connectedCount})
          </TabsTrigger>
          <TabsTrigger value="import">
            <Download className="h-4 w-4 mr-2" />
            Import
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Connection Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plug className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Third-Party Integrations</h3>
                    <p className="text-sm text-muted-foreground">
                      {connectedCount === 0 
                        ? 'No integrations connected. Connect tools to enable sync.'
                        : `${connectedCount} integration${connectedCount !== 1 ? 's' : ''} active`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {connectedIntegrations.map((ci) => (
                    <div
                      key={ci.config.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: ci.provider.color }}
                      title={ci.provider.name}
                    >
                      {ci.provider.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Integrations Grid */}
          <div>
            <h3 className="text-sm font-medium mb-4">Available Integrations</h3>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {providers.map((provider) => {
                const isConnected = connectedIntegrations.some(
                  ci => ci.config.provider === provider.id
                );
                return (
                  <Card
                    key={provider.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isConnected ? 'border-green-200 bg-green-50/30 dark:bg-green-950/20' : ''
                    }`}
                    onClick={() => !isConnected && handleConnect(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: provider.color }}
                        >
                          {provider.name.charAt(0)}
                        </div>
                        {isConnected ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Badge variant="outline">Connect</Badge>
                        )}
                      </div>
                      <h4 className="font-medium mt-3">{provider.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {provider.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {provider.features.bidirectionalSync && (
                          <Badge variant="outline" className="text-[10px]">Sync</Badge>
                        )}
                        {provider.features.import && (
                          <Badge variant="outline" className="text-[10px]">Import</Badge>
                        )}
                        {provider.features.webhooks && (
                          <Badge variant="outline" className="text-[10px]">Webhooks</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Import from Competitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Migrate your tasks from Asana, Jira, Linear, and more.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsImportWizardOpen(true)}
                >
                  Start Import Wizard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  Real-time Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Configure webhooks for instant sync between tools.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setActiveTab('webhooks')}
                >
                  Manage Webhooks
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI-Powered Queries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Search across all connected tools with natural language.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={connectedCount === 0}
                >
                  Try AI Search
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {integrations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No integrations yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your first integration to start syncing data
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsConnectDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                          style={{
                            backgroundColor: providers.find(p => p.id === integration.provider)?.color || '#666'
                          }}
                        >
                          {integration.provider.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{integration.name}</h3>
                            {getStatusBadge(integration.status)}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {integration.provider} • {getDirectionLabel(integration.syncConfig.direction)}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {getDirectionIcon(integration.syncConfig.direction)}
                              {integration.syncConfig.autoSync ? 'Auto-sync' : 'Manual sync'}
                            </span>
                            {integration.lastSyncAt && (
                              <span>
                                Last synced: {new Date(integration.lastSyncAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartSync(integration.id, 'bidirectional')}
                          disabled={isSyncing || integration.status !== 'connected'}
                        >
                          {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sync Now
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                selectIntegration(integration.id);
                                setIsSettingsDialogOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => testConnection(integration.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Test Connection
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDisconnect(integration.id)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Disconnect
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(integration.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <ImportWizard
            isOpen={isImportWizardOpen}
            onClose={() => setIsImportWizardOpen(false)}
          />
          <div className="text-center py-12">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Import from External Tools</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Use our import wizard to migrate your tasks from Asana, Jira, Linear, and other tools.
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsImportWizardOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Open Import Wizard
            </Button>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
            <DialogDescription>
              Choose a tool to connect with TaskLuid
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {providers.map((provider) => {
              const isConnected = connectedIntegrations.some(
                ci => ci.config.provider === provider.id
              );
              return (
                <button
                  key={provider.id}
                  onClick={() => {
                    if (!isConnected) {
                      handleConnect(provider.id);
                    }
                  }}
                  disabled={isConnected}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isConnected
                      ? 'border-green-200 bg-green-50/30 opacity-60 cursor-not-allowed'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: provider.color }}
                    >
                      {provider.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{provider.name}</span>
                        {isConnected && (
                          <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700">
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Integration Settings</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <IntegrationSettingsPanel
              integration={selectedIntegration}
              onUpdate={(updates) => updateIntegration(selectedIntegration.id, updates)}
              isUpdating={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this integration? You can reconnect it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingActionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisconnect} className="bg-destructive text-destructive-foreground">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this integration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingActionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IntegrationHubPage;
