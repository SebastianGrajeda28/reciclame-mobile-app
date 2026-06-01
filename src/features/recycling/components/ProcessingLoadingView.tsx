import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

import { AppText, theme } from '@/src/ui';

type Props = {
  /** Etiqueta mostrada debajo del spinner. Por defecto "Analizando con IA..." */
  label?: string;
  /** Slot opcional para contenido adicional debajo del spinner (ej. datos curiosos). */
  slot?: ReactNode;
};

/**
 * Vista de carga reutilizable para el flujo de procesamiento de residuos.
 * Muestra skeletons animados con pulso de opacidad y un spinner de actividad.
 *
 * @param label - Texto descriptivo bajo el spinner.
 * @param slot  - Nodo React opcional inyectado tras el spinner (ej. datos curiosos).
 */
export function ProcessingLoadingView({ label = 'Analizando con IA...', slot }: Props) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <>
      <Animated.View style={[styles.skeletonLong, { opacity: pulse }]} />
      <Animated.View style={[styles.skeletonMed, { opacity: pulse }]} />
      <Animated.View style={[styles.skeletonShort, { opacity: pulse }]} />
      <View style={styles.spinnerRow}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText style={styles.loadingLabel}>{label}</AppText>
      </View>
      {slot}
    </>
  );
}

const SKELETON_RADIUS = theme.radius.sm;
const SKELETON_COLOR = theme.colors.border;

const styles = StyleSheet.create({
  skeletonLong: {
    height: 14,
    borderRadius: SKELETON_RADIUS,
    backgroundColor: SKELETON_COLOR,
    width: '90%',
  },
  skeletonMed: {
    height: 14,
    borderRadius: SKELETON_RADIUS,
    backgroundColor: SKELETON_COLOR,
    width: '75%',
  },
  skeletonShort: {
    height: 14,
    borderRadius: SKELETON_RADIUS,
    backgroundColor: SKELETON_COLOR,
    width: '60%',
  },
  spinnerRow: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
  loadingLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});
