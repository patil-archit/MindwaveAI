import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(url, key)

# SQL to setup the database
SQL_SETUP = """
-- 1. Enable Vector Extension
create extension if not exists vector;

-- 2. Create Memories Table
create table if not exists memories (
  id bigserial primary key,
  user_id text not null,
  content text not null,
  embedding vector(768),
  created_at timestamptz default now()
);

-- 3. Create Graph Nodes Table
create table if not exists graph_nodes (
  id text primary key,
  label text,
  "group" text,
  user_id text
);

-- 4. Create Graph Edges Table
create table if not exists graph_edges (
  id bigserial primary key,
  source text references graph_nodes(id),
  target text references graph_nodes(id),
  label text,
  user_id text
);

-- 5. Create Vector Search Function (RPC)
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  uid text
)
returns table (
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
  and memories.user_id = uid
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
"""

def setup_db():
    print("🛠️ Setting up Supabase Database...")
    try:
        # Supabase-py doesn't support raw SQL execution easily via postgrest client usually,
        # but modern sdk might. If not, we might need requests or verify if 'rpc' can call generic sql? 
        # Actually, we can't run DDL (Create Table) via the standard JS/Python client easily unless we use the Postgres connection string.
        # However, for this environment, let's try to assume the user might have to run this in their dashboard 
        # OR we can try to use a special RPC if one exists? No.
        
        # WAIT. The user has access to the dashboard. 
        # But wait, looking at my tools... I don't have a direct SQL tool.
        # I will output this SQL clearly for the user to run, BUT I will try to see if I can run it via a workaround?
        # No, let's just create a Plan/Instruction for it.
        
        # Actually, let's check if we can run it via the `supabase_client.py` logic? 
        # No, `supabase-py` interacts with the REST API. You can't run `CREATE TABLE` via REST API unless you have a specific stored procedure for it.
        
        print("\n⚠️  AUTOMATED MIGRATION NOT POSSIBLE VIA REST API ⚠️")
        print("Please run the following SQL in your Supabase SQL Editor:\n")
        print(SQL_SETUP)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_db()
