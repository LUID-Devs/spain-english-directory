import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FolderOpen,
  Clock,
  Star,
  Lock,
  Share2,
  Users,
  MoreVertical,
  ChevronDown,
  X,
  ArrowUpDown,
  LayoutGrid,
  Settings2,
  List
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { LibraryItem, LibraryFilters, SidebarPreferences } from './types';

export type { LibraryItem, LibraryFilters, SidebarPreferences } from './types';

// API Functions
const fetchLibraryContents = async (
  tab: string,
  filters: Partial<LibraryFilters>,
  page: number = 1,
  limit: number = 20
): Promise<{ items: LibraryItem[]; total: number; hasMore: boolean }> => {
  const params = new URLSearchParams({
    tab,
    page: page.toString(),
    limit: limit.toString(),
    ...(filters.search && { search: filters.search }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
    ...(filters.teamspaceId && { teamspaceId: filters.teamspaceId }),
  });

  const response = await apiService.get(`/api/library/contents?${params.toString()}`);
  return response.data;
};

const fetchSidebarPreferences = async (): Promise<SidebarPreferences> => {
  const response = await apiService.get('/api/user/sidebar-preferences');
  return response.data;
};

const updateSidebarPreferences = async (
  preferences: Partial<SidebarPreferences>
): Promise<SidebarPreferences> => {
  const response = await apiService.patch('/api/user/sidebar-preferences', preferences);
  return response.data;
};

const toggleFavorite = async (itemId: string, itemType: string): Promise<void> => {
  await apiService.post(`/api/library/favorites`, { itemId, itemType });
};

// Components
const LibraryItemCard: React.FC<{
  item: LibraryItem;
  viewMode: 'grid' | 'list';
  onFavoriteToggle: (item: LibraryItem) => void;
}> = ({ item, viewMode, onFavoriteToggle }) => {
  const navigate = useNavigate();

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <div className="h-5 w-5 rounded border-2 border-gray-300" />;
      case 'goal':
        return <div className="h-5 w-5 rounded-full border-2 border-green-500" />;
      default:
        return <FolderOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getItemPath = (item: LibraryItem) => {
    switch (item.type) {
      case 'project':
        return `/dashboard/projects/${item.id}`;
      case 'task':
        return `/dashboard/tasks/${item.id}`;
      case 'goal':
        return `/dashboard/goals/${item.id}`;
      default:
        return '#';
    }
  };

  const handleClick = () => {
    navigate(getItemPath(item));
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className={cn(
          'group flex items-center gap-4 p-4 rounded-lg border border-border bg-card',
          'hover:bg-accent/50 cursor-pointer transition-colors'
        )}
      >
        <div className="flex-shrink-0">{getItemIcon(item.type)}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">{item.title}</h4>
            {item.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
            {item.isShared && <Share2 className="h-3 w-3 text-muted-foreground" />}
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {item.teamspaceName && (
            <Badge variant="outline" className="hidden sm:inline-flex">
              {item.teamspaceName}
            </Badge>
          )}
          <span className="hidden md:inline">{item.owner.username}</span>
          <span className="text-xs">
            {new Date(item.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(item);
            }}
          >
            <Star
              className={cn(
                'h-4 w-4',
                item.isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )}
            />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Open</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative p-4 rounded-lg border border-border bg-card',
        'hover:border-primary/50 hover:shadow-md cursor-pointer transition-all'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getItemIcon(item.type)}
          {item.teamspaceName && (
            <Badge variant="secondary" className="text-xs">
              {item.teamspaceName}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(item);
            }}
          >
            <Star
              className={cn(
                'h-4 w-4',
                item.isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )}
            />
          </Button>
        </div>
      </div>

      <h4 className="font-medium text-foreground mb-1 line-clamp-2">{item.title}</h4>
      {item.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          {item.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
          {item.isShared && <Share2 className="h-3 w-3 text-muted-foreground" />}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const LibrarySkeleton: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-72" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mb-4" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
};

// Main Library Page Component
const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('teamspaces');
  const [filters, setFilters] = useState<LibraryFilters>({
    search: '',
    sortBy: 'updated',
    sortOrder: 'desc',
    viewMode: 'grid',
  });
  const [page, setPage] = useState(1);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  const debouncedSearch = useDebounce(filters.search, 300);
  const queryClient = useQueryClient();

  // Fetch library contents
  const { data: libraryData, isLoading, isFetching } = useQuery({
    queryKey: ['library', activeTab, debouncedSearch, filters.sortBy, filters.sortOrder, page],
    queryFn: () => fetchLibraryContents(activeTab, filters, page),
    staleTime: 30000,
  });

  // Fetch sidebar preferences
  const { data: preferences } = useQuery({
    queryKey: ['sidebarPreferences'],
    queryFn: fetchSidebarPreferences,
  });

  // Mutations
  const favoriteMutation = useMutation({
    mutationFn: ({ itemId, itemType }: { itemId: string; itemType: string }) =>
      toggleFavorite(itemId, itemType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Favorite updated');
    },
    onError: () => {
      toast.error('Failed to update favorite');
    },
  });

  const preferencesMutation = useMutation({
    mutationFn: updateSidebarPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebarPreferences'] });
      toast.success('Preferences saved');
      setIsPreferencesOpen(false);
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const handleFavoriteToggle = useCallback((item: LibraryItem) => {
    favoriteMutation.mutate({ itemId: item.id, itemType: item.type });
  }, [favoriteMutation]);

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (libraryData?.hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [libraryData?.hasMore, isFetching]);

  const items = libraryData?.items || [];

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Library</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Organize and access all your workspace content
              </p>
            </div>
            
            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search library..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-full sm:w-64 lg:w-80"
                />
                {filters.search && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              
              <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Sidebar Preferences</DialogTitle>
                    <DialogDescription>
                      Customize what appears in your sidebar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Configure your sidebar preferences to show/hide sections
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value: any) =>
                  setFilters(prev => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                  }))
                }
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    filters.sortOrder === 'asc' && 'rotate-180'
                  )}
                />
              </Button>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={filters.viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={filters.viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 sm:px-6 lg:px-8">
          <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:inline-flex">
            <TabsTrigger value="teamspaces" className="gap-2">
              <Users className="h-4 w-4 hidden sm:inline" />
              <span>Teamspaces</span>
            </TabsTrigger>
            <TabsTrigger value="recents" className="gap-2">
              <Clock className="h-4 w-4 hidden sm:inline" />
              <span>Recents</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Star className="h-4 w-4 hidden sm:inline" />
              <span>Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="private" className="gap-2">
              <Lock className="h-4 w-4 hidden sm:inline" />
              <span>Private</span>
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <Share2 className="h-4 w-4 hidden sm:inline" />
              <span>Shared</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <LibrarySkeleton viewMode={filters.viewMode} />
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No items found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {filters.search
                    ? `No results for "${filters.search}". Try a different search term.`
                    : 'This section is empty. Items will appear here when you create or access them.'}
                </p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    filters.viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-2'
                  )}
                >
                  {items.map((item) => (
                    <LibraryItemCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                      viewMode={filters.viewMode}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>

                {libraryData?.hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isFetching}
                    >
                      {isFetching ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LibraryPage;
