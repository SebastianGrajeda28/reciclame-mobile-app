import { supabase } from "@/lib/supabase";
import { ADMIN_RPCS } from "@reciclame/shared-domain";
import type { Account } from "@reciclame/shared-domain";

export type { Account };

export async function getCurrentAccount(): Promise<Account | null> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.currentAccount);
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as Account | null;
}
