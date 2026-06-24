/**
 * Cron edge function — runs every 6 hours.
 * Sends a push notification to users who haven't recycled in more than 48 hours
 * and have notifications_enabled = true.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPushNotifications } from "../send-push-notifications/index.ts";

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: targets, error } = await db.rpc("get_inactive_48h_targets");

  if (error) {
    console.error("[notify-48h-inactive] RPC error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!targets || targets.length === 0) {
    return Response.json({ sent: 0 });
  }

  const userIds: string[] = targets.map((t: { user_id: string }) => t.user_id);

  const { data: tokenRows } = await db
    .from("push_tokens")
    .select("token, user_id")
    .in("user_id", userIds);

  const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);

  if (tokens.length === 0) {
    return Response.json({ sent: 0 });
  }

  await sendPushNotifications({
    tokens,
    title: "¡Han pasado 2 días sin reciclar! ♻️",
    body: "El planeta te necesita. Recicla hoy y mantén tus hábitos verdes.",
    data: { type: "inactive_48h" },
  });

  return Response.json({ sent: tokens.length });
});
