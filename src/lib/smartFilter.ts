/**
 * Smart Filter Utility
 * Parses natural language and operator-based queries into structured filters
 * for AI-powered task filtering
 */

import { parseSearchQuery, applySearchQuery, ParsedSearchQuery } from './searchParser';

export interface SmartFilterCriteria {
  assignee?: string[];
  status?: string[];
  priority?: string[];
  project?: string[];
  label?: string[];
  due?: string[];
  text?: string;
}

export interface SmartFilterResult {
  /** The normalized query string with operators */
  normalizedQuery: string;
  /** Structured filter criteria */
  criteria: SmartFilterCriteria;
  /** Number of active filters */
  filterCount: number;
  /** Warnings for unparseable parts */
  warnings: string[];
  /** Whether the query was interpreted as natural language */
  wasInterpreted: boolean;
}

// Priority keywords mapping
const PRIORITY_KEYWORDS: Record<string, string> = {
  'urgent': 'Urgent',
  'high priority': 'High',
  'high': 'High',
  'medium priority': 'Medium',
  'medium': 'Medium',
  'low priority': 'Low',
  'low': 'Low',
  'backlog': 'Backlog',
};

// Status keywords mapping
const STATUS_KEYWORDS: Record<string, string[]> = {
  'todo': ['To Do'],
  'to do': ['To Do'],
  'open': ['To Do', 'Open'],
  'in progress': ['Work In Progress', 'In Progress'],
  'working': ['Work In Progress'],
  'active': ['Work In Progress'],
  'review': ['Under Review'],
  'under review': ['Under Review'],
  'done': ['Completed', 'Done'],
  'completed': ['Completed'],
  'closed': ['Completed', 'Closed'],
  'archived': ['Archived'],
};

// Due date keywords
const DUE_KEYWORDS: Record<string, string> = {
  'today': 'today',
  'tomorrow': 'tomorrow',
  'this week': 'this-week',
  'next week': 'next-week',
  'last week': 'last-week',
  'this month': 'this-month',
  'last month': 'last-month',
  'overdue': 'overdue',
  'past due': 'overdue',
};

/**
 * Parse a smart filter query into structured criteria
 * Handles both explicit operators (assignee:me) and natural language
 */
export function parseSmartFilter(query: string): SmartFilterResult {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return {
      normalizedQuery: '',
      criteria: {},
      filterCount: 0,
      warnings: [],
      wasInterpreted: false,
    };
  }

  // Check if query already has operators (only match known operator prefixes)
  const operatorPattern = /\b(assignee|status|is|priority|project|label|due|tag):/i;
  const hasOperators = operatorPattern.test(trimmedQuery);
  
  if (hasOperators) {
    // Use existing parser for operator-based queries
    const parsed = parseSearchQuery(trimmedQuery);
    const criteria = extractCriteriaFromParsed(parsed);
    
    return {
      normalizedQuery: trimmedQuery,
      criteria,
      filterCount: countFilters(criteria),
      warnings: parsed.invalidOperators.map(inv => `Unknown: ${inv.operator}:${inv.value}`),
      wasInterpreted: false,
    };
  }

  // Interpret natural language
  return interpretNaturalLanguage(trimmedQuery);
}

/**
 * Extract criteria from parsed search query
 */
function extractCriteriaFromParsed(parsed: ParsedSearchQuery): SmartFilterCriteria {
  const criteria: SmartFilterCriteria = {};
  
  if (parsed.textQuery?.trim()) {
    criteria.text = parsed.textQuery.trim();
  }
  
  if (parsed.assignee?.values.length) {
    criteria.assignee = parsed.assignee.values;
  }
  
  if (parsed.status?.values.length) {
    criteria.status = parsed.status.values;
  }
  
  if (parsed.priority?.values.length) {
    criteria.priority = parsed.priority.values;
  }
  
  if (parsed.project?.values.length) {
    criteria.project = parsed.project.values;
  }
  
  if (parsed.label?.values.length) {
    criteria.label = parsed.label.values;
  }
  
  if (parsed.due?.values.length) {
    criteria.due = parsed.due.values.map(d => 
      d.type === 'relative' ? d.value : d.date.toISOString()
    );
  }
  
  return criteria;
}

/**
 * Interpret natural language query
 */
function interpretNaturalLanguage(query: string): SmartFilterResult {
  const criteria: SmartFilterCriteria = {};
  const warnings: string[] = [];
  const normalizedParts: string[] = [];
  
  let remainingQuery = query.toLowerCase();

  // Check for assignee filters (unassigned and my tasks can both match)
  const assignees: string[] = [];
  const assigneeParts: string[] = [];
  
  // Check for unassigned
  const unassignedMatch = remainingQuery.match(/\b(unassigned|no assignee|not assigned)\b/);
  if (unassignedMatch) {
    assignees.push('unassigned');
    assigneeParts.push('assignee:unassigned');
    remainingQuery = remainingQuery.replace(unassignedMatch[0], '');
  }

  // Check for "my tasks" / "assigned to me"
  const myTasksMatch = remainingQuery.match(/\b(my tasks?|assigned to me|mine)\b/);
  if (myTasksMatch) {
    assignees.push('me');
    assigneeParts.push('assignee:me');
    remainingQuery = remainingQuery.replace(myTasksMatch[0], '');
  }
  
  // Apply collected assignees if any
  if (assignees.length > 0) {
    criteria.assignee = assignees;
    normalizedParts.push(...assigneeParts);
  }

  // Check for priority keywords
  for (const [keyword, priority] of Object.entries(PRIORITY_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(remainingQuery)) {
      if (!criteria.priority) criteria.priority = [];
      if (!criteria.priority.includes(priority)) {
        criteria.priority.push(priority);
      }
      normalizedParts.push(`priority:${priority.toLowerCase()}`);
      remainingQuery = remainingQuery.replace(regex, '');
    }
  }

  // Check for status keywords
  for (const [keyword, statuses] of Object.entries(STATUS_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(remainingQuery)) {
      if (!criteria.status) criteria.status = [];
      statuses.forEach(s => {
        if (!criteria.status!.includes(s)) {
          criteria.status.push(s);
        }
      });
      normalizedParts.push(`is:${keyword.replace(/\s+/g, '-')}`);
      remainingQuery = remainingQuery.replace(regex, '');
    }
  }

  // Check for due date keywords
  for (const [keyword, dueValue] of Object.entries(DUE_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(remainingQuery)) {
      if (!criteria.due) criteria.due = [];
      if (!criteria.due.includes(dueValue)) {
        criteria.due.push(dueValue);
      }
      normalizedParts.push(`due:${dueValue}`);
      remainingQuery = remainingQuery.replace(regex, '');
    }
  }

  // Check for project mentions ("in <project>")
  const projectMatch = remainingQuery.match(/\bin\s+(?:the\s+)?([\w-]+(?:\s+[\w-]+)*)\s+project?\b/i);
  if (projectMatch) {
    const projectName = projectMatch[1].trim();
    if (!criteria.project) criteria.project = [];
    criteria.project.push(projectName);
    normalizedParts.push(`project:"${projectName}"`);
    remainingQuery = remainingQuery.replace(projectMatch[0], '');
  }

  // Check for label mentions ("tagged <label>" or "with <label> tag")
  const labelMatch = remainingQuery.match(/\b(?:tagged|with)\s+(?:the\s+)?([\w-]+)(?:\s+tag)?\b/i);
  if (labelMatch) {
    const label = labelMatch[1].trim();
    if (!criteria.label) criteria.label = [];
    criteria.label.push(label);
    normalizedParts.push(`label:${label}`);
    remainingQuery = remainingQuery.replace(labelMatch[0], '');
  }

  // Remaining text becomes text search
  const remainingText = remainingQuery.trim().replace(/\s+/g, ' ');
  if (remainingText && remainingText.length > 0) {
    criteria.text = remainingText;
    normalizedParts.push(remainingText);
  }

  // Check for unknown terms that might be usernames
  const words = remainingText.split(/\s+/).filter(w => w.length > 2);
  if (words.length > 0 && !criteria.assignee) {
    // If there's a single word left and no assignee set, it might be a username
    if (words.length === 1 && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(words[0])) {
      warnings.push(`Did you mean "assignee:${words[0]}"?`);
    }
  }

  return {
    normalizedQuery: normalizedParts.join(' '),
    criteria,
    filterCount: countFilters(criteria),
    warnings,
    wasInterpreted: true,
  };
}

/**
 * Count active filters in criteria
 */
function countFilters(criteria: SmartFilterCriteria): number {
  let count = 0;
  if (criteria.assignee?.length) count++;
  if (criteria.status?.length) count++;
  if (criteria.priority?.length) count++;
  if (criteria.project?.length) count++;
  if (criteria.label?.length) count++;
  if (criteria.due?.length) count++;
  if (criteria.text) count++;
  return count;
}

/**
 * Apply smart filter to a list of tasks
 */
export function applySmartFilter<T extends Record<string, any>>(
  tasks: T[],
  criteria: SmartFilterCriteria,
  currentUserId?: number,
  users?: Array<{ userId: number; username: string }>
): T[] {
  if (!criteria || Object.keys(criteria).length === 0) {
    return tasks;
  }

  return tasks.filter(task => {
    // Text search
    if (criteria.text) {
      const textLower = criteria.text.toLowerCase();
      const textFields = [
        task.title,
        task.description,
        task.tags,
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!textFields.includes(textLower)) {
        return false;
      }
    }

    // Assignee filter
    if (criteria.assignee?.length) {
      const assigneeId = task.assignedUserId || task.assignee?.userId;
      const matches = criteria.assignee.some(a => {
        if (a === 'me') return assigneeId === currentUserId;
        if (a === 'unassigned') return !assigneeId;
        return assigneeId?.toString() === a ||
               task.assignee?.username?.toLowerCase() === a.toLowerCase();
      });
      if (!matches) return false;
    }

    // Status filter
    if (criteria.status?.length) {
      const taskStatus = task.status;
      const matches = criteria.status.some(s =>
        taskStatus?.toLowerCase() === s.toLowerCase()
      );
      if (!matches) return false;
    }

    // Priority filter
    if (criteria.priority?.length) {
      const taskPriority = task.priority;
      const matches = criteria.priority.some(p =>
        taskPriority?.toLowerCase() === p.toLowerCase()
      );
      if (!matches) return false;
    }

    // Project filter
    if (criteria.project?.length) {
      const projectId = task.projectId;
      const projectName = task.project?.name;
      const matches = criteria.project.some(p => {
        return projectId?.toString() === p ||
               projectName?.toLowerCase().includes(p.toLowerCase());
      });
      if (!matches) return false;
    }

    // Label filter
    if (criteria.label?.length) {
      const labels = task.tags ? task.tags.split(',').map((t: string) => t.trim()) : [];
      const matches = criteria.label.some(l =>
        labels.some((tag: string) => tag.toLowerCase() === l.toLowerCase())
      );
      if (!matches) return false;
    }

    // Due date filter
    if (criteria.due?.length) {
      const dueDate = task.dueDate;
      const matches = criteria.due.some(d => {
        return matchesDueFilter(dueDate, d, task.status);
      });
      if (!matches) return false;
    }

    return true;
  });
}

/**
 * Check if a due date matches a filter
 */
function matchesDueFilter(dueDate: string | undefined, filter: string, status?: string): boolean {
  if (!dueDate) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(dueDate);
  if (Number.isNaN(itemDate.getTime())) {
    return false;
  }
  const itemTime = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

  switch (filter) {
    case 'today':
      return itemTime.getTime() === today.getTime();
    case 'tomorrow': {
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      return itemTime.getTime() === tomorrow.getTime();
    }
    case 'this-week': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return itemTime >= weekStart && itemTime < weekEnd;
    }
    case 'next-week': {
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
      const nextWeekEnd = new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return itemTime >= nextWeekStart && itemTime < nextWeekEnd;
    }
    case 'last-week': {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return itemTime >= lastWeekStart && itemTime < lastWeekEnd;
    }
    case 'this-month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return itemTime >= monthStart && itemTime < nextMonthStart;
    }
    case 'last-month': {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return itemTime >= lastMonthStart && itemTime < monthStart;
    }
    case 'overdue':
      return itemTime < today && status !== 'Completed' && status !== 'Done';
    default: {
      const filterDate = new Date(filter);
      if (!Number.isNaN(filterDate.getTime())) {
        const filterDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
        return itemTime.getTime() === filterDay.getTime();
      }
      return false;
    }
  }
}

/**
 * Generate filter chips from criteria for display
 */
export function generateFilterChips(criteria: SmartFilterCriteria): Array<{ type: string; value: string; label: string }> {
  const chips: Array<{ type: string; value: string; label: string }> = [];
  
  if (criteria.assignee) {
    criteria.assignee.forEach(a => {
      chips.push({ type: 'assignee', value: a, label: a === 'me' ? 'Assigned to me' : a === 'unassigned' ? 'Unassigned' : `Assignee: ${a}` });
    });
  }
  
  if (criteria.status) {
    criteria.status.forEach(s => chips.push({ type: 'status', value: s, label: `Status: ${s}` }));
  }
  
  if (criteria.priority) {
    criteria.priority.forEach(p => chips.push({ type: 'priority', value: p, label: `Priority: ${p}` }));
  }
  
  if (criteria.project) {
    criteria.project.forEach(p => chips.push({ type: 'project', value: p, label: `Project: ${p}` }));
  }
  
  if (criteria.label) {
    criteria.label.forEach(l => chips.push({ type: 'label', value: l, label: `Tag: ${l}` }));
  }
  
  if (criteria.due) {
    criteria.due.forEach(d => chips.push({ type: 'due', value: d, label: `Due: ${d}` }));
  }
  
  if (criteria.text) {
    chips.push({ type: 'text', value: criteria.text, label: criteria.text });
  }
  
  return chips;
}

/**
 * Get suggestions for incomplete queries
 */
export function getSmartFilterSuggestions(partialQuery: string): Array<{ text: string; description: string; icon?: string }> {
  const suggestions: Array<{ text: string; description: string; icon?: string }> = [];
  const lowerQuery = partialQuery.toLowerCase().trim();
  
  // Priority suggestions
  if (!lowerQuery.includes('priority') && !lowerQuery.includes('urgent') && !lowerQuery.includes('high')) {
    suggestions.push({ text: 'high priority', description: 'Filter by high priority', icon: 'flag' });
    suggestions.push({ text: 'urgent', description: 'Filter by urgent priority', icon: 'alert' });
  }
  
  // Status suggestions
  if (!lowerQuery.includes('status') && !lowerQuery.includes('in progress') && !lowerQuery.includes('todo')) {
    suggestions.push({ text: 'in progress', description: 'Show tasks in progress', icon: 'clock' });
    suggestions.push({ text: 'todo', description: 'Show open tasks', icon: 'circle' });
  }
  
  // Assignee suggestions
  if (!lowerQuery.includes('assignee') && !lowerQuery.includes('my') && !lowerQuery.includes('unassigned')) {
    suggestions.push({ text: 'my tasks', description: 'Show only your tasks', icon: 'user' });
    suggestions.push({ text: 'unassigned', description: 'Show unassigned tasks', icon: 'user-x' });
  }
  
  // Due date suggestions
  if (!lowerQuery.includes('due') && !lowerQuery.includes('today') && !lowerQuery.includes('overdue')) {
    suggestions.push({ text: 'due today', description: 'Tasks due today', icon: 'calendar' });
    suggestions.push({ text: 'overdue', description: 'Past due tasks', icon: 'alert-circle' });
  }
  
  return suggestions.slice(0, 5);
}
