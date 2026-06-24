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


CREATE OR REPLACE FUNCTION "app_analytics"."get_users_list"(
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_role_filter text DEFAULT 'all',
  p_search text DEFAULT NULL,
  p_sort_by text DEFAULT 'createdAt',
  p_sort_dir text DEFAULT 'desc'
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
  v_total int;
  v_sort_column text;
  v_sort_dir text;
  v_query text;
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

  v_sort_column := case p_sort_by
    when 'email' then 'u.email'
    when 'lastLoginAt' then 'u.last_login_at'
    when 'updatedAt' then 'ur.updated_at'
    when 'createdAt' then 'u.created_at'
    else 'u.created_at'
  end;

  v_sort_dir := case lower(coalesce(p_sort_dir, 'desc'))
    when 'asc' then 'asc'
    else 'desc'
  end;

  select count(*)::int
  into v_total
  from public.users u
  join public.user_roles ur on ur.user_id = u.id and ur.is_active = true
  join public.roles r on r.id = ur.role_id and r.is_active = true
  where (p_is_active is null or u.is_active = p_is_active)
    and (
      p_role_filter is null or p_role_filter = 'all'
      or (p_role_filter = 'admin' and r.name = 'ADMIN')
      or (p_role_filter = 'manager' and r.name = 'MANAGER')
    )
    and (
      p_search is null or length(trim(p_search)) = 0
      or u.email ilike '%' || p_search || '%'
    );

  v_query := format(
    $f$
      select jsonb_build_object(
        'total', %L::int,
        'items', coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', sub.id,
              'email', sub.email,
              'name', sub.name,
              'createdAt', sub.created_at,
              'updatedAt', sub.updated_at,
              'lastLoginAt', sub.last_login_at,
              'isActive', sub.is_active,
              'roleId', sub.role_id,
              'roleName', sub.role_name,
              'userRoleAssignmentId', sub.user_role_assignment_id
            )
            order by sub.sort_key %s
          ),
          '[]'::jsonb
        )
      )
      from (
        select
          u.id,
          u.email,
          coalesce(au.raw_user_meta_data ->> 'full_name', u.email) as name,
          u.created_at,
          ur.updated_at,
          u.last_login_at,
          u.is_active,
          ur.role_id,
          r.name as role_name,
          ur.id as user_role_assignment_id,
          %s as sort_key
        from public.users u
        join public.user_roles ur on ur.user_id = u.id and ur.is_active = true
        join public.roles r on r.id = ur.role_id and r.is_active = true
        left join auth.users au on au.id = u.id
        where ($1 is null or u.is_active = $1)
          and (
            $2 is null or $2 = 'all'
            or ($2 = 'admin' and r.name = 'ADMIN')
            or ($2 = 'manager' and r.name = 'MANAGER')
          )
          and (
            $3 is null or length(trim($3)) = 0
            or u.email ilike '%%' || $3 || '%%'
          )
        order by %s %s
        limit $4
        offset $5
      ) sub
    $f$,
    v_total, v_sort_dir, v_sort_column, v_sort_column, v_sort_dir
  );

  execute v_query
  into v_result
  using p_is_active, p_role_filter, p_search, p_limit, p_offset;

  return v_result;
end;
$$;


CREATE OR REPLACE FUNCTION "app_analytics"."get_universities_list"(
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_sort_by text DEFAULT 'createdAt',
  p_sort_dir text DEFAULT 'desc'
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
  v_total int;
  v_sort_column text;
  v_sort_dir text;
  v_query text;
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

  v_sort_column := case p_sort_by
    when 'name' then 'u.name'
    when 'isActive' then 'u.is_active'
    when 'campusCount' then 'coalesce(campus_agg.campus_count, 0)'
    when 'recyclingPointCount' then 'coalesce(point_agg.point_count, 0)'
    when 'lastModifiedAt' then 'coalesce(campus_agg.last_campus_modified, u.created_at)'
    when 'createdAt' then 'u.created_at'
    else 'u.created_at'
  end;

  v_sort_dir := case lower(coalesce(p_sort_dir, 'desc'))
    when 'asc' then 'asc'
    else 'desc'
  end;

  select count(*)::int
  into v_total
  from public.universities u
  where (p_is_active is null or u.is_active = p_is_active)
    and (
      p_search is null or length(trim(p_search)) = 0
      or u.name ilike '%' || p_search || '%'
    );

  v_query := format(
    $f$
      select jsonb_build_object(
        'total', %L::int,
        'items', coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', sub.id,
              'name', sub.name,
              'isActive', sub.is_active,
              'campusCount', sub.campus_count,
              'recyclingPointCount', sub.point_count,
              'lastModifiedAt', sub.last_modified,
              'createdAt', sub.created_at
            )
            order by sub.sort_key %s
          ),
          '[]'::jsonb
        )
      )
      from (
        select
          u.id,
          u.name,
          u.is_active,
          u.created_at,
          coalesce(campus_agg.campus_count, 0) as campus_count,
          coalesce(point_agg.point_count, 0) as point_count,
          coalesce(campus_agg.last_campus_modified, u.created_at) as last_modified,
          %s as sort_key
        from public.universities u
        left join (
          select
            university_id,
            count(*) filter (where is_active)::int as campus_count,
            max(coalesce(updated_at, created_at)) as last_campus_modified
          from public.campuses
          group by university_id
        ) campus_agg on campus_agg.university_id = u.id
        left join (
          select
            c.university_id,
            count(rp.id) filter (where rp.is_active)::int as point_count
          from public.campuses c
          join public.recycling_points rp on rp.campus_id = c.id
          group by c.university_id
        ) point_agg on point_agg.university_id = u.id
        where ($1 is null or u.is_active = $1)
          and (
            $2 is null or length(trim($2)) = 0
            or u.name ilike '%%' || $2 || '%%'
          )
        order by %s %s
        limit $3
        offset $4
      ) sub
    $f$,
    v_total, v_sort_dir, v_sort_column, v_sort_column, v_sort_dir
  );

  execute v_query
  into v_result
  using p_is_active, p_search, p_limit, p_offset;

  return v_result;
end;
$$;


CREATE OR REPLACE FUNCTION "app_analytics"."get_university_campuses"(
  p_university_id uuid,
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_sort_by text DEFAULT 'name',
  p_sort_dir text DEFAULT 'asc'
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
  v_total int;
  v_sort_column text;
  v_sort_dir text;
  v_query text;
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

  v_sort_column := case p_sort_by
    when 'name' then 'c.name'
    when 'isActive' then 'c.is_active'
    when 'recyclingPointCount' then 'coalesce(point_agg.point_count, 0)'
    when 'createdAt' then 'c.created_at'
    else 'c.name'
  end;

  v_sort_dir := case lower(coalesce(p_sort_dir, 'asc'))
    when 'desc' then 'desc'
    else 'asc'
  end;

  select count(*)::int
  into v_total
  from public.campuses c
  where c.university_id = p_university_id
    and (p_is_active is null or c.is_active = p_is_active)
    and (
      p_search is null or length(trim(p_search)) = 0
      or c.name ilike '%' || p_search || '%'
    );

  v_query := format(
    $f$
      select jsonb_build_object(
        'total', %L::int,
        'items', coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', sub.id,
              'name', sub.name,
              'address', sub.address,
              'isActive', sub.is_active,
              'recyclingPointCount', sub.point_count,
              'createdAt', sub.created_at
            )
            order by sub.sort_key %s
          ),
          '[]'::jsonb
        )
      )
      from (
        select
          c.id,
          c.name,
          c.address,
          c.is_active,
          c.created_at,
          coalesce(point_agg.point_count, 0) as point_count,
          %s as sort_key
        from public.campuses c
        left join (
          select
            campus_id,
            count(*) filter (where is_active)::int as point_count
          from public.recycling_points
          group by campus_id
        ) point_agg on point_agg.campus_id = c.id
        where c.university_id = $1
          and ($2 is null or c.is_active = $2)
          and (
            $3 is null or length(trim($3)) = 0
            or c.name ilike '%%' || $3 || '%%'
          )
        order by %s %s
        limit $4
        offset $5
      ) sub
    $f$,
    v_total, v_sort_dir, v_sort_column, v_sort_column, v_sort_dir
  );

  execute v_query
  into v_result
  using p_university_id, p_is_active, p_search, p_limit, p_offset;

  return v_result;
end;
$$;


CREATE OR REPLACE FUNCTION "app_analytics"."create_university"(
  p_name text
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_university_id uuid;
  v_created_at timestamptz;
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

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'university name is required';
  end if;

  insert into public.universities (name)
  values (trim(p_name))
  returning id, created_at into v_university_id, v_created_at;

  return jsonb_build_object(
    'id', v_university_id,
    'name', trim(p_name),
    'isActive', true,
    'createdAt', v_created_at
  );
end;
$$;


CREATE OR REPLACE FUNCTION "app_analytics"."create_university_campuses"(
  p_university_id uuid,
  p_campuses jsonb
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_university_exists boolean;
  v_campus jsonb;
  v_campus_name text;
  v_campus_address text;
  v_campus_id uuid;
  v_campuses_result jsonb := '[]'::jsonb;
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

  if p_university_id is null then
    raise exception 'p_university_id is required';
  end if;

  select exists (select 1 from public.universities u where u.id = p_university_id)
  into v_university_exists;

  if not v_university_exists then
    raise exception 'university not found';
  end if;

  if p_campuses is null or jsonb_typeof(p_campuses) <> 'array' or jsonb_array_length(p_campuses) = 0 then
    raise exception 'at least one campus is required';
  end if;

  for v_campus in select * from jsonb_array_elements(p_campuses)
  loop
    v_campus_name := v_campus->>'name';
    v_campus_address := v_campus->>'address';

    if v_campus_name is null or length(trim(v_campus_name)) = 0 then
      raise exception 'campus name is required for every campus';
    end if;

    insert into public.campuses (university_id, name, address)
    values (p_university_id, trim(v_campus_name), v_campus_address)
    returning id into v_campus_id;

    v_campuses_result := v_campuses_result || jsonb_build_object(
      'id', v_campus_id,
      'name', v_campus_name,
      'address', v_campus_address
    );
  end loop;

  return jsonb_build_object(
    'universityId', p_university_id,
    'campuses', v_campuses_result
  );
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

CREATE OR REPLACE FUNCTION "public"."get_users_list"(
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_role_filter text DEFAULT 'all',
  p_search text DEFAULT NULL,
  p_sort_by text DEFAULT 'createdAt',
  p_sort_dir text DEFAULT 'desc'
) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_users_list(
    p_limit, p_offset, p_is_active, p_role_filter, p_search, p_sort_by, p_sort_dir
  );
$$;

CREATE OR REPLACE FUNCTION "public"."get_universities_list"(
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_sort_by text DEFAULT 'createdAt',
  p_sort_dir text DEFAULT 'desc'
) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_universities_list(
    p_limit, p_offset, p_is_active, p_search, p_sort_by, p_sort_dir
  );
$$;

CREATE OR REPLACE FUNCTION "public"."get_university_campuses"(
  p_university_id uuid,
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_sort_by text DEFAULT 'name',
  p_sort_dir text DEFAULT 'asc'
) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_university_campuses(
    p_university_id, p_limit, p_offset, p_is_active, p_search, p_sort_by, p_sort_dir
  );
$$;

CREATE OR REPLACE FUNCTION "public"."create_university"(
  p_name text
) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.create_university(p_name);
$$;

CREATE OR REPLACE FUNCTION "public"."create_university_campuses"(
  p_university_id uuid,
  p_campuses jsonb
) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.create_university_campuses(p_university_id, p_campuses);
$$;

ALTER TABLE "public"."metric_snapshots" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."system_config" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "app_analytics" TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_users_list"(int, int, boolean, text, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_users_list"(int, int, boolean, text, text, text, text) TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_universities_list"(int, int, boolean, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_universities_list"(int, int, boolean, text, text, text) TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."get_university_campuses"(uuid, int, int, boolean, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."create_university"(text) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."create_university"(text) TO "service_role";

REVOKE ALL ON FUNCTION "app_analytics"."create_university_campuses"(uuid, jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION "app_analytics"."create_university_campuses"(uuid, jsonb) TO "service_role";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "anon";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "anon";

GRANT ALL ON FUNCTION "public"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_admin_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_users_list"(int, int, boolean, text, text, text, text) TO "anon";

GRANT ALL ON FUNCTION "public"."get_users_list"(int, int, boolean, text, text, text, text) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_users_list"(int, int, boolean, text, text, text, text) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_universities_list"(int, int, boolean, text, text, text) TO "anon";

GRANT ALL ON FUNCTION "public"."get_universities_list"(int, int, boolean, text, text, text) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_universities_list"(int, int, boolean, text, text, text) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO "anon";

GRANT ALL ON FUNCTION "public"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_university"(text) TO "anon";

GRANT ALL ON FUNCTION "public"."create_university"(text) TO "authenticated";

GRANT ALL ON FUNCTION "public"."create_university"(text) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_university_campuses"(uuid, jsonb) TO "anon";

GRANT ALL ON FUNCTION "public"."create_university_campuses"(uuid, jsonb) TO "authenticated";

GRANT ALL ON FUNCTION "public"."create_university_campuses"(uuid, jsonb) TO "service_role";

GRANT ALL ON TABLE "public"."health_check" TO "anon";

GRANT ALL ON TABLE "public"."health_check" TO "authenticated";

GRANT ALL ON TABLE "public"."health_check" TO "service_role";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "anon";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "authenticated";

GRANT ALL ON TABLE "public"."metric_snapshots" TO "service_role";

GRANT ALL ON TABLE "public"."system_config" TO "anon";

GRANT ALL ON TABLE "public"."system_config" TO "authenticated";

GRANT ALL ON TABLE "public"."system_config" TO "service_role";