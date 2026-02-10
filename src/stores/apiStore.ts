import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiState {
  // Data storage
  projects: ApiResponse<any[]>;
  tasks: ApiResponse<any[]>;
  users: ApiResponse<any[]>;
  teams: ApiResponse<any[]>;
  agents: ApiResponse<any[]>;
  taskComments: Record<string, ApiResponse<any[]>>;
  taskAttachments: Record<string, ApiResponse<any[]>>;
  searchResults: ApiResponse<any>;
  
  // Generic actions
  setApiData: <T>(key: string, data: ApiResponse<T>) => void;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearData: (key?: string) => void;
  
  // Specific actions for common operations
  setProjects: (data: any[], loading?: boolean, error?: string | null) => void;
  setTasks: (data: any[], loading?: boolean, error?: string | null) => void;
  setUsers: (data: any[], loading?: boolean, error?: string | null) => void;
  setTeams: (data: any[], loading?: boolean, error?: string | null) => void;
  setAgents: (data: any[], loading?: boolean, error?: string | null) => void;
  setTaskComments: (taskId: string, data: any[], loading?: boolean, error?: string | null) => void;
  setTaskAttachments: (taskId: string, data: any[], loading?: boolean, error?: string | null) => void;
}

const initialApiResponse = <T>(): ApiResponse<T> => ({
  data: null,
  isLoading: false,
  error: null,
});


export const useApiStore = create<ApiState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    projects: initialApiResponse<any[]>(),
    tasks: initialApiResponse<any[]>(),
    users: initialApiResponse<any[]>(),
    teams: initialApiResponse<any[]>(),
    agents: initialApiResponse<any[]>(),
    taskComments: {},
    taskAttachments: {},
    searchResults: initialApiResponse<any>(),
    
    // Generic actions
    setApiData: <T>(key: string, data: ApiResponse<T>) => 
      set((state) => ({ 
        ...state, 
        [key]: data 
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
    
    clearData: (key?: string) => {
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
          agents: initialApiResponse<any[]>(),
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
          error 
        } 
      }),
    
    setTasks: (data, loading = false, error = null) => 
      set({ 
        tasks: { 
          data, 
          isLoading: loading, 
          error 
        } 
      }),
    
    setUsers: (data, loading = false, error = null) => 
      set({ 
        users: { 
          data, 
          isLoading: loading, 
          error 
        } 
      }),
    
    setTeams: (data, loading = false, error = null) => 
      set({ 
        teams: { 
          data, 
          isLoading: loading, 
          error 
        } 
      }),
    
    setAgents: (data, loading = false, error = null) => 
      set({ 
        agents: { 
          data, 
          isLoading: loading, 
          error 
        } 
      }),
    
    setTaskComments: (taskId, data, loading = false, error = null) => 
      set((state) => ({
        taskComments: {
          ...state.taskComments,
          [taskId]: { 
            data, 
            isLoading: loading, 
            error 
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
            error 
          }
        }
      })),
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