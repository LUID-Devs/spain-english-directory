import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useGlobalStore } from "@/stores/globalStore";
import { UserProvider } from "@/components/UserProvider";

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
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardWrapper;
