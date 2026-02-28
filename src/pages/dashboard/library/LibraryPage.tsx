import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MoreHorizontal, 
  Eye,
  Target,
  FileText,
  Bookmark,
  FolderOpen,
  ChevronRight,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiService, GoalTemplate, SavedView, FormTemplate } from '@/services/apiService';
import { useAuth } from '@/app/authProvider';
import { cn } from '@/lib/utils';
import { LibraryPageSkeleton } from '@/components/LibrarySkeleton';

type LibraryViewMode = 'grid' | 'list';
type LibraryTab = 'all' | 'templates' | 'saved-views' | 'resources';

interface LibraryItem {
  id: number;
  name: string;
  description?: string;
  type: 'goal-template' | 'form-template' | 'saved-view' | 'resource';
  category?: string;
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
  metadata?: Record<string, unknown>;
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const { activeOrganization, user } = useAuth();
  const [viewMode, setViewMode] = useState<LibraryViewMode>('grid');
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const storedOrganizationValue = typeof window !== 'undefined'
    ? localStorage.getItem('activeOrganizationId')
    : null;
  const storedOrganizationId = storedOrganizationValue ? Number(storedOrganizationValue) : undefined;
  const userOrganizationId = typeof user?.activeOrganizationId === 'number'
    ? user.activeOrganizationId
    : typeof user?.activeOrganizationId === 'string'
      ? Number(user.activeOrganizationId)
      : undefined;
  const organizationId = activeOrganization?.id
    ?? (Number.isFinite(userOrganizationId) ? userOrganizationId : undefined)
    ?? (Number.isFinite(storedOrganizationId) ? storedOrganizationId : undefined);

  // Fetch goal templates
  const { data: goalTemplates, isPending: isGoalTemplatesPending } = useQuery({
    queryKey: ['goalTemplates', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return apiService.getGoalTemplates(organizationId);
    },
    enabled: !!organizationId,
  });

  // Fetch saved views
  const { data: savedViews, isPending: isSavedViewsPending } = useQuery({
    queryKey: ['savedViews', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return apiService.getSavedViews(organizationId);
    },
    enabled: !!organizationId,
  });

  // Fetch form templates
  const { data: formTemplatesData, isPending: isFormTemplatesPending } = useQuery({
    queryKey: ['formTemplates', organizationId],
    queryFn: async () => {
      if (!organizationId) return { templates: [] };
      return apiService.getFormTemplates(organizationId);
    },
    enabled: !!organizationId,
  });

  const formTemplates = formTemplatesData?.templates || [];

  // Transform data into library items
  const libraryItems: LibraryItem[] = React.useMemo(() => {
    const items: LibraryItem[] = [];

    // Add goal templates
    if (Array.isArray(goalTemplates)) {
      goalTemplates.forEach((template: GoalTemplate) => {
        items.push({
          id: template.id,
          name: template.name,
          description: template.description,
          type: 'goal-template',
          category: template.category,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          isSystem: template.isSystem,
          metadata: {
            defaultPriority: template.defaultPriority,
            taskCount: template.taskTemplates?.length || 0,
          },
        });
      });
    }

    // Add form templates
    formTemplates.forEach((template: FormTemplate) => {
      items.push({
        id: template.id,
        name: template.name,
        description: template.description,
        type: 'form-template',
        category: template.category,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        isSystem: template.isSystem,
        metadata: {
          fieldCount: template.fields?.length || 0,
          projectCount: template.projects?.length || 0,
        },
      });
    });

    // Add saved views
    if (Array.isArray(savedViews)) {
      savedViews.forEach((view: SavedView) => {
        items.push({
          id: view.id,
          name: view.name,
          type: 'saved-view',
          createdAt: view.createdAt,
          updatedAt: view.updatedAt,
          metadata: {
            isShared: view.isShared,
            isDefault: view.isDefault,
          },
        });
      });
    }

    return items;
  }, [goalTemplates, formTemplates, savedViews]);

  // Filter items based on search and category
  const filteredItems = React.useMemo(() => {
    let filtered = libraryItems;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => {
        if (activeTab === 'templates') return item.type === 'goal-template' || item.type === 'form-template';
        if (activeTab === 'saved-views') return item.type === 'saved-view';
        if (activeTab === 'resources') return item.type === 'resource';
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    return filtered;
  }, [libraryItems, activeTab, searchQuery, filterCategory]);

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    libraryItems.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [libraryItems]);

  const isPending = isGoalTemplatesPending || isSavedViewsPending || isFormTemplatesPending;

  if (isPending) {
    return <LibraryPageSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Workspace Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize and manage your templates, saved views, and resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="hidden sm:flex"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
          <Button onClick={() => navigate('/dashboard/goals/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal Templates</p>
                <p className="text-2xl font-bold">{goalTemplates?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Form Templates</p>
                <p className="text-2xl font-bold">{formTemplates.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Bookmark className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Views</p>
                <p className="text-2xl font-bold">{savedViews?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FolderOpen className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{libraryItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search library items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="saved-views">Saved Views</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No library items found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "Try adjusting your search or filters" 
              : "Start by creating templates or saving views"}
          </p>
          <Button onClick={() => navigate('/dashboard/goals/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {filteredItems.map((item) => (
            <LibraryItemCard 
              key={`${item.type}-${item.id}`} 
              item={item} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LibraryItemCardProps {
  item: LibraryItem;
  viewMode: LibraryViewMode;
}

function LibraryItemCard({ item, viewMode }: LibraryItemCardProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (item.type) {
      case 'goal-template':
        return <Target className="h-5 w-5 text-primary" />;
      case 'form-template':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'saved-view':
        return <Eye className="h-5 w-5 text-green-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'goal-template':
        return 'Goal Template';
      case 'form-template':
        return 'Form Template';
      case 'saved-view':
        return 'Saved View';
      default:
        return 'Resource';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'goal-template':
        return 'bg-primary/10 text-primary';
      case 'form-template':
        return 'bg-blue-500/10 text-blue-500';
      case 'saved-view':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleClick = () => {
    if (item.type === 'goal-template') {
      navigate(`/dashboard/goals?template=${item.id}`);
    } else if (item.type === 'saved-view') {
      navigate(`/dashboard/tasks?view=${item.id}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn("p-2 rounded-lg", getTypeColor().split(' ')[0])}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{item.name}</h3>
              {item.isSystem && (
                <Badge variant="secondary" className="text-xs">System</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {item.description || getTypeLabel()}
            </p>
          </div>
          {item.category && (
            <Badge variant="outline" className="hidden sm:inline-flex">
              {item.category}
            </Badge>
          )}
          <ItemActions item={item} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", getTypeColor().split(' ')[0])}>
            {getIcon()}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ItemActions item={item} />
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description || `A ${getTypeLabel().toLowerCase()} for your workspace`}
        </p>
        <div className="flex items-center justify-between">
          <Badge className={cn("text-xs", getTypeColor())}>
            {getTypeLabel()}
          </Badge>
          {item.category && (
            <span className="text-xs text-muted-foreground">{item.category}</span>
          )}
        </div>
        {item.metadata && (
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            {item.type === 'goal-template' && item.metadata.taskCount !== undefined && (
              <span>{item.metadata.taskCount} tasks included</span>
            )}
            {item.type === 'form-template' && item.metadata.fieldCount !== undefined && (
              <span>{item.metadata.fieldCount} fields</span>
            )}
            {item.type === 'saved-view' && item.metadata.isShared && (
              <span>Shared view</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ItemActions({ item }: { item: LibraryItem }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        {!item.isSystem && (
          <DropdownMenuItem 
            className="text-destructive"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
