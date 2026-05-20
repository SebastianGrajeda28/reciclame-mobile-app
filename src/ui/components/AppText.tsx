import { Text, TextProps, TextStyle } from 'react-native';

import { theme } from '@/src/ui/theme';

// DS typography scale + legacy variants used in existing screens
type AppTextVariant =
  | 'display' | 'h1' | 'h2' | 'h3' | 'h4'
  | 'bodyL' | 'body' | 'bodyS'
  | 'caption' | 'overline'
  | 'button' | 'error'
  // Legacy aliases kept for existing screens
  | 'title' | 'subtitle';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  muted?: boolean;
};

const variantStyles: Record<AppTextVariant, TextStyle> = {
  display: { ...theme.typography.display, color: theme.colors.textPrimary },
  h1:      { ...theme.typography.h1,      color: theme.colors.textPrimary },
  h2:      { ...theme.typography.h2,      color: theme.colors.textPrimary },
  h3:      { ...theme.typography.h3,      color: theme.colors.textPrimary },
  h4:      { ...theme.typography.h4,      color: theme.colors.textPrimary },
  bodyL:   { ...theme.typography.bodyL,   color: theme.colors.textPrimary },
  body:    { ...theme.typography.body,    color: theme.colors.textPrimary },
  bodyS:   { ...theme.typography.bodyS,   color: theme.colors.textPrimary },
  caption: { ...theme.typography.caption, color: theme.colors.textSecondary },
  overline:{ ...theme.typography.overline,color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  button:  { fontSize: 15, lineHeight: 20, fontWeight: theme.fontWeights.semibold, color: theme.colors.textPrimary },
  error:   { ...theme.typography.caption, fontWeight: theme.fontWeights.medium, color: theme.colors.danger },
  // Legacy aliases
  title:    { ...theme.typography.h2, color: theme.colors.textPrimary },
  subtitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
};

export function AppText({ variant = 'body', muted, style, ...props }: AppTextProps) {
  return (
    <Text
      style={[variantStyles[variant], muted ? { color: theme.colors.textSecondary } : null, style]}
      {...props}
    />
  );
}
