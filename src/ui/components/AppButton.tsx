import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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

type VariantStyle = {
  container: ViewStyle;
  text: TextStyle;
  spinner: string;
};

function getVariantStyle(variant: ButtonVariant): VariantStyle {
  switch (variant) {
    case 'secondary':
      return {
        container: { backgroundColor: theme.colors.secondary },
        text: { color: theme.colors.textInverse },
        spinner: theme.colors.textInverse,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: 1,
        },
        text: { color: theme.colors.textPrimary },
        spinner: theme.colors.textPrimary,
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        text: { color: theme.colors.primary },
        spinner: theme.colors.primary,
      };
    case 'danger':
      return {
        container: { backgroundColor: theme.colors.danger },
        text: { color: theme.colors.textInverse },
        spinner: theme.colors.textInverse,
      };
    default: // primary
      return {
        container: { backgroundColor: theme.colors.primary },
        text: { color: theme.colors.textInverse },
        spinner: theme.colors.textInverse,
      };
  }
}

function getSizeStyle(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return { height: theme.components.buttonHeights.sm, paddingHorizontal: theme.spacing.s3 };
    case 'lg':
      return { height: theme.components.buttonHeights.lg, paddingHorizontal: theme.spacing.s6 };
    case 'icon':
      return { height: theme.components.buttonHeights.icon, width: theme.components.buttonHeights.icon };
    default: // md
      return { height: theme.components.buttonHeights.md, paddingHorizontal: theme.spacing.s4 };
  }
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

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        getSizeStyle(size),
        variantStyle.container,
        iconOnly ? styles.iconOnly : null,
        pressed ? styles.pressed : null,
        disabled || loading ? styles.disabled : null,
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={variantStyle.spinner} /> : leftIcon}
        {label ? (
          <AppText variant="button" style={[variantStyle.text, labelStyle]}>
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
    gap: theme.spacing.s1,
  },
  iconOnly: {
    paddingHorizontal: 0,
    borderRadius: theme.radius.full,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
});
