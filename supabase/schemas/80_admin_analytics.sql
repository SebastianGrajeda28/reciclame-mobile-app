-- Administrative metrics and operational configuration.
-- Includes dashboard aggregates, snapshots, health helpers and system config.

CREATE TABLE IF NOT EXISTS "public"."health_check" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."metric_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_name" "text" NOT NULL,
    "metric_value" numeric NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."health_check" OWNER TO "postgres";

ALTER TABLE "public"."metric_snapshots" OWNER TO "postgres";

ALTER TABLE "public"."system_config" OWNER TO "postgres";

ALTER TABLE ONLY "public"."health_check"
    ADD CONSTRAINT "health_check_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."metric_snapshots"
    ADD CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_key_key" UNIQUE ("key");

ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE FUNCTION "app_analytics"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
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
  )
  into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'role required';
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


CREATE OR REPLACE FUNCTION "app_analytics"."get_users_list"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
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

  select jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'name', coalesce(au.raw_user_meta_data ->> 'full_name', u.email),
      'createdAt', u.created_at,
      'updatedAt', u.updated_at,
      'lastLoginAt', u.last_login_at,
      'isActive', u.is_active,
      'roleId', ur.role_id,
      'roleName', r.name
    )
    order by u.created_at desc
  )
  into v_result
  from public.users u
  left join auth.users au on au.id = u.id
  left join public.user_roles ur on ur.user_id = u.id and ur.is_active = true
  left join public.roles r on r.id = ur.role_id and r.is_active = true;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;


CREATE OR REPLACE FUNCTION "app_analytics"."get_universities_list"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
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

  select jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'isActive', u.is_active,
      'createdAt', u.created_at,
      'updatedAt', u.updated_at,
      'campusCount', coalesce(c.campus_count, 0)
    )
    order by u.name asc
  )
  into v_result
  from public.universities u
  left join (
    select university_id, count(*)::int as campus_count
    from public.campuses
    where is_active = true
    group by university_id
  ) c on c.university_id = u.id;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;


CREATE OR REPLACE FUNCTION "app_analytics"."get_university_campuses"("p_university_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  if p_university_id is null then
    raise exception 'p_university_id is required';
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

  select jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'address', c.address,
      'isActive', c.is_active,
      'createdAt', c.created_at,
      'updatedAt', c.updated_at
    )
    order by c.name asc
  )
  into v_result
  from public.campuses c
  where c.university_id = p_university_id;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;


CREATE OR REPLACE FUNCTION "public"."count_public_tables"() RETURNS TABLE("table_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
$$;

CREATE OR REPLACE FUNCTION "public"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_admin_dashboard(p_start, p_end);
$$;

CREATE OR REPLACE FUNCTION "public"."get_users_list"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_users_list();
$$;

CREATE OR REPLACE FUNCTION "public"."get_universities_list"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_universities_list();
$$;

CREATE OR REPLACE FUNCTION "public"."get_university_campuses"("p_university_id" "uuid") RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_university_campuses(p_university_id);
$$;

ALTER TABLE "public"."metric_snapshots" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."system_config" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "app_analytics" TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_users_list"() FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_users_list"() TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_universities_list"() FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_universities_list"() TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_university_campuses"("uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_university_campuses"("uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "anon";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "anon";

GRANT ALL ON FUNCTION "public"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_users_list"() TO "anon";

GRANT ALL ON FUNCTION "public"."get_users_list"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_users_list"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_universities_list"() TO "anon";

GRANT ALL ON FUNCTION "public"."get_universities_list"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_universities_list"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_university_campuses"("uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_university_campuses"("uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_university_campuses"("uuid") TO "service_role";

GRANT ALL ON TABLE "public"."health_check" TO "anon";

GRANT ALL ON TABLE "public"."health_check" TO "authenticated";

GRANT ALL ON TABLE "public"."health_check" TO "service_role";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "anon";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "authenticated";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "service_role";

GRANT ALL ON TABLE "public"."system_config" TO "anon";

GRANT ALL ON TABLE "public"."system_config" TO "authenticated";

GRANT ALL ON TABLE "public"."system_config" TO "service_role";