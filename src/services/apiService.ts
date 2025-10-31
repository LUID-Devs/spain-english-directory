import { useApiStore } from '@/stores/apiStore';

// Types (moved from old api.ts)
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  archived?: boolean;
  archivedAt?: string;
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

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
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
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

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

// API Service class
class ApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('API Request:', url, config);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // In development mode, return mock data for certain endpoints when auth fails
        if (import.meta.env.DEV && response.status === 401) {
          return this.getMockData<T>(endpoint);
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // In development mode, return mock data when API calls fail
      if (import.meta.env.DEV) {
        console.warn('API call failed, returning mock data for development:', endpoint);
        return this.getMockData<T>(endpoint);
      }
      throw error;
    }
  }

  private getMockData<T>(endpoint: string): T {
    // Mock data for development
    if (endpoint.includes('/tasks/user/')) {
      return [
        {
          id: 1,
          title: "Setup development environment",
          description: "Configure Vite and migrate from Next.js",
          status: "Work In Progress",
          priority: "High",
          tags: "development,setup",
          startDate: "2024-01-01",
          dueDate: "2024-01-15",
          points: 8,
          projectId: 1,
          authorUserId: 1,
          assignedUserId: 1,
          author: { userId: 1, username: "testuser", email: "test@example.com" },
          assignee: { userId: 1, username: "testuser", email: "test@example.com" }
        },
        {
          id: 2,
          title: "Fix authentication flow",
          description: "Ensure proper user authentication and authorization",
          status: "To Do",
          priority: "High",
          tags: "auth,security",
          startDate: "2024-01-02",
          dueDate: "2024-01-10",
          points: 5,
          projectId: 1,
          authorUserId: 1,
          assignedUserId: 1,
          author: { userId: 1, username: "testuser", email: "test@example.com" },
          assignee: { userId: 1, username: "testuser", email: "test@example.com" }
        }
      ] as T;
    }
    
    if (endpoint.includes('/projects')) {
      return [
        {
          id: "1",
          name: "TaskLuid Development",
          description: "Main development project for TaskLuid platform",
          startDate: "2024-01-01",
          endDate: null,
          archived: false,
          isFavorited: false,
          taskCount: 5,
          statistics: {
            totalTasks: 5,
            completedTasks: 1,
            inProgressTasks: 2,
            todoTasks: 2,
            progress: 20,
            memberCount: 1,
            status: "Active"
          }
        }
      ] as T;
    }

    if (endpoint.includes('/users/')) {
      return {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        profilePictureUrl: "default-avatar.png",
        cognitoId: "test-user-sub",
        teamId: 1,
        role: "user"
      } as T;
    }
    
    // Default empty response
    return [] as T;
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

  // Tasks
  async getTasks(projectId: number): Promise<Task[]> {
    return this.request<Task[]>(`/tasks?projectId=${projectId}`);
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

  // Comments
  async getTaskComments(taskId: number): Promise<Comment[]> {
    return this.request<Comment[]>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: number, text: string, userId: number): Promise<Comment> {
    return this.request<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, userId }),
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
      headers: {}, // Don't set Content-Type for FormData
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

  // Teams
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  // Search
  async search(query: string): Promise<SearchResults> {
    return this.request<SearchResults>(`/search?query=${encodeURIComponent(query)}`);
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
    const params = new URLSearchParams({ query });
    if (type) params.append('type', type);
    return this.request<{ suggestions: SearchSuggestion[] }>(`/search/suggestions?${params.toString()}`);
  }
}

export const apiService = new ApiService();