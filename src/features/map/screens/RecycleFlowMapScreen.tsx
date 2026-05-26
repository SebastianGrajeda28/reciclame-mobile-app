import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { RecycleMap } from '@/src/features/map/components/RecycleMap';
import { ContainerSelectedCard } from '@/src/features/map/components/ContainerSelectedCard';
import { containers } from '@/src/features/recycling/services/containers.mock';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { haversineDistanceKm } from '@/src/features/recycling/services/distance';
import { wasteCategoryConfig } from '@/src/features/recycling/services/waste-category-config.mock';
import { AppIcon, AppScreen, AppText, theme } from '@/src/ui';
import type { AppIconName } from '@/src/ui/components/AppIcon';
import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';

const CATEGORY_ICON: Record<WasteCategoryId, AppIconName> = {
  plastic_pet: 'bottle',
  paper_cardboard: 'briefcase',
  glass: 'flask',
  non_recoverable: 'delete',
  battery: 'battery',
  electronic_waste: 'laptop',
};

const pUCPRegion = {
  latitude: -12.0695,
  longitude: -77.0793,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const defaultCenter = { latitude: pUCPRegion.latitude, longitude: pUCPRegion.longitude };

export function RecycleFlowMapScreen() {
  const [location, setLocation] = useState(defaultCenter);
  const [recenter, setRecenter] = useState<(() => void) | null>(null);
  const { state, setSelectedContainerId, clearSelectedContainer } = useRecycleFlow();
  const autoSelected = useRef(false);
  const { selectedContainer, finalWasteType } = useResolvedRecycleSelection();

  useEffect(() => {
    Location.getCurrentPositionAsync()
      .then((pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }))
      .catch(() => {});
  }, []);

  const filteredWasteTypes = useMemo(() => {
    if (!state.finalWasteTypeId) return wasteTypes;
    return wasteTypes.filter((wt) => wt.id === state.finalWasteTypeId);
  }, [state.finalWasteTypeId]);

  const markers = useMemo(() => {
    const ids = new Set(filteredWasteTypes.map((wt) => wt.id));
    return containers
      .map((c) => ({
        ...c,
        distanceKm: haversineDistanceKm(location, { latitude: c.latitude, longitude: c.longitude }),
      }))
      .filter((c) => c.distanceKm <= 3)
      .filter((c) => c.acceptedWasteTypeIds.some((id) => ids.has(id)))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((c) => ({ id: c.id, title: c.name, latitude: c.latitude, longitude: c.longitude }));
  }, [filteredWasteTypes, location]);

  useEffect(() => {
    if (!autoSelected.current && markers.length > 0 && !state.selectedContainerId) {
      autoSelected.current = true;
      setSelectedContainerId(markers[0].id);
    }
  }, [markers, state.selectedContainerId, setSelectedContainerId]);

  return (
    <AppScreen insetBottom={false} insetTop={false}>
      <View style={styles.header}>
        <AppText style={styles.eyebrow}>BUSCAR PUNTO DE RECICLAJE</AppText>
        <View style={styles.headerLabelRow}>
          {finalWasteType && (() => {
            const catId = finalWasteType.categoryId as WasteCategoryId;
            const cfg = wasteCategoryConfig[catId];
            const icon = CATEGORY_ICON[catId];
            return (
              <View style={[styles.categoryIcon, { backgroundColor: cfg.color }]}>
                <AppIcon name={icon} size={theme.iconSizes.sm} color={cfg.iconColor} />
              </View>
            );
          })()}
          <AppText style={styles.wasteLabel}>
            {finalWasteType?.categoryLabel ?? 'Residuo'}
          </AppText>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <RecycleMap
          markers={markers}
          region={pUCPRegion}
          centerCoordinate={location}
          selectedMarkerId={state.selectedContainerId}
          onMarkerPress={setSelectedContainerId}
          onMapReady={(fn) => { setRecenter(() => fn); fn(); }}
        />
        <Pressable style={styles.locationButton} onPress={() => recenter?.()}>
          <AppIcon name="locate" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
        </Pressable>

        {selectedContainer && (
          <ContainerSelectedCard
            container={selectedContainer}
            userLocation={location}
            finalWasteTypeCategoryLabel={finalWasteType?.categoryLabel}
            finalWasteTypeLabel={finalWasteType?.label}
            onDismiss={clearSelectedContainer}
            onRecycleHere={() => router.push('/recycle/instructions')}
            hideDismiss
          />
        )}
      </View>
    </AppScreen>
  );
}

export default RecycleFlowMapScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  eyebrow: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.xxs,
  },
  headerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wasteLabel: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
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
});
