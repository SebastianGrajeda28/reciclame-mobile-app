import { Text, TextProps, TextStyle } from 'react-native';

import { theme } from '@/src/ui/theme';

type AppTextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'error' | 'button';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  muted?: boolean;
};

const variantStyles: Record<AppTextVariant, TextStyle> = {
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.regular,
    color: theme.colors.textPrimary,
  },
  caption: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.regular,
    color: theme.colors.textSecondary,
  },
  error: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.danger,
  },
  button: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
};

export function AppText({ variant = 'body', muted, style, ...props }: AppTextProps) {
  return (
    <Text
      style={[
        variantStyles[variant],
        muted ? { color: theme.colors.textSecondary } : null,
        style,
      ]}
      {...props}
    />
  );
}

