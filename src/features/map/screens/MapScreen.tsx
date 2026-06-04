import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ContainerSelectedCard } from '@/src/features/map/components/ContainerSelectedCard';
import { RecycleMap } from '@/src/features/map/components/RecycleMap';
import { useNearbyRecyclingPoints } from '@/src/features/map/hooks/useNearbyRecyclingPoints';
import { useStudentLocation } from '@/src/features/map/hooks/useStudentLocation';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import {
  filterWasteTypesByCategory,
} from '@/src/features/recycling/services/filterContainers';
import { wasteCategoryConfig } from '@/src/features/recycling/services/waste-category-config.mock';
import { AppButton, AppIcon, AppScreen, AppText, theme } from '@/src/ui';
import type { AppIconName } from '@/src/ui/components/AppIcon';
import type { NearbyRecyclingPoint } from '@/src/features/recycling/services/recycling-points';
import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';

const pUCPRegion = {
  latitude: -12.0695,
  longitude: -77.0793,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const CATEGORY_ICON: Record<WasteCategoryId, AppIconName> = {
  paper: 'fileDocument',
  cardboard: 'briefcase',
  plastic_bottle: 'bottle',
  plastic: 'bottle',
  metal: 'flask',
  glass: 'flask',
  non_recoverable: 'delete',
  organic: 'leaf',
  battery: 'battery',
  electronic_waste: 'laptop',
};

const FILTERS: { id: string; icon: AppIconName; label: string; categoryId?: WasteCategoryId }[] = [
  { id: 'all', icon: 'trash', label: 'Todos' },
  { id: 'paper', icon: 'fileDocument', label: 'Papel', categoryId: 'paper' },
  { id: 'cardboard', icon: 'briefcase', label: 'Cartón', categoryId: 'cardboard' },
  { id: 'plastic_bottle', icon: 'bottle', label: 'Botella', categoryId: 'plastic_bottle' },
  { id: 'plastic', icon: 'bottle', label: 'Plástico', categoryId: 'plastic' },
  { id: 'metal', icon: 'flask', label: 'Metal', categoryId: 'metal' },
  { id: 'glass', icon: 'flask', label: 'Vidrio', categoryId: 'glass' },
  { id: 'non_recoverable', icon: 'delete', label: 'No rec.', categoryId: 'non_recoverable' },
  { id: 'organic', icon: 'leaf', label: 'Orgánico', categoryId: 'organic' },
  { id: 'battery', icon: 'battery', label: 'Pilas', categoryId: 'battery' },
  { id: 'electronic_waste', icon: 'laptop', label: 'RAEE', categoryId: 'electronic_waste' },
];

export function MapScreen() {
  const location = useStudentLocation();
  const [recenter, setRecenter] = useState<(() => void) | null>(null);
  const [category, setCategory] = useState<string>('all');
  const { state, setSelectedContainerId, clearSelectedContainer } = useRecycleFlow();
  const { finalWasteType } = useResolvedRecycleSelection();
  const nearbyRef = useRef<NearbyRecyclingPoint[]>([]);
  const selectedContainerIdRef = useRef(state.selectedContainerId);

  const filteredWasteTypes = useMemo(
    () => filterWasteTypesByCategory(wasteTypes, category),
    [category],
  );

  const wasteTypeIds = useMemo(
    () => (category === 'all' ? undefined : filteredWasteTypes.map((wt) => wt.id)),
    [category, filteredWasteTypes],
  );

  const { data: nearbyPoints, loading } = useNearbyRecyclingPoints({ location, wasteTypeIds });

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
    if (!loading && nearbyPoints.length === 0 && category !== 'all') {
      Alert.alert('Sin contenedores', 'No se encontraron contenedores compatibles con este filtro.', [
        { text: 'Entendido' },
      ]);
    }
  }, [category, loading, nearbyPoints.length]);

  useEffect(() => {
    if (
      selectedContainerIdRef.current &&
      !nearbyRef.current.some((c) => c.id === selectedContainerIdRef.current)
    ) {
      clearSelectedContainer();
    }
  }, [category, clearSelectedContainer]);

  return (
    <AppScreen insetBottom={false}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppText style={styles.title}>Reciclaje</AppText>
          <AppText style={styles.score}>4 🔥</AppText>
        </View>
      </View>

      <View style={styles.filterRow}>
        <AppText style={styles.filterTitle}>Filtrar por contenedores</AppText>
        <View style={styles.filterChips}>
          {FILTERS.map((f) => {
            const cfg = f.categoryId ? wasteCategoryConfig[f.categoryId] : null;
            const isSelected = category === f.id;
            return (
              <IconFilterButton
                key={f.id}
                selected={isSelected}
                onPress={() => setCategory(f.id)}
                label={f.label}
                activeColor={cfg?.color}
                icon={
                  <AppIcon
                    name={f.icon}
                    size={theme.iconSizes.md}
                    color={
                      cfg
                        ? isSelected
                          ? cfg.iconColor
                          : cfg.color
                        : isSelected
                          ? theme.colors.textInverse
                          : theme.colors.primary
                    }
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
            finalWasteTypeCategoryLabel={finalWasteType?.categoryLabel}
            finalWasteTypeLabel={finalWasteType?.label}
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

function IconFilterButton({ selected, onPress, icon, label, activeColor, disabled }: IconFilterButtonProps) {
  const categoryColor = activeColor ?? theme.colors.primary;
  return (
    <Pressable onPress={onPress} style={[styles.iconFilterWrapper, disabled && styles.iconFilterDisabled]}>
      <View
        style={[
          styles.iconFilter,
          selected
            ? { backgroundColor: categoryColor }
            : { backgroundColor: categoryColor + '22' },
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
  score: {
    color: theme.recycle.headerScore,
    fontWeight: theme.fontWeights.semibold,
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
