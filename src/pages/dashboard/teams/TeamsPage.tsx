import React, { useState, useMemo } from "react";
import { useGetTeamsQuery, useGetUsersWithStatsQuery, useGetProjectsQuery } from "@/hooks/useApi";
import Header from "@/components/Header";
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
  Briefcase,
  Activity,
  Award,
  Target
} from "lucide-react";

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
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {team.teamName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Team ID: {team.teamId}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-10 z-10 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 w-48">
              <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserPlus className="h-4 w-4" />
                <span>Add Member</span>
              </button>
              <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="h-4 w-4" />
                <span>Team Settings</span>
              </button>
              <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Mail className="h-4 w-4" />
                <span>Send Invitation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.memberCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.projectCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalTasks}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {completionRate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
        </div>
      </div>

      {/* Team Roles */}
      <div className="space-y-3 mb-6">
        {productOwner && (
          <div className="flex items-center space-x-3">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Product Owner:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {productOwner.username}
            </span>
          </div>
        )}
        {projectManager && (
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Project Manager:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {projectManager.username}
            </span>
          </div>
        )}
      </div>

      {/* Team Members Preview */}
      {teamMembers.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Members
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 6).map((member, index) => (
              <div
                key={member.userId}
                className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border-2 border-white dark:border-dark-secondary flex items-center justify-center text-xs font-medium text-white"
                title={member.username}
              >
                {member.username.charAt(0).toUpperCase()}
              </div>
            ))}
            {teamMembers.length > 6 && (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-dark-secondary flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                +{teamMembers.length - 6}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Indicator */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
          </div>
          <div className="flex items-center space-x-1">
            {completionRate >= 80 ? (
              <Award className="h-4 w-4 text-green-500" />
            ) : completionRate >= 60 ? (
              <Target className="h-4 w-4 text-yellow-500" />
            ) : (
              <Activity className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              completionRate >= 80 ? 'text-green-600 dark:text-green-400' :
              completionRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {completionRate >= 80 ? 'Excellent' :
               completionRate >= 60 ? 'Good' : 'Needs Focus'}
            </span>
          </div>
        </div>
      </div>
    </div>
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
      <div className="flex w-full flex-col p-8">
        <Header name="Teams" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (teamsError || !teams) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name="Teams" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading teams</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Team Management" />
      
      {/* Header Section with Stats */}
      <div className="mb-6 bg-white dark:bg-dark-secondary rounded-lg p-6 shadow">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold dark:text-white">
                Team Overview
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage teams, members, and track performance across your organization
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overallStats.activeTeams}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Active Teams</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {overallStats.totalMembers}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Total Members</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {overallStats.totalProjects}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Projects</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {overallStats.averageTeamSize}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Avg Size</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "grid" 
                    ? "bg-blue-500 text-white" 
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "list" 
                    ? "bg-blue-500 text-white" 
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                List
              </button>
            </div>
            
            {/* Create Team Button */}
            <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teams Grid/List */}
      {filteredTeams.length === 0 ? (
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-12 shadow text-center">
          <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Teams Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery ? 
              `No teams found matching "${searchQuery}"` :
              "Create your first team to get started with project collaboration."
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? 
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
          "space-y-4"
        }>
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
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Showing {filteredTeams.length} of {teams.length} teams
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;