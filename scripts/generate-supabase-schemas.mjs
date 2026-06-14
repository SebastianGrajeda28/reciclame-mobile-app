import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const supabaseDir = path.join(repoRoot, "supabase");
const inputPath = path.join(supabaseDir, "schema.sql");
const outputDir = path.join(supabaseDir, "schemas");
const testsDir = path.join(supabaseDir, "tests");

if (!fs.existsSync(inputPath)) {
  throw new Error(`Missing schema dump at ${inputPath}`);
}

const sql = fs.readFileSync(inputPath, "utf8");

const outputs = new Map([
  [
    "00_overview.sql",
    `-- Declarative schema source for Reciclame.
-- Edit files in this directory and generate additive migrations with:
--   supabase db diff -f <change_name>
-- Keep supabase/migrations as immutable applied history.
`,
  ],
  [
    "01_schemas.sql",
    `-- PostgreSQL schemas used by the application backend.
-- The public schema holds stable client-facing tables and wrappers.
-- app_* schemas hold internal implementation functions by domain.
`,
  ],
  [
    "10_reference_data.sql",
    `-- Shared catalog data used across the platform.
-- Universities, campuses, waste types, bin types, roles, rewards and achievements.
`,
  ],
  [
    "20_identity_access.sql",
    `-- Identity, accounts, and administrative access control.
-- Includes public.users, user_roles, and auth/admin RPC wrappers.
`,
  ],
  [
    "30_profile.sql",
    `-- User profile state and presentation-facing configuration.
-- Includes user profiles, settings, avatars and profile RPCs.
`,
  ],
  [
    "35_social.sql",
    `-- Social graph and friend discovery state.
-- Includes friend codes, friendships and social RPCs.
`,
  ],
  [
    "40_geo_infrastructure.sql",
    `-- Physical recycling infrastructure.
-- Includes recycling points, point bins and waste-to-bin mappings.
`,
  ],
  [
    "45_offline_sync.sql",
    `-- Offline and local sync support.
-- Includes cached resources and pending operations staged on clients.
`,
  ],
  [
    "50_recycling_flow.sql",
    `-- Recycling sessions and confirmed recycling records.
-- Focused on the observable recycling flow and event persistence.
`,
  ],
  [
    "60_education_content.sql",
    `-- Educational content consumed by mobile and admin clients.
-- Includes content, instructions, steps, fun facts, indexes, RPCs, and policies.
`,
  ],
  [
    "70_gamification.sql",
    `-- Progression, streaks, medals and rewards logic.
-- Includes progress state, reward ownership, progression functions and trigger-driven updates.
`,
  ],
  [
    "80_admin_analytics.sql",
    `-- Administrative metrics and operational configuration.
-- Includes dashboard aggregates, snapshots, health helpers and system config.
`,
  ],
  [
    "95_permissions.sql",
    `-- Global permissions and publication ownership.
-- Domain-specific grants and revokes live with the owning domain.
`,
  ],
]);

const tableDomain = new Map([
  ["universities", "10_reference_data.sql"],
  ["campuses", "10_reference_data.sql"],
  ["bin_types", "10_reference_data.sql"],
  ["waste_types", "10_reference_data.sql"],
  ["roles", "10_reference_data.sql"],
  ["achievements", "10_reference_data.sql"],
  ["rewards", "10_reference_data.sql"],

  ["users", "20_identity_access.sql"],
  ["user_roles", "20_identity_access.sql"],

  ["avatars", "30_profile.sql"],
  ["user_profiles", "30_profile.sql"],
  ["user_settings", "30_profile.sql"],

  ["friend_codes", "35_social.sql"],
  ["friendships", "35_social.sql"],

  ["recycling_points", "40_geo_infrastructure.sql"],
  ["recycling_point_bins", "40_geo_infrastructure.sql"],
  ["map_waste_type_bin_types", "40_geo_infrastructure.sql"],

  ["cached_resources", "45_offline_sync.sql"],
  ["pending_operations", "45_offline_sync.sql"],

  ["recycling_records", "50_recycling_flow.sql"],
  ["recycling_sessions", "50_recycling_flow.sql"],

  ["educational_content", "60_education_content.sql"],
  ["instructions", "60_education_content.sql"],
  ["instruction_steps", "60_education_content.sql"],
  ["fun_facts", "60_education_content.sql"],

  ["user_progress", "70_gamification.sql"],
  ["user_rewards", "70_gamification.sql"],
  ["user_achievements", "70_gamification.sql"],
  ["user_featured_medals", "70_gamification.sql"],

  ["metric_snapshots", "80_admin_analytics.sql"],
  ["system_config", "80_admin_analytics.sql"],
  ["health_check", "80_admin_analytics.sql"],
]);

const internalFunctionDomain = new Map([
  ["app_auth.get_current_account", "20_identity_access.sql"],
  ["app_auth.handle_new_user", "20_identity_access.sql"],
  ["app_admin.is_current_user_admin", "20_identity_access.sql"],

  ["app_profile.update_user_avatar", "30_profile.sql"],
  ["app_social.get_friends_with_profile", "35_social.sql"],

  ["app_education.get_educational_categories", "60_education_content.sql"],
  ["app_education.get_educational_content_by_category", "60_education_content.sql"],
  ["app_education.get_educational_content_for_sync", "60_education_content.sql"],

  ["app_gamification.update_featured_medals", "70_gamification.sql"],

  ["app_analytics.get_admin_dashboard", "80_admin_analytics.sql"],
]);

const publicFunctionDomain = new Map([
  ["get_current_account", "20_identity_access.sql"],
  ["handle_new_user", "20_identity_access.sql"],
  ["is_current_user_admin", "20_identity_access.sql"],

  ["update_user_avatar", "30_profile.sql"],
  ["get_friends_with_profile", "35_social.sql"],

  ["get_educational_categories", "60_education_content.sql"],
  ["get_educational_content_by_category", "60_education_content.sql"],
  ["get_educational_content_for_sync", "60_education_content.sql"],

  ["apply_daily_heat_decay", "70_gamification.sql"],
  ["compute_streak_level", "70_gamification.sql"],
  ["get_progress_with_decay", "70_gamification.sql"],
  ["handle_post_segregation_progress", "70_gamification.sql"],
  ["heat_gain_for_level", "70_gamification.sql"],
  ["streak_level_checkpoint", "70_gamification.sql"],
  ["update_featured_medals", "70_gamification.sql"],

  ["count_public_tables", "80_admin_analytics.sql"],
  ["get_admin_dashboard", "80_admin_analytics.sql"],
]);

const appSchemaDomain = new Map([
  ["app_auth", "20_identity_access.sql"],
  ["app_admin", "20_identity_access.sql"],
  ["app_profile", "30_profile.sql"],
  ["app_social", "35_social.sql"],
  ["app_education", "60_education_content.sql"],
  ["app_gamification", "70_gamification.sql"],
  ["app_analytics", "80_admin_analytics.sql"],
]);

const testFunctionNames = new Set([
  "test_handle_new_user_on_insert",
  "test_handle_new_user_on_login",
  "test_handle_new_user_on_non_login_update",
  "test_no_duplicate_on_subsequent_login",
  "test_update_user_avatar_flow",
  "test_update_featured_medals_flow",
  "test_get_friends_with_profile_flow",
  "test_educational_content_fetch",
]);

function append(file, block) {
  outputs.set(file, `${outputs.get(file)}\n${block.trim()}\n`);
}

function collect(regex, handler) {
  for (const match of sql.matchAll(regex)) {
    handler(match[0], match);
  }
}

collect(/CREATE SCHEMA IF NOT EXISTS "(app_[^"]+)";\n/gi, (block) => {
  append("01_schemas.sql", block);
});

collect(/COMMENT ON SCHEMA "(app_[^"]+|public)" IS [\s\S]*?;\n/gi, (block) => {
  append("01_schemas.sql", block);
});

collect(/CREATE TABLE IF NOT EXISTS "public"\."([^"]+)"[\s\S]*?;\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append(file, block);
});

collect(/ALTER TABLE "public"\."([^"]+)" OWNER TO "postgres";\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append(file, block);
});

collect(/ALTER TABLE ONLY "public"\."([^"]+)"[\s\S]*?;\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append(file, block);
});

collect(/CREATE (?:UNIQUE )?INDEX [\s\S]*? ON "public"\."([^"]+)"[\s\S]*?;\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append(file, block);
});

collect(/CREATE OR REPLACE FUNCTION "(app_[^"]+)"\."([^"]+)"\([\s\S]*?\$\$;\n/gi, (block, match) => {
  const file = internalFunctionDomain.get(`${match[1]}.${match[2]}`);
  if (file) append(file, block);
});

collect(/CREATE OR REPLACE FUNCTION "public"\."([^"]+)"\([\s\S]*?\$\$;\n/gi, (block, match) => {
  const functionName = match[1];
  if (testFunctionNames.has(functionName)) return;

  const file = publicFunctionDomain.get(functionName);
  if (file) append(file, block);
});

collect(/CREATE OR REPLACE TRIGGER "([^"]+)"[\s\S]*?EXECUTE FUNCTION "public"\."([^"]+)"\(\);\n/gi, (block, match) => {
  const file = publicFunctionDomain.get(match[2]);
  if (file) append(file, block);
});

collect(/ALTER TABLE "public"\."([^"]+)" ENABLE ROW LEVEL SECURITY;\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append(file, block);
});

collect(/CREATE POLICY "[^"]+" ON "public"\."([^"]+)"[\s\S]*?;\n/gi, (block, match) => {
  const file = tableDomain.get(match[1]);
  if (file) append(file, block);
});

collect(/ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";\n/gi, (block) => {
  append("95_permissions.sql", block);
});

collect(/(?:GRANT|REVOKE) [\s\S]*?;\n/gi, (block) => {
  if (/ALTER DEFAULT PRIVILEGES/i.test(block)) return;
  if (/GRANT ALL ON SEQUENCES TO/i.test(block)) return;
  if (/GRANT ALL ON FUNCTIONS TO/i.test(block)) return;
  if (/GRANT ALL ON TABLES TO/i.test(block)) return;

  let match = block.match(/ON FUNCTION "(app_[^"]+)"\."([^"]+)"/i);
  if (match) {
    const file = internalFunctionDomain.get(`${match[1]}.${match[2]}`);
    if (file) {
      append(file, block);
      return;
    }
  }

  match = block.match(/ON FUNCTION "public"\."([^"]+)"/i);
  if (match) {
    const functionName = match[1];
    if (testFunctionNames.has(functionName)) return;

    const file = publicFunctionDomain.get(functionName);
    if (file) {
      append(file, block);
      return;
    }
  }

  match = block.match(/ON TABLE "public"\."([^"]+)"/i);
  if (match) {
    const file = tableDomain.get(match[1]);
    if (file) {
      append(file, block);
      return;
    }
  }

  match = block.match(/ON SCHEMA "(app_[^"]+)"/i);
  if (match) {
    const file = appSchemaDomain.get(match[1]);
    if (file) {
      append(file, block);
      return;
    }
  }

  append("95_permissions.sql", block);
});

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const [filename, content] of outputs) {
  fs.writeFileSync(path.join(outputDir, filename), `${content.trim()}\n`, "utf8");
}

const readme = `# Declarative Backend Schemas

This directory is the readable backend source for future database changes.

Organization rule:

- each file is a domain slice, not just an object type slice
- tables, indexes, constraints, functions, RLS, and domain-specific grants live close to the domain that owns them
- only truly global permissions stay in \`95_permissions.sql\`
- SQL test helpers are excluded from declarative production schemas

Workflow:

1. Edit the domain SQL file that owns the behavior.
2. Generate an additive migration:
   \`supabase db diff -f <change_name>\`
3. Review the generated SQL under \`supabase/migrations/\`.
4. Apply locally with \`supabase migration up\` or \`bun run db:reset\`.

Rules:

- Keep \`supabase/migrations/\` as immutable history once applied.
- Prefer stable public wrappers for client-facing RPC names.
- Keep internal implementation functions in \`app_*\` schemas.
- Keep data seeds and test helpers out of these files.
`;

fs.writeFileSync(path.join(outputDir, "README.md"), readme, "utf8");

const testsReadmePath = path.join(testsDir, "README.md");
if (fs.existsSync(testsReadmePath)) {
  const existing = fs.readFileSync(testsReadmePath, "utf8");
  const note = "Functions prefixed with `test_` are intentionally excluded from `supabase/schemas/`. Keep them under `supabase/tests/` or ad hoc fixtures instead of treating them as production schema.";
  if (!existing.includes(note)) {
    fs.writeFileSync(testsReadmePath, `${existing.trim()}\n\n## Declarative test helpers\n\n${note}\n`, "utf8");
  }
}

console.log(`Generated declarative schema files in ${outputDir}`);
