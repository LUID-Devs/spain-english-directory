import { AdvancedTaskFilter, FieldCondition, TaskFilterField, FilterOperator } from "../types/filter.types";

// Interface for the parsed natural language query result
export interface ParsedSearchFilter {
  query: string;
  filters: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    author?: string[];
    project?: string[];
    label?: string[];
    due?: string;
    created?: string;
    updated?: string;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  confidence: {
    overall: number;
    status: number;
    priority: number;
    assignee: number;
    date: number;
  };
}

// Context information to help with parsing
export interface ParseContext {
  availableProjects?: string[];
  availableLabels?: string[];
  teamMembers?: string[];
  currentUserId?: number;
}

// Status mappings for natural language recognition
const STATUS_MAPPINGS: Record<string, string[]> = {
  'todo': ['todo', 'to do', 'open', 'new', 'backlog', 'not started'],
  'in_progress': ['in progress', 'inprogress', 'working', 'doing', 'active', 'started', 'wip'],
  'review': ['review', 'under review', 'in review', 'pending review', 'needs review'],
  'completed': ['completed', 'done', 'finished', 'closed', 'resolved', 'complete'],
  'archived': ['archived', 'archive', 'old', 'closed'],
  'blocked': ['blocked', 'block', 'stuck', 'waiting', 'on hold'],
};

// Priority mappings
const PRIORITY_MAPPINGS: Record<string, string[]> = {
  'urgent': ['urgent', 'critical', 'asap', 'emergency', 'highest', 'p0'],
  'high': ['high', 'important', 'major', 'significant', 'p1'],
  'medium': ['medium', 'normal', 'moderate', 'standard', 'p2'],
  'low': ['low', 'minor', 'trivial', 'small', 'p3'],
  'backlog': ['backlog', 'lowest', 'someday', 'maybe', 'p4'],
};

// Date patterns
const DATE_PATTERNS = {
  today: /\b(today)\b/i,
  tomorrow: /\b(tomorrow)\b/i,
  thisWeek: /\b(this week)\b/i,
  nextWeek: /\b(next week)\b/i,
  thisMonth: /\b(this month)\b/i,
  nextMonth: /\b(next month)\b/i,
  overdue: /\b(overdue|past due|late)\b/i,
  dueSoon: /\b(due soon|upcoming|coming up)\b/i,
  yesterday: /\b(yesterday)\b/i,
  lastWeek: /\b(last week)\b/i,
  lastMonth: /\b(last month)\b/i,
};

// Assignee patterns
const ASSIGNEE_PATTERNS = [
  { pattern: /\b(my|mine|assigned to me|my tasks)\b/i, assignee: 'me' },
  { pattern: /\b(unassigned|no assignee|not assigned)\b/i, assignee: 'unassigned' },
  { pattern: /\b(assigned to\s+)(\w+)\b/i, assignee: 'dynamic' },
];

// Sort patterns
const SORT_PATTERNS = [
  { pattern: /\b(newest|latest|recent|most recent)\b/i, field: 'updatedAt', direction: 'desc' as const },
  { pattern: /\b(oldest|earliest)\b/i, field: 'updatedAt', direction: 'asc' as const },
  { pattern: /\b(highest priority|most important|urgent first)\b/i, field: 'priority', direction: 'asc' as const },
  { pattern: /\b(lowest priority|least important)\b/i, field: 'priority', direction: 'desc' as const },
  { pattern: /\b(due soon|due date|deadline)\b/i, field: 'dueDate', direction: 'asc' as const },
  { pattern: /\b(alphabetical|a to z)\b/i, field: 'title', direction: 'asc' as const },
];

/**
 * Normalize status value from natural language
 */
function normalizeStatus(input: string): string | null {
  const lower = input.toLowerCase().trim();
  
  for (const [status, aliases] of Object.entries(STATUS_MAPPINGS)) {
    if (aliases.some(alias => lower.includes(alias))) {
      // Return the canonical status name
      const statusMap: Record<string, string> = {
        'todo': 'To Do',
        'in_progress': 'Work In Progress',
        'review': 'Under Review',
        'completed': 'Completed',
        'archived': 'Archived',
        'blocked': 'Blocked',
      };
      return statusMap[status] || status;
    }
  }
  
  return null;
}

/**
 * Normalize priority value from natural language
 */
function normalizePriority(input: string): string | null {
  const lower = input.toLowerCase().trim();
  
  for (const [priority, aliases] of Object.entries(PRIORITY_MAPPINGS)) {
    if (aliases.some(alias => lower.includes(alias))) {
      const priorityMap: Record<string, string> = {
        'urgent': 'Urgent',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low',
        'backlog': 'Backlog',
      };
      return priorityMap[priority] || priority;
    }
  }
  
  return null;
}

/**
 * Parse date expression from natural language
 */
function parseDateExpression(input: string): string | null {
  for (const [key, pattern] of Object.entries(DATE_PATTERNS)) {
    if (pattern.test(input)) {
      return key;
    }
  }
  return null;
}

/**
 * Parse assignee from natural language
 */
function parseAssignee(input: string, context?: ParseContext): string | null {
  // Check for "me" patterns
  if (/\b(my|mine|assigned to me)\b/i.test(input)) {
    return 'me';
  }
  
  // Check for unassigned
  if (/\b(unassigned|no assignee|not assigned)\b/i.test(input)) {
    return 'unassigned';
  }
  
  // Check for specific user mentions
  const assigneeMatch = input.match(/\b(assigned to|assignee is?)\s+(\w+)\b/i);
  if (assigneeMatch) {
    const name = assigneeMatch[2].toLowerCase();
    
    // Check against team members from context
    if (context?.teamMembers) {
      const member = context.teamMembers.find(m => 
        m.toLowerCase().includes(name) || name.includes(m.toLowerCase())
      );
      if (member) return member;
    }
    
    return assigneeMatch[2];
  }
  
  return null;
}

/**
 * Parse sort preferences from natural language
 */
function parseSort(input: string): { field: string; direction: 'asc' | 'desc' } | null {
  for (const sortPattern of SORT_PATTERNS) {
    if (sortPattern.pattern.test(input)) {
      return { field: sortPattern.field, direction: sortPattern.direction };
    }
  }
  return null;
}

/**
 * Parse project mentions from natural language
 */
function parseProject(input: string, context?: ParseContext): string | null {
  // Look for "in [project]" or "project [name]" patterns
  const projectMatch = input.match(/\b(in project|project|in)\s+["']?([^"']+)["']?\b/i);
  if (projectMatch) {
    const projectName = projectMatch[2].trim();
    
    // Validate against available projects
    if (context?.availableProjects) {
      const project = context.availableProjects.find(p => 
        p.toLowerCase() === projectName.toLowerCase() ||
        p.toLowerCase().includes(projectName.toLowerCase())
      );
      if (project) return project;
    }
    
    return projectName;
  }
  
  return null;
}

/**
 * Parse label/tag mentions from natural language
 */
function parseLabels(input: string, _context?: ParseContext): string[] | null {
  const labels: string[] = [];
  
  // Look for "tagged with", "label", or "tag" patterns
  const labelPattern = /\b(tagged with|label|tag)[":\s]+([^,"]+)/gi;
  let match;
  while ((match = labelPattern.exec(input)) !== null) {
    const label = match[2].trim();
    if (label) labels.push(label);
  }
  
  // Also look for hashtag-style tags
  const hashTagPattern = /#(\w+)/g;
  while ((match = hashTagPattern.exec(input)) !== null) {
    labels.push(match[1]);
  }
  
  return labels.length > 0 ? labels : null;
}

/**
 * Calculate confidence scores based on parsing results
 */
function calculateConfidence(
  input: string,
  filters: ParsedSearchFilter['filters'],
  sort: ParsedSearchFilter['sort'] | null
): ParsedSearchFilter['confidence'] {
  const confidence = {
    overall: 0,
    status: 0,
    priority: 0,
    assignee: 0,
    date: 0,
  };
  
  let recognizedElements = 0;
  let totalElements = 0;
  
  // Status confidence
  if (filters.status && filters.status.length > 0) {
    confidence.status = 0.9;
    recognizedElements++;
  }
  totalElements++;
  
  // Priority confidence
  if (filters.priority && filters.priority.length > 0) {
    confidence.priority = 0.9;
    recognizedElements++;
  }
  totalElements++;
  
  // Assignee confidence
  if (filters.assignee && filters.assignee.length > 0) {
    confidence.assignee = 0.85;
    recognizedElements++;
  }
  totalElements++;
  
  // Date confidence
  if (filters.due || filters.created || filters.updated) {
    confidence.date = 0.8;
    recognizedElements++;
  }
  totalElements++;
  
  // Overall confidence
  if (totalElements > 0) {
    confidence.overall = recognizedElements / totalElements;
  }
  
  // Boost confidence if we have explicit sort preferences
  if (sort) {
    confidence.overall = Math.min(1, confidence.overall + 0.1);
  }
  
  return confidence;
}

/**
 * Convert parsed natural language filter to AdvancedTaskFilter format
 */
export function convertToAdvancedFilter(parsed: ParsedSearchFilter): AdvancedTaskFilter {
  const conditions: (FieldCondition | { operator: 'AND' | 'OR'; conditions: FieldCondition[] })[] = [];
  
  // Add status conditions
  if (parsed.filters.status && parsed.filters.status.length > 0) {
    if (parsed.filters.status.length === 1) {
      conditions.push({
        field: 'status' as TaskFilterField,
        operator: 'equals' as FilterOperator,
        value: parsed.filters.status[0],
      });
    } else {
      conditions.push({
        operator: 'OR',
        conditions: parsed.filters.status.map(status => ({
          field: 'status' as TaskFilterField,
          operator: 'equals' as FilterOperator,
          value: status,
        })),
      });
    }
  }
  
  // Add priority conditions
  if (parsed.filters.priority && parsed.filters.priority.length > 0) {
    if (parsed.filters.priority.length === 1) {
      conditions.push({
        field: 'priority' as TaskFilterField,
        operator: 'equals' as FilterOperator,
        value: parsed.filters.priority[0],
      });
    } else {
      conditions.push({
        operator: 'OR',
        conditions: parsed.filters.priority.map(priority => ({
          field: 'priority' as TaskFilterField,
          operator: 'equals' as FilterOperator,
          value: priority,
        })),
      });
    }
  }
  
  // Add assignee conditions (mapped to assignedUserId)
  if (parsed.filters.assignee && parsed.filters.assignee.length > 0) {
    // For now, we'll use a contains operator on the assignee name
    // In a real implementation, you'd resolve usernames to IDs
    const assigneeValue = parsed.filters.assignee[0];
    if (assigneeValue === 'me' || assigneeValue === 'unassigned') {
      // Special handling for these cases
      conditions.push({
        field: 'assignedUserId' as TaskFilterField,
        operator: assigneeValue === 'me' ? 'isNotEmpty' : 'isEmpty',
      });
    }
  }
  
  // Add due date conditions
  if (parsed.filters.due) {
    const now = new Date();
    let dateCondition: FieldCondition | null = null;
    
    switch (parsed.filters.due) {
      case 'today':
        dateCondition = {
          field: 'dueDate' as TaskFilterField,
          operator: 'equals',
          value: now.toISOString().split('T')[0],
        };
        break;
      case 'overdue':
        dateCondition = {
          field: 'dueDate' as TaskFilterField,
          operator: 'lessThan',
          value: now,
        };
        break;
      case 'thisWeek':
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + (7 - now.getDay()));
        dateCondition = {
          field: 'dueDate' as TaskFilterField,
          operator: 'between',
          value: { from: now, to: weekEnd },
        };
        break;
      case 'nextWeek':
        const nextWeekStart = new Date(now);
        nextWeekStart.setDate(now.getDate() + (7 - now.getDay()) + 1);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        dateCondition = {
          field: 'dueDate' as TaskFilterField,
          operator: 'between',
          value: { from: nextWeekStart, to: nextWeekEnd },
        };
        break;
    }
    
    if (dateCondition) {
      conditions.push(dateCondition);
    }
  }
  
  // Add label/tag conditions
  if (parsed.filters.label && parsed.filters.label.length > 0) {
    conditions.push({
      field: 'tags' as TaskFilterField,
      operator: 'contains',
      value: parsed.filters.label.join(','),
    });
  }
  
  // Add title/description search if query contains free text
  const freeText = extractFreeText(parsed.query, parsed.filters);
  if (freeText && freeText.length > 2) {
    conditions.push({
      field: 'title' as TaskFilterField,
      operator: 'contains',
      value: freeText,
    });
  }
  
  return {
    operator: 'AND',
    conditions,
  };
}

/**
 * Extract free text search terms that weren't parsed as filters
 */
function extractFreeText(query: string, filters: ParsedSearchFilter['filters']): string {
  let remainingText = query.toLowerCase();
  
  // Remove status-related words
  Object.values(STATUS_MAPPINGS).flat().forEach(word => {
    remainingText = remainingText.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });
  
  // Remove priority-related words
  Object.values(PRIORITY_MAPPINGS).flat().forEach(word => {
    remainingText = remainingText.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });
  
  // Remove date-related words
  Object.values(DATE_PATTERNS).forEach(pattern => {
    remainingText = remainingText.replace(pattern, '');
  });
  
  // Remove common filter words
  const filterWords = [
    'assigned', 'assignee', 'project', 'in', 'tag', 'label', 'tagged',
    'with', 'my', 'mine', 'due', 'created', 'updated', 'sort', 'by',
    'show', 'me', 'all', 'tasks', 'find', 'get', 'where', 'that', 'are',
    'have', 'has', 'is', 'the', 'and', 'or', 'to', 'for', 'of', 'on',
  ];
  
  filterWords.forEach(word => {
    remainingText = remainingText.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });
  
  // Clean up extra spaces
  return remainingText.replace(/\s+/g, ' ').trim();
}

/**
 * Main function to parse natural language query
 */
export function parseNaturalLanguageQuery(
  text: string,
  context?: ParseContext
): ParsedSearchFilter {
  const input = text.trim();
  
  const filters: ParsedSearchFilter['filters'] = {};
  
  // Parse status
  const status = normalizeStatus(input);
  if (status) {
    filters.status = [status];
  }
  
  // Parse priority
  const priority = normalizePriority(input);
  if (priority) {
    filters.priority = [priority];
  }
  
  // Parse assignee
  const assignee = parseAssignee(input, context);
  if (assignee) {
    filters.assignee = [assignee];
  }
  
  // Parse due date
  const dueDate = parseDateExpression(input);
  if (dueDate) {
    filters.due = dueDate;
  }
  
  // Parse project
  const project = parseProject(input, context);
  if (project) {
    filters.project = [project];
  }
  
  // Parse labels
  const labels = parseLabels(input, context);
  if (labels) {
    filters.label = labels;
  }
  
  // Parse sort
  const sort = parseSort(input);
  
  // Calculate confidence
  const confidence = calculateConfidence(input, filters, sort);
  
  return {
    query: input,
    filters,
    sort: sort || undefined,
    confidence,
  };
}

/**
 * Check if the query contains any filterable patterns
 */
export function hasFilterPatterns(text: string): boolean {
  const input = text.toLowerCase();
  
  // Check for status patterns
  for (const aliases of Object.values(STATUS_MAPPINGS)) {
    if (aliases.some(alias => input.includes(alias))) return true;
  }
  
  // Check for priority patterns
  for (const aliases of Object.values(PRIORITY_MAPPINGS)) {
    if (aliases.some(alias => input.includes(alias))) return true;
  }
  
  // Check for date patterns
  for (const pattern of Object.values(DATE_PATTERNS)) {
    if (pattern.test(input)) return true;
  }
  
  // Check for assignee patterns
  for (const assigneePattern of ASSIGNEE_PATTERNS) {
    if (assigneePattern.pattern.test(input)) return true;
  }
  
  return false;
}

/**
 * Get suggestions for natural language queries
 */
export function getNaturalLanguageSuggestions(context?: ParseContext): string[] {
  const suggestions = [
    'my high priority tasks due this week',
    'unassigned tasks in progress',
    'tasks assigned to me with urgent priority',
    'completed tasks from last week',
    'overdue tasks',
    'tasks tagged with bug',
    'my tasks sorted by due date',
  ];
  
  if (context?.availableProjects && context.availableProjects.length > 0) {
    suggestions.push(`tasks in ${context.availableProjects[0]}`);
  }
  
  return suggestions;
}
