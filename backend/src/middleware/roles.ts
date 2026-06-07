import { createMiddleware } from "hono/factory";

export const requireRole = (...allowedRoles: string[]) =>
  createMiddleware(async (c, next) => {
    const roles = c.get("roles") as string[];
    const hasRole = allowedRoles.some((r) => roles.includes(r));

    if (!hasRole) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });