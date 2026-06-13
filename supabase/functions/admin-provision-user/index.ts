import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ProvisionPayload = {
  email?: string;
  password?: string;
  name?: string;
  roleName?: "ADMIN" | "MANAGER" | "VIEWER" | string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return Response.json({ error: "Supabase env is not configured" }, { status: 500, headers: corsHeaders });
  }

  if (!authorization) {
    return Response.json({ error: "Missing authorization header" }, { status: 401, headers: corsHeaders });
  }

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !caller) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const { data: roleRows, error: rolesError } = await serviceClient
    .from("user_roles")
    .select("is_active, roles!inner(name, is_active)")
    .eq("user_id", caller.id)
    .eq("is_active", true);

  if (rolesError) {
    return Response.json({ error: rolesError.message }, { status: 500, headers: corsHeaders });
  }

  const isAdmin = (roleRows ?? []).some((row: any) => row.roles?.name === "ADMIN" && row.roles?.is_active === true);

  if (!isAdmin) {
    return Response.json({ error: "Admin role required" }, { status: 403, headers: corsHeaders });
  }

  let body: ProvisionPayload;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const { email, password, name, roleName } = body;

  if (!email || !password || !roleName) {
    return Response.json({ error: "email, password y roleName son requeridos" }, { status: 400, headers: corsHeaders });
  }

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: name ?? "" },
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return Response.json(
      { error: authError?.message ?? "Error al crear usuario en Auth" },
      { status: 400, headers: corsHeaders }
    );
  }

  const newUserId = authData.user.id;

  const { error: userInsertError } = await serviceClient
    .from("users")
    .upsert({ id: newUserId, email }, { onConflict: "id", ignoreDuplicates: false });

  if (userInsertError) {
    await serviceClient.auth.admin.deleteUser(newUserId);
    return Response.json({ error: userInsertError.message }, { status: 500, headers: corsHeaders });
  }

  const { data: role, error: roleLookupError } = await serviceClient
    .from("roles")
    .select("id, name")
    .eq("name", roleName)
    .eq("is_active", true)
    .maybeSingle();

  if (roleLookupError || !role) {
    await serviceClient.auth.admin.deleteUser(newUserId);
    return Response.json(
      { error: roleLookupError?.message ?? `Rol '${roleName}' no encontrado` },
      { status: 400, headers: corsHeaders }
    );
  }

  const { error: userRoleError } = await serviceClient.from("user_roles").insert({
    user_id: newUserId,
    role_id: role.id,
  });

  if (userRoleError) {
    await serviceClient.auth.admin.deleteUser(newUserId);
    return Response.json({ error: userRoleError.message }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ message: "Usuario creado", userId: newUserId }, { status: 201, headers: corsHeaders });
});
