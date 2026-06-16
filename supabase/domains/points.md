# Points Domain

## Client services

- `PointsService`
- `MapsClient` consumes point data externally in the app flow

## Current backend ownership

### Tables in `public`
- `universities`
- `campuses`
- `bin_types`
- `recycling_points`
- `recycling_point_bins`
- `map_waste_type_bin_types`

### Seed data
- recycling point/bin seed data
- recycling bin type seed updates

## Current source files

### Migrations
- `20260528000000_seed_recycling_data.sql`
- `20260601000001_seed_recycling_point_bins.sql`
- `20260602000000_update_recycling_bin_type_seed.sql`

## Problems today

- points data is mixed into general core schema and seeds without an explicit ownership document
- there is no dedicated read contract yet for the web admin's read-only map/points view

## Target organization

For future point-oriented SQL contracts, prefer a `points` schema:
- `points.list_read_only_points()`
- `points.point_bin_matrix_v`

This domain should stay read-mostly and admin-safe according to the original architecture.
