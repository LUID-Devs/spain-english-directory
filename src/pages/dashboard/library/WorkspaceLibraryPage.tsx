import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetProjectsQuery,
  useGetTasksByUserQuery,
  useGetGoalsQuery,
  useGetTeamsQuery,
} from '@/hooks/useApi';
import { useCurrentUser } from '@/stores/userStore';
import { useAuth } from '@/app/authProvider';
import {
  Search,
  Grid3X3,
  List,
  LayoutGrid,
  FolderOpen,
  CheckSquare,
  Target,
  Users,
  Clock,
  Star,
  Archive,
  Filter,
  SortAsc,
  ChevronDown,
  X,
  Bookmark,
  Calendar,
  BarChart3,
  MoreHorizontal,
  ExternalLink,
  FileText,
  Layers,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { toast } from 'sonner';

// Types for library items
type LibraryItemType = 'project' | 'task' | 'goal' | 'team' | 'document';

interface LibraryItem {
  id: string;
  type: LibraryItemType;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  progress?: number;
  updatedAt: string;
  createdAt: string;
  tags?: string[];
  isFavorited?: boolean;
  isArchived?: boolean;
  owner?: {
    id: number;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

// View modes
type ViewMode = 'grid' | 'list' | 'compact';

// Sort options
type SortOption = 'updated' | 'created' | 'name' | 'priority';

const WorkspaceLibraryPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { activeOrganization } = useAuth();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedTypes, setSelectedTypes] = useState<LibraryItemType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Data fetching
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery(
    { userId: currentUser?.userId },
    { skip: !currentUser?.userId }
  );

  const { data: tasks, isLoading: tasksLoading } = useGetTasksByUserQuery(
    currentUser?.userId || null,
    { skip: !currentUser?.userId }
  );

  const { data: goals, isLoading: goalsLoading } = useGetGoalsQuery(
    activeOrganization?.id ? { organizationId: activeOrganization.id } : undefined,
    { skip: !activeOrganization?.id }
  );

  const { data: teams, isLoading: teamsLoading } = useGetTeamsQuery(
    undefined,
    { skip: !currentUser?.userId }
  );

  // Transform data into unified library items
  const libraryItems: LibraryItem[] = useMemo(() => {
    const items: LibraryItem[] = [];

    // Add projects
    projects?.forEach((project) => {
      items.push({
        id: `project-${project.id}`,
        type: 'project',
        title: project.name,
        description: project.description,
        status: project.statistics?.status || 'Active',
        progress: project.statistics?.progress || 0,
        updatedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
        createdAt: project.createdAt || new Date().toISOString(),
        isFavorited: project.isFavorited,
        isArchived: project.archived,
        metadata: {
          taskCount: project.statistics?.totalTasks || 0,
          memberCount: project.statistics?.memberCount || 0,
          projectId: project.id,
        },
      });
    });

    // Add tasks
    tasks?.forEach((task) => {
      items.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        description: task.description,
        status: task.status?.name || task.status || 'To Do',
        priority: task.priority,
        updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
        createdAt: task.createdAt || new Date().toISOString(),
        tags: task.tags?.map((t) => (typeof t === 'string' ? t : t.name)),
        metadata: {
          taskId: task.id,
          projectId: task.projectId,
          points: task.points,
          dueDate: task.dueDate,
        },
      });
    });

    // Add goals
    goals?.forEach((goal) => {
      items.push({
        id: `goal-${goal.id}`,
        type: 'goal',
        title: goal.title,
        description: goal.description,
        status: goal.status,
        progress: goal.progress,
        updatedAt: goal.updatedAt || goal.createdAt || new Date().toISOString(),
        createdAt: goal.createdAt || new Date().toISOString(),
        metadata: {
          goalId: goal.id,
          targetDate: goal.targetDate,
        },
      });
    });

    // Add teams
    teams?.forEach((team) => {
      items.push({
        id: `team-${team.teamId}`,
        type: 'team',
        title: team.name,
        description: team.description,
        updatedAt: team.updatedAt || team.createdAt || new Date().toISOString(),
        createdAt: team.createdAt || new Date().toISOString(),
        metadata: {
          teamId: team.teamId,
          memberCount: team.memberCount,
        },
      });
    });

    return items;
  }, [projects, tasks, goals, teams]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...libraryItems];

    // Filter by tab
    if (activeTab !== 'all') {
      items = items.filter((item) => item.type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      items = items.filter((item) => selectedTypes.includes(item.type));
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3, Backlog: 4 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) -
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 5);
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return items;
  }, [libraryItems, activeTab, searchQuery, selectedTypes, sortBy]);

  // Get counts for tabs
  const counts = useMemo(() => ({
    all: libraryItems.length,
    project: libraryItems.filter((i) => i.type === 'project').length,
    task: libraryItems.filter((i) => i.type === 'task').length,
    goal: libraryItems.filter((i) => i.type === 'goal').length,
    team: libraryItems.filter((i) => i.type === 'team').length,
  }), [libraryItems]);

  // Handle item click
  const handleItemClick = useCallback((item: LibraryItem) => {
    switch (item.type) {
      case 'project':
        navigate(`/dashboard/projects/${item.metadata?.projectId}`);
        break;
      case 'task':
        navigate(`/dashboard/tasks/${item.metadata?.taskId}`);
        break;
      case 'goal':
        navigate(`/dashboard/goals/${item.metadata?.goalId}`);
        break;
      case 'team':
        navigate(`/dashboard/teams`);
        break;
    }
  }, [navigate]);

  const isLoading = projectsLoading || tasksLoading || goalsLoading || teamsLoading;

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workspace Library</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Organize and access all your workspace content in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('updated')}>
                Last Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('created')}>
                Date Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('priority')}>
                Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and View Controls */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, tasks, goals, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type Filter Pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {(['project', 'task', 'goal', 'team'] as LibraryItemType[]).map((type) => (
            <Button
              key={type}
              variant={selectedTypes.includes(type) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedTypes((prev) =>
                  prev.includes(type)
                    ? prev.filter((t) => t !== type)
                    : [...prev, type]
                );
              }}
            >
              {type === 'project' && <FolderOpen className="h-4 w-4 mr-2" />}
              {type === 'task' && <CheckSquare className="h-4 w-4 mr-2" />}
              {type === 'goal' && <Target className="h-4 w-4 mr-2" />}
              {type === 'team' && <Users className="h-4 w-4 mr-2" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}s
              <Badge variant="secondary" className="ml-2">
                {counts[type]}
              </Badge>
            </Button>
          ))}
          {selectedTypes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedTypes([])}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="project">
            <FolderOpen className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Projects</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              {counts.project}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="task">
            <CheckSquare className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tasks</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              {counts.task}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="goal">
            <Target className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Goals</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              {counts.goal}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Teams</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              {counts.team}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <LibrarySkeleton viewMode={viewMode} />
          ) : filteredItems.length === 0 ? (
            <EmptyLibraryState searchQuery={searchQuery} activeTab={activeTab} />
          ) : (
            <LibraryContent
              items={filteredItems}
              viewMode={viewMode}
              onItemClick={handleItemClick}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Library Content Component
interface LibraryContentProps {
  items: LibraryItem[];
  viewMode: ViewMode;
  onItemClick: (item: LibraryItem) => void;
}

const LibraryContent = ({ items, viewMode, onItemClick }: LibraryContentProps) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <LibraryCard key={item.id} item={item} onClick={() => onItemClick(item)} />
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <LibraryListItem key={item.id} item={item} onClick={() => onItemClick(item)} />
        ))}
      </div>
    );
  }

  // Compact view
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <CompactCard key={item.id} item={item} onClick={() => onItemClick(item)} />
      ))}
    </div>
  );
};

// Library Card Component
interface LibraryCardProps {
  item: LibraryItem;
  onClick: () => void;
}

const LibraryCard = ({ item, onClick }: LibraryCardProps) => {
  const getIcon = () => {
    switch (item.type) {
      case 'project':
        return <FolderOpen className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'team':
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in progress':
      case 'work in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            {item.isFavorited && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
        {item.description && (
          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {item.status && (
            <Badge className={cn('text-xs', getStatusColor(item.status))}>
              {item.status}
            </Badge>
          )}
          {item.priority && (
            <Badge variant="outline" className="text-xs">
              {item.priority}
            </Badge>
          )}
        </div>

        {item.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{item.progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(item.updatedAt)}
          </div>
          {item.metadata?.taskCount !== undefined && (
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {item.metadata.taskCount} tasks
            </div>
          )}
          {item.metadata?.memberCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {item.metadata.memberCount}
            </div>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Library List Item Component
const LibraryListItem = ({ item, onClick }: LibraryCardProps) => {
  const getIcon = () => {
    switch (item.type) {
      case 'project':
        return <FolderOpen className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'team':
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-3 bg-card border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.title}</span>
          {item.isFavorited && <Star className="h-4 w-4 text-amber-400 fill-amber-400 flex-shrink-0" />}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-4">
        {item.status && (
          <Badge variant="outline">{item.status}</Badge>
        )}
        {item.priority && (
          <Badge variant="secondary">{item.priority}</Badge>
        )}
        {item.progress !== undefined && (
          <div className="flex items-center gap-2 w-24">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.progress}%</span>
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground hidden md:block">
        {formatDistanceToNow(item.updatedAt)}
      </div>
      <Button variant="ghost" size="sm" className="flex-shrink-0">
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Compact Card Component
const CompactCard = ({ item, onClick }: LibraryCardProps) => {
  const getIcon = () => {
    switch (item.type) {
      case 'project':
        return <FolderOpen className="h-6 w-6 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-6 w-6 text-green-500" />;
      case 'goal':
        return <Target className="h-6 w-6 text-purple-500" />;
      case 'team':
        return <Users className="h-6 w-6 text-orange-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div
      className="flex flex-col items-center p-4 bg-card border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors text-center"
      onClick={onClick}
    >
      <div className="mb-2">{getIcon()}</div>
      <span className="text-sm font-medium line-clamp-2">{item.title}</span>
      <span className="text-xs text-muted-foreground capitalize mt-1">{item.type}</span>
    </div>
  );
};

// Skeleton Component
const LibrarySkeleton = ({ viewMode }: { viewMode: ViewMode }) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-5 w-5 bg-muted rounded animate-pulse mb-2" />
              <div className="h-5 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse mt-2" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-1.5 bg-muted rounded-full animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-card border rounded-lg">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center p-4 bg-card border rounded-lg">
          <div className="h-6 w-6 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
        </div>
      ))}
    </div>
  );
};

// Empty State Component
const EmptyLibraryState = ({ searchQuery, activeTab }: { searchQuery: string; activeTab: string }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">
          {searchQuery ? 'No items match your search' : 'No items in your library'}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery
            ? 'Try adjusting your search terms or filters'
            : activeTab === 'all'
            ? 'Your workspace library will show projects, tasks, goals, and teams here'
            : `No ${activeTab}s found. Create one to get started.`}
        </p>
      </CardContent>
    </Card>
  );
};

export default WorkspaceLibraryPage;
