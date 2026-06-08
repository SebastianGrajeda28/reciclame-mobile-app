import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { userRoles, roles } from "../../db/schema";
import { requireRole } from "../../middleware/roles";

type NewUserRole = typeof userRoles.$inferInsert;

const app = new Hono();

// GET /api/user-roles?userId=xxx  — lista asignaciones (activas por defecto)
app.get("/", requireRole("ADMIN"), async (c) => {
  const userId = c.req.query("userId");
  const includeInactive = c.req.query("includeInactive") === "true";

  const conditions = [];
  if (userId) conditions.push(eq(userRoles.userId, userId));
  if (!includeInactive) conditions.push(eq(userRoles.isActive, true));

  const rows = await db
    .select({
      id: userRoles.id,
      userId: userRoles.userId,
      roleId: userRoles.roleId,
      roleName: roles.name,
      assignedAt: userRoles.assignedAt,
      isActive: userRoles.isActive,
      createdAt: userRoles.createdAt,
      updatedAt: userRoles.updatedAt,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(conditions.length ? and(...conditions as [ReturnType<typeof eq>, ...ReturnType<typeof eq>[]]) : undefined);

  return c.json(rows);
});

// GET /api/user-roles/:id
app.get("/:id", requireRole("ADMIN"), async (c) => {
  const [row] = await db
    .select({
      id: userRoles.id,
      userId: userRoles.userId,
      roleId: userRoles.roleId,
      roleName: roles.name,
      assignedAt: userRoles.assignedAt,
      isActive: userRoles.isActive,
      createdAt: userRoles.createdAt,
      updatedAt: userRoles.updatedAt,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.id, c.req.param("id")));

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

// POST /api/user-roles — asignar rol a usuario
app.post("/", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Pick<NewUserRole, "userId" | "roleId">>();

  if (!body.userId || !body.roleId) {
    return c.json({ error: "userId y roleId son requeridos" }, 400);
  }

  const [created] = await db
    .insert(userRoles)
    .values({ userId: body.userId, roleId: body.roleId })
    .returning();

  return c.json(created, 201);
});

// PUT /api/user-roles/:id — actualizar asignación (cambiar roleId)
app.put("/:id", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Pick<NewUserRole, "roleId">>();

  if (!body.roleId) {
    return c.json({ error: "roleId es requerido" }, 400);
  }

  const [updated] = await db
    .update(userRoles)
    .set({ roleId: body.roleId, updatedAt: new Date() })
    .where(eq(userRoles.id, c.req.param("id")))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// DELETE /api/user-roles/:id — eliminación lógica
app.delete("/:id", requireRole("ADMIN"), async (c) => {
  const [deleted] = await db
    .update(userRoles)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(userRoles.id, c.req.param("id")), eq(userRoles.isActive, true)))
    .returning();

  if (!deleted) return c.json({ error: "Not found o ya inactivo" }, 404);
  return c.json({ message: "Rol desactivado", id: deleted.id });
});

// PATCH /api/user-roles/:id/restore — restaurar eliminación lógica
app.patch("/:id/restore", requireRole("ADMIN"), async (c) => {
  const [restored] = await db
    .update(userRoles)
    .set({ isActive: true, updatedAt: new Date() })
    .where(and(eq(userRoles.id, c.req.param("id")), eq(userRoles.isActive, false)))
    .returning();

  if (!restored) return c.json({ error: "Not found o ya activo" }, 404);
  return c.json({ message: "Rol restaurado", id: restored.id });
});

export default app;
