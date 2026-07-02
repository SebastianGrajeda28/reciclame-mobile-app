-- =============================================================================
-- 80_admin_analytics.sql
-- Administrative analytics, control panel, employees, universities, campuses.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- SECTION 1 — Support tables
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "public"."health_check" (
    "id"         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()             NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."metric_snapshots" (
    "id"           uuid                     DEFAULT gen_random_uuid() NOT NULL,
    "metric_name"  text                     NOT NULL,
    "metric_value" numeric                  NOT NULL,
    "period_start" date                     NOT NULL,
    "period_end"   date                     NOT NULL,
    "created_at"   timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at"   timestamp with time zone,
    "is_active"    boolean                  DEFAULT true              NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "id"         uuid                     DEFAULT gen_random_uuid() NOT NULL,
    "key"        text                     NOT NULL,
    "value"      text,
    "is_active"  boolean                  DEFAULT true              NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()             NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."health_check"      OWNER TO "postgres";
ALTER TABLE "public"."metric_snapshots"  OWNER TO "postgres";
ALTER TABLE "public"."system_config"     OWNER TO "postgres";

ALTER TABLE ONLY "public"."health_check"
    ADD CONSTRAINT "health_check_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."metric_snapshots"
    ADD CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_key_key" UNIQUE ("key");

ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."metric_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."system_config"    ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- SECTION 2 — Auth: get_current_account
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "app_auth"."get_current_account"()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid       uuid := auth.uid();
  v_email     text;
  v_name      text;
  v_role      text;
  v_is_active boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT u.email, u.is_active
  INTO v_email, v_is_active
  FROM public.users u
  WHERE u.id = v_uid;

  SELECT COALESCE(au.raw_user_meta_data ->> 'full_name', au.email), au.email
  INTO v_name, v_email
  FROM auth.users au
  WHERE au.id = v_uid;

  SELECT r.name
  INTO v_role
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id  = v_uid
    AND ur.is_active = true
    AND r.is_active  = true
  ORDER BY ur.assigned_at DESC NULLS LAST, ur.created_at DESC NULLS LAST
  LIMIT 1;

  RETURN jsonb_build_object(
    'id',       v_uid,
    'email',    COALESCE(v_email, ''),
    'name',     COALESCE(v_name, v_email, ''),
    'role',     v_role,
    'isActive', v_is_active
  );
END;
$$;


-- -----------------------------------------------------------------------------
-- SECTION 3 — Control panel
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."get_control_panel"();
DROP FUNCTION IF EXISTS "public"."get_control_panel"();

CREATE OR REPLACE FUNCTION "app_analytics"."get_control_panel"()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid      uuid    := auth.uid();
  v_is_admin boolean;
  v_result   jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id  = v_uid
      AND ur.is_active = true
      AND r.is_active  = true
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'role required';
  END IF;

  WITH kpis AS (
    SELECT jsonb_build_object(
      'activeUniversities', (
        SELECT COUNT(*)::int FROM public.universities WHERE is_active = true
      ),
      'activeCampuses', (
        SELECT COUNT(*)::int FROM public.campuses WHERE is_active = true
      ),
      'activeEmployees', (
        SELECT COUNT(DISTINCT ur.user_id)::int
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.is_active = true
          AND r.is_active  = true
          AND UPPER(r.name) IN ('ADMIN', 'MANAGER')
      ),
      'registeredUsers', (
        SELECT COUNT(*)::int
        FROM public.users u
        WHERE u.is_active = true
          AND NOT EXISTS (
            SELECT 1
            FROM public.user_roles ur2
            JOIN public.roles r2 ON r2.id = ur2.role_id
            WHERE ur2.user_id  = u.id
              AND ur2.is_active = true
              AND r2.is_active  = true
              AND UPPER(r2.name) IN ('ADMIN', 'MANAGER')
          )
      )
    ) AS data
  ),

  recent_universities AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id',             id,
          'name',           name,
          'isActive',       is_active,
          'lastModifiedAt', COALESCE(updated_at, created_at)
        )
        ORDER BY COALESCE(updated_at, created_at) DESC
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT id, name, is_active, updated_at, created_at
      FROM public.universities
      ORDER BY COALESCE(updated_at, created_at) DESC
      LIMIT 5
    ) rows
  ),

  recent_campuses AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id',             c.id,
          'name',           c.name,
          'universityName', u.name,
          'isActive',       c.is_active,
          'lastModifiedAt', COALESCE(c.updated_at, c.created_at)
        )
        ORDER BY COALESCE(c.updated_at, c.created_at) DESC
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT c.id, c.name, c.university_id, c.is_active, c.updated_at, c.created_at
      FROM public.campuses c
      ORDER BY COALESCE(c.updated_at, c.created_at) DESC
      LIMIT 5
    ) c
    JOIN public.universities u ON u.id = c.university_id
  ),

  recent_employees AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id',             emp.user_role_id,
          'email',          emp.email,
          'roleName',       emp.role_name,
          'isActive',       emp.ur_is_active,
          'lastModifiedAt', emp.last_modified_at
        )
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT
        ur.id                                  AS user_role_id,
        u.email,
        r.name                                 AS role_name,
        ur.is_active                           AS ur_is_active,
        COALESCE(ur.updated_at, ur.created_at) AS last_modified_at
      FROM public.user_roles ur
      JOIN public.users u ON u.id = ur.user_id
      JOIN public.roles r ON r.id = ur.role_id
      WHERE r.is_active = true
        AND UPPER(r.name) IN ('ADMIN', 'MANAGER')
      ORDER BY COALESCE(ur.updated_at, ur.created_at) DESC
      LIMIT 5
    ) emp
  )

  SELECT jsonb_build_object(
    'kpis', kpis.data,
    'recentActivityByType', jsonb_build_object(
      'university', recent_universities.data,
      'campus',     recent_campuses.data,
      'employee',   recent_employees.data
    )
  )
  INTO v_result
  FROM kpis, recent_universities, recent_campuses, recent_employees;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_control_panel"()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.get_control_panel();
$$;

REVOKE ALL ON FUNCTION "app_analytics"."get_control_panel"() FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."get_control_panel"() TO service_role;

GRANT ALL ON FUNCTION "public"."get_control_panel"() TO anon;
GRANT ALL ON FUNCTION "public"."get_control_panel"() TO authenticated;
GRANT ALL ON FUNCTION "public"."get_control_panel"() TO service_role;


-- -----------------------------------------------------------------------------
-- SECTION 4 — Admin dashboard
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."get_manager_dashboard"(timestamp with time zone, timestamp with time zone, uuid);
DROP FUNCTION IF EXISTS "public"."get_manager_dashboard"(timestamp with time zone, timestamp with time zone, uuid);

CREATE OR REPLACE FUNCTION "app_analytics"."get_manager_dashboard"(
  "p_start" timestamp with time zone,
  "p_end" timestamp with time zone,
  "p_university_id" uuid DEFAULT NULL
) RETURNS "jsonb"
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
    select rs.*
    from public.recycling_sessions rs
    left join public.recycling_points rp on rp.id = rs.recycling_point_id
    left join public.campuses c on c.id = rp.campus_id
    where rs.started_at >= p_start
      and rs.started_at <= p_end
      and (p_university_id is null or c.university_id = p_university_id)
  ),
  record_scope as (
    select rr.*
    from public.recycling_records rr
    left join public.recycling_points rp on rp.id = rr.recycling_point_id
    left join public.campuses c on c.id = rp.campus_id
    where rr.created_at >= p_start
      and rr.created_at <= p_end
      and (p_university_id is null or c.university_id = p_university_id)
  ),
  kpis as (
    select jsonb_build_object(
      'totalRecyclings', (select count(*)::int from record_scope),
      'totalKg', coalesce((select round(sum(estimated_weight)::numeric / 1000, 1) from record_scope), 0),
      'activeUsersInPeriod', (
        select count(*)::int
        from public.users u
        left join public.user_profiles up on up.user_id = u.id
        where u.last_login_at >= p_start
          and u.last_login_at <= p_end
          and (p_university_id is null or up.university_id = p_university_id)
      ),
      'newUsersInPeriod', (
        select count(*)::int
        from public.users u
        left join public.user_profiles up on up.user_id = u.id
        where u.created_at >= p_start
          and u.created_at <= p_end
          and (p_university_id is null or up.university_id = p_university_id)
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
        jsonb_build_object('name', name, 'confirmed', confirmed)
        order by confirmed desc, name asc
      ),
      '[]'::jsonb
    ) as data
    from (
      select
        coalesce(wt.name, 'Desconocido') as name,
        count(*)::int as confirmed
      from record_scope rr
      left join public.waste_types wt on wt.id = rr.waste_type_id
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
      from record_scope
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
    'filters', jsonb_build_object('start', p_start, 'end', p_end, 'universityId', p_university_id),
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

ALTER FUNCTION "app_analytics"."get_manager_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone, "p_university_id" uuid) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_manager_dashboard"(
  "p_start" timestamp with time zone,
  "p_end" timestamp with time zone,
  "p_university_id" uuid DEFAULT NULL
) RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'app_analytics'
    AS $$
  select app_analytics.get_manager_dashboard(p_start, p_end, p_university_id);
$$;

ALTER FUNCTION "public"."get_manager_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone, "p_university_id" uuid) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "app_analytics"."get_manager_dashboard"(timestamp with time zone, timestamp with time zone, uuid) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."get_manager_dashboard"(timestamp with time zone, timestamp with time zone, uuid) TO service_role;
GRANT ALL ON FUNCTION "public"."get_manager_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone, "p_university_id" uuid) TO "anon";
GRANT ALL ON FUNCTION "public"."get_manager_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone, "p_university_id" uuid) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_manager_dashboard"("p_start" timestamp with time zone, "p_end" timestamp with time zone, "p_university_id" uuid) TO "service_role";



-- -----------------------------------------------------------------------------
-- SECTION 5 — Employees: list, update, set role, revoke, restore
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."get_employees_list"(int, int, boolean, text, text, text, text);
DROP FUNCTION IF EXISTS "public"."get_employees_list"(int, int, boolean, text, text, text, text);

CREATE OR REPLACE FUNCTION "app_analytics"."get_employees_list"(
  p_limit       int     DEFAULT 10,
  p_offset      int     DEFAULT 0,
  p_is_active   boolean DEFAULT NULL,
  p_role_filter text    DEFAULT 'all',
  p_search      text    DEFAULT NULL,
  p_sort_by     text    DEFAULT 'createdAt',
  p_sort_dir    text    DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid         uuid := auth.uid();
  v_is_admin    boolean;
  v_result      jsonb;
  v_total       int;
  v_sort_column text;
  v_sort_dir    text;
  v_query       text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id  = v_uid
      AND ur.is_active = true
      AND r.is_active  = true
      AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'admin role required';
  END IF;

  v_sort_column := CASE p_sort_by
    WHEN 'email'       THEN 'u.email'
    WHEN 'lastLoginAt' THEN 'u.last_login_at'
    WHEN 'createdAt'   THEN 'u.created_at'
    ELSE 'u.created_at'
  END;

  v_sort_dir := CASE LOWER(COALESCE(p_sort_dir, 'desc'))
    WHEN 'asc' THEN 'asc'
    ELSE 'desc'
  END;

  -- Vigente = al menos un rol activo (BOOL_OR). Revocado = todos inactivos.
  -- El rol mostrado: primero el activo, si no hay, el más reciente.

  SELECT COUNT(DISTINCT u.id)::int
  INTO v_total
  FROM public.users u
  INNER JOIN (
    SELECT
      ur.user_id,
      BOOL_OR(ur.is_active) AS has_active,
      (SELECT ur2.role_id FROM public.user_roles ur2 WHERE ur2.user_id = ur.user_id ORDER BY ur2.is_active DESC, ur2.updated_at DESC, ur2.id DESC LIMIT 1) AS role_id,
      (SELECT ur2.id      FROM public.user_roles ur2 WHERE ur2.user_id = ur.user_id ORDER BY ur2.is_active DESC, ur2.updated_at DESC, ur2.id DESC LIMIT 1) AS assignment_id
    FROM public.user_roles ur
    GROUP BY ur.user_id
  ) agg ON agg.user_id = u.id
  INNER JOIN public.roles r ON r.id = agg.role_id
  WHERE (p_is_active IS NULL OR agg.has_active = p_is_active)
    AND (
      p_role_filter = 'all'
      OR (p_role_filter = 'admin'   AND r.name = 'ADMIN')
      OR (p_role_filter = 'manager' AND r.name = 'MANAGER')
    )
    AND (p_search IS NULL OR LENGTH(TRIM(p_search)) = 0 OR u.email ILIKE '%' || p_search || '%');

  v_query := format(
    $f$
      SELECT jsonb_build_object(
        'total', %L::int,
        'items', COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id',                   sub.id,
              'email',                sub.email,
              'name',                 sub.name,
              'createdAt',            sub.created_at,
              'lastLoginAt',          sub.last_login_at,
              'isActive',             sub.has_active,
              'roleId',               sub.role_id,
              'roleName',             sub.role_name,
              'userRoleAssignmentId', sub.assignment_id
            )
            ORDER BY sub.sort_key %s
          ),
          '[]'::jsonb
        )
      )
      FROM (
        SELECT
          u.id,
          u.email,
          COALESCE(au.raw_user_meta_data ->> 'full_name', u.email) AS name,
          u.created_at,
          u.last_login_at,
          agg.has_active,
          agg.role_id,
          agg.assignment_id,
          r.name AS role_name,
          %s     AS sort_key
        FROM public.users u
        INNER JOIN (
          SELECT
            ur.user_id,
            BOOL_OR(ur.is_active) AS has_active,
            (SELECT ur2.role_id FROM public.user_roles ur2 WHERE ur2.user_id = ur.user_id ORDER BY ur2.is_active DESC, ur2.updated_at DESC, ur2.id DESC LIMIT 1) AS role_id,
            (SELECT ur2.id      FROM public.user_roles ur2 WHERE ur2.user_id = ur.user_id ORDER BY ur2.is_active DESC, ur2.updated_at DESC, ur2.id DESC LIMIT 1) AS assignment_id
          FROM public.user_roles ur
          GROUP BY ur.user_id
        ) agg ON agg.user_id = u.id
        INNER JOIN public.roles r ON r.id = agg.role_id
        LEFT JOIN auth.users au ON au.id = u.id
        WHERE ($1 IS NULL OR agg.has_active = $1)
          AND (
            $2 = 'all'
            OR ($2 = 'admin'   AND r.name = 'ADMIN')
            OR ($2 = 'manager' AND r.name = 'MANAGER')
          )
          AND ($3 IS NULL OR LENGTH(TRIM($3)) = 0 OR u.email ILIKE '%%' || $3 || '%%')
        ORDER BY %s %s
        LIMIT $4 OFFSET $5
      ) sub
    $f$,
    v_total, v_sort_dir, v_sort_column, v_sort_column, v_sort_dir
  );

  EXECUTE v_query INTO v_result USING p_is_active, p_role_filter, p_search, p_limit, p_offset;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_employees_list"(
  p_limit       int     DEFAULT 10,
  p_offset      int     DEFAULT 0,
  p_is_active   boolean DEFAULT NULL,
  p_role_filter text    DEFAULT 'all',
  p_search      text    DEFAULT NULL,
  p_sort_by     text    DEFAULT 'createdAt',
  p_sort_dir    text    DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.get_employees_list(p_limit, p_offset, p_is_active, p_role_filter, p_search, p_sort_by, p_sort_dir);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."get_employees_list"(int, int, boolean, text, text, text, text) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."get_employees_list"(int, int, boolean, text, text, text, text) TO service_role;

GRANT ALL ON FUNCTION "public"."get_employees_list"(int, int, boolean, text, text, text, text) TO anon;
GRANT ALL ON FUNCTION "public"."get_employees_list"(int, int, boolean, text, text, text, text) TO authenticated;
GRANT ALL ON FUNCTION "public"."get_employees_list"(int, int, boolean, text, text, text, text) TO service_role;

-- ---- update_employee --------------------------------------------------------

DROP FUNCTION IF EXISTS public.update_employee(uuid, text, text);
DROP FUNCTION IF EXISTS app_analytics.update_employee(uuid, text, text);

CREATE OR REPLACE FUNCTION app_analytics.update_employee(
  p_user_id uuid,
  p_name    text,
  p_email   text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid      uuid    := auth.uid();
  v_is_admin boolean;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'p_user_id is required'; END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN RAISE EXCEPTION 'name is required'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;

  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('full_name', trim(p_name))
  WHERE id = p_user_id;

  IF p_email IS NOT NULL AND length(trim(p_email)) > 0 THEN
    UPDATE auth.users  SET email = trim(p_email) WHERE id = p_user_id;
    UPDATE public.users SET email = trim(p_email), updated_at = now() WHERE id = p_user_id;
  ELSE
    UPDATE public.users SET updated_at = now() WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'id',       p_user_id,
    'name',     trim(p_name),
    'email',    COALESCE(trim(p_email), (SELECT email FROM public.users WHERE id = p_user_id)),
    'isActive', (SELECT is_active FROM public.users WHERE id = p_user_id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_employee(
  p_user_id uuid,
  p_name    text,
  p_email   text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.update_employee(p_user_id, p_name, p_email);
$$;

REVOKE ALL ON FUNCTION app_analytics.update_employee(uuid, text, text) FROM PUBLIC;
GRANT  ALL ON FUNCTION app_analytics.update_employee(uuid, text, text) TO service_role;

GRANT ALL ON FUNCTION public.update_employee(uuid, text, text) TO anon;
GRANT ALL ON FUNCTION public.update_employee(uuid, text, text) TO authenticated;
GRANT ALL ON FUNCTION public.update_employee(uuid, text, text) TO service_role;

-- ---- set_employee_role ------------------------------------------------------

DROP FUNCTION IF EXISTS app_analytics.set_employee_role(uuid, uuid);
DROP FUNCTION IF EXISTS public.set_employee_role(uuid, uuid);

CREATE OR REPLACE FUNCTION app_analytics.set_employee_role(
  p_user_id uuid,
  p_role_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid      uuid    := auth.uid();
  v_is_admin boolean;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'p_user_id is required'; END IF;
  IF p_role_id IS NULL THEN RAISE EXCEPTION 'p_role_id is required'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;

  -- Desactivar rol activo actual
  UPDATE public.user_roles
  SET is_active = false, updated_at = now()
  WHERE user_id = p_user_id AND is_active = true;

  -- Reactivar fila existente para el nuevo rol
  UPDATE public.user_roles
  SET is_active = true, updated_at = now()
  WHERE user_id = p_user_id AND role_id = p_role_id;

  -- Si nunca tuvo ese rol, crear la fila
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role_id, is_active, assigned_at, created_at, updated_at)
    VALUES (p_user_id, p_role_id, true, now(), now(), now());
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_employee_role(
  p_user_id uuid,
  p_role_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.set_employee_role(p_user_id, p_role_id);
$$;

REVOKE ALL ON FUNCTION app_analytics.set_employee_role(uuid, uuid) FROM PUBLIC;
GRANT  ALL ON FUNCTION app_analytics.set_employee_role(uuid, uuid) TO service_role;

GRANT ALL ON FUNCTION public.set_employee_role(uuid, uuid) TO anon;
GRANT ALL ON FUNCTION public.set_employee_role(uuid, uuid) TO authenticated;
GRANT ALL ON FUNCTION public.set_employee_role(uuid, uuid) TO service_role;

-- ---- revoke_employee_access -------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."revoke_employee_access"(uuid);
DROP FUNCTION IF EXISTS "public"."revoke_employee_access"(uuid);

CREATE OR REPLACE FUNCTION "app_analytics"."revoke_employee_access"(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid           uuid    := auth.uid();
  v_is_admin      boolean;
  v_assignment_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;

  SELECT ur.id INTO v_assignment_id
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id AND ur.is_active = true
  ORDER BY ur.created_at DESC, ur.id DESC LIMIT 1;

  IF v_assignment_id IS NULL THEN RAISE EXCEPTION 'no active assignment found'; END IF;

  UPDATE public.user_roles SET is_active = false, updated_at = now() WHERE id = v_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."revoke_employee_access"(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.revoke_employee_access(p_user_id);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."revoke_employee_access"(uuid) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."revoke_employee_access"(uuid) TO service_role;

GRANT ALL ON FUNCTION "public"."revoke_employee_access"(uuid) TO anon;
GRANT ALL ON FUNCTION "public"."revoke_employee_access"(uuid) TO authenticated;
GRANT ALL ON FUNCTION "public"."revoke_employee_access"(uuid) TO service_role;

-- ---- restore_employee_access ------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."restore_employee_access"(uuid);
DROP FUNCTION IF EXISTS "public"."restore_employee_access"(uuid);

CREATE OR REPLACE FUNCTION "app_analytics"."restore_employee_access"(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid      uuid    := auth.uid();
  v_is_admin boolean;
  v_role_id  uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;

  SELECT ur.role_id INTO v_role_id
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
  ORDER BY ur.created_at DESC, ur.id DESC LIMIT 1;

  IF v_role_id IS NULL THEN RAISE EXCEPTION 'no assignment found for user'; END IF;

  INSERT INTO public.user_roles (user_id, role_id, is_active, assigned_at, created_at, updated_at)
  VALUES (p_user_id, v_role_id, true, now(), now(), now())
  ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true, updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION "public"."restore_employee_access"(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.restore_employee_access(p_user_id);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."restore_employee_access"(uuid) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."restore_employee_access"(uuid) TO service_role;

GRANT ALL ON FUNCTION "public"."restore_employee_access"(uuid) TO anon;
GRANT ALL ON FUNCTION "public"."restore_employee_access"(uuid) TO authenticated;
GRANT ALL ON FUNCTION "public"."restore_employee_access"(uuid) TO service_role;


-- -----------------------------------------------------------------------------
-- SECTION 6 — Universities: list, create, update, set active
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "app_analytics"."get_universities_list"(
  p_limit     int     DEFAULT 10,
  p_offset    int     DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_search    text    DEFAULT NULL,
  p_sort_by   text    DEFAULT 'createdAt',
  p_sort_dir  text    DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid         uuid := auth.uid();
  v_is_admin    boolean;
  v_result      jsonb;
  v_total       int;
  v_sort_column text;
  v_sort_dir    text;
  v_query       text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;

  v_sort_column := CASE p_sort_by
    WHEN 'name'               THEN 'u.name'
    WHEN 'isActive'           THEN 'u.is_active'
    WHEN 'campusCount'        THEN 'coalesce(campus_agg.campus_count, 0)'
    WHEN 'recyclingPointCount'THEN 'coalesce(point_agg.point_count, 0)'
    WHEN 'createdAt'          THEN 'u.created_at'
    ELSE 'u.created_at'
  END;

  v_sort_dir := CASE LOWER(COALESCE(p_sort_dir,'desc')) WHEN 'asc' THEN 'asc' ELSE 'desc' END;

  SELECT COUNT(*)::int INTO v_total
  FROM public.universities u
  WHERE (p_is_active IS NULL OR u.is_active = p_is_active)
    AND (p_search IS NULL OR LENGTH(TRIM(p_search)) = 0 OR u.name ILIKE '%' || p_search || '%');

  v_query := format(
    $f$
      SELECT jsonb_build_object(
        'total', %L::int,
        'items', COALESCE(jsonb_agg(jsonb_build_object(
          'id',                   sub.id,
          'name',                 sub.name,
          'isActive',             sub.is_active,
          'campusCount',          sub.campus_count,
          'recyclingPointCount',  sub.point_count,
          'createdAt',            sub.created_at
        ) ORDER BY sub.sort_key %s), '[]'::jsonb)
      )
      FROM (
        SELECT u.id, u.name, u.is_active, u.created_at,
               COALESCE(campus_agg.campus_count, 0) AS campus_count,
               COALESCE(point_agg.point_count, 0)   AS point_count,
               %s AS sort_key
        FROM public.universities u
        LEFT JOIN (
          SELECT university_id, COUNT(*) FILTER (WHERE is_active)::int AS campus_count
          FROM public.campuses GROUP BY university_id
        ) campus_agg ON campus_agg.university_id = u.id
        LEFT JOIN (
          SELECT c.university_id, COUNT(rp.id) FILTER (WHERE rp.is_active)::int AS point_count
          FROM public.campuses c JOIN public.recycling_points rp ON rp.campus_id = c.id
          GROUP BY c.university_id
        ) point_agg ON point_agg.university_id = u.id
        WHERE ($1 IS NULL OR u.is_active = $1)
          AND ($2 IS NULL OR LENGTH(TRIM($2)) = 0 OR u.name ILIKE '%%' || $2 || '%%')
        ORDER BY %s %s LIMIT $3 OFFSET $4
      ) sub
    $f$,
    v_total, v_sort_dir, v_sort_column, v_sort_column, v_sort_dir
  );

  EXECUTE v_query INTO v_result USING p_is_active, p_search, p_limit, p_offset;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_universities_list"(
  p_limit     int     DEFAULT 10,
  p_offset    int     DEFAULT 0,
  p_is_active boolean DEFAULT NULL,
  p_search    text    DEFAULT NULL,
  p_sort_by   text    DEFAULT 'createdAt',
  p_sort_dir  text    DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.get_universities_list(p_limit, p_offset, p_is_active, p_search, p_sort_by, p_sort_dir);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."get_universities_list"(int, int, boolean, text, text, text) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."get_universities_list"(int, int, boolean, text, text, text) TO service_role;

GRANT ALL ON FUNCTION "public"."get_universities_list"(int, int, boolean, text, text, text) TO anon;
GRANT ALL ON FUNCTION "public"."get_universities_list"(int, int, boolean, text, text, text) TO authenticated;
GRANT ALL ON FUNCTION "public"."get_universities_list"(int, int, boolean, text, text, text) TO service_role;

-- ---- create_university ------------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."create_university"(text, jsonb);
DROP FUNCTION IF EXISTS "public"."create_university"(text, jsonb);
DROP FUNCTION IF EXISTS "app_analytics"."create_university"(text);
DROP FUNCTION IF EXISTS "public"."create_university"(text);

CREATE OR REPLACE FUNCTION "app_analytics"."create_university"(p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid           uuid := auth.uid();
  v_is_admin      boolean;
  v_university_id uuid;
  v_created_at    timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN RAISE EXCEPTION 'university name is required'; END IF;

  INSERT INTO public.universities (name) VALUES (trim(p_name))
  RETURNING id, created_at INTO v_university_id, v_created_at;

  RETURN jsonb_build_object('id', v_university_id, 'name', trim(p_name), 'isActive', true, 'createdAt', v_created_at);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."create_university"(p_name text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.create_university(p_name);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."create_university"(text) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."create_university"(text) TO service_role;

GRANT ALL ON FUNCTION "public"."create_university"(text) TO anon;
GRANT ALL ON FUNCTION "public"."create_university"(text) TO authenticated;
GRANT ALL ON FUNCTION "public"."create_university"(text) TO service_role;

-- ---- update_university ------------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."update_university"(uuid, text);
DROP FUNCTION IF EXISTS "public"."update_university"(uuid, text);

CREATE OR REPLACE FUNCTION "app_analytics"."update_university"(p_university_id uuid, p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid      uuid    := auth.uid();
  v_is_admin boolean;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;
  IF TRIM(COALESCE(p_name,'')) = '' THEN RAISE EXCEPTION 'name is required'; END IF;

  UPDATE public.universities SET name = TRIM(p_name), updated_at = now() WHERE id = p_university_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'university not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."update_university"(p_university_id uuid, p_name text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.update_university(p_university_id, p_name);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."update_university"(uuid, text) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."update_university"(uuid, text) TO service_role;

GRANT ALL ON FUNCTION "public"."update_university"(uuid, text) TO anon;
GRANT ALL ON FUNCTION "public"."update_university"(uuid, text) TO authenticated;
GRANT ALL ON FUNCTION "public"."update_university"(uuid, text) TO service_role;

-- ---- set_university_active --------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."set_university_active"(uuid, boolean);
DROP FUNCTION IF EXISTS "public"."set_university_active"(uuid, boolean);

CREATE OR REPLACE FUNCTION "app_analytics"."set_university_active"(p_university_id uuid, p_is_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid      uuid    := auth.uid();
  v_is_admin boolean;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;
  IF p_university_id IS NULL THEN RAISE EXCEPTION 'p_university_id is required'; END IF;

  UPDATE public.universities SET is_active = p_is_active, updated_at = now() WHERE id = p_university_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'university not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."set_university_active"(p_university_id uuid, p_is_active boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.set_university_active(p_university_id, p_is_active);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."set_university_active"(uuid, boolean) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."set_university_active"(uuid, boolean) TO service_role;

GRANT ALL ON FUNCTION "public"."set_university_active"(uuid, boolean) TO anon;
GRANT ALL ON FUNCTION "public"."set_university_active"(uuid, boolean) TO authenticated;
GRANT ALL ON FUNCTION "public"."set_university_active"(uuid, boolean) TO service_role;


-- -----------------------------------------------------------------------------
-- SECTION 7 — Campuses: list, create, update
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."get_university_campuses"(uuid);
DROP FUNCTION IF EXISTS "public"."get_university_campuses"(uuid);

CREATE OR REPLACE FUNCTION "app_analytics"."get_university_campuses"(
  p_university_id uuid,
  p_limit         int     DEFAULT 10,
  p_offset        int     DEFAULT 0,
  p_is_active     boolean DEFAULT NULL,
  p_search        text    DEFAULT NULL,
  p_sort_by       text    DEFAULT 'name',
  p_sort_dir      text    DEFAULT 'asc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid         uuid := auth.uid();
  v_is_admin    boolean;
  v_result      jsonb;
  v_total       int;
  v_sort_column text;
  v_sort_dir    text;
  v_query       text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_university_id IS NULL THEN RAISE EXCEPTION 'p_university_id is required'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;

  v_sort_column := CASE p_sort_by
    WHEN 'name'               THEN 'c.name'
    WHEN 'isActive'           THEN 'c.is_active'
    WHEN 'recyclingPointCount'THEN 'coalesce(point_agg.point_count, 0)'
    WHEN 'createdAt'          THEN 'c.created_at'
    ELSE 'c.name'
  END;

  v_sort_dir := CASE LOWER(COALESCE(p_sort_dir,'asc')) WHEN 'desc' THEN 'desc' ELSE 'asc' END;

  SELECT COUNT(*)::int INTO v_total
  FROM public.campuses c
  WHERE c.university_id = p_university_id
    AND (p_is_active IS NULL OR c.is_active = p_is_active)
    AND (p_search IS NULL OR LENGTH(TRIM(p_search)) = 0 OR c.name ILIKE '%' || p_search || '%');

  v_query := format(
    $f$
      SELECT jsonb_build_object(
        'total', %L::int,
        'items', COALESCE(jsonb_agg(jsonb_build_object(
          'id',                   sub.id,
          'name',                 sub.name,
          'address',              sub.address,
          'isActive',             sub.is_active,
          'recyclingPointCount',  sub.point_count,
          'createdAt',            sub.created_at
        ) ORDER BY sub.sort_key %s), '[]'::jsonb)
      )
      FROM (
        SELECT c.id, c.name, c.address, c.is_active, c.created_at,
               COALESCE(point_agg.point_count, 0) AS point_count,
               %s AS sort_key
        FROM public.campuses c
        LEFT JOIN (
          SELECT campus_id, COUNT(*) FILTER (WHERE is_active)::int AS point_count
          FROM public.recycling_points GROUP BY campus_id
        ) point_agg ON point_agg.campus_id = c.id
        WHERE c.university_id = $1
          AND ($2 IS NULL OR c.is_active = $2)
          AND ($3 IS NULL OR LENGTH(TRIM($3)) = 0 OR c.name ILIKE '%%' || $3 || '%%')
        ORDER BY %s %s LIMIT $4 OFFSET $5
      ) sub
    $f$,
    v_total, v_sort_dir, v_sort_column, v_sort_column, v_sort_dir
  );

  EXECUTE v_query INTO v_result USING p_university_id, p_is_active, p_search, p_limit, p_offset;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_university_campuses"(
  p_university_id uuid,
  p_limit         int     DEFAULT 10,
  p_offset        int     DEFAULT 0,
  p_is_active     boolean DEFAULT NULL,
  p_search        text    DEFAULT NULL,
  p_sort_by       text    DEFAULT 'name',
  p_sort_dir      text    DEFAULT 'asc'
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.get_university_campuses(p_university_id, p_limit, p_offset, p_is_active, p_search, p_sort_by, p_sort_dir);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."get_university_campuses"(uuid, int, int, boolean, text, text, text) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO service_role;

GRANT ALL ON FUNCTION "public"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO anon;
GRANT ALL ON FUNCTION "public"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO authenticated;
GRANT ALL ON FUNCTION "public"."get_university_campuses"(uuid, int, int, boolean, text, text, text) TO service_role;

-- ---- create_university_campuses ---------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."create_university_campuses"(uuid, jsonb);
DROP FUNCTION IF EXISTS "public"."create_university_campuses"(uuid, jsonb);

CREATE OR REPLACE FUNCTION "app_analytics"."create_university_campuses"(p_university_id uuid, p_campuses jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid               uuid    := auth.uid();
  v_is_admin          boolean;
  v_university_exists boolean;
  v_campus            jsonb;
  v_campus_name       text;
  v_campus_address    text;
  v_campus_id         uuid;
  v_campuses_result   jsonb   := '[]'::jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;
  IF p_university_id IS NULL THEN RAISE EXCEPTION 'p_university_id is required'; END IF;

  SELECT EXISTS (SELECT 1 FROM public.universities u WHERE u.id = p_university_id) INTO v_university_exists;
  IF NOT v_university_exists THEN RAISE EXCEPTION 'university not found'; END IF;

  IF p_campuses IS NULL OR jsonb_typeof(p_campuses) <> 'array' OR jsonb_array_length(p_campuses) = 0 THEN
    RAISE EXCEPTION 'at least one campus is required';
  END IF;

  FOR v_campus IN SELECT * FROM jsonb_array_elements(p_campuses) LOOP
    v_campus_name    := v_campus->>'name';
    v_campus_address := v_campus->>'address';

    IF v_campus_name IS NULL OR length(trim(v_campus_name)) = 0 THEN
      RAISE EXCEPTION 'campus name is required for every campus';
    END IF;

    INSERT INTO public.campuses (university_id, name, address)
    VALUES (p_university_id, trim(v_campus_name), v_campus_address)
    RETURNING id INTO v_campus_id;

    v_campuses_result := v_campuses_result || jsonb_build_object('id', v_campus_id, 'name', v_campus_name, 'address', v_campus_address);
  END LOOP;

  RETURN jsonb_build_object('universityId', p_university_id, 'campuses', v_campuses_result);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."create_university_campuses"(p_university_id uuid, p_campuses jsonb)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.create_university_campuses(p_university_id, p_campuses);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."create_university_campuses"(uuid, jsonb) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."create_university_campuses"(uuid, jsonb) TO service_role;

GRANT ALL ON FUNCTION "public"."create_university_campuses"(uuid, jsonb) TO anon;
GRANT ALL ON FUNCTION "public"."create_university_campuses"(uuid, jsonb) TO authenticated;
GRANT ALL ON FUNCTION "public"."create_university_campuses"(uuid, jsonb) TO service_role;

-- ---- update_university_campuses ---------------------------------------------

DROP FUNCTION IF EXISTS "app_analytics"."update_university_campuses"(uuid, jsonb);
DROP FUNCTION IF EXISTS "public"."update_university_campuses"(uuid, jsonb);

CREATE OR REPLACE FUNCTION "app_analytics"."update_university_campuses"(p_university_id uuid, p_campuses jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_uid               uuid    := auth.uid();
  v_is_admin          boolean;
  v_university_exists boolean;
  v_campus            jsonb;
  v_campus_id         uuid;
  v_campus_name       text;
  v_campus_address    text;
  v_campus_is_active  boolean;
  v_result            jsonb   := '[]'::jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_uid AND ur.is_active = true AND r.is_active = true AND r.name = 'ADMIN'
  ) INTO v_is_admin;

  IF NOT COALESCE(v_is_admin, false) THEN RAISE EXCEPTION 'admin role required'; END IF;
  IF p_university_id IS NULL THEN RAISE EXCEPTION 'p_university_id is required'; END IF;

  SELECT EXISTS (SELECT 1 FROM public.universities u WHERE u.id = p_university_id) INTO v_university_exists;
  IF NOT v_university_exists THEN RAISE EXCEPTION 'university not found'; END IF;

  IF p_campuses IS NULL OR jsonb_typeof(p_campuses) <> 'array' OR jsonb_array_length(p_campuses) = 0 THEN
    RAISE EXCEPTION 'at least one campus is required';
  END IF;

  FOR v_campus IN SELECT * FROM jsonb_array_elements(p_campuses) LOOP
    v_campus_name      := v_campus->>'name';
    v_campus_address   := v_campus->>'address';
    v_campus_is_active := (v_campus->>'isActive')::boolean;

    IF v_campus_name IS NULL OR length(trim(v_campus_name)) = 0 THEN
      RAISE EXCEPTION 'campus name is required for every campus';
    END IF;

    IF (v_campus->>'id') IS NOT NULL THEN
      v_campus_id := (v_campus->>'id')::uuid;

      UPDATE public.campuses
      SET name       = TRIM(v_campus_name),
          address    = CASE WHEN TRIM(COALESCE(v_campus_address,'')) = '' THEN NULL ELSE TRIM(v_campus_address) END,
          is_active  = COALESCE(v_campus_is_active, is_active),
          updated_at = now()
      WHERE id = v_campus_id AND university_id = p_university_id;

      IF NOT FOUND THEN RAISE EXCEPTION 'campus % not found in university %', v_campus_id, p_university_id; END IF;
    ELSE
      INSERT INTO public.campuses (university_id, name, address)
      VALUES (
        p_university_id,
        TRIM(v_campus_name),
        CASE WHEN TRIM(COALESCE(v_campus_address,'')) = '' THEN NULL ELSE TRIM(v_campus_address) END
      )
      RETURNING id INTO v_campus_id;
    END IF;

    v_result := v_result || jsonb_build_object(
      'id',      v_campus_id,
      'name',    TRIM(v_campus_name),
      'address', CASE WHEN TRIM(COALESCE(v_campus_address,'')) = '' THEN NULL ELSE TRIM(v_campus_address) END
    );
  END LOOP;

  RETURN jsonb_build_object('universityId', p_university_id, 'campuses', v_result);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."update_university_campuses"(p_university_id uuid, p_campuses jsonb)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'app_analytics'
AS $$
  SELECT app_analytics.update_university_campuses(p_university_id, p_campuses);
$$;

REVOKE ALL ON FUNCTION "app_analytics"."update_university_campuses"(uuid, jsonb) FROM PUBLIC;
GRANT  ALL ON FUNCTION "app_analytics"."update_university_campuses"(uuid, jsonb) TO service_role;

GRANT ALL ON FUNCTION "public"."update_university_campuses"(uuid, jsonb) TO anon;
GRANT ALL ON FUNCTION "public"."update_university_campuses"(uuid, jsonb) TO authenticated;
GRANT ALL ON FUNCTION "public"."update_university_campuses"(uuid, jsonb) TO service_role;


-- -----------------------------------------------------------------------------
-- SECTION 8 — Misc public helpers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."count_public_tables"()
RETURNS TABLE("table_name" text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
$$;

GRANT ALL ON FUNCTION "public"."count_public_tables"() TO anon;
GRANT ALL ON FUNCTION "public"."count_public_tables"() TO authenticated;
GRANT ALL ON FUNCTION "public"."count_public_tables"() TO service_role;


-- -----------------------------------------------------------------------------
-- SECTION 9 — Schema & table grants
-- -----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA "app_analytics" TO "service_role";

GRANT ALL ON TABLE "public"."health_check"     TO anon, authenticated, service_role;
GRANT ALL ON TABLE "public"."metric_snapshots" TO anon, authenticated, service_role;
GRANT ALL ON TABLE "public"."system_config"    TO anon, authenticated, service_role;