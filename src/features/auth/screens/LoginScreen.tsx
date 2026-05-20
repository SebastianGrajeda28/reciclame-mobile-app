import { AntDesign, Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppText, theme } from '@/src/ui';

type LoginState = 'welcome' | 'loading' | 'error';

type LoginScreenProps = {
  onContinueOffline: () => void;
};

// ─── Decorative blobs ────────────────────────────────────────────────────────

function DecorativeBlobs() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={blobs.large} />
      <View style={blobs.small} />
    </View>
  );
}

const blobs = StyleSheet.create({
  large: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.primaryLight,
    top: -70,
    right: -55,
  },
  small: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.primarySubtle,
    top: 60,
    right: 30,
    opacity: 0.5,
  },
});

// ─── Logo ─────────────────────────────────────────────────────────────────────

function BrandLogo() {
  return (
    <View style={logoStyles.wrap}>
      <Image
        source={require('@/assets/images/reciclame-logo.png')}
        style={logoStyles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const logoStyles = StyleSheet.create({
  wrap: {
    width: 300,
    height: 200,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: 300,
    height: 200,
  },
});

// ─── Info banner ──────────────────────────────────────────────────────────────

type InfoBannerProps = {
  text: string;
  label?: string;
};

function InfoBanner({ text, label }: InfoBannerProps) {
  return (
    <View style={bannerStyles.container}>
      <Feather
        name="info"
        size={theme.iconSizes.sm}
        color={theme.colors.info}
        style={bannerStyles.icon}
      />
      <View style={bannerStyles.textWrap}>
        {label ? (
          <AppText variant="overline" style={bannerStyles.label}>
            {label}
          </AppText>
        ) : null}
        <AppText variant="bodyS" style={bannerStyles.text}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.infoBg,
    borderWidth: 1,
    borderColor: theme.colors.infoBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.s3,
    gap: theme.spacing.s2,
  },
  icon: {
    marginTop: 1,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: theme.colors.info,
  },
  text: {
    color: theme.colors.textPrimary,
  },
});

// ─── Welcome state ────────────────────────────────────────────────────────────

type WelcomeViewProps = {
  onGooglePress: () => void;
};

function WelcomeView({ onGooglePress }: WelcomeViewProps) {
  return (
    <SafeAreaView style={welcomeStyles.safe}>
      <DecorativeBlobs />

      {/* Outer: centra vertical y horizontalmente en cualquier tamaño de pantalla */}
      <View style={welcomeStyles.outer}>
        <View style={welcomeStyles.inner}>
          {/* Hero */}
          <BrandLogo />
          <AppText variant="h2" style={welcomeStyles.tagline}>
            Recicla, gana puntos{'\n'}y cuida el planeta
          </AppText>
          <AppText variant="body" muted style={welcomeStyles.subtitle}>
            Inicia sesión para continuar
          </AppText>

          {/* Actions */}
          <View style={welcomeStyles.actions}>
            <AppButton
              variant="outline"
              label="Continuar con Google"
              leftIcon={<AntDesign name="google" size={theme.iconSizes.md} color="#EA4335" />}
              onPress={onGooglePress}
              style={welcomeStyles.fullWidth}
            />
            <InfoBanner text="Accede rápidamente con tu cuenta de Google." />
          </View>

          {/* Terms */}
          <AppText style={welcomeStyles.termsText}>
            {'Al continuar aceptas nuestros '}
            <AppText style={welcomeStyles.termsLink}>Términos de Servicio</AppText>
            {' y '}
            <AppText style={welcomeStyles.termsLink}>Política de Privacidad</AppText>
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const welcomeStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s6,
  },
  // maxWidth 400 → mobile lo llena, web queda centrado y compacto
  inner: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  tagline: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: theme.spacing.s3,
    marginTop: theme.spacing.s5,
  },
  fullWidth: {
    width: '100%',
  },
  termsText: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.s3,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.medium,
  },
});

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <SafeAreaView style={loadingStyles.safe}>
      <View style={loadingStyles.outer}>
        <View style={loadingStyles.inner}>
          <BrandLogo />
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={loadingStyles.spinner}
          />
          <AppText variant="h2" style={loadingStyles.title}>
            Autenticando...
          </AppText>
          <View style={loadingStyles.bottom}>
            <InfoBanner
              label="Dato curioso"
              text="Reciclar una lata de aluminio ahorra suficiente energía para alimentar un televisor durante 3 horas."
            />
            <AppText variant="caption" muted style={loadingStyles.caption}>
              Verificando tu cuenta de Google
            </AppText>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const loadingStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s6,
  },
  inner: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  spinner: {
    marginVertical: theme.spacing.s4,
  },
  title: {
    textAlign: 'center',
  },
  bottom: {
    width: '100%',
    gap: theme.spacing.s3,
    marginTop: theme.spacing.s2,
  },
  caption: {
    textAlign: 'center',
  },
});

// ─── Error state ──────────────────────────────────────────────────────────────

type ErrorViewProps = {
  onDismiss: () => void;
  onContinueOffline: () => void;
};

function ErrorView({ onDismiss, onContinueOffline }: ErrorViewProps) {
  return (
    <SafeAreaView style={errorStyles.safe}>
      <Pressable style={errorStyles.closeBtn} onPress={onDismiss} hitSlop={12}>
        <Feather name="x" size={theme.iconSizes.lg} color={theme.colors.textSecondary} />
      </Pressable>

      <View style={errorStyles.outer}>
        <View style={errorStyles.inner}>
          <View style={errorStyles.iconWrap}>
            <Feather name="wifi-off" size={theme.iconSizes.xl} color={theme.colors.danger} />
          </View>

          <AppText variant="h2" style={errorStyles.title}>
            Sin conexión a internet
          </AppText>
          <AppText variant="body" muted style={errorStyles.description}>
            Verifica que tu dispositivo esté conectado a una red Wi-Fi o datos móviles e intenta de
            nuevo.
          </AppText>

          <AppButton
            label="Continuar sin conexión"
            onPress={onContinueOffline}
            style={errorStyles.btn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const errorStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  closeBtn: {
    position: 'absolute',
    top: theme.spacing.s4,
    right: theme.spacing.s4,
    zIndex: 1,
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s6,
  },
  inner: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: theme.spacing.s4,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 280,
  },
  btn: {
    width: '100%',
  },
});

// ─── Root component ───────────────────────────────────────────────────────────

export function LoginScreen({ onContinueOffline }: LoginScreenProps) {
  const [state, setState] = useState<LoginState>('welcome');

  const handleGooglePress = async () => {
    setState('loading');
    try {
      const { signInWithGoogle } = await import('@/src/features/auth/services/googleAuth');
      await signInWithGoogle();
      // Session fires via onAuthStateChange → AppGate re-renders automatically
    } catch {
      setState('error');
    }
  };

  if (state === 'loading') {
    return <LoadingView />;
  }

  if (state === 'error') {
    return (
      <ErrorView onDismiss={() => setState('welcome')} onContinueOffline={onContinueOffline} />
    );
  }

  return <WelcomeView onGooglePress={handleGooglePress} />;
}
