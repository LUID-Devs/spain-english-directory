import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import {
  ExternalUser,
  TaskExternalShare,
  ShareTaskRequest,
  ShareTaskResponse,
  RevokeShareResponse,
  SharedTaskAccess,
  TaskVisibilityInfo,
} from "../types/taskShare.types";
import {
  sendExternalShareInvitation,
  sendAccessRevokedNotification,
} from "./email.service";

export const prisma = new PrismaClient();

/**
 * Generate a secure random token for external user access
 */
function generateAccessToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Share a task with an external user by email
 * Creates the external user if they don't exist, or reactivates if previously invited
 */
export async function shareTaskWithExternalUser(
  taskId: number,
  organizationId: number,
  sharedBy: number,
  data: ShareTaskRequest
): Promise<ShareTaskResponse> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Verify task exists and belongs to organization
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Check if already shared with this email
    const existingShare = await prisma.taskExternalShare.findFirst({
      where: {
        taskId,
        externalUser: { email: data.email, organizationId },
        isActive: true,
      },
      include: { externalUser: true },
    });

    if (existingShare) {
      return { success: false, error: "Task already shared with this email" };
    }

    // Use transaction to create/update external user and create share
    const result = await prisma.$transaction(async (tx) => {
      // Try to find existing external user
      let externalUser = await tx.externalUser.findUnique({
        where: {
          email_organizationId: {
            email: data.email,
            organizationId,
          },
        },
      });

      if (externalUser) {
        // Reactivate if previously deactivated
        if (!externalUser.isActive) {
          externalUser = await tx.externalUser.update({
            where: { id: externalUser.id },
            data: { 
              isActive: true, 
              name: data.name || externalUser.name,
              updatedAt: new Date(),
            },
          });
        }
      } else {
        // Create new external user
        externalUser = await tx.externalUser.create({
          data: {
            email: data.email,
            name: data.name || null,
            token: generateAccessToken(),
            organizationId,
            invitedBy: sharedBy,
          },
        });
      }

      // Create the share
      const share = await tx.taskExternalShare.create({
        data: {
          taskId,
          externalUserId: externalUser.id,
          sharedBy,
          isActive: true,
        },
        include: { externalUser: true },
      });

      // Update task isShared flag if not already set
      if (!task.isShared) {
        await tx.task.update({
          where: { id: taskId },
          data: { isShared: true },
        });
      }

      return share;
    });

    // Get the user who shared the task for the email
    const sharedByUser = await prisma.user.findUnique({
      where: { userId: sharedBy },
      select: { username: true },
    });

    // Send email notification to external user (non-blocking)
    sendExternalShareInvitation(
      result.externalUser as ExternalUser,
      result as TaskExternalShare,
      task.title,
      sharedByUser?.username || "A team member"
    ).catch((err) => {
      console.error("Failed to send share invitation email:", err);
    });

    return { success: true, share: result as TaskExternalShare & { externalUser: ExternalUser } };
  } catch (error) {
    console.error("Error sharing task:", error);
    return { success: false, error: "Failed to share task" };
  }
}

/**
 * Revoke external access to a task
 */
export async function revokeTaskShare(
  taskId: number,
  organizationId: number,
  externalUserId: number
): Promise<RevokeShareResponse> {
  try {
    // Verify task exists and belongs to organization
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Find the share
    const share = await prisma.taskExternalShare.findFirst({
      where: {
        taskId,
        externalUserId,
        isActive: true,
      },
    });

    if (!share) {
      return { success: false, error: "Share not found or already revoked" };
    }

    await prisma.taskExternalShare.update({
      where: { id: share.id },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    // Check if there are any remaining active shares for this task
    const remainingShares = await prisma.taskExternalShare.count({
      where: { taskId, isActive: true },
    });

    // If no remaining shares, update task isShared flag
    if (remainingShares === 0 && task.isShared) {
      await prisma.task.update({
        where: { id: taskId },
        data: { isShared: false },
      });
    }

    // Get external user and the user who revoked for notification
    const [externalUser, revokedByUser] = await Promise.all([
      prisma.externalUser.findUnique({
        where: { id: externalUserId },
      }),
      prisma.user.findUnique({
        where: { userId: share.sharedBy },
        select: { username: true },
      }),
    ]);

    // Send email notification about revoked access (non-blocking)
    if (externalUser) {
      sendAccessRevokedNotification(
        externalUser as ExternalUser,
        task.title,
        revokedByUser?.username || "A team member"
      ).catch((err) => {
        console.error("Failed to send access revoked email:", err);
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error revoking share:", error);
    return { success: false, error: "Failed to revoke access" };
  }
}

/**
 * List all external shares for a task
 */
export async function listTaskShares(
  taskId: number,
  organizationId: number
): Promise<(TaskExternalShare & { externalUser: ExternalUser })[]> {
  const shares = await prisma.taskExternalShare.findMany({
    where: {
      taskId,
      task: { organizationId },
    },
    include: { externalUser: true },
    orderBy: { sharedAt: "desc" },
  });

  return shares as (TaskExternalShare & { externalUser: ExternalUser })[];
}

/**
 * Get visibility info for a task (for internal users)
 */
export async function getTaskVisibilityInfo(
  taskId: number,
  organizationId: number
): Promise<TaskVisibilityInfo | null> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    include: {
      externalShares: {
        where: { isActive: true },
        include: { externalUser: true },
      },
    },
  });

  if (!task) return null;

  return {
    isSharedExternally: task.isShared && task.externalShares.length > 0,
    externalShares: task.externalShares.map((share) => ({
      externalUserId: share.externalUser.id,
      email: share.externalUser.email,
      name: share.externalUser.name || undefined,
      sharedAt: share.sharedAt.toISOString(),
      lastAccessedAt: share.externalUser.lastAccessedAt?.toISOString(),
      accessCount: share.externalUser.accessCount,
      isActive: share.isActive,
    })),
  };
}

/**
 * Validate external user token and get shared task access
 */
export async function validateExternalAccess(
  token: string,
  taskId?: number
): Promise<SharedTaskAccess> {
  try {
    const externalUser = await prisma.externalUser.findUnique({
      where: { token },
      include: {
        taskShares: {
          where: taskId ? { taskId, isActive: true } : { isActive: true },
          include: {
            task: {
              include: {
                author: {
                  select: {
                    userId: true,
                    username: true,
                    profilePictureUrl: true,
                  },
                },
                assignee: {
                  select: {
                    userId: true,
                    username: true,
                    profilePictureUrl: true,
                  },
                },
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!externalUser || !externalUser.isActive) {
      return { success: false, error: "Invalid or expired access token" };
    }

    // If taskId specified, check if user has access to that specific task
    if (taskId) {
      const share = externalUser.taskShares.find((s) => s.taskId === taskId);
      if (!share) {
        return { success: false, error: "Access denied to this task" };
      }

      // Update access stats
      await prisma.externalUser.update({
        where: { id: externalUser.id },
        data: {
          lastAccessedAt: new Date(),
          accessCount: { increment: 1 },
        },
      });

      const sharedByUser = await prisma.user.findUnique({
        where: { userId: share.sharedBy },
        select: {
          userId: true,
          username: true,
          email: true,
        },
      });

      return {
        success: true,
        task: {
          id: share.task.id,
          title: share.task.title,
          description: share.task.description || undefined,
          status: share.task.status,
          priority: share.task.priority || undefined,
          taskType: share.task.taskType || undefined,
          tags: share.task.tags || undefined,
          dueDate: share.task.dueDate?.toISOString(),
          createdAt: share.task.createdAt.toISOString(),
          updatedAt: share.task.updatedAt.toISOString(),
          author: share.task.author || undefined,
          assignee: share.task.assignee || undefined,
          project: share.task.project || undefined,
        },
        sharedBy: sharedByUser || undefined,
      };
    }

    // Return list of accessible tasks if no specific taskId
    return {
      success: true,
      task: undefined,
    };
  } catch (error) {
    console.error("Error validating external access:", error);
    return { success: false, error: "Failed to validate access" };
  }
}

/**
 * Get a shared task by token and task ID
 */
export async function getSharedTask(
  token: string,
  taskId: number
): Promise<SharedTaskAccess> {
  return validateExternalAccess(token, taskId);
}

/**
 * List all tasks shared with an external user
 */
export async function listSharedTasks(token: string): Promise<SharedTaskAccess> {
  try {
    const externalUser = await prisma.externalUser.findUnique({
      where: { token },
      include: {
        taskShares: {
          where: { isActive: true },
          include: {
            task: {
              include: {
                author: {
                  select: {
                    userId: true,
                    username: true,
                    profilePictureUrl: true,
                  },
                },
                assignee: {
                  select: {
                    userId: true,
                    username: true,
                    profilePictureUrl: true,
                  },
                },
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!externalUser || !externalUser.isActive) {
      return { success: false, error: "Invalid or expired access token" };
    }

    // Update access stats
    await prisma.externalUser.update({
      where: { id: externalUser.id },
      data: {
        lastAccessedAt: new Date(),
        accessCount: { increment: 1 },
      },
    });

    const tasks = await Promise.all(
      externalUser.taskShares.map(async (share) => {
        const sharedByUser = await prisma.user.findUnique({
          where: { userId: share.sharedBy },
          select: {
            userId: true,
            username: true,
            email: true,
          },
        });

        return {
          task: {
            id: share.task.id,
            title: share.task.title,
            description: share.task.description || undefined,
            status: share.task.status,
            priority: share.task.priority || undefined,
            taskType: share.task.taskType || undefined,
            tags: share.task.tags || undefined,
            dueDate: share.task.dueDate?.toISOString(),
            createdAt: share.task.createdAt.toISOString(),
            updatedAt: share.task.updatedAt.toISOString(),
            author: share.task.author || undefined,
            assignee: share.task.assignee || undefined,
            project: share.task.project || undefined,
          },
          sharedBy: sharedByUser || undefined,
        };
      })
    );

    return {
      success: true,
      // Return the first task for compatibility with SharedTaskAccess
      task: tasks[0]?.task,
    };
  } catch (error) {
    console.error("Error listing shared tasks:", error);
    return { success: false, error: "Failed to retrieve shared tasks" };
  }
}
