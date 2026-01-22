-- Run this SQL in your Supabase SQL Editor to create the required tables

-- 1. User Risk Table
CREATE TABLE IF NOT EXISTS user_risk (
    user_id TEXT PRIMARY KEY,
    email TEXT,
    risk_score INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Knowledge Graph Table
CREATE TABLE IF NOT EXISTS knowledge_graph (
    id SERIAL PRIMARY KEY,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    links JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial empty graph if none exists
INSERT INTO knowledge_graph (nodes, links)
SELECT '[]'::jsonb, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM knowledge_graph LIMIT 1);

-- 3. Enable Row Level Security (Optional but recommended)
ALTER TABLE user_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph ENABLE ROW LEVEL SECURITY;

-- 4. Create policies to allow service role access
CREATE POLICY "Allow service role full access to user_risk"
ON user_risk FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to knowledge_graph"
ON knowledge_graph FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
