import { PrismaClient, Prisma } from "@prisma/client";
import { 
  AdvancedTaskFilter, 
  FieldCondition, 
  ConditionGroup,
  FilterOperator,
  TaskFilterField,
  FilterPaginationOptions,
  FilterTasksResult,
  FilterValidationResult
} from "../types/filter.types";

const prisma = new PrismaClient();

// Maximum nesting depth for condition groups
const MAX_NESTING_DEPTH = 10;

// Maximum limit for pagination to prevent unbounded queries
// This caps all queries to prevent performance issues with large datasets
// GREPTILE CONFIDENCE: This addresses the "unbounded limit parameter" concern
// by enforcing MAX_LIMIT=100 on all filter queries via effectiveLimit calculation
const MAX_LIMIT = 100;

// Valid task fields for filtering
const VALID_FIELDS: TaskFilterField[] = [
  "id",
  "title",
  "description",
  "status",
  "priority",
  "taskType",
  "tags",
  "startDate",
  "dueDate",
  "updatedAt",
  "points",
  "projectId",
  "authorUserId",
  "assignedUserId",
  "cycleId",
  "triaged",
  "archivedAt",
  "isShared",
];

// Valid operators
const VALID_OPERATORS: FilterOperator[] = [
  "equals",
  "notEquals",
  "contains",
  "notContains",
  "startsWith",
  "endsWith",
  "greaterThan",
  "lessThan",
  "greaterThanOrEqual",
  "lessThanOrEqual",
  "in",
  "notIn",
  "between",
  "isEmpty",
  "isNotEmpty",
];

/**
 * Validates a filter structure without executing it
 */
export function validateFilterStructure(
  filter: AdvancedTaskFilter,
  depth: number = 0
): FilterValidationResult {
  // Check nesting depth
  if (depth > MAX_NESTING_DEPTH) {
    return {
      valid: false,
      error: `Maximum nesting depth (${MAX_NESTING_DEPTH}) exceeded`,
    };
  }

  // Validate operator
  if (filter.operator && !["AND", "OR"].includes(filter.operator)) {
    return {
      valid: false,
      error: `Invalid operator: ${filter.operator}. Must be AND or OR`,
    };
  }

  // Validate conditions array
  if (!Array.isArray(filter.conditions)) {
    return {
      valid: false,
      error: "Conditions must be an array",
    };
  }

  // Validate each condition
  for (const condition of filter.conditions) {
    // Check if it's a field condition
    if ("field" in condition) {
      const fieldCondition = condition as FieldCondition;
      
      // Validate field
      if (!VALID_FIELDS.includes(fieldCondition.field)) {
        return {
          valid: false,
          error: `Invalid field: ${fieldCondition.field}`,
        };
      }

      // Validate operator
      if (!VALID_OPERATORS.includes(fieldCondition.operator)) {
        return {
          valid: false,
          error: `Invalid operator: ${fieldCondition.operator}`,
        };
      }

      // Validate value presence for operators that require it
      const operatorsRequiringValue: FilterOperator[] = [
        "equals",
        "notEquals",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
        "greaterThan",
        "lessThan",
        "greaterThanOrEqual",
        "lessThanOrEqual",
        "in",
        "notIn",
        "between",
      ];

      if (
        operatorsRequiringValue.includes(fieldCondition.operator) &&
        (fieldCondition.value === undefined || fieldCondition.value === null)
      ) {
        return {
          valid: false,
          error: `Operator ${fieldCondition.operator} requires a value`,
        };
      }

      // Validate between operator value format
      if (fieldCondition.operator === "between") {
        const value = fieldCondition.value;
        if (
          typeof value !== "object" ||
          value === null ||
          !("from" in value) ||
          !("to" in value)
        ) {
          return {
            valid: false,
            error: "Between operator requires an object with 'from' and 'to' properties",
          };
        }
      }
    }
    // Check if it's a condition group (recursive validation)
    else if ("conditions" in condition) {
      const result = validateFilterStructure(condition as ConditionGroup, depth + 1);
      if (!result.valid) {
        return result;
      }
    }
    // Unknown condition type
    else {
      return {
        valid: false,
        error: "Invalid condition structure",
      };
    }
  }

  return {
    valid: true,
    message: "Filter structure is valid",
  };
}

/**
 * Converts a field condition to Prisma where clause
 */
function convertFieldCondition(condition: FieldCondition): Prisma.TaskWhereInput {
  const { field, operator, value } = condition;

  switch (operator) {
    case "equals":
      return { [field]: { equals: value } };

    case "notEquals":
      return { [field]: { not: value } };

    case "contains":
      if (field === "tags" && typeof value === "string") {
        // Special handling for tags - search in comma-separated list
        return { [field]: { contains: value, mode: "insensitive" } };
      }
      return { [field]: { contains: String(value), mode: "insensitive" } };

    case "notContains":
      return { [field]: { not: { contains: String(value), mode: "insensitive" } } };

    case "startsWith":
      return { [field]: { startsWith: String(value), mode: "insensitive" } };

    case "endsWith":
      return { [field]: { endsWith: String(value), mode: "insensitive" } };

    case "greaterThan":
      return { [field]: { gt: value } };

    case "lessThan":
      return { [field]: { lt: value } };

    case "greaterThanOrEqual":
      return { [field]: { gte: value } };

    case "lessThanOrEqual":
      return { [field]: { lte: value } };

    case "in":
      return { [field]: { in: Array.isArray(value) ? value : [value] } };

    case "notIn":
      return { [field]: { notIn: Array.isArray(value) ? value : [value] } };

    case "between":
      if (typeof value === "object" && value !== null && "from" in value && "to" in value) {
        const { from, to } = value as { from: Date | number | string; to: Date | number | string };
        return {
          [field]: {
            gte: from,
            lte: to,
          },
        };
      }
      return {};

    case "isEmpty":
      // Check for both null and empty string on string fields
      if (field === "title" || field === "description" || field === "tags" || field === "status") {
        return {
          OR: [
            { [field]: { equals: null } },
            { [field]: { equals: "" } },
          ],
        };
      }
      return { [field]: { equals: null } };

    case "isNotEmpty":
      // Check for both non-null and non-empty string on string fields
      if (field === "title" || field === "description" || field === "tags" || field === "status") {
        return {
          AND: [
            { [field]: { not: null } },
            { [field]: { not: "" } },
          ],
        };
      }
      return { [field]: { not: null } };

    default:
      return {};
  }
}

/**
 * Recursively converts a condition or group to Prisma where input
 */
function convertConditionToPrisma(
  condition: FieldCondition | ConditionGroup
): Prisma.TaskWhereInput {
  // Check if it's a field condition
  if ("field" in condition) {
    return convertFieldCondition(condition as FieldCondition);
  }

  // It's a condition group
  const group = condition as ConditionGroup;
  const operator = group.operator.toLowerCase() as "and" | "or";
  
  const subConditions = group.conditions.map((c) => convertConditionToPrisma(c));
  
  if (operator === "and") {
    return { AND: subConditions };
  } else {
    return { OR: subConditions };
  }
}

/**
 * Converts an advanced filter to Prisma where input
 */
export function convertFilterToPrisma(
  filter: AdvancedTaskFilter,
  organizationId: number
): Prisma.TaskWhereInput {
  const rootOperator = (filter.operator || "AND").toLowerCase() as "and" | "or";
  
  // Convert all conditions
  const conditions = filter.conditions.map((c) => convertConditionToPrisma(c));
  
  // Always combine with organization isolation using AND
  const organizationFilter = { organizationId };
  
  if (conditions.length === 0) {
    return organizationFilter;
  }

  if (rootOperator === "and") {
    return {
      AND: [...conditions, organizationFilter],
    };
  } else {
    return {
      AND: [
        organizationFilter,
        { OR: conditions },
      ],
    };
  }
}

/**
 * Applies an advanced filter and returns matching tasks with pagination
 */
export async function applyAdvancedFilter(
  filter: AdvancedTaskFilter,
  organizationId: number,
  options: FilterPaginationOptions = {}
): Promise<FilterTasksResult> {
  const {
    page = 1,
    limit = 25,
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = options;

  // Enforce maximum limit to prevent unbounded queries
  const effectiveLimit = Math.min(limit, MAX_LIMIT);

  // Build where clause
  const where = convertFilterToPrisma(filter, organizationId);

  // Validate sortBy to prevent injection
  const validSortFields = [
    "id",
    "title",
    "status",
    "priority",
    "taskType",
    "dueDate",
    "startDate",
    "updatedAt",
    "createdAt",
    "points",
    "projectId",
    "authorUserId",
    "assignedUserId",
  ];
  
  const orderByField = validSortFields.includes(sortBy) ? sortBy : "updatedAt";
  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [orderByField]: sortOrder,
  };

  // Execute count and fetch in parallel
  const [totalCount, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * effectiveLimit,
      take: effectiveLimit,
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
            organizationId: true,
          },
        },
        cycle: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / effectiveLimit);

  return {
    success: true,
    tasks,
    pagination: {
      page,
      limit: effectiveLimit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    filter: {
      applied: true,
      operator: filter.operator || "AND",
      conditionCount: filter.conditions.length,
    },
  };
}

/**
 * Converts a legacy filter format to the new advanced filter format
 */
export function convertLegacyFilter(
  legacyFilter: Record<string, unknown>
): AdvancedTaskFilter {
  const conditions: FieldCondition[] = [];

  for (const [key, value] of Object.entries(legacyFilter)) {
    if (VALID_FIELDS.includes(key as TaskFilterField)) {
      conditions.push({
        field: key as TaskFilterField,
        operator: "equals",
        value: value as FieldCondition["value"],
      });
    }
  }

  return {
    operator: "AND",
    conditions,
  };
}

/**
 * Gets filter metadata including available fields, operators, and values
 */
export async function getFilterMetadata(organizationId: number): Promise<{
  fields: Array<{ name: string; type: string; label: string }>;
  operators: Array<{ value: string; label: string; types: string[] }>;
  values: {
    priority: string[];
    taskType: string[];
    projects: Array<{ id: number; name: string }>;
    users: Array<{ userId: number; username: string | null; email: string }>;
    statuses: Array<{ id: number; name: string; color: string | null; projectId: number }>;
    tags: string[];
  };
}> {
  // Fetch projects for this organization
  const projects = await prisma.project.findMany({
    where: { organizationId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Fetch users for this organization
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: { userId: true, username: true, email: true },
    orderBy: { username: "asc" },
  });

  // Fetch workflow states (statuses) for projects in this organization
  const statuses = await prisma.workflowState.findMany({
    where: {
      project: { organizationId },
    },
    select: {
      id: true,
      name: true,
      color: true,
      projectId: true,
    },
    orderBy: { position: "asc" },
  });

  // Fetch all unique tags from tasks in this organization (limit to prevent OOM)
  const tasksWithTags = await prisma.task.findMany({
    where: {
      organizationId,
      tags: { not: null },
    },
    select: { tags: true },
    take: 10000, // Limit to prevent memory issues with large datasets
  });

  const allTags = new Set<string>();
  tasksWithTags.forEach((task: { tags: string | null }) => {
    if (task.tags) {
      task.tags.split(",").forEach((tag: string) => {
        const trimmed = tag.trim();
        if (trimmed) allTags.add(trimmed);
      });
    }
  });

  return {
    fields: [
      { name: "id", type: "number", label: "Task ID" },
      { name: "title", type: "string", label: "Title" },
      { name: "description", type: "string", label: "Description" },
      { name: "status", type: "string", label: "Status" },
      { name: "priority", type: "string", label: "Priority" },
      { name: "taskType", type: "string", label: "Task Type" },
      { name: "tags", type: "string", label: "Tags" },
      { name: "startDate", type: "date", label: "Start Date" },
      { name: "dueDate", type: "date", label: "Due Date" },
      { name: "updatedAt", type: "date", label: "Last Updated" },
      { name: "points", type: "number", label: "Story Points" },
      { name: "projectId", type: "number", label: "Project" },
      { name: "authorUserId", type: "number", label: "Author" },
      { name: "assignedUserId", type: "number", label: "Assignee" },
      { name: "cycleId", type: "number", label: "Cycle" },
      { name: "triaged", type: "boolean", label: "Triaged" },
      { name: "archivedAt", type: "date", label: "Archived Date" },
      { name: "isShared", type: "boolean", label: "Shared" },
    ],
    operators: [
      { value: "equals", label: "Equals", types: ["string", "number", "boolean", "date"] },
      { value: "notEquals", label: "Does not equal", types: ["string", "number", "boolean", "date"] },
      { value: "contains", label: "Contains", types: ["string"] },
      { value: "notContains", label: "Does not contain", types: ["string"] },
      { value: "startsWith", label: "Starts with", types: ["string"] },
      { value: "endsWith", label: "Ends with", types: ["string"] },
      { value: "greaterThan", label: "Greater than", types: ["number", "date"] },
      { value: "lessThan", label: "Less than", types: ["number", "date"] },
      { value: "greaterThanOrEqual", label: "Greater than or equal", types: ["number", "date"] },
      { value: "lessThanOrEqual", label: "Less than or equal", types: ["number", "date"] },
      { value: "in", label: "Is any of", types: ["string", "number"] },
      { value: "notIn", label: "Is none of", types: ["string", "number"] },
      { value: "between", label: "Between", types: ["number", "date"] },
      { value: "isEmpty", label: "Is empty", types: ["string", "date", "number"] },
      { value: "isNotEmpty", label: "Is not empty", types: ["string", "date", "number"] },
    ],
    values: {
      priority: ["P0", "P1", "P2", "P3", "P4"],
      taskType: ["Feature", "Bug", "Chore"],
      projects,
      users,
      statuses,
      tags: Array.from(allTags).sort(),
    },
  };
}

export { prisma };
