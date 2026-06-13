import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const supabaseDir = path.join(repoRoot, "supabase");
const inputPath = path.join(supabaseDir, "schema.sql");
const outputDir = path.join(supabaseDir, "schemas");

if (!fs.existsSync(inputPath)) {
  throw new Error(`Missing schema dump at ${inputPath}`);
}

const sql = fs.readFileSync(inputPath, "utf8");

const tableDomain = new Map([
  ["universities", "10_catalog.sql"],
  ["campuses", "10_catalog.sql"],
  ["bin_types", "10_catalog.sql"],
  ["waste_types", "10_catalog.sql"],
  ["avatars", "10_catalog.sql"],
  ["roles", "10_catalog.sql"],
  ["achievements", "10_catalog.sql"],
  ["rewards", "10_catalog.sql"],

  ["users", "20_profiles_social.sql"],
  ["user_profiles", "20_profiles_social.sql"],
  ["user_settings", "20_profiles_social.sql"],
  ["user_roles", "20_profiles_social.sql"],
  ["user_rewards", "20_profiles_social.sql"],
  ["user_achievements", "20_profiles_social.sql"],
  ["user_featured_medals", "20_profiles_social.sql"],
  ["user_progress", "20_profiles_social.sql"],
  ["friend_codes", "20_profiles_social.sql"],
  ["friendships", "20_profiles_social.sql"],

  ["recycling_points", "30_recycling_points.sql"],
  ["recycling_point_bins", "30_recycling_points.sql"],
  ["map_waste_type_bin_types", "30_recycling_points.sql"],
  ["cached_resources", "30_recycling_points.sql"],
  ["pending_operations", "30_recycling_points.sql"],

  ["recycling_sessions", "40_recycling_flow.sql"],
  ["recycling_records", "40_recycling_flow.sql"],

  ["educational_content", "50_education.sql"],
  ["instructions", "50_education.sql"],
  ["instruction_steps", "50_education.sql"],
  ["fun_facts", "50_education.sql"],

  ["metric_snapshots", "60_admin_analytics.sql"],
  ["system_config", "60_admin_analytics.sql"],
  ["health_check", "60_admin_analytics.sql"],
]);

const functionDomain = new Map([
  ["apply_daily_heat_decay", "72_functions_gamification.sql"],
  ["compute_streak_level", "72_functions_gamification.sql"],
  ["get_progress_with_decay", "72_functions_gamification.sql"],
  ["handle_post_segregation_progress", "72_functions_gamification.sql"],
  ["heat_gain_for_level", "72_functions_gamification.sql"],
  ["streak_level_checkpoint", "72_functions_gamification.sql"],
  ["update_featured_medals", "72_functions_gamification.sql"],
  ["test_update_featured_medals_flow", "72_functions_gamification.sql"],

  ["get_educational_categories", "71_functions_education.sql"],
  ["get_educational_content_by_category", "71_functions_education.sql"],
  ["get_educational_content_for_sync", "71_functions_education.sql"],
  ["test_educational_content_fetch", "71_functions_education.sql"],

  ["get_friends_with_profile", "73_functions_social.sql"],
  ["test_get_friends_with_profile_flow", "73_functions_social.sql"],

  ["get_current_account", "70_functions_auth_admin.sql"],
  ["handle_new_user", "70_functions_auth_admin.sql"],
  ["is_current_user_admin", "70_functions_auth_admin.sql"],
  ["update_user_avatar", "70_functions_auth_admin.sql"],
  ["test_handle_new_user_on_insert", "70_functions_auth_admin.sql"],
  ["test_handle_new_user_on_login", "70_functions_auth_admin.sql"],
  ["test_handle_new_user_on_non_login_update", "70_functions_auth_admin.sql"],
  ["test_no_duplicate_on_subsequent_login", "70_functions_auth_admin.sql"],
  ["test_update_user_avatar_flow", "70_functions_auth_admin.sql"],
  ["count_public_tables", "70_functions_auth_admin.sql"],
  ["get_admin_dashboard", "74_functions_analytics.sql"],
]);

const outputs = new Map([
  ["00_overview.sql", `-- Declarative schema source for Reciclame.\n-- Edit files in this directory, then generate additive migrations with:\n--   supabase db diff -f <change_name>\n-- Do not rewrite files under supabase/migrations after they are applied.\n`],
  ["01_internal_schemas.sql", `-- Internal implementation schemas.\ncreate schema if not exists app_auth;\ncreate schema if not exists app_admin;\ncreate schema if not exists app_analytics;\ncreate schema if not exists app_education;\ncreate schema if not exists app_gamification;\ncreate schema if not exists app_profile;\ncreate schema if not exists app_social;\n`],
  ["10_catalog.sql", `-- Catalog and reference data tables.\n`],
  ["20_profiles_social.sql", `-- User profile, friendships and social state.\n`],
  ["30_recycling_points.sql", `-- Recycling map, points and local/offline support.\n`],
  ["40_recycling_flow.sql", `-- Recycling sessions and confirmed recycling records.\n`],
  ["50_education.sql", `-- Educational content, instructions and fun facts.\n`],
  ["60_admin_analytics.sql", `-- Admin-facing analytics and operational configuration.\n`],
  ["65_constraints.sql", `-- Cross-table constraints, primary keys, unique keys and foreign keys.\n`],
  ["70_functions_auth_admin.sql", `-- Public and compatibility functions for auth/admin/profile contracts.\n`],
  ["71_functions_education.sql", `-- Public education RPC contracts.\n`],
  ["72_functions_gamification.sql", `-- Public gamification and progress contracts.\n`],
  ["73_functions_social.sql", `-- Public social contracts.\n`],
  ["74_functions_analytics.sql", `-- Public analytics contracts.\n`],
  ["80_rls_and_grants.sql", `-- RLS toggles, publication ownership, grants and default privileges.\n`],
]);

function append(file, block) {
  outputs.set(file, `${outputs.get(file)}\n${block.trim()}\n`);
}

function appendPublicWrapper(migrationSql, functionName, file) {
  const escaped = functionName.replace(".", "\\.");
  const regex = new RegExp(`create or replace function\\s+${escaped}\\([\\s\\S]*?\\$\\$[\\s\\S]*?\\$\\$;?`, "i");
  const match = migrationSql.match(regex);
  if (match) append(file, match[0]);
}

function collect(regex, handler) {
  for (const match of sql.matchAll(regex)) {
    handler(match[0], match);
  }
}

collect(/CREATE TABLE IF NOT EXISTS "public"\."([^"]+)"[\s\S]*?;\n/gi, (block, match) => {
  const table = match[1];
  const file = tableDomain.get(table);
  if (file) append(file, block);
});

collect(/ALTER TABLE "public"\."([^"]+)" OWNER TO "postgres";\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append(file, block);
});

collect(/ALTER TABLE ONLY "public"\."([^"]+)"[\s\S]*?;\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append("65_constraints.sql", block);
});

collect(/CREATE OR REPLACE FUNCTION "public"\."([^"]+)"\([\s\S]*?\$\$;\n/gi, (block, match) => {
  const fn = match[1];
  const file = functionDomain.get(fn) ?? "74_functions_analytics.sql";
  append(file, block);
});

collect(/ALTER TABLE "public"\."([^"]+)" ENABLE ROW LEVEL SECURITY;\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]) ?? "80_rls_and_grants.sql";
  append(file, block);
});

collect(/ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";\n/gi, (block) => {
  append("80_rls_and_grants.sql", block);
});

collect(/GRANT [\s\S]*?;\n/gi, (block) => {
  if (/GRANT ALL ON SEQUENCES TO/i.test(block)) return;
  if (/GRANT ALL ON FUNCTIONS TO/i.test(block)) return;
  if (/GRANT ALL ON TABLES TO/i.test(block)) return;
  append("80_rls_and_grants.sql", block);
});

const domainMigrationFiles = [
  "20260613010000_domain_function_schemas.sql",
  "20260613020000_expand_domain_function_schemas.sql",
];

for (const migrationName of domainMigrationFiles) {
  const migrationPath = path.join(supabaseDir, "migrations", migrationName);
  if (!fs.existsSync(migrationPath)) continue;
  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  for (const match of migrationSql.matchAll(/comment on schema[\s\S]*?;\n/gi)) {
    append("01_internal_schemas.sql", match[0]);
  }

  for (const match of migrationSql.matchAll(/create or replace function\s+(app_[a-z_]+)\.([a-z_]+)\([\s\S]*?\$\$[\s\S]*?\$\$;?/gi)) {
    const [, schemaName, fnName] = match;
    let file = "74_functions_analytics.sql";
    if (schemaName === "app_auth" || schemaName === "app_admin" || schemaName === "app_profile") file = "70_functions_auth_admin.sql";
    if (schemaName === "app_education") file = "71_functions_education.sql";
    if (schemaName === "app_gamification") file = "72_functions_gamification.sql";
    if (schemaName === "app_social") file = "73_functions_social.sql";
    if (schemaName === "app_analytics") file = "74_functions_analytics.sql";
    append(file, match[0]);
  }

  appendPublicWrapper(migrationSql, "public.get_current_account", "70_functions_auth_admin.sql");
  appendPublicWrapper(migrationSql, "public.get_admin_dashboard", "74_functions_analytics.sql");
  appendPublicWrapper(migrationSql, "public.is_current_user_admin", "70_functions_auth_admin.sql");

  for (const match of migrationSql.matchAll(/(?:revoke|grant)[\s\S]*?;\n/gi)) {
    append("80_rls_and_grants.sql", match[0]);
  }

  for (const match of migrationSql.matchAll(/drop trigger[\s\S]*?;\n/gi)) {
    append("70_functions_auth_admin.sql", match[0]);
  }

  for (const match of migrationSql.matchAll(/create trigger[\s\S]*?;\n/gi)) {
    append("70_functions_auth_admin.sql", match[0]);
  }
}

fs.mkdirSync(outputDir, { recursive: true });

for (const [filename, content] of outputs) {
  fs.writeFileSync(path.join(outputDir, filename), `${content.trim()}\n`, "utf8");
}

const readme = `# Declarative Backend Schemas

This directory is the readable backend source for future database changes.

Workflow:

1. Edit the domain SQL files in this directory.
2. Generate an additive migration:
   \`supabase db diff -f <change_name>\`
3. Review the generated file under \`supabase/migrations/\`.
4. Apply locally with \`supabase migration up\` or \`bun run db:reset\`.

Rules:

- Keep \`supabase/migrations/\` as immutable history once applied.
- Use these files as the place where developers understand the desired backend shape.
- Prefer public wrappers for stable RPC names and internal \`app_*\` schemas for implementation logic.
- Keep data seeds out of these files. Declarative schema only covers DDL and related grants/RLS.
`;

fs.writeFileSync(path.join(outputDir, "README.md"), readme, "utf8");

console.log(`Generated declarative schema files in ${outputDir}`);
