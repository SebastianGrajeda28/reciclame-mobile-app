import { useCallback, useEffect, useRef, useState } from 'react';
import { getRecyclingHistoryPage } from '../api/recyclingLogs';
import type { RecyclingLogListItem } from '@/src/types/recycling';

export type HistoryFilters = {
  wasteTypeIds: string[] | null;
  fromDate: string | null;
};

type Mode = 'initial' | 'more' | 'refresh';

/** Historial paginado con scroll infinito. */
export function useRecyclingHistory(userId: string | null, filters: HistoryFilters) {
  const [items, setItems] = useState<RecyclingLogListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Descarta respuestas obsoletas (loadMore en vuelo al cambiar filtros) para no mezclar páginas.
  const requestIdRef = useRef(0);

  const categoryKey = filters.wasteTypeIds ? filters.wasteTypeIds.join(',') : '';
  const fromKey = filters.fromDate ?? '';

  const load = useCallback(
    async (pageToLoad: number, mode: Mode) => {
      if (!userId) {
        setItems([]);
        setHasMore(false);
        setError(null);
        setLoading(false);
        return;
      }
      const requestId = ++requestIdRef.current;
      if (mode === 'initial') setLoading(true);
      else if (mode === 'more') setLoadingMore(true);
      else setRefreshing(true);
      setError(null);
      try {
        const { items: pageItems, hasMore: more } = await getRecyclingHistoryPage(
          userId,
          pageToLoad,
          {
            wasteTypeIds: filters.wasteTypeIds,
            fromDate: filters.fromDate,
          },
        );
        if (requestId !== requestIdRef.current) return;
        setItems((prev) => (pageToLoad === 0 ? pageItems : [...prev, ...pageItems]));
        setPage(pageToLoad);
        setHasMore(more);
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        setError(e instanceof Error ? e.message : 'Error al cargar el historial.');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    // deps reales: userId + categoryKey/fromKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, categoryKey, fromKey],
  );

  useEffect(() => {
    load(0, 'initial');
  }, [load]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading && !refreshing) {
      load(page + 1, 'more');
    }
  }, [hasMore, loadingMore, loading, refreshing, page, load]);

  const refresh = useCallback(() => load(0, 'refresh'), [load]);
  const retry = useCallback(() => load(0, 'initial'), [load]);

  return { items, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh, retry };
}
