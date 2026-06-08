import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { db } from "../db";
import { userRoles, roles } from "../db/schema";
import { eq, and } from "drizzle-orm";

type Variables = {
  user: User;
  roles: string[];
};

export const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const supabase = createClient(
    Bun.env.SUPABASE_URL!,
    Bun.env.SUPABASE_ANON_KEY!
  );

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const userRolesList = await db
    .select({ roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, data.user.id),
        eq(userRoles.isActive, true),
        eq(roles.isActive, true)
      )
    );

  const roleNames = userRolesList.map((r) => r.roleName);

  c.set("user", data.user);
  c.set("roles", roleNames);
  await next();
});