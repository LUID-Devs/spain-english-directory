import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Link,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiService, LinkedCycle } from '@/services/apiService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/app/authProvider';

interface Cycle {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeOrganization } = useAuth();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  const goalIdNum = parseInt(goalId || '0', 10);

  // Fetch goal details
  const { data: goal, isLoading: isLoadingGoal } = useQuery({
    queryKey: ['goal', goalIdNum],
    queryFn: () => apiService.getGoal(goalIdNum),
    enabled: !!goalIdNum,
  });

  // Fetch linked cycles
  const { data: cyclesData, isLoading: isLoadingCycles } = useQuery({
    queryKey: ['goal-cycles', goalIdNum],
    queryFn: () => apiService.getGoalCycles(goalIdNum),
    enabled: !!goalIdNum,
  });

  // Fetch available cycles for linking
  const { data: availableCycles } = useQuery({
    queryKey: ['available-cycles', goal?.teamId],
    queryFn: async () => {
      if (!goal?.teamId) return [];
      const response = await fetch(
        `/api/teams/${goal.teamId}/cycles`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch cycles');
      const data = await response.json();
      return data.cycles || [];
    },
    enabled: !!goal?.teamId,
  });

  // Link cycle mutation
  const linkMutation = useMutation({
    mutationFn: (cycleId: number) =>
      apiService.linkCyclesToGoal(goalIdNum, [cycleId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-cycles', goalIdNum] });
      setIsLinkDialogOpen(false);
      setSelectedCycleId('');
      toast.success('Cycle linked to goal');
    },
    onError: () => {
      toast.error('Failed to link cycle');
    },
  });

  // Unlink cycle mutation
  const unlinkMutation = useMutation({
    mutationFn: (cycleId: number) =>
      apiService.unlinkCyclesFromGoal(goalIdNum, [cycleId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-cycles', goalIdNum] });
      toast.success('Cycle unlinked from goal');
    },
    onError: () => {
      toast.error('Failed to unlink cycle');
    },
  });

  const linkedCycles = cyclesData?.cycles || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'active':
        return 'secondary';
      case 'upcoming':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getCycleStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'active':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Filter out already linked cycles
  const unlinkedCycles =
    availableCycles?.filter(
      (cycle: Cycle) => !linkedCycles.find((lc) => lc.id === cycle.id)
    ) || [];

  if (isLoadingGoal) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Goal not found</h3>
          <Button onClick={() => navigate('/dashboard/goals')} className="mt-4">
            Back to Goals
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/goals')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{goal.title}</h1>
            <Badge variant={getStatusBadgeVariant(goal.status) as any}>
              {goal.status}
            </Badge>
            <div
              className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`}
            />
          </div>
          {goal.description && (
            <p className="text-muted-foreground mt-1">{goal.description}</p>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-3xl font-bold">{goal.progress || 0}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Target Date</p>
              <p className="font-medium">
                {goal.targetDate
                  ? new Date(goal.targetDate).toLocaleDateString()
                  : 'No target date'}
              </p>
            </div>
          </div>
          <Progress value={goal.progress || 0} className="h-3" />
        </CardContent>
      </Card>

      {/* Linked Cycles Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Linked Cycles
          </CardTitle>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={unlinkedCycles.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Link Cycle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Cycle to Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select
                  value={selectedCycleId}
                  onValueChange={setSelectedCycleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedCycles.map((cycle: Cycle) => (
                      <SelectItem key={cycle.id} value={String(cycle.id)}>
                        {cycle.name} ({new Date(cycle.startDate).toLocaleDateString()} -{' '}
                        {new Date(cycle.endDate).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {unlinkedCycles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No available cycles to link. Create a cycle first.
                  </p>
                )}
                <Button
                  onClick={() =>
                    selectedCycleId && linkMutation.mutate(parseInt(selectedCycleId))
                  }
                  disabled={!selectedCycleId || linkMutation.isPending}
                  className="w-full"
                >
                  {linkMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Link Cycle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoadingCycles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : linkedCycles.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No cycles linked to this goal</p>
              <p className="text-sm text-muted-foreground mt-1">
                Link cycles to track progress across iterations
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedCycles.map((cycle: LinkedCycle) => (
                <div
                  key={cycle.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getCycleStatusIcon(cycle.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cycle.name}</span>
                        <Badge variant={getStatusBadgeVariant(cycle.status) as any}>
                          {cycle.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(cycle.startDate).toLocaleDateString()} -{' '}
                          {new Date(cycle.endDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {cycle.completedTasks}/{cycle.totalTasks} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{cycle.progress}%</p>
                      <p className="text-xs text-muted-foreground">completed</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => unlinkMutation.mutate(cycle.id)}
                      disabled={unlinkMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {linkedCycles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Linked Cycles</p>
              <p className="text-2xl font-bold">{linkedCycles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Cycles</p>
              <p className="text-2xl font-bold">
                {linkedCycles.filter((c) => c.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed Cycles</p>
              <p className="text-2xl font-bold">
                {linkedCycles.filter((c) => c.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
