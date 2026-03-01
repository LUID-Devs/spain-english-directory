/**
 * Hybrid Semantic Search Utilities
 * Combines AI vector embeddings with keyword matching for superior search results
 * 
 * Based on Linear's hybrid semantic search (April 2025):
 * - Semantic similarity finds related tasks even with different wording
 * - Keyword matching ensures exact matches are prioritized
 * - Combined scoring provides the best of both approaches
 */

import { Task, Project, User } from '@/services/apiService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/** Vector embedding representation (simplified for frontend) */
export interface VectorEmbedding {
  /** Embedding vector (usually 384-1536 dimensions) - truncated for transfer */
  vector: number[];
  /** Model used to generate embedding */
  model: string;
  /** Timestamp of embedding generation */
  createdAt: string;
}

/** Semantic search result with relevance scoring */
export interface SemanticSearchResult {
  /** The task entity */
  task: Task;
  /** Semantic similarity score (0-1, higher = more similar) */
  semanticScore: number;
  /** Keyword match score (0-1, higher = more keyword matches) */
  keywordScore: number;
  /** Combined hybrid score (weighted average) */
  hybridScore: number;
  /** Matching field details */
  matches: {
    title?: { score: number; matched: boolean };
    description?: { score: number; matched: boolean };
    comments?: { score: number; count: number };
    tags?: { score: number; matched: boolean };
  };
  /** Why this result was returned (for debugging/UX) */
  matchReason: 'semantic' | 'keyword' | 'hybrid';
}

/** Hybrid search parameters */
export interface HybridSearchParams {
  /** User's search query */
  query: string;
  /** Optional: Filter by project */
  projectId?: string | number;
  /** Optional: Filter by status */
  status?: string;
  /** Optional: Filter by priority */
  priority?: string;
  /** Optional: Filter by assignee */
  assigneeId?: number;
  /** Optional: Filter by author */
  authorId?: number;
  /** Maximum results to return (default: 20) */
  limit?: number;
  /** Semantic similarity threshold (0-1, default: 0.7) */
  semanticThreshold?: number;
  /** Weight for semantic vs keyword scoring (0-1, default: 0.6) */
  semanticWeight?: number;
  /** Include archived tasks */
  includeArchived?: boolean;
}

/** Hybrid search response */
export interface HybridSearchResponse {
  /** Ranked search results */
  results: SemanticSearchResult[];
  /** Total matches found */
  totalCount: number;
  /** Whether semantic search was used */
  usedSemanticSearch: boolean;
  /** Query embedding generation time (ms) */
  embeddingTimeMs: number;
  /** Total search time (ms) */
  searchTimeMs: number;
  /** Whether results were served from cache */
  fromCache: boolean;
  /** Suggested alternative queries */
  suggestions?: string[];
}

/** Search index entry for client-side caching */
export interface SearchIndexEntry {
  /** Task ID */
  id: number;
  /** Normalized title tokens */
  titleTokens: string[];
  /** Normalized description tokens */
  descriptionTokens: string[];
  /** Tags array */
  tags: string[];
  /** Cached embedding (if available) */
  embedding?: number[];
  /** Last updated timestamp */
  updatedAt: number;
}

/** Real-time index update event */
export interface IndexUpdateEvent {
  type: 'create' | 'update' | 'delete';
  entityType: 'task' | 'project' | 'comment';
  entityId: number;
  /** Partial data for the update */
  data?: Partial<Task>;
  /** New embedding if available */
  embedding?: VectorEmbedding;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default semantic similarity threshold */
export const DEFAULT_SEMANTIC_THRESHOLD = 0.7;

/** Default weight for semantic scoring (0.6 = 60% semantic, 40% keyword) */
export const DEFAULT_SEMANTIC_WEIGHT = 0.6;

/** Maximum number of search results */
export const DEFAULT_SEARCH_LIMIT = 20;

/** Minimum query length for semantic search */
export const MIN_SEMANTIC_QUERY_LENGTH = 3;

/** Cache TTL for search results (5 minutes) */
export const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

// Common synonyms and related terms for fallback matching
export const SEMANTIC_SYNONYMS: Record<string, string[]> = {
  'bug': ['issue', 'error', 'defect', 'problem', 'crash', 'fix'],
  'feature': ['enhancement', 'improvement', 'addition', 'new', 'request'],
  'urgent': ['critical', 'high priority', 'asap', 'emergency', 'important'],
  'done': ['complete', 'finished', 'resolved', 'closed', 'merged'],
  'in progress': ['working', 'active', 'ongoing', 'started', 'wip'],
  'review': ['check', 'audit', 'verify', 'validate', 'approve'],
  'design': ['ui', 'ux', 'mockup', 'wireframe', 'visual', 'figma'],
  'backend': ['api', 'server', 'database', 'infrastructure'],
  'frontend': ['client', 'ui', 'web', 'interface', 'react'],
  'test': ['testing', 'qa', 'quality', 'verify', 'check', 'spec'],
  'deploy': ['release', 'ship', 'publish', 'production', 'live'],
  'refactor': ['cleanup', 'restructure', 'optimize', 'improve'],
};

// ============================================================================
// TEXT NORMALIZATION & TOKENIZATION
// ============================================================================

/**
 * Normalize text for search matching
 * - Lowercase
 * - Remove special characters
 * - Normalize whitespace
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize text into searchable tokens
 */
export function tokenize(text: string | null | undefined): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  
  // Split on whitespace and filter short tokens
  return normalized
    .split(' ')
    .filter(token => token.length >= 2)
    .filter((token, index, arr) => arr.indexOf(token) === index); // Deduplicate
}

/**
 * Extract n-grams from text (for partial matching)
 */
export function extractNGrams(text: string, n: number = 2): string[] {
  const tokens = tokenize(text);
  if (tokens.length < n) return tokens;
  
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calculate fuzzy match score (0-1)
 */
export function fuzzyMatchScore(query: string, target: string): number {
  if (!query || !target) return 0;
  
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);
  
  // Exact match
  if (normalizedTarget === normalizedQuery) return 1;
  
  // Contains match
  if (normalizedTarget.includes(normalizedQuery)) return 0.9;
  if (normalizedQuery.includes(normalizedTarget)) return 0.8;
  
  // Token overlap
  const queryTokens = tokenize(query);
  const targetTokens = tokenize(target);
  
  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;
  
  const intersection = queryTokens.filter(t => targetTokens.includes(t));
  const union = new Set([...queryTokens, ...targetTokens]);
  
  // Jaccard similarity
  return intersection.length / union.size;
}

// ============================================================================
// KEYWORD SCORING
// ============================================================================

/**
 * Calculate keyword match score for a task
 */
export function calculateKeywordScore(
  query: string,
  task: Task,
  weights: {
    titleWeight: number;
    descriptionWeight: number;
    tagsWeight: number;
    commentsWeight: number;
  } = {
    titleWeight: 0.4,
    descriptionWeight: 0.3,
    tagsWeight: 0.2,
    commentsWeight: 0.1,
  }
): { score: number; matches: SemanticSearchResult['matches'] } {
  const queryTokens = tokenize(query);
  const queryLower = normalizeText(query);
  
  // Title matching (highest priority)
  const titleScore = task.title 
    ? fuzzyMatchScore(query, task.title) * weights.titleWeight
    : 0;
  
  // Description matching
  const descriptionScore = task.description
    ? fuzzyMatchScore(query, task.description) * weights.descriptionWeight
    : 0;
  
  // Tags matching
  let tagsScore = 0;
  if (task.tags) {
    const taskTags = task.tags.split(',').map(t => t.trim().toLowerCase());
    const queryTags = queryTokens;
    const tagMatches = queryTags.filter(qt => 
      taskTags.some(tt => tt.includes(qt) || qt.includes(tt))
    ).length;
    tagsScore = (tagMatches / Math.max(queryTags.length, 1)) * weights.tagsWeight;
  }
  
  // Comments matching (if available)
  let commentsScore = 0;
  let commentMatchCount = 0;
  // Comments would need to be loaded separately or included in task
  
  // Synonym expansion for better matching
  let synonymScore = 0;
  for (const [term, synonyms] of Object.entries(SEMANTIC_SYNONYMS)) {
    if (queryLower.includes(term)) {
      for (const synonym of synonyms) {
        const targetText = `${task.title || ''} ${task.description || ''} ${task.tags || ''}`.toLowerCase();
        if (targetText.includes(synonym)) {
          synonymScore += 0.05; // Small boost for synonym matches
        }
      }
    }
  }
  
  const totalScore = Math.min(1, titleScore + descriptionScore + tagsScore + commentsScore + synonymScore);
  
  return {
    score: totalScore,
    matches: {
      title: { score: titleScore / weights.titleWeight, matched: titleScore > 0 },
      description: { score: descriptionScore / weights.descriptionWeight, matched: descriptionScore > 0 },
      tags: { score: tagsScore / weights.tagsWeight, matched: tagsScore > 0 },
      comments: { score: commentsScore, count: commentMatchCount },
    },
  };
}

// ============================================================================
// HYBRID SCORING
// ============================================================================

/**
 * Calculate combined hybrid score from semantic and keyword scores
 */
export function calculateHybridScore(
  semanticScore: number,
  keywordScore: number,
  semanticWeight: number = DEFAULT_SEMANTIC_WEIGHT
): number {
  const keywordWeight = 1 - semanticWeight;
  
  // Boost score if both signals are strong (confidence multiplier)
  const bothStrong = semanticScore > 0.7 && keywordScore > 0.5;
  const confidenceBoost = bothStrong ? 0.1 : 0;
  
  // Penalize if semantic is high but keyword is very low (possible false positive)
  const semanticOnlyPenalty = (semanticScore > 0.8 && keywordScore < 0.2) ? -0.1 : 0;
  
  const hybridScore = (semanticScore * semanticWeight) + (keywordScore * keywordWeight);
  return Math.max(0, Math.min(1, hybridScore + confidenceBoost + semanticOnlyPenalty));
}

/**
 * Determine the primary match reason for a result
 */
export function determineMatchReason(
  semanticScore: number,
  keywordScore: number,
  semanticThreshold: number = DEFAULT_SEMANTIC_THRESHOLD
): SemanticSearchResult['matchReason'] {
  const semanticStrong = semanticScore >= semanticThreshold;
  const keywordStrong = keywordScore >= 0.5;
  
  if (semanticStrong && keywordStrong) return 'hybrid';
  if (semanticStrong) return 'semantic';
  return 'keyword';
}

// ============================================================================
// CLIENT-SIDE SEARCH (FALLBACK)
// ============================================================================

/**
 * Perform client-side hybrid search (fallback when backend unavailable)
 * Uses TF-IDF-like scoring with semantic synonym expansion
 */
export function performClientHybridSearch(
  query: string,
  tasks: Task[],
  options: {
    semanticWeight?: number;
    semanticThreshold?: number;
    limit?: number;
  } = {}
): SemanticSearchResult[] {
  const {
    semanticWeight = DEFAULT_SEMANTIC_WEIGHT,
    semanticThreshold = DEFAULT_SEMANTIC_THRESHOLD,
    limit = DEFAULT_SEARCH_LIMIT,
  } = options;
  
  if (!query.trim() || query.length < MIN_SEMANTIC_QUERY_LENGTH) {
    return [];
  }
  
  const results: SemanticSearchResult[] = [];
  
  for (const task of tasks) {
    // Calculate keyword score
    const { score: keywordScore, matches } = calculateKeywordScore(query, task);
    
    // Estimate semantic score based on synonym expansion and fuzzy matching
    // This is a simplified client-side approximation
    const semanticScore = estimateSemanticScore(query, task);
    
    // Skip if neither score is significant
    if (semanticScore < 0.3 && keywordScore < 0.3) continue;
    
    const hybridScore = calculateHybridScore(semanticScore, keywordScore, semanticWeight);
    const matchReason = determineMatchReason(semanticScore, keywordScore, semanticThreshold);
    
    results.push({
      task,
      semanticScore,
      keywordScore,
      hybridScore,
      matches,
      matchReason,
    });
  }
  
  // Sort by hybrid score descending
  results.sort((a, b) => b.hybridScore - a.hybridScore);
  
  return results.slice(0, limit);
}

/**
 * Estimate semantic similarity using client-side heuristics
 * This approximates vector similarity without actual embeddings
 */
function estimateSemanticScore(query: string, task: Task): number {
  const queryTokens = tokenize(query);
  const queryLower = normalizeText(query);
  
  // Combine task text fields
  const taskText = `${task.title || ''} ${task.description || ''} ${task.tags || ''}`;
  const taskTokens = tokenize(taskText);
  
  // Base similarity on token overlap
  const intersection = queryTokens.filter(t => taskTokens.includes(t));
  let baseScore = intersection.length / Math.max(queryTokens.length, taskTokens.length, 1);
  
  // Boost for synonym matches
  for (const [term, synonyms] of Object.entries(SEMANTIC_SYNONYMS)) {
    if (queryLower.includes(term)) {
      const taskLower = taskText.toLowerCase();
      const synonymMatches = synonyms.filter(s => taskLower.includes(s)).length;
      baseScore += (synonymMatches / synonyms.length) * 0.2;
    }
  }
  
  // Boost for phrase proximity
  const queryNGrams = extractNGrams(query, 2);
  const taskNGrams = extractNGrams(taskText, 2);
  const ngramOverlap = queryNGrams.filter(ng => taskNGrams.includes(ng)).length;
  baseScore += (ngramOverlap / Math.max(queryNGrams.length, 1)) * 0.15;
  
  return Math.min(1, baseScore);
}

// ============================================================================
// INDEX MANAGEMENT
// ============================================================================

/**
 * Build a local search index from tasks
 */
export function buildSearchIndex(tasks: Task[]): Map<number, SearchIndexEntry> {
  const index = new Map<number, SearchIndexEntry>();
  
  for (const task of tasks) {
    index.set(task.id, {
      id: task.id,
      titleTokens: tokenize(task.title),
      descriptionTokens: tokenize(task.description),
      tags: task.tags ? task.tags.split(',').map(t => t.trim()) : [],
      updatedAt: new Date(task.updatedAt || Date.now()).getTime(),
    });
  }
  
  return index;
}

/**
 * Update search index with new/updated task
 */
export function updateSearchIndex(
  index: Map<number, SearchIndexEntry>,
  event: IndexUpdateEvent
): Map<number, SearchIndexEntry> {
  const newIndex = new Map(index);
  
  switch (event.type) {
    case 'create':
    case 'update':
      if (event.data) {
        const task = event.data as Task;
        newIndex.set(event.entityId, {
          id: event.entityId,
          titleTokens: tokenize(task.title),
          descriptionTokens: tokenize(task.description),
          tags: task.tags ? task.tags.split(',').map(t => t.trim()) : [],
          embedding: event.embedding?.vector,
          updatedAt: Date.now(),
        });
      }
      break;
    case 'delete':
      newIndex.delete(event.entityId);
      break;
  }
  
  return newIndex;
}

// ============================================================================
// SEARCH SUGGESTIONS
// ============================================================================

/**
 * Generate semantic-aware search suggestions
 */
export function getSemanticSearchSuggestions(
  partialQuery: string,
  recentSearches: string[] = []
): Array<{ text: string; description: string; type: 'semantic' | 'recent' | 'related' }> {
  const suggestions: Array<{ text: string; description: string; type: 'semantic' | 'recent' | 'related' }> = [];
  const queryLower = partialQuery.toLowerCase().trim();
  
  if (queryLower.length < 2) return suggestions;
  
  // Semantic concept suggestions
  for (const [concept, related] of Object.entries(SEMANTIC_SYNONYMS)) {
    if (concept.includes(queryLower) || queryLower.includes(concept)) {
      for (const term of related) {
        suggestions.push({
          text: term,
          description: `Related to "${concept}"`,
          type: 'semantic',
        });
      }
    }
  }
  
  // Recent searches that match
  for (const recent of recentSearches) {
    if (recent.toLowerCase().includes(queryLower) && recent !== partialQuery) {
      suggestions.push({
        text: recent,
        description: 'Recent search',
        type: 'recent',
      });
    }
  }
  
  // Deduplicate and limit
  const seen = new Set<string>();
  return suggestions
    .filter(s => {
      if (seen.has(s.text)) return false;
      seen.add(s.text);
      return true;
    })
    .slice(0, 5);
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Simple in-memory cache for search results
 */
export class SearchCache {
  private cache = new Map<string, { result: HybridSearchResponse; timestamp: number }>();
  private ttl: number;
  
  constructor(ttlMs: number = SEARCH_CACHE_TTL_MS) {
    this.ttl = ttlMs;
  }
  
  get(key: string): HybridSearchResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return { ...entry.result, fromCache: true };
  }
  
  set(key: string, result: HybridSearchResponse): void {
    this.cache.set(key, { result: { ...result, fromCache: false }, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  invalidate(pattern?: RegExp): void {
    if (!pattern) {
      this.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  normalizeText,
  tokenize,
  extractNGrams,
  fuzzyMatchScore,
  calculateKeywordScore,
  calculateHybridScore,
  determineMatchReason,
  performClientHybridSearch,
  buildSearchIndex,
  updateSearchIndex,
  getSemanticSearchSuggestions,
  debounce,
  SearchCache,
};
