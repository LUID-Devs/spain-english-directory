import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/services/apiService";
import { useArchiveProjectMutation, useUnarchiveProjectMutation, useFavoriteProjectMutation, useUnfavoriteProjectMutation } from "@/hooks/useApi";
import { Calendar, Users, CheckCircle, Clock, MoreVertical, Edit, Trash2, Archive, ArchiveRestore, Star } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/stores/userStore";
import EditProjectModal from "@/components/EditProjectModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface ProjectCardProps {
  project: Project;
  viewMode?: "grid" | "list";
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode = "grid" }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [archiveProject, { isLoading: isArchiving }] = useArchiveProjectMutation();
  const [unarchiveProject, { isLoading: isUnarchiving }] = useUnarchiveProjectMutation();
  const [favoriteProject, { isLoading: isFavoriting }] = useFavoriteProjectMutation();
  const [unfavoriteProject, { isLoading: isUnfavoriting }] = useUnfavoriteProjectMutation();
  
  const { currentUser } = useCurrentUser();

  
  const daysSinceStart = project.startDate ? 
    Math.floor((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);
  
  // Use real statistics or fallback to defaults
  const progress = project.statistics?.progress || 0;
  const totalTasks = project.statistics?.totalTasks || project.taskCount || 0;
  const completedTasks = project.statistics?.completedTasks || 0;
  const memberCount = project.statistics?.memberCount || project.teamMembers?.length || 0;
  const projectStatus = project.statistics?.status || 'Active';

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleMenuAction = async (action: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    
    switch(action) {
      case 'edit':
        setShowEditModal(true);
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
      case 'archive':
        try {
          await archiveProject(project.id).unwrap();
        } catch (err) {
          console.error('Failed to archive project:', err);
        }
        break;
      case 'unarchive':
        try {
          await unarchiveProject(project.id).unwrap();
        } catch (err) {
          console.error('Failed to unarchive project:', err);
        }
        break;
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser?.userId) return;
    
    try {
      if (project.isFavorited) {
        await unfavoriteProject({ id: project.id, userId: currentUser.userId }).unwrap();
      } else {
        await favoriteProject({ id: project.id, userId: currentUser.userId }).unwrap();
      }
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      
      // Handle specific backend error messages
      if (error?.message === 'Project already favorited' || error?.message === 'Favorite not found') {
        // These errors indicate the frontend state is out of sync with backend
        // The optimistic update will be corrected by the cache invalidation
        console.log('Favorite state out of sync, cache will refresh');
      } else {
        // For other errors, the mutation itself handles the toast notification
        console.error('Unexpected error toggling favorite:', error);
      }
    }
  };

  const getStatusBadge = () => {
    // If project is archived, show archived status instead of normal status
    if (project.archived) {
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">📦 Archived</span>;
    }
    
    switch(projectStatus) {
      case 'Completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
      case 'Overdue':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Overdue</span>;
      case 'Active':
      default:
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
    }
  };

  if (viewMode === "list") {
    return (
      <>
        <div className="relative">
          <Link to={`/dashboard/projects/${project.id}`}>
            <div className={`bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group ${
              project.archived ? 'opacity-75 bg-gray-50 dark:bg-gray-800' : ''
            }`}>
              <div className="flex items-center justify-between">
                {/* Main content area */}
                <div className="flex-1 min-w-0 pr-16">
                  {/* Title and badge row */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {project.name}
                    </h3>
                    {project.archived && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                        📦 Archived
                      </span>
                    )}
                    {getStatusBadge()}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                    {project.description || "No description available"}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{completedTasks}/{totalTasks} tasks</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{memberCount} members</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {project.startDate ? format(new Date(project.startDate), "MMM d") : "No date"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{daysSinceStart} days ago</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Action buttons area */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {/* Star button */}
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={isFavoriting || isUnfavoriting}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      isFavoriting || isUnfavoriting 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110'
                    }`}
                    title={project.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star 
                      className={`h-4 w-4 transition-colors ${
                        project.isFavorited 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`} 
                    />
                  </button>

                  {/* Dropdown menu */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={handleDropdownClick}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                    
                    {showDropdown && (
                      <div className="absolute right-0 top-9 z-20 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 w-36 animate-in fade-in-0 zoom-in-95 duration-100">
                        {!project.archived && (
                          <button
                            onClick={(e) => handleMenuAction('edit', e)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                        {project.archived ? (
                          <button
                            onClick={(e) => handleMenuAction('unarchive', e)}
                            disabled={isUnarchiving}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              isUnarchiving ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <ArchiveRestore className="h-4 w-4" />
                            {isUnarchiving ? 'Unarchiving...' : 'Unarchive'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleMenuAction('archive', e)}
                            disabled={isArchiving}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              isArchiving ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Archive className="h-4 w-4" />
                            {isArchiving ? 'Archiving...' : 'Archive'}
                          </button>
                        )}
                        <button
                          onClick={(e) => handleMenuAction('delete', e)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Modals for list view */}
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={project}
        />
        
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          project={project}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <Link to={`/dashboard/projects/${project.id}`}>
          <div className={`bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group ${
            project.archived ? 'opacity-75 bg-gray-50 dark:bg-gray-800' : ''
          }`}>
            {/* Header with title and badges */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-16">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {project.name}
                  </h3>
                  {project.archived && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                      📦 Archived
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                  {project.description || "No description available"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="absolute top-5 right-5 flex items-center gap-2">
                {/* Star button */}
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isFavoriting || isUnfavoriting}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isFavoriting || isUnfavoriting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110'
                  }`}
                  title={project.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star 
                    className={`h-5 w-5 transition-colors ${
                      project.isFavorited 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`} 
                  />
                </button>

                {/* Dropdown menu */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={handleDropdownClick}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 top-11 z-20 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 w-36 animate-in fade-in-0 zoom-in-95 duration-100">
                      {!project.archived && (
                        <button
                          onClick={(e) => handleMenuAction('edit', e)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      )}
                      {project.archived ? (
                        <button
                          onClick={(e) => handleMenuAction('unarchive', e)}
                          disabled={isUnarchiving}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            isUnarchiving ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <ArchiveRestore className="h-4 w-4" />
                          {isUnarchiving ? 'Unarchiving...' : 'Unarchive'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleMenuAction('archive', e)}
                          disabled={isArchiving}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            isArchiving ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Archive className="h-4 w-4" />
                          {isArchiving ? 'Archiving...' : 'Archive'}
                        </button>
                      )}
                      <button
                        onClick={(e) => handleMenuAction('delete', e)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress section */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Tasks</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Members</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {memberCount}
                </p>
              </div>
            </div>

            {/* Footer with date and status */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "No start date"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge()}
              </div>
            </div>

            {/* Due date warning */}
            {projectStatus !== 'Completed' && project.endDate && new Date(project.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
              <div className={`mt-4 p-3 border rounded-lg ${
                projectStatus === 'Overdue' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  projectStatus === 'Overdue'
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {projectStatus === 'Overdue' ? 'Overdue since' : 'Due'} {format(new Date(project.endDate), "MMM d")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Modals */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
      />
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        project={project}
      />
    </>
  );
};

export default ProjectCard;
