/**
 * DB-trigger edge function — called when a friend unlocks an achievement.
 * Payload: { user_id: string, achiever_name: string, achievement_name: string }
 *
 * "user_id" is the friend who should receive the notification (the observer),
 * not the one who unlocked it.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPushNotifications } from "../send-push-notifications/index.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let payload: { user_id: string; achiever_name: string; achievement_name: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { user_id, achiever_name, achievement_name } = payload;
  if (!user_id || !achiever_name || !achievement_name) {
    return Response.json({ error: "user_id, achiever_name and achievement_name required" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: settings } = await db
    .from("user_settings")
    .select("notifications_enabled")
    .eq("user_id", user_id)
    .maybeSingle();

  if (!settings?.notifications_enabled) {
    return Response.json({ skipped: true });
  }

  const { data: tokenRows } = await db
    .from("push_tokens")
    .select("token")
    .eq("user_id", user_id);

  const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);
  if (tokens.length === 0) {
    return Response.json({ skipped: true });
  }

  await sendPushNotifications({
    tokens,
    title: `${achiever_name} desbloqueó un logro 🏆`,
    body: `"${achievement_name}" — ¡anímate y desbloquéalo tú también!`,
    data: { type: "friend_achievement", achiever_name, achievement_name },
  });

  return Response.json({ sent: tokens.length });
});
