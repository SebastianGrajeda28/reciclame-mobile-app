import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { wasteTypes } from "../../db/schema";
import { requireRole } from "../../middleware/roles";

const app = new Hono();

// GET /api/waste-types?includeInactive=true
app.get("/", requireRole("ADMIN"), async (c) => {
  const includeInactive = c.req.query("includeInactive") === "true";

  const rows = includeInactive
    ? await db.select().from(wasteTypes)
    : await db.select().from(wasteTypes).where(eq(wasteTypes.isActive, true));

  return c.json(rows);
});

export default app;
