import { validateTaskContent, validateProjectContent, validateCommentContent, validateGoalContent, validateStatusContent } from '../lib/validation';
import { limitedFetch } from './limitedFetch';

// Types (moved from old api.ts)
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  archived?: boolean;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  isFavorited?: boolean;
  statistics?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    progress: number;
    memberCount: number;
    status: string;
  };
  teamMembers?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  }[];
  taskCount?: number;
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
  Archived = "Archived",
}

export interface TaskStatus {
  id: number;
  name: string;
  color?: string;
  order: number;
  isDefault: boolean;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

const PRIORITY_TO_API_MAP: Record<Priority, string> = {
  [Priority.Urgent]: "P0",
  [Priority.High]: "P1",
  [Priority.Medium]: "P2",
  [Priority.Low]: "P3",
  [Priority.Backlog]: "P3",
};

const PRIORITY_FROM_API_MAP: Record<string, Priority> = {
  P0: Priority.Urgent,
  P1: Priority.High,
  P2: Priority.Medium,
  P3: Priority.Low,
};

const mapPriorityForApi = (priority?: string | null): string | null | undefined => {
  if (priority == null) return priority;
  if (priority in PRIORITY_TO_API_MAP) {
    return PRIORITY_TO_API_MAP[priority as Priority];
  }
  return priority;
};

const mapPriorityFromApi = (priority?: string | null): string | null | undefined => {
  if (priority == null) return priority;
  const normalized = priority.toUpperCase();
  return PRIORITY_FROM_API_MAP[normalized] ?? priority;
};

const mapTaskPriorityFromApi = <T extends { priority?: string | null }>(task: T): T => {
  if (!task || !task.priority) return task;
  const mapped = mapPriorityFromApi(task.priority);
  if (mapped === task.priority) return task;
  return { ...task, priority: mapped } as T;
};

const mapTasksPriorityFromApi = <T extends { priority?: string | null }>(tasks: T[] | null | undefined): T[] => {
  if (!tasks) return [];
  return tasks.map(mapTaskPriorityFromApi);
};

export enum TaskType {
  Feature = "Feature",
  Bug = "Bug",
  Chore = "Chore",
}

export interface SavedView {
  id: number;
  name: string;
  projectId: number;
  userId: number;
  organizationId: number;
  filters: AdvancedTaskFilter | {
    priority?: string | null;
    status?: string | null;
    assigneeId?: number | null;
    searchQuery?: string | null;
  };
  isDefault: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== ADVANCED FILTER TYPES ====================

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

export interface FieldCondition {
  field: TaskFilterField;
  operator: FilterOperator;
  value?: string | number | boolean | string[] | number[] | Date | { from: Date; to: Date };
}

export interface ConditionGroup {
  operator: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}

export interface AdvancedTaskFilter {
  operator?: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}

export interface FilterMetadataField {
  name: TaskFilterField;
  type: "string" | "number" | "date" | "boolean";
  label: string;
}

export interface FilterMetadataOperator {
  value: FilterOperator;
  label: string;
  types: ("string" | "number" | "boolean" | "date")[];
}

export interface FilterMetadata {
  fields: FilterMetadataField[];
  operators: FilterMetadataOperator[];
  values: {
    priority: string[];
    taskType: string[];
    projects: { id: number; name: string }[];
    users: { userId: number; username: string; email: string }[];
    statuses: { id: number; name: string; color?: string; projectId: number }[];
    tags: string[];
  };
}

export interface ApplyAdvancedFilterRequest {
  filter: AdvancedTaskFilter;
  options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

export interface ApplyAdvancedFilterResponse {
  success: boolean;
  tasks: Task[];
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
  error?: string;
}

export interface ConvertFilterResponse {
  success: boolean;
  legacyFilter: Record<string, unknown>;
  advancedFilter: AdvancedTaskFilter;
}

export interface ApplySavedViewResponse {
  success: boolean;
  view: {
    id: number;
    name: string;
    isDefault: boolean;
    isShared: boolean;
  };
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TaskShareResponse {
  shareUrl: string;
  token: string;
  expiresAt?: string | null;
  allowComments?: boolean;
  requirePassword?: boolean;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
  role?: string;
}

export interface UserWithStats extends User {
  teamName?: string;
  taskStats: {
    authored: number;
    assigned: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  activityStats: {
    totalComments: number;
    totalAttachments: number;
    lastActivity: string | null;
  };
}

export interface Agent {
  id: number;
  name: string;
  displayName?: string;
  role?: string;
  status: 'active' | 'inactive' | 'busy';
  lastHeartbeat?: string;
  currentTaskId?: number;
  currentTask?: {
    id: number;
    title: string;
    status: string;
  };
  _count?: {
    assignedTasks: number;
    notifications: number;
  };
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
  uploadedBy: {
    userId: number;
    username: string;
    email: string;
  };
}

export interface Comment {
  id: number;
  text: string;
  imageUrl?: string;
  taskId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  descriptionImageUrl?: string;
  status?: Status;
  priority?: Priority;
  taskType?: TaskType;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  order?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
  formTemplateId?: number;
  archivedAt?: string;
  triaged?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Nested sub-issues hierarchy (Task #656 + TASK-781)
  parentTaskId?: number | null;
  parentId?: number | null; // Alias for compatibility
  subTasks?: Task[];
  subTaskCount?: number;
  depth?: number;
  isExpanded?: boolean;
  displayOrder?: number;

  author?: User;
  assignee?: User;
  project?: {
    id: number;
    name: string;
    visibility?: string;
  };
  comments?: Comment[];
  attachments?: Attachment[];
  // Nested sub-issues relations
  parent?: {
    id: number;
    title: string;
    status?: string;
  } | null;
  children?: SubIssue[];
  _count?: {
    children?: number;
  };
}

// Sub-issue (child task) interface
export interface SubIssue {
  id: number;
  title: string;
  status?: string;
  priority?: string;
  assignedUserId?: number;
  depth?: number;
  displayOrder?: number;
  assignee?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  _count?: {
    children?: number;
  };
  children?: SubIssue[];
}

// Sub-issues API response
export interface SubIssuesResponse {
  taskId: number;
  count: number;
  subIssues: SubIssue[];
}

// Breadcrumb item
export interface BreadcrumbItem {
  id: number;
  title: string;
}

// Task breadcrumb response
export interface TaskBreadcrumbResponse {
  taskId: number;
  breadcrumb: BreadcrumbItem[];
}

export interface TaskShareInfo {
  success?: boolean;
  shareUrl: string;
  token: string;
  expiresAt?: string | null;
  allowComments: boolean;
  requirePassword: boolean;
  viewCount?: number;
}

export interface PublicTaskShare {
  task: {
    id: number;
    title: string;
    description?: string | null;
    status?: string | null;
    priority?: string | null;
    project?: {
      id: number;
      name: string;
    } | null;
    assignedTo?: string | null;
    updatedAt?: string;
  };
  allowComments: boolean;
  externalComments?: Array<{
    id: number;
    text: string;
    authorName: string;
    createdAt: string;
  }>;
  expiresAt?: string | null;
}
export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface SearchSuggestion {
  type: 'task' | 'project' | 'user';
  id: number;
  title: string;
  subtitle: string;
}

export interface Team {
  id: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
  productOwnerUsername?: string;
  projectManagerUsername?: string;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// AI Task Parsing Types
export interface ParsedTaskData {
  title: string;
  description: string | null;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low' | 'Backlog' | null;
  dueDate: string | null;
  assignee: string | null;
  tags: string | null;
  confidence: {
    title: number;
    priority: number;
    dueDate: number;
    assignee: number;
    tags: number;
  };
}

export interface AIParseTaskResponse {
  success: boolean;
  data?: ParsedTaskData;
  error?: {
    message: string;
    code: string;
    required?: number;
    available?: number;
  };
  creditsUsed?: number;
  remainingCredits?: number;
  processingTime?: number;
}

export interface AIStatusResponse {
  success: boolean;
  data?: {
    available: boolean;
    features: {
      parseTask: {
        available: boolean;
        creditCost: number;
        description: string;
        maxInputLength: number;
      };
    };
  };
}

// AI Natural Language Filter Types
export interface ParsedSearchFilter {
  query: {
    text?: string;
    status?: string[];
    priority?: string[];
    assignee?: string[];
    project?: string[];
    tags?: string[];
    dueDate?: {
      from?: string;
      to?: string;
    };
    created?: {
      from?: string;
      to?: string;
    };
    updated?: {
      from?: string;
      to?: string;
    };
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  confidence: {
    overall: number;
    status: number;
    priority: number;
    assignee: number;
    date: number;
  };
  interpretedQuery: string;
}

export interface AIParseSearchFilterResponse {
  success: boolean;
  data?: ParsedSearchFilter;
  error?: {
    message: string;
    code: string;
  };
  creditsUsed?: number;
  remainingCredits?: number;
  processingTime?: number;
}


// ==================== ANALYTICS TYPES ====================

export interface VelocityCycle {
  cycleId: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  status: string;
  completedTasks: number;
  totalPoints: number;
  averagePointsPerTask: number;
}

export interface TeamVelocityResponse {
  success: boolean;
  teamId: number;
  cyclesAnalyzed: number;
  averageVelocity: {
    tasksPerCycle: number;
    pointsPerCycle: number;
  };
  velocityByCycle: VelocityCycle[];
}

export interface CycleTimeByPriority {
  priority: string;
  count: number;
  averageCycleTime: number;
  min: number;
  max: number;
}

export interface CycleTimeTask {
  taskId: number;
  cycleTimeDays: number;
  points?: number;
  priority?: string;
  taskType?: string;
  startDate?: string;
  completedAt: string;
}

export interface TeamCycleTimeResponse {
  success: boolean;
  teamId: number;
  periodDays: number;
  tasksAnalyzed: number;
  averageCycleTimeDays: number;
  cycleTimeByPriority: CycleTimeByPriority[];
  tasks: CycleTimeTask[];
}

export interface ThroughputDataPoint {
  period: string;
  completedTasks: number;
  totalPoints: number;
  taskIds: number[];
}

export interface TeamThroughputResponse {
  success: boolean;
  teamId: number;
  periodDays: number;
  groupBy: string;
  totalTasks: number;
  totalPoints: number;
  averagePerPeriod: number;
  periodsAnalyzed: number;
  throughputData: ThroughputDataPoint[];
}

export interface ActiveCycleStats {
  cycleId: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  completedPoints: number;
}

export interface WorkloadByUser {
  userId: number;
  username: string;
  taskCount: number;
}

export interface TeamAnalyticsSummaryResponse {
  success: boolean;
  team: {
    id: number;
    name: string;
    memberCount: number;
    cyclesEnabled: boolean;
  };
  summary: {
    activeCycle: ActiveCycleStats | null;
    recentThroughput: {
      period: string;
      completedTasks: number;
      averagePerDay: number;
    };
    cycleTime: {
      period: string;
      averageDays: number;
      tasksAnalyzed: number;
    };
    currentWorkload: {
      activeTasks: number;
      byUser: WorkloadByUser[];
    };
  };
}

// API Service class
class ApiService {
  private baseUrl: string;

  constructor() {
    const rawBaseUrl = (
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      'https://api.taskluid.com'
    ).trim();
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
  }

  // Public getters for external hooks
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  // Public wrappers for private methods
  public resolveEndpoint(endpoint: string): string {
    return this._resolveEndpoint(endpoint);
  }

  public async getAuthHeaders(): Promise<Record<string, string>> {
    return this._getAuthHeaders();
  }

  private _resolveEndpoint(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    const baseUrl = this.baseUrl;
    if (!baseUrl) {
      return endpoint.startsWith('/api/') || endpoint.startsWith('/api?')
        ? endpoint
        : endpoint.startsWith('/')
          ? `/api${endpoint}`
          : `/api/${endpoint}`;
    }

    const baseHasApi = /\/api$/.test(baseUrl);
    const endpointHasApi = endpoint.startsWith('/api/');

    if (baseHasApi && endpointHasApi) {
      return endpoint.replace(/^\/api/, '');
    }

    if (!baseHasApi && !endpointHasApi) {
      return endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;
    }

    return endpoint;
  }

  private async _getAuthHeaders(): Promise<Record<string, string>> {
    const authHeader: Record<string, string> = {};

    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();

      if (session?.tokens?.accessToken) {
        authHeader['Authorization'] = `Bearer ${session.tokens.accessToken}`;
      }

      if (session?.tokens?.idToken) {
        authHeader['X-ID-Token'] = `${session.tokens.idToken}`;
      }
    } catch {
      // No Cognito session available, continue without tokens (will use session cookies)
    }

    const activeOrgId = localStorage.getItem('activeOrganizationId');
    if (activeOrgId) {
      authHeader['X-Organization-Id'] = activeOrgId;
    }

    return authHeader;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const resolvedEndpoint = this.resolveEndpoint(endpoint);
    const url = /^https?:\/\//i.test(resolvedEndpoint)
      ? resolvedEndpoint
      : `${this.baseUrl}${resolvedEndpoint}`;

    // Get Cognito access token and ID token if available
    const authHeader = await this.getAuthHeaders();

    // Check if body is FormData - don't set Content-Type for FormData
    // (browser will set it automatically with proper multipart boundary)
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...authHeader,
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }


    const config: RequestInit = {
      credentials: 'include', // Still send cookies for traditional auth
      ...options,
      headers,
    };

    // console.log('API Request:', url, config);

    try {
      const response = await limitedFetch(url, config);
      
      if (!response.ok) {
        // Handle authentication failures
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        
        // Try to parse error message from response body
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (errorData && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData?.error && typeof errorData.error.message === 'string') {
            errorMessage = errorData.error.message;
          }
        } catch {
          // If parsing fails, use the default error message
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Re-throw authentication errors to trigger redirect
      if (error instanceof Error && error.message === 'Authentication required') {
        throw error;
      }
      
      throw error;
    }
  }



  private async requestBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
    const resolvedEndpoint = this.resolveEndpoint(endpoint);
    const url = /^https?:\/\//i.test(resolvedEndpoint)
      ? resolvedEndpoint
      : `${this.baseUrl}${resolvedEndpoint}`;
    const authHeader = await this.getAuthHeaders();

    const headers: Record<string, string> = {
      ...authHeader,
      ...(options.headers as Record<string, string>),
    };

    const config: RequestInit = {
      credentials: 'include',
      ...options,
      headers,
    };

    const response = await limitedFetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData?.error && typeof errorData.error.message === 'string') {
          errorMessage = errorData.error.message;
        }
      } catch {
        // If parsing fails, use the default error message
      }
      throw new Error(errorMessage);
    }

    return response.blob();
  }


  // Auth
  async getAuthUser(userSub: string): Promise<User> {
    return this.request<User>(`/users/${userSub}`);
  }

  // Projects
  async getProjects(params: { 
    archived?: boolean; 
    favorites?: boolean; 
    userId?: number; 
    status?: string 
  } = {}): Promise<Project[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    return this.request<Project[]>(`/projects${queryString ? `?${queryString}` : ''}`);
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    // Validate for zero-width characters to prevent visual spoofing
    if (project.name !== undefined || project.description !== undefined) {
      const { isValid, error } = validateProjectContent(project.name, project.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getProject(id: string, userId?: number): Promise<Project> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<Project>(`/projects/${id}${params}`);
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    // Validate for zero-width characters if name or description is being updated
    if (project.name !== undefined || project.description !== undefined) {
      const { isValid, error } = validateProjectContent(project.name, project.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async archiveProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}/archive`, {
      method: 'PATCH',
    });
  }

  async unarchiveProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}/unarchive`, {
      method: 'PATCH',
    });
  }

  async favoriteProject(id: string, userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async unfavoriteProject(id: string, userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}/favorite`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  // Task Statuses
  async getProjectStatuses(projectId: number): Promise<TaskStatus[]> {
    return this.request<TaskStatus[]>(`/projects/${projectId}/statuses`);
  }

  async createStatus(projectId: number, data: { name: string; color?: string }): Promise<TaskStatus> {
    // Validate for zero-width characters in status name
    const { isValid, error } = validateStatusContent(data.name);
    if (!isValid) {
      throw new Error(error);
    }

    return this.request<TaskStatus>(`/projects/${projectId}/statuses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStatus(projectId: number, statusId: number, data: { name?: string; color?: string; order?: number }): Promise<TaskStatus> {
    // Validate for zero-width characters if name is being updated
    if (data.name !== undefined) {
      const { isValid, error } = validateStatusContent(data.name);
      if (!isValid) {
        throw new Error(error);
      }
    }

    return this.request<TaskStatus>(`/projects/${projectId}/statuses/${statusId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStatus(projectId: number, statusId: number, moveTasksTo?: string): Promise<{ message: string; tasksMovedCount: number }> {
    return this.request<{ message: string; tasksMovedCount: number }>(`/projects/${projectId}/statuses/${statusId}`, {
      method: 'DELETE',
      body: JSON.stringify({ moveTasksTo }),
    });
  }

  async reorderStatuses(projectId: number, statusIds: number[]): Promise<TaskStatus[]> {
    return this.request<TaskStatus[]>(`/projects/${projectId}/statuses/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ statusIds }),
    });
  }

  // Tasks
  async getTasks(
    projectId?: number,
    filters?: { archived?: boolean; triageStatus?: string }
  ): Promise<Task[]> {
    const params = new URLSearchParams();
    if (projectId !== undefined) {
      params.append('projectId', projectId.toString());
    }
    if (filters?.archived !== undefined) {
      params.append('archived', filters.archived.toString());
    }
    if (filters?.triageStatus) {
      params.append('triageStatus', filters.triageStatus);
    }

    const queryString = params.toString();
    const tasks = await this.request<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
    return mapTasksPriorityFromApi(tasks);
  }

  async getTask(taskId: number): Promise<Task> {
    const task = await this.request<Task>(`/tasks/${taskId}`);
    return mapTaskPriorityFromApi(task);
  }

  async getTaskShare(taskId: number): Promise<TaskShareInfo> {
    return this.request<TaskShareInfo>(`/tasks/${taskId}/share`);
  }

  async createTaskShare(
    taskId: number,
    payload: {
      expiresInDays?: number | null;
      allowComments?: boolean;
      requirePassword?: boolean;
      password?: string;
    } = {}
  ): Promise<TaskShareInfo> {
    return this.request<TaskShareInfo>(`/tasks/${taskId}/share`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async revokeTaskShare(taskId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/tasks/${taskId}/share`, {
      method: 'DELETE',
    });
  }

  async getPublicTaskShare(token: string, sharePassword?: string): Promise<PublicTaskShare> {
    return this.request<PublicTaskShare>(`/share/${token}`, {
      headers: sharePassword ? { 'x-share-password': sharePassword } : {},
    });
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    const tasks = await this.request<Task[]>(`/tasks/user/${userId}`);
    return mapTasksPriorityFromApi(tasks);
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    // Validate for zero-width characters to prevent visual spoofing
    if (task.title !== undefined || task.description !== undefined) {
      const { isValid, error } = validateTaskContent(task.title, task.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    const payload = {
      ...task,
      priority: mapPriorityForApi(task.priority as string | null | undefined),
    };

    const created = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapTaskPriorityFromApi(created);
  }

  async updateTask(taskId: number, task: Partial<Task>): Promise<Task> {
    // Validate for zero-width characters if title or description is being updated
    if (task.title !== undefined || task.description !== undefined) {
      const { isValid, error } = validateTaskContent(task.title, task.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    const payload = {
      ...task,
      priority: mapPriorityForApi(task.priority as string | null | undefined),
    };

    const updated = await this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapTaskPriorityFromApi(updated);
  }

  async deleteTask(taskId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async updateTaskStatus(taskId: number, status: string): Promise<Task> {
    const updated = await this.request<Task>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return mapTaskPriorityFromApi(updated);
  }

  async uploadTaskDescriptionImage(formData: FormData): Promise<{ imageUrl: string }> {
    return this.request<{ imageUrl: string }>('/tasks/upload-description-image', {
      method: 'POST',
      body: formData,
    });
  }

  // Task Export
  async exportTasksCSV(filters?: { projectId?: number; status?: string; assignedUserId?: number }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedUserId) params.append('assignedUserId', filters.assignedUserId.toString());
    
    const queryString = params.toString();
    return this.requestBlob(`/tasks/export/csv${queryString ? `?${queryString}` : ''}`);
  }

  async exportTasksJSON(filters?: { projectId?: number; status?: string; assignedUserId?: number }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedUserId) params.append('assignedUserId', filters.assignedUserId.toString());
    
    const queryString = params.toString();
    return this.requestBlob(`/tasks/export/json${queryString ? `?${queryString}` : ''}`);
  }

  // Task Archive
  async archiveTask(taskId: number): Promise<{ message: string; task: Task }> {
    const response = await this.request<{ message: string; task: Task }>(`/tasks/${taskId}/archive`, {
      method: 'PATCH',
    });
    return {
      ...response,
      task: mapTaskPriorityFromApi(response.task),
    };
  }

  async unarchiveTask(taskId: number): Promise<{ message: string; task: Task }> {
    const response = await this.request<{ message: string; task: Task }>(`/tasks/${taskId}/unarchive`, {
      method: 'PATCH',
    });
    return {
      ...response,
      task: mapTaskPriorityFromApi(response.task),
    };
  }

  // Comments
  async getTaskComments(taskId: number): Promise<Comment[]> {
    return this.request<Comment[]>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: number, text: string, userId: number, imageUrl?: string): Promise<Comment> {
    // Validate for zero-width characters in comment text
    const { isValid, error } = validateCommentContent(text);
    if (!isValid) {
      throw new Error(error);
    }

    return this.request<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, userId, imageUrl }),
    });
  }

  async uploadCommentImage(formData: FormData): Promise<{ imageUrl: string }> {
    return this.request<{ imageUrl: string }>('/comments/upload-image', {
      method: 'POST',
      body: formData,
    });
  }

  async updateComment(commentId: number, text: string, userId: number): Promise<Comment> {
    // Validate for zero-width characters in comment text
    const { isValid, error } = validateCommentContent(text);
    if (!isValid) {
      throw new Error(error);
    }

    return this.request<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text, userId }),
    });
  }

  async deleteComment(commentId: number, userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  // Attachments
  async getTaskAttachments(taskId: number): Promise<Attachment[]> {
    return this.request<Attachment[]>(`/tasks/${taskId}/attachments`);
  }

  async uploadAttachment(taskId: number, formData: FormData): Promise<Attachment> {
    return this.request<Attachment>(`/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  }

  async uploadAttachmentWithProgress(
    taskId: number,
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<Attachment> {
    const resolvedEndpoint = this.resolveEndpoint(`/tasks/${taskId}/attachments`);
    const url = /^https?:\/\//i.test(resolvedEndpoint)
      ? resolvedEndpoint
      : `${this.baseUrl}${resolvedEndpoint}`;
    const authHeader = await this.getAuthHeaders();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else if (xhr.status === 401) {
          reject(new Error('Authentication required'));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('POST', url);

      // Set headers (except Content-Type - browser sets it for FormData)
      Object.entries(authHeader).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.withCredentials = true;

      xhr.send(formData);
    });
  }

  async deleteAttachment(attachmentId: number, userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/attachments/${attachmentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUsersWithStats(): Promise<UserWithStats[]> {
    return this.request<UserWithStats[]>('/users/with-stats');
  }

  async inviteUser(email: string, teamId: number, role: string): Promise<{ message: string; invitation: any }> {
    return this.request<{ message: string; invitation: any }>('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, teamId, role }),
    });
  }

  async updateUserRole(userId: number, role: string): Promise<{ message: string; user: any }> {
    return this.request<{ message: string; user: any }>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getMemberTasks(organizationId: number, userId: number): Promise<{
    totalCount: number;
    activeCycleTasks: any[];
    upcomingCycleTasks: any[];
    noCycleTasks: any[];
    otherTasks: any[];
    allTasks: any[];
  }> {
    return this.request<{
      totalCount: number;
      activeCycleTasks: any[];
      upcomingCycleTasks: any[];
      noCycleTasks: any[];
      otherTasks: any[];
      allTasks: any[];
    }>(`/organizations/${organizationId}/members/${userId}/tasks`);
  }

  async removeOrganizationMember(organizationId: number, userId: number, unassignTasks?: boolean): Promise<{ message: string; data?: { removed: boolean; tasksUnassigned: number; tasksRemaining: number } }> {
    return this.request<{ message: string; data?: { removed: boolean; tasksUnassigned: number; tasksRemaining: number } }>(`/organizations/${organizationId}/members/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ unassignTasks }),
    });
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  // ==================== CYCLES ====================

  async getTeamCycles(teamId: number, status?: string): Promise<{ teamId: number; cycles: Cycle[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const queryString = params.toString();
    return this.request<{ teamId: number; cycles: Cycle[] }>(`/teams/${teamId}/cycles${queryString ? `?${queryString}` : ''}`);
  }

  async getCycle(cycleId: number): Promise<CycleWithDetails> {
    return this.request<CycleWithDetails>(`/teams/cycles/${cycleId}`);
  }

  async createCycle(teamId: number, cycle: Partial<Cycle>, skipOverlapCheck?: boolean): Promise<{ message: string; cycle: Cycle }> {
    return this.request<{ message: string; cycle: Cycle }>(`/teams/${teamId}/cycles`, {
      method: 'POST',
      body: JSON.stringify({ ...cycle, skipOverlapCheck }),
    });
  }

  async updateCycle(cycleId: number, cycle: Partial<Cycle>, skipOverlapCheck?: boolean): Promise<{ message: string; cycle: Cycle }> {
    return this.request<{ message: string; cycle: Cycle }>(`/teams/cycles/${cycleId}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...cycle, skipOverlapCheck }),
    });
  }

  async startCycleNow(cycleId: number): Promise<{ message: string; cycle: Cycle }> {
    return this.request<{ message: string; cycle: Cycle }>(`/teams/cycles/${cycleId}/start-now`, {
      method: 'POST',
    });
  }

  async completeCycle(cycleId: number, autoRollover?: boolean): Promise<{ message: string; cycle: Cycle; rolledOverTasks: number[]; nextCycleId?: number }> {
    return this.request<{ message: string; cycle: Cycle; rolledOverTasks: number[]; nextCycleId?: number }>(`/teams/cycles/${cycleId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ autoRollover }),
    });
  }

  async cancelCycle(cycleId: number, moveTasksTo?: number): Promise<{ message: string; cycle: Cycle; tasksMoved: number }> {
    return this.request<{ message: string; cycle: Cycle; tasksMoved: number }>(`/teams/cycles/${cycleId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ moveTasksTo }),
    });
  }

  async getTeamCycleSettings(teamId: number): Promise<{ teamId: number; settings: CycleSettings }> {
    return this.request<{ teamId: number; settings: CycleSettings }>(`/teams/${teamId}/cycle-settings`);
  }

  async updateTeamCycleSettings(teamId: number, settings: Partial<CycleSettings>): Promise<{ message: string; teamId: number; settings: CycleSettings }> {
    return this.request<{ message: string; teamId: number; settings: CycleSettings }>(`/teams/${teamId}/cycle-settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async assignTaskToCycle(taskId: number, cycleId: number | null): Promise<{ message: string; task: { id: number; title: string; cycleId: number | null; cycle?: Cycle } }> {
    return this.request<{ message: string; task: { id: number; title: string; cycleId: number | null; cycle?: Cycle } }>(`/teams/tasks/${taskId}/cycle`, {
      method: 'POST',
      body: JSON.stringify({ cycleId }),
    });
  }

  // Search
  async search(query: string): Promise<SearchResults> {
    const params = new URLSearchParams({ 
      query,
      _t: Date.now().toString() // Cache busting
    });
    return this.request<SearchResults>(`/search?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  async advancedSearch(params: {
    query?: string;
    type?: string;
    status?: string;
    priority?: string;
    assigneeId?: number;
    authorId?: number;
    projectId?: number;
    teamId?: number;
    dateFrom?: string;
    dateTo?: string;
    archived?: boolean;
  }): Promise<SearchResults> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    return this.request<SearchResults>(`/search/advanced?${queryParams.toString()}`);
  }

  async getSearchSuggestions(query: string, type?: string): Promise<{ suggestions: SearchSuggestion[] }> {
    const params = new URLSearchParams({
      query,
      _t: Date.now().toString() // Cache busting
    });
    if (type) params.append('type', type);
    return this.request<{ suggestions: SearchSuggestion[] }>(`/search/suggestions?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  // TASK-781: Hybrid Semantic Search - combines AI vector similarity with keyword matching
  async hybridSemanticSearch(params: {
    query: string;
    projectId?: number;
    status?: string;
    priority?: string;
    assigneeId?: number;
    authorId?: number;
    limit?: number;
    semanticThreshold?: number;
    semanticWeight?: number;
    includeArchived?: boolean;
  }): Promise<{
    query: string;
    results: Array<{
      task: Task;
      semanticScore: number;
      keywordScore: number;
      hybridScore: number;
      matches: {
        title?: { score: number; matched: boolean };
        description?: { score: number; matched: boolean };
        tags?: { score: number; matched: boolean };
      };
      matchReason: 'semantic' | 'keyword' | 'hybrid';
    }>;
    totalCount: number;
    usedSemanticSearch: boolean;
    embeddingTimeMs: number;
    searchTimeMs: number;
    fromCache: boolean;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', params.query);
    queryParams.append('_t', Date.now().toString()); // Cache busting
    
    if (params.projectId) queryParams.append('projectId', params.projectId.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assigneeId) queryParams.append('assigneeId', params.assigneeId.toString());
    if (params.authorId) queryParams.append('authorId', params.authorId.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.semanticThreshold) queryParams.append('semanticThreshold', params.semanticThreshold.toString());
    if (params.semanticWeight) queryParams.append('semanticWeight', params.semanticWeight.toString());
    if (params.includeArchived) queryParams.append('includeArchived', 'true');
    
    return this.request(`/search/hybrid?${queryParams.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  // AI Task Parsing
  async parseTaskWithAI(text: string, teamMembers: string[], model?: string): Promise<AIParseTaskResponse> {
    const response = await this.request<AIParseTaskResponse>('/api/ai/parse-task', {
      method: 'POST',
      body: JSON.stringify({ text, teamMembers, model }),
    });

    if (response?.data?.priority) {
      return {
        ...response,
        data: {
          ...response.data,
          priority: mapPriorityFromApi(response.data.priority) as ParsedTaskData["priority"],
        },
      };
    }

    return response;
  }

  async getAIStatus(): Promise<AIStatusResponse> {
    return this.request<AIStatusResponse>('/api/ai/status');
  }

  // AI Due Date Suggestion
  async suggestDueDateWithAI(taskData: {
    title: string;
    description?: string;
    priority: string;
    tags?: string;
  }, model?: string): Promise<{
    success: boolean;
    suggestedDueDate?: string;
    reasoning?: string;
    confidence?: number;
    error?: {
      message: string;
      code: string;
    };
    creditsUsed?: number;
  }> {
    const payload = {
      ...taskData,
      priority: mapPriorityForApi(taskData.priority) as string,
      model,
    };

    return this.request('/api/ai/suggest-due-date', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // AI Natural Language Filter
  async parseSearchFilterWithAI(
    text: string,
    availableProjects?: string[],
    availableLabels?: string[],
    teamMembers?: string[],
    model?: string
  ): Promise<AIParseSearchFilterResponse> {
    return this.request<AIParseSearchFilterResponse>('/api/ai/parse-search-filter', {
      method: 'POST',
      body: JSON.stringify({
        text,
        availableProjects,
        availableLabels,
        teamMembers,
        model,
      }),
    });
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    return this.request<Agent[]>('/agents');
  }

  async assignAgentToTask(taskId: number, agentId: number, status?: string): Promise<{ message: string; assignment: any }> {
    return this.request<{ message: string; assignment: any }>(`/tasks/${taskId}/assign-agents`, {
      method: 'POST',
      body: JSON.stringify({ agentIds: [agentId], status: status || 'To Do' }),
    });
  }

  // Task reordering for drag & drop
  async reorderTasks(tasks: { taskId: number; order: number }[]): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/tasks/reorder', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    });
  }

  // Bulk Actions
  async bulkUpdateTaskStatus(taskIds: number[], status: string): Promise<{ success: boolean; message: string; updatedCount: number; status: string }> {
    return this.request<{ success: boolean; message: string; updatedCount: number; status: string }>('/tasks/bulk/status', {
      method: 'POST',
      body: JSON.stringify({ taskIds, status }),
    });
  }

  async bulkAssignTasks(taskIds: number[], assignedUserId: number | null): Promise<{ success: boolean; message: string; updatedCount: number; assignedUserId: number | null }> {
    return this.request<{ success: boolean; message: string; updatedCount: number; assignedUserId: number | null }>('/tasks/bulk/assign', {
      method: 'POST',
      body: JSON.stringify({ taskIds, assignedUserId }),
    });
  }

  async bulkDeleteTasks(taskIds: number[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return this.request<{ success: boolean; message: string; deletedCount: number }>('/tasks/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ taskIds }),
    });
  }

  async bulkArchiveTasks(taskIds: number[]): Promise<{ success: boolean; message: string; archivedCount: number }> {
    return this.request<{ success: boolean; message: string; archivedCount: number }>('/tasks/bulk/archive', {
      method: 'POST',
      body: JSON.stringify({ taskIds }),
    });
  }

  async bulkUnarchiveTasks(taskIds: number[]): Promise<{ success: boolean; message: string; unarchivedCount: number }> {
    return this.request<{ success: boolean; message: string; unarchivedCount: number }>('/tasks/bulk/unarchive', {
      method: 'POST',
      body: JSON.stringify({ taskIds }),
    });
  }

  // ==================== NESTED SUB-ISSUES API (Task #656) ====================

  async getTaskWithSubTasks(taskId: number, options?: { includeSubTasks?: boolean; maxDepth?: number }): Promise<Task> {
    const params = new URLSearchParams();
    if (options?.includeSubTasks) params.append('includeSubTasks', 'true');
    if (options?.maxDepth) params.append('maxDepth', options.maxDepth.toString());
    
    const queryString = params.toString();
    const task = await this.request<Task>(`/tasks/${taskId}${queryString ? `?${queryString}` : ''}`);
    return mapTaskPriorityFromApi(task);
  }

  async getSubTasks(parentTaskId: number, options?: { recursive?: boolean; maxDepth?: number }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (options?.recursive) params.append('recursive', 'true');
    if (options?.maxDepth) params.append('maxDepth', options.maxDepth.toString());
    
    const queryString = params.toString();
    const tasks = await this.request<Task[]>(`/tasks/${parentTaskId}/sub-tasks${queryString ? `?${queryString}` : ''}`);
    return mapTasksPriorityFromApi(tasks);
  }

  async createSubTask(parentTaskId: number, task: Partial<Task>): Promise<Task> {
    // Validate for zero-width characters to prevent visual spoofing
    if (task.title !== undefined || task.description !== undefined) {
      const { isValid, error } = validateTaskContent(task.title, task.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    const payload = {
      ...task,
      priority: mapPriorityForApi(task.priority as string | null | undefined),
      parentTaskId,
    };

    const created = await this.request<Task>(`/tasks/${parentTaskId}/sub-tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapTaskPriorityFromApi(created);
  }

  async setParentTask(taskId: number, parentTaskId: number | null): Promise<Task> {
    const updated = await this.request<Task>(`/tasks/${taskId}/parent`, {
      method: 'PATCH',
      body: JSON.stringify({ parentTaskId }),
    });
    return mapTaskPriorityFromApi(updated);
  }

  async moveSubTask(taskId: number, newParentTaskId: number | null, newOrder?: number): Promise<Task> {
    const updated = await this.request<Task>(`/tasks/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ parentTaskId: newParentTaskId, order: newOrder }),
    });
    return mapTaskPriorityFromApi(updated);
  }

  async getTaskHierarchy(taskId: number): Promise<{ 
    task: Task; 
    ancestors: Task[]; 
    descendants: Task[];
    siblings: Task[];
  }> {
    const response = await this.request<{
      task: Task;
      ancestors: Task[];
      descendants: Task[];
      siblings: Task[];
    }>(`/tasks/${taskId}/hierarchy`);
    
    return {
      task: mapTaskPriorityFromApi(response.task),
      ancestors: mapTasksPriorityFromApi(response.ancestors),
      descendants: mapTasksPriorityFromApi(response.descendants),
      siblings: mapTasksPriorityFromApi(response.siblings),
    };
  }

  async getProjectTasksWithHierarchy(projectId: number, options?: { 
    includeSubTasks?: boolean;
    rootOnly?: boolean;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    params.append('projectId', projectId.toString());
    if (options?.includeSubTasks) params.append('includeSubTasks', 'true');
    if (options?.rootOnly) params.append('rootOnly', 'true');
    
    const queryString = params.toString();
    const tasks = await this.request<Task[]>(`/tasks/hierarchy${queryString ? `?${queryString}` : ''}`);
    return mapTasksPriorityFromApi(tasks);
  }

  // Duplicate Detection
  async checkDuplicates(data: {
    title: string;
    description?: string;
    projectId: number;
    threshold?: number;
    limit?: number;
    checkDescription?: boolean;
  }): Promise<{
    hasDuplicates: boolean;
    count: number;
    duplicates: Array<{
      task: Task;
      similarity: number;
      matchType: 'title' | 'description' | 'both';
    }>;
    threshold: number;
  }> {
    return this.request<{
      hasDuplicates: boolean;
      count: number;
      duplicates: Array<{
        task: Task;
        similarity: number;
        matchType: 'title' | 'description' | 'both';
      }>;
      threshold: number;
    }>('/tasks/check-duplicates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateDueDate(taskIds: number[], dueDate: string | null): Promise<{ success: boolean; message: string; updatedCount: number }> {
    return this.request<{ success: boolean; message: string; updatedCount: number }>('/tasks/bulk/due-date', {
      method: 'PATCH',
      body: JSON.stringify({ taskIds, dueDate }),
    });
  }

  async bulkMoveToProject(taskIds: number[], projectId: number): Promise<{ success: boolean; message: string; updatedCount: number }> {
    return this.request<{ success: boolean; message: string; updatedCount: number }>('/tasks/bulk/move-project', {
      method: 'PATCH',
      body: JSON.stringify({ taskIds, projectId }),
    });
  }

  // ==================== SAVED VIEWS ====================

  async getProjectViews(projectId: number): Promise<SavedView[]> {
    const response = await this.request<{ success: boolean; views: SavedView[] }>(`/projects/${projectId}/views`);
    return response.views;
  }

  async getDefaultView(projectId: number): Promise<SavedView | null> {
    const response = await this.request<{ success: boolean; view: SavedView | null }>(`/projects/${projectId}/views/default`);
    return response.view;
  }

  async createView(projectId: number, data: {
    name: string;
    filters: SavedView['filters'];
    isDefault?: boolean;
    isShared?: boolean;
  }): Promise<SavedView> {
    const response = await this.request<{ success: boolean; view: SavedView }>(`/projects/${projectId}/views`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.view;
  }

  async updateView(viewId: number, data: Partial<{
    name: string;
    filters: SavedView['filters'];
    isDefault: boolean;
    isShared: boolean;
  }>): Promise<SavedView> {
    const response = await this.request<{ success: boolean; view: SavedView }>(`/views/${viewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.view;
  }

  async deleteView(viewId: number): Promise<void> {
    await this.request<{ success: boolean }>(`/views/${viewId}`, {
      method: 'DELETE',
    });
  }

  async setDefaultView(viewId: number): Promise<SavedView> {
    const response = await this.request<{ success: boolean; view: SavedView }>(`/views/${viewId}/set-default`, {
      method: 'POST',
    });
    return response.view;
  }

  // ==================== GOALS & GOAL TEMPLATES ====================

  async getGoals(organizationId: number, filters?: { projectId?: number; status?: string }): Promise<Goal[]> {
    const params = new URLSearchParams();
    params.append('organizationId', organizationId.toString());
    if (filters?.projectId) params.append('projectId', filters.projectId.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const response = await this.request<{ success: boolean; goals: Goal[] }>(`/goals?${params.toString()}`);
    return response.goals;
  }

  async getGoal(goalId: number): Promise<Goal> {
    const response = await this.request<{ success: boolean; goal: Goal }>(`/goals/${goalId}`);
    return response.goal;
  }

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    // Validate for zero-width characters to prevent visual spoofing
    if (goal.title !== undefined || goal.description !== undefined) {
      const { isValid, error } = validateGoalContent(goal.title, goal.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    const response = await this.request<{ success: boolean; goal: Goal; message: string }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    return response.goal;
  }

  async updateGoal(goalId: number, data: Partial<Goal>): Promise<Goal> {
    // Validate for zero-width characters if title or description is being updated
    if (data.title !== undefined || data.description !== undefined) {
      const { isValid, error } = validateGoalContent(data.title, data.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    const response = await this.request<{ success: boolean; goal: Goal }>(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.goal;
  }

  async deleteGoal(goalId: number): Promise<void> {
    await this.request<{ success: boolean }>(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  async getValidParentGoals(goalId: number, organizationId: number): Promise<{ id: number; title: string }[]> {
    const response = await this.request<{ success: boolean; validParents: { id: number; title: string }[] }>(`/goals/${goalId}/valid-parents?organizationId=${organizationId}`);
    return response.validParents;
  }

  // Goal Templates
  async getGoalTemplates(organizationId?: number, category?: string): Promise<GoalTemplate[]> {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId.toString());
    if (category) params.append('category', category);
    
    const response = await this.request<{ success: boolean; templates: GoalTemplate[] }>(`/goals/templates/all?${params.toString()}`);
    return response.templates;
  }

  async getGoalTemplate(templateId: number): Promise<GoalTemplate> {
    const response = await this.request<{ success: boolean; template: GoalTemplate }>(`/goals/templates/${templateId}`);
    return response.template;
  }

  async createGoalFromTemplate(
    templateId: number, 
    data: {
      title?: string;
      organizationId: number;
      projectId?: number;
      customDescription?: string;
      customTargetDate?: string;
    }
  ): Promise<Goal> {
    const response = await this.request<{ success: boolean; goal: Goal; templateUsed: string }>(`/goals/templates/${templateId}/create-goal`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.goal;
  }

  async createGoalTemplate(template: Partial<GoalTemplate>): Promise<GoalTemplate> {
    const response = await this.request<{ success: boolean; template: GoalTemplate }>('/goals/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
    return response.template;
  }

  async updateGoalTemplate(templateId: number, data: Partial<GoalTemplate>): Promise<GoalTemplate> {
    const response = await this.request<{ success: boolean; template: GoalTemplate }>(`/goals/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.template;
  }

  async deleteGoalTemplate(templateId: number): Promise<void> {
    await this.request<{ success: boolean }>(`/goals/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // ==================== GOAL-CYCLE INTEGRATION API (Task #267) ====================

  async linkCyclesToGoal(goalId: number, cycleIds: number[], contributionWeights?: number[]): Promise<{ success: boolean; links: any[]; message: string }> {
    return this.request<{ success: boolean; links: any[]; message: string }>(`/goals/${goalId}/link-cycles`, {
      method: 'POST',
      body: JSON.stringify({ cycleIds, contributionWeights }),
    });
  }

  async unlinkCyclesFromGoal(goalId: number, cycleIds: number[]): Promise<{ success: boolean; deletedCount: number; message: string }> {
    return this.request<{ success: boolean; deletedCount: number; message: string }>(`/goals/${goalId}/link-cycles`, {
      method: 'DELETE',
      body: JSON.stringify({ cycleIds }),
    });
  }

  async getGoalCycles(goalId: number): Promise<{ success: boolean; goalId: number; cycles: LinkedCycle[] }> {
    return this.request<{ success: boolean; goalId: number; cycles: LinkedCycle[] }>(`/goals/${goalId}/cycles`);
  }

  async getCycleGoals(cycleId: number): Promise<{ success: boolean; cycleId: number; goals: LinkedGoal[] }> {
    return this.request<{ success: boolean; cycleId: number; goals: LinkedGoal[] }>(`/api/teams/cycles/${cycleId}/goals`);
  }

  // ==================== WORKLOAD API ====================

  async getTeamWorkload(): Promise<TeamWorkloadResponse> {
    return this.request<TeamWorkloadResponse>('/api/workload');
  }

  async getWorkloadAlerts(): Promise<WorkloadAlertsResponse> {
    return this.request<WorkloadAlertsResponse>('/api/workload/alerts');
  }

  async updateWorkloadSettings(settings: Partial<WorkloadSettings>): Promise<{ success: boolean; settings: WorkloadSettings }> {
    return this.request<{ success: boolean; settings: WorkloadSettings }>('/api/workload/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async updateMemberCapacity(userId: number, data: {
    dailyCapacity?: number;
    isOutOfOffice?: boolean;
    outOfOfficeUntil?: string | null;
  }): Promise<{ success: boolean; member: { userId: number; username: string; email: string; dailyCapacity: number; isOutOfOffice: boolean } }> {
    return this.request<{ success: boolean; member: { userId: number; username: string; email: string; dailyCapacity: number; isOutOfOffice: boolean } }>(`/api/workload/members/${userId}/capacity`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async reassignTask(taskId: number, newAssigneeId: number | null): Promise<{ success: boolean; task: { id: number; title: string; newAssignee: string | null } }> {
    return this.request<{ success: boolean; task: { id: number; title: string; newAssignee: string | null } }>(`/api/workload/tasks/${taskId}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ newAssigneeId }),
    });
  }

  // ==================== USER NOTIFICATIONS API ====================

  async getUserNotifications(params?: { limit?: number; offset?: number; includeRead?: boolean }): Promise<{
    success: boolean;
    notifications: UserNotification[];
    pagination: { total: number; limit: number; offset: number; hasMore: boolean };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.includeRead) queryParams.append('includeRead', 'true');
    
    return this.request<{ success: boolean; notifications: UserNotification[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }>(
      `/api/user-notifications?${queryParams.toString()}`
    );
  }

  async getUnreadNotificationCount(): Promise<{ success: boolean; unreadCount: number }> {
    return this.request<{ success: boolean; unreadCount: number }>('/api/user-notifications/unread-count');
  }

  async markNotificationAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/user-notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/user-notifications/read-all', {
      method: 'PUT',
    });
  }

  async dismissNotification(notificationId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/user-notifications/${notificationId}/dismiss`, {
      method: 'PUT',
    });
  }

  async getNotificationSettings(): Promise<{ success: boolean; settings: NotificationSettings }> {
    return this.request<{ success: boolean; settings: NotificationSettings }>('/api/user-notifications/settings');
  }

  // ==================== GIT LINKS API ====================

  async getTaskGitLinks(taskId: number): Promise<{ success: boolean; data: GitLink[]; count: number }> {
    return this.request<{ success: boolean; data: GitLink[]; count: number }>(`/api/tasks/${taskId}/git-links`);
  }

  async getTaskCommits(taskId: number): Promise<{ success: boolean; data: GitLink[]; count: number }> {
    return this.request<{ success: boolean; data: GitLink[]; count: number }>(`/api/tasks/${taskId}/git-links/commits`);
  }

  async getTaskPullRequests(taskId: number): Promise<{ success: boolean; data: GitLink[]; count: number }> {
    return this.request<{ success: boolean; data: GitLink[]; count: number }>(`/api/tasks/${taskId}/git-links/pull-requests`);
  }

  // ==================== GIT REVIEW API ====================

  async getPRDiff(prId: number): Promise<{ success: boolean; diff: PRDiff }> {
    return this.request<{ success: boolean; diff: PRDiff }>(`/api/git/pull-requests/${prId}/diff`);
  }

  async getPRComments(prId: number): Promise<{ success: boolean; comments: PRComment[] }> {
    return this.request<{ success: boolean; comments: PRComment[] }>(`/api/git/pull-requests/${prId}/comments`);
  }

  async addPRComment(prId: number, comment: Omit<PRComment, 'id' | 'createdAt' | 'updatedAt' | 'author'>): Promise<{ success: boolean; comment: PRComment }> {
    return this.request<{ success: boolean; comment: PRComment }>(`/api/git/pull-requests/${prId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  async updatePRComment(commentId: number, text: string): Promise<{ success: boolean; comment: PRComment }> {
    return this.request<{ success: boolean; comment: PRComment }>(`/api/git/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
  }

  async deletePRComment(commentId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/git/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async resolvePRComment(commentId: number): Promise<{ success: boolean; comment: PRComment }> {
    return this.request<{ success: boolean; comment: PRComment }>(`/api/git/comments/${commentId}/resolve`, {
      method: 'POST',
    });
  }

  async requestPRReview(prId: number, requestedFromUserId: number, message?: string, dueDate?: string): Promise<{ success: boolean; request: PRReviewRequest }> {
    return this.request<{ success: boolean; request: PRReviewRequest }>(`/api/git/pull-requests/${prId}/request-review`, {
      method: 'POST',
      body: JSON.stringify({ requestedFromUserId, message, dueDate }),
    });
  }

  async getPRReviewRequests(prId: number): Promise<{ success: boolean; requests: PRReviewRequest[] }> {
    return this.request<{ success: boolean; requests: PRReviewRequest[] }>(`/api/git/pull-requests/${prId}/review-requests`);
  }

  async getPendingReviewRequests(): Promise<{ success: boolean; requests: PRReviewRequest[] }> {
    return this.request<{ success: boolean; requests: PRReviewRequest[] }>('/api/git/review-requests/pending');
  }

  async respondToReviewRequest(requestId: number, accept: boolean, message?: string): Promise<{ success: boolean; request: PRReviewRequest }> {
    return this.request<{ success: boolean; request: PRReviewRequest }>(`/api/git/review-requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ accept, message }),
    });
  }

  async startAIReview(prId: number, agentId?: number, options?: {
    checkSecurity?: boolean;
    checkPerformance?: boolean;
    checkBestPractices?: boolean;
  }): Promise<{ success: boolean; review: AIReviewResult }> {
    return this.request<{ success: boolean; review: AIReviewResult }>(`/api/git/pull-requests/${prId}/ai-review`, {
      method: 'POST',
      body: JSON.stringify({ agentId, options }),
    });
  }

  async getAIReviewResults(prId: number): Promise<{ success: boolean; reviews: AIReviewResult[] }> {
    return this.request<{ success: boolean; reviews: AIReviewResult[] }>(`/api/git/pull-requests/${prId}/ai-review`);
  }

  async getPRReviewSummary(prId: number): Promise<{ success: boolean; summary: PRReviewSummary }> {
    return this.request<{ success: boolean; summary: PRReviewSummary }>(`/api/git/pull-requests/${prId}/review-summary`);
  }

  // ==================== AUTOMATION API ====================

  async getAutomationRules(organizationId: number): Promise<{ success: boolean; data: AutomationRule[] }> {
    return this.request<{ success: boolean; data: AutomationRule[] }>(`/api/automation/rules?organizationId=${organizationId}`);
  }

  async getAutomationRule(ruleId: number, organizationId: number): Promise<{ success: boolean; data: AutomationRuleWithExecutions }> {
    return this.request<{ success: boolean; data: AutomationRuleWithExecutions }>(`/api/automation/rules/${ruleId}?organizationId=${organizationId}`);
  }

  async createAutomationRule(rule: CreateAutomationRuleRequest): Promise<{ success: boolean; data: AutomationRule }> {
    return this.request<{ success: boolean; data: AutomationRule }>('/api/automation/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async updateAutomationRule(ruleId: number, updates: Partial<AutomationRule>): Promise<{ success: boolean; data: AutomationRule }> {
    return this.request<{ success: boolean; data: AutomationRule }>(`/api/automation/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAutomationRule(ruleId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/automation/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async testAutomationRule(ruleId: number, testTaskId?: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/automation/rules/${ruleId}/test`, {
      method: 'POST',
      body: JSON.stringify({ testTaskId }),
    });
  }

  async getAutomationExecutions(params?: { organizationId?: number; ruleId?: number; limit?: number; offset?: number }): Promise<{
    success: boolean;
    data: AutomationExecution[];
    pagination: { total: number; limit: number; offset: number; hasMore: boolean };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.organizationId) queryParams.append('organizationId', params.organizationId.toString());
    if (params?.ruleId) queryParams.append('ruleId', params.ruleId.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<{ success: boolean; data: AutomationExecution[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }>(
      `/api/automation/executions?${queryParams.toString()}`
    );
  }

  async getAutomationTriggerTypes(): Promise<{ success: boolean; data: AutomationTriggerType[] }> {
    return this.request<{ success: boolean; data: AutomationTriggerType[] }>('/api/automation/triggers');
  }

  async getAutomationActionTypes(): Promise<{ success: boolean; data: AutomationActionType[] }> {
    return this.request<{ success: boolean; data: AutomationActionType[] }>('/api/automation/actions');
  }

  // ==================== TIME TRACKING API ====================

  async getTimeEstimate(taskId: number): Promise<{ taskId: number; estimate: TimeEstimate | null }> {
    return this.request<{ taskId: number; estimate: TimeEstimate | null }>(`/api/time-tracking/tasks/${taskId}/time-estimate`);
  }

  async setTimeEstimate(taskId: number, estimate: string): Promise<{ success: boolean; estimate: TimeEstimate }> {
    return this.request<{ success: boolean; estimate: TimeEstimate }>(`/api/time-tracking/tasks/${taskId}/time-estimate`, {
      method: 'POST',
      body: JSON.stringify({ estimate }),
    });
  }

  async deleteTimeEstimate(taskId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/time-tracking/tasks/${taskId}/time-estimate`, {
      method: 'DELETE',
    });
  }

  async getTimeLogs(taskId: number): Promise<TimeLogsResponse> {
    return this.request<TimeLogsResponse>(`/api/time-tracking/tasks/${taskId}/time-logs`);
  }

  async startTimer(taskId: number, description?: string): Promise<{ success: boolean; timeLog: TimeLog }> {
    return this.request<{ success: boolean; timeLog: TimeLog }>(`/api/time-tracking/tasks/${taskId}/time-logs/start`, {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  async stopTimer(logId: number): Promise<{ success: boolean; timeLog: TimeLog }> {
    return this.request<{ success: boolean; timeLog: TimeLog }>(`/api/time-tracking/time-logs/${logId}/stop`, {
      method: 'POST',
    });
  }

  async updateTimeLog(logId: number, updates: { description?: string; durationMinutes?: number }): Promise<{ success: boolean; timeLog: TimeLog }> {
    return this.request<{ success: boolean; timeLog: TimeLog }>(`/api/time-tracking/time-logs/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTimeLog(logId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/time-tracking/time-logs/${logId}`, {
      method: 'DELETE',
    });
  }

  async getMyTimeLogs(params?: { startDate?: string; endDate?: string; taskId?: number }): Promise<{
    logs: TimeLog[];
    summary: { totalMinutes: number; totalFormatted: string; count: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.taskId) queryParams.append('taskId', params.taskId.toString());

    return this.request<{
      logs: TimeLog[];
      summary: { totalMinutes: number; totalFormatted: string; count: number };
    }>(`/api/time-tracking/users/me/time-logs?${queryParams.toString()}`);
  }

  async getActiveTimer(): Promise<ActiveTimer> {
    return this.request<ActiveTimer>('/api/time-tracking/users/me/active-timer');
  }

  async getProjectTimeReport(projectId: number, params?: { startDate?: string; endDate?: string }): Promise<ProjectTimeReport> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.request<ProjectTimeReport>(`/api/time-tracking/projects/${projectId}/time-reports?${queryParams.toString()}`);
  }

  // ==================== ANALYTICS API ====================

  async getTeamVelocity(teamId: number, cycles?: number): Promise<TeamVelocityResponse> {
    const params = new URLSearchParams();
    if (cycles) params.append('cycles', cycles.toString());
    return this.request<TeamVelocityResponse>(`/api/analytics/teams/${teamId}/velocity?${params.toString()}`);
  }

  async getTeamCycleTime(teamId: number, periodDays?: number): Promise<TeamCycleTimeResponse> {
    const params = new URLSearchParams();
    if (periodDays) params.append('period', periodDays.toString());
    return this.request<TeamCycleTimeResponse>(`/api/analytics/teams/${teamId}/cycle-time?${params.toString()}`);
  }

  async getTeamThroughput(teamId: number, periodDays?: number, groupBy?: 'day' | 'week' | 'month'): Promise<TeamThroughputResponse> {
    const params = new URLSearchParams();
    if (periodDays) params.append('period', periodDays.toString());
    if (groupBy) params.append('groupBy', groupBy);
    return this.request<TeamThroughputResponse>(`/api/analytics/teams/${teamId}/throughput?${params.toString()}`);
  }

  async getTeamAnalyticsSummary(teamId: number): Promise<TeamAnalyticsSummaryResponse> {
    return this.request<TeamAnalyticsSummaryResponse>(`/api/analytics/teams/${teamId}/summary`);
  }

  // ==================== TIMELINE API ====================

  async getTimeline(params?: {
    limit?: number;
    offset?: number;
    eventTypes?: TimelineEventType[];
    categories?: TimelineEventCategory[];
    taskId?: number;
    projectId?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    success: boolean;
    events: TimelineEvent[];
    pagination: { total: number; limit: number; offset: number; hasMore: boolean };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.taskId !== undefined) queryParams.append('taskId', params.taskId.toString());
    if (params?.projectId !== undefined) queryParams.append('projectId', params.projectId.toString());
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.eventTypes) {
      params.eventTypes.forEach(eventType => queryParams.append('eventTypes', eventType));
    }
    if (params?.categories) {
      params.categories.forEach(category => queryParams.append('categories', category));
    }

    const queryString = queryParams.toString();
    return this.request(`/api/timeline${queryString ? `?${queryString}` : ''}`);
  }

  async getTaskTimeline(taskId: number, params?: { limit?: number; offset?: number }): Promise<{
    success: boolean;
    events: TimelineEvent[];
    pagination: { total: number; limit: number; offset: number; hasMore: boolean };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    return this.request(`/api/timeline/task/${taskId}${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== ROADMAP API ====================

  async getRoadmapData(organizationId?: number): Promise<{
    projects: RoadmapProject[];
    milestones: Milestone[];
    dependencies: ProjectDependency[];
  }> {
    const queryParams = new URLSearchParams();
    if (organizationId) queryParams.append('organizationId', organizationId.toString());
    const queryString = queryParams.toString();
    return this.request(`/api/roadmap${queryString ? `?${queryString}` : ''}`);
  }

  async getMilestones(projectId?: number, organizationId?: number): Promise<Milestone[]> {
    const queryParams = new URLSearchParams();
    if (organizationId) queryParams.append('organizationId', organizationId.toString());
    if (projectId) queryParams.append('projectId', projectId.toString());
    const queryString = queryParams.toString();
    return this.request(`/api/roadmap/milestones${queryString ? `?${queryString}` : ''}`);
  }

  async createMilestone(data: CreateMilestoneRequest): Promise<Milestone> {
    return this.request('/api/roadmap/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMilestone(milestoneId: number, data: Partial<CreateMilestoneRequest>): Promise<Milestone> {
    return this.request(`/api/roadmap/milestones/${milestoneId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMilestone(milestoneId: number): Promise<{ success: boolean }> {
    return this.request(`/api/roadmap/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  }

  async getProjectDependencies(projectId?: number, organizationId?: number): Promise<ProjectDependency[]> {
    const queryParams = new URLSearchParams();
    if (organizationId) queryParams.append('organizationId', organizationId.toString());
    if (projectId) queryParams.append('projectId', projectId.toString());
    const queryString = queryParams.toString();
    return this.request(`/api/roadmap/dependencies${queryString ? `?${queryString}` : ''}`);
  }

  async createProjectDependency(data: CreateDependencyRequest): Promise<ProjectDependency> {
    return this.request('/api/roadmap/dependencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProjectDependency(dependencyId: number): Promise<{ success: boolean }> {
    return this.request(`/api/roadmap/dependencies/${dependencyId}`, {
      method: 'DELETE',
    });
  }

  // ==================== BULK OPERATIONS ====================

  async bulkUpdateTasks(taskIds: number[], updates: Partial<Task>): Promise<{ success: boolean; updatedCount: number }> {
    // Validate for zero-width characters if title or description is being updated
    if (updates.title !== undefined || updates.description !== undefined) {
      const { isValid, error } = validateTaskContent(updates.title, updates.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    return this.request<{ success: boolean; updatedCount: number }>('/tasks/bulk/update', {
      method: 'PATCH',
      body: JSON.stringify({ taskIds, updates }),
    });
  }

  // ==================== FORM TEMPLATES API ====================

  async getFormTemplates(organizationId: number, includeSystem = true, isActive?: boolean): Promise<{ templates: FormTemplate[] }> {
    const params = new URLSearchParams();
    params.append('includeSystem', includeSystem.toString());
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    return this.request<{ templates: FormTemplate[] }>(`/api/organizations/${organizationId}/form-templates?${params.toString()}`);
  }

  async getFormTemplate(templateId: number): Promise<{ template: FormTemplate }> {
    return this.request<{ template: FormTemplate }>(`/api/form-templates/${templateId}`);
  }

  async createFormTemplate(organizationId: number, data: CreateFormTemplateRequest): Promise<{ template: FormTemplate }> {
    return this.request<{ template: FormTemplate }>(`/api/organizations/${organizationId}/form-templates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFormTemplate(templateId: number, data: UpdateFormTemplateRequest): Promise<{ template: FormTemplate }> {
    return this.request<{ template: FormTemplate }>(`/api/form-templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFormTemplate(templateId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/form-templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  async assignTemplateToProjects(templateId: number, projectIds: number[]): Promise<{ assignments: FormTemplateProjectAssignment[] }> {
    return this.request<{ assignments: FormTemplateProjectAssignment[] }>(`/api/form-templates/${templateId}/assign-projects`, {
      method: 'POST',
      body: JSON.stringify({ projectIds }),
    });
  }

  async applyTemplate(templateId: number, data: ApplyTemplateRequest): Promise<{ task: Task }> {
    const response = await this.request<{ task: Task }>(`/api/form-templates/${templateId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      ...response,
      task: mapTaskPriorityFromApi(response.task),
    };
  }

  // Form Fields
  async createFormField(templateId: number, data: CreateFormFieldRequest): Promise<{ field: FormField }> {
    return this.request<{ field: FormField }>(`/api/form-templates/${templateId}/fields`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFormField(fieldId: number, data: UpdateFormFieldRequest): Promise<{ field: FormField }> {
    return this.request<{ field: FormField }>(`/api/form-fields/${fieldId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFormField(fieldId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/form-fields/${fieldId}`, {
      method: 'DELETE',
    });
  }

  async reorderFormFields(templateId: number, fieldOrders: { id: number; order: number }[]): Promise<{ fields: FormField[] }> {
    return this.request<{ fields: FormField[] }>(`/api/form-templates/${templateId}/fields/reorder`, {
      method: 'POST',
      body: JSON.stringify({ fieldOrders }),
    });
  }

  // Task Custom Field Values
  async getTaskCustomFieldValues(taskId: number): Promise<{ values: TaskCustomFieldValue[] }> {
    return this.request<{ values: TaskCustomFieldValue[] }>(`/api/tasks/${taskId}/custom-fields`);
  }

  async updateTaskCustomFieldValues(taskId: number, customFields: Record<string, any>): Promise<{ values: TaskCustomFieldValue[] }> {
    return this.request<{ values: TaskCustomFieldValue[] }>(`/api/tasks/${taskId}/custom-fields`, {
      method: 'PATCH',
      body: JSON.stringify({ customFields }),
    });
  }

  // ==================== ADVANCED FILTER METHODS ====================

  /**
   * Apply advanced filters with AND/OR logic to tasks
   * POST /api/tasks/advanced-filter
   */
  async applyAdvancedFilter(request: ApplyAdvancedFilterRequest): Promise<ApplyAdvancedFilterResponse> {
    return this.request<ApplyAdvancedFilterResponse>('/api/tasks/advanced-filter', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Validate an advanced filter structure without executing it
   * POST /api/tasks/advanced-filter/validate
   */
  async validateAdvancedFilter(filter: AdvancedTaskFilter): Promise<ValidateFilterResponse> {
    return this.request<ValidateFilterResponse>('/api/tasks/advanced-filter/validate', {
      method: 'POST',
      body: JSON.stringify({ filter }),
    });
  }

  /**
   * Convert a legacy simple filter to advanced filter format
   * POST /api/tasks/advanced-filter/convert
   */
  async convertLegacyFilter(legacyFilter: Record<string, unknown>): Promise<ConvertFilterResponse> {
    return this.request<ConvertFilterResponse>('/api/tasks/advanced-filter/convert', {
      method: 'POST',
      body: JSON.stringify({ legacyFilter }),
    });
  }

  /**
   * Get metadata for building filters (available fields, operators, etc.)
   * GET /api/tasks/filter-metadata
   */
  async getFilterMetadata(): Promise<{ success: boolean; metadata: FilterMetadata }> {
    return this.request<{ success: boolean; metadata: FilterMetadata }>('/api/tasks/filter-metadata');
  }

  /**
   * Apply a saved view's filters to get matching tasks
   * POST /api/saved-views/:viewId/apply
   */
  async applySavedView(
    viewId: number,
    options?: ApplyAdvancedFilterRequest['options']
  ): Promise<ApplySavedViewResponse> {
    return this.request<ApplySavedViewResponse>(`/api/saved-views/${viewId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ options }),
    });
  }

  // ==================== VIEW SUBSCRIPTION METHODS ====================

  /**
   * Subscribe to a saved view
   * POST /api/views/:viewId/subscribe
   */
  async subscribeToView(
    viewId: number,
    config?: Partial<ViewSubscriptionConfig>
  ): Promise<SubscribeToViewResponse> {
    return this.request<SubscribeToViewResponse>(`/api/views/${viewId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify(config || {}),
    });
  }

  /**
   * Unsubscribe from a saved view
   * DELETE /api/views/:viewId/unsubscribe
   */
  async unsubscribeFromView(viewId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/views/${viewId}/unsubscribe`, {
      method: 'DELETE',
    });
  }

  /**
   * Get current user's view subscriptions
   * GET /api/views/subscriptions
   */
  async getMySubscriptions(): Promise<GetSubscriptionsResponse> {
    return this.request<GetSubscriptionsResponse>('/api/views/subscriptions');
  }

  /**
   * Update subscription settings
   * PUT /api/subscriptions/:subscriptionId
   */
  async updateSubscriptionSettings(
    subscriptionId: number,
    updates: Partial<ViewSubscriptionConfig> & { isActive?: boolean }
  ): Promise<UpdateSubscriptionResponse> {
    return this.request<UpdateSubscriptionResponse>(`/api/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Check if user is subscribed to a view
   * GET /api/views/:viewId/subscription-status
   */
  async getSubscriptionStatus(viewId: number): Promise<SubscriptionStatusResponse> {
    return this.request<SubscriptionStatusResponse>(`/api/views/${viewId}/subscription-status`);
  }

  /**
   * Get view subscribers (view owner only)
   * GET /api/views/:viewId/subscribers
   */
  async getViewSubscribers(viewId: number): Promise<GetViewSubscribersResponse> {
    return this.request<GetViewSubscribersResponse>(`/api/views/${viewId}/subscribers`);
  }

  // ==================== NESTED SUB-ISSUES API ====================

  /**
   * Get all sub-issues for a task
   * GET /api/tasks/:taskId/sub-issues
   */
  async getSubIssues(taskId: number): Promise<SubIssuesResponse> {
    return this.request<SubIssuesResponse>(`/api/tasks/${taskId}/sub-issues`);
  }

  /**
   * Create a new sub-issue for a task
   * POST /api/tasks/:taskId/sub-issues
   */
  async createSubIssue(taskId: number, data: Partial<Task>): Promise<{ message: string; subIssue: Task }> {
    return this.request<{ message: string; subIssue: Task }>(`/api/tasks/${taskId}/sub-issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Move a task to a new parent (or make it top-level)
   * PUT /api/tasks/:taskId/move
   */
  async moveTask(taskId: number, parentId: number | null, displayOrder?: number): Promise<{ message: string; task: Task }> {
    return this.request<{ message: string; task: Task }>(`/api/tasks/${taskId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ parentId, displayOrder }),
    });
  }

  /**
   * Reorder sub-issues (drag and drop)
   * POST /api/tasks/reorder
   */
  async reorderSubIssues(reorderings: { taskId: number; displayOrder: number }[]): Promise<{ message: string; count: number }> {
    return this.request<{ message: string; count: number }>('/api/tasks/reorder', {
      method: 'POST',
      body: JSON.stringify({ reorderings }),
    });
  }

  /**
   * Get breadcrumb path from root to task
   * GET /api/tasks/:taskId/breadcrumb
   */
  async getTaskBreadcrumb(taskId: number): Promise<TaskBreadcrumbResponse> {
    return this.request<TaskBreadcrumbResponse>(`/api/tasks/${taskId}/breadcrumb`);
  }

  /**
   * Convert a sub-issue to a top-level task
   * POST /api/tasks/:taskId/convert-to-top-level
   */
  async convertToTopLevel(taskId: number): Promise<{ message: string; taskId: number }> {
    return this.request<{ message: string; taskId: number }>(`/api/tasks/${taskId}/convert-to-top-level`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();

// ==================== GOAL TYPES ====================

export interface Goal {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  progress: number;
  calculatedProgress?: number; // Computed on backend to handle division by zero for goals with no linked tasks
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  organizationId: number;
  projectId?: number;
  parentGoalId?: number | null; // Parent goal for hierarchy (null = top-level)
  templateId?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // Permission fields (Task #264)
  goalType: 'company' | 'team' | 'individual';
  visibility: 'public' | 'team' | 'private';
  teamId?: number;
  team?: {
    id: number;
    teamName: string;
  };
  project?: {
    id: number;
    name: string;
  };
  creator?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  parentGoal?: {
    id: number;
    title: string;
  } | null;
  childGoals?: {
    id: number;
    title: string;
    status: string;
    progress: number;
  }[];
  template?: {
    id: number;
    name: string;
  };
  _count?: {
    linkedTasks: number;
    childGoals: number;
  };
  // Goal-Cycle Integration (Task #267)
  linkedCycles?: {
    cycle: {
      id: number;
      name: string;
      status: string;
      startDate: string;
      endDate: string;
    };
    contributionWeight: number;
  }[];
}

export interface GoalTemplate {
  id: number;
  name: string;
  description?: string;
  category: 'general' | 'sprint' | 'quarterly' | 'project' | 'personal';
  defaultTitle?: string;
  defaultDescription?: string;
  defaultPriority: 'urgent' | 'high' | 'medium' | 'low';
  defaultDurationDays?: number;
  taskTemplates?: Array<{
    title: string;
    description?: string;
    priority: string;
    estimatedHours?: number;
  }>;
  isSystem: boolean;
  isActive: boolean;
  organizationId?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== GOAL-CYCLE INTEGRATION TYPES (Task #267) ====================

export interface LinkedCycle {
  id: number;
  name: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  contributionWeight: number;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface LinkedGoal {
  id: number;
  title: string;
  status: 'active' | 'completed' | 'archived';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  progress: number;
  targetDate?: string;
  goalType: 'company' | 'team' | 'individual';
  visibility: 'public' | 'team' | 'private';
  contributionWeight: number;
}

// ==================== WORKLOAD TYPES ====================

export interface WorkloadSettings {
  capacityMetric: 'task_count' | 'time_estimate' | 'story_points';
  defaultCapacity: number;
  warningThreshold: number;
  dangerThreshold: number;
  showUnassigned: boolean;
  showOutOfOffice: boolean;
}

export interface WorkloadTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  projectName?: string;
  dueDate?: string;
}

export interface WorkloadMember {
  memberId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  role: string;
  capacity: number;
  currentLoad: number;
  capacityPercent: number;
  status: 'green' | 'yellow' | 'red';
  isOutOfOffice: boolean;
  outOfOfficeUntil?: string;
  hasConflict: boolean;
  tasks: WorkloadTask[];
}

export interface WorkloadAlert {
  type: 'overloaded' | 'warning' | 'out_of_office_conflict' | 'unassigned';
  severity: 'danger' | 'warning' | 'info';
  message: string;
  userId?: number;
  username?: string;
  currentLoad?: number;
  capacity?: number;
  outOfOfficeUntil?: string;
  count?: number;
}

export interface TeamWorkloadResponse {
  success: boolean;
  settings: WorkloadSettings;
  members: WorkloadMember[];
  unassigned: {
    count: number;
    tasks: WorkloadTask[];
  };
  summary: {
    totalMembers: number;
    overloadedMembers: number;
    warningMembers: number;
    outOfOfficeMembers: number;
    unassignedTasks: number;
    conflicts: number;
  };
}

export interface WorkloadAlertsResponse {
  success: boolean;
  alerts: WorkloadAlert[];
  summary: {
    dangerCount: number;
    warningCount: number;
    infoCount: number;
  };
}

// ==================== USER NOTIFICATIONS TYPES ====================

export interface UserNotification {
  id: number;
  userId: number;
  organizationId: number;
  type: 'workload_overload' | 'workload_warning' | 'out_of_office_conflict' | 'task_reassigned' | 'task_assigned' | 'unassigned_tasks' | 'cycle_deadline' | string;
  title: string;
  message: string;
  taskId?: number;
  triggeredByUserId?: number;
  read: boolean;
  readAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  delivered: boolean;
  deliveredAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  task?: {
    id: number;
    title: string;
    status: string | null;
    priority: string | null;
  };
  triggeredBy?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  workloadAlerts: boolean;
  taskAssignmentAlerts: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
}

// ==================== CYCLE TYPES ====================

export type CycleStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Cycle {
  id: number;
  teamId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  cooldownEnabled: boolean;
  autoCreated?: boolean;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

export interface CycleWithDetails extends Cycle {
  tasks: {
    id: number;
    title: string;
    status: string;
    priority: string;
    assignedUserId?: number;
    points?: number;
  }[];
  team: {
    id: number;
    teamName: string;
    cyclesEnabled: boolean;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    totalPoints: number;
  };
}

export interface CycleSettings {
  cyclesEnabled: boolean;
  cycleDurationWeeks: number;
  cycleStartDay: string;
  cooldownDays: number;
  upcomingCyclesCount: number;
}

export interface OverlappingCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface CycleOverlapError {
  message: string;
  overlappingCycles: OverlappingCycle[];
}

// ==================== GIT LINK TYPES ====================

export interface GitLink {
  id: number;
  taskId: number;
  type: 'commit' | 'pull_request';
  ref: string;
  title: string;
  message?: string;
  url: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  repository: string;
  branch?: string;
  prNumber?: number;
  prState?: string;
  prMergedAt?: string;
  integrationConfigId?: number;
  gitCreatedAt: string;
  createdAt: string;
}

// ==================== GIT REVIEW TYPES ====================

export interface PRDiffFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied';
  additions: number;
  deletions: number;
  changes: number;
  previousFilename?: string;
  patch?: string;
  content?: string;
}

export interface PRDiff {
  files: PRDiffFile[];
  stats: {
    totalAdditions: number;
    totalDeletions: number;
    totalChanges: number;
    fileCount: number;
  };
}

export interface PRComment {
  id: number;
  prId: number;
  filePath: string;
  lineNumber: number;
  commitId?: string;
  text: string;
  author: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  replyToId?: number;
  replies?: PRComment[];
}

export interface PRReviewRequest {
  id: number;
  taskId: number;
  prId: number;
  requestedBy: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  requestedFrom: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message?: string;
  dueDate?: string;
}

export interface AIReviewFinding {
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  filePath?: string;
  lineNumber?: number;
  message: string;
  suggestion?: string;
}

export interface AIReviewResult {
  id: number;
  prId: number;
  agentId: number;
  agentName: string;
  status: 'running' | 'completed' | 'failed';
  summary: string;
  findings: AIReviewFinding[];
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface PRReviewSummary {
  prId: number;
  reviewState: {
    status: 'pending' | 'reviewing' | 'approved' | 'changes_requested' | 'merged';
    notes: string;
    checklist: Array<{ id: string; label: string; checked: boolean }>;
    reviewedAt?: string;
  } | null;
  commentCount: number;
  unresolvedComments: number;
  hasDiffView: boolean;
  aiReviewStatus?: 'pending' | 'running' | 'completed' | 'failed';
  lastUpdatedAt: string;
}

// ==================== ASANA INTEGRATION TYPES ====================

export interface AsanaLink {
  id: number;
  taskId: number;
  asanaTaskId: string;
  asanaTaskName: string;
  asanaProjectId?: string;
  asanaProjectName?: string;
  asanaWorkspaceId?: string;
  asanaWorkspaceName?: string;
  asanaPermalink?: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  syncDirection: 'to_asana' | 'from_asana' | 'bidirectional';
  integrationConfigId?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== TIME TRACKING TYPES ====================

export interface TimeLog {
  id: number;
  taskId: number;
  userId: number;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  durationFormatted?: string;
  description?: string;
  isRunning: boolean;
  source?: string;
  createdAt: string;
  user?: {
    userId: number;
    username: string;
    email?: string;
    profilePictureUrl?: string;
  };
  task?: {
    id: number;
    title: string;
    projectId: number;
    project?: { name: string };
  };
}

export interface TimeEstimate {
  id: number;
  taskId: number;
  estimatedMinutes: number;
  estimatedFormatted: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
}

export interface ActiveTimer {
  hasActiveTimer: boolean;
  timer?: {
    id: number;
    taskId: number;
    task?: {
      id: number;
      title: string;
      projectId: number;
      project?: { name: string };
    };
    startedAt: string;
    elapsedMinutes: number;
    elapsedFormatted: string;
    description?: string;
  };
}

export interface TimeLogsResponse {
  taskId: number;
  logs: TimeLog[];
  summary: {
    totalMinutes: number;
    totalFormatted: string;
    count: number;
  };
}

export interface ProjectTimeReport {
  projectId: number;
  dateRange: { startDate?: string; endDate?: string };
  summary: {
    totalMinutes: number;
    totalFormatted: string;
    logCount: number;
  };
  byUser: Array<{
    user: { userId: number; username: string; profilePictureUrl?: string };
    totalMinutes: number;
    totalFormatted: string;
    logCount: number;
  }>;
  byTask: Array<{
    task: { id: number; title: string; status: string };
    totalMinutes: number;
    totalFormatted: string;
    logCount: number;
  }>;
  logs: TimeLog[];
}

// ==================== AUTOMATION TYPES ====================

export interface AutomationTriggerType {
  type: string;
  name: string;
  description: string;
}

export interface AutomationActionType {
  type: string;
  name: string;
  description: string;
}

export interface TriggerConfig {
  projectId?: number;
  statusFrom?: string;
  statusTo?: string;
  priority?: string;
  assignedToUserId?: number;
  assignedToAgentId?: number;
  dueDateHours?: number;
}

export interface ActionConfig {
  // For notification.send
  message?: string;
  recipientAgentIds?: number[];
  notifyAssigneeAgent?: boolean;
  notifyAuthorAgent?: boolean;
  
  // For webhook.call
  webhookUrl?: string;
  headers?: Record<string, string>;
  
  // For task.status.update
  newStatus?: string;
  
  // For task.assign
  assignToAgentId?: number;
  
  // For task.comment.add
  commentText?: string;
  commentAsAgentId?: number;
  
  // For integration.send
  integrationConfigId?: number;
}

export interface AutomationRule {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: TriggerConfig;
  actionType: string;
  actionConfig: ActionConfig;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  errorCount: number;
  lastError?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRuleWithExecutions extends AutomationRule {
  executions: AutomationExecutionSummary[];
}

export interface AutomationExecutionSummary {
  id: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  durationMs?: number;
}

export interface AutomationExecution {
  id: number;
  ruleId: number;
  taskId?: number;
  triggerEvent: string;
  triggerPayload: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: Record<string, any>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  rule: {
    name: string;
    triggerType: string;
    actionType: string;
  };
}

export interface CreateAutomationRuleRequest {
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: TriggerConfig;
  actionType: string;
  actionConfig: ActionConfig;
  organizationId: number;
}

// ==================== TIMELINE TYPES ====================

export type TimelineEventType = 
  | 'task_assigned'
  | 'task_started'
  | 'task_completed'
  | 'status_changed'
  | 'commit_pushed'
  | 'pr_opened'
  | 'pr_merged'
  | 'pr_closed'
  | 'build_started'
  | 'build_completed'
  | 'deploy_started'
  | 'deploy_completed'
  | 'comment_added'
  | 'agent_handoff';

export type TimelineEventCategory = 'task' | 'git' | 'deployment' | 'ci' | 'system';

export type ActorType = 'agent' | 'user' | 'system' | 'git';

export interface TimelineEvent {
  id: number;
  organizationId: number;
  taskId?: number;
  projectId?: number;
  eventType: TimelineEventType;
  eventCategory: TimelineEventCategory;
  actorType: ActorType;
  actorId?: number;
  actorName: string;
  actorAvatar?: string;
  title: string;
  description?: string;
  taskLink?: string;
  prLink?: string;
  commitLink?: string;
  deploymentLink?: string;
  commitSha?: string;
  prNumber?: number;
  branchName?: string;
  status?: 'success' | 'failure' | 'pending' | 'in_progress';
  metadata: Record<string, any>;
  occurredAt: string;
  createdAt: string;
}

export interface TimelineStats {
  totalEvents: number;
  eventsByCategory: Record<TimelineEventCategory, number>;
  eventsByType: Record<string, number>;
  topActors: { actorName: string; count: number }[];
}

// ==================== ROADMAP TYPES ====================

export interface RoadmapProject {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  healthStatus: 'on_track' | 'at_risk' | 'delayed' | 'unknown';
  healthReason?: string;
  taskStats: {
    total: number;
    completed: number;
  };
  milestones: Milestone[];
  dependsOn: ProjectDependency[];
}

export interface Milestone {
  id: number;
  organizationId: number;
  projectId?: number;
  project?: {
    id: number;
    name: string;
  };
  name: string;
  description?: string;
  targetDate: string;
  completedAt?: string;
  status: 'upcoming' | 'at_risk' | 'missed' | 'completed';
  healthStatus: 'on_track' | 'at_risk' | 'delayed';
  healthReason?: string;
  autoCalculate: boolean;
  progress: number;
  linkedTaskCount: number;
  completedTaskCount: number;
  linkedTasks?: {
    id: number;
    title: string;
    status: string;
  }[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDependency {
  id: number;
  dependentProjectId: number;
  dependentProject?: {
    id: number;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  dependencyProjectId: number;
  dependencyProject?: {
    id: number;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  organizationId: number;
  projectId?: number;
  name: string;
  description?: string;
  targetDate: string;
  autoCalculate?: boolean;
}

export interface CreateDependencyRequest {
  dependentProjectId: number;
  dependencyProjectId: number;
  dependencyType?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays?: number;
}

// ==================== FORM TEMPLATE TYPES ====================

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'url'
  | 'email';

export interface FormFieldOption {
  id?: number;
  label: string;
  value: string;
  color?: string;
  order?: number;
}

export interface FormField {
  id: number;
  templateId: number;
  name: string;
  key: string;
  fieldType: FormFieldType;
  description?: string;
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  placeholder?: string;
  helpText?: string;
  order: number;
  defaultValue?: any;
  options: FormFieldOption[];
  createdAt: string;
  updatedAt: string;
}

export interface FormTemplateProjectAssignment {
  id: number;
  templateId: number;
  projectId: number;
  createdAt: string;
  project?: {
    id: number;
    name: string;
  };
}

export interface FormTemplate {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  isActive: boolean;
  isSystem: boolean;
  defaultStatus?: string;
  defaultPriority: string;
  defaultAssigneeId?: number;
  fields: FormField[];
  projectAssignments: FormTemplateProjectAssignment[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
}

export interface TaskCustomFieldValue {
  id: number;
  taskId: number;
  fieldId: number;
  value: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormTemplateRequest {
  name: string;
  description?: string;
  defaultStatus?: string;
  defaultPriority?: string;
  defaultAssigneeId?: number;
  isActive?: boolean;
  fields?: CreateFormFieldRequest[];
  projectIds?: number[];
}

export interface CreateFormFieldRequest {
  name: string;
  key?: string;
  fieldType: FormFieldType;
  description?: string;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  placeholder?: string;
  helpText?: string;
  order?: number;
  defaultValue?: any;
  options?: FormFieldOption[];
}

export interface UpdateFormTemplateRequest {
  name?: string;
  description?: string;
  defaultStatus?: string;
  defaultPriority?: string;
  defaultAssigneeId?: number;
  isActive?: boolean;
}

export interface UpdateFormFieldRequest {
  name?: string;
  key?: string;
  description?: string;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  placeholder?: string;
  helpText?: string;
  order?: number;
  defaultValue?: any;
  options?: FormFieldOption[];
}

export interface ApplyTemplateRequest {
  projectId: number;
  organizationId: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: number;
  dueDate?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

// ==================== VIEW SUBSCRIPTION TYPES ====================

export interface ViewSubscriptionConfig {
  notifyOnCreate: boolean;
  notifyOnUpdate: boolean;
  notifyOnAssign: boolean;
  notifyOnStatusChange: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  digestFrequency: 'immediate' | 'hourly' | 'daily';
}

export interface ViewSubscription {
  id: number;
  viewId: number;
  userId: number;
  organizationId: number;
  notifyOnCreate: boolean;
  notifyOnUpdate: boolean;
  notifyOnAssign: boolean;
  notifyOnStatusChange: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  digestFrequency: string;
  lastDigestSentAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  view?: {
    id: number;
    name: string;
    projectId?: number;
    isShared: boolean;
  };
}

export interface SubscribeToViewResponse {
  success: boolean;
  subscription: ViewSubscription;
  message: string;
}

export interface GetSubscriptionsResponse {
  success: boolean;
  subscriptions: ViewSubscription[];
  count: number;
}

export interface UpdateSubscriptionResponse {
  success: boolean;
  subscription: ViewSubscription;
  message: string;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  isSubscribed: boolean;
  subscription: ViewSubscription | null;
}

export interface ViewSubscriber {
  subscriptionId: number;
  userId: number;
  username: string;
  email: string;
  notifyOnCreate: boolean;
  notifyOnUpdate: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  isActive: boolean;
  subscribedAt: string;
}

export interface GetViewSubscribersResponse {
  success: boolean;
  subscriptions: ViewSubscriber[];
  count: number;
}
