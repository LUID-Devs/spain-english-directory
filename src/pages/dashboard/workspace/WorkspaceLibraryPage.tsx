import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/authProvider';
import { useGetProjectsQuery, useGetTasksQuery } from '@/hooks/useApi';
import { useCurrentUser } from '@/stores/userStore';
import {
  Building2,
  FolderOpen,
  CheckSquare,
  Users,
  Search,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  ArrowRight,
  Plus,
  Star,
  Clock,
  MoreHorizontal,
  LayoutGrid,
  Briefcase,
  Target,
  Calendar,
  TrendingUp,
  Archive,
  Sparkles,
  User,
  Crown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import { useSubscription } from '@/stores/subscriptionStore';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

// Free tier workspace limit
const FREE_WORKSPACE_LIMIT = 2;

interface WorkspaceItem {
  id: number;
  name: string;
  description?: string;
  isPersonal: boolean;
  role: string;
  logoUrl?: string;
  projectCount: number;
  taskCount: number;
  memberCount: number;
  createdAt: string;
  lastActive?: string;
}

const WorkspaceLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizations, activeOrganization } = useAuth();
  const { currentUser } = useCurrentUser();
  const { isPro } = useSubscription();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'activity'>('activity');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'team'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Fetch projects and tasks for stats
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery({});
  const { data: tasks, isLoading: tasksLoading } = useGetTasksQuery({});

  // Transform organizations into workspace items with stats
  const workspaceItems: WorkspaceItem[] = useMemo(() => {
    if (!organizations) return [];
    
    return organizations.map(org => {
      const orgProjects = projects?.filter(p => p.organizationId === org.id) || [];
      const orgTasks = tasks?.filter(t => {
        const taskProject = projects?.find(p => p.id === t.projectId);
        return taskProject?.organizationId === org.id;
      }) || [];

      return {
        id: org.id,
        name: org.name,
        description: org.description,
        isPersonal: org.settings?.isPersonal || false,
        role: org.role || 'member',
        logoUrl: org.logoUrl,
        projectCount: orgProjects.length,
        taskCount: orgTasks.length,
        memberCount: org.memberCount || 1,
        createdAt: org.createdAt || new Date().toISOString(),
        lastActive: org.updatedAt,
      };
    });
  }, [organizations, projects, tasks]);

  // Filter workspaces
  const filteredWorkspaces = useMemo(() => {
    let filtered = workspaceItems;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(w => 
        filterType === 'personal' ? w.isPersonal : !w.isPersonal
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'activity':
          {
            const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
            const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
            return bTime - aTime;
          }
        default:
          return 0;
      }
    });
  }, [workspaceItems, searchTerm, filterType, sortBy]);

  // Stats summary
  const stats = useMemo(() => {
    const totalProjects = projects?.length || 0;
    const totalTasks = tasks?.length || 0;
    const activeWorkspaces = workspaceItems.filter(w => w.projectCount > 0).length;
    const completionRate = totalTasks > 0 
      ? Math.round((tasks?.filter(t => t.status === 'Done').length || 0) / totalTasks * 100)
      : 0;

    return { totalProjects, totalTasks, activeWorkspaces, completionRate };
  }, [projects, tasks, workspaceItems]);

  const handleCreateWorkspace = () => {
    if (isPro || workspaceItems.length < FREE_WORKSPACE_LIMIT) {
      setIsCreateModalOpen(true);
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const handleWorkspaceClick = (workspaceId: number) => {
    // Navigate to that workspace's projects
    navigate('/dashboard/projects');
  };

  const getWorkspaceIcon = (workspace: WorkspaceItem) => {
    if (workspace.isPersonal) {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
      );
    }
    if (workspace.logoUrl) {
      return (
        <img
          src={workspace.logoUrl}
          alt={workspace.name}
          className="w-12 h-12 rounded-xl object-cover"
        />
      );
    }
    const initials = workspace.name.substring(0, 2).toUpperCase();
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
        {initials}
      </div>
    );
  };

  const isLoading = projectsLoading || tasksLoading;

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-6 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <LayoutGrid className="h-8 w-8 text-primary" />
            Workspace Library
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Organize and manage all your workspaces in one place
          </p>
        </div>
        <Button 
          onClick={handleCreateWorkspace}
          className="w-full lg:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
          {!isPro && workspaceItems.length >= FREE_WORKSPACE_LIMIT && (
            <Crown className="h-4 w-4 ml-2 text-amber-400" />
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{workspaceItems.length}</p>
              <p className="text-xs text-muted-foreground">Workspaces</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Your Workspaces</CardTitle>
              <CardDescription>
                {filteredWorkspaces.length} workspace{filteredWorkspaces.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-full sm:w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-full sm:w-36">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Most Active</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Created Date</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className={cn(
              "gap-4",
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
            )}>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredWorkspaces.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No workspaces match your search' : 'No workspaces yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first workspace to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateWorkspace}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              "gap-4",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                : "flex flex-col"
            )}>
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  isActive={workspace.id === activeOrganization?.id}
                  viewMode={viewMode}
                  onClick={() => handleWorkspaceClick(workspace.id)}
                  getWorkspaceIcon={getWorkspaceIcon}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Unlock Unlimited Workspaces"
        message={`Free users are limited to ${FREE_WORKSPACE_LIMIT} workspaces. Upgrade to Pro to create unlimited workspaces and unlock all premium features.`}
        features={[
          'Unlimited workspaces',
          'Unlimited projects per workspace',
          'Advanced workspace analytics',
          'Custom workspace branding',
          'Priority support',
          'Access to all LUID apps',
        ]}
      />
    </div>
  );
};

// Workspace Card Component
interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  isActive: boolean;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  getWorkspaceIcon: (w: WorkspaceItem) => React.ReactNode;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  isActive,
  viewMode,
  onClick,
  getWorkspaceIcon,
}) => {
  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isActive && "border-primary ring-1 ring-primary"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 flex items-center gap-4">
          {getWorkspaceIcon(workspace)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{workspace.name}</h3>
              {workspace.isPersonal && (
                <Badge variant="secondary" className="text-xs">Personal</Badge>
              )}
              {isActive && (
                <Badge className="text-xs">Active</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {workspace.description || 'No description'}
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FolderOpen className="h-4 w-4" />
              <span>{workspace.projectCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckSquare className="h-4 w-4" />
              <span>{workspace.taskCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{workspace.memberCount}</span>
            </div>
            <div className="flex items-center gap-1 capitalize">
              <span className="text-xs">{workspace.role}</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        isActive && "border-primary ring-1 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {getWorkspaceIcon(workspace)}
          <div className="flex items-center gap-1">
            {workspace.isPersonal && (
              <Badge variant="secondary" className="text-xs">Personal</Badge>
            )}
            {isActive && (
              <Badge className="text-xs">Active</Badge>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-1 truncate">{workspace.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
          {workspace.description || 'No description provided'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-muted rounded-lg">
            <FolderOpen className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-medium">{workspace.projectCount}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <CheckSquare className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-medium">{workspace.taskCount}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-medium">{workspace.memberCount}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Badge variant="outline" className="capitalize text-xs">
            {workspace.role}
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            View
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkspaceLibraryPage;
