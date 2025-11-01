
import React, { useState, useEffect } from "react";
import { useGetProjectsQuery } from "@/hooks/useApi";
import { useProjects } from "@/stores/apiStore";
import { useCurrentUser } from "@/stores/userStore";
import Header from "@/components/Header";
import { Plus, Search, Grid, List, Archive, Star, ChevronDown, Filter, FolderPlus, Sparkles, ArrowRight } from "lucide-react";
import ModalNewProject from "@/app/dashboard/projects/ModalNewProject";
import ProjectCard from "@/components/ProjectCard";

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  showArchived: boolean;
  showFavorites: boolean;
  statusFilter: string;
}

const ProjectsPage = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "progress">("name");
  const [showArchived, setShowArchived] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const { currentUser } = useCurrentUser();
  
  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      id: "all",
      label: "All Projects",
      icon: <Filter className="h-4 w-4" />,
      showArchived: false,
      showFavorites: false,
      statusFilter: ""
    },
    {
      id: "favorites",
      label: "Favorites Only",
      icon: <Star className="h-4 w-4" />,
      showArchived: false,
      showFavorites: true,
      statusFilter: ""
    },
    {
      id: "archived",
      label: "Archived Only",
      icon: <Archive className="h-4 w-4" />,
      showArchived: true,
      showFavorites: false,
      statusFilter: ""
    },
    {
      id: "active",
      label: "Active Projects",
      icon: <div className="h-4 w-4 bg-green-500 rounded-full" />,
      showArchived: false,
      showFavorites: false,
      statusFilter: "Active"
    },
    {
      id: "completed",
      label: "Completed Projects",
      icon: <div className="h-4 w-4 bg-blue-500 rounded-full" />,
      showArchived: false,
      showFavorites: false,
      statusFilter: "Completed"
    },
    {
      id: "overdue",
      label: "Overdue Projects",
      icon: <div className="h-4 w-4 bg-red-500 rounded-full" />,
      showArchived: false,
      showFavorites: false,
      statusFilter: "Overdue"
    }
  ];
  
  // Get current filter option
  const getCurrentFilter = (): FilterOption => {
    return filterOptions.find(option => 
      option.showArchived === showArchived &&
      option.showFavorites === showFavorites &&
      option.statusFilter === statusFilter
    ) || filterOptions[0];
  };
  
  // Handle filter change
  const handleFilterChange = (option: FilterOption) => {
    setShowArchived(option.showArchived);
    setShowFavorites(option.showFavorites);
    setStatusFilter(option.statusFilter);
    setIsFilterDropdownOpen(false);
  };
  
  // Wait for user to be loaded before fetching projects (to ensure favorite status is correct)
  const { data: queryProjects, isLoading: queryLoading, isError, refetch } = useGetProjectsQuery({ 
    archived: showArchived, 
    favorites: showFavorites,
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

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFilterDropdownOpen]);

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
              onClick={() => {
                refetch();
              }} 
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
        <Header name={getCurrentFilter().label} />
        <div className="flex gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors min-w-[140px]"
            >
              {getCurrentFilter().icon}
              <span className="flex-1 text-left">{getCurrentFilter().label}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFilterDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleFilterChange(option)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          getCurrentFilter().id === option.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {getCurrentFilter().id === option.id && (
                          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* New Project Button - Only show when viewing all projects */}
          {getCurrentFilter().id === 'all' && (
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-primary to-blue-600 px-6 py-3 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg font-medium text-sm"
            >
              <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span>New Project</span>
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {(() => {
              // Determine the empty state based on different scenarios
              const totalProjects = allProjects?.length || 0;
              const hasSearchTerm = searchTerm.trim().length > 0;
              const isFilteredView = getCurrentFilter().id !== 'all';
              
              if (totalProjects === 0) {
                // Truly no projects at all - Enhanced design
                return (
                  <div className="max-w-md mx-auto">
                    {/* Enhanced illustration */}
                    <div className="relative mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-3xl flex items-center justify-center mb-4 mx-auto transform hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                          <FolderPlus className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </div>
                      {/* Floating decorative elements */}
                      <div className="absolute top-4 left-8 w-3 h-3 bg-blue-300 dark:bg-blue-600 rounded-full opacity-40 animate-pulse"></div>
                      <div className="absolute top-12 right-6 w-2 h-2 bg-purple-300 dark:bg-purple-600 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="absolute bottom-8 left-12 w-2.5 h-2.5 bg-green-300 dark:bg-green-600 rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
                    </div>
                    
                    {/* Enhanced typography */}
                    <div className="space-y-4 mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Let's create something amazing
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        Start your journey by creating your first project. Organize tasks, track progress, and bring your ideas to life.
                      </p>
                    </div>
                    
                    {/* Enhanced CTA button */}
                    <button
                      onClick={() => setIsNewProjectModalOpen(true)}
                      className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-primary to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold text-lg"
                    >
                      <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span>Create Your First Project</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                );
              } else if (hasSearchTerm) {
                // Has projects but search returns no results - Enhanced design
                return (
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      No projects match your search
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Try adjusting your search terms or browse all projects
                    </p>
                  </div>
                );
              } else if (isFilteredView) {
                // Has projects but filter returns no results - Enhanced design
                return (
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <Filter className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      No projects match your current filter
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Try selecting a different filter or view all projects
                    </p>
                  </div>
                );
              } else {
                // Viewing all projects but none found (edge case) - Enhanced design
                return (
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <Archive className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      No projects found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      There might be an issue loading your projects. Try refreshing the page.
                    </p>
                  </div>
                );
              }
            })()}
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