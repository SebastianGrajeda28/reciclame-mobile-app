import { router, type Href } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { routes } from '@/src/constants/routes';
import { useFriends } from '@/src/features/friends/hooks/useFriends';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import type { FriendMedal, FriendSummary } from '@/src/types/friend';
import { AppButton, AppIcon, AppText, theme } from '@/src/ui';

const MAX_VISIBLE_MEDALS = 3;
const USE_MOCK_FRIENDS = true; // así hasta que el supabase remoto tenga todo (por si acaso)

const mockFriends: FriendSummary[] = [
  {
    id: 'mock-friend-1',
    name: 'Alice Smith',
    currentStreak: 70,
    featuredMedals: [
      { id: 'mock-medal-1', name: 'Eco inicial' },
      { id: 'mock-medal-2', name: 'Bosque vivo' },
      { id: 'mock-medal-3', name: 'Botella limpia' },
    ],
  },
  {
    id: 'mock-friend-2',
    name: 'Bob Johnson',
    currentStreak: 45,
    featuredMedals: [
      { id: 'mock-medal-4', name: 'Caja pro' },
      { id: 'mock-medal-5', name: 'Botella limpia' },
      { id: 'mock-medal-6', name: 'Racha dorada' },
    ],
  },
  {
    id: 'mock-friend-3',
    name: 'Charlie Brown',
    currentStreak: 17,
    featuredMedals: [
      { id: 'mock-medal-7', name: 'Caja pro' },
      { id: 'mock-medal-8', name: 'Bosque vivo' },
      { id: 'mock-medal-9', name: 'Botella limpia' },
    ],
  },
  {
    id: 'mock-friend-4',
    name: 'Diana Prince',
    currentStreak: 5,
    featuredMedals: [
      { id: 'mock-medal-10', name: 'Reciclaje constante' },
      { id: 'mock-medal-11', name: 'Gota limpia' },
    ],
  },
  {
    id: 'mock-friend-5',
    name: 'Ariel War',
    currentStreak: 3,
    featuredMedals: [{ id: 'mock-medal-12', name: 'Pila segura' }],
  },
  {
    id: 'mock-friend-6',
    name: 'Ethan Walker',
    currentStreak: 1,
    featuredMedals: [{ id: 'mock-medal-13', name: 'Pila segura' }],
  },
  {
    id: 'mock-friend-7',
    name: 'Francis Deen',
    currentStreak: 67,
    featuredMedals: [{ id: 'mock-medal-16', name: 'Pila segura' }],
  },
  {
    id: 'mock-friend-8',
    name: 'Gin Bates',
    currentStreak: 42,
    featuredMedals: [
      { id: 'mock-medal-7', name: 'Caja pro' },
      { id: 'mock-medal-8', name: 'Bosque vivo' },
      { id: 'mock-medal-9', name: 'Botella limpia' },
    ],
  },
];

function buildInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase())
    .join('');
}

function FriendAvatar({ friend }: { friend: FriendSummary }) {
  const initials = buildInitials(friend.name);

  return (
    <View style={styles.avatarShell}>
      {friend.avatarUrl ? (
        <Image source={{ uri: friend.avatarUrl }} style={styles.avatarImage} />
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

function FriendMedalBadge({ medal }: { medal: FriendMedal }) {
  return (
    <View style={styles.medalBadge}>
      {medal.imageUrl ? (
        <Image source={{ uri: medal.imageUrl }} style={styles.medalImage} resizeMode="contain" />
      ) : (
        <AppIcon name="award" size={theme.iconSizes.sm} color={theme.colors.success} />
      )}
    </View>
  );
}

function FriendMedalStrip({ medals }: { medals: FriendMedal[] }) {
  const visibleMedals = medals.slice(0, MAX_VISIBLE_MEDALS);

  if (visibleMedals.length === 0) {
    return (
      <AppText variant="caption" muted>
        Sin medallas destacadas
      </AppText>
    );
  }

  return (
    <View style={styles.medalStrip}>
      {visibleMedals.map((medal) => (
        <FriendMedalBadge key={medal.id} medal={medal} />
      ))}
    </View>
  );
}

function FriendListItem({ friend }: { friend: FriendSummary }) {
  return (
    <View style={styles.friendCard}>
      <FriendAvatar friend={friend} />
      <View style={styles.friendBody}>
        <AppText variant="h4" numberOfLines={1} style={styles.friendName}>
          {friend.name}
        </AppText>
        <FriendMedalStrip medals={friend.featuredMedals} />
      </View>
      <View style={styles.streakBox}>
        <AppText variant="h4" style={styles.streakValue}>
          {friend.currentStreak}
        </AppText>
        <AppIcon name="flame" size={theme.iconSizes.lg} color={theme.colors.secondary} />
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

export function FriendsScreen() {
  const currentUser = useCurrentUser();
  const {
    data: remoteFriends,
    loading,
    refreshing,
    error,
    refresh,
    refetch,
  } = useFriends(USE_MOCK_FRIENDS ? null : (currentUser?.id ?? null));

  const friends = USE_MOCK_FRIENDS ? mockFriends : remoteFriends;
  const screenLoading = USE_MOCK_FRIENDS ? false : loading;
  const screenRefreshing = USE_MOCK_FRIENDS ? false : refreshing;
  const screenError = USE_MOCK_FRIENDS ? null : error;
  const handleRefresh = USE_MOCK_FRIENDS ? undefined : refresh;
  const showInitialLoading = screenLoading && friends.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="h3" style={styles.headerTitle}>
          Amigos
        </AppText>
        <View style={styles.headerUnderline} />
      </View>

      {showInitialLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : screenError ? (
        <View style={styles.centerState}>
          <AppIcon name="alertCircle" size={theme.iconSizes.xl} color={theme.colors.danger} />
          <AppText variant="h4" style={styles.errorTitle}>
            No pudimos cargar tus amigos
          </AppText>
          <AppText variant="bodyS" muted style={styles.errorMessage}>
            {screenError}
          </AppText>
          <AppButton label="Reintentar" variant="outline" onPress={refetch} />
        </View>
      ) : (
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
          refreshing={screenRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
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
    marginBottom: theme.spacing.s5,
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
  friendCard: {
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
  friendBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: theme.spacing.s3,
    gap: theme.spacing.s2,
  },
  friendName: {
    fontWeight: theme.fontWeights.extrabold,
  },
  medalStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  medalBadge: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.primaryLight,
  },
  medalImage: {
    width: 20,
    height: 20,
  },
  streakBox: {
    minWidth: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.s1,
  },
  streakValue: {
    fontWeight: theme.fontWeights.extrabold,
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
