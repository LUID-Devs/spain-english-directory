import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastFetched?: number;
}

interface ApiState {
  // Data cache
  projects: ApiResponse<any[]>;
  tasks: ApiResponse<any[]>;
  users: ApiResponse<any[]>;
  teams: ApiResponse<any[]>;
  taskComments: Record<string, ApiResponse<any[]>>;
  taskAttachments: Record<string, ApiResponse<any[]>>;
  searchResults: ApiResponse<any>;
  
  // Data freshness tracking
  lastFetch: Record<string, number>;
  
  // Generic actions
  setApiData: <T>(key: string, data: ApiResponse<T>) => void;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearCache: (key?: string) => void;
  
  // Specific actions for common operations
  setProjects: (data: any[], loading?: boolean, error?: string | null) => void;
  setTasks: (data: any[], loading?: boolean, error?: string | null) => void;
  setUsers: (data: any[], loading?: boolean, error?: string | null) => void;
  setTeams: (data: any[], loading?: boolean, error?: string | null) => void;
  setTaskComments: (taskId: string, data: any[], loading?: boolean, error?: string | null) => void;
  setTaskAttachments: (taskId: string, data: any[], loading?: boolean, error?: string | null) => void;
  
  // Cache management
  shouldRefetch: (key: string, ttl?: number) => boolean;
}

const initialApiResponse = <T>(): ApiResponse<T> => ({
  data: null,
  isLoading: false,
  error: null,
});

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useApiStore = create<ApiState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    projects: initialApiResponse<any[]>(),
    tasks: initialApiResponse<any[]>(),
    users: initialApiResponse<any[]>(),
    teams: initialApiResponse<any[]>(),
    taskComments: {},
    taskAttachments: {},
    searchResults: initialApiResponse<any>(),
    lastFetch: {},
    
    // Generic actions
    setApiData: <T>(key: string, data: ApiResponse<T>) => 
      set((state) => ({ 
        ...state, 
        [key]: { ...data, lastFetched: Date.now() } 
      })),
    
    setLoading: (key: string, loading: boolean) => 
      set((state) => ({
        ...state,
        [key]: { 
          ...(state as any)[key], 
          isLoading: loading 
        }
      })),
    
    setError: (key: string, error: string | null) => 
      set((state) => ({
        ...state,
        [key]: { 
          ...(state as any)[key], 
          error, 
          isLoading: false 
        }
      })),
    
    clearCache: (key?: string) => {
      if (key) {
        set((state) => ({
          ...state,
          [key]: initialApiResponse()
        }));
      } else {
        set({
          projects: initialApiResponse<any[]>(),
          tasks: initialApiResponse<any[]>(),
          users: initialApiResponse<any[]>(),
          teams: initialApiResponse<any[]>(),
          taskComments: {},
          taskAttachments: {},
          searchResults: initialApiResponse<any>(),
        });
      }
    },
    
    // Specific actions
    setProjects: (data, loading = false, error = null) => 
      set({ 
        projects: { 
          data, 
          isLoading: loading, 
          error, 
          lastFetched: Date.now() 
        } 
      }),
    
    setTasks: (data, loading = false, error = null) => 
      set({ 
        tasks: { 
          data, 
          isLoading: loading, 
          error, 
          lastFetched: Date.now() 
        } 
      }),
    
    setUsers: (data, loading = false, error = null) => 
      set({ 
        users: { 
          data, 
          isLoading: loading, 
          error, 
          lastFetched: Date.now() 
        } 
      }),
    
    setTeams: (data, loading = false, error = null) => 
      set({ 
        teams: { 
          data, 
          isLoading: loading, 
          error, 
          lastFetched: Date.now() 
        } 
      }),
    
    setTaskComments: (taskId, data, loading = false, error = null) => 
      set((state) => ({
        taskComments: {
          ...state.taskComments,
          [taskId]: { 
            data, 
            isLoading: loading, 
            error, 
            lastFetched: Date.now() 
          }
        }
      })),
    
    setTaskAttachments: (taskId, data, loading = false, error = null) => 
      set((state) => ({
        taskAttachments: {
          ...state.taskAttachments,
          [taskId]: { 
            data, 
            isLoading: loading, 
            error, 
            lastFetched: Date.now() 
          }
        }
      })),
    
    // Cache management
    shouldRefetch: (key: string, ttl = CACHE_TTL) => {
      const state = get();
      const lastFetch = state.lastFetch[key];
      if (!lastFetch) return true;
      return Date.now() - lastFetch > ttl;
    },
    
    markFetched: (key: string) => {
      set((state) => ({
        lastFetch: {
          ...state.lastFetch,
          [key]: Date.now()
        }
      }));
    },
  }))
);

// Helper hooks for specific data
export const useProjects = () => useApiStore((state) => state.projects);
export const useTasks = () => useApiStore((state) => state.tasks);
export const useUsers = () => useApiStore((state) => state.users);
export const useTeams = () => useApiStore((state) => state.teams);
export const useTaskComments = (taskId: string) => 
  useApiStore((state) => state.taskComments[taskId] || initialApiResponse<any[]>());
export const useTaskAttachments = (taskId: string) => 
  useApiStore((state) => state.taskAttachments[taskId] || initialApiResponse<any[]>());