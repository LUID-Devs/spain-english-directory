-- Migration: Add pgvector extension and TaskEmbedding table
-- For Hybrid Semantic Search feature

-- Enable pgvector extension (requires PostgreSQL 12+)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create task_embeddings table
CREATE TABLE IF NOT EXISTS task_embeddings (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('title', 'description', 'comment')),
    embedding VECTOR(384) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_task_embeddings_task_id ON task_embeddings(task_id);
CREATE INDEX IF NOT EXISTS idx_task_embeddings_content_type ON task_embeddings(content_type);

-- Create index for vector similarity search using ivfflat
-- This is crucial for performance with large datasets
CREATE INDEX IF NOT EXISTS idx_task_embeddings_embedding ON task_embeddings 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_task_embeddings_updated_at ON task_embeddings;
CREATE TRIGGER update_task_embeddings_updated_at
    BEFORE UPDATE ON task_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE task_embeddings IS 'Stores vector embeddings for task content to enable semantic search';
COMMENT ON COLUMN task_embeddings.embedding IS '384-dimensional vector embedding using pgvector';
COMMENT ON COLUMN task_embeddings.content_type IS 'Type of content: title, description, or comment';
