/**
 * Cron edge function — runs at 12:00 and 20:00 local time (configured in supabase/config.toml).
 * Sends a push notification to users who:
 *   - have not recycled today
 *   - have notifications_enabled = true
 *   - have at least one registered push token
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPushNotifications } from "../send-push-notifications/index.ts";

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find users who haven't recycled today and have notifications on
  const today = new Date().toISOString().slice(0, 10);

  const { data: targets, error } = await db.rpc("get_streak_reminder_targets", {
    p_date: today,
  });

  if (error) {
    console.error("[notify-streak-reminder] RPC error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!targets || targets.length === 0) {
    return Response.json({ sent: 0 });
  }

  const userIds: string[] = targets.map((t: { user_id: string }) => t.user_id);

  const { data: tokenRows } = await db
    .from("push_tokens")
    .select("token")
    .in("user_id", userIds);

  const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);

  if (tokens.length === 0) {
    return Response.json({ sent: 0 });
  }

  await sendPushNotifications({
    tokens,
    title: "¡No olvides reciclar hoy! ♻️",
    body: "Mantén tu racha viva. Recicla antes de que termine el día.",
    data: { type: "streak_reminder" },
  });

  return Response.json({ sent: tokens.length });
});
