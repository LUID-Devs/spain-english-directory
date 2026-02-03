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
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const { data: activities, isLoading: activitiesLoading } = useActivityFeed();
  const { activeOrganization } = useAuth();

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
    <div className="container h-full w-full bg-background p-8">
      <div className="flex items-center justify-between mb-6">
        <Header name="Mission Control" />
        {canManageAgents && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              SpongeBob Squad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.idleAgents} idle, {stats.blockedAgents} blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">
              Unread mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Task Board
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Feed
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
