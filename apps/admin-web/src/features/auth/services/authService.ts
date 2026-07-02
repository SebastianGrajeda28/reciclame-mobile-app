import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const authError = new Error(error.message) as Error & { status?: number };
    authError.status = error.status;
    throw authError;
  }
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    const authError = new Error(error.message) as Error & { status?: number };
    authError.status = error.status;
    throw authError;
  }
}

export async function updateCurrentUserPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const authError = new Error(error.message) as Error & { status?: number };
    authError.status = error.status;
    throw authError;
  }
}

export async function signOutCurrentUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    const authError = new Error(error.message) as Error & { status?: number };
    authError.status = error.status;
    throw authError;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export function onAuthStateChanged(callback: (event: string, session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return data.subscription;
}

export async function selfRevokeAccess(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_roles")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
}