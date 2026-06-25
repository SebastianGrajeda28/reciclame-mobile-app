/**
 * Shared Expo Push Notification sender.
 * Called internally by other edge functions — not exposed to the client.
 *
 * Payload: { tokens: string[], title: string, body: string, data?: Record<string, unknown> }
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface PushMessage {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
}

export interface PushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

export async function sendPushNotifications(msg: PushMessage): Promise<PushTicket[]> {
  if (msg.tokens.length === 0) return [];

  const messages = msg.tokens.map((to) => ({
    to,
    title: msg.title,
    body: msg.body,
    data: msg.data ?? {},
    sound: msg.sound ?? "default",
    ...(msg.badge !== undefined ? { badge: msg.badge } : {}),
  }));

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
    },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    throw new Error(`Expo Push API responded with ${res.status}: ${await res.text()}`);
  }

  const json: { data: PushTicket[] } = await res.json();
  return json.data;
}

// Also expose as an HTTP endpoint so it can be called directly if needed.
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: PushMessage;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const tickets = await sendPushNotifications(body);
    return Response.json({ tickets });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
