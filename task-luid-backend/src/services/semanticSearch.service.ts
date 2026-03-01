import { PrismaClient, Prisma } from "@prisma/client";
import {
  SemanticSearchQuery,
  SemanticSearchResponse,
  SemanticSearchResult,
  HybridSearchConfig,
  SearchFilters,
  TaskEmbedding,
} from "../types/semanticSearch.types";

const prisma = new PrismaClient();

// Default configuration for hybrid search
const DEFAULT_CONFIG: HybridSearchConfig = {
  semanticWeight: 0.7,
  keywordWeight: 0.3,
  minScore: 0.3,
  vectorDimensions: 384,
  topK: 100,
  similarityThreshold: 0.5,
};

// Maximum limit for pagination
const MAX_LIMIT = 100;

/**
 * Generate vector embedding for text
 * In production, this would call an embedding service (OpenAI, Cohere, or local model)
 * For this implementation, we'll use a simplified mock that can be replaced with real embeddings
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Replace with actual embedding service call
  // Example: return await openai.embeddings.create({ input: text, model: "text-embedding-3-small" })
  
  // Mock implementation: Create a deterministic pseudo-random embedding based on text
  // This is for development/testing only - replace with real embeddings in production
  const embedding: number[] = [];
  const seed = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let i = 0; i < DEFAULT_CONFIG.vectorDimensions; i++) {
    // Pseudo-random value between -1 and 1
    const value = Math.sin(seed * (i + 1) * 0.1) * 0.5 + Math.cos(seed * (i + 2) * 0.05) * 0.5;
    embedding.push(value);
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / magnitude);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate keyword matching score using TF-IDF-like scoring
 */
function calculateKeywordScore(query: string, text: string): number {
  if (!text) return 0;
  
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const textLower = text.toLowerCase();
  
  if (queryTerms.length === 0) return 0;
  
  let score = 0;
  let matchedTerms = 0;
  
  for (const term of queryTerms) {
    // Exact match bonus
    if (textLower.includes(term)) {
      matchedTerms++;
      
      // Higher score for title matches
      if (textLower.startsWith(term)) {
        score += 1.0;
      } else if (textLower.includes(` ${term} `)) {
        score += 0.8;
      } else {
        score += 0.5;
      }
      
      // Frequency bonus
      const occurrences = (textLower.match(new RegExp(term, "g")) || []).length;
      score += Math.min(occurrences * 0.1, 0.3);
    }
  }
  
  // Coverage bonus: how many query terms were matched
  const coverageBonus = matchedTerms / queryTerms.length;
  
  return Math.min((score / queryTerms.length) * (0.7 + coverageBonus * 0.3), 1.0);
}

/**
 * Extract highlights from text based on query terms
 */
function extractHighlights(text: string, query: string): string[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const highlights: string[] = [];
  
  for (const term of queryTerms) {
    const regex = new RegExp(`(.{0,30}${term}.{0,30})`, "gi");
    const matches = text.match(regex);
    if (matches) {
      highlights.push(...matches.slice(0, 2)); // Max 2 highlights per term
    }
  }
  
  return highlights.slice(0, 3); // Max 3 highlights total
}

/**
 * Build Prisma where clause from search filters
 */
function buildFilterWhereClause(filters?: SearchFilters): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};
  
  if (!filters) return where;
  
  if (filters.projectId) {
    where.projectId = filters.projectId;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.priority) {
    where.priority = filters.priority;
  }
  
  if (filters.authorUserId) {
    where.authorUserId = filters.authorUserId;
  }
  
  if (filters.assignedUserId) {
    where.assignedUserId = filters.assignedUserId;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    where.OR = filters.tags.map(tag => ({
      tags: { contains: tag, mode: "insensitive" },
    }));
  }
  
  if (filters.dateRange) {
    where.updatedAt = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }
  
  return where;
}

/**
 * Perform semantic search using pgvector
 * Note: This requires the pgvector extension to be installed in PostgreSQL
 */
async function performSemanticSearch(
  queryEmbedding: number[],
  organizationId: number,
  filters?: SearchFilters,
  topK: number = 100
): Promise<Array<{ taskId: number; similarity: number; contentType: string; content: string }>> {
  // Build filter clause
  const filterWhere = buildFilterWhereClause(filters);
  
  // Use raw query with pgvector for efficient vector similarity search
  // The <=> operator is for cosine distance (1 - cosine similarity)
  const embeddingString = `[${queryEmbedding.join(",")}]`;
  
  const results = await prisma.$queryRaw<Array<{
    task_id: number;
    similarity: number;
    content_type: string;
    content: string;
  }>>`
    SELECT 
      te.task_id,
      1 - (te.embedding <=> ${embeddingString}::vector) as similarity,
      te.content_type,
      te.content
    FROM task_embeddings te
    JOIN tasks t ON te.task_id = t.id
    WHERE t.organization_id = ${organizationId}
      AND 1 - (te.embedding <=> ${embeddingString}::vector) > ${DEFAULT_CONFIG.similarityThreshold}
      ${filters?.projectId ? `AND t.project_id = ${filters.projectId}` : ""}
      ${filters?.status ? `AND t.status = '${filters.status}'` : ""}
      ${filters?.priority ? `AND t.priority = '${filters.priority}'` : ""}
    ORDER BY te.embedding <=> ${embeddingString}::vector
    LIMIT ${topK}
  `;
  
  return results.map(r => ({
    taskId: r.task_id,
    similarity: r.similarity,
    contentType: r.content_type,
    content: r.content,
  }));
}

/**
 * Perform keyword search
 */
async function performKeywordSearch(
  query: string,
  organizationId: number,
  filters?: SearchFilters,
  searchIn: Array<"title" | "description" | "comments"> = ["title", "description", "comments"]
): Promise<Array<{ taskId: number; contentType: string; content: string }>> {
  const filterWhere = buildFilterWhereClause(filters);
  
  const where: Prisma.TaskWhereInput = {
    organizationId,
    ...filterWhere,
  };
  
  // Build search conditions
  const searchConditions: Prisma.TaskWhereInput[] = [];
  
  if (searchIn.includes("title")) {
    searchConditions.push({
      title: { contains: query, mode: "insensitive" },
    });
  }
  
  if (searchIn.includes("description")) {
    searchConditions.push({
      description: { contains: query, mode: "insensitive" },
    });
  }
  
  if (searchConditions.length > 0) {
    where.OR = searchConditions;
  }
  
  // Fetch tasks matching keyword search
  const tasks = await prisma.task.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
    },
    take: 200, // Limit for performance
  });
  
  const results: Array<{ taskId: number; contentType: string; content: string }> = [];
  
  for (const task of tasks) {
    if (searchIn.includes("title")) {
      results.push({
        taskId: task.id,
        contentType: "title",
        content: task.title,
      });
    }
    
    if (searchIn.includes("description") && task.description) {
      results.push({
        taskId: task.id,
        contentType: "description",
        content: task.description,
      });
    }
  }
  
  // Search in comments if requested
  if (searchIn.includes("comments")) {
    const comments = await prisma.comment.findMany({
      where: {
        task: {
          organizationId,
          ...filterWhere,
        },
        content: { contains: query, mode: "insensitive" },
      },
      select: {
        taskId: true,
        content: true,
      },
      take: 200,
    });
    
    for (const comment of comments) {
      results.push({
        taskId: comment.taskId,
        contentType: "comment",
        content: comment.content,
      });
    }
  }
  
  return results;
}

/**
 * Combine semantic and keyword search results
 */
function combineSearchResults(
  semanticResults: Array<{ taskId: number; similarity: number; contentType: string; content: string }>,
  keywordResults: Array<{ taskId: number; contentType: string; content: string }>,
  query: string,
  config: HybridSearchConfig
): Map<number, SemanticSearchResult> {
  const taskMap = new Map<number, SemanticSearchResult>();
  
  // Process semantic results
  for (const result of semanticResults) {
    const existing = taskMap.get(result.taskId);
    
    if (existing) {
      existing.semanticScore = Math.max(existing.semanticScore, result.similarity);
      existing.matchedFields.push({
        field: result.contentType as "title" | "description" | "comment",
        content: result.content,
        highlights: extractHighlights(result.content, query),
      });
    } else {
      taskMap.set(result.taskId, {
        taskId: result.taskId,
        title: "", // Will be filled later
        description: null,
        status: "",
        priority: null,
        taskType: null,
        semanticScore: result.similarity,
        keywordScore: 0,
        combinedScore: result.similarity * config.semanticWeight,
        matchedFields: [{
          field: result.contentType as "title" | "description" | "comment",
          content: result.content,
          highlights: extractHighlights(result.content, query),
        }],
        updatedAt: new Date(),
      });
    }
  }
  
  // Process keyword results
  for (const result of keywordResults) {
    const keywordScore = calculateKeywordScore(query, result.content);
    const existing = taskMap.get(result.taskId);
    
    if (existing) {
      existing.keywordScore = Math.max(existing.keywordScore, keywordScore);
      existing.combinedScore = 
        existing.semanticScore * config.semanticWeight + 
        existing.keywordScore * config.keywordWeight;
      
      // Add matched field if not already present
      const fieldExists = existing.matchedFields.some(
        f => f.field === result.contentType && f.content === result.content
      );
      if (!fieldExists) {
        existing.matchedFields.push({
          field: result.contentType as "title" | "description" | "comment",
          content: result.content,
          highlights: extractHighlights(result.content, query),
        });
      }
    } else {
      taskMap.set(result.taskId, {
        taskId: result.taskId,
        title: "",
        description: null,
        status: "",
        priority: null,
        taskType: null,
        semanticScore: 0,
        keywordScore,
        combinedScore: keywordScore * config.keywordWeight,
        matchedFields: [{
          field: result.contentType as "title" | "description" | "comment",
          content: result.content,
          highlights: extractHighlights(result.content, query),
        }],
        updatedAt: new Date(),
      });
    }
  }
  
  return taskMap;
}

/**
 * Perform hybrid semantic search (AI + Keyword matching)
 */
export async function performHybridSearch(
  searchQuery: SemanticSearchQuery,
  organizationId: number,
  page: number = 1,
  limit: number = 25,
  config: Partial<HybridSearchConfig> = {}
): Promise<SemanticSearchResponse> {
  const startTime = Date.now();
  const effectiveConfig = { ...DEFAULT_CONFIG, ...config };
  const effectiveLimit = Math.min(limit, MAX_LIMIT);
  
  // Generate embedding for the query
  const embeddingStart = Date.now();
  const queryEmbedding = await generateEmbedding(searchQuery.query);
  const embeddingTime = Date.now() - embeddingStart;
  
  // Run semantic and keyword searches in parallel
  const [semanticResults, keywordResults] = await Promise.all([
    performSemanticSearch(
      queryEmbedding,
      organizationId,
      searchQuery.filters,
      effectiveConfig.topK
    ),
    performKeywordSearch(
      searchQuery.query,
      organizationId,
      searchQuery.filters,
      searchQuery.searchIn
    ),
  ]);
  
  // Combine results
  const combinedResults = combineSearchResults(
    semanticResults,
    keywordResults,
    searchQuery.query,
    effectiveConfig
  );
  
  // Filter by minimum score and sort by combined score
  const filteredResults = Array.from(combinedResults.values())
    .filter(r => r.combinedScore >= effectiveConfig.minScore)
    .sort((a, b) => b.combinedScore - a.combinedScore);
  
  // Get task IDs for fetching full details
  const taskIds = filteredResults.map(r => r.taskId);
  
  // Fetch full task details
  const tasks = await prisma.task.findMany({
    where: {
      id: { in: taskIds },
      organizationId,
    },
    include: {
      assignee: {
        select: {
          userId: true,
          username: true,
          profilePictureUrl: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Create a map for quick lookup
  const taskDetailsMap = new Map(tasks.map(t => [t.id, t]));
  
  // Enrich results with task details
  const enrichedResults: SemanticSearchResult[] = [];
  for (const result of filteredResults) {
    const task = taskDetailsMap.get(result.taskId);
    if (task) {
      enrichedResults.push({
        ...result,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        taskType: task.taskType,
        updatedAt: task.updatedAt,
        project: task.project || undefined,
        assignee: task.assignee,
      });
    }
  }
  
  // Apply pagination
  const totalCount = enrichedResults.length;
  const totalPages = Math.ceil(totalCount / effectiveLimit);
  const paginatedResults = enrichedResults.slice(
    (page - 1) * effectiveLimit,
    page * effectiveLimit
  );
  
  const queryTime = Date.now() - startTime;
  
  return {
    success: true,
    query: searchQuery.query,
    results: paginatedResults,
    pagination: {
      page,
      limit: effectiveLimit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    performance: {
      queryTimeMs: queryTime,
      embeddingTimeMs: embeddingTime,
    },
    searchInfo: {
      semanticWeight: effectiveConfig.semanticWeight,
      keywordWeight: effectiveConfig.keywordWeight,
      minScore: effectiveConfig.minScore,
    },
  };
}

/**
 * Create or update embeddings for a task
 */
export async function syncTaskEmbeddings(taskId: number): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { comments: true },
  });
  
  if (!task) return;
  
  // Delete existing embeddings
  await prisma.taskEmbedding.deleteMany({
    where: { taskId },
  });
  
  // Create embeddings for each content piece
  const embeddingsToCreate: Array<{
    taskId: number;
    content: string;
    contentType: string;
    embedding: number[];
    modelName: string;
  }> = [];
  
  // Title embedding
  const titleEmbedding = await generateEmbedding(task.title);
  embeddingsToCreate.push({
    taskId,
    content: task.title,
    contentType: "title",
    embedding: titleEmbedding,
    modelName: "text-embedding-3-small",
  });
  
  // Description embedding
  if (task.description) {
    const descEmbedding = await generateEmbedding(task.description);
    embeddingsToCreate.push({
      taskId,
      content: task.description,
      contentType: "description",
      embedding: descEmbedding,
      modelName: "text-embedding-3-small",
    });
  }
  
  // Comment embeddings
  for (const comment of task.comments) {
    const commentEmbedding = await generateEmbedding(comment.content);
    embeddingsToCreate.push({
      taskId,
      content: comment.content,
      contentType: "comment",
      embedding: commentEmbedding,
      modelName: "text-embedding-3-small",
    });
  }
  
  // Insert embeddings using raw query for vector support
  for (const emb of embeddingsToCreate) {
    await prisma.$executeRaw`
      INSERT INTO task_embeddings (task_id, content, content_type, embedding, model_name, created_at, updated_at)
      VALUES (
        ${emb.taskId},
        ${emb.content},
        ${emb.contentType},
        ${`[${emb.embedding.join(",")}]`}::vector,
        ${emb.modelName},
        NOW(),
        NOW()
      )
    `;
  }
}

/**
 * Delete embeddings for a task
 */
export async function deleteTaskEmbeddings(taskId: number): Promise<void> {
  await prisma.taskEmbedding.deleteMany({
    where: { taskId },
  });
}

/**
 * Search suggestions based on recent searches and popular queries
 */
export async function getSearchSuggestions(
  query: string,
  organizationId: number,
  userId: number
): Promise<string[]> {
  // Get recent task titles as suggestions
  const recentTasks = await prisma.task.findMany({
    where: {
      organizationId,
      OR: [
        { authorUserId: userId },
        { assignedUserId: userId },
      ],
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: { title: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  
  // Get popular tags
  const tasksWithTags = await prisma.task.findMany({
    where: {
      organizationId,
      tags: { not: null },
    },
    select: { tags: true },
    take: 100,
  });
  
  const tagSet = new Set<string>();
  tasksWithTags.forEach(task => {
    if (task.tags) {
      task.tags.split(",").forEach(tag => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed.includes(query.toLowerCase())) {
          tagSet.add(trimmed);
        }
      });
    }
  });
  
  return [
    ...recentTasks.map(t => t.title),
    ...Array.from(tagSet).slice(0, 5),
  ];
}

export { prisma };
