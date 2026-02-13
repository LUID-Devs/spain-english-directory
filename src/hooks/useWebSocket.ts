import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

interface UseWebSocketOptions {
  organizationId?: number;
  onAgentUpdate?: (agent: any) => void;
  onActivity?: (activity: any) => void;
  onTaskAssignment?: (assignment: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = ({
  organizationId,
  onAgentUpdate,
  onActivity,
  onTaskAssignment,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setIsConnected(true);
      setConnectionError(null);

      // Join organization room
      socket.emit("join-organization", { organizationId });

      onConnect?.();
    });

    socket.on("disconnect", (reason) => {
      console.log(`[WebSocket] Disconnected: ${reason}`);
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
      setConnectionError(error.message);
    });

    // Agent status updates
    socket.on("agents:status", (data) => {
      console.log("[WebSocket] Received agent statuses:", data);
    });

    socket.on("agent:updated", (data) => {
      console.log("[WebSocket] Agent updated:", data);
      onAgentUpdate?.(data.agent);
    });

    socket.on("agent:status-changed", (data) => {
      console.log("[WebSocket] Agent status changed:", data);
      onAgentUpdate?.(data.agent);
    });

    // Activity updates
    socket.on("activity:new", (data) => {
      console.log("[WebSocket] New activity:", data);
      onActivity?.(data.activity);
    });

    // Task assignment updates
    socket.on("task:assignment-changed", (data) => {
      console.log("[WebSocket] Task assignment changed:", data);
      onTaskAssignment?.(data.assignment);
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave-organization", { organizationId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [organizationId, onAgentUpdate, onActivity, onTaskAssignment, onConnect, onDisconnect]);

  // Send heartbeat
  const sendHeartbeat = useCallback((agentId: number, status: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("agent-heartbeat", {
        agentId,
        organizationId,
        status,
      });
    }
  }, [organizationId]);

  return {
    isConnected,
    connectionError,
    sendHeartbeat,
  };
};

export default useWebSocket;
