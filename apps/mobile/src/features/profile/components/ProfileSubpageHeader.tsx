import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, theme } from '@/src/ui';

type ProfileSubpageHeaderProps = {
  title: string;
  titleVariant?: 'h1' | 'h2';
  leading: ReactNode;
  trailing?: ReactNode;
};

export function ProfileSubpageHeader({
  title,
  titleVariant = 'h2',
  leading,
  trailing,
}: ProfileSubpageHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.sideSlot}>{leading}</View>
      <View style={styles.titleWrap}>
        <AppText variant={titleVariant}>{title}</AppText>
      </View>
      <View style={styles.sideSlot}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSlot: {
    width: theme.components.buttonHeights.icon,
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
});
