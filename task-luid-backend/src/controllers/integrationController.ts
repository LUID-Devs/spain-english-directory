import { Request, Response } from "express";
import {
  initiateOAuth,
  handleOAuthCallback,
  listIntegrations,
  disconnectIntegration,
  syncIntegration,
  listIntegratedTasks,
  unifiedSearch,
  isProviderConfigured,
} from "../services/integration.service";

/**
 * Initiate OAuth flow for a provider
 */
export async function initiateOAuthFlow(req: Request, res: Response): Promise<void> {
  try {
    const { provider } = req.params;
    const { redirectUri } = req.body;
    const user = req.user!;

    if (!redirectUri) {
      res.status(400).json({
        success: false,
        error: "redirectUri is required",
      });
      return;
    }

    const result = await initiateOAuth(
      provider.toUpperCase(),
      redirectUri,
      user.organizationId,
      user.userId
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in initiateOAuthFlow:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Handle OAuth callback
 */
export async function oauthCallback(req: Request, res: Response): Promise<void> {
  try {
    const { provider } = req.params;
    const { code, state } = req.body;
    const user = req.user!;

    if (!code || !state) {
      res.status(400).json({
        success: false,
        error: "code and state are required",
      });
      return;
    }

    const result = await handleOAuthCallback(
      provider.toUpperCase(),
      code,
      user.organizationId,
      user.userId
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in oauthCallback:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * List all integrations for the current user
 */
export async function getIntegrations(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;

    const result = await listIntegrations(user.organizationId, user.userId);

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in getIntegrations:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Disconnect an integration
 */
export async function disconnect(req: Request, res: Response): Promise<void> {
  try {
    const { integrationId } = req.params;
    const user = req.user!;

    const result = await disconnectIntegration(
      parseInt(integrationId, 10),
      user.organizationId,
      user.userId
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in disconnect:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Sync an integration manually
 */
export async function sync(req: Request, res: Response): Promise<void> {
  try {
    const { integrationId } = req.params;
    const user = req.user!;

    const result = await syncIntegration(
      parseInt(integrationId, 10),
      user.organizationId
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in sync:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * List integrated tasks
 */
export async function getIntegratedTasks(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { integrationId, provider, status, search, limit, offset } = req.query;

    const result = await listIntegratedTasks(user.organizationId, {
      integrationId: integrationId ? parseInt(integrationId as string, 10) : undefined,
      provider: provider as string,
      status: status as string,
      search: search as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in getIntegratedTasks:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Unified search across integrations
 */
export async function searchIntegrations(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { query, providers } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({
        success: false,
        error: "query parameter is required",
      });
      return;
    }

    const providerList = providers 
      ? (providers as string).split(",") 
      : undefined;

    const result = await unifiedSearch(
      user.organizationId,
      query,
      providerList
    );

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error in searchIntegrations:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Get available providers and their configuration status
 */
export async function getProviders(req: Request, res: Response): Promise<void> {
  try {
    const providers = ["ASANA", "LINEAR", "GITHUB", "JIRA", "TRELLO"];
    
    const providerStatus = providers.map((provider) => ({
      id: provider,
      name: provider.charAt(0) + provider.slice(1).toLowerCase(),
      configured: isProviderConfigured(provider),
      authUrl: `/api/integrations/${provider.toLowerCase()}/auth`,
    }));

    res.json({
      success: true,
      providers: providerStatus,
    });
  } catch (error) {
    console.error("Error in getProviders:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
