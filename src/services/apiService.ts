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

  author?: User;
  assignee?: User;
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
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
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

// API Service class
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get Cognito access token and ID token if available
    let authHeader: Record<string, string> = {};
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();

      if (session?.tokens?.accessToken) {
        authHeader['Authorization'] = `Bearer ${session.tokens.accessToken}`;
        console.log('[API SERVICE] Added Authorization header with Cognito access token');
      }

      // Also send ID token which contains email and other user attributes
      if (session?.tokens?.idToken) {
        authHeader['X-ID-Token'] = `${session.tokens.idToken}`;
        console.log('[API SERVICE] Added X-ID-Token header with Cognito ID token');
      }
    } catch (error) {
      // No Cognito session available, continue without token (will use session cookies)
      console.log('[API SERVICE] No Cognito session, using session cookies only');
    }

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

    // Add organization context header if available in localStorage (set by workspace switcher)
    const activeOrgId = localStorage.getItem('activeOrganizationId');
    if (activeOrgId) {
      headers['X-Organization-Id'] = activeOrgId;
    }

    const config: RequestInit = {
      credentials: 'include', // Still send cookies for traditional auth
      ...options,
      headers,
    };

    console.log('API Request:', url, config);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle authentication failures
        if (response.status === 401) {
          // Clear any stored auth state and redirect to login
          console.log('Authentication failed, redirecting to login...');
          window.location.href = '/auth/login';
          throw new Error('Authentication required');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
    return this.request<TaskStatus>(`/projects/${projectId}/statuses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStatus(projectId: number, statusId: number, data: { name?: string; color?: string; order?: number }): Promise<TaskStatus> {
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
  async getTasks(projectId: number, filters?: { archived?: boolean }): Promise<Task[]> {
    let url = `/tasks?projectId=${projectId}`;
    if (filters?.archived !== undefined) {
      url += `&archived=${filters.archived}`;
    }
    return this.request<Task[]>(url);
  }

  async getTask(taskId: number): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}`);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/user/${userId}`);
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(taskId: number, task: Partial<Task>): Promise<Task> {
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
    const url = `${this.baseUrl}/tasks/export/csv${queryString ? `?${queryString}` : ''}`;

    // Get Cognito access token if available
    let authHeader: Record<string, string> = {};
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();

      if (session?.tokens?.accessToken) {
        authHeader['Authorization'] = `Bearer ${session.tokens.accessToken}`;
      }

      if (session?.tokens?.idToken) {
        authHeader['X-ID-Token'] = `${session.tokens.idToken}`;
      }
    } catch (error) {
      console.log('[API SERVICE] No Cognito session, using session cookies only');
    }

    // Add organization context header if available
    const activeOrgId = localStorage.getItem('activeOrganizationId');
    if (activeOrgId) {
      authHeader['X-Organization-Id'] = activeOrgId;
    }

    const response = await fetch(url, {
      credentials: 'include',
      headers: authHeader,
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/auth/login';
        throw new Error('Authentication required');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  async exportTasksJSON(filters?: { projectId?: number; status?: string; assignedUserId?: number }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedUserId) params.append('assignedUserId', filters.assignedUserId.toString());
    
    const queryString = params.toString();
    const url = `${this.baseUrl}/tasks/export/json${queryString ? `?${queryString}` : ''}`;

    // Get Cognito access token if available
    let authHeader: Record<string, string> = {};
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();

      if (session?.tokens?.accessToken) {
        authHeader['Authorization'] = `Bearer ${session.tokens.accessToken}`;
      }

      if (session?.tokens?.idToken) {
        authHeader['X-ID-Token'] = `${session.tokens.idToken}`;
      }
    } catch (error) {
      console.log('[API SERVICE] No Cognito session, using session cookies only');
    }

    // Add organization context header if available
    const activeOrgId = localStorage.getItem('activeOrganizationId');
    if (activeOrgId) {
      authHeader['X-Organization-Id'] = activeOrgId;
    }

    const response = await fetch(url, {
      credentials: 'include',
      headers: authHeader,
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/auth/login';
        throw new Error('Authentication required');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
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

  async removeOrganizationMember(organizationId: number, userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/organizations/${organizationId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
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
    const response = await this.request<{ success: boolean; goal: Goal; message: string }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    return response.goal;
  }

  async updateGoal(goalId: number, data: Partial<Goal>): Promise<Goal> {
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
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  organizationId: number;
  projectId?: number;
  templateId?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    name: string;
  };
  creator?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  template?: {
    id: number;
    name: string;
  };
  _count?: {
    linkedTasks: number;
  };
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