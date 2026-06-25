/**
 * DB-trigger edge function — called when a user's streak is reset to 0.
 * Payload: { user_id: string, previous_streak: number }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPushNotifications } from "../send-push-notifications/index.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let payload: { user_id: string; previous_streak: number };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { user_id, previous_streak } = payload;
  if (!user_id) {
    return Response.json({ error: "user_id required" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Check notifications enabled
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

  const streakText = previous_streak > 0 ? ` de ${previous_streak} días` : "";

  await sendPushNotifications({
    tokens,
    title: "Tu racha se reinició 😢",
    body: `Perdiste tu racha${streakText}. ¡Hoy es un buen día para empezar de nuevo!`,
    data: { type: "streak_dropped", previous_streak },
  });

  return Response.json({ sent: tokens.length });
});
