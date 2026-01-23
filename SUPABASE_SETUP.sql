-- Run this in your Supabase SQL Editor to fix the Neural Graph

create table if not exists knowledge_graph (
  id bigserial primary key,
  nodes jsonb default '[]'::jsonb,
  links jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS) but allow public access for this demo
alter table knowledge_graph enable row level security;

create policy "Allow all access" on knowledge_graph
for all using (true) with check (true);

-- Insert an initial empty graph row if none exists
insert into knowledge_graph (nodes, links)
select '[]'::jsonb, '[]'::jsonb
where not exists (select 1 from knowledge_graph);
