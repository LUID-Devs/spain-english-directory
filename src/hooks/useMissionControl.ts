import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==================== AGENTS ====================

export interface Agent {
  id: number;
  name: string;
  displayName: string;
  role: string;
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

export const useAgents = (organizationId?: number) => {
  return useQuery<Agent[]>({
    queryKey: ["agents", organizationId],
    queryFn: async () => {
      const params = organizationId ? `?organizationId=${organizationId}` : "";
      const response = await fetch(`${API_BASE}/api/agents${params}`);
      if (!response.ok) throw new Error("Failed to fetch agents");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useAgent = (agentId: number) => {
  return useQuery<Agent>({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/agents/${agentId}`);
      if (!response.ok) throw new Error("Failed to fetch agent");
      return response.json();
    },
    enabled: !!agentId,
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

export const useAgentTasks = (agentId?: number, status?: string) => {
  return useQuery<TaskAssignment[]>({
    queryKey: ["agentTasks", agentId, status],
    queryFn: async () => {
      let url = `${API_BASE}/api/agents`;
      if (agentId) {
        url += `/${agentId}/tasks`;
        if (status) url += `?status=${status}`;
      } else {
        // Get all agent tasks across all agents
        const agentsResponse = await fetch(`${API_BASE}/api/agents`);
        const agents = await agentsResponse.json();

        const allTasks = await Promise.all(
          agents.map(async (agent: Agent) => {
            const tasksResponse = await fetch(`${API_BASE}/api/agents/${agent.id}/tasks`);
            const tasks = await tasksResponse.json();
            return tasks.map((t: any) => ({ ...t, agent }));
          })
        );

        return allTasks.flat();
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch agent tasks");
      return response.json();
    },
    refetchInterval: 30000,
  });
};

export const useAssignTaskToAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, agentIds }: { taskId: number; agentIds: number[] }) => {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}/assign-agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentIds }),
      });
      if (!response.ok) throw new Error("Failed to assign task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentTasks"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
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
      const response = await fetch(
        `${API_BASE}/api/agents/${agentId}/tasks/${taskId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error("Failed to update task status");
      return response.json();
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
      const response = await fetch(
        `${API_BASE}/api/agents/${agentId}/notifications${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!agentId,
    refetchInterval: 15000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(
        `${API_BASE}/api/notifications/${notificationId}/read`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Failed to mark notification read");
      return response.json();
    },
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
      const orgId = organizationId || 1; // Default to org 1 for now
      const response = await fetch(
        `${API_BASE}/api/organizations/${orgId}/activity?limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch activity feed");
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
  });
};
