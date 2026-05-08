import { ActivityIndicator, Pressable, PressableProps, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type AppButtonProps = Omit<PressableProps, 'style'> & {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

function getVariantStyle(variant: ButtonVariant) {
  if (variant === 'secondary') {
    return {
      container: { backgroundColor: theme.colors.secondary },
      text: { color: theme.colors.textInverse },
      spinner: theme.colors.textInverse,
    };
  }

  if (variant === 'outline') {
    return {
      container: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong, borderWidth: 1 },
      text: { color: theme.colors.textPrimary },
      spinner: theme.colors.textPrimary,
    };
  }

  return {
    container: { backgroundColor: theme.colors.primary },
    text: { color: theme.colors.textInverse },
    spinner: theme.colors.textInverse,
  };
}

function getSizeStyle(size: ButtonSize) {
  if (size === 'sm') return { height: theme.components.buttonHeights.sm, paddingHorizontal: theme.spacing.md };
  if (size === 'lg') return { height: theme.components.buttonHeights.lg, paddingHorizontal: theme.spacing.lg };
  if (size === 'icon') return { height: theme.components.buttonHeights.icon, width: theme.components.buttonHeights.icon };
  return { height: theme.components.buttonHeights.md, paddingHorizontal: theme.spacing.lg };
}

export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  leftIcon,
  rightIcon,
  iconOnly,
  style,
  labelStyle,
  ...props
}: AppButtonProps) {
  const variantStyle = getVariantStyle(variant);
  const hasContent = Boolean(label || leftIcon || rightIcon || loading);

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        getSizeStyle(size),
        variantStyle.container,
        iconOnly ? styles.iconOnly : null,
        pressed ? styles.pressed : null,
        (disabled || loading) ? styles.disabled : null,
        style,
      ]}
      {...props}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={variantStyle.spinner} /> : leftIcon}
        {label ? (
          <AppText variant="button" style={[variantStyle.text, hasContent ? styles.label : null, labelStyle]}>
            {label}
          </AppText>
        ) : null}
        {!loading ? rightIcon : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  iconOnly: {
    paddingHorizontal: 0,
    borderRadius: theme.radius.pill,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
  label: {
    textAlign: 'center',
  },
});

