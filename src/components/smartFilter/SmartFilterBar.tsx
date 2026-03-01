import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, X, AlertTriangle, Wand2, Brain, Loader2, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  SmartFilterCriteria,
  parseSmartFilter,
  generateFilterChips,
  getSmartFilterSuggestions,
} from '@/lib/smartFilter';
import { useAIParseSearchFilter, ParsedSearchFilter } from '@/hooks/useAIParseSearchFilter';
import { ModelSelector } from '@/components/ModelSelector';
import { ModelIndicator } from '@/components/ModelIndicator';
import { useFilterHistoryStore, FilterHistoryEntry } from '@/stores/filterHistoryStore';

export interface SmartFilterBarProps {
  value: string;
  onApply: (criteria: SmartFilterCriteria, filterCount: number, query: string) => void;
  onClear: () => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  isActive?: boolean;
  activeFilterCount?: number;
  currentUserId?: number;
  context?: {
    availableProjects?: string[];
    availableLabels?: string[];
    teamMembers?: string[];
  };
}

// Convert AI parsed filter to SmartFilterCriteria format
const convertAIFilterToCriteria = (aiFilter: ParsedSearchFilter): SmartFilterCriteria => {
  const criteria: SmartFilterCriteria = {};

  // Map status values
  if (aiFilter.filters.status?.length) {
    criteria.status = aiFilter.filters.status.map(s => {
      // Normalize status values to match system Status enum
      const normalized = s.toLowerCase().replace(/-/g, '_');
      if (normalized === 'open' || normalized === 'todo' || normalized === 'to_do') return 'To Do';
      if (normalized === 'in_progress' || normalized === 'inprogress') return 'Work In Progress';
      if (normalized === 'review' || normalized === 'under_review') return 'Under Review';
      if (normalized === 'done' || normalized === 'completed' || normalized === 'closed') return 'Completed';
      if (normalized === 'archived') return 'Archived';
      return s;
    });
  }

  // Map priority values
  if (aiFilter.filters.priority?.length) {
    criteria.priority = aiFilter.filters.priority.map(p => {
      const normalized = p.toLowerCase();
      if (normalized === 'urgent' || normalized === 'critical') return 'Urgent';
      if (normalized === 'high') return 'High';
      if (normalized === 'medium' || normalized === 'normal') return 'Medium';
      if (normalized === 'low') return 'Low';
      if (normalized === 'backlog') return 'Backlog';
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    });
  }

  // Map assignee
  if (aiFilter.filters.assignee?.length) {
    criteria.assignee = aiFilter.filters.assignee;
  }

  // Map project
  if (aiFilter.filters.project?.length) {
    criteria.project = aiFilter.filters.project;
  }

  // Map labels
  if (aiFilter.filters.label?.length) {
    criteria.label = aiFilter.filters.label;
  }

  // Map due date (AI returns string, criteria expects string[])
  if (aiFilter.filters.due) {
    criteria.due = [aiFilter.filters.due];
  }

  return criteria;
};

// Format relative time for display
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

// Generate a label for filter history entry
const generateFilterLabel = (entry: FilterHistoryEntry): string => {
  if (entry.query.length < 40) return entry.query;
  const parts: string[] = [];
  if (entry.criteria.status?.length) parts.push(entry.criteria.status[0]);
  if (entry.criteria.priority?.length) parts.push(entry.criteria.priority[0]);
  if (entry.criteria.assignee?.length) parts.push(`assignee:${entry.criteria.assignee[0]}`);
  if (entry.criteria.due?.length) parts.push(`due:${entry.criteria.due[0]}`);
  if (entry.criteria.text) parts.push(entry.criteria.text);
  
  const label = parts.join(', ');
  return label.length > 40 ? label.substring(0, 40) + '...' : label;
};

export const SmartFilterBar: React.FC<SmartFilterBarProps> = ({
  value,
  onApply,
  onClear,
  onChange,
  placeholder = 'Try "my high priority tasks due this week" or "assignee:me is:in-progress"',
  isActive = false,
  activeFilterCount = 0,
  context,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [parsedResult, setParsedResult] = useState<ReturnType<typeof parseSmartFilter> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [wasAIInterpreted, setWasAIInterpreted] = useState(false);
  const [aiConfidence, setAIConfidence] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    parseSearchFilter,
    isLoading: isAILoading,
    error: aiError,
    creditsUsed,
    remainingCredits,
    selectedModel,
  } = useAIParseSearchFilter();

  const { recentFilters, addFilter, removeFilter, clearHistory, incrementUsage } = useFilterHistoryStore();

  // Track when filters are applied to add to history
  const lastAppliedRef = useRef<string>('');

  useEffect(() => {
    queueMicrotask(() => {
      setInputValue(value);
      if (value) {
        setParsedResult(parseSmartFilter(value));
      } else {
        setParsedResult(null);
        setWasAIInterpreted(false);
        setAIConfidence(null);
      }
    });
  }, [value]);

  // Add to history when filters are applied externally
  useEffect(() => {
    if (isActive && parsedResult && inputValue && inputValue !== lastAppliedRef.current) {
      lastAppliedRef.current = inputValue;
      addFilter({
        query: inputValue,
        criteria: parsedResult.criteria,
        filterCount: parsedResult.filterCount,
        wasAIInterpreted,
      });
    }
  }, [isActive, parsedResult, inputValue, wasAIInterpreted, addFilter]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setWasAIInterpreted(false);
    setAIConfidence(null);
    setShowHistory(false);
    
    if (newValue) {
      const parsed = parseSmartFilter(newValue);
      setParsedResult(parsed);
      setShowSuggestions(true);
    } else {
      setParsedResult(null);
      setShowSuggestions(false);
    }
  }, [onChange]);

  const handleApply = useCallback(() => {
    if (parsedResult && parsedResult.filterCount > 0) {
      onApply(parsedResult.criteria, parsedResult.filterCount, inputValue);
      setShowSuggestions(false);
      
      // Add to history
      addFilter({
        query: inputValue,
        criteria: parsedResult.criteria,
        filterCount: parsedResult.filterCount,
        wasAIInterpreted: false,
      });
      lastAppliedRef.current = inputValue;
    }
  }, [parsedResult, onApply, inputValue, addFilter]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setParsedResult(null);
    setShowSuggestions(false);
    setShowHistory(false);
    setWasAIInterpreted(false);
    setAIConfidence(null);
    lastAppliedRef.current = '';
    onClear();
  }, [onClear]);

  const handleUseAI = useCallback(async () => {
    if (!inputValue.trim()) return;

    const result = await parseSearchFilter(inputValue, context);
    
    if (result) {
      const criteria = convertAIFilterToCriteria(result);
      const chipCount = Object.values(criteria).flat().length;
      
      setInputValue(result.query);
      onChange?.(result.query);
      setWasAIInterpreted(true);
      setAIConfidence(result.confidence.overall);
      onApply(criteria, chipCount, result.query);
      setShowSuggestions(false);
      
      // Update parsed result to reflect the AI-generated query
      setParsedResult(parseSmartFilter(result.query));
      
      // Add to history
      addFilter({
        query: result.query,
        criteria,
        filterCount: chipCount,
        wasAIInterpreted: true,
      });
      lastAppliedRef.current = result.query;
    }
  }, [inputValue, parseSearchFilter, context, onApply, onChange, addFilter]);

  const handleHistorySelect = useCallback((entry: FilterHistoryEntry) => {
    setInputValue(entry.query);
    onChange?.(entry.query);
    setParsedResult(parseSmartFilter(entry.query));
    onApply(entry.criteria, entry.filterCount, entry.query);
    setShowHistory(false);
    setWasAIInterpreted(entry.wasAIInterpreted);
    incrementUsage(entry.id);
    lastAppliedRef.current = entry.query;
  }, [onApply, onChange, incrementUsage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only apply filters if operators are detected, otherwise do nothing
      // (user must explicitly click "Use AI" button for natural language)
      if (inputValue.includes(':') && inputValue.trim()) {
        handleApply();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowHistory(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && showHistory && recentFilters.length > 0) {
      // Focus first history item
      e.preventDefault();
      const firstButton = containerRef.current?.querySelector('[data-history-item]') as HTMLButtonElement;
      firstButton?.focus();
    }
  }, [handleApply, inputValue, showHistory, recentFilters.length]);

  const handleRemoveChip = useCallback((type: string, value: string) => {
    if (!parsedResult) return;
    
    const criteria = { ...parsedResult.criteria };
    
    if (type === 'text') {
      delete criteria.text;
    } else if (criteria[type as keyof SmartFilterCriteria]) {
      const arr = criteria[type as keyof SmartFilterCriteria] as string[];
      const filtered = arr.filter((v: string) => v !== value);
      if (filtered.length === 0) {
        delete (criteria as any)[type];
      } else {
        (criteria as any)[type] = filtered;
      }
    }
    
    const chips = generateFilterChips(criteria);
    const newQuery = chips.map((c: {type: string; value: string; label: string}) => {
      if (c.type === 'text') return c.value;
      if (c.type === 'assignee') return c.value === 'me' ? 'assignee:me' : `assignee:${c.value}`;
      if (c.type === 'status') return `is:${c.value.toLowerCase().replace(/\s+/g, '-')}`;
      if (c.type === 'priority') return `priority:${c.value.toLowerCase()}`;
      if (c.type === 'project') return `project:"${c.value}"`;
      if (c.type === 'label') return `label:${c.value}`;
      if (c.type === 'due') return `due:${c.value}`;
      return '';
    }).filter(Boolean).join(' ');
    
    setInputValue(newQuery);
    onChange?.(newQuery);
    
    if (chips.length > 0) {
      onApply(criteria, chips.length, newQuery);
    } else {
      onClear();
    }
  }, [parsedResult, onApply, onClear, onChange]);

  const suggestions = showSuggestions && !isActive ? getSmartFilterSuggestions(inputValue) : [];
  const chips = parsedResult && isActive ? generateFilterChips(parsedResult.criteria) : [];

  // Determine if input looks like natural language (no operators)
  const looksLikeNaturalLanguage = inputValue.trim() && !inputValue.includes(':') && !inputValue.includes('is:') && !inputValue.includes('assignee:');

  const inputContainerClasses = `
    relative rounded-lg border bg-background transition-all duration-200
    ${isFocused ? 'ring-2 ring-primary/20 border-primary' : 'border-input'}
    ${isActive ? 'border-primary/50 bg-primary/5' : ''}
    ${wasAIInterpreted ? 'border-purple-400/50 bg-purple-50/30 dark:bg-purple-950/20' : ''}
  `;

  const iconContainerClasses = `
    flex-shrink-0 p-1.5 rounded-md transition-colors
    ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
    ${wasAIInterpreted ? 'bg-purple-500/20 text-purple-600' : ''}
  `;

  return (
    <TooltipProvider>
      <div ref={containerRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>AI-powered smart filtering</span>
            <span className="text-xs">— Type naturally or use operators like assignee:me</span>
          </div>
          <ModelSelector size="sm" variant="ghost" showLabel={false} />
        </div>
        
        <div className={inputContainerClasses}>
          <div className="flex items-center gap-2 px-3 py-2">
            <div 
              className={iconContainerClasses}
              title={wasAIInterpreted ? 'Interpreted by AI' : 'Smart filter active'}
            >
              {wasAIInterpreted ? <Brain className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>

            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                if (!inputValue && recentFilters.length > 0) {
                  setShowHistory(true);
                }
              }}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={placeholder}
              disabled={isAILoading}
              className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex items-center gap-1">
              {/* History button - only show when there are recent filters */}
              {!isActive && recentFilters.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowHistory(!showHistory)}
                      className={`h-8 w-8 ${showHistory ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recent filters</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {looksLikeNaturalLanguage && inputValue && !isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUseAI}
                  disabled={isAILoading}
                  className="h-8 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  title="Parse natural language with AI (uses 1 credit)"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Brain className="h-3.5 w-3.5" />
                  )}
                  {isAILoading ? 'Parsing...' : 'Use AI'}
                </Button>
              )}

              {inputValue && !isActive && !looksLikeNaturalLanguage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApply}
                  disabled={!parsedResult || parsedResult.filterCount === 0}
                  className="h-8 gap-1"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Apply
                </Button>
              )}
              
              {(inputValue || isActive) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {/* Recent Filters History Dropdown */}
            {showHistory && recentFilters.length > 0 && !isActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover p-1 shadow-md"
              >
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <History className="h-3 w-3" />
                    Recent filters
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {recentFilters.length} saved
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={clearHistory}
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear all history</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {recentFilters.slice(0, 10).map((entry, index) => (
                    <button
                      key={entry.id}
                      data-history-item
                      onClick={() => handleHistorySelect(entry)}
                      className="w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 group"
                    >
                      <span className="text-muted-foreground">
                        {entry.wasAIInterpreted ? (
                          <Brain className="h-3.5 w-3.5 text-purple-500" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="flex-1 truncate font-medium">
                        {generateFilterLabel(entry)}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFilter(entry.id);
                              }}
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove from history</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                      {entry.usageCount > 1 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                          {entry.usageCount}×
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && !showHistory && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover p-1 shadow-md"
              >
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Try these filters
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newValue = inputValue ? `${inputValue} ${suggestion.text}` : suggestion.text;
                      setInputValue(newValue);
                      onChange?.(newValue);
                      const parsed = parseSmartFilter(newValue);
                      setParsedResult(parsed);
                      onApply(parsed.criteria, parsed.filterCount, newValue);
                      setShowSuggestions(false);
                    }}
                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
                  >
                    <span className="text-muted-foreground">
                      {suggestion.icon === 'user' && '👤'}
                      {suggestion.icon === 'clock' && '⏰'}
                      {suggestion.icon === 'calendar' && '📅'}
                      {suggestion.icon === 'flag' && '🚩'}
                      {suggestion.icon === 'alert' && '⚠️'}
                      {suggestion.icon === 'circle' && '⭕'}
                      {suggestion.icon === 'alert-circle' && '❗'}
                      {suggestion.icon === 'user-x' && '👤❌'}
                    </span>
                    <span className="font-medium">{suggestion.text}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{suggestion.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {chips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {chips.map((chip, index) => (
                <motion.div
                  key={`${chip.type}-${chip.value}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge
                    variant="secondary"
                    className={`gap-1 cursor-pointer hover:bg-destructive/10 group ${
                      chip.type === 'priority' && chip.value === 'Urgent' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''
                    } ${
                      chip.type === 'priority' && chip.value === 'High' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''
                    }`}
                    onClick={() => handleRemoveChip(chip.type, chip.value)}
                  >
                    {chip.label}
                    <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </Badge>
                </motion.div>
              ))}
              
              {wasAIInterpreted && (
                <>
                  <Badge 
                    variant="outline" 
                    className="gap-1 text-xs bg-purple-50 text-purple-700 border-purple-200"
                    title={`AI interpreted this filter${creditsUsed ? ` • Used ${creditsUsed} credit` : ''}${remainingCredits !== null ? ` • ${remainingCredits} remaining` : ''}`}
                  >
                    <Brain className="h-3 w-3" />
                    AI interpreted
                    {aiConfidence && (
                      <span className="ml-1 text-xs opacity-70">
                        ({Math.round(aiConfidence * 100)}%)
                      </span>
                    )}
                  </Badge>
                  <ModelIndicator size="sm" variant="subtle" />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {aiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 text-sm text-red-600"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">AI parsing failed</p>
                <p className="text-red-500">{aiError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {parsedResult?.warnings && parsedResult.warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 text-sm text-amber-600"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                {parsedResult.warnings.map((warning, index) => (
                  <p key={index}>{warning}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default SmartFilterBar;
