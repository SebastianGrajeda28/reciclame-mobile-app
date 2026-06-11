import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

const MOCK_FRIEND_CODE = '123456';

export function AddFriend() {
  const [friendCode, setFriendCode] = useState('');

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/amigos');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.screen}>
          <View style={styles.header}>
            <AppIconButton
              accessibilityLabel="Volver"
              variant="ghost"
              onPress={handleBack}
              icon={
                <AppIcon
                  name="arrowLeft"
                  size={theme.iconSizes.md}
                  color={theme.colors.secondary}
                />
              }
            />
            <AppText variant="h3" style={styles.headerTitle}>
              Agregar amigo
            </AppText>
          </View>

          <View style={styles.content}>
            <View style={styles.codeCard}>
              <AppText variant="h4" style={styles.sectionTitle}>
                Tu código:
              </AppText>
              <View style={styles.codeBox}>
                <AppText variant="h2" style={styles.codeText}>
                  {MOCK_FRIEND_CODE}
                </AppText>
              </View>
            </View>

            <View style={styles.inputCard}>
              <AppText variant="h4" style={styles.sectionTitle}>
                Ingresar código de amigo
              </AppText>
              <View style={styles.inputRow}>
                <TextInput
                  value={friendCode}
                  onChangeText={setFriendCode}
                  keyboardType="number-pad"
                  placeholder="Código de amigo.."
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  maxLength={8}
                />
                <AppIconButton
                  accessibilityLabel="Agregar codigo de amigo"
                  variant="primary"
                  onPress={() => undefined}
                  icon={
                    <AppIcon
                      name="plus"
                      size={theme.iconSizes.md}
                      color={theme.colors.textPrimary}
                    />
                  }
                  style={styles.addButton}
                />
              </View>
            </View>

            <Image
              source={require('@/assets/images/add-friend.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddFriend;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  keyboard: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.components.screenPaddingHorizontal,
    paddingTop: theme.spacing.s4,
  },
  header: {
    minHeight: theme.components.buttonHeights.icon,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  headerTitle: {
    color: theme.colors.secondary,
    fontWeight: theme.fontWeights.extrabold,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.s10,
    gap: theme.spacing.s6,
  },
  codeCard: {
    alignSelf: 'center',
    width: '78%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.s4,
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  sectionTitle: {
    fontWeight: theme.fontWeights.extrabold,
  },
  codeBox: {
    width: '100%',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
    paddingVertical: theme.spacing.s3,
    alignItems: 'center',
  },
  codeText: {
    fontWeight: theme.fontWeights.extrabold,
  },
  inputCard: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.s3,
    paddingTop: theme.spacing.s2,
    paddingBottom: theme.spacing.s3,
    gap: theme.spacing.s2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  input: {
    flex: 1,
    minHeight: 34,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s1,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    ...theme.typography.bodyS,
  },
  addButton: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: theme.colors.textPrimary,
  },
  illustration: {
    alignSelf: 'center',
    width: '86%',
    maxWidth: 320,
    height: 220,
    marginTop: 'auto',
  },
});
