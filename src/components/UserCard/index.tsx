import { UserWithStats } from "@/hooks/useApi";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Settings, MessageCircle, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  user: UserWithStats;
  showStats?: boolean;
  onManageRole?: (user: UserWithStats) => void;
};

const getRoleBadge = (role: string) => {
  const roleMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    'admin': { variant: 'destructive', label: 'Admin' },
    'project_manager': { variant: 'default', label: 'Project Manager' },
    'member': { variant: 'secondary', label: 'Member' },
    'viewer': { variant: 'outline', label: 'Viewer' },
  };
  return roleMap[role] || roleMap['member'];
};

const UserCard = ({ user, showStats = false, onManageRole }: Props) => {
  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return "No recent activity";
    const date = new Date(lastActivity);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const roleBadge = getRoleBadge(user.role || 'member');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-4">
        {/* Header with Profile and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user.profilePictureUrl 
                  ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
                  : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
                }
                alt={`${user.username}'s profile`}
                className="h-16 w-16 rounded-full border-2 border-border object-cover"
              />
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-gray-600" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {user.username}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          {onManageRole && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageRole(user)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Role and Team Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={roleBadge.variant} className="text-xs">
            {roleBadge.label}
          </Badge>
          
          {user.teamName && (
            <Badge variant="outline" className="text-xs">
              {user.teamName}
            </Badge>
          )}
        </div>

        {showStats && user.taskStats && (
          <div className="space-y-4">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-lg font-bold text-primary">
                  {user.taskStats.authored}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Created
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {user.taskStats.assigned}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Assigned
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {user.taskStats.completed}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Done
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {user.taskStats.overdue}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Overdue
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {user.taskStats.assigned > 0 && (
              <div className="rounded-lg bg-muted p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Completion Rate
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {Math.round((user.taskStats.completed / user.taskStats.assigned) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={Math.round((user.taskStats.completed / user.taskStats.assigned) * 100)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Activity Info */}
            {user.activityStats && (
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {user.activityStats.totalComments}
                    </span>
                    <span className="text-muted-foreground">comments</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {user.activityStats.totalAttachments}
                    </span>
                    <span className="text-muted-foreground">files</span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatLastActivity(user.activityStats.lastActivity)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
