# Analytics Domain

## Client services

- `AdminMetricsService`
- `MetricsUI`
- optional external analytics service integration from the architecture

## Current backend ownership

### Tables in `public`
- `metric_snapshots`
- recycling/user tables used as aggregate sources

### Functions
- `public.get_admin_dashboard(p_start, p_end)`

## Current source files

### Migrations
- `20260612010000_analytics_admin_dashboard_rpc.sql`

## Problems today

- analytics logic is conceptually separate in the UML, but only one RPC documents that boundary today
- there is no documented split between operational product data and reporting contracts

## Target organization

For new contracts, prefer an `analytics` schema:
- `analytics.get_admin_dashboard(...)`
- `analytics.weekly_confirmed_recycling(...)`
- `analytics.residue_breakdown_v`
- materialized views later if reporting becomes heavy
