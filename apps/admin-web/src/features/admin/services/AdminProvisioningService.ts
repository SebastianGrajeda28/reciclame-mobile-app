import { supabase } from "@/lib/supabase";
import { ADMIN_EDGE_FUNCTIONS } from "@reciclame/shared-domain";

export type ProvisionAdminUserInput = {
  email: string;
  password?: string;
  name: string;
  roleName: "ADMIN" | "MANAGER";
};

export async function provisionAdminUser(input: ProvisionAdminUserInput): Promise<void> {
  const { data, error } = await supabase.functions.invoke(ADMIN_EDGE_FUNCTIONS.provisionUser, {
    body: input,
  });

  if (error) throw new Error(error.message || "Error al crear usuario.");

  const response = data as { error?: string } | null;
  if (response?.error) throw new Error(response.error);
}

