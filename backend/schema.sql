-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table to store long-term memories
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  content text not null,
  -- 768 is the dimension for Gemini Text Embedding 004
  embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to search for memories
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id text
)
returns table (
  id uuid,
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
