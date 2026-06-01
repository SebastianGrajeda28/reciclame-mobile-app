import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
    Animated,
    Easing,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle
} from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

/**
 * Type for recognition loading states
 */
export type RecognitionLoadingState = 'loading' | 'processing' | 'complete' | 'error';

/**
 * Props for EducationalFactBanner component
 */
export type EducationalFactBannerProps = {
  title: string;
  body: string;
  imageUrl?: string;
  contentType: 'fact' | 'tip' | 'guide' | 'instruction';
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
};

/**
 * Props for RecognitionLoadingBanner component
 */
export type RecognitionLoadingBannerProps = {
  state: RecognitionLoadingState;
  title: string;
  subtitle?: string;
  progress?: number; // 0-1 for progress bar
  style?: StyleProp<ViewStyle>;
};

/**
 * Props for TransitionWidget component
 */
export type TransitionWidgetProps = {
  visible: boolean;
  type: 'fade' | 'slideUp' | 'slideDown' | 'scale';
  duration?: number;
  delay?: number;
  onTransitionComplete?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Props for StateIndicator component
 */
export type StateIndicatorProps = {
  state: RecognitionLoadingState;
  size?: 'sm' | 'md' | 'lg';
};

const contentTypeColors: Record<'fact' | 'tip' | 'guide' | 'instruction', string> = {
  fact: theme.semantic.info.bg,
  tip: theme.semantic.success.bg,
  guide: theme.semantic.warning.bg,
  instruction: theme.semantic.info.bg,
};

const contentTypeIcons: Record<'fact' | 'tip' | 'guide' | 'instruction', string> = {
  fact: '💡',
  tip: '⭐',
  guide: '📖',
  instruction: '📋',
};

/**
 * Displays an educational fact or tip with optional image and animations
 */
export function EducationalFactBanner({
  title,
  body,
  imageUrl,
  contentType,
  style,
  animated = true,
}: EducationalFactBannerProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [animated, fadeAnim]);

  return (
    <Animated.View style={[styles.banner, { opacity: fadeAnim }, style]}>
      <View
        style={[
          styles.bannerContent,
          {
            backgroundColor: contentTypeColors[contentType],
          },
        ]}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.bannerImage}
            contentFit="cover"
          />
        )}
        <View style={styles.bannerTextContainer}>
          <View style={styles.bannerHeader}>
            <AppText style={styles.bannerIcon}>{contentTypeIcons[contentType]}</AppText>
            <AppText variant="h4" style={styles.bannerTitle}>
              {title}
            </AppText>
          </View>
          <AppText variant="bodyS" style={styles.bannerBody}>
            {body}
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Animated loading banner for recognition process
 */
export function RecognitionLoadingBanner({
  state,
  title,
  subtitle,
  progress,
  style,
}: RecognitionLoadingBannerProps) {
  const [spinAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (state === 'loading' || state === 'processing') {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [state, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStateColor = () => {
    switch (state) {
      case 'complete':
        return theme.semantic.success.bg;
      case 'error':
        return theme.semantic.error.bg;
      case 'loading':
      case 'processing':
      default:
        return theme.semantic.info.bg;
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'complete':
        return '✓';
      case 'error':
        return '⚠';
      case 'processing':
        return '⚙';
      case 'loading':
      default:
        return '📸';
    }
  };

  return (
    <View style={[styles.loadingBanner, { backgroundColor: getStateColor() }, style]}>
      <Animated.View
        style={[
          styles.loadingSpinner,
          state === 'loading' || state === 'processing' ? { transform: [{ rotate: spin }] } : {},
        ]}
      >
        <AppText style={styles.loadingIcon}>{getStateIcon()}</AppText>
      </Animated.View>

      <View style={styles.loadingText}>
        <AppText variant="h4" style={styles.bannerTitle}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="bodyS" muted style={styles.loadingSubtitle}>
            {subtitle}
          </AppText>
        )}
      </View>

      {progress !== undefined && progress > 0 && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress * 100, 100)}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

/**
 * Animated transition widget for state changes
 */
export function TransitionWidget({
  visible,
  type = 'fade',
  duration = 300,
  delay = 0,
  onTransitionComplete,
  children,
  style,
}: TransitionWidgetProps) {
  const [anim] = useState(new Animated.Value(visible ? 1 : 0));
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    const targetValue = visible ? 1 : 0;

    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, {
        toValue: targetValue,
        duration,
        easing: type === 'scale' ? Easing.out(Easing.quad) : Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(visible);
      if (onTransitionComplete) {
        onTransitionComplete();
      }
    });
  }, [visible, type, duration, delay, anim, onTransitionComplete]);

  const getTransformStyle = () => {
    switch (type) {
      case 'slideUp':
        return {
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: anim,
        };
      case 'slideDown':
        return {
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
          opacity: anim,
        };
      case 'scale':
        return {
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
          opacity: anim,
        };
      case 'fade':
      default:
        return { opacity: anim };
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[getTransformStyle(), style]}>
      {children}
    </Animated.View>
  );
}

/**
 * State indicator showing current recognition state with animated dots
 */
export function StateIndicator({ state, size = 'md' }: StateIndicatorProps) {
  const [dotAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (state === 'loading' || state === 'processing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [state, dotAnim]);

  const getSize = () => {
    switch (size) {
      case 'sm':
        return { width: 24, height: 24, fontSize: 12 };
      case 'lg':
        return { width: 48, height: 48, fontSize: 32 };
      case 'md':
      default:
        return { width: 36, height: 36, fontSize: 20 };
    }
  };

  const sizeStyles = getSize();

  const getStateDisplay = () => {
    switch (state) {
      case 'complete':
        return { icon: '✓', color: theme.semantic.success.fg };
      case 'error':
        return { icon: '⚠', color: theme.semantic.error.fg };
      case 'processing':
        return { icon: '⚙', color: theme.semantic.info.fg };
      case 'loading':
      default:
        return { icon: '◯', color: theme.semantic.info.fg };
    }
  };

  const display = getStateDisplay();

  return (
    <Animated.View
      style={[
        styles.stateIndicator,
        sizeStyles,
        {
          opacity: state === 'loading' || state === 'processing' ? dotAnim : 1,
        },
      ]}
    >
      <AppText style={{ fontSize: sizeStyles.fontSize, color: display.color }}>
        {display.icon}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: theme.spacing.s3,
  },
  bannerContent: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  bannerImage: {
    width: 80,
    height: 80,
  },
  bannerTextContainer: {
    flex: 1,
    padding: theme.spacing.s3,
    justifyContent: 'center',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    marginBottom: theme.spacing.s1,
  },
  bannerIcon: {
    fontSize: 20,
  },
  bannerTitle: {
    fontWeight: '600' as const,
  },
  bannerBody: {
    marginTop: theme.spacing.s1,
    lineHeight: 18,
  },
  loadingBanner: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.s4,
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 32,
  },
  loadingText: {
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  loadingSubtitle: {
    marginTop: theme.spacing.s1,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: theme.spacing.s2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.palette.green.DEFAULT,
  },
  stateIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
});
