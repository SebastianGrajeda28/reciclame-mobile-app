-- Stores Expo push tokens per user device.
-- One user can have multiple devices; tokens are upserted by (user_id, token).

create table if not exists public.push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  token       text not null,
  platform    text not null check (platform in ('ios', 'android', 'web')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint push_tokens_user_token_unique unique (user_id, token)
);

create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy "push_tokens_select_own"
  on public.push_tokens for select
  to authenticated
  using (auth.uid() = user_id);

create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  to authenticated
  using (auth.uid() = user_id);

-- service_role needs full access so edge functions can read tokens for all users
grant all on table public.push_tokens to service_role;
