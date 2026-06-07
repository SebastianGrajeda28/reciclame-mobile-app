import { Hono } from "hono";
import { requireRole } from "../../middleware/roles";
import { db } from "../../db";
import { educationalContent, NewEducationalContent } from "../../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

app.get("/", async (c) => {
  const items = await db.select().from(educationalContent);
  return c.json(items);
});

app.get("/:id", async (c) => {
  const [item] = await db
    .select()
    .from(educationalContent)
    .where(eq(educationalContent.id, c.req.param("id")));
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item);
});

app.post("/", requireRole("ADMIN", "EDITOR"), async (c) => {
  const body = await c.req.json<NewEducationalContent>();
  const [created] = await db.insert(educationalContent).values(body).returning();
  return c.json(created, 201);
});

app.put("/:id", requireRole("ADMIN", "EDITOR"), async (c) => {
  const body = await c.req.json<Partial<NewEducationalContent>>();
  const [updated] = await db
    .update(educationalContent)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(educationalContent.id, c.req.param("id")))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

app.delete("/:id", requireRole("ADMIN"), async (c) => {
  const [deleted] = await db
    .delete(educationalContent)
    .where(eq(educationalContent.id, c.req.param("id")))
    .returning();
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Deleted" });
});

export default app;
