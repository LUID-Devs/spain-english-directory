import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Loader2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/app/authProvider';
import { apiService, Goal } from '@/services/apiService';
import { toast } from 'sonner';

const NO_PROJECT_VALUE = '__none__';

const CreateGoalPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeOrganization, user } = useAuth();

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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [goalType, setGoalType] = useState<'company' | 'team' | 'individual'>('individual');
  const [visibility, setVisibility] = useState<'public' | 'team' | 'private'>('private');
  const [targetDate, setTargetDate] = useState('');
  const [projectId, setProjectId] = useState<string>('');

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Goal>) => apiService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully');
      navigate('/dashboard/goals');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create goal');
    },
  });

  const isFormValid = useMemo(() => {
    return !!title.trim() && !!organizationId;
  }, [title, organizationId]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !organizationId) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      goalType,
      visibility,
      targetDate: targetDate || undefined,
      organizationId,
      projectId: projectId ? parseInt(projectId) : undefined,
      status: 'active',
      progress: 0,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/goals')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">New Initiative</h1>
          </div>
          <Button
            onClick={() => handleSubmit()}
            disabled={!isFormValid || createMutation.isPending}
            size="sm"
            className="shrink-0"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24 max-w-lg mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create an Initiative</h2>
              <p className="text-sm text-muted-foreground">
                Define outcomes and track progress
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Launch mobile onboarding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-lg"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the initiative..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base">Type & Priority</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Type</Label>
                <Select value={goalType} onValueChange={(v) => setGoalType(v as any)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">👤 Individual</SelectItem>
                    <SelectItem value="team">👥 Team</SelectItem>
                    <SelectItem value="company">🏢 Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Visibility & Project</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Project</Label>
                <Select
                  value={projectId || NO_PROJECT_VALUE}
                  onValueChange={(value) => setProjectId(value === NO_PROJECT_VALUE ? '' : value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PROJECT_VALUE}>None</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate" className="text-base">Target Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {!organizationId && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 text-sm text-destructive">
                Join or select an organization to create initiatives.
              </CardContent>
            </Card>
          )}
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden">
        <Button
          onClick={() => handleSubmit()}
          disabled={!isFormValid || createMutation.isPending}
          className="w-full h-12 text-base"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Initiative'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateGoalPage;
