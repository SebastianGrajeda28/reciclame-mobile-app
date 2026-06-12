import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { instructions, instructionSteps, type NewInstructionStep } from "../../db/schema";
import { requireRole } from "../../middleware/roles";

const app = new Hono();

// GET /api/instruction-steps?instructionId=uuid&includeInactive=true
app.get("/", requireRole("ADMIN"), async (c) => {
  const instructionId = c.req.query("instructionId");
  const includeInactive = c.req.query("includeInactive") === "true";

  const conditions = [];
  if (instructionId) conditions.push(eq(instructionSteps.instructionId, instructionId));
  if (!includeInactive) conditions.push(eq(instructionSteps.isActive, true));

  const rows = conditions.length > 0
    ? await db.select().from(instructionSteps).where(and(...conditions))
    : await db.select().from(instructionSteps);

  return c.json(rows);
});

// GET /api/instruction-steps/:id
app.get("/:id", requireRole("ADMIN"), async (c) => {
  const [step] = await db
    .select()
    .from(instructionSteps)
    .where(eq(instructionSteps.id, c.req.param("id")));

  if (!step) return c.json({ error: "Not found" }, 404);
  return c.json(step);
});

// POST /api/instruction-steps
app.post("/", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Pick<NewInstructionStep, "instructionId" | "text">>();

  if (!body.instructionId || !body.text) {
    return c.json({ error: "instructionId y text son requeridos" }, 400);
  }

  // Verificar que la instrucción padre existe
  const [parent] = await db
    .select({ id: instructions.id })
    .from(instructions)
    .where(eq(instructions.id, body.instructionId));

  if (!parent) {
    return c.json({ error: `Instrucción '${body.instructionId}' no encontrada` }, 400);
  }

  const [created] = await db
    .insert(instructionSteps)
    .values({ instructionId: body.instructionId, text: body.text })
    .returning();

  return c.json(created, 201);
});

// PUT /api/instruction-steps/:id
app.put("/:id", requireRole("ADMIN"), async (c) => {
  const body = await c.req.json<Partial<Pick<NewInstructionStep, "text" | "imageUrl">>>();

  if (!body.text && body.imageUrl === undefined) {
    return c.json({ error: "Se requiere al menos text o imageUrl" }, 400);
  }

  const patch: Partial<NewInstructionStep> = { updatedAt: new Date() };
  if (body.text !== undefined) patch.text = body.text;
  if (body.imageUrl !== undefined) patch.imageUrl = body.imageUrl;

  const [updated] = await db
    .update(instructionSteps)
    .set(patch)
    .where(eq(instructionSteps.id, c.req.param("id")))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// DELETE /api/instruction-steps/:id — eliminación lógica
app.delete("/:id", requireRole("ADMIN"), async (c) => {
  const [deleted] = await db
    .update(instructionSteps)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(instructionSteps.id, c.req.param("id")))
    .returning();

  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Paso desactivado", id: deleted.id });
});

// PATCH /api/instruction-steps/:id/restore — restaurar eliminación lógica
app.patch("/:id/restore", requireRole("ADMIN"), async (c) => {
  const [restored] = await db
    .update(instructionSteps)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(instructionSteps.id, c.req.param("id")))
    .returning();

  if (!restored) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Paso restaurado", id: restored.id });
});

export default app;
