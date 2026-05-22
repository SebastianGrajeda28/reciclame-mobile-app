import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppScreen, theme } from '@/src/ui';

type ProfileScreenContainerProps = PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function ProfileScreenContainer({ children, contentStyle }: ProfileScreenContainerProps) {
  return (
    <AppScreen scroll padded insetBottom>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.s4,
  },
});
