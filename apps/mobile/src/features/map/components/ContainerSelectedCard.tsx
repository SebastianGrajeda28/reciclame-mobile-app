import { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { binTypeConfig } from '@/src/features/recycling/services/bin-type-config.mock';
import { haversineDistanceKm } from '@/src/features/recycling/services/distance';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import { AppButton, AppIcon, AppText, theme } from '@/src/ui';
import type { AppIconName } from '@/src/ui/components/AppIcon';

type Props = {
  container: RecyclingContainer;
  userLocation: { latitude: number; longitude: number };
  finalWasteTypeLabel?: string;
  resolvedBinTypeName?: string;
  onDismiss: () => void;
  onRecycleHere: () => void;
  compact?: boolean;
  hideDismiss?: boolean;
};

export function ContainerSelectedCard({
  container,
  userLocation,
  finalWasteTypeLabel,
  resolvedBinTypeName,
  onDismiss,
  onRecycleHere,
  compact,
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
    <View
      style={[
        styles.card,
        compact ? styles.cardCompact : null,
        { paddingBottom: compact ? theme.spacing.s2 : theme.spacing.md + bottomInset },
      ]}
    >
      {!hideDismiss && (
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <AppIcon name="close" size={theme.iconSizes.md} color={theme.colors.textSecondary} />
        </Pressable>
      )}
      <View style={[styles.info, compact ? styles.infoCompact : null]}>
        <AppText style={styles.eyebrow}>PUNTO DE RECICLAJE</AppText>
        <AppText style={styles.title}>{container.name}</AppText>
        <AppText style={[styles.label, compact ? styles.labelCompact : null]}>
          Contenedores disponibles
        </AppText>
        <View style={styles.iconsRow}>
          {availableIcons.map((item, i) => (
            <View key={i} style={[styles.icon, { backgroundColor: item.color }]}>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  cardCompact: {
    paddingTop: theme.spacing.s3,
    gap: theme.spacing.s2,
  },
  dismissButton: {
    position: 'absolute',
    top: theme.spacing.s2,
    right: theme.spacing.s2,
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    zIndex: 1,
  },
  info: {
    gap: theme.spacing.xs,
  },
  infoCompact: {
    gap: theme.spacing.xxs,
  },
  eyebrow: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  labelCompact: {
    marginTop: 0,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  icon: {
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
