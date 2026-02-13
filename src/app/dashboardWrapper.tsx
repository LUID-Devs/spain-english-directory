import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useGlobalStore } from "@/stores/globalStore";
import { UserProvider } from "@/components/UserProvider";
import { useAuth } from "@/app/authProvider";
import { TaskModalProvider } from "@/contexts/TaskModalContext";
import { cn } from "@/lib/utils";
import { useSidebarSwipe } from "@/hooks/useSwipeGesture";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
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
            className={cn(
              "flex w-full flex-col transition-all duration-300",
              isSidebarCollapsed ? "" : "lg:pl-64"
            )}
          >
            <Navbar />
            <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </TaskModalProvider>
    </UserProvider>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const gracePeriodRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasCheckedAuth = React.useRef(false);
  const gracePeriodStartTime = React.useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timeout on re-render
    if (gracePeriodRef.current) {
      clearTimeout(gracePeriodRef.current);
    }

    // Only redirect after grace period to allow auth state to stabilize
    // This prevents race conditions during OAuth callback
    if (!isLoading && !isAuthenticated) {
      if (!hasCheckedAuth.current) {
        // First check - wait for grace period
        gracePeriodStartTime.current = Date.now();
        console.log('[DASHBOARD] Auth check complete, not authenticated. Waiting grace period (3s) before redirect...');
        hasCheckedAuth.current = true;
        gracePeriodRef.current = setTimeout(() => {
          const elapsed = Date.now() - (gracePeriodStartTime.current || 0);
          console.log(`[DASHBOARD] Grace period expired (${elapsed}ms), redirecting to login...`);
          navigate('/auth/login');
        }, 3000); // 3 second grace period for OAuth stabilization
      }
    } else if (isAuthenticated) {
      // User is authenticated, clear any pending redirect
      if (gracePeriodRef.current) {
        const elapsed = Date.now() - (gracePeriodStartTime.current || 0);
        console.log(`[DASHBOARD] ✅ User authenticated after ${elapsed}ms, clearing redirect timeout`);
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
  }, [isAuthenticated, isLoading, navigate]);

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
  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardWrapper;
