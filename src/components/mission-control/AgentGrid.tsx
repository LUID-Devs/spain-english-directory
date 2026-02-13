import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, CheckCircle, AlertCircle, Loader2, MoreVertical, Pencil, Key, Trash2, Bot, Plus, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditAgentModal } from "./EditAgentModal";
import { DeleteAgentModal } from "./DeleteAgentModal";
import { RegenerateKeyModal } from "./RegenerateKeyModal";
import { AgentDetailModal } from "./AgentDetailModal";
import { Agent } from "@/hooks/useMissionControl";

interface AgentGridProps {
  agents: Agent[];
  isLoading: boolean;
  canManageAgents?: boolean;
}

// SpongeBob character emoji mapping
const characterEmojis: Record<string, string> = {
  "mr-krabs": "🦀",
  "spongebob": "🧽",
  "squidward": "🦑",
  "sandy": "🐿️",
  "karen": "🖥️",
  "patrick": "⭐",
  "plankton": "🦠",
  "gary": "🐌",
  "mrs-puff": "🐡",
  "mermaid-man": "🦸",
};

const roleColors: Record<string, string> = {
  "squad-lead": "bg-yellow-500",
  "content-writer": "bg-blue-500",
  "product-analyst": "bg-purple-500",
  "customer-researcher": "bg-green-500",
  "seo-analyst": "bg-cyan-500",
  "social-media": "bg-pink-500",
  "developer": "bg-red-500",
  "documentation": "bg-gray-500",
  "email-marketing": "bg-orange-500",
  "designer": "bg-indigo-500",
};

const statusConfig = {
  idle: { color: "bg-gray-400", icon: Clock, label: "Idle" },
  active: { color: "bg-green-500", icon: CheckCircle, label: "Active" },
  blocked: { color: "bg-red-500", icon: AlertCircle, label: "Blocked" },
};

export const AgentGrid: React.FC<AgentGridProps> = ({ agents, isLoading, canManageAgents = false }) => {
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null);
  const [regenerateKeyAgent, setRegenerateKeyAgent] = useState<Agent | null>(null);
  const [detailAgentId, setDetailAgentId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <Card className="mx-0 sm:mx-0">
        <CardContent className="flex flex-col items-center justify-center h-64 sm:h-80 px-4 sm:px-6 text-center">
          {/* Icon with gradient background */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <Bot className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            No AI Agents Yet
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm">
            Create your first AI agent to automate tasks, streamline workflows, and boost productivity.
          </p>

          {/* CTA Button - only shown if user can manage agents */}
          {canManageAgents && (
            <Button
              size="lg"
              className="gap-2"
              onClick={() => {
                // Dispatch a custom event that MissionControlPage can listen for
                window.dispatchEvent(new CustomEvent('openCreateAgentModal'));
              }}
            >
              <Plus className="h-5 w-5" />
              Create Your First Agent
            </Button>
          )}

          {/* Feature highlights */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Automate tasks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>24/7 availability</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-green-500" />
              <span>Smart workflows</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 pb-4">
      {agents.map((agent) => {
        const StatusIcon = statusConfig[agent.status]?.icon || Clock;
        const emoji = characterEmojis[agent.name] || "🤖";
        const roleColor = roleColors[agent.role] || "bg-gray-500";

        return (
          <Card 
          key={agent.id} 
          className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setDetailAgentId(agent.id)}
        >
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig[agent.status]?.color || "bg-gray-400"}`} />

            <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 text-xl sm:text-2xl flex-shrink-0">
                  <AvatarFallback className="bg-muted">
                    {emoji}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <CardTitle className="text-xs sm:text-sm font-medium truncate">
                    {agent.displayName}
                  </CardTitle>
                  <Badge variant="outline" className={`text-[10px] sm:text-xs text-white mt-0.5 ${roleColor}`}>
                    {agent.role.replace("-", " ")}
                  </Badge>
                </div>
                {canManageAgents && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                        aria-label={`Open actions menu for ${agent.displayName}`}
                        title="Agent actions"
                      >
                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditAgent(agent)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRegenerateKeyAgent(agent)}>
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate API Key
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteAgent(agent)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 px-3 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-1.5 sm:space-y-2">
                {/* Status */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <StatusIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${agent.status === "active" ? "text-green-500" : agent.status === "blocked" ? "text-red-500" : "text-gray-400"}`} />
                  <span className="text-muted-foreground">
                    {statusConfig[agent.status]?.label}
                  </span>
                </div>

                {/* Current Task */}
                {agent.currentTask && (
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Working: <span className="font-medium">{agent.currentTask.title}</span>
                  </div>
                )}

                {/* Last Heartbeat */}
                {agent.lastHeartbeat && (
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    Last seen: {formatDistanceToNow(new Date(agent.lastHeartbeat), { addSuffix: true })}
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground pt-1.5 sm:pt-2 border-t">
                  <span>{agent._count?.assignedTasks || 0} tasks</span>
                  {(agent._count?.notifications || 0) > 0 && (
                    <span className="text-blue-500">
                      {agent._count?.notifications} mentions
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Modals */}
      <EditAgentModal
        isOpen={!!editAgent}
        onClose={() => setEditAgent(null)}
        agent={editAgent}
      />
      <DeleteAgentModal
        isOpen={!!deleteAgent}
        onClose={() => setDeleteAgent(null)}
        agent={deleteAgent}
      />
      <RegenerateKeyModal
        isOpen={!!regenerateKeyAgent}
        onClose={() => setRegenerateKeyAgent(null)}
        agent={regenerateKeyAgent}
      />
      <AgentDetailModal
        isOpen={detailAgentId !== null}
        onClose={() => setDetailAgentId(null)}
        agentId={detailAgentId || 0}
        onEdit={(agent) => {
          setDetailAgentId(null);
          setEditAgent(agent);
        }}
        onDelete={(agent) => {
          setDetailAgentId(null);
          setDeleteAgent(agent);
        }}
        onRegenerateKey={(agent) => {
          setDetailAgentId(null);
          setRegenerateKeyAgent(agent);
        }}
      />
    </div>
  );
};
