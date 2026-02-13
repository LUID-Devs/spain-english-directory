import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useImperativeHandle, 
  forwardRef, 
  useMemo,
  memo 
} from "react";
import { Search, Settings2, X, Users, Briefcase, CheckSquare, User, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import { List } from "react-window";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdvancedSearchModal, { SearchFilters } from "@/components/AdvancedSearchModal";
import SearchSuggestions from "@/components/SearchSuggestions";
import { 
  useSearchQuery, 
  useAdvancedSearchQuery, 
  useGetSearchSuggestionsQuery,
  SearchSuggestion,
  Task,
  Project,
  User as UserType
} from "@/hooks/useApi";
import { Link } from "react-router-dom";
import { useTaskModal } from "@/contexts/TaskModalContext";

interface NavbarSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onResultClick?: () => void;
}

export interface NavbarSearchRef {
  focus: () => void;
}

// Memoized Task Result Item
interface TaskResultItemProps {
  task: Task;
  onClick: () => void;
}

const TaskResultItem = memo(({ task, onClick }: TaskResultItemProps) => (
  <button
    onClick={onClick}
    className="w-full text-left block px-2 py-2 rounded hover:bg-accent transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${
          task.priority === 'Urgent' ? 'bg-gray-900' :
          task.priority === 'High' ? 'bg-gray-700' :
          task.priority === 'Medium' ? 'bg-gray-500' :
          task.priority === 'Low' ? 'bg-gray-400' :
          'bg-gray-300'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {task.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>#{task.id}</span>
          <span>•</span>
          <span>{task.status}</span>
          {task.dueDate && (
            <>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
      {task.assignee && (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {task.assignee.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  </button>
));
TaskResultItem.displayName = 'TaskResultItem';

// Memoized Project Result Item
interface ProjectResultItemProps {
  project: Project;
  onClick: () => void;
}

const ProjectResultItem = memo(({ project, onClick }: ProjectResultItemProps) => (
  <Link
    to={`/dashboard/projects/${project.id}`}
    className="block px-2 py-2 rounded hover:bg-accent transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {project.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {project.name}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {project.description || 'No description'}
        </div>
      </div>
    </div>
  </Link>
));
ProjectResultItem.displayName = 'ProjectResultItem';

// Memoized User Result Item
interface UserResultItemProps {
  user: UserType;
  onClick: () => void;
}

const UserResultItem = memo(({ user, onClick }: UserResultItemProps) => (
  <div
    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-accent transition-colors cursor-pointer"
    onClick={onClick}
  >
    <div className="flex-shrink-0">
      {user.profilePictureUrl ? (
        <img
          src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`}
          alt={user.username}
          className="w-6 h-6 rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-3 w-3 text-primary" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-foreground truncate">
        {user.username}
      </div>
      <div className="text-xs text-muted-foreground">
        {user.cognitoId ? 'Active' : 'Inactive'}
      </div>
    </div>
  </div>
));
UserResultItem.displayName = 'UserResultItem';

// Virtualized list row renderer for tasks
interface TaskListRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    tasks: Task[];
    onTaskClick: (taskId: number) => void;
  };
}

const TaskListRow = memo(({ index, style, data }: TaskListRowProps) => {
  const task = data.tasks[index];
  return (
    <div style={style}>
      <TaskResultItem 
        task={task} 
        onClick={() => data.onTaskClick(task.id)} 
      />
    </div>
  );
});
TaskListRow.displayName = 'TaskListRow';

const NavbarSearch = forwardRef<NavbarSearchRef, NavbarSearchProps>(({
  className = "",
  placeholder = "Search projects, tasks, users…",
  autoFocus = false,
  onResultClick,
}, ref) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { openTaskModal } = useTaskModal();

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

  // Search suggestions query
  const {
    data: suggestionsData,
    isLoading: isSuggestionsLoading,
  } = useGetSearchSuggestionsQuery(
    { query: searchTerm },
    {
      skip: !searchTerm || searchTerm.length < 2 || !showSuggestions,
      refetchOnMountOrArgChange: true,
    }
  );

  const searchResults = useMemo(() => 
    searchMode === 'basic' ? basicSearchResults : advancedSearchResults,
    [searchMode, basicSearchResults, advancedSearchResults]
  );
  
  const isLoading = searchMode === 'basic' ? isBasicLoading : isAdvancedLoading;
  const isError = searchMode === 'basic' ? isBasicError : isAdvancedError;

  // Optimized debounced search with 300ms delay
  const debouncedSetSearchMode = useMemo(
    () => debounce((value: string) => {
      if (value.length >= 3) {
        setSearchMode('basic');
      }
    }, 300),
    []
  );

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Debounced search mode update
    debouncedSetSearchMode(value);
  }, [debouncedSetSearchMode]);

  const handleInputFocus = useCallback(() => {
    if (searchTerm.length >= 2 && searchTerm.length < 3) {
      setShowSuggestions(true);
    }
    if (searchTerm.length >= 3) {
      setShowResults(true);
    }
  }, [searchTerm.length]);

  const handleAdvancedSearch = useCallback((filters: SearchFilters) => {
    setCurrentFilters(filters);
    setSearchMode('advanced');
    setShowSuggestions(false);
    setShowResults(true);
    if (filters.query) {
      setSearchTerm(filters.query);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.title);
    setShowSuggestions(false);
    setSearchMode('basic');
    setShowResults(true);
    if (searchInputRef.current) {
      searchInputRef.current.value = suggestion.title;
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentFilters({});
    setSearchMode('basic');
    setShowSuggestions(false);
    setShowResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      searchInputRef.current.focus();
    }
  }, []);

  const handleContainerClick = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleResultClick = useCallback(() => {
    setShowResults(false);
    onResultClick?.();
  }, [onResultClick]);

  const handleTaskClick = useCallback((taskId: number) => {
    openTaskModal(taskId);
    handleResultClick();
  }, [openTaskModal, handleResultClick]);

  // Memoized results calculations
  const hasActiveFilters = useMemo(() => 
    Object.keys(currentFilters).length > 0 && searchMode === 'advanced',
    [currentFilters, searchMode]
  );

  const hasResults = useMemo(() => 
    searchResults && (
      (searchResults.tasks?.length > 0) || 
      (searchResults.projects?.length > 0) || 
      (searchResults.users?.length > 0)
    ),
    [searchResults]
  );

  const tasksCount = searchResults?.tasks?.length || 0;
  const projectsCount = searchResults?.projects?.length || 0;
  const usersCount = searchResults?.users?.length || 0;

  // Auto-show results when we have a search term >= 3 characters
  useEffect(() => {
    if (searchTerm.length >= 3 && searchMode === 'basic') {
      setShowResults(true);
      setShowSuggestions(false);
    } else if (searchTerm.length >= 2 && searchTerm.length < 3) {
      setShowSuggestions(true);
      setShowResults(false);
    } else {
      setShowResults(false);
      setShowSuggestions(false);
    }
  }, [searchTerm, searchMode]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchMode.cancel();
    };
  }, [debouncedSetSearchMode]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setShowSuggestions(false);
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-focus when autoFocus prop is true
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Expose focus method to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        if (searchTerm.length >= 2 && searchTerm.length < 3) {
          setShowSuggestions(true);
        }
        if (searchTerm.length >= 3) {
          setShowResults(true);
        }
      }
    },
  }));

  return (
    <>
      {/* Search Input */}
      <div className={`relative ${className}`}>
        <div className="relative" onClick={handleContainerClick}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder={placeholder}
            className="w-full pl-10 pr-20 text-sm focus-visible:ring-1"
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            autoComplete="off"
          />
          
          {/* Action Buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdvancedModalOpen(true)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Advanced Search"
            >
              <Settings2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestionsData?.suggestions && !showResults && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 z-50 mt-1"
            >
              <SearchSuggestions
                suggestions={suggestionsData.suggestions}
                onSuggestionClick={handleSuggestionClick}
                loading={isSuggestionsLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results Dropdown */}
        {showResults && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-background border border-border rounded-lg shadow-xl max-h-[70vh] overflow-y-auto"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Searching…</span>
              </div>
            )}
            
            {isError && (
              <div className="p-4 text-center">
                <p className="text-sm text-destructive">Error occurred while searching.</p>
              </div>
            )}
            
            {!isLoading && !isError && searchResults && (
              <div className="py-2">
                {/* Search Info Header */}
                <div className="px-4 py-2 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Results for &quot;{searchTerm}&quot;</span>
                      {hasActiveFilters && (
                        <span className="text-primary">• Filtered</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAdvancedModalOpen(true)}
                      className="h-6 text-xs"
                    >
                      Advanced
                    </Button>
                  </div>
                </div>

                {/* Tasks Section */}
                {tasksCount > 0 && (
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-2 px-2 py-1 mb-2">
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Tasks ({tasksCount})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {/* Show first 10 tasks with virtualization if more than 10 */}
                      {tasksCount <= 10 ? (
                        searchResults.tasks.slice(0, 10).map((task: Task) => (
                          <TaskResultItem 
                            key={task.id}
                            task={task} 
                            onClick={() => handleTaskClick(task.id)} 
                          />
                        ))
                      ) : (
                        <div style={{ height: Math.min(tasksCount, 10) * 64 }}>
                          <List
                            height={Math.min(tasksCount, 10) * 64}
                            itemCount={Math.min(tasksCount, 10)}
                            itemSize={64}
                            itemData={{
                              tasks: searchResults.tasks.slice(0, 10),
                              onTaskClick: handleTaskClick,
                            }}
                          >
                            {TaskListRow}
                          </List>
                        </div>
                      )}
                      {tasksCount > 10 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          +{tasksCount - 10} more tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {projectsCount > 0 && (
                  <div className="px-2 py-2 border-t border-border">
                    <div className="flex items-center gap-2 px-2 py-1 mb-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Projects ({projectsCount})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {searchResults.projects.slice(0, 3).map((project: Project) => (
                        <ProjectResultItem
                          key={project.id}
                          project={project}
                          onClick={handleResultClick}
                        />
                      ))}
                      {projectsCount > 3 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          +{projectsCount - 3} more projects
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Users Section */}
                {usersCount > 0 && (
                  <div className="px-2 py-2 border-t border-border">
                    <div className="flex items-center gap-2 px-2 py-1 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Users ({usersCount})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {searchResults.users.slice(0, 4).map((user: UserType) => (
                        <UserResultItem
                          key={user.userId}
                          user={user}
                          onClick={handleResultClick}
                        />
                      ))}
                      {usersCount > 4 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          +{usersCount - 4} more users
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {!hasResults && (
                  <div className="px-4 py-8 text-center">
                    <div className="text-muted-foreground mb-2">
                      <Search className="mx-auto h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No results found</p>
                    <p className="text-xs text-muted-foreground">
                      Try different keywords or use advanced search
                    </p>
                  </div>
                )}

                {/* Advanced Search Footer */}
                <div className="px-4 py-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdvancedModalOpen(true)}
                    className="w-full text-xs"
                  >
                    <Settings2 className="h-3 w-3 mr-2" />
                    Advanced Search Options
                  </Button>
                </div>
              </div>
            )}
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
    </>
  );
});

NavbarSearch.displayName = 'NavbarSearch';

export default NavbarSearch;
