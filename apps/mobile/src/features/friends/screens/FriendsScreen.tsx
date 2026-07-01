import { useFocusEffect } from '@react-navigation/native';
import { router, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarComposer } from '@/src/avatar';
import type { AvatarConfig } from '@/src/avatar/avatarCatalog';
import { routes } from '@/src/constants/routes';
import { useFriends } from '@/src/features/friends/hooks/useFriends';
import { usePendingRequests } from '@/src/features/friends/hooks/usePendingRequests';
import { useRespondToRequest } from '@/src/features/friends/hooks/useRespondToRequest';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import type { FriendMedal, FriendRequest, FriendSummary } from '@/src/types/friend';
import {
  AppButton,
  AppIcon,
  AppIconButton,
  AppSegmentedControl,
  AppText,
  BADGE_STATIC_DATA,
  StreakHeatBadge,
  theme,
} from '@/src/ui';
import { formatRelativeTime } from '@/src/utils/dates';

type Tab = 'friends' | 'requests';

const MAX_VISIBLE_MEDALS = 3;

const SEGMENTS: { value: Tab; label: string }[] = [
  { value: 'friends', label: 'Amigos' },
  { value: 'requests', label: 'Solicitudes' },
];

function buildInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase())
    .join('');
}

// ── Shared: avatar ────────────────────────────────────────────────────────────

function UserAvatar({
  name,
  avatarConfig,
  avatarUrl,
}: {
  name: string;
  avatarConfig?: Record<string, unknown> | null;
  avatarUrl?: string | null;
}) {
  const initials = buildInitials(name);
  const config = avatarConfig as AvatarConfig | null | undefined;

  return (
    <View style={styles.avatarShell}>
      {config ? (
        <AvatarComposer config={config} size={68} blink={false} />
      ) : avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarFallback}>
          <AppText variant="h4" style={styles.avatarInitials}>
            {initials}
          </AppText>
        </View>
      )}
    </View>
  );
}

// ── Shared: medal strip ───────────────────────────────────────────────────────

function FriendMedalBadge({ medal }: { medal: FriendMedal }) {
  const localImage = BADGE_STATIC_DATA[medal.slug]?.image;
  return (
    <View style={styles.medalBadge}>
      {localImage ? (
        <Image source={localImage} style={styles.medalImage} resizeMode="contain" />
      ) : (
        <AppIcon name="award" size={theme.iconSizes.sm} color={theme.colors.success} />
      )}
    </View>
  );
}

function FriendMedalStrip({ medals }: { medals: FriendMedal[] }) {
  const visible = medals.slice(0, MAX_VISIBLE_MEDALS);

  if (visible.length === 0) {
    return (
      <AppText variant="caption" muted>
        Sin medallas destacadas
      </AppText>
    );
  }

  return (
    <View style={styles.medalStrip}>
      {visible.map((medal) => (
        <FriendMedalBadge key={medal.id} medal={medal} />
      ))}
    </View>
  );
}

// ── Friends tab ───────────────────────────────────────────────────────────────

type FriendsTabProps = {
  data: FriendSummary[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
  refetch: () => void;
};

function FriendListItem({ friend }: { friend: FriendSummary }) {
  return (
    <View style={styles.card}>
      <UserAvatar name={friend.name} avatarConfig={friend.avatarConfig} avatarUrl={friend.avatarUrl} />
      <View style={styles.cardBody}>
        <AppText variant="h4" numberOfLines={1} style={styles.cardName}>
          {friend.name}
        </AppText>
        <FriendMedalStrip medals={friend.featuredMedals} />
        {friend.lastActivityAt ? (
          <AppText variant="caption" muted>
            {formatRelativeTime(friend.lastActivityAt)}
          </AppText>
        ) : null}
      </View>
      <View style={styles.streakBox}>
        <StreakHeatBadge
          streakDays={friend.currentStreak}
          level={friend.currentLevel}
          heat={friend.currentHeat}
        />
      </View>
    </View>
  );
}

function FriendsEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Image
        source={require('@/assets/images/no-friends-list.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <AppText variant="h4" style={styles.emptyTitle}>
        No tienes amigos.. aún
      </AppText>
      <AppText variant="caption" muted style={styles.emptyDescription}>
        Parece que todavía no tienes amigos agregados. ¡Invita a tus amigos y juntos hagan la
        diferencia!
      </AppText>
    </View>
  );
}

function FriendsTab({ data: friends, loading, refreshing, error, refresh, refetch }: FriendsTabProps) {
  const showInitialLoading = loading && friends.length === 0;

  if (showInitialLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <AppIcon name="alertCircle" size={theme.iconSizes.xl} color={theme.colors.danger} />
        <AppText variant="h4" style={styles.errorTitle}>
          No pudimos cargar tus amigos
        </AppText>
        <AppText variant="bodyS" muted style={styles.errorMessage}>
          {error}
        </AppText>
        <AppButton label="Reintentar" variant="outline" onPress={refetch} />
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(friend) => friend.id}
      renderItem={({ item }) => <FriendListItem friend={item} />}
      contentContainerStyle={[
        styles.listContent,
        friends.length === 0 ? styles.emptyListContent : null,
      ]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<FriendsEmptyState />}
      refreshing={refreshing}
      onRefresh={refresh}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ── Requests tab ──────────────────────────────────────────────────────────────

type RequestsTabProps = {
  data: FriendRequest[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
  refetch: () => void;
  onRespond: (friendshipId: string, action: 'accept' | 'decline') => void;
};

function FriendRequestItem({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <View style={styles.card}>
      <UserAvatar name={request.name} avatarConfig={request.avatarConfig} />
      <View style={styles.cardBody}>
        <AppText variant="h4" numberOfLines={1} style={styles.cardName}>
          {request.name}
        </AppText>
        <FriendMedalStrip medals={request.featuredMedals} />
      </View>
      <View style={styles.requestActions}>
        <AppIconButton
          accessibilityLabel="Aceptar solicitud"
          variant="primary"
          onPress={onAccept}
          icon={<AppIcon name="plus" size={theme.iconSizes.sm} color={theme.colors.textPrimary} />}
          style={styles.actionButton}
        />
        <AppIconButton
          accessibilityLabel="Rechazar solicitud"
          variant="danger"
          onPress={onReject}
          icon={<AppIcon name="trash" size={theme.iconSizes.sm} color={theme.colors.textInverse} />}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

function RequestsEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Image
        source={require('@/assets/images/no-friend-requests.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <AppText variant="h4" style={styles.emptyTitle}>
        No tienes solicitudes.. aún
      </AppText>
    </View>
  );
}

function RequestsTab({
  data: requests,
  loading,
  refreshing,
  error,
  refresh,
  refetch,
  onRespond,
}: RequestsTabProps) {
  const showInitialLoading = loading && requests.length === 0;

  if (showInitialLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <AppIcon name="alertCircle" size={theme.iconSizes.xl} color={theme.colors.danger} />
        <AppText variant="h4" style={styles.errorTitle}>
          No pudimos cargar las solicitudes
        </AppText>
        <AppText variant="bodyS" muted style={styles.errorMessage}>
          {error}
        </AppText>
        <AppButton label="Reintentar" variant="outline" onPress={refetch} />
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(req) => req.id}
      renderItem={({ item }) => (
        <FriendRequestItem
          request={item}
          onAccept={() => onRespond(item.id, 'accept')}
          onReject={() => onRespond(item.id, 'decline')}
        />
      )}
      contentContainerStyle={[
        styles.listContent,
        requests.length === 0 ? styles.emptyListContent : null,
      ]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<RequestsEmptyState />}
      refreshing={refreshing}
      onRefresh={refresh}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ── Root screen ───────────────────────────────────────────────────────────────

export function FriendsScreen() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  const friendsState = useFriends(currentUser?.id ?? null);
  const requestsState = usePendingRequests();
  const { submit } = useRespondToRequest();

  const hasMounted = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasMounted.current) {
        friendsState.refresh();
        requestsState.refresh();
      } else {
        hasMounted.current = true;
      }
    }, [friendsState.refresh, requestsState.refresh]),
  );

  const handleRespond = useCallback(
    async (friendshipId: string, action: 'accept' | 'decline') => {
      const ok = await submit(friendshipId, action);
      if (ok) {
        requestsState.refresh();
        if (action === 'accept') friendsState.refresh();
      }
    },
    [submit, requestsState.refresh, friendsState.refresh],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="h3" style={styles.headerTitle}>
          Amigos
        </AppText>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.segmentedWrapper}>
        <AppSegmentedControl segments={SEGMENTS} value={activeTab} onChange={setActiveTab} />
      </View>

      {activeTab === 'friends' ? (
        <FriendsTab
          data={friendsState.data}
          loading={friendsState.loading}
          refreshing={friendsState.refreshing}
          error={friendsState.error}
          refresh={friendsState.refresh}
          refetch={friendsState.refetch}
        />
      ) : (
        <RequestsTab
          data={requestsState.data}
          loading={requestsState.loading}
          refreshing={requestsState.refreshing}
          error={requestsState.error}
          refresh={requestsState.refresh}
          refetch={requestsState.refetch}
          onRespond={handleRespond}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar amigo"
        onPress={() => router.push(routes.friendsAdd as Href)}
        style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
      >
        <AppIcon name="plus" size={theme.iconSizes.lg} color={theme.colors.textPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}

export default FriendsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.s6,
  },
  header: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
  },
  headerTitle: {
    fontWeight: theme.fontWeights.extrabold,
  },
  headerUnderline: {
    width: 92,
    height: 1,
    marginTop: theme.spacing.s1,
    backgroundColor: theme.colors.textPrimary,
  },
  segmentedWrapper: {
    paddingHorizontal: theme.components.screenPaddingHorizontal,
    marginBottom: theme.spacing.s4,
  },
  listContent: {
    paddingHorizontal: theme.components.screenPaddingHorizontal,
    paddingBottom: theme.spacing.s16 + theme.spacing.s12,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: theme.spacing.s2,
  },
  card: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: theme.palette.navy[200],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShell: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.infoBorder,
    backgroundColor: theme.colors.infoBg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.infoBg,
  },
  avatarInitials: {
    color: theme.colors.secondary,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: theme.spacing.s3,
    gap: theme.spacing.s2,
  },
  cardName: {
    fontWeight: theme.fontWeights.extrabold,
  },
  medalStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  medalBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalImage: {
    width: 28,
    height: 28,
  },
  streakBox: {
    minWidth: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.s1,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  actionButton: {
    width: 36,
    height: 36,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s4,
    paddingHorizontal: theme.spacing.s8,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s8,
    paddingBottom: theme.spacing.s16,
  },
  emptyImage: {
    width: '100%',
    maxWidth: 280,
    height: 240,
  },
  emptyTitle: {
    marginTop: theme.spacing.s2,
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: theme.spacing.s2,
    textAlign: 'center',
    maxWidth: 280,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.s6,
    bottom: theme.spacing.s16 + theme.spacing.s3,
    width: 60,
    height: 60,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.textPrimary,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  fabPressed: {
    backgroundColor: theme.colors.primaryPressed,
    transform: [{ scale: 0.98 }],
  },
});
