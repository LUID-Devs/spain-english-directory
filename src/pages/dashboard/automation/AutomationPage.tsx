import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentUser } from '@/stores/userStore';
import { useAuth } from '@/app/authProvider';
import { apiService, AutomationRule } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Play,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Power,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Plus,
  Activity,
} from 'lucide-react';
import AutomationRuleForm from './components/AutomationRuleForm';
import AutomationExecutions from './components/AutomationExecutions';

const AutomationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { activeOrganization } = useAuth();
  
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);
  const [testingRuleId, setTestingRuleId] = useState<number | null>(null);

  const organizationId = activeOrganization?.id || currentUser?.organizationId;

  useEffect(() => {
    if (organizationId) {
      loadRules();
    }
  }, [organizationId]);

  const loadRules = async () => {
    if (!organizationId) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getAutomationRules(organizationId);
      if (response.success) {
        setRules(response.data);
      }
    } catch (error) {
      console.error('Failed to load automation rules:', error);
      toast.error('Failed to load automation rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      const response = await apiService.updateAutomationRule(rule.id, {
        isActive: !rule.isActive,
      });
      
      if (response.success) {
        setRules(rules.map(r => r.id === rule.id ? response.data : r));
        toast.success(`Rule ${!rule.isActive ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      toast.error('Failed to update rule status');
    }
  };

  const handleTestRule = async (rule: AutomationRule) => {
    try {
      setTestingRuleId(rule.id);
      const response = await apiService.testAutomationRule(rule.id);
      
      if (response.success) {
        toast.success('Rule test executed successfully');
      }
    } catch (error) {
      console.error('Failed to test rule:', error);
      toast.error('Failed to test rule');
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (rule: AutomationRule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    
    try {
      const response = await apiService.deleteAutomationRule(ruleToDelete.id);
      
      if (response.success) {
        setRules(rules.filter(r => r.id !== ruleToDelete.id));
        toast.success('Rule deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      toast.error('Failed to delete rule');
    } finally {
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleDuplicateRule = async (rule: AutomationRule) => {
    try {
      const newRule = {
        name: `${rule.name} (Copy)`,
        description: rule.description,
        triggerType: rule.triggerType,
        triggerConfig: rule.triggerConfig,
        actionType: rule.actionType,
        actionConfig: rule.actionConfig,
        organizationId: rule.organizationId,
      };
      
      const response = await apiService.createAutomationRule(newRule);
      
      if (response.success) {
        setRules([response.data, ...rules]);
        toast.success('Rule duplicated successfully');
      }
    } catch (error) {
      console.error('Failed to duplicate rule:', error);
      toast.error('Failed to duplicate rule');
    }
  };

  const handleFormSuccess = (rule: AutomationRule, isEdit: boolean) => {
    if (isEdit) {
      setRules(rules.map(r => r.id === rule.id ? rule : r));
    } else {
      setRules([rule, ...rules]);
    }
    setIsFormOpen(false);
    setEditingRule(null);
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'task.created':
        return <Plus className="h-4 w-4" />;
      case 'task.status.changed':
        return <Activity className="h-4 w-4" />;
      case 'task.assigned':
        return <Power className="h-4 w-4" />;
      case 'task.due_date.approaching':
      case 'task.overdue':
        return <Clock className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (rule: AutomationRule) => {
    if (rule.errorCount > 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {rule.errorCount} errors
        </Badge>
      );
    }
    if (rule.executionCount > 0) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {rule.executionCount} runs
        </Badge>
      );
    }
    return <Badge variant="outline">Never run</Badge>;
  };

  const formatTriggerLabel = (type: string) => {
    return type
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatActionLabel = (type: string) => {
    return type
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflow Automation</h1>
          <p className="text-muted-foreground mt-1">
            Automate repetitive tasks with rules that trigger actions
          </p>
        </div>
        <Button onClick={() => { setEditingRule(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : rules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No automation rules yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Create your first automation rule to streamline your workflow. 
                  Rules can automatically assign tasks, send notifications, update statuses, and more.
                </p>
                <Button onClick={() => { setEditingRule(null); setIsFormOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card key={rule.id} className={!rule.isActive ? 'opacity-75' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                          {getTriggerIcon(rule.triggerType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          {rule.description && (
                            <CardDescription className="mt-1">{rule.description}</CardDescription>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {formatTriggerLabel(rule.triggerType)}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="outline" className="text-xs">
                              {formatActionLabel(rule.actionType)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(rule)}
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggleRule(rule)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTestRule(rule)} disabled={testingRuleId === rule.id}>
                              <Play className="h-4 w-4 mr-2" />
                              {testingRuleId === rule.id ? 'Testing...' : 'Test Rule'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateRule(rule)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(rule)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions">
          <AutomationExecutions organizationId={organizationId} />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}</DialogTitle>
            <DialogDescription>
              Define when this rule should trigger and what action it should take.
            </DialogDescription>
          </DialogHeader>
          <AutomationRuleForm
            rule={editingRule}
            organizationId={organizationId}
            onSuccess={handleFormSuccess}
            onCancel={() => { setIsFormOpen(false); setEditingRule(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Automation Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{ruleToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationPage;