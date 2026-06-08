import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users, NewAppUser } from "../../db/schema";
import { requireRole } from "../../middleware/roles";

const app = new Hono();

// GET /api/users?includeInactive=true
app.get("/", requireRole("ADMIN"), async (c) => {
  const includeInactive = c.req.query("includeInactive") === "true";

  const rows = includeInactive
    ? await db.select().from(users)
    : await db.select().from(users).where(eq(users.isActive, true));

  return c.json(rows);
});

// GET /api/users/:id
app.get("/:id", requireRole("ADMIN"), async (c) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, c.req.param("id")));

  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json(user);
});

// POST /api/users
app.post("/", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Pick<NewAppUser, "email">>();

  if (!body.email) return c.json({ error: "email es requerido" }, 400);

  const [created] = await db.insert(users).values({ email: body.email }).returning();
  return c.json(created, 201);
});

// PUT /api/users/:id
app.put("/:id", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Partial<Pick<NewAppUser, "email" | "lastLoginAt">>>();

  const [updated] = await db
    .update(users)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(users.id, c.req.param("id")))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// DELETE /api/users/:id — eliminación lógica
app.delete("/:id", requireRole("ADMIN"), async (c) => {
  const [deleted] = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, c.req.param("id")))
    .returning();

  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Usuario desactivado", id: deleted.id });
});

// PATCH /api/users/:id/restore — restaurar eliminación lógica
app.patch("/:id/restore", requireRole("ADMIN"), async (c) => {
  const [restored] = await db
    .update(users)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(users.id, c.req.param("id")))
    .returning();

  if (!restored) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Usuario restaurado", id: restored.id });
});

export default app;
