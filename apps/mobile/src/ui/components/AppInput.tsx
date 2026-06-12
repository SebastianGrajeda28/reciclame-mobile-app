import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useState } from 'react';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type AppInputStatus = 'default' | 'success' | 'error';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  status?: AppInputStatus;
  filled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  helperTextStyle?: StyleProp<TextStyle>;
};

export function AppInput({
  label,
  error,
  helperText,
  status = 'default',
  filled = false,
  loading = false,
  leftIcon,
  rightIcon,
  editable = true,
  containerStyle,
  fieldStyle,
  inputStyle,
  helperTextStyle,
  onBlur,
  onFocus,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const resolvedStatus: AppInputStatus = error ? 'error' : status;
  const disabled = !editable;
  const helperMessage = error ?? helperText;

  function handleFocus(event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    setIsFocused(false);
    onBlur?.(event);
  }

  function getFieldStateStyle(): ViewStyle[] {
    const stylesList: ViewStyle[] = [styles.field];

    if (filled) {
      stylesList.push(styles.fieldFilled);
    }

    if (disabled) {
      stylesList.push(styles.fieldDisabled);
    }

    if (isFocused && !disabled) {
      stylesList.push(styles.fieldFocused);
    }

    if (resolvedStatus === 'error') {
      stylesList.push(styles.fieldError);
    } else if (resolvedStatus === 'success') {
      stylesList.push(styles.fieldSuccess);
      if (filled) {
        stylesList.push(styles.fieldSuccessFilled);
      }
    }

    return stylesList;
  }

  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={[getFieldStateStyle(), fieldStyle]}>
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          editable={editable && !loading}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={theme.colors.inputPlaceholder}
          style={[styles.input, disabled ? styles.inputDisabled : null, inputStyle]}
          {...props}
        />
        {loading ? (
          <ActivityIndicator
            size="small"
            color={resolvedStatus === 'error' ? theme.colors.danger : theme.colors.primary}
          />
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      {helperMessage ? (
        <AppText
          variant={resolvedStatus === 'error' ? 'error' : 'caption'}
          style={[
            styles.helperText,
            resolvedStatus === 'success' ? styles.helperTextSuccess : null,
            helperTextStyle,
          ]}
        >
          {helperMessage}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: theme.spacing.xs,
  },
  field: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.inputBackground,
    minHeight: theme.components.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.s2,
  },
  fieldFilled: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  fieldFocused: {
    borderColor: theme.colors.primary,
    ...theme.shadows.focus,
  },
  fieldSuccess: {
    borderColor: theme.colors.success,
  },
  fieldSuccessFilled: {
    backgroundColor: theme.colors.successBg,
  },
  fieldError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerBg,
  },
  fieldDisabled: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    paddingVertical: theme.spacing.s3,
  },
  inputDisabled: {
    color: theme.colors.disabledText,
  },
  leftIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: theme.spacing.xs,
  },
  helperTextSuccess: {
    color: theme.colors.success,
  },
});
