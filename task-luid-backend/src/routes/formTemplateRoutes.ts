import { Router } from "express";
import {
  listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate,
  createField, deleteField, reorderFields, assignProjects,
} from "../controllers/formTemplateController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
router.use(authenticateToken);

router.get("/task-templates", listTemplates);
router.post("/task-templates", createTemplate);
router.get("/task-templates/:id", getTemplate);
router.patch("/task-templates/:id", updateTemplate);
router.delete("/task-templates/:id", deleteTemplate);
router.post("/task-templates/:id/fields", createField);
router.post("/task-templates/:id/fields/reorder", reorderFields);
router.delete("/task-templates/fields/:fieldId", deleteField);
router.post("/task-templates/:id/assign-projects", assignProjects);

export default router;
