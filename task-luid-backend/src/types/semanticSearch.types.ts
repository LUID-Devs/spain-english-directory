/**
 * Types for Hybrid Semantic Search
 * AI Vector Embeddings + Keyword Matching
 */

// Search query types
export interface SemanticSearchQuery {
  query: string;
  searchIn?: Array<"title" | "description" | "comments">;
  filters?: SearchFilters;
}

export interface SearchFilters {
  projectId?: number;
  status?: string;
  priority?: string;
  authorUserId?: number;
  assignedUserId?: number;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Vector embedding for a task
export interface TaskEmbedding {
  id: number;
  taskId: number;
  content: string; // The text that was embedded
  contentType: "title" | "description" | "comment";
  embedding: number[]; // Vector embedding (e.g., 384 or 768 dimensions)
  modelName: string; // Model used for embedding
  createdAt: Date;
  updatedAt: Date;
}

// Search result item with relevance scores
export interface SemanticSearchResult {
  taskId: number;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  taskType?: string | null;
  semanticScore: number; // 0-1 score from vector similarity
  keywordScore: number; // 0-1 score from keyword matching
  combinedScore: number; // Weighted combination
  matchedFields: Array<{
    field: "title" | "description" | "comment";
    content: string;
    highlights: string[]; // Highlighted matched text
  }>;
  project?: {
    id: number;
    name: string;
  };
  assignee?: {
    userId: number;
    username: string | null;
    profilePictureUrl?: string | null;
  } | null;
  updatedAt: Date;
}

// Search response
export interface SemanticSearchResponse {
  success: boolean;
  query: string;
  results: SemanticSearchResult[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  performance: {
    queryTimeMs: number;
    embeddingTimeMs?: number;
  };
  searchInfo: {
    semanticWeight: number;
    keywordWeight: number;
    minScore: number;
  };
}

// Configuration for hybrid search
export interface HybridSearchConfig {
  semanticWeight: number; // 0.0 to 1.0 (default 0.7)
  keywordWeight: number; // 0.0 to 1.0 (default 0.3)
  minScore: number; // Minimum combined score to include (default 0.3)
  vectorDimensions: number; // Embedding dimensions (default 384)
  topK: number; // Number of vector results to fetch (default 100)
  similarityThreshold: number; // Minimum cosine similarity for vectors (default 0.5)
}

// Suggestion from natural language query
export interface SearchSuggestion {
  type: "filter" | "task" | "recent";
  text: string;
  filter?: Partial<SearchFilters>;
  taskId?: number;
}

// Natural language parsing result
export interface NaturalLanguageQuery {
  originalQuery: string;
  extractedFilters: SearchFilters;
  searchTerms: string;
  intent: "search" | "filter" | "recent" | "assigned_to_me" | "due_soon";
}
