create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  problem       text not null,
  design        jsonb,
  evaluation    jsonb,
  band          text,
  overall_score numeric,
  created_at    timestamptz default now()
);
