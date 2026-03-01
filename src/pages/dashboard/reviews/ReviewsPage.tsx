import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Filter,
  ChevronDown,
  Search,
  Eye,
  GitBranch,
  User,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/app/authProvider';
import { 
  usePendingReviewRequests, 
  useGitReviewNotifications 
} from '@/hooks/useGitReview';
import { GitLink } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';

// ==================== TYPES ====================

type PRGroupBy = 'responsibility' | 'status' | 'author' | 'repository' | 'none';
type PRResponsibility = 'todo' | 'waiting' | 'approved' | 'authored';

interface PullRequestWithReview extends GitLink {
  responsibility: PRResponsibility;
  reviewStatus?: 'pending' | 'reviewing' | 'approved' | 'changes_requested' | 'merged';
  commentCount: number;
  unresolvedComments: number;
  lastActivityAt: string;
}

// ==================== MOCK DATA ====================

const mockPRs: PullRequestWithReview[] = [
  {
    id: 1,
    title: 'Add user authentication flow',
    url: 'https://github.com/org/repo/pull/123',
    repository: 'taskluid-web',
    prNumber: 123,
    prState: 'open',
    authorUsername: 'johndoe',
    authorName: 'John Doe',
    authorAvatarUrl: 'https://github.com/johndoe.png',
    taskId: 456,
    responsibility: 'todo',
    reviewStatus: 'pending',
    commentCount: 3,
    unresolvedComments: 2,
    lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 2,
    title: 'Implement dark mode toggle',
    url: 'https://github.com/org/repo/pull/124',
    repository: 'taskluid-web',
    prNumber: 124,
    prState: 'open',
    authorUsername: 'alice',
    authorName: 'Alice Smith',
    authorAvatarUrl: 'https://github.com/alice.png',
    taskId: 457,
    responsibility: 'waiting',
    reviewStatus: 'reviewing',
    commentCount: 5,
    unresolvedComments: 0,
    lastActivityAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 3,
    title: 'Fix navigation bug on mobile',
    url: 'https://github.com/org/repo/pull/125',
    repository: 'taskluid-mobile',
    prNumber: 125,
    prState: 'open',
    authorUsername: 'bob',
    authorName: 'Bob Wilson',
    authorAvatarUrl: 'https://github.com/bob.png',
    taskId: 458,
    responsibility: 'approved',
    reviewStatus: 'approved',
    commentCount: 1,
    unresolvedComments: 0,
    lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 4,
    title: 'Update API documentation',
    url: 'https://github.com/org/repo/pull/126',
    repository: 'taskluid-backend',
    prNumber: 126,
    prState: 'open',
    authorUsername: 'currentuser',
    authorName: 'Current User',
    responsibility: 'authored',
    reviewStatus: 'pending',
    commentCount: 2,
    unresolvedComments: 1,
    lastActivityAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
];

// ==================== COMPONENT ====================

export default function ReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupBy, setGroupBy] = useState<PRGroupBy>('responsibility');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  // Fetch pending review requests
  const { data: pendingRequests } = usePendingReviewRequests();
  const { unreadCount } = useGitReviewNotifications();

  // Filter and group PRs
  const filteredPRs = useMemo(() => {
    return mockPRs.filter((pr) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          pr.title.toLowerCase().includes(query) ||
          pr.repository.toLowerCase().includes(query) ||
          pr.authorUsername?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // State filters
      if (pr.prState === 'closed' && !showClosed) return false;
      if (pr.prState === 'draft' && !showDrafts) return false;

      return true;
    });
  }, [searchQuery, showClosed, showDrafts]);

  const groupedPRs = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Pull Requests': filteredPRs };
    }

    const groups: Record<string, PullRequestWithReview[]> = {};

    filteredPRs.forEach((pr) => {
      let key: string;

      switch (groupBy) {
        case 'responsibility':
          key = {
            todo: '🔔 To Do',
            waiting: '⏳ Waiting for others',
            approved: '✅ Approved',
            authored: '✏️ Authored by you',
          }[pr.responsibility] || 'Other';
          break;
        case 'status':
          key = pr.prState.charAt(0).toUpperCase() + pr.prState.slice(1);
          break;
        case 'author':
          key = pr.authorName || pr.authorUsername || 'Unknown';
          break;
        case 'repository':
          key = pr.repository;
          break;
        default:
          key = 'All';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(pr);
    });

    // Sort groups by priority for responsibility grouping
    if (groupBy === 'responsibility') {
      const orderedGroups: Record<string, PullRequestWithReview[]> = {};
      const order = ['🔔 To Do', '⏳ Waiting for others', '✅ Approved', '✏️ Authored by you'];
      order.forEach((key) => {
        if (groups[key]) {
          orderedGroups[key] = groups[key];
        }
      });
      // Add any other groups
      Object.entries(groups).forEach(([key, value]) => {
        if (!orderedGroups[key]) {
          orderedGroups[key] = value;
        }
      });
      return orderedGroups;
    }

    return groups;
  }, [filteredPRs, groupBy]);

  const handlePRClick = (pr: PullRequestWithReview) => {
    // Navigate to the task with the PR review panel open
    navigate(`/dashboard/tasks/${pr.taskId}?tab=reviews`);
  };

  const handleOpenInGitHub = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GitPullRequest className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Reviews</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your pull request reviews
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {unreadCount} pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pull requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as PRGroupBy)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="responsibility">Responsibility</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="repository">Repository</SelectItem>
                <SelectItem value="none">No Grouping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showClosed}
                onChange={(e) => setShowClosed(e.target.checked)}
                className="rounded border-border"
              />
              Show closed
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDrafts}
                onChange={(e) => setShowDrafts(e.target.checked)}
                className="rounded border-border"
              />
              Show drafts
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {Object.entries(groupedPRs).map(([groupName, prs]) => (
            <div key={groupName} className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {groupName}
                <Badge variant="secondary" className="text-xs">
                  {prs.length}
                </Badge>
              </h2>

              <div className="space-y-2">
                {prs.map((pr) => (
                  <PRRow
                    key={pr.id}
                    pr={pr}
                    onClick={() => handlePRClick(pr)}
                    onOpenInGitHub={(e) => handleOpenInGitHub(e, pr.url)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredPRs.length === 0 && (
            <div className="text-center py-12">
              <GitPullRequest className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">No pull requests found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'You have no pull requests to review'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== PR ROW COMPONENT ====================

interface PRRowProps {
  pr: PullRequestWithReview;
  onClick: () => void;
  onOpenInGitHub: (e: React.MouseEvent) => void;
}

function PRRow({ pr, onClick, onOpenInGitHub }: PRRowProps) {
  const getStatusIcon = () => {
    switch (pr.reviewStatus) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'changes_requested':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'reviewing':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (pr.prState) {
      case 'merged':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Merged
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Closed
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            Draft
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Open
          </Badge>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group p-4 rounded-lg border bg-card',
        'hover:border-primary/50 hover:shadow-sm',
        'cursor-pointer transition-all'
      )}
    >
      <div className="flex items-start gap-4">
        {/* PR Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <GitPullRequest className="h-5 w-5 text-purple-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-medium text-foreground truncate">
                  {pr.title}
                </h3>
                {getStatusBadge()}
                {pr.responsibility === 'todo' && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    Needs your review
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5" />
                  {pr.repository}
                </span>
                <span>#{pr.prNumber}</span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {pr.authorName || pr.authorUsername}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(pr.lastActivityAt)}
                </span>
              </div>
            </div>

            {/* Right side info */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Comments */}
              {pr.commentCount > 0 && (
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  pr.unresolvedComments > 0 ? "text-amber-600" : "text-muted-foreground"
                )}>
                  <MessageSquare className="h-4 w-4" />
                  <span>{pr.commentCount}</span>
                  {pr.unresolvedComments > 0 && (
                    <span className="text-xs">({pr.unresolvedComments} unresolved)</span>
                  )}
                </div>
              )}

              {/* Review Status */}
              <Tooltip content={`Review: ${pr.reviewStatus || 'pending'}`}>
                {getStatusIcon()}
              </Tooltip>

              {/* Author Avatar */}
              <Avatar className="h-7 w-7">
                <AvatarImage src={pr.authorAvatarUrl} />
                <AvatarFallback>
                  {(pr.authorName || pr.authorUsername || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Open in GitHub */}
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onOpenInGitHub}
              >
                Open
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TOOLTIP COMPONENT ====================

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg whitespace-nowrap z-50">
          {content}
        </div>
      )}
    </div>
  );
}
