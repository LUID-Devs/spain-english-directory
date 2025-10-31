import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import FadeInWhenVisible from "@/components/ui/fade-in-when-visible";
import { motion } from "framer-motion";

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <motion.div
      className="p-6 rounded-lg bg-blue-600/10 border border-blue-500/20 text-center"
      whileHover={{ scale: 1.05 }}
    >
      <motion.h3
        className="text-4xl font-bold text-blue-500 mb-2"
        whileHover={{ scale: 1.1 }}
      >
        {number}
      </motion.h3>
      <p className="text-neutral-400">{label}</p>
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: { icon: React.ElementType; title: string; description: string }; index: number }) {
  return (
    <FadeInWhenVisible delay={index * 0.2}>
      <motion.div
        className="p-6 rounded-lg bg-neutral-900 group hover:bg-neutral-800 transition-all"
        whileHover={{ y: -5 }}
      >
        <feature.icon className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-white">TaskLuid</h1>
            </div>
            <nav className="flex space-x-6">
              <Link href="#features" className="text-neutral-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-neutral-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/auth/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold">
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
              <div className="mb-6 text-lg px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 rounded-full inline-block">
                ⚡ Transform Your Workflow Today
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Ready to Transform Your
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  Project Management?
                </span>
              </h2>
              <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
                Join thousands of teams who&apos;ve revolutionized their productivity with our AI-powered project management platform. Organize, track, and complete projects efficiently.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Link href="/auth/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300">
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
                
                <Link href="#features">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold px-8 py-4 rounded-xl transition-all duration-300">
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
                </Link>
              </div>

              {/* Value Proposition Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
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
                  className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-400"
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
                  className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-purple-400"
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 backdrop-blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Stats Section */}
      <div className="py-32 bg-gradient-to-b from-black to-neutral-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard number="50K+" label="Active Users" />
            <StatCard number="1M+" label="Tasks Completed" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="24/7" label="Support" />
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
                  className="p-6 rounded-xl bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 hover:border-blue-500/30 transition-all duration-300 group"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                      <category.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                  </div>
                  <p className="text-neutral-400 mb-4">{category.description}</p>
                  <div className="space-y-2">
                    {category.features.map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-center text-sm text-neutral-300">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
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
                    className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700 hover:border-blue-500/50 transition-all duration-300 text-center group"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <tool.icon className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:text-blue-300 transition-colors" />
                    <p className="text-sm text-white font-medium">{tool.name}</p>
                    {tool.isNew && (
                      <div className="mt-1 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">New</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-32 bg-gradient-to-b from-black via-neutral-900 to-black">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Trusted by Teams Worldwide
              </h2>
              <p className="text-neutral-400 text-xl max-w-3xl mx-auto">
                Join thousands of teams who&apos;ve transformed their productivity with TaskLuid
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.1}>
                <motion.div
                  className="p-6 rounded-xl bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 hover:border-blue-500/30 transition-all duration-300 group"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-300 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{testimonial.name}</p>
                      <p className="text-neutral-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>

          {/* Trust Indicators */}
          <FadeInWhenVisible delay={0.3}>
            <div className="text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">15K+</div>
                  <p className="text-neutral-400 text-sm">Active Teams</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">2M+</div>
                  <p className="text-neutral-400 text-sm">Tasks Managed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                  <p className="text-neutral-400 text-sm">Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                  <p className="text-neutral-400 text-sm">Support</p>
                </div>
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
      <footer className="border-t border-blue-500/20 bg-black/90 backdrop-blur-xl relative">
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
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TaskLuid
                  </h3>
                </div>
                <p className="text-gray-300 text-sm max-w-xs leading-relaxed">
                  Streamline your workflow and boost productivity with our comprehensive AI-powered task management platform.
                </p>
                
                {/* Social Links */}
                <div className="flex space-x-4 pt-2">
                  <motion.a 
                    href="https://twitter.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 hover:text-blue-300 hover:border-blue-400/40 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Follow us on Twitter"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="https://linkedin.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 hover:text-blue-300 hover:border-blue-400/40 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Connect with us on LinkedIn"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="mailto:support@taskluid.com"
                    className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 hover:text-blue-300 hover:border-blue-400/40 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Send us an email"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </motion.a>
                </div>
              </motion.div>

              {/* Products Column */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white text-lg mb-4">Products</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="#features" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Task Management
                    </Link>
                  </li>
                  <li>
                    <motion.a 
                      href="/dashboard" 
                      className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group"
                      whileHover={{ x: 4 }}
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Project Dashboard
                    </motion.a>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Team Collaboration
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/login" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Sign In
                    </Link>
                  </li>
                </ul>
              </motion.div>

              {/* Resources Column */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white text-lg mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="#about" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Project Templates
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Best Practices
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      API Documentation
                    </Link>
                  </li>
                </ul>
              </motion.div>

              {/* Support Column */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white text-lg mb-4">Support</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Bottom Bar */}
            <motion.div 
              className="border-t border-blue-500/20 mt-12 pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-400">
                  © 2025 TaskLuid. All rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
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
            className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
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
            className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
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

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Project Manager at TechCorp",
    quote: "TaskLuid has completely transformed how our team manages projects. The AI-powered task prioritization saves us hours every week, and the real-time collaboration features keep everyone on the same page."
  },
  {
    name: "Michael Chen",
    role: "Startup Founder",
    quote: "As a growing startup, we needed a project management solution that could scale with us. TaskLuid's intuitive interface and powerful analytics have been game-changing for our productivity."
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    quote: "The timeline and Gantt chart features in TaskLuid are exceptional. We can now visualize our entire marketing campaigns from start to finish and never miss a deadline."
  },
  {
    name: "David Park",
    role: "Software Team Lead",
    quote: "TaskLuid's integration capabilities and user management features make it perfect for our development team. The search functionality helps us find information instantly."
  },
  {
    name: "Lisa Thompson",
    role: "Operations Manager",
    quote: "The analytics and reporting features provide incredible insights into our team's productivity. We've improved our project delivery times by 40% since switching to TaskLuid."
  },
  {
    name: "James Wilson",
    role: "Creative Director",
    quote: "TaskLuid strikes the perfect balance between powerful features and ease of use. Our creative team adopted it immediately, and collaboration has never been smoother."
  }
];

export default LandingPage;