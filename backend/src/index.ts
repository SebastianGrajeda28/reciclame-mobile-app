import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import educationalContent from "./modules/educational-content/routes";
import funFactsRoutes from "./modules/fun_facts/routes";
import userRolesRoutes from "./modules/user_roles/routes";
import usersRoutes from "./modules/users/routes";
import rolesRoutes from "./modules/roles/routes";
import type { User } from "@supabase/supabase-js";
import { client } from "./db";

type AppVariables = {
  user: User;
  roles: string[];
};

const app = new Hono<{ Variables: AppVariables }>();

app.use("*", cors({ origin: ["http://localhost:5173"], credentials: true }));

app.get("/api/health-db", async (c) => {
  try {
    await client`SELECT 1`;
    return c.json({ ok: true, message: "Conexión a la BD exitosa" });
  } catch (err) {
    const error = err as Record<string, unknown>;
    return c.json({
      ok: false,
      message: error.message ?? String(err),
      detail: error.detail ?? null,
      code: error.code ?? null,
    }, 500);
  }
});

app.use("/api/*", authMiddleware);

app.get("/api/me", (c) => {
  const user = c.get("user");
  const roles = c.get("roles");
  return c.json({
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.full_name ?? user.email ?? "",
    role: roles[0] ?? null,
  });
});

app.route("/api/educational-content", educationalContent);
app.route("/api/fun-facts", funFactsRoutes);
app.route("/api/user-roles", userRolesRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/roles", rolesRoutes);

export default { port: 3000, fetch: app.fetch };