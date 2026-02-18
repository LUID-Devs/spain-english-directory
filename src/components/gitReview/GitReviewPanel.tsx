import React, { useState, useCallback, useEffect } from 'react';
import {
  GitPullRequest,
  ExternalLink,
  Github,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Save,
  Trash2,
} from 'lucide-react';
import { GitLink } from '@/services/apiService';
import {
  PRReviewState,
  getPRReviewState,
  savePRReviewState,
  deletePRReviewState,
  getDefaultChecklist,
} from '@/services/gitReviewService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface GitReviewPanelProps {
  taskId: number;
  pullRequests: GitLink[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Review', color: 'bg-gray-100 text-gray-700', icon: <Clock className="h-3 w-3" /> },
  reviewing: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700', icon: <Circle className="h-3 w-3" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
  changes_requested: { label: 'Changes Requested', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="h-3 w-3" /> },
  merged: { label: 'Merged', color: 'bg-purple-100 text-purple-700', icon: <CheckCircle2 className="h-3 w-3" /> },
};

const GitReviewPanel: React.FC<GitReviewPanelProps> = ({ taskId, pullRequests }) => {
  const [reviews, setReviews] = useState<Record<number, PRReviewState>>({});
  const [expandedPRs, setExpandedPRs] = useState<Set<number>>(new Set());

  // Load saved reviews - use stable PR IDs to avoid infinite re-renders
  useEffect(() => {
    const loadedReviews: Record<number, PRReviewState> = {};
    pullRequests.forEach((pr) => {
      const saved = getPRReviewState(taskId, pr.id);
      if (saved) {
        loadedReviews[pr.id] = saved;
      }
    });
    setReviews(loadedReviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, pullRequests.map(pr => pr.id).join(',')]);

  // Toggle expand
  const toggleExpand = useCallback((prId: number) => {
    setExpandedPRs((prev) => {
      const next = new Set(prev);
      if (next.has(prId)) {
        next.delete(prId);
      } else {
        next.add(prId);
      }
      return next;
    });
  }, []);

  // Update review status
  const updateStatus = useCallback((prId: number, status: PRReviewState['status']) => {
    setReviews((prev) => {
      const currentReview = prev[prId] || { status: 'pending', notes: '', checklist: getDefaultChecklist() };
      const updatedReview = { ...currentReview, status };
      savePRReviewState(taskId, prId, updatedReview);
      return { ...prev, [prId]: updatedReview };
    });
  }, [taskId]);

  // Update notes
  const updateNotes = useCallback((prId: number, notes: string) => {
    setReviews((prev) => {
      const currentReview = prev[prId] || { status: 'pending', notes: '', checklist: getDefaultChecklist() };
      const updatedReview = { ...currentReview, notes };
      return { ...prev, [prId]: updatedReview };
    });
  }, [taskId]);

  // Save notes
  const saveNotes = useCallback((prId: number) => {
    const review = reviews[prId];
    if (review) {
      savePRReviewState(taskId, prId, review);
      toast.success('Review notes saved');
    }
  }, [reviews, taskId]);

  // Toggle checklist item
  const toggleChecklistItem = useCallback((prId: number, itemId: string) => {
    setReviews((prev) => {
      const currentReview = prev[prId] || { status: 'pending', notes: '', checklist: getDefaultChecklist() };
      const updatedChecklist = currentReview.checklist.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      const updatedReview = { ...currentReview, checklist: updatedChecklist };
      savePRReviewState(taskId, prId, updatedReview);
      return { ...prev, [prId]: updatedReview };
    });
  }, [taskId]);

  // Clear review
  const clearReview = useCallback((prId: number) => {
    deletePRReviewState(taskId, prId);
    setReviews((prev) => {
      const next = { ...prev };
      delete next[prId];
      return next;
    });
    toast.success('Review cleared');
  }, [taskId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (pullRequests.length === 0) {
    return (
      <div className="text-xs text-muted-foreground py-2">
        No pull requests linked to this task.
        <br />
        <span className="text-muted-foreground/70">
          Reference this task in a PR title or description to link it.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <GitPullRequest className="h-3 w-3" />
          PR Reviews ({pullRequests.length})
        </h4>
      </div>

      <div className="space-y-2">
        {pullRequests.map((pr) => {
          const review = reviews[pr.id];
          const isExpanded = expandedPRs.has(pr.id);
          const status = review?.status || 'pending';
          const statusInfo = statusConfig[status];
          const checkedCount = review?.checklist.filter((i) => i.checked).length || 0;
          const totalChecklist = review?.checklist.length || 0;

          return (
            <div key={pr.id}>
              <div className="rounded-md border border-border/50 bg-muted/30">
                {/* PR Header */}
                <button
                  type="button"
                  className="w-full p-2 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpand(pr.id)}
                  aria-expanded={isExpanded}
                >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <GitPullRequest className="h-3.5 w-3.5 text-purple-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-foreground truncate">
                            {pr.title}
                          </span>
                          
                          {/* PR State Badge */}
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1 py-0 h-4 ${
                              pr.prState === 'merged'
                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : pr.prState === 'closed'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-green-100 text-green-700 border-green-200'
                            }`}
                          >
                            {pr.prState}
                          </Badge>

                          {/* Review Status Badge */}
                          {review && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1 py-0 h-4 gap-0.5 ${statusInfo.color}`}
                            >
                              {statusInfo.icon}
                              {statusInfo.label}
                            </Badge>
                          )}

                          {/* Checklist progress */}
                          {totalChecklist > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {checkedCount}/{totalChecklist} checks
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            {pr.repository}
                          </span>
                          <span>•</span>
                          <span>#{pr.prNumber}</span>
                          <span>•</span>
                          <span>{pr.authorUsername || pr.authorName}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                {/* Expanded Review Panel */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                    {/* Review Status */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Review Status</label>
                      <Select value={status} onValueChange={(v) => updateStatus(pr.id, v as PRReviewState['status'])}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending Review</SelectItem>
                          <SelectItem value="reviewing">Currently Reviewing</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="changes_requested">Changes Requested</SelectItem>
                          <SelectItem value="merged">Merged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Review Checklist */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Checklist</label>
                      <div className="space-y-1">
                        {(review?.checklist || getDefaultChecklist()).map((item) => (
                          <div key={item.id} className="flex items-start gap-2">
                            <Checkbox
                              id={`${pr.id}-${item.id}`}
                              checked={item.checked}
                              onCheckedChange={() => toggleChecklistItem(pr.id, item.id)}
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={`${pr.id}-${item.id}`}
                              className={`text-xs cursor-pointer ${
                                item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
                              }`}
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Review Notes
                      </label>
                      <Textarea
                        placeholder="Add your review comments..."
                        value={review?.notes || ''}
                        onChange={(e) => updateNotes(pr.id, e.target.value)}
                        className="min-h-[60px] text-xs resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveNotes(pr.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save Notes
                        </Button>
                        
                        {review && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearReview(pr.id)}
                            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Link to PR */}
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Pull Request
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GitReviewPanel;
