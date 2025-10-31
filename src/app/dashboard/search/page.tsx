
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import AdvancedSearchModal, { SearchFilters } from "@/components/AdvancedSearchModal";
import SearchSuggestions from "@/components/SearchSuggestions";
import { 
  useSearchQuery, 
  useAdvancedSearchQuery, 
  useGetSearchSuggestionsQuery,
  SearchSuggestion 
} from "@/hooks/useApi";
import { debounce } from "lodash";
import React, { useEffect, useState, useRef } from "react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Basic search query
  const {
    data: basicSearchResults,
    isLoading: isBasicLoading,
    isError: isBasicError,
  } = useSearchQuery(searchTerm || "", {
    skip: !searchTerm || searchTerm.length < 3 || searchMode !== 'basic',
  });

  // Advanced search query
  const {
    data: advancedSearchResults,
    isLoading: isAdvancedLoading,
    isError: isAdvancedError,
  } = useAdvancedSearchQuery(currentFilters, {
    skip: searchMode !== 'advanced' || Object.keys(currentFilters).length === 0,
  });

  // Search suggestions query with debouncing
  const {
    data: suggestionsData,
    isLoading: isSuggestionsLoading,
  } = useGetSearchSuggestionsQuery(
    { query: searchTerm },
    {
      skip: !searchTerm || searchTerm.length < 2 || !showSuggestions,
      refetchOnMountOrArgChange: false, // Prevent excessive refetching
    }
  );

  const searchResults = searchMode === 'basic' ? basicSearchResults : advancedSearchResults;
  const isLoading = searchMode === 'basic' ? isBasicLoading : isAdvancedLoading;
  const isError = searchMode === 'basic' ? isBasicError : isAdvancedError;

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
      setShowSuggestions(event.target.value.length >= 2);
      setSearchMode('basic');
    },
    300,
  );

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    setSearchMode('advanced');
    setShowSuggestions(false);
    if (filters.query) {
      setSearchTerm(filters.query);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.title);
    setShowSuggestions(false);
    setSearchMode('basic');
    if (searchInputRef.current) {
      searchInputRef.current.value = suggestion.title;
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentFilters({});
    setSearchMode('basic');
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0 && searchMode === 'advanced';

  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-8">
      <Header name="Search" />
      
      {/* Search Input Section */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <div className="relative flex-1 max-w-2xl">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks, projects, users..."
              className="w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              onChange={handleSearch}
              onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
            />
            
            {/* Search Suggestions */}
            {showSuggestions && suggestionsData?.suggestions && (
              <SearchSuggestions
                suggestions={suggestionsData.suggestions}
                onSuggestionClick={handleSuggestionClick}
                loading={isSuggestionsLoading}
              />
            )}

            {/* Clear Search Button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsAdvancedModalOpen(true)}
            className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Advanced Search
          </button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {Object.entries(currentFilters).map(([key, value], index) => {
              if (!value) return null;
              return (
                <span
                  key={`filter-${key}-${index}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {key}: {value.toString()}
                  <button
                    onClick={() => {
                      const newFilters = { ...currentFilters };
                      delete newFilters[key as keyof SearchFilters];
                      setCurrentFilters(newFilters);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <button
              onClick={() => {
                setCurrentFilters({});
                setSearchMode('basic');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div>
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Searching...</span>
          </div>
        )}
        
        {isError && (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Error occurred while fetching search results.</p>
          </div>
        )}
        
        {!isLoading && !isError && searchResults && (
          <div className="space-y-8">
            {/* Tasks Section */}
            {searchResults.tasks && searchResults.tasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tasks ({searchResults.tasks.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {searchResults.projects && searchResults.projects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Projects ({searchResults.projects.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* Users Section */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Users ({searchResults.users.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {searchResults.users.map((user) => (
                    <UserCard key={user.userId} user={user} />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {(!searchResults.tasks?.length && !searchResults.projects?.length && !searchResults.users?.length) && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or using different filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Default State */}
        {!searchTerm && !hasActiveFilters && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start searching</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Search for tasks, projects, or users. Use advanced search for more specific results.
            </p>
          </div>
        )}
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        onSearch={handleAdvancedSearch}
        initialFilters={currentFilters}
      />
    </div>
  );
};

export default Search;
