import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService, AutomationExecution } from '@/services/apiService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AutomationExecutionsProps {
  organizationId: number | undefined;
}

const AutomationExecutions: React.FC<AutomationExecutionsProps> = ({ organizationId }) => {
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    if (organizationId) {
      loadExecutions();
    }
  }, [organizationId]);

  const loadExecutions = async (offset = 0) => {
    if (!organizationId) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getAutomationExecutions({
        organizationId,
        limit: pagination.limit,
        offset,
      });
      
      if (response.success) {
        if (offset === 0) {
          setExecutions(response.data);
        } else {
          setExecutions(prev => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
      toast.error('Failed to load execution history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !isLoading) {
      loadExecutions(pagination.offset + pagination.limit);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTriggerLabel = (type: string) => {
    return type
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatActionLabel = (type: string) => {
    return type
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading && executions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Automation executions will appear here when your rules are triggered.
            Create a rule and wait for events to occur, or use the Test button to trigger manually.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {executions.length} of {pagination.total} executions
        </p>
        <Button variant="outline" size="sm" onClick={() => loadExecutions(0)} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {executions.map((execution) => (
          <Card key={execution.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(execution.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium truncate">{execution.rule.name}</h4>
                    {getStatusBadge(execution.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{formatTriggerLabel(execution.rule.triggerType)}</span>
                    <span>→</span>
                    <span>{formatActionLabel(execution.rule.actionType)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                    </span>
                    {execution.durationMs && (
                      <span>{execution.durationMs}ms</span>
                    )}
                    {execution.taskId && (
                      <span>Task #{execution.taskId}</span>
                    )}
                  </div>
                  {execution.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600 dark:text-red-400">
                      {execution.error}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination.hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AutomationExecutions;