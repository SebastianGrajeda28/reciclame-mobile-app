create schema if not exists app_auth;
create schema if not exists app_analytics;
create schema if not exists app_education;
create schema if not exists app_social;

comment on schema app_auth is 'Domain implementation functions for authentication/account contracts.';
comment on schema app_analytics is 'Domain implementation functions for analytics and admin reporting.';
comment on schema app_education is 'Domain implementation functions for educational content contracts.';
comment on schema app_social is 'Domain implementation functions for social/friends contracts.';

create or replace function app_auth.get_current_account()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
  v_role text;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select u.email
  into v_email
  from public.users u
  where u.id = v_uid;

  select coalesce(au.raw_user_meta_data ->> 'full_name', au.email), au.email
  into v_name, v_email
  from auth.users au
  where au.id = v_uid;

  select r.name
  into v_role
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = v_uid
    and ur.is_active = true
    and r.is_active = true
  order by ur.assigned_at desc nulls last, ur.created_at desc nulls last
  limit 1;

  return jsonb_build_object(
    'id', v_uid,
    'email', coalesce(v_email, ''),
    'name', coalesce(v_name, v_email, ''),
    'role', v_role
  );
end;
$$;

revoke all on function app_auth.get_current_account() from public, anon, authenticated;

grant usage on schema app_auth to postgres, service_role;
grant execute on function app_auth.get_current_account() to postgres, service_role;

create or replace function public.get_current_account()
returns jsonb
language sql
security definer
set search_path = public, auth, app_auth
as $$
  select app_auth.get_current_account();
$$;

grant execute on function public.get_current_account() to authenticated;
grant execute on function public.get_current_account() to service_role;

create or replace function app_analytics.get_admin_dashboard(p_start timestamptz, p_end timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
begin
  if p_start is null or p_end is null then
    raise exception 'p_start and p_end are required';
  end if;

  if p_start > p_end then
    raise exception 'p_start must be less than or equal to p_end';
  end if;

  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = v_uid
      and ur.is_active = true
      and r.is_active = true
      and r.name = 'ADMIN'
  )
  into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'admin role required';
  end if;

  with session_scope as (
    select *
    from public.recycling_sessions
    where started_at >= p_start
      and started_at <= p_end
  ),
  record_scope as (
    select *
    from public.recycling_records
    where created_at >= p_start
      and created_at <= p_end
  ),
  kpis as (
    select jsonb_build_object(
      'totalRecyclings', (select count(*)::int from record_scope),
      'totalKg', coalesce((select round(sum(estimated_weight)::numeric / 1000, 1) from record_scope), 0),
      'activeUsersInPeriod', (
        select count(*)::int
        from public.users u
        where u.last_login_at >= p_start
          and u.last_login_at <= p_end
      ),
      'newUsersInPeriod', (
        select count(*)::int
        from public.users u
        where u.created_at >= p_start
          and u.created_at <= p_end
      ),
      'confirmationRate', coalesce((
        select round(
          100.0 * count(*) filter (where outcome = 'confirmed') / nullif(count(*), 0),
          0
        )
        from session_scope
      ), 0)
    ) as data
  ),
  funnel as (
    select jsonb_agg(
      jsonb_build_object('label', label, 'value', value)
      order by sort_order
    ) as data
    from (
      select 1 as sort_order, 'Iniciaron' as label, count(*)::int as value from session_scope
      union all
      select 2, 'Processing', count(*) filter (where furthest_step in ('processing', 'manual', 'map', 'instructions', 'success'))::int from session_scope
      union all
      select 3, 'Mapa', count(*) filter (where furthest_step in ('map', 'instructions', 'success'))::int from session_scope
      union all
      select 4, 'Instrucciones', count(*) filter (where furthest_step in ('instructions', 'success'))::int from session_scope
      union all
      select 5, 'Confirmaron', count(*) filter (where outcome = 'confirmed')::int from session_scope
    ) stages
  ),
  top_residues as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'name', name,
          'confirmed', confirmed
        )
        order by confirmed desc, name asc
      ),
      '[]'::jsonb
    ) as data
    from (
      select
        coalesce(wt.name, 'Desconocido') as name,
        count(*)::int as confirmed
      from public.recycling_records rr
      left join public.waste_types wt on wt.id = rr.waste_type_id
      where rr.created_at >= p_start
        and rr.created_at <= p_end
      group by wt.name
      order by confirmed desc, name asc
      limit 6
    ) rows
  ),
  quality_base as (
    select
      count(*) filter (
        where confidence_score is not null
          and confidence_score >= 0.8
          and coalesce(waste_type_overridden, false) = false
      )::int as high_confidence,
      count(*) filter (
        where confidence_score is not null
          and confidence_score < 0.8
          and coalesce(waste_type_overridden, false) = false
      )::int as low_confidence,
      count(*) filter (
        where coalesce(waste_type_overridden, false) = true
      )::int as overridden
    from session_scope
  ),
  recognition_quality as (
    select jsonb_agg(
      jsonb_build_object(
        'name', name,
        'count', count_value,
        'percentage', case when total = 0 then 0 else round(100.0 * count_value / total) end,
        'color', color
      )
      order by sort_order
    ) as data
    from (
      select 1 as sort_order, 'Alta confianza' as name, high_confidence as count_value, '#22c76f' as color,
             (high_confidence + low_confidence + overridden) as total
      from quality_base
      union all
      select 2, 'Baja confianza', low_confidence, '#f4b740', (high_confidence + low_confidence + overridden)
      from quality_base
      union all
      select 3, 'Corregidos por usuario', overridden, '#0b2f4e', (high_confidence + low_confidence + overridden)
      from quality_base
    ) rows
  ),
  trend as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object('label', label, 'value', value)
        order by period_start
      ),
      '[]'::jsonb
    ) as data
    from (
      select
        date_trunc('week', created_at) as period_start,
        to_char(date_trunc('week', created_at), '"sem. "IW') as label,
        count(*)::int as value
      from public.recycling_records
      where created_at >= p_start
        and created_at <= p_end
      group by date_trunc('week', created_at)
      order by date_trunc('week', created_at)
    ) rows
  ),
  detail_rows as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'residue', residue,
          'scans', scans,
          'confirmed', confirmed,
          'rate', rate,
          'kilograms', kilograms
        )
        order by confirmed desc, scans desc, residue asc
      ),
      '[]'::jsonb
    ) as data
    from (
      with scans as (
        select
          final_waste_type_id as waste_type_id,
          count(*)::int as scans
        from session_scope
        where final_waste_type_id is not null
        group by final_waste_type_id
      ),
      confirmed as (
        select
          waste_type_id,
          count(*)::int as confirmed,
          coalesce(round(sum(estimated_weight)::numeric / 1000, 1), 0) as kilograms
        from record_scope
        group by waste_type_id
      )
      select
        coalesce(wt.name, 'Desconocido') as residue,
        coalesce(scans.scans, 0)::int as scans,
        coalesce(confirmed.confirmed, 0)::int as confirmed,
        case
          when coalesce(scans.scans, 0) = 0 then 0
          else round(100.0 * coalesce(confirmed.confirmed, 0) / scans.scans, 0)
        end as rate,
        coalesce(confirmed.kilograms, 0) as kilograms
      from public.waste_types wt
      left join scans on scans.waste_type_id = wt.id
      left join confirmed on confirmed.waste_type_id = wt.id
      where coalesce(scans.scans, 0) > 0
         or coalesce(confirmed.confirmed, 0) > 0
      order by coalesce(confirmed.confirmed, 0) desc, coalesce(scans.scans, 0) desc, coalesce(wt.name, 'Desconocido') asc
      limit 10
    ) rows
  )
  select jsonb_build_object(
    'filters', jsonb_build_object('start', p_start, 'end', p_end),
    'kpis', kpis.data,
    'funnel', coalesce(funnel.data, '[]'::jsonb),
    'topResidues', top_residues.data,
    'recognitionQuality', coalesce(recognition_quality.data, '[]'::jsonb),
    'trend', trend.data,
    'detailRows', detail_rows.data
  )
  into v_result
  from kpis, funnel, top_residues, recognition_quality, trend, detail_rows;

  return v_result;
end;
$$;

revoke all on function app_analytics.get_admin_dashboard(timestamptz, timestamptz) from public, anon, authenticated;

grant usage on schema app_analytics to postgres, service_role;
grant execute on function app_analytics.get_admin_dashboard(timestamptz, timestamptz) to postgres, service_role;

create or replace function public.get_admin_dashboard(p_start timestamptz, p_end timestamptz)
returns jsonb
language sql
security definer
set search_path = public, auth, app_analytics
as $$
  select app_analytics.get_admin_dashboard(p_start, p_end);
$$;

grant execute on function public.get_admin_dashboard(timestamptz, timestamptz) to authenticated;
grant execute on function public.get_admin_dashboard(timestamptz, timestamptz) to service_role;

create or replace function app_education.get_educational_content_for_sync()
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true
  order by ec.category, ec.display_order, ec.created_at;
end;
$$;

create or replace function app_education.get_educational_content_by_category(p_category text)
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true 
    and ec.category = p_category
  order by ec.display_order, ec.created_at;
end;
$$;

create or replace function app_education.get_educational_categories()
returns table(category text, content_count int)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    ec.category,
    count(*)::int as content_count
  from public.educational_content ec
  where ec.is_active = true
  group by ec.category
  order by ec.category;
end;
$$;

revoke all on function app_education.get_educational_content_for_sync() from public, anon, authenticated;
revoke all on function app_education.get_educational_content_by_category(text) from public, anon, authenticated;
revoke all on function app_education.get_educational_categories() from public, anon, authenticated;

grant usage on schema app_education to postgres, service_role;
grant execute on function app_education.get_educational_content_for_sync() to postgres, service_role;
grant execute on function app_education.get_educational_content_by_category(text) to postgres, service_role;
grant execute on function app_education.get_educational_categories() to postgres, service_role;

create or replace function public.get_educational_content_for_sync()
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
)
language sql
security definer
set search_path = public, app_education
as $$
  select * from app_education.get_educational_content_for_sync();
$$;

create or replace function public.get_educational_content_by_category(p_category text)
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
)
language sql
security definer
set search_path = public, app_education
as $$
  select * from app_education.get_educational_content_by_category(p_category);
$$;

create or replace function public.get_educational_categories()
returns table(category text, content_count int)
language sql
security definer
set search_path = public, app_education
as $$
  select * from app_education.get_educational_categories();
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

revoke all on function app_social.get_friends_with_profile(uuid) from public, anon, authenticated;

grant usage on schema app_social to postgres, service_role;
grant execute on function app_social.get_friends_with_profile(uuid) to postgres, service_role;

create or replace function public.get_friends_with_profile(p_user_id uuid)
returns table(
  friend_id uuid,
  name text,
  current_streak int,
  avatar_base_style text,
  last_activity_at timestamptz,
  featured_medals jsonb
)
language sql
security definer
set search_path = public, app_social
as $$
  select * from app_social.get_friends_with_profile(p_user_id);
$$;