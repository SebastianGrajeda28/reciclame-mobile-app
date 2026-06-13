-- Public social contracts.

CREATE OR REPLACE FUNCTION "public"."get_friends_with_profile"("p_user_id" "uuid") RETURNS TABLE("friend_id" "uuid", "name" "text", "current_streak" integer, "avatar_base_style" "text", "last_activity_at" timestamp with time zone, "featured_medals" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  -- Paso 1: resolver los IDs de amigos aceptados del usuario dado.
  with my_friends as (
    select
      case when f.requester_id = p_user_id
           then f.addressee_id
           else f.requester_id
      end as friend_id
    from public.friendships f
    where (f.requester_id = p_user_id or f.addressee_id = p_user_id)
      and f.status    = 'accepted'
      and f.is_active = true
  )
  select
    mf.friend_id,
    coalesce(up.alias, split_part(u.email, '@', 1))      as name,
    coalesce(prog.streak_days, 0)                         as current_streak,
    av.base_style                                         as avatar_base_style,
    la.last_activity_at,
    coalesce(med.featured_medals, '[]'::jsonb)            as featured_medals
  from my_friends mf
  -- Usuario base (siempre existe gracias a FK en friendships)
  join public.users u on u.id = mf.friend_id
  -- Perfil (alias / nombre visible)
  left join public.user_profiles up on up.user_id = mf.friend_id
  -- Progreso (racha actual)
  left join public.user_progress prog on prog.user_id = mf.friend_id
  -- Avatar activo (URL del asset base)
  left join public.avatars av on av.user_id = mf.friend_id
  -- Última actividad: max timestamp de registros de reciclaje
  left join lateral (
    select max(rr.created_at) as last_activity_at
    from public.recycling_records rr
    where rr.user_id   = mf.friend_id
      and rr.is_active = true
  ) la on true
  -- Medallas destacadas: array jsonb [{id, name, description, image_url}]
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id',          a.id,
        'name',        a.name,
        'description', a.description,
        'image_url',   r.asset_url
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join  public.achievements a on a.id = t.achievement_id
    left join public.rewards  r on r.id = a.reward_id
    where ufm.user_id = mf.friend_id
  ) med on true
  order by lower(coalesce(up.alias, split_part(u.email, '@', 1)));
end;
$$;

CREATE OR REPLACE FUNCTION "public"."test_get_friends_with_profile_flow"() RETURNS TABLE("friend_found" boolean, "has_name" boolean, "has_streak" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  user_a_id  uuid;
  user_b_id  uuid;
  email_a    text;
  email_b    text;
  result_row record;
  row_count  int := 0;
begin
  -- Generar IDs únicos que no existan en auth.users
  loop
    user_a_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = user_a_id);
  end loop;
  loop
    user_b_id := gen_random_uuid();
    exit when not exists (select 1 from auth.users where id = user_b_id);
  end loop;

  email_a := 'test_friends_a_' || user_a_id || '@test.com';
  email_b := 'test_friends_b_' || user_b_id || '@test.com';

  -- Crear usuarios en auth + trigger crea filas en public.users / user_profiles
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
  values
    (user_a_id, email_a, jsonb_build_object('full_name', 'Usuario A Test'), now(), now()),
    (user_b_id, email_b, jsonb_build_object('full_name', 'Usuario B Test'), now(), now());

  -- Crear alias visible para B
  insert into public.user_profiles (user_id, alias)
  values (user_b_id, 'Amigo Test')
  on conflict (user_id) do update set alias = 'Amigo Test';

  -- Crear progreso con racha para B
  insert into public.user_progress (user_id, streak_days)
  values (user_b_id, 7)
  on conflict (user_id) do update set streak_days = 7;

  -- Crear amistad aceptada entre A y B
  insert into public.friendships (requester_id, addressee_id, status)
  values (user_a_id, user_b_id, 'accepted');

  -- Llamar a la RPC y verificar resultados
  for result_row in
    select * from public.get_friends_with_profile(user_a_id)
  loop
    row_count := row_count + 1;
  end loop;

  -- Limpiar datos de prueba
  delete from public.friendships
    where (requester_id = user_a_id or addressee_id = user_a_id)
       or (requester_id = user_b_id or addressee_id = user_b_id);
  delete from public.user_progress where user_id in (user_a_id, user_b_id);
  delete from auth.users where id in (user_a_id, user_b_id);

  return query select
    (row_count = 1)                as friend_found,
    (result_row.name is not null)  as has_name,
    (result_row.current_streak = 7) as has_streak,
    'test_completed'               as message;
end;
$$;

create or replace function app_social.get_friends_with_profile(p_user_id uuid)
returns table(
  friend_id uuid,
  name text,
  current_streak int,
  avatar_base_style text,
  last_activity_at timestamptz,
  featured_medals jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with my_friends as (
    select
      case when f.requester_id = p_user_id
           then f.addressee_id
           else f.requester_id
      end as friend_id
    from public.friendships f
    where (f.requester_id = p_user_id or f.addressee_id = p_user_id)
      and f.status = 'accepted'
      and f.is_active = true
  )
  select
    mf.friend_id,
    coalesce(up.alias, split_part(u.email, '@', 1)) as name,
    coalesce(prog.streak_days, 0) as current_streak,
    av.base_style as avatar_base_style,
    la.last_activity_at,
    coalesce(med.featured_medals, '[]'::jsonb) as featured_medals
  from my_friends mf
  join public.users u on u.id = mf.friend_id
  left join public.user_profiles up on up.user_id = mf.friend_id
  left join public.user_progress prog on prog.user_id = mf.friend_id
  left join public.avatars av on av.user_id = mf.friend_id
  left join lateral (
    select max(rr.created_at) as last_activity_at
    from public.recycling_records rr
    where rr.user_id = mf.friend_id
      and rr.is_active = true
  ) la on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'description', a.description,
        'image_url', r.asset_url
      ) order by a.name
    ) as featured_medals
    from public.user_featured_medals ufm
    cross join lateral unnest(ufm.achievement_ids) as t(achievement_id)
    join public.achievements a on a.id = t.achievement_id
    left join public.rewards r on r.id = a.reward_id
    where ufm.user_id = mf.friend_id
  ) med on true
  order by lower(coalesce(up.alias, split_part(u.email, '@', 1)));
end;
$$;
