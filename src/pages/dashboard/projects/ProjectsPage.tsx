
import React, { useState, useEffect } from "react";
import { useGetProjectsQuery } from "@/hooks/useApi";
import { useProjects } from "@/stores/apiStore";
import { useCurrentUser } from "@/stores/userStore";
import Header from "@/components/Header";
import { Plus, Search, Grid, List, Archive, Star } from "lucide-react";
import ModalNewProject from "@/app/dashboard/projects/ModalNewProject";
import ProjectCard from "@/components/ProjectCard";

const ProjectsPage = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "progress">("name");
  const [showArchived, setShowArchived] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { currentUser } = useCurrentUser();
  
  // Wait for user to be loaded before fetching projects (to ensure favorite status is correct)
  const { data: queryProjects, isLoading: queryLoading, isError, refetch } = useGetProjectsQuery({ 
    archived: showArchived, 
    favorites: showFavorites,
    userId: currentUser?.userId,
    status: statusFilter || undefined
  }, { 
    skip: !currentUser?.userId // Skip fetching until we have a user ID
  });
  
  // Subscribe directly to store for real-time updates
  const projectsStore = useProjects();
  
  // Use store data if available, otherwise fall back to query data
  const projects = projectsStore.data || queryProjects;
  const isLoading = projectsStore.isLoading || queryLoading;
  
  // Refetch when filters change or when user becomes available
  useEffect(() => {
    if (currentUser?.userId) {
      refetch();
    }
  }, [showArchived, showFavorites, statusFilter, currentUser?.userId, refetch]);

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
      <div className="flex w-full flex-col p-8">
        <Header name="Projects" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col p-8">
        <Header name="Projects" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading projects</p>
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
      <div className="flex items-center justify-between mb-6">
        <Header name={
          showFavorites ? "Favorite Projects" : 
          showArchived ? "Archived Projects" : 
          statusFilter ? `${statusFilter} Projects` : 
          "Projects"
        } />
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowFavorites(!showFavorites);
              if (!showFavorites) {
                setShowArchived(false); // Turn off archived when showing favorites
                setStatusFilter(""); // Clear status filter when showing favorites
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFavorites 
                ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Star className="h-4 w-4" />
            {showFavorites ? "Show All" : "Show Favorites"}
          </button>
          <button
            onClick={() => {
              setShowArchived(!showArchived);
              if (!showArchived) {
                setShowFavorites(false); // Turn off favorites when showing archived
                setStatusFilter(""); // Clear status filter when showing archived
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showArchived 
                ? "bg-gray-500 text-white hover:bg-gray-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Show Active" : "Show Archived"}
          </button>
          
          {/* Status Filter Dropdown */}
          {!showArchived && (
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  if (e.target.value) {
                    setShowFavorites(false); // Clear favorites when filtering by status
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          )}
          
          {!showArchived && !showFavorites && !statusFilter && (
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center gap-2 bg-blue-primary px-4 py-2 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-secondary dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "date" | "progress")}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-secondary dark:border-gray-600 dark:text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="progress">Sort by Progress</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg dark:border-gray-600">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" 
                ? "bg-blue-500 text-white" 
                : "bg-white text-gray-600 dark:bg-dark-secondary dark:text-gray-400"
              } rounded-l-lg`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" 
                ? "bg-blue-500 text-white" 
                : "bg-white text-gray-600 dark:bg-dark-secondary dark:text-gray-400"
              } rounded-r-lg`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {sortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {projects?.length === 0 ? "No projects yet" : "No projects match your search"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {projects?.length === 0 
                ? "Get started by creating your first project" 
                : "Try adjusting your search terms"
              }
            </p>
            {projects?.length === 0 && (
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-blue-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Your First Project
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
        }>
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
    </div>
  );
};

export default ProjectsPage;