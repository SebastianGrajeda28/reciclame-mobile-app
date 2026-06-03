import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { RecycleMap } from '@/src/features/map/components/RecycleMap';
import { useStudentLocation } from '@/src/features/map/hooks/useStudentLocation';
import { containers } from '@/src/features/recycling/services/containers.mock';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { useResolvedBinType } from '@/src/features/recycling/hooks/useResolvedBinType';
import { haversineDistanceKm } from '@/src/features/recycling/services/distance';
import { binTypeConfig } from '@/src/features/recycling/services/bin-type-config.mock';
import {
  filterWasteTypesByCategory,
  getNearbyCompatibleContainers,
  getNearbyCompatibleContainersByBinType,
} from '@/src/features/recycling/services/filterContainers';
import { wasteCategoryConfig } from '@/src/features/recycling/services/waste-category-config.mock';
import { AppButton, AppIcon, AppScreen, AppText, theme } from '@/src/ui';
import type { AppIconName } from '@/src/ui/components/AppIcon';
import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';

const pUCPRegion = {
  latitude: -12.0695,
  longitude: -77.0793,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};


const FILTERS: { id: string; icon: AppIconName; label: string; categoryId?: WasteCategoryId }[] = [
  { id: 'all', icon: 'trash', label: 'Todos' },
  { id: 'plastic_pet', icon: 'bottle', label: 'Plástico', categoryId: 'plastic_pet' },
  { id: 'paper_cardboard', icon: 'briefcase', label: 'Papel', categoryId: 'paper_cardboard' },
  { id: 'glass', icon: 'flask', label: 'Vidrio', categoryId: 'glass' },
  { id: 'non_recoverable', icon: 'delete', label: 'No rec.', categoryId: 'non_recoverable' },
  { id: 'battery', icon: 'battery', label: 'Pilas', categoryId: 'battery' },
  { id: 'electronic_waste', icon: 'laptop', label: 'RAEE', categoryId: 'electronic_waste' },
];

export function MapScreen() {
  const location = useStudentLocation();
  const [recenter, setRecenter] = useState<(() => void) | null>(null);
  const [category, setCategory] = useState<string>('all');
  const nearbyRef = useRef<typeof nearby>([]);
  const { state, setSelectedContainerId, clearSelectedContainer } = useRecycleFlow();
  const selectedContainerIdRef = useRef(state.selectedContainerId);
  const { selectedContainer, finalWasteType } = useResolvedRecycleSelection();
  const { binType: resolvedBinType, loading: resolvingBinType } = useResolvedBinType(
    state.finalWasteTypeId,
  );

  const filteredWasteTypes = useMemo(
    () => filterWasteTypesByCategory(wasteTypes, category),
    [category],
  );

  const nearby = useMemo(() => {
    if (state.finalWasteTypeId) {
      return getNearbyCompatibleContainersByBinType(location, containers, resolvedBinType?.id);
    }

    return getNearbyCompatibleContainers(location, containers, filteredWasteTypes);
  }, [filteredWasteTypes, location, resolvedBinType, state.finalWasteTypeId]);
  nearbyRef.current = nearby;
  selectedContainerIdRef.current = state.selectedContainerId;

  const markers = useMemo(
    () =>
      nearby.map((container) => ({
        id: container.id,
        title: container.name,
        latitude: container.latitude,
        longitude: container.longitude,
      })),
    [nearby],
  );

  useEffect(() => {
    if (!resolvingBinType && nearby.length === 0 && category !== 'all') {
      Alert.alert('Sin contenedores', 'No se encontraron contenedores compatibles en 3 km.', [
        { text: 'Entendido' },
      ]);
    }
  }, [category, nearby.length, resolvingBinType]);

  useEffect(() => {
    if (
      !resolvingBinType &&
      selectedContainerIdRef.current &&
      !nearbyRef.current.some((c) => c.id === selectedContainerIdRef.current)
    ) {
      clearSelectedContainer();
    }
  }, [category, clearSelectedContainer, resolvedBinType, resolvingBinType]);

  const selectedDistanceKm = selectedContainer
    ? haversineDistanceKm(location, {
        latitude: selectedContainer.latitude,
        longitude: selectedContainer.longitude,
      })
    : undefined;

  const availableIcons = useMemo(() => {
    if (!selectedContainer) return [];
    return selectedContainer.availableBinTypeIds
      .map((id) => binTypeConfig[id])
      .filter(Boolean)
      .filter((item) => item.icon) as { icon: AppIconName; color: string; iconColor: string }[];
  }, [selectedContainer]);

  function openDirections() {
    if (!selectedContainer) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedContainer.latitude},${selectedContainer.longitude}`;
    Linking.openURL(url);
  }

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
                    color={cfg ? (isSelected ? cfg.iconColor : cfg.color) : (isSelected ? theme.colors.textInverse : theme.colors.primary)}
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
        <View style={styles.selectedCard}>
          <Pressable style={styles.dismissButton} onPress={clearSelectedContainer}>
            <AppIcon name="close" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
          </Pressable>
          <View style={styles.selectedCardContent}>
            <AppText style={styles.selectedTitle}>
              Lugar de reciclaje: {selectedContainer.name}
            </AppText>
            <View style={styles.availableRow}>
              <AppText style={styles.availableLabel}>Contenedores disponibles: </AppText>
              {availableIcons.map((item, i) => (
                <View key={i} style={[styles.availableIcon, { backgroundColor: item.color }]}>
                  <AppIcon name={item.icon} size={theme.iconSizes.md} color={item.iconColor} />
                </View>
              ))}
            </View>
            {finalWasteType ? (
              <>
                <AppText style={styles.selectedMeta}>
                  Residuo detectado: {finalWasteType.label}
                </AppText>
                {resolvedBinType ? (
                  <AppText style={styles.selectedMeta}>
                    Contenedor correspondiente: {resolvedBinType.name}
                  </AppText>
                ) : null}
              </>
            ) : null}
            {selectedDistanceKm !== undefined ? (
              <View style={styles.distanceRow}>
                <AppText style={styles.selectedMeta}>
                  Distancia: {selectedDistanceKm.toFixed(2)} km
                </AppText>
                <Pressable onPress={openDirections}>
                  <AppText style={styles.directionsLink}>Direcciones</AppText>
                </Pressable>
              </View>
            ) : null}
          </View>
          <AppButton
            label="Reciclar aquí"
            size="sm"
            onPress={() => router.push('/recycle/camera')}
          />
        </View>
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
      <View style={[
        styles.iconFilter,
        selected
          ? { backgroundColor: categoryColor }
          : { backgroundColor: categoryColor + '22' },
      ]}>
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
  selectedCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  dismissButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  selectedCardContent: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  selectedTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xxs,
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xxs,
  },
  availableLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  availableIcon: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMeta: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  directionsLink: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  selectedCardAction: {
    flexShrink: 0,
  },
  recycleButton: {
    paddingHorizontal: theme.spacing.md,
  },
  recycleButtonLabel: {
    fontSize: theme.fontSizes.xs,
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
  devNote: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
    fontSize: theme.fontSizes.xs,
  },
  iconFilterDisabled: {
    opacity: 0.35,
  },
});
