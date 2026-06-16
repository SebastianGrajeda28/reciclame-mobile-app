\set ON_ERROR_STOP on

-- Streak lifecycle tests (#175 / #176 / #177).
-- Cubre: extensión de racha y delta (confirm_segregation), subida de nivel, expiración con
-- reset "a cero conserva nivel" (get_progress_with_decay), y que el nivel nunca baja.
--
-- Run: psql "$DATABASE_URL" -f supabase/tests/streak_lifecycle.sql
-- Requires: supabase start + migraciones + seeds (waste_types / bin_types / recycling_points).

begin;

insert into auth.users (id, email, created_at, updated_at)
values ('cccccccc-0000-0000-0000-000000000001'::uuid, 'streak@test.local', now(), now())
on conflict (id) do nothing;

insert into public.users (id, email)
values ('cccccccc-0000-0000-0000-000000000001'::uuid, 'streak@test.local')
on conflict (id) do nothing;

delete from public.user_progress where user_id = 'cccccccc-0000-0000-0000-000000000001';

-- IDs sembrados por las migraciones de seed.
-- waste: Plásticos PET · bin: Contenedor de plásticos · point: Biblioteca Central.

-- 1) Primera segregación del día: crea progreso y extiende la racha.
-- 2) Segunda del mismo día: no extiende (already_recycled_today).
do $$
declare
  v_user  uuid := 'cccccccc-0000-0000-0000-000000000001';
  v_waste uuid := '11111111-1111-1111-1111-000000000002';
  v_bin   uuid := '33333333-3333-3333-3333-000000000001';
  v_point uuid := '22222222-2222-2222-2222-000000000001';
  r record;
begin
  select * into r from public.confirm_segregation(v_user, v_waste, v_bin, v_point, 'auto', 0.9);
  if not r.streak_extended_today then raise exception 'TEST1: esperaba streak_extended_today=true'; end if;
  if r.streak_days <> 1 then raise exception 'TEST1: esperaba streak_days=1, obtuve %', r.streak_days; end if;

  select * into r from public.confirm_segregation(v_user, v_waste, v_bin, v_point, 'auto', 0.9);
  if r.streak_extended_today then raise exception 'TEST2: esperaba streak_extended_today=false en 2a del día'; end if;
  if not r.already_recycled_today then raise exception 'TEST2: esperaba already_recycled_today=true'; end if;
  if r.streak_days <> 1 then raise exception 'TEST2: la racha no debe cambiar en la 2a del día'; end if;
end $$;

-- 3) Subida de nivel: 8 → 9 días cruza al nivel 3.
update public.user_progress
set streak_days = 8, level = 2, heat = 60, last_recycling_date = public.app_today() - 1
where user_id = 'cccccccc-0000-0000-0000-000000000001';

do $$
declare r record;
begin
  select * into r from public.confirm_segregation(
    'cccccccc-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-000000000002',
    '33333333-3333-3333-3333-000000000001',
    '22222222-2222-2222-2222-000000000001', 'auto', 0.9);
  if r.streak_days <> 9 then raise exception 'TEST3: esperaba 9 días, obtuve %', r.streak_days; end if;
  if r.level <> 3 then raise exception 'TEST3: esperaba nivel 3, obtuve %', r.level; end if;
  if not r.leveled_up then raise exception 'TEST3: esperaba leveled_up=true'; end if;
end $$;

-- 4) Expiración: calor insuficiente para los días perdidos → reset a 0, conserva nivel.
update public.user_progress
set streak_days = 9, level = 3, heat = 20,
    last_recycling_date = public.app_today() - 5,
    updated_at = now() - interval '2 days'
where user_id = 'cccccccc-0000-0000-0000-000000000001';

do $$
declare r record;
begin
  select * into r from public.get_progress_with_decay('cccccccc-0000-0000-0000-000000000001');
  if r.streak_days <> 0 then raise exception 'TEST4: esperaba streak=0 tras expirar, obtuve %', r.streak_days; end if;
  if r.level <> 3 then raise exception 'TEST4: el nivel debe conservarse en 3, obtuve %', r.level; end if;
  if not r.streak_just_expired then raise exception 'TEST4: esperaba streak_just_expired=true'; end if;
end $$;

-- 5) Tras el reset, una segregación NO baja el nivel (piso GREATEST).
do $$
declare r record;
begin
  select * into r from public.confirm_segregation(
    'cccccccc-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-000000000002',
    '33333333-3333-3333-3333-000000000001',
    '22222222-2222-2222-2222-000000000001', 'auto', 0.9);
  if r.streak_days <> 1 then raise exception 'TEST5: esperaba streak=1, obtuve %', r.streak_days; end if;
  if r.level < 3 then raise exception 'TEST5: el nivel no debe bajar de 3, obtuve %', r.level; end if;
end $$;

rollback;

\echo 'streak_lifecycle: OK'
