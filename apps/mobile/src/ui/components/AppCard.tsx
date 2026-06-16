import { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type AppCardVariant = 'default' | 'muted' | 'inverse' | 'success' | 'info' | 'warning' | 'danger';
type AppCardPadding = 'none' | 'sm' | 'md' | 'lg';
type AppCardElevation = 'none' | 'xs' | 'sm' | 'md' | 'lg';

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  variant?: AppCardVariant;
  padding?: AppCardPadding;
  elevation?: AppCardElevation;
  bordered?: boolean;
  disabled?: boolean;
  onPress?: PressableProps['onPress'];
}>;

type AppCardHeaderProps = PropsWithChildren<{
  leading?: ReactNode;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

type AppCardHeaderTextProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

type AppCardFooterProps = PropsWithChildren<{
  align?: 'start' | 'center' | 'end' | 'between';
  style?: StyleProp<ViewStyle>;
}>;

type AppCardTextProps = ComponentProps<typeof AppText>;

function getVariantStyle(variant: AppCardVariant): ViewStyle {
  switch (variant) {
    case 'muted':
      return {
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: theme.colors.border,
      };
    case 'inverse':
      return {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
      };
    case 'success':
      return {
        backgroundColor: theme.colors.successBg,
        borderColor: theme.colors.primarySubtle,
      };
    case 'info':
      return {
        backgroundColor: theme.colors.infoBg,
        borderColor: theme.colors.infoBorder,
      };
    case 'warning':
      return {
        backgroundColor: theme.colors.warningBg,
        borderColor: theme.colors.warningBg,
      };
    case 'danger':
      return {
        backgroundColor: theme.colors.dangerBg,
        borderColor: theme.colors.dangerBg,
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      };
  }
}

function getPaddingStyle(padding: AppCardPadding): ViewStyle {
  switch (padding) {
    case 'none':
      return { padding: 0 };
    case 'sm':
      return { padding: theme.spacing.s3 };
    case 'lg':
      return { padding: theme.spacing.s6 };
    default:
      return { padding: theme.components.cardPadding };
  }
}

function getElevationStyle(elevation: AppCardElevation): ViewStyle {
  switch (elevation) {
    case 'none':
      return theme.shadows.none;
    case 'xs':
      return theme.shadows.xs;
    case 'md':
      return theme.shadows.md;
    case 'lg':
      return theme.shadows.lg;
    default:
      return theme.shadows.sm;
  }
}

export function AppCard({
  children,
  style,
  variant = 'default',
  padding = 'md',
  elevation = 'sm',
  bordered = true,
  disabled,
  onPress,
}: AppCardProps) {
  const cardStyle = [
    styles.card,
    getVariantStyle(variant),
    getPaddingStyle(padding),
    getElevationStyle(elevation),
    !bordered ? styles.borderless : null,
    disabled ? styles.disabled : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

export function AppCardHeader({ leading, trailing, children, style }: AppCardHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {leading ? <View style={styles.headerLeading}>{leading}</View> : null}
      <View style={styles.headerBody}>{children}</View>
      {trailing ? <View style={styles.headerTrailing}>{trailing}</View> : null}
    </View>
  );
}

export function AppCardHeaderText({ children, style }: AppCardHeaderTextProps) {
  return <View style={[styles.headerText, style]}>{children}</View>;
}

export function AppCardEyebrow({ style, ...props }: AppCardTextProps) {
  return <AppText variant="overline" style={style} {...props} />;
}

export function AppCardTitle({ style, variant = 'h3', ...props }: AppCardTextProps) {
  return <AppText variant={variant} style={style} {...props} />;
}

export function AppCardDescription({
  style,
  muted = true,
  variant = 'bodyS',
  ...props
}: AppCardTextProps) {
  return <AppText variant={variant} muted={muted} style={style} {...props} />;
}

export function AppCardFooter({ children, align = 'start', style }: AppCardFooterProps) {
  return (
    <View
      style={[
        styles.footer,
        align === 'center' ? styles.footerCenter : null,
        align === 'end' ? styles.footerEnd : null,
        align === 'between' ? styles.footerBetween : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  borderless: {
    borderWidth: 0,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.s3,
  },
  headerLeading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBody: {
    flex: 1,
  },
  headerTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerText: {
    gap: theme.spacing.s1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  footerCenter: {
    justifyContent: 'center',
  },
  footerEnd: {
    justifyContent: 'flex-end',
  },
  footerBetween: {
    justifyContent: 'space-between',
  },
});
