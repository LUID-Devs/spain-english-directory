import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useAsanaIntegration } from '@/hooks/useAsana';
import { useJiraIntegration } from '@/hooks/useJira';
import { useLinearIntegration } from '@/hooks/useLinear';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Link2,
  Plug,
  RefreshCw,
  AlertTriangle,
  Database,
  Search,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  GitBranch,
} from 'lucide-react';

const IntegrationHubPage: React.FC = () => {
  const { 
    isConnected: isAsanaConnected, 
    isLoading: isAsanaLoading, 
    error: asanaError, 
    refetchStatus: refetchAsanaStatus 
  } = useAsanaIntegration();
  
  const { 
    isConnected: isJiraConnected, 
    isLoading: isJiraLoading, 
    error: jiraError, 
    domain: jiraDomain,
    refetchStatus: refetchJiraStatus 
  } = useJiraIntegration();
  
  const { 
    isConnected: isLinearConnected, 
    isLoading: isLinearLoading, 
    error: linearError, 
    refetchStatus: refetchLinearStatus 
  } = useLinearIntegration();

  const hasAnyConnection = isAsanaConnected || isJiraConnected || isLinearConnected;
  const isAnyLoading = isAsanaLoading || isJiraLoading || isLinearLoading;

  useEffect(() => {
    if (asanaError) toast.error(`Asana: ${asanaError}`);
    if (jiraError) toast.error(`Jira: ${jiraError}`);
    if (linearError) toast.error(`Linear: ${linearError}`);
  }, [asanaError, jiraError, linearError]);

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
            <Badge variant={isAsanaConnected ? 'default' : 'secondary'}>
              {isAsanaLoading ? 'Checking' : isAsanaConnected ? 'Connected' : 'Not connected'}
            </Badge>
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
              {isAsanaConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchAsanaStatus()}
                  disabled={isAsanaLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
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
            <Badge variant={isJiraConnected ? 'default' : 'secondary'}>
              {isJiraLoading ? 'Checking' : isJiraConnected ? 'Connected' : 'Not connected'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isJiraConnected && jiraDomain ? (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={`https://${jiraDomain}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {jiraDomain}
                  </a>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  <span>Bi-directional sync ready</span>
                </>
              )}
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
              {isJiraConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchJiraStatus()}
                  disabled={isJiraLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
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
            <Badge variant={isLinearConnected ? 'default' : 'secondary'}>
              {isLinearLoading ? 'Checking' : isLinearConnected ? 'Connected' : 'Not connected'}
            </Badge>
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
              {isLinearConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchLinearStatus()}
                  disabled={isLinearLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unified Dashboard</CardTitle>
            <CardDescription>See tasks from every connected tool in one place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>
                {hasAnyConnection 
                  ? 'Tasks from connected tools will surface here after sync.' 
                  : 'Connect a tool to populate the dashboard.'}
              </span>
            </div>
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              {hasAnyConnection ? (
                <div className="flex items-center gap-4">
                  {isAsanaConnected && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F06A6A]" />
                      <span>Asana connected</span>
                    </div>
                  )}
                  {isJiraConnected && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#0052CC]" />
                      <span>Jira connected</span>
                    </div>
                  )}
                  {isLinearConnected && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
                      <span>Linear connected</span>
                    </div>
                  )}
                </div>
              ) : (
                'No integrations connected yet.'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cross-tool search</CardTitle>
            <CardDescription>Search tasks across Asana, Jira, and Linear.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search across tools" disabled={!hasAnyConnection} />
            </div>
            <p className="text-xs text-muted-foreground">
              {hasAnyConnection 
                ? 'Type to search for tasks across your connected integrations.'
                : 'Connect integrations to unlock unified search and filtering.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Smart duplicate detection</CardTitle>
            <CardDescription>Identify tasks that exist in multiple tools.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>{hasAnyConnection ? 'Scanning for duplicates...' : 'Requires at least one connected integration.'}</span>
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
            <span>{hasAnyConnection ? 'All systems operational' : 'Sync history will appear after your first connection.'}</span>
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
