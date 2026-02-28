# Advanced Filter System with AND/OR Logic

**Task:** TASK-971  
**Status:** ✅ Complete  
**Branch:** `task/971-advanced-filter-system` (backend), `task-763-advanced-filters` (frontend)

## Overview

The Advanced Filter System enables complex task filtering with support for nested AND/OR logic, allowing users to create sophisticated queries like:

> "Show me all tasks that are (In Progress OR Review) AND (Priority P0 OR P1) AND assigned to me"

## Features

### Backend Features

- ✅ **Nested AND/OR Logic** - Create complex filter trees with unlimited nesting depth (up to 10 levels)
- ✅ **15 Filter Operators** - equals, notEquals, contains, notContains, startsWith, endsWith, greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual, in, notIn, between, isEmpty, isNotEmpty
- ✅ **19 Filterable Fields** - id, title, description, status, priority, taskType, tags, startDate, dueDate, updatedAt, points, projectId, authorUserId, assignedUserId, cycleId, triaged, archivedAt, isShared
- ✅ **Legacy Filter Migration** - Automatic conversion from simple filters to advanced format
- ✅ **Organization Security** - All filters are scoped to the user's organization
- ✅ **Validation API** - Validate filter structures before execution
- ✅ **Filter Metadata API** - Get available fields, operators, and value suggestions

### Frontend Features

- ✅ **useAdvancedFilter Hook** - React hook for filter management with pagination
- ✅ **Type-Safe API** - Full TypeScript support for all filter types
- ✅ **Filter Builder Helpers** - Helper functions to construct filters programmatically
- ✅ **Saved View Integration** - Apply filters from saved views with AND/OR logic

## API Endpoints

### POST /api/tasks/advanced-filter
Apply advanced filters with AND/OR logic to tasks.

**Request:**
```json
{
  "filter": {
    "operator": "AND",
    "conditions": [
      { "field": "status", "operator": "equals", "value": "In Progress" },
      {
        "operator": "OR",
        "conditions": [
          { "field": "priority", "operator": "equals", "value": "P0" },
          { "field": "priority", "operator": "equals", "value": "P1" }
        ]
      }
    ]
  },
  "options": {
    "page": 1,
    "limit": 25,
    "sortBy": "updatedAt",
    "sortOrder": "desc"
  }
}
```

**Response:**
```json
{
  "success": true,
  "tasks": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalCount": 42,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filter": {
    "applied": true,
    "operator": "AND",
    "conditionCount": 2
  }
}
```

### POST /api/tasks/advanced-filter/validate
Validate an advanced filter structure without executing it.

**Request:**
```json
{
  "filter": { ... }
}
```

**Response:**
```json
{
  "valid": true
}
```

### POST /api/tasks/advanced-filter/convert
Convert a legacy simple filter to advanced filter format.

**Request:**
```json
{
  "legacyFilter": {
    "status": "In Progress",
    "priority": "P1"
  }
}
```

### GET /api/tasks/filter-metadata
Get metadata for building filters (available fields, operators, and values).

### POST /api/saved-views/:viewId/apply
Apply a saved view's filters to get matching tasks.

## Frontend Usage

### Basic Filter Example

```typescript
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter';

function TaskList() {
  const { tasks, applyFilter, isLoading } = useAdvancedFilter();

  const handleFilter = async () => {
    await applyFilter({
      operator: 'AND',
      conditions: [
        { field: 'status', operator: 'equals', value: 'In Progress' },
        { field: 'priority', operator: 'equals', value: 'P1' }
      ]
    });
  };

  return (
    <div>
      <button onClick={handleFilter}>Apply Filter</button>
      {isLoading ? <Loading /> : <TaskTable tasks={tasks} />}
    </div>
  );
}
```

### Complex Nested Filter Example

```typescript
const { createFieldCondition, createConditionGroup, createAdvancedFilter, applyFilter } = useAdvancedFilter();

const complexFilter = createAdvancedFilter('AND', [
  createFieldCondition('status', 'equals', 'In Progress'),
  createConditionGroup('OR', [
    createFieldCondition('priority', 'equals', 'P0'),
    createFieldCondition('priority', 'equals', 'P1')
  ]),
  createFieldCondition('assignedUserId', 'equals', currentUserId)
]);

await applyFilter(complexFilter);
```

### Using Type Guards

```typescript
import { isFieldCondition, isConditionGroup } from '@/hooks/useAdvancedFilter';

function processCondition(condition: FieldCondition | ConditionGroup) {
  if (isFieldCondition(condition)) {
    // condition is FieldCondition
    console.log(condition.field, condition.operator, condition.value);
  } else if (isConditionGroup(condition)) {
    // condition is ConditionGroup
    condition.conditions.forEach(processCondition);
  }
}
```

## Filter Structure

### Field Condition
```typescript
interface FieldCondition {
  field: TaskFilterField;      // e.g., 'status', 'priority', 'title'
  operator: FilterOperator;    // e.g., 'equals', 'contains', 'greaterThan'
  value?: string | number | boolean | string[] | number[] | Date | { from: Date; to: Date };
}
```

### Condition Group
```typescript
interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (FieldCondition | ConditionGroup)[];
}
```

### Advanced Task Filter
```typescript
interface AdvancedTaskFilter {
  operator?: 'AND' | 'OR';
  conditions: (FieldCondition | ConditionGroup)[];
}
```

## Valid Filter Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Task ID |
| `title` | string | Task title |
| `description` | string | Task description |
| `status` | string | Task status |
| `priority` | string | Task priority (P0-P4) |
| `taskType` | string | Task type (Feature/Bug/Chore) |
| `tags` | string | Comma-separated tags |
| `startDate` | date | Start date |
| `dueDate` | date | Due date |
| `updatedAt` | date | Last updated |
| `points` | number | Story points |
| `projectId` | number | Project ID |
| `authorUserId` | number | Author user ID |
| `assignedUserId` | number | Assignee user ID |
| `cycleId` | number | Cycle ID |
| `triaged` | boolean | Triaged status |
| `archivedAt` | date | Archived date |
| `isShared` | boolean | Shared status |

## Valid Filter Operators

| Operator | Types Supported | Description |
|----------|----------------|-------------|
| `equals` | string, number, boolean, date | Exact match |
| `notEquals` | string, number, boolean, date | Not equal |
| `contains` | string | Substring match (case-insensitive) |
| `notContains` | string | Does not contain |
| `startsWith` | string | Starts with prefix |
| `endsWith` | string | Ends with suffix |
| `greaterThan` | number, date | Greater than |
| `lessThan` | number, date | Less than |
| `greaterThanOrEqual` | number, date | Greater than or equal |
| `lessThanOrEqual` | number, date | Less than or equal |
| `in` | string, number | Value is in array |
| `notIn` | string, number | Value is not in array |
| `between` | number, date | Within range |
| `isEmpty` | string, date, number | Is null/empty |
| `isNotEmpty` | string, date, number | Is not null/empty |

## Testing

### Unit Tests
```bash
# Backend
npm test -- advancedFilter.service.test.ts
npm test -- advancedFilter.controller.test.ts
```

### Test Coverage
- ✅ Basic AND/OR filters
- ✅ Nested condition groups
- ✅ All 15 filter operators
- ✅ All 19 filterable fields
- ✅ Legacy filter conversion
- ✅ Validation logic
- ✅ Organization security enforcement
- ✅ Pagination and sorting
- ✅ Edge cases (empty filters, max depth, etc.)

## Security Considerations

1. **Organization Isolation** - All queries are automatically scoped to the user's organization using an AND wrapper
2. **Field Whitelist** - Only approved fields can be filtered (no raw SQL injection)
3. **Operator Whitelist** - Only approved operators can be used
4. **Max Recursion Depth** - Filter nesting is limited to 10 levels to prevent DoS
5. **Input Validation** - All filters are validated before execution

## Migration Guide

### From Simple Filters

Before:
```typescript
const filters = {
  status: 'In Progress',
  priority: 'P1'
};
```

After:
```typescript
const filter = {
  operator: 'AND',
  conditions: [
    { field: 'status', operator: 'equals', value: 'In Progress' },
    { field: 'priority', operator: 'equals', value: 'P1' }
  ]
};
```

Or use the conversion API:
```typescript
const { advancedFilter } = await apiService.convertLegacyFilter(simpleFilters);
```

## Future Enhancements

- [ ] Saved filters with AND/OR logic persistence
- [ ] Filter sharing between team members
- [ ] AI-powered filter suggestions
- [ ] Visual filter builder UI component
- [ ] Export/import filter configurations
- [ ] Filter performance analytics

## Related Tasks

- TASK-763: Frontend Advanced Filter UI
- TASK-692: Filter System Design (parent task)

## Changelog

### 2024-02-27
- Initial implementation of Advanced Filter System
- Backend service with AND/OR logic
- Frontend hook with pagination support
- Comprehensive test suite
- API documentation
