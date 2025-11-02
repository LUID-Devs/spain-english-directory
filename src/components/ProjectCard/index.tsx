import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/services/apiService";
import { useArchiveProjectMutation, useUnarchiveProjectMutation, useFavoriteProjectMutation, useUnfavoriteProjectMutation } from "@/hooks/useApi";
import { Calendar, Users, CheckCircle, Clock, MoreVertical, Edit, Trash2, Archive, ArchiveRestore, Star } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/stores/userStore";
import EditProjectModal from "@/components/EditProjectModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
      return <Badge variant="secondary" className="text-xs">Archived</Badge>;
    }
    
    // Check if project is actually completed (100% progress)
    if (progress >= 100) {
      return <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    }
    
    // Determine status based on actual progress and due dates
    const now = new Date();
    const endDate = project.endDate ? new Date(project.endDate) : null;
    
    // Only show overdue if project has an end date and is overdue by less than 1 year
    // (to avoid showing very old test projects as overdue)
    if (endDate && endDate < now) {
      const daysPastDue = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysPastDue < 365) {
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
      }
    }
    
    // Default to active for ongoing projects
    return <Badge variant="default" className="text-xs">Active</Badge>;
  };

  if (viewMode === "list") {
    return (
      <>
        <Link to={`/dashboard/projects/${project.id}`}>
          <Card className={cn(
            "hover:shadow-md transition-all duration-200 cursor-pointer group",
            project.archived && "opacity-75 bg-muted"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Main content area */}
                <div className="flex-1 min-w-0 pr-16">
                  {/* Title and badge row */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </h3>
                    {project.archived && (
                      <Badge variant="secondary" className="text-xs">Archived</Badge>
                    )}
                    {getStatusBadge()}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
                    {project.description || "No description available"}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{completedTasks}/{totalTasks} tasks</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {project.updatedAt ? format(new Date(project.updatedAt), "MMM d") : "Unknown"}
                      </span>
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
                    <Progress value={progress} className="flex-1 max-w-32" />
                    <span className="text-sm font-medium text-foreground min-w-0">
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Action buttons area */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {/* Star button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteToggle}
                    disabled={isFavoriting || isUnfavoriting}
                    className="h-8 w-8 p-0"
                  >
                    <Star 
                      className={cn(
                        "h-4 w-4 transition-colors",
                        project.isFavorited 
                          ? "text-yellow-500 fill-yellow-500" 
                          : "text-muted-foreground hover:text-yellow-500"
                      )} 
                    />
                  </Button>

                  {/* Dropdown menu */}
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDropdownClick}
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    
                    {showDropdown && (
                      <div className="absolute right-0 top-9 z-20 bg-background border border-border rounded-lg shadow-lg py-1 w-36 animate-in fade-in-0 zoom-in-95 duration-100">
                        {!project.archived && (
                          <button
                            onClick={(e) => handleMenuAction('edit', e)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                        {project.archived ? (
                          <button
                            onClick={(e) => handleMenuAction('unarchive', e)}
                            disabled={isUnarchiving}
                            className={cn(
                              "flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                              isUnarchiving && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <ArchiveRestore className="h-4 w-4" />
                            {isUnarchiving ? 'Unarchiving...' : 'Unarchive'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleMenuAction('archive', e)}
                            disabled={isArchiving}
                            className={cn(
                              "flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                              isArchiving && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Archive className="h-4 w-4" />
                            {isArchiving ? 'Archiving...' : 'Archive'}
                          </button>
                        )}
                        <button
                          onClick={(e) => handleMenuAction('delete', e)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

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
      <Link to={`/dashboard/projects/${project.id}`}>
        <Card className={cn(
          "hover:shadow-lg transition-all duration-200 cursor-pointer group relative",
          project.archived && "opacity-75 bg-muted"
        )}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-16">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </CardTitle>
                  {project.archived && (
                    <Badge variant="secondary" className="text-xs">Archived</Badge>
                  )}
                </div>
                <CardDescription className="text-muted-foreground text-sm line-clamp-2">
                  {project.description || "No description available"}
                </CardDescription>
              </div>

              {/* Action buttons */}
              <div className="absolute top-5 right-5 flex items-center gap-2">
                {/* Star button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  disabled={isFavoriting || isUnfavoriting}
                  className="h-8 w-8 p-0"
                >
                  <Star 
                    className={cn(
                      "h-4 w-4 transition-colors",
                      project.isFavorited 
                        ? "text-yellow-500 fill-yellow-500" 
                        : "text-muted-foreground hover:text-yellow-500"
                    )} 
                  />
                </Button>

                {/* Dropdown menu */}
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDropdownClick}
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 top-9 z-20 bg-background border border-border rounded-lg shadow-lg py-1 w-36 animate-in fade-in-0 zoom-in-95 duration-100">
                      {!project.archived && (
                        <button
                          onClick={(e) => handleMenuAction('edit', e)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      )}
                      {project.archived ? (
                        <button
                          onClick={(e) => handleMenuAction('unarchive', e)}
                          disabled={isUnarchiving}
                          className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                            isUnarchiving && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <ArchiveRestore className="h-4 w-4" />
                          {isUnarchiving ? 'Unarchiving...' : 'Unarchive'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleMenuAction('archive', e)}
                          disabled={isArchiving}
                          className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors",
                            isArchiving && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Archive className="h-4 w-4" />
                          {isArchiving ? 'Archiving...' : 'Archive'}
                        </button>
                      )}
                      <button
                        onClick={(e) => handleMenuAction('delete', e)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Progress</span>
                <span className="text-sm font-medium text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Tasks</span>
                </div>
                <p className="text-lg font-bold text-foreground mt-1">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Last Update</span>
                </div>
                <p className="text-sm font-bold text-foreground mt-1">
                  {project.updatedAt ? format(new Date(project.updatedAt), "MMM d") : "Unknown"}
                </p>
              </div>
            </div>

            {/* Footer with date and status */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            {progress < 100 && project.endDate && (() => {
              const now = new Date();
              const endDate = new Date(project.endDate);
              const isOverdue = endDate < now;
              const daysPastDue = isOverdue ? Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
              const isDueSoon = endDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              // Only show warning if due soon or overdue by less than 1 year
              return (isDueSoon && (!isOverdue || daysPastDue < 365));
            })() && (
              <div className={cn(
                "mt-3 p-3 border rounded-lg",
                (() => {
                  const now = new Date();
                  const endDate = new Date(project.endDate);
                  const isOverdue = endDate < now;
                  const daysPastDue = isOverdue ? Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  
                  return (isOverdue && daysPastDue < 365)
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                })()
              )}>
                <div className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  (() => {
                    const now = new Date();
                    const endDate = new Date(project.endDate);
                    const isOverdue = endDate < now;
                    const daysPastDue = isOverdue ? Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (isOverdue && daysPastDue < 365)
                      ? "text-destructive"
                      : "text-yellow-800 dark:text-yellow-200";
                  })()
                )}>
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {(() => {
                      const now = new Date();
                      const endDate = new Date(project.endDate);
                      const isOverdue = endDate < now;
                      const daysPastDue = isOverdue ? Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      
                      return (isOverdue && daysPastDue < 365) ? 'Overdue since' : 'Due';
                    })()} {format(new Date(project.endDate), "MMM d")}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

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
