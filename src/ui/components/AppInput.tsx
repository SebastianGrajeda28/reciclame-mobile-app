import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function AppInput({
  label,
  error,
  editable = true,
  containerStyle,
  inputStyle,
  ...props
}: AppInputProps) {
  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        editable={editable}
        placeholderTextColor={theme.colors.inputPlaceholder}
        style={[styles.input, !editable ? styles.inputDisabled : null, inputStyle]}
        {...props}
      />
      {error ? (
        <AppText variant="error" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: theme.components.inputHeight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.disabledText,
  },
  error: {
    marginTop: theme.spacing.xs,
  },
});
