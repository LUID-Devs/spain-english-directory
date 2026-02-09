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
  LayoutDashboard,
  Sparkles,
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
  const { activeOrganization, user } = useAuth();
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Header name="Mission Control" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your AI agents and monitor activity
            </p>
          </div>
        </div>
        {canManageAgents && (
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            size="default"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Create Agent</span>
          </Button>
        )}
      </div>

      {/* Welcome Section */}
      <Card className="mb-4 sm:mb-6 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Welcome to Mission Control, {user?.preferred_username || user?.username || 'Commander'}!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor your AI agent squad, track tasks, and view real-time activity. 
                {stats.activeAgents > 0 && (
                  <span className="text-green-600 font-medium"> {stats.activeAgents} agent{stats.activeAgents !== 1 ? 's' : ''} currently active.</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview - Improved Design */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
        {/* Total Agents */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalAgents}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  SpongeBob Squad
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Now */}
        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Now</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeAgents}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {stats.idleAgents} idle, {stats.blockedAgents} blocked
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="overflow-hidden border-l-4 border-l-yellow-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.pendingTasks}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Across all agents
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Notifications</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.unreadNotifications}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Unread mentions
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Section */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto flex flex-wrap sm:flex-nowrap sm:w-auto sm:inline-flex gap-1 p-1 bg-muted/50">
              <TabsTrigger 
                value="agents" 
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Agents</span>
                {stats.totalAgents > 0 && (
                  <span className="ml-1 text-[10px] bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                    {stats.totalAgents}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Tasks</span>
                {stats.pendingTasks > 0 && (
                  <span className="ml-1 text-[10px] bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                    {stats.pendingTasks}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Activity className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Activity</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="agents" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <AgentGrid agents={agents || []} isLoading={agentsLoading} canManageAgents={canManageAgents} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <TaskBoard />
            </TabsContent>

            <TabsContent value="activity" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ActivityFeed activities={activities || []} isLoading={activitiesLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default MissionControlPage;
