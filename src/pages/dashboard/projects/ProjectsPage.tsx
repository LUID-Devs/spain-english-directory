
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProjectsQuery } from "@/hooks/useApi";
import { useProjects } from "@/stores/apiStore";
import { useCurrentUser } from "@/stores/userStore";
import { useAuth } from "@/app/authProvider";
import { useSubscription } from "@/stores/subscriptionStore";
import { Plus, Search, Grid3X3, List, Archive, Star, Filter, SortAsc, FolderPlus, Lock, Building2, Crown } from "lucide-react";
import ModalNewProject from "@/app/dashboard/projects/ModalNewProject";
import ProjectCard from "@/components/ProjectCard";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Free tier project limit
const FREE_PROJECT_LIMIT = 1;

const ProjectsPage = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "progress">("name");
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "archived">("all");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { currentUser } = useCurrentUser();
  const { activeOrganization } = useAuth();
  const { isPro } = useSubscription();

  /**
   * Check if user can create a new project
   * Free users are limited to FREE_PROJECT_LIMIT projects
   * Pro users have unlimited projects
   */
  const canCreateProject = (currentProjectCount: number): boolean => {
    if (isPro) return true;
    return currentProjectCount < FREE_PROJECT_LIMIT;
  };

  /**
   * Handle new project button click
   * Shows upgrade modal if user has reached their project limit
   */
  const handleNewProjectClick = () => {
    const totalProjects = allProjects?.length ?? 0;
    if (canCreateProject(totalProjects)) {
      if (window.innerWidth < 768) {
        navigate("/dashboard/projects/create");
      } else {
        setIsNewProjectModalOpen(true);
      }
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const handleNewProjectMobileClick = () => {
    const totalProjects = allProjects?.length ?? 0;
    if (canCreateProject(totalProjects)) {
      navigate("/dashboard/projects/create");
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "favorites": return "Favorite Projects";
      case "archived": return "Archived Projects";
      default: return "Projects";
    }
  };
  
  // Wait for user to be loaded before fetching projects (to ensure favorite status is correct)
  const { data: queryProjects, isLoading: queryLoading, isError, refetch } = useGetProjectsQuery({ 
    archived: activeTab === "archived", 
    favorites: activeTab === "favorites",
    userId: currentUser?.userId,
    status: statusFilter || undefined
  }, { 
    skip: !currentUser?.userId // Skip fetching until we have a user ID
  });
  
  // Fetch all projects to get total count for empty state logic
  const { data: allProjects } = useGetProjectsQuery({ 
    archived: false, 
    favorites: false,
    userId: currentUser?.userId
    // No status filter to get all projects
  }, { 
    skip: !currentUser?.userId // Skip fetching until we have a user ID
  });
  
  // Subscribe directly to store for real-time updates
  const projectsStore = useProjects();
  
  // Use store data if available, otherwise fall back to query data
  const projects = projectsStore.data || queryProjects;
  const isLoading = projectsStore.isLoading || queryLoading;
  
  // Auto-refetch is now handled by the useGetProjectsQuery hook itself
  // No manual refetch needed here

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime();
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage and organize your projects</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage and organize your projects</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error loading projects. Please try again.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
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
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Workspace Indicator */}
      {activeOrganization && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-muted/50 rounded-lg border border-border">
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            Projects in{' '}
            <span className="font-medium text-foreground">
              {activeOrganization.settings?.isPersonal
                ? 'Personal Workspace'
                : activeOrganization.name}
            </span>
            {' '}are private
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getTabTitle()}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''}
            {statusFilter && ` with ${statusFilter.toLowerCase()} status`}
          </p>
        </div>
        {activeTab === "all" && (
          <div className="w-full sm:w-auto">
            <Button
              onClick={handleNewProjectClick}
              className="hidden sm:inline-flex w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
              {!isPro && (allProjects?.length ?? 0) >= FREE_PROJECT_LIMIT && (
                <Crown className="h-4 w-4 ml-2 text-amber-400" />
              )}
            </Button>
            <Button
              onClick={handleNewProjectMobileClick}
              className="sm:hidden w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
              {!isPro && (allProjects?.length ?? 0) >= FREE_PROJECT_LIMIT && (
                <Crown className="h-4 w-4 ml-2 text-amber-400" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="shrink-0"
          >
            All
          </Button>
          <Button
            variant={activeTab === "favorites" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("favorites")}
            className="shrink-0"
          >
            <Star className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Favorites</span>
          </Button>
          <Button
            variant={activeTab === "archived" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("archived")}
            className="shrink-0"
          >
            <Archive className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Archived</span>
          </Button>
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

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "date" | "progress")}>
                <SelectTrigger className="w-full sm:w-40">
                  <SortAsc className="h-4 w-4 mr-2 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="progress">Sort by Progress</SelectItem>
                </SelectContent>
              </Select>

              {activeTab !== "archived" && (
                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-full sm:w-32">
                    <Filter className="h-4 w-4 mr-2 shrink-0" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Display */}
      {sortedProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {allProjects?.length === 0 ? "No projects yet" : "No projects match your search"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {allProjects?.length === 0 
                ? "Get started by creating your first project to organize your work" 
                : "Try adjusting your search terms or filters"
              }
            </p>
            {allProjects?.length === 0 && activeTab === "all" && (
              <div className="flex justify-center">
                <Button
                  onClick={handleNewProjectClick}
                  className="hidden sm:inline-flex"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
                <Button
                  onClick={handleNewProjectMobileClick}
                  className="sm:hidden"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
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
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <ModalNewProject
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />

      {/* Upgrade to Pro Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Unlock Unlimited Projects"
        message="Free users are limited to 1 project. Upgrade to Pro to create unlimited projects and unlock all premium features."
        features={[
          'Unlimited projects',
          'Unlimited tasks per project',
          'AI-powered task suggestions',
          'Advanced analytics and reporting',
          'Priority support',
          'Access to all LUID apps',
        ]}
      />
    </div>
  );
};

export default ProjectsPage;
