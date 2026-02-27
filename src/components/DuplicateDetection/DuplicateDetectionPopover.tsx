import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, AlertCircle, CheckCircle, X, ArrowRight, GitMerge, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/services/apiService';
import { formatDistanceToNow } from 'date-fns';

interface DuplicateSuggestion {
  task: Task;
  similarity: number;
  matchType: 'title' | 'description' | 'both';
}

interface DuplicateDetectionPopoverProps {
  title: string;
  description?: string;
  projectId: number;
  onCheckDuplicates: (data: {
    title: string;
    description?: string;
    projectId: number;
  }) => Promise<{
    hasDuplicates: boolean;
    count: number;
    duplicates: DuplicateSuggestion[];
    threshold: number;
  }>;
  onMergeTask?: (duplicateTaskId: number) => void;
  onLinkTask?: (duplicateTaskId: number) => void;
  onDismiss?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type DuplicateFeedbackAction = 'accepted' | 'rejected';

const FEEDBACK_STORAGE_KEY = 'taskluid_duplicate_feedback';

const loadFeedback = (): Record<number, DuplicateFeedbackAction> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as Record<number, DuplicateFeedbackAction>;
  } catch {
    return {};
  }
};

export function DuplicateDetectionPopover({
  title,
  description,
  projectId,
  onCheckDuplicates,
  onMergeTask,
  onLinkTask,
  onDismiss,
  isOpen: controlledIsOpen,
  onOpenChange,
}: DuplicateDetectionPopoverProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<DuplicateSuggestion[]>([]);
  const [lastCheckedTitle, setLastCheckedTitle] = useState<string>('');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Record<number, DuplicateFeedbackAction>>(() => loadFeedback());

  const effectiveIsOpen = controlledIsOpen ?? isOpen;
  const effectiveSetIsOpen = onOpenChange ?? setIsOpen;

  const recordFeedback = useCallback((taskId: number, action: DuplicateFeedbackAction) => {
    setFeedback((prev) => {
      const next = { ...prev, [taskId]: action };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const checkForDuplicates = useCallback(async () => {
    if (!title.trim() || title.length < 5) return;
    
    setIsChecking(true);
    try {
      const result = await onCheckDuplicates({
        title: title.trim(),
        description: description?.trim(),
        projectId,
      });
      
      setSuggestions(result.duplicates);
      setLastCheckedTitle(title.trim());
      
      // Auto-open if high-confidence duplicates found
      if (result.duplicates.length > 0 && result.duplicates[0].similarity >= 0.85) {
        effectiveSetIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setIsChecking(false);
    }
  }, [title, description, projectId, onCheckDuplicates, effectiveSetIsOpen]);

  // Debounced check when title changes - only runs if title changed since last check
  useEffect(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === lastCheckedTitle || trimmedTitle.length < 5) return;

    const timer = setTimeout(() => {
      checkForDuplicates();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, checkForDuplicates, lastCheckedTitle]);

  // Reset when title changes significantly (cleared or very short)
  useEffect(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length < 3) {
      setLastCheckedTitle('');
      setSuggestions([]);
      setDismissedSuggestions(new Set());
    }
  }, [title]);

  const handleDismiss = (taskId: number) => {
    recordFeedback(taskId, 'rejected');
    setDismissedSuggestions(prev => new Set(prev).add(taskId));
    
    // If all suggestions dismissed, close popover
    const remainingSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.task.id) && s.task.id !== taskId);
    if (remainingSuggestions.length === 0) {
      effectiveSetIsOpen(false);
      onDismiss?.();
    }
  };

  const handleDismissAll = () => {
    suggestions.forEach((s) => recordFeedback(s.task.id, 'rejected'));
    setDismissedSuggestions(new Set(suggestions.map(s => s.task.id)));
    effectiveSetIsOpen(false);
    onDismiss?.();
  };

  const getConfidenceBadge = (similarity: number) => {
    if (similarity >= 0.9) {
      return <Badge variant="destructive" className="text-xs">High Match</Badge>;
    } else if (similarity >= 0.75) {
      return <Badge variant="default" className="text-xs bg-yellow-500">Medium Match</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">Low Match</Badge>;
  };

  const getConfidenceScore = (similarity: number) => {
    return Math.round(similarity * 100);
  };

  const isCompletedStatus = (status?: string) => {
    if (!status) return false;
    const normalized = status.toLowerCase();
    return ['done', 'completed', 'complete', 'closed', 'resolved'].includes(normalized);
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !dismissedSuggestions.has(s.task.id) && !feedback[s.task.id]
  );

  if (filteredSuggestions.length === 0 && !isChecking) return null;

  return (
    <Popover open={effectiveIsOpen} onOpenChange={effectiveSetIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${filteredSuggestions.length > 0 ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground'}`}
          onClick={() => effectiveSetIsOpen(true)}
        >
          <Lightbulb className="h-4 w-4 mr-1" />
          {isChecking ? (
            'Checking...'
          ) : filteredSuggestions.length > 0 ? (
            <>
              <AlertCircle className="h-4 w-4 mr-1" />
              {filteredSuggestions.length} potential duplicate{filteredSuggestions.length !== 1 ? 's' : ''}
            </>
          ) : (
            'Check duplicates'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-sm">Potential Duplicates</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDismissAll}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            AI found similar tasks. Review before creating a new one.
          </p>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => {
            const createdAt = suggestion.task.createdAt ? new Date(suggestion.task.createdAt) : null;
            const completedAt =
              isCompletedStatus(suggestion.task.status) && suggestion.task.updatedAt
                ? new Date(suggestion.task.updatedAt)
                : null;

            return (
              <div
                key={suggestion.task.id}
                className="p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {suggestion.task.title}
                      </span>
                      {getConfidenceBadge(suggestion.similarity)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="font-medium text-primary">
                        {getConfidenceScore(suggestion.similarity)}% match
                      </span>
                      <span>•</span>
                      <span className="capitalize">{suggestion.matchType} match</span>
                      {createdAt && (
                        <>
                          <span>•</span>
                          <span>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                        </>
                      )}
                      {completedAt && (
                        <>
                          <span>•</span>
                          <span>Completed {formatDistanceToNow(completedAt, { addSuffix: true })}</span>
                        </>
                      )}
                    </div>
                    
                    {suggestion.task.status && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.task.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => handleDismiss(suggestion.task.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-3">
                  {onMergeTask && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs flex-1"
                      onClick={() => {
                      recordFeedback(suggestion.task.id, 'accepted');
                      onMergeTask(suggestion.task.id);
                    }}
                    >
                      <GitMerge className="h-3 w-3 mr-1" />
                      Merge
                    </Button>
                  )}
                  {onLinkTask && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs flex-1"
                      onClick={() => {
                      recordFeedback(suggestion.task.id, 'accepted');
                      onLinkTask(suggestion.task.id);
                    }}
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      Link
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs flex-1"
                    onClick={() => window.open(`/dashboard/tasks/${suggestion.task.id}`, '_blank')}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredSuggestions.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs text-muted-foreground"
              onClick={handleDismissAll}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              None of these are duplicates — Create new task
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default DuplicateDetectionPopover;
