import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Star,
  Folder,
  CheckSquare,
  Target,
  Clock,
  MoreVertical,
  ArrowUpDown,
  Calendar,
  User,
  Bookmark,
  FileText,
  Grid3X3,
  ChevronDown,
  X,
} from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { cn } from '@/lib/utils';
import { useGetProjectsQuery, useGetTasksByUserQuery, Project, Task, Priority, Status } from '@/hooks/useApi';
import { useAuth } from '@/app/authProvider';
import { useTaskModal } from '@/contexts/TaskModalContext';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

// Content item types
 type ContentType = 'all' | 'projects' | 'tasks' | 'goals';
type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'updatedAt' | 'createdAt' | 'priority';
type SortOrder = 'asc' | 'desc';

interface ContentItem {
  id: string | number;
  type: 'project' | 'task' | 'goal';
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  updatedAt: string;
  createdAt: string;
  isFavorited?: boolean;
  metadata?: Record<string, any>;
}

const WorkspaceLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { openTaskModal } = useTaskModal();
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Fetch data
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useGetProjectsQuery();
  const userId = user?.userId || (user?.sub ? parseInt(user.sub) : null);
  const { data: tasks, isLoading: tasksLoading } = useGetTasksByUserQuery(
    typeof userId === 'number' && !isNaN(userId) ? userId : null,
    { skip: !isAuthenticated || userId === null }
  );

  // Transform data into unified content items
  const contentItems = useMemo<ContentItem[]>(() => {
    const items: ContentItem[] = [];
    
    // Add projects
    if (contentType === 'all' || contentType === 'projects') {
      projects?.forEach((project: Project) => {
        items.push({
          id: project.id,
          type: 'project',
          title: project.name,
          description: project.description,
          status: project.archived ? 'Archived' : 'Active',
          updatedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
          createdAt: project.createdAt || new Date().toISOString(),
          isFavorited: project.isFavorited,
          metadata: {
            taskCount: project.taskCount,
            progress: project.statistics?.progress,
            memberCount: project.statistics?.memberCount,
          },
        });
      });
    }
    
    // Add tasks
    if (contentType === 'all' || contentType === 'tasks') {
      tasks?.forEach((task: Task) => {
        items.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
          createdAt: task.createdAt || new Date().toISOString(),
          metadata: {
            assignee: task.assignee,
            dueDate: task.dueDate,
            projectId: task.projectId,
          },
        });
      });
    }
    
    return items;
  }, [projects, tasks, contentType]);

  const handleToggleFavorite = async (item: ContentItem) => {
    if (item.type !== 'project') {
      toast.info('Favorites are only available for projects right now.');
      return;
    }
    if (!userId || Number.isNaN(userId)) {
      toast.error('Sign in to manage favorites.');
      return;
    }

    try {
      if (item.isFavorited) {
        await apiService.unfavoriteProject(String(item.id), userId);
        toast.success('Project removed from favorites.');
      } else {
        await apiService.favoriteProject(String(item.id), userId);
        toast.success('Project added to favorites.');
      }
      await refetchProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update favorite.');
    }
  };

  const handleShareItem = async (item: ContentItem) => {
    try {
      if (item.type === 'project') {
        const share = await apiService.createProjectShare(Number(item.id));
        await navigator.clipboard.writeText(share.shareUrl);
        toast.success('Project share link copied.');
        return;
      }
      if (item.type === 'task') {
        const share = await apiService.createTaskShare(Number(item.id));
        await navigator.clipboard.writeText(share.shareUrl);
        toast.success('Task share link copied.');
        return;
      }
      toast.info('Sharing goals is not available yet.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create share link.');
    }
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = contentItems;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Priority filter
    if (priorityFilter !== 'all' && contentType !== 'projects') {
      filtered = filtered.filter(item => 
        item.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item => 
        new Date(item.updatedAt) >= filterDate
      );
    }
    
    const priorityOrder = {
      [Priority.Urgent]: 0,
      [Priority.High]: 1,
      [Priority.Medium]: 2,
      [Priority.Low]: 3,
      [Priority.Backlog]: 4,
    };

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          comparison = (priorityOrder[a.priority as Priority] ?? 5) - (priorityOrder[b.priority as Priority] ?? 5);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [contentItems, searchQuery, statusFilter, priorityFilter, dateFilter, sortField, sortOrder]);

  // Group items
  const favoritedItems = useMemo(() => 
    filteredItems.filter(item => item.isFavorited),
    [filteredItems]
  );
  
  const recentItems = useMemo(() => 
    filteredItems
      .filter(item => !item.isFavorited)
      .slice(0, 6),
    [filteredItems]
  );

  const handleItemClick = useCallback((item: ContentItem) => {
    switch (item.type) {
      case 'project':
        navigate(`/dashboard/projects/${item.id}`);
        break;
      case 'task':
        openTaskModal(Number(item.id));
        break;
      case 'goal':
        navigate(`/dashboard/goals/${item.id}`);
        break;
    }
  }, [navigate, openTaskModal]);

  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setSearchQuery('');
  }, []);

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all' || searchQuery.trim() !== '';

  const isLoading = projectsLoading || tasksLoading;

  return (
    <div className="container h-full w-full bg-background">
      <Header name="Workspace Library" />
      
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-4 sm:p-6 border border-primary/10">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            Organize Your Workspace
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Browse, search, and organize all your projects, tasks, and goals in one place. 
            Use filters and views to find exactly what you need.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Top Row - Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, tasks, goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {[statusFilter, priorityFilter, dateFilter].filter(f => f !== 'all').length + (searchQuery ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
                
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content Type Tabs */}
            <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
              <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
                <TabsTrigger value="all" className="gap-2">
                  <Grid3X3 className="h-4 w-4 hidden sm:inline" />
                  All
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2">
                  <Folder className="h-4 w-4 hidden sm:inline" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                  <CheckSquare className="h-4 w-4 hidden sm:inline" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="goals" className="gap-2">
                  <Target className="h-4 w-4 hidden sm:inline" />
                  Goals
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Filters Row */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                  <SelectTrigger className="w-[140px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="updatedAt">Last Updated</SelectItem>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Badge className="h-2 w-2 p-0 rounded-full mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="to do">To Do</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="under review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
                
                {(contentType === 'all' || contentType === 'tasks') && (
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Bookmark className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Favorites Section */}
          {favoritedItems.length > 0 && !searchQuery && statusFilter === 'all' && priorityFilter === 'all' && dateFilter === 'all' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Pinned
              </h3>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favoritedItems.map(item => (
                    <ContentCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                      onClick={() => handleItemClick(item)}
                      onFavoriteToggle={handleToggleFavorite}
                      onShare={handleShareItem}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <ContentList
                    items={favoritedItems}
                    onItemClick={handleItemClick}
                    onFavoriteToggle={handleToggleFavorite}
                    onShare={handleShareItem}
                  />
                </Card>
              )}
            </div>
          )}
          
          {/* All Content Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery ? `Search Results (${filteredItems.length})` : 'All Content'}
              </h3>
              <span className="text-sm text-muted-foreground">
                {filteredItems.length} items
              </span>
            </div>
            
            {filteredItems.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <ContentCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                      onClick={() => handleItemClick(item)}
                      onFavoriteToggle={handleToggleFavorite}
                      onShare={handleShareItem}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <ContentList
                    items={filteredItems}
                    onItemClick={handleItemClick}
                    onFavoriteToggle={handleToggleFavorite}
                    onShare={handleShareItem}
                  />
                </Card>
              )
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-medium text-foreground mb-2">
                    No items found
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search or filters'
                      : 'Start by creating a project or task'}
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear filters
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Content Card Component
interface ContentCardProps {
  item: ContentItem;
  onClick: () => void;
  onFavoriteToggle: (item: ContentItem) => void;
  onShare: (item: ContentItem) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onClick, onFavoriteToggle, onShare }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'project':
        return <Folder className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
      case 'work in progress':
        return 'secondary';
      case 'active':
        return 'outline';
      case 'archived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {item.type}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {item.isFavorited && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteToggle(item);
                  }}
                >
                  {item.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                  }}
                >
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <h4 className="font-medium text-foreground mb-2 line-clamp-2">
          {item.title}
        </h4>
        
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {item.status && (
            <Badge variant={getStatusVariant(item.status) as any} className="text-xs">
              {item.status}
            </Badge>
          )}
          {item.priority && (
            <Badge variant={getPriorityVariant(item.priority) as any} className="text-xs">
              {item.priority}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(item.updatedAt)}</span>
          </div>
          
          {item.type === 'project' && item.metadata && (
            <div className="flex items-center gap-2">
              {item.metadata.taskCount !== undefined && (
                <span>{item.metadata.taskCount} tasks</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Content List Component
interface ContentListProps {
  items: ContentItem[];
  onItemClick: (item: ContentItem) => void;
  onFavoriteToggle: (item: ContentItem) => void;
  onShare: (item: ContentItem) => void;
}

const ContentList: React.FC<ContentListProps> = ({ items, onItemClick, onFavoriteToggle, onShare }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Folder className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
      case 'work in progress':
        return 'secondary';
      case 'active':
        return 'outline';
      case 'archived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="flex items-center gap-4 p-4 hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => onItemClick(item)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getIcon(item.type)}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate">
                  {item.title}
                </h4>
                {item.isFavorited && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            {item.status && (
              <Badge variant={getStatusVariant(item.status) as any}>
                {item.status}
              </Badge>
            )}
            {item.priority && (
              <Badge variant={getPriorityVariant(item.priority) as any}>
                {item.priority}
              </Badge>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="capitalize">{item.type}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(item.updatedAt)}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onItemClick(item); }}>
              Open
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(item);
              }}
            >
              {item.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onShare(item);
              }}
            >
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      ))}
    </div>
  );
};

export default WorkspaceLibraryPage;
