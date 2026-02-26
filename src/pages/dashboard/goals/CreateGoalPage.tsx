import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/authProvider';
import { useCurrentUser } from '@/stores/userStore';
import { useCreateGoalMutation, useGetProjectsQuery } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Target, Calendar, AlertTriangle, Loader2, Check } from 'lucide-react';

const CreateGoalPage = () => {
  const navigate = useNavigate();
  const { activeOrganization, user } = useAuth();
  const { currentUser } = useCurrentUser();
  const [createGoal, { isLoading }] = useCreateGoalMutation();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

  const { data: projects } = useGetProjectsQuery({}, {
    skip: !currentUser?.userId,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [goalType, setGoalType] = useState<'company' | 'team' | 'individual'>('individual');
  const [visibility, setVisibility] = useState<'public' | 'team' | 'private'>('private');
  const [targetDate, setTargetDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || organizationId == null) {
      setError('Title and organization are required.');
      return;
    }

    setError('');

    try {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        goalType,
        visibility,
        targetDate: targetDate || undefined,
        organizationId,
        projectId: projectId ? Number(projectId) : undefined,
        status: 'active',
        progress: 0,
      }).unwrap();

      setSuccess(true);
      timeoutRef.current = setTimeout(() => {
        navigate('/dashboard/goals');
      }, 1500);
    } catch (err: any) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setError(err?.data?.message || 'Failed to create goal. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6 pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Goal Created!</h2>
            <p className="text-muted-foreground">Redirecting to goals...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold truncate">New Goal</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !organizationId || isLoading}
            size="sm"
            className="shrink-0"
          >
            {isLoading ? (
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
              <p className="text-sm text-muted-foreground">Track objectives and align work</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="goalTitle" className="text-base">
              Goal Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="goalTitle"
              type="text"
              placeholder="e.g., Improve onboarding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalDescription" className="text-base">
              Summary
            </Label>
            <Textarea
              id="goalDescription"
              placeholder="Describe the outcome you're targeting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select value={goalType} onValueChange={(value) => setGoalType(value as any)}>
                <SelectTrigger className="h-11">
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
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                <SelectTrigger className="h-11">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as any)}>
                <SelectTrigger className="h-11">
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
              <Label>Project (Optional)</Label>
              <Select value={projectId || '__none__'} onValueChange={(value) => setProjectId(value === '__none__' ? '' : value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate" className="text-base">
              Target Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-12 pl-10"
              />
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden">
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !organizationId || isLoading}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Goal'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateGoalPage;
