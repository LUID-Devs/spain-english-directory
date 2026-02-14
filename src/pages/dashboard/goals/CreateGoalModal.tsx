import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Target, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiService, Goal } from '@/services/apiService';
import { toast } from 'sonner';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: number;
  parentGoalId?: number | null;
}

export function CreateGoalModal({ isOpen, onClose, organizationId, parentGoalId }: CreateGoalModalProps) {
  const NO_PROJECT_VALUE = "__none__";
  const queryClient = useQueryClient();
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
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Goal>) => apiService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully');
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setGoalType('individual');
    setVisibility('private');
    setTargetDate('');
    setProjectId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      parentGoalId: parentGoalId || undefined,
      status: 'active',
      progress: 0,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter goal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Goal Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select value={goalType} onValueChange={(v) => setGoalType(v as any)}>
                <SelectTrigger>
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
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
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

          {/* Visibility & Project */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                <SelectTrigger>
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
              <Select
                value={projectId || NO_PROJECT_VALUE}
                onValueChange={(value) => setProjectId(value === NO_PROJECT_VALUE ? "" : value)}
              >
                <SelectTrigger>
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

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
