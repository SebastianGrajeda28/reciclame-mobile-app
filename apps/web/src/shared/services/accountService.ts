import { supabase } from "@/lib/supabase";
import { ADMIN_RPCS } from "@reciclame/shared-domain";

export interface Account {
  id: string;
  email: string;
  name: string;
  role: string | null;
}

export async function getCurrentAccount(): Promise<Account | null> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.currentAccount);
  if (error) throw new Error(error.message);
  return (data ?? null) as Account | null;
}