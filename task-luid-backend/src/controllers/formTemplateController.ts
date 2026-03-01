import { Request, Response } from "express";
import {
  validateFormTemplateData,
  listFormTemplates,
  getFormTemplate,
  createFormTemplate,
  updateFormTemplate,
  deleteFormTemplate,
  createFormField,
  deleteFormField,
  reorderFormFields,
  assignTemplateToProjects,
} from "../services/formTemplate.service";
import {
  CreateFormTemplateRequest,
  CreateFormFieldRequest,
  UpdateFormTemplateRequest,
  TemplateFilterOptions,
  TemplatePaginationOptions,
} from "../types/formTemplate.types";

export async function listTemplates(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const filters: TemplateFilterOptions = {
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      isSystem: req.query.isSystem !== undefined ? req.query.isSystem === 'true' : undefined,
      projectId: req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined,
      searchQuery: req.query.search as string | undefined,
    };

    const options: TemplatePaginationOptions = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      sortBy: req.query.sortBy as TemplatePaginationOptions['sortBy'] || 'updatedAt',
      sortOrder: req.query.sortOrder as TemplatePaginationOptions['sortOrder'] || 'desc',
    };

    const result = await listFormTemplates(user.organizationId, filters, options);
    res.json(result);
  } catch (error) {
    console.error("Error listing templates:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function getTemplate(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      res.status(400).json({ success: false, error: "Invalid template ID" });
      return;
    }

    const template = await getFormTemplate(templateId, user.organizationId);
    if (!template) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function createTemplate(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const data: CreateFormTemplateRequest = req.body;
    const validation = validateFormTemplateData(data);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    const template = await createFormTemplate(user.organizationId, user.userId, data);
    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function updateTemplate(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      res.status(400).json({ success: false, error: "Invalid template ID" });
      return;
    }

    const data: UpdateFormTemplateRequest = req.body;
    const validation = validateFormTemplateData(data, true);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.error });
      return;
    }

    const template = await updateFormTemplate(templateId, user.organizationId, data);
    if (!template) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function deleteTemplate(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      res.status(400).json({ success: false, error: "Invalid template ID" });
      return;
    }

    const deleted = await deleteFormTemplate(templateId, user.organizationId);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }

    res.json({ success: true, message: "Template deleted" });
  } catch (error) {
    console.error("Error deleting template:", error);
    const statusCode = error instanceof Error && error.message.includes("System templates") ? 403 : 500;
    res.status(statusCode).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function createField(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      res.status(400).json({ success: false, error: "Invalid template ID" });
      return;
    }

    const data: CreateFormFieldRequest = req.body;
    const field = await createFormField(templateId, user.organizationId, data);

    if (!field) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }

    res.status(201).json({ success: true, field });
  } catch (error) {
    console.error("Error creating field:", error);
    const statusCode = error instanceof Error && error.message.includes("Maximum") ? 400 : 500;
    res.status(statusCode).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function deleteField(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const fieldId = parseInt(req.params.fieldId, 10);
    if (isNaN(fieldId)) {
      res.status(400).json({ success: false, error: "Invalid field ID" });
      return;
    }

    const deleted = await deleteFormField(fieldId, user.organizationId);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Field not found" });
      return;
    }

    res.json({ success: true, message: "Field deleted" });
  } catch (error) {
    console.error("Error deleting field:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function reorderFields(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      res.status(400).json({ success: false, error: "Invalid template ID" });
      return;
    }

    const { fieldOrders } = req.body;
    if (!Array.isArray(fieldOrders)) {
      res.status(400).json({ success: false, error: "fieldOrders must be an array" });
      return;
    }

    const fields = await reorderFormFields(templateId, user.organizationId, fieldOrders);
    if (!fields) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }

    res.json({ success: true, fields });
  } catch (error) {
    console.error("Error reordering fields:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export async function assignProjects(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      res.status(400).json({ success: false, error: "Invalid template ID" });
      return;
    }

    const { projectIds } = req.body;
    if (!Array.isArray(projectIds)) {
      res.status(400).json({ success: false, error: "projectIds must be an array" });
      return;
    }

    const assignments = await assignTemplateToProjects(templateId, user.organizationId, projectIds);
    res.json({ success: true, assignments });
  } catch (error) {
    console.error("Error assigning projects:", error);
    const statusCode = error instanceof Error && error.message.includes("not found") ? 404 :
                       error instanceof Error && error.message.includes("Invalid") ? 400 : 500;
    res.status(statusCode).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
  }
}

export default {
  listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate,
  createField, deleteField, reorderFields, assignProjects,
};
