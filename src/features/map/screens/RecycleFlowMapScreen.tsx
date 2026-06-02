import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { ContainerSelectedCard } from '@/src/features/map/components/ContainerSelectedCard';
import { RecycleMap } from '@/src/features/map/components/RecycleMap';
import { useNearbyRecyclingPoints } from '@/src/features/map/hooks/useNearbyRecyclingPoints';
import { useStudentLocation } from '@/src/features/map/hooks/useStudentLocation';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
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

export function RecycleFlowMapScreen() {
  const navigation = useNavigation();
  const location = useStudentLocation();
  const [recenter, setRecenter] = useState<(() => void) | null>(null);
  const { state, setSelectedContainerId, clearSelectedContainer } = useRecycleFlow();
  const { finalWasteType } = useResolvedRecycleSelection();
  const autoSelected = useRef(false);

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      clearSelectedContainer();
    });
  }, [navigation, clearSelectedContainer]);

  const wasteTypeIds = useMemo(() => {
    if (!state.finalWasteTypeId) return wasteTypes.map((wt) => wt.id);
    return [state.finalWasteTypeId];
  }, [state.finalWasteTypeId]);

  const { data: nearbyPoints } = useNearbyRecyclingPoints({ location, wasteTypeIds });

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
          {finalWasteType &&
            (() => {
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
          onMapReady={(fn) => {
            setRecenter(() => fn);
            fn();
          }}
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
