import React, { useState } from 'react';
import {
  Bell,
  Check,
  X,
  GitPullRequest,
  Clock,
  User,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useGitReviewNotifications, useRespondToReviewRequest } from '@/hooks/useGitReview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/utils';

interface PRReviewNotificationsProps {
  className?: string;
}

export const PRReviewNotifications: React.FC<PRReviewNotificationsProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, pendingRequests, hasUnread } = useGitReviewNotifications();
  const respondMutation = useRespondToReviewRequest();

  const handleAccept = async (requestId: number) => {
    await respondMutation.mutateAsync({ requestId, accept: true });
  };

  const handleDecline = async (requestId: number) => {
    await respondMutation.mutateAsync({ requestId, accept: false });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Review notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-purple-500" />
            <span className="font-medium">Code Review Requests</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} pending
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          {pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <Bell className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No pending review requests</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-colors',
                    request.status === 'pending' && 'bg-amber-50/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <GitPullRequest className="h-4 w-4 text-purple-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          PR #{request.prId}
                        </span>
                        <Badge
                          variant={request.status === 'pending' ? 'default' : 'outline'}
                          className="text-[10px] h-4"
                        >
                          {request.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>Requested by {request.requestedBy.username}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(request.requestedAt))}
                        </span>
                      </div>

                      {request.message && (
                        <div className="mt-2 text-sm bg-muted p-2 rounded">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          {request.message}
                        </div>
                      )}

                      {request.dueDate && (
                        <div className="mt-1 text-xs text-amber-600">
                          Due {formatDistanceToNow(new Date(request.dueDate))}
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleAccept(request.id)}
                            disabled={respondMutation.isPending}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleDecline(request.id)}
                            disabled={respondMutation.isPending}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default PRReviewNotifications;
