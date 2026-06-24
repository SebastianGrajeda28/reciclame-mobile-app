import { HistoryEmptyState } from '@/src/features/recycling/components/HistoryEmptyState';
import { HistoryErrorState } from '@/src/features/recycling/components/HistoryErrorState';
import { HistoryFilteredEmptyState } from '@/src/features/recycling/components/HistoryFilteredEmptyState';
import { RecyclingHistoryItem } from '@/src/features/recycling/components/RecyclingHistoryItem';
import { useRecyclingHistory } from '@/src/features/recycling/hooks/useRecyclingHistory';
import {
  HISTORY_CATEGORIES,
  categoryStyleForCategoryId,
  wasteTypeIdsForCategories,
} from '@/src/features/recycling/services/historyCategories';
import {
  HORIZONS,
  type Horizon,
  groupByDateSection,
  horizonStart,
} from '@/src/features/recycling/utils/historyGrouping';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { AppChip, AppIcon, AppScreen, AppSegmentedControl, AppText, theme } from '@/src/ui';
import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

function SkeletonItem() {
  return (
    <View style={styles.skeletonRow}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonBody}>
        <View style={[styles.skeletonLine, { width: '50%' }]} />
        <View style={[styles.skeletonLine, { width: '80%' }]} />
      </View>
    </View>
  );
}

export function HistoryScreen() {
  const navigation = useNavigation();
  const currentUser = useCurrentUser();
  const [horizon, setHorizon] = useState<Horizon>('all');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      router.dismissAll();
    });
  }, [navigation]);

  const filters = useMemo(() => {
    const start = horizonStart(horizon);
    return {
      wasteTypeIds: categoryIds.length > 0 ? wasteTypeIdsForCategories(categoryIds) : null,
      fromDate: start !== null ? new Date(start).toISOString() : null,
    };
  }, [horizon, categoryIds]);

  const { items, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh, retry } =
    useRecyclingHistory(currentUser?.id ?? null, filters);

  const sections = useMemo(() => groupByDateSection(items), [items]);
  const hasActiveFilters = horizon !== 'all' || categoryIds.length > 0;

  const toggleCategory = useCallback((id: string) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }, []);

  const clearFilters = useCallback(() => {
    setHorizon('all');
    setCategoryIds([]);
  }, []);

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
        style={styles.listSurface}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecyclingHistoryItem item={item} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader} accessibilityRole="header">
            <AppText style={styles.sectionTitle}>{section.title}</AppText>
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={[styles.list, sections.length === 0 && styles.listGrow]}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          hasActiveFilters ? (
            <HistoryFilteredEmptyState onClear={clearFilters} />
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
    <AppScreen insetTop={false}>
      <View style={styles.filters}>
        <AppSegmentedControl
          segments={HORIZONS.map((h) => ({ value: h.id, label: h.label }))}
          value={horizon}
          onChange={setHorizon}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {HISTORY_CATEGORIES.map((category) => {
            const active = categoryIds.includes(category.id);
            return (
              <AppChip
                key={category.id}
                label={category.label}
                active={active}
                onPress={() => toggleCategory(category.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Categoría ${category.label}`}
                leftIcon={
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: categoryStyleForCategoryId(category.id).fg },
                    ]}
                  />
                }
              />
            );
          })}
          {categoryIds.length > 0 ? (
            <AppChip
              label="Limpiar"
              onPress={() => setCategoryIds([])}
              accessibilityRole="button"
              accessibilityLabel="Quitar filtros de categoría"
              leftIcon={
                <AppIcon name="close" size={theme.iconSizes.xs} color={theme.colors.textSecondary} />
              }
            />
          ) : null}
        </ScrollView>
      </View>

      {body}
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
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
  },
  listSurface: {
    backgroundColor: theme.colors.surface,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.border,
  },
  listGrow: {
    flexGrow: 1,
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
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  skeletonWrap: {
    backgroundColor: theme.colors.surface,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
  },
  skeletonBody: {
    flex: 1,
    gap: theme.spacing.xxs,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
  },
});