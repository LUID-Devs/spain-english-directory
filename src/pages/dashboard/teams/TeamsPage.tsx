import React, { useState, useMemo } from "react";
import { useGetTeamsQuery, useGetUsersWithStatsQuery, useGetProjectsQuery } from "@/hooks/useApi";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Settings,
  UserPlus,
  Crown,
  Shield,
  Activity,
  Award,
  Target,
  Grid3X3,
  List
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: {
    teamId: number;
    teamName: string;
    productOwnerUserId?: number;
    projectManagerUserId?: number;
  };
  users: any[];
  projects: any[];
}

const TeamCard: React.FC<TeamCardProps> = ({ team, users = [], projects = [] }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Find team members
  const teamMembers = users.filter(user => user.teamId === team.teamId);
  const productOwner = users.find(user => user.userId === team.productOwnerUserId);
  const projectManager = users.find(user => user.userId === team.projectManagerUserId);
  
  // Calculate team stats
  const stats = {
    memberCount: teamMembers.length,
    projectCount: projects.filter(project => 
      project.teamMembers?.some((member: any) => 
        teamMembers.some(teamMember => teamMember.userId === member.userId)
      )
    ).length,
    totalTasks: teamMembers.reduce((sum, member) => 
      sum + (member.taskStats?.authored || 0) + (member.taskStats?.assigned || 0), 0),
    completedTasks: teamMembers.reduce((sum, member) => 
      sum + (member.taskStats?.completed || 0), 0)
  };
  
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {team.teamName}
              </CardTitle>
              <CardDescription>
                Team ID: {team.teamId}
              </CardDescription>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showDropdown && (
              <div className="absolute right-0 top-9 z-10 bg-background border border-border rounded-lg shadow-lg py-1 w-48 animate-in fade-in-0 zoom-in-95 duration-100">
                <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span>Add Member</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Team Settings</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>Send Invitation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Team Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">
              {stats.memberCount}
            </div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className="text-center bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.projectCount}
            </div>
            <div className="text-xs text-muted-foreground">Projects</div>
          </div>
          <div className="text-center bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalTasks}
            </div>
            <div className="text-xs text-muted-foreground">Tasks</div>
          </div>
          <div className="text-center bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {completionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Team Roles */}
        <div className="space-y-3">
          {productOwner && (
            <div className="flex items-center space-x-3">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Product Owner:</span>
              <Badge variant="secondary" className="text-xs">
                {productOwner.username}
              </Badge>
            </div>
          )}
          {projectManager && (
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Project Manager:</span>
              <Badge variant="secondary" className="text-xs">
                {projectManager.username}
              </Badge>
            </div>
          )}
        </div>

        {/* Team Members Preview */}
        {teamMembers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">
                Team Members
              </span>
              <Badge variant="outline" className="text-xs">
                {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 6).map((member) => (
                <div
                  key={member.userId}
                  className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-foreground"
                  title={member.username}
                >
                  {member.username.charAt(0).toUpperCase()}
                </div>
              ))}
              {teamMembers.length > 6 && (
                <div className="w-8 h-8 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{teamMembers.length - 6}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Indicator */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Performance</span>
            </div>
            <div className="flex items-center space-x-2">
              {completionRate >= 80 ? (
                <Award className="h-4 w-4 text-green-500" />
              ) : completionRate >= 60 ? (
                <Target className="h-4 w-4 text-yellow-500" />
              ) : (
                <Activity className="h-4 w-4 text-red-500" />
              )}
              <Badge 
                variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {completionRate >= 80 ? 'Excellent' :
                 completionRate >= 60 ? 'Good' : 'Needs Focus'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TeamsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get data with error handling
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useGetTeamsQuery();
  const { data: users = [], isLoading: usersLoading } = useGetUsersWithStatsQuery();
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery();

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    
    return teams.filter(team => {
      return team.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [teams, searchQuery]);

  const isLoading = teamsLoading || usersLoading || projectsLoading;

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalMembers = users?.length || 0;
    const totalProjects = projects?.length || 0;
    const activeTeams = teams?.length || 0;
    const averageTeamSize = totalMembers > 0 && activeTeams > 0 ? Math.round(totalMembers / activeTeams) : 0;
    
    return {
      totalMembers,
      totalProjects,
      activeTeams,
      averageTeamSize
    };
  }, [teams, users, projects]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">Manage and organize your teams</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading teams...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teamsError || !teams) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">Manage and organize your teams</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error loading teams. Please try again.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage teams, members, and track performance across your organization
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>
      
      {/* Header Section with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Team Overview</CardTitle>
          </div>
          <CardDescription>
            Overview of your organization's team statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">
                {overallStats.activeTeams}
              </div>
              <div className="text-xs text-muted-foreground">Active Teams</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {overallStats.totalMembers}
              </div>
              <div className="text-xs text-muted-foreground">Total Members</div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {overallStats.totalProjects}
              </div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {overallStats.averageTeamSize}
              </div>
              <div className="text-xs text-muted-foreground">Avg Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Display */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              No Teams Found
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchQuery ? 
                `No teams found matching "${searchQuery}"` :
                "Create your first team to get started with project collaboration."
              }
            </p>
            {searchQuery ? (
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
              >
                Clear Search
              </Button>
            ) : (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "gap-6",
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "flex flex-col"
        )}>
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.teamId}
              team={team}
              users={users || []}
              projects={projects || []}
            />
          ))}
        </div>
      )}
      
      {/* Results Count */}
      {filteredTeams.length > 0 && (
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Showing {filteredTeams.length} of {teams.length} teams
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;