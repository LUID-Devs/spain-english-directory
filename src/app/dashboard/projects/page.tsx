
import React, { useState } from "react";
import { useGetProjectsQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { Plus, Search, Grid3X3, List, Archive, Star, Filter, MoreHorizontal, SortAsc } from "lucide-react";
import ModalNewProject from "./ModalNewProject";
import ProjectCard from "@/components/ProjectCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const ProjectsPage = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "progress">("name");
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "archived">("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { currentUser } = useCurrentUser();
  const { data: projects, isLoading, isError } = useGetProjectsQuery({ 
    archived: activeTab === "archived", 
    favorites: activeTab === "favorites",
    userId: currentUser?.userId,
    status: statusFilter || undefined
  });

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

  const getTabTitle = () => {
    switch (activeTab) {
      case "favorites": return "Favorite Projects";
      case "archived": return "Archived Projects";
      default: return "Projects";
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">{getTabTitle()}</h1>
          <p className="text-muted-foreground">
            {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''} 
            {statusFilter && ` with ${statusFilter.toLowerCase()} status`}
          </p>
        </div>
        {activeTab === "all" && (
          <Button onClick={() => setIsNewProjectModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </TabsTrigger>
          </TabsList>
          
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
        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Sort by Name</SelectItem>
                      <SelectItem value="date">Sort by Date</SelectItem>
                      <SelectItem value="progress">Sort by Progress</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {activeTab !== "archived" && (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
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
                  {projects?.length === 0 ? "No projects yet" : "No projects match your search"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  {projects?.length === 0 
                    ? "Get started by creating your first project to organize your work" 
                    : "Try adjusting your search terms or filters"
                  }
                </p>
                {projects?.length === 0 && activeTab === "all" && (
                  <Button onClick={() => setIsNewProjectModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
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
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Project Modal */}
      <ModalNewProject
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};

export default ProjectsPage;