import { Router } from "express";
import {
  initiateOAuthFlow,
  oauthCallback,
  getIntegrations,
  disconnect,
  sync,
  getIntegratedTasks,
  searchIntegrations,
  getProviders,
} from "../controllers/integrationController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Provider management
router.get("/integrations/providers", authenticateToken, getProviders);

// OAuth flows
router.post("/integrations/:provider/auth", authenticateToken, initiateOAuthFlow);
router.post("/integrations/:provider/callback", authenticateToken, oauthCallback);

// Integration management
router.get("/integrations", authenticateToken, getIntegrations);
router.delete("/integrations/:integrationId", authenticateToken, disconnect);
router.post("/integrations/:integrationId/sync", authenticateToken, sync);

// Integrated tasks
router.get("/integrated-tasks", authenticateToken, getIntegratedTasks);
router.get("/integrations/search", authenticateToken, searchIntegrations);

export default router;
