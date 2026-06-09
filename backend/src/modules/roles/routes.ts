import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { roles } from "../../db/schema";
import { requireRole } from "../../middleware/roles";

const app = new Hono();

app.get("/", requireRole("ADMIN"), async (c) => {
  const rows = await db.select().from(roles).where(eq(roles.isActive, true));
  return c.json(rows);
});

export default app;
