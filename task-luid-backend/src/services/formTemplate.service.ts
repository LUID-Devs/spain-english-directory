import { PrismaClient, Prisma } from "@prisma/client";
import {
  FormTemplate,
  FormField,
  FormFieldType,
  CreateFormTemplateRequest,
  CreateFormFieldRequest,
  UpdateFormTemplateRequest,
  TemplatePaginationOptions,
  TemplateFilterOptions,
  ListTemplatesResponse,
  FormTemplateValidationResult,
} from "../types/formTemplate.types";

export const prisma = new PrismaClient();

const MAX_FIELDS_PER_TEMPLATE = 50;
const VALID_FIELD_TYPES: FormFieldType[] = [
  'text', 'textarea', 'number', 'date', 'select', 'multiselect', 'checkbox', 'url', 'email'
];

function generateFieldKey(name: string, existingKeys: string[] = []): string {
  let baseKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  let key = baseKey;
  let counter = 1;
  while (existingKeys.includes(key)) {
    key = `${baseKey}_${counter}`;
    counter++;
  }
  return key;
}

export function validateFormTemplateData(
  data: CreateFormTemplateRequest | UpdateFormTemplateRequest,
  isUpdate = false
): FormTemplateValidationResult {
  if (!isUpdate || 'name' in data) {
    if (!data.name || data.name.trim().length === 0) {
      return { valid: false, error: "Template name is required" };
    }
    if (data.name.length > 100) {
      return { valid: false, error: "Template name must be 100 characters or less" };
    }
  }

  if (data.description !== undefined && data.description.length > 500) {
    return { valid: false, error: "Description must be 500 characters or less" };
  }

  if (!isUpdate && 'fields' in data && data.fields) {
    if (data.fields.length > MAX_FIELDS_PER_TEMPLATE) {
      return { valid: false, error: `Maximum ${MAX_FIELDS_PER_TEMPLATE} fields allowed` };
    }
  }

  return { valid: true };
}

export async function listFormTemplates(
  organizationId: number,
  filters: TemplateFilterOptions = {},
  options: TemplatePaginationOptions = {}
): Promise<ListTemplatesResponse> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const sortBy = options.sortBy || 'updatedAt';
  const sortOrder = options.sortOrder || 'desc';

  const where: Prisma.FormTemplateWhereInput = { organizationId };

  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.isSystem !== undefined) where.isSystem = filters.isSystem;
  if (filters.searchQuery) {
    where.OR = [
      { name: { contains: filters.searchQuery, mode: 'insensitive' } },
      { description: { contains: filters.searchQuery, mode: 'insensitive' } },
    ];
  }

  const totalCount = await prisma.formTemplate.count({ where });

  const templates = await prisma.formTemplate.findMany({
    where,
    include: {
      fields: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
      projectAssignments: { include: { project: { select: { id: true, name: true } } } },
      user: { select: { userId: true, username: true, profilePictureUrl: true } },
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    success: true,
    templates: templates as FormTemplate[],
    pagination: {
      page, limit, totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
    },
  };
}

export async function getFormTemplate(templateId: number, organizationId: number): Promise<FormTemplate | null> {
  const template = await prisma.formTemplate.findFirst({
    where: { id: templateId, organizationId },
    include: {
      fields: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
      projectAssignments: { include: { project: { select: { id: true, name: true } } } },
      user: { select: { userId: true, username: true, profilePictureUrl: true } },
    },
  });
  return template as FormTemplate | null;
}

export async function createFormTemplate(
  organizationId: number, createdBy: number, data: CreateFormTemplateRequest
): Promise<FormTemplate> {
  const { fields, projectIds, ...templateData } = data;

  const template = await prisma.$transaction(async (tx) => {
    const created = await tx.formTemplate.create({
      data: {
        ...templateData,
        organizationId,
        createdBy,
        isActive: templateData.isActive ?? true,
        defaultPriority: templateData.defaultPriority || 'P2',
        fields: fields ? {
          create: fields.map((field, index) => ({
            name: field.name,
            key: field.key || generateFieldKey(field.name),
            fieldType: field.fieldType,
            description: field.description,
            isRequired: field.isRequired ?? false,
            minLength: field.minLength,
            maxLength: field.maxLength,
            minValue: field.minValue,
            maxValue: field.maxValue,
            regexPattern: field.regexPattern,
            placeholder: field.placeholder,
            helpText: field.helpText,
            order: field.order ?? index,
            defaultValue: field.defaultValue,
            options: field.options ? {
              create: field.options.map((opt, optIndex) => ({
                label: opt.label, value: opt.value, color: opt.color, order: opt.order ?? optIndex,
              })),
            } : undefined,
          })),
        } : undefined,
        projectAssignments: projectIds ? { create: projectIds.map(projectId => ({ projectId })) } : undefined,
      },
      include: {
        fields: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
        projectAssignments: { include: { project: { select: { id: true, name: true } } } },
        user: { select: { userId: true, username: true, profilePictureUrl: true } },
      },
    });
    return created;
  });

  return template as FormTemplate;
}

export async function updateFormTemplate(
  templateId: number, organizationId: number, data: UpdateFormTemplateRequest
): Promise<FormTemplate | null> {
  const existing = await prisma.formTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!existing) return null;

  const updated = await prisma.formTemplate.update({
    where: { id: templateId },
    data,
    include: {
      fields: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
      projectAssignments: { include: { project: { select: { id: true, name: true } } } },
      user: { select: { userId: true, username: true, profilePictureUrl: true } },
    },
  });

  return updated as FormTemplate;
}

export async function deleteFormTemplate(templateId: number, organizationId: number): Promise<boolean> {
  const existing = await prisma.formTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!existing) return false;
  if (existing.isSystem) throw new Error("System templates cannot be deleted");

  await prisma.formTemplate.delete({ where: { id: templateId } });
  return true;
}

export async function createFormField(
  templateId: number, organizationId: number, data: CreateFormFieldRequest
): Promise<FormField | null> {
  const template = await prisma.formTemplate.findFirst({
    where: { id: templateId, organizationId },
    include: { fields: { select: { key: true } } },
  });

  if (!template) return null;

  const fieldCount = await prisma.formField.count({ where: { templateId } });
  if (fieldCount >= MAX_FIELDS_PER_TEMPLATE) {
    throw new Error(`Maximum ${MAX_FIELDS_PER_TEMPLATE} fields allowed`);
  }

  const key = data.key || generateFieldKey(data.name, template.fields.map(f => f.key));

  const field = await prisma.formField.create({
    data: {
      templateId, name: data.name, key, fieldType: data.fieldType,
      description: data.description, isRequired: data.isRequired ?? false,
      minLength: data.minLength, maxLength: data.maxLength,
      minValue: data.minValue, maxValue: data.maxValue,
      regexPattern: data.regexPattern, placeholder: data.placeholder,
      helpText: data.helpText, order: data.order ?? fieldCount,
      defaultValue: data.defaultValue,
      options: data.options ? { create: data.options.map((opt, index) => ({
        label: opt.label, value: opt.value, color: opt.color, order: opt.order ?? index,
      })) } : undefined,
    },
    include: { options: { orderBy: { order: 'asc' } } },
  });

  return field as FormField;
}

export async function deleteFormField(fieldId: number, organizationId: number): Promise<boolean> {
  const existing = await prisma.formField.findFirst({
    where: { id: fieldId, template: { organizationId } },
  });

  if (!existing) return false;
  await prisma.formField.delete({ where: { id: fieldId } });
  return true;
}

export async function reorderFormFields(
  templateId: number, organizationId: number, fieldOrders: { id: number; order: number }[]
): Promise<FormField[] | null> {
  const template = await prisma.formTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!template) return null;

  await prisma.$transaction(
    fieldOrders.map(({ id, order }) =>
      prisma.formField.update({ where: { id }, data: { order } })
    )
  );

  const fields = await prisma.formField.findMany({
    where: { templateId },
    include: { options: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  });

  return fields as FormField[];
}

export async function assignTemplateToProjects(
  templateId: number, organizationId: number, projectIds: number[]
): Promise<{ id: number; projectId: number; templateId: number }[]> {
  const template = await prisma.formTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!template) throw new Error("Template not found");

  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds }, organizationId },
    select: { id: true },
  });

  const validProjectIds = new Set(projects.map(p => p.id));
  const invalidProjectIds = projectIds.filter(id => !validProjectIds.has(id));

  if (invalidProjectIds.length > 0) {
    throw new Error(`Invalid project IDs: ${invalidProjectIds.join(', ')}`);
  }

  await prisma.$transaction([
    prisma.formTemplateProjectAssignment.deleteMany({ where: { templateId } }),
    ...projectIds.map(projectId =>
      prisma.formTemplateProjectAssignment.create({ data: { templateId, projectId } })
    ),
  ]);

  return prisma.formTemplateProjectAssignment.findMany({
    where: { templateId },
    select: { id: true, projectId: true, templateId: true },
  });
}
