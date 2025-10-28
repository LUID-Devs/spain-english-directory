"use client";

import React, { useState } from "react";
import { useGetProjectsQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { Plus, Search, Filter, Grid, List, Archive } from "lucide-react";
import ModalNewProject from "./ModalNewProject";
import ProjectCard from "@/components/ProjectCard";

const ProjectsPage = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "progress">("name");
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: projects, isLoading, isError } = useGetProjectsQuery({ archived: showArchived });
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

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
        <Header name={showArchived ? "Archived Projects" : "Projects"} />
        <div className="flex gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showArchived 
                ? "bg-gray-500 text-white hover:bg-gray-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Show Active" : "Show Archived"}
          </button>
          {!showArchived && (
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