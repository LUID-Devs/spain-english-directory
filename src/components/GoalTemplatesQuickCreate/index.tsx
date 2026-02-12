import { useState, useRef, useEffect, useCallback } from 'react';
import { useCreateGoalFromTemplateMutation, useGetGoalTemplatesQuery, useGetProjectsQuery } from '@/hooks/useApi';
import { useCurrentUser } from '@/stores/userStore';
import { toast } from 'sonner';
import { format, addDays, addMonths, startOfQuarter, endOfQuarter } from 'date-fns';
import { 
  Target, 
  Loader2, 
  X, 
  Plus, 
  ChevronDown, 
  Sparkles, 
  Calendar,
  Briefcase,
  Zap,
  Flag,
  Clock,
  CheckCircle2,
  LayoutTemplate
} from 'lucide-react';
import { apiService, Goal, GoalTemplate } from '@/services/apiService';

interface GoalTemplatesQuickCreateProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: number;
}

// Template categories with icons
const categoryIcons: Record<string, React.ReactNode> = {
  general: <Target className="h-4 w-4" />,
  sprint: <Zap className="h-4 w-4" />,
  quarterly: <Calendar className="h-4 w-4" />,
  project: <Briefcase className="h-4 w-4" />,
  personal: <Flag className="h-4 w-4" />,
};

// Template category labels
const categoryLabels: Record<string, string> = {
  general: 'General',
  sprint: 'Sprint',
  quarterly: 'Quarterly',
  project: 'Project',
  personal: 'Personal',
};

// Default templates (will be created on first use)
const defaultTemplates: Partial<GoalTemplate>[] = [
  {
    name: 'Weekly Sprint Goals',
    description: 'Track your weekly sprint objectives and deliverables',
    category: 'sprint',
    defaultTitle: 'Sprint {week} Goals',
    defaultDescription: 'Weekly sprint objectives and key deliverables',
    defaultPriority: 'high',
    defaultDurationDays: 7,
    taskTemplates: [
      { title: 'Plan sprint backlog', priority: 'high', estimatedHours: 2 },
      { title: 'Daily standup participation', priority: 'medium', estimatedHours: 1 },
      { title: 'Sprint review preparation', priority: 'high', estimatedHours: 3 },
    ],
  },
  {
    name: 'Quarterly OKRs',
    description: 'Set and track quarterly objectives and key results',
    category: 'quarterly',
    defaultTitle: 'Q{quarter} OKRs',
    defaultDescription: 'Quarterly objectives and key results for {year}',
    defaultPriority: 'high',
    defaultDurationDays: 90,
    taskTemplates: [
      { title: 'Define Q{quarter} objectives', priority: 'urgent', estimatedHours: 4 },
      { title: 'Set measurable key results', priority: 'high', estimatedHours: 3 },
      { title: 'Monthly progress review', priority: 'medium', estimatedHours: 2 },
    ],
  },
  {
    name: 'Project Milestone',
    description: 'Track key milestones and deliverables for a project',
    category: 'project',
    defaultTitle: '{project} Milestone',
    defaultDescription: 'Key milestone objectives and deliverables',
    defaultPriority: 'high',
    defaultDurationDays: 30,
    taskTemplates: [
      { title: 'Define milestone scope', priority: 'high', estimatedHours: 2 },
      { title: 'Assign team responsibilities', priority: 'medium', estimatedHours: 1 },
      { title: 'Milestone review and sign-off', priority: 'high', estimatedHours: 3 },
    ],
  },
  {
    name: 'Personal Development',
    description: 'Set personal growth and learning objectives',
    category: 'personal',
    defaultTitle: 'Personal Development Goals',
    defaultDescription: 'Personal growth and learning objectives for this period',
    defaultPriority: 'medium',
    defaultDurationDays: 30,
    taskTemplates: [
      { title: 'Identify skill gaps', priority: 'medium', estimatedHours: 2 },
      { title: 'Create learning plan', priority: 'medium', estimatedHours: 3 },
      { title: 'Weekly progress check-in', priority: 'low', estimatedHours: 1 },
    ],
  },
];

export const GoalTemplatesQuickCreate = ({ isOpen, onClose, organizationId }: GoalTemplatesQuickCreateProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [createdGoal, setCreatedGoal] = useState<Goal | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentUser } = useCurrentUser();
  const { data: templates, isLoading: templatesLoading } = useGetGoalTemplatesQuery(
    organizationId ? { organizationId, category: undefined } : undefined,
    { skip: !isOpen || !organizationId }
  );
  const { data: projects } = useGetProjectsQuery({}, { skip: !isOpen });
  const [createGoalFromTemplate] = useCreateGoalFromTemplateMutation();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current && !showTemplateSelector) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, showTemplateSelector]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
      setCustomTitle('');
      setCustomDescription('');
      setSelectedProjectId('');
      setTargetDate('');
      setShowTemplateSelector(true);
      setCreatedGoal(null);
    }
  }, [isOpen]);

  // Auto-calculate target date based on template duration
  useEffect(() => {
    if (selectedTemplate?.defaultDurationDays && !targetDate) {
      const calculatedDate = addDays(new Date(), selectedTemplate.defaultDurationDays);
      setTargetDate(format(calculatedDate, 'yyyy-MM-dd'));
    }
  }, [selectedTemplate, targetDate]);

  // Process template placeholders
  const processTemplate = useCallback((template: GoalTemplate) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const week = Math.ceil(now.getDate() / 7);
    
    const projectName = projects?.find(p => p.id.toString() === selectedProjectId)?.name || 'Project';

    let title = template.defaultTitle || template.name;
    let description = template.defaultDescription || '';

    // Replace placeholders
    const placeholders: Record<string, string> = {
      '{year}': year.toString(),
      '{month}': month.toString().padStart(2, '0'),
      '{quarter}': quarter.toString(),
      '{week}': week.toString(),
      '{project}': projectName,
    };

    Object.entries(placeholders).forEach(([key, value]) => {
      title = title.replace(new RegExp(key, 'g'), value);
      description = description.replace(new RegExp(key, 'g'), value);
    });

    return { title, description };
  }, [projects, selectedProjectId]);

  const handleSelectTemplate = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    const { title, description } = processTemplate(template);
    setCustomTitle(title);
    setCustomDescription(description || '');
    setShowTemplateSelector(false);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !organizationId) return;

    setIsSubmitting(true);

    try {
      const goal = await createGoalFromTemplate({
        templateId: selectedTemplate.id,
        data: {
          title: customTitle,
          organizationId,
          projectId: selectedProjectId ? parseInt(selectedProjectId) : undefined,
          customDescription,
          customTargetDate: targetDate,
        },
      }).unwrap();

      setCreatedGoal(goal);
      toast.success('Goal created!', {
        description: `"${goal.title}" has been created from template`,
      });
    } catch (error: any) {
      toast.error('Failed to create goal', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (createdGoal) {
      onClose();
    } else {
      onClose();
    }
  };

  const handleCreateAnother = () => {
    setSelectedTemplate(null);
    setCustomTitle('');
    setCustomDescription('');
    setTargetDate('');
    setShowTemplateSelector(true);
    setCreatedGoal(null);
  };

  if (!isOpen) return null;

  // Success state
  if (createdGoal) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md mx-4 bg-background rounded-lg shadow-2xl border border-border animate-in zoom-in-95 duration-200">
          <div className="p-6 text-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Goal Created Successfully!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              "{createdGoal.title}" has been created from the {selectedTemplate?.name} template.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCreateAnother}
                className="px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Create Another
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl mx-4 bg-background rounded-lg shadow-2xl border border-border animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {showTemplateSelector ? 'Choose a Goal Template' : 'Create Goal from Template'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showTemplateSelector ? (
            /* Template Selection Grid */
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select a template to quickly create a goal with pre-defined structure
              </p>
              
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {templates?.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                    >
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {categoryIcons[template.category] || <LayoutTemplate className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground truncate">
                            {template.name}
                          </span>
                          {template.isSystem && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">
                            {categoryLabels[template.category] || template.category}
                          </span>
                          {template.defaultDurationDays && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {template.defaultDurationDays} days
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Goal Creation Form */
            <div className="p-4 space-y-4">
              {/* Selected Template Badge */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  {selectedTemplate && categoryIcons[selectedTemplate.category]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedTemplate?.name}</p>
                  <p className="text-xs text-muted-foreground">Template selected</p>
                </div>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Goal Title
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter goal title..."
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Enter goal description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
                />
              </div>

              {/* Project Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Project (Optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="">No specific project</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Target Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="flex-1 text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <button
                    onClick={() => setTargetDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'))}
                    className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    1 Week
                  </button>
                  <button
                    onClick={() => setTargetDate(format(addMonths(new Date(), 1), 'yyyy-MM-dd'))}
                    className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    1 Month
                  </button>
                  <button
                    onClick={() => {
                      const end = endOfQuarter(new Date());
                      setTargetDate(format(end, 'yyyy-MM-dd'));
                    }}
                    className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    Quarter
                  </button>
                </div>
              </div>

              {/* Template Features Preview */}
              {selectedTemplate?.taskTemplates && Array.isArray(selectedTemplate.taskTemplates) && selectedTemplate.taskTemplates.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    This template includes {selectedTemplate.taskTemplates.length} suggested tasks
                  </p>
                  <ul className="space-y-1">
                    {selectedTemplate.taskTemplates.slice(0, 3).map((task: any, i: number) => (
                      <li key={i} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {task.title}
                      </li>
                    ))}
                    {selectedTemplate.taskTemplates.length > 3 && (
                      <li className="text-xs text-blue-500 dark:text-blue-400">
                        +{selectedTemplate.taskTemplates.length - 3} more tasks
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showTemplateSelector && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 flex-shrink-0">
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to templates
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!customTitle.trim() || isSubmitting}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Goal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTemplatesQuickCreate;
