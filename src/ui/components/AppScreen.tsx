import { PropsWithChildren } from 'react';
import { ScrollView, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/src/ui/theme';

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}>;

export function AppScreen({
  children,
  scroll = false,
  padded = false,
  style,
  contentContainerStyle,
}: AppScreenProps) {
  const bodyPadding = padded ? styles.padded : null;

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[bodyPadding, contentContainerStyle]}
          keyboardShouldPersistTaps="handled">
          <View style={style}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.flex, bodyPadding, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: theme.components.screenPaddingHorizontal,
  },
});

