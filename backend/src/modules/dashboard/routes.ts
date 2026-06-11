import { Hono } from "hono";
import { client } from "../../db";

const app = new Hono();

function parseDateRange(startRaw?: string, endRaw?: string) {
  const end = endRaw ? new Date(endRaw) : new Date();
  const start = startRaw ? new Date(startRaw) : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

app.get("/", async (c) => {
  const range = parseDateRange(c.req.query("start"), c.req.query("end"));

  if (!range) {
    return c.json({ error: "Invalid date range" }, 400);
  }

  const [kpiRows, funnelRows, topResidueRows, qualityRows, trendRows, detailRows] = await Promise.all([
    client`
      with session_scope as (
        select *
        from public.recycling_sessions
        where started_at >= ${range.start}::timestamptz
          and started_at <= ${range.end}::timestamptz
      ),
      record_scope as (
        select *
        from public.recycling_records
        where created_at >= ${range.start}::timestamptz
          and created_at <= ${range.end}::timestamptz
      )
      select
        (select count(*)::int from record_scope) as total_recyclings,
        coalesce((select round(sum(estimated_weight)::numeric / 1000, 1) from record_scope), 0) as total_kg,
        (
          select count(*)::int
          from public.users u
          where u.last_login_at >= ${range.start}::timestamptz
            and u.last_login_at <= ${range.end}::timestamptz
        ) as active_users_in_period,
        (
          select count(*)::int
          from public.users u
          where u.created_at >= ${range.start}::timestamptz
            and u.created_at <= ${range.end}::timestamptz
        ) as new_users_in_period,
        coalesce((
          select round(
            100.0 * count(*) filter (where outcome = 'confirmed') / nullif(count(*), 0),
            0
          )
          from session_scope
        ), 0) as confirmation_rate
    `,
    client`
      with session_scope as (
        select *
        from public.recycling_sessions
        where started_at >= ${range.start}::timestamptz
          and started_at <= ${range.end}::timestamptz
      )
      select
        count(*)::int as started,
        count(*) filter (
          where furthest_step in ('processing', 'manual', 'map', 'instructions', 'success')
        )::int as processing,
        count(*) filter (
          where furthest_step in ('map', 'instructions', 'success')
        )::int as map,
        count(*) filter (
          where furthest_step in ('instructions', 'success')
        )::int as instructions,
        count(*) filter (where outcome = 'confirmed')::int as confirmed
      from session_scope
    `,
    client`
      select
        coalesce(wt.name, 'Desconocido') as name,
        count(*)::int as confirmed
      from public.recycling_records rr
      left join public.waste_types wt on wt.id = rr.waste_type_id
      where rr.created_at >= ${range.start}::timestamptz
        and rr.created_at <= ${range.end}::timestamptz
      group by wt.name
      order by confirmed desc, name asc
      limit 6
    `,
    client`
      with session_scope as (
        select *
        from public.recycling_sessions
        where started_at >= ${range.start}::timestamptz
          and started_at <= ${range.end}::timestamptz
      )
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
    `,
    client`
      select
        to_char(date_trunc('week', created_at), '"sem. "IW') as label,
        count(*)::int as value
      from public.recycling_records
      where created_at >= ${range.start}::timestamptz
        and created_at <= ${range.end}::timestamptz
      group by date_trunc('week', created_at)
      order by date_trunc('week', created_at)
    `,
    client`
      with session_scope as (
        select *
        from public.recycling_sessions
        where started_at >= ${range.start}::timestamptz
          and started_at <= ${range.end}::timestamptz
      ),
      record_scope as (
        select *
        from public.recycling_records
        where created_at >= ${range.start}::timestamptz
          and created_at <= ${range.end}::timestamptz
      ),
      scans as (
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
      order by coalesce(confirmed.confirmed, 0) desc, coalesce(scans.scans, 0) desc
      limit 10
    `,
  ]);

  const kpis = kpiRows[0] ?? {
    total_recyclings: 0,
    total_kg: 0,
    active_users_in_period: 0,
    new_users_in_period: 0,
    confirmation_rate: 0,
  };

  const funnel = funnelRows[0] ?? {
    started: 0,
    processing: 0,
    map: 0,
    instructions: 0,
    confirmed: 0,
  };

  const quality = qualityRows[0] ?? {
    high_confidence: 0,
    low_confidence: 0,
    overridden: 0,
  };

  const qualityTotal =
    Number(quality.high_confidence) + Number(quality.low_confidence) + Number(quality.overridden);

  const toPercent = (value: number) =>
    qualityTotal === 0 ? 0 : Math.round((value / qualityTotal) * 100);

  return c.json({
    filters: range,
    kpis: {
      totalRecyclings: Number(kpis.total_recyclings),
      totalKg: Number(kpis.total_kg),
      activeUsersInPeriod: Number(kpis.active_users_in_period),
      newUsersInPeriod: Number(kpis.new_users_in_period),
      confirmationRate: Number(kpis.confirmation_rate),
    },
    funnel: [
      { label: "Iniciaron", value: Number(funnel.started) },
      { label: "Processing", value: Number(funnel.processing) },
      { label: "Mapa", value: Number(funnel.map) },
      { label: "Instrucciones", value: Number(funnel.instructions) },
      { label: "Confirmaron", value: Number(funnel.confirmed) },
    ],
    topResidues: topResidueRows.map((row) => ({
      name: String(row.name),
      confirmed: Number(row.confirmed),
    })),
    recognitionQuality: [
      {
        name: "Alta confianza",
        count: Number(quality.high_confidence),
        percentage: toPercent(Number(quality.high_confidence)),
        color: "#22c76f",
      },
      {
        name: "Baja confianza",
        count: Number(quality.low_confidence),
        percentage: toPercent(Number(quality.low_confidence)),
        color: "#f4b740",
      },
      {
        name: "Corregidos por usuario",
        count: Number(quality.overridden),
        percentage: toPercent(Number(quality.overridden)),
        color: "#0b2f4e",
      },
    ],
    trend: trendRows.map((row) => ({
      label: String(row.label),
      value: Number(row.value),
    })),
    detailRows: detailRows.map((row) => ({
      residue: String(row.residue),
      scans: Number(row.scans),
      confirmed: Number(row.confirmed),
      rate: Number(row.rate),
      kilograms: Number(row.kilograms),
    })),
  });
});

export default app;
