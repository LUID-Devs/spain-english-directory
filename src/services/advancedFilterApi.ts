import { apiService } from "./apiService";

// Filter operators supported
export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "in"
  | "notIn"
  | "between"
  | "isEmpty"
  | "isNotEmpty";

// Valid task fields for filtering
export type TaskFilterField =
  | "id"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "taskType"
  | "tags"
  | "startDate"
  | "dueDate"
  | "updatedAt"
  | "points"
  | "projectId"
  | "authorUserId"
  | "assignedUserId"
  | "cycleId"
  | "triaged"
  | "archivedAt"
  | "isShared";

// Field condition
export interface FieldCondition {
  field: TaskFilterField;
  operator: FilterOperator;
  value?: string | number | boolean | string[] | number[] | Date | { from: Date; to: Date } | { from: string; to: string };
}

// Condition group for nested AND/OR logic
export interface ConditionGroup {
  operator: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}

// Root filter structure
export interface AdvancedTaskFilter {
  operator?: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}

// Pagination options
export interface FilterPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Filter metadata types
export interface FilterField {
  name: TaskFilterField;
  type: "string" | "number" | "boolean" | "date";
  label: string;
}

export interface FilterOperatorInfo {
  value: FilterOperator;
  label: string;
  types: string[];
}

export interface FilterMetadata {
  fields: FilterField[];
  operators: FilterOperatorInfo[];
  values: {
    priority: string[];
    taskType: string[];
    projects: Array<{ id: number; name: string }>;
    users: Array<{ userId: number; username: string; email: string }>;
    statuses: Array<{ id: number; name: string; color: string; projectId: number }>;
    tags: string[];
  };
}

// API Response types
export interface FilterTasksResponse {
  success: boolean;
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    taskType?: string;
    tags?: string;
    startDate?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    points?: number;
    projectId: number;
    authorUserId: number;
    assignedUserId?: number;
    cycleId?: number;
    triaged: boolean;
    isShared: boolean;
    archivedAt?: string;
    organizationId: number;
    author?: {
      userId: number;
      username: string;
      profilePictureUrl?: string;
    };
    assignee?: {
      userId: number;
      username: string;
      profilePictureUrl?: string;
    };
    project?: {
      id: number;
      name: string;
      organizationId: number;
    };
    cycle?: {
      id: number;
      name: string;
    };
    _count?: {
      comments: number;
      attachments: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filter: {
    applied: boolean;
    operator: "AND" | "OR";
    conditionCount: number;
  };
}

export interface ValidateFilterResponse {
  valid: boolean;
  message?: string;
  error?: string;
}

export interface ConvertFilterResponse {
  success: boolean;
  legacyFilter: Record<string, unknown>;
  advancedFilter: AdvancedTaskFilter;
}

export interface SavedView {
  id: number;
  name: string;
  isDefault: boolean;
  isShared: boolean;
}

export interface ApplySavedViewResponse {
  success: boolean;
  view: SavedView;
  tasks: FilterTasksResponse["tasks"];
  pagination: FilterTasksResponse["pagination"];
}

/**
 * Apply advanced filters with AND/OR logic to tasks
 * POST /api/tasks/advanced-filter
 */
export async function applyAdvancedFilter(
  filter: AdvancedTaskFilter,
  options?: FilterPaginationOptions
): Promise<FilterTasksResponse> {
  return apiService.request<FilterTasksResponse>("/tasks/advanced-filter", {
    method: "POST",
    body: JSON.stringify({
      filter,
      options: {
        page: options?.page || 1,
        limit: options?.limit || 25,
        sortBy: options?.sortBy || "updatedAt",
        sortOrder: options?.sortOrder || "desc",
      },
    }),
  });
}

/**
 * Validate an advanced filter structure without executing it
 * POST /api/tasks/advanced-filter/validate
 */
export async function validateAdvancedFilter(filter: AdvancedTaskFilter): Promise<ValidateFilterResponse> {
  return apiService.request<ValidateFilterResponse>("/tasks/advanced-filter/validate", {
    method: "POST",
    body: JSON.stringify({ filter }),
  });
}

/**
 * Convert a legacy simple filter to advanced filter format
 * POST /api/tasks/advanced-filter/convert
 */
export async function convertLegacyFilter(
  legacyFilter: Record<string, unknown>
): Promise<ConvertFilterResponse> {
  return apiService.request<ConvertFilterResponse>("/tasks/advanced-filter/convert", {
    method: "POST",
    body: JSON.stringify({ legacyFilter }),
  });
}

/**
 * Get metadata for building filters (available fields, operators, etc.)
 * GET /api/tasks/filter-metadata
 */
export async function getFilterMetadata(): Promise<{ success: boolean; metadata: FilterMetadata }> {
  return apiService.request<{ success: boolean; metadata: FilterMetadata }>("/tasks/filter-metadata", {
    method: "GET",
  });
}

/**
 * Apply a saved view's filters to get matching tasks
 * POST /api/saved-views/:viewId/apply
 */
export async function applySavedView(
  viewId: number,
  options?: FilterPaginationOptions
): Promise<ApplySavedViewResponse> {
  return apiService.request<ApplySavedViewResponse>(`/saved-views/${viewId}/apply`, {
    method: "POST",
    body: JSON.stringify({
      options: {
        page: options?.page || 1,
        limit: options?.limit || 25,
        sortBy: options?.sortBy || "updatedAt",
        sortOrder: options?.sortOrder || "desc",
      },
    }),
  });
}

/**
 * Convert frontend FilterCriteria to AdvancedTaskFilter format
 * This helps transition from the old format to the new API format
 */
export function convertCriteriaToAdvancedFilter(
  criteria: Array<{
    id: string;
    type: string;
    operator: string;
    value: unknown;
  }>,
  logic: "AND" | "OR" = "AND"
): AdvancedTaskFilter {
  const fieldMapping: Record<string, TaskFilterField> = {
    status: "status",
    priority: "priority",
    assignee: "assignedUserId",
    project: "projectId",
    dueDate: "dueDate",
    tags: "tags",
  };

  const conditions: FieldCondition[] = criteria.map((c) => {
    const field = fieldMapping[c.type] || "title";
    
    // Map frontend operators to API operators
    let operator: FilterOperator = "equals";
    switch (c.operator) {
      case "equals":
        operator = "equals";
        break;
      case "notEquals":
        operator = "notEquals";
        break;
      case "contains":
        operator = "contains";
        break;
      case "before":
        operator = "lessThan";
        break;
      case "after":
        operator = "greaterThan";
        break;
      case "between":
        operator = "between";
        break;
      default:
        operator = "equals";
    }

    // Handle value conversion
    let value = c.value;
    if (field === "assignedUserId" || field === "projectId") {
      value = typeof c.value === "string" ? parseInt(c.value, 10) : c.value;
    }

    return {
      field,
      operator,
      value: value as FieldCondition["value"],
    };
  });

  return {
    operator: logic,
    conditions,
  };
}

/**
 * Build a nested condition group for complex queries
 * Example: (status = "In Progress" OR status = "Review") AND priority = "High"
 */
export function buildComplexFilter(
  groups: Array<{
    operator: "AND" | "OR";
    conditions: FieldCondition[];
  }>,
  rootOperator: "AND" | "OR" = "AND"
): AdvancedTaskFilter {
  const conditionGroups: ConditionGroup[] = groups.map((g) => ({
    operator: g.operator,
    conditions: g.conditions,
  }));

  return {
    operator: rootOperator,
    conditions: conditionGroups,
  };
}

/**
 * Create a simple filter with one or more conditions
 */
export function createSimpleFilter(
  conditions: FieldCondition | FieldCondition[],
  operator: "AND" | "OR" = "AND"
): AdvancedTaskFilter {
  const conditionsArray = Array.isArray(conditions) ? conditions : [conditions];
  
  return {
    operator,
    conditions: conditionsArray,
  };
}

/**
 * Create an OR filter for matching any of multiple values
 * Example: status is "In Progress" OR "Review" OR "Done"
 */
export function createOrFilter(field: TaskFilterField, values: unknown[]): AdvancedTaskFilter {
  return {
    operator: "OR",
    conditions: values.map((value) => ({
      field,
      operator: "equals" as FilterOperator,
      value: value as FieldCondition["value"],
    })),
  };
}

/**
 * Create an AND filter for matching multiple field conditions
 * Example: status = "In Progress" AND priority = "High"
 */
export function createAndFilter(conditions: FieldCondition[]): AdvancedTaskFilter {
  return {
    operator: "AND",
    conditions,
  };
}

export default {
  applyAdvancedFilter,
  validateAdvancedFilter,
  convertLegacyFilter,
  getFilterMetadata,
  applySavedView,
  convertCriteriaToAdvancedFilter,
  buildComplexFilter,
  createSimpleFilter,
  createOrFilter,
  createAndFilter,
};
