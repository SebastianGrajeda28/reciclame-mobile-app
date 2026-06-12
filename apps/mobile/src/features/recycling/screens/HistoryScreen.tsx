import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AppScreen, AppText, theme } from '@/src/ui';
import { HistoryEmptyState } from '@/src/features/recycling/components/HistoryEmptyState';
import { HistoryErrorState } from '@/src/features/recycling/components/HistoryErrorState';
import { RecyclingHistoryItem } from '@/src/features/recycling/components/RecyclingHistoryItem';
import { useRecyclingHistory } from '@/src/features/recycling/hooks/useRecyclingHistory';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import type { RecyclingLogListItem } from '@/src/types/recycling';

function SkeletonItem() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonBody}>
        <View style={[styles.skeletonLine, { width: '60%' }]} />
        <View style={[styles.skeletonLine, { width: '80%' }]} />
        <View style={[styles.skeletonLine, { width: '40%' }]} />
      </View>
    </View>
  );
}

export function HistoryScreen() {
  const currentUser = useCurrentUser();
  const { data, loading, refreshing, error, refetch, refresh } = useRecyclingHistory(
    currentUser?.id ?? null,
  );

  if (loading) {
    return (
      <AppScreen padded>
        {[1, 2, 3, 4].map((k) => (
          <SkeletonItem key={k} />
        ))}
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen padded>
        <HistoryErrorState onRetry={refetch} />
      </AppScreen>
    );
  }

  if (data.length === 0) {
    return (
      <AppScreen padded>
        <HistoryEmptyState />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <FlatList<RecyclingLogListItem>
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecyclingHistoryItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <AppText style={styles.header}>
            {data.length} {data.length === 1 ? 'registro' : 'registros'}
          </AppText>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </AppScreen>
  );
}

export default HistoryScreen;

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: theme.spacing.sm,
  },
  header: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  skeleton: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
  },
  skeletonBody: {
    flex: 1,
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
  },
});
