import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../db";
import { funFacts, type NewFunFact } from "../../db/schema";
import { requireRole } from "../../middleware/roles";


const app = new Hono();

// GET /api/fun-facts?includeInactive=true
app.get("/", requireRole("ADMIN"), async (c) => {
  const includeInactive = c.req.query("includeInactive") === "true";

  const rows = includeInactive
    ? await db.select().from(funFacts)
    : await db.select().from(funFacts).where(eq(funFacts.isActive, true));

  return c.json(rows);
});

// GET /api/fun-facts/:id
app.get("/:id", requireRole("ADMIN"), async (c) => {
  const [funFact] = await db
    .select()
    .from(funFacts)
    .where(eq(funFacts.id, c.req.param("id")));
  if (!funFact) return c.json({ error: "Not found" }, 404);
  return c.json(funFact);
});

// POST /api/fun-facts
app.post("/", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Pick<NewFunFact, "text" | "wasteTypeId">>();

  if (!body.text) {
    return c.json({ error: "text es requerido" }, 400);
  }

  const [created] = await db
    .insert(funFacts)
    .values({
      text: body.text,
      wasteTypeId: body.wasteTypeId,
    })
    .returning();

  return c.json(created, 201);
});

// PUT /api/fun-facts/:id
app.put("/:id", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Partial<Pick<NewFunFact, "text" | "wasteTypeId">>>();

  if (body.text === undefined && body.wasteTypeId === undefined) {
    return c.json({ error: "No hay campos para actualizar" }, 400);
  }

  const [updated] = await db
    .update(funFacts)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(funFacts.id, c.req.param("id")))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// DELETE /api/fun-facts/:id — eliminación lógica
app.delete("/:id", requireRole("ADMIN"), async (c) => {
  const [deleted] = await db
    .update(funFacts)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(funFacts.id, c.req.param("id")))
    .returning();

  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Dato curioso desactivado", id: deleted.id });
});

// PATCH /api/fun-facts/:id/restore — restaurar eliminación lógica
app.patch("/:id/restore", requireRole("ADMIN"), async (c) => {
  const [restored] = await db
    .update(funFacts)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(funFacts.id, c.req.param("id")))
    .returning();

  if (!restored) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Dato curioso restaurado", id: restored.id });
});

export default app;

