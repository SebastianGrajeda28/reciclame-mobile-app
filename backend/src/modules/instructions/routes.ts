import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { instructions, type NewInstruction } from "../../db/schema";
import { requireRole } from "../../middleware/roles";

const app = new Hono();

// GET /api/instructions?includeInactive=true
app.get("/", requireRole("ADMIN"), async (c) => {
  const includeInactive = c.req.query("includeInactive") === "true";

  const rows = includeInactive
    ? await db.select().from(instructions)
    : await db.select().from(instructions).where(eq(instructions.isActive, true));

  return c.json(rows);
});

// GET /api/instructions/:id
app.get("/:id", requireRole("ADMIN"), async (c) => {
  const [instruction] = await db
    .select()
    .from(instructions)
    .where(eq(instructions.id, c.req.param("id")));

  if (!instruction) return c.json({ error: "Not found" }, 404);
  return c.json(instruction);
});

// POST /api/instructions
app.post("/", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Pick<NewInstruction, "title" | "body" | "imageUrl" | "wasteTypeId">>();

  if (!body.title) {
    return c.json({ error: "title es requerido" }, 400);
  }

  const [created] = await db
    .insert(instructions)
    .values({
      title: body.title,
      body: body.body,
      imageUrl: body.imageUrl,
      wasteTypeId: body.wasteTypeId,
    })
    .returning();

  return c.json(created, 201);
});

// PUT /api/instructions/:id
app.put("/:id", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Partial<Pick<NewInstruction, "title" | "body" | "imageUrl" | "wasteTypeId">>>();

  if (!body.title && body.body === undefined && body.imageUrl === undefined && body.wasteTypeId === undefined) {
    return c.json({ error: "No hay campos para actualizar" }, 400);
  }

  const [updated] = await db
    .update(instructions)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(instructions.id, c.req.param("id")))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// DELETE /api/instructions/:id — eliminación lógica
app.delete("/:id", requireRole("ADMIN"), async (c) => {
  const [deleted] = await db
    .update(instructions)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(instructions.id, c.req.param("id")))
    .returning();

  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Instrucción desactivada", id: deleted.id });
});

// PATCH /api/instructions/:id/restore — restaurar eliminación lógica
app.patch("/:id/restore", requireRole("ADMIN"), async (c) => {
  const [restored] = await db
    .update(instructions)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(instructions.id, c.req.param("id")))
    .returning();

  if (!restored) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Instrucción restaurada", id: restored.id });
});

export default app;
