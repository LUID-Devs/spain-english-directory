import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-2">Part of Luid Suite</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            TaskLuid
          </h1>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            A modern task management platform designed to help you organize, track, and complete projects efficiently.
          </p>
          <div className="space-x-4 mb-8">
            <Link
              to="/auth/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="inline-block px-6 py-3 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
          <p className="text-xs text-neutral-500">
            Built by an independent developer
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Luid Suite
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-neutral-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-neutral-400 hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-neutral-400 hover:text-blue-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;