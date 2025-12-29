import React, { useState } from "react";
import { Settings, Menu, Moon, Sun, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalStore } from "@/stores/globalStore";
import { useCurrentUser } from "@/stores/userStore";
import { useAuth } from "@/app/authProvider";
import NavbarSearch from "@/components/NavbarSearch";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isSidebarCollapsed, isDarkMode, toggleSidebar, toggleDarkMode } = useGlobalStore();

  const auth = useAuth();
  const { currentUser } = useCurrentUser();
  
  const handleSignOut = () => {
    auth.logout();
    setShowProfileMenu(false);
  };

  if (!currentUser) return null;

  const currentUserDetails = currentUser?.userDetails;
  console.log('Navbar - Auth & User Data:', auth.user?.sub, currentUser, currentUserDetails);
  return (
    <motion.div 
      className="flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 border-b border-border sticky top-0 z-40"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Left Section - Workspace, Menu & Search */}
      <div className="flex items-center gap-4">
        {/* Workspace Switcher */}
        <WorkspaceSwitcher />

        {/* Divider */}
        <div className="hidden md:block h-8 w-[1px] bg-border"></div>

        {/* Menu Toggle */}
        {isSidebarCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search Bar */}
        <div className="flex h-min w-[200px] md:w-[300px] lg:w-[400px]">
          <NavbarSearch
            className="w-full"
            placeholder="Search projects, tasks, users..."
          />
        </div>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="p-2"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDarkMode ? "moon" : "sun"}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>

        {/* Settings Link */}
        <Button variant="ghost" size="sm" asChild className="p-2">
          <Link to="/dashboard/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>

        {/* Divider */}
        <div className="hidden md:block ml-2 mr-4 h-8 w-[1px] bg-border"></div>

        {/* User Profile Section */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 h-auto"
          >
            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                {currentUserDetails?.profilePictureUrl ? (
                  <img
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${currentUserDetails.profilePictureUrl}`}
                    alt={currentUserDetails.username || "User Profile Picture"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              
              {/* User Name - Hidden on small screens */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  {currentUserDetails?.username || 'User'}
                </span>
              </div>
            </div>

            {/* Dropdown Indicator */}
            <motion.svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: showProfileMenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </Button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                className="absolute right-0 mt-2 w-56 py-2 bg-background border border-border rounded-lg shadow-lg z-50"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    {currentUserDetails?.profilePictureUrl ? (
                      <img
                        src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${currentUserDetails.profilePictureUrl}`}
                        alt={currentUserDetails.username || "User Profile Picture"}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {currentUserDetails?.username || 'User'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Project Manager
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Button variant="ghost" asChild className="w-full justify-start px-4 py-2 h-auto">
                    <Link to="/dashboard/settings">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start px-4 py-2 h-auto text-destructive hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;