/**
 * Advanced Search Query Parser
 * Parses search queries with operators like GitHub/Linear
 * 
 * Supported operators:
 * - is:done | is:open | is:closed | is:archived
 * - assignee:me | assignee:<username> | assignee:<userId>
 * - author:me | author:<username>
 * - priority:urgent | priority:high | priority:medium | priority:low | priority:backlog
 * - status:<status>
 * - project:<project-name> | project:<project-id>
 * - label:<tag>
 * - due:today | due:yesterday | due:this-week | due:next-week | due:this-month | due:overdue
 * - created:today | created:this-week | created:last-week | created:last-month
 * - updated:today | updated:this-week | updated:last-week
 * - not:<operator> (negation)
 * - sort:priority | sort:due | sort:created | sort:updated (asc/desc with -desc suffix)
 */

export interface ParsedSearchQuery {
  /** Raw text query (without operators) */
  textQuery: string;
  /** Status filters */
  status?: {
    values: string[];
    negate: boolean;
  };
  /** Priority filters */
  priority?: {
    values: string[];
    negate: boolean;
  };
  /** Assignee filters (user IDs or 'me') */
  assignee?: {
    values: string[];
    negate: boolean;
  };
  /** Author filters (user IDs or 'me') */
  author?: {
    values: string[];
    negate: boolean;
  };
  /** Project filters */
  project?: {
    values: string[];
    negate: boolean;
  };
  /** Label/tag filters */
  label?: {
    values: string[];
    negate: boolean;
  };
  /** Due date filters */
  due?: {
    values: DateFilter[];
    negate: boolean;
  };
  /** Created date filters */
  created?: {
    values: DateFilter[];
    negate: boolean;
  };
  /** Updated date filters */
  updated?: {
    values: DateFilter[];
    negate: boolean;
  };
  /** Sort configuration */
  sort?: {
    field: SortField;
    direction: 'asc' | 'desc';
  };
  /** Whether the query has any operators */
  hasOperators: boolean;
  /** Array of invalid/unknown operators found */
  invalidOperators: Array<{ operator: string; value: string }>;
}

export type DateFilter = 
  | { type: 'relative'; value: 'today' | 'yesterday' | 'this-week' | 'next-week' | 'last-week' | 'this-month' | 'last-month' | 'overdue' }
  | { type: 'absolute'; date: Date; operator: 'before' | 'after' | 'on' }
  | { type: 'range'; start: Date; end: Date };

export type SortField = 'priority' | 'due' | 'created' | 'updated' | 'title' | 'status';

// Valid operator names
const VALID_OPERATORS = [
  'is', 'assignee', 'author', 'priority', 'status', 
  'project', 'label', 'due', 'created', 'updated', 'sort', 'not'
];

// Valid status values for 'is:' operator
const IS_STATUS_MAP: Record<string, string[]> = {
  'done': ['Completed', 'Done'],
  'open': ['To Do', 'Open', 'Work In Progress', 'In Progress'],
  'closed': ['Completed', 'Done', 'Closed'],
  'archived': ['Archived'],
  'in-progress': ['Work In Progress', 'In Progress'],
  'review': ['Under Review'],
  'todo': ['To Do', 'Open'],
};

// Valid priority values
const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low', 'backlog'];

// Valid sort fields
const VALID_SORT_FIELDS: SortField[] = ['priority', 'due', 'created', 'updated', 'title', 'status'];

/**
 * Parse a search query string into structured filters
 */
export function parseSearchQuery(query: string): ParsedSearchQuery {
  if (!query || !query.trim()) {
    return {
      textQuery: '',
      hasOperators: false,
      invalidOperators: [],
    };
  }

  const result: ParsedSearchQuery = {
    textQuery: '',
    hasOperators: false,
    invalidOperators: [],
  };

  // Track which operators we've seen for negation handling
  const seenOperators = new Map<string, boolean>();

  // Regex to match operators: operator:value or operator:"quoted value"
  // Also handles negation: -operator:value or not:operator:value
  // For not:operator:value format, we need to handle nested operators
  const operatorRegex = /(-?)(\w+):("[^"]*"|[^\s]+)/g;

  // Extract all operator matches
  const matches: Array<{ fullMatch: string; negate: boolean; operator: string; value: string }> = [];
  let match;

  while ((match = operatorRegex.exec(query)) !== null) {
    const [, negatePrefix, operator, rawValue] = match;
    const value = rawValue.replace(/^"|"$/g, ''); // Remove quotes
    matches.push({
      fullMatch: match[0],
      negate: negatePrefix === '-',
      operator: operator.toLowerCase(),
      value,
    });
  }

  // Build result from matches
  for (let i = 0; i < matches.length; i++) {
    const { negate, operator, value } = matches[i];

    // Handle 'not:' operator specially - it negates the next operator
    if (operator === 'not') {
      // Check if value contains another operator (e.g., "assignee:me")
      const nestedMatch = value.match(/^(\w+):(.+)$/);
      if (nestedMatch) {
        const [, nestedOp, nestedVal] = nestedMatch;
        if (VALID_OPERATORS.includes(nestedOp) && nestedOp !== 'not') {
          // Process this as a nested operator with negation
          processOperator(result, nestedOp, nestedVal, true, seenOperators);
          continue;
        }
      }

      // Otherwise, check if next token should be negated
      const nextOperator = value.toLowerCase();
      if (VALID_OPERATORS.includes(nextOperator) && nextOperator !== 'not') {
        seenOperators.set(nextOperator, true);
        continue; // Will process with negate=true when we hit the actual operator
      }
    }

    const isNegated = negate || seenOperators.get(operator) || false;
    seenOperators.delete(operator);
    processOperator(result, operator, value, isNegated, seenOperators);
  }

  // Extract text query by removing all operator matches
  let textQuery = query;
  for (const { fullMatch } of matches) {
    textQuery = textQuery.replace(fullMatch, '');
  }
  result.textQuery = textQuery.trim();

  return result;
}

/**
 * Process a single operator and update the result
 */
function processOperator(
  result: ParsedSearchQuery,
  operator: string,
  value: string,
  isNegated: boolean,
  seenOperators: Map<string, boolean>
): void {
  result.hasOperators = true;

  switch (operator) {
    case 'is':
      parseIsOperator(result, value, isNegated);
      break;
    case 'status':
      addFilter(result, 'status', value, isNegated);
      break;
    case 'priority':
      parsePriorityOperator(result, value, isNegated);
      break;
    case 'assignee':
      addFilter(result, 'assignee', value, isNegated);
      break;
    case 'author':
      addFilter(result, 'author', value, isNegated);
      break;
    case 'project':
      addFilter(result, 'project', value, isNegated);
      break;
    case 'label':
      addFilter(result, 'label', value, isNegated);
      break;
    case 'due':
      parseDateOperator(result, 'due', value, isNegated);
      break;
    case 'created':
      parseDateOperator(result, 'created', value, isNegated);
      break;
    case 'updated':
      parseDateOperator(result, 'updated', value, isNegated);
      break;
    case 'sort':
      parseSortOperator(result, value);
      break;
    default:
      result.invalidOperators.push({ operator, value });
  }
}

/**
 * Parse the 'is:' operator which maps to status
 */
function parseIsOperator(result: ParsedSearchQuery, value: string, negate: boolean): void {
  const normalizedValue = value.toLowerCase();
  const mappedStatuses = IS_STATUS_MAP[normalizedValue];
  
  if (mappedStatuses) {
    if (!result.status) {
      result.status = { values: [], negate };
    }
    result.status.values.push(...mappedStatuses);
  } else {
    // Treat as raw status value
    addFilter(result, 'status', value, negate);
  }
}

/**
 * Parse the 'priority:' operator
 */
function parsePriorityOperator(result: ParsedSearchQuery, value: string, negate: boolean): void {
  const normalizedValue = value.toLowerCase();
  
  if (VALID_PRIORITIES.includes(normalizedValue)) {
    // Capitalize first letter
    const capitalized = normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
    addFilter(result, 'priority', capitalized, negate);
  } else {
    // Invalid priority - still add it but mark as invalid
    addFilter(result, 'priority', value, negate);
    result.invalidOperators.push({ operator: 'priority', value });
  }
}

/**
 * Parse date operators (due:, created:, updated:)
 */
function parseDateOperator(
  result: ParsedSearchQuery, 
  field: 'due' | 'created' | 'updated', 
  value: string, 
  negate: boolean
): void {
  const normalizedValue = value.toLowerCase();
  const validRelativeDates = [
    'today', 'yesterday', 'this-week', 'next-week', 'last-week', 
    'this-month', 'last-month', 'overdue'
  ];

  if (validRelativeDates.includes(normalizedValue)) {
    if (!result[field]) {
      result[field] = { values: [], negate };
    }
    result[field]!.values.push({ type: 'relative', value: normalizedValue as any });
  } else {
    // Try to parse as date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      if (!result[field]) {
        result[field] = { values: [], negate };
      }
      result[field]!.values.push({ type: 'absolute', date, operator: 'on' });
    } else {
      result.invalidOperators.push({ operator: field, value });
    }
  }
}

/**
 * Parse the 'sort:' operator
 */
function parseSortOperator(result: ParsedSearchQuery, value: string): void {
  const normalizedValue = value.toLowerCase();
  
  // Check for direction suffix
  let direction: 'asc' | 'desc' = 'asc';
  let field = normalizedValue;
  
  if (normalizedValue.endsWith('-desc')) {
    direction = 'desc';
    field = normalizedValue.slice(0, -5);
  } else if (normalizedValue.endsWith('-asc')) {
    direction = 'asc';
    field = normalizedValue.slice(0, -4);
  }

  if (VALID_SORT_FIELDS.includes(field as SortField)) {
    result.sort = {
      field: field as SortField,
      direction,
    };
  } else {
    result.invalidOperators.push({ operator: 'sort', value });
  }
}

/**
 * Generic filter adder
 */
function addFilter<K extends keyof ParsedSearchQuery>(
  result: ParsedSearchQuery,
  key: K,
  value: string,
  negate: boolean
): void {
  const filterKey = key as string;
  
  if (filterKey === 'status' || filterKey === 'priority' || 
      filterKey === 'assignee' || filterKey === 'author' || 
      filterKey === 'project' || filterKey === 'label') {
    if (!result[filterKey]) {
      (result as any)[filterKey] = { values: [], negate };
    }
    (result as any)[filterKey].values.push(value);
  }
}

/**
 * Convert relative date filters to absolute date ranges
 */
export function resolveDateFilter(filter: DateFilter): { start?: Date; end?: Date; isOverdue?: boolean } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter.type) {
    case 'relative':
      switch (filter.value) {
        case 'today':
          return {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          };
        case 'yesterday':
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          return {
            start: yesterday,
            end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
          };
        case 'this-week': {
          const dayOfWeek = today.getDay();
          const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
          return { start: startOfWeek, end: endOfWeek };
        }
        case 'next-week': {
          const dayOfWeek = today.getDay();
          const startOfNextWeek = new Date(today.getTime() + (7 - dayOfWeek) * 24 * 60 * 60 * 1000);
          const endOfNextWeek = new Date(startOfNextWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
          return { start: startOfNextWeek, end: endOfNextWeek };
        }
        case 'last-week': {
          const dayOfWeek = today.getDay();
          const endOfLastWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000 - 1);
          const startOfLastWeek = new Date(endOfLastWeek.getTime() - 7 * 24 * 60 * 60 * 1000 + 1);
          return { start: startOfLastWeek, end: endOfLastWeek };
        }
        case 'this-month':
          return {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59),
          };
        case 'last-month':
          return {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59),
          };
        case 'overdue':
          return {
            end: new Date(today.getTime() - 1),
            isOverdue: true,
          };
        default:
          return {};
      }
    case 'absolute':
      if (filter.operator === 'before') {
        return { end: filter.date };
      } else if (filter.operator === 'after') {
        return { start: filter.date };
      } else {
        const startOfDay = new Date(filter.date.getFullYear(), filter.date.getMonth(), filter.date.getDate());
        return {
          start: startOfDay,
          end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      }
    case 'range':
      return { start: filter.start, end: filter.end };
    default:
      return {};
  }
}

/**
 * Apply parsed query to filter a list of tasks
 */
export function applySearchQuery<T extends Record<string, any>>(
  items: T[],
  query: ParsedSearchQuery,
  currentUserId?: number,
  options: {
    getAssigneeId?: (item: T) => number | undefined;
    getAuthorId?: (item: T) => number | undefined;
    getProjectId?: (item: T) => number | undefined;
    getDueDate?: (item: T) => Date | string | undefined;
    getCreatedAt?: (item: T) => Date | string | undefined;
    getUpdatedAt?: (item: T) => Date | string | undefined;
    getLabels?: (item: T) => string[] | undefined;
    getStatus?: (item: T) => string | undefined;
    getPriority?: (item: T) => string | undefined;
  } = {}
): T[] {
  return items.filter(item => {
    // Text search
    if (query.textQuery) {
      const textLower = query.textQuery.toLowerCase();
      const textFields = [
        item.title,
        item.description,
        item.name,
        item.username,
        item.tags,
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!textFields.includes(textLower)) {
        return false;
      }
    }

    // Status filter
    if (query.status) {
      const itemStatus = options.getStatus?.(item) || item.status;
      const matches = query.status.values.some(s => 
        itemStatus?.toLowerCase() === s.toLowerCase()
      );
      if (matches === query.status.negate) return false;
    }

    // Priority filter
    if (query.priority) {
      const itemPriority = options.getPriority?.(item) || item.priority;
      const matches = query.priority.values.some(p => 
        itemPriority?.toLowerCase() === p.toLowerCase()
      );
      if (matches === query.priority.negate) return false;
    }

    // Assignee filter
    if (query.assignee) {
      const assigneeId = options.getAssigneeId?.(item) || item.assignedUserId || item.assigneeId;
      const matches = query.assignee.values.some(a => {
        if (a.toLowerCase() === 'me') {
          return assigneeId === currentUserId;
        }
        // Try to match by ID or username
        return assigneeId?.toString() === a || 
               item.assignee?.username?.toLowerCase() === a.toLowerCase();
      });
      if (matches === query.assignee.negate) return false;
    }

    // Author filter
    if (query.author) {
      const authorId = options.getAuthorId?.(item) || item.authorUserId;
      const matches = query.author.values.some(a => {
        if (a.toLowerCase() === 'me') {
          return authorId === currentUserId;
        }
        return authorId?.toString() === a ||
               item.author?.username?.toLowerCase() === a.toLowerCase();
      });
      if (matches === query.author.negate) return false;
    }

    // Project filter
    if (query.project) {
      const projectId = options.getProjectId?.(item) || item.projectId;
      const matches = query.project.values.some(p => {
        return projectId?.toString() === p ||
               item.project?.name?.toLowerCase().includes(p.toLowerCase());
      });
      if (matches === query.project.negate) return false;
    }

    // Label filter
    if (query.label) {
      const labels = options.getLabels?.(item) || 
                    (item.tags ? item.tags.split(',').map((t: string) => t.trim()) : []);
      const matches = query.label.values.some(l => 
        labels.some((tag: string) => tag.toLowerCase() === l.toLowerCase())
      );
      if (matches === query.label.negate) return false;
    }

    // Due date filter
    if (query.due) {
      const dueDate = options.getDueDate?.(item) || item.dueDate;
      if (!dueDate && !query.due.negate) return false;
      
      const itemDate = dueDate ? new Date(dueDate) : null;
      const matches = query.due.values.some(filter => {
        const resolved = resolveDateFilter(filter);
        if (resolved.isOverdue) {
          return itemDate ? itemDate < new Date() && item.status !== 'Completed' : false;
        }
        if (!itemDate) return false;
        const itemTime = itemDate.getTime();
        const afterStart = !resolved.start || itemTime >= resolved.start.getTime();
        const beforeEnd = !resolved.end || itemTime <= resolved.end.getTime();
        return afterStart && beforeEnd;
      });
      if (matches === query.due.negate) return false;
    }

    // Created date filter
    if (query.created) {
      const createdAt = options.getCreatedAt?.(item) || item.createdAt;
      if (!createdAt) return query.created.negate;
      
      const itemDate = new Date(createdAt);
      const matches = query.created.values.some(filter => {
        const resolved = resolveDateFilter(filter);
        const itemTime = itemDate.getTime();
        const afterStart = !resolved.start || itemTime >= resolved.start.getTime();
        const beforeEnd = !resolved.end || itemTime <= resolved.end.getTime();
        return afterStart && beforeEnd;
      });
      if (matches === query.created.negate) return false;
    }

    // Updated date filter
    if (query.updated) {
      const updatedAt = options.getUpdatedAt?.(item) || item.updatedAt;
      if (!updatedAt) return query.updated.negate;
      
      const itemDate = new Date(updatedAt);
      const matches = query.updated.values.some(filter => {
        const resolved = resolveDateFilter(filter);
        const itemTime = itemDate.getTime();
        const afterStart = !resolved.start || itemTime >= resolved.start.getTime();
        const beforeEnd = !resolved.end || itemTime <= resolved.end.getTime();
        return afterStart && beforeEnd;
      });
      if (matches === query.updated.negate) return false;
    }

    return true;
  });
}

/**
 * Sort items based on parsed query sort configuration
 */
export function applySort<T extends Record<string, any>>(
  items: T[],
  sort: ParsedSearchQuery['sort'],
  options: {
    getPriority?: (item: T) => string | undefined;
    getDueDate?: (item: T) => Date | string | undefined;
    getCreatedAt?: (item: T) => Date | string | undefined;
    getUpdatedAt?: (item: T) => Date | string | undefined;
    getStatus?: (item: T) => string | undefined;
  } = {}
): T[] {
  if (!sort) return items;

  const priorityOrder: Record<string, number> = { 
    'Urgent': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Backlog': 5 
  };
  
  const statusOrder: Record<string, number> = { 
    'To Do': 1, 'Work In Progress': 2, 'Under Review': 3, 'Completed': 4 
  };

  const sorted = [...items].sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'priority': {
        const aPriority = options.getPriority?.(a) || a.priority;
        const bPriority = options.getPriority?.(b) || b.priority;
        comparison = (priorityOrder[aPriority] || 5) - (priorityOrder[bPriority] || 5);
        break;
      }
      case 'status': {
        const aStatus = options.getStatus?.(a) || a.status;
        const bStatus = options.getStatus?.(b) || b.status;
        comparison = (statusOrder[aStatus] || 5) - (statusOrder[bStatus] || 5);
        break;
      }
      case 'due': {
        const aDue = options.getDueDate?.(a) || a.dueDate;
        const bDue = options.getDueDate?.(b) || b.dueDate;
        const aTime = aDue ? new Date(aDue).getTime() : Infinity;
        const bTime = bDue ? new Date(bDue).getTime() : Infinity;
        comparison = aTime - bTime;
        break;
      }
      case 'created': {
        const aCreated = options.getCreatedAt?.(a) || a.createdAt;
        const bCreated = options.getCreatedAt?.(b) || b.createdAt;
        const aTime = aCreated ? new Date(aCreated).getTime() : 0;
        const bTime = bCreated ? new Date(bCreated).getTime() : 0;
        comparison = aTime - bTime;
        break;
      }
      case 'updated': {
        const aUpdated = options.getUpdatedAt?.(a) || a.updatedAt;
        const bUpdated = options.getUpdatedAt?.(b) || b.updatedAt;
        const aTime = aUpdated ? new Date(aUpdated).getTime() : 0;
        const bTime = bUpdated ? new Date(bUpdated).getTime() : 0;
        comparison = aTime - bTime;
        break;
      }
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
    }

    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Format a parsed query back to a string (for display/editing)
 */
export function formatSearchQuery(query: ParsedSearchQuery): string {
  const parts: string[] = [];

  if (query.textQuery) {
    parts.push(query.textQuery);
  }

  const appendFilter = (key: string, values?: { values: string[]; negate: boolean }) => {
    if (!values || values.values.length === 0) return;
    const prefix = values.negate ? '-' : '';
    values.values.forEach(v => {
      if (v.includes(' ')) {
        parts.push(`${prefix}${key}:"${v}"`);
      } else {
        parts.push(`${prefix}${key}:${v}`);
      }
    });
  };

  appendFilter('status', query.status);
  appendFilter('priority', query.priority);
  appendFilter('assignee', query.assignee);
  appendFilter('author', query.author);
  appendFilter('project', query.project);
  appendFilter('label', query.label);

  // Date filters
  ['due', 'created', 'updated'].forEach(field => {
    const filter = (query as any)[field] as { values: DateFilter[]; negate: boolean } | undefined;
    if (!filter) return;
    
    const prefix = filter.negate ? '-' : '';
    filter.values.forEach(df => {
      if (df.type === 'relative') {
        parts.push(`${prefix}${field}:${df.value}`);
      } else if (df.type === 'absolute') {
        parts.push(`${prefix}${field}:${df.date.toISOString().split('T')[0]}`);
      }
    });
  });

  // Sort
  if (query.sort) {
    const direction = query.sort.direction === 'desc' ? '-desc' : '';
    parts.push(`sort:${query.sort.field}${direction}`);
  }

  return parts.join(' ');
}

/**
 * Get search suggestions based on partial operator input
 */
export function getSearchSuggestions(
  partialQuery: string,
  options: {
    users?: Array<{ id: number; username: string }>;
    projects?: Array<{ id: number; name: string }>;
    labels?: string[];
    statuses?: string[];
  } = {}
): Array<{ text: string; description: string; type: 'operator' | 'value' | 'modifier' }> {
  const suggestions: Array<{ text: string; description: string; type: 'operator' | 'value' | 'modifier' }> = [];
  
  // If ends with operator prefix, suggest operators
  if (partialQuery.endsWith('is:') || partialQuery.endsWith('status:')) {
    ['done', 'open', 'closed', 'in-progress', 'review', 'todo', 'archived'].forEach(s => {
      suggestions.push({ text: s, description: `Status: ${s}`, type: 'value' });
    });
  }
  
  if (partialQuery.endsWith('priority:')) {
    ['urgent', 'high', 'medium', 'low', 'backlog'].forEach(p => {
      suggestions.push({ text: p, description: `Priority: ${p}`, type: 'value' });
    });
  }
  
  if (partialQuery.endsWith('assignee:') || partialQuery.endsWith('author:')) {
    suggestions.push({ text: 'me', description: 'Current user', type: 'value' });
    options.users?.forEach(u => {
      suggestions.push({ text: u.username, description: `User: ${u.username}`, type: 'value' });
    });
  }
  
  if (partialQuery.endsWith('project:')) {
    options.projects?.forEach(p => {
      suggestions.push({ text: p.name, description: `Project: ${p.name}`, type: 'value' });
    });
  }
  
  if (partialQuery.endsWith('due:') || partialQuery.endsWith('created:') || partialQuery.endsWith('updated:')) {
    ['today', 'yesterday', 'this-week', 'next-week', 'last-week', 'this-month', 'last-month'].forEach(d => {
      suggestions.push({ text: d, description: `Date: ${d.replace(/-/g, ' ')}`, type: 'value' });
    });
  }
  
  if (partialQuery.endsWith('due:')) {
    suggestions.push({ text: 'overdue', description: 'Overdue tasks', type: 'value' });
  }
  
  if (partialQuery.endsWith('sort:')) {
    ['priority', 'due', 'created', 'updated', 'title', 'status'].forEach(s => {
      suggestions.push({ text: s, description: `Sort by ${s}`, type: 'value' });
      suggestions.push({ text: `${s}-desc`, description: `Sort by ${s} (descending)`, type: 'value' });
    });
  }

  // Default operator suggestions if query is empty or ends with space
  if (!partialQuery || partialQuery.endsWith(' ')) {
    suggestions.push({ text: 'is:', description: 'Filter by status', type: 'operator' });
    suggestions.push({ text: 'priority:', description: 'Filter by priority', type: 'operator' });
    suggestions.push({ text: 'assignee:', description: 'Filter by assignee', type: 'operator' });
    suggestions.push({ text: 'due:', description: 'Filter by due date', type: 'operator' });
    suggestions.push({ text: 'sort:', description: 'Sort results', type: 'operator' });
  }

  return suggestions;
}

export default {
  parseSearchQuery,
  applySearchQuery,
  applySort,
  formatSearchQuery,
  getSearchSuggestions,
  resolveDateFilter,
};
