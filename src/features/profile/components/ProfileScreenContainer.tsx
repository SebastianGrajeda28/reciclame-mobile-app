import { PropsWithChildren, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppScreen, theme } from '@/src/ui';

type ProfileScreenContainerProps = PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
}>;

export function ProfileScreenContainer({ children, contentStyle, footer }: ProfileScreenContainerProps) {
  if (footer) {
    return (
      <AppScreen padded insetBottom={false}>
        <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
        <View style={styles.footer}>{footer}</View>
      </AppScreen>
    );
  }
  return (
    <AppScreen scroll padded insetBottom>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.s4,
  },
  footer: {
    paddingTop: theme.spacing.s3,
    paddingBottom: theme.spacing.s4,
  },
});
