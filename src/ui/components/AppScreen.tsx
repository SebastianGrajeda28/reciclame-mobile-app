import { PropsWithChildren } from 'react';
import { ScrollView, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/src/ui/theme';

type AppScreenSpacing = 'none' | 'md' | 'lg';

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  centered?: boolean;
  spacing?: AppScreenSpacing;
  insetTop?: boolean;
  insetBottom?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}>;

function getSpacingStyle(spacing: AppScreenSpacing) {
  switch (spacing) {
    case 'lg':
      return styles.spacingLg;
    case 'md':
      return styles.spacingMd;
    default:
      return null;
  }
}

export function AppScreen({
  children,
  scroll = false,
  padded = false,
  centered = false,
  spacing = 'none',
  insetTop = true,
  insetBottom = true,
  style,
  contentContainerStyle,
}: AppScreenProps) {
  const edges = [
    insetTop ? 'top' : null,
    insetBottom ? 'bottom' : null,
  ].filter(Boolean) as ('top' | 'bottom')[];

  const frameStyles = [
    padded ? styles.padded : null,
    insetTop ? styles.insetTop : null,
    insetBottom ? styles.insetBottom : null,
  ];

  const bodyStyles = [
    scroll ? styles.scrollBody : styles.flex,
    centered ? styles.centered : null,
    getSpacingStyle(spacing),
    style,
  ];

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, frameStyles, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={bodyStyles}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[bodyStyles, frameStyles]}>{children}</View>
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
  scrollContent: {
    flexGrow: 1,
  },
  scrollBody: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: theme.components.screenPaddingHorizontal,
  },
  insetTop: {
    paddingTop: theme.spacing.s4,
  },
  insetBottom: {
    paddingBottom: theme.spacing.s6,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacingMd: {
    gap: theme.spacing.s4,
  },
  spacingLg: {
    gap: theme.spacing.s6,
  },
});
