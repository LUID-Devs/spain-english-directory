import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  FileCode,
  Plus,
  Minus,
  Code2,
  Bot,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  FileDiff,
  MoreHorizontal,
  User,
  Send,
} from 'lucide-react';
import { GitLink } from '@/services/apiService';
import {
  PRReviewState,
  PRDiff,
  PRDiffFile,
  InlineComment,
  AIReviewResult,
  getPRReviewState,
  savePRReviewState,
  deletePRReviewState,
  getDefaultChecklist,
  fetchPRDiff,
  fetchPRComments,
  addInlineComment,
  resolveInlineComment,
  startAIReview,
  getAIReviewResults,
  parseDiffPatch,
  getFileIcon,
} from '@/services/gitReviewService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GitReviewPanelProps {
  taskId: number;
  pullRequests: GitLink[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  pending: { 
    label: 'Pending Review', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100',
    icon: <Clock className="h-3 w-3" /> 
  },
  reviewing: { 
    label: 'Reviewing', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100',
    icon: <Circle className="h-3 w-3" /> 
  },
  approved: { 
    label: 'Approved', 
    color: 'text-green-700', 
    bgColor: 'bg-green-100',
    icon: <CheckCircle2 className="h-3 w-3" /> 
  },
  changes_requested: { 
    label: 'Changes Requested', 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-100',
    icon: <AlertCircle className="h-3 w-3" /> 
  },
  merged: { 
    label: 'Merged', 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100',
    icon: <CheckCircle2 className="h-3 w-3" /> 
  },
};

const severityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  info: { color: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Info' },
  warning: { color: 'text-amber-700', bgColor: 'bg-amber-50', label: 'Warning' },
  error: { color: 'text-red-700', bgColor: 'bg-red-50', label: 'Error' },
  critical: { color: 'text-red-800', bgColor: 'bg-red-100', label: 'Critical' },
};

const GitReviewPanel: React.FC<GitReviewPanelProps> = ({ taskId, pullRequests }) => {
  const [reviews, setReviews] = useState<Record<number, PRReviewState>>({});
  const [expandedPRs, setExpandedPRs] = useState<Set<number>>(new Set());
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<GitLink | null>(null);

  // Load saved reviews
  useEffect(() => {
    const loadedReviews: Record<number, PRReviewState> = {};
    pullRequests.forEach((pr) => {
      const saved = getPRReviewState(taskId, pr.id);
      if (saved) {
        loadedReviews[pr.id] = saved;
      }
    });
    queueMicrotask(() => setReviews(loadedReviews));
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

  // Open diff viewer
  const openDiffViewer = useCallback((pr: GitLink) => {
    setSelectedPR(pr);
    setDiffModalOpen(true);
  }, []);

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
                              className={`text-[10px] px-1 py-0 h-4 gap-0.5 ${statusInfo.bgColor} ${statusInfo.color}`}
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
                    {/* Diff Viewer Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs gap-2"
                      onClick={() => openDiffViewer(pr)}
                    >
                      <FileDiff className="h-3.5 w-3.5" />
                      View Diff & Inline Comments
                    </Button>

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

      {/* Diff Viewer Modal */}
      {selectedPR && (
        <DiffViewerModal
          isOpen={diffModalOpen}
          onClose={() => setDiffModalOpen(false)}
          pr={selectedPR}
          taskId={taskId}
        />
      )}
    </div>
  );
};

// ==================== DIFF VIEWER MODAL ====================

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pr: GitLink;
  taskId: number;
}

const DiffViewerModal: React.FC<DiffViewerModalProps> = ({ isOpen, onClose, pr, taskId }) => {
  const [diff, setDiff] = useState<PRDiff | null>(null);
  const [comments, setComments] = useState<InlineComment[]>([]);
  const [aiReviews, setAiReviews] = useState<AIReviewResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diff');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [collapsedFiles, setCollapsedFiles] = useState<Set<string>>(new Set());
  const [commentLine, setCommentLine] = useState<{ filePath: string; lineNumber: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isAiReviewRunning, setIsAiReviewRunning] = useState(false);

  // Load diff and comments
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [diffData, commentsData, aiData] = await Promise.all([
          fetchPRDiff(pr.id).catch(() => null),
          fetchPRComments(pr.id).catch(() => []),
          getAIReviewResults(pr.id).catch(() => []),
        ]);
        
        setDiff(diffData);
        setComments(commentsData);
        setAiReviews(aiData);
        
        if (diffData?.files.length) {
          setSelectedFile(diffData.files[0].filename);
        }
      } catch (error) {
        toast.error('Failed to load PR diff');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, pr.id]);

  // Toggle file collapse
  const toggleFileCollapse = useCallback((filename: string) => {
    setCollapsedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  }, []);

  // Start AI review
  const handleStartAIReview = useCallback(async () => {
    setIsAiReviewRunning(true);
    try {
      const result = await startAIReview(pr.id, undefined, {
        checkSecurity: true,
        checkPerformance: true,
        checkBestPractices: true,
      });
      setAiReviews((prev) => [...prev, result]);
      toast.success('AI review started');
      setActiveTab('ai-review');
    } catch (error) {
      toast.error('Failed to start AI review');
    } finally {
      setIsAiReviewRunning(false);
    }
  }, [pr.id]);

  // Add inline comment
  const handleAddComment = useCallback(async () => {
    if (!commentLine || !commentText.trim()) return;

    try {
      const newComment = await addInlineComment(pr.id, {
        filePath: commentLine.filePath,
        lineNumber: commentLine.lineNumber,
        text: commentText.trim(),
      });
      setComments((prev) => [...prev, newComment]);
      setCommentLine(null);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  }, [commentLine, commentText, pr.id]);

  // Resolve comment
  const handleResolveComment = useCallback(async (commentId: number) => {
    try {
      await resolveInlineComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, resolvedAt: new Date().toISOString() } : c))
      );
      toast.success('Comment resolved');
    } catch (error) {
      toast.error('Failed to resolve comment');
    }
  }, []);

  // Get comments for a specific line
  const getLineComments = useCallback(
    (filePath: string, lineNumber: number) => {
      return comments.filter(
        (c) => c.filePath === filePath && c.lineNumber === lineNumber && !c.resolvedAt
      );
    },
    [comments]
  );

  // Calculate stats
  const stats = useMemo(() => {
    if (!diff) return null;
    return {
      totalFiles: diff.files.length,
      additions: diff.stats.totalAdditions,
      deletions: diff.stats.totalDeletions,
      unresolvedComments: comments.filter((c) => !c.resolvedAt).length,
    };
  }, [diff, comments]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5 text-purple-500" />
              <span className="text-lg">{pr.title}</span>
              <Badge variant="outline" className="ml-2">
                #{pr.prNumber}
              </Badge>
            </div>
            {stats && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileCode className="h-4 w-4" />
                  {stats.totalFiles} files
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <Plus className="h-4 w-4" />
                  {stats.additions}
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <Minus className="h-4 w-4" />
                  {stats.deletions}
                </span>
                {stats.unresolvedComments > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <MessageSquare className="h-4 w-4" />
                    {stats.unresolvedComments}
                  </span>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(90vh-120px)]">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-10">
              <TabsTrigger value="diff" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <FileDiff className="h-4 w-4 mr-2" />
                Diff
              </TabsTrigger>
              <TabsTrigger value="comments" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
                {stats && stats.unresolvedComments > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.unresolvedComments}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ai-review" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                <Bot className="h-4 w-4 mr-2" />
                AI Review
                {aiReviews.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {aiReviews.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading diff...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Diff Tab */}
              <TabsContent value="diff" className="flex-1 overflow-hidden m-0 flex">
                {/* File List Sidebar */}
                <div className="w-64 border-r bg-muted/30 overflow-y-auto">
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Files</h4>
                    <div className="space-y-1">
                      {diff?.files.map((file) => (
                        <button
                          key={file.filename}
                          onClick={() => setSelectedFile(file.filename)}
                          className={cn(
                            'w-full text-left px-2 py-1.5 rounded text-xs transition-colors',
                            selectedFile === file.filename
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{getFileIcon(file.filename)}</span>
                            <span className="truncate flex-1">{file.filename.split('/').pop()}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 ml-5">
                            {file.additions > 0 && (
                              <span className="text-green-600">+{file.additions}</span>
                            )}
                            {file.deletions > 0 && (
                              <span className="text-red-600">-{file.deletions}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Diff Content */}
                <div className="flex-1 overflow-y-auto">
                  {selectedFile && diff && (
                    <FileDiffViewer
                      file={diff.files.find((f) => f.filename === selectedFile)!}
                      isCollapsed={collapsedFiles.has(selectedFile)}
                      onToggleCollapse={() => toggleFileCollapse(selectedFile)}
                      comments={comments}
                      commentLine={commentLine}
                      setCommentLine={setCommentLine}
                      commentText={commentText}
                      setCommentText={setCommentText}
                      onAddComment={handleAddComment}
                      onResolveComment={handleResolveComment}
                      getLineComments={getLineComments}
                    />
                  )}
                </div>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="flex-1 overflow-y-auto m-0 p-4">
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No comments yet</p>
                      <p className="text-sm">Add comments inline from the Diff tab</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <CommentCard
                        key={comment.id}
                        comment={comment}
                        onResolve={() => handleResolveComment(comment.id)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              {/* AI Review Tab */}
              <TabsContent value="ai-review" className="flex-1 overflow-y-auto m-0 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">AI Code Review</h3>
                    <Button
                      size="sm"
                      onClick={handleStartAIReview}
                      disabled={isAiReviewRunning}
                    >
                      {isAiReviewRunning ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Run AI Review
                        </>
                      )}
                    </Button>
                  </div>

                  {aiReviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No AI reviews yet</p>
                      <p className="text-sm">Run an AI review to get automated code analysis</p>
                    </div>
                  ) : (
                    aiReviews.map((review) => (
                      <AIReviewCard key={review.id} review={review} />
                    ))
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// ==================== FILE DIFF VIEWER ====================

interface FileDiffViewerProps {
  file: PRDiffFile;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  comments: InlineComment[];
  commentLine: { filePath: string; lineNumber: number } | null;
  setCommentLine: (line: { filePath: string; lineNumber: number } | null) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: () => void;
  onResolveComment: (commentId: number) => void;
  getLineComments: (filePath: string, lineNumber: number) => InlineComment[];
}

const FileDiffViewer: React.FC<FileDiffViewerProps> = ({
  file,
  isCollapsed,
  onToggleCollapse,
  commentLine,
  setCommentLine,
  commentText,
  setCommentText,
  onAddComment,
  getLineComments,
}) => {
  const lines = useMemo(() => parseDiffPatch(file.patch), [file.patch]);

  const getLineNumber = (line: ReturnType<typeof parseDiffPatch>[0]): number => {
    return line.newLineNumber || line.oldLineNumber || 0;
  };

  return (
    <div className="border-b">
      {/* File Header */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-muted/50 cursor-pointer hover:bg-muted"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <span>{getFileIcon(file.filename)}</span>
          <span className="text-sm font-medium">{file.filename}</span>
          {file.status !== 'modified' && (
            <Badge variant="outline" className="text-xs">
              {file.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {file.additions > 0 && (
            <span className="text-xs text-green-600">+{file.additions}</span>
          )}
          {file.deletions > 0 && (
            <span className="text-xs text-red-600">-{file.deletions}</span>
          )}
          {isCollapsed ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Diff Content */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <tbody>
              {lines.map((line, index) => {
                const lineNum = getLineNumber(line);
                const lineComments = getLineComments(file.filename, lineNum);
                const isCommenting = commentLine?.filePath === file.filename && commentLine?.lineNumber === lineNum;

                return (
                  <React.Fragment key={index}>
                    <tr
                      className={cn(
                        'hover:bg-muted/50',
                        line.type === 'addition' && 'bg-green-50/50',
                        line.type === 'deletion' && 'bg-red-50/50'
                      )}
                    >
                      <td className="w-12 text-right text-muted-foreground select-none px-2 py-0.5 border-r">
                        {line.oldLineNumber || ''}
                      </td>
                      <td className="w-12 text-right text-muted-foreground select-none px-2 py-0.5 border-r">
                        {line.newLineNumber || ''}
                      </td>
                      <td
                        className={cn(
                          'px-2 py-0.5 whitespace-pre',
                          line.type === 'addition' && 'text-green-700',
                          line.type === 'deletion' && 'text-red-700'
                        )}
                      >
                        {line.type === 'addition' && '+'}
                        {line.type === 'deletion' && '-'}
                        {line.content}
                      </td>
                      <td className="w-8 px-1">
                        <button
                          onClick={() => setCommentLine({ filePath: file.filename, lineNumber: lineNum })}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Line Comments */}
                    {lineComments.map((comment) => (
                      <tr key={comment.id}>
                        <td colSpan={4} className="pl-12 py-2">
                          <div className="bg-amber-50 rounded p-2 text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3" />
                              <span className="font-medium">{comment.author.username}</span>
                              <span className="text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p>{comment.text}</p>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Add Comment Form */}
                    {isCommenting && (
                      <tr>
                        <td colSpan={4} className="pl-12 py-2">
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="min-h-[60px] text-xs"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={onAddComment} disabled={!commentText.trim()}>
                                <Send className="h-3 w-3 mr-1" />
                                Comment
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setCommentLine(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==================== COMMENT CARD ====================

interface CommentCardProps {
  comment: InlineComment;
  onResolve: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, onResolve }) => {
  return (
    <div className={cn('border rounded-lg p-3', comment.resolvedAt && 'opacity-50')}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-3 w-3" />
          </div>
          <div>
            <span className="text-sm font-medium">{comment.author.username}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        {!comment.resolvedAt && (
          <Button size="sm" variant="ghost" onClick={onResolve}>
            <Check className="h-3 w-3 mr-1" />
            Resolve
          </Button>
        )}
      </div>
      <div className="mt-2 text-sm">
        <Badge variant="outline" className="mb-2">
          <FileCode className="h-3 w-3 mr-1" />
          {comment.filePath}:{comment.lineNumber}
        </Badge>
        <p>{comment.text}</p>
      </div>
      {comment.resolvedAt && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
          <Check className="h-3 w-3" />
          Resolved
        </div>
      )}
    </div>
  );
};

// ==================== AI REVIEW CARD ====================

interface AIReviewCardProps {
  review: AIReviewResult;
}

const AIReviewCard: React.FC<AIReviewCardProps> = ({ review }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">{review.agentName}</span>
          <Badge
            variant={review.status === 'completed' ? 'default' : 'outline'}
            className="text-xs"
          >
            {review.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(review.startedAt).toLocaleString()}
        </span>
      </div>

      {review.status === 'completed' && (
        <>
          <p className="text-sm mb-3">{review.summary}</p>
          
          {review.findings.length > 0 && (
            <div className="space-y-2">
              {review.findings.map((finding, index) => {
                const severity = severityConfig[finding.severity];
                return (
                  <div
                    key={index}
                    className={cn('rounded p-2 text-xs', severity.bgColor)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-[10px] h-4', severity.bgColor, severity.color)}>
                        {severity.label}
                      </Badge>
                      <span className="font-medium">{finding.category}</span>
                    </div>
                    {finding.filePath && (
                      <div className="text-muted-foreground mb-1">
                        {finding.filePath}
                        {finding.lineNumber && `:${finding.lineNumber}`}
                      </div>
                    )}
                    <p className={severity.color}>{finding.message}</p>
                    {finding.suggestion && (
                      <p className="mt-1 text-muted-foreground">
                        💡 {finding.suggestion}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {review.status === 'failed' && review.errorMessage && (
        <div className="text-red-600 text-sm">{review.errorMessage}</div>
      )}

      {review.status === 'running' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Analyzing code...
        </div>
      )}
    </div>
  );
};

export default GitReviewPanel;
