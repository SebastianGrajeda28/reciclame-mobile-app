import { useMemo } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { User, UserRole } from '@/src/types/user';

function resolveRole(rawRole: unknown): UserRole {
  return rawRole === 'admin' || rawRole === 'sysadmin' ? rawRole : 'user';
}

export function useCurrentUser(): User | null {
  const { session } = useAuth();

  return useMemo(() => {
    const authUser = session?.user;
    if (!authUser) {
      return null;
    }

    const metadata = authUser.user_metadata ?? {};
    const displayName =
      metadata.full_name ??
      metadata.display_name ??
      metadata.name ??
      authUser.email?.split('@')[0] ??
      'Usuario';

    return {
      id: authUser.id,
      displayName,
      email: authUser.email,
      avatarUrl: metadata.avatar_url ?? metadata.picture,
      createdAt: authUser.created_at,
      role: resolveRole(metadata.role),
    };
  }, [session]);
}
