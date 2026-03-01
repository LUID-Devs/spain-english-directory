# Hybrid Semantic Search API Documentation

## Overview

The Hybrid Semantic Search API combines **AI-powered vector embeddings** with **traditional keyword matching** to provide intelligent, natural language task search capabilities.

## Features

- **Semantic Search**: Find tasks based on meaning, not just keywords
- **Keyword Matching**: Traditional text search for exact matches
- **Hybrid Scoring**: Combines both approaches for best results
- **Natural Language**: Search like "that bug from last week about login"
- **Multi-field Search**: Search titles, descriptions, and comments
- **High Performance**: Optimized for <200ms response time on 10k+ tasks

## Endpoints

### POST /api/tasks/search

Perform a hybrid semantic search across tasks.

#### Request

```json
{
  "query": "login authentication bug from last week",
  "searchIn": ["title", "description", "comments"],
  "filters": {
    "projectId": 1,
    "status": "In Progress",
    "priority": "P1",
    "dateRange": {
      "from": "2025-02-01T00:00:00Z",
      "to": "2025-02-28T23:59:59Z"
    }
  },
  "page": 1,
  "limit": 25,
  "config": {
    "semanticWeight": 0.7,
    "keywordWeight": 0.3,
    "minScore": 0.3
  }
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | The search query (natural language or keywords) |
| searchIn | string[] | No | Fields to search: `"title"`, `"description"`, `"comments"` (default: all) |
| filters | object | No | Additional filters to narrow results |
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 25, max: 100) |
| config | object | No | Search configuration options |

#### Filters Object

| Field | Type | Description |
|-------|------|-------------|
| projectId | number | Filter by project |
| status | string | Filter by task status |
| priority | string | Filter by priority (P0-P4) |
| authorUserId | number | Filter by author |
| assignedUserId | number | Filter by assignee |
| tags | string[] | Filter by tags |
| dateRange | object | Filter by date range `{ from, to }` |

#### Config Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| semanticWeight | number | 0.7 | Weight for semantic similarity (0-1) |
| keywordWeight | number | 0.3 | Weight for keyword matching (0-1) |
| minScore | number | 0.3 | Minimum combined score to include result |

#### Response

```json
{
  "success": true,
  "query": "login authentication bug from last week",
  "results": [
    {
      "taskId": 123,
      "title": "Fix OAuth login flow timeout",
      "description": "Users experiencing timeout during OAuth authentication...",
      "status": "In Progress",
      "priority": "P1",
      "taskType": "Bug",
      "semanticScore": 0.89,
      "keywordScore": 0.75,
      "combinedScore": 0.85,
      "matchedFields": [
        {
          "field": "title",
          "content": "Fix OAuth login flow timeout",
          "highlights": ["OAuth login flow"]
        },
        {
          "field": "description",
          "content": "Users experiencing timeout during OAuth authentication...",
          "highlights": ["OAuth authentication"]
        }
      ],
      "project": {
        "id": 1,
        "name": "Platform"
      },
      "assignee": {
        "userId": 42,
        "username": "johndoe",
        "profilePictureUrl": "https://..."
      },
      "updatedAt": "2025-02-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalCount": 15,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "performance": {
    "queryTimeMs": 145,
    "embeddingTimeMs": 23
  },
  "searchInfo": {
    "semanticWeight": 0.7,
    "keywordWeight": 0.3,
    "minScore": 0.3
  }
}
```

### GET /api/search/suggestions?q={query}

Get search suggestions based on a partial query.

#### Response

```json
{
  "success": true,
  "query": "log",
  "suggestions": [
    "Fix login authentication",
    "Login page redesign",
    "Logout timeout issue",
    "bug",
    "login"
  ]
}
```

### GET /api/search/config

Get search configuration and feature flags.

#### Response

```json
{
  "success": true,
  "config": {
    "semanticWeight": 0.7,
    "keywordWeight": 0.3,
    "minScore": 0.3,
    "vectorDimensions": 384,
    "topK": 100,
    "similarityThreshold": 0.5,
    "maxLimit": 100
  },
  "features": {
    "semanticSearch": true,
    "keywordSearch": true,
    "hybridScoring": true,
    "searchInTitle": true,
    "searchInDescription": true,
    "searchInComments": true,
    "highlighting": true
  }
}
```

### POST /api/tasks/:taskId/sync-embeddings

Sync (create/update) embeddings for a specific task. Call this when task content changes.

#### Response

```json
{
  "success": true,
  "message": "Task embeddings synced successfully",
  "taskId": 123
}
```

### DELETE /api/tasks/:taskId/embeddings

Delete embeddings for a specific task.

#### Response

```json
{
  "success": true,
  "message": "Task embeddings deleted successfully",
  "taskId": 123
}
```

## Scoring Algorithm

The hybrid search uses a weighted combination of semantic and keyword scores:

```
Combined Score = (Semantic Score × Semantic Weight) + (Keyword Score × Keyword Weight)
```

- **Semantic Score**: Cosine similarity between query and content embeddings (0-1)
- **Keyword Score**: TF-IDF-like scoring based on term frequency and position (0-1)
- **Semantic Weight**: Default 0.7 (favors meaning)
- **Keyword Weight**: Default 0.3 (favors exact matches)

Results are filtered by `minScore` (default 0.3) and sorted by combined score.

## Example Queries

### Natural Language
```json
{
  "query": "that bug from last week about login timeout"
}
```

### Keyword Search
```json
{
  "query": "OAuth authentication",
  "searchIn": ["title", "description"]
}
```

### With Filters
```json
{
  "query": "performance optimization",
  "filters": {
    "projectId": 5,
    "priority": "P0",
    "assignedUserId": 42
  }
}
```

### Recent Tasks
```json
{
  "query": "authentication",
  "filters": {
    "dateRange": {
      "from": "2025-02-20T00:00:00Z",
      "to": "2025-02-28T23:59:59Z"
    }
  }
}
```

## Database Requirements

- **PostgreSQL 12+** with pgvector extension
- Vector dimensions: 384 (configurable)
- Index: ivfflat for approximate nearest neighbor search

## Performance Notes

- Query time: <200ms for 10k tasks
- Embedding generation: ~20-50ms (depends on model)
- Pagination recommended for large result sets
- Use filters to narrow search scope for better performance
