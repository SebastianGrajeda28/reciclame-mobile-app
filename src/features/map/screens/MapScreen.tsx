import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { RecycleMap } from '@/src/features/map/components/RecycleMap';
import { containers } from '@/src/features/recycling/services/containers.mock';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { haversineDistanceKm } from '@/src/features/recycling/services/distance';
import { AppButton, AppCard, AppScreen, AppText, theme } from '@/src/ui';

const pUCPRegion = {
  latitude: -12.0695,
  longitude: -77.0793,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function MapScreen() {
  const [category, setCategory] = useState<'all' | string>('all');
  const [location, setLocation] = useState({
    latitude: pUCPRegion.latitude,
    longitude: pUCPRegion.longitude,
  });
  const { state, setSelectedContainerId } = useRecycleFlow();
  const { selectedContainer, finalWasteType } = useResolvedRecycleSelection();

  const filteredWasteTypes = useMemo(() => {
    if (category === 'all') {
      return wasteTypes;
    }
    return wasteTypes.filter((item) => item.categoryId === category);
  }, [category]);

  const nearby = useMemo(() => {
    if (!filteredWasteTypes.length) {
      return [];
    }
    const ids = new Set(filteredWasteTypes.map((item) => item.id));
    return containers
      .map((container) => ({
        ...container,
        distanceKm: haversineDistanceKm(location, {
          latitude: container.latitude,
          longitude: container.longitude,
        }),
      }))
      .filter((container) => container.distanceKm <= 3)
      .filter((container) => container.acceptedWasteTypeIds.some((wasteId) => ids.has(wasteId)))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filteredWasteTypes, location]);

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
    Location.getCurrentPositionAsync().then((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    if (nearby.length === 0 && category !== 'all') {
      Alert.alert('Sin contenedores', 'No se encontraron contenedores compatibles en 3 km.', [
        { text: 'Entendido' },
      ]);
    }
  }, [category, nearby.length]);

  const selectedDistanceKm = selectedContainer
    ? haversineDistanceKm(location, {
        latitude: selectedContainer.latitude,
        longitude: selectedContainer.longitude,
      })
    : undefined;

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppButton
            iconOnly
            size="icon"
            variant="outline"
            leftIcon={
              <Ionicons
                name="arrow-undo-outline"
                size={theme.iconSizes.md}
                color={theme.colors.textPrimary}
              />
            }
            style={styles.headerIconButton}
          />
          <AppText style={styles.title}>Reciclaje</AppText>
          <AppText style={styles.score}>4 🔥</AppText>
        </View>
        <AppText variant="caption" style={styles.subtitle}>
          ¿No sabes que contenedor? Escanea tu residuo
        </AppText>
      </View>

      <View style={styles.filterRow}>
        <AppText style={styles.filterTitle}>Filtrar por contenedores</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          <IconFilterButton
            selected={category === 'all'}
            onPress={() => setCategory('all')}
            icon={
              <Ionicons
                name="trash-outline"
                size={theme.iconSizes.md}
                color={theme.recycle.iconNeutral}
              />
            }
          />
          <IconFilterButton
            selected={category === 'plastic_pet'}
            onPress={() => setCategory('plastic_pet')}
            icon={
              <MaterialCommunityIcons
                name="bottle-soda-outline"
                size={theme.iconSizes.md}
                color={theme.recycle.iconNeutral}
              />
            }
          />
          <IconFilterButton
            selected={category === 'paper_cardboard'}
            onPress={() => setCategory('paper_cardboard')}
            icon={
              <Ionicons
                name="briefcase-outline"
                size={theme.iconSizes.md}
                color={theme.recycle.iconNeutral}
              />
            }
          />
          <IconFilterButton
            selected={category === 'glass'}
            onPress={() => setCategory('glass')}
            icon={
              <MaterialCommunityIcons
                name="flask-outline"
                size={theme.iconSizes.md}
                color={theme.recycle.iconNeutral}
              />
            }
          />
          <IconFilterButton
            selected={category === 'non_recoverable'}
            onPress={() => setCategory('non_recoverable')}
            icon={
              <MaterialCommunityIcons
                name="delete-empty-outline"
                size={theme.iconSizes.md}
                color={theme.recycle.iconNeutral}
              />
            }
          />
          <IconFilterButton
            selected={category === 'battery'}
            onPress={() => setCategory('battery')}
            icon={
              <Ionicons
                name="battery-half-outline"
                size={theme.iconSizes.md}
                color={theme.recycle.iconNeutral}
              />
            }
          />
          <IconFilterButton
            selected={category === 'electronic_waste'}
            onPress={() => setCategory('electronic_waste')}
            icon={
              <MaterialCommunityIcons
                name="laptop"
                size={theme.iconSizes.md}
                color={theme.recycle.iconNeutral}
              />
            }
          />
          <AppButton
            iconOnly
            size="icon"
            variant="secondary"
            leftIcon={
              <Ionicons name="camera" size={theme.iconSizes.md} color={theme.colors.textInverse} />
            }
            onPress={() => router.push('/recycle/camera')}
            style={styles.cameraButton}
          />
        </ScrollView>
      </View>

      <View style={styles.mapContainer}>
        <RecycleMap markers={markers} region={pUCPRegion} onMarkerPress={setSelectedContainerId} />
      </View>

      <View style={styles.bottomArea}>
        {selectedContainer && finalWasteType ? (
          <AppCard>
            <AppText variant="subtitle">{selectedContainer.name}</AppText>
            <AppText muted style={styles.cardGap}>
              Residuo seleccionado: {finalWasteType.label}
            </AppText>
            {selectedDistanceKm !== undefined ? (
              <AppText muted style={styles.cardGap}>
                Distancia: {selectedDistanceKm.toFixed(2)} km
              </AppText>
            ) : null}
            <AppButton label="Reciclar aqui" onPress={() => router.push('/recycle/instructions')} />
          </AppCard>
        ) : (
          <AppButton
            variant="outline"
            label="Mostrar instrucciones de reciclaje"
            rightIcon={
              <FontAwesome6
                name="book-open-reader"
                size={theme.iconSizes.xs}
                color={theme.colors.textPrimary}
              />
            }
            style={styles.instructionsButton}
          />
        )}
      </View>
      {state.predictionConfidence !== undefined ? (
        <AppText variant="caption" muted style={styles.devNote}>
          Ultima confianza: {state.predictionConfidence}
        </AppText>
      ) : null}
    </AppScreen>
  );
}

export default MapScreen;

type IconFilterButtonProps = {
  selected?: boolean;
  onPress: () => void;
  icon: ReactNode;
};

function IconFilterButton({ selected, onPress, icon }: IconFilterButtonProps) {
  return (
    <AppButton
      iconOnly
      size="icon"
      variant="outline"
      leftIcon={icon}
      onPress={onPress}
      style={[styles.iconFilter, selected ? styles.iconFilterSelected : null]}
    />
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
  },
  headerIconButton: {
    width: theme.components.buttonHeights.icon,
    height: theme.components.buttonHeights.icon,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 0,
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
  subtitle: {
    textAlign: 'center',
    color: theme.recycle.headerSubtitle,
    marginTop: theme.spacing.xxs,
    marginBottom: theme.spacing.sm,
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
    alignItems: 'center',
  },
  iconFilter: {
    width: theme.components.buttonHeights.icon,
    height: theme.components.buttonHeights.icon,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.recycle.iconButtonBg,
    borderColor: theme.recycle.iconButtonBg,
    marginRight: theme.spacing.sm,
    paddingHorizontal: 0,
  },
  iconFilterSelected: {
    borderWidth: theme.spacing.xxs,
    borderColor: theme.colors.primary,
    backgroundColor: theme.recycle.iconButtonSelectedBg,
  },
  cameraButton: {
    width: theme.components.buttonHeights.icon,
    height: theme.components.buttonHeights.icon,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.recycle.iconButtonCameraBg,
    marginLeft: theme.spacing.xs,
    paddingHorizontal: 0,
  },
  mapContainer: {
    flex: 1,
  },
  bottomArea: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  cardGap: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  instructionsButton: {
    justifyContent: 'flex-end',
  },
  devNote: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
    fontSize: theme.fontSizes.xs,
  },
});
