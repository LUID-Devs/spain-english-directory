import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
          TaskLuid
        </h1>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Streamline your workflow and boost productivity with TaskLuid - the modern task management platform.
        </p>
        <div className="space-x-4">
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
      </div>
    </div>
  );
};

export default LandingPage;