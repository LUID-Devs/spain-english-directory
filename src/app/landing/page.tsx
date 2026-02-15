'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import FadeInWhenVisible from "@/components/ui/fade-in-when-visible";
import { motion } from "framer-motion";


function FeatureCard({ feature, index }: { feature: { icon: React.ElementType; title: string; description: string }; index: number }) {
  return (
    <FadeInWhenVisible delay={index * 0.2}>
      <motion.div
        className="p-6 rounded-lg bg-neutral-900 group hover:bg-neutral-800 transition-all"
        whileHover={{ y: -5 }}
      >
        <feature.icon className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-semibold mb-2 text-white">
          {feature.title}
        </h3>
        <p className="text-neutral-400">{feature.description}</p>
      </motion.div>
    </FadeInWhenVisible>
  );
}

const LandingPage = () => {
  useEffect(() => {
    document.title = "TaskLuid - AI-Powered Project Management Platform";
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="LUID"
                className="w-8 h-8 rounded-lg"
              />
              <h1 className="ml-3 text-2xl font-bold text-white">TaskLuid</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="#features" className="text-neutral-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#about" className="text-neutral-400 hover:text-white transition-colors">
                About
              </a>
              <Link href="/pricing" className="text-neutral-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-gradient-to-r from-gray-600 to-gray-600 text-white px-6 py-2 rounded-xl hover:from-gray-700 hover:to-gray-700 transition-all duration-300 font-semibold">
                    Sign In
                  </div>
                </motion.div>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-32 bg-gradient-to-b from-black to-neutral-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <FadeInWhenVisible>
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-6 text-lg px-6 py-3 bg-gradient-to-r from-gray-500/20 to-gray-500/20 text-gray-400 hover:from-gray-500/30 hover:to-gray-500/30 transition-all duration-300 rounded-full inline-block">
                ⚡ Transform Your Workflow Today
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Ready to Transform Your
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-gray-500 to-gray-500">
                  Project Management?
                </span>
              </h2>
              <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
                A modern project management platform designed to help you organize, track, and complete projects efficiently. Part of the Luid Suite.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Link href="/auth/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-700 hover:to-gray-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-gray-500/30 transition-all duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Get Started Now
                    </div>
                  </motion.div>
                </Link>
                
                <a href="#features">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="border-2 border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white font-bold px-8 py-4 rounded-xl transition-all duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Explore Features
                    </div>
                  </motion.div>
                </a>
              </div>

              {/* Value Proposition Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Smart Task Management</h3>
                  <p className="text-neutral-400 text-sm">AI-powered task prioritization and assignment</p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Team Collaboration</h3>
                  <p className="text-neutral-400 text-sm">Real-time collaboration and communication</p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Advanced Analytics</h3>
                  <p className="text-neutral-400 text-sm">Detailed insights and progress tracking</p>
                </motion.div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/5 via-gray-600/5 to-gray-600/5 backdrop-blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gray-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gray-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Feature Sections - Organize, Collaborate, Sync */}
      <div className="py-24 bg-gradient-to-b from-neutral-900 to-black">
        <div className="container mx-auto px-4">
          
          {/* Section 1: Organize Everything */}
          <FadeInWhenVisible>
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-32">
              <div className="lg:w-1/2">
                <motion.div 
                  className="rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl shadow-gray-500/10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-neutral-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="bg-neutral-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-4 w-24 bg-neutral-700 rounded"></div>
                        <div className="h-6 w-6 bg-gray-500/30 rounded"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg border-l-4 border-red-500">
                          <div className="w-4 h-4 rounded border-2 border-neutral-600"></div>
                          <div className="h-3 w-32 bg-neutral-600 rounded"></div>
                          <div className="ml-auto h-6 w-6 rounded-full bg-gray-500/30"></div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg border-l-4 border-yellow-500">
                          <div className="w-4 h-4 rounded border-2 border-neutral-600"></div>
                          <div className="h-3 w-40 bg-neutral-600 rounded"></div>
                          <div className="ml-auto h-6 w-6 rounded-full bg-gray-500/30"></div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg border-l-4 border-green-500">
                          <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                          <div className="h-3 w-28 bg-neutral-600 rounded line-through"></div>
                          <div className="ml-auto h-6 w-6 rounded-full bg-gray-500/30"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/10 rounded-full text-gray-400 text-sm mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Board View
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Organize Everything
                </h3>
                <p className="text-lg text-neutral-400 mb-6">
                  Keep all tasks in one place. Visualize your work with intuitive board views, 
                  drag-and-drop organization, and customizable workflows that adapt to how your team works.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kanban-style boards
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority-based organization
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom labels and filters
                  </li>
                </ul>
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Section 2: Collaborate Seamlessly */}
          <FadeInWhenVisible delay={0.1}>
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 mb-32">
              <div className="lg:w-1/2">
                <motion.div 
                  className="rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl shadow-gray-500/10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-neutral-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="bg-neutral-900 rounded-lg p-4">
                      <div className="mb-4">
                        <div className="h-4 w-48 bg-neutral-700 rounded mb-2"></div>
                        <div className="h-3 w-full bg-neutral-800 rounded"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-800 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-500/30"></div>
                            <div>
                              <div className="h-3 w-20 bg-neutral-600 rounded"></div>
                              <div className="h-2 w-12 bg-neutral-700 rounded mt-1"></div>
                            </div>
                          </div>
                          <div className="h-3 w-full bg-neutral-700 rounded"></div>
                        </div>
                        <div className="p-3 bg-neutral-800 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-500/30"></div>
                            <div>
                              <div className="h-3 w-16 bg-neutral-600 rounded"></div>
                              <div className="h-2 w-12 bg-neutral-700 rounded mt-1"></div>
                            </div>
                            <div className="ml-auto px-2 py-1 bg-gray-500/20 rounded text-xs text-gray-400">Assigned</div>
                          </div>
                          <div className="h-3 w-3/4 bg-neutral-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/10 rounded-full text-gray-400 text-sm mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM7 10a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  Team Assignment
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Collaborate Seamlessly
                </h3>
                <p className="text-lg text-neutral-400 mb-6">
                  Assign tasks, comment, and track progress together. Real-time collaboration 
                  keeps everyone aligned and moving forward without the back-and-forth emails.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    @mentions and comments
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Task assignments
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Real-time activity feed
                  </li>
                </ul>
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Section 3: Stay in Sync */}
          <FadeInWhenVisible delay={0.2}>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <motion.div 
                  className="rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl shadow-gray-500/10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-neutral-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="bg-neutral-900 rounded-lg p-4">
                      <h4 className="text-sm text-neutral-400 mb-3">Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-neutral-800 rounded-lg border-l-4 border-blue-500">
                          <div className="w-8 h-8 rounded-full bg-gray-500/30 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-3 w-full bg-neutral-600 rounded mb-1"></div>
                            <div className="h-2 w-20 bg-neutral-700 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-neutral-800 rounded-lg border-l-4 border-purple-500">
                          <svg className="w-8 h-8 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-2h2V7h-2v8z"/>
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="h-3 w-full bg-neutral-600 rounded mb-1"></div>
                            <div className="h-2 w-24 bg-neutral-700 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-neutral-800 rounded-lg border-l-4 border-green-500">
                          <svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="h-3 w-full bg-neutral-600 rounded mb-1"></div>
                            <div className="h-2 w-16 bg-neutral-700 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/10 rounded-full text-gray-400 text-sm mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Stay in Sync
                </h3>
                <p className="text-lg text-neutral-400 mb-6">
                  Never miss an update. Get notified via email, Slack, or mobile alerts 
                  whenever something important happens with your projects and tasks.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email notifications
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Slack integration
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mobile push alerts
                  </li>
                </ul>
              </div>
            </div>
          </FadeInWhenVisible>

        </div>
      </div>

      {/* Community Section */}
      <div className="py-32 bg-gradient-to-b from-black to-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-neutral-400 mb-8">
              TaskLuid is part of Luid Suite - integrated productivity apps built by an independent developer.
              Early adopters welcome!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="p-6 rounded-lg bg-gray-600/10 border border-gray-500/20 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-2xl font-bold text-gray-500 mb-2">Open Beta</h3>
                <p className="text-neutral-400">Free to try</p>
              </motion.div>
              <motion.div
                className="p-6 rounded-lg bg-gray-600/10 border border-gray-500/20 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-2xl font-bold text-gray-500 mb-2">Active Development</h3>
                <p className="text-neutral-400">Regular updates</p>
              </motion.div>
              <motion.div
                className="p-6 rounded-lg bg-gray-600/10 border border-gray-500/20 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-2xl font-bold text-gray-500 mb-2">Direct Support</h3>
                <p className="text-neutral-400">Developer feedback</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Management Tools Showcase Section */}
      <div className="py-32 bg-gradient-to-b from-black via-neutral-900 to-black">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Powerful Project Management Tools
              </h2>
              <p className="text-neutral-400 text-xl max-w-3xl mx-auto">
                Everything you need to manage projects efficiently, from task creation to team collaboration and progress tracking.
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Tools Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {projectTools.map((category, index) => (
              <FadeInWhenVisible key={category.title} delay={index * 0.1}>
                <motion.div
                  className="p-6 rounded-xl bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 hover:border-gray-500/30 transition-all duration-300 group"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-500/20 to-gray-500/20 mr-4 group-hover:from-gray-500/30 group-hover:to-gray-500/30 transition-all duration-300">
                      <category.icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                  </div>
                  <p className="text-neutral-400 mb-4">{category.description}</p>
                  <div className="space-y-2">
                    {category.features.map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-center text-sm text-neutral-300">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>

          {/* Popular Features Highlight */}
          <FadeInWhenVisible delay={0.3}>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-8 text-white">Most Popular Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                {popularFeatures.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700 hover:border-gray-500/50 transition-all duration-300 text-center group"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <tool.icon className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-gray-300 transition-colors" />
                    <p className="text-sm text-white font-medium">{tool.name}</p>
                    {tool.isNew && (
                      <div className="mt-1 bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded">New</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>


      {/* Features Section */}
      <div className="py-32 bg-gradient-to-b from-black to-neutral-900">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-white">
              Why Choose TaskLuid?
            </h2>
            <p className="text-neutral-400 text-center mb-16 max-w-2xl mx-auto">
              Professional project management made simple with cutting-edge technology
            </p>
          </FadeInWhenVisible>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-500/20 bg-black/90 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
              {/* Brand Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3">
                  <motion.img
                    src="/logo.png"
                    alt="LUID"
                    className="w-10 h-10 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                  <div>
                    <h3 className="font-bold text-xl bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent">
                      Luid Suite
                    </h3>
                    <p className="text-xs text-neutral-500">Integrated productivity apps</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm max-w-xs leading-relaxed">
                  TaskLuid is part of Luid Suite - productivity apps built by an independent developer.
                </p>
                <p className="text-gray-400 text-xs">
                  Contact: <a href="mailto:alaindimabuyo@luiddevelopers.com" className="text-gray-400 hover:text-gray-300">alaindimabuyo@luiddevelopers.com</a>
                </p>
              </motion.div>

              {/* Apps Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white text-lg mb-4">Apps</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="https://taskluid.com" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      TaskLuid
                    </a>
                  </li>
                  <li>
                    <a href="https://resumeluid.com" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      ResumeLuid
                    </a>
                  </li>
                  <li>
                    <a href="https://luidkit.com" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      LuidKit
                    </a>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3"></span>
                      RoomLuid <span className="ml-2 text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">Coming Soon</span>
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3"></span>
                      LuidGPT <span className="ml-2 text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">Coming Soon</span>
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-500 text-sm flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3"></span>
                      LuidSpeak <span className="ml-2 text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">Coming Soon</span>
                    </span>
                  </li>
                </ul>
              </motion.div>

              {/* Support Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white text-lg mb-4">Support</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="mailto:alaindimabuyo@luiddevelopers.com?subject=Help Request" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="mailto:alaindimabuyo@luiddevelopers.com?subject=Contact" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="mailto:alaindimabuyo@luiddevelopers.com?subject=Feedback" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      Send Feedback
                    </a>
                  </li>
                  <li>
                    <a href="mailto:alaindimabuyo@luiddevelopers.com?subject=Bug Report" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      Report Bug
                    </a>
                  </li>
                </ul>
              </motion.div>

              {/* Legal Column */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white text-lg mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-gray-300 hover:text-gray-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-300 transition-colors"></span>
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Bottom Bar */}
            <motion.div
              className="border-t border-gray-500/20 mt-12 pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} Luid Suite. Built by an independent developer.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-gray-300 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-gray-300 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="/cookies"
                    className="text-gray-400 hover:text-gray-300 transition-colors duration-300"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -bottom-32 -left-32 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-32 -right-32 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    title: "Smart Task Management",
    description: "AI-powered task prioritization, intelligent scheduling, and automated workflow optimization for maximum productivity",
    icon: ({ className }: { className: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    title: "Team Collaboration",
    description: "Real-time collaboration tools, instant messaging, file sharing, and seamless team coordination across projects",
    icon: ({ className }: { className: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
  {
    title: "Advanced Analytics",
    description: "Comprehensive dashboards, detailed progress tracking, performance insights, and predictive project analytics",
    icon: ({ className }: { className: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
];

const projectTools = [
  {
    title: "Task Management",
    description: "Create, assign, and track tasks with priority levels and deadlines",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    features: [
      "Priority-based Task Organization",
      "Automated Task Assignment",
      "Deadline Tracking & Alerts",
      "Progress Status Updates"
    ]
  },
  {
    title: "Project Timeline",
    description: "Visual project timelines with Gantt charts and milestone tracking",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    features: [
      "Interactive Gantt Charts",
      "Milestone Tracking",
      "Resource Allocation",
      "Timeline Dependencies"
    ]
  },
  {
    title: "Team Collaboration",
    description: "Real-time team communication and collaboration tools",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    features: [
      "Team Chat & Messaging",
      "File Sharing & Storage",
      "Real-time Updates",
      "Collaboration History"
    ]
  },
  {
    title: "Analytics & Reporting",
    description: "Comprehensive project analytics and performance reports",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    features: [
      "Project Performance Metrics",
      "Team Productivity Analytics",
      "Custom Report Generation",
      "Export & Data Visualization"
    ]
  },
  {
    title: "User Management",
    description: "Advanced user roles, permissions, and team management",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    features: [
      "Role-based Access Control",
      "User Permission Management",
      "Team Organization",
      "Activity Monitoring"
    ]
  },
  {
    title: "Search & Filtering",
    description: "Powerful search and filtering capabilities across all data",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    features: [
      "Advanced Search Filters",
      "Multi-criteria Sorting",
      "Saved Search Queries",
      "Global Text Search"
    ]
  }
];

const popularFeatures = [
  {
    name: "Tasks",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    name: "Projects",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    name: "Teams",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    isNew: true
  },
  {
    name: "Analytics",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    name: "Timeline",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: "Search",
    icon: ({ className }: { className: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    isNew: true
  }
];


export default LandingPage;