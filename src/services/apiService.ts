import { validateTaskContent, validateProjectContent, validateCommentContent, validateGoalContent, validateStatusContent, validateNoZeroWidthChars } from '../lib/validation';

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
  filters: {
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
  archivedAt?: string;
  triaged?: boolean;
  createdAt?: string;

  author?: User;
  assignee?: User;
  project?: {
    id: number;
    name: string;
  };
  comments?: Comment[];
  attachments?: Attachment[];
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
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  // Import validation functions from validation.ts to avoid code duplication
  private validateTaskContent = validateTaskContent;
  private validateProjectContent = validateProjectContent;
  private validateCommentContent = validateCommentContent;
  private validateGoalContent = validateGoalContent;
  private validateStatusContent = validateStatusContent;
  private validateNoZeroWidthChars = validateNoZeroWidthChars;

  private async getAuthHeaders(): Promise<Record<string, string>> {
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
    const url = `${this.baseUrl}${endpoint}`;

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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle authentication failures
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        
        // Try to parse error message from response body
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData && errorData.error) {
            errorMessage = errorData.error;
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
    const url = `${this.baseUrl}${endpoint}`;
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

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData && errorData.error) {
          errorMessage = errorData.error;
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
    if (project.name) {
      const { isValid, error } = this.validateProjectContent(project.name, project.description);
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
      const { isValid, error } = this.validateProjectContent(project.name, project.description);
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
    const { isValid, error } = this.validateStatusContent(data.name);
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
      const { isValid, error } = this.validateStatusContent(data.name);
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
    return this.request<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(taskId: number): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}`);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/user/${userId}`);
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    // Validate for zero-width characters to prevent visual spoofing
    if (task.title) {
      const { isValid, error } = this.validateTaskContent(task.title, task.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(taskId: number, task: Partial<Task>): Promise<Task> {
    // Validate for zero-width characters if title or description is being updated
    if (task.title !== undefined || task.description !== undefined) {
      const { isValid, error } = this.validateTaskContent(task.title, task.description);
      if (!isValid) {
        throw new Error(error);
      }
    }

    return this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(taskId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async updateTaskStatus(taskId: number, status: string): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
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
    return this.request<{ message: string; task: Task }>(`/tasks/${taskId}/archive`, {
      method: 'PATCH',
    });
  }

  async unarchiveTask(taskId: number): Promise<{ message: string; task: Task }> {
    return this.request<{ message: string; task: Task }>(`/tasks/${taskId}/unarchive`, {
      method: 'PATCH',
    });
  }

  // Comments
  async getTaskComments(taskId: number): Promise<Comment[]> {
    return this.request<Comment[]>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: number, text: string, userId: number, imageUrl?: string): Promise<Comment> {
    // Validate for zero-width characters in comment text
    const { isValid, error } = this.validateCommentContent(text);
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
    const { isValid, error } = this.validateCommentContent(text);
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
    const url = `${this.baseUrl}/tasks/${taskId}/attachments`;
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

  // AI Task Parsing
  async parseTaskWithAI(text: string, teamMembers: string[]): Promise<AIParseTaskResponse> {
    return this.request<AIParseTaskResponse>('/api/ai/parse-task', {
      method: 'POST',
      body: JSON.stringify({ text, teamMembers }),
    });
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
  }): Promise<{
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
    return this.request('/api/ai/suggest-due-date', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // AI Natural Language Filter
  async parseSearchFilterWithAI(
    text: string,
    availableProjects?: string[],
    availableLabels?: string[],
    teamMembers?: string[]
  ): Promise<AIParseSearchFilterResponse> {
    return this.request<AIParseSearchFilterResponse>('/api/ai/parse-search-filter', {
      method: 'POST',
      body: JSON.stringify({
        text,
        availableProjects,
        availableLabels,
        teamMembers,
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
      const { isValid, error } = this.validateGoalContent(goal.title, goal.description);
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
      const { isValid, error } = this.validateGoalContent(data.title, data.description);
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

  async updateAutomationRule(ruleId: number, updates: Partial<CreateAutomationRuleRequest>): Promise<{ success: boolean; data: AutomationRule }> {
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

  // ==================== BULK OPERATIONS ====================

  async bulkUpdateTasks(taskIds: number[], updates: Partial<Task>): Promise<{ success: boolean; updatedCount: number }> {
    // Validate for zero-width characters if title or description is being updated
    if (updates.title !== undefined || updates.description !== undefined) {
      const { isValid, error } = this.validateTaskContent(updates.title, updates.description);
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
    return this.request<{ task: Task }>(`/api/form-templates/${templateId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  async getMyTimeLogs(startDate?: string, endDate?: string, taskId?: number): Promise<{ logs: TimeLog[]; summary: { totalMinutes: number; totalFormatted: string; count: number } }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (taskId) params.append('taskId', taskId.toString());
    return this.request<{ logs: TimeLog[]; summary: { totalMinutes: number; totalFormatted: string; count: number } }>(`/api/time-tracking/users/me/time-logs?${params.toString()}`);
  }

  async getActiveTimer(): Promise<ActiveTimer> {
    return this.request<ActiveTimer>('/api/time-tracking/users/me/active-timer');
  }

  async getProjectTimeReport(projectId: number, startDate?: string, endDate?: string): Promise<ProjectTimeReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request<ProjectTimeReport>(`/api/time-tracking/projects/${projectId}/time-reports?${params.toString()}`);
  }

  async exportProjectTimeReport(projectId: number, startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await fetch(`${this.baseUrl}/api/time-tracking/projects/${projectId}/time-reports/export?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to export time report');
    return response.blob();
  }

}

export const apiService = new ApiService();
