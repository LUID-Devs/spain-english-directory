# Time in Status - Workflow Analytics Feature

## Overview

This feature implements comprehensive time-in-status tracking for tasks, allowing users to understand how long tasks spend in each workflow state. This helps identify bottlenecks and optimize development processes.

## Features

### 1. Time Tracking
- Automatically tracks when a task enters and exits each status
- Calculates cumulative time spent in each status
- Tracks current time in current status

### 2. UI Components

#### TaskStatusWithTime
- Displays status badge with time spent in current status
- Shows tooltip with full time breakdown on hover
- Updates in real-time

#### TimeInStatusTooltip
- Detailed breakdown of time spent in each status
- Shows entry count and average duration per status
- Displays total tracked time

#### TaskStatusHistoryPanel
- Full status history timeline
- Visual breakdown of time by status
- Recent transitions list

### 3. Task List Integration
- Toggle to show/hide time in status in task lists
- Sort by time in status (using updatedAt as proxy)
- Filter tasks by time in current status (stale task detection)

### 4. Task Detail Page
- Status history panel showing complete timeline
- Current status duration display
- Per-status time breakdown

## Usage

### Basic Usage

```tsx
import { TaskStatusWithTime } from '@/components/TaskStatusWithTime';

// In your component
<TaskStatusWithTime task={task} showTime={true} />
```

### Using the Hook

```tsx
import { useTimeInStatus } from '@/components/TimeInStatus';

function MyComponent({ taskId }: { taskId: number }) {
  const {
    breakdown,
    currentStatus,
    timeInCurrentStatusFormatted,
    isLoading,
  } = useTimeInStatus(taskId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Current: {currentStatus} for {timeInCurrentStatusFormatted}</p>
      {breakdown?.map(item => (
        <div key={item.status}>
          {item.status}: {item.totalDuration}
        </div>
      ))}
    </div>
  );
}
```

### Utility Functions

```tsx
import {
  formatDuration,
  formatDurationShort,
  calculateStatusTimeBreakdown,
  TimeThresholds,
} from '@/lib/timeInStatus';

// Format seconds to readable duration
formatDuration(3665); // "1h 1m 5s"
formatDurationShort(3665); // "1h 1m"

// Check thresholds
if (seconds > TimeThresholds.ONE_WEEK) {
  console.log('Task is stale!');
}
```

## API Endpoints

The feature expects these backend endpoints:

### GET /tasks/:id/status-history
Returns status history entries for a task:
```json
{
  "id": 1,
  "taskId": 123,
  "status": "In Progress",
  "enteredAt": "2026-02-28T10:00:00Z",
  "exitedAt": "2026-03-01T14:30:00Z",
  "durationSeconds": 104400,
  "enteredBy": {
    "userId": 1,
    "username": "john.doe"
  }
}
```

### GET /tasks/:id/status-time-breakdown
Returns aggregated time breakdown:
```json
{
  "success": true,
  "taskId": 123,
  "currentStatus": "In Review",
  "currentStatusSince": "2026-03-01T14:30:00Z",
  "timeInCurrentStatusSeconds": 3600,
  "breakdown": [
    {
      "status": "To Do",
      "totalSeconds": 86400,
      "entryCount": 2,
      "averageDurationSeconds": 43200
    }
  ],
  "totalTrackedSeconds": 190800
}
```

### GET /projects/:id/status-time-analytics
Returns project-level analytics:
```json
{
  "success": true,
  "projectId": 1,
  "tasksAnalyzed": 50,
  "statusBreakdown": [
    {
      "status": "In Progress",
      "taskCount": 30,
      "totalSeconds": 2592000,
      "averageSeconds": 86400,
      "medianSeconds": 72000,
      "minSeconds": 3600,
      "maxSeconds": 604800,
      "p95Seconds": 172800
    }
  ]
}
```

## Implementation Notes

### State Management
- Uses Zustand store for caching status history data
- Implements request deduplication via useRequestManager
- Cache TTL: 5 seconds for status history data

### Performance
- Lazy loads time data only when needed
- Uses tooltips for detailed information to avoid clutter
- Optimistic UI updates for immediate feedback

### Future Enhancements
1. Real-time updates via WebSocket
2. Configurable threshold alerts
3. Status change notifications based on time limits
4. Export time reports to CSV/Excel
5. Integration with cycle time analytics

## Acceptance Criteria Coverage

- ✅ Track time spent in each status for all tasks
- ✅ Display time in status on hover (tooltip)
- ✅ Add display option for time in status in list views
- ✅ Add ordering/filtering by time in status
- ✅ Add time in status panel in task details
- ✅ Backend API endpoints (documented)

## Related Files

- `src/lib/timeInStatus.ts` - Core utilities
- `src/components/TimeInStatus/` - UI components
- `src/components/TaskStatusWithTime.tsx` - Status badge with time
- `src/components/TaskStatusHistoryPanel.tsx` - Detail panel
- `src/services/apiService.ts` - API methods
- `src/hooks/useApi.ts` - React hooks
- `src/stores/apiStore.ts` - State management
