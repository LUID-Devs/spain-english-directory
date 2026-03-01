# AI Natural Language Filter API

This feature enables users to describe what they want to find in natural language, and the system converts it into structured filter criteria.

## Overview

The AI Natural Language Filter allows users to type queries like:
- "my high priority tasks due this week"
- "unassigned urgent bugs"
- "tasks assigned to John in the Website project"
- "completed tasks from last month"

Instead of manually building complex filter conditions, users can simply describe what they're looking for.

## API Endpoints

### POST /api/ai/parse-search-filter

Parse a natural language query into structured filter criteria.

**Request:**
```json
{
  "text": "my high priority tasks due this week",
  "availableProjects": ["Website", "Mobile App", "API"],
  "availableLabels": ["bug", "feature", "documentation"],
  "teamMembers": ["john", "jane", "bob"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "my high priority tasks due this week",
    "filters": {
      "status": [],
      "priority": ["High"],
      "assignee": ["me"],
      "due": "thisWeek"
    },
    "sort": {
      "field": "dueDate",
      "direction": "asc"
    },
    "confidence": {
      "overall": 0.85,
      "status": 0,
      "priority": 0.9,
      "assignee": 0.85,
      "date": 0.8
    }
  },
  "advancedFilter": {
    "operator": "AND",
    "conditions": [
      { "field": "priority", "operator": "equals", "value": "High" },
      { "field": "assignedUserId", "operator": "isNotEmpty" },
      { "field": "dueDate", "operator": "between", "value": { "from": "...", "to": "..." } }
    ]
  },
  "creditsUsed": 1,
  "remainingCredits": 49,
  "rateLimit": {
    "remaining": 99,
    "window": "1 hour"
  }
}
```

### GET /api/ai/suggestions

Get example natural language queries.

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "my high priority tasks due this week",
    "unassigned tasks in progress",
    "tasks assigned to me with urgent priority"
  ]
}
```

### GET /api/ai/credits

Get the current user's AI credit balance.

**Response:**
```json
{
  "success": true,
  "credits": {
    "used": 5,
    "remaining": 45,
    "total": 50
  }
}
```

### POST /api/ai/validate-query

Validate a query without using credits.

**Request:**
```json
{
  "text": "my high priority tasks"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "wouldUseCredits": true,
  "suggestions": []
}
```

## Supported Natural Language Patterns

### Status
- "todo", "to do", "open", "new" → To Do
- "in progress", "working", "active", "wip" → Work In Progress
- "review", "under review", "in review" → Under Review
- "completed", "done", "finished", "closed" → Completed
- "archived", "archive" → Archived
- "blocked", "stuck", "waiting" → Blocked

### Priority
- "urgent", "critical", "asap", "p0" → Urgent
- "high", "important", "major", "p1" → High
- "medium", "normal", "standard", "p2" → Medium
- "low", "minor", "trivial", "p3" → Low
- "backlog", "lowest", "p4" → Backlog

### Assignee
- "my", "mine", "assigned to me" → Current user
- "unassigned", "no assignee" → Unassigned tasks
- "assigned to [name]" → Specific user

### Dates
- "today", "tomorrow"
- "this week", "next week"
- "this month", "next month"
- "overdue", "past due", "late"
- "due soon", "upcoming"
- "yesterday", "last week", "last month"

### Projects
- "in [project name]"
- "project [name]"

### Labels/Tags
- "tagged with [label]"
- "label [name]"
- "#[tagname]"

### Sorting
- "newest", "latest", "recent" → Sort by updated desc
- "oldest", "earliest" → Sort by updated asc
- "highest priority" → Sort by priority asc
- "due date", "deadline" → Sort by due date asc
- "alphabetical" → Sort by title asc

## Credit System

Each natural language parsing request costs 1 AI credit.

- Default: 50 credits per user
- Rate limit: 100 requests per hour
- Credits reset based on subscription plan

## Rate Limiting

- 100 requests per hour per user
- Rate limit headers included in responses
- 429 status code when limit exceeded

## Error Handling

### 400 Bad Request
- Invalid input (missing text, too long)
- Query exceeds 500 characters

### 401 Unauthorized
- Missing or invalid authentication token

### 402 Payment Required
- Insufficient AI credits

### 429 Too Many Requests
- Rate limit exceeded

### 500 Internal Server Error
- Server-side processing error

## Integration with Frontend

The frontend SmartFilterBar component uses this API to:
1. Parse natural language queries when the "Use AI" button is clicked
2. Display confidence scores to users
3. Show remaining credits
4. Provide suggestions for query patterns

## Testing

Example curl commands:

```bash
# Parse a query
curl -X POST http://localhost:3001/api/ai/parse-search-filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "my high priority tasks due this week"}'

# Get suggestions
curl http://localhost:3001/api/ai/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check credits
curl http://localhost:3001/api/ai/credits \
  -H "Authorization: Bearer YOUR_TOKEN"

# Validate query
curl -X POST http://localhost:3001/api/ai/validate-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "my tasks"}'
```
