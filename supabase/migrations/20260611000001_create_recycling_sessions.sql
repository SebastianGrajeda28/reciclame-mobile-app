create table if not exists public.recycling_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,

  outcome text not null
    check (outcome in ('confirmed', 'abandoned', 'failed')),

  furthest_step text not null
    check (furthest_step in ('camera', 'processing', 'manual', 'map', 'instructions', 'success')),

  detection_type text
    check (detection_type in ('auto', 'manual')),

  predicted_waste_type_id uuid references public.waste_types(id) on delete set null,
  final_waste_type_id uuid references public.waste_types(id) on delete set null,
  confidence_score numeric,
  low_confidence boolean generated always as (confidence_score < 0.8) stored,
  waste_type_overridden boolean,

  recycling_point_id uuid references public.recycling_points(id) on delete set null,
  recycling_record_id uuid references public.recycling_records(id) on delete set null,

  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_recycling_sessions_user_id
  on public.recycling_sessions (user_id);

create index if not exists idx_recycling_sessions_outcome
  on public.recycling_sessions (outcome);

create index if not exists idx_recycling_sessions_started_at
  on public.recycling_sessions (started_at);
