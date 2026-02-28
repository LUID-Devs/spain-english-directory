# TaskLuid Advanced Filter Backend

This is the backend service for the Advanced Filters with AND/OR Logic feature.

## Features

- Complex nested AND/OR filter conditions
- 15+ filter operators (equals, contains, between, etc.)
- Secure organization-scoped data access
- Pagination and sorting support
- Legacy filter migration
- Saved views integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations (Prisma):
```bash
npx prisma migrate dev
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### POST /api/tasks/advanced-filter
Apply advanced filters to tasks.

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

### POST /api/tasks/advanced-filter/validate
Validate a filter structure without executing.

### POST /api/tasks/advanced-filter/convert
Convert legacy filter format to advanced format.

### GET /api/tasks/filter-metadata
Get available fields, operators, and values.

### POST /api/saved-views/:viewId/apply
Apply a saved view's filters.

## Architecture

- **Service Layer** (`services/`): Core business logic and Prisma integration
- **Controllers** (`controllers/`): HTTP request handlers
- **Routes** (`routes/`): API endpoint definitions
- **Middleware** (`middleware/`): Authentication and validation
- **Types** (`types/`): TypeScript type definitions
