import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useGlobalStore } from "@/stores/globalStore";
import { UserProvider } from "@/components/UserProvider";
import { useAuth } from "@/app/authProvider";
import { TaskModalProvider } from "@/contexts/TaskModalContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarCollapsed, isDarkMode } = useGlobalStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  
  return (
    <UserProvider>
      <TaskModalProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          {/* Sidebar */}
          <Sidebar />
          <main
            className={`flex w-full flex-col transition-all duration-300 ${isSidebarCollapsed ? "" : "md:pl-64"}`}
          >
            <Navbar />
            <div className="flex-1 p-6">
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[DASHBOARD] User not authenticated, redirecting to login...');
      navigate('/auth/login');
    }
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
