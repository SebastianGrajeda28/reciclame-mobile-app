import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import educationalContent from "./modules/educational-content/routes";

const app = new Hono();

app.use("*", cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use("/api/*", authMiddleware);

app.route("/api/educational-content", educationalContent);
// app.route("/api/otro-modulo", otroModulo);

export default { port: 3000, fetch: app.fetch };