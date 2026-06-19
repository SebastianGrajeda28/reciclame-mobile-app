import { router } from 'expo-router';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ContainerSelectedCard } from '@/src/features/map/components/ContainerSelectedCard';
import { RecycleMap } from '@/src/features/map/components/RecycleMap';
import { useNearbyRecyclingPoints } from '@/src/features/map/hooks/useNearbyRecyclingPoints';
import { useStudentLocation } from '@/src/features/map/hooks/useStudentLocation';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { useResolvedBinType } from '@/src/features/recycling/hooks/useResolvedBinType';
import { binTypeConfig } from '@/src/features/recycling/services/bin-type-config.mock';
import {
  BATTERIES_BIN_TYPE_ID,
  GLASS_BIN_TYPE_ID,
  NON_RECOVERABLE_BIN_TYPE_ID,
  PAPER_CARDBOARD_BIN_TYPE_ID,
  PLASTICS_BIN_TYPE_ID,
  RAEE_BIN_TYPE_ID,
} from '@/src/features/recycling/services/bin-types.mock';
import type { NearbyRecyclingPoint } from '@/src/features/recycling/services/recycling-points';
import { useStreakProgress } from '@/src/hooks/useStreakProgress';
import { AppButton, AppIcon, AppScreen, AppText, StreakHeatBadge, theme } from '@/src/ui';
import type { AppIconName } from '@/src/ui/components/AppIcon';

const pUCPRegion = {
  latitude: -12.0695,
  longitude: -77.0793,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const FILTERS: {
  id: string;
  icon: AppIconName;
  label: string;
  activeColor?: string;
  iconColor?: string;
}[] = [
  { id: 'all', icon: 'trash', label: 'Todos' },
  {
    id: PLASTICS_BIN_TYPE_ID,
    icon: binTypeConfig[PLASTICS_BIN_TYPE_ID].icon,
    label: 'Plástico',
    activeColor: binTypeConfig[PLASTICS_BIN_TYPE_ID].color,
    iconColor: binTypeConfig[PLASTICS_BIN_TYPE_ID].iconColor,
  },
  {
    id: PAPER_CARDBOARD_BIN_TYPE_ID,
    icon: binTypeConfig[PAPER_CARDBOARD_BIN_TYPE_ID].icon,
    label: 'Papel',
    activeColor: binTypeConfig[PAPER_CARDBOARD_BIN_TYPE_ID].color,
    iconColor: binTypeConfig[PAPER_CARDBOARD_BIN_TYPE_ID].iconColor,
  },
  {
    id: GLASS_BIN_TYPE_ID,
    icon: binTypeConfig[GLASS_BIN_TYPE_ID].icon,
    label: 'Vidrio',
    activeColor: binTypeConfig[GLASS_BIN_TYPE_ID].color,
    iconColor: binTypeConfig[GLASS_BIN_TYPE_ID].iconColor,
  },
  {
    id: NON_RECOVERABLE_BIN_TYPE_ID,
    icon: binTypeConfig[NON_RECOVERABLE_BIN_TYPE_ID].icon,
    label: 'No rec.',
    activeColor: binTypeConfig[NON_RECOVERABLE_BIN_TYPE_ID].color,
    iconColor: binTypeConfig[NON_RECOVERABLE_BIN_TYPE_ID].iconColor,
  },
  {
    id: BATTERIES_BIN_TYPE_ID,
    icon: binTypeConfig[BATTERIES_BIN_TYPE_ID].icon,
    label: 'Pilas',
    activeColor: binTypeConfig[BATTERIES_BIN_TYPE_ID].color,
    iconColor: binTypeConfig[BATTERIES_BIN_TYPE_ID].iconColor,
  },
  {
    id: RAEE_BIN_TYPE_ID,
    icon: binTypeConfig[RAEE_BIN_TYPE_ID].icon,
    label: 'RAEE',
    activeColor: binTypeConfig[RAEE_BIN_TYPE_ID].color,
    iconColor: binTypeConfig[RAEE_BIN_TYPE_ID].iconColor,
  },
];

export function MapScreen() {
  const location = useStudentLocation();
  const [recenter, setRecenter] = useState<(() => void) | null>(null);
  const [category, setCategory] = useState<string>('all');
  const { state, setSelectedContainerId, clearSelectedContainer } = useRecycleFlow();
  const { data: streakData } = useStreakProgress();
  const { finalWasteType } = useResolvedRecycleSelection();
  const { binType: resolvedBinType, loading: resolvingBinType } = useResolvedBinType(
    state.finalWasteTypeId,
  );

  const nearbyRef = useRef<NearbyRecyclingPoint[]>([]);
  const selectedContainerIdRef = useRef(state.selectedContainerId);

  const binTypeIds = useMemo(() => {
    if (state.finalWasteTypeId) {
      return resolvedBinType ? [resolvedBinType.id] : [];
    }
    return category === 'all' ? undefined : [category];
  }, [category, resolvedBinType, state.finalWasteTypeId]);

  const { data: nearbyPoints, loading } = useNearbyRecyclingPoints({ location, binTypeIds });

  nearbyRef.current = nearbyPoints;
  selectedContainerIdRef.current = state.selectedContainerId;

  const selectedContainer = useMemo(
    () => nearbyPoints.find((p) => p.id === state.selectedContainerId) ?? null,
    [nearbyPoints, state.selectedContainerId],
  );

  const markers = useMemo(
    () =>
      nearbyPoints.map((p) => ({
        id: p.id,
        title: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    [nearbyPoints],
  );

  useEffect(() => {
    if (!loading && !resolvingBinType && nearbyPoints.length === 0 && category !== 'all') {
      Alert.alert(
        'Sin contenedores',
        'No se encontraron contenedores compatibles con este filtro.',
        [{ text: 'Entendido' }],
      );
    }
  }, [category, loading, nearbyPoints.length, resolvingBinType]);

  useEffect(() => {
    if (
      !resolvingBinType &&
      selectedContainerIdRef.current &&
      !nearbyRef.current.some((c) => c.id === selectedContainerIdRef.current)
    ) {
      clearSelectedContainer();
    }
  }, [category, clearSelectedContainer, resolvedBinType, resolvingBinType]);

  return (
    <AppScreen insetBottom={false}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppText style={styles.title}>Reciclaje</AppText>
          <StreakHeatBadge
            streakDays={streakData?.streakDays ?? 0}
            level={streakData?.level ?? 1}
            heat={streakData?.heat ?? 0}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <AppText style={styles.filterTitle}>Filtrar por contenedores</AppText>
        <View style={styles.filterChips}>
          {FILTERS.map((f) => {
            const isSelected = category === f.id;
            const activeColor = f.activeColor ?? theme.colors.primary;
            const iconColor = f.iconColor ?? theme.colors.textInverse;
            return (
              <IconFilterButton
                key={f.id}
                selected={isSelected}
                onPress={() => setCategory(f.id)}
                label={f.label}
                activeColor={activeColor}
                icon={
                  <AppIcon
                    name={f.icon}
                    size={theme.iconSizes.md}
                    color={isSelected ? iconColor : activeColor}
                  />
                }
              />
            );
          })}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <RecycleMap
          markers={markers}
          region={pUCPRegion}
          centerCoordinate={location}
          selectedMarkerId={state.selectedContainerId}
          onMarkerPress={setSelectedContainerId}
          onMapReady={(fn) => setRecenter(() => fn)}
        />
        <Pressable style={styles.locationButton} onPress={() => recenter?.()}>
          <AppIcon name="locate" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
        </Pressable>

        {selectedContainer ? (
          <ContainerSelectedCard
            container={selectedContainer}
            userLocation={location}
            finalWasteTypeLabel={finalWasteType?.label}
            resolvedBinTypeName={resolvedBinType?.name}
            onDismiss={clearSelectedContainer}
            onRecycleHere={() => router.push('/recycle/camera')}
          />
        ) : (
          <View style={styles.bottomCta}>
            <View style={styles.ctaTopRow}>
              <View>
                <AppText style={styles.ctaEyebrow}>EMPIEZA AHORA</AppText>
                <AppText style={styles.ctaHeading}>¿No sabes qué contenedor?</AppText>
              </View>
              <Pressable
                style={styles.ctaCameraButton}
                onPress={() => router.push('/recycle/camera')}
              >
                <AppIcon name="camera" size={theme.iconSizes.lg} color={theme.colors.textPrimary} />
              </Pressable>
            </View>
            <AppButton
              label="Escanear tu residuo"
              onPress={() => router.push('/recycle/camera')}
              style={styles.ctaButton}
            />
          </View>
        )}
      </View>
    </AppScreen>
  );
}

export default MapScreen;

type IconFilterButtonProps = {
  selected?: boolean;
  onPress: () => void;
  icon: ReactNode;
  label: string;
  activeColor?: string;
  disabled?: boolean;
};

function IconFilterButton({
  selected,
  onPress,
  icon,
  label,
  activeColor,
  disabled,
}: IconFilterButtonProps) {
  const categoryColor = activeColor ?? theme.colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.iconFilterWrapper, disabled && styles.iconFilterDisabled]}
    >
      <View
        style={[
          styles.iconFilter,
          selected ? { backgroundColor: categoryColor } : { backgroundColor: categoryColor + '22' },
        ]}
      >
        {icon}
      </View>
      <AppText style={[styles.iconFilterLabel, selected && styles.iconFilterLabelSelected]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.display,
    lineHeight: theme.fontSizes.display + theme.spacing.xs,
    fontWeight: theme.fontWeights.bold,
  },
  filterRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  filterTitle: {
    marginBottom: theme.spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },
  iconFilterWrapper: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconFilter: {
    width: theme.components.buttonHeights.icon,
    height: theme.components.buttonHeights.icon,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.recycle.iconButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFilterLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  iconFilterLabelSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  mapContainer: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 160,
    right: theme.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.md,
  },
  ctaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaEyebrow: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.xxs,
  },
  ctaHeading: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  ctaCameraButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButton: {
    width: '100%',
  },
  iconFilterDisabled: {
    opacity: 0.35,
  },
});
