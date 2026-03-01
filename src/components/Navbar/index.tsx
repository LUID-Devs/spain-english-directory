import React, { useState, useEffect, useRef } from "react";
import { Settings, Menu, Moon, Sun, User, LogOut, X, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalStore } from "@/stores/globalStore";
import { useCurrentUser } from "@/stores/userStore";
import { useAuth } from "@/app/authProvider";
import NavbarSearchComponent, { NavbarSearchRef } from "@/components/NavbarSearch";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { PRReviewNotifications } from "@/components/gitReview";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { isSidebarCollapsed, isDarkMode, toggleSidebar, toggleDarkMode } = useGlobalStore();
  const navbarSearchRef = useRef<NavbarSearchRef>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    queueMicrotask(() => setPrefersReducedMotion(mediaQuery.matches));

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle / shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Don't trigger if modal is open
      const isModalOpen = document.querySelector('[role="dialog"]') !== null;

      if (e.key === '/' && !isTyping && !isModalOpen) {
        e.preventDefault();
        navbarSearchRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const auth = useAuth();
  const { currentUser } = useCurrentUser();

  const handleSignOut = () => {
    auth.logout();
    setShowProfileMenu(false);
  };

  if (!currentUser) return null;

  const currentUserDetails = currentUser;
  return (
    <>
    <motion.div
      className="flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 py-2 sm:py-3 border-b border-border sticky top-0 z-30"
      initial={{ y: prefersReducedMotion ? 0 : -100 }}
      animate={{ y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
    >
      {/* Left Section - Menu, Workspace & Search */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Menu Toggle - Always show on mobile, conditional on desktop */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="min-h-[44px] min-w-[44px] p-2 lg:hidden"
          aria-label={isSidebarCollapsed ? "Open menu" : "Close menu"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {isSidebarCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hidden lg:flex min-h-[44px] min-w-[44px] p-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />

        {/* Divider */}
        <div className="hidden md:block h-8 w-[1px] bg-border"></div>

        {/* Search Bar - Responsive width */}
        <div className="hidden sm:flex h-min w-[180px] sm:w-[220px] md:w-[280px] lg:w-[350px]">
          <NavbarSearchComponent
            ref={navbarSearchRef}
            className="w-full"
            placeholder="Search\u2026"
          />
        </div>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile Search Icon */}
        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden min-h-[44px] min-w-[44px] p-2"
          aria-label="Open search"
          onClick={() => setShowMobileSearch(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="min-h-[44px] min-w-[44px] p-2"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDarkMode ? "moon" : "sun"}
              initial={{ rotate: prefersReducedMotion ? 0 : -180, opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: prefersReducedMotion ? 0 : 180, opacity: prefersReducedMotion ? 1 : 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* PR Review Notifications */}
        <PRReviewNotifications />

        {/* Settings Link */}
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex min-h-[44px] min-w-[44px] p-2" aria-label="Settings">
          <Link to="/dashboard/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>

        {/* Divider */}
        <div className="hidden lg:block ml-2 mr-4 h-8 w-[1px] bg-border"></div>

        {/* User Profile Section */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 sm:gap-3 p-2 h-auto min-h-[44px]"
          >
            {/* User Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
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
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  {currentUserDetails?.username || 'User'}
                </span>
              </div>
            </div>

            {/* Dropdown Indicator - Hidden on mobile */}
            <motion.svg
              className="hidden sm:block w-4 h-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: showProfileMenu ? 180 : 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
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
                initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : -10 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: "easeOut" }}
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

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm sm:hidden"
            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-lg font-medium">Search</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] min-w-[44px] p-2"
                  onClick={() => setShowMobileSearch(false)}
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search Input */}
              <div className="p-4">
                <NavbarSearchComponent
                  className="w-full"
                  placeholder="Search tasks, projects\u2026"
                  autoFocus
                  onResultClick={() => setShowMobileSearch(false)}
                />
              </div>

              {/* Hint Text */}
              <div className="px-4 text-sm text-muted-foreground">
                Search for tasks, projects, or team members
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
