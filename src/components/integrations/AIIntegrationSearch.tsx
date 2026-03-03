import React, { useState, useCallback, useEffect } from 'react';
import { useAIIntegrationQuery, AIIntegrationQueryResult } from '@/hooks/useAIIntegrationQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Brain,
  Search,
  Loader2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Filter,
  X,
  Check,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExternalTaskSource } from '@/services/unifiedSearchService';

interface AIIntegrationSearchProps {
  hasConnections: boolean;
  connectedSources: {
    asana: boolean;
    linear: boolean;
    jira: boolean;
  };
  onSelectResult?: (result: AIIntegrationQueryResult) => void;
  taskIdToLink?: number;
  className?: string;
}

const sourceColors: Record<ExternalTaskSource, string> = {
  asana: '#F06A6A',
  linear: '#5E6AD2',
  jira: '#0052CC',
};

const sourceLabels: Record<ExternalTaskSource, string> = {
  asana: 'Asana',
  linear: 'Linear',
  jira: 'Jira',
};

const exampleQueries = [
  'Show me overdue tasks grouped by assignee',
  'Find high priority issues from last week',
  'What tasks are assigned to me that are in progress?',
  'List all blocked tasks across all tools',
  'Show tasks due this week in the Marketing project',
  'Find all bugs assigned to the Engineering team',
];

export const AIIntegrationSearch: React.FC<AIIntegrationSearchProps> = ({
  hasConnections,
  connectedSources,
  onSelectResult,
  taskIdToLink,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<ExternalTaskSource[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [linkedTaskIds, setLinkedTaskIds] = useState<Set<string>>(new Set());

  const {
    results,
    interpretedQuery,
    totalCount,
    sourceCounts,
    suggestedFilters,
    isLoading,
    error,
    creditsUsed,
    remainingCredits,
    query: executeQuery,
    clearResults,
  } = useAIIntegrationQuery();

  // Update selected sources when connections change
  useEffect(() => {
    const available: ExternalTaskSource[] = [];
    if (connectedSources.asana) available.push('asana');
    if (connectedSources.linear) available.push('linear');
    if (connectedSources.jira) available.push('jira');
    queueMicrotask(() => setSelectedSources(available));
  }, [connectedSources]);

  const handleSourceToggle = useCallback((source: ExternalTaskSource) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || selectedSources.length === 0) return;
    await executeQuery(query, { sources: selectedSources });
  }, [query, selectedSources, executeQuery]);

  const handleExampleClick = useCallback((example: string) => {
    setQuery(example);
    setShowExamples(false);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    clearResults();
  }, [clearResults]);

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    const lower = priority.toLowerCase();
    if (lower.includes('urgent') || lower.includes('high') || lower.includes('p0') || lower.includes('p1')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    if (lower.includes('medium') || lower.includes('p2')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const lower = status.toLowerCase();
    if (lower.includes('done') || lower.includes('complete') || lower.includes('closed')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    if (lower.includes('progress') || lower.includes('started')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    if (lower.includes('blocked') || lower.includes('waiting')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (!hasConnections) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">AI-Powered Cross-Platform Search</p>
            <p className="text-sm mt-2">
              Connect an integration to use natural language queries across your tools.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Natural Language Search
        </CardTitle>
        <CardDescription>
          Ask questions about tasks across all your connected tools in plain English.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="e.g., Show me overdue tasks grouped by assignee..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !query.trim() || selectedSources.length === 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </div>

          {/* Source Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sources:</span>
            </div>
            {(Object.keys(connectedSources) as ExternalTaskSource[])
              .filter(source => connectedSources[source])
              .map((source) => (
                <div key={source} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ai-source-${source}`}
                    checked={selectedSources.includes(source)}
                    onCheckedChange={() => handleSourceToggle(source)}
                  />
                  <Label
                    htmlFor={`ai-source-${source}`}
                    className="text-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: sourceColors[source] }}
                    />
                    {sourceLabels[source]}
                  </Label>
                </div>
              ))}
          </div>

          {/* Example Queries */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-auto py-1"
              onClick={() => setShowExamples(!showExamples)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Example queries
              <span className="ml-1">{showExamples ? '▲' : '▼'}</span>
            </Button>
            {showExamples && (
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-left"
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Interpreted Query */}
        {interpretedQuery && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">AI interpreted your query as:</p>
            <p className="text-sm text-blue-900 dark:text-blue-200">{interpretedQuery}</p>
          </div>
        )}

        {/* Suggested Filters */}
        {suggestedFilters && (
          <div className="flex flex-wrap gap-2">
            {suggestedFilters.status?.map(status => (
              <Badge key={status} variant="outline" className="text-xs">
                Status: {status}
              </Badge>
            ))}
            {suggestedFilters.priority?.map(priority => (
              <Badge key={priority} variant="outline" className="text-xs">
                Priority: {priority}
              </Badge>
            ))}
            {suggestedFilters.assignee?.map(assignee => (
              <Badge key={assignee} variant="outline" className="text-xs">
                Assignee: {assignee}
              </Badge>
            ))}
            {suggestedFilters.dueDateRange && (
              <Badge variant="outline" className="text-xs">
                Due: {new Date(suggestedFilters.dueDateRange.from).toLocaleDateString()} - {new Date(suggestedFilters.dueDateRange.to).toLocaleDateString()}
              </Badge>
            )}
          </div>
        )}

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Found <strong>{totalCount}</strong> results
              </span>
              <div className="flex gap-2">
                {sourceCounts.asana > 0 && (
                  <Badge variant="outline" className="text-xs" style={{ borderColor: sourceColors.asana }}>
                    Asana: {sourceCounts.asana}
                  </Badge>
                )}
                {sourceCounts.linear > 0 && (
                  <Badge variant="outline" className="text-xs" style={{ borderColor: sourceColors.linear }}>
                    Linear: {sourceCounts.linear}
                  </Badge>
                )}
                {sourceCounts.jira > 0 && (
                  <Badge variant="outline" className="text-xs" style={{ borderColor: sourceColors.jira }}>
                    Jira: {sourceCounts.jira}
                  </Badge>
                )}
              </div>
            </div>
            {creditsUsed !== null && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground">
                      {creditsUsed} credit{creditsUsed !== 1 ? 's' : ''} used
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{remainingCredits} credits remaining</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sourceColors[result.source] }}
                        />
                        <Badge variant="outline" className="text-xs">
                          {sourceLabels[result.source]}
                        </Badge>
                        {result.status && (
                          <Badge className={cn('text-xs', getStatusColor(result.status))}>
                            {result.status}
                          </Badge>
                        )}
                        {result.priority && (
                          <Badge className={cn('text-xs', getPriorityColor(result.priority))}>
                            {result.priority}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium truncate">{result.title}</h4>
                      {result.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {result.description}
                        </p>
                      )}
                      {result.project && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Project: {result.project.name}
                        </p>
                      )}
                      {result.assignee && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned to: {result.assignee.name}
                        </p>
                      )}
                      {result.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(result.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {taskIdToLink && (
                        <Button
                          size="sm"
                          variant={linkedTaskIds.has(result.id) ? 'outline' : 'default'}
                          onClick={() => {
                            setLinkedTaskIds(prev => new Set(prev).add(result.id));
                            // Call link API here if needed
                          }}
                          disabled={linkedTaskIds.has(result.id)}
                        >
                          {linkedTaskIds.has(result.id) ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Linked
                            </>
                          ) : (
                            'Link'
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      {onSelectResult && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectResult(result)}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {query && !isLoading && results.length === 0 && interpretedQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No results found for this query</p>
            <p className="text-sm">Try rephrasing your question or adjusting filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIIntegrationSearch;
