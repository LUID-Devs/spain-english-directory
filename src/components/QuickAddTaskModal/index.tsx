import { useState, useRef, useEffect, useCallback } from 'react';
import { useCreateTaskMutation, useGetProjectsQuery, useGetUsersQuery, useGetAgentsQuery } from '@/hooks/useApi';
import { useCurrentUser } from '@/stores/userStore';
import { apiService } from '@/services/apiService';
import { Priority, Status } from '@/services/apiService';
import { toast } from 'sonner';
import { formatISO, parse, isValid, addDays, startOfTomorrow } from 'date-fns';
import { Sparkles, Loader2, X, Send, ChevronDown, Bot, Hash, Calendar, User } from 'lucide-react';
import { marked } from 'marked';

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Natural language parsing result
interface ParsedTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  assignee?: string;
  assigneeType?: 'user' | 'agent';
  tags?: string[];
  project?: string;
}

// Simple natural language parser
const parseNaturalLanguage = (input: string): ParsedTaskInput => {
  const result: ParsedTaskInput = { title: input.trim() };
  let remainingText = input;

  // Extract @mentions (assignees)
  const mentionMatch = input.match(/@(\w+)/);
  if (mentionMatch) {
    result.assignee = mentionMatch[1];
    remainingText = remainingText.replace(mentionMatch[0], '').trim();
  }

  // Extract #tags or #priority
  const tagMatches = input.match(/#(\w+)/g);
  if (tagMatches) {
    const tags: string[] = [];
    tagMatches.forEach(tag => {
      const tagValue = tag.replace('#', '').toLowerCase();
      // Check if it's a priority tag
      if (['urgent', 'high', 'medium', 'low', 'backlog'].includes(tagValue)) {
        result.priority = tagValue.charAt(0).toUpperCase() + tagValue.slice(1) as Priority;
      } else {
        tags.push(tagValue);
      }
    });
    if (tags.length > 0) {
      result.tags = tags;
    }
    remainingText = remainingText.replace(/#\w+/g, '').trim();
  }

  // Extract dates - common patterns
  const datePatterns = [
    { regex: /\btoday\b/i, getDate: () => new Date() },
    { regex: /\btomorrow\b/i, getDate: () => startOfTomorrow() },
    { regex: /\bin\s+(\d+)\s+days?\b/i, getDate: (match: RegExpMatchArray) => addDays(new Date(), parseInt(match[1], 10)) },
    { regex: /\bnext\s+week\b/i, getDate: () => addDays(new Date(), 7) },
    { regex: /\bby\s+(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/, getDate: (match: RegExpMatchArray) => {
      const year = match[3] ? (match[3].length === 2 ? '20' + match[3] : match[3]) : new Date().getFullYear();
      const dateStr = `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
      const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : null;
    }},
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern.regex);
    if (match) {
      const date = pattern.getDate(match);
      if (date && isValid(date)) {
        result.dueDate = formatISO(date, { representation: 'date' });
        remainingText = remainingText.replace(match[0], '').trim();
        break;
      }
    }
  }

  // Clean up the title - remove extra spaces and punctuation
  result.title = remainingText
    .replace(/\s+/g, ' ')
    .replace(/[,:;]+$/, '')
    .trim();

  // If title is empty after parsing, use original input
  if (!result.title) {
    result.title = input.trim();
  }

  return result;
};

export const QuickAddTaskModal = ({ isOpen, onClose }: QuickAddTaskModalProps) => {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedTaskInput | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentUser } = useCurrentUser();
  const [createTask] = useCreateTaskMutation();
  const { data: projects } = useGetProjectsQuery({}, { skip: !isOpen });
  const { data: users } = useGetUsersQuery(undefined, { skip: !isOpen });
  const { data: agents } = useGetAgentsQuery({ skip: !isOpen });

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Parse input for preview
  useEffect(() => {
    if (input.trim()) {
      const parsed = parseNaturalLanguage(input);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  }, [input]);

  // Find matching user or agent from @mention
  const findAssignee = useCallback((mention: string): { id: string; type: 'user' | 'agent' } | null => {
    if (!mention) return null;

    const lowerMention = mention.toLowerCase();

    // Check users first
    const matchedUser = users?.find(u =>
      u.username.toLowerCase() === lowerMention ||
      u.username.toLowerCase().includes(lowerMention)
    );
    if (matchedUser) {
      return { id: matchedUser.userId.toString(), type: 'user' };
    }

    // Check agents
    const matchedAgent = agents?.find(a =>
      a.name.toLowerCase() === lowerMention ||
      (a.displayName && a.displayName.toLowerCase() === lowerMention) ||
      a.name.toLowerCase().includes(lowerMention)
    );
    if (matchedAgent) {
      return { id: matchedAgent.id.toString(), type: 'agent' };
    }

    return null;
  }, [users, agents]);

  // Find project from mention or use default
  const findProject = useCallback((projectName?: string): string => {
    if (!projects || projects.length === 0) return '';

    // If a project name is mentioned, try to match it
    if (projectName) {
      const matched = projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      );
      if (matched) return matched.id.toString();
    }

    // Return selected project or first project as default
    return selectedProjectId || projects[0]?.id.toString() || '';
  }, [projects, selectedProjectId]);

  const handleSubmit = async (useAi = false) => {
    if (!input.trim() || !currentUser) return;

    setIsSubmitting(true);

    try {
      let taskData: any;

      if (useAi) {
        // Use AI parsing
        setIsAiParsing(true);
        const teamMemberNames = users?.map(u => u.username) || [];
        const response = await apiService.parseTaskWithAI(input.trim(), teamMemberNames);
        setIsAiParsing(false);

        if (response.success && response.data) {
          const parsed = response.data;
          const projectId = findProject();

          taskData = {
            title: parsed.title || input,
            description: parsed.description ? marked.parse(parsed.description) as string : '',
            status: Status.ToDo,
            priority: parsed.priority ? Priority[parsed.priority as keyof typeof Priority] : Priority.Medium,
            tags: parsed.tags || '',
            dueDate: parsed.dueDate ? formatISO(new Date(parsed.dueDate)) : formatISO(addDays(new Date(), 7)),
            authorUserId: currentUser.userId,
            assignedUserId: parsed.assignee ? findAssignee(parsed.assignee)?.id : undefined,
            projectId: parseInt(projectId),
          };
        } else {
          throw new Error(response.error?.message || 'AI parsing failed');
        }
      } else {
        // Use local parsing
        const parsed = parseNaturalLanguage(input);
        const assignee = parsed.assignee ? findAssignee(parsed.assignee) : null;
        const projectId = findProject(parsed.project);

        taskData = {
          title: parsed.title,
          description: '',
          status: Status.ToDo,
          priority: parsed.priority || Priority.Medium,
          tags: parsed.tags?.join(', ') || '',
          dueDate: parsed.dueDate ? formatISO(new Date(parsed.dueDate)) : formatISO(addDays(new Date(), 7)),
          authorUserId: currentUser.userId,
          assignedUserId: assignee?.type === 'user' ? parseInt(assignee.id) : undefined,
          projectId: parseInt(projectId),
        };
      }

      const result = await createTask(taskData).unwrap();

      // Handle agent assignment if needed
      const parsed = parseNaturalLanguage(input);
      if (parsed.assignee) {
        const assignee = findAssignee(parsed.assignee);
        if (assignee?.type === 'agent' && result?.id) {
          await apiService.assignAgentToTask(result.id, parseInt(assignee.id), Status.ToDo);
        }
      }

      toast.success('Task created!', {
        description: `"${taskData.title}" added to your tasks`,
      });

      setInput('');
      onClose();
    } catch (error: any) {
      toast.error('Failed to create task', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
      setIsAiParsing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(false);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl mx-4 bg-background rounded-lg shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Quick Add Task</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Cmd+Shift+T
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Input Area */}
        <div className="p-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Try: "Fix login bug tomorrow @john #urgent"'
              className="w-full px-4 py-3 text-lg bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              disabled={isSubmitting || isAiParsing}
            />
            {(isSubmitting || isAiParsing) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Parsed Preview */}
          {parsedPreview && (
            <div className="mt-3 p-3 rounded-md bg-muted/50 border border-border/50">
              <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Parsed
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedPreview.title && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background text-sm">
                    {parsedPreview.title}
                  </span>
                )}
                {parsedPreview.priority && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    parsedPreview.priority === Priority.Urgent ? 'bg-red-100 text-red-700' :
                    parsedPreview.priority === Priority.High ? 'bg-orange-100 text-orange-700' :
                    parsedPreview.priority === Priority.Medium ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {parsedPreview.priority}
                  </span>
                )}
                {parsedPreview.dueDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-calendar-100 text-calendar-700 text-xs">
                    <Calendar className="h-3 w-3" />
                    {new Date(parsedPreview.dueDate).toLocaleDateString()}
                  </span>
                )}
                {parsedPreview.assignee && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs">
                    <User className="h-3 w-3" />
                    @{parsedPreview.assignee}
                  </span>
                )}
                {parsedPreview.tags?.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                    <Hash className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Selector */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-sm bg-muted border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 rounded-b-lg">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Enter</kbd>
              to create
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Esc</kbd>
              to close
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiSuggestions(!showAiSuggestions)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              AI
              <ChevronDown className={`h-3 w-3 transition-transform ${showAiSuggestions ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={!input.trim() || isSubmitting}
              className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        {showAiSuggestions && (
          <div className="px-4 py-3 border-t border-border bg-primary/5">
            <p className="text-xs text-muted-foreground mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Review PR by Friday @cletus #urgent',
                'Fix bug in login tomorrow',
                'Team meeting next week @karen #meeting',
                'Deploy to production today #high',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setInput(example)}
                  className="text-xs px-2 py-1 rounded bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleSubmit(true)}
              disabled={!input.trim() || isAiParsing}
              className="mt-3 flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isAiParsing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Parse with AI (1 credit)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickAddTaskModal;
