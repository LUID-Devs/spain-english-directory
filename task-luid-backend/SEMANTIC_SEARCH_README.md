# Hybrid Semantic Search Implementation

## Overview

This implementation adds **Hybrid Semantic Search** (AI + Keyword matching) to TaskLuid, inspired by Linear's April 2025 changelog.

## Features Implemented

✅ **Vector Embeddings** - Store and search task content as 384-dimensional vectors
✅ **Hybrid Scoring** - Combines semantic similarity (70%) + keyword matching (30%)
✅ **Multi-field Search** - Search titles, descriptions, and comments
✅ **Natural Language Queries** - "that bug from last week about login"
✅ **Performance Optimized** - Target <200ms for 10k+ tasks with pgvector

## Architecture

```
User Query
    ↓
Embedding Generation (AI Model)
    ↓
Parallel Search:
├── Semantic Search (pgvector cosine similarity)
└── Keyword Search (PostgreSQL full-text)
    ↓
Score Combination & Ranking
    ↓
Filtered Results with Highlights
```

## File Structure

```
src/
├── controllers/
│   └── semanticSearchController.ts    # HTTP request handlers
├── services/
│   └── semanticSearch.service.ts      # Core search logic
├── routes/
│   └── semanticSearchRoutes.ts        # API route definitions
├── types/
│   └── semanticSearch.types.ts        # TypeScript interfaces
└── index.ts                           # Updated with new routes

prisma/
├── schema.prisma                      # Updated with TaskEmbedding model
└── migrations/
    └── 20250301_add_semantic_search/  # Database migration SQL

SEMANTIC_SEARCH_API.md                 # Full API documentation
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks/search` | POST | Hybrid semantic search |
| `/api/search/suggestions?q={query}` | GET | Search suggestions |
| `/api/search/config` | GET | Search configuration |
| `/api/tasks/:taskId/sync-embeddings` | POST | Sync task embeddings |
| `/api/tasks/:taskId/embeddings` | DELETE | Delete task embeddings |

## Database Schema

### TaskEmbedding Model

```prisma
model TaskEmbedding {
  id            Int       @id @default(autoincrement())
  taskId        Int       @map("task_id")
  content       String    // The text that was embedded
  contentType   String    // "title", "description", "comment"
  embedding     Unsupported("vector(384)") // pgvector
  modelName     String    // "text-embedding-3-small"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  task          Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([contentType])
}
```

## Setup Instructions

### 1. Install pgvector Extension

```bash
# On macOS with Homebrew
brew install pgvector

# On Ubuntu/Debian
sudo apt-get install postgresql-15-pgvector

# Enable in PostgreSQL
psql -d taskluid -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 2. Run Database Migration

```bash
# Using Prisma
npx prisma migrate dev --name add_semantic_search

# Or run the SQL directly
psql -d taskluid -f prisma/migrations/20250301_add_semantic_search/migration.sql
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Build and Start

```bash
npm run build
npm start
```

## Configuration

Default hybrid search weights:

```javascript
{
  semanticWeight: 0.7,    // Favor semantic meaning
  keywordWeight: 0.3,     // Favor exact keyword matches
  minScore: 0.3,          // Minimum combined score
  vectorDimensions: 384,  // Embedding dimensions
  topK: 100,              // Vector results to fetch
  similarityThreshold: 0.5 // Minimum cosine similarity
}
```

Override per-request:

```json
{
  "query": "authentication bug",
  "config": {
    "semanticWeight": 0.8,
    "keywordWeight": 0.2
  }
}
```

## Production Deployment Notes

### Embedding Service

The current implementation uses a **mock embedding generator** for development. In production, replace with:

```typescript
// Option 1: OpenAI
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Option 2: Local model (ollama, sentence-transformers)
// Option 3: Cohere, Hugging Face Inference API
```

### Background Embedding Sync

For production, use a background job queue (Bull, BullMQ) to sync embeddings:

```typescript
// When task is created/updated
await taskQueue.add('sync-embeddings', { taskId: task.id });

// Worker processes embeddings asynchronously
```

### Performance Optimization

1. **Index Tuning**: Adjust ivfflat `lists` parameter based on data size
   - 100 lists for <1M vectors
   - 1000 lists for >1M vectors

2. **Caching**: Cache embeddings for frequently accessed tasks

3. **Batch Processing**: Generate embeddings in batches for bulk imports

## Testing

```bash
# Test search endpoint
curl -X POST http://localhost:3001/api/tasks/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "login authentication bug",
    "searchIn": ["title", "description"]
  }'

# Test suggestions
curl "http://localhost:3001/api/search/suggestions?q=log" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

- [ ] Query intent classification
- [ ] Personalization based on user history
- [ ] Auto-complete with semantic suggestions
- [ ] Cross-lingual search support
- [ ] Re-ranking with click-through data

## References

- Linear.app Changelog (April 2025): Hybrid semantic search
- pgvector: https://github.com/pgvector/pgvector
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
