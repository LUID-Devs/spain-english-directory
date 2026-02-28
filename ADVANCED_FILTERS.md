# Advanced Task Filters with AND/OR Logic

This feature provides powerful filtering capabilities for tasks with support for complex nested AND/OR conditions.

## Overview

The Advanced Filters system consists of:

1. **Backend API** (`task-luid-backend/src/services/advancedFilter.service.ts`)
   - Converts complex filter structures to Prisma where clauses
   - Supports nested condition groups with AND/OR logic
   - Validates filter structures
   - Secure by design (organization isolation enforced)

2. **API Routes** (`task-luid-backend/src/routes/advancedFilterRoutes.ts`)
   - `POST /api/tasks/advanced-filter` - Apply filters and get matching tasks
   - `POST /api/tasks/advanced-filter/validate` - Validate filter structure
   - `POST /api/tasks/advanced-filter/convert` - Convert legacy filters
   - `GET /api/tasks/filter-metadata` - Get available fields and operators
   - `POST /api/saved-views/:viewId/apply` - Apply saved view filters

3. **Frontend API Service** (`src/services/advancedFilterApi.ts`)
   - TypeScript types for filter structures
   - API client methods
   - Helper functions for building filters

4. **React Hook** (`src/hooks/useAdvancedFilters.ts`)
   - `useAdvancedFilters()` hook for managing filter state
   - Pagination support
   - Error handling and loading states

5. **UI Components** (`src/components/AdvancedFilters/`)
   - `AdvancedFilters` - Legacy client-side filtering (backward compatible)
   - `AdvancedFiltersV2` - Full server-side AND/OR logic with nested groups

## Filter Structure

```typescript
interface AdvancedTaskFilter {
  operator?: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}

interface FieldCondition {
  field: TaskFilterField;
  operator: FilterOperator;
  value?: string | number | boolean | Date | { from: Date; to: Date };
}

interface ConditionGroup {
  operator: "AND" | "OR";
  conditions: (FieldCondition | ConditionGroup)[];
}
```

## Supported Fields

- `id` - Task ID
- `title` - Task title
- `description` - Task description
- `status` - Task status
- `priority` - Task priority (P0-P4)
- `taskType` - Task type (Feature, Bug, Chore)
- `tags` - Tags (comma-separated string)
- `startDate` - Start date
- `dueDate` - Due date
- `updatedAt` - Last updated
- `points` - Story points
- `projectId` - Project ID
- `authorUserId` - Author user ID
- `assignedUserId` - Assignee user ID
- `cycleId` - Cycle ID
- `triaged` - Triaged flag
- `archivedAt` - Archived date
- `isShared` - Shared flag

## Supported Operators

- `equals` - Exact match
- `notEquals` - Not equal
- `contains` - Contains substring
- `notContains` - Does not contain
- `startsWith` - Starts with
- `endsWith` - Ends with
- `greaterThan` - Greater than (numbers/dates)
- `lessThan` - Less than (numbers/dates)
- `greaterThanOrEqual` - Greater than or equal
- `lessThanOrEqual` - Less than or equal
- `in` - In array of values
- `notIn` - Not in array
- `between` - Between two values (date/number ranges)
- `isEmpty` - Is null/empty
- `isNotEmpty` - Is not null

## Usage Examples

### Simple Filter

```typescript
import { createSimpleFilter, applyAdvancedFilter } from "@/services/advancedFilterApi";

const filter = createSimpleFilter({
  field: "status",
  operator: "equals",
  value: "In Progress"
});

const result = await applyAdvancedFilter(filter);
```

### OR Filter (Match Any)

```typescript
import { createOrFilter, applyAdvancedFilter } from "@/services/advancedFilterApi";

// Get tasks with status In Progress OR Review OR Done
const filter = createOrFilter("status", ["In Progress", "Review", "Done"]);

const result = await applyAdvancedFilter(filter);
```

### Complex Nested Filter

```typescript
import { buildComplexFilter, applyAdvancedFilter } from "@/services/advancedFilterApi";

// (status = "In Progress" OR status = "Review") AND priority = "High"
const filter = buildComplexFilter([
  {
    operator: "OR",
    conditions: [
      { field: "status", operator: "equals", value: "In Progress" },
      { field: "status", operator: "equals", value: "Review" }
    ]
  },
  {
    operator: "AND",
    conditions: [
      { field: "priority", operator: "equals", value: "High" }
    ]
  }
], "AND");

const result = await applyAdvancedFilter(filter);
```

### Using the React Hook

```tsx
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";

function TaskList() {
  const {
    tasks,
    isLoading,
    pagination,
    addCondition,
    applyFilters,
    nextPage,
    prevPage
  } = useAdvancedFilters({ pageSize: 25 });

  // Add filters
  const handleFilter = async () => {
    addCondition({ field: "status", operator: "equals", value: "In Progress" });
    addCondition({ field: "priority", operator: "equals", value: "High" });
    await applyFilters();
  };

  return (
    <div>
      <button onClick={handleFilter}>Filter</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {tasks.map(task => <li key={task.id}>{task.title}</li>)}
        </ul>
      )}
      <button onClick={prevPage} disabled={!pagination?.hasPrevPage}>
        Previous
      </button>
      <button onClick={nextPage} disabled={!pagination?.hasNextPage}>
        Next
      </button>
    </div>
  );
}
```

### Using the UI Component

```tsx
import { AdvancedFiltersV2 } from "@/components/AdvancedFilters";

function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  return (
    <div>
      <AdvancedFiltersV2
        tasks={tasks}
        projects={projects}
        users={users}
        availableStatuses={["To Do", "In Progress", "Review", "Done"]}
        onFilterChange={setTasks}
        onActiveFiltersChange={setActiveFilterCount}
      />
      {/* Task list */}
    </div>
  );
}
```

## API Endpoints

### POST /api/tasks/advanced-filter

Apply advanced filters and get matching tasks with pagination.

**Request Body:**
```json
{
  "filter": {
    "operator": "AND",
    "conditions": [
      { "field": "status", "operator": "equals", "value": "In Progress" },
      { "field": "priority", "operator": "equals", "value": "High" }
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

Validate a filter structure without executing it.

**Request Body:**
```json
{
  "filter": { ... }
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Filter structure is valid"
}
```

Or on error:
```json
{
  "valid": false,
  "error": "Invalid field: unknownField"
}
```

### GET /api/tasks/filter-metadata

Get metadata for building filters including available fields, operators, and values.

**Response:**
```json
{
  "success": true,
  "metadata": {
    "fields": [...],
    "operators": [...],
    "values": {
      "priority": ["P0", "P1", "P2", "P3", "P4"],
      "taskType": ["Feature", "Bug", "Chore"],
      "projects": [...],
      "users": [...],
      "statuses": [...],
      "tags": [...]
    }
  }
}
```

## Security Considerations

1. **Organization Isolation**: The backend ALWAYS enforces organization isolation via the `organizationId` field. User-provided filters are combined with the organization filter using AND logic, preventing cross-organization data access.

2. **Field Validation**: Only whitelisted fields can be used in filters. Attempting to use an unknown field results in a validation error.

3. **Recursion Limit**: Nested condition groups are limited to a maximum depth of 10 levels to prevent abuse.

4. **Type Safety**: TypeScript types ensure correct filter structures at compile time.

## Migration from Legacy Filters

The legacy simple filter format is automatically converted to the advanced format:

```typescript
// Legacy format
{ status: "In Progress", priority: "High" }

// Converts to
{
  operator: "AND",
  conditions: [
    { field: "status", operator: "equals", value: "In Progress" },
    { field: "priority", operator: "equals", value: "High" }
  ]
}
```

Use the `/api/tasks/advanced-filter/convert` endpoint or the `convertLegacyFilter()` function to convert filters programmatically.

## Files Changed

### Backend
- `task-luid-backend/src/services/advancedFilter.service.ts` - Core filter logic
- `task-luid-backend/src/controllers/advancedFilterController.ts` - API controller
- `task-luid-backend/src/routes/advancedFilterRoutes.ts` - Route definitions
- `task-luid-backend/src/index.ts` - Route registration (already exists)

### Frontend
- `src/services/advancedFilterApi.ts` - API client (NEW)
- `src/hooks/useAdvancedFilters.ts` - React hook (NEW)
- `src/components/AdvancedFilters/index.tsx` - Barrel exports (UPDATED)
- `src/components/AdvancedFilters/index-v2.tsx` - V2 component (NEW)
- `src/components/AdvancedFilters/index-original.tsx` - Legacy component (RENAMED)
