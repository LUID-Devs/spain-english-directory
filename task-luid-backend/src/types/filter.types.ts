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
  value?: string | number | boolean | string[] | number[] | Date | { from: Date; to: Date };
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

// Filter validation result
export interface FilterValidationResult {
  valid: boolean;
  message?: string;
  error?: string;
}

// Task with relations (simplified)
export interface TaskWithRelations {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  taskType?: string | null;
  tags?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  points?: number | null;
  projectId: number;
  authorUserId: number;
  assignedUserId?: number | null;
  cycleId?: number | null;
  triaged: boolean;
  isShared: boolean;
  archivedAt?: Date | null;
  organizationId: number;
  author?: {
    userId: number;
    username: string | null;
    profilePictureUrl?: string | null;
  };
  assignee?: {
    userId: number;
    username: string | null;
    profilePictureUrl?: string | null;
  } | null;
  project?: {
    id: number;
    name: string;
    organizationId: number;
  };
  cycle?: {
    id: number;
    name: string;
  } | null;
  _count?: {
    comments: number;
    attachments: number;
  };
}

// Filter tasks result
export interface FilterTasksResult {
  success: boolean;
  tasks: TaskWithRelations[];
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