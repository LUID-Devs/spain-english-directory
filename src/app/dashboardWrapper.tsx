import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Plus, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useGlobalStore } from "@/stores/globalStore";
import { UserProvider } from "@/components/UserProvider";
import { useAuth } from "@/app/authProvider";
import { TaskModalProvider } from "@/contexts/TaskModalContext";
import { cn } from "@/lib/utils";
import { useSidebarSwipe } from "@/hooks/useSwipeGesture";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isSidebarCollapsed, isDarkMode, toggleSidebar, setIsSidebarCollapsed } = useGlobalStore();

  // Swipe gesture for opening/closing sidebar on mobile
  const swipeRef = useSidebarSwipe(
    !isSidebarCollapsed, // isOpen (sidebar is open when NOT collapsed)
    () => setIsSidebarCollapsed(false), // onOpen - set collapsed to false to open
    () => setIsSidebarCollapsed(true) // onClose - set collapsed to true to close
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (!isSidebarCollapsed && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarCollapsed]);

  return (
    <UserProvider>
      <TaskModalProvider>
        <div ref={swipeRef} className="flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">
          {/* Skip to content link for keyboard navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Skip to main content
          </a>

          {/* Mobile Backdrop Overlay */}
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
              !isSidebarCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={toggleSidebar}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <Sidebar />

          <main
            id="main-content"
            className={cn(
              "flex w-full flex-col transition-all duration-300",
              isSidebarCollapsed ? "" : "lg:pl-64"
            )}
          >
            <Navbar />
            <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 overflow-x-hidden">
              {children}
            </div>

            {/* Mobile quick create menu */}
            <div className="fixed bottom-6 right-6 z-40 lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg"
                    aria-label="Create"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-52">
                  <DropdownMenuItem onClick={() => navigate("/dashboard/projects/create")}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/goals/create")}>
                    <Target className="mr-2 h-4 w-4" />
                    New Initiative
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </main>
        </div>
      </TaskModalProvider>
    </UserProvider>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const gracePeriodRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasCheckedAuth = React.useRef(false);
  const gracePeriodStartTime = React.useRef<number | null>(null);
  // Allow dashboard access as soon as auth is established.
  // userId can be populated slightly later during backend profile hydration.
  const hasValidSession = isAuthenticated;

  useEffect(() => {
    // Clear any existing timeout on re-render
    if (gracePeriodRef.current) {
      clearTimeout(gracePeriodRef.current);
    }

    // Only redirect after grace period to allow auth state to stabilize
    // This prevents race conditions during OAuth callback
    if (!isLoading && !hasValidSession) {
      if (!hasCheckedAuth.current) {
        // First check - wait for grace period
        gracePeriodStartTime.current = Date.now();
        hasCheckedAuth.current = true;
        gracePeriodRef.current = setTimeout(() => {
          const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          navigate(`/auth/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
        }, 3000); // 3 second grace period for OAuth stabilization
      }
    } else if (hasValidSession) {
      // User is authenticated, clear any pending redirect
      if (gracePeriodRef.current) {
        clearTimeout(gracePeriodRef.current);
        gracePeriodRef.current = null;
      }
      hasCheckedAuth.current = false;
      gracePeriodStartTime.current = null;
    }

    return () => {
      if (gracePeriodRef.current) {
        clearTimeout(gracePeriodRef.current);
      }
    };
  }, [hasValidSession, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!hasValidSession) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardWrapper;
