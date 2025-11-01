import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useGlobalStore } from "@/stores/globalStore";
import { UserProvider } from "@/components/UserProvider";
import { useAuth } from "@/app/authProvider";

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
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
        {/* sidebar */}
        <Sidebar />
        <main
          className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${isSidebarCollapsed ? "" : "md:pl-64"}`}
        >
          <Navbar />
          {children}
        </main>
      </div>
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
      <div className="flex min-h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
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
