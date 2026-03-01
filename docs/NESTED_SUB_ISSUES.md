# Nested Sub-Issues Hierarchy (Task #656)

## Overview
This feature adds support for nested sub-issues in TaskLuid, allowing users to create unlimited depth hierarchies of tasks. This enables better organization of complex projects by breaking down large tasks into smaller, manageable sub-tasks.

## Features Implemented

### 1. Core Components

#### `NestedTaskList`
- Displays tasks in a hierarchical tree structure
- Supports expand/collapse functionality
- Visual depth indicators with connector lines
- Drag-and-drop support for reordering within hierarchy
- Add sub-task button on hover

#### `SubTasksSection`
- Integrated section for TaskDetailModal
- Shows sub-tasks with progress indicator
- Quick-add sub-task input
- Recursive display of nested children

#### `NestedViewToggle`
- Toggle between flat and nested view modes
- Expand all / Collapse all controls
- Visual indicators for expanded state

#### `TaskHierarchyIndicator`
- Visual tree indicators for task depth
- Breadcrumb navigation for task ancestors
- Depth badges showing hierarchy level
- Sub-task counters

### 2. Custom Hooks

#### `useNestedTasks`
- Manage nested task state and operations
- CRUD operations for sub-tasks
- Expand/collapse state management
- Task hierarchy navigation
- Drag-and-drop handlers

### 3. API Integration

New API methods added to `apiService`:
- `getTaskWithSubTasks()` - Fetch task with nested children
- `getSubTasks()` - Get direct or recursive sub-tasks
- `createSubTask()` - Create a new sub-task
- `setParentTask()` - Move task to new parent
- `moveSubTask()` - Reorder tasks within hierarchy
- `getTaskHierarchy()` - Get ancestors, descendants, and siblings
- `getProjectTasksWithHierarchy()` - Fetch all tasks with nesting info

### 4. TypeScript Types

Updated `Task` interface with:
```typescript
interface Task {
  // ... existing fields
  parentTaskId?: number | null;
  subTasks?: Task[];
  subTaskCount?: number;
  depth?: number;
  isExpanded?: boolean;
}
```

## Usage Examples

### Basic Nested Task List
```tsx
import { NestedTaskList } from '@/components/NestedTaskList';

<NestedTaskList
  tasks={tasks}
  expandedTaskIds={expandedIds}
  onToggleExpand={toggleExpand}
  onAddSubTask={handleAddSubTask}
  draggable={true}
  onReorder={handleReorder}
/>
```

### Using the Hook
```tsx
import { useNestedTasks } from '@/hooks/useNestedTasks';

const {
  tasks,
  createSubTask,
  moveTask,
  expandedTaskIds,
  toggleExpand,
  expandAll,
  collapseAll,
} = useNestedTasks({ projectId: 123 });
```

### Sub-tasks in Task Detail
```tsx
import { SubTasksSection } from '@/components/NestedTaskList';

<SubTasksSection
  parentTaskId={task.id}
  projectId={task.projectId}
  onSubTaskClick={handleSubTaskClick}
/>
```

## Acceptance Criteria Status

- [x] Add nested display option to issue list views
- [x] Support unlimited nesting depth for sub-issues
- [x] Visual tree/hierarchy indicator in list view
- [x] Expand/collapse functionality for nested items
- [x] Drag-and-drop support for reordering within hierarchy

## Backend Requirements

The following API endpoints need to be implemented on the backend:

1. `GET /tasks/:id?includeSubTasks=true` - Include nested children
2. `GET /tasks/:id/sub-tasks` - Get sub-tasks
3. `POST /tasks/:id/sub-tasks` - Create sub-task
4. `PATCH /tasks/:id/parent` - Update parent task
5. `PATCH /tasks/:id/move` - Move/reorder task
6. `GET /tasks/:id/hierarchy` - Get full hierarchy info
7. `GET /tasks/hierarchy?projectId=X` - Get project tasks with hierarchy

Database schema addition:
```sql
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
```

## Future Enhancements

1. Bulk operations on sub-tasks (complete all, delete all)
2. Sub-task templates
3. Progress rollup from sub-tasks to parent
4. Dependency visualization between tasks
5. Keyboard shortcuts for navigation
6. Filter by hierarchy depth
