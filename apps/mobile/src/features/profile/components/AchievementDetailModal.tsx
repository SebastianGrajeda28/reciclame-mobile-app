import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { AppButton, AppIcon, AppText, theme } from '@/src/ui';

type AchievementDetailModalProps = {
  visible: boolean;
  badge: ProfileBadge | null;
  onClose: () => void;
};

export function AchievementDetailModal({ visible, badge, onClose }: AchievementDetailModalProps) {
  if (!badge) return null;

  const earned = !!badge.earnedAt;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <AppIcon name="close" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
          </Pressable>

          <View style={styles.imageContainer}>
            {earned ? (
              <Image
                source={
                  badge.imageUrl
                    ? { uri: badge.imageUrl }
                    : require('@/assets/images/badge-placeholder.png')
                }
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <AppIcon name="lock" size={theme.iconSizes.lg} color={theme.colors.textSecondary} />
            )}
          </View>

          <AppText variant="h3" style={styles.name}>
            {earned ? badge.name : '???'}
          </AppText>

          <View style={styles.section}>
            <AppText variant="bodyS" style={styles.sectionLabel}>
              Descripción
            </AppText>
            <AppText variant="body" style={styles.description}>
              {badge.description}
            </AppText>
          </View>

          <View style={styles.section}>
            <AppText variant="bodyS" style={styles.sectionLabel}>
              Recompensa
            </AppText>
            <AppText variant="body" style={styles.reward}>
              {badge.reward}
            </AppText>
          </View>

          <View style={styles.section}>
            <AppText variant="bodyS" style={styles.sectionLabel}>
              Pista
            </AppText>
            <AppText variant="caption" muted style={styles.hint}>
              {badge.hint}
            </AppText>
          </View>

          <View style={styles.footer}>
            <AppText variant="caption" muted style={styles.percentage}>
              {badge.userPercentage}% de usuarios tienen este logro
            </AppText>
          </View>

          <AppButton onPress={onClose} style={styles.button}>
            Cerrar
          </AppButton>
        </View>
      </View>
    </Modal>
  );
}

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
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: theme.spacing.s2,
    marginBottom: theme.spacing.s2,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
  },
  image: {
    width: 80,
    height: 80,
  },
  name: {
    textAlign: 'center',
    marginBottom: theme.spacing.s4,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.s4,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: theme.spacing.s1,
    color: theme.colors.textSecondary,
  },
  description: {
    lineHeight: 22,
  },
  reward: {
    lineHeight: 22,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  hint: {
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
  },
  percentage: {
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.s2,
  },
});
