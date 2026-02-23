import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Calendar } from 'lucide-react';
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

interface EditGoalModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
}

export function EditGoalModal({ goal, isOpen, onClose }: EditGoalModalProps) {
  const NO_PROJECT_VALUE = "__none__";
  const queryClient = useQueryClient();
  const initialRenderRef = useRef(true);
  
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || '');
  const [priority, setPriority] = useState(goal.priority);
  const [status, setStatus] = useState(goal.status);
  const [goalType, setGoalType] = useState(goal.goalType);
  const [visibility, setVisibility] = useState(goal.visibility);
  const [targetDate, setTargetDate] = useState(goal.targetDate ? goal.targetDate.split('T')[0] : '');
  const [projectId, setProjectId] = useState(goal.projectId?.toString() || '');

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
    enabled: isOpen,
  });

  useEffect(() => {
    // Skip the first render since initial state is already set from props
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Reset form state when modal opens with new goal data
    // Use a timeout to defer state updates outside of the effect execution
    const timeoutId = setTimeout(() => {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setPriority(goal.priority);
      setStatus(goal.status);
      setGoalType(goal.goalType);
      setVisibility(goal.visibility);
      setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
      setProjectId(goal.projectId?.toString() || '');
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [isOpen, goal.id]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Goal>) => apiService.updateGoal(goal.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update goal');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updateData: Partial<Goal> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      goalType,
      visibility,
      targetDate: targetDate || undefined,
      projectId: projectId ? parseInt(projectId) : undefined,
    };

    // Add completedAt if status changed to completed
    if (status === 'completed' && goal.status !== 'completed') {
      (updateData as any).completedAt = new Date().toISOString();
    }

    updateMutation.mutate(updateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Edit Goal
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

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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

          {/* Goal Type & Visibility */}
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
          </div>

          {/* Project */}
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

          {/* Progress */}
          {status === 'active' && (
            <div className="space-y-2">
              <Label>Progress: {goal.progress}%</Label>
              <p className="text-xs text-muted-foreground">
                Progress is automatically calculated based on linked tasks
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
