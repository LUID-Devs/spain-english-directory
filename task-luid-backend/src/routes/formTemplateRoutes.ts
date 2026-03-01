import { Router } from "express";
import {
  listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate,
  createField, deleteField, reorderFields, assignProjects,
  applyTemplateToTask, getTaskCustomFields, updateTaskCustomFields,
} from "../controllers/formTemplateController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
router.use(authenticateToken);

// Form Template routes
router.get("/task-templates", listTemplates);
router.post("/task-templates", createTemplate);
router.get("/task-templates/:id", getTemplate);
router.patch("/task-templates/:id", updateTemplate);
router.delete("/task-templates/:id", deleteTemplate);
router.post("/task-templates/:id/apply", applyTemplateToTask);
router.post("/task-templates/:id/fields", createField);
router.post("/task-templates/:id/fields/reorder", reorderFields);
router.delete("/task-templates/fields/:fieldId", deleteField);
router.post("/task-templates/:id/assign-projects", assignProjects);

// Organization-specific routes
router.get("/organizations/:orgId/form-templates", listTemplates);
router.post("/organizations/:orgId/form-templates", createTemplate);

// Task Custom Field routes
router.get("/tasks/:taskId/custom-fields", getTaskCustomFields);
router.patch("/tasks/:taskId/custom-fields", updateTaskCustomFields);

export default router;
