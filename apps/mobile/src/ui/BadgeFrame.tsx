import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/src/ui/components/AppIcon';
import { theme } from '@/src/ui/theme';

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeRarity = 'bronze' | 'silver' | 'gold';

type BadgeFrameProps = {
  image?: ImageSourcePropType;
  size?: BadgeSize;
  locked?: boolean;
  userPercentage?: number;
};

const SIZES: Record<BadgeSize, number> = {
  sm: 44,
  md: 64,
  lg: 120,
};

const BORDER = 3;
const RADIUS = 10;

const RARITY_GRADIENT: Record<BadgeRarity, readonly [string, string, string, string]> = {
  bronze: ['#a0522d', '#cd7f32', '#e8a85f', '#cd7f32'],
  silver: ['#707070', '#c0c0c0', '#e8e8e8', '#a8a9ad'],
  gold:   ['#b8860b', '#ffd700', '#fff176', '#ffd700'],
};

const LOCKED_GRADIENT = ['#c0c0c0', '#e0e0e0', '#c0c0c0', '#a0a0a0'] as const;

export function rarityFromPercentage(pct: number): BadgeRarity {
  if (pct < 5) return 'gold';
  if (pct < 25) return 'silver';
  return 'bronze';
}

export function BadgeFrame({
  image,
  size = 'md',
  locked = false,
  userPercentage,
}: Readonly<BadgeFrameProps>) {
  const dim = SIZES[size];
  const innerDim = dim - BORDER * 2;
  const rarity = !locked && userPercentage !== undefined ? rarityFromPercentage(userPercentage) : undefined;
  const gradient = locked ? LOCKED_GRADIENT : rarity ? RARITY_GRADIENT[rarity] : null;

  const inner = (
    <View style={[styles.inner, { width: innerDim, height: innerDim }]}>
      {image ? (
        <Image source={image} style={{ width: innerDim, height: innerDim }} resizeMode="stretch" />
      ) : null}
      {locked ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.lockedOverlay} />
          <View style={styles.lockIconWrap}>
            <AppIcon name="lock" size={theme.iconSizes.sm} color="#fff" />
          </View>
        </View>
      ) : null}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.frame, { width: dim, height: dim }]}
      >
        {inner}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.frame, styles.framePlain, { width: dim, height: dim }]}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: RADIUS,
    overflow: 'hidden',
  },
  framePlain: {
    borderWidth: BORDER,
    borderColor: theme.colors.border,
  },
  inner: {
    position: 'absolute',
    top: BORDER,
    left: BORDER,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMuted,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  lockIconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
