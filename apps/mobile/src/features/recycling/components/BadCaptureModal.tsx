import { Modal, StyleSheet, View } from 'react-native';

import type { ImageQualityReason } from '@/src/features/recycling/services/image-validation';
import { AppButton, AppIcon, AppText, theme } from '@/src/ui';

type BadCaptureModalProps = {
  /** Motivo del rechazo; `null` cierra el modal. */
  reason: ImageQualityReason | null;
  onRetry: () => void;
  onExit: () => void;
};

const COPY: Record<ImageQualityReason, { title: string; message: string }> = {
  blur: {
    title: 'Foto borrosa',
    message: 'La foto salió borrosa. Mantén firme el teléfono e intenta de nuevo.',
  },
  dark: {
    title: 'Foto muy oscura',
    message: 'Hay poca luz. Busca un lugar más iluminado o activa el flash.',
  },
  bright: {
    title: 'Foto muy clara',
    message: 'Hay demasiada luz. Evita apuntar directamente a una fuente de luz.',
  },
};

export function BadCaptureModal({ reason, onRetry, onExit }: BadCaptureModalProps) {
  const copy = reason ? COPY[reason] : null;

  return (
    <Modal
      visible={reason !== null}
      transparent
      animationType="fade"
      onRequestClose={onExit}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconWrapper}>
            <AppIcon name="alertCircle" size={theme.iconSizes.lg} color={theme.colors.danger} />
          </View>

          <AppText variant="h3" style={styles.title}>
            {copy?.title ?? ''}
          </AppText>
          <AppText variant="body" muted style={styles.message}>
            {copy?.message ?? ''}
          </AppText>

          <View style={styles.actions}>
            <AppButton
              variant="outline"
              label="Salir al menú"
              onPress={onExit}
              style={styles.actionBtn}
            />
            <AppButton label="Intentar de nuevo" onPress={onRetry} style={styles.actionBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default BadCaptureModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.s8,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.s8,
    width: '100%',
    maxWidth: 400,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: theme.spacing.s2,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.s8,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
