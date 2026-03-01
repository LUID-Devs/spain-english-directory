/**
 * Types for Task External Sharing feature
 * Allows sharing individual tasks from private projects with external users
 */

/** External User entity - represents an invited external user */
export interface ExternalUser {
  id: number;
  email: string;
  name?: string | null;
  token: string;
  organizationId: number;
  invitedBy: number;
  lastAccessedAt?: string | Date | null;
  accessCount: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** Task External Share entity - junction between tasks and external users */
export interface TaskExternalShare {
  id: number;
  taskId: number;
  externalUserId: number;
  sharedBy: number;
  sharedAt: string | Date;
  revokedAt?: string | Date | null;
  isActive: boolean;
  externalUser?: ExternalUser;
}

/** Request to share a task with an external user */
export interface ShareTaskRequest {
  email: string;
  name?: string;
}

/** Response for a single share creation */
export interface ShareTaskResponse {
  success: boolean;
  share?: TaskExternalShare & { externalUser: ExternalUser };
  error?: string;
}

/** Request to revoke access */
export interface RevokeShareRequest {
  externalUserId: number;
}

/** Response for revoke operation */
export interface RevokeShareResponse {
  success: boolean;
  error?: string;
}

/** List shares for a task response */
export interface ListTaskSharesResponse {
  success: boolean;
  shares: (TaskExternalShare & { externalUser: ExternalUser })[];
}

/** External user access to a shared task */
export interface SharedTaskAccess {
  success: boolean;
  task?: {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    priority?: string | null;
    taskType?: string | null;
    tags?: string | null;
    dueDate?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    author?: {
      userId: number;
      username?: string | null;
      profilePictureUrl?: string | null;
    };
    assignee?: {
      userId: number;
      username?: string | null;
      profilePictureUrl?: string | null;
    };
    project?: {
      id: number;
      name: string;
    };
  };
  sharedBy?: {
    userId: number;
    username?: string | null;
    email: string;
  };
  error?: string;
}

/** Visibility info for a task (shown to internal users) */
export interface TaskVisibilityInfo {
  isSharedExternally: boolean;
  externalShares: {
    externalUserId: number;
    email: string;
    name?: string;
    sharedAt: string;
    lastAccessedAt?: string;
    accessCount: number;
    isActive: boolean;
  }[];
}
