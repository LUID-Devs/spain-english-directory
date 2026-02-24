import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus, Calendar, ChevronRight, TrendingUp, MoreHorizontal, Trash2, Edit, Link, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiService, Goal } from '@/services/apiService';
import { useAuth } from '@/app/authProvider';
import { toast } from 'sonner';
import { CreateGoalModal } from './CreateGoalModal';
import { EditGoalModal } from './EditGoalModal';
import { GoalsPageSkeleton } from '@/components/GoalsSkeleton';

interface GoalWithHierarchy extends Goal {
  level?: number;
}

export default function GoalsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeOrganization, isLoading: isAuthLoading, user } = useAuth();
  const storedOrganizationId = typeof window !== 'undefined'
    ? Number(localStorage.getItem('activeOrganizationId'))
    : undefined;
  const organizationId = activeOrganization?.id
    ?? (user?.activeOrganizationId as number | undefined)
    ?? (Number.isFinite(storedOrganizationId) ? storedOrganizationId : undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'company' | 'team' | 'individual'>('all');

  const { data: goals, isPending, error: queryError } = useQuery({
    queryKey: ['goals', organizationId, filter],
    queryFn: async () => {
      if (!organizationId) return [];
      const statusFilter = filter === 'active' || filter === 'completed' ? filter : undefined;
      return apiService.getGoals(organizationId, { status: statusFilter });
    },
    enabled: !!organizationId,
  });

  const deleteMutation = useMutation({
    mutationFn: (goalId: number) => apiService.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete goal');
    },
  });

  // Build hierarchical structure
  const buildGoalHierarchy = (goals: Goal[]): GoalWithHierarchy[] => {
    const goalMap = new Map<number, GoalWithHierarchy>();
    const orderedGoals: GoalWithHierarchy[] = [];
    const visited = new Set<number>();

    goals?.forEach((goal) => {
      goalMap.set(goal.id, { ...goal, level: 0 });
    });

    const addGoalWithChildren = (goal: GoalWithHierarchy, level: number) => {
      if (visited.has(goal.id)) {
        return;
      }

      visited.add(goal.id);
      goal.level = level;
      orderedGoals.push(goal);

      const children = goals?.filter((g) => g.parentGoalId === goal.id) || [];
      children.forEach((child) => {
        const childNode = goalMap.get(child.id);
        if (childNode) {
          addGoalWithChildren(childNode, level + 1);
        }
      });
    };

    // Roots: no parent or parent missing from fetched data
    goals?.forEach((goal) => {
      const parentId = goal.parentGoalId;
      if (!parentId || !goalMap.has(parentId)) {
        const node = goalMap.get(goal.id);
        if (node) {
          addGoalWithChildren(node, 0);
        }
      }
    });

    // Ensure all goals are included even if there are cycles or missing parents
    goals?.forEach((goal) => {
      const node = goalMap.get(goal.id);
      if (node && !visited.has(node.id)) {
        addGoalWithChildren(node, 0);
      }
    });

    return orderedGoals;
  };

  const hierarchicalGoals = buildGoalHierarchy(goals || []);

  // Filter by type
  const filteredGoals = hierarchicalGoals.filter((goal) => {
    if (filter === 'all' || filter === 'active' || filter === 'completed') return true;
    return goal.goalType === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'team': return '👥';
      case 'individual': return '👤';
      default: return '📋';
    }
  };

  if (isAuthLoading) {
    return <GoalsPageSkeleton />;
  }

  if (!organizationId) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Organization</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            You need to be part of an organization to view goals.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return <GoalsPageSkeleton />;
  }

  if (queryError) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load goals</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {queryError instanceof Error ? queryError.message : 'An unexpected error occurred while fetching goals.'}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['goals'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your objectives and key results
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'active', 'completed', 'company', 'team', 'individual'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{goals?.length || 0}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {goals?.filter((g) => g.status === 'completed')?.length || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {goals?.length
                    ? Math.round(
                        goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Linked Tasks</p>
                <p className="text-2xl font-bold">
                  {goals?.reduce((acc, g) => acc + (g._count?.linkedTasks || 0), 0) || 0}
                </p>
              </div>
              <Link className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No goals found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all'
                ? "Get started by creating your first goal"
                : `No ${filter} goals found. Try changing the filter.`}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card
              key={goal.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              style={{ marginLeft: `${(goal.level || 0) * 24}px` }}
              onClick={() => navigate(`/dashboard/goals/${goal.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Indent indicator for hierarchy */}
                  {goal.level && goal.level > 0 && (
                    <div className="flex items-center text-muted-foreground">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{getGoalTypeIcon(goal.goalType)}</span>
                        <h3 className="font-semibold text-foreground truncate">
                          {goal.title}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(goal.status) as any}>
                          {goal.status}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`} />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingGoal(goal); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this goal?')) {
                                deleteMutation.mutate(goal.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {/* Progress */}
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Progress value={goal.progress || 0} className="h-2" />
                        <span className="shrink-0">{goal.progress || 0}%</span>
                      </div>

                      {/* Linked Tasks */}
                      {(goal._count?.linkedTasks ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Link className="h-3 w-3" />
                          {goal._count?.linkedTasks ?? 0} tasks
                        </span>
                      )}

                      {/* Child Goals */}
                      {(goal._count?.childGoals ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {goal._count?.childGoals ?? 0} sub-goals
                        </span>
                      )}

                      {/* Target Date */}
                      {goal.targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      )}

                      {/* Project */}
                      {goal.project && (
                        <Badge variant="outline" className="text-xs">
                          {goal.project.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId={organizationId}
      />

      {/* Edit Goal Modal */}
      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          isOpen={!!editingGoal}
          onClose={() => setEditingGoal(null)}
        />
      )}
    </div>
  );
}
