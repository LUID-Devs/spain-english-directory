import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/$/, "");

// Validate API base URL is configured
if (!API_BASE) {
  console.error("[useMissionControl] VITE_API_BASE_URL is not configured! API calls will fail.");
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  try {
    const { fetchAuthSession } = await import("aws-amplify/auth");
    const session = await fetchAuthSession();

    if (session?.tokens?.accessToken) {
      headers.Authorization = `Bearer ${session.tokens.accessToken}`;
    }

    if (session?.tokens?.idToken) {
      headers["X-ID-Token"] = `${session.tokens.idToken}`;
    }
  } catch {
    // No Cognito session available, request may still authenticate via cookie session
  }

  return headers;
};

// User-friendly error message mapping based on context
const getUserFriendlyErrorMessage = (
  status: number,
  path: string,
  method: string,
  serverMessage?: string
): string => {
  // First, check for server-provided message if it's user-friendly
  if (serverMessage && !serverMessage.includes("Request failed") && !serverMessage.includes("status")) {
    return serverMessage;
  }

  // Context-specific error messages based on the endpoint
  const isAgentEndpoint = path.includes("/agents");
  const isTaskEndpoint = path.includes("/tasks");
  const isMonitoringEndpoint = path.includes("/monitoring");
  const isCreate = method === "POST" && !path.includes("/");
  const isUpdate = method === "PUT";
  const isDelete = method === "DELETE";

  // Auth errors
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  // Not found errors
  if (status === 404) {
    if (isAgentEndpoint) return "Agent not found. It may have been deleted.";
    if (isTaskEndpoint) return "Task not found. It may have been deleted or moved.";
    return "The requested resource was not found.";
  }

  // Validation errors
  if (status === 400) {
    if (isAgentEndpoint && isCreate) return "Invalid agent information. Please check all fields and try again.";
    if (isAgentEndpoint && isUpdate) return "Invalid agent update. Please check your changes and try again.";
    return "Invalid request. Please check your input and try again.";
  }

  // Conflict errors
  if (status === 409) {
    if (isAgentEndpoint && isCreate) return "An agent with this name already exists. Please choose a different name.";
    return "This action conflicts with existing data. Please try again.";
  }

  // Server errors
  if (status >= 500) {
    if (isAgentEndpoint) {
      if (isCreate) return "Unable to create agent. Please try again in a moment.";
      if (isUpdate) return "Unable to update agent. Please try again in a moment.";
      if (isDelete) return "Unable to delete agent. Please try again in a moment.";
      return "Unable to load agent data. Please try again in a moment.";
    }
    if (isTaskEndpoint) return "Unable to process task. Please try again in a moment.";
    if (isMonitoringEndpoint) return "Unable to load monitoring data. Please refresh the page.";
    return "Something went wrong. Please try again in a moment.";
  }

  // Default fallback
  return serverMessage || "An unexpected error occurred. Please try again.";
};

const missionFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const isFormData = options.body instanceof FormData;
  const authHeaders = await getAuthHeaders();
  const headers: Record<string, string> = {
    ...authHeaders,
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    let serverMessage: string | undefined;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        serverMessage = errorData.message;
      } else if (errorData?.error) {
        serverMessage = errorData.error;
      }
    } catch {
      // Response isn't JSON, keep undefined
    }

    const userMessage = getUserFriendlyErrorMessage(
      response.status,
      path,
      options.method || "GET",
      serverMessage
    );
    throw new Error(userMessage);
  }

  return response.json();
};

// ==================== AGENTS ====================

export interface Agent {
  id: number;
  name: string;
  displayName: string;
  role: string;
  personality?: Record<string, any>;
  status: "idle" | "active" | "blocked";
  lastHeartbeat: string | null;
  currentTaskId: number | null;
  currentTask?: {
    id: number;
    title: string;
    status: string;
  } | null;
  _count?: {
    assignedTasks: number;
    notifications: number;
  };
}

export interface CreateAgentData {
  name: string;
  displayName: string;
  role: string;
  personality?: Record<string, any>;
}

export interface CreateAgentResponse {
  id: number;
  name: string;
  displayName: string;
  role: string;
  organizationId: number;
  apiKey: string;
  message: string;
}

export interface UpdateAgentData {
  displayName?: string;
  role?: string;
  personality?: Record<string, any>;
}

export interface RegenerateKeyResponse {
  id: number;
  name: string;
  apiKey: string;
  message: string;
}

export const useAgents = (organizationId?: number) => {
  return useQuery<Agent[]>({
    queryKey: ["agents", organizationId],
    queryFn: async () => {
      const params = organizationId ? `?organizationId=${organizationId}` : "";
      return missionFetch<Agent[]>(`/api/agents${params}`);
    },
    refetchInterval: (query) => (query.state.error ? false : 30000),
    retry: (failureCount, error) => {
      const message = error?.message?.toLowerCase() || "";
      if (message.includes("401") || message.includes("auth")) return false;
      return failureCount < 2;
    },
  });
};

export const useAgent = (agentId: number) => {
  return useQuery<Agent>({
    queryKey: ["agent", agentId],
    queryFn: async () => missionFetch<Agent>(`/api/agents/${agentId}`),
    enabled: !!agentId,
  });
};

// ==================== AGENT MUTATIONS ====================

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateAgentResponse, Error, CreateAgentData>({
    mutationFn: async (data) =>
      missionFetch<CreateAgentResponse>("/api/agents", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, { agentId: number; data: UpdateAgentData }>({
    mutationFn: async ({ agentId, data }) =>
      missionFetch<Agent>(`/api/agents/${agentId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (agentId) =>
      missionFetch<{ message: string }>(`/api/agents/${agentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useRegenerateAgentKey = () => {
  const queryClient = useQueryClient();

  return useMutation<RegenerateKeyResponse, Error, number>({
    mutationFn: async (agentId) =>
      missionFetch<RegenerateKeyResponse>(`/api/agents/${agentId}/regenerate-key`, {
        method: "POST",
      }),
    onSuccess: (_, agentId) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
    },
  });
};

// ==================== AGENT TASKS ====================

export interface TaskAssignment {
  id: number;
  agentId: number;
  taskId: number;
  status: string;
  assignedAt: string;
  task: {
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    project?: {
      id: number;
      name: string;
    };
    author?: {
      userId: number;
      username: string;
    };
  };
  agent?: {
    id: number;
    name: string;
    displayName: string;
  };
}

export interface TaskAgentAssignment {
  id: number;
  agentId: number;
  taskId: number;
  status: string;
  assignedAt: string;
  agent: {
    id: number;
    name: string;
    displayName: string;
    role: string;
    status: "idle" | "active" | "blocked";
    currentTaskId: number | null;
  };
}

export const useAgentTasks = (agentId?: number, status?: string) => {
  return useQuery<TaskAssignment[]>({
    queryKey: ["agentTasks", agentId, status],
    queryFn: async () => {
      let path = "/api/agents";
      if (agentId) {
        path += `/${agentId}/tasks`;
        if (status) path += `?status=${status}`;
      } else {
        // Get all agent tasks across all agents
        const agents = await missionFetch<Agent[]>("/api/agents");

        const allTasks = await Promise.all(
          agents.map(async (agent: Agent) => {
            const tasks = await missionFetch<TaskAssignment[]>(`/api/agents/${agent.id}/tasks`);
            return tasks.map((t: any) => ({ ...t, agent }));
          })
        );

        return allTasks.flat();
      }

      return missionFetch<TaskAssignment[]>(path);
    },
    refetchInterval: (query) => (query.state.error ? false : 30000),
  });
};

export const useAssignTaskToAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, agentIds }: { taskId: number; agentIds: number[] }) =>
      missionFetch(`/api/tasks/${taskId}/assign-agents`, {
        method: "POST",
        body: JSON.stringify({ agentIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentTasks"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["taskAgentAssignments"] });
    },
  });
};

export const useTaskAgentAssignments = (taskId?: number) => {
  return useQuery<TaskAgentAssignment[]>({
    queryKey: ["taskAgentAssignments", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      return missionFetch<TaskAgentAssignment[]>(`/api/tasks/${taskId}/assign-agents`);
    },
    enabled: !!taskId,
    refetchInterval: (query) => (query.state.error ? false : 30000),
  });
};

export const useUnassignTaskFromAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, agentId }: { taskId: number; agentId: number }) =>
      missionFetch(`/api/tasks/${taskId}/assign-agents/${agentId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agentTasks"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["taskAgentAssignments", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["taskAgentAssignments"] });
    },
  });
};

export const useUpdateAgentTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      taskId,
      status,
    }: {
      agentId: number;
      taskId: number;
      status: string;
    }) => {
      return missionFetch(`/api/agents/${agentId}/tasks/${taskId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentTasks"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

// Update task assignment status by assignment ID (for drag-and-drop in TaskBoard)
export const useUpdateTaskAssignmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      status,
    }: {
      assignmentId: number;
      status: string;
    }) => {
      return missionFetch(`/api/agent-tasks/${assignmentId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentTasks"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: number;
  recipientAgentId: number;
  senderAgentId?: number;
  type: string;
  title: string;
  content: Record<string, any>;
  taskId?: number;
  read: boolean;
  delivered: boolean;
  createdAt: string;
  senderAgent?: {
    id: number;
    name: string;
    displayName: string;
  };
  task?: {
    id: number;
    title: string;
    status: string;
  };
}

export const useAgentNotifications = (agentId: number, unread?: boolean) => {
  return useQuery<Notification[]>({
    queryKey: ["notifications", agentId, unread],
    queryFn: async () => {
      const params = unread ? "?unread=true" : "";
      return missionFetch<Notification[]>(`/api/agents/${agentId}/notifications${params}`);
    },
    enabled: !!agentId,
    refetchInterval: (query) => (query.state.error ? false : 15000),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) =>
      missionFetch(`/api/notifications/${notificationId}/read`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// ==================== ACTIVITY FEED ====================

export interface ActivityLog {
  id: number;
  agentId: number;
  action: string;
  taskId?: number;
  details: Record<string, any>;
  createdAt: string;
  agent: {
    id: number;
    name: string;
    displayName: string;
    role: string;
  };
  task?: {
    id: number;
    title: string;
  } | null;
}

export const useActivityFeed = (organizationId?: number, limit = 50) => {
  return useQuery<ActivityLog[]>({
    queryKey: ["activityFeed", organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];
      return missionFetch<ActivityLog[]>(`/api/organizations/${organizationId}/activity?limit=${limit}`);
    },
    enabled: !!organizationId,
    refetchInterval: (query) => (query.state.error ? false : 10000),
    retry: (failureCount, error) => {
      const message = error?.message?.toLowerCase() || "";
      if (message.includes("401") || message.includes("403")) return false;
      return failureCount < 2;
    },
  });
};

// ==================== AGENT MONITORING ====================

export interface AgentWithOnlineStatus extends Agent {
  isOnline: boolean;
  lastSeenSeconds: number | null;
  heartbeatStatus: "online" | "away" | "offline";
}

export interface MonitoringData {
  agents: AgentWithOnlineStatus[];
  activities: ActivityLog[];
  taskStats: {
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  timestamp: string;
}

export const useMonitoringData = (organizationId?: number) => {
  return useQuery<MonitoringData>({
    queryKey: ["monitoring", "data", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID required");
      return missionFetch<MonitoringData>(`/api/monitoring/agents?organizationId=${organizationId}`);
    },
    enabled: !!organizationId,
    refetchInterval: (query) => (query.state.error ? false : 30000),
  });
};

export interface NightPatrolTimeline {
  hour: string;
  activities: ActivityLog[];
}

export interface NightPatrolData {
  date: string;
  timeline: NightPatrolTimeline[];
  stats: {
    totalActivities: number;
    uniqueAgents: number;
    taskCompletions: number;
    newTasks: number;
  };
}

export const useNightPatrol = (organizationId?: number) => {
  return useQuery<NightPatrolData>({
    queryKey: ["monitoring", "night-patrol", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID required");
      return missionFetch<NightPatrolData>(`/api/monitoring/night-patrol?organizationId=${organizationId}`);
    },
    enabled: !!organizationId,
    refetchInterval: (query) => (query.state.error ? false : 300000), // 5 minutes
  });
};

export interface MorningStandupData {
  date: string;
  yesterday: Array<{
    agent: {
      id: number;
      name: string;
      displayName: string;
      role: string;
    };
    completedTasks: string[];
    inProgressTasks: string[];
    blockedTasks: string[];
  }>;
  today: Array<{
    agent: {
      id: number;
      displayName: string;
    };
    pendingTasks: Array<{
      title: string;
      priority: string | null;
      status: string;
    }>;
  }>;
  highlights: {
    totalCompleted: number;
    totalBlocked: number;
    activeAgents: number;
  };
}

export const useMorningStandup = (organizationId?: number) => {
  return useQuery<MorningStandupData>({
    queryKey: ["monitoring", "morning-standup", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID required");
      return missionFetch<MorningStandupData>(`/api/monitoring/morning-standup?organizationId=${organizationId}`);
    },
    enabled: !!organizationId,
    refetchInterval: (query) => (query.state.error ? false : 600000), // 10 minutes
  });
};

export interface HeartbeatStatus {
  agents: Array<Agent & {
    heartbeatStatus: "online" | "away" | "offline";
    lastHeartbeatAge: number | null;
  }>;
  timestamp: string;
}

export const useHeartbeatStatus = (organizationId?: number) => {
  return useQuery<HeartbeatStatus>({
    queryKey: ["monitoring", "heartbeat", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID required");
      return missionFetch<HeartbeatStatus>(`/api/monitoring/heartbeat?organizationId=${organizationId}`);
    },
    enabled: !!organizationId,
    refetchInterval: (query) => (query.state.error ? false : 10000), // 10 seconds
  });
};
