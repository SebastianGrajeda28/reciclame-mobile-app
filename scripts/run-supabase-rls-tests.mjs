import { createReadStream, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const sqlPath = resolve(repoRoot, "supabase/tests/rls_behavior.sql");

if (!existsSync(sqlPath)) {
  console.error(`SQL test file not found: ${sqlPath}`);
  process.exit(1);
}

const args = [
  "exec",
  "-i",
  "supabase_db_reciclame-mobile-app",
  "psql",
  "-h",
  "127.0.0.1",
  "-v",
  "ON_ERROR_STOP=1",
  "-U",
  "postgres",
  "-d",
  "postgres",
];

const child = spawn("docker", args, {
  cwd: repoRoot,
  stdio: ["pipe", "inherit", "inherit"],
});

createReadStream(sqlPath).pipe(child.stdin);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("Failed to run docker exec for SQL RLS tests.");
  console.error(error);
  process.exit(1);
});
