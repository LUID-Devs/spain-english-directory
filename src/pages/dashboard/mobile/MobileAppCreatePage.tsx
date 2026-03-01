import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  FolderPlus, 
  Target, 
  Calendar, 
  Loader2, 
  Check,
  Sparkles,
  Building2,
  User,
  Users,
  Lock,
  Globe,
  Search,
  ListFilter,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/authProvider';
import { apiService, Project, Goal, Task } from '@/services/apiService';
import { useCurrentUser } from '@/stores/userStore';
import { toast } from 'sonner';
import { formatISO } from 'date-fns';

const NO_PROJECT_VALUE = '__none__';

type CreateType = 'project' | 'initiative';
type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: 'bg-gray-500' },
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-500' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const MobileAppCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeOrganization, user } = useAuth();
  const { currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<CreateType>('project');

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

  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('planning');
  
  // Task attachment state
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Initiative form state
  const [initiativeTitle, setInitiativeTitle] = useState('');
  const [initiativeDescription, setInitiativeDescription] = useState('');
  const [initiativePriority, setInitiativePriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [initiativeType, setInitiativeType] = useState<'company' | 'team' | 'individual'>('individual');
  const [initiativeVisibility, setInitiativeVisibility] = useState<'public' | 'team' | 'private'>('private');
  const [initiativeTargetDate, setInitiativeTargetDate] = useState('');
  const [initiativeProjectId, setInitiativeProjectId] = useState<string>('');

  // Fetch projects for initiative linking
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
    enabled: activeTab === 'initiative',
  });

  // Fetch available tasks for attachment
  const { data: availableTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'user', currentUser?.userId],
    queryFn: () => currentUser?.userId ? apiService.getTasksByUser(currentUser.userId) : Promise.resolve([]),
    enabled: activeTab === 'project' && showTaskSelector && !!currentUser?.userId,
  });

  const filteredTasks = useMemo(() => {
    const activeTasks = (availableTasks || []).filter((task: Task) => !task.archivedAt);
    if (!taskSearch.trim()) return activeTasks;
    const query = taskSearch.toLowerCase();
    return activeTasks.filter((task: Task) => task.title.toLowerCase().includes(query));
  }, [availableTasks, taskSearch]);

  const createProjectMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const newProject = await apiService.createProject(data);
      
      // Attach selected tasks if any
      if (selectedTaskIds.size > 0) {
        await apiService.bulkMoveToProject(Array.from(selectedTaskIds), Number(newProject.id));
      }
      
      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Project created successfully');
      navigate('/dashboard/projects');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create project');
    },
  });

  const createInitiativeMutation = useMutation({
    mutationFn: (data: Partial<Goal>) => apiService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Initiative created successfully');
      navigate('/dashboard/goals');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create initiative');
    },
  });

  const isProjectValid = projectName.trim() && projectStartDate && projectEndDate;
  const isInitiativeValid = initiativeTitle.trim() && organizationId;

  const toggleTask = (taskId: number) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleCreateProject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isProjectValid) return;

    const start = new Date(projectStartDate);
    const end = new Date(projectEndDate);
    
    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }

    createProjectMutation.mutate({
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
      startDate: formatISO(start, { representation: 'complete' }),
      endDate: formatISO(end, { representation: 'complete' }),
      status: projectStatus,
    });
  };

  const handleCreateInitiative = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isInitiativeValid) return;

    createInitiativeMutation.mutate({
      title: initiativeTitle.trim(),
      description: initiativeDescription.trim() || undefined,
      priority: initiativePriority,
      goalType: initiativeType,
      visibility: initiativeVisibility,
      targetDate: initiativeTargetDate || undefined,
      organizationId,
      projectId: initiativeProjectId ? parseInt(initiativeProjectId) : undefined,
      status: 'active',
      progress: 0,
    });
  };

  const getProjectDurationText = () => {
    if (!projectStartDate || !projectEndDate) return null;
    const start = new Date(projectStartDate);
    const end = new Date(projectEndDate);
    if (end < start) return null;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getSelectedTasksCount = () => selectedTaskIds.size;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {activeTab === 'project' ? 'New Project' : 'New Initiative'}
            </h1>
          </div>
        </div>
      </header>

      <main className="p-4 pb-32 max-w-lg mx-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CreateType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="project" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Project
            </TabsTrigger>
            <TabsTrigger value="initiative" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Initiative
            </TabsTrigger>
          </TabsList>

          {/* Project Form */}
          <TabsContent value="project" className="mt-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create a Project</h2>
                  <p className="text-sm text-muted-foreground">
                    Organize your work and track progress
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-base">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Mobile App Redesign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-12 text-lg"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-base">Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="What's this project about?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Separator />

              {/* Status Selection */}
              <div className="space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <ListFilter className="h-4 w-4 text-primary" />
                  Status
                </Label>
                <Select value={projectStatus} onValueChange={(v) => setProjectStatus(v as ProjectStatus)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Timeline */}
              <div className="space-y-4">
                <Label className="text-base">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Timeline <span className="text-destructive">*</span>
                </Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="projectStartDate" className="text-sm text-muted-foreground">
                      Start Date
                    </Label>
                    <Input
                      id="projectStartDate"
                      type="date"
                      value={projectStartDate}
                      onChange={(e) => setProjectStartDate(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectEndDate" className="text-sm text-muted-foreground">
                      End Date
                    </Label>
                    <Input
                      id="projectEndDate"
                      type="date"
                      value={projectEndDate}
                      onChange={(e) => setProjectEndDate(e.target.value)}
                      className="h-12"
                      min={projectStartDate}
                    />
                  </div>
                </div>

                {getProjectDurationText() && (
                  <p className="text-sm text-center text-muted-foreground bg-muted rounded-lg py-2">
                    Duration: <span className="font-medium text-foreground">{getProjectDurationText()}</span>
                  </p>
                )}
              </div>

              <Separator />

              {/* Attach Existing Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Attach Existing Tasks
                  </Label>
                  {getSelectedTasksCount() > 0 && (
                    <Badge variant="secondary">
                      {getSelectedTasksCount()} selected
                    </Badge>
                  )}
                </div>
                
                {!showTaskSelector ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => setShowTaskSelector(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Select tasks to attach
                  </Button>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-3 space-y-3">
                      <Input
                        placeholder="Search tasks..."
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        className="h-10"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {tasksLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : filteredTasks.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No tasks found.
                          </p>
                        ) : (
                          filteredTasks.map((task: Task) => (
                            <label
                              key={task.id}
                              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedTaskIds.has(task.id)}
                                onCheckedChange={() => toggleTask(task.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                {task.project?.name && (
                                  <p className="text-xs text-muted-foreground">
                                    Current: {task.project.name}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowTaskSelector(false)}
                      >
                        Done
                      </Button>
                    </CardContent>
                  </Card>
                )}
                <p className="text-xs text-muted-foreground">
                  Selected tasks will be moved into this project after creation.
                </p>
              </div>

              {/* Quick Tips */}
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium text-sm">Quick Tips</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use clear, descriptive names</li>
                    <li>• Set realistic timelines</li>
                    <li>• Link initiatives to projects for tracking</li>
                  </ul>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* Initiative Form */}
          <TabsContent value="initiative" className="mt-6">
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

            <form onSubmit={handleCreateInitiative} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="initiativeTitle" className="text-base">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="initiativeTitle"
                  placeholder="e.g., Launch mobile onboarding"
                  value={initiativeTitle}
                  onChange={(e) => setInitiativeTitle(e.target.value)}
                  className="h-12 text-lg"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initiativeDescription" className="text-base">Description</Label>
                <Textarea
                  id="initiativeDescription"
                  placeholder="Describe the initiative..."
                  value={initiativeDescription}
                  onChange={(e) => setInitiativeDescription(e.target.value)}
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
                    <Select value={initiativeType} onValueChange={(v) => setInitiativeType(v as any)}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Individual
                          </span>
                        </SelectItem>
                        <SelectItem value="team">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Team
                          </span>
                        </SelectItem>
                        <SelectItem value="company">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Company
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Priority</Label>
                    <Select value={initiativePriority} onValueChange={(v) => setInitiativePriority(v as any)}>
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
                    <Select value={initiativeVisibility} onValueChange={(v) => setInitiativeVisibility(v as any)}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <span className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Private
                          </span>
                        </SelectItem>
                        <SelectItem value="team">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Team
                          </span>
                        </SelectItem>
                        <SelectItem value="public">
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Project</Label>
                    <Select
                      value={initiativeProjectId || NO_PROJECT_VALUE}
                      onValueChange={(value) => setInitiativeProjectId(value === NO_PROJECT_VALUE ? '' : value)}
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
                <Label htmlFor="initiativeTargetDate" className="text-base">Target Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="initiativeTargetDate"
                    type="date"
                    value={initiativeTargetDate}
                    onChange={(e) => setInitiativeTargetDate(e.target.value)}
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden">
        {activeTab === 'project' ? (
          <Button
            onClick={handleCreateProject}
            disabled={!isProjectValid || createProjectMutation.isPending}
            className="w-full h-12 text-base"
          >
            {createProjectMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="h-5 w-5 mr-2" />
                Create Project
                {getSelectedTasksCount() > 0 && ` (${getSelectedTasksCount()} tasks)`}
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleCreateInitiative}
            disabled={!isInitiativeValid || createInitiativeMutation.isPending}
            className="w-full h-12 text-base"
          >
            {createInitiativeMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Target className="h-5 w-5 mr-2" />
                Create Initiative
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileAppCreatePage;
