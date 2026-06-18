import { supabase } from '@/src/services/supabase/client';

export type ProfileSummary = {
  totalWeightKg: number;
  totalItems: number;
  memberSince: string;
  achievementsCount: number;
};

/**
 * Llama al RPC `get_profile_summary` para obtener las estadísticas consolidadas del perfil del usuario.
 * Retorna el peso total en kg, artículos reciclados, fecha de registro y logros completados.
 *
 * @param userId ID del usuario logueado.
 * @returns Objeto ProfileSummary o null si no se encontraron datos.
 */
export async function getProfileSummary(userId: string): Promise<ProfileSummary | null> {
  const { data, error } = await supabase.rpc('get_profile_summary', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to fetch profile summary: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const row = data[0];
  return {
    totalWeightKg: Number(row.total_weight_kg ?? 0),
    totalItems: Number(row.total_items ?? 0),
    memberSince: row.member_since,
    achievementsCount: Number(row.achievements_count ?? 0),
  };
}
