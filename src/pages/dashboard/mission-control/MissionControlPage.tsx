import React, { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Activity,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  Zap,
  Plus,
} from "lucide-react";
import { AgentGrid } from "@/components/mission-control/AgentGrid";
import { TaskBoard } from "@/components/mission-control/TaskBoard";
import { ActivityFeed } from "@/components/mission-control/ActivityFeed";
import { CreateAgentModal } from "@/components/mission-control/CreateAgentModal";
import { useAgents, useActivityFeed } from "@/hooks/useMissionControl";
import { useAuth } from "@/app/authProvider";

const MissionControlPage = () => {
  const [activeTab, setActiveTab] = useState("agents");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { activeOrganization } = useAuth();
  const { data: agents, isLoading: agentsLoading } = useAgents(activeOrganization?.id);
  const { data: activities, isLoading: activitiesLoading } = useActivityFeed(activeOrganization?.id);

  // Check if user can manage agents (admin or owner)
  const canManageAgents = activeOrganization?.role === "admin" || activeOrganization?.role === "owner";

  // Calculate stats
  const stats = {
    totalAgents: agents?.length || 0,
    activeAgents: agents?.filter((a: any) => a.status === "active").length || 0,
    idleAgents: agents?.filter((a: any) => a.status === "idle").length || 0,
    blockedAgents: agents?.filter((a: any) => a.status === "blocked").length || 0,
    pendingTasks: agents?.reduce((sum: number, a: any) => sum + (a._count?.assignedTasks || 0), 0) || 0,
    unreadNotifications: agents?.reduce((sum: number, a: any) => sum + (a._count?.notifications || 0), 0) || 0,
  };

  return (
    <div className="container h-full w-full bg-background p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Header name="Mission Control" />
        {canManageAgents && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Agents</CardTitle>
            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              SpongeBob Squad
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Active Now</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeAgents}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {stats.idleAgents} idle, {stats.blockedAgents} blocked
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Pending Tasks</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Notifications</CardTitle>
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{stats.unreadNotifications}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Unread mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 sm:w-auto sm:inline-flex sm:grid-cols-none">
          <TabsTrigger value="agents" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
            <Users className="h-4 w-4" />
            <span className="text-xs sm:text-sm truncate">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm truncate">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
            <Activity className="h-4 w-4" />
            <span className="text-xs sm:text-sm truncate">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <AgentGrid agents={agents || []} isLoading={agentsLoading} canManageAgents={canManageAgents} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskBoard />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivityFeed activities={activities || []} isLoading={activitiesLoading} />
        </TabsContent>
      </Tabs>

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default MissionControlPage;
