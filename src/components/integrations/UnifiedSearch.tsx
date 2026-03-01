import React, { useState, useCallback, useEffect } from 'react';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import { UnifiedSearchResult, ExternalTaskSource } from '@/services/unifiedSearchService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, ExternalLink, Loader2, Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedSearchProps {
  onSelectResult?: (result: UnifiedSearchResult) => void;
  taskIdToLink?: number;
  showFilters?: boolean;
  placeholder?: string;
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

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({
  onSelectResult,
  taskIdToLink,
  showFilters = true,
  placeholder = 'Search across Asana, Linear, and Jira...',
  className,
}) => {
  const {
    hasConnectedIntegrations,
    connectedIntegrations,
    results,
    suggestions,
    isLoadingResults,
    isLoadingSuggestions,
    search,
    fetchSuggestions,
    linkTask,
  } = useUnifiedSearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<ExternalTaskSource[]>(['asana', 'linear', 'jira']);
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [linkedTaskIds, setLinkedTaskIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  // Debounced search for suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery, 5);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    search({
      sources: selectedSources,
      searchQuery,
    });
  }, [search, searchQuery, selectedSources]);

  const handleSourceToggle = (source: ExternalTaskSource) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleLinkTask = async (result: UnifiedSearchResult) => {
    if (!taskIdToLink) return;
    
    setIsLinking(result.id);
    const success = await linkTask(taskIdToLink, result.source, result.externalId, {
      syncEnabled: true,
      syncDirection: 'bidirectional',
    });
    if (success) {
      setLinkedTaskIds(prev => new Set(prev).add(result.id));
    }
    setIsLinking(null);
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    const lower = priority.toLowerCase();
    if (lower.includes('urgent') || lower.includes('high') || lower.includes('p0') || lower.includes('p1')) {
      return 'bg-red-100 text-red-800';
    }
    if (lower.includes('medium') || lower.includes('p2')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  if (!hasConnectedIntegrations) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Connect an integration to search across external tools.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/dashboard/integrations'}
            >
              Go to Integrations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input with Popover for suggestions */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onFocus={() => setOpen(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[400px]" align="start">
            <Command>
              <CommandInput placeholder="Type to search..." />
              <CommandList>
                <CommandEmpty>
                  {isLoadingSuggestions ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    'No results found.'
                  )}
                </CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      onSelect={() => {
                        setSearchQuery(suggestion.title);
                        setOpen(false);
                        if (onSelectResult) {
                          onSelectResult(suggestion);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sourceColors[suggestion.source] }}
                        />
                        <span className="flex-1 truncate">{suggestion.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {sourceLabels[suggestion.source]}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleSearch} disabled={isLoadingResults || !searchQuery.trim()}>
          {isLoadingResults ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sources:</span>
          </div>
          {(Object.keys(connectedIntegrations) as ExternalTaskSource[])
            .filter(source => connectedIntegrations[source])
            .map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={`source-${source}`}
                  checked={selectedSources.includes(source)}
                  onCheckedChange={() => handleSourceToggle(source)}
                />
                <Label
                  htmlFor={`source-${source}`}
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
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sourceColors[result.source] }}
                        />
                        <Badge variant="outline" className="text-xs">
                          {sourceLabels[result.source]}
                        </Badge>
                        {result.priority && (
                          <Badge className={cn('text-xs', getPriorityColor(result.priority))}>
                            {result.priority}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium truncate">{result.title}</h4>
                      {result.project && (
                        <p className="text-sm text-muted-foreground">
                          {result.project.name}
                        </p>
                      )}
                      {result.assignee && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned to: {result.assignee.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {taskIdToLink && (
                        <Button
                          size="sm"
                          variant={linkedTaskIds.has(result.id) ? "outline" : "default"}
                          onClick={() => handleLinkTask(result)}
                          disabled={isLinking === result.id || linkedTaskIds.has(result.id)}
                        >
                          {isLinking === result.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : linkedTaskIds.has(result.id) ? (
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
        </div>
      )}

      {/* Empty State */}
      {searchQuery && !isLoadingResults && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No results found for &quot;{searchQuery}&quot;</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;
