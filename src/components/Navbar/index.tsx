"use client";
import React, { useState } from "react";
import { Search, Settings, Menu, Moon, Sun, User, LogOut } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed, setIsDarkMode } from "@/state";
import Image from "next/image";
import { useGetAuthUserQuery } from "@/state/api";
import { useAuth } from "@/app/authProvider";

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const auth = useAuth();
  const {data: currentUser} = useGetAuthUserQuery(auth.user?.sub || "");
  
  const handleSignOut = () => {
    auth.logout();
    setShowProfileMenu(false);
  };

  if (!currentUser) return null;

  const currentUserDetails = currentUser?.userDetails;
  console.log('Navbar - Auth & User Data:', auth.user?.sub, currentUser, currentUserDetails);
  return (
    <motion.div 
      className="flex items-center justify-between bg-black/90 backdrop-blur-md px-4 py-3 border-b border-blue-500/20 sticky top-0 z-40"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Left Section - Menu & Search */}
      <div className="flex items-center gap-6">
        {/* Menu Toggle */}
        {!isSidebarCollapsed ? null : (
          <motion.button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
            className="p-2 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-6 w-6 text-white" />
          </motion.button>
        )}
        
        {/* Search Bar */}
        <motion.div 
          className="relative flex h-min w-[200px] md:w-[300px]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-blue-400" />
          <input
            className="w-full rounded-lg border border-blue-500/20 bg-gray-900/50 backdrop-blur-sm p-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-300"
            type="search"
            placeholder="Search projects, tasks..."
          />
        </motion.div>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <motion.button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="p-2 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
                <Moon className="h-5 w-5 text-blue-400" />
              ) : (
                <Sun className="h-5 w-5 text-blue-400" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Settings Link */}
        <Link href="/dashboard/settings">
          <motion.div
            className="p-2 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-5 w-5 text-blue-400" />
          </motion.div>
        </Link>

        {/* Divider */}
        <div className="hidden md:block ml-2 mr-4 h-8 w-[1px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>

        {/* User Profile Section */}
        <div className="relative">
          <motion.button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                {currentUserDetails?.profilePictureUrl ? (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Image
                      src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${currentUserDetails.profilePictureUrl}`}
                      alt={currentUserDetails.username || "User Profile Picture"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border-2 border-blue-400/50 object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* User Name - Hidden on small screens */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-white">
                  {currentUserDetails?.username || 'User'}
                </span>
              </div>
            </div>

            {/* Dropdown Indicator */}
            <motion.svg
              className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
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
          </motion.button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                className="absolute right-0 mt-2 w-56 py-2 bg-black/95 backdrop-blur-md rounded-lg shadow-lg border border-blue-500/20 z-50"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-blue-500/20">
                  <div className="flex items-center gap-3">
                    {currentUserDetails?.profilePictureUrl ? (
                      <Image
                        src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${currentUserDetails.profilePictureUrl}`}
                        alt={currentUserDetails.username || "User Profile Picture"}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full border-2 border-blue-400/50 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {currentUserDetails?.username || 'User'}
                      </div>
                      <div className="text-xs text-blue-400">
                        Project Manager
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link href="/dashboard/settings">
                    <motion.div 
                      className="px-4 py-2 text-sm text-white hover:text-blue-400 cursor-pointer flex items-center gap-3 hover:bg-blue-500/10 transition-all duration-200"
                      whileHover={{ x: 4 }}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </motion.div>
                  </Link>
                  
                  <motion.button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-3 hover:bg-red-500/10 transition-all duration-200"
                    whileHover={{ x: 4 }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </motion.button>
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