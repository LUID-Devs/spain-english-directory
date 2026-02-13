import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService, AutomationRule, AutomationTriggerType, AutomationActionType, TriggerConfig, ActionConfig } from '@/services/apiService';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Zap, ArrowRight, Bell, Webhook, CheckSquare, UserPlus, MessageSquare, Share2 } from 'lucide-react';
import { useGetProjectsQuery, useGetAgentsQuery } from '@/hooks/useApi';

interface AutomationRuleFormProps {
  rule: AutomationRule | null;
  organizationId: number | undefined;
  onSuccess: (rule: AutomationRule, isEdit: boolean) => void;
  onCancel: () => void;
}

const AutomationRuleForm: React.FC<AutomationRuleFormProps> = ({
  rule,
  organizationId,
  onSuccess,
  onCancel,
}) => {
  const isEdit = !!rule;
  const { data: projects } = useGetProjectsQuery({}, { skip: !organizationId });
  const { data: agents } = useGetAgentsQuery(undefined, { skip: !organizationId });

  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [triggerType, setTriggerType] = useState(rule?.triggerType || '');
  const [actionType, setActionType] = useState(rule?.actionType || '');
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig>(rule?.triggerConfig || {});
  const [actionConfig, setActionConfig] = useState<ActionConfig>(rule?.actionConfig || {});
  
  const [triggerTypes, setTriggerTypes] = useState<AutomationTriggerType[]>([]);
  const [actionTypes, setActionTypes] = useState<AutomationActionType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setIsLoadingTypes(true);
      const [triggersResponse, actionsResponse] = await Promise.all([
        apiService.getAutomationTriggerTypes(),
        apiService.getAutomationActionTypes(),
      ]);
      
      if (triggersResponse.success) {
        setTriggerTypes(triggersResponse.data);
      }
      if (actionsResponse.success) {
        setActionTypes(actionsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load automation types:', error);
      toast.error('Failed to load automation options');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      toast.error('Organization not found');
      return;
    }

    if (!name || !triggerType || !actionType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const ruleData = {
        name,
        description,
        triggerType,
        triggerConfig,
        actionType,
        actionConfig,
        organizationId,
      };

      if (isEdit && rule) {
        const response = await apiService.updateAutomationRule(rule.id, ruleData);
        if (response.success) {
          toast.success('Rule updated successfully');
          onSuccess(response.data, true);
        }
      } else {
        const response = await apiService.createAutomationRule(ruleData);
        if (response.success) {
          toast.success('Rule created successfully');
          onSuccess(response.data, false);
        }
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
      toast.error('Failed to save automation rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'task.created': return <Zap className="h-4 w-4" />;
      case 'task.status.changed': return <CheckSquare className="h-4 w-4" />;
      case 'task.assigned': return <UserPlus className="h-4 w-4" />;
      case 'task.comment.added': return <MessageSquare className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'notification.send': return <Bell className="h-4 w-4" />;
      case 'webhook.call': return <Webhook className="h-4 w-4" />;
      case 'task.status.update': return <CheckSquare className="h-4 w-4" />;
      case 'task.assign': return <UserPlus className="h-4 w-4" />;
      case 'task.comment.add': return <MessageSquare className="h-4 w-4" />;
      case 'integration.send': return <Share2 className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  // Trigger configuration fields based on trigger type
  const renderTriggerConfig = () => {
    if (!triggerType) return null;

    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Trigger Conditions</CardTitle>
          <CardDescription className="text-xs">
            Optional filters to narrow when this rule fires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Project (optional)</Label>
            <Select
              value={triggerConfig.projectId?.toString() || ''}
              onValueChange={(value) => setTriggerConfig({ ...triggerConfig, projectId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any project</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {triggerType === 'task.status.changed' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">From Status</Label>
                <Input
                  placeholder="Any status"
                  value={triggerConfig.statusFrom || ''}
                  onChange={(e) => setTriggerConfig({ ...triggerConfig, statusFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">To Status</Label>
                <Input
                  placeholder="Any status"
                  value={triggerConfig.statusTo || ''}
                  onChange={(e) => setTriggerConfig({ ...triggerConfig, statusTo: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Priority (optional)</Label>
            <Select
              value={triggerConfig.priority || ''}
              onValueChange={(value) => setTriggerConfig({ ...triggerConfig, priority: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any priority</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Backlog">Backlog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {triggerType === 'task.due_date.approaching' && (
            <div className="space-y-2">
              <Label className="text-xs">Hours Before Due Date</Label>
              <Input
                type="number"
                placeholder="24"
                value={triggerConfig.dueDateHours || ''}
                onChange={(e) => setTriggerConfig({ ...triggerConfig, dueDateHours: parseInt(e.target.value) || undefined })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Action configuration fields based on action type
  const renderActionConfig = () => {
    if (!actionType) return null;

    const renderActionFields = () => {
      switch (actionType) {
        case 'notification.send':
          return (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Message</Label>
                <Textarea
                  placeholder="Enter notification message..."
                  value={actionConfig.message || ''}
                  onChange={(e) => setActionConfig({ ...actionConfig, message: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Notify Assigned Agents</Label>
                <Select
                  value={actionConfig.notifyAssigneeAgent ? 'true' : 'false'}
                  onValueChange={(value) => setActionConfig({ ...actionConfig, notifyAssigneeAgent: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Specific Agents (optional)</Label>
                <Select
                  value={actionConfig.recipientAgentIds?.[0]?.toString() || ''}
                  onValueChange={(value) => setActionConfig({ 
                    ...actionConfig, 
                    recipientAgentIds: value ? [parseInt(value)] : undefined 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agents..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.displayName || agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          );

        case 'webhook.call':
          return (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Webhook URL *</Label>
                <Input
                  placeholder="https://hooks.example.com/webhook"
                  value={actionConfig.webhookUrl || ''}
                  onChange={(e) => setActionConfig({ ...actionConfig, webhookUrl: e.target.value })}
                />
              </div>
            </>
          );

        case 'task.status.update':
          return (
            <>
              <div className="space-y-2">
                <Label className="text-xs">New Status *</Label>
                <Input
                  placeholder="e.g., In Progress, Done"
                  value={actionConfig.newStatus || ''}
                  onChange={(e) => setActionConfig({ ...actionConfig, newStatus: e.target.value })}
                />
              </div>
            </>
          );

        case 'task.assign':
          return (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Assign to Agent *</Label>
                <Select
                  value={actionConfig.assignToAgentId?.toString() || ''}
                  onValueChange={(value) => setActionConfig({ ...actionConfig, assignToAgentId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.displayName || agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          );

        case 'task.comment.add':
          return (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Comment Text *</Label>
                <Textarea
                  placeholder="Enter comment text..."
                  value={actionConfig.commentText || ''}
                  onChange={(e) => setActionConfig({ ...actionConfig, commentText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Post as Agent</Label>
                <Select
                  value={actionConfig.commentAsAgentId?.toString() || ''}
                  onValueChange={(value) => setActionConfig({ ...actionConfig, commentAsAgentId: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">System</SelectItem>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.displayName || agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          );

        case 'integration.send':
          return (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Integration Config ID *</Label>
                <Input
                  type="number"
                  placeholder="Enter integration config ID"
                  value={actionConfig.integrationConfigId || ''}
                  onChange={(e) => setActionConfig({ ...actionConfig, integrationConfigId: parseInt(e.target.value) || undefined })}
                />
              </div>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Action Settings</CardTitle>
          <CardDescription className="text-xs">
            Configure what happens when this rule triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderActionFields()}
        </CardContent>
      </Card>
    );
  };

  if (isLoadingTypes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Rule Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Auto-assign urgent bugs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe what this automation does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Trigger Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">When this happens...</h4>
            <p className="text-sm text-muted-foreground">Choose what triggers this automation</p>
          </div>
        </div>

        <Select value={triggerType} onValueChange={setTriggerType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a trigger..." />
          </SelectTrigger>
          <SelectContent>
            {triggerTypes.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                <div className="flex items-center gap-2">
                  {getTriggerIcon(type.type)}
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {renderTriggerConfig()}
      </div>

      <div className="flex justify-center">
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Action Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Then do this...</h4>
            <p className="text-sm text-muted-foreground">Choose the action to perform</p>
          </div>
        </div>

        <Select value={actionType} onValueChange={setActionType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select an action..." />
          </SelectTrigger>
          <SelectContent>
            {actionTypes.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                <div className="flex items-center gap-2">
                  {getActionIcon(type.type)}
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {renderActionConfig()}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
};

export default AutomationRuleForm;