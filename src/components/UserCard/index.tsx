import { UserWithStats } from "@/hooks/useApi";
import React from "react";

type Props = {
  user: UserWithStats;
  showStats?: boolean;
  onManageRole?: (user: UserWithStats) => void;
};

const getRoleBadgeProps = (role: string) => {
  const roleMap: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    'admin': { 
      bg: 'bg-gradient-to-r from-red-500 to-red-600', 
      text: 'text-white', 
      label: 'Admin',
      icon: '👑'
    },
    'project_manager': { 
      bg: 'bg-gradient-to-r from-purple-500 to-purple-600', 
      text: 'text-white', 
      label: 'Project Manager',
      icon: '🎯'
    },
    'member': { 
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600', 
      text: 'text-white', 
      label: 'Member',
      icon: '👤'
    },
    'viewer': { 
      bg: 'bg-gradient-to-r from-gray-400 to-gray-500', 
      text: 'text-white', 
      label: 'Viewer',
      icon: '👁️'
    },
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

  const roleProps = getRoleBadgeProps(user.role || 'member');

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-900/20">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-900/10 dark:to-purple-900/10" />
      
      <div className="relative p-6">
        {/* Header with Profile and Actions */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user.profilePictureUrl 
                  ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
                  : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
                }
                alt={`${user.username}'s profile`}
                className="h-16 w-16 rounded-full border-3 border-white object-cover shadow-lg dark:border-gray-700"
              />
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-green-400 dark:border-gray-800" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {user.username}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {onManageRole && (
            <button
              onClick={() => onManageRole(user)}
              className="rounded-lg bg-gray-100 p-2 text-gray-600 opacity-0 transition-all duration-200 hover:bg-gray-200 hover:text-gray-800 group-hover:opacity-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
              title="Manage role"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Role and Team Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${roleProps.bg} ${roleProps.text}`}>
            <span>{roleProps.icon}</span>
            <span>{roleProps.label}</span>
          </span>
          
          {user.teamName && (
            <span className="inline-flex items-center space-x-1 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
              <span>🏢</span>
              <span>{user.teamName}</span>
            </span>
          )}
        </div>

        {showStats && user.taskStats && (
          <div className="space-y-4">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {user.taskStats.authored}
                </div>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Created
                </div>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 text-center dark:bg-purple-900/20">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {user.taskStats.assigned}
                </div>
                <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  Assigned
                </div>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {user.taskStats.completed}
                </div>
                <div className="text-xs font-medium text-green-700 dark:text-green-300">
                  Done
                </div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-900/20">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {user.taskStats.overdue}
                </div>
                <div className="text-xs font-medium text-red-700 dark:text-red-300">
                  Overdue
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {user.taskStats.assigned > 0 && (
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Completion Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.round((user.taskStats.completed / user.taskStats.assigned) * 100)}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-500"
                    style={{ 
                      width: `${Math.round((user.taskStats.completed / user.taskStats.assigned) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Activity Info */}
            {user.activityStats && (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/50">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <span>💬</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.activityStats.totalComments}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">comments</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>📎</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.activityStats.totalAttachments}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">files</span>
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatLastActivity(user.activityStats.lastActivity)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
