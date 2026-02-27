import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useAsanaIntegration } from '@/hooks/useAsana';
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
} from 'lucide-react';

const IntegrationHubPage: React.FC = () => {
  const { isConnected, isLoading, error, refetchStatus } = useAsanaIntegration();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleConnectAsana = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.taskluid.com';
    window.location.href = `${baseUrl}/integrations/asana/connect`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Integration Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect TaskLuid to Asana, Jira, and Linear to keep projects synced across tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Asana</CardTitle>
              <CardDescription>Tasks, projects, comments</CardDescription>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isLoading ? 'Checking' : isConnected ? 'Connected' : 'Not connected'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="h-4 w-4" />
              <span>Bi-directional sync ready</span>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleConnectAsana}
                disabled={isLoading || isConnected}
              >
                {isConnected ? 'Connected' : 'Connect Asana'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchStatus()}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Jira</CardTitle>
              <CardDescription>Issues, sprints, comments</CardDescription>
            </div>
            <Badge variant="secondary">Coming soon</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Plug className="h-4 w-4" />
              <span>Planned bi-directional sync</span>
            </div>
            <Button size="sm" variant="outline" disabled>
              Connect Jira
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Linear</CardTitle>
              <CardDescription>Issues, cycles, projects</CardDescription>
            </div>
            <Badge variant="secondary">Coming soon</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Plug className="h-4 w-4" />
              <span>Planned bi-directional sync</span>
            </div>
            <Button size="sm" variant="outline" disabled>
              Connect Linear
            </Button>
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
              <span>{isConnected ? 'Asana tasks will surface here after sync.' : 'Connect a tool to populate the dashboard.'}</span>
            </div>
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              {isConnected ? 'First sync in progress — check back after connecting projects.' : 'No integrations connected yet.'}
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
              <Input placeholder="Search across tools" disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              Connect integrations to unlock unified search and filtering.
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
            <span>Requires at least one connected integration.</span>
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
            <span>Sync history will appear after your first connection.</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationHubPage;
