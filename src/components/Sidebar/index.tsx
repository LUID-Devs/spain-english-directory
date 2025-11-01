import React, { useState } from "react";
import {
  LockIcon,
  LucideIcon,
  Home,
  X,
  Briefcase,
  Search,
  Settings,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  AlertOctagon,
  AlertTriangle,
  Layers3,
  ShieldAlert,
  Clock,
  Star,
  Pin,
  Plus,
  FolderOpen,
  Activity,
  Target,
  BarChart3,
  Calendar,
  BookOpen,
  Archive,
  Zap
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useGlobalStore } from "@/stores/globalStore";
import { useGetProjectsQuery, useGetTeamsQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useAuth } from "@/app/authProvider";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(false);
  const [showPriority, setShowPriority] = useState(false);

  const { isSidebarCollapsed, toggleSidebar } = useGlobalStore();

  const auth = useAuth();
  const { currentUser } = useCurrentUser();

  const { data: projects } = useGetProjectsQuery({}, {
    skip: isSidebarCollapsed, // Skip loading if sidebar is collapsed
  });
  const { data: teams } = useGetTeamsQuery(undefined, {
    skip: isSidebarCollapsed, // Skip loading if sidebar is collapsed
  });
  
  const handleSignOut = () => {
    auth.logout();
  }
  
  if (!currentUser) return null;

  const currentUserDetails = currentUser;
  const userTeam = teams?.find(team => team.teamId === currentUser.teamId);

  // Get favorite/pinned projects (first 3-5 projects as example)
  const favoriteProjects = projects?.slice(0, 4) || [];
  const remainingProjectsCount = (projects?.length || 0) - favoriteProjects.length;

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}`;
  
  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        {/* TOP LOGO */}
        <div className="z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black">
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            TaskLuid
          </div>
          {isSidebarCollapsed ? null : (
            <button
              className="py-3"
              onClick={() => {
                toggleSidebar();
              }}
            >
              <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            </button>
          )}
        </div>

        {/* TEAM INFO */}
        <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {(userTeam?.teamName || 'My Team').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-md font-bold tracking-wide dark:text-gray-200">
              {userTeam?.teamName || 'My Team'}
            </h3>
            <div className="mt-1 flex items-start gap-2">
              <LockIcon className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500">Private</p>
            </div>
          </div>
        </div>

        {/* MY WORK SECTION */}
        <div className="px-6 py-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            MY WORK
          </h4>
          <nav className="space-y-1">
            <SidebarLink href="/" icon={Home} label="Dashboard" />
            <SidebarLink href="/dashboard/timeline" icon={Activity} label="Timeline" />
            <SidebarLink href="/dashboard/search" icon={Search} label="Search" />
          </nav>
        </div>

        {/* TEAMS SECTION */}
        <div className="px-6 py-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            TEAMS
          </h4>
          <nav className="space-y-1">
            <SidebarLink href="/dashboard/teams" icon={Users} label="All Teams" />
            <SidebarLink href="/dashboard/users" icon={User} label="Members" />
            
            {/* Projects Subsection */}
            <div className="ml-4 mt-2">
              <button
                onClick={() => setShowProjects((prev) => !prev)}
                className="flex w-full items-center justify-between py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  {projects && projects.length > 0 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {projects.length}
                    </span>
                  )}
                  {showProjects ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>
              
              {showProjects && (
                <div className="ml-4 mt-1 space-y-1">
                  <SidebarLink
                    href="/dashboard/projects"
                    icon={FolderOpen}
                    label="All Projects"
                    isSubItem
                  />
                  {favoriteProjects.map((project) => (
                    <SidebarLink
                      key={`projects-${project.id}`}
                      href={`/dashboard/projects/${project.id}`}
                      icon={Briefcase}
                      label={project.name}
                      isSubItem
                    />
                  ))}
                  {remainingProjectsCount > 0 && (
                    <div className="py-1 px-2 text-xs text-gray-500 dark:text-gray-400">
                      +{remainingProjectsCount} more projects
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Priority Subsection */}
            <div className="ml-4 mt-2">
              <button
                onClick={() => setShowPriority((prev) => !prev)}
                className="flex w-full items-center justify-between py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Priority</span>
                </div>
                {showPriority ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {showPriority && (
                <div className="ml-4 mt-1 space-y-1">
                  <SidebarLink
                    href="/dashboard/priority/urgent"
                    icon={CircleAlert}
                    label="Urgent"
                    isSubItem
                    badge="danger"
                  />
                  <SidebarLink
                    href="/dashboard/priority/high"
                    icon={ShieldAlert}
                    label="High"
                    isSubItem
                    badge="warning"
                  />
                  <SidebarLink
                    href="/dashboard/priority/medium"
                    icon={AlertTriangle}
                    label="Medium"
                    isSubItem
                  />
                  <SidebarLink 
                    href="/dashboard/priority/low" 
                    icon={AlertOctagon} 
                    label="Low" 
                    isSubItem
                  />
                  <SidebarLink
                    href="/dashboard/priority/backlog"
                    icon={Layers3}
                    label="Backlog"
                    isSubItem
                  />
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* USER PROFILE (Mobile) */}
      <div className="z-10 flex w-full flex-col items-center gap-4 bg-white px-6 py-4 dark:bg-black border-t border-gray-200 dark:border-gray-700 md:hidden">
        <div className="flex w-full items-center">
          <div className="align-center flex h-9 w-9 justify-center">
            {!!currentUserDetails?.profilePictureUrl ? (
              <img
                src={`https://pm-s3-images.s3.us-east-1.amazonaws.com/${currentUserDetails?.profilePictureUrl}`}
                alt={currentUserDetails?.username || "User Profile Picture"}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUserDetails?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          <span className="mx-3 text-gray-600 dark:text-white">{currentUserDetails?.username}</span>
          <button 
            className="self-start rounded bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors md:block" 
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCompact?: boolean;
  isSubItem?: boolean;
  badge?: "danger" | "warning" | "success" | "info";
}

const SidebarLink = ({ href, icon: Icon, label, isCompact = false, isSubItem = false, badge }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive =
    location.pathname === href || 
    (location.pathname === "/" && href === "/") ||
    (href !== "/" && location.pathname.startsWith(href));

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case "danger": return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case "warning": return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "success": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "info": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  return (
    <Link to={href} className="block">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors rounded-lg ${
          isActive 
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        } ${isCompact ? "py-1.5 px-3" : "py-2 px-3"} ${isSubItem ? "text-sm" : ""}`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />
        )}
        <Icon className={`${isCompact || isSubItem ? "h-4 w-4" : "h-5 w-5"} ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
        <span className={`font-medium ${isActive ? "text-blue-700 dark:text-blue-300" : ""} flex-1`}>
          {label}
        </span>
        {badge && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getBadgeColor(badge)}`}>
            •
          </span>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;