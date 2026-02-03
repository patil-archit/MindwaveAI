-- Comprehensive Setup for Mindwave AI
-- Run this in your Supabase SQL Editor.

-- 1. Enable pgvector extension (Required for Memory Vault)
create extension if not exists vector;

-- 2. Create Memories Table (if not exists)
create table if not exists memories (
  id bigserial primary key,
  user_id text not null,
  content text not null,
  embedding vector(768), -- Google Gecko/Check model dimension, usually 768
  created_at timestamptz default now()
);

-- 3. Create Vector Search Function (Critical for Memory Agent)
-- Drop existing function to avoid signature conflicts
drop function if exists match_memories(vector, double precision, int, text);
drop function if exists match_memories(vector, float, int, text);

create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id text
) returns table (
  id bigint,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  and memories.user_id = p_user_id
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 4. Create Knowledge Graph Table
-- 4. Create Knowledge Graph Table (With User Isolation)
drop table if exists knowledge_graph;
create table knowledge_graph (
  id bigserial primary key,
  user_id text not null, -- Added user_id
  nodes jsonb default '[]'::jsonb,
  links jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 5. Seed Knowledge Graph (Empty for now, will be populated per user)
-- No global seed needed anymore

-- 6. Enable Security
alter table memories enable row level security;
alter table knowledge_graph enable row level security;

-- Drop existing policies to prevent "already exists" errors
-- ISOLATION POLICY: Allow ALL access (Backend handles filtering)
drop policy if exists "Allow users to access own graph" on knowledge_graph;
create policy "Allow all access graph" on knowledge_graph for all using (true) with check (true);

drop policy if exists "Allow all access memories" on memories;
create policy "Allow all access memories" on memories for all using (true) with check (true);
    insert into knowledge_graph (nodes, links)
    values (
      '[
        {"id": "Mindwave", "group": "Core"}, 
        {"id": "User", "group": "Person"}, 
        {"id": "Coding", "group": "Skill"}, 
        {"id": "Future", "group": "Goal"},
        {"id": "AI Council", "group": "System"}
      ]'::jsonb,
      '[
        {"source": "User", "target": "Coding", "label": "loves"},
        {"source": "User", "target": "Mindwave", "label": "uses"},
        {"source": "Mindwave", "target": "AI Council", "label": "powered_by"}
      ]'::jsonb
    );
  end if;
end $$;

-- 6. Enable Security
alter table memories enable row level security;
alter table knowledge_graph enable row level security;

create policy "Allow all access memories" on memories for all using (true) with check (true);
create policy "Allow all access graph" on knowledge_graph for all using (true) with check (true);
