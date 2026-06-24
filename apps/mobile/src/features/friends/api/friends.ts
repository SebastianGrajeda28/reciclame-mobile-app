import { supabase } from '@/src/services/supabase/client';
import type { FriendMedal, FriendRequest, FriendSummary } from '@/src/types/friend';

type FriendMedalRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type FriendSummaryRow = {
  friend_id: string;
  name: string;
  current_streak: number;
  avatar_base_style: string | null;
  avatar_config: Record<string, unknown> | null;
  last_activity_at: string | null;
  featured_medals: FriendMedalRow[] | null;
};

function mapFriendMedal(row: FriendMedalRow): FriendMedal {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
  };
}

function mapFriendSummary(row: FriendSummaryRow): FriendSummary {
  return {
    id: row.friend_id,
    name: row.name,
    currentStreak: row.current_streak,
    avatarUrl: row.avatar_base_style ?? null,
    avatarConfig: row.avatar_config ?? null,
    lastActivityAt: row.last_activity_at ?? null,
    featuredMedals: (row.featured_medals ?? []).map(mapFriendMedal),
  };
}

/**
 * Obtiene el código único de amigo del usuario autenticado.
 * El backend lo genera si aún no existe (get-or-create) y resuelve la identidad vía auth.uid().
 *
 * @returns Código de 8 dígitos numéricos único del usuario.
 * @throws Error si la consulta a Supabase falla o no devuelve código.
 */
export async function getMyFriendCode(): Promise<string> {
  const { data, error } = await supabase.rpc('get_my_friend_code');

  if (error) {
    throw new Error(`No se pudo obtener tu código de amigo: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo obtener tu código de amigo.');
  }

  return data as string;
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
export type AddFriendResult = { friendshipId: string; friendId: string; created: boolean };

const ADD_FRIEND_ERRORS: Record<string, string> = {
  'invalid friend code': 'Ingresa un código de amigo válido.',
  'friend code not found': 'No encontramos ningún usuario con ese código.',
  'cannot add yourself': 'No puedes agregarte a ti mismo.',
  unauthenticated: 'Debes iniciar sesión para agregar amigos.',
  'friend request already pending': 'Ya tienes una solicitud pendiente con este usuario.',
  'already friends': 'Ya son amigos.',
  'user blocked': 'No puedes enviar una solicitud a este usuario.',
};

export async function addFriendByCode(code: string): Promise<AddFriendResult> {
  const { data, error } = await supabase.rpc('add_friend_by_code', { p_code: code });
  if (error) {
    throw new Error(ADD_FRIEND_ERRORS[error.message] ?? `No se pudo agregar al amigo: ${error.message}`);
  }
  if (!data) {
    throw new Error('No se pudo agregar al amigo.');
  }
  const row = data as { friendship_id: string; friend_id: string; created: boolean };
  return { friendshipId: row.friendship_id, friendId: row.friend_id, created: row.created };
}

type FriendRequestRow = {
  friendship_id: string;
  requester_id: string;
  name: string;
  avatar_config: Record<string, unknown> | null;
  featured_medals: FriendMedalRow[] | null;
  created_at: string;
};

function mapFriendRequest(row: FriendRequestRow): FriendRequest {
  return {
    id: row.friendship_id,
    requesterId: row.requester_id,
    name: row.name,
    avatarConfig: row.avatar_config ?? null,
    featuredMedals: (row.featured_medals ?? []).map(mapFriendMedal),
    createdAt: row.created_at,
  };
}

export async function getPendingRequests(): Promise<FriendRequest[]> {
  const { data, error } = await supabase.rpc('get_pending_friend_requests');
  if (error) {
    throw new Error(`No se pudieron obtener las solicitudes: ${error.message}`);
  }
  return (data ?? []).map(mapFriendRequest);
}

export type RespondResult = { friendshipId: string; action: 'accept' | 'decline' };

const RESPOND_ERRORS: Record<string, string> = {
  unauthenticated: 'Debes iniciar sesión para responder solicitudes.',
  'invalid action': 'Acción no válida.',
  'request not found or already responded': 'La solicitud ya fue respondida o no existe.',
};

export async function respondToRequest(
  friendshipId: string,
  action: 'accept' | 'decline',
): Promise<RespondResult> {
  const { data, error } = await supabase.rpc('respond_to_friend_request', {
    p_friendship_id: friendshipId,
    p_action: action,
  });
  if (error) {
    throw new Error(RESPOND_ERRORS[error.message] ?? `No se pudo responder la solicitud: ${error.message}`);
  }
  if (!data) {
    throw new Error('No se pudo responder la solicitud.');
  }
  const row = data as { friendship_id: string; action: string };
  return { friendshipId: row.friendship_id, action: row.action as 'accept' | 'decline' };
}

export async function getFriends(userId: string): Promise<FriendSummary[]> {
  const { data, error } = await supabase.rpc('get_friends_with_profile', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`No se pudo obtener la lista de amigos: ${error.message}`);
  }

  return (data ?? []).map(mapFriendSummary);
}
