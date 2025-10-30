import { User } from "@/state/api";
import Image from "next/image";
import React from "react";

type UserWithStats = User & {
  teamName?: string;
  taskStats?: {
    authored: number;
    assigned: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  activityStats?: {
    totalComments: number;
    totalAttachments: number;
    lastActivity: string | null;
  };
};

type Props = {
  user: UserWithStats;
  showStats?: boolean;
  onManageRole?: (user: UserWithStats) => void;
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <Image
            src={user.profilePictureUrl 
              ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
              : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
            }
            alt={`${user.username}'s profile picture`}
            width={56}
            height={56}
            className="rounded-full border-2 border-gray-200 object-cover dark:border-gray-600"
          />
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.username}
            </h3>
            <div className="flex items-center space-x-2">
              {user.teamName && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {user.teamName}
                </span>
              )}
              {user.role && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
              {onManageRole && (
                <button
                  onClick={() => onManageRole(user)}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  title="Manage role"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </p>

          {showStats && user.taskStats && (
            <div className="mt-4 space-y-3">
              {/* Task Statistics */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Overview
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {user.taskStats.authored}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {user.taskStats.assigned}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Assigned
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {user.taskStats.completed}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {user.taskStats.overdue}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Overdue
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Statistics */}
              {user.activityStats && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activity
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      {user.activityStats.totalComments} comments • {user.activityStats.totalAttachments} files
                    </span>
                    <span className="text-xs">
                      {formatLastActivity(user.activityStats.lastActivity)}
                    </span>
                  </div>
                </div>
              )}

              {/* Completion Rate */}
              {user.taskStats.assigned > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Completion Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round((user.taskStats.completed / user.taskStats.assigned) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{ 
                        width: `${Math.round((user.taskStats.completed / user.taskStats.assigned) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
