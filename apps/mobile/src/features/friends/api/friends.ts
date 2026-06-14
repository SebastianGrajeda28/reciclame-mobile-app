import { supabase } from '@/src/services/supabase/client';
import type { FriendMedal, FriendSummary } from '@/src/types/friend';

type FriendMedalRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

type FriendSummaryRow = {
  friend_id: string;
  name: string;
  current_streak: number;
  avatar_base_style: string | null;
  last_activity_at: string | null;
  featured_medals: FriendMedalRow[] | null;
};

function mapFriendMedal(row: FriendMedalRow): FriendMedal {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

function mapFriendSummary(row: FriendSummaryRow): FriendSummary {
  return {
    id: row.friend_id,
    name: row.name,
    currentStreak: row.current_streak,
    avatarUrl: row.avatar_base_style ?? null,
    lastActivityAt: row.last_activity_at ?? null,
    featuredMedals: (row.featured_medals ?? []).map(mapFriendMedal),
  };
}

/**
 * Obtiene el listado de amigos vinculados del usuario con sus agregados de perfil.
 *
 * Resuelve en una única consulta RPC: nombre, racha actual, avatar activo,
 * medallas destacadas y marca de tiempo de la última actividad de reciclaje.
 *
 * @param userId - ID del usuario autenticado.
 * @returns Lista de amigos ordenada alfabéticamente por nombre.
 * @throws Error si la consulta a Supabase falla.
 */
export async function getFriends(userId: string): Promise<FriendSummary[]> {
  const { data, error } = await supabase.rpc('get_friends_with_profile', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`No se pudo obtener la lista de amigos: ${error.message}`);
  }

  return (data ?? []).map(mapFriendSummary);
}
