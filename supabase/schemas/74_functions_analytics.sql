-- Public analytics contracts.

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

create or replace function public.get_admin_dashboard(p_start timestamptz, p_end timestamptz)
returns jsonb
language sql
security definer
set search_path = public, auth, app_analytics
as $$
  select app_analytics.get_admin_dashboard(p_start, p_end);
$$;
