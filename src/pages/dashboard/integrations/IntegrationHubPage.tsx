import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useAsanaIntegration } from '@/hooks/useAsana';
import { useJiraIntegration } from '@/hooks/useJira';
import { useLinearIntegration } from '@/hooks/useLinear';
import { AIIntegrationSearch } from '@/components/integrations/AIIntegrationSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Link2,
  Plug,
  RefreshCw,
  AlertTriangle,
  Database,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  GitBranch,
  CheckCircle2,
  Brain,
} from 'lucide-react';

const IntegrationHubPage: React.FC = () => {
  const { 
    isConnected: isAsanaConnected, 
    isLoading: isAsanaLoading, 
    error: asanaError, 
    refetchStatus: refetchAsanaStatus 
  } = useAsanaIntegration();

  const { 
    isConnected: isLinearConnected, 
    isLoading: isLinearLoading, 
    error: linearError, 
    refetchStatus: refetchLinearStatus 
  } = useLinearIntegration();

  const { 
    isConnected: isJiraConnected, 
    isLoading: isJiraLoading, 
    error: jiraError, 
    refetchStatus: refetchJiraStatus 
  } = useJiraIntegration();

  useEffect(() => {
    if (asanaError) toast.error(`Asana: ${asanaError}`);
    if (linearError) toast.error(`Linear: ${linearError}`);
    if (jiraError) toast.error(`Jira: ${jiraError}`);
  }, [asanaError, linearError, jiraError]);

  // Handle OAuth redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const asanaStatus = params.get('asana');
    const linearStatus = params.get('linear');
    const jiraStatus = params.get('jira');
    const message = params.get('message');

    if (asanaStatus === 'connected') {
      toast.success('Asana connected successfully!');
      refetchAsanaStatus();
    } else if (asanaStatus === 'error' && message) {
      toast.error(`Asana connection failed: ${message}`);
    }

    if (linearStatus === 'connected') {
      toast.success('Linear connected successfully!');
      refetchLinearStatus();
    } else if (linearStatus === 'error' && message) {
      toast.error(`Linear connection failed: ${message}`);
    }

    if (jiraStatus === 'connected') {
      toast.success('Jira connected successfully!');
      refetchJiraStatus();
    } else if (jiraStatus === 'error' && message) {
      toast.error(`Jira connection failed: ${message}`);
    }

    // Clean up URL
    if (asanaStatus || linearStatus || jiraStatus) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refetchAsanaStatus, refetchLinearStatus, refetchJiraStatus]);

  const handleConnectAsana = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.taskluid.com';
    window.location.href = `${baseUrl}/integrations/oauth/asana/authorize`;
  };

  const handleConnectJira = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.taskluid.com';
    window.location.href = `${baseUrl}/integrations/oauth/jira/authorize`;
  };

  const handleConnectLinear = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.taskluid.com';
    window.location.href = `${baseUrl}/integrations/oauth/linear/authorize`;
  };

  const handleRefreshAll = () => {
    refetchAsanaStatus();
    refetchJiraStatus();
    refetchLinearStatus();
    toast.success('Integration statuses refreshed');
  };

  const getStatusBadge = (isConnected: boolean, isLoading: boolean) => {
    if (isLoading) return <Badge variant="outline">Checking...</Badge>;
    if (isConnected) return <Badge variant="default" className="bg-green-600">Connected</Badge>;
    return <Badge variant="secondary">Not connected</Badge>;
  };

  const connectedCount = [isAsanaConnected, isLinearConnected, isJiraConnected].filter(Boolean).length;
  const isAnyLoading = isAsanaLoading || isLinearLoading || isJiraLoading;
  const hasAnyConnection = isAsanaConnected || isLinearConnected || isJiraConnected;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Integration Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect TaskLuid to Asana, Jira, and Linear to keep projects synced across tools.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={isAnyLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnyLoading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Connection Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plug className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Cross-Platform Integrations</h3>
                <p className="text-sm text-muted-foreground">
                  {connectedCount === 0 
                    ? 'No integrations connected. Connect at least one tool to get started.'
                    : `${connectedCount} of 3 integrations connected`
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isAsanaConnected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {isLinearConnected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {isJiraConnected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Asana Card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#F06A6A] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                Asana
              </CardTitle>
              <CardDescription>Tasks, projects, comments</CardDescription>
            </div>
            {getStatusBadge(isAsanaConnected, isAsanaLoading)}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="h-4 w-4" />
              <span>Bi-directional sync ready</span>
            </div>
            {asanaError && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{asanaError}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleConnectAsana}
                disabled={isAsanaLoading || isAsanaConnected}
              >
                {isAsanaConnected ? 'Connected' : 'Connect Asana'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchAsanaStatus()}
                disabled={isAsanaLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Linear Card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#5E6AD2] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                Linear
              </CardTitle>
              <CardDescription>Issues, cycles, projects</CardDescription>
            </div>
            {getStatusBadge(isLinearConnected, isLinearLoading)}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="h-4 w-4" />
              <span>Bi-directional sync ready</span>
            </div>
            {linearError && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{linearError}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleConnectLinear}
                disabled={isLinearLoading || isLinearConnected}
              >
                {isLinearConnected ? 'Connected' : 'Connect Linear'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchLinearStatus()}
                disabled={isLinearLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jira Card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#0052CC] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">J</span>
                </div>
                Jira
              </CardTitle>
              <CardDescription>Issues, sprints, comments</CardDescription>
            </div>
            {getStatusBadge(isJiraConnected, isJiraLoading)}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="h-4 w-4" />
              <span>Bi-directional sync ready</span>
            </div>
            {jiraError && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{jiraError}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleConnectJira}
                disabled={isJiraLoading || isJiraConnected}
              >
                {isJiraConnected ? 'Connected' : 'Connect Jira'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchJiraStatus()}
                disabled={isJiraLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <AIIntegrationSearch
          hasConnections={hasAnyConnection}
          connectedSources={{
            asana: isAsanaConnected,
            linear: isLinearConnected,
            jira: isJiraConnected,
          }}
        />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI-Powered Queries
              </CardTitle>
              <CardDescription>
                Use natural language to search across all your connected tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Ask questions like:</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>&quot;Show me overdue tasks grouped by assignee&quot;</li>
                <li>&quot;Find high priority issues from last week&quot;</li>
                <li>&quot;What tasks are assigned to me?&quot;</li>
                <li>&quot;List all blocked tasks across all tools&quot;</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connected Status</CardTitle>
              <CardDescription>Overview of your integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>
                  {hasAnyConnection 
                    ? `${connectedCount} integration${connectedCount !== 1 ? 's' : ''} active` 
                    : 'No active integrations'}
                </span>
              </div>
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground space-y-2">
                {isAsanaConnected && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F06A6A]" />
                    <span>Asana</span>
                    <CheckCircle2 className="h-3 w-3 text-green-600 ml-auto" />
                  </div>
                )}
                {isJiraConnected && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0052CC]" />
                    <span>Jira</span>
                    <CheckCircle2 className="h-3 w-3 text-green-600 ml-auto" />
                  </div>
                )}
                {isLinearConnected && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
                    <span>Linear</span>
                    <CheckCircle2 className="h-3 w-3 text-green-600 ml-auto" />
                  </div>
                )}
                {!hasAnyConnection && (
                  <span className="text-xs">Connect an integration to get started.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Smart duplicate detection</CardTitle>
            <CardDescription>Identify tasks that exist in multiple tools.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>{connectedCount >= 2 ? 'Ready to detect duplicates' : 'Requires at least 2 connected integrations.'}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Permission-aware syncing</CardTitle>
            <CardDescription>Respect source tool access controls.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Only data you can access is synced.</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sync health</CardTitle>
            <CardDescription>Monitor the latest integration runs.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>{connectedCount > 0 ? 'Sync active' : 'Sync history will appear after your first connection.'}</span>
          </CardContent>
        </Card>
      </div>

      {hasAnyConnection && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Cross-Platform Linking
              </CardTitle>
              <CardDescription>
                Link TaskLuid tasks to issues in your connected tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {isAsanaConnected && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded bg-[#F06A6A] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Asana</p>
                      <p className="text-xs text-muted-foreground">Link from task detail page</p>
                    </div>
                  </div>
                )}
                {isJiraConnected && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded bg-[#0052CC] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">J</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Jira</p>
                      <p className="text-xs text-muted-foreground">Link from task detail page</p>
                    </div>
                  </div>
                )}
                {isLinearConnected && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded bg-[#5E6AD2] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Linear</p>
                      <p className="text-xs text-muted-foreground">Link from task detail page</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IntegrationHubPage;
