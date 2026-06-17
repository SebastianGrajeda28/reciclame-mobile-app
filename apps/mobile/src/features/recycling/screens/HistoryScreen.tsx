import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { AppIcon, AppScreen, AppSegmentedControl, AppText, theme } from '@/src/ui';
import { HistoryCategorySheet } from '@/src/features/recycling/components/HistoryCategorySheet';
import { HistoryEmptyState } from '@/src/features/recycling/components/HistoryEmptyState';
import { HistoryErrorState } from '@/src/features/recycling/components/HistoryErrorState';
import { RecyclingHistoryItem } from '@/src/features/recycling/components/RecyclingHistoryItem';
import { useRecyclingHistory } from '@/src/features/recycling/hooks/useRecyclingHistory';
import { HISTORY_CATEGORIES } from '@/src/features/recycling/services/historyCategories';
import {
  HORIZONS,
  type Horizon,
  groupByDateSection,
  horizonStart,
} from '@/src/features/recycling/utils/historyGrouping';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';

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
  const [horizon, setHorizon] = useState<Horizon>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const filters = useMemo(() => {
    const start = horizonStart(horizon);
    const category = categoryId ? HISTORY_CATEGORIES.find((c) => c.id === categoryId) : null;
    return {
      wasteTypeIds: category?.wasteTypeIds ?? null,
      fromDate: start !== null ? new Date(start).toISOString() : null,
    };
  }, [horizon, categoryId]);

  const { items, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh, retry } =
    useRecyclingHistory(currentUser?.id ?? null, filters);

  const sections = useMemo(() => groupByDateSection(items), [items]);
  const selectedCategory = categoryId ? HISTORY_CATEGORIES.find((c) => c.id === categoryId) : null;
  const hasActiveFilters = horizon !== 'all' || categoryId !== null;

  let body;
  if (loading) {
    body = (
      <View style={styles.skeletonWrap}>
        {[1, 2, 3, 4].map((k) => (
          <SkeletonItem key={k} />
        ))}
      </View>
    );
  } else if (error) {
    body = (
      <View style={styles.padded}>
        <HistoryErrorState onRetry={retry} />
      </View>
    );
  } else {
    body = (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecyclingHistoryItem item={item} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>{section.title.toUpperCase()}</AppText>
            <AppText style={styles.sectionCount}>{section.data.length}</AppText>
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.itemSep} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          hasActiveFilters ? (
            <AppText style={styles.emptyFiltered}>No hay registros con estos filtros.</AppText>
          ) : (
            <HistoryEmptyState />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.colors.primary} />
              <AppText style={styles.footerText}>Cargando más…</AppText>
            </View>
          ) : !hasMore && items.length > 0 ? (
            <AppText style={styles.footerEnd}>Eso es todo por ahora</AppText>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    );
  }

  return (
    <AppScreen>
      <View style={styles.filters}>
        <View style={styles.filterTop}>
          <AppSegmentedControl
            segments={HORIZONS.map((h) => ({ value: h.id, label: h.label }))}
            value={horizon}
            onChange={setHorizon}
            style={styles.segmented}
          />
          <Pressable
            onPress={() => setSheetVisible(true)}
            style={styles.funnel}
            accessibilityLabel="Filtrar por categoría"
          >
            <AppIcon name="filter" size={theme.iconSizes.md} color={theme.colors.textSecondary} />
            {categoryId ? <View style={styles.funnelDot} /> : null}
          </Pressable>
        </View>
        {selectedCategory ? (
          <View style={styles.activeRow}>
            <Pressable style={styles.activeChip} onPress={() => setCategoryId(null)}>
              <AppText style={styles.activeChipText}>{selectedCategory.label}</AppText>
              <AppIcon name="close" size={theme.iconSizes.xs} color={theme.colors.primary} />
            </Pressable>
          </View>
        ) : null}
      </View>

      {body}

      <HistoryCategorySheet
        visible={sheetVisible}
        selectedId={categoryId}
        onSelect={setCategoryId}
        onClose={() => setSheetVisible(false)}
      />
    </AppScreen>
  );
}

export default HistoryScreen;

const styles = StyleSheet.create({
  filters: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  segmented: {
    flex: 1,
  },
  funnel: {
    width: 44,
    height: theme.components.segmentedHeight,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funnelDot: {
    position: 'absolute',
    top: 7,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  activeRow: {
    flexDirection: 'row',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  activeChipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.primary,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  itemSep: {
    height: theme.spacing.sm,
  },
  emptyFiltered: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  footerEnd: {
    textAlign: 'center',
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.lg,
  },
  padded: {
    padding: theme.spacing.lg,
  },
  skeletonWrap: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  skeleton: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
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
