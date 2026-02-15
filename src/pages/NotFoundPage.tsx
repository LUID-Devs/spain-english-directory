import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Loader2, X } from 'lucide-react';
import { apiService, SearchResults } from '../services/apiService';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const results = await apiService.search(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ tasks: [], projects: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setHasSearched(false);
  };

  const totalResults = (searchResults?.tasks?.length || 0) + 
                       (searchResults?.projects?.length || 0) + 
                       (searchResults?.users?.length || 0);

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
          
          {/* Search Section */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, projects..."
                  className="w-full pl-12 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Search Results */}
            {isSearching && (
              <div className="mt-4 flex justify-center">
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
              </div>
            )}

            {hasSearched && !isSearching && searchResults && (
              <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                {totalResults === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No results found for "{searchQuery}"</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {/* Tasks */}
                    {searchResults.tasks && searchResults.tasks.length > 0 && (
                      <div className="border-b border-gray-800 last:border-b-0">
                        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900/80">Tasks</p>
                        {searchResults.tasks.slice(0, 3).map((task) => (
                          <button
                            key={task.id}
                            onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center gap-3"
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`} />
                            <span className="text-sm text-gray-300 truncate">{task.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {searchResults.projects && searchResults.projects.length > 0 && (
                      <div className="border-b border-gray-800 last:border-b-0">
                        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900/80">Projects</p>
                        {searchResults.projects.slice(0, 3).map((project) => (
                          <button
                            key={project.id}
                            onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
                          >
                            <span className="text-sm text-gray-300 truncate">{project.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {totalResults > 6 && (
                      <Link
                        to={`/dashboard?search=${encodeURIComponent(searchQuery)}`}
                        className="block px-4 py-3 text-sm text-center text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                      >
                        View all {totalResults} results →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

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
              Use the search above to find what you're looking for, or{' '}
              <Link 
                to="/dashboard" 
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                go to your dashboard
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