import React, { useState } from "react";
import {
  LockIcon,
  LucideIcon,
  Home,
  X,
  Briefcase,
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
  Zap,
  CheckSquare,
  ClipboardList,
  UserPlus
} from "lucide-react";
import InviteToWorkspaceModal from "@/components/InviteToWorkspaceModal";
import { useLocation, Link } from "react-router-dom";
import { useGlobalStore } from "@/stores/globalStore";
import { useGetProjectsQuery, useGetTeamsQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useAuth } from "@/app/authProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

  const sidebarClassNames = cn(
    // Base styles
    "fixed flex flex-col h-full justify-between z-50 bg-background border-r border-border overflow-y-auto",
    "transition-transform duration-300 ease-in-out",
    // Mobile: slide drawer behavior
    "w-72 sm:w-64",
    isSidebarCollapsed ? "-translate-x-full" : "translate-x-0",
    // Desktop: always visible when not collapsed
    "lg:translate-x-0",
    isSidebarCollapsed && "lg:-translate-x-full lg:w-0",
    "shadow-lg lg:shadow-sm"
  );
  
  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        {/* TOP LOGO */}
        <div className="z-50 flex min-h-[56px] w-64 items-center justify-between bg-background px-6 pt-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="LUID"
              className="h-8 w-8 rounded"
            />
            <span className="text-xl font-bold text-foreground">TaskLuid</span>
          </div>
          {isSidebarCollapsed ? null : (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* WORKSPACE INFO */}
        <div className="flex items-center gap-5 border-y border-border px-8 py-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {auth.activeOrganization?.settings?.isPersonal
                ? (currentUser?.username?.charAt(0) || 'P').toUpperCase()
                : (auth.activeOrganization?.name?.charAt(0) || 'W').toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-md font-bold tracking-wide text-foreground">
              {auth.activeOrganization?.settings?.isPersonal
                ? 'Personal Workspace'
                : auth.activeOrganization?.name || 'My Workspace'}
            </h3>
            <div className="mt-1 flex items-start gap-2">
              <LockIcon className="mt-[0.1rem] h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Private</p>
            </div>
          </div>
        </div>

        {/* MY WORK SECTION */}
        <div className="px-6 py-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            MY WORK
          </h4>
          <nav className="space-y-1">
            <SidebarLink href="/" icon={Home} label="Dashboard" />
            <SidebarLink href="/dashboard/tasks" icon={CheckSquare} label="My Tasks" />
            <SidebarLink href="/dashboard/projects" icon={Briefcase} label="Projects" />
            <SidebarLink href="/dashboard/timeline" icon={Activity} label="Timeline" />
          </nav>
        </div>

        {/* QUICK ACCESS SECTION */}
        {favoriteProjects.length > 0 && (
          <div className="px-6 py-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              PINNED PROJECTS
            </h4>
            <nav className="space-y-1">
              {favoriteProjects.map((project) => (
                <SidebarLink
                  key={`favorite-${project.id}`}
                  href={`/dashboard/projects/${project.id}`}
                  icon={Pin}
                  label={project.name}
                  isSubItem
                />
              ))}
            </nav>
          </div>
        )}

        {/* PRIORITY TASKS SECTION */}
        <div className="px-6 py-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            PRIORITY TASKS
          </h4>
          <nav className="space-y-1">
            <SidebarLink
              href="/dashboard/priority/urgent"
              icon={CircleAlert}
              label="Urgent"
              badge="danger"
            />
            <SidebarLink
              href="/dashboard/priority/high"
              icon={ShieldAlert}
              label="High Priority"
              badge="warning"
            />
            <SidebarLink
              href="/dashboard/priority/medium"
              icon={AlertTriangle}
              label="Medium Priority"
            />
            <SidebarLink 
              href="/dashboard/priority/low" 
              icon={AlertOctagon} 
              label="Low Priority" 
            />
            <SidebarLink
              href="/dashboard/priority/backlog"
              icon={Layers3}
              label="Backlog"
            />
          </nav>
        </div>

        {/* TEAMS SECTION */}
        <div className="px-6 py-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            TEAM
          </h4>
          <nav className="space-y-1">
            <SidebarLink href="/dashboard/teams" icon={Users} label="Members" />
            {/* Invite Members - only for team workspaces */}
            {!auth.activeOrganization?.settings?.isPersonal && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Members</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteToWorkspaceModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* USER PROFILE (Mobile) */}
      <div className="z-10 flex w-full flex-col items-center gap-4 bg-background px-6 py-4 border-t border-border md:hidden">
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
          <span className="mx-3 text-foreground">{currentUserDetails?.username}</span>
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

  const getBadgeVariant = (badgeType: string) => {
    switch (badgeType) {
      case "danger": return "destructive";
      case "warning": return "secondary";
      case "success": return "default";
      case "info": return "outline";
      default: return "secondary";
    }
  };

  return (
    <Link to={href} className="block">
      <div
        className={cn(
          "relative flex cursor-pointer items-center gap-3 transition-colors rounded-md",
          // Touch-friendly: minimum 44px height
          "min-h-[44px]",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70",
          isCompact ? "py-2 px-3" : "py-2.5 px-3",
          isSubItem ? "text-sm ml-2" : ""
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r" />
        )}
        <Icon className={cn(
          isCompact || isSubItem ? "h-4 w-4" : "h-5 w-5",
          isActive ? "text-primary" : ""
        )} />
        <span className={cn(
          "font-medium flex-1",
          isActive ? "text-foreground" : ""
        )}>
          {label}
        </span>
        {badge && (
          <Badge variant={getBadgeVariant(badge) as any} className="h-2 w-2 p-0 rounded-full" />
        )}
      </div>
    </Link>
  );
};

export default Sidebar;