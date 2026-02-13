import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* 404 Code */}
          <div className="mb-8">
            <span className="text-9xl font-bold bg-gradient-to-r from-gray-500 to-gray-300 bg-clip-text text-transparent">
              404
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">
            Page Not Found
          </h1>
          
          {/* Description */}
          <p className="text-gray-400 mb-8 text-lg">
            The page you're looking for doesn't exist or has been moved. 
            Check the URL or try one of the options below.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
          
          {/* Help Link */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link 
                to="/dashboard" 
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <Search className="w-3 h-3" />
                Browse your tasks
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} TaskLuid
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;