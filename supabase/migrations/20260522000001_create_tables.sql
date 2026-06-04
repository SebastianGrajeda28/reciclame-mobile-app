-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_login_at timestamptz,
  is_active boolean not null default true
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  alias text,
  avatar_id uuid,
  university_id uuid,
  campus_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  notifications_enabled boolean not null default true,
  skip_recycling_instructions boolean not null default false,
  profile_visibility text,
  language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true,
  unique (user_id, role_id)
);

-- ============================================================
-- UNIVERSITIES / LOCATIONS / BINS
-- ============================================================
create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.campuses (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.bin_types (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references public.universities(id) on delete set null,
  name text not null,
  color text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.recycling_points (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references public.campuses(id) on delete cascade,
  name text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.recycling_point_bins (
  id uuid primary key default gen_random_uuid(),
  recycling_point_id uuid not null references public.recycling_points(id) on delete cascade,
  bin_type_id uuid not null references public.bin_types(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (recycling_point_id, bin_type_id)
);

-- ============================================================
-- WASTE / RECORDS
-- ============================================================
create table if not exists public.waste_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.recycling_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recycling_point_id uuid references public.recycling_points(id) on delete set null,
  bin_type_id uuid references public.bin_types(id) on delete set null,
  waste_type_id uuid references public.waste_types(id) on delete set null,
  detection_type text,
  confidence_score numeric,
  estimated_weight numeric,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  synced_at timestamptz,
  is_active boolean not null default true
);

-- ============================================================
-- NEW: MAP (University + WasteType + BinType)
-- ============================================================
create table if not exists public.map_waste_type_bin_types (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  waste_type_id uuid not null references public.waste_types(id) on delete cascade,
  bin_type_id uuid not null references public.bin_types(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true,
  unique (university_id, waste_type_id, bin_type_id)
);

create index if not exists idx_map_waste_bin_university
  on public.map_waste_type_bin_types (university_id);

create index if not exists idx_map_waste_bin_waste_type
  on public.map_waste_type_bin_types (waste_type_id);

create index if not exists idx_map_waste_bin_bin_type
  on public.map_waste_type_bin_types (bin_type_id);

-- ============================================================
-- GAMIFICATION
-- ============================================================
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  points int not null default 0,
  streak_days int not null default 0,
  heat numeric,
  level int not null default 1,
  last_recycling_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  reward_type text,
  asset_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  condition_type text,
  condition_value int,
  reward_id uuid references public.rewards(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true,
  unique (user_id, achievement_id)
);

create table if not exists public.user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  is_equipped boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true,
  unique (user_id, reward_id)
);

create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  base_style text,
  frame_reward_id uuid references public.rewards(id) on delete set null,
  accessory_reward_id uuid references public.rewards(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);

-- ============================================================
-- SOCIAL
-- ============================================================
-- Amistades bilaterales: una sola fila representa la relación
-- entre dos usuarios. 'status' controla el ciclo de vida:
--   pending  -> solicitud enviada, esperando aceptación
--   accepted -> amistad activa y bilateral
--   declined -> solicitud rechazada
--   blocked  -> uno bloqueó al otro
-- requester_id = quien envió la solicitud (vía QR u otro medio)
-- addressee_id = quien la recibe
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  addressee_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'blocked')),
  -- Par canónico (menor, mayor) para detectar duplicados invertidos.
  user_low uuid generated always as (least(requester_id, addressee_id)) stored,
  user_high uuid generated always as (greatest(requester_id, addressee_id)) stored,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true,
  check (requester_id <> addressee_id)
);
 
-- Unicidad bilateral: una sola relación por par de usuarios,
-- sin importar quién envió la solicitud (A->B y B->A colisionan).
create unique index if not exists uq_friendships_pair
  on public.friendships (user_low, user_high);
 
-- Búsquedas frecuentes: "mis amigos / mis solicitudes".
create index if not exists idx_friendships_requester
  on public.friendships (requester_id);
 
create index if not exists idx_friendships_addressee
  on public.friendships (addressee_id);
 
create index if not exists idx_friendships_status
  on public.friendships (status);
 
-- Códigos / tokens QR para agregar amigos. Cada usuario tiene un
-- 'code' (lo que se codifica en el QR). Al escanear el QR de otro
-- usuario se crea una fila en friendships (requester = quien escanea).
create table if not exists public.friend_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  code text not null unique,
  expires_at timestamptz,            -- null = permanente; usar para QR temporales
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
 
create index if not exists idx_friend_codes_code
  on public.friend_codes (code);

-- ============================================================
-- CONTENT
-- ============================================================
create table if not exists public.instructions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  image_url text,
  waste_type_id uuid references public.waste_types(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.instruction_steps (
  id uuid primary key default gen_random_uuid(),
  instruction_id uuid not null references public.instructions(id) on delete cascade,
  text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.fun_facts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  waste_type_id uuid references public.waste_types(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.system_config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value numeric not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);

-- ============================================================
-- OFFLINE SYNC
-- ============================================================
create table if not exists public.pending_operations (
  local_id text primary key,
  user_id uuid references public.users(id) on delete set null, -- UML: User generates PendingOperation
  operation_type text not null,
  payload_json text,
  status text not null,
  retry_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_error text,
  is_active boolean not null default true
);

create table if not exists public.cached_resources (
  resource_name text primary key,
  last_synced_at timestamptz,
  version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_active boolean not null default true
);
