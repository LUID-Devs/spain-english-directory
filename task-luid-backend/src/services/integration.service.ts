import { PrismaClient, Prisma } from "@prisma/client";
import * as crypto from "crypto";
import {
  Integration,
  IntegrationProvider,
  IntegrationStatus,
  IntegratedTask,
  OAuthInitiateResponse,
  OAuthCallbackResponse,
  ListIntegrationsResponse,
  DisconnectIntegrationResponse,
  SyncIntegrationResponse,
  ListIntegratedTasksResponse,
  UnifiedSearchResponse,
  AsanaTask,
  AsanaWorkspace,
  LinearIssue,
  LinearTeam,
} from "../types/integration.types";

export const prisma = new PrismaClient();

// Provider configuration
const PROVIDER_CONFIG: Record<string, { authUrl: string; tokenUrl: string; apiBaseUrl: string; scopes: string[] }> = {
  ASANA: {
    authUrl: "https://app.asana.com/-/oauth_authorize",
    tokenUrl: "https://app.asana.com/-/oauth_token",
    apiBaseUrl: "https://app.asana.com/api/1.0",
    scopes: ["default"],
  },
  LINEAR: {
    authUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://api.linear.app/oauth/token",
    apiBaseUrl: "https://api.linear.app/graphql",
    scopes: ["read", "issues:read"],
  },
};

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * Generate OAuth state parameter for CSRF protection
 */
function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Encrypt sensitive token data (simplified - use proper encryption in production)
 */
function encryptToken(token: string): string {
  // In production, use proper encryption with AWS KMS or similar
  // This is a placeholder that should be replaced with actual encryption
  return Buffer.from(token).toString("base64");
}

/**
 * Decrypt token data
 */
function decryptToken(encryptedToken: string): string {
  return Buffer.from(encryptedToken, "base64").toString("utf-8");
}

/**
 * Initiate OAuth flow for a provider
 */
export async function initiateOAuth(
  provider: string,
  redirectUri: string,
  organizationId: number,
  userId: number
): Promise<OAuthInitiateResponse> {
  try {
    const config = PROVIDER_CONFIG[provider];
    if (!config) {
      return { success: false, error: `Unsupported provider: ${provider}` };
    }

    const state = generateOAuthState();
    
    // Store state in temporary cache or database for validation
    // For now, we'll create a pending integration record
    await prisma.integration.deleteMany({
      where: {
        provider: provider as IntegrationProvider,
        organizationId,
        userId,
        status: "DISCONNECTED" as IntegrationStatus,
      },
    });

    const clientId = process.env[`${provider}_CLIENT_ID`];
    if (!clientId) {
      return { success: false, error: `OAuth not configured for ${provider}` };
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      response_type: "code",
    });

    if (config.scopes.length > 0) {
      params.append("scope", config.scopes.join(" "));
    }

    const authorizationUrl = `${config.authUrl}?${params.toString()}`;

    return { success: true, authorizationUrl, state };
  } catch (error) {
    console.error("Error initiating OAuth:", error);
    return { success: false, error: "Failed to initiate OAuth flow" };
  }
}

/**
 * Handle OAuth callback and complete connection
 */
export async function handleOAuthCallback(
  provider: string,
  code: string,
  organizationId: number,
  userId: number
): Promise<OAuthCallbackResponse> {
  try {
    const config = PROVIDER_CONFIG[provider];
    if (!config) {
      return { success: false, error: `Unsupported provider: ${provider}` };
    }

    const clientId = process.env[`${provider}_CLIENT_ID`];
    const clientSecret = process.env[`${provider}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      return { success: false, error: `OAuth not configured for ${provider}` };
    }

    // Exchange code for access token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Token exchange failed:", error);
      return { success: false, error: "Failed to exchange OAuth code" };
    }

    const tokenData = await tokenResponse.json() as TokenData;

    // Fetch user/workspace info from provider
    let workspaceInfo: { id: string; name: string; userId: string };
    
    if (provider === "ASANA") {
      workspaceInfo = await fetchAsanaWorkspaceInfo(tokenData.access_token);
    } else if (provider === "LINEAR") {
      workspaceInfo = await fetchLinearWorkspaceInfo(tokenData.access_token);
    } else {
      return { success: false, error: "Unknown provider" };
    }

    // Create or update integration
    const integration = await prisma.integration.upsert({
      where: {
        provider_organizationId_userId: {
          provider: provider as IntegrationProvider,
          organizationId,
          userId,
        },
      },
      update: {
        accessToken: encryptToken(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
        tokenExpiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000) 
          : null,
        status: "CONNECTED" as IntegrationStatus,
        externalUserId: workspaceInfo.userId,
        externalWorkspaceId: workspaceInfo.id,
        externalWorkspaceName: workspaceInfo.name,
        name: `${provider} - ${workspaceInfo.name}`,
        updatedAt: new Date(),
      },
      create: {
        provider: provider as IntegrationProvider,
        organizationId,
        userId,
        name: `${provider} - ${workspaceInfo.name}`,
        accessToken: encryptToken(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
        tokenExpiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000) 
          : null,
        status: "CONNECTED" as IntegrationStatus,
        externalUserId: workspaceInfo.userId,
        externalWorkspaceId: workspaceInfo.id,
        externalWorkspaceName: workspaceInfo.name,
      },
    });

    // Trigger initial sync
    await syncIntegration(integration.id, organizationId);

    return {
      success: true,
      integration: mapIntegrationToResponse(integration),
    };
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return { success: false, error: "Failed to complete OAuth connection" };
  }
}

/**
 * Fetch Asana workspace info
 */
async function fetchAsanaWorkspaceInfo(accessToken: string): Promise<{ id: string; name: string; userId: string }> {
  const response = await fetch("https://app.asana.com/api/1.0/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Asana user info");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as { data: { gid: string; workspaces?: Array<{ gid: string; name: string }> } };
  const workspace = data.data.workspaces?.[0];
  
  if (!workspace) {
    throw new Error("No Asana workspace found");
  }

  return {
    id: workspace.gid,
    name: workspace.name,
    userId: data.data.gid,
  };
}

/**
 * Fetch Linear workspace info
 */
async function fetchLinearWorkspaceInfo(accessToken: string): Promise<{ id: string; name: string; userId: string }> {
  const query = `
    query {
      viewer {
        id
        name
        organization {
          id
          name
        }
      }
    }
  `;

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Linear user info");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as { data: { viewer: { id: string; organization: { id: string; name: string } } } };
  
  return {
    id: data.data.viewer.organization.id,
    name: data.data.viewer.organization.name,
    userId: data.data.viewer.id,
  };
}

/**
 * Map database integration to API response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapIntegrationToResponse(integration: Record<string, any>): Integration {
  return {
    id: integration.id,
    provider: integration.provider as IntegrationProvider,
    name: integration.name,
    status: integration.status as IntegrationStatus,
    externalWorkspaceId: integration.externalWorkspaceId || undefined,
    externalWorkspaceName: integration.externalWorkspaceName || undefined,
    lastSyncAt: integration.lastSyncAt?.toISOString(),
    lastSyncError: integration.lastSyncError || undefined,
    createdAt: integration.createdAt.toISOString(),
    updatedAt: integration.updatedAt.toISOString(),
  };
}

/**
 * List all integrations for an organization/user
 */
export async function listIntegrations(
  organizationId: number,
  userId: number
): Promise<ListIntegrationsResponse> {
  try {
    const integrations = await prisma.integration.findMany({
      where: { organizationId, userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      integrations: integrations.map(mapIntegrationToResponse),
    };
  } catch (error) {
    console.error("Error listing integrations:", error);
    return { success: false, error: "Failed to list integrations" };
  }
}

/**
 * Disconnect an integration
 */
export async function disconnectIntegration(
  integrationId: number,
  organizationId: number,
  userId: number
): Promise<DisconnectIntegrationResponse> {
  try {
    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, organizationId, userId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    // Delete associated integrated tasks
    await prisma.integratedTask.deleteMany({
      where: { integrationId },
    });

    // Delete the integration
    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return { success: false, error: "Failed to disconnect integration" };
  }
}

/**
 * Sync tasks from an integration
 */
export async function syncIntegration(
  integrationId: number,
  organizationId: number
): Promise<SyncIntegrationResponse> {
  try {
    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, organizationId },
    });

    if (!integration) {
      return { success: false, error: "Integration not found" };
    }

    if (integration.status !== "CONNECTED") {
      return { success: false, error: "Integration is not connected" };
    }

    // Update status to syncing
    await prisma.integration.update({
      where: { id: integrationId },
      data: { status: "SYNCING" as IntegrationStatus, lastSyncError: null },
    });

    let tasksSynced = 0;

    try {
      const accessToken = decryptToken(integration.accessToken!);

      if (integration.provider === "ASANA") {
        tasksSynced = await syncAsanaTasks(integrationId, accessToken);
      } else if (integration.provider === "LINEAR") {
        tasksSynced = await syncLinearIssues(integrationId, accessToken);
      }

      // Update last sync time and status
      await prisma.integration.update({
        where: { id: integrationId },
        data: { 
          status: "CONNECTED" as IntegrationStatus, 
          lastSyncAt: new Date(),
          lastSyncError: null,
        },
      });

      return { success: true, tasksSynced };
    } catch (syncError) {
      const errorMessage = syncError instanceof Error ? syncError.message : "Sync failed";
      
      await prisma.integration.update({
        where: { id: integrationId },
        data: { 
          status: "ERROR" as IntegrationStatus,
          lastSyncError: errorMessage,
        },
      });

      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error("Error syncing integration:", error);
    return { success: false, error: "Failed to sync integration" };
  }
}

/**
 * Sync Asana tasks
 */
async function syncAsanaTasks(integrationId: number, accessToken: string): Promise<number> {
  // Fetch tasks from Asana
  const response = await fetch(
    "https://app.asana.com/api/1.0/tasks?assignee=me&opt_expand=projects,assignee&limit=100&completed_since=2024-01-01",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Asana tasks");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as { data: AsanaTask[] };
  const tasks: AsanaTask[] = data.data || [];

  // Sync each task
  for (const task of tasks) {
    await prisma.integratedTask.upsert({
      where: {
        integrationId_externalId: {
          integrationId,
          externalId: task.gid,
        },
      },
      update: {
        title: task.name,
        description: task.notes || null,
        status: task.completed ? "Completed" : "In Progress",
        dueDate: task.due_on ? new Date(task.due_on) : null,
        assigneeName: task.assignee?.name || null,
        assigneeEmail: task.assignee?.email || null,
        externalUrl: task.permalink_url || null,
        sourceProjectId: task.projects?.[0]?.gid || null,
        sourceProjectName: task.projects?.[0]?.name || null,
        lastSyncedAt: new Date(),
        rawData: task as unknown as Prisma.InputJsonValue,
      },
      create: {
        integrationId,
        externalId: task.gid,
        title: task.name,
        description: task.notes || null,
        status: task.completed ? "Completed" : "In Progress",
        dueDate: task.due_on ? new Date(task.due_on) : null,
        assigneeName: task.assignee?.name || null,
        assigneeEmail: task.assignee?.email || null,
        externalUrl: task.permalink_url || null,
        sourceProjectId: task.projects?.[0]?.gid || null,
        sourceProjectName: task.projects?.[0]?.name || null,
        rawData: task as unknown as Prisma.InputJsonValue,
      },
    });
  }

  return tasks.length;
}

/**
 * Sync Linear issues
 */
async function syncLinearIssues(integrationId: number, accessToken: string): Promise<number> {
  const query = `
    query {
      issues(filter: { assignee: { isMe: { eq: true } } }, first: 100) {
        nodes {
          id
          identifier
          title
          description
          state {
            name
          }
          priority
          assignee {
            name
            email
          }
          dueDate
          project {
            id
            name
          }
          url
          createdAt
          updatedAt
        }
      }
    }
  `;

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Linear issues");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as { data?: { issues?: { nodes: LinearIssue[] } } };
  const issues: LinearIssue[] = data.data?.issues?.nodes || [];

  // Map Linear priority (0-4) to readable format
  const priorityMap: Record<number, string> = {
    0: "None",
    1: "Urgent",
    2: "High",
    3: "Medium",
    4: "Low",
  };

  // Sync each issue
  for (const issue of issues) {
    await prisma.integratedTask.upsert({
      where: {
        integrationId_externalId: {
          integrationId,
          externalId: issue.id,
        },
      },
      update: {
        title: issue.title,
        description: issue.description || null,
        status: issue.state.name,
        priority: priorityMap[issue.priority] || "None",
        dueDate: issue.dueDate ? new Date(issue.dueDate) : null,
        assigneeName: issue.assignee?.name || null,
        assigneeEmail: issue.assignee?.email || null,
        externalUrl: issue.url,
        sourceProjectId: issue.project?.id || null,
        sourceProjectName: issue.project?.name || null,
        lastSyncedAt: new Date(),
        rawData: issue as unknown as Prisma.InputJsonValue,
      },
      create: {
        integrationId,
        externalId: issue.id,
        title: issue.title,
        description: issue.description || null,
        status: issue.state.name,
        priority: priorityMap[issue.priority] || "None",
        dueDate: issue.dueDate ? new Date(issue.dueDate) : null,
        assigneeName: issue.assignee?.name || null,
        assigneeEmail: issue.assignee?.email || null,
        externalUrl: issue.url,
        sourceProjectId: issue.project?.id || null,
        sourceProjectName: issue.project?.name || null,
        rawData: issue as unknown as Prisma.InputJsonValue,
      },
    });
  }

  return issues.length;
}

/**
 * List integrated tasks
 */
export async function listIntegratedTasks(
  organizationId: number,
  options: {
    integrationId?: number;
    provider?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ListIntegratedTasksResponse> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      integration: { organizationId },
    };

    if (options.integrationId) {
      where.integrationId = options.integrationId;
    }

    if (options.provider) {
      where.integration = {
        ...where.integration,
        provider: options.provider,
      };
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.integratedTask.findMany({
        where,
        include: { integration: true },
        orderBy: { lastSyncedAt: "desc" },
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      prisma.integratedTask.count({ where }),
    ]);

    const mappedTasks: IntegratedTask[] = tasks.map((task) => ({
      id: task.id,
      externalId: task.externalId,
      externalUrl: task.externalUrl || undefined,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority || undefined,
      assigneeEmail: task.assigneeEmail || undefined,
      assigneeName: task.assigneeName || undefined,
      dueDate: task.dueDate?.toISOString(),
      sourceProjectId: task.sourceProjectId || undefined,
      sourceProjectName: task.sourceProjectName || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sourceProvider: (task as any).integration.provider,
      lastSyncedAt: task.lastSyncedAt.toISOString(),
    }));

    return {
      success: true,
      tasks: mappedTasks,
      total,
    };
  } catch (error) {
    console.error("Error listing integrated tasks:", error);
    return { success: false, error: "Failed to list integrated tasks" };
  }
}

/**
 * Unified search across integrations
 */
export async function unifiedSearch(
  organizationId: number,
  query: string,
  providers?: string[]
): Promise<UnifiedSearchResponse> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      integration: { 
        organizationId,
        status: "CONNECTED",
      },
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    if (providers && providers.length > 0) {
      where.integration = {
        ...where.integration,
        provider: { in: providers },
      };
    }

    const tasks = await prisma.integratedTask.findMany({
      where,
      include: { integration: true },
      orderBy: { lastSyncedAt: "desc" },
      take: 50,
    });

    // Group by provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grouped = tasks.reduce<Record<string, IntegratedTask[]>>((acc, task: any) => {
      const provider = task.integration.provider as string;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push({
        id: task.id,
        externalId: task.externalId,
        externalUrl: task.externalUrl || undefined,
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority || undefined,
        assigneeEmail: task.assigneeEmail || undefined,
        assigneeName: task.assigneeName || undefined,
        dueDate: task.dueDate?.toISOString(),
        sourceProjectId: task.sourceProjectId || undefined,
        sourceProjectName: task.sourceProjectName || undefined,
        sourceProvider: task.integration.provider,
        lastSyncedAt: task.lastSyncedAt.toISOString(),
      });
      return acc;
    }, {});

    const results = Object.entries(grouped).map(([provider, tasks]) => ({
      provider: provider as IntegrationProvider,
      tasks,
    }));

    return { success: true, results };
  } catch (error) {
    console.error("Error in unified search:", error);
    return { success: false, error: "Failed to search integrations" };
  }
}

/**
 * Get provider auth URL (for frontend redirect)
 */
export function getProviderAuthUrl(provider: string): string | null {
  return PROVIDER_CONFIG[provider]?.authUrl || null;
}

/**
 * Check if provider is configured
 */
export function isProviderConfigured(provider: string): boolean {
  const clientId = process.env[`${provider}_CLIENT_ID`];
  const clientSecret = process.env[`${provider}_CLIENT_SECRET`];
  return !!(clientId && clientSecret);
}
