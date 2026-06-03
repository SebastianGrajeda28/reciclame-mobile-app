import { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { binTypeConfig } from '@/src/features/recycling/services/bin-type-config.mock';
import { haversineDistanceKm } from '@/src/features/recycling/services/distance';
import { AppButton, AppIcon, AppText, theme } from '@/src/ui';
import type { AppIconName } from '@/src/ui/components/AppIcon';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

type Props = {
  container: RecyclingContainer;
  userLocation: { latitude: number; longitude: number };
  finalWasteTypeLabel?: string;
  resolvedBinTypeName?: string;
  onDismiss: () => void;
  onRecycleHere: () => void;
  hideDismiss?: boolean;
};

export function ContainerSelectedCard({
  container,
  userLocation,
  finalWasteTypeLabel,
  resolvedBinTypeName,
  onDismiss,
  onRecycleHere,
  hideDismiss,
}: Props) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const distanceKm = haversineDistanceKm(userLocation, {
    latitude: container.latitude,
    longitude: container.longitude,
  });

  const availableIcons = useMemo(() => {
    return container.availableBinTypeIds
      .map((id) => binTypeConfig[id])
      .filter(Boolean)
      .filter((item) => item.icon) as { icon: AppIconName; color: string; iconColor: string }[];
  }, [container]);

  function openDirections() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${container.latitude},${container.longitude}`;
    Linking.openURL(url);
  }

  return (
    <View style={[styles.card, { paddingBottom: theme.spacing.md + bottomInset }]}>
      {!hideDismiss && <Pressable style={styles.dismissButton} onPress={onDismiss}>
        <AppIcon name="close" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
      </Pressable>}
      <View style={styles.content}>
        <AppText style={styles.title}>Lugar de reciclaje: {container.name}</AppText>
        <View style={styles.availableRow}>
          <AppText style={styles.availableLabel}>Contenedores disponibles: </AppText>
          {availableIcons.map((item, i) => (
            <View key={i} style={[styles.availableIcon, { backgroundColor: item.color }]}>
              <AppIcon name={item.icon} size={theme.iconSizes.md} color={item.iconColor} />
            </View>
          ))}
        </View>
        {finalWasteTypeLabel && (
          <AppText style={styles.meta}>Residuo detectado: {finalWasteTypeLabel}</AppText>
        )}
        {resolvedBinTypeName && (
          <AppText style={styles.meta}>Contenedor correspondiente: {resolvedBinTypeName}</AppText>
        )}
        <View style={styles.distanceRow}>
          <AppText style={styles.meta}>Distancia: {distanceKm.toFixed(2)} km</AppText>
          <Pressable onPress={openDirections}>
            <AppText style={styles.directionsLink}>Direcciones</AppText>
          </Pressable>
        </View>
      </View>
      <AppButton label="Reciclar aquí" size="sm" onPress={onRecycleHere} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  content: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  title: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
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
});
