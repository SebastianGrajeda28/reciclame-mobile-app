import { Alert, StyleSheet, View } from 'react-native';

import {
  AppCard,
  AppCardFooter,
  AppHeatMeter,
  AppIcon,
  AppIconButton,
  AppText,
  theme,
} from '@/src/ui';

type ProfileStreakCardProps = {
  currentStreakDays: number;
  nextStreakMilestoneDays: number;
};

export function ProfileStreakCard({
  currentStreakDays,
  nextStreakMilestoneDays,
}: ProfileStreakCardProps) {
  function handleInfoPress() {
    Alert.alert(
      'Nivel de calor',
      'Solo tu primer reciclaje del dia aumenta el calor de la racha. El calor baja con el tiempo y, mientras mayor sea tu nivel, mas dificil es que se extinga.',
    );
  }

  return (
    <AppCard>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <AppIcon name="flame" size={theme.iconSizes.xl} color={theme.colors.warning} />
          <AppText variant="h3">Racha actual: {currentStreakDays} dias</AppText>
        </View>
        <AppIconButton
          accessibilityLabel="Informacion sobre la racha"
          variant="ghost"
          onPress={handleInfoPress}
          icon={
            <AppIcon name="info" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
          }
        />
      </View>

      <AppHeatMeter
        value={Math.min(currentStreakDays, nextStreakMilestoneDays)}
        maxValue={nextStreakMilestoneDays}
        label="Nivel de calor"
      />
      <AppCardFooter>
        <AppText muted>Siguiente hito: {nextStreakMilestoneDays} dias.</AppText>
      </AppCardFooter>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.s3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    flex: 1,
  },
});
